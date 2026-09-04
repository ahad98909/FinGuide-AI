import unittest
import io
from PIL import Image, ImageDraw

from app.integrations.preprocess import preprocess_image, decode_image_bytes
from app.integrations.number_extractor import (
    extract_amount_from_receipt,
    extract_date_from_receipt,
    extract_merchant_from_receipt,
    detect_category_from_receipt,
    extract_items_from_receipt
)
from app.integrations.receipt_handlers import (
    handle_k_electric_receipt,
    handle_imtiaz_receipt,
    handle_pso_receipt,
    handle_restaurant_receipt,
    process_specialized_receipt
)
from app.integrations.receipt_scanner import ReceiptScanner
from app.schemas import ReceiptScanRequest
from app.services.ai_service import AIService

class TestPakistaniReceiptScanner(unittest.TestCase):

    def test_kelectric_receipt_extraction(self):
        receipt_text = """
        K-Electric Limited
        Official Payment Receipt
        Bill Date: 04 Sep 2026
        Consumer Name: Muhammad Ahmed
        Account No: 0400012345678
        Monthly Electricity Consumption
        Total Amount Paid: PKR 10,962.84
        Status: Paid
        """
        
        result = handle_k_electric_receipt(receipt_text)
        self.assertEqual(result['merchant'], "K-Electric Limited")
        self.assertEqual(result['total_amount'], 10962.84)
        self.assertIn("04 Sep 2026", result['date'])
        self.assertEqual(result['category'], "Bills")
        self.assertIn("Monthly Electricity Consumption", result['items'])

    def test_kelectric_via_scanner(self):
        receipt_text = """
        K-Electric Limited
        Official Payment Receipt
        Total Amount Paid: PKR 10,962.84
        Date: 04 Sep 2026
        """
        res = ReceiptScanner.scan(text_hint=receipt_text)
        self.assertEqual(res['merchant'], "K-Electric Limited")
        self.assertEqual(res['total_amount'], 10962.84)
        self.assertEqual(res['date'], "04 Sep 2026")
        self.assertEqual(res['category'], "Bills")

    def test_kelectric_via_ai_service(self):
        req = ReceiptScanRequest(
            text="k-electric official receipt PKR 10,962.84 date 04 Sep 2026"
        )
        res = AIService.scan_receipt(req)
        self.assertEqual(res.merchant, "K-Electric Limited")
        self.assertEqual(res.amount, 10962.84)
        self.assertEqual(res.total_amount, 10962.84)
        self.assertEqual(res.category, "Bills")
        self.assertEqual(res.date, "04 Sep 2026")

    def test_imtiaz_receipt_extraction(self):
        receipt_text = """
        Imtiaz Super Market
        Date: 04 Sep 2026
        Total Amount: PKR 3,200.00
        Items: Groceries & Daily Essentials
        """
        result = handle_imtiaz_receipt(receipt_text)
        self.assertEqual(result['merchant'], "Imtiaz Super Market")
        self.assertEqual(result['total_amount'], 3200.0)
        self.assertEqual(result['category'], "Groceries")

    def test_pso_receipt_extraction(self):
        receipt_text = """
        PSO Fuel Station
        Date: 04 Sep 2026
        Total Amount: PKR 4,500.00
        Hi-Octane Fuel (15L)
        """
        result = handle_pso_receipt(receipt_text)
        self.assertEqual(result['merchant'], "PSO Fuel")
        self.assertEqual(result['total_amount'], 4500.0)
        self.assertEqual(result['category'], "Transport")

    def test_restaurant_receipt_extraction(self):
        receipt_text = """
        Al-Nakhal Restaurant
        Date: 04 Sep 2026
        Dinner & Refreshments
        Net Payable PKR 2,850.00
        """
        result = handle_restaurant_receipt(receipt_text)
        self.assertEqual(result['merchant'], "Al-Nakhal Restaurant")
        self.assertEqual(result['total_amount'], 2850.0)
        self.assertEqual(result['category'], "Food")

    def test_image_preprocessing(self):
        # Create a simple test image
        img = Image.new("RGB", (300, 300), color="white")
        draw = ImageDraw.Draw(img)
        draw.text((20, 20), "K-Electric Limited PKR 10962.84", fill="black")
        
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        raw_bytes = buf.getvalue()

        processed = preprocess_image(raw_bytes)
        self.assertIsNotNone(processed)
        self.assertIn(processed.mode, ["RGB", "L"])

    def test_kelectric_with_ocr_artifacts(self):
        """Test OCR text containing missing letters and dot-separated amounts."""
        noisy_text = (
            "K-ELECTR C LMTED\n"
            "OFFICIALPAYMENTRECEIPT\n"
            "TOTAL AMOUNT PAID\n"
            "PKR 10.962.84\n"
            "TXN-KE-20260904-8901\n"
            "Payment Date: 04 Sep 2026\n"
            "Units Consumed: 323 kWh\n"
        )
        result = ReceiptScanner.scan(text_hint=noisy_text)
        self.assertEqual(result['merchant'], "K-Electric Limited")
        self.assertEqual(result['total_amount'], 10962.84)
        self.assertEqual(result['category'], "Bills")
        self.assertTrue(any("Electricity" in item for item in result['items']))

    def test_dot_amount_normalization(self):
        """Test European dot-separated thousands amounts like 10.962.84."""
        amount = extract_amount_from_receipt("Total Amount Paid: PKR 10.962.84")
        self.assertEqual(amount, 10962.84)

        amount2 = extract_amount_from_receipt("Grand Total: PKR 8.149.29")
        self.assertEqual(amount2, 8149.29)


if __name__ == "__main__":
    unittest.main()
