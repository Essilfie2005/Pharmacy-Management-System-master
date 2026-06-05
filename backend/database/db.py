from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
import datetime
import os

# Default to SQLite if MySQL is not set up
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./students.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String(50), unique=True, index=True)
    attendance_rate = Column(Float)
    quiz_average = Column(Float)
    assignment_rate = Column(Float)
    mobile_engagement = Column(Integer)
    financial_aid = Column(Integer)
    
    # ML Outputs
    risk_score = Column(Float, default=0.0)
    is_flagged = Column(Boolean, default=False)
    
    # SHAP top factor cache for quick access
    top_factor_1 = Column(String(100), nullable=True)
    top_factor_2 = Column(String(100), nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class CounsellorLog(Base):
    __tablename__ = "counsellor_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String(50), index=True)
    action_taken = Column(String(255))
    sms_sent = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
