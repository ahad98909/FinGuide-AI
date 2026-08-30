import os
import re
import json
import datetime
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

load_dotenv()

from ..schemas import (
    AIChatResponse, AIChatAction, AIScamResponse, 
    AIWhatIfResponse, AIWhatIfRequest,
    ReceiptScanResponse, ReceiptScanRequest
)

# Detect Language Helper
def detect_language(text: str) -> str:
    # Check for Urdu Script (Arabic/Perso-Arabic characters)
    arabic_char_pattern = re.compile(r'[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]')
    if arabic_char_pattern.search(text):
        return "ur"
    
    # Check for Roman Urdu features
    roman_urdu_words = {
        "mujhe", "hai", "karna", "paisa", "paise", "bachat", "jaldi", "pura", "kar", "hoon", "sath", 
        "nahi", "nahin", "raha", "rahi", "shukriya", "kia", "kya", "krna", "batao", "karne", "hain", 
        "ke", "liye", "btao", "kese", "kaise", "tarika", "mashwara", "madad", "chahiye", "zaroorat",
        "salam", "salamalikum", "assalam", "karen", "sakta", "sakti", "kharcha", "kharchay", "kharch"
    }
    words = set(re.findall(r'\b\w+\b', text.lower()))
    if words.intersection(roman_urdu_words):
        return "roman_urdu"
        
    return "en"


class AIService:
    @staticmethod
    def get_openai_client():
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            return None
        try:
            from openai import OpenAI
            return OpenAI(api_key=api_key)
        except Exception:
            return None

    @staticmethod
    def get_gemini_client():
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            return None
        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            return genai
        except Exception:
            return None

    @classmethod
    def chat(cls, message: str, user_profile: Dict[str, Any], active_goals: List[Dict[str, Any]] = None) -> AIChatResponse:
        detected_lang = detect_language(message)
        profile_lang = user_profile.get("language", "en")
        response_lang = detected_lang if detected_lang != "en" else profile_lang
        if response_lang not in ["en", "ur", "roman_urdu"]:
            response_lang = "en"

        # Check API configuration
        openai_client = cls.get_openai_client()
        gemini_client = cls.get_gemini_client()
        
        # 1. Live AI engine if API key configured
        if gemini_client or openai_client:
            try:
                lang_prompt_instruction = {
                    "en": "Respond in clear, professional, and friendly English.",
                    "ur": "براہ کرم خالص اور معیاری اردو رسم الخط میں دوستانہ اور جامع جواب دیں۔",
                    "roman_urdu": "Jawab aasan Roman Urdu (English alphabet me Urdu) me dein, friendly aur helpful andaz me."
                }.get(response_lang, "Respond in English.")

                prompt = f"""
You are FinGuide AI, an elite, friendly, and expert financial co-pilot assistant for Pakistan and emerging market users.
User Profile:
- Name: {user_profile.get('name', 'User')}
- Monthly Income: PKR {user_profile.get('monthly_income', 0):,}
- Current Savings: PKR {user_profile.get('current_savings', 0):,}
- Monthly Expenses: PKR {user_profile.get('monthly_expenses', 0):,}
- Profile Type: {user_profile.get('user_type', 'general')}
- Active Goals: {json.dumps(active_goals or [])}
- Response Language Requirement: {lang_prompt_instruction}

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
                if gemini_client:
                    for model_name in ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-pro']:
                        try:
                            model = gemini_client.GenerativeModel(model_name)
                            res = model.generate_content(prompt)
                            res_text = res.text
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
                            continue

                elif openai_client:
                    chat_completion = openai_client.chat.completions.create(
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
            except Exception as e:
                print(f"Live AI encountered an issue: {e}. Utilizing smart offline reasoning engine.")

        # 2. Dynamic Financial Reasoning Engine (Instant, robust, and answers any query)
        return cls._smart_chat(message, response_lang, user_profile, active_goals)

    @classmethod
    def _smart_chat(cls, message: str, lang: str, user_profile: Dict[str, Any], active_goals: List[Dict[str, Any]] = None) -> AIChatResponse:
        msg = message.strip()
        msg_lower = msg.lower()
        
        income = float(user_profile.get("monthly_income") or 75000.0)
        savings = float(user_profile.get("current_savings") or 25000.0)
        expenses = float(user_profile.get("monthly_expenses") or 45000.0)
        user_name = user_profile.get("name") or "there"

        # -------------------------------------------------------------
        # 1. GREETINGS & CASUAL INTERACTION
        # -------------------------------------------------------------
        if any(w in msg_lower for w in ["hello", "hi", "hey", "salam", "assalam", "kaise ho", "kese ho", "who are you", "what can you do", "intro", "kya kar sakte"]):
            if lang == "ur":
                resp = f"وعلیکم السلام {user_name}! میں آپ کا ذاتی فنانشل کو پائلٹ ہوں۔ میں بجٹ بنانے، بچت کے اہداف طے کرنے، اخراجات کنٹرول کرنے، اور پاکستانی مارکیٹ میں حلال سرمایہ کاری کے طریقے سمجھانے میں مدد کرتا ہوں۔ بتائیں آج آپ کیا منصوبہ بنانا چاہتے ہیں؟"
            elif lang == "roman_urdu":
                resp = f"Assalam-o-Alaikum {user_name}! Main aap ka personal FinGuide AI Co-Pilot hoon. Main budget banane, savings goals set karne, monthly kharche track karne, aur Pakistani market me behtareen investments ke mashware dene me madad karta hoon. Aaj aap kis cheez me guidance chahte hain?"
            else:
                resp = f"Hello {user_name}! I'm FinGuide AI, your personalized financial co-pilot. I can help you create custom budgets, track and cut expenses, set achievable savings goals, and navigate Pakistani investments (Mutual Funds, PSX, Gold, High-yield accounts). What would you like to explore today?"
            return AIChatResponse(intent="GENERAL_FINANCIAL_QUESTION", response=resp)

        # -------------------------------------------------------------
        # 2. BUDGETING & BUDGET CREATION (e.g. czxcbudget, budget, 50/30/20, salary allocation)
        # -------------------------------------------------------------
        if any(w in msg_lower for w in ["budget", "budgeting", "50/30/20", "50 30 20", "salary divide", "salary plan", "allocate", "kharch control", "bachat kaise"]):
            needs = income * 0.50
            wants = income * 0.30
            ideal_savings = income * 0.20
            
            if lang == "ur":
                resp = f"""📊 **آپ کی ماہانہ آمدنی (PKR {income:,.0f}) کے مطابق بہترین بجٹ منصوبہ (50/30/20 اصول):**

