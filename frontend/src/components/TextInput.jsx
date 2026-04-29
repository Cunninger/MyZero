import React, { useState, useEffect, useCallback, useRef } from 'react'
import { FileText, Upload, X, Paperclip, ArrowUp } from 'lucide-react'
import LoadingSpinner from './LoadingSpinner'

const VALID_EXTENSIONS = ['txt', 'docx', 'md', 'markdown', 'pdf', 'ppt', 'pptx', 'png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp']

const TextInput = ({ value, onChange, onSubmit, isLoading, variant = 'default' }) => {
  const [stats, setStats] = useState({ chars: 0, words: 0 })
  const [dragOver, setDragOver] = useState(false)
  const [focused, setFocused] = useState(false)
  const fileInputRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    const saved = localStorage.getItem('myzero_draft')
    if (saved && !value) {
      onChange(saved)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('myzero_draft', value)

    const text = value || ''
    const chineseChars = (text.match(/[一-鿿]/g) || []).length
    const englishWords = text.replace(/[一-鿿]/g, ' ').trim().split(/\s+/).filter(w => w).length

    setStats({
      chars: text.length,
      words: chineseChars + englishWords
    })
  }, [value])

  useEffect(() => {
    if (variant === 'chat' && textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px'
    }
  }, [value, variant])

  const isValidFile = useCallback((file) => {
    if (!file) return false
    const ext = file.name.split('.').pop().toLowerCase()
    return VALID_EXTENSIONS.includes(ext)
  }, [])

  const handleTextFile = useCallback((file) => {
    const reader = new FileReader()
    reader.onload = (e) => onChange(e.target.result)
    reader.readAsText(file)
  }, [onChange])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && isValidFile(file)) {
      const ext = file.name.split('.').pop().toLowerCase()
      if (['docx', 'pdf', 'ppt', 'pptx', 'png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp'].includes(ext)) {
        onChange(`[FILE:${file.name}]`)
        window._pendingFile = file
      } else {
        handleTextFile(file)
      }
    }
  }, [onChange, isValidFile, handleTextFile])

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files[0]
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()
    if (['docx', 'pdf', 'ppt', 'pptx', 'png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp'].includes(ext)) {
      onChange(`[FILE:${file.name}]`)
      window._pendingFile = file
    } else {
      handleTextFile(file)
    }
    e.target.value = ''
  }, [onChange, handleTextFile])

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      onSubmit()
    }
  }

  if (variant === 'chat') {
    return (
      <div className="relative">
        <div
          className={`flex items-end gap-2 rounded-xl border bg-white px-3 py-2 transition-all duration-200 ${
            focused
              ? 'border-primary-400 ring-2 ring-primary-400/20'
              : dragOver
                ? 'border-cta-400 bg-orange-50/50'
                : 'border-slate-300'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          {dragOver && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-orange-50/80 rounded-xl border-2 border-dashed border-cta-400">
              <p className="text-sm font-medium text-cta-600">释放文件以上传</p>
            </div>
          )}

          <label
            htmlFor="file-upload-chat"
            className="shrink-0 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
            aria-label="上传文件"
          >
            <Paperclip className="w-5 h-5" />
          </label>

          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="输入或粘贴论文文本..."
            rows={1}
            className="flex-1 resize-none bg-transparent py-1.5 text-sm font-serif leading-relaxed placeholder:text-slate-400 focus:outline-none max-h-[200px] overflow-y-auto"
            disabled={isLoading}
          />

          <button
            onClick={onSubmit}
            disabled={isLoading || !value.trim()}
            className="shrink-0 p-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="提交"
          >
            {isLoading ? (
              <LoadingSpinner size="sm" color="white" />
            ) : (
              <ArrowUp className="w-4 h-4" />
            )}
          </button>
        </div>

        <div className="flex items-center justify-between mt-1.5 px-1">
          <span className="text-xs text-slate-400">
            {value ? `${stats.chars.toLocaleString()} 字符` : 'Ctrl+Enter 提交'}
          </span>
          {value && (
            <button
              onClick={() => onChange('')}
              className="text-xs text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
            >
              清空
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.docx,.md,.markdown,.pdf,.ppt,.pptx,.png,.jpg,.jpeg,.webp,.gif,.bmp"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload-chat"
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-xs font-medium text-slate-600">
            {stats.chars.toLocaleString()} 字符
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-xs font-medium text-slate-600">
            {stats.words.toLocaleString()} 词
          </span>
        </div>
        {value && (
          <button
            onClick={() => onChange('')}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            清空
          </button>
        )}
      </div>

      <div
        className={`relative rounded-lg transition-all duration-200 ${
          dragOver
            ? 'ring-2 ring-cta-500 bg-orange-50/50'
            : focused
              ? 'ring-2 ring-primary-400/50'
              : ''
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {dragOver && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-orange-50/80 rounded-lg border-2 border-dashed border-cta-400">
            <Upload className="w-8 h-8 text-cta-500 mb-2" />
            <p className="text-sm font-medium text-cta-600">释放文件以上传</p>
            <p className="text-xs text-cta-400 mt-1">支持 .txt .docx .pdf .ppt</p>
          </div>
        )}

        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="在此输入或粘贴论文文本...&#10;支持拖拽上传 .txt .docx .pdf .ppt 文件&#10;Ctrl+Enter 快速提交"
          className="input-field min-h-[280px] resize-y font-serif text-base leading-relaxed"
          disabled={isLoading}
        />

        {!value && !dragOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-300">
            <FileText className="w-12 h-12 mb-3" />
            <p className="text-sm">输入文本或拖拽文件到此处</p>
            <p className="text-xs mt-1">支持 .txt .docx .pdf .ppt 图片</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.docx,.md,.markdown,.pdf,.ppt,.pptx,.png,.jpg,.jpeg,.webp,.gif,.bmp"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
        />

        <label
          htmlFor="file-upload"
          className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 cursor-pointer transition-colors group"
        >
          <Upload className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
          上传文件 (.txt .docx .pdf .ppt)
        </label>
      </div>
    </div>
  )
}

export default TextInput
