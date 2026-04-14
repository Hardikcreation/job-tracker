from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI()
api_router = APIRouter(prefix="/api")


class JobStatus(str, Enum):
    APPLIED = "Applied"
    INTERVIEW = "Interview"
    REJECTED = "Rejected"
    OFFER = "Offer"


class JobPlatform(str, Enum):
    LINKEDIN = "LinkedIn"
    NAUKRI = "Naukri"
    GLASSDOOR = "Glassdoor"
    INDEED = "Indeed"
    FOUNDIT = "FoundIt"
    CUTSHORT = "Cutshort"
    OTHER = "Other"


class JobCreate(BaseModel):
    company: str
    role: str
    platform: str
    status: JobStatus = JobStatus.APPLIED
    jobUrl: Optional[str] = None


class JobUpdate(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    platform: Optional[str] = None
    status: Optional[JobStatus] = None
    jobUrl: Optional[str] = None


class Job(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str
    company: str
    role: str
    platform: str
    status: JobStatus
    jobUrl: Optional[str] = None
    date: str


class Analytics(BaseModel):
    total: int
    applied: int
    interview: int
    rejected: int
    offer: int
    byPlatform: dict


@api_router.get("/")
async def root():
    return {"message": "Job Application Tracker API"}


@api_router.post("/jobs", response_model=Job)
async def create_job(job: JobCreate):
    job_dict = job.model_dump()
    job_dict["id"] = str(datetime.now(timezone.utc).timestamp()).replace(".", "")
    job_dict["date"] = datetime.now(timezone.utc).isoformat()

    await db.jobs.insert_one(job_dict)

    return Job(**job_dict)


@api_router.get("/jobs", response_model=List[Job])
async def get_jobs():
    jobs = await db.jobs.find({}, {"_id": 0}).to_list(1000)
    jobs.sort(key=lambda x: x.get("date", ""), reverse=True)
    return jobs


# Must be registered before GET /jobs/{job_id} so "analytics" is not treated as an id
@api_router.get("/jobs/analytics", response_model=Analytics)
async def get_analytics():
    jobs = await db.jobs.find({}, {"_id": 0}).to_list(1000)

    total = len(jobs)
    applied = sum(1 for j in jobs if j["status"] == JobStatus.APPLIED)
    interview = sum(1 for j in jobs if j["status"] == JobStatus.INTERVIEW)
    rejected = sum(1 for j in jobs if j["status"] == JobStatus.REJECTED)
    offer = sum(1 for j in jobs if j["status"] == JobStatus.OFFER)

    by_platform = {}
    for job in jobs:
        platform = job["platform"]
        by_platform[platform] = by_platform.get(platform, 0) + 1

    return Analytics(
        total=total,
        applied=applied,
        interview=interview,
        rejected=rejected,
        offer=offer,
        byPlatform=by_platform,
    )


@api_router.get("/jobs/{job_id}", response_model=Job)
async def get_job(job_id: str):
    job = await db.jobs.find_one({"id": job_id}, {"_id": 0})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return Job(**job)


@api_router.put("/jobs/{job_id}", response_model=Job)
async def update_job(job_id: str, job_update: JobUpdate):
    existing_job = await db.jobs.find_one({"id": job_id}, {"_id": 0})
    if not existing_job:
        raise HTTPException(status_code=404, detail="Job not found")

    update_dict = {k: v for k, v in job_update.model_dump().items() if v is not None}

    if update_dict:
        await db.jobs.update_one({"id": job_id}, {"$set": update_dict})

    updated_job = {**existing_job, **update_dict}
    return Job(**updated_job)


@api_router.delete("/jobs/{job_id}")
async def delete_job(job_id: str):
    result = await db.jobs.delete_one({"id": job_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"message": "Job deleted successfully"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
