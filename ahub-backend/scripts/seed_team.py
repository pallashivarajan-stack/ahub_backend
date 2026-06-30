"""Seed script: copy team images + insert team members + team page metadata."""

import os
import re
import shutil
import sys
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.session import SessionLocal
from app.models.team import TeamMember, TeamPage


ASSETS_TEAM_DIR = Path(r"C:\project\ahub-nexus-main\src\assets\team")
UPLOAD_TEAM_DIR = Path("uploads/team")


def sanitize_filename(name: str) -> str:
    """Replace special chars with underscores for URL-safe filenames."""
    name = name.replace("(", "_").replace(")", "_").replace(",", "_").replace(" ", "_")
    name = re.sub(r"_+", "_", name)
    name = name.strip("_")
    return name.lower()


TEAM_SEED_DATA = [
    {
        "name": "Syed Junaid Ahmed",
        "title": "Technical Manager, A-Hub",
        "tagline": "Driving technical strategy and innovation at A-Hub",
        "visit_link": "https://linkedin.com/in/syed-junaid-ahmed",
        "asset_file": "syed junaid ahmed(technical manager,a-hub).jpg",
        "display_order": 0,
    },
    {
        "name": "Akilesh Kumar",
        "title": "Incubation Manager, A-Hub",
        "tagline": "Empowering startups through incubation and mentorship",
        "visit_link": "https://linkedin.com/in/akilesh-kumar",
        "asset_file": "akilesh kumar(incubation manager,a-hub).jpg",
        "display_order": 1,
    },
    {
        "name": "Sivashankar Pilla",
        "title": "Skill Development Lab Manager",
        "tagline": "Building hands-on learning experiences for innovators",
        "visit_link": "https://linkedin.com/in/sivashankar-pilla",
        "asset_file": "sivashankar pilla(skill development lab manager).jpg",
        "display_order": 2,
    },
    {
        "name": "Ganesh Chilla",
        "title": "Sr Engineer - Automation",
        "tagline": "Automating solutions for next-gen industrial challenges",
        "visit_link": "https://linkedin.com/in/ganesh-chilla",
        "asset_file": "ganesh chilla(skill development-sr.engineer automation).jpg",
        "display_order": 3,
    },
    {
        "name": "Karthik Varma Kopanathi",
        "title": "Sr Engineer - Robotics",
        "tagline": "Pioneering robotics and intelligent systems",
        "visit_link": "https://linkedin.com/in/karthik-varma-kopanathi",
        "asset_file": "Karthik Varma Kopanathi(skill development-sr engineer-robotics).jpg",
        "display_order": 4,
    },
    {
        "name": "Pavan Kumar Kasturi",
        "title": "Sr Engineer - CAD/CAM",
        "tagline": "Transforming designs into precision-engineered products",
        "visit_link": "https://linkedin.com/in/pavan-kumar-kasturi",
        "asset_file": "pavan kumar kasturi(skill devlopment-sr enginner cad-cam).jpg",
        "display_order": 5,
    },
    {
        "name": "Poojith Siva Rama Krishna Aravapalli",
        "title": "Sr Engineer - Mechatronics",
        "tagline": "Integrating mechanics, electronics, and computing",
        "visit_link": "https://linkedin.com/in/poojith-aravapalli",
        "asset_file": "poojith siva rama krishna aravapalli(skill development-sr engineer mechatronics).jpg",
        "display_order": 6,
    },
    {
        "name": "G S VV Vamsi Krishna",
        "title": "Sr Engineer - Data Science",
        "tagline": "Unlocking insights through data-driven innovation",
        "visit_link": "https://linkedin.com/in/vamsi-krishna",
        "asset_file": "G S VV Vamsi krishna(skill developement-sr engineer data cience).jpg",
        "display_order": 7,
    },
    {
        "name": "Hemasri Vuritla",
        "title": "IoT Lab Assistant",
        "tagline": "Connecting the physical and digital worlds",
        "visit_link": "https://linkedin.com/in/hemasri-vuritla",
        "asset_file": "hemasri vuritla(IOt lab assistant).jpg",
        "display_order": 8,
    },
    {
        "name": "Sindhu Chinnala",
        "title": "Facilities Executive",
        "tagline": "Ensuring a seamless and productive work environment",
        "visit_link": "https://linkedin.com/in/sindhu-chinnala",
        "asset_file": "sindhu chinnala(facilities-executive).jpg",
        "display_order": 9,
    },
    {
        "name": "Pramila Rani Sahu",
        "title": "Office Executive",
        "tagline": "Keeping operations running smoothly every day",
        "visit_link": "https://linkedin.com/in/pramila-rani-sahu",
        "asset_file": "pramila Rani sahu(office executive).png",
        "display_order": 10,
    },
    {
        "name": "Somayajula Venkata Saujanya Sudeeksha",
        "title": "Intern",
        "tagline": "Eager to learn and contribute to the ecosystem",
        "visit_link": "https://linkedin.com/in/svs-sudeeksha",
        "asset_file": "Somayajula Venkata Saujanya Sudeeksha(intern).jpg",
        "display_order": 11,
    },
    {
        "name": "Ragvendra Varma",
        "title": "Intern",
        "tagline": "Bringing fresh perspectives to the team",
        "visit_link": "https://linkedin.com/in/ragvendra-varma",
        "asset_file": "ragvendra varma(intern).png",
        "display_order": 12,
    },
    {
        "name": "Vinay Kumar Tadla",
        "title": "Intern",
        "tagline": "Passionate about technology and innovation",
        "visit_link": "https://linkedin.com/in/vinay-kumar-tadla",
        "asset_file": "vinay kumar tadla(intern).png",
        "display_order": 13,
    },
]


