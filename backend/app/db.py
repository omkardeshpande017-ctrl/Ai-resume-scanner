from pymongo import MongoClient
from .config import settings

client = MongoClient(settings.mongo_uri, serverSelectionTimeoutMS=3000)
db = client[settings.mongo_db]
users = db.users
resumes = db.resumes
job_analyses = db.job_analyses

users.create_index("email", unique=True)
resumes.create_index([("user_id", 1), ("created_at", -1)])
job_analyses.create_index([("user_id", 1), ("created_at", -1)])
