"""Seed script: copy mentor images + insert mentor records."""

import os
import re
import shutil
import sys
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.session import SessionLocal
from app.models.mentor import Mentor


ASSETS_MENTOR_DIR = Path(r"C:\project\ahub-nexus-main\src\assets\mentors")
UPLOAD_MENTOR_DIR = Path("uploads/mentors")


def sanitize_filename(name: str) -> str:
    name = name.replace("(", "_").replace(")", "_").replace(",", "_").replace(" ", "_")
    name = re.sub(r"_+", "_", name)
    name = name.strip("_")
    return name.lower()


MENTOR_SEED_DATA = [
    {
        "name": "Deepak S. Madala",
        "title": "Strategy & Operations Expert",
        "organization": "Incubation Council",
        "linked_in": "https://linkedin.com/in/deepak-madala",
        "asset_file": "Deepak_S_Madala.png",
        "display_order": 0,
    },
    {
        "name": "Dr. Diwakar K Vadapalli",
        "title": "Technology Innovation Lead",
        "organization": "Incubation Council",
        "linked_in": "https://linkedin.com/in/diwakar-vadapalli",
        "asset_file": "Dr_Diwakar_K_Vadapalli.jpg",
        "display_order": 1,
    },
    {
        "name": "Kiran Korivi",
        "title": "Product & Growth Strategist",
        "organization": "Incubation Council",
        "linked_in": "https://linkedin.com/in/kiran-korivi",
        "asset_file": "Kiran_Korivi.png",
        "display_order": 2,
    },
    {
        "name": "Peter Schneberger",
        "title": "International Venture Advisor",
        "organization": "Incubation Council",
        "linked_in": "https://linkedin.com/in/peter-schneberger",
        "asset_file": "Peter_Schneeberger.png",
        "display_order": 3,
    },
    {
        "name": "Ravi Eswarapu",
        "title": "Finance & Investment Strategist",
        "organization": "Incubation Council",
        "linked_in": "https://linkedin.com/in/ravi-eswarapu",
        "asset_file": "Ravi_Eswwarapu.jpg",
        "display_order": 4,
    },
    {
        "name": "Srinivas Savaram",
        "title": "Ecosystem & Partnership Lead",
        "organization": "Incubation Council",
        "linked_in": "https://linkedin.com/in/srinivas-savaram",
        "asset_file": "Srinivas_Savaram.png",
        "display_order": 5,
    },
]


def copy_mentor_images() -> None:
    """Copy mentor images with sanitized filenames."""
    UPLOAD_MENTOR_DIR.mkdir(parents=True, exist_ok=True)

    for member in MENTOR_SEED_DATA:
        src = ASSETS_MENTOR_DIR / member["asset_file"]
        sanitized = sanitize_filename(member["asset_file"])
        dst = UPLOAD_MENTOR_DIR / sanitized
        member["image_file"] = sanitized
        if src.exists():
            shutil.copy2(src, dst)
            print(f"  [OK] {member['asset_file']} -> {sanitized}")
        elif dst.exists():
            print(f"  [--] Already exists: {sanitized}")
        else:
            print(f"  [!!] Source not found: {src}")


def delete_existing_data(db) -> None:
    db.query(Mentor).delete()
    db.commit()
    print("  [OK] Cleared existing mentor data")


def seed_mentors(db) -> None:
    """Insert mentor records from seed data."""
    existing_count = db.query(Mentor).count()
    if existing_count > 0:
        print(f"  Mentors already exist ({existing_count} records), skipping seed.")
        return

    for member in MENTOR_SEED_DATA:
        image_url = f"api/public/media/mentors/{member['image_file']}"
        record = Mentor(
            name=member["name"],
            title=member["title"],
            organization=member.get("organization"),
            image_url=image_url,
            linked_in=member.get("linked_in"),
            display_order=member["display_order"],
        )
        db.add(record)
        print(f"  [OK] Added mentor: {member['name']}")

    db.commit()
    print(f"  [OK] Mentors seeded: {len(MENTOR_SEED_DATA)} records")


def main() -> None:
    print("\n=== AHUB Mentor Seed ===\n")

    print("Step 1: Copying mentor images...")
    copy_mentor_images()

    print("\nStep 2: Initializing database session...")
    db = SessionLocal()
    try:
        print("\nStep 3: Clearing existing data...")
        delete_existing_data(db)

        print("\nStep 4: Seeding mentors...")
        seed_mentors(db)

        print("\n=== Seed complete ===")
        print(f"  Images in: {UPLOAD_MENTOR_DIR.resolve()}\n")
    finally:
        db.close()


if __name__ == "__main__":
    main()
