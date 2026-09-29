import re
from collections import Counter
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from .skills import detect_skills, flat

ACTION_VERBS = ["built","developed","designed","implemented","created","optimized","led","automated","engineered","improved","delivered","deployed","analyzed","managed"]

def keyword_terms(text, limit=25):
    words = re.findall(r"[a-zA-Z][a-zA-Z0-9+#.-]{2,}", text.lower())
    stop = set("the and for with from this that your you are was were have has had our their into using used use job role work team candidate years year required preferred skills experience about will can should who what when where how a an to of in on at as is be by or it".split())
    return [w for w,c in Counter(w for w in words if w not in stop).most_common(limit)]

def ats_checks(text, parsed):
    low=text.lower(); lines=text.splitlines(); words=text.split()
    sections=parsed.get("sections", {})
    checks=[]
    checks.append(("Contact information", bool(parsed.get("email") and parsed.get("phone")), "Email and phone are detectable." if parsed.get("email") and parsed.get("phone") else "Add a clearly visible email and phone number."))
    standard=sum(1 for x in ["education","skills","projects","experience","work experience","internship"] if x in sections)
    checks.append(("Standard sections", standard>=3, f"Detected {standard} standard sections."))
    checks.append(("Length", 250 <= len(words) <= 900, f"Detected about {len(words)} words; keep the resume concise and role-relevant."))
    checks.append(("Action verbs", sum(1 for v in ACTION_VERBS if re.search(r"\b"+re.escape(v)+r"\b",low)) >= 3, "Use strong action verbs such as built, optimized, led, and deployed."))
    checks.append(("Quantifiable achievements", bool(re.search(r"\b\d+(?:%|\+|x| users| projects| months| years| ms| seconds| crore| lakh|k)\b",low)), "Add numbers, percentages, scale, time, or measurable outcomes where truthful."))
    checks.append(("Date consistency", True, "Review dates for a consistent Month YYYY or YYYY format."))
    return checks

def score_resume(text, parsed, skills):
    sec=parsed.get("sections",{})
    contact = int(bool(parsed.get("email") and parsed.get("phone")))
    completeness = min(100, round((len([k for k in ["education","skills","projects","experience","certifications","achievements"] if k in sec])/6)*100))
    skills_score=min(100, len(flat(skills))*6)
    experience_score=min(100, (len(sec.get("experience","").splitlines()) + len(sec.get("internship","").splitlines()))*10 + (20 if "experience" in sec else 0))
    education_score=80 if parsed.get("education") else 25
    projects_score=min(100, len(sec.get("projects","").splitlines())*15 + (20 if "projects" in sec else 0))
    formatting_score=80 if len(text.split()) >= 250 else 55
    keyword_score=min(100, len(keyword_terms(text,20))*5)
    ats_checks_list=ats_checks(text,parsed)
    ats_score=round(sum(ok for _,ok,_ in ats_checks_list)/len(ats_checks_list)*100)
    overall=round(0.25*ats_score+0.15*skills_score+0.12*experience_score+0.10*education_score+0.12*projects_score+0.10*formatting_score+0.10*keyword_score+0.06*completeness)
    explanations={"overall":"Weighted from ATS readiness, skills, experience, education, projects, formatting, keywords and section completeness.","ats":"Based on machine-checkable ATS signals; visual rendering cannot be fully validated from extracted text.","skills":f"Detected {len(flat(skills))} technical/soft skills.","experience":"Based on detected experience/internship content and action-oriented lines.","education":"Based on whether an education section was detected.","projects":"Based on detected project section and project detail lines.","formatting":"Text-based estimate; complex visual elements require a rendered-document review.","keywords":f"Based on meaningful terms detected in the resume ({len(keyword_terms(text,20))} sampled terms).","completeness":"Based on standard resume sections detected."}
    return {"overall":overall,"ats":ats_score,"skills":skills_score,"experience":experience_score,"education":education_score,"projects":projects_score,"formatting":formatting_score,"keywords":keyword_score,"completeness":completeness,"explanations":explanations,"checks":[{"name":n,"passed":ok,"recommendation":msg} for n,ok,msg in ats_checks_list]}

def match_job(resume_text, job_text):
    resume_skills=detect_skills(resume_text); job_skills=detect_skills(job_text)
    r=set(flat(resume_skills)); j=set(flat(job_skills))
    matching=sorted(r & j); missing=sorted(j-r)
    try:
        vec=TfidfVectorizer(stop_words="english", ngram_range=(1,2), max_features=4000)
        matrix=vec.fit_transform([resume_text,job_text])
        similarity=float(cosine_similarity(matrix[0:1],matrix[1:2])[0][0])*100
    except Exception: similarity=0
    skill_component=(len(matching)/len(j)*100) if j else 50
    score=round(0.65*similarity+0.35*skill_component)
    job_terms=keyword_terms(job_text,25)
    resume_low=resume_text.lower()
    found_kw=[k for k in job_terms if k in resume_low]
    missing_kw=[k for k in job_terms if k not in resume_low]
    return {"match_score":score,"semantic_similarity":round(similarity),"matching_skills":matching,"missing_skills":missing,"keywords_found":found_kw,"keywords_missing":missing_kw,"suggested_skills":missing[:10],"relevant_experience":resume_text[:1200],"relevant_projects":resume_text[:1200],"method":"Local TF-IDF cosine similarity + skill intersection"}
