from sqlalchemy.orm import Session
from datetime import datetime
from . import models
from typing import Optional, List
import uuid


# ============= USER OPERATIONS =============

def create_user(
    db: Session,
    name: str,
    email: str,
    hashed_password: str,
    role: models.UserRole = models.UserRole.PATIENT,
    medical_history: Optional[dict] = None
) -> models.User:
    """Create a new user (patient, doctor, or admin)"""
    db_user = models.User(
        name=name,
        email=email,
        hashed_password=hashed_password,
        role=role,
        medical_history=medical_history
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    """Get user by email (for login)"""
    return db.query(models.User).filter(models.User.email == email).first()


def get_user_by_id(db: Session, user_id: int) -> Optional[models.User]:
    """Get user by ID"""
    return db.query(models.User).filter(models.User.id == user_id).first()


def update_user_medical_history(db: Session, user_id: int, medical_history: dict) -> models.User:
    """Update patient's medical history"""
    user = get_user_by_id(db, user_id)
    if user:
        user.medical_history = medical_history
        db.commit()
        db.refresh(user)
    return user


# ============= CONVERSATION OPERATIONS =============

def create_conversation(
    db: Session,
    patient_id: int,
    title: str = "New Conversation",
    doctor_id: Optional[int] = None
) -> models.Conversation:
    """Create a new conversation for a patient"""
    conversation_id = str(uuid.uuid4())
    db_conversation = models.Conversation(
        id=conversation_id,
        patient_id=patient_id,
        doctor_id=doctor_id,
        title=title
    )
    db.add(db_conversation)
    db.commit()
    db.refresh(db_conversation)
    return db_conversation


def get_conversation_by_id(db: Session, conversation_id: str) -> Optional[models.Conversation]:
    """Get conversation by ID with all related data"""
    return db.query(models.Conversation).filter(models.Conversation.id == conversation_id).first()


def get_user_conversations(db: Session, user_id: int, limit: int = 50) -> List[models.Conversation]:
    """Get all conversations for a patient"""
    return db.query(models.Conversation)\
        .filter(models.Conversation.patient_id == user_id)\
        .order_by(models.Conversation.updated_at.desc())\
        .limit(limit)\
        .all()


def assign_doctor_to_conversation(db: Session, conversation_id: str, doctor_id: int) -> models.Conversation:
    """Assign a doctor to a conversation"""
    conversation = get_conversation_by_id(db, conversation_id)
    if conversation:
        conversation.doctor_id = doctor_id
        conversation.updated_at = datetime.now()
        db.commit()
        db.refresh(conversation)
    return conversation


def remove_doctor_from_conversation(db: Session, conversation_id: str) -> models.Conversation:
    conversation = get_conversation_by_id(db=db, conversation_id=conversation_id)

    if conversation and conversation.doctor_id:
        conversation.doctor_id = None
        conversation.updated_at = datetime.now()
        db.commit()
        db.refresh(conversation)
    return conversation


def update_conversation_title(db: Session, conversation_id: str, title: str) -> models.Conversation:
    """Update conversation title"""
    conversation = get_conversation_by_id(db, conversation_id)
    if conversation:
        conversation.title = title
        conversation.updated_at = datetime.now()
        db.commit()
        db.refresh(conversation)
    return conversation


# ============= MESSAGE OPERATIONS =============

def create_message(
    db: Session,
    conversation_id: str,
    sender_id: int,
    role: models.MessageRole,
    content: str
) -> models.Message:
    """Add a message to a conversation"""
    db_message = models.Message(
        conversation_id=conversation_id,
        sender_id=sender_id,
        role=role,
        content=content
    )
    db.add(db_message)

    # Update conversation timestamp
    conversation = get_conversation_by_id(db, conversation_id)
    if conversation:
        conversation.updated_at = datetime.now()

    db.commit()
    db.refresh(db_message)
    return db_message


def get_conversation_messages(
    db: Session,
    conversation_id: str,
    limit: Optional[int] = None
) -> List[models.Message]:
    """Get all messages in a conversation"""
    query = db.query(models.Message)\
        .filter(models.Message.conversation_id == conversation_id)\
        .order_by(models.Message.created_at.asc())

    if limit:
        query = query.limit(limit)

    return query.all()


def get_latest_messages(db: Session, conversation_id: str, count: int = 10) -> List[models.Message]:
    """Get the latest N messages from a conversation"""
    return db.query(models.Message)\
        .filter(models.Message.conversation_id == conversation_id)\
        .order_by(models.Message.created_at.desc())\
        .limit(count)\
        .all()


# ============= PREDIAGNOSIS OPERATIONS =============

def create_prediagnosis(
    db: Session,
    conversation_id: str,
    patient_id: int,
    doctor_id: int,
    potential_diseases: str,
    course_of_action: str,
    therapy_message: Optional[str] = None,
    recommended_practitioners: Optional[str] = None
) -> models.PreDiagnosis:
    """Create a pre-diagnosis for a conversation"""
    db_prediagnosis = models.PreDiagnosis(
        conversation_id=conversation_id,
        patient_id=patient_id,
        doctor_id=doctor_id,
        potential_diseases=potential_diseases,
        course_of_action=course_of_action,
        support_messages=therapy_message,
        recommended_practitioners=recommended_practitioners
    )
    db.add(db_prediagnosis)
    db.commit()
    db.refresh(db_prediagnosis)
    return db_prediagnosis


def get_prediagnosis_by_conversation(db: Session, conversation_id: str) -> Optional[models.PreDiagnosis]:
    """Get the pre-diagnosis for a conversation"""
    return db.query(models.PreDiagnosis)\
        .filter(models.PreDiagnosis.conversation_id == conversation_id)\
        .order_by(models.PreDiagnosis.created_at.desc())\
        .first()


def get_all_prediagnoses_by_conversation(db: Session, conversation_id: str) -> List[models.PreDiagnosis]:
    """Get all pre-diagnoses for a conversation (in case of multiple)"""
    return db.query(models.PreDiagnosis)\
        .filter(models.PreDiagnosis.conversation_id == conversation_id)\
        .order_by(models.PreDiagnosis.created_at.desc())\
        .all()


def update_prediagnosis(
    db: Session,
    prediagnosis_id: int,
    potential_diseases: Optional[str] = None,
    course_of_action: Optional[str] = None,
    therapy_message: Optional[str] = None,
    recommended_practitioners: Optional[str] = None
) -> models.PreDiagnosis:
    """Update a pre-diagnosis"""
    prediagnosis = db.query(models.PreDiagnosis)\
        .filter(models.PreDiagnosis.id == prediagnosis_id)\
        .first()

    if prediagnosis:
        if potential_diseases is not None:
            prediagnosis.potential_diseases = potential_diseases
        if course_of_action is not None:
            prediagnosis.course_of_action = course_of_action
        if therapy_message is not None:
            prediagnosis.support_messages = therapy_message
        if recommended_practitioners is not None:
            prediagnosis.recommended_practitioners = recommended_practitioners

        db.commit()
        db.refresh(prediagnosis)

    return prediagnosis


def get_patient_prediagnoses(db: Session, patient_id: int, limit: int = 10) -> List[models.PreDiagnosis]:
    """Get all pre-diagnoses for a patient"""
    return db.query(models.PreDiagnosis)\
        .filter(models.PreDiagnosis.patient_id == patient_id)\
        .order_by(models.PreDiagnosis.created_at.desc())\
        .limit(limit)\
        .all()
