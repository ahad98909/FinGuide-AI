import re
from typing import Tuple, Dict, Any, Optional

class IntentClassifier:
    """
    Multilingual Intent Classifier for FinGuide AI:
    Classifies user queries into:
    - OUT_OF_SCOPE: Non-financial queries (homework, weather, code, poems, jokes, capitals, etc.)
    - GREETING: Greetings & basic pleasantries
    - BUDGET: 50/30/20, salary allocation, income division, budgeting
    - GOAL: Saving for specific target purchases (bike/motorcycle, phone/iPhone, car/Alto, wedding, house, laptop)
    - EXPENSE: Expense reduction, cutting costs, tracking spending
    - PLANNING: Wealth accumulation, emergency reserve, financial freedom, future security
    - SCAM: Fraud, suspicious SMS, prize lottery calls, phishing
    """

    # Non-financial topics that must be politely rejected as OUT_OF_SCOPE
    OUT_OF_SCOPE_PATTERNS = [
        r'\b(homework|assignment|solve\s+math|physics|chemistry|essay)\b',
        r'\b(weather|temperature|forecast|rain\s+today|climate)\b',
        r'\b(capital\s+of|president\s+of|prime\s+minister|who\s+is\s+the\s+king)\b',
        r'\b(poem|poetry|shayari|shair|ghazal|story|joke|latifa|kahani)\b',
        r'\b(python|javascript|coding|html|css|debug\s+this|write\s+code|program)\b',
        r'\b(recipe|cook|baking|biryani|salan|cricket\s+score|football|match)\b',
        r'\b(meaning\s+of\s+life|philosophy|movie|song|lyrics|cinema)\b',
        # Urdu / Roman Urdu out of scope
        r'(ہوم ورک|شاعری|لطیفہ|موسم|دارالحکومت|کوڈ لکھو|کھانا پکانا|کرکٹ میچ)',
        r'\b(homework|latifa|mausam|shayari|gana|film|cricket)\b'
    ]

    # Greeting patterns
    GREETING_PATTERNS = [
        r'\b(hello|hi|hey|greetings|good\s+(morning|afternoon|evening))\b',
        r'\b(salam|assalam|assalamu\s+alaikum|walaikum|slm|kese\s+ho|kaise\s+ho)\b',
        r'\b(who\s+are\s+you|what\s+can\s+you\s+do|intro|introduce\s+yourself)\b',
        r'(سلام|اسلام علیکم|کیسے ہو|کون ہو|تعارف|کی حال اے|سنگے ئے)'
    ]

    # Goal / Target Purchase patterns
    GOAL_PATTERNS = [
        r'\b(buy|purchase|save\s+for|saving\s+for|target|afford|goal|get|order|acquire)\b',
        r'\b(bike|motorcycle|motor\s*bike|honda|cd\s*70|cd70|125|pridor|scooty)\b',
        r'\b(car|vehicle|alto|wagonr|cultus|mehran|yaris|civic|corolla)\b',
        r'\b(iphone|phone|mobile|smartphone|samsung|android|device|gadget|ipad|tablet)\b',
        r'\b(laptop|macbook|computer|pc)\b',
        r'\b(wedding|marriage|shadi|shaadi|valima|jahez)\b',
        r'\b(umrah|hajj|ziyarat)\b',
        r'\b(house|home|flat|apartment|plot|makaan|ghar|zameen)\b',
        # Urdu / Regional goal terms (Sindhi, Pashto, Punjabi, Balochi, Saraiki)
        r'(خریدنا|خریدنی|لینی|لینا|بائیک|بائيڪ|موٹرسائیکل|موټرسایکل|موټر|گاڑی|گاڏي|فون|موبائل|شادی|عمرہ|گھر|پلاٹ|ہدف|بچائڻ|بچائڻا|وسپموم|سپمول|بچاوݨ|وٺڻ)',
        r'\b(khareedna|khareedni|bachana|bachani|lena|leni|bike|car|phone|saving)\b'
    ]

    # Budgeting & Salary Allocation patterns
    BUDGET_PATTERNS = [
        r'\b(budget|budgeting|budgetary|50/30/20|50\s*30\s*20|divide\s+my\s+salary|salary\s+plan|income\s+allocation|allocate)\b',
        r'\b(monthly\s+budget|salary\s+divide|plan\s+my\s+income|salary\s+management)\b',
        r'(بجٹ|تنخواہ کا منصوبہ|آمدنی تقسیم|بجٹنگ|بجٹ بنانا|بجٹ فارمولا)'
    ]

    # Expense Tracking & Reduction patterns
    EXPENSE_PATTERNS = [
        r'\b(cut\s+expense|reduce\s+spending|spend\s+less|spending\s+too\s+much|track\s+spending|where\s+is\s+my\s+money|cut\s+costs)\b',
        r'\b(save\s+money|saving\s+tips|lower\s+bills|overspending|curb\s+spending|unnecessary\s+expense)\b',
        r'(خرچے کم|خرچہ گھٹ|پیسے بچانا|فضول خرچی|خرچ کنٹرول|بچت کے طریقے)'
    ]

    # Financial Planning & Wealth Accumulation patterns
    PLANNING_PATTERNS = [
        r'\b(grow\s+my\s+wealth|wealth|invest|investment|emergency\s+fund|financial\s+planning|future\s+plan|passive\s+income)\b',
        r'\b(financial\s+freedom|retirement|mutual\s+funds|gold|stocks|psx|meezan|halal\s+profit)\b',
        r'(دولت بڑھانا|سرمایہ کاری|ایمرجنسی فنڈ|مستقبل کی منصوبہ بندی|حلال منافع|میوچل فنڈ)'
    ]

    # Scam & Fraud patterns
    SCAM_PATTERNS = [
        r'\b(scam|fraud|phishing|lottery|prize\s+won|suspicious\s+sms|fake\s+call|easypaisa\s+pin|jazzcash\s+otp)\b',
        r'(فراڈ|دھوکہ|سکیم|مشکوک میسج|انعامی سکیم)'
    ]

    @classmethod
    def classify(cls, message: str) -> str:
        text = message.strip().lower()

        # 1. First check if completely OUT OF SCOPE (non-financial)
        for pattern in cls.OUT_OF_SCOPE_PATTERNS:
            if re.search(pattern, text, re.IGNORECASE):
                # Ensure it's not a financial inquiry that incidentally mentions a word
                financial_indicators = ['salary', 'pkr', 'income', 'expense', 'save', 'budget', 'invest', 'rupee', 'bachat', 'kharcha']
                if not any(fi in text for fi in financial_indicators):
                    return "OUT_OF_SCOPE"

        # 2. Check for Greetings
        if len(text.split()) <= 4:
            for pattern in cls.GREETING_PATTERNS:
                if re.search(pattern, text, re.IGNORECASE):
                    return "GREETING"

        # 3. Check for Scam / Fraud
        for pattern in cls.SCAM_PATTERNS:
            if re.search(pattern, text, re.IGNORECASE):
                return "SCAM"

        # 4. Check for Specific Goals (Buying something)
        # Even if phrased as "I need to purchase a motorcycle" or "میں بائیک خریدنا چاہتا ہوں"
        goal_score = 0
        for pattern in cls.GOAL_PATTERNS:
            if re.search(pattern, text, re.IGNORECASE):
                goal_score += 1
        if goal_score >= 1:
            return "GOAL"

        # 5. Check for Budgeting
        for pattern in cls.BUDGET_PATTERNS:
            if re.search(pattern, text, re.IGNORECASE):
                return "BUDGET"

        # 6. Check for Expense Management
        for pattern in cls.EXPENSE_PATTERNS:
            if re.search(pattern, text, re.IGNORECASE):
                return "EXPENSE"

        # 7. Check for Financial Planning / Wealth / Investment
        for pattern in cls.PLANNING_PATTERNS:
            if re.search(pattern, text, re.IGNORECASE):
                return "PLANNING"

        # 8. Check broader financial keywords
        if any(w in text for w in ['salary', 'income', 'saving', 'save', 'expense', 'pkr', 'rupee', 'kamyabi', 'bachat', 'kharch', 'kamai', 'takhmeena', 'tankhwah']):
            return "PLANNING"

        # If completely unrecognized and not financial
        if not any(f in text for f in ['money', 'cash', 'fund', 'bank', 'cost', 'price', 'rate', 'rupee', 'pkr', 'bachat', 'paise', 'karobar', 'profit']):
            # Short questions or common non-financial phrases
            if any(q in text for q in ['who', 'what is', 'tell me', 'can you', 'how to write', 'where is']) and len(text.split()) < 8:
                return "OUT_OF_SCOPE"

        return "PLANNING"
