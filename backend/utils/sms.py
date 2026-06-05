import os
import africastalking

USERNAME = os.environ.get("AT_USERNAME", "sandbox")
API_KEY = os.environ.get("AT_API_KEY", "dummy_key")

africastalking.initialize(USERNAME, API_KEY)
sms = africastalking.SMS

def send_alert(phone_number, student_id, risk_factors):
    message = f"Alert: Student {student_id} flagged HIGH RISK. Top factors: {risk_factors}. Please review."
    
    try:
        if API_KEY == "dummy_key":
            print(f"[MOCK SMS] To: {phone_number} | Message: {message}")
            return {"status": "mock_success", "message": message}
            
        response = sms.send(message, [phone_number])
        print(f"SMS sent successfully: {response}")
        return response
    except Exception as e:
        print(f"Failed to send SMS: {e}")
        return {"status": "error", "message": str(e)}
