from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import User, Transaction, FinancialProfile
from ..schemas import TransactionCreate, TransactionOut
from .auth import get_current_user

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.get("", response_model=List[TransactionOut])
def get_transactions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Transaction).filter(Transaction.user_id == current_user.id).order_by(Transaction.date.desc(), Transaction.id.desc()).all()

@router.post("", response_model=TransactionOut)
def create_transaction(tx_data: TransactionCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_tx = Transaction(
        user_id=current_user.id,
        type=tx_data.type,
        category=tx_data.category,
        amount=tx_data.amount,
        description=tx_data.description,
        date=tx_data.date
    )
    db.add(new_tx)
    
    # Simple dynamic expense adjustments in financial profile if desired
    # (keeps calculations simple for prototype)
    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == current_user.id).first()
    if profile:
        if tx_data.type == "expense":
            # For the demo, let's keep profile values in sync or allow manual adjustments
            pass
            
    db.commit()
    db.refresh(new_tx)
    return new_tx

@router.put("/{id}", response_model=TransactionOut)
def update_transaction(id: int, tx_data: TransactionCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    tx = db.query(Transaction).filter(Transaction.id == id, Transaction.user_id == current_user.id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
        
    tx.type = tx_data.type
    tx.category = tx_data.category
    tx.amount = tx_data.amount
    tx.description = tx_data.description
    tx.date = tx_data.date
    
    db.commit()
    db.refresh(tx)
    return tx

@router.delete("/{id}", response_model=dict)
def delete_transaction(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    tx = db.query(Transaction).filter(Transaction.id == id, Transaction.user_id == current_user.id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
        
    db.delete(tx)
    db.commit()
    return {"status": "success", "message": "Transaction deleted successfully"}
