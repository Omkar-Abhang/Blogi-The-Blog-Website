from fastapi import FastAPI
from app.routers import users, posts
from app.database import Base, engine
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os

Base.metadata.create_all(bind=engine)

app = FastAPI()

# Set up CORS middleware to accept requests from any origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://blogiblog-website.vercel.app"],  # Allows all origins, change to specific origins if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=int(os.environ.get("PORT", 8000)),  # important for Render
            reload=True
    )

app.include_router(users.router)
app.include_router(posts.router)
