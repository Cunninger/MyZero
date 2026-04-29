import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const CollapsibleSection = ({
  title,
  icon: Icon,
  iconBg = 'bg-teal-50',
  iconColor = 'text-teal-600',
  defaultOpen = true,
  badge,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between text-left group cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${iconBg} transition-transform duration-200 group-hover:scale-105`}>
            <Icon className={`w-4 h-4 ${iconColor}`} />
          </div>
          <h2 className="text-base font-semibold text-slate-800">{title}</h2>
          {badge && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium border border-amber-100">
              {badge}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-5 h-5 text-slate-400 transition-transform duration-300 ease-out ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <div
        className={`transition-all duration-300 ease-out ${
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}
      >
        <div className="px-5 pb-5 pt-1 space-y-5">{children}</div>
      </div>
    </div>
  )
}

export default CollapsibleSection