1. **بنیادی ضروریات (50%) = PKR {needs:,.0f}**
   - راشن، گھر کا کرایہ، یوٹیلٹی بلز (بجلی، گیس، انٹرنیٹ)، اور روزمرہ کا سفر۔
2. **خواہشات و تفریح (30%) = PKR {wants:,.0f}**
   - شاپنگ، ریسٹورنٹ، ویک اینڈ آؤٹنگ اور تفریح۔
3. **مستقبل کی بچت اور سرمایہ کاری (20%) = PKR {ideal_savings:,.0f}**
   - ایمرجنسی فنڈ اور اہداف کے لیے فوری الگ کریں۔

💡 **فوری مشورہ:** مہینے کے شروع میں ہی کم از کم PKR {ideal_savings:,.0f} سیونگز اکاؤنٹ میں ٹرانسفر کر دیں تاکہ فضول خرچی سے بچا جا سکے۔ آپ ہمارے **Money Manager** میں اپنا پہلا خرچ لاگ کر سکتے ہیں!"""
            elif lang == "roman_urdu":
                resp = f"""📊 **Aap ki Monthly Income (PKR {income:,.0f}) ke mutabiq 50/30/20 Budget Formula:**

1. **Zaroori Akhrajat (50% Needs) = PKR {needs:,.0f}**
   - Rashan, utility bills (bijli, gas, internet), ghar ka rent aur fuel/transport.
2. **Khwahishat (30% Wants) = PKR {wants:,.0f}**
   - Shopping, restaurants, dosto ke sath outing aur entertainment.
3. **Bachat & Investment (20% Savings) = PKR {ideal_savings:,.0f}**
   - Emergency fund aur future goals ke liye pehle hi alag kar lein.

💡 **Golden Rule:** Salary milte hi pehle PKR {ideal_savings:,.0f} bachat me dalein, baqi bachi hui raqam se mahina chalayein. FinGuide ke **Money Manager** me daily expenses log karein!"""
            else:
                resp = f"""📊 **Personalized Budget Plan for your Monthly Income (PKR {income:,.0f}) using the 50/30/20 Rule:**

1. **Essential Needs (50%) = PKR {needs:,.0f}**
   - Groceries, rent/housing, utility bills (electricity, gas, wifi), and daily commute.
2. **Flexible Wants (30%) = PKR {wants:,.0f}**
   - Dining out, shopping, entertainment, and leisure.
3. **Savings & Wealth (20%) = PKR {ideal_savings:,.0f}**
   - Emergency reserve and long-term goal contributions.

