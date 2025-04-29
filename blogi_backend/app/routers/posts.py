from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from .. import models, schemas
from ..utils.dependencies import get_db, get_current_user
from typing import List, Optional

router = APIRouter()

@router.post("/posts", response_model=schemas.PostOut)
def create_post(post: schemas.PostCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    new_post = models.Post(**post.dict(), author_id=user.id)
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    return new_post

@router.get("/posts", response_model=List[schemas.PostOut])
def get_posts(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 10,
    search: Optional[str] = Query(None, description="Search in title or content")
):
    query = db.query(models.Post)
    if search:
        query = query.filter(
            models.Post.title.ilike(f"%{search}%") | models.Post.content.ilike(f"%{search}%")
        )
    posts = query.offset(skip).limit(limit).all()
    return posts

@router.get("/posts/{post_id}", response_model=schemas.PostOut)
def get_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(models.Post).filter_by(id=post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

@router.put("/posts/{post_id}", response_model=schemas.PostOut)
def update_post(post_id: int, post_data: schemas.PostCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    post = db.query(models.Post).filter_by(id=post_id, author_id=user.id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    for key, value in post_data.dict().items():
        setattr(post, key, value)
    db.commit()
    db.refresh(post)
    return post

@router.delete("/posts/{post_id}")
def delete_post(post_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    post = db.query(models.Post).filter_by(id=post_id, author_id=user.id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    db.delete(post)
    db.commit()
    return {"message": "Post deleted successfully"}
