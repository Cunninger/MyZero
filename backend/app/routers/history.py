from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import OptimizationRecord
from app.schemas import HistoryItem

router = APIRouter(prefix="/history", tags=["history"])


@router.get("", response_model=List[HistoryItem])
async def get_history(
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """Get optimization history."""
    records = db.query(OptimizationRecord)\
        .order_by(OptimizationRecord.created_at.desc())\
        .offset(offset)\
        .limit(limit)\
        .all()
    return records


@router.get("/{record_id}", response_model=HistoryItem)
async def get_history_item(record_id: int, db: Session = Depends(get_db)):
    """Get single history item."""
    record = db.query(OptimizationRecord).filter(OptimizationRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    return record


@router.delete("/{record_id}")
async def delete_history_item(record_id: int, db: Session = Depends(get_db)):
    """Delete a history item."""
    record = db.query(OptimizationRecord).filter(OptimizationRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    
    db.delete(record)
    db.commit()
    return {"message": "Deleted successfully"}
