from app1 import run_agent1
from app2 import run_agent2, export_to_pdf

def main():
    print("--- The Athlete's Blueprint ---")
    
    saved_workout_split = None
    
    while True:
        print("\nWhich agent do you want to use?")
        print("1. Agent 1 - The Training Programmer (Generate Workout Split)")
        print("2. Agent 2 - The Performance Nutritionist (Generate Meal Plan & Export)")
        print("3. Exit")
        
        choice = input("\nSelect an option (1, 2, or 3): ").strip()
        
        if choice == '1':
            print("\n[System] Let's build your profile. Please answer the following:")
            
            # שאלות ספציפיות אחת אחרי השנייה
            metrics = input("1. What are your current metrics (height, weight)?\n> ")
            goals = input("2. What is your primary physical goal?\n> ")
            availability = input("3. How many days a week can you train?\n> ")
            
            # חיבור כל התשובות לפקודה אחת מסודרת עבור הסוכן
            user_input = f"My metrics: {metrics}. My goal: {goals}. My availability: {availability}."
            
            print("\n[System] Consulting Agent 1...")
            result = run_agent1(user_input)
            print("\n" + result)
            
            saved_workout_split = result
            print("\n[System] Workout split saved to memory for the Nutritionist.")
            
        elif choice == '2':
            if saved_workout_split:
                print("\n[System] Found saved workout split in memory. Loading automatically...")
                nutrition_goals = input("Enter your specific nutrition goals and any dietary restrictions:\n> ")
                
                combined_input = f"Here is my current workout split:\n{saved_workout_split}\n\nHere are my nutrition goals and restrictions:\n{nutrition_goals}"
                
                print("\n[System] Consulting Agent 2...")
                result = run_agent2(combined_input)
                
            else:
                user_input = input("\nEnter the workout split to analyze, along with your goals and any dietary restrictions:\n> ")
                print("\n[System] Consulting Agent 2...")
                result = run_agent2(user_input)
            
            print("\n" + result)
            
            export_choice = input("\nDo you want to export this meal plan to a PDF? (yes/no): ").strip().lower()
            if export_choice == 'yes':
                export_to_pdf(result)
            else:
                print("[System] PDF export skipped.")
            
        elif choice == '3':
            print("\nExiting The Athlete's Blueprint.")
            break
            
        else:
            print("\nInvalid input. Please select 1, 2, or 3.")

if __name__ == "__main__":
    main()