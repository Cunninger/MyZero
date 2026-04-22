from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AppConfig
from app.schemas import ConfigUpdate, ConfigResponse
from app.services.ai_service import ai_service

router = APIRouter(prefix="/config", tags=["config"])


def get_or_create_config(db: Session):
    """Get existing config or create default."""
    config = db.query(AppConfig).filter(AppConfig.id == 1).first()
    if not config:
        config = AppConfig(id=1)
        db.add(config)
        db.commit()
        db.refresh(config)
    return config


@router.get("", response_model=ConfigResponse)
async def get_config(db: Session = Depends(get_db)):
    """Get current configuration."""
    config = get_or_create_config(db)
    return config


@router.put("", response_model=ConfigResponse)
async def update_config(update: ConfigUpdate, db: Session = Depends(get_db)):
    """Update configuration."""
    config = get_or_create_config(db)
    
    update_data = update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(config, field, value)
    
    db.commit()
    db.refresh(config)
    return config


@router.post("/test")
async def test_api_connection(db: Session = Depends(get_db)):
    """Test AI API connection."""
    result = await ai_service.test_connection()
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result.get("error", "Connection failed"))
    return result
