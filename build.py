"""MyZero build script — orchestrates frontend build + PyInstaller + Inno Setup."""

import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).parent


def get_backend_version() -> str:
    content = (ROOT / "backend" / "app" / "paths.py").read_text(encoding="utf-8")
    match = re.search(r'MYZERO_VERSION\s*=\s*"([^"]+)"', content)
    if not match:
        print("ERROR: Cannot find MYZERO_VERSION in backend/app/paths.py")
        sys.exit(1)
    return match.group(1)


def get_frontend_version() -> str:
    import json
    pkg = json.loads((ROOT / "frontend" / "package.json").read_text(encoding="utf-8"))
    return pkg.get("version", "")


def step(msg):
    print(f"\n{'='*60}\n  {msg}\n{'='*60}")


def main():
    installer_only = "--installer-only" in sys.argv

    step("Checking version alignment")
    be_ver = get_backend_version()
    fe_ver = get_frontend_version()
    print(f"  backend version: {be_ver}")
    print(f"  frontend version: {fe_ver}")
    if be_ver != fe_ver:
        print(f"ERROR: Version mismatch! backend={be_ver} frontend={fe_ver}")
        print("Update frontend/package.json version to match backend/app/paths.py")
        sys.exit(1)

    if not installer_only:
        step("Building frontend")
        subprocess.run(
            ["npm", "run", "build"],
            cwd=str(ROOT / "frontend"),
            check=True,
            shell=True,
        )
        dist_index = ROOT / "frontend" / "dist" / "index.html"
        if not dist_index.exists():
            print("ERROR: frontend/dist/index.html not found after build")
            sys.exit(1)
        print(f"  OK: {dist_index}")

        step("Cleaning previous build artifacts")
        for d in [ROOT / "build", ROOT / "dist"]:
            if d.exists():
                shutil.rmtree(d)
                print(f"  Removed {d}")

        step("Running PyInstaller")
        subprocess.run(
            ["pyinstaller", "myzero.spec", "--clean", "--noconfirm"],
            cwd=str(ROOT),
            check=True,
            shell=True,
        )
        exe_path = ROOT / "dist" / "MyZero" / "MyZero.exe"
        if not exe_path.exists():
            print("ERROR: dist/MyZero/MyZero.exe not found after PyInstaller")
            sys.exit(1)
        print(f"  OK: {exe_path}")

        step("Copying runtime assets")
        env_example = ROOT / "backend" / ".env.example"
        env_dest = ROOT / "dist" / "MyZero" / ".env"
        if env_example.exists():
            shutil.copy2(env_example, env_dest)
            print(f"  Copied .env.example -> .env")

    # Inno Setup (optional)
    step("Checking for Inno Setup")
    iss_path = ROOT / "installer.iss"
    if not iss_path.exists():
        print("  installer.iss not found, skipping installer build")
        return

    # Try to find ISCC
    iscc_candidates = ["ISCC"]
    inno_dir = Path(r"C:\Program Files (x86)\Inno Setup 6")
    if inno_dir.exists():
        iscc_candidates.insert(0, str(inno_dir / "ISCC.exe"))

    iscc = None
    for candidate in iscc_candidates:
        try:
            result = subprocess.run(
                [candidate, "/?"],
                capture_output=True,
                timeout=5,
                shell=True,
            )
            if result.returncode == 0:
                iscc = candidate
                break
        except (FileNotFoundError, subprocess.TimeoutExpired):
            continue

    if iscc is None:
        print("  ISCC not found. Install Inno Setup 6 to build the installer.")
        print("  Download: https://jrsoftware.org/isdl.php")
        return

    step("Building installer with Inno Setup")
    subprocess.run(
        [iscc, str(iss_path)],
        cwd=str(ROOT),
        check=True,
        shell=True,
    )

    version = be_ver
    installer = ROOT / "output" / f"MyZero-Setup-{version}.exe"
    if installer.exists():
        size_mb = installer.stat().st_size / (1024 * 1024)
        print(f"\n  SUCCESS: {installer} ({size_mb:.1f} MB)")
    else:
        print(f"\n  WARNING: Expected installer not found at {installer}")

    step("Build complete")
    print(f"  Version:     {version}")
    print(f"  Exe folder:  {ROOT / 'dist' / 'MyZero'}")
    if installer.exists():
        print(f"  Installer:   {installer}")


if __name__ == "__main__":
    main()
