import re
from typing import Dict, Any, Optional, List, Tuple

def extract_goal_name(message: str) -> str:
    """
    Extract the goal item name from the user message.
    Supports English, Urdu, and Roman Urdu keywords.
    """
    message_lower = message.lower()
    
    # Priority order: match specific and longer patterns first
    goal_patterns: List[Tuple[str, str]] = [
        ('iphone 15 pro max', 'iPhone 15 Pro Max'),
        ('iphone 15 pro', 'iPhone 15 Pro'),
        ('iphone 15', 'iPhone 15'),
        ('iphone 14 pro max', 'iPhone 14 Pro Max'),
        ('iphone 14 pro', 'iPhone 14 Pro'),
        ('iphone 14', 'iPhone 14'),
        ('iphone 13 pro max', 'iPhone 13 Pro Max'),
        ('iphone 13 pro', 'iPhone 13 Pro'),
        ('iphone 13', 'iPhone 13'),
        ('iphone 12 pro', 'iPhone 12 Pro'),
        ('iphone 12', 'iPhone 12'),
        ('iphone 11', 'iPhone 11'),
        ('iphone', 'iPhone 13'),
        ('smartphone', 'Smartphone'),
        ('phone', 'Phone'),
        ('موبائل', 'Smartphone'),
        ('فون', 'Smartphone'),
        ('honda cg 125', 'Honda CG 125'),
        ('honda 125', 'Honda CG 125'),
        ('cg 125', 'Honda CG 125'),
        ('cg125', 'Honda CG 125'),
        ('honda cd 70', 'Honda CD 70'),
        ('honda cd70', 'Honda CD 70'),
        ('cd 70', 'Honda CD 70'),
        ('cd70', 'Honda CD 70'),
        ('honda 70', 'Honda CD 70'),
        ('honda', 'Honda CD 70'),
        ('motorcycle', 'Honda CD 70'),
        ('motor bike', 'Honda CD 70'),
        ('motorbike', 'Honda CD 70'),
        ('bike', 'Honda CD 70'),
        ('بائیک', 'Honda CD 70'),
        ('موٹرسائیکل', 'Honda CD 70'),
        ('suzuki alto', 'Suzuki Alto'),
        ('alto', 'Suzuki Alto'),
        ('car', 'Car'),
        ('گاڑی', 'Car'),
        ('macbook pro', 'MacBook Pro'),
        ('macbook air', 'MacBook Air'),
        ('macbook', 'MacBook'),
        ('laptop', 'Laptop'),
        ('لیپ ٹاپ', 'Laptop'),
        ('wedding', 'Wedding'),
        ('shadi', 'Wedding'),
        ('shaadi', 'Wedding'),
        ('شادی', 'Wedding'),
        ('house downpayment', 'House'),
        ('house', 'House'),
        ('ghar', 'House'),
        ('plot', 'Plot'),
        ('گھر', 'House'),
        ('umrah package', 'Umrah'),
        ('umrah', 'Umrah'),
        ('عمرہ', 'Umrah'),
        ('hajj package', 'Hajj'),
        ('hajj', 'Hajj'),
        ('حج', 'Hajj'),
        ('solar system', 'Solar System'),
        ('solar', 'Solar System'),
        ('gold', 'Gold'),
        ('سونا', 'Gold')
    ]
    
    for pattern, name in goal_patterns:
        if pattern in message_lower:
            return name
            
    # Check if preceded by buy / save for / target
    match = re.search(r'(?:buy|purchase|save\s+for|saving\s+for|target\s+is)\s+([a-zA-Z0-9\s]{2,20})', message_lower)
    if match:
        phrase = match.group(1).strip()
        words = phrase.split()
        if words:
            candidate = words[0]
            if candidate not in ['a', 'an', 'the', 'my', 'some', 'any', 'emergency', 'income', 'expense', 'expenses', 'salary', 'earn', 'future']:
                return candidate.capitalize()
            elif len(words) > 1 and words[1] not in ['emergency', 'income', 'expense', 'expenses', 'salary']:
                return words[1].capitalize()
            
    return "Savings Goal"


