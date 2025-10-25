from fastapi import FastAPI, Depends, HTTPException, status, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional, List

from .database import models, operations, auth as auth_module
from .database.models import get_db
from .ml_models.suggestions import generate_prediagnosis
from . import schemas

# Initialize FastAPI app
router = APIRouter()

app = FastAPI(
    title="Fast Aid API",
    description="Medical prediagnosis and consultation API",
    version="1.0.0"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# ============= DEPENDENCY FUNCTIONS =============


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> models.User:
    """Extract and verify current user from JWT token"""
    token = credentials.credentials
    user = auth_module.get_user_from_token(db, token)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


def get_current_patient(current_user: models.User = Depends(get_current_user)) -> models.User:
    """Ensure current user is a patient"""
    if current_user.role != models.UserRole.PATIENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Patient role required."
        )
    return current_user


def get_current_doctor(current_user: models.User = Depends(get_current_user)) -> models.User:
    """Ensure current user is a doctor"""
    if current_user.role != models.UserRole.DOCTOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Doctor role required."
        )
    return current_user


# ============= HEALTH CHECK =============

@router.get("/", tags=["Health"])
def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Fast Aid API"}


# ============= AUTHENTICATION ENDPOINTS =============

@router.post("/auth/register", response_model=schemas.UserResponse, tags=["Authentication"])
def register(user_data: schemas.UserRegister, db: Session = Depends(get_db)):
    """Register a new user (patient, doctor, or admin)"""
    # Check if user already exists
    existing_user = operations.get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Convert role string to enum
    role_map = {
        "patient": models.UserRole.PATIENT,
        "doctor": models.UserRole.DOCTOR,
        "admin": models.UserRole.ADMIN
    }
    role = role_map.get(user_data.role, models.UserRole.PATIENT)

    # Register user
    user = auth_module.register_user(
        db=db,
        name=user_data.name,
        email=user_data.email,
        password=user_data.password,
        role=role
    )

    return user


@router.post("/auth/login", response_model=schemas.Token, tags=["Authentication"])
def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    """Login and receive JWT access token"""
    result = auth_module.login(db, credentials.email, credentials.password)

    if not result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return result


@router.get("/auth/me", response_model=schemas.UserResponse, tags=["Authentication"])
def get_current_user_info(current_user: models.User = Depends(get_current_user)):
    """Get current authenticated user information"""
    return current_user


# ============= USER & MEDICAL HISTORY ENDPOINTS =============

@router.get("/users/{user_id}", response_model=schemas.UserResponse, tags=["Users"])
def get_user(
    user_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user by ID (patients can only view their own profile)"""
    # Patients can only view their own profile
    if current_user.role == models.UserRole.PATIENT and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )

    user = operations.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return user


@router.put("/users/{user_id}/medical-history", response_model=schemas.UserResponse, tags=["Users"])
def update_medical_history(
    user_id: int,
    medical_history: schemas.MedicalHistoryUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update patient's medical history"""
    # Patients can only update their own medical history
    if current_user.role == models.UserRole.PATIENT and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )

    user = operations.update_user_medical_history(
        db, user_id, medical_history.model_dump(exclude_unset=True)
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return user


# ============= CONVERSATION ENDPOINTS =============

@router.post("/conversations", response_model=schemas.ConversationResponse, tags=["Conversations"])
def create_conversation(
    conversation_data: schemas.ConversationCreate,
    current_user: models.User = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    """Create a new conversation (patients only)"""
    conversation = operations.create_conversation(
        db=db,
        patient_id=current_user.id,
        title=conversation_data.title
    )
    return conversation


@router.get("/conversations", response_model=List[schemas.ConversationResponse], tags=["Conversations"])
def get_my_conversations(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 50
):
    """Get all conversations for the current user"""
    conversations = operations.get_user_conversations(db, current_user.id, limit)
    return conversations


@router.get("/conversations/{conversation_id}", response_model=schemas.ConversationWithMessages, tags=["Conversations"])
def get_conversation(
    conversation_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific conversation with all messages and prediagnoses"""
    conversation = operations.get_conversation_by_id(db, conversation_id)

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )

    # Check access: patient must own conversation, doctor must be assigned
    if current_user.role == models.UserRole.PATIENT:
        if conversation.patient_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
    elif current_user.role == models.UserRole.DOCTOR:
        if conversation.doctor_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )

    return conversation


@router.put("/conversations/{conversation_id}/assign-doctor", response_model=schemas.ConversationResponse, tags=["Conversations"])
def assign_doctor(
    conversation_id: str,
    assignment: schemas.DoctorAssignment,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Assign a doctor to a conversation (admin only, or patient can assign)"""
    conversation = operations.get_conversation_by_id(db, conversation_id)

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )

    # Only patient or admin can assign doctor
    if current_user.role == models.UserRole.PATIENT:
        if conversation.patient_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
    elif current_user.role != models.UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only patient or admin can assign doctors"
        )

    # Verify the doctor exists and has doctor role
    doctor = operations.get_user_by_id(db, assignment.doctor_id)
    if not doctor or doctor.role != models.UserRole.DOCTOR:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid doctor ID"
        )

    updated_conversation = operations.assign_doctor_to_conversation(
        db, conversation_id, assignment.doctor_id
    )

    return updated_conversation


