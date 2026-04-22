import httpx
import re
import json
from typing import Optional, List, Dict, Any, Callable
from app.config import get_settings


PROMPT_TEMPLATES = {
    "polish": """你是一位专业的学术写作编辑。请对以下论文段落进行润色，改善语言表达、逻辑结构和学术规范性，但保持原意不变。

要求：
- 使用正式的学术语言
- 优化句式结构，避免重复
- 确保术语使用准确
- 保持段落间的连贯性
- 纯文本输出：只输出修改后的文本，禁止使用 Markdown 格式（如 **加粗**、## 标题、```代码块```、* 列表等），禁止附加任何解释、注释或标签

重要提示：只输出润色后的纯文本内容，保持与原文段落相同的结构和字数，禁止使用任何 Markdown 格式标记。

原文：
{text}""",

    "humanize": """你是一位专业的学术写作专家。请对以下文本进行改写，使其更像人类写作的学术论文，降低被 AI 检测工具识别的概率。

要求：
- 改变句式结构，使用更多样化的表达方式
- 替换常见的 AI 生成词汇和短语
- 增加自然的过渡和连接词
- 保持学术严谨性和专业性
- 可以适当增加个人见解和分析
- 纯文本输出：只输出改写后的文本，禁止使用 Markdown 格式（如 **加粗**、## 标题、```代码块```、* 列表等），禁止附加任何解释、注释或标签

重要提示：只输出改写后的纯文本内容，保持与原文段落相同的结构和字数，禁止使用任何 Markdown 格式标记。

原文：
{text}""",

    "combined": """你是一位专业的学术写作编辑和 AI 检测规避专家。请对以下论文段落进行全面优化：

1. 改善语言表达和学术规范性
2. 调整句式结构，降低 AI 生成特征
3. 增强内容的原创性和独特性

要求：
- 保持原意和学术严谨性
- 使用自然、多样的表达方式
- 避免常见的 AI 生成模式
- 纯文本输出：只输出优化后的文本，禁止使用 Markdown 格式（如 **加粗**、## 标题、```代码块```、* 列表等），禁止附加任何解释、注释或标签

重要提示：只输出优化后的纯文本内容，保持与原文段落相同的结构和字数，禁止使用任何 Markdown 格式标记。

原文：
{text}"""
}

# Stage-specific prompts for two-stage processing
POLISH_STAGE_PROMPT = """你是一位专业的学术写作编辑。请对以下论文段落进行润色，改善语言表达、逻辑结构和学术规范性，但保持原意不变。

要求：
- 使用正式的学术语言
- 优化句式结构，避免重复
- 确保术语使用准确
- 保持段落间的连贯性
- 纯文本输出：只输出修改后的文本，禁止使用 Markdown 格式（如 **加粗**、## 标题、```代码块```、* 列表等），禁止附加任何解释、注释或标签

重要提示：只输出润色后的纯文本内容，保持与原文段落相同的结构和字数，禁止使用任何 Markdown 格式标记。

原文：
{text}"""

ENHANCE_STAGE_PROMPT = """你是一位专业的学术写作专家。请对以下已经润色过的文本进一步改写，使其更像人类写作的学术论文，显著降低被 AI 检测工具识别的概率。

要求：
- 大幅改变句式结构，使用更多样化的表达方式
- 替换所有常见的 AI 生成词汇和短语
- 增加自然的过渡和连接词
- 适当加入个人化的表达和独特见解
- 保持学术严谨性和专业性
- 纯文本输出：只输出改写后的文本，禁止使用 Markdown 格式（如 **加粗**、## 标题、```代码块```、* 列表等），禁止附加任何解释、注释或标签

重要提示：只输出改写后的纯文本内容，保持与原文段落相同的结构和字数，禁止使用任何 Markdown 格式标记。

原文：
{text}"""

COMPRESS_PROMPT = """你是一位文本风格分析专家。请分析以下已处理的段落，提取出关键的写作风格特征、术语使用习惯和表达偏好。
压缩后的内容应保留核心风格特征，不超过原文的30%。请直接输出压缩后的风格摘要，不要附加解释。"""

# Threshold for skipping short segments (titles, separators)
SEGMENT_SKIP_THRESHOLD = 15

SYSTEM_MESSAGE = "You are a professional academic writing assistant. You must output ONLY plain text. Never use Markdown formatting (no **bold**, no ## headings, no ```code blocks```, no * bullet points). Output the revised text directly."


