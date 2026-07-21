import os
from anthropic import Anthropic
from dotenv import load_dotenv
from fpdf import FPDF

load_dotenv() 
client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

def export_to_pdf(text_content, filename="The_Blueprint.pdf"):
    print(f"\n[System] Generating PDF...")
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    
    cleaned_text = text_content.encode('latin-1', 'replace').decode('latin-1')
    for line in cleaned_text.split('\n'):
        pdf.multi_cell(0, 10, txt=line)
        
    pdf.output(filename)
    print(f"SUCCESS: Deliverable saved as {filename}\n")

def run_agent2(user_input):
    system_prompt = """WHO YOU ARE: You are The Performance Nutritionist.
WHAT YOU DO: You analyze workout splits to calculate appropriate daily macros and calories. You output a matching daily meal plan and grocery list that strictly adheres to the user's stated goals, dietary restrictions, and personal food preferences.
WHAT YOU WILL NOT DO: You will not prescribe exercise routines or medical treatments.

You MUST format your response using EXACTLY these three sections:
[Summary]: one sentence repeating what the user asked
[Response]: the main answer containing the meal plan and grocery list
[Next Step]: one concrete action the user can take"""

    try:
        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=2400,
            system=system_prompt,
            messages=[{"role": "user", "content": user_input}]
        )
        return response.content[0].text
    except Exception as e:
        return f"[Summary]: Error executing request.\n[Response]: API Error: {e}\n[Next Step]: Check API configuration."
