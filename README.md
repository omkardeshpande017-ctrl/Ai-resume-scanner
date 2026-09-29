# AI-Powered Resume Scanner & Job Match Analyzer

A full-stack resume intelligence application that accepts PDF/DOCX resumes, extracts real document text, detects skills, runs ATS-style checks, calculates transparent scores, and compares a resume with a job description using local NLP. An optional OpenAI integration can add grounded LLM recommendations when an API key is configured.

## Stack
- Frontend: React + Vite + Tailwind CSS + React Router + Axios + Recharts-ready architecture
- Backend: FastAPI + Python
- Database: MongoDB
- Parsing: PyMuPDF + python-docx
- NLP: scikit-learn TF-IDF/cosine similarity + deterministic skill taxonomy; sentence-transformers can be added for embedding similarity
- Auth: JWT + bcrypt
- Optional LLM: OpenAI API via backend only

## Architecture
Resume Upload → Text Extraction → Cleaning → Section Detection → Entity/Skill Extraction → ATS/Resume Scoring → Job Description Analysis → TF-IDF Semantic Matching + Skill Matching → Recommendations → Dashboard

## Important AI behavior
The default path is functional local analysis. It does not fabricate an AI result. Every score is derived from extracted text and documented checks. If `OPENAI_API_KEY` is configured, job matching additionally asks the configured LLM for JSON recommendations grounded in the supplied resume/job text. The UI shows whether the result used local analysis or the LLM.

## Requirements
- Python 3.11+ recommended
- Node.js 20+
- Docker Desktop (for MongoDB), or a local MongoDB server

## Terminal 1 — Database
From the project root:

```bash
docker compose up -d mongo
```

Check:

```bash
docker ps
```

If Docker is unavailable, start MongoDB using your local installation instead.

## Terminal 2 — Backend
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs: http://localhost:8000/docs
Health check: http://localhost:8000/api/health

## Terminal 3 — Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open: http://localhost:5173

## Configure `.env`
Backend `.env`:

```env
MONGO_URI=mongodb://localhost:27017
MONGO_DB=resume_scanner
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRE_MINUTES=1440
MAX_UPLOAD_MB=5
FRONTEND_URL=http://localhost:5173
LLM_PROVIDER=openai
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
```

Frontend `.env`:

```env
VITE_API_URL=http://localhost:8000/api
```

Never put the OpenAI key in `frontend/.env` or any `VITE_*` variable.

## Add an AI API key
1. Open `backend/.env`.
2. Set `OPENAI_API_KEY=your_key`.
3. Optionally change `OPENAI_MODEL`.
4. Restart Terminal 2.

If no key is supplied, the application remains usable with local NLP and clearly labels the result as local.

## First account
1. Open http://localhost:5173.
2. Click **Get started**.
3. Enter a name, email, and password of at least 8 characters.
4. The backend creates the MongoDB user and returns a JWT.

## Scan a resume
1. Log in.
2. Open **Scan Resume**.
3. Drag/drop or choose a PDF/DOCX file up to 5 MB.
4. The backend extracts text and calculates the initial analysis.
5. Open the analysis page to inspect ATS checks, skills, sections and recommendations.
6. Paste a real job description in **Job Match** to calculate the match score and missing skills/keywords.

## API testing
Health:
```bash
curl http://localhost:8000/api/health
```

Register:
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

Login:
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"password123"}'
```

Use the returned token as `Authorization: Bearer <TOKEN>` for protected endpoints.

Upload:
```bash
curl -X POST http://localhost:8000/api/resume/upload \
  -H 'Authorization: Bearer <TOKEN>' \
  -F 'file=@/absolute/path/to/resume.pdf'
```

## API endpoints
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/resume/upload`
- `GET /api/resume`
- `GET /api/resume/:id`
- `DELETE /api/resume/:id`
- `POST /api/resume/:id/analyze`
- `POST /api/resume/:id/job-match`
- `GET /api/dashboard`
- `GET /api/health`

## GitHub
From the project root:

```bash
git init
git add .
git commit -m "Build AI resume scanner and job match analyzer"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/resume-scanner.git
git push -u origin main
```

If GitHub asks for a password over HTTPS, use a GitHub Personal Access Token or configure SSH; do not commit credentials.

## Production hardening checklist
- Put MongoDB behind authentication/network controls.
- Use HTTPS and a strong secret manager for JWT/LLM credentials.
- Add refresh-token rotation and real email reset delivery before public deployment.
- Store uploaded files in private object storage with malware scanning and signed URLs.
- Add rate limiting, audit logging, request-size limits, CSRF strategy where relevant, and centralized observability.
- Replace local TF-IDF with a managed/hosted embedding model if higher semantic recall is needed.
- Add rendered-document inspection for true visual checks such as tables, graphics, headers/footers and layout density.
- Configure a real email provider for password reset.
