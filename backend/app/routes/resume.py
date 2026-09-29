from datetime import datetime, timezone
from pathlib import Path
import os, uuid
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from bson import ObjectId
from ..auth import get_current_user
from ..config import settings
from ..db import resumes, job_analyses
from ..services.parser import extract_text, clean_text, parse_resume
from ..services.skills import detect_skills
from ..services.analyzer import score_resume, match_job
from ..services.llm import generate_recommendations, generate_llm_job_analysis, llm_status

router=APIRouter(prefix="/api/resume", tags=["resume"])
BASE=Path(__file__).resolve().parents[2]/"uploads"
BASE.mkdir(parents=True,exist_ok=True)

@router.post("/upload", status_code=201)
async def upload(file:UploadFile=File(...), user=Depends(get_current_user)):
    ext=Path(file.filename or "").suffix.lower()
    if ext not in {".pdf",".docx"}: raise HTTPException(400,"Only PDF and DOCX resumes are supported")
    data=await file.read()
    if not data: raise HTTPException(400,"The uploaded file is empty")
    if len(data)>settings.max_upload_mb*1024*1024: raise HTTPException(413,f"File exceeds {settings.max_upload_mb} MB")
    uid=str(uuid.uuid4()); path=BASE/f"{user['id']}_{uid}{ext}"
    try:
        path.write_bytes(data); text=clean_text(extract_text(str(path)))
    except Exception as e:
        path.unlink(missing_ok=True); raise HTTPException(422,f"Could not parse the resume: {e}")
    if len(text)<80: path.unlink(missing_ok=True); raise HTTPException(422,"The resume contains too little readable text")
    parsed=parse_resume(text); skills=detect_skills(text); analysis=score_resume(text,parsed,skills)
    recs=generate_recommendations(text,parsed,analysis,settings)
    doc={"user_id":user["id"],"filename":file.filename,"stored_path":str(path),"extracted_text":text,"parsed_data":parsed,"skills":skills,"analysis":analysis,"recommendations":recs,"ai":llm_status(settings),"created_at":datetime.now(timezone.utc)}
    result=resumes.insert_one(doc)
    return {"id":str(result.inserted_id),"filename":file.filename,"score":analysis["overall"],"ats_score":analysis["ats"],"skills":skills,"ai":doc["ai"]}

@router.get("")
def list_resumes(user=Depends(get_current_user)):
    items=[]
    for r in resumes.find({"user_id":user["id"]}).sort("created_at",-1):
        items.append({"id":str(r["_id"]),"filename":r["filename"],"score":r.get("analysis",{}).get("overall",0),"ats_score":r.get("analysis",{}).get("ats",0),"created_at":r["created_at"],"ai":r.get("ai",{"provider":"local"})})
    return items

@router.get("/{resume_id}")
def get_resume(resume_id:str,user=Depends(get_current_user)):
    try:r=resumes.find_one({"_id":ObjectId(resume_id),"user_id":user["id"]})
    except: r=None
    if not r: raise HTTPException(404,"Resume not found")
    r["id"]=str(r.pop("_id")); r.pop("stored_path",None); r.pop("extracted_text",None)
    return r

@router.delete("/{resume_id}")
def delete_resume(resume_id:str,user=Depends(get_current_user)):
    try:r=resumes.find_one({"_id":ObjectId(resume_id),"user_id":user["id"]})
    except: r=None
    if not r: raise HTTPException(404,"Resume not found")
    try: Path(r.get("stored_path","")).unlink(missing_ok=True)
    except: pass
    resumes.delete_one({"_id":r["_id"]}); job_analyses.delete_many({"resume_id":resume_id,"user_id":user["id"]})
    return {"message":"Resume deleted"}

@router.post("/{resume_id}/analyze")
def analyze(resume_id:str,user=Depends(get_current_user)):
    try:r=resumes.find_one({"_id":ObjectId(resume_id),"user_id":user["id"]})
    except:r=None
    if not r: raise HTTPException(404,"Resume not found")
    return {"id":resume_id,"analysis":r["analysis"],"skills":r["skills"],"parsed_data":{k:v for k,v in r["parsed_data"].items() if k!="raw_text"},"recommendations":r["recommendations"],"ai":r.get("ai")}

@router.post("/{resume_id}/job-match")
def job_match(resume_id:str, body:dict, user=Depends(get_current_user)):
    job=(body.get("jobDescription") or "").strip()
    if len(job)<50: raise HTTPException(400,"Please provide a job description with at least 50 characters")
    try:r=resumes.find_one({"_id":ObjectId(resume_id),"user_id":user["id"]})
    except:r=None
    if not r: raise HTTPException(404,"Resume not found")
    result=match_job(r["extracted_text"],job)
    llm=generate_llm_job_analysis(r["extracted_text"],job,settings)
    result["llm_analysis"]=llm; result["ai"]={"provider":"openai" if llm else "local","llm_used":bool(llm)}
    doc={"user_id":user["id"],"resume_id":resume_id,"job_description":job,"result":result,"created_at":datetime.now(timezone.utc)}
    saved=job_analyses.insert_one(doc)
    result["id"]=str(saved.inserted_id)
    return result
