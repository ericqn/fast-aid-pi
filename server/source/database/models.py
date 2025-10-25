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


class PreDiagnosis(Base):
    __tablename__ = "prediagnoses"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(String(36), ForeignKey("conversations.id"), nullable=False)

    patient_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    doctor_id = Column(Integer, ForeignKey('users.id'), nullable=False)

    potential_diseases = Column(String)
    course_of_action = Column(String)
    support_messages = Column(String) # to be AI generated
    recommended_practitioners = Column(String)

    created_at = Column(DateTime, default=datetime.now)

    # Relationships
    conversation = relationship("Conversation", back_populates="pre_diagnoses")


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
