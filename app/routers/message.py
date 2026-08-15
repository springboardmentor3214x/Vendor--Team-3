from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os
import shutil

from app.database.database import SessionLocal
from app.models.message import Message
from app.models.user import User
from app.models.procurement import ProcurementRequest
from app.routers.websocket import manager

from app.schemas.message import (
    MessageCreate,
    MessageUpdate,
    MessageResponse,
)

from app.core.role import require_roles

router = APIRouter(
    prefix="/messages",
    tags=["Messages"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------------------------------
# Send Message
# ---------------------------------------
@router.post("/", response_model=MessageResponse)
async def send_message(
    message: MessageCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin", "Procurement", "Vendor", "Supply Chain Manager", "Finance Officer", "Auditor", "Supply", "Finance")
    )
):

    sender = db.query(User).filter(
        User.user_id == message.sender_id
    ).first()

    if not sender:
        raise HTTPException(
            status_code=404,
            detail="Sender not found"
        )

    receiver = db.query(User).filter(
        User.user_id == message.receiver_id
    ).first()

    if not receiver:
        raise HTTPException(
            status_code=404,
            detail="Receiver not found"
        )

    procurement = db.query(ProcurementRequest).filter(
        ProcurementRequest.procurement_id == message.procurement_id
    ).first()

    if not procurement:
        raise HTTPException(
            status_code=404,
            detail="Procurement Request not found"
        )

    new_message = Message(**message.model_dump())

    db.add(new_message)
    db.commit()
    db.refresh(new_message)

    # Broadcast to receiver
    await manager.send_personal_message({
        "type": "new_message",
        "message": {
            "message_id": new_message.message_id,
            "sender_id": new_message.sender_id,
            "receiver_id": new_message.receiver_id,
            "message": new_message.message,
            "sent_at": new_message.sent_at.isoformat() if new_message.sent_at else None
        }
    }, message.receiver_id)

    from app.services.notification_service import NotificationService
    # DB & Email Notification for offline users
    await NotificationService.create_and_send_notification(
        db=db,
        user_id=message.receiver_id,
        notification_type="Direct Message",
        title=f"New Message from {sender.username}",
        message=f"{sender.username} sent you a message regarding Procurement Request #{message.procurement_id}.",
        related_module="Communication",
        related_record_id=new_message.message_id,
        priority="Normal",
        delivery_method="In-App,Email"
    )

    return new_message


# ---------------------------------------
# Get All Messages (Involving Current User)
# ---------------------------------------
@router.get("/", response_model=list[MessageResponse])
def get_messages(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin", "Procurement", "Vendor", "Supply Chain Manager", "Finance Officer", "Auditor", "Supply", "Finance")
    )
):
    from sqlalchemy import or_
    return db.query(Message).filter(
        or_(
            Message.sender_id == current_user.user_id,
            Message.receiver_id == current_user.user_id
        )
    ).order_by(Message.sent_at.asc()).all()


# ---------------------------------------
# Get Message By ID
# ---------------------------------------
@router.get("/{message_id}", response_model=MessageResponse)
def get_message(
    message_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin", "Procurement", "Vendor")
    )
):

    message = db.query(Message).filter(
        Message.message_id == message_id
    ).first()

    if not message:
        raise HTTPException(
            status_code=404,
            detail="Message not found"
        )

    return message


# ---------------------------------------
# Update Message
# ---------------------------------------
@router.put("/{message_id}", response_model=MessageResponse)
def update_message(
    message_id: int,
    updated_message: MessageUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin", "Procurement", "Vendor")
    )
):

    message = db.query(Message).filter(
        Message.message_id == message_id
    ).first()

    if not message:
        raise HTTPException(
            status_code=404,
            detail="Message not found"
        )

    update_fields = updated_message.model_dump(exclude_unset=True)

    for key, value in update_fields.items():
        setattr(message, key, value)

    db.commit()
    db.refresh(message)

    return message


# ---------------------------------------
# Get My Messages (for logged-in user)
# ---------------------------------------
@router.get("/my/inbox", response_model=list[MessageResponse])
def get_my_messages(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin", "Procurement", "Vendor")
    )
):
    """Returns all messages where the current user is the receiver."""
    messages = db.query(Message).filter(
        Message.receiver_id == current_user.user_id
    ).order_by(Message.sent_at.desc()).all()
    return messages


# ---------------------------------------
# Get Unread Message Count (notification badge)
# ---------------------------------------
@router.get("/my/unread-count")
def get_unread_count(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin", "Procurement", "Vendor")
    )
):
    """Returns count of unread messages for the current user."""
    count = db.query(Message).filter(
        Message.receiver_id == current_user.user_id,
        Message.is_read == False
    ).count()
    return {"unread_count": count}


# ---------------------------------------
# Mark All My Messages as Read
# ---------------------------------------
@router.put("/my/mark-read")
async def mark_all_read(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin", "Procurement", "Vendor")
    )
):
    """Marks all messages for the current user as read."""
    db.query(Message).filter(
        Message.receiver_id == current_user.user_id,
        Message.is_read == False
    ).update({"is_read": True})
    db.commit()
    
    # Broadcast to self to update badge
    await manager.send_personal_message({
        "type": "messages_read"
    }, current_user.user_id)

    return {"message": "All messages marked as read"}


# ---------------------------------------
# Upload Attachment
# ---------------------------------------
@router.post("/{message_id}/upload")
def upload_attachment(
    message_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Admin", "Procurement", "Vendor", "Supply Chain Manager", "Finance Officer", "Auditor", "Supply", "Finance"))
):
    message = db.query(Message).filter(Message.message_id == message_id).first()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
        
    # Check if user is sender or receiver
    if message.sender_id != current_user.user_id and message.receiver_id != current_user.user_id:
        # PM or Admin could also upload, but let's just let anyone authorized by role
        pass
        
    os.makedirs(os.path.join("uploads", "messages"), exist_ok=True)
    file_path = os.path.join("uploads", "messages", f"{message_id}_{file.filename}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    message.attachment_path = file_path
    db.commit()
    db.refresh(message)
    
    return {"message": "Attachment uploaded successfully", "attachment_path": file_path}

# ---------------------------------------
# Download Attachment
# ---------------------------------------
@router.get("/{message_id}/download")
def download_attachment(
    message_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles("Admin", "Procurement", "Vendor", "Supply Chain Manager", "Finance Officer", "Auditor", "Supply", "Finance"))
):
    message = db.query(Message).filter(Message.message_id == message_id).first()
    if not message or not message.attachment_path:
        raise HTTPException(status_code=404, detail="Attachment not found")
        
    if not os.path.exists(message.attachment_path):
        raise HTTPException(status_code=404, detail="File missing on server")
        
    return FileResponse(message.attachment_path, filename=os.path.basename(message.attachment_path))