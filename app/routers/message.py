from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.models.message import Message
from app.models.user import User
from app.models.procurement import ProcurementRequest

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
def send_message(
    message: MessageCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin", "Procurement", "Vendor")
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

    return new_message


# ---------------------------------------
# Get All Messages
# ---------------------------------------
@router.get("/", response_model=list[MessageResponse])
def get_messages(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("Admin", "Procurement", "Vendor")
    )
):

    return db.query(Message).all()


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