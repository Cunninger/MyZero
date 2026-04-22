import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  ArrowLeft, Download, FileText, GitCompare,
  CheckCircle, XCircle, Loader2, Square, Copy, Check, Shield, X
} from 'lucide-react'
import { optimizeAPI } from '../api'

const ResultPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [record, setRecord] = useState(null)
  const [segments, setSegments] = useState([])
  const [changes, setChanges] = useState([])
  const [activeTab, setActiveTab] = useState('result')
  const [progress, setProgress] = useState({ completed: 0, total: 0 })
  const [copied, setCopied] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [currentStage, setCurrentStage] = useState('')
  const [showExportModal, setShowExportModal] = useState(false)
  const [stageProgress, setStageProgress] = useState({ stageIndex: 0, totalStages: 1 })
  const [overallProgress, setOverallProgress] = useState(0)
  const [parsingMessage, setParsingMessage] = useState('')
  const eventSourceRef = useRef(null)
  const pollRef = useRef(null)

  useEffect(() => {
    loadDetail()
    return () => { cleanup() }
  }, [id])

  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  const loadDetail = async () => {
    try {
      const res = await optimizeAPI.getStatus(id)
      const data = res.data
      setRecord(data)

      try {
        const segRes = await optimizeAPI.getSegments(id)
        if (segRes.data?.length > 0) setSegments(segRes.data)
      } catch (_) {}

      try {
        const changeRes = await optimizeAPI.getChanges(id)
        setChanges(changeRes.data || [])
      } catch (_) {}

      const isProcessing = data.status === 'processing' || data.status === 'pending'
      if (isProcessing) startTracking()

      try {
        const progRes = await optimizeAPI.getProgress(id)
        setProgress({
          completed: progRes.data.current_position || 0,
          total: progRes.data.total_segments || 0,
        })
        if (progRes.data.overall_progress !== undefined) {
          setOverallProgress(progRes.data.overall_progress)
        } else {
          setOverallProgress(Math.round((progRes.data.current_position || 0) / (progRes.data.total_segments || 1) * 100))
        }
      } catch (_) {}
    } catch (error) {
      toast.error('加载记录失败')
      navigate('/')
    }
  }

  const startTracking = () => {
    cleanup()
    const streamUrl = optimizeAPI.getStreamUrl(id)
    const es = new EventSource(streamUrl)
    eventSourceRef.current = es

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        if (data.type === 'content_chunk') {
          setStreamingText(prev => prev + (data.chunk || ''))
          if (data.stage) setCurrentStage(data.stage)
        }

        if (data.type === 'parsing') {
          setParsingMessage(data.message || '正在解析文档...')
          setRecord(prev => prev ? { ...prev, status: 'parsing' } : prev)
        }

        if (data.type === 'parsing_done') {
          setParsingMessage('')
        }

        if (data.type === 'segment_complete') {
          setStreamingText('')  // Reset streaming text after segment completes

          if (data.stage_index !== undefined && data.total_stages !== undefined) {
            setStageProgress({ stageIndex: data.stage_index, totalStages: data.total_stages })
          }

          if (data.total_segments) {
            setProgress({
              completed: (data.segment_index || 0) + 1,
              total: data.total_segments,
            })
          }

          if (data.progress !== undefined) {
            const newProgress = Math.round(data.progress * 100)
            setOverallProgress(prev => Math.max(prev, newProgress))
          }

          optimizeAPI.getSegments(id).then(segRes => {
            if (segRes.data?.length > 0) setSegments(segRes.data)
          }).catch(() => {})
          optimizeAPI.getChanges(id).then(changeRes => {
            setChanges(changeRes.data || [])
          }).catch(() => {})
        }

        if (data.type === 'completed') {
          setRecord(prev => ({
            ...prev,
            status: 'completed',
            optimized_text: data.optimized_text,
            original_text: data.original_text,
          }))
          setStreamingText('')
          cleanup()
          loadDetail()
          toast.success('优化完成！')
        }

        if (data.type === 'failed') {
          cleanup()
          loadDetail()
          toast.error(data.error || '处理失败')
        }

        if (data.type === 'stopped') {
          cleanup()
          loadDetail()
          toast.error('处理已停止')
        }

        if (data.type === 'timeout') {
          es.close()
          eventSourceRef.current = null
        }
      } catch (err) {
        console.error('SSE parse error:', err)
      }
    }

    es.onerror = () => {
      es.close()
      eventSourceRef.current = null
    }

    pollRef.current = setInterval(async () => {
      try {
        const statusRes = await optimizeAPI.getStatus(id)
        const data = statusRes.data
        if (data.status === 'completed' || data.status === 'failed' || data.status === 'stopped') {
          setRecord(data)
          cleanup()
          loadDetail()
        }
      } catch (_) {}
    }, 5000)
  }

  const handleStop = async () => {
    try {
      await optimizeAPI.stop(id)
      toast.success('已发送停止信号')
    } catch (e) {
      toast.error(e.message || '停止失败')
    }
  }

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success('已复制到剪贴板')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('复制失败')
    }
  }

  const handleDownload = () => {
    const text = getOptimizedText()
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `myzero_optimized_${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('已下载')
  }

  const handleExport = async () => {
    try {
      const response = await optimizeAPI.export(id)
      const content = response.data.content
      const filename = response.data.filename
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setShowExportModal(false)
      toast.success('导出成功')
    } catch (e) {
      toast.error(e.message || '导出失败')
    }
  }

  const getOriginalText = () => {
    if (segments.length > 0) {
      return segments
        .sort((a, b) => a.segment_index - b.segment_index)
        .map(seg => seg.original_text)
        .join('\n\n')
    }
    return record?.original_text || ''
  }

  const getOptimizedText = () => {
    if (streamingText) return streamingText
    if (segments.length > 0) {
      return segments
        .sort((a, b) => a.segment_index - b.segment_index)
        .map(seg => seg.optimized_text || seg.original_text)
        .join('\n\n')
    }
    return record?.optimized_text || ''
  }

  const getModeLabel = (modeId) => {
    const labels = { polish: '论文润色', humanize: 'AIGC 降重', combined: '综合优化' }
    return labels[modeId] || modeId
  }

  const getStageLabel = (stage) => {
    const labels = { polish: '润色阶段', enhance: '增强阶段' }
    return labels[stage] || stage
  }

  const isProcessing = record?.status === 'processing' || record?.status === 'pending'

  if (!record) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center animate-fade-in">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between animate-slide-down">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl font-serif font-bold text-slate-800">处理详情</h1>
            <span className="text-xs text-slate-400">
              {new Date(record.created_at).toLocaleString('zh-CN')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {record.status === 'completed' && (
            <div className="flex items-center gap-1.5 text-green-700 bg-green-50 px-2.5 py-1 rounded-full animate-slide-up">
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs font-medium">已完成</span>
            </div>
          )}

          {record.status === 'failed' && (
            <div className="flex items-center gap-1.5 text-red-700 bg-red-50 px-2.5 py-1 rounded-full animate-slide-up">
              <XCircle className="w-4 h-4" />
              <span className="text-xs font-medium">处理失败</span>
            </div>
          )}

          {record.status === 'stopped' && (
            <div className="flex items-center gap-1.5 text-orange-700 bg-orange-50 px-2.5 py-1 rounded-full animate-slide-up">
              <XCircle className="w-4 h-4" />
              <span className="text-xs font-medium">已停止</span>
            </div>
          )}

          {isProcessing && (
            <button
              onClick={handleStop}
              className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 py-1.5 px-3 rounded-full text-sm font-medium transition-colors"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              停止
            </button>
          )}
        </div>
      </div>

      {/* Processing progress */}
      {record?.status === 'parsing' && (
        <div className="card-static p-5 space-y-3 animate-slide-up">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
            <span className="text-sm font-medium text-slate-700">
              {parsingMessage || '正在解析文档...'}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div className="bg-gradient-to-r from-primary-500 via-blue-500 to-violet-500 h-full rounded-full progress-shimmer" style={{ width: '40%' }} />
          </div>
          <p className="text-xs text-slate-400">文档解析需要 10-60 秒，请耐心等待</p>
        </div>
      )}

      {isProcessing && (
        <div className="card-static p-5 space-y-3 animate-slide-up">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
            <span className="text-sm font-medium text-slate-700">
              {stageProgress.totalStages > 1
                ? `${getStageLabel(currentStage || 'polish')} — ${progress.completed} / ${progress.total} 段`
                : progress.total > 0
                  ? `正在处理：${progress.completed} / ${progress.total} 段`
                  : '正在处理，请稍候...'}
            </span>
          </div>

          {(progress.total > 0 || overallProgress > 0) && (
            <div className="space-y-2">
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary-500 via-blue-500 to-violet-500 h-full rounded-full transition-all duration-500 ease-out progress-shimmer"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              <div className="flex justify-between">
                <p className="text-xs text-slate-400">
                  {stageProgress.totalStages > 1
                    ? `阶段 ${stageProgress.stageIndex + 1}/${stageProgress.totalStages}`
                    : ''}
                </p>
                <p className="text-xs text-slate-400">{overallProgress}%</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Failed error message */}
      {record.status === 'failed' && record.error_message && (
        <div className="bg-red-50/50 border border-red-100 rounded-xl p-4 animate-slide-up">
          <p className="text-xs font-medium text-red-600 uppercase tracking-wide mb-1">错误信息</p>
          <p className="text-sm text-red-700">{record.error_message}</p>
        </div>
      )}

      {/* Mode tag */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-gradient-to-r from-primary-50 to-blue-50 text-primary-700 rounded-full font-medium border border-primary-100">
          {getModeLabel(record.mode)}
        </span>
        {stageProgress.totalStages > 1 && record.mode === 'combined' && (
          <span className="text-xs text-slate-400">（两阶段处理：润色 + 增强）</span>
        )}
      </div>

      {/* Tab Switcher */}
      {(record.status === 'completed' || getOptimizedText()) && (
        <div className="flex justify-center">
          <div className="bg-slate-100 p-1 rounded-xl inline-flex w-full max-w-md">
            <button
              onClick={() => setActiveTab('result')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'result'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <FileText className="w-4 h-4" />
                优化结果
              </div>
            </button>
            <button
              onClick={() => setActiveTab('compare')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'compare'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <GitCompare className="w-4 h-4" />
                变更对照
                {changes.length > 0 && (
                  <span className="bg-primary-100 text-primary-700 text-xs px-1.5 py-0.5 rounded-full">
                    {changes.length}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="space-y-4">
        {activeTab === 'result' && (record.status === 'completed' || getOptimizedText()) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-in">
            {/* Optimized Text */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col h-[500px] shadow-sm">
              <div className="p-3 bg-gradient-to-r from-primary-50 to-blue-50 border-b border-primary-100 flex justify-between items-center">
                <h4 className="text-sm font-semibold text-primary-800">优化后的文本</h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(getOptimizedText())}
                    className="text-xs text-primary-600 hover:text-primary-700 px-2 py-1 hover:bg-primary-50 rounded transition-colors flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? '已复制' : '复制全文'}
                  </button>
                  {record.status === 'completed' && (
                    <button
                      onClick={() => setShowExportModal(true)}
                      className="text-xs text-primary-600 hover:text-primary-700 px-2 py-1 hover:bg-primary-50 rounded transition-colors flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      导出
                    </button>
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                <pre className="whitespace-pre-wrap font-serif text-[15px] text-slate-800 leading-relaxed">
                  {getOptimizedText()}
                </pre>
              </div>
            </div>

            {/* Original Text */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col h-[500px] shadow-sm">
              <div className="p-3 bg-slate-50 border-b border-slate-100">
                <h4 className="text-sm font-semibold text-slate-500">原始文本</h4>
              </div>
              <div className="flex-1 overflow-y-auto p-5 bg-slate-50/50">
                <pre className="whitespace-pre-wrap font-serif text-[15px] text-slate-500 leading-relaxed">
                  {getOriginalText()}
                </pre>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'compare' && (
          <div className="min-h-[500px] animate-fade-in">
            {changes.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <GitCompare className="w-8 h-8" />
                </div>
                <p className="text-slate-500 font-medium">暂无变更记录</p>
                <p className="text-sm text-slate-400 mt-1">文本可能未做修改或变更记录尚未生成</p>
              </div>
            ) : (
              <div className="space-y-4 stagger-children">
                {changes.map((change) => (
                  <div
                    key={change.id}
                    className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow bg-white"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <span className="bg-gradient-to-r from-primary-50 to-blue-50 text-primary-700 text-xs font-bold px-2.5 py-1 rounded-lg border border-primary-100">
                        段落 {change.segment_index + 1}
                      </span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                        change.stage === 'enhance'
                          ? 'bg-violet-100 text-violet-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {change.stage === 'polish' ? '润色' : change.stage === 'enhance' ? '增强' : getModeLabel(record.mode)}
                      </span>
                      {change.changes_detail && (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          change.changes_detail.length_delta > 0
                            ? 'bg-green-50 text-green-600'
                            : change.changes_detail.length_delta < 0
                              ? 'bg-red-50 text-red-600'
                              : 'text-slate-400'
                        }`}>
                          {change.changes_detail.length_delta > 0 ? '+' : ''}{change.changes_detail.length_delta} 字符
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-xs font-semibold text-red-400 mb-2 uppercase tracking-wide">
                          修改前
                        </h4>
                        <div className="bg-red-50/50 border border-red-100/80 rounded-lg p-4 text-[14px] text-slate-700 leading-relaxed whitespace-pre-wrap font-serif">
                          {change.before_text}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-semibold text-green-500 mb-2 uppercase tracking-wide">
                          修改后
                        </h4>
                        <div className="bg-green-50/50 border border-green-100/80 rounded-lg p-4 text-[14px] text-slate-800 leading-relaxed font-medium whitespace-pre-wrap font-serif">
                          {change.after_text}
                        </div>
                      </div>
                    </div>

                    {change.changes_detail && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {change.changes_detail.added_count > 0 && (
                          <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-md font-medium">
                            +{change.changes_detail.added_count} 新增词
                          </span>
                        )}
                        {change.changes_detail.removed_count > 0 && (
                          <span className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded-md font-medium">
                            -{change.changes_detail.removed_count} 删除词
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Original text for processing/failed items */}
      {activeTab === 'result' && !getOptimizedText() && getOriginalText() && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col h-[500px] shadow-sm animate-fade-in">
          <div className="p-3 bg-slate-50 border-b border-slate-100">
            <h4 className="text-sm font-semibold text-slate-500">原始文本</h4>
          </div>
          <div className="flex-1 overflow-y-auto p-5 bg-slate-50/50">
            <pre className="whitespace-pre-wrap font-serif text-[15px] text-slate-500 leading-relaxed">
              {getOriginalText()}
            </pre>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slide-up">
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary-50">
                  <Shield className="w-5 h-5 text-primary-600" />
                </div>
                <h3 className="text-lg font-serif font-semibold text-slate-800">导出确认</h3>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="ml-auto p-1 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="space-y-3 text-sm text-slate-600">
                <p>请确认以下事项：</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span>导出内容仅用于学术参考</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span>核心观点为原作者所有</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span>使用者对最终成果负全部责任</span>
                  </li>
                </ul>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="flex-1 btn-secondary py-2.5"
                >
                  取消
                </button>
                <button
                  onClick={handleExport}
                  className="flex-1 btn-cta py-2.5 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  确认导出
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ResultPage
