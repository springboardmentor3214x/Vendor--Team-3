from passlib.context import CryptContext

from jose import jwt
from datetime import datetime, timedelta
from app.core.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

def hash_password(password: str):
<<<<<<< HEAD
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)
=======
    password = password[:72]
    return pwd_context.hash(password)

def verify_password(
    plain_password,
    hashed_password
):
    plain_password = plain_password[:72]

    return pwd_context.verify(
        plain_password,
        hashed_password
    )
>>>>>>> 84a41fe (Added contract management module with amendments documents milestones renewal and dashboard)



def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return encoded_jwt