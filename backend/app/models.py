from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from .database import Base
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    first_name = Column(String, nullable=True)
    middle_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    date_of_birth = Column(String, nullable=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    language = Column(String, default="en")  # en, ur, roman_urdu, pa, sd, ps, bal, skr
    user_type = Column(String, default="general")  # student, worker, family, general

    financial_profile = relationship("FinancialProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    goals = relationship("Goal", back_populates="user", cascade="all, delete-orphan")
    prices = relationship("PriceTracking", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

class FinancialProfile(Base):
    __tablename__ = "financial_profiles"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    monthly_income = Column(Float, default=0.0)
    current_savings = Column(Float, default=0.0)
    monthly_expenses = Column(Float, default=0.0)

    user = relationship("User", back_populates="financial_profile")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type = Column(String, nullable=False)  # income, expense
    category = Column(String, nullable=False)  # Food, Transport, Bills, Shopping, Education, Healthcare, Entertainment, Other
    amount = Column(Float, nullable=False)
    description = Column(String, nullable=True)
    date = Column(String, nullable=False)  # YYYY-MM-DD

    user = relationship("User", back_populates="transactions")

class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    target_amount = Column(Float, nullable=False)
    current_amount = Column(Float, default=0.0)
    monthly_contribution = Column(Float, default=0.0)
    target_date = Column(String, nullable=True)  # April 2027 or YYYY-MM-DD
    status = Column(String, default="active")  # active, completed, paused

    user = relationship("User", back_populates="goals")

class PriceTracking(Base):
    __tablename__ = "price_tracking"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    product_name = Column(String, nullable=False)
    current_price = Column(Float, nullable=False)
    previous_price = Column(Float, nullable=True)
    last_updated = Column(String, nullable=False)

    user = relationship("User", back_populates="prices")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    read = Column(Boolean, default=False)
    created_at = Column(String, nullable=False)

    user = relationship("User", back_populates="notifications")
