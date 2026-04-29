import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowLeft, Trash2, Clock, CheckCircle, XCircle, Loader2, RefreshCw, FileText } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import { historyAPI, optimizeAPI } from '../api'
import { getModeLabel, getModeColor } from '../utils/modeConfig'

const HistoryPage = () => {
  const [history, setHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    setIsLoading(true)
    try {
      const response = await historyAPI.getList(100)
      const items = response.data

      const processingItems = items.filter(
        item => item.status === 'processing' || item.status === 'pending'
      )
      for (const item of processingItems) {
        try {
          const res = await optimizeAPI.getStatus(item.id)
          if (res.data.status === 'completed' || res.data.status === 'failed' || res.data.status === 'stopped') {
            const idx = items.findIndex(h => h.id === item.id)
            if (idx !== -1) items[idx] = { ...items[idx], ...res.data }
          }
        } catch (_) {}
      }

      setHistory(items)
    } catch (error) {
      toast.error('加载历史记录失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!confirm('确定要删除这条记录吗？')) return

    try {
      await historyAPI.deleteItem(id)
      setHistory(history.filter(item => item.id !== id))
      toast.success('已删除')
    } catch (error) {
      toast.error('删除失败')
    }
  }

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'completed': return { icon: <CheckCircle className="w-4 h-4 text-green-500" />, label: '完成', color: 'bg-green-50 text-green-700' }
      case 'failed': return { icon: <XCircle className="w-4 h-4 text-red-500" />, label: '失败', color: 'bg-red-50 text-red-700' }
      case 'stopped': return { icon: <XCircle className="w-4 h-4 text-orange-500" />, label: '已停止', color: 'bg-orange-50 text-orange-700' }
      default: return { icon: <Loader2 className="w-4 h-4 text-primary-500 animate-spin" />, label: '处理中', color: 'bg-yellow-50 text-yellow-700' }
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-400'
      case 'failed': return 'bg-red-400'
      case 'stopped': return 'bg-orange-400'
      default: return 'bg-primary-400'
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/')}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <h1 className="text-2xl font-serif font-bold text-slate-800">历史记录</h1>
        <button
          onClick={loadHistory}
          className="ml-auto p-2 hover:bg-slate-100 rounded-lg transition-colors"
          title="刷新"
        >
          <RefreshCw className={`w-4 h-4 text-slate-500 transition-transform duration-500 ${isLoading ? 'animate-spin' : 'hover:rotate-180'}`} />
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="card-static p-4">
              <div className="flex gap-4">
                <div className="flex-1 space-y-3">
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-3 w-1/3" />
                </div>
                <div className="skeleton h-6 w-12 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-20 animate-fade-in">
          <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-10 h-10 text-slate-300" />
          </div>
          <p className="text-slate-500 text-lg font-medium">暂无历史记录</p>
          <p className="text-slate-400 text-sm mt-1">提交文本后将在此显示</p>
          <button
            onClick={() => navigate('/')}
            className="mt-6 text-primary-600 hover:text-primary-700 font-medium transition-colors inline-flex items-center gap-1"
          >
            开始使用
          </button>
        </div>
      ) : (
        <div className="space-y-3 stagger-children">
          {history.map((item) => {
            const statusDisplay = getStatusDisplay(item.status)

            return (
              <div
                key={item.id}
                onClick={() => navigate(`/result/${item.id}`)}
                className="group relative card-static p-4 pl-5 cursor-pointer hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1 group-hover:w-1.5 transition-all duration-200 ${getStatusColor(item.status)}`} />

                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 font-serif line-clamp-2 group-hover:text-slate-900 transition-colors">
                      {item.original_text.substring(0, 120)}...
                    </p>

                    <div className="flex items-center gap-3 mt-2">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${getModeColor(item.mode).bg} ${getModeColor(item.mode).text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${getModeColor(item.mode).dot}`} />
                        {getModeLabel(item.mode)}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="w-3 h-3" />
                        {new Date(item.created_at).toLocaleString('zh-CN')}
                      </span>
                      {item.completed_at && (
                        <span className="text-xs text-slate-400">
                          耗时 {Math.round((new Date(item.completed_at) - new Date(item.created_at)) / 1000)}s
                        </span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusDisplay.color}`}>
                        {statusDisplay.label}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {statusDisplay.icon}
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      className="p-1.5 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500 transition-colors" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default HistoryPage