💡 **Pro Tip:** Automate your PKR {ideal_savings:,.0f} savings on salary day before paying discretionary expenses. You can monitor your cash flow in the **Money Manager** tab!"""
            
            return AIChatResponse(
                intent="CREATE_BUDGET",
                response=resp,
                action=AIChatAction(
                    type="CREATE_BUDGET",
                    data={"needs": needs, "wants": wants, "savings": ideal_savings}
                )
            )

        # -------------------------------------------------------------
        # 3. SAVINGS GOALS (Bikes, Cars, Phones, Laptop, House, Wedding, Umrah)
        # -------------------------------------------------------------
        goal_keywords = {
            "bike": ("Honda CD 70", 185000.0, 15000.0),
            "motorcycle": ("Honda 125", 240000.0, 20000.0),
            "honda": ("Honda CD 70", 185000.0, 15000.0),
            "car": ("Suzuki Alto VXR", 2450000.0, 45000.0),
            "alto": ("Suzuki Alto VXR", 2450000.0, 45000.0),
            "laptop": ("Work/Study Laptop", 120000.0, 15000.0),
            "iphone": ("iPhone / Smartphone", 250000.0, 25000.0),
            "mobile": ("Smartphone Upgrade", 90000.0, 10000.0),
            "wedding": ("Wedding / Shadi Savings", 1500000.0, 50000.0),
            "shadi": ("Wedding / Shadi Savings", 1500000.0, 50000.0),
            "umrah": ("Umrah Package", 350000.0, 30000.0),
            "hajj": ("Hajj Package", 1200000.0, 50000.0),
            "house": ("Plot / House Downpayment", 4000000.0, 80000.0),
            "ghar": ("Plot / House Downpayment", 4000000.0, 80000.0),
            "emergency": ("3-Month Emergency Fund", max(expenses * 3, 150000.0), max(income * 0.2, 15000.0))
        }

        matched_goal = None
        for k, (g_name, g_target, g_contrib) in goal_keywords.items():
            if k in msg_lower:
                matched_goal = (g_name, g_target, g_contrib)
                break

        if matched_goal or any(w in msg_lower for w in ["goal", "target", "khareedna", "buy", "save for", "bachana hai"]):
            g_name, g_target, g_contrib = matched_goal if matched_goal else ("Personal Savings Goal", 200000.0, max(income * 0.2, 15000.0))
            
            # Extract numbers from input if user typed custom price
            numbers = [float(x) for x in re.findall(r'\b\d+(?:,\d+)*(?:\.\d+)?\b', msg.replace(',', ''))]
            if len(numbers) >= 1 and numbers[0] > 1000:
                g_target = numbers[0]
            if len(numbers) >= 2 and numbers[1] > 500:
                g_contrib = numbers[1]
                
            cur_amt = min(savings * 0.5, g_target * 0.4)
            remaining = max(g_target - cur_amt, 0.0)
            months_needed = round(remaining / max(g_contrib, 1000.0), 1)

            if lang == "ur":
                resp = f"""🎯 **آپ کے ہدف کا لائیو حساب کتاب ({g_name}):**

- **کل مطلوبہ رقم:** PKR {g_target:,.0f}
- **ابتدائی رقم (Current):** PKR {cur_amt:,.0f}
- **ماہانہ بچت (Monthly):** PKR {g_contrib:,.0f}
- **ہدف مکمل ہونے کا تخمینہ:** **{months_needed} ماہ**

کیا آپ چاہتے ہیں کہ میں یہ ہدف آپ کے Goals Tracker میں خودکار طریقے سے شامل کر دوں؟ نیچے دیے گئے بٹن پر کلک کر کے فوری محفوظ کریں۔"""
            elif lang == "roman_urdu":
                resp = f"""🎯 **{g_name} ke liye Savings Roadmap:**

- **Total Target:** PKR {g_target:,.0f}
- **Starting Amount:** PKR {cur_amt:,.0f}
- **Monthly Contribution:** PKR {g_contrib:,.0f}/month
- **Estimated Timeline:** **{months_needed} months** me aap ka target poora ho jaye ga!

Neeche diye gaye action button se yeh goal direct apne **Goals Tracker** me save karein!"""
            else:
                resp = f"""🎯 **Financial Savings Roadmap for {g_name}:**

- **Target Amount:** PKR {g_target:,.0f}
- **Initial Capital:** PKR {cur_amt:,.0f}
- **Monthly Savings:** PKR {g_contrib:,.0f}/month
- **Time to Achieve:** Approximately **{months_needed} months**.

Click the button below to instantly lock this target into your **Goals Tracker**!"""

            return AIChatResponse(
                intent="CREATE_GOAL",
                response=resp,
                action=AIChatAction(
                    type="CREATE_GOAL",
                    data={
                        "name": g_name,
                        "target_amount": g_target,
                        "current_amount": cur_amt,
                        "monthly_contribution": g_contrib
                    }
                )
            )

        # -------------------------------------------------------------
        # 4. INVESTMENTS & WEALTH (Mutual Funds, PSX, Gold, Real Estate, Profit Rates)
        # -------------------------------------------------------------
        if any(w in msg_lower for w in ["invest", "investment", "mutual fund", "psx", "stock", "shares", "gold", "sona", "sarmayakari", "munafa", "profit rate", "behbood", "prize bond", "national savings"]):
            if lang == "ur":
                resp = f"""📈 **پاکستان میں محفوظ اور منافع بخش سرمایہ کاری کے بہترین ذرائع:**

