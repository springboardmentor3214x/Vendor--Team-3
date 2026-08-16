import sys
import os
from sqlalchemy.orm import Session

# Add the root directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.database import Base, engine, SessionLocal
from app.models.role import Role
from app.models.user import User
from app.core.security import hash_password, verify_password

def verify_db_flow():
    print("========== DATABASE FLOW VERIFICATION ==========")
    
    # 1. Initialize Tables
    print("\n1. Initializing tables...")
    try:
        Base.metadata.create_all(bind=engine)
        print("[OK] Database tables created or verified successfully.")
    except Exception as e:
        print(f"[ERROR] Failed to create tables: {e}")
        return False

    db: Session = SessionLocal()
    try:
        # 2. Seed Default Roles (1 to 6)
        print("\n2. Checking and seeding default roles...")
        default_roles = {
            1: 'Administrator',
            2: 'Procurement Manager',
            3: 'Supply Chain Manager',
            4: 'Vendor',
            5: 'Finance Officer',
            6: 'Auditor'
        }
        
        for r_id, r_name in default_roles.items():
            existing_role = db.query(Role).filter(Role.role_id == r_id).first()
            if not existing_role:
                new_role = Role(role_id=r_id, role_name=r_name)
                db.add(new_role)
                print(f"  + Seeded role: {r_name} (ID: {r_id})")
        db.commit()
        print("[OK] Seeding verification completed successfully.")

        # 3. Simulate User Registration
        print("\n3. Simulating user registration...")
        test_email = "db_test_user@vrp.com"
        test_password = "SecurePassword@123"
        test_name = "Database Test User"
        test_phone = "+91 9876543210"
        test_role_id = 1 # Administrator
        
        # Clean up any existing test user first
        existing_user = db.query(User).filter(User.email == test_email).first()
        if existing_user:
            db.delete(existing_user)
            db.commit()
            print("  - Cleaned up previous test user.")

        hashed_pwd = hash_password(test_password)
        new_user = User(
            full_name=test_name,
            email=test_email,
            password=hashed_pwd,
            phone=test_phone,
            role_id=test_role_id
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        print(f"[OK] User registered and saved to PostgreSQL successfully! User ID: {new_user.user_id}")

        # 4. Simulate User Login / Retrieval
        print("\n4. Simulating user retrieval / login...")
        db_user = db.query(User).filter(User.email == test_email).first()
        if not db_user:
            print("[ERROR] Registered user details could not be retrieved from PostgreSQL.")
            return False
            
        print("[OK] User retrieved successfully from database.")
        print(f"  - Full Name: {db_user.full_name}")
        print(f"  - Role ID: {db_user.role_id}")
        
        # Verify password hash
        is_pwd_valid = verify_password(test_password, db_user.password)
        if is_pwd_valid:
            print("[OK] Password verification/login success matching the database hash.")
        else:
            print("[ERROR] Password verification against database hash failed.")
            return False

        # Clean up test user
        db.delete(db_user)
        db.commit()
        print("\n[OK] Flow verification test completed successfully! Database connection is fully operational.")
        return True

    except Exception as e:
        print(f"\n[ERROR] Error during database flow verification: {e}")
        return False
    finally:
        db.close()

if __name__ == "__main__":
    success = verify_db_flow()
    sys.exit(0 if success else 1)
