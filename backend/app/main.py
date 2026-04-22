import os
import webbrowser
import threading

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.responses import FileResponse
from contextlib import asynccontextmanager

from app.database import engine, Base
from app.paths import get_static_dir, is_frozen, MYZERO_VERSION
from app.routers import optimize, history, config, tools


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="MyZero API",
    description="AI Academic Writing Assistant API",
    version=MYZERO_VERSION,
    lifespan=lifespan
)

if is_frozen():
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
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
    return {"status": "healthy", "version": MYZERO_VERSION}


# Serve frontend static files (must be after all API routes)
static_dir = get_static_dir()
if os.path.isdir(static_dir):
    assets_dir = os.path.join(static_dir, "assets")
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = os.path.join(static_dir, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(static_dir, "index.html"))


if __name__ == "__main__":
    import uvicorn
    from app.config import get_settings

    settings = get_settings()
    port = settings.server_port

    if is_frozen():
        def open_browser():
            import time
            time.sleep(1.5)
            webbrowser.open(f"http://localhost:{port}")
        threading.Thread(target=open_browser, daemon=True).start()

    uvicorn.run(
        "app.main:app",
        host=settings.server_host,
        port=port,
        reload=settings.debug if not is_frozen() else False
    )
