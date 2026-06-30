from sqlalchemy import text  #type:ignore

from app.database.connection import engine


with engine.connect() as conn:
    result = conn.execute(text("SELECT 1"))

    print(result.scalar())