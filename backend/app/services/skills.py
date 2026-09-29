import re
SKILLS = {
 "Programming Languages": ["python","java","javascript","typescript","c","c++","c#","go","rust","php","ruby","kotlin","swift"],
 "Frontend": ["react","next.js","nextjs","vite","angular","vue","html","css","tailwind","bootstrap","redux"],
 "Backend": ["node.js","nodejs","express","fastapi","flask","django","spring boot","spring","hono","rest api","graphql"],
 "Databases": ["mongodb","postgresql","mysql","sqlite","redis","firebase","oracle","supabase"],
 "Cloud": ["aws","azure","gcp","vercel","netlify","docker","kubernetes"],
 "DevOps": ["docker","kubernetes","github actions","ci/cd","linux","nginx","terraform"],
 "AI/ML": ["machine learning","deep learning","tensorflow","pytorch","scikit-learn","spacy","nlp","transformers","sentence-transformers","computer vision","llm","generative ai"],
 "Data Science": ["numpy","pandas","matplotlib","seaborn","statistics","data analysis","data visualization","jupyter","power bi","tableau"],
 "Tools": ["git","github","postman","figma","jira","vscode","npm","yarn"],
 "Soft Skills": ["communication","leadership","teamwork","problem solving","collaboration","adaptability","time management"]
}

def detect_skills(text: str):
    low = text.lower()
    result = {}
    for group, skills in SKILLS.items():
        found=[]
        for skill in skills:
            pattern = r"(?<![a-z0-9])" + re.escape(skill.lower()) + r"(?![a-z0-9])"
            if re.search(pattern, low): found.append(skill)
        result[group] = sorted(set(found))
    return result

def flat(skills): return sorted({s for vals in skills.values() for s in vals})
