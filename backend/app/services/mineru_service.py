import httpx
import time
import re
import zipfile
import io
from typing import Optional, Callable

MINERU_BASE_URL = "https://mineru.net"

MINERU_EXTENSIONS = {"pdf", "png", "jpg", "jpeg", "jp2", "webp", "gif", "bmp", "ppt", "pptx"}


def needs_mineru(filename: str) -> bool:
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    return ext in MINERU_EXTENSIONS


class MinerUService:
    def _get_token(self) -> Optional[str]:
        try:
            from app.database import SessionLocal
            from app.models import AppConfig
            db = SessionLocal()
            try:
                config = db.query(AppConfig).filter(AppConfig.id == 1).first()
                if config and hasattr(config, 'mineru_api_token') and config.mineru_api_token:
                    return config.mineru_api_token
            finally:
                db.close()
        except Exception:
            pass
        return None

    def parse_file(self, file_bytes: bytes, filename: str, on_progress: Callable[[str], None] = None) -> str:
        token = self._get_token()
        if token:
            return self._parse_precise(file_bytes, filename, token, on_progress)
        return self._parse_agent(file_bytes, filename, on_progress)

    # --- Agent Lightweight API (no token) ---

    def _parse_agent(self, file_bytes: bytes, filename: str, on_progress=None) -> str:
        with httpx.Client(timeout=30.0, trust_env=False) as client:
            if on_progress:
                on_progress("提交解析任务...")

            resp = client.post(
                f"{MINERU_BASE_URL}/api/v1/agent/parse/file",
                json={"file_name": filename, "language": "ch"},
            )
            data = resp.json()
            if data.get("code") != 0:
                raise ValueError(f"MinerU 提交失败: {data.get('msg', '未知错误')}")

            task_id = data["data"]["task_id"]
            file_url = data["data"]["file_url"]

            if on_progress:
                on_progress("上传文件...")

            put_resp = client.put(file_url, data=file_bytes, timeout=60.0)
            if put_resp.status_code not in (200, 201):
                raise ValueError(f"文件上传失败: HTTP {put_resp.status_code}")

            return self._poll_agent(client, task_id, on_progress)

    def _poll_agent(self, client, task_id, on_progress, timeout=300, interval=3):
        start = time.time()
        while time.time() - start < timeout:
            resp = client.get(f"{MINERU_BASE_URL}/api/v1/agent/parse/{task_id}")
            data = resp.json()
            state = data.get("data", {}).get("state", "")

            if state == "done":
                md_url = data["data"]["markdown_url"]
                if on_progress:
                    on_progress("下载解析结果...")
                md_resp = client.get(md_url, timeout=30.0)
                return self._md_to_text(md_resp.text)

            if state == "failed":
                err = data.get("data", {}).get("err_msg", "未知错误")
                raise ValueError(f"文档解析失败: {err}")

            if on_progress:
                labels = {
                    "waiting-file": "等待上传",
                    "uploading": "下载文件中",
                    "pending": "排队中...",
                    "running": "正在解析文档...",
                }
                on_progress(labels.get(state, "处理中..."))

            time.sleep(interval)

        raise TimeoutError("文档解析超时，请稍后重试")

    # --- Precise API (needs token) ---

    def _parse_precise(self, file_bytes, filename, token, on_progress=None):
        with httpx.Client(timeout=30.0, trust_env=False) as client:
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
            }

            if on_progress:
                on_progress("提交解析任务...")

            resp = client.post(
                f"{MINERU_BASE_URL}/api/v4/file-urls/batch",
                headers=headers,
                json={
                    "files": [{"name": filename}],
                    "model_version": "vlm",
                },
            )
            data = resp.json()
            if data.get("code") != 0:
                raise ValueError(f"MinerU 提交失败: {data.get('msg', '未知错误')}")

            batch_id = data["data"]["batch_id"]
            file_urls = data["data"]["file_urls"]

            if on_progress:
                on_progress("上传文件...")

            put_resp = client.put(file_urls[0], data=file_bytes, timeout=120.0)
            if put_resp.status_code not in (200, 201):
                raise ValueError(f"文件上传失败: HTTP {put_resp.status_code}")

            return self._poll_precise(client, batch_id, headers, on_progress)

    def _poll_precise(self, client, batch_id, headers, on_progress, timeout=600, interval=5):
        start = time.time()
        while time.time() - start < timeout:
            resp = client.get(
                f"{MINERU_BASE_URL}/api/v4/extract-results/batch/{batch_id}",
                headers=headers,
            )
            data = resp.json()
            results = data.get("data", {}).get("extract_result", [])

            if results:
                result = results[0]
                state = result.get("state", "")

                if state == "done":
                    zip_url = result["full_zip_url"]
                    if on_progress:
                        on_progress("下载解析结果...")
                    return self._download_zip(client, zip_url)

                if state == "failed":
                    err = result.get("err_msg", "未知错误")
                    raise ValueError(f"文档解析失败: {err}")

            if on_progress:
                on_progress("正在解析文档...")

            time.sleep(interval)

        raise TimeoutError("文档解析超时，请稍后重试")

    def _download_zip(self, client, zip_url):
        resp = client.get(zip_url, timeout=60.0)
        with zipfile.ZipFile(io.BytesIO(resp.content)) as zf:
            for name in zf.namelist():
                if name.endswith("full.md"):
                    return self._md_to_text(zf.read(name).decode("utf-8"))
        raise ValueError("解析结果中未找到内容")

    def _md_to_text(self, md: str) -> str:
        text = re.sub(r'!\[([^\]]*)\]\([^\)]+\)', r'\1', md)
        text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)
        text = re.sub(r'^#{1,6}\s+', '', text, flags=re.MULTILINE)
        text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)
        text = re.sub(r'\*(.+?)\*', r'\1', text)
        text = re.sub(r'`(.+?)`', r'\1', text)
        text = re.sub(r'^```[\s\S]*?```', '', text, flags=re.MULTILINE)
        text = re.sub(r'^---+$', '', text, flags=re.MULTILINE)
        text = re.sub(r'\|', ' ', text)
        text = re.sub(r'^[-:]+$', '', text, flags=re.MULTILINE)
        text = re.sub(r'\n{3,}', '\n\n', text)
        return text.strip()


mineru_service = MinerUService()