def count_text_length(text: str) -> int:
    """Count meaningful text characters (Chinese chars + English letters)."""
    return sum(1 for c in text if '一' <= c <= '鿿' or c.isalpha())


def _clean_thinking_tags(text: str) -> str:
    """Remove <think/thinking> tags and Markdown formatting from AI output."""
    text = re.sub(r'<think(?:ing)?[^>]*>.*?</think(?:ing)?>', '', text, flags=re.DOTALL)
    text = re.sub(r'<think(?:ing)?[^>]*>.*', '', text, flags=re.DOTALL)
    text = re.sub(r'^#{1,6}\s+', '', text, flags=re.MULTILINE)
    text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)
    text = re.sub(r'\*(.+?)\*', r'\1', text)
    text = re.sub(r'^```[\s\S]*?```', '', text, flags=re.MULTILINE)
    text = re.sub(r'`(.+?)`', r'\1', text)
    return text.strip()


def _filter_thinking_stream(buffer: str, in_thinking: bool) -> tuple:
    """Filter thinking tags from streaming buffer. Returns (clean_text, remaining_buffer, in_thinking)."""
    TAG_BUFFER = 20
    clean = ""

    while buffer:
        if in_thinking:
            close_idx = -1
            for tag in ["</think", "</thinking>"]:
                idx = buffer.find(tag)
                if idx != -1 and (close_idx == -1 or idx < close_idx):
                    close_idx = idx
            if close_idx != -1:
                close_end = buffer.find(">", close_idx)
                if close_end != -1:
                    buffer = buffer[close_end + 1:]
                    in_thinking = False
                    continue
                else:
                    break
            else:
                if len(buffer) > TAG_BUFFER:
                    buffer = buffer[-TAG_BUFFER:]
                break
        else:
            open_idx = -1
            for tag in ["<think", "<thinking>"]:
                idx = buffer.find(tag)
                if idx != -1 and (open_idx == -1 or idx < open_idx):
                    open_idx = idx
            if open_idx != -1:
                clean += buffer[:open_idx]
                buffer = buffer[open_idx:]
                in_thinking = True
                continue
            else:
                if len(buffer) > TAG_BUFFER:
                    safe = buffer[:-TAG_BUFFER]
                    clean += safe
                    buffer = buffer[-TAG_BUFFER:]
                else:
                    break

    return clean, buffer, in_thinking


