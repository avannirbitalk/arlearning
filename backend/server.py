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


# ==========================
# Materi & Kuis Models
# ==========================

class Course(BaseModel):
  id: str
  title: str
  description: str | None = None


class CourseCreate(BaseModel):
  title: str
  description: str | None = None


class ChapterSection(BaseModel):
  type: str
  content: str | None = None  # text: markdown/HTML, image: base64, 3d: glb asset id, quiz: quiz id
  glb_id: str | None = None
  quiz_id: str | None = None


class Chapter(BaseModel):
  id: str
  course_id: str
  title: str
  order: int = 0
  sections: List[ChapterSection] = []


class ChapterCreate(BaseModel):
  course_id: str
  title: str
  order: int = 0
  sections: List[ChapterSection] = []


class QuizOption(BaseModel):
  key: str
  text: str


class QuizQuestion(BaseModel):
  id: str
  question: str
  options: List[QuizOption]
  correct_key: str


class Quiz(BaseModel):
  id: str
  title: str
  questions: List[QuizQuestion]


class QuizCreate(BaseModel):
  title: str
  questions: List[QuizQuestion]


class QuizAnswer(BaseModel):
  question_id: str
  choice_key: str


class QuizAttemptRequest(BaseModel):
  answers: List[QuizAnswer]


class QuizAttemptResult(BaseModel):
  score: int
  correct_count: int
  total: int


# ==========================
# Materi & Kuis Routes
# ==========================

@api_router.get("/courses", response_model=List[Course])
async def list_courses():
  docs = await db.courses.find().to_list(100)
  return [Course(id=str(d["_id"]), title=d["title"], description=d.get("description")) for d in docs]


@api_router.post("/courses", response_model=Course)
async def create_course(payload: CourseCreate):
  doc = {"title": payload.title, "description": payload.description}
  res = await db.courses.insert_one(doc)
  return Course(id=str(res.inserted_id), title=payload.title, description=payload.description)


@api_router.get("/chapters/{chapter_id}", response_model=Chapter)
async def get_chapter(chapter_id: str):
  from bson import ObjectId

  doc = await db.chapters.find_one({"_id": ObjectId(chapter_id)})
  if not doc:
    raise HTTPException(status_code=404, detail="Bab tidak ditemukan")

  sections = [ChapterSection(**s) for s in doc.get("sections", [])]
  return Chapter(
    id=str(doc["_id"]),
    course_id=str(doc["course_id"]),
    title=doc["title"],
    order=doc.get("order", 0),
    sections=sections,
  )


@api_router.post("/chapters", response_model=Chapter)
async def create_chapter(payload: ChapterCreate):
  from bson import ObjectId

  doc = {
    "course_id": ObjectId(payload.course_id),
    "title": payload.title,
    "order": payload.order,
    "sections": [s.dict() for s in payload.sections],
  }
  res = await db.chapters.insert_one(doc)
  return Chapter(
    id=str(res.inserted_id),
    course_id=payload.course_id,
    title=payload.title,
    order=payload.order,
    sections=payload.sections,
  )


@api_router.get("/quizzes/{quiz_id}", response_model=Quiz)
async def get_quiz(quiz_id: str):
  from bson import ObjectId

  doc = await db.quizzes.find_one({"_id": ObjectId(quiz_id)})
  if not doc:
    raise HTTPException(status_code=404, detail="Kuis tidak ditemukan")

  questions = [QuizQuestion(**q) for q in doc.get("questions", [])]
  return Quiz(id=str(doc["_id"]), title=doc["title"], questions=questions)


@api_router.post("/quizzes", response_model=Quiz)
async def create_quiz(payload: QuizCreate):
  doc = {
    "title": payload.title,
    "questions": [q.dict() for q in payload.questions],
  }
  res = await db.quizzes.insert_one(doc)
  return Quiz(id=str(res.inserted_id), title=payload.title, questions=payload.questions)


@api_router.post("/quizzes/{quiz_id}/attempts", response_model=QuizAttemptResult)
async def attempt_quiz(quiz_id: str, payload: QuizAttemptRequest):
  from bson import ObjectId

  doc = await db.quizzes.find_one({"_id": ObjectId(quiz_id)})
  if not doc:
    raise HTTPException(status_code=404, detail="Kuis tidak ditemukan")

  questions = [QuizQuestion(**q) for q in doc.get("questions", [])]
  total = len(questions)

  correct = 0
  answer_map = {a.question_id: a.choice_key for a in payload.answers}

  for q in questions:
    if answer_map.get(q.id) == q.correct_key:
      correct += 1

  score = int(correct / total * 100) if total > 0 else 0

  return QuizAttemptResult(score=score, correct_count=correct, total=total)

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
