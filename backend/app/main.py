from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from dotenv import load_dotenv
from .api import endpoints
from .api import ai_endpoints

load_dotenv()

app = FastAPI(title="Urban Flooding & Hydrology Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(endpoints.router, prefix="/api")
app.include_router(ai_endpoints.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Urban Flooding & Hydrology Engine API"}
