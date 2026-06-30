from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.database.session import SessionLocal
from app.models.admin import Admin, AdminRole, AdminStatus

ADMIN_EMAIL = "admin@ahub.com"
ADMIN_PASSWORD = "Admin@123"


def create_admin(db: Session) -> Admin | None:
    existing_admin = db.scalar(select(Admin).where(Admin.email == ADMIN_EMAIL))

    if existing_admin is not None:
        return None

    admin = Admin(
        email=ADMIN_EMAIL,
        password_hash=hash_password(ADMIN_PASSWORD),
        role=AdminRole.SUPER_ADMIN,
        status=AdminStatus.ACTIVE,
    )

    db.add(admin)
    db.commit()
    db.refresh(admin)

    return admin


def main() -> None:
    db = SessionLocal()

    try:
        admin = create_admin(db)

        if admin is None:
            print(f"Admin already exists: {ADMIN_EMAIL}")
            return

        print(f"Admin created: {admin.email}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
