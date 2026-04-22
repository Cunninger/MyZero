import React, { useState, useCallback, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import {
  GitBranch, Copy, Check, Pencil, Eye, Download, ImageIcon,
  FileCode, ArrowRightLeft, RefreshCw, Workflow, GitCommitHorizontal,
  Blocks, CircleDot, Database, CalendarDays, Sparkles,
} from 'lucide-react'
import LoadingSpinner from '../LoadingSpinner'
import TemplateEditor from './TemplateEditor'
import { toolsAPI } from '../../api'

const DIAGRAM_TYPES = [
  { id: 'auto', label: '自动', Icon: Sparkles },
  { id: 'flowchart', label: '流程图', Icon: Workflow },
  { id: 'sequence', label: '时序图', Icon: ArrowRightLeft },
  { id: 'class', label: '类图', Icon: Blocks },
  { id: 'state', label: '状态图', Icon: CircleDot },
  { id: 'er', label: 'ER 图', Icon: Database },
  { id: 'gantt', label: '甘特图', Icon: CalendarDays },
]

const DEFAULT_MERMAID_TEMPLATE = `你是一个专业的图表生成专家。请根据用户的描述生成 Mermaid 代码。

要求：
1. 生成标准的 Mermaid.js 语法代码
2. 确保图表结构清晰、美观
3. 使用中文标签
4. 根据内容选择最合适的图表类型

请直接输出 Mermaid 代码，不要附加额外说明或 markdown 代码块标记。`

const MermaidGenerator = () => {
  const [description, setDescription] = useState('')
  const [diagramType, setDiagramType] = useState('auto')
  const [mermaidCode, setMermaidCode] = useState('')
  const [editCode, setEditCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [customTemplate, setCustomTemplate] = useState(null)
  const [copied, setCopied] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [renderError, setRenderError] = useState(null)
  const previewRef = useRef(null)
  const mermaidLoadedRef = useRef(false)
  const debounceRef = useRef(null)

  // Dynamically load mermaid.js
  useEffect(() => {
    if (window.mermaid) {
      mermaidLoadedRef.current = true
      return
    }

    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js'
    script.async = true
    script.onload = () => {
      if (window.mermaid) {
        window.mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
        })
        mermaidLoadedRef.current = true
      }
    }
    document.head.appendChild(script)
  }, [])

  // Render mermaid preview with debounce
  useEffect(() => {
    if (!mermaidCode || !previewRef.current || !window.mermaid) return

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      try {
        setRenderError(null)
        const { svg } = await window.mermaid.render(
          `mermaid-preview-${Date.now()}`,
          mermaidCode
        )
        if (previewRef.current) {
          previewRef.current.innerHTML = svg
        }
      } catch {
        setRenderError('渲染失败，请检查 Mermaid 语法')
        if (previewRef.current) {
          previewRef.current.innerHTML = ''
        }
      }
    }, isEditing ? 300 : 0)

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [mermaidCode, isEditing])

  const handleGenerate = useCallback(async () => {
    if (!description.trim()) {
      toast.error('请输入图表描述')
      return
    }

    setIsLoading(true)
    setMermaidCode('')
    setEditCode('')
    setRenderError(null)
    setIsEditing(false)
    try {
      const response = await toolsAPI.generateMermaid(description, diagramType)
      const code = response.data?.mermaid_code || response.data?.mermaid || response.data?.result || ''
      setMermaidCode(code)
      toast.success('图表生成成功')
    } catch (error) {
      const msg = error.response?.data?.detail || error.message || '生成失败，请重试'
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }, [description, diagramType, customTemplate])

  const handleCopy = async () => {
    const text = isEditing ? editCode : mermaidCode
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success('已复制到剪贴板')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('复制失败')
    }
  }

  const handleEditToggle = () => {
    if (isEditing) {
      // Exit editing: apply changes
      setMermaidCode(editCode)
      setIsEditing(false)
    } else {
      setEditCode(mermaidCode)
      setIsEditing(true)
    }
  }

  const handleCodeChange = (value) => {
    setEditCode(value)
    setMermaidCode(value)
  }

  const handleExportSVG = () => {
    const svgEl = previewRef.current?.querySelector('svg')
    if (!svgEl) {
      toast.error('没有可导出的图表')
      return
    }
    const svgData = new XMLSerializer().serializeToString(svgEl)
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mermaid_diagram_${Date.now()}.svg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('SVG 已导出')
  }

  const handleExportPNG = () => {
    const svgEl = previewRef.current?.querySelector('svg')
    if (!svgEl) {
      toast.error('没有可导出的图表')
      return
    }

    const svgData = new XMLSerializer().serializeToString(svgEl)
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)

    const img = new Image()
    img.onload = () => {
      const scale = 2
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth * scale
      canvas.height = img.naturalHeight * scale
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.scale(scale, scale)
      ctx.drawImage(img, 0, 0)

      canvas.toBlob((blob) => {
        const pngUrl = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = pngUrl
        a.download = `mermaid_diagram_${Date.now()}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(pngUrl)
        URL.revokeObjectURL(url)
        toast.success('PNG 已导出')
      }, 'image/png')
    }
    img.src = url
  }

  const currentCode = isEditing ? editCode : mermaidCode

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Input section */}
      <div className="card-static p-6 space-y-4">
        <div className="flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-serif font-semibold text-slate-800">
            Mermaid 图表生成
          </h3>
        </div>
        <p className="text-sm text-slate-500">
          用自然语言描述图表内容，自动生成 Mermaid 格式的流程图、时序图、类图等。
        </p>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full h-36 px-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-300 transition-shadow duration-150 placeholder:text-slate-400 resize-none text-sm"
          placeholder="在此描述你想要生成的图表...&#10;&#10;例如：描述一个用户登录流程，包括输入账号密码、验证、成功/失败的处理"
          disabled={isLoading}
        />

        {/* Diagram type selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">图表类型</label>
          <div className="flex flex-wrap gap-2">
            {DIAGRAM_TYPES.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setDiagramType(id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer ${
                  diagramType === id
                    ? 'bg-primary-100 text-primary-700 ring-1 ring-primary-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <TemplateEditor
          defaultTemplate={DEFAULT_MERMAID_TEMPLATE}
          storageKey="mermaid-generator-template"
          onTemplateChange={setCustomTemplate}
          title="Mermaid 生成模板"
        />

        <div className="flex justify-end">
          <button
            onClick={handleGenerate}
            disabled={isLoading || !description.trim()}
            className="btn-cta flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" color="white" />
                生成中...
              </>
            ) : (
              <>
                <GitBranch className="w-4 h-4" />
                生成图表
              </>
            )}
          </button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="card-static p-8 flex flex-col items-center justify-center gap-3 animate-fade-in">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-slate-500">正在生成图表...</p>
        </div>
      )}

      {/* Result: horizontal split */}
      {currentCode && !isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-in">
          {/* Left: Code panel */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col shadow-sm">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-slate-500" />
                <h4 className="text-sm font-medium text-slate-700">Mermaid 代码</h4>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleEditToggle}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer ${
                    isEditing
                      ? 'bg-violet-100 text-violet-700 ring-1 ring-violet-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {isEditing ? (
                    <><Eye className="w-3 h-3" /> 只读</>
                  ) : (
                    <><Pencil className="w-3 h-3" /> 编辑</>
                  )}
                </button>
                <button
                  onClick={handleCopy}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer ${
                    copied
                      ? 'bg-green-100 text-green-700'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? '已复制' : '复制'}
                </button>
              </div>
            </div>
            <div className="flex-1 min-h-[320px] max-h-[520px]">
              {isEditing ? (
                <textarea
                  value={editCode}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  className="w-full h-full min-h-[320px] max-h-[520px] px-4 py-3 text-sm font-mono bg-slate-900 text-emerald-400 resize-none focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-400/50 leading-relaxed"
                  spellCheck={false}
                />
              ) : (
                <pre className="w-full h-full min-h-[320px] max-h-[520px] overflow-auto px-4 py-3 text-sm font-mono bg-slate-900 text-emerald-400 leading-relaxed whitespace-pre-wrap break-words">
                  <code>{mermaidCode}</code>
                </pre>
              )}
            </div>
          </div>

          {/* Right: Preview panel */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col shadow-sm">
            <div className="px-4 py-2.5 bg-gradient-to-r from-primary-50 to-blue-50 border-b border-primary-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-primary-600" />
                <h4 className="text-sm font-medium text-primary-800">图表预览</h4>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleExportSVG}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-primary-100 text-primary-700 hover:bg-primary-200 transition-colors duration-150 cursor-pointer"
                >
                  <Download className="w-3 h-3" /> SVG
                </button>
                <button
                  onClick={handleExportPNG}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-primary-100 text-primary-700 hover:bg-primary-200 transition-colors duration-150 cursor-pointer"
                >
                  <ImageIcon className="w-3 h-3" /> PNG
                </button>
              </div>
            </div>
            <div className="flex-1 min-h-[320px] max-h-[520px] overflow-auto p-6 bg-slate-50/50">
              {renderError && (
                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg mb-3">
                  <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                  {renderError}
                </div>
              )}
              <div
                ref={previewRef}
                className="w-full flex items-center justify-center [&_svg]:max-w-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MermaidGenerator
