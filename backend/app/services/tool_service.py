import re
from typing import Optional
from app.services.ai_service import ai_service


DEFAULT_LATEX_TEMPLATE_ZH = """\
请你将以下文本转换为latex代码，标题层级分别为\\chapter, \\section, \\subsection。

要求：
1. 有序列表使用enumerate环境，无序列表使用itemize环境
2. 引用参考文献时使用\\cite命令
3. 图片使用figure环境，预留figs/文件夹路径，label格式为fig:X-Y
4. 行间公式使用equation环境，label格式为eq:X-Y，可用%TODO标记待填充
5. 表格使用table+tabular环境
6. 代码使用lstlisting环境，缩进4空格
7. latex换行需要空一行，请你在输出的代码中注意这一点
8. 使用数学环境和转义字符来处理公式和特殊字符
9. 所有图片、表格、代码都用\\label标记以便\\ref引用

输出格式：仅输出LaTeX代码块，不要解释。"""

DEFAULT_LATEX_TEMPLATE_EN = """\
Convert the following text to LaTeX code. Use \\chapter, \\section, \\subsection for headings.

Requirements:
1. Use enumerate for ordered lists, itemize for unordered
2. Use \\cite for references
3. Use figure environment with figs/ folder path, label format fig:X-Y
4. Use equation environment for math, label format eq:X-Y, use %TODO for placeholders
5. Use table+tabular for tables
6. Use lstlisting for code, 4-space indentation
7. LaTeX requires blank lines for paragraph breaks
8. Use math mode and escape sequences for formulas
9. Label all figures, tables, and code with \\label for \\ref

Output: LaTeX code block only, no explanations."""

MERMAID_KEYWORDS = ("graph ", "flowchart ", "sequenceDiagram", "classDiagram",
                    "stateDiagram", "erDiagram", "gantt ", "pie ", "gitgraph", "journey")

DEFAULT_MERMAID_TEMPLATE_ZH = """\
你是一个Mermaid图表代码生成器。根据用户的描述，生成可执行的Mermaid.js代码。

规则：
1. 使用合适的图表类型（flowchart/sequenceDiagram/classDiagram/stateDiagram/erDiagram/gantt等）
2. 节点文字简洁，不换行
3. 不使用代码注释（%%）
4. 使用中文标签

你必须且只能按以下格式输出，不要输出任何其他内容：

Caption: 图表标题

```mermaid
有效的mermaid代码
```

示例输出：

Caption: 用户登录流程时序图

```mermaid
sequenceDiagram
    participant 用户
    participant 系统
    用户->>系统: 输入账号密码
    系统->>系统: 验证信息
    alt 验证成功
        系统-->>用户: 登录成功
    else 验证失败
        系统-->>用户: 提示错误
    end
```"""

DEFAULT_MERMAID_TEMPLATE_EN = """\
You are a Mermaid diagram code generator. Generate executable Mermaid.js code from user descriptions.

Rules:
1. Choose appropriate diagram type (flowchart/sequenceDiagram/classDiagram/stateDiagram/erDiagram/gantt etc.)
2. Keep node text concise, no line breaks
3. No code comments (%%)
4. Use English labels

Output MUST follow this exact format, nothing else:

Caption: Diagram Title

```mermaid
valid mermaid code
```

Example output:

Caption: User Login Sequence Diagram

```mermaid
sequenceDiagram
    participant User
    participant System
    User->>System: Enter credentials
    System->>System: Validate
    alt Success
        System-->>User: Login success
    else Failure
        System-->>User: Show error
    end
```"""


