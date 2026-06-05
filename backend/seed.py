import pandas as pd
import os
from database.db import SessionLocal, Student, init_db
from ml.model import predict_risk

def seed_database():
    init_db()
    db = SessionLocal()
    
    # Check if already seeded
    if db.query(Student).count() > 0:
        print("Database already seeded. Skipping.")
        db.close()
        return

    csv_path = os.path.join(os.path.dirname(__file__), "data", "synthetic_students.csv")
    if not os.path.exists(csv_path):
        print(f"File not found: {csv_path}")
        return
        
    df = pd.read_csv(csv_path)
    print(f"Seeding {len(df)} students into database...")
    
    students_to_add = []
    
    for index, row in df.iterrows():
        features = [
            row['attendance_rate'],
            row['quiz_average'],
            row['assignment_rate'],
            row['mobile_engagement'],
            row['financial_aid']
        ]
        
        # Predict risk and generate SHAP
        prediction = predict_risk(features)
        
        db_student = Student(
            student_id=row['student_id'],
            attendance_rate=row['attendance_rate'],
            quiz_average=row['quiz_average'],
            assignment_rate=row['assignment_rate'],
            mobile_engagement=row['mobile_engagement'],
            financial_aid=row['financial_aid'],
            risk_score=prediction['risk_score'],
            is_flagged=prediction['is_flagged']
        )
        
        if len(prediction['top_factors']) > 0:
            db_student.top_factor_1 = prediction['top_factors'][0]['feature']
        if len(prediction['top_factors']) > 1:
            db_student.top_factor_2 = prediction['top_factors'][1]['feature']
            
        students_to_add.append(db_student)
        
    db.add_all(students_to_add)
    db.commit()
    db.close()
    print("Seeding complete!")

if __name__ == "__main__":
    seed_database()
