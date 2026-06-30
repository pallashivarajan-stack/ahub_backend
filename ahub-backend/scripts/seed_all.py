"""Seed script: create admin + copy board images + insert board members."""

import os
import shutil
import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.session import SessionLocal
from app.models.admin import Admin, AdminRole, AdminStatus
from app.models.board import BoardMember
from app.models.partner import Partner
from app.core.security import hash_password


ADMIN_EMAIL = "admin@ahub.in"
ADMIN_PASSWORD = "admin123"

# Source images from the frontend assets folder
ASSETS_BOARD_DIR = Path(r"C:\project\ahub-nexus-main\src\assets\board")
UPLOAD_BOARD_DIR = Path("uploads/board")

BOARD_SEED_DATA = [
    {
        "name": "Prof. G.P. Raja Sekhar",
        "title": "Vice Chancellor, Andhra University",
        "bio": "Distinguished academic leader with decades of experience in engineering education and research. Driving strategic vision and governance excellence at AHub Incubation Council.",
        "linked_in": "https://linkedin.com/in/prof-gp-raja-sekhar",
        "image_file": "Prof.G.P.Raja Sekhar.jpeg",
        "display_order": 0,
    },
    {
        "name": "Prof. K. Rambabu",
        "title": "Registrar",
        "bio": "Eminent professor and researcher contributing deep expertise in technology innovation and academic-industry collaboration. Championing startup incubation and research-driven entrepreneurship.",
        "linked_in": "https://linkedin.com/in/prof-k-rambabu",
        "image_file": "prof.K.Rambabu.png",
        "display_order": 1,
    },
    {
        "name": "Prof. Valli Kumari Vatsavayi",
        "title": "Dean, Research & Development",
        "bio": "Seasoned academician and thought leader bringing strategic insight into technology education, research policy, and innovation ecosystem development across the region.",
        "linked_in": "https://linkedin.com/in/prof-vallikumari-vatsavayi",
        "image_file": "prof.Valli kumari vatsavayi.png",
        "display_order": 2,
    },
]


def copy_board_images() -> None:
    """Copy board images from frontend assets to uploads/board/."""
    UPLOAD_BOARD_DIR.mkdir(parents=True, exist_ok=True)

    for member in BOARD_SEED_DATA:
        src = ASSETS_BOARD_DIR / member["image_file"]
        dst = UPLOAD_BOARD_DIR / member["image_file"]
        if src.exists():
            shutil.copy2(src, dst)
            print(f"  [OK] Copied {member['image_file']}")
        elif dst.exists():
            print(f"  [--] Already exists: {member['image_file']}")
        else:
            print(f"  [!!] Source not found: {src}")


