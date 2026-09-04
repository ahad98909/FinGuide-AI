from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import bcrypt
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
from fastapi.security import OAuth2PasswordBearer
from ..database import get_db
from ..models import User, FinancialProfile, Goal, Transaction, PriceTracking, Notification
from ..schemas import UserCreate, UserLogin, UserOut, OnboardingData

router = APIRouter(prefix="/auth", tags=["Authentication"])

SECRET_KEY = "SUPER_SECRET_KEY_FOR_HACKATHON_DEMO"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 1 day

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/register", response_model=dict)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user_data.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pwd = get_password_hash(user_data.password)
    full_name = " ".join([p for p in [user_data.first_name, user_data.middle_name, user_data.last_name] if p]).strip() or user_data.name
    new_user = User(
        name=full_name,
        first_name=user_data.first_name,
        middle_name=user_data.middle_name,
        last_name=user_data.last_name,
        date_of_birth=user_data.date_of_birth,
        email=user_data.email,
        password_hash=hashed_pwd,
        language=user_data.language,
        user_type=user_data.user_type
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Initialize blank profile
    profile = FinancialProfile(user_id=new_user.id, monthly_income=0.0, current_savings=0.0, monthly_expenses=0.0)
    db.add(profile)
    db.commit()
    
    access_token = create_access_token(data={"sub": new_user.email})
    return {"access_token": access_token, "token_type": "bearer", "user": {"id": new_user.id, "name": new_user.name, "first_name": new_user.first_name, "middle_name": new_user.middle_name, "last_name": new_user.last_name, "date_of_birth": new_user.date_of_birth, "email": new_user.email, "language": new_user.language, "user_type": new_user.user_type}}

@router.post("/login", response_model=dict)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer", "user": {"id": user.id, "name": user.name, "email": user.email, "language": user.language, "user_type": user.user_type}}

@router.post("/onboarding", response_model=dict)
def onboarding(data: OnboardingData, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Update user basic settings
    current_user.name = data.name
    current_user.language = data.language
    current_user.user_type = data.user_type
    
    # Update financial profile
    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == current_user.id).first()
    if not profile:
        profile = FinancialProfile(user_id=current_user.id)
        db.add(profile)
    
    profile.monthly_income = data.monthly_income
    profile.current_savings = data.current_savings
    profile.monthly_expenses = data.monthly_expenses

    if data.monthly_income > 0:
        income_tx = db.query(Transaction).filter(
            Transaction.user_id == current_user.id,
            Transaction.type == 'income'
        ).first()
        if not income_tx:
            init_tx = Transaction(
                user_id=current_user.id,
                type="income",
                category="Salary",
                amount=data.monthly_income,
                description="Monthly Income / Salary",
                date=datetime.utcnow().strftime("%Y-%m-%d")
            )
            db.add(init_tx)
    
    db.commit()
    return {"status": "success", "message": "Onboarding complete"}

@router.post("/demo", response_model=dict)
def get_demo_account(db: Session = Depends(get_db)):
    demo_email = "demo_ali@finguide.ai"
    user = db.query(User).filter(User.email == demo_email).first()
    
    if not user:
        # Create user
        user = User(
            name="Ali",
            email=demo_email,
            password_hash=get_password_hash("demo1234"),
            language="en",
            user_type="worker"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Financial profile
        profile = FinancialProfile(
            user_id=user.id,
            monthly_income=100000.0,
            current_savings=80000.0,
            monthly_expenses=65000.0
        )
        db.add(profile)
        
        # Initial Goal
        goal = Goal(
            user_id=user.id,
            name="Honda CD 70",
            target_amount=185000.0,
            current_amount=80000.0,
            monthly_contribution=15000.0,
            target_date="April 2027",
            status="active"
        )
        db.add(goal)
        
        # Price Tracking
        price_track = PriceTracking(
            user_id=user.id,
            product_name="Honda CD 70",
            current_price=185000.0,
            previous_price=180000.0,
            last_updated=datetime.utcnow().strftime("%Y-%m-%d")
        )
        db.add(price_track)
        
        # Demo Transactions
        transactions = [
            Transaction(user_id=user.id, type="expense", category="Food", amount=1200.0, description="Restaurant dinner", date=(datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d")),
            Transaction(user_id=user.id, type="expense", category="Transport", amount=800.0, description="Fuel refill", date=(datetime.utcnow() - timedelta(days=2)).strftime("%Y-%m-%d")),
            Transaction(user_id=user.id, type="expense", category="Shopping", amount=3500.0, description="Clothes purchase", date=(datetime.utcnow() - timedelta(days=3)).strftime("%Y-%m-%d")),
            Transaction(user_id=user.id, type="expense", category="Bills", amount=12000.0, description="Electricity bill", date=(datetime.utcnow() - timedelta(days=5)).strftime("%Y-%m-%d")),
            Transaction(user_id=user.id, type="expense", category="Education", amount=5000.0, description="Online course", date=(datetime.utcnow() - timedelta(days=7)).strftime("%Y-%m-%d")),
            Transaction(user_id=user.id, type="income", category="Salary", amount=100000.0, description="Monthly salary", date=(datetime.utcnow() - timedelta(days=15)).strftime("%Y-%m-%d"))
        ]
        db.add_all(transactions)
        
        # Demo Notifications
        notifications = [
            Notification(user_id=user.id, title="Welcome to FinGuide AI", message="Your multilingual financial co-pilot is ready to guide you.", read=False, created_at=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")),
            Notification(user_id=user.id, title="Goal Created", message="Goal Honda CD 70 created with a monthly contribution of PKR 15,000.", read=False, created_at=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"))
        ]
        db.add_all(notifications)
        db.commit()

    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer", "user": {"id": user.id, "name": user.name, "email": user.email, "language": user.language, "user_type": user.user_type}}