1. **شریعہ کمپلائنٹ میوچل فنڈز (Islamic Mutual Funds):**
   - میزان فنڈز (Meezan Cash Fund / Sovereign Fund) یا UBL فنڈز۔ سالانہ 16% سے 21% متوقع منافع، روزانہ نکالنے کی سہولت۔
2. **سونے میں سرمایہ کاری (Physical Gold 24K):**
   - مہنگائی اور روپے کی قدر میں کمی سے بچاؤ کے لیے بہترین حکمت عملی۔ جیولری کے بجائے گولڈ بسکٹ یا بارز خریدیں۔
3. **پاکستان اسٹاک ایکسچینج (PSX Blue-Chips):**
   - منافع بخش کمپنیوں (Fauji Fertilizer, Meezan Bank, Hubco, OGDC) کے شیئرز میں طویل مدتی سرمایہ کاری اور ڈیوڈنڈ انکم۔
4. **قومی بچت (National Savings):**
   - سینئر سٹیزنز اور بیواؤں کے لیے بہبود سرٹیفکیٹ۔

💡 **تجویز:** اپنی بچت کا 50% محفوظ فنڈز میں، 30% سونے میں اور 20% گروتھ شیئرز میں تقسیم کریں!"""
            elif lang == "roman_urdu":
                resp = f"""📈 **Pakistan me Best & Halal Investment Options:**

1. **Shariah Compliant Islamic Mutual Funds:**
   - Al-Meezan, UBL Funds, MCB Arif Habib. Low risk, 17%-21% annual profit, kisi bhi waqt paise withdraw karne ki sahoolat.
2. **Physical Gold (24K Pure Bars):**
   - Mehangai (Inflation) aur dollar hike ke khilaf best protection. Jewelry ke bajaye ARY ya verified gold bars lein.
3. **PSX Dividend Stocks (KSE-100):**
   - Strong blue-chip companies (EFERT, MEBL, HUBC) jo regular quarterly dividend deti hain.
4. **Digital Profit Accounts (SadaPay/JazzCash/NayaPay):**
   - Daily balance par competitive profit rates for short-term liquidity.

💡 **Pro Strategy:** Saara paisa ek jagah mat lagayein (Diversification). 50% Mutual Funds + 30% Gold + 20% Growth Stocks!"""
            else:
                resp = f"""📈 **Smart Investment Vehicles in Pakistan for 2026:**

1. **Islamic Mutual Funds (Money Market / Income Funds):**
   - Top picks: Meezan Cash Fund, Al-Ameen Islamic Cash Fund. Yields around 17% - 21% p.a. with high liquidity (withdraw within 24h).
2. **Physical Gold (24 Karat Bullion):**
   - Excellent hedge against inflation and PKR currency depreciation. Avoid jewelry; buy certified bars/biscuits.
3. **Dividend Blue-Chip Stocks on PSX:**
   - Companies like Meezan Bank (MEBL), Engro Fert (EFERT), Hubco (HUBC) offering 12-18% dividend yields + capital growth.
4. **High-Yield Digital Savings & Sukuk:**
   - Shariah-compliant government Sukuk and daily-profit Islamic accounts.

💡 **Rule of Thumb:** Keep 3 months of expenses in liquid funds, and allocate remaining savings across Gold (30%) and Mutual Funds/Equities (70%)."""

            return AIChatResponse(intent="EXPLAIN_FINANCE", response=resp)

        # -------------------------------------------------------------
        # 5. EXPENSE CUTTING & OPTIMIZATION
        # -------------------------------------------------------------
        if any(w in msg_lower for w in ["kharcha", "kharch", "cut expense", "spend less", "mehangai", "bijli ka bill", "kam karna", "save money", "reduce expense"]):
            if lang == "ur":
                resp = f"""✂️ **ماہانہ اخراجات میں 20% سے 30% کمی لانے کے عملی طریقے:**

1. **بجلی کے بل میں کمی:** انورٹر اپلائنسز کا استعمال کریں، پیک آورز (Peak Hours: شام 5 سے 11 بجے) میں بھاری آلات نہ چلائیں۔
2. **راشن اور گروسری کی منصوبہ بندی:** ہول سیل مارٹس (Imtiaz, Metro) سے بلک خریداری کریں اور پندرہ روزہ میل پلان بنائیں۔
3. **سفر کا خرچ کنٹرول کرنا:** روزمرہ کے سفر کے لیے بائیک پولنگ یا رائیڈ شیئرنگ اختیار کریں۔
4. **غیر ضروری سبسکرپشنز کا خاتمہ:** غیر استعمال شدہ ایپس، جم، اور تفریحی پیکیجز منسوخ کریں۔

