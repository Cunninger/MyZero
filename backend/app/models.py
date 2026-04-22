from sqlalchemy import Column, Integer, String, Text, DateTime, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class OptimizationRecord(Base):
    __tablename__ = "optimization_records"
    
    id = Column(Integer, primary_key=True, index=True)
    original_text = Column(Text, nullable=False)
    optimized_text = Column(Text, nullable=True)
    mode = Column(String(20), nullable=False)
    status = Column(String(20), default="pending")
    total_segments = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # 关系
    segments = relationship("OptimizationSegment", back_populates="record", cascade="all, delete-orphan")
    changes = relationship("ChangeLog", back_populates="record", cascade="all, delete-orphan")


class OptimizationSegment(Base):
    """优化段落表"""
    __tablename__ = "optimization_segments"
    
    id = Column(Integer, primary_key=True, index=True)
    record_id = Column(Integer, ForeignKey("optimization_records.id"), index=True)
    segment_index = Column(Integer, index=True)
    stage = Column(String(50), default="optimize")  # 'optimize'
    original_text = Column(Text, nullable=False)
    polished_text = Column(Text, nullable=True)  # Stage 1 (polish) result
    optimized_text = Column(Text, nullable=True)  # Final result
    status = Column(String(50), default="pending")  # 'pending', 'processing', 'completed', 'failed'
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # 关系
    record = relationship("OptimizationRecord", back_populates="segments")


class ChangeLog(Base):
    """变更对照记录表"""
    __tablename__ = "change_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    record_id = Column(Integer, ForeignKey("optimization_records.id"), index=True)
    segment_index = Column(Integer, index=True)
    stage = Column(String(50), default="optimize")
    before_text = Column(Text, nullable=False)
    after_text = Column(Text, nullable=False)
    changes_detail = Column(Text, nullable=True)  # JSON格式的详细变更
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 关系
    record = relationship("OptimizationRecord", back_populates="changes")


class AppConfig(Base):
    __tablename__ = "app_config"
    
    id = Column(Integer, primary_key=True)
    api_key = Column(String(255), default="")
    base_url = Column(String(255), default="https://api.openai.com/v1")
    model_name = Column(String(100), default="gpt-3.5-turbo")
    temperature = Column(Float, default=0.7)
    max_tokens = Column(Integer, default=4096)
    default_mode = Column(String(20), default="combined")
    dark_mode = Column(Boolean, default=False)
    api_request_interval = Column(Integer, default=6)
    mineru_api_token = Column(String(255), default="")
