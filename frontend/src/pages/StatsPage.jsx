import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowLeft, BarChart3, FileText, Zap, Calendar, TrendingUp } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import { statsAPI } from '../api'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const COLORS = {
  polish: '#3b82f6',
  humanize: '#8b5cf6',
  combined: '#10b981'
}

const StatsPage = () => {
  const navigate = useNavigate()
  const [summary, setSummary] = useState(null)
  const [trend, setTrend] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const [summaryRes, trendRes] = await Promise.all([
        statsAPI.getSummary(),
        statsAPI.getTrend(30)
      ])
      setSummary(summaryRes.data)
      setTrend(trendRes.data)
    } catch (error) {
      toast.error('加载统计数据失败')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const modeData = summary?.mode_distribution ? [
    { name: '论文润色', value: summary.mode_distribution.polish || 0, color: COLORS.polish },
    { name: 'AIGC 降重', value: summary.mode_distribution.humanize || 0, color: COLORS.humanize },
    { name: '综合优化', value: summary.mode_distribution.combined || 0, color: COLORS.combined },
  ] : []

  const totalModes = modeData.reduce((sum, item) => sum + item.value, 0)

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
        <h1 className="text-2xl font-serif font-bold text-slate-800">使用统计</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-static p-5 space-y-2">
          <div className="flex items-center gap-2 text-slate-500">
            <FileText className="w-4 h-4" />
            <span className="text-sm">总处理字数</span>
          </div>
          <div className="text-2xl font-bold text-slate-800">
            {summary?.total_characters?.toLocaleString() || 0}
          </div>
          <div className="text-xs text-slate-400">字符</div>
        </div>

        <div className="card-static p-5 space-y-2">
          <div className="flex items-center gap-2 text-slate-500">
            <BarChart3 className="w-4 h-4" />
            <span className="text-sm">总记录数</span>
          </div>
          <div className="text-2xl font-bold text-slate-800">
            {summary?.total_records || 0}
          </div>
          <div className="text-xs text-slate-400">篇</div>
        </div>

        <div className="card-static p-5 space-y-2">
          <div className="flex items-center gap-2 text-slate-500">
            <Zap className="w-4 h-4" />
            <span className="text-sm">Token 消耗</span>
          </div>
          <div className="text-2xl font-bold text-slate-800">
            {summary?.total_tokens?.toLocaleString() || 0}
          </div>
          <div className="text-xs text-slate-400">估算值</div>
        </div>

        <div className="card-static p-5 space-y-2">
          <div className="flex items-center gap-2 text-slate-500">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">活跃天数</span>
          </div>
          <div className="text-2xl font-bold text-slate-800">
            {summary?.active_days || 0}
          </div>
          <div className="text-xs text-slate-400">天</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mode Distribution */}
        <div className="card-static p-6">
          <h3 className="text-lg font-serif font-semibold text-slate-800 mb-4">模式分布</h3>
          {totalModes > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={modeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {modeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400">
              暂无数据
            </div>
          )}
        </div>

        {/* Usage Trend */}
        <div className="card-static p-6">
          <h3 className="text-lg font-serif font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            使用趋势（30 天）
          </h3>
          {trend.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => {
                      const d = new Date(date)
                      return `${d.getMonth() + 1}/${d.getDate()}`
                    }}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(date) => new Date(date).toLocaleDateString('zh-CN')}
                    formatter={(value, name) => [
                      name === 'characters' ? `${value.toLocaleString()} 字` : value,
                      name === 'characters' ? '字数' : '记录数'
                    ]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="characters"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="字数"
                  />
                  <Line
                    type="monotone"
                    dataKey="records"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="记录数"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400">
              暂无数据
            </div>
          )}
        </div>
      </div>

      {/* Daily Breakdown */}
      {trend.length > 0 && (
        <div className="card-static p-6">
          <h3 className="text-lg font-serif font-semibold text-slate-800 mb-4">每日详情</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-700">日期</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-700">字数</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-700">记录数</th>
                  <th className="text-right py-3 px-4 font-medium text-slate-700">Token</th>
                </tr>
              </thead>
              <tbody>
                {trend.slice().reverse().map((day, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-800">
                      {new Date(day.date).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="text-right py-3 px-4 text-slate-600 font-mono">
                      {day.characters.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4 text-slate-600 font-mono">
                      {day.records}
                    </td>
                    <td className="text-right py-3 px-4 text-slate-600 font-mono">
                      {day.tokens.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default StatsPage