📊 ہمارے **Receipt Scanner** سے اپنے بل اسکین کریں تاکہ معلوم ہو سکے کون سی کیٹیگری میں سب سے زیادہ رقم جا رہی ہے!"""
            elif lang == "roman_urdu":
                resp = f"""✂️ **Monthly Kharchon ko Kam Karne ke Top 4 Smart Tareeqay:**

1. **Bijli aur Utility Bills:** Peak hours (Shaam 5 se 11 PM) me AC ya heavy appliances na chalayein. Inverter AC ko 26°C par rakhein.
2. **Wholesale Grocery Shopping:** Imtiaz ya Metro se bulk rashan khareedein aur monthly list bana kar jayein taake impulse buying na ho.
3. **Transport & Fuel Optimization:** Daily commute ke liye carpool ya bike use karein.
4. **Track Every Rupee:** FinGuide ke **Receipt Scanner** se har bill scan karein taake pata chale paisa kahan ja raha hai!"""
            else:
                resp = f"""✂️ **4 Actionable Ways to Cut Monthly Living Costs in Pakistan:**

1. **Optimize Electricity Bills:** Avoid running heavy appliances during Peak Hours (5 PM – 11 PM) and keep inverter AC units at 26°C.
2. **Bulk Grocery Shopping:** Shop at wholesale outlets (e.g. Imtiaz, Carrefour, Metro) with a predefined list to prevent impulse purchases.
3. **Commute Efficiency:** Use carpooling, ride-sharing, or motorcycles for daily urban travel.
4. **Audit Invisible Subscriptions:** Cancel unused digital subscriptions, gym memberships, and high-fee package add-ons.

Track your grocery bills using our **Receipt Scanner** to identify leakages!"""

            return AIChatResponse(intent="ANALYZE_EXPENSES", response=resp)

        # -------------------------------------------------------------
        # 6. FREELANCING, SIDE HUSTLES & EXTRA INCOME
        # -------------------------------------------------------------
        if any(w in msg_lower for w in ["earn", "earning", "freelance", "freelancing", "side hustle", "extra income", "online kaam", "kamai", "upwork", "fiverr"]):
            if lang == "ur":
                resp = f"""💼 **پاکستان میں گھر بیٹھے ڈالرز اور اضافی آمدنی کمانے کے بہترین راستے:**

1. **ہائی ڈیمانڈ فری لانس اسکلز (Upwork / Fiverr):**
   - ویڈیو ایڈیٹنگ (Shorts/Reels)، AI پرامپٹ انجینئرنگ، ویب ڈیولپمنٹ (React/Python)، کاپی رائٹنگ اور گرافک ڈیزائن۔
2. **ای کامرس اور دراز سیلنگ (Daraz / Shopify):**
   - لوکل مینوفیکچررز سے مصنوعات لے کر آن لائن اسٹور چلائیں۔
3. **ریموٹ جابز (USD Income):**
   - LinkedIn اور WeWorkRemotely پر انٹرنیشنل کلائنٹس کے ساتھ کام کریں۔
4. **ادائیگی کی وصولی:** Payoneer، SadaBiz، اور ریموٹ بینک ٹرانسفرز کے ذریعے کم فیس میں رقوم پاکستان منگوائیں۔

💡 اپنے فری لانس کیریئر کی شروعات میں روزانہ 1 گھنٹہ نئی اسکل سیکھنے کے لیے مختص کریں!"""
            elif lang == "roman_urdu":
                resp = f"""💼 **Pakistan me Extra Income aur Dollar Earning ke Top Channels:**

1. **High-Demand Freelance Skills (Upwork / Fiverr):**
   - Video Editing (CapCut/Premiere), Web Development, Graphic Design, Social Media Management, SEO.
2. **E-Commerce & Digital Products:**
   - Daraz Seller center ya Shopify par local products sale karein.
3. **Payment Gateways in Pakistan:**
   - SadaBiz, Payoneer aur Wise ke zariye direct Pakistani bank account me foreign currency receive karein.
4. **Filer Advantages:**
   - Active Taxpayer (ATL) ban kar 1% IT export tax rebate hasil karein.

💡 Daily sirf 1 hour skill building par lagayein aur 3 months me results dekhein!"""
            else:
                resp = f"""💼 **Top High-ROI Side Hustles & Freelancing Paths in Pakistan:**

1. **High-Income Digital Skills (Upwork, Fiverr, LinkedIn):**
   - Video Editing, Full-Stack Development, UI/UX Design, AI Automation, Digital Marketing.
2. **Local E-Commerce (Daraz & Social Commerce):**
   - Dropshipping or sourcing trending products locally with cash-on-delivery logistics.
