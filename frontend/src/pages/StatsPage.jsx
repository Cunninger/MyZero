import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  BarChart3,
  FileText,
  Zap,
  Calendar,
  TrendingUp,
  PieChart as PieChartIcon,
  Activity,
  Hash
} from 'lucide-react'
import { statsAPI } from '../api'
import { CHART_COLORS, getModeLabel } from '../utils/modeConfig'
import { useCountUp } from '../hooks/useCountUp'
import {
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'

const CARD_THEMES = [
  {
    icon: FileText,
    label: '总处理字数',
    unit: '字符',
    key: 'total_characters',
    bgLight: 'bg-blue-50',
    textLight: 'text-blue-600',
    borderTop: 'border-t-4 border-blue-500',
  },
  {
    icon: BarChart3,
    label: '总记录数',
    unit: '篇',
    key: 'total_records',
    bgLight: 'bg-violet-50',
    textLight: 'text-violet-600',
    borderTop: 'border-t-4 border-violet-500',
  },
  {
    icon: Zap,
    label: 'Token 消耗',
    unit: '估算值',
    key: 'total_tokens',
    bgLight: 'bg-amber-50',
    textLight: 'text-amber-600',
    borderTop: 'border-t-4 border-amber-500',
  },
  {
    icon: Calendar,
    label: '活跃天数',
    unit: '天',
    key: 'active_days',
    bgLight: 'bg-emerald-50',
    textLight: 'text-emerald-600',
    borderTop: 'border-t-4 border-emerald-500',
  }
]

const EmptyState = ({ icon: Icon, title, description }) => (
  <div className="h-64 flex flex-col items-center justify-center text-slate-400 space-y-3">
    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
      <Icon className="w-6 h-6 text-slate-300" />
    </div>
    <div className="text-center">
      <p className="text-slate-500 font-medium text-sm">{title}</p>
      {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
    </div>
  </div>
)

const StatCard = ({ theme, value, index }) => {
  const { count, isComplete } = useCountUp(value || 0, 1200 + index * 150)
  const Icon = theme.icon

  return (
    <div
      className={`group relative bg-white rounded-xl border border-slate-200 shadow-sm ${theme.borderTop}
        hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default
        animate-slide-up`}
      style={{ animationDelay: `${index * 75}ms` }}
    >
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <span>{theme.label}</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-slate-800 tracking-tight tabular-nums">
                {count.toLocaleString()}
              </span>
              {!isComplete && (
                <span className="text-xs text-slate-400 font-medium">{theme.unit}</span>
              )}
            </div>
            {isComplete && (
              <div className="text-xs text-slate-400 font-medium">{theme.unit}</div>
            )}
          </div>
          <div
            className={`w-11 h-11 rounded-xl ${theme.bgLight} flex items-center justify-center
              group-hover:scale-110 transition-transform duration-200`}
          >
            <Icon className={`w-5 h-5 ${theme.textLight}`} />
          </div>
        </div>
      </div>
    </div>
  )
}

const SkeletonCard = ({ index }) => (
  <div
    className="bg-white rounded-xl border border-slate-200 border-t-4 border-t-slate-300 p-5 animate-slide-up"
    style={{ animationDelay: `${index * 75}ms` }}
  >
    <div className="flex items-start justify-between">
      <div className="space-y-3 w-full">
        <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
        <div className="h-8 w-32 bg-slate-200 rounded animate-pulse" />
        <div className="h-3 w-12 bg-slate-200 rounded animate-pulse" />
      </div>
      <div className="w-11 h-11 rounded-xl bg-slate-200 animate-pulse shrink-0 ml-4" />
    </div>
  </div>
)

const SkeletonChart = () => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 animate-slide-up">
    <div className="flex items-center gap-2 mb-6">
      <div className="h-5 w-5 bg-slate-200 rounded animate-pulse" />
      <div className="h-5 w-32 bg-slate-200 rounded animate-pulse" />
    </div>
    <div className="h-64 bg-slate-100 rounded-lg animate-pulse" />
  </div>
)

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

  const modeData = summary?.mode_distribution
    ? [
        { name: getModeLabel('polish'), value: summary.mode_distribution.polish || 0, color: CHART_COLORS.polish },
        { name: getModeLabel('humanize'), value: summary.mode_distribution.humanize || 0, color: CHART_COLORS.humanize },
        { name: getModeLabel('combined'), value: summary.mode_distribution.combined || 0, color: CHART_COLORS.combined }
      ]
    : []

  const totalModes = modeData.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="min-h-full p-4 md:p-6 lg:p-8 space-y-6 bg-slate-50/50">
      {/* Header */}
      <div className="flex items-center gap-4 animate-fade-in">
        <button
          onClick={() => navigate('/')}
          className="p-2.5 hover:bg-white rounded-xl transition-all duration-200 hover:shadow-sm border border-transparent hover:border-slate-200"
          aria-label="返回首页"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-800">使用统计</h1>
          <p className="text-sm text-slate-500 mt-0.5">追踪您的使用情况和生产力趋势</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} index={i} />)
          : CARD_THEMES.map((theme, i) => (
              <StatCard
                key={theme.key}
                theme={theme}
                value={summary?.[theme.key]}
                index={i}
              />
            ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mode Distribution */}
        <div
          className="bg-white rounded-xl border border-slate-200 shadow-sm p-6
            hover:shadow-md transition-shadow duration-200 animate-slide-up"
          style={{ animationDelay: '300ms' }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center">
                <PieChartIcon className="w-5 h-5 text-violet-500" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-800">模式分布</h3>
                <p className="text-xs text-slate-500">各功能使用占比</p>
              </div>
            </div>
            {totalModes > 0 && (
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                共 {totalModes} 次
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="h-72 bg-slate-100 rounded-lg animate-pulse" />
          ) : totalModes > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={modeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {modeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null
                      const data = payload[0].payload
                      return (
                        <div className="bg-white rounded-lg shadow-lg border border-slate-200 px-3 py-2 text-sm">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: data.color }}
                            />
                            <span className="text-slate-600">{data.name}</span>
                            <span className="font-semibold text-slate-800 ml-2">
                              {data.value} 次
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 mt-1 pl-5">
                            占比 {((data.value / totalModes) * 100).toFixed(1)}%
                          </div>
                        </div>
                      )
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span className="text-sm text-slate-600 ml-1">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              icon={PieChartIcon}
              title="暂无数据"
              description="使用各功能后，此处将显示模式分布"
            />
          )}
        </div>

        {/* Usage Trend */}
        <div
          className="bg-white rounded-xl border border-slate-200 shadow-sm p-6
            hover:shadow-md transition-shadow duration-200 animate-slide-up"
          style={{ animationDelay: '375ms' }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-800">使用趋势</h3>
                <p className="text-xs text-slate-500">近 30 天使用量变化</p>
              </div>
            </div>
          </div>

          {isLoading ? (
            <SkeletonChart />
          ) : trend.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorChars" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorRecords" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => {
                      const d = new Date(date)
                      return `${d.getMonth() + 1}/${d.getDate()}`
                    }}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null
                      return (
                        <div className="bg-white rounded-lg shadow-lg border border-slate-200 px-4 py-3 text-sm">
                          <div className="font-medium text-slate-700 mb-2 pb-1.5 border-b border-slate-100">
                            {new Date(label).toLocaleDateString('zh-CN', {
                              month: 'long',
                              day: 'numeric',
                              weekday: 'short'
                            })}
                          </div>
                          <div className="space-y-1.5">
                            {payload.map((entry, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <div
                                  className="w-2.5 h-2.5 rounded-full"
                                  style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-slate-500">{entry.name}:</span>
                                <span className="font-semibold text-slate-800 ml-auto tabular-nums">
                                  {entry.name === '字数'
                                    ? `${entry.value.toLocaleString()} 字`
                                    : entry.value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    height={24}
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span className="text-xs text-slate-500 ml-1">{value}</span>
                    )}
                  />
                  <Area
                    type="monotone"
                    dataKey="characters"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    fill="url(#colorChars)"
                    name="字数"
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="records"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fill="url(#colorRecords)"
                    name="记录数"
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              icon={Activity}
              title="暂无趋势数据"
              description="使用一段时间后，此处将显示使用趋势"
            />
          )}
        </div>
      </div>

      {/* Daily Breakdown */}
      <div
        className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden
          hover:shadow-md transition-shadow duration-200 animate-slide-up"
        style={{ animationDelay: '450ms' }}
      >
        <div className="p-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
              <Hash className="w-5 h-5 text-slate-500" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-800">每日详情</h3>
              <p className="text-xs text-slate-500">最近 30 天的详细使用记录</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : trend.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="text-left py-3.5 px-6 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                    日期
                  </th>
                  <th className="text-right py-3.5 px-6 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                    字数
                  </th>
                  <th className="text-right py-3.5 px-6 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                    记录数
                  </th>
                  <th className="text-right py-3.5 px-6 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                    Token
                  </th>
                </tr>
              </thead>
              <tbody>
                {trend
                  .slice()
                  .reverse()
                  .map((day, idx) => {
                    const date = new Date(day.date)
                    const isToday =
                      new Date().toDateString() === date.toDateString()
                    return (
                      <tr
                        key={idx}
                        className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors duration-150
                          animate-slide-up"
                        style={{ animationDelay: `${500 + idx * 40}ms` }}
                      >
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                isToday ? 'bg-emerald-400' : 'bg-slate-300'
                              }`}
                            />
                            <span className="text-slate-700 font-medium">
                              {date.toLocaleDateString('zh-CN', {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                            {isToday && (
                              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                                今天
                              </span>
                            )}
                            <span className="text-xs text-slate-400">
                              {date.toLocaleDateString('zh-CN', { weekday: 'short' })}
                            </span>
                          </div>
                        </td>
                        <td className="text-right py-3.5 px-6">
                          <span className="text-slate-600 tabular-nums font-medium">
                            {day.characters.toLocaleString()}
                          </span>
                        </td>
                        <td className="text-right py-3.5 px-6">
                          <span
                            className={`inline-flex items-center justify-center min-w-[1.75rem] px-2 py-0.5 rounded-full text-xs font-semibold tabular-nums
                            ${
                              day.records > 0
                                ? 'bg-blue-50 text-blue-600'
                                : 'bg-slate-100 text-slate-400'
                            }`}
                          >
                            {day.records}
                          </span>
                        </td>
                        <td className="text-right py-3.5 px-6">
                          <span className="text-slate-500 tabular-nums">
                            {day.tokens.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12">
            <EmptyState
              icon={Calendar}
              title="暂无每日数据"
              description="使用应用后，此处将显示每日详细统计"
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default StatsPage
