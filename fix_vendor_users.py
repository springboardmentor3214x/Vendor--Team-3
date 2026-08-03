import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.database import SessionLocal
from app.models.user import User
from app.models.vendor import Vendor
from app.models.role import Role
from app.core.security import hash_password

def fix_vendor_users():
    db = SessionLocal()
    
    vendor_role = db.query(Role).filter(Role.role_name == "Vendor").first()
    pwd = hash_password("password123")
    
    vendors = db.query(Vendor).all()
    
    created_count = 0
    for v in vendors:
        user = db.query(User).filter(User.email == v.email).first()
        if not user:
            user = User(
                full_name=v.contact_person or v.company_name,
                email=v.email,
                password=pwd,
                role_id=vendor_role.role_id,
                phone=v.phone or "1234567890",
                company=v.company_name
            )
            db.add(user)
            created_count += 1
            
    db.commit()
    db.close()
    print(f"Created {created_count} missing user accounts for existing vendors.")

if __name__ == "__main__":
    fix_vendor_users()
