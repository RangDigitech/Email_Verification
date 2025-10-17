import os
import json
import uuid
import tempfile
import asyncio
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import HTMLResponse, FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
# main.py
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

# Import everything we just created
import models
import schemas
import security
from database import SessionLocal, engine

# This creates the 'users' table in your database if it doesn't exist
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Email Verifier – Async", version="3.0")
JOBS = {}

# CORS configuration - development friendly
# For local development we'll allow all origins. Replace with explicit origins in production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change this to your exact frontend origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Dependency to get a database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- AUTHENTICATION ENDPOINTS ---

@app.post("/register", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = security.get_password_hash(user.password)
    db_user = models.User(
        email=user.email, 
        hashed_password=hashed_password,
        first_name=user.first_name,
        last_name=user.last_name
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/login", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = security.create_access_token(
        data={"sub": user.email}
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/")
async def root():
    return {"status": "ok", "message": "Welcome to the Email Verifier API"}

@app.post("/validate-email")
async def validate_email(email: str = Form(...), smtp: bool = Form(True), smtp_from: str = Form("noreply@example.com")):
    try:
        from app import validate_single_async, connect_db, init_db
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": f"import error: {e}"})

    db = connect_db("")
    init_db(db)
    smtp_flag = (str(smtp).lower() == "true") or (smtp is True)
    try:
        res = await validate_single_async(email, smtp_from, db, smtp_flag)
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": f"Validation failed: {e}"})
    return {"result": res}

@app.post("/validate-file")
async def validate_file(file: UploadFile = File(...), smtp: bool = Form(True),
                        smtp_from: str = Form("noreply@example.com"), workers: int = Form(12)):
    try:
        from app import load_emails_from_csv, validate_many_async, write_outputs
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": f"import error: {e}"})

    jobid = uuid.uuid4().hex
    tmp_input = os.path.join(tempfile.gettempdir(), f"{jobid}.csv")
    outdir = os.path.join(tempfile.gettempdir(), f"results_{jobid}")
    os.makedirs(outdir, exist_ok=True)

    try:
        with open(tmp_input, "wb") as f:
            f.write(await file.read())
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": f"save upload failed: {e}"})

    emails = load_emails_from_csv(tmp_input)
    smtp_flag = (str(smtp).lower() == "true") or (smtp is True)

    try:
        workers_val = int(workers) if int(workers) > 0 else 12
    except Exception:
        workers_val = 12

    try:
        results = await validate_many_async(emails, smtp_from, smtp_flag, workers_val)
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": f"run failed: {e}"})

    try:
        write_outputs(results, outdir)
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": f"write failed: {e}"})

    JOBS[jobid] = outdir
    return {
        "jobid": jobid,
        "results": {"results": results},
        "files": {
            "results_json": f"/download/{jobid}/results.json",
            "results_csv": f"/download/{jobid}/results.csv",
        }
    }

@app.get("/download/{jobid}/{name}")
async def download(jobid: str, name: str):
    outdir = JOBS.get(jobid)
    if not outdir:
        return JSONResponse(status_code=404, content={"error": "Job not found"})
    path = os.path.join(outdir, name)
    if not os.path.exists(path):
        return JSONResponse(status_code=404, content={"error": "File not found"})
    if name not in ["results.csv","results.json"]:
        return JSONResponse(status_code=400, content={"error": "Invalid filename"})
    media = "text/csv" if name.endswith(".csv") else "application/json"
    return FileResponse(path, media_type=media, filename=name,
                        headers={"Content-Disposition": f"attachment; filename={name}"})
