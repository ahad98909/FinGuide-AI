import os
import json
import re
from typing import Dict, Any, List, Optional
from ..schemas import AIChatResponse, AIChatAction

class OpenAIIntegration:
    """
    OpenAI Client Integration
    """

    LANGUAGE_INSTRUCTIONS = {
        "en": "Respond strictly in clear, professional, and friendly English.",
        "ur": "براہ کرم خالص اور معیاری اردو رسم الخط میں جامع اور دوستانہ جواب دیں۔ کسی اور زبان میں جواب نہ دیں۔",
        "roman_urdu": "Jawab aasan Roman Urdu (English alphabet me Urdu) me dein, friendly aur helpful andaz me.",
        "pa": "براہ کرم خالص پنجابی زبان (شاہ مکھی رسم الخط) وچ جواب دیو۔",
        "sd": "مهرباني ڪري نج سنڌي ٻوليءَ ۽ رسم الخط ۾ جواب ڏيو.",
        "ps": "مهرباني وکړئ ځواب په پښتو ژبه او رسم الخط کې ولیکئ.",
        "bal": "مہربانی بکن ات پسو ءَ خالص بلوچی زبان ءَ نبشتہ بکن ات۔",
        "skr": "مہربانی کر کے خالص سرائیکی زبان وچ جواب ݙیوو۔"
    }

    @classmethod
    def get_client(cls):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            return None
        try:
            from openai import OpenAI
            return OpenAI(api_key=api_key)
        except Exception:
            return None

    @classmethod
    def chat(
        cls,
        message: str,
        language: str,
        user_profile: Dict[str, Any],
        active_goals: List[Dict[str, Any]] = None
    ) -> Optional[AIChatResponse]:
        client = cls.get_client()
        if not client:
            return None

        lang_instruction = cls.LANGUAGE_INSTRUCTIONS.get(language, cls.LANGUAGE_INSTRUCTIONS["en"])

        prompt = f"""
You are FinGuide AI, an elite, friendly, and expert financial co-pilot assistant for Pakistan and emerging market users.
User Profile:
- Name: {user_profile.get('name', 'User')}
- Monthly Income: PKR {user_profile.get('monthly_income', 0):,}
- Current Savings: PKR {user_profile.get('current_savings', 0):,}
- Monthly Expenses: PKR {user_profile.get('monthly_expenses', 0):,}
- Profile Type: {user_profile.get('user_type', 'general')}
- Active Goals: {json.dumps(active_goals or [])}

CRITICAL LANGUAGE REQUIREMENT:
You MUST respond STRICTLY in {language} language!
Instruction: {lang_instruction}

Answer the user's specific question thoroughly with realistic numbers, bullet points, and actionable Pakistani market advice (e.g. Meezan Bank, Mutual Funds, PSX, Gold, JazzCash/Easypaisa, 50/30/20 budget).

Classify the user intent into one of:
- CREATE_GOAL (If user wants to save for/buy something: bike, car, laptop, phone, wedding, house)
- WHAT_IF (If asking how increasing savings changes their timeline)
- ANALYZE_EXPENSES (If asking about cutting spending or analyzing bills)
- CREATE_BUDGET (If asking how to budget, plan salary, or divide income)
- EXPLAIN_FINANCE (If asking to explain a financial term or investment vehicle)
- SCAM_ANALYSIS (If asking about SMS, call, prize, or suspicious transaction)
- GENERAL_FINANCIAL_QUESTION (Any general advice, chit-chat, or question)

If intent is CREATE_GOAL, extract: name, target_amount, current_amount, monthly_contribution.

Respond ONLY with a valid JSON object matching this structure:
{{
    "intent": "INTENT_NAME",
    "response": "Detailed, highly helpful, and complete answer in the requested language",
    "action": {{
        "type": "CREATE_GOAL",
        "data": {{
            "name": "Goal Title",
            "target_amount": 185000,
            "current_amount": 50000,
            "monthly_contribution": 15000
        }}
    }}
}}
(If no action is needed, set action to null).

User query: "{message}"
"""
        try:
            chat_completion = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"}
            )
            res_text = chat_completion.choices[0].message.content
            match = re.search(r'\{.*\}', res_text, re.DOTALL)
            if match:
                data = json.loads(match.group(0))
                return AIChatResponse(
                    intent=data.get("intent", "GENERAL_FINANCIAL_QUESTION"),
                    response=data.get("response", "How can I assist your financial journey today?"),
                    action=AIChatAction(
                        type=data.get("action", {}).get("type", "NONE"),
                        data=data.get("action", {}).get("data")
                    ) if data.get("action") else None
                )
        except Exception:
            return None
        return None
