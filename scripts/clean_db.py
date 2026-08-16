from app.database.database import SessionLocal
from app.models.vendor import Vendor
from app.models.user import User

db = SessionLocal()

try:
    vendors = db.query(Vendor).filter(Vendor.company_name.like('Vendor Corp %')).all()
    for v in vendors:
        db.delete(v)
    
    emails = ['a@gmail.com', 'b2gmail.com', 'c@gmail.com', 'd2gmail.com', 'e@gmail.com']
    users = db.query(User).filter(User.email.in_(emails)).all()
    for u in users:
        db.delete(u)
        
    db.commit()
    print("Cleaned via ORM!")
except Exception as e:
    db.rollback()
    print("Error:", e)
