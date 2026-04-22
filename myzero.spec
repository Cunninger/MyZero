# -*- mode: python ; coding: utf-8 -*-

block_cipher = None

a = Analysis(
    ['backend/app/main.py'],
    pathex=['backend'],
    binaries=[],
    datas=[
        ('frontend/dist', 'static'),
    ],
    hiddenimports=[
        'uvicorn.logging',
        'uvicorn.loops',
        'uvicorn.loops.auto',
        'uvicorn.protocols',
        'uvicorn.protocols.http',
        'uvicorn.protocols.http.auto',
        'uvicorn.protocols.websockets',
        'uvicorn.protocols.websockets.auto',
        'uvicorn.lifespan',
        'uvicorn.lifespan.on',
        'app',
        'app.paths',
        'app.config',
        'app.database',
        'app.models',
        'app.schemas',
        'app.routers',
        'app.routers.optimize',
        'app.routers.history',
        'app.routers.config',
        'app.routers.tools',
        'app.services',
        'app.services.ai_service',
        'app.services.mineru_service',
        'app.services.text_processor',
        'app.services.tool_service',
        'sqlalchemy.dialects.sqlite',
        'multipart',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='MyZero',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=True,
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    name='MyZero',
)
