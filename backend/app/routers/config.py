from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict

from app.database import get_db
from app.models import AppConfig
from app.schemas import ConfigUpdate, ConfigResponse
from app.services.ai_service import ai_service
from app.services.prompt_template_service import prompt_template_service

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

    # Invalidate AI service config cache
    ai_service.invalidate_config_cache()

    return config


@router.post("/test")
async def test_api_connection(db: Session = Depends(get_db)):
    """Test AI API connection."""
    result = await ai_service.test_connection()
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result.get("error", "Connection failed"))
    return result


@router.get("/templates")
async def list_templates() -> Dict[str, List[Dict]]:
    """List all available prompt templates grouped by category."""
    return prompt_template_service.get_categories()


@router.get("/templates/{template_id}")
async def get_template(template_id: str):
    """Get a specific prompt template by ID."""
    template = prompt_template_service.get_template(template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template


@router.put("/active-template")
async def set_active_template(
    template_id: str,
    db: Session = Depends(get_db)
):
    """Set the active prompt template."""
    template = prompt_template_service.get_template(template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    config = get_or_create_config(db)
    config.active_template_id = template_id
    db.commit()

    # Invalidate AI service config cache
    ai_service.invalidate_config_cache()

    return {"template_id": template_id, "name": template["name"]}
