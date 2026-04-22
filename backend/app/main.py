from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.database import engine, Base
from app.routers import optimize, history, config, tools


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="MyZero API",
    description="AI Academic Writing Assistant API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS - allow frontend to access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(optimize.router, prefix="/api")
app.include_router(history.router, prefix="/api")
app.include_router(config.router, prefix="/api")
app.include_router(tools.router, prefix="/api")


@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}


if __name__ == "__main__":
    import uvicorn
    from app.config import get_settings
    
    settings = get_settings()
    uvicorn.run(
        "app.main:app",
        host=settings.server_host,
        port=settings.server_port,
        reload=settings.debug
    )
