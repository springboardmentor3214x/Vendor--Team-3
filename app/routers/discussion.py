from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import logging

from app.database.database import get_db
from app.models.discussion import Discussion, DiscussionMessage
from app.schemas.discussion import DiscussionResponse, DiscussionCreate, DiscussionMessageResponse, DiscussionMessageCreate
from app.core.role import require_roles
from app.models.user import User
from app.services.notification_service import NotificationService

router = APIRouter(
    prefix="/discussions",
    tags=["Discussions"]
)

logger = logging.getLogger(__name__)

@router.post("/", response_model=DiscussionResponse)
def create_discussion(
    discussion: DiscussionCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles("Admin", "Procurement", "Vendor", "Supply Chain Manager", "Finance Officer"))
):
    new_discussion = Discussion(
        created_by=current_user.user_id,
        **discussion.model_dump()
    )
    db.add(new_discussion)
    db.commit()
    db.refresh(new_discussion)
    return new_discussion

@router.get("/entity/{entity_type}/{entity_id}", response_model=List[DiscussionResponse])
def get_discussions_by_entity(
    entity_type: str,
    entity_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles("Admin", "Procurement", "Vendor", "Supply Chain Manager", "Finance Officer"))
):
    return db.query(Discussion).filter(
        Discussion.entity_type == entity_type,
        Discussion.entity_id == entity_id
    ).order_by(Discussion.created_at.desc()).all()

@router.post("/{discussion_id}/messages", response_model=DiscussionMessageResponse)
async def add_message_to_discussion(
    discussion_id: int,
    message: DiscussionMessageCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles("Admin", "Procurement", "Vendor", "Supply Chain Manager", "Finance Officer"))
):
    discussion = db.query(Discussion).filter(Discussion.discussion_id == discussion_id).first()
    if not discussion:
        raise HTTPException(status_code=404, detail="Discussion not found")

    new_message = DiscussionMessage(
        discussion_id=discussion_id,
        sender_id=current_user.user_id,
        **message.model_dump()
    )
    db.add(new_message)
    db.commit()
    db.refresh(new_message)

    # Real Email & DB Notification to the creator of the discussion
    if discussion.created_by != current_user.user_id:
        creator = db.query(User).filter(User.user_id == discussion.created_by).first()
        if creator:
            await NotificationService.create_and_send_notification(
                db=db,
                user_id=creator.user_id,
                notification_type="Discussion Update",
                title=f"New reply in discussion: {discussion.title}",
                message=f"{current_user.username} replied to your thread on {discussion.entity_type} {discussion.entity_id}.",
                related_module="Communication",
                related_record_id=discussion.discussion_id,
                priority="Medium",
                delivery_method="In-App,Email"
            )

    return new_message


@router.post("/{message_id}/upload")
def upload_discussion_attachment(
    message_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Admin", "Procurement", "Vendor", "Supply Chain Manager", "Finance Officer"))
):
    import os, shutil
    message = db.query(DiscussionMessage).filter(DiscussionMessage.message_id == message_id).first()
    if not message:
        raise HTTPException(status_code=404, detail="Discussion message not found")
        
    os.makedirs(os.path.join("uploads", "discussions"), exist_ok=True)
    file_path = os.path.join("uploads", "discussions", f"{message_id}_{file.filename}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    message.attachment_path = file_path
    db.commit()
    db.refresh(message)
    
    return {"message": "Attachment uploaded successfully", "attachment_path": file_path}

@router.get("/{message_id}/download")
def download_discussion_attachment(
    message_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Admin", "Procurement", "Vendor", "Supply Chain Manager", "Finance Officer"))
):
    from fastapi.responses import FileResponse
    import os
    message = db.query(DiscussionMessage).filter(DiscussionMessage.message_id == message_id).first()
    if not message or not message.attachment_path:
        raise HTTPException(status_code=404, detail="Attachment not found")
        
    if not os.path.exists(message.attachment_path):
        raise HTTPException(status_code=404, detail="File missing on server")
        
    return FileResponse(message.attachment_path, filename=os.path.basename(message.attachment_path))