class AIService:
    def __init__(self):
        self._settings = get_settings()

    def _get_db_config(self) -> Optional[Dict[str, Any]]:
        """Read config from DB app_config table."""
        try:
            from app.database import SessionLocal
            from app.models import AppConfig
            db = SessionLocal()
            try:
                config = db.query(AppConfig).filter(AppConfig.id == 1).first()
                if config and config.api_key:
                    return {
                        "api_key": config.api_key,
                        "base_url": config.base_url,
                        "model_name": config.model_name,
                        "temperature": config.temperature,
                        "max_tokens": config.max_tokens,
                        "api_request_interval": config.api_request_interval or 0,
                    }
            finally:
                db.close()
        except Exception:
            pass
        return None

    def _get_api_key(self):
        db_config = self._get_db_config()
        if db_config and db_config["api_key"]:
            return db_config["api_key"]
        return self._settings.openai_api_key

    def _get_base_url(self):
        db_config = self._get_db_config()
        if db_config and db_config["base_url"]:
            return db_config["base_url"].rstrip('/')
        return self._settings.openai_base_url.rstrip('/')

    def _get_model(self, mode: str):
        db_config = self._get_db_config()
        if db_config and db_config["model_name"]:
            return db_config["model_name"]
        if mode == "polish" and self._settings.polish_model:
            return self._settings.polish_model
        elif mode in ("humanize", "enhance") and self._settings.humanize_model:
            return self._settings.humanize_model
        return self._settings.openai_model

    def _get_temperature(self):
        db_config = self._get_db_config()
        if db_config and db_config.get("temperature") is not None:
            return db_config["temperature"]
        return 0.7

    def _get_max_tokens(self):
        db_config = self._get_db_config()
        if db_config and db_config.get("max_tokens") is not None:
            return db_config["max_tokens"]
        return 4096

    def _get_api_request_interval(self) -> int:
        db_config = self._get_db_config()
        if db_config and db_config.get("api_request_interval") is not None:
            return db_config["api_request_interval"]
        return self._settings.api_request_interval

    def _build_messages(self, text: str, stage: str, history: List[Dict] = None) -> List[Dict]:
        """Build messages array with history for API call."""
        messages = list(history or [])
        messages.append({"role": "system", "content": SYSTEM_MESSAGE})

        if stage == "polish":
            prompt = POLISH_STAGE_PROMPT
        elif stage == "enhance":
            prompt = ENHANCE_STAGE_PROMPT
        else:
            prompt = PROMPT_TEMPLATES.get(stage, PROMPT_TEMPLATES["combined"])

        messages.append({"role": "user", "content": prompt.format(text=text)})
        return messages

    def split_text_into_segments(self, text: str, max_length: int = 500) -> List[Dict[str, Any]]:
        """Split text into segments by single newline, then by sentence for long paragraphs."""
        paragraphs = text.split('\n')
        segments = []

        for para in paragraphs:
            para = para.strip()
            if not para:
                continue

            if count_text_length(para) <= max_length:
                is_title = count_text_length(para) < SEGMENT_SKIP_THRESHOLD
                segments.append({"text": para, "is_title": is_title})
            else:
                sentences = re.split(r'([。!?;])', para)
                current = ""
                for i in range(0, len(sentences), 2):
                    sentence = sentences[i]
                    if i + 1 < len(sentences):
                        sentence += sentences[i + 1]
                    if count_text_length(current + sentence) <= max_length:
                        current += sentence
                    else:
                        if current:
                            segments.append({"text": current, "is_title": False})
                        current = sentence
                if current:
                    segments.append({"text": current, "is_title": False})

        if not segments and text.strip():
            segments.append({"text": text.strip(), "is_title": count_text_length(text.strip()) < SEGMENT_SKIP_THRESHOLD})

        return segments

    def optimize_segment_with_history_sync(
        self,
        text: str,
        stage: str,
        history: List[Dict] = None,
        on_chunk: Callable[[str], None] = None,
    ) -> str:
        """Optimize a segment with optional history context and streaming.

        Args:
            text: The segment text to optimize.
            stage: Processing stage - 'polish', 'enhance', or a mode like 'polish'/'humanize'/'combined'.
            history: Optional list of previous segment results as message dicts.
            on_chunk: Optional callback for streaming text chunks.
        """
        api_key = self._get_api_key()
        base_url = self._get_base_url()
        model = self._get_model(stage)
        temperature = self._get_temperature()
        max_tokens = self._get_max_tokens()

        if not api_key:
            raise ValueError("API key not configured")

        messages = self._build_messages(text, stage, history)
        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        if on_chunk:
            payload["stream"] = True
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }

        if on_chunk:
            # Streaming mode
            full_text = ""
            in_thinking = False
            buffer = ""

            with httpx.Client(timeout=120.0, trust_env=False) as client:
                with client.stream("POST", f"{base_url}/chat/completions",
                                   json=payload, headers=headers) as response:
                    response.raise_for_status()
                    for line in response.iter_lines():
                        if not line or not line.startswith("data: "):
                            continue
                        chunk_data = line[6:]
                        if chunk_data.strip() == "[DONE]":
                            break
                        try:
                            data = json.loads(chunk_data)
                            delta = data.get("choices", [{}])[0].get("delta", {})
                            content = delta.get("content", "")
                            if content:
                                buffer += content
                                clean, buffer, in_thinking = _filter_thinking_stream(buffer, in_thinking)
                                if clean:
                                    full_text += clean
                                    on_chunk(clean)
                        except (json.JSONDecodeError, IndexError):
                            continue

            # Flush remaining buffer
            if buffer and not in_thinking:
                clean = _clean_thinking_tags(buffer)
                full_text += clean
                on_chunk(clean)

            return _clean_thinking_tags(full_text)
        else:
            # Non-streaming mode
            with httpx.Client(timeout=120.0, trust_env=False) as client:
                response = client.post(
                    f"{base_url}/chat/completions",
                    headers=headers,
                    json=payload,
                )
                response.raise_for_status()
                data = response.json()

                if "choices" not in data or not data["choices"]:
                    raise ValueError("Invalid API response")

                result = data["choices"][0]["message"]["content"].strip()
                return _clean_thinking_tags(result)

    def optimize_segment_sync(self, text: str, mode: str = "combined") -> str:
        """Legacy method: optimize a single segment (backward compatible)."""
        return self.optimize_segment_with_history_sync(text, mode)

    def compress_history_sync(self, history: List[Dict], stage: str = "polish") -> List[Dict]:
        """Compress history into a summary to reduce context length."""
        if not history or len(history) <= 2:
            return history

        api_key = self._get_api_key()
        base_url = self._get_base_url()
        model = self._get_model(stage)

        if not api_key:
            return history[-2:]

        contents = []
        for msg in history:
            if msg.get("role") in ("assistant", "system") and msg.get("content"):
                contents.append(msg["content"])

        if not contents:
            return history

        joined = "\n\n---段落分隔---\n\n".join(contents[-10:])  # Only compress last 10

        try:
            with httpx.Client(timeout=60.0, trust_env=False) as client:
                response = client.post(
                    f"{base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": model,
                        "messages": [
                            {"role": "system", "content": COMPRESS_PROMPT},
                            {"role": "user", "content": f"以下是已处理的段落：\n\n{joined}"}
                        ],
                        "temperature": 0.3,
                        "max_tokens": 1000,
                    },
                )
                response.raise_for_status()
                data = response.json()
                if "choices" in data and data["choices"]:
                    summary = data["choices"][0]["message"]["content"].strip()
                    return [{"role": "system", "content": f"[已处理段落的风格摘要]\n{summary}"}]
        except Exception:
            pass

        return history[-2:]

    def chat_completion(self, system_prompt: str, user_message: str, temperature: float = None) -> str:
        """Direct chat completion with custom system prompt (not wrapped by text optimization prompts)."""
        api_key = self._get_api_key()
        base_url = self._get_base_url()
        model = self._get_model("combined")

        if not api_key:
            raise ValueError("API key not configured")

        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            "temperature": temperature if temperature is not None else self._get_temperature(),
            "max_tokens": self._get_max_tokens(),
        }

        with httpx.Client(timeout=120.0, trust_env=False) as client:
            response = client.post(
                f"{base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json=payload,
            )
            response.raise_for_status()
            data = response.json()

            if "choices" not in data or not data["choices"]:
                raise ValueError("Invalid API response")

            result = data["choices"][0]["message"]["content"].strip()
            # Only strip thinking tags, preserve code blocks
            result = re.sub(r'<think(?:ing)?[^>]*>.*?</think(?:ing)?>', '', result, flags=re.DOTALL)
            result = re.sub(r'<think(?:ing)?[^>]*>.*', '', result, flags=re.DOTALL)
            return result.strip()

    async def optimize_segment(self, text: str, mode: str = "combined") -> str:
        """Async version of optimize_segment."""
        return self.optimize_segment_sync(text, mode)

    async def optimize_text(self, text: str, mode: str = "combined") -> str:
        """Optimize text using AI API (single segment)."""
        return await self.optimize_segment(text, mode)

    async def optimize_text_segments(self, text: str, mode: str = "combined") -> List[Dict[str, str]]:
        """Optimize text by segments."""
        segments = self.split_text_into_segments(text)
        results = []
        for seg in segments:
            if seg["is_title"]:
                results.append({"original": seg["text"], "optimized": seg["text"]})
            else:
                optimized = await self.optimize_segment(seg["text"], mode)
                results.append({"original": seg["text"], "optimized": optimized})
        return results

    def compute_changes_detail(self, before: str, after: str) -> Dict[str, Any]:
        """Compute detailed changes between before and after text."""
        import difflib
        diff = list(difflib.ndiff(before.split(), after.split()))
        removed = [item[2:] for item in diff if item.startswith('- ')]
        added = [item[2:] for item in diff if item.startswith('+ ')]
        return {
            "before_length": len(before),
            "after_length": len(after),
            "length_delta": len(after) - len(before),
            "removed_words": removed[:20],
            "added_words": added[:20],
            "removed_count": len(removed),
            "added_count": len(added),
        }

    async def test_connection(self):
        """Test API connection."""
        try:
            api_key = self._get_api_key()
            base_url = self._get_base_url()
            if not api_key:
                return {"success": False, "error": "API key not configured"}
            async with httpx.AsyncClient(timeout=30.0, trust_env=False) as client:
                response = await client.get(
                    f"{base_url}/models",
                    headers={"Authorization": f"Bearer {api_key}"}
                )
                response.raise_for_status()
                return {"success": True, "message": "Connection successful"}
        except Exception as e:
            return {"success": False, "error": str(e)}


# Singleton instance
ai_service = AIService()