class ToolService:
    async def convert_to_latex(self, text: str, template: Optional[str] = None, language: str = "zh") -> dict:
        """Convert text to LaTeX using AI."""
        system_prompt = template or (DEFAULT_LATEX_TEMPLATE_ZH if language == "zh" else DEFAULT_LATEX_TEMPLATE_EN)
        
        response = await ai_service.optimize_segment(
            text=f"System: {system_prompt}\n\nUser text: {text}",
            mode="combined"
        )
        
        latex_code = self._extract_code_block(response, "latex")
        if not latex_code:
            latex_code = response
            
        return {
            "latex_code": latex_code,
            "warnings": []
        }
    
    async def generate_mermaid(self, description: str, diagram_type: str = "auto", language: str = "zh") -> dict:
        """Generate Mermaid diagram from description."""
        import re as _re
        clean_desc = _re.sub(r'[\s/]+', ' ', description).strip()
        if not clean_desc or len(clean_desc) < 2:
            raise ValueError("描述内容为空，请输入有效的图表描述")

        system_prompt = DEFAULT_MERMAID_TEMPLATE_ZH if language == "zh" else DEFAULT_MERMAID_TEMPLATE_EN

        if language == "zh":
            type_hint = f"请生成{diagram_type}类型的图表。\n\n" if diagram_type != "auto" else ""
        else:
            type_hint = f"Please generate a {diagram_type} diagram.\n\n" if diagram_type != "auto" else ""

        user_message = f"{type_hint}{description}"

        # First attempt
        mermaid_code, title = self._attempt_mermaid_generation(system_prompt, user_message)

        # Retry with a more direct prompt if first attempt failed
        if not mermaid_code:
            retry_prompt = (
                "直接输出mermaid代码，不要输出任何其他文字。不要输出Caption。只输出mermaid代码。\n"
                f"根据以下描述生成{diagram_type}类型的mermaid图表代码：\n{description}"
            ) if language == "zh" else (
                "Output ONLY mermaid code. No caption, no explanation.\n"
                f"Generate a {diagram_type} mermaid diagram for: {description}"
            )
            mermaid_code, _ = self._attempt_mermaid_generation(
                "You are a mermaid code generator. Output ONLY raw mermaid code. No markdown, no explanation, no caption.",
                retry_prompt,
            )
            if not title:
                title = "Generated Diagram"

        if not mermaid_code:
            raise ValueError("AI 未能生成有效的 Mermaid 代码，请尝试更详细的描述")

        return {"mermaid_code": mermaid_code, "title": title}

    def _attempt_mermaid_generation(self, system_prompt: str, user_message: str):
        """Single attempt at generating mermaid code. Returns (code, title) or (None, title)."""
        response = ai_service.chat_completion(
            system_prompt=system_prompt,
            user_message=user_message,
            temperature=0.7,
        )

        print(f"[Mermaid DEBUG] user_message: {user_message[:200]}")
        print(f"[Mermaid DEBUG] AI response:\n{response}")

        title = self._extract_caption(response) or "Generated Diagram"

        # Try extracting from code block
        code = self._extract_code_block(response, "mermaid")
        print(f"[Mermaid DEBUG] extracted code block: {repr(code[:100]) if code else None}")
        if code and self._is_valid_mermaid(code):
            print(f"[Mermaid DEBUG] valid mermaid: True")
            return code, title

        # Try finding mermaid code directly in text
        code = self._extract_mermaid_direct(response)
        if code:
            print(f"[Mermaid DEBUG] direct extract: {repr(code[:100])}")
            return code, title

        # Last resort: check if the entire response is valid mermaid
        if response and self._is_valid_mermaid(response):
            return response, title

        print(f"[Mermaid DEBUG] no valid mermaid found")
        return None, title

    def _is_valid_mermaid(self, code: str) -> bool:
        """Check if code starts with a valid mermaid keyword."""
        first_line = code.strip().split('\n')[0].strip().lower()
        return any(first_line.startswith(kw.strip().lower()) for kw in MERMAID_KEYWORDS)

    def _extract_mermaid_direct(self, text: str) -> Optional[str]:
        """Try to extract mermaid code when no code block is found."""
        for kw in MERMAID_KEYWORDS:
            kw_clean = kw.strip()
            idx = text.lower().find(kw_clean.lower())
            if idx != -1:
                candidate = text[idx:].strip()
                lines = candidate.split('\n')
                code_lines = []
                for line in lines:
                    stripped = line.strip()
                    if stripped.startswith('```') and code_lines:
                        break
                    code_lines.append(line)
                result = '\n'.join(code_lines).strip()
                if result and self._is_valid_mermaid(result):
                    return result
        return None

    def _extract_code_block(self, text: str, language: str) -> Optional[str]:
        """Extract code from markdown code block."""
        # Try to extract specific language block first
        patterns = [
            # Standard markdown code block with language
            rf"```{language}\s*\n(.*?)\n```",
            # Code block with language on same line
            rf"```{language}\s+(.*?)```",
            # Any code block
            r"```\s*\n(.*?)\n```",
            r"```(.*?)```",
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.DOTALL)
            if match:
                code = match.group(1).strip()
                if code:
                    return code
        
        # If no code block found, try to extract mermaid code directly
        # Look for common mermaid keywords
        if language.lower() in ['mermaid', '']:
            mermaid_patterns = [
                # Match from graph/flowchart/sequenceDiagram etc. to end
                r"(?:graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt)\s+.*?(?=\n\n|\Z)",
                # Match from graph/flowchart etc. to next blank line
                r"((?:graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt)\s+[\s\S]*?)(?:\n\s*\n|\Z)",
            ]
            for pattern in mermaid_patterns:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    code = match.group(0).strip()
                    if code:
                        return code
        
        return None
    
    def _extract_caption(self, text: str) -> Optional[str]:
        """Extract Caption: line from text."""
        # Look for Caption: at the beginning or after newlines
        patterns = [
            r"^Caption:\s*(.+?)(?:\n|$)",
            r"\nCaption:\s*(.+?)(?:\n|$)",
            r"Caption:\s*(.+?)(?:\n|$)",
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
            if match:
                return match.group(1).strip()
        return None


tool_service = ToolService()
