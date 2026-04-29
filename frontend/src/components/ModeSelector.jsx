import React from 'react'
import { Sparkles, Shield, Wand2, Check } from 'lucide-react'

const modes = [
  { id: 'polish', label: '论文润色', desc: '改善语言表达', icon: Sparkles, color: 'blue' },
  { id: 'humanize', label: 'AIGC 降重', desc: '降低 AI 检测率', icon: Shield, color: 'violet' },
  { id: 'combined', label: '综合优化', desc: '润色 + 降重', icon: Wand2, color: 'amber' },
]

const colorMap = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-600', activeBg: 'bg-blue-50', activeBorder: 'border-blue-400' },
  violet: { bg: 'bg-violet-100', text: 'text-violet-600', activeBg: 'bg-violet-50', activeBorder: 'border-violet-400' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-600', activeBg: 'bg-amber-50', activeBorder: 'border-amber-400' },
}

const ModeSelector = ({ value, onChange, variant = 'default' }) => {
  if (variant === 'cards') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {modes.map((mode) => {
          const Icon = mode.icon
          const isActive = value === mode.id
          const colors = colorMap[mode.color]

          return (
            <button
              key={mode.id}
              onClick={() => onChange(mode.id)}
              className={`relative p-6 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer ${
                isActive
                  ? `${colors.activeBorder} ${colors.activeBg} shadow-md`
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
              aria-pressed={isActive}
            >
              <div className={`inline-flex p-3 rounded-xl mb-4 ${isActive ? colors.bg : 'bg-slate-100'}`}>
                <Icon className={`w-6 h-6 ${isActive ? colors.text : 'text-slate-500'}`} />
              </div>
              <h3 className="text-lg font-semibold mb-1 text-slate-800">{mode.label}</h3>
              <p className={`text-sm ${isActive ? 'text-slate-600' : 'text-slate-400'}`}>
                {mode.desc}
              </p>
              {isActive && (
                <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {modes.map((mode) => {
        const Icon = mode.icon
        const isActive = value === mode.id

        return (
          <button
            key={mode.id}
            onClick={() => onChange(mode.id)}
            className={`relative flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all duration-200 group cursor-pointer ${
              isActive
                ? 'border-primary-400 bg-primary-50 text-primary-700 shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:shadow-sm'
            }`}
            aria-pressed={isActive}
          >
            <div className={`p-2 rounded-lg transition-transform duration-200 ${isActive ? 'bg-white shadow-sm' : 'group-hover:scale-110'}`}>
              <Icon className={`w-5 h-5 transition-colors duration-200 ${isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
            </div>
            <span className={`text-sm font-medium ${isActive ? 'font-semibold' : ''}`}>{mode.label}</span>
            <span className={`text-xs transition-colors duration-200 ${isActive ? 'text-primary-600' : 'text-slate-400'}`}>{mode.desc}</span>

            {isActive && (
              <div className="absolute -bottom-px left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary-400" />
            )}
          </button>
        )
      })}
    </div>
  )
}

export default ModeSelector