# ============= MESSAGE ENDPOINTS =============

@router.post("/conversations/{conversation_id}/messages", response_model=schemas.MessageResponse, tags=["Messages"])
def create_message(
    conversation_id: str,
    message_data: schemas.MessageCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a message to a conversation"""
    conversation = operations.get_conversation_by_id(db, conversation_id)

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )

    # Verify access
    if current_user.role == models.UserRole.PATIENT:
        if conversation.patient_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
    elif current_user.role == models.UserRole.DOCTOR:
        if conversation.doctor_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )

    # Convert role string to enum
    role_map = {
        "user": models.MessageRole.USER,
        "assistant": models.MessageRole.ASSISTANT,
        "system": models.MessageRole.SYSTEM
    }
    role = role_map.get(message_data.role, models.MessageRole.USER)

    message = operations.create_message(
        db=db,
        conversation_id=conversation_id,
        sender_id=current_user.id,
        role=role,
        content=message_data.content
    )

    return message


@router.get("/conversations/{conversation_id}/messages", response_model=List[schemas.MessageResponse], tags=["Messages"])
def get_messages(
    conversation_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: Optional[int] = None
):
    """Get all messages in a conversation"""
    conversation = operations.get_conversation_by_id(db, conversation_id)

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )

    # Verify access
    if current_user.role == models.UserRole.PATIENT:
        if conversation.patient_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
    elif current_user.role == models.UserRole.DOCTOR:
        if conversation.doctor_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )

    messages = operations.get_conversation_messages(db, conversation_id, limit)
    return messages


# ============= PREDIAGNOSIS ENDPOINTS =============

@router.post("/prediagnosis", response_model=schemas.PrediagnosisResponse, tags=["Prediagnosis"])
def create_prediagnosis(
    request: schemas.PrediagnosisRequest,
    current_user: models.User = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    """Generate a prediagnosis using AI (patients only)"""
    # Build patient data
    patient_data = {
        "symptoms": request.symptoms,
        "duration": request.duration,
        "age": request.age or current_user.medical_history.get("age") if current_user.medical_history else None
    }

    # Get medical history
    medical_history = current_user.medical_history

    # Generate prediagnosis using AI
    ai_result = generate_prediagnosis(patient_data, medical_history)

    if not ai_result:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate prediagnosis"
        )

    # Create or get conversation
    conversation_id = request.conversation_id
    if not conversation_id:
        conversation = operations.create_conversation(
            db=db,
            patient_id=current_user.id,
            title=f"Symptoms: {', '.join(request.symptoms[:3])}"
        )
        conversation_id = conversation.id
    else:
        # Verify conversation exists and belongs to user
        conversation = operations.get_conversation_by_id(db, conversation_id)
        if not conversation or conversation.patient_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )

    # Store prediagnosis in database
    # Note: doctor_id is set to patient_id for now since it's AI-generated
    prediagnosis = operations.create_prediagnosis(
        db=db,
        conversation_id=conversation_id,
        patient_id=current_user.id,
        doctor_id=current_user.id,  # Temporary: AI-generated
        potential_diseases=ai_result["potential_diseases"],
        course_of_action=ai_result["course_of_action"],
        therapy_message=ai_result.get("support_messages"),
        recommended_practitioners=ai_result.get("recommended_practitioners")
    )

    return prediagnosis


@router.get("/prediagnosis/my", response_model=List[schemas.PrediagnosisResponse], tags=["Prediagnosis"])
def get_my_prediagnoses(
    current_user: models.User = Depends(get_current_patient),
    db: Session = Depends(get_db),
    limit: int = 10
):
    """Get all prediagnoses for the current patient"""
    prediagnoses = operations.get_patient_prediagnoses(db, current_user.id, limit)
    return prediagnoses


@router.get("/conversations/{conversation_id}/prediagnosis", response_model=schemas.PrediagnosisResponse, tags=["Prediagnosis"])
def get_conversation_prediagnosis(
    conversation_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the prediagnosis for a specific conversation"""
    conversation = operations.get_conversation_by_id(db, conversation_id)

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )

    # Verify access
    if current_user.role == models.UserRole.PATIENT:
        if conversation.patient_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
    elif current_user.role == models.UserRole.DOCTOR:
        if conversation.doctor_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )

    prediagnosis = operations.get_prediagnosis_by_conversation(db, conversation_id)

    if not prediagnosis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No prediagnosis found for this conversation"
        )

    return prediagnosis


# Include router with /api prefix after all routes are defined
app.include_router(router, prefix='/api')
