from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from ..database import get_db
from ..models import User, FinancialProfile, Transaction, Goal, PriceTracking
from ..schemas import DashboardDataOut
from .auth import get_current_user
import datetime

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("", response_model=DashboardDataOut)
def get_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Run auto price update check from simulated catalogs
    from .prices import check_and_apply_auto_price_updates
    check_and_apply_auto_price_updates(db, current_user.id)
    
    # 1. Fetch user data
    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == current_user.id).first()
    if not profile:
        profile = FinancialProfile(user_id=current_user.id, monthly_income=0.0, current_savings=0.0, monthly_expenses=0.0)
        db.add(profile)
        db.commit()

    income = profile.monthly_income
    expenses = profile.monthly_expenses
    savings = max(income - expenses, 0.0)

    # Fetch active goals
    goals = db.query(Goal).filter(Goal.user_id == current_user.id, Goal.status == "active").all()
    
    # Fetch recent transactions
    transactions = db.query(Transaction).filter(Transaction.user_id == current_user.id).order_by(Transaction.date.desc(), Transaction.id.desc()).limit(10).all()
    
    # Calculate category expenses
    expense_by_category = {
        "Food": 0.0,
        "Transport": 0.0,
        "Bills": 0.0,
        "Shopping": 0.0,
        "Education": 0.0,
        "Healthcare": 0.0,
        "Entertainment": 0.0,
        "Other": 0.0
    }
    
    # Sum up expenses in current month
    for tx in transactions:
        if tx.type == "expense" and tx.category in expense_by_category:
            expense_by_category[tx.category] += tx.amount

    # 2. Financial Health Score Logic (0-100)
    score = 0
    reasons = []
    improvements = []

    # Savings Rate: Savings / Income
    savings_rate = (savings / income * 100) if income > 0 else 0
    if savings_rate >= 30:
        score += 30
        reasons.append("Excellent savings rate (over 30% of income)")
    elif savings_rate >= 15:
        score += 20
        reasons.append("Good savings rate (between 15% and 30% of income)")
    elif savings_rate > 0:
        score += 10
        reasons.append("Low savings rate (less than 15% of income)")
        improvements.append("Try to increase your savings rate to at least 15% of your income.")
    else:
        reasons.append("No active savings rate detected")
        improvements.append("Reduce discretionary spending to save at least 5-10% of your income.")

    # Expense / Income Ratio
    expense_ratio = (expenses / income * 100) if income > 0 else 0
    if expense_ratio <= 60:
        score += 30
        reasons.append("Controlled monthly expenses (under 60% of income)")
    elif expense_ratio <= 85:
        score += 20
        reasons.append("Moderate monthly expenses (between 60% and 85% of income)")
    else:
        score += 5
        reasons.append("High expenses relative to income (over 85% of income)")
        improvements.append("Audit your subscriptions and shopping lists to cut down monthly expenses.")

    # Emergency Savings Coverage (savings compared to monthly expenses)
    emergency_months = (profile.current_savings / expenses) if expenses > 0 else 0
    if emergency_months >= 3:
        score += 25
        reasons.append(f"Solid emergency fund covering {emergency_months:.1f} months of expenses")
    elif emergency_months >= 1:
        score += 15
        reasons.append(f"Starter emergency fund covering {emergency_months:.1f} months of expenses")
        improvements.append("Work towards saving up to 3 months of expenses for emergencies.")
    else:
        score += 5
        reasons.append("Minimal emergency fund (less than 1 month coverage)")
        improvements.append("Prioritize building a basic emergency fund covering 1 to 3 months of expenses.")

    # Active goals and plan
    if len(goals) > 0:
        score += 15
        reasons.append("Has active, tracked financial goals")
    else:
        score += 5
        reasons.append("No active financial goals found")
        improvements.append("Create a savings goal (like a bike or laptop) to stay motivated to save.")

    # Cap score at 100 and min at 0
    score = max(min(score, 100), 10)

    # 3. Dynamic Insights Generation
    ai_insights = []
    
    # General budget rule insight
    ai_insights.append({
        "type": "tip",
        "title": "FinGuide Insight",
        "message": f"You can reach your bike goal 1 month earlier by saving PKR 3,000 more/month.",
        "action_text": "See How"
    })
    
    # Custom alerts based on data
    if expense_ratio > 75:
        ai_insights.append({
            "type": "warning",
            "title": "Expense Alert",
            "message": "Your monthly expenses are crossing 75% of your income. Consider scaling back on 'Shopping' and 'Entertainment'.",
            "action_text": "Analyze Spending"
        })
        
    if emergency_months < 1:
        ai_insights.append({
            "type": "info",
            "title": "Safety Tip",
            "message": "Did you know? Having an emergency fund protects you from high-interest debt when unexpected expenses happen.",
            "action_text": "Learn Budgeting"
        })

    return DashboardDataOut(
        financial_health_score=score,
        financial_health_reasons=reasons,
        financial_health_improvements=improvements,
        income=income,
        expenses=expenses,
        savings=savings,
        active_goals=goals,
        recent_transactions=transactions,
        ai_insights=ai_insights,
        expense_by_category=expense_by_category
    )
