import re
from typing import Dict, Any, List, Optional
from ..schemas import AIChatResponse, AIChatAction
from .intent_classifier import IntentClassifier
from .financial_knowledge import FinancialKnowledge
from .number_extractor import extract_numbers_from_message, extract_goal_name

def build_financial_roadmap(message: str, user_data: dict, language: str = 'en') -> dict:
    """
    Build a personalized financial roadmap using EXACT numbers extracted from user input.
    Guarantees no hardcoded placeholder numbers (75k, 45k, etc.) are used when user inputs data.
    """
    extracted = extract_numbers_from_message(message)
    
    # Prioritize numbers extracted from current message over profile defaults
    income = extracted.get('income') or user_data.get('monthly_income') or 0
    expenses = extracted.get('expenses') or user_data.get('monthly_expenses') or 0
    target = extracted.get('target')
    savings = extracted.get('savings') or user_data.get('current_savings') or 0
    
    goal_name = extract_goal_name(message)
    
    # Check if required numbers are missing
    if income == 0 or expenses == 0:
        if language == 'ur':
            text = f"آپ کی مدد کے لیے مجھے مزید معلومات درکار ہیں۔ برائے مہربانی مجھے بتائیں:\n• آپ کی ماہانہ آمدنی\n• آپ کے ماہانہ اخراجات\n• آپ جس چیز کے لیے بچت کرنا چاہتے ہیں ({goal_name}) اور اس کی متوقع قیمت"
        elif language == 'roman_urdu':
            text = f"Aap ki behtareen madad ke liye mujhe mazeed information darkar hai. Baraye meharbani batayein:\n• Aap ki monthly income\n• Aap ke monthly expenses (kharchay)\n• Jis cheez ke liye save karna chahte hain ({goal_name}) aur us ki price"
        else:
            text = f"I need more information to help you. Please tell me:\n• Your monthly income\n• Your monthly expenses\n• What you want to save for ({goal_name}) and its cost"
        return {
            'text': text,
            'action': None
        }
    
    if target is None or target == 0:
        if language == 'ur':
            text = f"مجھے یہ جاننے کی ضرورت ہے کہ آپ {goal_name} کے لیے کتنی رقم جمع کرنا چاہتے ہیں۔ کیا آپ اس کی قیمت بتا سکتے ہیں؟"
        elif language == 'roman_urdu':
            text = f"Mujhe yeh janne ki zaroorat hai ke aap {goal_name} ke liye kitni target amount jama karna chahte hain. Kia aap is ki price bata sakte hain?"
        else:
            text = f"I need to know what you're saving for and how much it costs. Could you please tell me your target price for {goal_name}?"
        return {
            'text': text,
            'action': None
        }
    
    # Exact financial calculations
    savings_potential = income - expenses
    emergency_fund = expenses * 3
    
    if savings_potential > 0:
        goal_savings = round(savings_potential * 0.7, 0)      # 70% for goal
        emergency_savings = round(savings_potential * 0.3, 0) # 30% for emergency
        goal_months_optimized = target / goal_savings if goal_savings > 0 else 0
        goal_months = int(round(goal_months_optimized))
    else:
        goal_savings = 0
        emergency_savings = 0
        goal_months = 0

    if language == 'ur':
        response_text = f"""آپ کی مالی صورتحال کی بنیاد پر:

ماہانہ بچت کی گنجائش: PKR {savings_potential:,.0f} (PKR {income:,.0f} آمدنی - PKR {expenses:,.0f} اخراجات)

تجویز کردہ ایمرجنسی فنڈ: PKR {emergency_fund:,.0f} (3 ماہ کے اخراجات)

{goal_name} Target: PKR {target:,.0f}

بہترین دوہری بچت کا منصوبہ:
1. {goal_name} Goal: Save PKR {goal_savings:,.0f}/month → تقریباً {goal_months} ماہ میں مکمل ہوگا
2. Emergency Reserve: Save PKR {emergency_savings:,.0f}/month → 12 ماہ میں PKR {emergency_savings * 12:,.0f} تک پہنچ جائے گا

نیچے دیے گئے **Confirm & Add to Goals Tracker** بٹن پر کلک کر کے اپنا ہدف محفوظ کریں!"""
    elif language == 'roman_urdu':
        response_text = f"""Based on your finances:

Monthly Savings Potential: PKR {savings_potential:,.0f} (PKR {income:,.0f} Income - PKR {expenses:,.0f} Expenses)

Recommended Emergency Fund: PKR {emergency_fund:,.0f} (3 months of essential living expenses)

{goal_name} Target: PKR {target:,.0f}

Optimized Dual-Savings Plan:
1. {goal_name} Goal: Save PKR {goal_savings:,.0f}/month → Target achieved in approximately {goal_months} months
2. Emergency Reserve: Save PKR {emergency_savings:,.0f}/month → Reaches PKR {emergency_savings * 12:,.0f} in 12 months

Click **Confirm & Add to Goals Tracker** below to lock in your goal roadmap!"""
    else:
        response_text = f"""Based on your finances:

Monthly Savings Potential: PKR {savings_potential:,.0f} (PKR {income:,.0f} Income - PKR {expenses:,.0f} Expenses)

Recommended Emergency Fund: PKR {emergency_fund:,.0f} (3 months of essential living expenses)

{goal_name} Target: PKR {target:,.0f}

Optimized Dual-Savings Plan:
1. {goal_name} Goal: Save PKR {goal_savings:,.0f}/month → Target achieved in approximately {goal_months} months
2. Emergency Reserve: Save PKR {emergency_savings:,.0f}/month → Reaches PKR {emergency_savings * 12:,.0f} in 12 months

Click **Confirm & Add to Goals Tracker** below to lock in your goal roadmap!"""

    return {
        'text': response_text,
        'action': {
            'type': 'CREATE_GOAL',
            'label': 'Confirm & Add to Goals Tracker',
            'data': {
                'name': goal_name,
                'target_amount': int(target),
                'monthly_contribution': int(goal_savings),
                'current_amount': int(savings)
            }
        }
    }


