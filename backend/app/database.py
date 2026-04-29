from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base

from app.paths import get_database_path

DATABASE_URL = f"sqlite:///{get_database_path()}"

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
        # Skip if tables don't exist yet (first run / fresh install)
        if not inspector.has_table('optimization_segments'):
            return
        # Add polished_text to optimization_segments
        cols = [c['name'] for c in inspector.get_columns('optimization_segments')]
        if 'polished_text' not in cols:
            conn.execute(text("ALTER TABLE optimization_segments ADD COLUMN polished_text TEXT"))
            conn.commit()
        # Add api_request_interval to app_config
        if not inspector.has_table('app_config'):
            return
        cols = [c['name'] for c in inspector.get_columns('app_config')]
        if 'api_request_interval' not in cols:
            conn.execute(text("ALTER TABLE app_config ADD COLUMN api_request_interval INTEGER DEFAULT 6"))
            conn.commit()
        if 'mineru_api_token' not in cols:
            conn.execute(text("ALTER TABLE app_config ADD COLUMN mineru_api_token VARCHAR(255) DEFAULT ''"))
            conn.commit()
        if 'prompt_templates' not in cols:
            conn.execute(text("ALTER TABLE app_config ADD COLUMN prompt_templates TEXT"))
            conn.commit()
        if 'active_template_id' not in cols:
            conn.execute(text("ALTER TABLE app_config ADD COLUMN active_template_id VARCHAR(50) DEFAULT 'default'"))
            conn.commit()
        if 'segment_max_length' not in cols:
            conn.execute(text("ALTER TABLE app_config ADD COLUMN segment_max_length INTEGER DEFAULT 500"))
            conn.commit()
        if 'segment_skip_threshold' not in cols:
            conn.execute(text("ALTER TABLE app_config ADD COLUMN segment_skip_threshold INTEGER DEFAULT 15"))
            conn.commit()
        if 'api_timeout' not in cols:
            conn.execute(text("ALTER TABLE app_config ADD COLUMN api_timeout INTEGER DEFAULT 120"))
            conn.commit()
        if 'compression_threshold' not in cols:
            conn.execute(text("ALTER TABLE app_config ADD COLUMN compression_threshold INTEGER DEFAULT 5000"))
            conn.commit()


_migrate_db()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
