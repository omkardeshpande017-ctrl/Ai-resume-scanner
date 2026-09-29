from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, Field
from pymongo.errors import DuplicateKeyError
from ..db import users
from ..auth import hash_password, verify_password, create_token

router=APIRouter(prefix="/api/auth", tags=["auth"])
class RegisterIn(BaseModel): name:str=Field(min_length=2,max_length=100); email:EmailStr; password:str=Field(min_length=8,max_length=128)
class LoginIn(BaseModel): email:EmailStr; password:str
class ForgotIn(BaseModel): email:EmailStr

@router.post("/register", status_code=201)
def register(data:RegisterIn):
    try:
        result=users.insert_one({"name":data.name.strip(),"email":data.email.lower(),"password_hash":hash_password(data.password),"created_at":datetime.now(timezone.utc)})
    except DuplicateKeyError: raise HTTPException(409,"An account with this email already exists")
    return {"message":"Account created","token":create_token(str(result.inserted_id))}

@router.post("/login")
def login(data:LoginIn):
    user=users.find_one({"email":data.email.lower()})
    if not user or not verify_password(data.password,user["password_hash"]): raise HTTPException(401,"Invalid email or password")
    return {"message":"Login successful","token":create_token(str(user["_id"]))}

@router.post("/forgot-password")
def forgot(data:ForgotIn):
    # Privacy-preserving response; wire this to an email provider for real reset links.
    return {"message":"If an account exists for that email, password reset instructions can be sent by the configured email service."}
