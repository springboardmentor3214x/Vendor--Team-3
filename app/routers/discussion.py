from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.models.discussion import Discussion

from app.schemas.discussion import (
    DiscussionCreate,
    DiscussionResponse,
)

from app.core.role import require_roles

router = APIRouter(
    prefix="/discussions",
    tags=["Discussions"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------------------------------
# Create Discussion
# ---------------------------------------

@router.post("/", response_model=DiscussionResponse)
def create_discussion(
    discussion: DiscussionCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin", "Procurement", "Vendor")
    )
):

    new_discussion = Discussion(
        created_by=current_user.user_id,
        title=discussion.title,
        related_entity_type=discussion.related_entity_type,
        related_entity_id=discussion.related_entity_id
    )

    db.add(new_discussion)
    db.commit()
    db.refresh(new_discussion)

    return new_discussion


# ---------------------------------------
# Get All Discussions
# ---------------------------------------

@router.get("/", response_model=list[DiscussionResponse])
def get_discussions(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin", "Procurement", "Vendor")
    )
):

    return db.query(Discussion).all()


# ---------------------------------------
# Get Discussion By ID
# ---------------------------------------

@router.get("/{discussion_id}", response_model=DiscussionResponse)
def get_discussion(
    discussion_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin", "Procurement", "Vendor")
    )
):

    discussion = db.query(Discussion).filter(
        Discussion.discussion_id == discussion_id
    ).first()

    if not discussion:
        raise HTTPException(
            status_code=404,
            detail="Discussion not found"
        )

    return discussion


# ---------------------------------------
# Delete Discussion
# ---------------------------------------

@router.delete("/{discussion_id}")
def delete_discussion(
    discussion_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin")
    )
):

    discussion = db.query(Discussion).filter(
        Discussion.discussion_id == discussion_id
    ).first()

    if not discussion:
        raise HTTPException(
            status_code=404,
            detail="Discussion not found"
        )

    db.delete(discussion)
    db.commit()

    return {"message": "Discussion deleted successfully"}