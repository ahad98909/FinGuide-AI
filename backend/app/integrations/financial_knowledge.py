from typing import Dict, Any, Tuple
from .number_extractor import extract_goal_name

class FinancialKnowledge:
    """
    Comprehensive financial knowledge base for FinGuide AI, tailored for the Pakistani market
    and supporting all 8 official languages:
    - English (en)
    - Urdu (ur)
    - Roman Urdu (roman_urdu)
    - Punjabi (pa)
    - Sindhi (sd)
    - Pashto (ps)
    - Balochi (bal)
    - Saraiki (skr)
    """

    @staticmethod
    def extract_goal_name(message: str) -> str:
        return extract_goal_name(message)


    # Popular products in Pakistani market
    CATALOG = {
        "bike": {
            "name": "Honda CD 70",
            "price": 185000.0,
            "monthly_default": 15000.0
        },
        "motorcycle": {
            "name": "Honda 125",
            "price": 240000.0,
            "monthly_default": 20000.0
        },
        "car": {
            "name": "Suzuki Alto VXR",
            "price": 2450000.0,
            "monthly_default": 45000.0
        },
        "iphone": {
            "name": "iPhone 13 / 15",
            "price": 150000.0,
            "monthly_default": 15000.0
        },
        "phone": {
            "name": "Smartphone Upgrade",
            "price": 95000.0,
            "monthly_default": 12000.0
        },
        "laptop": {
            "name": "Work/Study Laptop",
            "price": 120000.0,
            "monthly_default": 15000.0
        },
        "wedding": {
            "name": "Wedding / Shadi Savings",
            "price": 1500000.0,
            "monthly_default": 50000.0
        },
        "house": {
            "name": "Plot / House Downpayment",
            "price": 4000000.0,
            "monthly_default": 80000.0
        },
        "umrah": {
            "name": "Umrah Package",
            "price": 350000.0,
            "monthly_default": 30000.0
        }
    }

    # Polite Out-of-Scope Rejections in all 8 languages
    OUT_OF_SCOPE_RESPONSES = {
        "en": "I'm sorry, I can only help with financial questions. Please ask me about budgeting (50/30/20 rule), savings goals (like buying a bike or phone), expense management, or financial planning in Pakistan.",
        "ur": "معذرت، میں صرف مالیاتی اور بچت کے سوالات میں مدد کر سکتا ہوں۔ براہ کرم مجھ سے بجٹ بنانے (50/30/20 اصول)، بچت کے اہداف (جیسے بائیک، موبائل یا گاڑی)، اور اخراجات کنٹرول کرنے کے بارے میں دریافت کریں۔",
        "roman_urdu": "Maaf kijiyega, main sirf financial aur savings related sawalat me madad kar sakta hoon. Please mujhse budget banane (50/30/20 formula), savings goals (jaise bike, mobile ya car), aur monthly kharche control karne ke bare me poochein.",
        "pa": "معاف کرنا جی، میں صرف پیسے دھیلے تے بچت دے سوالاں دا جواب دے سکدا واں۔ تسیں میرے کولوں بجٹ بنان، بائیک یا فون واسطے بچت کرن، تے خرچے گھٹان بارے پچھ سکدے او۔",
        "sd": "معاف ڪجو، مان صرف مالي معاملن ۽ بچت جي سوالن ۾ مدد ڪري سگهان ٿو. مهرباني ڪري مون کان بجيٽ ٺاهڻ، بچت جا هدف (جهڙوڪ بائيڪ يا فون)، ۽ خرچ ڪنٽرول ڪرڻ بابت پڇو.",
        "ps": "بښنه غواړم، زه یوازې په مالي چارو او سپما پورې اړوند پوښتنو کې مرسته کولی شم. مهرباني وکړئ زما څخه د بودیجې جوړولو، د سپما هدفونو (لکه موټر سایکل یا موبایل) او د لګښتونو کمولو په اړه وپوښتئ.",
        "bal": "پہل بکن ات، من ایوک ءَ مالیاتی ءُ بچت ءِ جُستاں پسو دات کناں۔ شمارا بجٹ جوڑ کنگ، موٹرسائیکل یا فون ءِ واستہ بچت، ءُ ھرچاں دارگ ءِ بابت جُست کنگی اِنت۔",
        "skr": "معذرت، میں صرف مالیاتی معاملات تے بچت دے سوالاں وچ مدد کر سڳدا ہاں۔ تساں میرے کولوں بجٹ بنواوݨ، بائیک یا فون واسطے پیسے بچاوݨ، تے خرچے گھٹاوݨ بارے مشورہ لے سڳدے او۔"
    }

    # Wealth Planning Knowledge in all 8 languages
    @classmethod
    def get_wealth_growth_response(cls, lang: str, user_name: str, income: float, savings: float, expenses: float) -> str:
        potential = max(0.0, income - expenses)
        emer_min = expenses * 3
        emer_max = expenses * 6

        responses = {
            "en": f"""📈 **Financial Freedom & Wealth Growth Roadmap for {user_name}:**

Based on your profile (Monthly Income: PKR {income:,.0f}, Monthly Expenses: PKR {expenses:,.0f}):
- **Monthly Savings Potential:** PKR {potential:,.0f}/month
- **Emergency Reserve Target:** PKR {emer_min:,.0f} – PKR {emer_max:,.0f} (3–6 months of essential living expenses)

**3-Tier Action Strategy in Pakistan:**
1. **Foundation (Liquid Security):** Keep 3 months of expenses in a Shariah-compliant high-yield digital account (e.g. Meezan Daily Product or UBL Al-Ameen) earning 18–20% annualized yield.
2. **Growth (Mutual Funds & Gold):** Allocate 40% of surplus savings to Islamic Income/Money Market Funds (Al Meezan Sovereign Fund, MCB Arif Habib) or physical 24K gold bullion as an inflation hedge.
3. **Long-Term Wealth (Equities):** Gradually invest in high-dividend PSX Shariah-compliant blue chips (Meezan Bank, Engro, Fauji Fertilizer, Systems Ltd).""",

            "ur": f"""📈 **{user_name} کے لیے دولت میں اضافے اور مالی آزادی کا مکمل لائحہ عمل:**

آپ کے مالیاتی پروفائل کے مطابق (ماہانہ آمدنی: PKR {income:,.0f}، ماہانہ اخراجات: PKR {expenses:,.0f}):
- **ماہانہ بچت کی گنجائش:** PKR {potential:,.0f} ماہانہ
- **ایمرجنسی فنڈ کا ہدف:** PKR {emer_min:,.0f} سے PKR {emer_max:,.0f} (3 سے 6 ماہ کے لازمی گھریلو اخراجات)

**پاکستان میں دولت بڑھانے کی 3 مراحل پر مشتمل حکمت عملی:**
1. **پہلا مرحلہ (ایمرجنسی تحفظ):** 3 ماہ کے اخراجات میزان بینک ڈیلی پروڈکٹ اکاؤنٹ یا کیش فنڈ میں رکھیں جہاں سالانہ 18 سے 20 فیصد تک حلال منافع ملتا ہے۔
2. **دوسرا مرحلہ (میوچل فنڈز اور سونا):** اپنی اضافی بچت کا 40 فیصد اسلامی انکم فنڈز یا خالص 24 قیراط سونے (گولڈ) میں لگائیں تاکہ مہنگائی کا اثر زائل ہو۔
3. **تیسرا مرحلہ (اسٹاک مارکیٹ PSX):** پی ایس ایکس میں منافع بخش کمپنیوں (جیسے اینگرو، سسٹمز، فوجی فرٹیلائزر) کے شیئرز میں طویل مدتی سرمایہ کاری کریں۔""",

            "roman_urdu": f"""📈 **{user_name} ke liye Wealth Growth aur Financial Freedom ka Plan:**

Aap ke profile ke mutabiq (Monthly Income: PKR {income:,.0f}, Monthly Expenses: PKR {expenses:,.0f}):
- **Monthly Bachat Potential:** PKR {potential:,.0f} per month
- **Emergency Reserve Target:** PKR {emer_min:,.0f} – {emer_max:,.0f} (3–6 mahine ke zaroori kharche)

**Pakistan me Paisa Barhane ki 3 Golden Strategies:**
1. **Emergency Fund:** Pehle 3 months ke kharche Meezan Bank Daily Product ya Islamic Cash Fund me rakhein (18-20% halal profit).
2. **Mutual Funds & Gold:** Surplus savings ka 40% Al Meezan Sovereign Fund ya physical Gold me invest karein taake inflation se paisa mehfooz rahe.
3. **PSX Stock Market:** Long-term dividend paying companies (Engro, FFC, Systems) me regular invest karein.""",

            "pa": f"""📈 **{user_name} واسطے دولت ودھان تے مالی آزادی دا منصوبہ:**

تہاڈی ماہانہ آمدن (PKR {income:,.0f}) تے خرچے (PKR {expenses:,.0f}) دے مطابق:
- **مہینے دی بچت دی گنجائش:** PKR {potential:,.0f} ہر مہینے
- **ایمرجنسی فنڈ:** PKR {emer_min:,.0f} توں PKR {emer_max:,.0f} (3 توں 6 مہینے دے خرچے)

**پیسہ ودھان دے 3 طریقے:**
1. **پہلا قدم:** 3 مہینے دے خرچے میزان بینک یا شریعہ فنڈز وچ رکھو تاں کہ حلال منافع ملے۔
2. **دوجا قدم:** سونا (Gold) تے اسلامک میوچل فنڈز وچ سرمایہ کاری کرو۔
3. **تیجا قدم:** پاکستان سٹاک ایکسچینج (PSX) وچ چنگیاں کمپنیاں دے شیئرز خریدو۔""",

            "sd": f"""📈 **{user_name} لاءِ دولت وڌائڻ ۽ مالي آزاديءَ جو منصوبو:**

توهان جي ماهوار آمدني PKR {income:,.0f} ۽ خرچن PKR {expenses:,.0f} مطابق:
- **ماهوار بچت جي گنجائش:** PKR {potential:,.0f} في ماهوار
- **ايمرجنسي فنڊ:** PKR {emer_min:,.0f} کان {emer_max:,.0f} (3 کان 6 مهينن جا خرچ)

**دولت وڌائڻ جون 3 اهم حڪمت عمليون:**
1. **ايمرجنسي بچت:** 3 مهينن جا خرچ ميزان بينڪ يا اسلامي ميوچل فنڊز ۾ رکو.
2. **سون ۽ انويسٽمينٽ:** بچت جو ڪجهه حصو سون ۽ محفوظ شريعه فنڊن ۾ لڳايو.
3. **اسٽاڪ مارڪيٽ:** پي ايس ايڪس (PSX) جي اعليٰ منافعي وارين ڪمپنين ۾ سيڙپڪاري ڪريو.""",

            "ps": f"""📈 **د {user_name} لپاره د شتمنۍ زیاتولو او مالي خپلواکۍ لارښود:**

ستاسو د میاشتني عاید (PKR {income:,.0f}) او لګښتونو (PKR {expenses:,.0f}) په پام کې نیولو سره:
- **میاشتنۍ سپما ظرفیت:** PKR {potential:,.0f} هره میاشت
- **بیړنی فنډ:** PKR {emer_min:,.0f} تر {emer_max:,.0f} پورې (د 3 څخه تر 6 میاشتو لګښتونه)

**د شتمنۍ زیاتولو 3 عمده لارې:**
1. **بیړنی صندوق:** د 3 میاشتو لګښتونه په میزان بانک یا اسلامي کیش فنډ کې وساتئ.
2. **سره زر او میوچل فنډونه:** اضافي سپما په سرو زرو او اسلامي انکم فنډونو کې ولګوئ.
3. **د پاکستان سټاک مارکیټ (PSX):** د اوږدې مودې لپاره په ګټورو شرکتونو کې پانګونه وکړئ.""",

            "bal": f"""📈 **{user_name} ءِ واستہ وتی مڈی ءُ زرّاں گیش کنگ ءِ پلان:**

شمی ماھانہ کٹ PKR {income:,.0f} ءُ ھرچ PKR {expenses:,.0f} ءِ ردا:
- **ماھانہ بچت ءِ گنجائش:** PKR {potential:,.0f} ھر ماہ
- **ایمرجنسی فنڈ:** PKR {emer_min:,.0f} تاں {emer_max:,.0f} (3 تاں 6 ماہ ءِ ھرچ)

**زرّ ودی کنگ ءِ 3 سوج:**
1. **بنیادی بچت:** 3 ماہ ءِ ھرچ میزان بینک یا شریعہ فنڊ ءَ بیہل ات۔
2. **سُہر (Gold) ءُ میوچل فنڈ:** وتی زرّاں سُہر ءُ اسلامک فنڈاں ماں لڳین ات۔
3. **PSX سٹاک مارکیٹ:** شریداریں کمپنیاں چہ دراج وھدی نپ بر ات۔""",

            "skr": f"""📈 **{user_name} واسطے دولت ودھاوݨ تے مالی آزادی دا مکمل لائحہ عمل:**

تہاڈی ماہانہ آمدݨ (PKR {income:,.0f}) تے ماہانہ خرچے (PKR {expenses:,.0f}) دے مطابق:
- **ماہانہ بچت دی گنجائش:** PKR {potential:,.0f} ہر مہینے
- **ایمرجنسی فنڈ دا ہدف:** PKR {emer_min:,.0f} توں {emer_max:,.0f} (3 توں 6 مہینے دے خرچے)

**پاکستان وچ پیسہ ودھاوݨ دے 3 طریقے:**
1. **پہلا مرحلہ:** 3 مہینے دے خرچے میزان بینک یا شریعہ کیش فنڈز وچ رکھو۔
2. **ݙوجھا مرحلہ:** سونا (Gold) تے اسلامک میوچل فنڈز وچ پیسے لاؤ۔
3. **تریجھا مرحلہ:** پی ایس ایکس (PSX) دیاں شریعہ کمپنیاں وچ لمبے عرصے کیتے انویسٹمنٹ کرو۔"""
        }

        return responses.get(lang, responses["en"])

    # Complex multi-part query planner (Salary + Expenses + Target Item + Emergency Fund)
    @classmethod
    def generate_complex_plan(
        cls,
        lang: str,
        user_name: str,
        salary: float,
        expenses: float,
        item_name: str,
        item_price: float
    ) -> Tuple[str, Dict[str, Any]]:
        monthly_surplus = max(5000.0, salary - expenses)
        emer_target = expenses * 3

        # Split surplus: 70% to Item, 30% to Emergency Fund
        item_contrib = round(monthly_surplus * 0.70, -2)
        emer_contrib = round(monthly_surplus * 0.30, -2)
        months_to_goal = max(1, round(item_price / max(item_contrib, 1000.0)))
        months_to_emer = max(1, round(emer_target / max(emer_contrib, 1000.0)))

        plan_data = {
            "name": item_name,
            "target_amount": item_price,
            "current_amount": 0.0,
            "monthly_contribution": item_contrib,
            "emergency_contribution": emer_contrib,
            "emergency_target": emer_target
        }

        responses = {
            "en": f"""🎯 **Personalized Financial Roadmap for {user_name}:**

Based on your finances:
- **Monthly Savings Potential:** PKR {monthly_surplus:,.0f} (PKR {salary:,.0f} Income − PKR {expenses:,.0f} Expenses)
- **Recommended Emergency Fund:** PKR {emer_target:,.0f} (3 months of essential living expenses)
- **{item_name} Target:** PKR {item_price:,.0f}

💡 **Optimized Dual-Savings Plan:**
1. **{item_name} Goal:** Save **PKR {item_contrib:,.0f}/month** → Target achieved in approximately **{months_to_goal} months**.
2. **Emergency Reserve:** Save **PKR {emer_contrib:,.0f}/month** → Reaches PKR {emer_contrib * 12:,.0f} in 12 months (Full PKR {emer_target:,.0f} in {months_to_emer} months).

Click **Confirm & Add to Goals Tracker** below to lock in your goal roadmap!""",

            "ur": f"""🎯 **{user_name} کے لیے تفصیلی اور متوازن مالیاتی منصوبہ:**

آپ کے بتائے گئے اعداد و شمار کے مطابق:
- **ماہانہ بچت کی گنجائش:** PKR {monthly_surplus:,.0f} (PKR {salary:,.0f} آمدنی منفی PKR {expenses:,.0f} اخراجات)
- **ایمرجنسی فنڈ کا ہدف:** PKR {emer_target:,.0f} (3 ماہ کے لازمی اخراجات)
- **{item_name} کی مطلوبہ قیمت:** PKR {item_price:,.0f}

💡 **تجویز کردہ دوہرا بچت منصوبہ:**
1. **{item_name} ہدف:** ماہانہ **PKR {item_contrib:,.0f}** بچائیں → تقریباً **{months_to_goal} ماہ** میں ہدف مکمل ہوگا۔
2. **ایمرجنسی فنڈ:** ماہانہ **PKR {emer_contrib:,.0f}** محفوظ کریں → 12 ماہ میں PKR {emer_contrib * 12:,.0f} جمع ہو جائیں گے۔

نیچے دیے گئے **Confirm & Add to Goals Tracker** بٹن پر کلک کر کے اپنا روڈ میپ محفوظ کریں!""",

            "roman_urdu": f"""🎯 **{user_name} ke liye Customized Dual-Savings Plan:**

Aap ke budget ke mutabiq:
- **Monthly Savings Potential:** PKR {monthly_surplus:,.0f} (PKR {salary:,.0f} Income − PKR {expenses:,.0f} Expenses)
- **Emergency Fund Target:** PKR {emer_target:,.0f} (3 months ke zaroori kharche)
- **{item_name} Target Price:** PKR {item_price:,.0f}

💡 **Recommended Action Plan:**
1. **{item_name} Goal:** Monthly **PKR {item_contrib:,.0f}** save karein → Target takreeban **{months_to_goal} mahine** me pura hoga.
2. **Emergency Fund:** Monthly **PKR {emer_contrib:,.0f}** separate karein → 1 saal me PKR {emer_contrib * 12:,.0f} ready ho jayenge.

Goal lock karne ke liye neeche **Confirm & Add to Goals Tracker** par click karein!""",

            "pa": f"""🎯 **{user_name} واسطے متوازن تے پکا بچت دا منصوبہ:**

تہاڈی آمدن تے خرچے دے مطابق:
- **مہینے دی بچت:** PKR {monthly_surplus:,.0f} (PKR {salary:,.0f} آمدن − PKR {expenses:,.0f} خرچے)
- **ایمرجنسی فنڈ ہدف:** PKR {emer_target:,.0f} (3 مہینے دا خرچہ)
- **{item_name} کل قیمت:** PKR {item_price:,.0f}

💡 **دوہرا بچت منصوبہ:**
1. **{item_name} واسطے:** ہر مہینے **PKR {item_contrib:,.0f}** رکھو → تقریباً **{months_to_goal} مہینے** وچ ہدف پورا۔
2. **ایمرجنسی فنڈ واسطے:** ہر مہینے **PKR {emer_contrib:,.0f}** الگ کرو۔""",

            "sd": f"""🎯 **{user_name} لاءِ بجيٽ ۽ بچت جو تفصيلي منصوبو:**

توهان جي مالي حالت مطابق:
- **ماهوار بچت:** PKR {monthly_surplus:,.0f} (PKR {salary:,.0f} آمدني − PKR {expenses:,.0f} خرچ)
- **ايمرجنسي فنڊ:** PKR {emer_target:,.0f} (3 مهينن جا خرچ)
- **{item_name} جي قيمت:** PKR {item_price:,.0f}

💡 **بهترين بچت پلان:**
1. **{item_name} لاءِ:** ماهوار **PKR {item_contrib:,.0f}** بچايو → لڳ ڀڳ **{months_to_goal} مهينن** ۾ پورو ٿيندو.
2. **ايمرجنسي فنڊ لاءِ:** ماهوار **PKR {emer_contrib:,.0f}** الڳ رکو.""",

            "ps": f"""🎯 **د {user_name} لپاره د سپما او بودیجې ځانګړی پلان:**

ستاسو د مالي معلوماتو له مخې:
- **میاشتنۍ سپما وړتیا:** PKR {monthly_surplus:,.0f} (عاید PKR {salary:,.0f} − لګښتونه PKR {expenses:,.0f})
- **بیړنی صندوق:** PKR {emer_target:,.0f} (د 3 میاشتو لګښتونه)
- **د {item_name} بیه:** PKR {item_price:,.0f}

💡 **د سپما لارښوونه:**
1. **د {item_name} لپاره:** هره میاشت **PKR {item_contrib:,.0f}** وسپمئ → نږدې په **{months_to_goal} میاشتو** کې به بشپړ شي.
2. **د بیړني فنډ لپاره:** هره میاشت **PKR {emer_contrib:,.0f}** جلا کړئ.""",

            "bal": f"""🎯 **{user_name} ءِ واستہ بچت ءِ تفصیلی روڈ میپ:**

شمی کٹ ءُ ھرچ ءِ حسّاب ءَ:
- **ماھانہ بچت ءِ گنجائش:** PKR {monthly_surplus:,.0f} (کٹ PKR {salary:,.0f} − ھرچ PKR {expenses:,.0f})
- **ایمرجنسی فنڈ:** PKR {emer_target:,.0f} (3 ماہ ءِ ھرچ)
- **{item_name} کیمت:** PKR {item_price:,.0f}

💡 **سوبمندیں پلان:**
1. **{item_name} ءِ واستہ:** ھر ماہ **PKR {item_contrib:,.0f}** بچت کن ات → انچو **{months_to_goal} ماہ** ءَ سرجم بیت۔
2. **ایمرجنسی واستہ:** ھر ماہ **PKR {emer_contrib:,.0f}** جتا کن ات۔""",

            "skr": f"""🎯 **{user_name} واسطے مکمل تے متوازن بچت پلان:**

تہاڈی آمدݨ تے خرچے دے حساب نال:
- **ماہانہ بچت دی گنجائش:** PKR {monthly_surplus:,.0f} (آمدݨ PKR {salary:,.0f} − خرچے PKR {expenses:,.0f})
- **ایمرجنسی فنڈ دا ہدف:** PKR {emer_target:,.0f} (3 مہینے دے ضروری خرچے)
- **{item_name} دی کل قیمت:** PKR {item_price:,.0f}

💡 **دوہرا بچت فارمولا:**
1. **{item_name} ہدف:** ہر مہینے **PKR {item_contrib:,.0f}** پاوو → تقریباً **{months_to_goal} مہینے** وچ پورا تھیسی۔
2. **ایمرجنسی فنڈ:** ہر مہینے **PKR {emer_contrib:,.0f}** بچت اکاؤنٹ وچ رکھو۔"""
        }

        return responses.get(lang, responses["en"]), plan_data
