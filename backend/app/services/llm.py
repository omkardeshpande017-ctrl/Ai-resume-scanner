import json
from .analyzer import match_job

def llm_status(settings):
    return {"enabled": bool(settings.openai_api_key), "provider": settings.llm_provider if settings.openai_api_key else "local", "model": settings.openai_model if settings.openai_api_key else None}

def generate_recommendations(text, parsed, analysis, settings):
    # Local recommendations are deterministic and grounded in extracted text.
    rec=[]
    if not parsed.get("name"): rec.append("Add your full name at the top of the resume.")
    if not parsed.get("linkedin"): rec.append("Add a professional LinkedIn URL if you use LinkedIn.")
    if analysis["keywords"] < 70: rec.append("Tailor the skills and summary sections to the target role using truthful job-relevant terminology.")
    if not parsed.get("sections",{}).get("projects"): rec.append("Add 2–4 relevant projects with technologies, your contribution, and measurable outcomes.")
    if not parsed.get("sections",{}).get("experience"): rec.append("If you have internships, freelance, research, or substantial project work, describe responsibilities and outcomes clearly.")
    if not any(x["passed"] for x in analysis["checks"] if x["name"]=="Quantifiable achievements"): rec.append("Where truthful, quantify impact with percentages, users, latency, revenue, accuracy, scale, or time saved.")
    rec.extend([c["recommendation"] for c in analysis["checks"] if not c["passed"]])
    return list(dict.fromkeys(rec))[:10]

def generate_llm_job_analysis(resume_text, job_text, settings):
    if not settings.openai_api_key:
        return None
    try:
        from openai import OpenAI
        client=OpenAI(api_key=settings.openai_api_key)
        prompt=f"""Analyze this resume against this job description. Return ONLY JSON with keys: summary, strengths, gaps, recommendations, relevant_projects, relevant_experience. Do not invent facts. Resume:\n{resume_text[:12000]}\n\nJob:\n{job_text[:12000]}"""
        response=client.chat.completions.create(model=settings.openai_model, messages=[{"role":"system","content":"You are a resume analysis assistant. Ground every statement in the supplied text."},{"role":"user","content":prompt}], temperature=0.2, response_format={"type":"json_object"})
        return json.loads(response.choices[0].message.content)
    except Exception:
        return None
