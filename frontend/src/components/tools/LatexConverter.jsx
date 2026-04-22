import React, { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { FileText, Copy, Download, Loader2 } from 'lucide-react'
import LoadingSpinner from '../LoadingSpinner'
import TemplateEditor from './TemplateEditor'
import { toolsAPI } from '../../api'

const DEFAULT_LATEX_TEMPLATE = `你是一个专业的 LaTeX 排版专家。请将用户提供的文本转换为 LaTeX 代码。

要求：
1. 使用标准 LaTeX 文档结构（\\documentclass、\\begin{document} 等）
2. 正确处理中文字符，使用 ctex 宏包
3. 合理使用 LaTeX 命令和环境（如 \\section、\\begin{itemize} 等）
4. 保持原文的格式和结构
5. 对于数学公式，使用正确的 LaTeX 数学模式

请直接输出 LaTeX 代码，不要附加额外说明。`

const LatexConverter = () => {
  const [text, setText] = useState('')
  const [result, setResult] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [customTemplate, setCustomTemplate] = useState(null)
  const [copied, setCopied] = useState(false)

  const handleConvert = useCallback(async () => {
    if (!text.trim()) {
      toast.error('请输入要转换的文本')
      return
    }

    setIsLoading(true)
    setResult('')
    try {
      const response = await toolsAPI.convertToLatex(text, customTemplate)
      setResult(response.data?.latex_code || response.data?.latex || response.data?.result || '')
      toast.success('转换成功')
    } catch (error) {
      toast.error(error.message || '转换失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }, [text, customTemplate])

  const handleCopy = async () => {
    if (!result) return
    try {
      await navigator.clipboard.writeText(result)
      setCopied(true)
      toast.success('已复制到剪贴板')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('复制失败')
    }
  }

  const handleDownload = () => {
    if (!result) return
    const blob = new Blob([result], { type: 'text/x-tex;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'output.tex'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card-static p-6 space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-serif font-semibold text-slate-800">
            LaTeX 转换
          </h3>
        </div>
        <p className="text-sm text-slate-500">
          将文本内容转换为标准 LaTeX 代码，支持公式、表格、列表等学术排版格式。
        </p>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full h-64 px-4 py-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow duration-150 placeholder:text-slate-400 resize-none"
          placeholder="在此输入要转换为 LaTeX 的文本内容...&#10;&#10;支持标题、段落、列表、数学公式、表格等内容。"
          disabled={isLoading}
        />

        <TemplateEditor
          defaultTemplate={DEFAULT_LATEX_TEMPLATE}
          storageKey="latex-converter-template"
          onTemplateChange={setCustomTemplate}
          title="LaTeX 转换模板"
        />

        <div className="flex justify-end">
          <button
            onClick={handleConvert}
            disabled={isLoading || !text.trim()}
            className="btn-cta flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" color="white" />
                转换中...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                转换为 LaTeX
              </>
            )}
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="card-static p-8 flex flex-col items-center justify-center gap-3 animate-fade-in">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-slate-500">正在转换为 LaTeX...</p>
        </div>
      )}

      {result && !isLoading && (
        <div className="card-static p-6 space-y-4 animate-slide-up">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-slate-700">LaTeX 输出</h4>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  copied
                    ? 'bg-green-100 text-green-700'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? '已复制' : '复制'}
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-primary-50 text-primary-600 hover:bg-primary-100 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                下载 .tex
              </button>
            </div>
          </div>

          <div className="relative">
            <pre className="w-full max-h-96 overflow-auto px-4 py-3 text-sm font-mono bg-slate-900 text-green-400 rounded-lg whitespace-pre-wrap break-words">
              <code>{result}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

export default LatexConverter
