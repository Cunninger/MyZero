import React, { useState, useEffect } from 'react'
import { Save, RotateCcw, Edit3 } from 'lucide-react'

const TemplateEditor = ({ defaultTemplate, storageKey, onTemplateChange, title = "自定义模板" }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [template, setTemplate] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const savedValue = localStorage.getItem(storageKey)
    setTemplate(savedValue || defaultTemplate)
  }, [storageKey, defaultTemplate])

  const handleSave = () => {
    localStorage.setItem(storageKey, template)
    setSaved(true)
    onTemplateChange?.(template)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReset = () => {
    if (window.confirm('确定要恢复默认模板吗？自定义模板将丢失。')) {
      localStorage.removeItem(storageKey)
      setTemplate(defaultTemplate)
      onTemplateChange?.(defaultTemplate)
    }
  }

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-600 transition-colors"
      >
        <Edit3 className="w-4 h-4" />
        编辑模板
      </button>
    )
  }

  return (
    <div className="space-y-3 animate-slide-down">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-slate-700">{title}</h4>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-500 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            恢复默认
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            收起
          </button>
        </div>
      </div>
      <textarea
        value={template}
        onChange={(e) => setTemplate(e.target.value)}
        className="w-full h-48 px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 resize-none"
        placeholder="在此输入自定义模板..."
      />
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            saved
              ? 'bg-green-100 text-green-700'
              : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
          }`}
        >
          <Save className="w-4 h-4" />
          {saved ? '已保存' : '保存模板'}
        </button>
      </div>
    </div>
  )
}

export default TemplateEditor