class MockAI:
    """
    Multilingual, Intent-Driven Mock AI Engine for FinGuide AI:
    - High-accuracy number extraction and financial logic
    - Zero hallucination of placeholder numbers when user provides inputs
    - Dynamic Goal Creation Actions with full payload for frontend confirmation
    - Support for English, Urdu, and Roman Urdu + Regional dialects
    """

    @classmethod
    def generate_chat_response(
        cls,
        message: str,
        language: str,
        user_profile: Dict[str, Any],
        active_goals: List[Dict[str, Any]] = None
    ) -> AIChatResponse:
        lang = language if language in ["en", "ur", "roman_urdu", "pa", "sd", "ps", "bal", "skr"] else "en"
        user_name = user_profile.get("name") or "there"

        # -------------------------------------------------------------
        # STEP 1: INTENT CLASSIFICATION
        # -------------------------------------------------------------
        intent = IntentClassifier.classify(message)

        # -------------------------------------------------------------
        # STEP 2: OUT OF SCOPE REJECTION
        # -------------------------------------------------------------
        if intent == "OUT_OF_SCOPE":
            rejection_text = FinancialKnowledge.OUT_OF_SCOPE_RESPONSES.get(
                lang, FinancialKnowledge.OUT_OF_SCOPE_RESPONSES["en"]
            )
            return AIChatResponse(
                intent="OUT_OF_SCOPE",
                response=rejection_text,
                action=None
            )

        # -------------------------------------------------------------
        # STEP 3: GREETINGS
        # -------------------------------------------------------------
        if intent == "GREETING":
            resp_map = {
                "en": f"Hello {user_name}! I'm FinGuide AI, your dedicated financial co-pilot. I can help you create personalized budgets, set savings goals (e.g. for a Honda CD 70 or iPhone), track expenses, and navigate investments in Pakistan. How can I assist your financial journey today?",
                "ur": f"وعلیکم السلام {user_name}! میں FinGuide AI ہوں، آپ کا ذاتی مالیاتی معاون۔ میں بجٹ بنانے، بچت کے اہداف (جیسے ہونڈا 70 یا موبائل) طے کرنے، اور حلال سرمایہ کاری کے منصوبے بنانے میں مدد کرتا ہوں۔ آج آپ کس چیز میں رہنمائی چاہتے ہیں؟",
                "roman_urdu": f"Assalam-o-Alaikum {user_name}! Main aap ka personal FinGuide AI Co-Pilot hoon. Main budget banane, savings goals (jaise Honda 70 ya iPhone) set karne, aur Pakistani market me behtareen investments ke mashware dene me madad karta hoon. Aaj aap kis cheez me guidance chahte hain?",
            }
            return AIChatResponse(
                intent="GREETING",
                response=resp_map.get(lang, resp_map["en"]),
                action=None
            )

        # -------------------------------------------------------------
        # STEP 4: EXTRACT FINANCIAL ENTITIES (NUMBERS & GOALS)
        # -------------------------------------------------------------
        extracted = extract_numbers_from_message(message)
        goal_name = extract_goal_name(message)
        has_goal_intent = intent == "GOAL" or goal_name != "Savings Goal" or extracted.get('target') is not None
        
        inc = extracted.get('income')
        exp = extracted.get('expenses')
        tar = extracted.get('target')

        # Test Case 3 & General Roadmap: User gave income, expenses, and target (or goal item)
        if (inc is not None and exp is not None and tar is not None) or (has_goal_intent and (inc is not None or exp is not None)):
            roadmap_res = build_financial_roadmap(message, user_profile, lang)
            action_obj = None
            if roadmap_res.get('action'):
                act = roadmap_res['action']
                action_obj = AIChatAction(
                    type=act['type'],
                    label=act.get('label', 'Confirm & Add to Goals Tracker'),
                    data=act['data']
                )
            return AIChatResponse(
                intent="CREATE_GOAL",
                response=roadmap_res['text'],
                action=action_obj
            )

        # Test Case 1: User provides income and expenses only (e.g. "I have 50k income, 30k expenses" or "Salary 50k, kharch 30k")
        if inc is not None and exp is not None:
            savings_pot = inc - exp
            emer_fund = exp * 3
            if lang == 'ur':
                resp = f"""آپ کی مالی صورتحال کی بنیاد پر:

ماہانہ بچت کی گنجائش: PKR {savings_pot:,.0f} (PKR {inc:,.0f} آمدنی - PKR {exp:,.0f} اخراجات)

تجویز کردہ ایمرجنسی فنڈ: PKR {emer_fund:,.0f} (3 ماہ کے اخراجات)

آپ کس ہدف کے لیے بچت کرنا چاہتے ہیں (جیسے کہ iPhone، ہونڈا بائیک، گاڑی، یا لیپ ٹاپ) اور اس کی متوقع قیمت کیا ہے؟"""
            elif lang == 'roman_urdu':
                resp = f"""Based on your finances:

Monthly Savings Potential: PKR {savings_pot:,.0f} (PKR {inc:,.0f} Income - PKR {exp:,.0f} Expenses)

Recommended Emergency Fund: PKR {emer_fund:,.0f} (3 months of essential living expenses)

Aap kis target goal ke liye save karna chahte hain (jaise iPhone, Honda CD 70, car, wedding, ya laptop) aur us ki price kya hai?"""
            else:
                resp = f"""Based on your finances:

Monthly Savings Potential: PKR {savings_pot:,.0f} (PKR {inc:,.0f} Income - PKR {exp:,.0f} Expenses)

Recommended Emergency Fund: PKR {emer_fund:,.0f} (3 months of essential living expenses)

What financial goal would you like to save for (such as an iPhone, Honda CD 70, car, wedding, or laptop) and its target cost?"""
            
            return AIChatResponse(
                intent="PLANNING",
                response=resp,
                action=None
            )

        # Test Case 2: User provides target price for a goal without income/expenses (e.g. "iPhone 13 costs 120k", "Bike costs 185k")
        if tar is not None:
            if lang == 'ur':
                resp = f"""میں دیکھ سکتا ہوں کہ آپ کا ہدف {goal_name} ہے جس کی مطلوبہ قیمت PKR {tar:,.0f} ہے۔

آپ کے لیے ایک تفصیلی روڈ میپ اور ماہانہ بچت کا منصوبہ تیار کرنے کے لیے، برائے مہربانی مجھے بتائیں:
• آپ کی ماہانہ آمدنی
• آپ کے ماہانہ اخراجات"""
            elif lang == 'roman_urdu':
                resp = f"""Main dekh sakta hoon ke aap ka target {goal_name} hai jis ki estimated price PKR {tar:,.0f} hai.

Aap ke liye personalized savings plan aur timeline banane ke liye, baraye meharbani batayein:
• Aap ki monthly income
• Aap ke monthly expenses"""
            else:
                resp = f"""I see your target for {goal_name} is PKR {tar:,.0f}.

To create your personalized savings roadmap and calculate your timeline, please share:
• Your monthly income
• Your monthly expenses"""
            return AIChatResponse(
                intent="PLANNING",
                response=resp,
                action=None
            )

        # Test Case 4: Missing numbers (e.g. "I want to save for a bike")
        if has_goal_intent:
            if lang == 'ur':
                resp = f"""میں {goal_name} کے لیے بچت کرنے میں آپ کی مدد کر سکتا ہوں۔ ایک درست اور حقیقت پسندانہ منصوبہ بنانے کے لیے، برائے مہربانی مجھے بتائیں:
• آپ کی ماہانہ آمدنی
• آپ کے ماہانہ اخراجات
• {goal_name} کی مطلوبہ قیمت"""
            elif lang == 'roman_urdu':
                resp = f"""Main {goal_name} ke liye savings plan banane me aap ki madad kar sakta hoon. Roadmap tayar karne ke liye baraye meharbani batayein:
• Aap ki monthly income
• Aap ke monthly expenses
• {goal_name} ki target cost ya price"""
            else:
                resp = f"""I need more information to help you save for {goal_name}. Please tell me:
• Your monthly income
• Your monthly expenses
• What you want to save for and its cost"""
            return AIChatResponse(
                intent="PLANNING",
                response=resp,
                action=None
            )

        # -------------------------------------------------------------
        # STEP 5: BUDGETING (50/30/20)
        # -------------------------------------------------------------
        if intent == "BUDGET":
            eff_income = inc or float(user_profile.get("monthly_income") or 0)
            if eff_income == 0:
                return AIChatResponse(
                    intent="BUDGET",
                    response="To create your 50/30/20 budget, please share your monthly income!",
                    action=None
                )
            needs = eff_income * 0.50
            wants = eff_income * 0.30
            ideal_savings = eff_income * 0.20
            resp_en = f"""📊 **50/30/20 Budget Plan for your Monthly Income (PKR {eff_income:,.0f}):**

1. **Essential Needs (50%) = PKR {needs:,.0f}**
   - Groceries, rent/housing, utility bills (electricity, gas, wifi), daily travel.
2. **Flexible Wants (30%) = PKR {wants:,.0f}**
   - Dining out, personal shopping, family outings, and entertainment.
3. **Savings & Investments (20%) = PKR {ideal_savings:,.0f}**
   - Direct to emergency reserve or active target goals.

💡 **Action Tip:** Transfer PKR {ideal_savings:,.0f} into your savings account as soon as salary arrives. Track daily expenses in Money Manager!"""
            return AIChatResponse(
                intent="CREATE_BUDGET",
                response=resp_en,
                action=AIChatAction(
                    type="CREATE_BUDGET",
                    label="Apply Budget",
                    data={"needs": needs, "wants": wants, "savings": ideal_savings}
                )
            )

        # -------------------------------------------------------------
        # STEP 6: EXPENSES OR WEALTH GROWTH DEFAULT
        # -------------------------------------------------------------
        if intent == "EXPENSE":
            resp_en = """💡 **Practical Money Saving Tactics in Pakistan:**

1. **Audit Food Delivery & Dining:** Reducing dine-outs from 4x to 1x monthly saves PKR 8,000–12,000.
2. **Optimize Utility Usage:** Inverter AC temperature at 26°C and LED bulbs cut peak electric units by 20–30%.
3. **Use Zero-Fee Wallets:** Utilize Easypaisa/JazzCash Raast for fee-free IBFT transfers instead of traditional banking charges.
4. **Automate Savings:** Move savings into a Shariah-compliant high-yield account yielding 17–20% annualized return."""
            return AIChatResponse(
                intent="ANALYZE_EXPENSES",
                response=resp_en,
                action=None
            )

        # Default financial wealth response
        profile_income = float(user_profile.get("monthly_income") or 75000.0)
        profile_savings = float(user_profile.get("current_savings") or 25000.0)
        profile_expenses = float(user_profile.get("monthly_expenses") or 45000.0)
        resp_text = FinancialKnowledge.get_wealth_growth_response(
            lang=lang,
            user_name=user_name,
            income=profile_income,
            savings=profile_savings,
            expenses=profile_expenses
        )
        return AIChatResponse(
            intent="PLANNING",
            response=resp_text,
            action=None
        )
