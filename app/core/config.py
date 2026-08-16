import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "vendor_reliability_super_secret_key")

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 30