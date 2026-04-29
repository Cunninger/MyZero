import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowLeft, Save, TestTube, Key, Sliders, ChevronDown, Globe, Eye, EyeOff, FileSearch, Sparkles, Settings } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import CollapsibleSection from '../components/CollapsibleSection'
import { configAPI } from '../api'

const API_PROVIDERS = [
  {
    id: 'deepseek',
    name: 'DeepSeek',
    url: 'https://api.deepseek.com',
    models: [
      { id: 'deepseek-chat', name: 'DeepSeek V3.2', desc: '通用对话，128K 上下文' },
      { id: 'deepseek-reasoner', name: 'DeepSeek R2', desc: '深度推理，思维链' },
    ],
  },
  {
    id: 'openai',
    name: 'OpenAI',
    url: 'https://api.openai.com/v1',
    models: [
      { id: 'gpt-4.1', name: 'GPT-4.1', desc: '旗舰非推理，1M 上下文' },
      { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', desc: '快速经济' },
      { id: 'gpt-4.1-nano', name: 'GPT-4.1 Nano', desc: '最轻量低成本' },
      { id: 'gpt-4o', name: 'GPT-4o', desc: '经典全能模型' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', desc: '小型快速' },
    ],
  },
  {
    id: 'zhipu',
    name: '智谱 GLM',
    url: 'https://open.bigmodel.cn/api/paas/v4',
    models: [
      { id: 'GLM-5.1', name: 'GLM-5.1', desc: '最新旗舰，200K 上下文' },
      { id: 'GLM-5', name: 'GLM-5', desc: '高智能模型' },
      { id: 'GLM-4.7', name: 'GLM-4.7', desc: '均衡性价比' },
      { id: 'GLM-4.7-Flash', name: 'GLM-4.7 Flash', desc: '免费快速' },
      { id: 'GLM-4-Long', name: 'GLM-4 Long', desc: '1M 超长上下文' },
    ],
  },
  {
    id: 'qwen',
    name: '通义千问',
    url: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    models: [
      { id: 'qwen3-max', name: 'Qwen3 Max', desc: '最新旗舰，262K 上下文' },
      { id: 'qwen-plus', name: 'Qwen Plus', desc: '均衡性价比，1M 上下文' },
      { id: 'qwen-flash', name: 'Qwen Flash', desc: '最快最经济' },
      { id: 'qwen-long', name: 'Qwen Long', desc: '10M 超长上下文' },
    ],
  },
  {
    id: 'kimi',
    name: '月之暗面 Kimi',
    url: 'https://api.moonshot.cn/v1',
    models: [
      { id: 'kimi-k2.6', name: 'Kimi K2.6', desc: '最新旗舰，多模态' },
      { id: 'kimi-k2.5', name: 'Kimi K2.5', desc: '万亿参数，256K 上下文' },
      { id: 'kimi-k2', name: 'Kimi K2', desc: '通用 MoE 模型' },
      { id: 'moonshot-v1-128k', name: 'Moonshot V1 128K', desc: '经典长上下文' },
    ],
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    url: 'https://generativelanguage.googleapis.com/v1beta/openai',
    models: [
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', desc: '最强推理，1M 上下文' },
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', desc: '性价比最优' },
      { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', desc: '最轻量快速' },
    ],
  },
  {
    id: 'yi',
    name: '零一万物 Yi',
    url: 'https://api.lingyiwanwu.com/v1',
    models: [
      { id: 'yi-lightning', name: 'Yi Lightning', desc: '极速 MoE，免费' },
    ],
  },
  {
    id: 'groq',
    name: 'Groq',
    url: 'https://api.groq.com/openai/v1',
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', desc: '通用开源旗舰' },
      { id: 'openai/gpt-oss-120b', name: 'GPT-OSS 120B', desc: 'OpenAI 开源模型' },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', desc: '极速推理' },
    ],
  },
  {
    id: 'siliconflow',
    name: 'SiliconFlow',
    url: 'https://api.siliconflow.cn/v1',
    models: [
      { id: 'deepseek-ai/DeepSeek-V3.2', name: 'DeepSeek V3.2', desc: '671B MoE 最新' },
      { id: 'Pro/moonshotai/Kimi-K2.5', name: 'Kimi K2.5', desc: '万亿参数旗舰' },
      { id: 'Qwen/Qwen3.5-397B-A17B', name: 'Qwen 3.5 397B', desc: 'MoE 高性能' },
      { id: 'deepseek-ai/DeepSeek-R1', name: 'DeepSeek R1', desc: '推理专用' },
    ],
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    url: 'https://openrouter.ai/api/v1',
    models: [
      { id: 'deepseek/deepseek-v3.2', name: 'DeepSeek V3.2', desc: 'DeepSeek 最新' },
      { id: 'anthropic/claude-sonnet-4-20250514', name: 'Claude Sonnet 4', desc: 'Anthropic 旗舰' },
      { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro', desc: 'Google 旗舰' },
      { id: 'qwen/qwen3.6-plus-preview:free', name: 'Qwen 3.6 Plus', desc: '免费体验' },
    ],
  },
]

const detectProvider = (baseUrl) => {
  if (!baseUrl) return null
  const normalized = baseUrl.replace(/\/+$/, '')
  return API_PROVIDERS.find(p => p.url.replace(/\/+$/, '') === normalized) || null
}

const SettingsPage = () => {
  const [config, setConfig] = useState({
    api_key: '',
    base_url: 'https://api.openai.com/v1',
    model_name: 'gpt-3.5-turbo',
    temperature: 0.7,
    max_tokens: 4096,
    default_mode: 'combined',
    dark_mode: false,
    api_request_interval: 6,
    mineru_api_token: '',
    segment_max_length: 500,
    segment_skip_threshold: 15,
    api_timeout: 120,
    compression_threshold: 5000,
  })
  const [templates, setTemplates] = useState({ domain: [], journal: [], general: [] })
  const [activeTemplateId, setActiveTemplateId] = useState('default')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [providerOpen, setProviderOpen] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const navigate = useNavigate()

  const activeProvider = detectProvider(config.base_url)

  useEffect(() => {
    loadConfig()
    loadTemplates()
  }, [])

  const loadConfig = async () => {
    try {
      const response = await configAPI.get()
      const data = response.data
      setConfig({
        ...data,
        segment_max_length: data.segment_max_length ?? 500,
        segment_skip_threshold: data.segment_skip_threshold ?? 15,
        api_timeout: data.api_timeout ?? 120,
        dark_mode: data.dark_mode ?? false,
        compression_threshold: data.compression_threshold ?? 5000,
      })
      if (data.active_template_id) {
        setActiveTemplateId(data.active_template_id)
      }
    } catch (error) {
      toast.error('加载配置失败')
    } finally {
      setIsLoading(false)
    }
  }

  const loadTemplates = async () => {
    try {
      const response = await configAPI.getTemplates()
      setTemplates(response.data)
    } catch (error) {
      console.error('加载模板失败:', error)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await configAPI.update(config)
      toast.success('配置已保存')
    } catch (error) {
      toast.error(error.message || '保存失败')
    } finally {
      setIsSaving(false)
    }
  }

  const handleTest = async () => {
    setIsTesting(true)
    try {
      await configAPI.update(config)
      const response = await configAPI.testConnection()
      if (response.data.success) {
        toast.success('连接成功！')
      } else {
        toast.error(response.data.error || '连接失败')
      }
    } catch (error) {
      toast.error(error.message || '测试连接失败')
    } finally {
      setIsTesting(false)
    }
  }

  const handleChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }))
  }

  const selectProvider = (provider) => {
    setConfig(prev => ({
      ...prev,
      base_url: provider.url,
      model_name: provider.models[0].id,
    }))
    setProviderOpen(false)
  }

  const handleSelectTemplate = async (templateId) => {
    try {
      await configAPI.setActiveTemplate(templateId)
      setActiveTemplateId(templateId)
      toast.success('模板已激活')
    } catch (error) {
      toast.error('激活模板失败')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/')}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <h1 className="text-2xl font-serif font-bold text-slate-800">设置</h1>
      </div>

      {/* API 连接 */}
      <CollapsibleSection
        title="API 连接"
        icon={Key}
        iconBg="bg-primary-50"
        iconColor="text-primary-600"
        defaultOpen={true}
      >
        {/* Provider Selector */}
        <div className="relative">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">API 服务商</label>
          <button
            onClick={() => setProviderOpen(!providerOpen)}
            className="input-field flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-slate-400" />
              {activeProvider ? (
                <span className="text-slate-800">{activeProvider.name}</span>
              ) : (
                <span className="text-slate-400">选择服务商快速配置...</span>
              )}
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${providerOpen ? 'rotate-180' : ''}`} />
          </button>

          {providerOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setProviderOpen(false)} />
              <div className="absolute z-30 left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-xl max-h-80 overflow-y-auto animate-slide-down">
                {API_PROVIDERS.map((provider) => {
                  const isActive = activeProvider?.id === provider.id
                  return (
                    <button
                      key={provider.id}
                      onClick={() => selectProvider(provider)}
                      className={`w-full px-4 py-3 flex items-center justify-between text-left transition-colors ${
                        isActive
                          ? 'bg-primary-50 text-primary-700'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium">{provider.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{provider.url}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">{provider.models.length} 个模型</span>
                        {isActive && (
                          <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium">当前</span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">API Key</label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={config.api_key}
                onChange={(e) => handleChange('api_key', e.target.value)}
                placeholder="sk-..."
                className="input-field pr-10"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Base URL</label>
            <input
              type="url"
              value={config.base_url}
              onChange={(e) => handleChange('base_url', e.target.value)}
              placeholder="https://api.openai.com/v1"
              className="input-field font-mono text-sm"
            />
            <p className="mt-1 text-xs text-slate-400">选择服务商后自动填充，也可手动输入自定义地址</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">模型</label>
            <input
              type="text"
              value={config.model_name}
              onChange={(e) => handleChange('model_name', e.target.value)}
              placeholder="输入自定义模型名称..."
              className="input-field font-mono text-sm"
            />
            {activeProvider && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {activeProvider.models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => handleChange('model_name', model.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-all duration-150 ${
                      config.model_name === model.id
                        ? 'bg-primary-100 text-primary-700 ring-1 ring-primary-200 font-medium'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    title={model.desc}
                  >
                    {model.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleTest}
          disabled={isTesting || !config.api_key}
          className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isTesting ? (
            <>
              <LoadingSpinner size="sm" />
              测试中...
            </>
          ) : (
            <>
              <TestTube className="w-4 h-4" />
              测试连接
            </>
          )}
        </button>
      </CollapsibleSection>

      {/* Prompt 模板 */}
      <CollapsibleSection
        title="Prompt 模板"
        icon={Sparkles}
        iconBg="bg-amber-50"
        iconColor="text-amber-600"
        defaultOpen={true}
      >
        <p className="text-sm text-slate-500">
          选择不同领域或期刊风格的模板，AI 将按照相应的写作风格进行优化
        </p>

        {templates.domain?.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">领域模板</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {templates.domain.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => handleSelectTemplate(tpl.id)}
                  className={`p-3 rounded-lg text-center transition-all ${
                    activeTemplateId === tpl.id
                      ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <div className="text-sm font-medium">{tpl.name}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {templates.journal?.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">期刊风格</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {templates.journal.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => handleSelectTemplate(tpl.id)}
                  className={`p-3 rounded-lg text-center transition-all ${
                    activeTemplateId === tpl.id
                      ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <div className="text-sm font-medium">{tpl.name}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {templates.general?.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">通用模板</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {templates.general.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => handleSelectTemplate(tpl.id)}
                  className={`p-3 rounded-lg text-center transition-all ${
                    activeTemplateId === tpl.id
                      ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <div className="text-sm font-medium">{tpl.name}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </CollapsibleSection>

      {/* 文档解析 */}
      <CollapsibleSection
        title="文档解析"
        icon={FileSearch}
        iconBg="bg-emerald-50"
        iconColor="text-emerald-600"
        defaultOpen={true}
      >
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">MinerU API Token（可选）</label>
          <input
            type="password"
            value={config.mineru_api_token}
            onChange={(e) => handleChange('mineru_api_token', e.target.value)}
            placeholder="留空则使用免费轻量 API（≤10MB, ≤20页）"
            className="input-field"
          />
          <p className="mt-1 text-xs text-slate-400">
            支持 PDF、PPT、图片上传解析。不填 Token 使用免费 API（限制 10MB/20页），
            <a href="https://mineru.net/apiManage/docs?openApplyModal=true" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">申请 Token</a>
            后可解析 200MB/200页
          </p>
        </div>
      </CollapsibleSection>

      {/* 处理参数 */}
      <CollapsibleSection
        title="处理参数"
        icon={Sliders}
        iconBg="bg-violet-50"
        iconColor="text-violet-600"
        defaultOpen={false}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">默认模式</label>
            <select
              value={config.default_mode}
              onChange={(e) => handleChange('default_mode', e.target.value)}
              className="input-field"
            >
              <option value="polish">论文润色</option>
              <option value="humanize">AIGC 降重</option>
              <option value="combined">综合优化</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">Temperature</label>
              <span className="text-sm font-mono text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
                {config.temperature}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={config.temperature}
              onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
              className="range-slider"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1.5">
              <span>精确</span>
              <span>平衡</span>
              <span>创意</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">最大 Tokens</label>
            <input
              type="number"
              value={config.max_tokens}
              onChange={(e) => handleChange('max_tokens', parseInt(e.target.value))}
              min="1"
              max="32000"
              className="input-field"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">API 请求间隔</label>
              <span className="text-sm font-mono text-violet-600 bg-violet-50 px-2 py-0.5 rounded">
                {config.api_request_interval || 0}s
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="1"
              value={config.api_request_interval || 0}
              onChange={(e) => handleChange('api_request_interval', parseInt(e.target.value))}
              className="range-slider"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1.5">
              <span>无间隔</span>
              <span>防限流</span>
              <span>保守</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">段落处理之间的等待时间，避免触发 API 限流</p>
          </div>
        </div>
      </CollapsibleSection>

      {/* 高级设置 */}
      <CollapsibleSection
        title="高级设置"
        icon={Settings}
        iconBg="bg-slate-100"
        iconColor="text-slate-600"
        defaultOpen={false}
        badge="高级"
      >
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700 leading-relaxed">
          以下设置通常无需调整，修改前请了解其作用
        </div>

        <div className="space-y-4">
          {/* Dark Mode */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-slate-700">深色模式</label>
              <p className="text-xs text-slate-400">切换界面主题</p>
            </div>
            <button
              type="button"
              onClick={() => handleChange('dark_mode', !config.dark_mode)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                config.dark_mode ? 'bg-primary-500' : 'bg-slate-300'
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                config.dark_mode ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Compression Threshold */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">历史压缩阈值</label>
              <span className="text-sm font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                {(config.compression_threshold ?? 5000).toLocaleString()} 字
              </span>
            </div>
            <input
              type="range"
              min="1000"
              max="20000"
              step="500"
              value={config.compression_threshold ?? 5000}
              onChange={(e) => handleChange('compression_threshold', parseInt(e.target.value))}
              className="range-slider"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1.5">
              <span>1,000</span>
              <span>10,000</span>
              <span>20,000</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              处理长文本时，当累计历史上下文超过此字数将自动压缩。值越大上下文连贯性越好，但消耗更多 Token
            </p>
          </div>

          {/* Segment Max Length */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">分段最大长度</label>
              <span className="text-sm font-mono text-violet-600 bg-violet-50 px-2 py-0.5 rounded">
                {config.segment_max_length || 500} 字
              </span>
            </div>
            <input
              type="range"
              min="100"
              max="2000"
              step="50"
              value={config.segment_max_length || 500}
              onChange={(e) => handleChange('segment_max_length', parseInt(e.target.value))}
              className="range-slider"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1.5">
              <span>100</span>
              <span>1000</span>
              <span>2000</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">每段文本的最大字符数，超过此长度会自动拆分。数值越小并发度越高，但可能破坏段落连贯性</p>
          </div>

          {/* Segment Skip Threshold */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">短段跳过阈值</label>
              <span className="text-sm font-mono text-violet-600 bg-violet-50 px-2 py-0.5 rounded">
                {config.segment_skip_threshold || 15} 字
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={config.segment_skip_threshold ?? 0}
              onChange={(e) => handleChange('segment_skip_threshold', parseInt(e.target.value))}
              className="range-slider"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1.5">
              <span>0</span>
              <span>50</span>
              <span>100</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">低于此字数的段落（如标题、章节名）将跳过 AI 处理，直接保留原文，节省 Token 消耗</p>
          </div>

          {/* API Timeout */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">API 超时时间</label>
              <span className="text-sm font-mono text-violet-600 bg-violet-50 px-2 py-0.5 rounded">
                {config.api_timeout || 120}s
              </span>
            </div>
            <input
              type="range"
              min="30"
              max="300"
              step="10"
              value={config.api_timeout || 120}
              onChange={(e) => handleChange('api_timeout', parseInt(e.target.value))}
              className="range-slider"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1.5">
              <span>30s</span>
              <span>165s</span>
              <span>300s</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">等待 AI 响应的最长时间。网络较慢或处理长文本时可适当增大</p>
          </div>
        </div>
      </CollapsibleSection>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-cta flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <LoadingSpinner size="sm" color="white" />
              保存中...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              保存设置
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default SettingsPage
