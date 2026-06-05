from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
import os

from database import db
from ml import model
from utils import sms

db.init_db()

app = FastAPI(title="Dropout Predictor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class StudentBase(BaseModel):
    student_id: str
    attendance_rate: float
    quiz_average: float
    assignment_rate: float
    mobile_engagement: int
    financial_aid: int

class StudentCreate(StudentBase):
    pass

class StudentResponse(StudentBase):
    risk_score: float
    is_flagged: bool
    top_factor_1: Optional[str]
    top_factor_2: Optional[str]

    class Config:
        from_attributes = True

@app.get("/api/students", response_model=List[StudentResponse])
def get_students(skip: int = 0, limit: int = 100, database: Session = Depends(db.get_db)):
    students = database.query(db.Student).offset(skip).limit(limit).all()
    return students

@app.post("/api/students/predict", response_model=StudentResponse)
def predict_student_risk(student: StudentCreate, database: Session = Depends(db.get_db)):
    features = [
        student.attendance_rate,
        student.quiz_average,
        student.assignment_rate,
        student.mobile_engagement,
        student.financial_aid
    ]
    
    prediction = model.predict_risk(features)
    
    db_student = db.Student(
        student_id=student.student_id,
        attendance_rate=student.attendance_rate,
        quiz_average=student.quiz_average,
        assignment_rate=student.assignment_rate,
        mobile_engagement=student.mobile_engagement,
        financial_aid=student.financial_aid,
        risk_score=prediction['risk_score'],
        is_flagged=prediction['is_flagged']
    )
    
    if len(prediction['top_factors']) > 0:
        db_student.top_factor_1 = prediction['top_factors'][0]['feature']
    if len(prediction['top_factors']) > 1:
        db_student.top_factor_2 = prediction['top_factors'][1]['feature']
        
    database.add(db_student)
    database.commit()
    database.refresh(db_student)
    
    return db_student

@app.post("/api/alerts/trigger")
def trigger_alert(student_id: str, phone_number: str = "+233555555555", database: Session = Depends(db.get_db)):
    student = database.query(db.Student).filter(db.Student.student_id == student_id).first()
    if not student:
        return {"error": "Student not found"}
        
    factors = f"{student.top_factor_1}, {student.top_factor_2}"
    result = sms.send_alert(phone_number, student_id, factors)
    
    log = db.CounsellorLog(
        student_id=student_id,
        action_taken="Sent SMS Alert",
        sms_sent=(result.get("status") != "error")
    )
    database.add(log)
    database.commit()
    
    return {"status": "success", "sms_result": result}