3. **Smooth Global Payments:**
   - Use SadaBiz, Payoneer, or direct SWIFT transfers into Pakistani accounts with minimal conversion fees.
4. **Tax Filer Benefits:**
   - Register as an IT exporter to enjoy a 1% reduced tax rate on foreign remittances.

Dedicate 1 hour daily to portfolio building to create an extra income stream!"""

            return AIChatResponse(intent="GENERAL_FINANCIAL_QUESTION", response=resp)

        # -------------------------------------------------------------
        # 7. FINANCIAL DEFINITIONS & CONCEPTS
        # -------------------------------------------------------------
        if any(w in msg_lower for w in ["what is", "kya hota hai", "matlab", "meaning", "define", "compound interest", "sood", "inflation", "sukuk", "roi", "liquidity"]):
            if "compound" in msg_lower or "interest" in msg_lower or "sood" in msg_lower:
                if lang == "ur":
                    resp = "مرکب منافع (Compound Growth) وہ عمل ہے جس میں آپ کی اصل رقم پر ملنے والا منافع دوبارہ اصل رقم میں شامل ہو کر مزید منافع پیدا کرتا ہے۔ یہ وقت کے ساتھ آپ کے پیسے کو تیزی سے کئی گنا بڑھا دیتا ہے!"
                elif lang == "roman_urdu":
                    resp = "Compound Interest ka matlab hai ke aap apni original investment ke sath sath us par milne wale profit par bhi mazeed profit kamate hain. Yeh waqt ke sath aap ke paise ko snowball effect ki tarah barhata hai!"
                else:
                    resp = "Compound growth is the process where earnings on an investment are reinvested to generate their own earnings over time. It creates exponential wealth growth over long horizons!"
            elif "inflation" in msg_lower or "mehangai" in msg_lower:
                if lang == "ur":
                    resp = "افراطِ زر (Inflation / مہنگائی) کا مطلب ہے وقت کے ساتھ چیزوں کی قیمتوں کا بڑھنا اور کرنسی کی قوتِ خرید میں کمی۔ اس سے بچنے کے لیے نقد رقم رکھنے کے بجائے سونے، شیئرز یا میوچل فنڈز میں سرمایہ کاری ضروری ہے۔"
                elif lang == "roman_urdu":
                    resp = "Inflation (Mehangai) ka matlab hai cheezon ki qeemat ka barhna aur rupaye ki purchasing power ka kam hona. Mehangai ko beat karne ke liye cash rakhne ke bajaye Gold ya Mutual Funds me invest karein."
                else:
                    resp = "Inflation is the rate at which general prices increase, eroding your currency's purchasing power. To beat inflation in Pakistan, invest in assets like Gold, Islamic Mutual Funds, and Equity Indexes."
            else:
                resp = f"A key financial principle is understanding risk vs return: Higher returns require calculated risk, while capital preservation protects your savings. Let me know which specific concept you'd like me to explain further!"
            return AIChatResponse(intent="EXPLAIN_FINANCE", response=resp)

        # -------------------------------------------------------------
        # 8. ADAPTIVE GENERAL FALLBACK (Answers ANY open-ended question)
        # -------------------------------------------------------------
        if lang == "ur":
            resp = f"""💡 **فنانشل گائیڈ کو پائلٹ کا تفصیلی تجزیہ:**

آپ کے سوال *" {msg} "* کے حوالے سے اہم مالیاتی نکات:

1. **فوری حکمت عملی:** اپنے موجودہ ماہانہ اخراجات (PKR {expenses:,.0f}) کو متوازن رکھیں اور غیر ضروری اخراجات پر نظر رکھیں۔
2. **بچت کا تناسب:** ہر ماہ کم از کم PKR {income * 0.20:,.0f} الگ کر کے محفوظ میوچل فنڈز یا گولڈ میں محفوظ کریں۔
3. **ایمرجنسی فنڈ:** کم از کم 3 ماہ کے اخراجات (PKR {expenses * 3:,.0f}) کسی بھی ہنگامی صورتحال کے لیے لیکوڈ اکاؤنٹ میں رکھیں۔
4. **عمل درآمد:** آپ فوری طور پر FinGuide کے **Money Manager** اور **Goals Tracker** کی مدد سے اس پلان پر عمل شروع کر سکتے ہیں!

اگر آپ کسی خاص پروڈکٹ یا رقم کے بارے میں مزید حساب کتاب چاہتے ہیں تو بلا جھجھک بتائیں!"""
        elif lang == "roman_urdu":
            resp = f"""💡 **FinGuide AI Financial Guidance:**

Aap ke sawaal *" {msg} "* ke mutabiq best actionable steps:

