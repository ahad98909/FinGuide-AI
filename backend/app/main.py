from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routes import auth, dashboard, transactions, goals, prices, ai, notifications

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FinGuide AI API",
    description="Your Personal Multilingual Financial Co-Pilot API Backend",
    version="1.0.0"
)

# Enable CORS for local development and container communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For demo/hackathon ease of access
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(transactions.router)
app.include_router(goals.router)
app.include_router(prices.router)
app.include_router(ai.router)
app.include_router(notifications.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to FinGuide AI API!", "status": "running"}
