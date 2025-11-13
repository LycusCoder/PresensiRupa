from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from .config import get_settings

# Setup password hashing (pake bcrypt)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

settings = get_settings()


def hash_kata_sandi(kata_sandi: str) -> str:
    """
    Hash password pake bcrypt.
    
    Args:
        kata_sandi: Password plain text dari user.
    
    Returns:
        Hash dari password.
    """
    return pwd_context.hash(kata_sandi)


def verify_kata_sandi(kata_sandi: str, hash_kata_sandi: str) -> bool:
    """
    Verify password pake bcrypt.
    
    Args:
        kata_sandi: Password plain text dari user.
        hash_kata_sandi: Hash yang disimpen di DB.
    
    Returns:
        True jika cocok, False jika nggak.
    """
    return pwd_context.verify(kata_sandi, hash_kata_sandi)


def buat_token_akses(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Generate JWT Access Token.
    
    Args:
        data: Data yang mau di-encode di dalam token (biasanya user_id).
        expires_delta: Durasi token. Kalo None, pake default dari config.
    
    Returns:
        JWT token string.
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def verify_token_akses(token: str) -> dict:
    """
    Verify JWT token dan return payload-nya.
    
    Args:
        token: JWT token dari header.
    
    Returns:
        Payload (biasanya ada user_id di sini).
    
    Raises:
        JWTError: Kalo token invalid atau expired.
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError:
        raise JWTError("Token tidak valid atau sudah expired")