def copy_team_images() -> None:
    """Copy team images with sanitized filenames."""
    UPLOAD_TEAM_DIR.mkdir(parents=True, exist_ok=True)

    for member in TEAM_SEED_DATA:
        src = ASSETS_TEAM_DIR / member["asset_file"]
        sanitized = sanitize_filename(member["asset_file"])
        dst = UPLOAD_TEAM_DIR / sanitized
        member["image_file"] = sanitized
        if src.exists():
            shutil.copy2(src, dst)
            print(f"  [OK] {member['asset_file']} -> {sanitized}")
        elif dst.exists():
            print(f"  [--] Already exists: {sanitized}")
        else:
            print(f"  [!!] Source not found: {src}")

    # Copy group photo
    group_src = ASSETS_TEAM_DIR / "group photo of team members.png"
    group_sanitized = sanitize_filename("group photo of team members.png")
    group_dst = UPLOAD_TEAM_DIR / group_sanitized
    if group_src.exists():
        shutil.copy2(group_src, group_dst)
        print(f"  [OK] group photo -> {group_sanitized}")
    elif group_dst.exists():
        print(f"  [--] Group photo already exists")
    else:
        print(f"  [!!] Group photo not found: {group_src}")


def seed_team_members(db) -> None:
    """Insert team member records from seed data."""
    existing_count = db.query(TeamMember).count()
    if existing_count > 0:
        print(f"  Team members already exist ({existing_count} records), skipping seed.")
        return

    for member in TEAM_SEED_DATA:
        image_url = f"api/public/media/team/{member['image_file']}"
        record = TeamMember(
            name=member["name"],
            title=member["title"],
            tagline=member.get("tagline"),
            image_url=image_url,
            visit_link=member.get("visit_link"),
            display_order=member["display_order"],
        )
        db.add(record)
        print(f"  [OK] Added team member: {member['name']}")

    db.commit()
    print(f"  [OK] Team members seeded: {len(TEAM_SEED_DATA)} records")


def seed_team_page(db) -> None:
    """Insert team page metadata."""
    existing = db.query(TeamPage).first()
    if existing:
        print(f"  Team page metadata already exists, skipping.")
        return

    group_photo_url = f"api/public/media/team/{sanitize_filename('group photo of team members.png')}"
    page = TeamPage(
        group_photo=group_photo_url,
        title="The A-Hub Family",
        subtitle="14 Members \u00b7 One Mission",
        description="Building Andhra Pradesh's premier startup incubation ecosystem",
        member_count_label="Team Members",
    )
    db.add(page)
    db.commit()
    print(f"  [OK] Team page metadata created")


def delete_existing_data(db) -> None:
    """Clear existing team data for re-seeding."""
    db.query(TeamMember).delete()
    db.query(TeamPage).delete()
    db.commit()
    print("  [OK] Cleared existing team data")


def main() -> None:
    print("\n=== AHUB Team Seed ===\n")

    print("Step 1: Copying team images...")
    copy_team_images()

    print("\nStep 2: Initializing database session...")
    db = SessionLocal()
    try:
        print("\nStep 3: Clearing existing data...")
        delete_existing_data(db)

        print("\nStep 4: Seeding team members...")
        seed_team_members(db)

        print("\nStep 5: Seeding team page metadata...")
        seed_team_page(db)

        print("\n=== Seed complete ===")
        print(f"  Images in: {UPLOAD_TEAM_DIR.resolve()}\n")
    finally:
        db.close()


if __name__ == "__main__":
    main()
