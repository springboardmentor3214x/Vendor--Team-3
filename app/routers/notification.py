from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.notification import Notification
from app.routers.auth import get_current_user
from app.routers.websocket import manager

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("/")
def get_user_notifications(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    notifications = db.query(Notification).filter(
        Notification.user_id == current_user.user_id
    ).order_by(Notification.created_at.desc()).all()
    
    return [
        {
            "id": n.notification_id,
            "title": "Notification",
            "message": n.message,
            "time": n.created_at.strftime("%Y-%m-%d %H:%M:%S") if n.created_at else "",
            "status": n.status
        }
        for n in notifications
    ]

@router.put("/{notification_id}/read")
async def mark_notification_as_read(notification_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    notification = db.query(Notification).filter(
        Notification.notification_id == notification_id,
        Notification.user_id == current_user.user_id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    notification.status = "Read"
    db.commit()
    
    # Broadcast to self
    await manager.send_personal_message({
        "type": "notification_read",
        "notification_id": notification_id
    }, current_user.user_id)
    
    return {"message": "Notification marked as read"}
