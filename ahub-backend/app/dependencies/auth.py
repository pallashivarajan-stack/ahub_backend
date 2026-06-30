from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.jwt_handler import verify_token
from app.database.session import get_db
from app.models.admin import Admin

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_admin(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    db: Annotated[Session, Depends(get_db)],
) -> Admin:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None:
        raise credentials_exception

    token_data = verify_token(credentials.credentials)

    if token_data is None:
        raise credentials_exception

    admin = db.scalar(select(Admin).where(Admin.email == token_data.sub))

    if admin is None:
        raise credentials_exception

    return admin
