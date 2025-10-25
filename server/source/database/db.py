from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, ForeignKey, Float, Enum, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from sqlalchemy import create_engine
from datetime import datetime
import enum

engine = create_engine('sqlite:///database.db', echo=True)
Base = declarative_base()


# Enums for better type safety
class UserRole(enum.Enum):
    PATIENT = "patient"
    DOCTOR = "doctor"
    ADMIN = "admin"


class MessageRole(enum.Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class ConversationStatus(enum.Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class RecommendationType(enum.Enum):
    COURSE_OF_ACTION = "course_of_action"
    PRACTITIONER = "practitioner"
    THERAPEUTIC_MESSAGE = "therapeutic_message"
    LIFESTYLE_CHANGE = "lifestyle_change"


# User Management
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.PATIENT)

    # Medical info for patients
    medical_history = Column(JSON) # JSON array of conditions

    # Relationships
    conversations = relationship("Conversation", back_populates="patient", foreign_keys="Conversation.patient_id")
    doctor_notes = relationship("DoctorNote", back_populates="doctor")


# Conversation Management
class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String(36), primary_key=True, index=True)  # UUID
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    title = Column(String(255))

    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    # Relationships
    patient = relationship("User", foreign_keys=[patient_id])
    doctor = relationship("User", foreign_keys=[doctor_id])
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")
    pre_diagnoses = relationship("PreDiagnosis", back_populates="conversation", cascade="all, delete-orphan")
    diagnoses = relationship("Diagnosis", back_populates="conversation", cascade="all, delete-orphan")


# Message Storage
class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(String(36), ForeignKey("conversations.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey('users.id'), nullable=False)

    role = Column(Enum(MessageRole), nullable=False)
    content = Column(Text, nullable=False)

    created_at = Column(DateTime, default=datetime.now)

    # Relationships
    conversation = relationship("Conversation", back_populates="messages")


# Actual Diagnosis (from doctor)
class Diagnosis(Base):
    __tablename__ = "diagnoses"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(String(36), ForeignKey("conversations.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    condition_name = Column(String(255), nullable=False)
    description = Column(Text)

    # Treatment plan
    treatment_plan = Column(Text)
    prescribed_medications = Column(JSON)  # Array of medication objects
    follow_up_instructions = Column(Text)
    follow_up_date = Column(DateTime)

    # Status
    is_confirmed = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    # Relationships
    conversation = relationship("Conversation", back_populates="diagnoses")
    doctor_notes = relationship("DoctorNote", back_populates="diagnosis", cascade="all, delete-orphan")


# Doctor Notes and Highlights
class DoctorNote(Base):
    __tablename__ = "doctor_notes"

    id = Column(Integer, primary_key=True, index=True)
    diagnosis_id = Column(Integer, ForeignKey("diagnoses.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    note_type = Column(String(50))  # "annotation", "highlight", "comment", "remark"
    content = Column(Text, nullable=False)

    # For highlights - reference to specific text in patient notes
    highlighted_text = Column(Text)
    reference_field = Column(String(100))  # Which field was highlighted
    position_start = Column(Integer)
    position_end = Column(Integer)

    # Visibility
    is_visible_to_patient = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    # Relationships
    diagnosis = relationship("Diagnosis", back_populates="doctor_notes")
    doctor = relationship("User", back_populates="doctor_notes")


class PreDiagnosisSolution(Base):
    __tablename__ = "prediagnosis_solutions"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(String(36), ForeignKey("conversations.id"), nullable=False)

    patient_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    doctor_id = Column(Integer, ForeignKey('users.id'), nullable=False)

    potential_diseases = Column(String)
    course_of_action = Column(String)
    therapy_message = Column(String) # to be AI generated
    recommended_practitioners = Column(String)

    created_at = Column(DateTime, default=datetime.now)


# EHR Summary
class EHRSummary(Base):
    __tablename__ = "ehr_summaries"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(String(36), ForeignKey("conversations.id"), nullable=False, unique=True)

    # Summarized content
    summary_text = Column(Text, nullable=False)
    key_findings = Column(JSON)  # Array of key points

    # Medications summary
    medications_summary = Column(Text)
    medications_details = Column(JSON)  # Detailed medication info

    # Lab results
    lab_results_summary = Column(Text)
    lab_results = Column(JSON)

    # For specialist input
    specialist_notes = Column(Text)

    created_at = Column(DateTime, default=datetime.now())
    updated_at = Column(DateTime, default=datetime.now(), onupdate=datetime.now())

    # Relationships
    conversation = relationship("Conversation", back_populates="ehr_summary")


# Create all tables
Base.metadata.create_all(bind=engine)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Dependency for FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