def seed_admin(db) -> Admin | None:
    """Create default admin if not exists."""
    existing = db.query(Admin).filter(Admin.email == ADMIN_EMAIL).first()
    if existing:
        print(f"  Admin already exists: {ADMIN_EMAIL}")
        return existing

    admin = Admin(
        email=ADMIN_EMAIL,
        password_hash=hash_password(ADMIN_PASSWORD),
        role=AdminRole.SUPER_ADMIN,
        status=AdminStatus.ACTIVE,
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    print(f"  [OK] Admin created: {ADMIN_EMAIL}")
    return admin


def seed_board_members(db) -> None:
    """Insert board member records from seed data."""
    existing_count = db.query(BoardMember).count()
    if existing_count > 0:
        print(f"  Board members already exist ({existing_count} records), skipping seed.")
        return

    for idx, member in enumerate(BOARD_SEED_DATA):
        image_url = f"api/public/media/board/{member['image_file']}"
        record = BoardMember(
            name=member["name"],
            title=member["title"],
            bio=member["bio"],
            image_url=image_url,
            linked_in=member["linked_in"],
            display_order=member["display_order"],
        )
        db.add(record)
        print(f"  [OK] Added board member: {member['name']}")

    db.commit()
    print(f"  [OK] Board members seeded: {len(BOARD_SEED_DATA)} records")


ASSETS_PARTNER_DIR = Path(r"C:\project\ahub-nexus-main\src\assets\partners")
UPLOAD_PARTNER_DIR = Path("uploads/partners")

PARTNER_SEED_DATA = [
    {
        "name": "TiE Vizag",
        "description": "Empowering entrepreneurs with mentorship, funding access, and global networking opportunities.",
        "website_url": "https://vizag.tie.org/",
        "show_in_ticker": True,
        "display_order": 0,
        "logo_file": "tie.jpg",
    },
    {
        "name": "Avanti Feeds",
        "description": "Industry leader fostering aquaculture innovation and sustainable business partnerships.",
        "website_url": "https://avantifeeds.com/",
        "show_in_ticker": True,
        "display_order": 1,
        "logo_file": "avanti.png",
    },
    {
        "name": "ATPI",
        "description": "Promoting technology parks and industrial innovation infrastructure across regions.",
        "show_in_ticker": True,
        "display_order": 2,
        "logo_file": "atpi.jpg",
    },
    {
        "name": "NASSCOM",
        "description": "Driving technology innovation and startup ecosystem growth across India.",
        "website_url": "https://nasscom.in/",
        "show_in_ticker": True,
        "display_order": 3,
        "logo_file": "nasscom.png",
    },
    {
        "name": "Digifac",
        "description": "Digital factory solutions enabling industry 4.0 transformation.",
        "show_in_ticker": True,
        "display_order": 4,
        "logo_file": "digifac.png",
    },
    {
        "name": "Ministry of Science",
        "description": "Supporting scientific research and technology-led innovation initiatives.",
        "show_in_ticker": True,
        "display_order": 5,
        "logo_file": "ministry of sceince.png",
    },
    {
        "name": "iCompass",
        "description": "Education technology partner supporting student entrepreneurship and innovation.",
        "show_in_ticker": True,
        "display_order": 6,
        "logo_file": "icompass.png",
    },
    {
        "name": "SandLogic",
        "description": "AI and deep-tech partner supporting product innovation and scalable solutions.",
        "show_in_ticker": True,
        "display_order": 7,
        "logo_file": "sandlogic.jpg",
    },
    {
        "name": "Alcove",
        "description": "Collaborative workspaces for startups and innovators.",
        "show_in_ticker": True,
        "display_order": 8,
        "logo_file": "alcove.jpg",
    },
    {
        "name": "Rosys",
        "description": "Technology solutions partner driving digital transformation.",
        "show_in_ticker": True,
        "display_order": 9,
        "logo_file": "rosys.jpg",
    },
]


def copy_partner_images() -> None:
    """Copy partner logo images from frontend assets to uploads/partners/."""
    UPLOAD_PARTNER_DIR.mkdir(parents=True, exist_ok=True)

    for partner in PARTNER_SEED_DATA:
        logo_file = partner.get("logo_file")
        if not logo_file:
            continue
        src = ASSETS_PARTNER_DIR / logo_file
        dst = UPLOAD_PARTNER_DIR / logo_file
        if src.exists():
            shutil.copy2(src, dst)
            print(f"  [OK] Copied {logo_file}")
        elif dst.exists():
            print(f"  [--] Already exists: {logo_file}")
        else:
            print(f"  [!!] Source not found: {src}")


def seed_partners(db) -> None:
    """Insert partner records from seed data."""
    existing_count = db.query(Partner).count()
    if existing_count > 0:
        print(f"  Partners already exist ({existing_count} records), skipping seed.")
        return

    for partner in PARTNER_SEED_DATA:
        logo_file = partner.get("logo_file")
        logo_url = f"api/public/media/partners/{logo_file}" if logo_file else None
        record = Partner(
            name=partner["name"],
            description=partner["description"],
            logo_url=logo_url,
            website_url=partner.get("website_url"),
            show_in_ticker=partner["show_in_ticker"],
            display_order=partner["display_order"],
        )
        db.add(record)
        print(f"  [OK] Added partner: {partner['name']}")

    db.commit()
    print(f"  [OK] Partners seeded: {len(PARTNER_SEED_DATA)} records")


def main() -> None:
    print("\n=== AHUB Backend Seed ===\n")

    print("Step 1: Copying board images...")
    copy_board_images()

    print("\nStep 2: Copying partner logo images...")
    copy_partner_images()

    print("\nStep 3: Initializing database session...")
    db = SessionLocal()
    try:
        print("\nStep 4: Creating admin user...")
        seed_admin(db)

        print("\nStep 5: Seeding board members...")
        seed_board_members(db)

        print("\nStep 6: Seeding partners...")
        seed_partners(db)

        print("\n=== Seed complete ===")
        print(f"  Admin login: {ADMIN_EMAIL} / {ADMIN_PASSWORD}")
        print(f"  Images in: {UPLOAD_BOARD_DIR.resolve()}\n")
    finally:
        db.close()


if __name__ == "__main__":
    main()
