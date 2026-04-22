import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Send, Zap, Clock } from 'lucide-react'
import TextInput from '../components/TextInput'
import ModeSelector from '../components/ModeSelector'
import LoadingSpinner from '../components/LoadingSpinner'
import { optimizeAPI, historyAPI, configAPI } from '../api'

const HomePage = () => {
  const [text, setText] = useState('')
  const [mode, setMode] = useState('combined')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [recentHistory, setRecentHistory] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    loadRecentHistory()
    loadDefaultMode()
  }, [])

  const loadDefaultMode = async () => {
    try {
      const response = await configAPI.get()
      if (response.data?.default_mode) {
        setMode(response.data.default_mode)
      }
    } catch (error) {
      // Use hardcoded default
    }
  }

  const loadRecentHistory = async () => {
    try {
      const response = await historyAPI.getList(5)
      const items = response.data

      const processing = items.filter(i => i.status === 'processing' || i.status === 'pending')
      for (const item of processing) {
        try {
          const res = await optimizeAPI.getStatus(item.id)
          if (res.data.status === 'completed' || res.data.status === 'failed' || res.data.status === 'stopped') {
            const idx = items.findIndex(h => h.id === item.id)
            if (idx !== -1) items[idx] = { ...items[idx], ...res.data }
          }
        } catch (_) {}
      }

      setRecentHistory(items)
    } catch (error) {
      console.error('Failed to load history:', error)
    }
  }

  const handleSubmit = async () => {
    // Handle DOCX file upload
    if (window._pendingFile) {
      const file = window._pendingFile
      window._pendingFile = null
      setText('')

      setIsSubmitting(true)
      try {
        const response = await optimizeAPI.upload(file, mode)
        navigate(`/result/${response.data.id}`)
      } catch (error) {
        setIsSubmitting(false)
        toast.error(error.message || '上传文件失败')
      }
      return
    }

    if (!text.trim()) {
      toast.error('请输入文本')
      return
    }

    if (text.trim().length < 10) {
      toast.error('文本太短，至少 10 个字符')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await optimizeAPI.submit(text, mode)
      navigate(`/result/${response.data.id}`)
    } catch (error) {
      setIsSubmitting(false)
      toast.error(error.message || '提交失败')
    }
  }

  const getModeLabel = (modeId) => {
    const labels = { polish: '论文润色', humanize: 'AIGC 降重', combined: '综合优化' }
    return labels[modeId] || modeId
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-3 pt-4">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold bg-gradient-to-r from-primary-600 via-blue-600 to-violet-600 bg-clip-text text-transparent">
          AI 学术写作助手
        </h1>
        <p className="text-slate-500 text-lg">
          论文润色 · AIGC 降重 · 一键优化
        </p>
      </div>

      <ModeSelector value={mode} onChange={setMode} />

      <div className="card-static p-6">
        <TextInput
          value={text}
          onChange={setText}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
          mode={mode}
        />

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-slate-400">
            Ctrl + Enter 快速提交
          </p>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !text.trim()}
            className="btn-cta flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" color="white" />
                提交中...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                开始优化
              </>
            )}
          </button>
        </div>
      </div>

      {recentHistory.length > 0 && (
        <div className="space-y-4 animate-slide-up">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-serif font-semibold text-slate-800">最近记录</h2>
            <button
              onClick={() => navigate('/history')}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              查看全部
            </button>
          </div>

          <div className="space-y-3 stagger-children">
            {recentHistory.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/result/${item.id}`)}
                className="group relative card-static p-4 pl-5 cursor-pointer hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-200 ${
                  item.status === 'completed'
                    ? 'bg-green-400'
                    : item.status === 'failed'
                      ? 'bg-red-400'
                      : item.status === 'stopped'
                        ? 'bg-orange-400'
                        : 'bg-primary-400'
                }`} />

                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 truncate font-serif group-hover:text-slate-900 transition-colors">
                      {item.original_text.substring(0, 80)}...
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full">
                        <Zap className="w-3 h-3" />
                        {getModeLabel(item.mode)}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="w-3 h-3" />
                        {new Date(item.created_at).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                  </div>

                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    item.status === 'completed'
                      ? 'bg-green-50 text-green-700'
                      : item.status === 'failed'
                      ? 'bg-red-50 text-red-700'
                      : item.status === 'stopped'
                      ? 'bg-orange-50 text-orange-700'
                      : 'bg-yellow-50 text-yellow-700'
                  }`}>
                    {item.status === 'completed' ? '完成' : item.status === 'failed' ? '失败' : item.status === 'stopped' ? '已停止' : '处理中'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default HomePage
