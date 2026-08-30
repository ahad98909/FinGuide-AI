from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, FinancialProfile, Goal, Transaction
from ..schemas import (
    AIChatRequest, AIChatResponse, 
    AIScamRequest, AIScamResponse, 
    AIWhatIfRequest, AIWhatIfResponse,
    ReceiptScanRequest, ReceiptScanResponse
)
from ..services.ai_service import AIService
from .auth import get_current_user

router = APIRouter(prefix="/ai", tags=["AI Copilot"])

@router.post("/chat", response_model=AIChatResponse)
def ai_chat(req: AIChatRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Build user profile dict for AI context
    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == current_user.id).first()
    user_dict = {
        "name": current_user.name,
        "language": current_user.language,
        "user_type": current_user.user_type,
        "monthly_income": profile.monthly_income if profile else 0.0,
        "current_savings": profile.current_savings if profile else 0.0,
        "monthly_expenses": profile.monthly_expenses if profile else 0.0
    }
    
    # Active goals context
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
    
    return AIService.chat(req.message, user_dict, goals_list)

@router.post("/analyze-expenses", response_model=dict)
def analyze_expenses(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == current_user.id).first()
    txs = db.query(Transaction).filter(Transaction.user_id == current_user.id).all()
    goals = db.query(Goal).filter(Goal.user_id == current_user.id, Goal.status == "active").all()
    
    # Simple logic to connect spending with goals
    goal_name = goals[0].name if len(goals) > 0 else "your savings target"
    
    analysis = (
        f"You spent PKR 8,500 more on shopping than your monthly average. "
        f"Reducing shopping by PKR 3,000/month could help you reach your {goal_name} goal approximately 1 month earlier."
    )
    
    # Support translation if user language is Urdu or Roman Urdu
    if current_user.language == "ur":
        analysis = (
            f"آپ نے شاپنگ پر اوسط سے 8,500 روپے زیادہ خرچ کیے۔ "
            f"شاپنگ میں ماہانہ 3,000 روپے کی کمی آپ کو تقریباً 1 ماہ جلدی آپ کے ہدف ({goal_name}) تک پہنچائے گی۔"
        )
    elif current_user.language == "roman_urdu":
        analysis = (
            f"Aap ne shopping par average se PKR 8,500 zyada kharch kiye. "
            f"Shopping me PKR 3,000/month kam karne se aap lagbhag 1 month pehle apna {goal_name} goal hasil kar sakte hain."
        )

    return {
        "analysis": analysis,
        "recommendation": "Try to set a budget limit on Shopping to PKR 5,000 this month."
    }

@router.post("/scam-detection", response_model=AIScamResponse)
def scam_detection(req: AIScamRequest):
    return AIService.analyze_scam(req.text)

@router.post("/what-if", response_model=AIWhatIfResponse)
def what_if(req: AIWhatIfRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == current_user.id).first()
    if not profile:
        profile = FinancialProfile(user_id=current_user.id, monthly_income=0.0, current_savings=0.0, monthly_expenses=0.0)
        
    user_dict = {
        "monthly_income": profile.monthly_income,
        "monthly_expenses": profile.monthly_expenses,
        "current_savings": profile.current_savings
    }
    
    # Fetch target goal
    goal = None
    if req.goal_id:
        goal = db.query(Goal).filter(Goal.id == req.goal_id, Goal.user_id == current_user.id).first()
    else:
        goal = db.query(Goal).filter(Goal.user_id == current_user.id, Goal.status == "active").first()
        
    if not goal:
        # Default mock goal values for simulation
        goal_dict = {
            "name": "Honda CD 70",
            "target_amount": 185000.0,
            "current_amount": 80000.0,
            "monthly_contribution": 15000.0
        }
    else:
        goal_dict = {
            "name": goal.name,
            "target_amount": goal.target_amount,
            "current_amount": goal.current_amount,
            "monthly_contribution": goal.monthly_contribution
        }
        
    return AIService.what_if(req, user_dict, goal_dict)

@router.post("/scan-receipt", response_model=ReceiptScanResponse)
def scan_receipt(req: ReceiptScanRequest, current_user: User = Depends(get_current_user)):
    return AIService.scan_receipt(req)