1. **Immediate Action:** Apne monthly expenses (PKR {expenses:,.0f}) ka daily record rakhein taake cash leakage band ho sake.
2. **Smart Savings Plan:** Har mahine apni aamdani ka 20% (PKR {income * 0.20:,.0f}) pehle bachat me dalein.
3. **Wealth Security:** Kam az kam PKR {expenses * 3:,.0f} ka Emergency Fund kisi high-yield ya Islamic Cash Fund me mehfooz karein.
4. **Tools in FinGuide:** Is goal ko track karne ke liye hamare **Money Manager** aur **Simulator** tools ka bharpoor faida uthayein!

Aap mazeed kisi specific budget ya target ke baare me sawaal pooch sakte hain!"""
        else:
            resp = f"""💡 **FinGuide AI Financial Co-Pilot Advisory:**

Regarding your inquiry *" {msg} "*:

1. **Strategic Assessment:** Maintain strict discipline over your current monthly spending (PKR {expenses:,.0f}) by auditing recurring daily outlays.
2. **Targeted Savings:** Aim to set aside at least 20% of your income (PKR {income * 0.20:,.0f}/month) before allocating discretionary funds.
3. **Emergency Cushion:** Secure an emergency reserve of at least PKR {expenses * 3:,.0f} (3 months of living costs) in a liquid Islamic money-market fund.
4. **Action Steps in FinGuide:** Use the **Money Manager** to log expenses in real time and test alternative savings trajectories in the **Simulator**.

