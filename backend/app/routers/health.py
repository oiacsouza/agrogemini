from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db_session

router = APIRouter(prefix="/api/v1/health", tags=["Health"])


@router.get("/")
async def health_check(db: AsyncSession = Depends(get_db_session)):
    """API health check with database connection validation."""
    try:
        await db.execute(text("SELECT 1 FROM DUAL"))
        return {"status": "online", "database": "connected"}
    except Exception as e:
        return {"status": "online", "database": f"error: {str(e)}"}
