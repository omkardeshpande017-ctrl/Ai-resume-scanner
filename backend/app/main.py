from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .routes import auth,resume,dashboard

app=FastAPI(title="AI Resume Scanner & Job Match Analyzer",version="1.0.0",docs_url="/docs")
app.add_middleware(CORSMiddleware,allow_origins=[settings.frontend_url,"http://localhost:5173"],allow_credentials=True,allow_methods=["*"],allow_headers=["*"])
app.include_router(auth.router); app.include_router(resume.router); app.include_router(dashboard.router)
@app.get("/api/health")
def health(): return {"status":"ok","service":"resume-scanner-api"}
