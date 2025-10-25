from datetime import datetime, timedelta
from typing import Optional
from passlib.context import CryptContext
import jwt
import os
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from . import models, operations

load_dotenv()

# Configuration
SECRET_KEY = os.getenv('SECRET_KEY')  # Change in production!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ============= PASSWORD FUNCTIONS =============

def hash_password(password: str) -> str:
    """Hash a plain password"""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)


# ============= JWT TOKEN FUNCTIONS =============

def create_access_token(user_id: int, email: str, role: str) -> str:
    """Create a JWT access token"""
    expire = datetime.now() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {
        "sub": str(user_id),  # subject (user ID)
        "email": email,
        "role": role,
        "exp": expire
    }
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    """Decode and verify a JWT token. Returns payload or None if invalid"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except Exception:
        return None


def get_user_from_token(db: Session, token: str) -> Optional[models.User]:
    """Extract user from JWT token"""
    payload = decode_access_token(token)
    if payload is None:
        return None

    user_id = int(payload.get("sub"))
    return operations.get_user_by_id(db, user_id)


# ============= AUTHENTICATION FUNCTIONS =============

def authenticate_user(db: Session, email: str, password: str) -> Optional[models.User]:
    """Authenticate a user with email and password. Returns user if valid, None otherwise"""
    user = operations.get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def register_user(
    db: Session,
    name: str,
    email: str,
    password: str,
    role: models.UserRole = models.UserRole.PATIENT
) -> models.User:
    """Register a new user (hashes password automatically)"""
    hashed_password = hash_password(password)
    return operations.create_user(
        db=db,
        name=name,
        email=email,
        hashed_password=hashed_password,
        role=role
    )


def login(db: Session, email: str, password: str) -> Optional[dict]:
    """
    Login a user and return access token + user info.
    Returns dict with token and user data, or None if authentication fails.
    """
    user = authenticate_user(db, email, password)
    if not user:
        return None

    token = create_access_token(
        user_id=user.id,
        email=user.email,
        role=user.role.value
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role.value
        }
    }
