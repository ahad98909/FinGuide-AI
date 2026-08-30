from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import datetime
import random
from ..database import get_db
from ..models import User, PriceTracking, Goal, Notification
from ..schemas import PriceTrackingOut
from .auth import get_current_user
from .goals import calculate_target_date

router = APIRouter(prefix="/prices", tags=["Price Tracking"])

def check_and_apply_auto_price_updates(db: Session, user_id: int):
    # Fetch all tracked prices for this user
    records = db.query(PriceTracking).filter(PriceTracking.user_id == user_id).all()
    now = datetime.datetime.utcnow()
    now_str = now.strftime("%Y-%m-%d %H:%M:%S")
    
    updated = False
    
    for r in records:
        last_update_dt = None
        if r.last_updated:
            try:
                # Try parsing as full datetime first
                last_update_dt = datetime.datetime.strptime(r.last_updated, "%Y-%m-%d %H:%M:%S")
            except ValueError:
                try:
                    # Fallback to date only
                    last_update_dt = datetime.datetime.strptime(r.last_updated, "%Y-%m-%d")
                except ValueError:
                    pass
                    
        is_due = False
        if not last_update_dt:
            is_due = True
        else:
            # Trigger updates when calendar day changes (every 24 hours)
            if last_update_dt.date() < now.date():
                is_due = True
                
        if is_due:
            old_price = r.current_price
            
            # Simulated company catalog lookup:
            # Fluctuate price of target products based on seed values
            if r.product_name == "Honda CD 70":
                # Rotates price: 185000 -> 189000 -> 194000 -> 205000 -> 212000
                day_seed = now.day
                prices_list = [185000.0, 189000.0, 194000.0, 205000.0, 212000.0]
                new_price = prices_list[day_seed % len(prices_list)]
            elif r.product_name == "Suzuki Alto":
                day_seed = now.day
                prices_list = [2300000.0, 2350000.0, 2400000.0, 2460000.0]
                new_price = prices_list[day_seed % len(prices_list)]
            else:
                # 2% random fluctuation seeded by calendar day for stability
                # We save and restore the state of the random number generator so we don't interfere with other tasks
                state = random.getstate()
                random.seed(now.day)
                factor = 1.0 + random.choice([-0.02, -0.01, 0.0, 0.01, 0.02])
                random.setstate(state)
                new_price = round((r.current_price * factor) / 500) * 500
                
            if new_price != old_price:
                r.previous_price = old_price
                r.current_price = new_price
                r.last_updated = now_str
                
                # Fetch goals
                goals = db.query(Goal).filter(
                    Goal.user_id == user_id,
                    Goal.name == r.product_name,
                    Goal.status == "active"
                ).all()
                
                price_diff = new_price - old_price
                direction = "increased" if price_diff > 0 else "decreased"
                diff_abs = abs(price_diff)
                
                for goal in goals:
                    goal.target_amount = new_price
                    goal.target_date = calculate_target_date(goal.current_amount, goal.target_amount, goal.monthly_contribution)
                    
                    msg = f"🔄 Official Catalog Sync: The manufacturer price for '{goal.name}' has {direction} by PKR {diff_abs:,.0f} (New Price: PKR {new_price:,.0f}). Your goal target and completion date ({goal.target_date}) have been auto-adjusted."
                    notification = Notification(
                        user_id=user_id,
                        title="Official Price Autoadjusted",
                        message=msg,
                        read=False,
                        created_at=now_str
                    )
                    db.add(notification)
                updated = True
            else:
                # Even if price stayed same, update check timestamp to avoid hammering
                r.last_updated = now_str
                updated = True
                
    if updated:
        db.commit()

@router.get("", response_model=List[PriceTrackingOut])
def get_prices(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    check_and_apply_auto_price_updates(db, current_user.id)
    return db.query(PriceTracking).filter(PriceTracking.user_id == current_user.id).all()

@router.post("/{id}/simulate-change", response_model=PriceTrackingOut)
def simulate_price_change(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    price_record = db.query(PriceTracking).filter(PriceTracking.id == id, PriceTracking.user_id == current_user.id).first()
    if not price_record:
        raise HTTPException(status_code=404, detail="Price tracking record not found")
    
    old_price = price_record.current_price
    
    if old_price == 185000.0:
        new_price = 200000.0
    else:
        new_price = old_price + 15000.0
        
    price_record.previous_price = old_price
    price_record.current_price = new_price
    price_record.last_updated = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    
    goals = db.query(Goal).filter(
        Goal.user_id == current_user.id, 
        Goal.name == price_record.product_name,
        Goal.status == "active"
    ).all()
    
    price_diff = new_price - old_price
    
    for goal in goals:
        goal.target_amount = new_price
        goal.target_date = calculate_target_date(goal.current_amount, goal.target_amount, goal.monthly_contribution)
        
        msg = f"⚠️ Your goal '{goal.name}' price increased by PKR {price_diff:,.0f}. New target: PKR {new_price:,.0f}. Estimated completion is now {goal.target_date}."
        notification = Notification(
            user_id=current_user.id,
            title="Goal Price Increased",
            message=msg,
            read=False,
            created_at=datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        )
        db.add(notification)

    db.commit()
    db.refresh(price_record)
    return price_record
