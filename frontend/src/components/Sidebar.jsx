import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  PenTool, PanelLeftClose, PanelLeftOpen, Plus, Search,
  Wrench, BarChart3, Settings, Trash2,
  CheckCircle, XCircle, Loader2
} from 'lucide-react'
import { historyAPI, optimizeAPI } from '../api'
import toast from 'react-hot-toast'
import { getModeLabel, getModeColor, getModeDotClass, MODES } from '../utils/modeConfig'

const getStatusDisplay = (status) => {
  switch (status) {
    case 'completed': return { icon: <CheckCircle className="w-3 h-3 text-green-500" />, label: '完成', color: 'bg-green-400' }
    case 'failed': return { icon: <XCircle className="w-3 h-3 text-red-500" />, label: '失败', color: 'bg-red-400' }
    case 'stopped': return { icon: <XCircle className="w-3 h-3 text-orange-500" />, label: '已停止', color: 'bg-orange-400' }
    default: return { icon: <Loader2 className="w-3 h-3 text-primary-500 animate-spin" />, label: '处理中', color: 'bg-primary-400' }
  }
}

const relativeTime = (dateStr) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now - date) / 1000)
  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`
  if (diff < 604800) return `${Math.floor(diff / 86400)} 天前`
  return date.toLocaleDateString('zh-CN')
}

const SidebarLink = ({ to, icon, label, isOpen }) => {
  const location = useLocation()
  const active = location.pathname === to

  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        active
          ? 'bg-primary-50 text-primary-700'
          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
      }`}
      title={!isOpen ? label : undefined}
    >
      {icon}
      {isOpen && <span className="truncate">{label}</span>}
    </Link>
  )
}

const Sidebar = ({ isOpen, onToggle, onRefreshRef, width, startResize }) => {
  const [history, setHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [modeFilter, setModeFilter] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()

  const loadHistory = useCallback(async () => {
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
  }, [])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  useEffect(() => {
    if (onRefreshRef) {
      onRefreshRef(loadHistory)
    }
  }, [onRefreshRef, loadHistory])

  const handleDelete = useCallback(async (id, e) => {
    e.stopPropagation()
    if (!confirm('确定要删除这条记录吗？')) return
    try {
      await historyAPI.deleteItem(id)
      setHistory(prev => prev.filter(item => item.id !== id))
      toast.success('已删除')
    } catch (error) {
      toast.error('删除失败')
    }
  }, [])

  const filteredHistory = useMemo(() => {
    let result = history
    if (modeFilter) {
      result = result.filter(item => item.mode === modeFilter)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(item =>
        item.original_text.toLowerCase().includes(q) ||
        getModeLabel(item.mode).toLowerCase().includes(q)
      )
    }
    return result
  }, [history, searchQuery, modeFilter])

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      <aside
        style={{ width: isOpen ? width : 64 }}
        className={`
          fixed md:static inset-y-0 left-0 z-40
          flex flex-col bg-white border-r border-slate-200
          transition-all duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-3 border-b border-slate-100 shrink-0">
          <Link to="/" className="flex items-center gap-2 group min-w-0" title="MyZero">
            <div className="p-1 rounded-md bg-gradient-to-br from-primary-500 to-violet-500 shrink-0">
              <PenTool className="w-4 h-4 text-white" />
            </div>
            {isOpen && (
              <span className="font-serif text-xl font-bold bg-gradient-to-r from-primary-700 to-slate-800 bg-clip-text text-transparent truncate">
                MyZero
              </span>
            )}
          </Link>
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
            aria-label={isOpen ? '折叠侧边栏' : '展开侧边栏'}
          >
            {isOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
          </button>
        </div>

        {/* New Chat */}
        <div className="p-3 shrink-0">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 shrink-0" />
            {isOpen && <span>新建对话</span>}
          </Link>
        </div>

        {/* Search */}
        {isOpen && (
          <div className="px-3 pb-2 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索历史记录..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 outline-none transition-all duration-200"
              />
            </div>
          </div>
        )}

        {/* Mode filter chips */}
        {isOpen && (
          <div className="px-3 pb-2 shrink-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setModeFilter(null)}
                className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border transition-all duration-150 cursor-pointer ${
                  modeFilter === null
                    ? 'bg-slate-700 text-white border-slate-700'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                }`}
              >
                全部
              </button>
              {MODES.map(mode => {
                const colors = getModeColor(mode.id)
                const isActive = modeFilter === mode.id
                return (
                  <button
                    key={mode.id}
                    onClick={() => setModeFilter(isActive ? null : mode.id)}
                    className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border transition-all duration-150 cursor-pointer ${
                      isActive
                        ? `${colors.bg} ${colors.text} ${colors.chipBorder}`
                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? colors.dot : 'bg-slate-300'}`} />
                    {mode.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* History list */}
        <div className="flex-1 overflow-y-auto px-2 py-1 sidebar-scroll min-h-0">
          {isLoading ? (
            <div className="space-y-2 p-1">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="animate-pulse rounded-md bg-slate-100 h-14" />
              ))}
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              {searchQuery ? '未找到匹配记录' : '暂无历史记录'}
            </div>
          ) : (
            <div className="space-y-0.5">
              {filteredHistory.map((item) => {
                const status = getStatusDisplay(item.status)
                const isActive = location.pathname === `/result/${item.id}`

                return (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/result/${item.id}`)}
                    className={`group relative flex items-start gap-2 px-2.5 py-2 rounded-md cursor-pointer transition-all duration-200 min-w-0 ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    {/* Status indicator dot */}
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${status.color}`} />

                    <div className="flex-1 min-w-0">
                      <p className={`text-xs truncate ${isActive ? 'text-primary-800' : 'text-slate-700'}`}>
                        {item.original_text.substring(0, 60)}...
                      </p>
                      {isOpen && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded ${getModeColor(item.mode).bg} ${getModeColor(item.mode).text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${getModeDotClass(item.mode)}`} />
                            {getModeLabel(item.mode)}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {relativeTime(item.created_at)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all duration-200 shrink-0"
                      aria-label="删除"
                      title="删除"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Bottom nav */}
        <div className="border-t border-slate-100 p-2 space-y-1 shrink-0">
          <SidebarLink to="/tools" icon={<Wrench className="w-4 h-4" />} label="工具" isOpen={isOpen} />
          <SidebarLink to="/stats" icon={<BarChart3 className="w-4 h-4" />} label="统计" isOpen={isOpen} />
          <SidebarLink to="/settings" icon={<Settings className="w-4 h-4" />} label="设置" isOpen={isOpen} />
        </div>
      </aside>

      {/* Resize handle */}
      {isOpen && (
        <div
          onMouseDown={startResize}
          className="hidden md:flex w-1.5 cursor-col-resize items-center justify-center hover:bg-primary-200/40 active:bg-primary-300/60 transition-colors duration-150 shrink-0 group relative"
        >
          <div className="w-0.5 h-8 rounded-full bg-slate-300 group-hover:bg-primary-400 group-active:bg-primary-500 transition-colors duration-150" />
        </div>
      )}
    </>
  )
}

export default Sidebar