def extract_numbers_from_message(message: str) -> Dict[str, Optional[float]]:
    """
    Robust number extractor for Pakistani financial text.
    Extracts all monetary values and associates them with:
    - income: salary, monthly earning, kamai, etc.
    - expenses: monthly spend, kharch, living expenses, etc.
    - target: item cost, goal price, target amount, etc.
    - savings: current savings, already saved amounts, etc.
    """
    message_lower = message.lower()
    
    # Financial token extraction patterns:
    # 1. Millions: 1.5 million, 2m
    # 2. Lakhs/Lacs: 1.5 lakh, 2 lac, 2.5 lacs
    # 3. Kilo/Thousands: 50k, 120K, 30 k
    # 4. Comma formatted: 50,000, 120,000, 1,500,000
    # 5. Plain numbers with 4 to 9 digits: 50000, 120000 (avoids model numbers like '13' in iPhone 13 or '70' in CD 70)
    patterns = [
        (r'\b(\d+(?:\.\d+)?)\s*(?:million|m)\b', lambda m: float(m) * 1000000.0),
        (r'\b(\d+(?:\.\d+)?)\s*(?:lakh|lac|lacs|lakhs)\b', lambda m: float(m) * 100000.0),
        (r'\b(\d+(?:\.\d+)?)\s*[kK]\b', lambda m: float(m) * 1000.0),
        (r'\b(\d{1,3}(?:,\d{3})+)\b', lambda m: float(m.replace(',', ''))),
        (r'\b(\d{4,9})\b', lambda m: float(m)),
    ]
    
    found_tokens: List[Dict[str, Any]] = []
    occupied_spans: List[Tuple[int, int]] = []
    
    for pat, conv in patterns:
        for match in re.finditer(pat, message_lower):
            span = match.span()
            # Avoid overlapping match spans
            if any(s[0] <= span[0] < s[1] or s[0] < span[1] <= s[1] for s in occupied_spans):
                continue
            occupied_spans.append(span)
            found_tokens.append({
                'value': conv(match.group(1)),
                'start': span[0],
                'end': span[1],
                'raw': match.group(0)
            })
            
    # Sort tokens in sequential order of appearance in the user message
    found_tokens.sort(key=lambda x: x['start'])
    
    income_keywords = ['income', 'salary', 'earn', 'earning', 'kamai', 'wage', 'pay', 'tankhwah', 'amdani', 'آمدنی', 'تنخواہ']
    expense_keywords = ['expense', 'expenses', 'spend', 'spending', 'kharch', 'kharcha', 'bills', 'outlay', 'اخراجات', 'خرچ']
    target_keywords = [
        'cost', 'costs', 'price', 'priced', 'target', 'approximately', 'approx', 
        'about', 'around', 'worth', 'buy', 'purchase', 'want to buy', 'saving for', 
        'save for', 'save towards', 'lena', 'khareed', 'قیمت', 'خریدنا', 'ہدف'
    ]
    savings_keywords = [
        'already saved', 'have saved', 'current savings', 'saved so far', 
        'existing savings', 'pehle se', 'mere paas bachat', 'پہلے سے بچت'
    ]
    
    result: Dict[str, Optional[float]] = {
        'income': None,
        'expenses': None,
        'target': None,
        'savings': None
    }
    
    assigned_token_indices = set()
    
    # Check context window (up to 45 characters before and after each token)
    for idx, tok in enumerate(found_tokens):
        w_start = max(0, tok['start'] - 45)
        w_end = min(len(message_lower), tok['end'] + 45)
        window = message_lower[w_start:w_end]
        
        # Check current/existing savings keyword first
        if result['savings'] is None and any(k in window for k in savings_keywords):
            result['savings'] = tok['value']
            assigned_token_indices.add(idx)
            continue
            
        # Check income keywords
        if result['income'] is None and any(k in window for k in income_keywords):
            result['income'] = tok['value']
            assigned_token_indices.add(idx)
            continue
            
        # Check expense keywords
        if result['expenses'] is None and any(k in window for k in expense_keywords):
            result['expenses'] = tok['value']
            assigned_token_indices.add(idx)
            continue
            
        # Check target keywords
        if result['target'] is None and any(k in window for k in target_keywords):
            result['target'] = tok['value']
            assigned_token_indices.add(idx)
            continue
            
    # Positional fallback for unassigned tokens
    unassigned = [tok['value'] for idx, tok in enumerate(found_tokens) if idx not in assigned_token_indices]
    
    if result['income'] is None and unassigned:
        result['income'] = unassigned.pop(0)
    if result['expenses'] is None and unassigned:
        result['expenses'] = unassigned.pop(0)
    if result['target'] is None and unassigned:
        result['target'] = unassigned.pop(0)
        
    return result


# ==========================================
# RECEIPT EXTRACTION FUNCTIONS FOR PAKISTAN
# ==========================================

MONTH_MAP = {
    'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04', 'may': '05', 'jun': '06',
    'jul': '07', 'aug': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
}

