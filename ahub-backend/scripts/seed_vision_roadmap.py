import sys
import os
import shutil
import uuid
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.session import SessionLocal
from app.models.vision_roadmap import VisionMission, Roadmap, Milestone
from sqlalchemy import text

assets_dir = r"C:\project\ahub-nexus-main\src\assets\vision and roadmap"
upload_base = "uploads"

def copy_to_uploads(entity_type, filename):
    src = os.path.join(assets_dir, filename)
    if not os.path.exists(src):
        print(f"  WARNING: {src} not found")
        return None
    ext = os.path.splitext(filename)[1]
    dest_name = f"{uuid.uuid4().hex}{ext}"
    dest_dir = os.path.join(upload_base, entity_type)
    os.makedirs(dest_dir, exist_ok=True)
    dest_path = os.path.join(dest_dir, dest_name)
    shutil.copy2(src, dest_path)
    return f"/api/public/media/{entity_type}/{dest_name}"

db = SessionLocal()

# Seed vision_mission
existing = db.execute(text("SELECT COUNT(*) FROM vision_mission")).scalar()
if existing == 0:
    vision_url = copy_to_uploads("vision-mission", "vision.jpg")
    mission_url = copy_to_uploads("vision-mission", "mission.jpeg")

    vm1 = VisionMission(
        section_type="vision",
        heading="Our Vision",
        description="Inspiring Innovation — Building a future driven by innovation, collaboration, entrepreneurship, research, and sustainable impact.",
        image_url=vision_url,
        display_order=0,
    )
    vm2 = VisionMission(
        section_type="mission",
        heading="Our Mission",
        description="A Better Tomorrow — Empowering students, startups, researchers, and industries through technology, education, incubation, and governance.",
        image_url=mission_url,
        display_order=1,
    )
    db.add_all([vm1, vm2])
    db.commit()
    print(f"Seeded vision/mission items (vision_url={vision_url}, mission_url={mission_url})")
else:
    print(f"Vision/mission items already exist ({existing} rows)")

# Seed roadmap (single row)
roadmap_count = db.execute(text("SELECT COUNT(*) FROM roadmaps")).scalar()
if roadmap_count == 0:
    rm_url = copy_to_uploads("roadmap", "roadmap.png")
    rm = Roadmap(image_url=rm_url)
    db.add(rm)
    db.commit()
    print(f"Seeded roadmap image (url={rm_url})")
else:
    print("Roadmap image already exists")

# Seed milestones
milestone_count = db.execute(text("SELECT COUNT(*) FROM milestones")).scalar()
if milestone_count == 0:
    milestones_data = [
        ("2021-2022", "2021-2022.png", "Foundation & Launch", 0),
        ("2022-2023", "2022-2023.png", "Growth & Expansion", 1),
        ("2023-2024", "2023-2024.png", "Scale & Impact", 2),
    ]
    for year_label, filename, tagline, order in milestones_data:
        ms_url = copy_to_uploads("milestones", filename)
        ms = Milestone(year_label=year_label, image_url=ms_url, tagline=tagline, display_order=order)
        db.add(ms)
    db.commit()
    print("Seeded 3 milestones")
else:
    print(f"Milestones already exist ({milestone_count} rows)")

db.close()
print("Done")
