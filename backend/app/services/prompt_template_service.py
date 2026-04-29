"""Prompt template management service."""

import json
from typing import Dict, List, Optional


# Built-in templates
BUILTIN_TEMPLATES = {
    "default": {
        "id": "default",
        "name": "默认学术",
        "category": "general",
        "polish_prompt": """你是一位专业的学术写作编辑。请对以下论文段落进行润色，改善语言表达、逻辑结构和学术规范性，但保持原意不变。

要求：
- 使用正式的学术语言
- 优化句式结构，避免重复
- 确保术语使用准确
- 保持段落间的连贯性
- 纯文本输出：只输出修改后的文本，禁止使用 Markdown 格式（如 **加粗**、## 标题、```代码块```、* 列表等），禁止附加任何解释、注释或标签

重要提示：只输出润色后的纯文本内容，保持与原文段落相同的结构和字数，禁止使用任何 Markdown 格式标记。

原文：
{text}""",
        "humanize_prompt": """你是一位专业的学术写作专家。请对以下文本进行改写，使其更像人类写作的学术论文，降低被 AI 检测工具识别的概率。

要求：
- 改变句式结构，使用更多样化的表达方式
- 替换常见的 AI 生成词汇和短语
- 增加自然的过渡和连接词
- 保持学术严谨性和专业性
- 可以适当增加个人见解和分析
- 纯文本输出：只输出改写后的文本，禁止使用 Markdown 格式（如 **加粗**、## 标题、```代码块```、* 列表等），禁止附加任何解释、注释或标签

重要提示：只输出改写后的纯文本内容，保持与原文段落相同的结构和字数，禁止使用任何 Markdown 格式标记。

原文：
{text}"""
    },
    "cv_ml": {
        "id": "cv_ml",
        "name": "计算机视觉/机器学习",
        "category": "domain",
        "polish_prompt": """你是一位计算机视觉和机器学习领域的学术写作专家。请对以下论文段落进行润色，使其符合 CV/ML 顶会（如 CVPR、ICCV、NeurIPS）的写作风格。

要求：
- 使用领域标准术语（如：feature extraction → 特征提取，backbone → 骨干网络）
- 数学公式表述准确（如：用 $\\mathcal{L}$ 表示损失函数）
- 实验描述客观具体（明确指标、数据集、baseline）
- 算法描述逻辑清晰（动机→方法→优势）
- 纯文本输出：只输出修改后的文本，禁止使用 Markdown 格式

原文：
{text}""",
        "humanize_prompt": """你是一位 CV/ML 领域的学术写作专家。请对以下文本进行改写，使其更像该领域研究者的自然写作风格。

领域特征：
- 习惯用缩写（CNN、ViT、MLP 等）
- 被动语态少，主动语态多
- 简洁直接，避免冗余修饰
- 实验导向的表述

原文：
{text}"""
    },
    "medical": {
        "id": "medical",
        "name": "医学",
        "category": "domain",
        "polish_prompt": """你是一位医学领域的学术写作专家。请对以下医学论文段落进行润色。

要求：
- 医学术语准确（如：症状、诊断、治疗方案）
- 临床描述客观规范
- 统计数据表述严谨（p值、置信区间）
- 符合医学伦理表述
- 纯文本输出：只输出修改后的文本，禁止使用 Markdown 格式

原文：
{text}""",
        "humanize_prompt": """你是一位医学领域的学术写作专家。请对以下医学文本进行改写。

领域特征：
- 重视临床证据
- 谨慎使用绝对化表述
- 强调患者安全与伦理

原文：
{text}"""
    },
    "humanities": {
        "id": "humanities",
        "name": "人文社科",
        "category": "domain",
        "polish_prompt": """你是一位人文社科领域的学术写作专家。请对以下论文段落进行润色。

要求：
- 论证逻辑清晰，观点明确
- 文献引用规范
- 语言流畅但不失严谨
- 避免过度技术化表达
- 纯文本输出：只输出修改后的文本，禁止使用 Markdown 格式

原文：
{text}""",
        "humanize_prompt": """你是一位人文社科领域的学术写作专家。请对以下文本进行改写。

领域特征：
- 重视思辨性与批判性
- 语言更富有表现力
- 适当使用修辞手法

原文：
{text}"""
    },
    "nature_style": {
        "id": "nature_style",
        "name": "Nature 风格",
        "category": "journal",
        "polish_prompt": """你是一位为 Nature 等顶刊撰稿的学术写作专家。请对以下段落进行润色，使其符合 Nature 的简洁有力风格。

要求：
- 极其简洁，删除一切冗余
- 主动语态为主
- 开门见山，直击要点
- 避免过度修饰
- 跨学科友好（减少行话）
- 纯文本输出：只输出修改后的文本，禁止使用 Markdown 格式

原文：
{text}""",
        "humanize_prompt": """你是一位顶刊撰稿人。请按 Nature 风格改写以下文本。

风格要点：
- 短句为主
- 强动词
- 避免被动语态

原文：
{text}"""
    },
    "ieee_style": {
        "id": "ieee_style",
        "name": "IEEE 风格",
        "category": "journal",
        "polish_prompt": """你是一位为 IEEE 期刊撰稿的学术写作专家。请对以下段落进行润色，使其符合 IEEE 的严谨技术风格。

要求：
- 技术描述精确完整
- 方法论可复现性强
- 数学推导清晰
- 实验对比充分
- 纯文本输出：只输出修改后的文本，禁止使用 Markdown 格式

原文：
{text}""",
        "humanize_prompt": """你是一位 IEEE 期刊撰稿人。请按 IEEE 风格改写以下文本。

风格要点：
- 技术术语准确
- 逻辑严密
- 数据驱动

原文：
{text}"""
    },
}


class PromptTemplateService:
    """Service for managing prompt templates."""

    def __init__(self):
        self._builtin = BUILTIN_TEMPLATES

    def list_templates(self) -> List[Dict]:
        """Get all available templates (builtin + custom)."""
        return list(self._builtin.values())

    def get_template(self, template_id: str) -> Optional[Dict]:
        """Get a specific template by ID."""
        return self._builtin.get(template_id)

    def get_categories(self) -> Dict[str, List[Dict]]:
        """Get templates grouped by category."""
        result = {"domain": [], "journal": [], "general": []}
        for tpl in self._builtin.values():
            cat = tpl.get("category", "general")
            if cat in result:
                result[cat].append(tpl)
        return result


# Singleton instance
prompt_template_service = PromptTemplateService()