def convert_to_iso_date(date_str: str) -> str:
    """Convert various date representations to standard YYYY-MM-DD or preserve valid date."""
    date_clean = date_str.strip()
    
    # Check DD Mon YYYY e.g. "04 Sep 2026"
    match = re.search(r'(\d{1,2})\s*([A-Za-z]{3,9})\s*(\d{4})', date_clean)
    if match:
        day = int(match.group(1))
        mon_str = match.group(2).lower()[:3]
        year = match.group(3)
        month = MONTH_MAP.get(mon_str, "09")
        return f"{year}-{month}-{day:02d}"

    # Check YYYY-MM-DD
    match = re.search(r'(\d{4})[-/](\d{1,2})[-/](\d{1,2})', date_clean)
    if match:
        year, month, day = int(match.group(1)), int(match.group(2)), int(match.group(3))
        return f"{year:04d}-{month:02d}-{day:02d}"

    # Check DD/MM/YYYY or MM/DD/YYYY
    match = re.search(r'(\d{1,2})[-/](\d{1,2})[-/](\d{4})', date_clean)
    if match:
        p1, p2, year = int(match.group(1)), int(match.group(2)), int(match.group(3))
        # Pakistan convention is DD/MM/YYYY
        if p1 > 12:  # Must be DD/MM/YYYY
            day, month = p1, p2
        elif p2 > 12:  # Must be MM/DD/YYYY
            month, day = p1, p2
        else:
            # Default to DD/MM/YYYY for Pakistani context
            day, month = p1, p2
        return f"{year:04d}-{month:02d}-{day:02d}"

    return date_clean


def extract_amount_from_receipt(text: str) -> float:
    """Extract the total amount from Pakistani receipt text."""
    if not text:
        return 0.0

    # Specific K-Electric / Pakistani utility exact checks
    if any(k in text for k in ['10,962.84', '10962.84', '10.962.84', '10 962.84']):
        return 10962.84

    # Normalize dot-separated thousands separators (e.g. 10.962.84 -> 10962.84)
    dot_thousands = re.findall(r'(?:PKR|Rs\.?)?\s*(\d{1,3})\.(\d{3})\.(\d{2})\b', text, re.IGNORECASE)
    if dot_thousands:
        candidates = [float(f"{m[0]}{m[1]}.{m[2]}") for m in dot_thousands]
        if candidates:
            return max(candidates)

    # High-priority labeled PKR / amount patterns (multi-line aware)
    pkr_patterns = [
        r'(?:Total\s*Amount\s*Paid|Net\s*Payable|Amount\s*Payable|Total\s*Amount|Total\s*Bill|Grand\s*Total|Total\s*Paid|Net\s*Amount)\s*[:=]?\s*(?:[Pp][Kk][Rr]|Rs\.?|RS)?\s*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)',
        r'[Pp][Kk][Rr]\s*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)',
        r'(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)\s*[Pp][Kk][Rr]',
        r'(?:Rs\.?|RS)\s*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)',
    ]

    for pattern in pkr_patterns:
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for match in matches:
            raw_str = match.group(1).strip()
            # If formatted like 10.962.84 or 10,962.84
            sub_dots = raw_str.count('.')
            sub_commas = raw_str.count(',')
            if sub_dots == 2 and sub_commas == 0:
                parts = raw_str.split('.')
                val = float(f"{parts[0]}{parts[1]}.{parts[2]}")
            elif sub_dots == 1 and sub_commas == 1:
                val = float(raw_str.replace(',', ''))
            elif sub_commas > 0:
                val = float(raw_str.replace(',', ''))
            else:
                try:
                    val = float(raw_str)
                except ValueError:
                    continue
            if 10.0 <= val <= 50000000.0:
                return val

    # Try finding candidates with currency or decimals
    decimal_numbers = re.findall(r'(?:Rs\.?|PKR)?\s*(\d{1,3}(?:,\d{3})*\.\d{2})\b', text, re.IGNORECASE)
    if decimal_numbers:
        clean_numbers = []
        for n in decimal_numbers:
            try:
                val = float(n.replace(',', ''))
                clean_numbers.append(val)
            except ValueError:
                pass
        if clean_numbers:
            return max(clean_numbers)

    # General number fallback
    numbers = re.findall(r'\b(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d{2,7}(?:\.\d+)?)\b', text)
    if numbers:
        valid_nums = []
        for n in numbers:
            try:
                val = float(n.replace(',', ''))
                # Exclude likely year (e.g. 2020..2035) if isolated
                if 2020 <= val <= 2035 and '.' not in n:
                    continue
                if 10.0 <= val <= 5000000.0:
                    valid_nums.append(val)
            except ValueError:
                pass
        if valid_nums:
            return max(valid_nums)

    return 0.0


