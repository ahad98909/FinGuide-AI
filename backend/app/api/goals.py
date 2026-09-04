# Re-export goals router from routes.goals for app.api.goals compatibility
from ..routes.goals import router, calculate_target_date, create_goal, get_goals, update_goal, delete_goal

__all__ = ["router", "calculate_target_date", "create_goal", "get_goals", "update_goal", "delete_goal"]
