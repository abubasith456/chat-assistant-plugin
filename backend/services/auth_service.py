"""
Authentication Service with MongoDB Integration
"""
import os
import logging
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
import bcrypt
from fastapi import HTTPException, status
from database.mongo_config import get_db
from database.models_simple import User, UserCreate, UserLogin, UserResponse, Token

# Configure logging
logger = logging.getLogger(__name__)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

class AuthService:
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password"""
        return pwd_context.hash(password)
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return pwd_context.verify(plain_password, hashed_password)
    
    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
        """Create JWT access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    async def verify_token(token: str) -> Optional[str]:
        """Verify JWT token and return user ID"""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id: str = payload.get("sub")
            if user_id is None:
                return None
            return user_id
        except JWTError:
            return None
    
    @staticmethod
    async def get_user_by_email(email: str) -> Optional[User]:
        """Get user by email"""
        db = get_db()
        user_doc = await db.users.find_one({"email": email})
        if user_doc:
            try:
                user_doc["_id"] = str(user_doc["_id"])  # Convert ObjectId to string
                return User(**user_doc)
            except Exception as e:
                logger.error(f"Error creating User object: {e}")
                return None
        return None
    
    @staticmethod
    async def get_user_by_id(user_id: str) -> Optional[User]:
        """Get user by ID"""
        from bson import ObjectId
        db = get_db()
        
        try:
            user_doc = await db.users.find_one({"_id": ObjectId(user_id)})
            if user_doc:
                user_doc["_id"] = str(user_doc["_id"])  # Convert ObjectId to string
                return User(**user_doc)
        except Exception as e:
            logger.error(f"Error getting user by ID: {e}")
        return None
    
    @staticmethod
    async def create_user(user_data: UserCreate) -> User:
        """Create a new user"""
        db = get_db()
        
        # Check if user already exists
        existing_user_doc = await db.users.find_one({"email": user_data.email})
        if existing_user_doc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create user document
        user_dict = {
            "name": user_data.name,
            "email": user_data.email,
            "hashed_password": AuthService.hash_password(user_data.password),
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        
        # Insert user
        result = await db.users.insert_one(user_dict)
        user_dict["_id"] = str(result.inserted_id)  # Convert ObjectId to string
        
        return User(**user_dict)
    
    @staticmethod
    async def authenticate_user(login_data: UserLogin) -> Optional[User]:
        """Authenticate user credentials"""
        user = await AuthService.get_user_by_email(login_data.email)
        if not user:
            return None
        
        if not AuthService.verify_password(login_data.password, user.hashed_password):
            return None
        
        # Update last login
        db = get_db()
        await db.users.update_one(
            {"_id": user.id},
            {"$set": {"last_login": datetime.utcnow()}}
        )
        
        return user
    
    @staticmethod
    async def login_user(login_data: UserLogin) -> Token:
        """Login user and return JWT token"""
        user = await AuthService.authenticate_user(login_data)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = AuthService.create_access_token(
            data={"sub": str(user.id)}, expires_delta=access_token_expires
        )
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )
    
    @staticmethod
    async def register_user(user_data: UserCreate) -> Token:
        """Register new user and return JWT token"""
        user = await AuthService.create_user(user_data)
        
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = AuthService.create_access_token(
            data={"sub": str(user.id)}, expires_delta=access_token_expires
        )
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )
    
    @staticmethod
    def user_to_response(user: User) -> UserResponse:
        """Convert User model to UserResponse"""
        return UserResponse(
            id=str(user.id),
            name=user.name,
            email=user.email,
            is_active=user.is_active,
            created_at=user.created_at,
            last_login=user.last_login
        )
