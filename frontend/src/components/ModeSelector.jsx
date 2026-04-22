import React from 'react'
import { Sparkles, Shield, Wand2 } from 'lucide-react'

const modes = [
  { id: 'polish', label: '论文润色', desc: '改善语言表达', icon: Sparkles, gradient: 'from-blue-500 to-cyan-400' },
  { id: 'humanize', label: 'AIGC 降重', desc: '降低 AI 检测率', icon: Shield, gradient: 'from-violet-500 to-purple-400' },
  { id: 'combined', label: '综合优化', desc: '润色 + 降重', icon: Wand2, gradient: 'from-orange-500 to-amber-400' },
]

const ModeSelector = ({ value, onChange }) => {
  return (
    <div className="grid grid-cols-3 gap-3">
      {modes.map((mode) => {
        const Icon = mode.icon
        const isActive = value === mode.id

        return (
          <button
            key={mode.id}
            onClick={() => onChange(mode.id)}
            className={`relative flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all duration-200 group ${
              isActive
                ? 'border-primary-400 bg-gradient-to-br from-primary-50 to-blue-50 text-primary-700 shadow-lg shadow-primary-500/10'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:shadow-md'
            }`}
          >
            <div className={`p-2 rounded-lg transition-transform duration-200 ${isActive ? 'bg-white/80 shadow-sm' : 'group-hover:scale-110'}`}>
              <Icon className={`w-5 h-5 transition-colors duration-200 ${isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
            </div>
            <span className={`text-sm font-medium ${isActive ? 'font-semibold' : ''}`}>{mode.label}</span>
            <span className={`text-xs transition-colors duration-200 ${isActive ? 'text-primary-600' : 'text-slate-400'}`}>{mode.desc}</span>

            {isActive && (
              <div className="absolute -bottom-px left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-gradient-to-r from-primary-400 to-blue-400" />
            )}
          </button>
        )
      })}
    </div>
  )
}

export default ModeSelector
