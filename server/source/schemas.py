from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


# ============= AUTH SCHEMAS =============

class UserRegister(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: str = Field(default="patient", pattern="^(patient|doctor|admin)$")


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    user: "UserResponse"


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    medical_history: Optional[dict] = None

    class Config:
        from_attributes = True


# ============= MEDICAL HISTORY SCHEMAS =============

class MedicalHistoryUpdate(BaseModel):
    patient_id: Optional[str] = None
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    blood_type: Optional[str] = None
    chronic_conditions: Optional[List[dict]] = None
    allergies: Optional[List[str]] = None
    current_medications: Optional[List[dict]] = None


# ============= PREDIAGNOSIS SCHEMAS =============

class PrediagnosisRequest(BaseModel):
    symptoms: List[str] = Field(..., min_items=1)
    conversation_id: Optional[str] = None


class PrediagnosisResponse(BaseModel):
    id: int
    conversation_id: str
    patient_id: int
    potential_diseases: str
    course_of_action: str
    support_messages: str
    recommended_practitioners: str
    created_at: datetime

    class Config:
        from_attributes = True


# ============= CONVERSATION SCHEMAS =============

class ConversationCreate(BaseModel):
    title: Optional[str] = "New Conversation"


class ConversationResponse(BaseModel):
    id: str
    patient_id: int
    doctor_id: Optional[int] = None
    title: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ConversationWithMessages(ConversationResponse):
    messages: List["MessageResponse"] = []
    pre_diagnoses: List[PrediagnosisResponse] = []


# ============= MESSAGE SCHEMAS =============

class MessageCreate(BaseModel):
    content: str = Field(..., min_length=1)
    role: str = Field(default="user", pattern="^(user|assistant|system)$")


class MessageResponse(BaseModel):
    id: int
    conversation_id: str
    sender_id: int
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


# ============= DOCTOR ASSIGNMENT SCHEMA =============

class DoctorAssignment(BaseModel):
    doctor_id: int
