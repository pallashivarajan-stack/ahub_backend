from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.core.jwt_handler import create_access_token, create_refresh_token, verify_token
from app.database.session import get_db
from app.schemas.admin import AdminLogin, RefreshRequest, Token
from app.services.auth_service import authenticate_admin

router = APIRouter(prefix="/auth", tags=["auth"])


@router.options("/login")
async def login_options(request: Request) -> Response:
    origin = request.headers.get("origin", "*")
    return Response(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Max-Age": "600",
        },
    )


@router.post("/login", response_model=Token)
def login_admin(
    credentials: AdminLogin,
    db: Annotated[Session, Depends(get_db)],
) -> Token:
    admin = authenticate_admin(
        db=db,
        email=credentials.email,
        password=credentials.password,
    )

    if admin is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": admin.email})
    refresh_token = create_refresh_token(data={"sub": admin.email})

    return Token(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=Token)
def refresh_access_token(
    body: RefreshRequest,
    db: Annotated[Session, Depends(get_db)],
) -> Token:
    token_data = verify_token(body.refresh_token)

    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    from app.models.admin import Admin
    from sqlalchemy import select

    admin = db.scalar(select(Admin).where(Admin.email == token_data.sub))

    if admin is None or admin.status.value != "active":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin not found or inactive",
            headers={"WWW-Authenticate": "Bearer"},
        )

    new_access_token = create_access_token(data={"sub": admin.email})
    new_refresh_token = create_refresh_token(data={"sub": admin.email})

    return Token(access_token=new_access_token, refresh_token=new_refresh_token)