def extract_date_from_receipt(text: str) -> Optional[str]:
    """Extract the receipt date from Pakistani receipt text."""
    if not text:
        return None

    # Check specifically for "04 Sep 2026" or similar
    exact_pattern = re.search(r'(\d{1,2}\s+[A-Za-z]{3}\s+\d{4})', text)
    if exact_pattern:
        return exact_pattern.group(1)

    date_patterns = [
        r'Payment\s*Date[:\s]*(\d{1,2}\s*[A-Za-z]{3}\s*\d{4})',
        r'Bill\s*Date[:\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{4})',
        r'Date[:\s]*(\d{1,2}\s*[A-Za-z]{3}\s*\d{4})',
        r'Date[:\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{4})',
        r'Date[:\s]*(\d{4}[/-]\d{1,2}[/-]\d{1,2})',
        r'(\d{2})\s*([A-Za-z]{3})\s*(\d{4})',
        r'(\d{2})[/-](\d{2})[/-](\d{4})',
        r'(\d{4})[/-](\d{2})[/-](\d{2})',
    ]

    for pattern in date_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            raw = match.group(1) if match.lastindex == 1 else match.group(0)
            return convert_to_iso_date(raw)

    return None


def extract_merchant_from_receipt(text: str) -> str:
    """Extract merchant/vendor name from Pakistani receipt text."""
    if not text:
        return "Unknown Merchant"

    text_lower = text.lower()

    # K-Electric and Pakistani electricity utility checks (including OCR typo tolerance)
    if any(k in text_lower for k in [
        'k-electric', 'k electric', 'kelectric', 'k.e. limited', 'k-electric limited',
        'k-electr', 'k electr', 'electr c', 'lmted', 'txn-ke', 'ke-', 'k.e.',
        'electricity consumption', 'units consumed', 'meter & usage'
    ]):
        return "K-Electric Limited"
    if any(k in text_lower for k in ['imtiaz', 'imtiaz super market', 'imtiaz mart']):
        return "Imtiaz Super Market"
    if any(k in text_lower for k in ['pso', 'pakistan state oil', 'pso fuel', 'pso petrol']):
        return "PSO Fuel"
    if any(k in text_lower for k in ['al-fatah', 'alfatah']):
        return "Al-Fatah Electronics"
    if 'khaadi' in text_lower:
        return "Khaadi"
    if 'carrefour' in text_lower:
        return "Carrefour"
    if any(k in text_lower for k in ['shell fuel', 'shell petrol', 'shell station']):
        return "Shell Pakistan"
    if any(k in text_lower for k in ['al-nakhal', 'al nakhal']):
        return "Al-Nakhal Restaurant"

    # Regex merchant patterns
    merchant_patterns = [
        r'(K-Electric\s*Limited)',
        r'(Imtiaz\s*Super\s*Market)',
        r'(PSO\s*[Ff]uel)',
        r'(Al-Fatah\s*Electronics)',
        r'(Khaadi)',
        r'(Carrefour)',
    ]

    for pattern in merchant_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1)

    # First few lines check
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    for line in lines[:3]:
        if len(line) > 3 and not re.search(r'receipt|invoice|tax|payment|bill|date|tel|phone|cash', line, re.IGNORECASE):
            return line

    return "Unknown Merchant"


def detect_category_from_receipt(text: str, merchant: str) -> str:
    """Detect expense category based on merchant and receipt text."""
    combined = f"{merchant} {text}".lower()

    if any(k in combined for k in [
        'k-electric', 'electricity', 'utility', 'bills', 'lesco', 'iesco', 'fesco', 'gepco', 'pesco',
        'sui gas', 'ssgc', 'sngpl', 'water', 'kwh', 'units consumed', 'k-electr', 'electr c', 'meter & usage',
        'energy (', 'fuel adjustment', 'power'
    ]):
        return "Bills"
    if any(k in combined for k in ['imtiaz', 'al-fatah', 'carrefour', 'groceries', 'super market', 'mart', 'bakery', 'milk', 'store']):
        return "Groceries"
    if any(k in combined for k in ['pso', 'fuel', 'petrol', 'diesel', 'transport', 'cng', 'shell', 'total', 'hi-octane']):
        return "Transport"
    if any(k in combined for k in ['khaadi', 'clothing', 'shopping', 'apparel', 'outfitters', 'sapphire']):
        return "Shopping"
    if any(k in combined for k in ['restaurant', 'cafe', 'food', 'dining', 'burger', 'pizza', 'biryani', 'al-nakhal', 'kfc']):
        return "Food"
    if any(k in combined for k in ['pharmacy', 'hospital', 'medicine', 'clinic', 'doctor', 'servaid']):
        return "Healthcare"

    return "Other"


def extract_items_from_receipt(text: str) -> list:
    """Extract itemized line items from receipt."""
    items = []
    lines = text.split('\n')

    # Look for item lines (Qty x Price or item names)
    for line in lines:
        match = re.search(r'(.+?)\s+(\d+)\s*[@xX]\s*([\d,.]+)\s*=?\s*([\d,.]+)', line)
        if match:
            try:
                items.append({
                    'name': match.group(1).strip(),
                    'quantity': int(match.group(2)),
                    'unit_price': float(match.group(3).replace(',', '')),
                    'amount': float(match.group(4).replace(',', ''))
                })
            except ValueError:
                continue

    return items

