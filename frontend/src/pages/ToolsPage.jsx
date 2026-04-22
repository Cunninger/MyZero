import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, FileCode, PieChart } from 'lucide-react'
import LatexConverter from '../components/tools/LatexConverter'
import MermaidGenerator from '../components/tools/MermaidGenerator'

const TABS = [
  {
    id: 'latex',
    label: 'LaTeX 转换',
    icon: FileCode,
    description: '将文本转换为 LaTeX 代码',
  },
  {
    id: 'mermaid',
    label: '图表生成',
    icon: PieChart,
    description: '根据描述生成 Mermaid 图表',
  },
]

const ToolsPage = () => {
  const [activeTab, setActiveTab] = useState('latex')
  const navigate = useNavigate()

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/')}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-800">论文工具箱</h1>
          <p className="text-sm text-slate-500 mt-0.5">AI 辅助论文写作工具</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <div className="text-left">
                <div>{tab.label}</div>
                <div className={`text-xs font-normal ${isActive ? 'text-slate-400' : 'text-slate-400'}`}>
                  {tab.description}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'latex' && <LatexConverter />}
        {activeTab === 'mermaid' && <MermaidGenerator />}
      </div>
    </div>
  )
}

export default ToolsPage
