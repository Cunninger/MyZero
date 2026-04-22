import re
from typing import List


def count_chinese_characters(text: str):
    """Count Chinese characters in text."""
    return len(re.findall(r'[\u4e00-\u9fff]', text))


def count_words(text: str):
    """Count total words (Chinese chars + English words)."""
    chinese_chars = count_chinese_characters(text)
    english_text = re.sub(r'[\u4e00-\u9fff]', ' ', text)
    english_words = len(english_text.split())
    return chinese_chars + english_words


def get_text_stats(text: str):
    """Get comprehensive text statistics."""
    chinese_chars = count_chinese_characters(text)
    english_text = re.sub(r'[\u4e00-\u9fff]', '', text)
    english_words = len(english_text.split())
    total_chars = len(text)
    paragraphs = len([p for p in text.split('\n') if p.strip()])
    
    return {
        "chinese_characters": chinese_chars,
        "english_words": english_words,
        "total_characters": total_chars,
        "paragraphs": paragraphs,
        "total_words": chinese_chars + english_words
    }
