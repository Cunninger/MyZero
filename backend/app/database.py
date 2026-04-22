from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# Use SQLite in backend directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'myzero.db')}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False
)

# Enable foreign keys for SQLite
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_conn, connection_record):
    cursor = dbapi_conn.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def _migrate_db():
    """Add new columns to existing tables."""
    from sqlalchemy import text, inspect
    with engine.connect() as conn:
        inspector = inspect(engine)
        # Add polished_text to optimization_segments
        cols = [c['name'] for c in inspector.get_columns('optimization_segments')]
        if 'polished_text' not in cols:
            conn.execute(text("ALTER TABLE optimization_segments ADD COLUMN polished_text TEXT"))
            conn.commit()
        # Add api_request_interval to app_config
        cols = [c['name'] for c in inspector.get_columns('app_config')]
        if 'api_request_interval' not in cols:
            conn.execute(text("ALTER TABLE app_config ADD COLUMN api_request_interval INTEGER DEFAULT 6"))
            conn.commit()
        if 'mineru_api_token' not in cols:
            conn.execute(text("ALTER TABLE app_config ADD COLUMN mineru_api_token VARCHAR(255) DEFAULT ''"))
            conn.commit()


_migrate_db()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
