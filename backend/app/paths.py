import os
import sys


MYZERO_VERSION = "1.0.6"


def is_frozen() -> bool:
    return getattr(sys, 'frozen', False)


def get_bundle_dir() -> str:
    if is_frozen():
        return sys._MEIPASS
    return os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def get_static_dir() -> str:
    if is_frozen():
        return os.path.join(sys._MEIPASS, "static")
    project_root = os.path.dirname(get_bundle_dir())
    return os.path.join(project_root, "frontend", "dist")


def get_data_dir() -> str:
    if is_frozen():
        return os.path.dirname(sys.executable)
    return os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def get_database_path() -> str:
    return os.path.join(get_data_dir(), "myzero.db")


def get_env_path() -> str:
    return os.path.join(get_data_dir(), ".env")
