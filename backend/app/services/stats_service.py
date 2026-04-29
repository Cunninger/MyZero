"""Usage statistics tracking service."""

import json
from datetime import date, datetime, timedelta
from typing import Dict, List

from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import UsageStats, OptimizationRecord


class StatsService:
    """Service for tracking and retrieving usage statistics."""

    def record_completion(self, record_id: int, original_text: str, mode: str, db: Session):
        """Record a completed optimization for statistics."""
        try:
            today = date.today()
            print(f"[Stats] Recording completion for record {record_id}, mode={mode}, chars={len(original_text)}")

            # Get or create today's stats
            stats = db.query(UsageStats).filter(UsageStats.date == today).first()
            if not stats:
                print(f"[Stats] Creating new stats entry for {today}")
                stats = UsageStats(
                    date=today,
                    total_characters=0,
                    total_records=0,
                    api_token_usage=0,
                    mode_counts="{}"
                )
                db.add(stats)
                db.flush()

            # Update counts
            stats.total_characters += len(original_text)
            stats.total_records += 1

            # Update mode counts
            mode_counts = json.loads(stats.mode_counts or "{}")
            mode_counts[mode] = mode_counts.get(mode, 0) + 1
            stats.mode_counts = json.dumps(mode_counts)

            # Estimate token usage (rough estimate: 1 char ≈ 0.7 tokens for Chinese)
            estimated_tokens = int(len(original_text) * 0.7)
            stats.api_token_usage += estimated_tokens

            db.commit()
            print(f"[Stats] Recorded successfully. Total chars: {stats.total_characters}, records: {stats.total_records}")
        except Exception as e:
            db.rollback()
            print(f"[Stats] Error recording stats: {e}")
            import traceback
            traceback.print_exc()

    def get_summary(self, db: Session) -> Dict:
        """Get overall usage summary."""
        from sqlalchemy import func as sql_func

        # Total across all days
        result = db.query(
            sql_func.sum(UsageStats.total_characters).label("total_chars"),
            sql_func.sum(UsageStats.total_records).label("total_records"),
            sql_func.sum(UsageStats.api_token_usage).label("total_tokens")
        ).first()

        if not result or result.total_chars is None:
            return {
                "total_characters": 0,
                "total_records": 0,
                "total_tokens": 0,
                "active_days": 0,
                "mode_distribution": {"polish": 0, "humanize": 0, "combined": 0}
            }

        total_chars = result.total_chars or 0
        total_records = result.total_records or 0
        total_tokens = result.total_tokens or 0

        # Get active days
        active_days = db.query(UsageStats.date).distinct().count()

        # Get mode distribution
        mode_stats = db.query(UsageStats.mode_counts).all()
        mode_distribution = {"polish": 0, "humanize": 0, "combined": 0}
        for (mode_counts_json,) in mode_stats:
            if mode_counts_json:
                counts = json.loads(mode_counts_json)
                for mode, count in counts.items():
                    mode_distribution[mode] = mode_distribution.get(mode, 0) + count

        return {
            "total_characters": total_chars,
            "total_records": total_records,
            "total_tokens": total_tokens,
            "active_days": active_days,
            "mode_distribution": mode_distribution
        }

    def get_trend(self, days: int = 30, db: Session = None) -> List[Dict]:
        """Get usage trend for the last N days."""
        if not db:
            db = SessionLocal()

        try:
            start_date = date.today() - timedelta(days=days-1)

            stats = db.query(UsageStats).filter(
                UsageStats.date >= start_date
            ).order_by(UsageStats.date).all()

            result = []
            for stat in stats:
                mode_counts = json.loads(stat.mode_counts or "{}")
                result.append({
                    "date": stat.date.isoformat(),
                    "characters": stat.total_characters,
                    "records": stat.total_records,
                    "tokens": stat.api_token_usage or 0,
                    "modes": mode_counts
                })

            return result
        finally:
            if not db:
                db.close()


# Singleton instance
stats_service = StatsService()
