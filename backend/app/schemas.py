from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class TextOptimizeRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=50000, description="Input text to optimize")
    mode: str = Field(default="combined", pattern="^(polish|humanize|combined)$")


class SegmentResponse(BaseModel):
    """段落响应"""
    id: int
    segment_index: int
    stage: str
    original_text: str
    polished_text: Optional[str] = None
    optimized_text: Optional[str] = None
    status: str
    created_at: datetime
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class ChangeLogResponse(BaseModel):
    """变更对照响应"""
    id: int
    segment_index: int
    stage: str
    before_text: str
    after_text: str
    changes_detail: Optional[Dict[str, Any]] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class TextOptimizeResponse(BaseModel):
    id: int
    original_text: str
    optimized_text: Optional[str] = None
    mode: str
    status: str
    total_segments: int = 0
    error_message: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    segments: List[SegmentResponse] = []
    
    class Config:
        from_attributes = True


class RecordDetailResponse(TextOptimizeResponse):
    """记录详细响应（包含变更对照）"""
    changes: List[ChangeLogResponse] = []


class HistoryItem(BaseModel):
    id: int
    original_text: str
    optimized_text: Optional[str] = None
    mode: str
    status: str
    total_segments: int = 0
    created_at: datetime
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class ConfigUpdate(BaseModel):
    api_key: Optional[str] = None
    base_url: Optional[str] = None
    model_name: Optional[str] = None
    temperature: Optional[float] = Field(None, ge=0.0, le=2.0)
    max_tokens: Optional[int] = Field(None, ge=1, le=32000)
    default_mode: Optional[str] = Field(None, pattern="^(polish|humanize|combined)$")
    dark_mode: Optional[bool] = None
    api_request_interval: Optional[int] = Field(None, ge=0, le=60)
    mineru_api_token: Optional[str] = None
    active_template_id: Optional[str] = None


class ConfigResponse(BaseModel):
    api_key: str
    base_url: str
    model_name: str
    temperature: float
    max_tokens: int
    default_mode: str
    dark_mode: bool
    api_request_interval: int
    mineru_api_token: str
    active_template_id: str

    class Config:
        from_attributes = True


class ProgressUpdate(BaseModel):
    """进度更新"""
    record_id: int
    status: str
    progress: float = 0.0
    overall_progress: float = 0.0
    current_position: int = 0
    total_segments: int = 0
    stage_index: int = 0
    total_stages: int = 1
    error_message: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    version: str = "1.0.6"


class LatexConvertRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=50000, description="Input text to convert to LaTeX")
    template: Optional[str] = Field(default=None, description="Custom LaTeX template/prompt override")
    language: str = Field(default="zh", description="Language code: zh or en")


class LatexConvertResponse(BaseModel):
    latex_code: str = Field(..., description="Generated LaTeX code")
    warnings: List[str] = Field(default=[], description="Any warnings during conversion")


class MermaidGenerateRequest(BaseModel):
    description: str = Field(..., min_length=1, max_length=10000, description="Text description of the diagram")
    diagram_type: str = Field(default="auto", description="Diagram type hint: flowchart, sequence, class, state, er, gantt, auto")
    language: str = Field(default="zh", description="Language code: zh or en")


class MermaidGenerateResponse(BaseModel):
    mermaid_code: str = Field(..., description="Generated Mermaid diagram code")
    title: str = Field(default="", description="Suggested diagram title/caption")
