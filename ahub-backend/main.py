from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.routers.auth import router as auth_router
from app.routers.event import router as event_router
from app.routers.incubator_card import router as incubator_card_router
from app.routers.page_section import router as page_section_router
from app.routers.startup import router as startup_router
from app.routers.board import router as board_router
from app.routers.team import router as team_router
from app.routers.mentor import router as mentor_router
from app.routers.case_study import router as case_study_router
from app.routers.press import router as press_router
from app.routers.vision_roadmap import router as vision_roadmap_router
from app.routers.startup_portfolio import router as startup_portfolio_router
from app.routers.infrastructure import router as infrastructure_router
from app.routers.partner import router as partner_router
from app.routers.impact_metric import router as impact_metric_router

app = FastAPI(
    title="AHUB Backend",
    description="Backend for Andhra University Hub (AHUB)",
    version="0.1.0",
)

# Allow all localhost and 127.0.0.1 ports dynamically for CORS
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure uploads directories exist
os.makedirs(os.path.join("uploads", "board"), exist_ok=True)
os.makedirs(os.path.join("uploads", "companies"), exist_ok=True)
os.makedirs(os.path.join("uploads", "events"), exist_ok=True)
os.makedirs(os.path.join("uploads", "incubators"), exist_ok=True)
os.makedirs(os.path.join("uploads", "team"), exist_ok=True)
os.makedirs(os.path.join("uploads", "mentors"), exist_ok=True)
os.makedirs(os.path.join("uploads", "case-studies"), exist_ok=True)
os.makedirs(os.path.join("uploads", "press"), exist_ok=True)
os.makedirs(os.path.join("uploads", "vision-mission"), exist_ok=True)
os.makedirs(os.path.join("uploads", "roadmap"), exist_ok=True)
os.makedirs(os.path.join("uploads", "milestones"), exist_ok=True)
os.makedirs(os.path.join("uploads", "infrastructure"), exist_ok=True)
os.makedirs(os.path.join("uploads", "partners"), exist_ok=True)

# Mount media directory
app.mount("/api/public/media", StaticFiles(directory="uploads"), name="media")

# CRUD and Auth routers prefixed with /api/v1 to match frontend CMS expectations
app.include_router(auth_router, prefix="/api/v1")
app.include_router(event_router, prefix="/api/v1")
app.include_router(incubator_card_router, prefix="/api/v1")
app.include_router(page_section_router, prefix="/api/v1")
app.include_router(startup_router, prefix="/api/v1")
app.include_router(startup_portfolio_router)
# Board and Team routers use explicit full paths in their decorators
app.include_router(board_router)
app.include_router(team_router)
app.include_router(mentor_router)
app.include_router(case_study_router)
app.include_router(press_router)
app.include_router(vision_roadmap_router)
app.include_router(infrastructure_router)
app.include_router(partner_router)
app.include_router(impact_metric_router)


@app.get("/health", tags=["health"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}
