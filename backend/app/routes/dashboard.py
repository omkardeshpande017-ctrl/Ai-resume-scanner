from fastapi import APIRouter, Depends
from ..auth import get_current_user
from ..db import resumes, job_analyses

router=APIRouter(prefix="/api/dashboard",tags=["dashboard"])
@router.get("")
def dashboard(user=Depends(get_current_user)):
    rs=list(resumes.find({"user_id":user["id"]}).sort("created_at",-1).limit(10))
    jobs=list(job_analyses.find({"user_id":user["id"]}).sort("created_at",-1).limit(10))
    latest=rs[0] if rs else None
    return {"resume_count":resumes.count_documents({"user_id":user["id"]}),"job_match_count":job_analyses.count_documents({"user_id":user["id"]}),"latest":None if not latest else {"id":str(latest["_id"]),"filename":latest["filename"],"score":latest.get("analysis",{}).get("overall",0),"ats":latest.get("analysis",{}).get("ats",0)},"recent_resumes":[{"id":str(r["_id"]),"filename":r["filename"],"score":r.get("analysis",{}).get("overall",0),"ats":r.get("analysis",{}).get("ats",0),"created_at":r["created_at"]} for r in rs],"recent_jobs":[{"id":str(j["_id"]),"resume_id":j["resume_id"],"match_score":j["result"].get("match_score",0),"created_at":j["created_at"]} for j in jobs]}
