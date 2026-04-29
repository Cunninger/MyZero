import { Sparkles, Shield, Wand2 } from 'lucide-react'

export const MODES = [
  { id: 'polish',   label: '论文润色',   desc: '改善语言表达',   icon: Sparkles, color: 'blue' },
  { id: 'humanize', label: 'AIGC 降重',  desc: '降低 AI 检测率', icon: Shield,   color: 'violet' },
  { id: 'combined', label: '综合优化',   desc: '润色 + 降重',    icon: Wand2,    color: 'amber' },
]

export const MODE_MAP = Object.fromEntries(MODES.map(m => [m.id, m]))

export const COLOR_MAP = {
  blue:   { bg: 'bg-blue-100',   text: 'text-blue-600',   dot: 'bg-blue-500',   activeBg: 'bg-blue-50',   activeBorder: 'border-blue-400',   chipBorder: 'border-blue-200' },
  violet: { bg: 'bg-violet-100', text: 'text-violet-600', dot: 'bg-violet-500', activeBg: 'bg-violet-50', activeBorder: 'border-violet-400', chipBorder: 'border-violet-200' },
  amber:  { bg: 'bg-amber-100',  text: 'text-amber-600',  dot: 'bg-amber-500',  activeBg: 'bg-amber-50',  activeBorder: 'border-amber-400',  chipBorder: 'border-amber-200' },
}

export const CHART_COLORS = {
  polish:   '#3b82f6',
  humanize: '#8b5cf6',
  combined: '#f59e0b',
}

export const getModeLabel = (id) => MODE_MAP[id]?.label ?? id
export const getModeColor = (id) => COLOR_MAP[MODE_MAP[id]?.color] ?? COLOR_MAP.blue
export const getModeDotClass = (id) => getModeColor(id).dot
