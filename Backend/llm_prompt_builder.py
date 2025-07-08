import os
import json
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

# Configure Gemini API
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel("gemini-2.0-flash")
def build_prompt_with_rules(transaction_blocks: list[str]) -> str:
    base_prompt = """
You are a personal finance assistant. Extract structured JSON transactions from bank statement lines.

Each transaction must contain:
- date (YYYY-MM-DD)
- title (merchant/source name)
- amount (float)
- type ("credit" or "debit")
- category: one of [Dining, Groceries, Utilities, Transportation, Shopping, Entertainment, Healthcare, Salary, Others]
- payment_method: one of [UPI, NEFT, ACH, CASH, CHEQUE, IMPS, Not specified]
- description: 3–5 word summary
- confidence: integer from 0 to 100 (how confident you are in the category)

📊 Confidence Rules (0–100):
- 95–100 → strong category match from both title and amount clues
- 85–94 → title clearly maps to a category, even if amount doesn’t align
- 70–84 → partial match (title or amount gives some clue, but not both)
- 50–69 → vague pattern or keyword, limited confidence
- Below 50 → highly uncertain, consider using category "Others"

🔍 Classification Rules:
- ₹25,000–₹180,000 credit in first 7 days of month → category: Salary
- ₹500–₹1500 debit → category: Transportation
- ₹1000–₹2000 debit → category: Utilities
- amount < ₹100 → category: Others

🧠 Keyword-based clues:
- Dining → zomato, swiggy, restaurant, cafe, momo, food court, bar
- Groceries → grocery, supermarket, mart, big bazaar, fresh
- Shopping → amazon, flipkart, myntra, zudio, fashion, lifestyle
- Entertainment → netflix, movie, ticket, pvr, bookmyshow, hotstar
- Healthcare → pharmacy, medplus, clinic, hospital, apollo
- Utilities → recharge, broadband, gas, bsnl, water bill, electricity

Only assign "Others" if it clearly doesn’t match any pattern or category.

---
Return output as **a JSON array** of transactions only.

No explanation, no markdown, no labels — only valid JSON.

Examples:

Input:
01-08-23 01-08-23 UPI/DR/321360840952/VIKRANT /UTIB/vik.bhat22/UPI 000000 2519.00 DR
Output:
{
  "date": "2023-08-01",
  "title": "VIKRANT",
  "amount": 2519.00,
  "type": "debit",
  "payment_method": "UPI",
  "category": "Utilities",
  "description": "Paytm to VIKRANT",
  "confidence": 87
}

Input:
02-08-23 02-08-23 NEFT*ICIC0000393*CMS346613 PHYSICSWALLAH 000000 - 52000.00 CR
Output:
{
  "date": "2023-08-02",
  "title": "PHYSICSWALLAH",
  "amount": 52000.00,
  "type": "credit",
  "payment_method": "NEFT",
  "category": "Salary",
  "description": "Monthly Salary credited",
  "confidence": 98
}

Now extract all transactions below and respond with a JSON array only:

""" + "\n".join(transaction_blocks)
    return base_prompt.strip()


def call_gemini_and_get_json(prompt: str):
    try:
        response = model.generate_content(prompt)
        content = response.text.strip()

        print("🧠 Gemini raw output:\n", content)

        # Handle Gemini wrapping output in ```json ``` or ``` blocks
        if content.startswith("```json"):
            content = content.replace("```json", "").replace("```", "").strip()
        elif content.startswith("```"):
            content = content.replace("```", "").strip()

        parsed = json.loads(content)

        # Handle Gemini returning {"transactions": [...]}
        if isinstance(parsed, dict) and "transactions" in parsed:
            return parsed["transactions"]
        elif isinstance(parsed, list):
            return parsed
        else:
            print("⚠️ Unexpected JSON format:", parsed)
            return []

    except Exception as e:
        print("❌ Error parsing Gemini response:", e)
        return []
