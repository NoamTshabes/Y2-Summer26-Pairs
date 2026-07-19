from app1 import run_agent1
from app2 import run_agent2, export_to_pdf

def main():
    print("--- The Athlete's Blueprint ---")
    
    while True:
        print("\nWhich agent do you want to use?")
        print("1. Agent 1 - The Training Programmer (Generate Workout Split)")
        print("2. Agent 2 - The Performance Nutritionist (Generate Meal Plan & Export)")
        print("3. Exit")
        
        choice = input("\nSelect an option (1, 2, or 3): ").strip()
        
        if choice == '1':
            user_input = input("\nEnter your specific physical goals, current metrics, and training availability:\n> ")
            print("\n[System] Consulting Agent 1...")
            
            result = run_agent1(user_input)
            print("\n" + result)
            
        elif choice == '2':
            user_input = input("\nEnter the workout split to analyze, along with your goals and any dietary restrictions:\n> ")
            print("\n[System] Consulting Agent 2...")
            
            result = run_agent2(user_input)
            print("\n" + result)
            
            export_to_pdf(result)
            
        elif choice == '3':
            print("\nExiting The Athlete's Blueprint.")
            break
            
        else:
            print("\nInvalid input. Please select 1, 2, or 3.")

if __name__ == "__main__":
    main()