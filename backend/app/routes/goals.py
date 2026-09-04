from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import datetime
from ..database import get_db
from ..models import User, Goal, PriceTracking, Notification
from ..schemas import GoalCreate, GoalOut
from .auth import get_current_user

router = APIRouter(prefix="/goals", tags=["Goals"])

def calculate_target_date(current_amount: float, target_amount: float, monthly_contribution: float) -> str:
    if monthly_contribution <= 0:
        return "Indefinite"
    remaining = max(target_amount - current_amount, 0.0)
    months = int((remaining / monthly_contribution) + 0.999) # round up
    
    # Current date
    now = datetime.datetime.now()
    target_month = (now.month - 1 + months) % 12 + 1
    target_year = now.year + (now.month - 1 + months) // 12
    
    months_names = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    return f"{months_names[target_month-1]} {target_year}"

@router.get("", response_model=List[GoalOut])
def get_goals(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Goal).filter(Goal.user_id == current_user.id).all()

@router.post("", response_model=GoalOut)
def create_goal(goal_data: GoalCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if goal_data.target_amount <= 0:
        raise HTTPException(status_code=400, detail="Target amount must be greater than 0")
    if goal_data.monthly_contribution <= 0:
        raise HTTPException(status_code=400, detail="Monthly contribution must be greater than 0")

    # Calculate target date automatically if it's missing or standard
    target_date = goal_data.target_date
    if not target_date or target_date == "string" or target_date == "":
        target_date = calculate_target_date(goal_data.current_amount, goal_data.target_amount, goal_data.monthly_contribution)

    # Check if a goal with this exact name already exists for this user to prevent duplicates
    existing_goal = db.query(Goal).filter(
        Goal.user_id == current_user.id,
        Goal.name.ilike(goal_data.name.strip())
    ).first()

    if existing_goal:
        existing_goal.target_amount = goal_data.target_amount
        existing_goal.current_amount = goal_data.current_amount
        existing_goal.monthly_contribution = goal_data.monthly_contribution
        existing_goal.target_date = target_date
        existing_goal.status = goal_data.status or "active"
        target_goal = existing_goal
    else:
        target_goal = Goal(
            user_id=current_user.id,
            name=goal_data.name.strip(),
            target_amount=goal_data.target_amount,
            current_amount=goal_data.current_amount,
            monthly_contribution=goal_data.monthly_contribution,
            target_date=target_date,
            status=goal_data.status or "active"
        )
        db.add(target_goal)
    
    # Also create or update PriceTracking row
    db_price = db.query(PriceTracking).filter(
        PriceTracking.user_id == current_user.id, 
        PriceTracking.product_name.ilike(goal_data.name.strip())
    ).first()
    if not db_price:
        new_price = PriceTracking(
            user_id=current_user.id,
            product_name=goal_data.name.strip(),
            current_price=goal_data.target_amount,
            previous_price=goal_data.target_amount * 0.95,
            last_updated=datetime.datetime.utcnow().strftime("%Y-%m-%d")
        )
        db.add(new_price)
        
    db.commit()
    db.refresh(target_goal)
    return target_goal

@router.put("/{id}", response_model=GoalOut)
def update_goal(id: int, goal_data: GoalCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    goal = db.query(Goal).filter(Goal.id == id, Goal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
        
    goal.name = goal_data.name
    goal.target_amount = goal_data.target_amount
    goal.current_amount = goal_data.current_amount
    goal.monthly_contribution = goal_data.monthly_contribution
    goal.status = goal_data.status or goal.status
    
    goal.target_date = calculate_target_date(goal.current_amount, goal.target_amount, goal.monthly_contribution)
    
    db.commit()
    db.refresh(goal)
    return goal

@router.delete("/{id}", response_model=dict)
def delete_goal(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    goal = db.query(Goal).filter(Goal.id == id, Goal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
        
    db.delete(goal)
    db.commit()
    return {"status": "success", "message": "Goal deleted successfully"}
