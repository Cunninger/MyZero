"""Statistics router for usage analytics."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.stats_service import stats_service

router = APIRouter(prefix="/stats", tags=["statistics"])


@router.get("/summary")
async def get_summary(db: Session = Depends(get_db)):
    """Get overall usage summary."""
    return stats_service.get_summary(db)


@router.get("/trend")
async def get_trend(
    days: int = Query(30, description="Number of days to retrieve", ge=1, le=365),
    db: Session = Depends(get_db)
):
    """Get usage trend for the last N days."""
    return stats_service.get_trend(days, db)
