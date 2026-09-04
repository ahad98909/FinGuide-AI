from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
import datetime
from ..database import get_db
from ..models import User, Transaction, FinancialProfile
from ..schemas import TransactionCreate, TransactionOut, TransactionListResponse, TransactionSummary
from .auth import get_current_user

router = APIRouter(prefix="/transactions", tags=["Transactions"])

def sync_profile_with_transactions(db: Session, user_id: int):
    """Keep financial profile in sync with logged transactions."""
    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == user_id).first()
    if not profile:
        profile = FinancialProfile(user_id=user_id, monthly_income=0.0, current_savings=0.0, monthly_expenses=0.0)
        db.add(profile)

    income_sum = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == user_id,
        func.lower(Transaction.type) == 'income'
    ).scalar()

    expense_sum = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == user_id,
        func.lower(Transaction.type) == 'expense'
    ).scalar()

    if income_sum is not None and income_sum > 0:
        profile.monthly_income = float(income_sum)
    if expense_sum is not None:
        profile.monthly_expenses = float(expense_sum)

    db.commit()

@router.get("", response_model=TransactionListResponse)
def get_transactions(
    limit: int = 50,
    offset: int = 0,
    category: Optional[str] = None,
    type_filter: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all transactions for the current user with calculated summary statistics."""
    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == current_user.id).first()

    # Check if user has an established profile income but no income transactions logged yet
    existing_income_count = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        func.lower(Transaction.type) == 'income'
    ).count()

    if existing_income_count == 0 and profile and profile.monthly_income and profile.monthly_income > 0:
        # Automatically generate the initial income transaction so both Money Manager & Dashboard align
        init_income = Transaction(
            user_id=current_user.id,
            type="income",
            category="Salary",
            amount=profile.monthly_income,
            description="Monthly Income / Salary",
            date=datetime.date.today().isoformat()
        )
        db.add(init_income)
        db.commit()

    # Base query for transactions
    query = db.query(Transaction).filter(Transaction.user_id == current_user.id)
    if category:
        query = query.filter(Transaction.category == category)
    if type_filter:
        query = query.filter(func.lower(Transaction.type) == type_filter.strip().lower())

    transactions = query.order_by(Transaction.date.desc(), Transaction.id.desc()).offset(offset).limit(limit).all()

    # Summary calculations
    total_income = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == current_user.id,
        func.lower(Transaction.type) == 'income'
    ).scalar() or 0.0

    total_expenses = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == current_user.id,
        func.lower(Transaction.type) == 'expense'
    ).scalar() or 0.0

    income_count = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        func.lower(Transaction.type) == 'income'
    ).count()

    expense_count = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        func.lower(Transaction.type) == 'expense'
    ).count()

    # Fallback to profile monthly_income if still 0
    if total_income == 0.0 and profile and profile.monthly_income and profile.monthly_income > 0:
        total_income = profile.monthly_income

    balance = total_income - total_expenses

    return {
        "transactions": transactions,
        "summary": {
            "total_income": total_income,
            "total_expenses": total_expenses,
            "balance": balance,
            "income_count": income_count,
            "expense_count": expense_count
        }
    }

@router.post("", response_model=TransactionOut)
def create_transaction(
    tx_data: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new transaction with positive amounts and sync financial profile."""
    amount = abs(float(tx_data.amount))
    tx_date = tx_data.date or datetime.date.today().isoformat()
    clean_type = tx_data.type.strip().lower()

    new_tx = Transaction(
        user_id=current_user.id,
        type=clean_type,
        category=tx_data.category,
        amount=amount,
        description=tx_data.description,
        date=tx_date
    )
    db.add(new_tx)
    db.commit()
    db.refresh(new_tx)

    # Sync profile so dashboard and money manager stay consistent
    sync_profile_with_transactions(db, current_user.id)

    return new_tx

@router.put("/{id}", response_model=TransactionOut)
def update_transaction(
    id: int,
    tx_data: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tx = db.query(Transaction).filter(Transaction.id == id, Transaction.user_id == current_user.id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    amount = abs(float(tx_data.amount))
    tx.type = tx_data.type.strip().lower()
    tx.category = tx_data.category
    tx.amount = amount
    tx.description = tx_data.description
    tx.date = tx_data.date or tx.date

    db.commit()
    db.refresh(tx)

    sync_profile_with_transactions(db, current_user.id)
    return tx

@router.delete("/{id}", response_model=dict)
def delete_transaction(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tx = db.query(Transaction).filter(Transaction.id == id, Transaction.user_id == current_user.id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    db.delete(tx)
    db.commit()

    sync_profile_with_transactions(db, current_user.id)
    return {"status": "success", "message": "Transaction deleted successfully"}
