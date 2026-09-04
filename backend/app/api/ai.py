from .chat import router as chat_router
from ..routes.ai import router as copilot_router

# Export chat_router as primary router for chat endpoints
router = chat_router

__all__ = ["router", "chat_router", "copilot_router"]
