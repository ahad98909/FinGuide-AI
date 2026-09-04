from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional

from ..database import get_db
from ..models import User, FinancialProfile, Goal
from ..models.chat import ChatSession, ChatMessage
from ..schemas import (
    AIChatRequest, AIChatResponse,
    ChatSessionOut, ChatMessageOut
)
from ..services.ai_service import AIService
from ..routes.auth import get_current_user

router = APIRouter(prefix="/ai", tags=["AI Chat & History"])

@router.get("/history", response_model=List[ChatSessionOut])
def get_chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Fetch all chat sessions for the current user, ordered by most recently updated.
    """
    sessions = (
        db.query(ChatSession)
        .filter(ChatSession.user_id == current_user.id)
        .order_by(ChatSession.updated_at.desc())
        .all()
    )
    return sessions

@router.get("/history/{session_id}", response_model=ChatSessionOut)
def get_session_details(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Fetch a specific chat session with its messages.
    """
    session = (
        db.query(ChatSession)
        .filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id)
        .first()
    )
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found"
        )
    return session

@router.post("/new-session", response_model=ChatSessionOut)
def create_new_session(
    language: Optional[str] = "en",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new persistent chat session for the user.
    """
    selected_lang = language or current_user.language or "en"
    session = ChatSession(
        user_id=current_user.id,
        title="New Chat",
        language=selected_lang,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

@router.delete("/history/{session_id}", response_model=dict)
def delete_chat_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a chat session and all associated messages.
    """
    session = (
        db.query(ChatSession)
        .filter(ChatSession.id == session_id, ChatSession.user_id == current_user.id)
        .first()
    )
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found"
        )
    db.delete(session)
    db.commit()
    return {"status": "success", "message": "Chat session deleted successfully"}

@router.post("/chat", response_model=AIChatResponse)
def chat_with_history(
    req: AIChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Send a message, persist it in the database under session_id,
    generate domain-specific AI response, save AI response, and return response with session_id.
    """
    selected_language = req.language if req.language else (current_user.language or "en")

    # 1. Resolve or create ChatSession
    session = None
    if req.session_id:
        session = (
            db.query(ChatSession)
            .filter(ChatSession.id == req.session_id, ChatSession.user_id == current_user.id)
            .first()
        )

    if not session:
        # Check if user has an existing active session or create a new one
        session = (
            db.query(ChatSession)
            .filter(ChatSession.user_id == current_user.id)
            .order_by(ChatSession.updated_at.desc())
            .first()
        )
        if not session:
            session = ChatSession(
                user_id=current_user.id,
                title="Financial Consultation",
                language=selected_language,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(session)
            db.commit()
            db.refresh(session)

    # 2. Persist User Message
    user_msg = ChatMessage(
        session_id=session.id,
        role="user",
        content=req.message,
        language=selected_language,
        created_at=datetime.utcnow()
    )
    db.add(user_msg)

    # Auto-generate meaningful session title from first user query if still "New Chat"
    if session.title in ["New Chat", "Financial Consultation"] and req.message.strip():
        clean_title = req.message.strip()
        if len(clean_title) > 32:
            clean_title = clean_title[:32] + "..."
        session.title = clean_title

    # 3. Build User Context & Active Goals
    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == current_user.id).first()
    user_dict = {
        "name": current_user.name,
        "language": selected_language,
        "user_type": current_user.user_type,
        "monthly_income": profile.monthly_income if profile else 0.0,
        "current_savings": profile.current_savings if profile else 0.0,
        "monthly_expenses": profile.monthly_expenses if profile else 0.0
    }

    db_goals = db.query(Goal).filter(Goal.user_id == current_user.id, Goal.status == "active").all()
    goals_list = [
        {
            "id": g.id,
            "name": g.name,
            "target_amount": g.target_amount,
            "current_amount": g.current_amount,
            "monthly_contribution": g.monthly_contribution,
            "target_date": g.target_date
        } for g in db_goals
    ]

    # 4. Generate AI Response
    ai_response = AIService.chat(
        message=req.message,
        user_profile=user_dict,
        active_goals=goals_list,
        language=selected_language,
        session_id=session.id
    )

    # 5. Persist AI Assistant Message
    assistant_msg = ChatMessage(
        session_id=session.id,
        role="assistant",
        content=ai_response.response,
        language=selected_language,
        created_at=datetime.utcnow()
    )
    db.add(assistant_msg)

    # Update session timestamp
    session.updated_at = datetime.utcnow()
    db.commit()

    ai_response.session_id = session.id
    return ai_response
