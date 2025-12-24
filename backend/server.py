from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List
import uuid
from datetime import datetime

from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import EmailStr
from typing import Optional
import smtplib
from email.mime.text import MIMEText
import random

# Environment variables for Supabase and email
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_BUCKET_UPLOADS = os.getenv("SUPABASE_BUCKET_UPLOADS", "uploads")
GMAIL_USER = os.getenv("GMAIL_USER")
GMAIL_PASS = os.getenv("GMAIL_PASS")

http_bearer = HTTPBearer(auto_error=False)






ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Healthcheck models (legacy)
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class StatusCheckCreate(BaseModel):
    client_name: str


# ==========================
# Email verification models
# ==========================

class EmailRequest(BaseModel):
    email: EmailStr


class EmailVerifyRequest(BaseModel):
    email: EmailStr
    code: str


# ==========================
# Helper functions
# ==========================

async def send_verification_email(email: str, code: str):
    if not GMAIL_USER or not GMAIL_PASS:
        logger.error("GMAIL_USER or GMAIL_PASS is not configured")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Konfigurasi email belum lengkap",
        )

    msg = MIMEText(
        f"Kode verifikasi e-learning AR Anda adalah: {code}\n\nJangan berikan kode ini kepada orang lain.",
        "plain",
        "utf-8",
    )
    msg["Subject"] = "Kode Verifikasi E-Learning AR"
    msg["From"] = GMAIL_USER
    msg["To"] = email

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(GMAIL_USER, GMAIL_PASS)
            server.send_message(msg)
        logger.info(f"Verification email sent to {email}")
    except Exception as e:
        logger.exception("Failed to send verification email")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Gagal mengirim email verifikasi",
        )


# ==========================
# Auth & verification routes
# ==========================

@api_router.post("/auth/register/request")
async def request_email_verification(payload: EmailRequest):
    """Generate kode verifikasi dan kirim via email."""
    code = "".join(str(random.randint(0, 9)) for _ in range(6))
    doc = {
        "email": payload.email,
        "code": code,
        "created_at": datetime.utcnow(),
    }
    await db.email_verifications.insert_one(doc)

    await send_verification_email(payload.email, code)

    return {"success": True}


@api_router.post("/auth/register/verify")
async def verify_email_code(payload: EmailVerifyRequest):
    """Verifikasi kode yang dikirim ke email."""
    record = await db.email_verifications.find_one(
        {"email": payload.email, "code": payload.code}
    )
    if not record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Kode verifikasi tidak valid",
        )

    # Optional: hapus semua kode lama untuk email ini
    await db.email_verifications.delete_many({"email": payload.email})

    return {"valid": True}


# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
