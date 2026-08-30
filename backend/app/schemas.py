from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any

class UserBase(BaseModel):
    name: str
    email: EmailStr
    first_name: Optional[str] = None
    middle_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[str] = None
    language: Optional[str] = "en"
    user_type: Optional[str] = "general"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    first_name: Optional[str] = None
    middle_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[str] = None
    language: Optional[str] = None
    user_type: Optional[str] = None

class FinancialProfileBase(BaseModel):
    monthly_income: float
    current_savings: float
    monthly_expenses: float

class FinancialProfileOut(FinancialProfileBase):
    class Config:
        from_attributes = True

class UserOut(UserBase):
    id: int
    financial_profile: Optional[FinancialProfileOut] = None

    class Config:
        from_attributes = True

class OnboardingData(BaseModel):
    name: str
    monthly_income: float
    current_savings: float
    monthly_expenses: float
    language: str
    user_type: str

class TransactionBase(BaseModel):
    type: str  # income, expense
    category: str
    amount: float
    description: Optional[str] = None
    date: str

class TransactionCreate(TransactionBase):
    pass

class TransactionOut(TransactionBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class GoalBase(BaseModel):
    name: str
    target_amount: float
    current_amount: float
    monthly_contribution: float
    target_date: Optional[str] = None
    status: Optional[str] = "active"

class GoalCreate(GoalBase):
    pass

class GoalOut(GoalBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class PriceTrackingBase(BaseModel):
    product_name: str
    current_price: float
    previous_price: Optional[float] = None
    last_updated: str

class PriceTrackingOut(PriceTrackingBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class NotificationOut(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    read: bool
    created_at: str

    class Config:
        from_attributes = True

# AI Schemas
class AIChatRequest(BaseModel):
    message: str

class AIChatAction(BaseModel):
    type: str  # CREATE_GOAL, ANALYZE_EXPENSES, CREATE_BUDGET, WHAT_IF, EXPLAIN_FINANCE, SCAM_ANALYSIS, GENERAL_FINANCIAL_QUESTION, NONE
    data: Optional[Dict[str, Any]] = None

class AIChatResponse(BaseModel):
    intent: str
    response: str
    action: Optional[AIChatAction] = None

class AIScamRequest(BaseModel):
    text: str

class AIScamResponse(BaseModel):
    risk_level: str  # HIGH, MEDIUM, LOW
    risk_score: int  # 0 to 100
    reasons: List[str]
    actions: List[str]
    disclaimer: str

class AIWhatIfRequest(BaseModel):
    monthly_savings: Optional[float] = None
    monthly_income: Optional[float] = None
    monthly_expenses: Optional[float] = None
    goal_price: Optional[float] = None
    goal_id: Optional[int] = None

class AIWhatIfResponse(BaseModel):
    original_timeline_months: float
    new_timeline_months: float
    difference_months: float
    recommendation: str

class DashboardDataOut(BaseModel):
    financial_health_score: int
    financial_health_reasons: List[str]
    financial_health_improvements: List[str]
    income: float
    expenses: float
    savings: float
    active_goals: List[GoalOut]
    recent_transactions: List[TransactionOut]
    ai_insights: List[Dict[str, Any]]
    expense_by_category: Dict[str, float]

class ReceiptScanRequest(BaseModel):
    image_data: Optional[str] = None
    text: Optional[str] = None

class ReceiptScanResponse(BaseModel):
    merchant: str
    date: str
    amount: float
    category: str
    items: str
    confidence: float