Feel free to ask for specific calculations or milestone planning!"""

        return AIChatResponse(intent="GENERAL_FINANCIAL_QUESTION", response=resp)

    @classmethod
    def analyze_scam(cls, text: str) -> AIScamResponse:
        text_lower = text.lower()
        
        risk_level = "LOW"
        risk_score = 15
        reasons = ["No common scam patterns found."]
        actions = ["Always be cautious with sharing OTPs or financial info.", "Verify details with standard channels."]

        accumulated_score = 0
        detected_reasons = []
        
        if any(x in text_lower for x in ["won", "jeet", "congratulations", "mubarak", "lottery", "inami"]):
            accumulated_score += 30
            detected_reasons.append("Prize / lottery scam pattern detected (unsolicited winnings notification)")
            
        if any(x in text_lower for x in ["processing fee", "fee", "paisa bhejen", "deposit", "transfer", "advance"]):
            accumulated_score += 30
            detected_reasons.append("Upfront payment request detected (asks for processing fees or cash advance)")
            
        if any(x in text_lower for x in ["urgent", "claim now", "within 24 hours", "fauran", "jaldi"]):
            accumulated_score += 20
            detected_reasons.append("High sense of urgency created to bypass critical thinking")
            
        if any(x in text_lower for x in ["otp", "pin", "credentials", "card number", "password", "cvv"]):
            accumulated_score += 40
            detected_reasons.append("Requests sensitive credentials or OTP token authentication")
            
        if any(x in text_lower for x in ["bisp", "ehsaas", "goverment", "government", "benazir"]):
            accumulated_score += 35
            detected_reasons.append("Impersonation of government aid programs (BISP, Ehsaas Program)")

        if accumulated_score > 0:
            risk_score = min(accumulated_score + 10, 100)
            
        if risk_score >= 70:
            risk_level = "HIGH"
            actions = [
                "NEVER send money or processing fees to claim any prize.",
                "NEVER share your OTP (One-Time Password) or bank card PIN.",
                "Do not click on suspicious links or call the number in the SMS.",
                "Block the sender and report the number to the authorities (FIA Cybercrime)."
            ]
        elif risk_score >= 35:
            risk_level = "MEDIUM"
            actions = [
                "Verify the sender with the official customer support line of the organization they claim to represent.",
                "Do not share any details until absolute verification is complete."
            ]
            
        if len(detected_reasons) == 0:
            detected_reasons = ["Generic message without overt fraud flags."]

        return AIScamResponse(
            risk_level=risk_level,
            risk_score=risk_score,
            reasons=detected_reasons,
            actions=actions,
            disclaimer="Disclaimer: FinGuide AI Scam Detector is an educational safety tool and does not guarantee complete accuracy. Always check with official authorities."
        )

    @staticmethod
    def what_if(request: AIWhatIfRequest, user_profile: Dict[str, Any], goal: Dict[str, Any]) -> AIWhatIfResponse:
        target_amount = request.goal_price if request.goal_price is not None else goal.get("target_amount", 185000.0)
        current_amount = goal.get("current_amount", 80000.0)
        
        current_monthly_saving = goal.get("monthly_contribution", 15000.0)
        new_monthly_saving = request.monthly_savings if request.monthly_savings is not None else current_monthly_saving
        
        if request.monthly_income is not None or request.monthly_expenses is not None:
            income_base = user_profile.get("monthly_income", 100000.0)
            expense_base = user_profile.get("monthly_expenses", 65000.0)
            
            income_new = request.monthly_income if request.monthly_income is not None else income_base
            expense_new = request.monthly_expenses if request.monthly_expenses is not None else expense_base
            
            savings_delta = (income_new - income_base) - (expense_new - expense_base)
            new_monthly_saving = max(current_monthly_saving + savings_delta, 1000.0)

        remaining_amount = max(target_amount - current_amount, 0.0)
        
        orig_timeline = remaining_amount / max(current_monthly_saving, 1.0)
        new_timeline = remaining_amount / max(new_monthly_saving, 1.0)
        
        diff = orig_timeline - new_timeline
        
        if diff > 0:
            rec = f"By saving PKR {new_monthly_saving - current_monthly_saving:,.0f} more per month, you can reach your goal {diff:.1f} months earlier!"
        elif diff < 0:
            rec = f"Saving PKR {current_monthly_saving - new_monthly_saving:,.0f} less per month delays your goal completion by {-diff:.1f} months."
        else:
            rec = "Your timeline remains unchanged. Consider raising monthly savings to reach the goal faster."

        return AIWhatIfResponse(
            original_timeline_months=round(orig_timeline, 1),
            new_timeline_months=round(new_timeline, 1),
            difference_months=round(diff, 1),
            recommendation=rec
        )

    @staticmethod
    def scan_receipt(request: ReceiptScanRequest) -> ReceiptScanResponse:
        today_str = datetime.date.today().isoformat()
        text = (request.text or "").strip()
        
        merchant = "Imtiaz Super Market"
        amount = 3200.0
        category = "Food"
        items = "Groceries (12 items)"
        date_str = today_str
        confidence = 0.96

        if text:
            amount_match = re.search(r'(?:total|amount|pkr|rs\.?|sum|net)\s*[:=]?\s*([0-9,]+(?:\.[0-9]{1,2})?)', text, re.IGNORECASE)
            if amount_match:
                try:
                    amount = float(amount_match.group(1).replace(',', ''))
                except ValueError:
                    pass

            date_match = re.search(r'(\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}[-/]\d{2,4})', text)
            if date_match:
                date_str = date_match.group(1)

            text_lower = text.lower()
            if any(w in text_lower for w in ['super market', 'mart', 'grocer', 'bakery', 'milk', 'bread', 'fruit', 'vegetable', 'meat', 'chicken', 'imtiaz', 'alfatah', 'carrefour', 'metro', 'savemart']):
                category = "Food"
                merchant = "Imtiaz Super Market" if "imtiaz" in text_lower else "Super Market"
                items = "Groceries & Daily Essentials"
            elif any(w in text_lower for w in ['restaurant', 'cafe', 'coffee', 'pizza', 'burger', 'kfc', 'mcdonald', 'kabab', 'biryani', 'tea', 'dhabba', 'foodpanda']):
                category = "Food"
                merchant = "Restaurant / Cafe"
                items = "Food & Dining"
            elif any(w in text_lower for w in ['fuel', 'petrol', 'diesel', 'pso', 'shell', 'total', 'byco', 'attock', 'careem', 'uber', 'indrive', 'yango', 'rickshaw', 'toll']):
                category = "Transport"
                merchant = "PSO / Fuel Station"
                items = "Fuel Refill & Transport"
            elif any(w in text_lower for w in ['electricity', 'k-electric', 'lesco', 'iesco', 'fesco', 'gepco', 'sui gas', 'sngpl', 'ssgc', 'ptcl', 'stormfiber', 'nayatel', 'jazz', 'telenor', 'zong', 'ufone', 'water', 'maintenance']):
                category = "Bills"
                merchant = "Utility Provider"
                items = "Monthly Utility Bill"
            elif any(w in text_lower for w in ['cloth', 'shoes', 'khaadi', 'sapphire', 'gul ahmed', 'junaid jamshed', 'outfitters', 'daraz', 'shopping', 'mall', 'electronics']):
                category = "Shopping"
                merchant = "Shopping Outlet"
                items = "Apparel & Shopping"
            elif any(w in text_lower for w in ['hospital', 'clinic', 'pharmacy', 'medicine', 'dr', 'doctor', 'fazal din', 'd-watson', 'servaid', 'lab', 'chughtai', 'aga khan']):
                category = "Healthcare"
                merchant = "Pharmacy / Healthcare"
                items = "Medications & Medical Care"
            elif any(w in text_lower for w in ['school', 'college', 'university', 'fee', 'tuition', 'books', 'stationery', 'academy']):
                category = "Education"
                merchant = "Educational Institution"
                items = "Tuition / Educational Books"

        return ReceiptScanResponse(
            merchant=merchant,
            date=date_str,
            amount=amount,
            category=category,
            items=items,
            confidence=confidence
        )
