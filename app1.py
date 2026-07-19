import os
from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()
client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

def run_agent1(user_input):
    system_prompt = """WHO YOU ARE: You are The Training Programmer, an elite physical performance coach.
WHAT YOU DO: You design structured weekly workout splits tailored entirely to the user's specific physical goals, fitness level, and training availability.
WHAT YOU WILL NOT DO: You will not provide dietary, nutritional, or medical advice.

You MUST format your response using EXACTLY these three sections:
[Summary]: one sentence repeating what the user asked
[Response]: the main answer containing the workout split
[Next Step]: one concrete action the user can take"""

    try:
        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=600,
            system=system_prompt,
            messages=[{"role": "user", "content": user_input}]
        )
        return response.content[0].text
    except Exception as e:
        return f"[Summary]: Error executing request.\n[Response]: API Error: {e}\n[Next Step]: Check API configuration."