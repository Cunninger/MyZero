import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import TextInput from '../components/TextInput'
import ModeSelector from '../components/ModeSelector'
import LoadingSpinner from '../components/LoadingSpinner'
import { optimizeAPI, configAPI } from '../api'
import { HistoryRefreshContext } from '../App'

const HomePage = () => {
  const [text, setText] = useState('')
  const [mode, setMode] = useState('combined')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const { refresh } = useContext(HistoryRefreshContext)

  useEffect(() => {
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

  const handleSubmit = async () => {
    // Handle DOCX file upload
    if (window._pendingFile) {
      const file = window._pendingFile
      window._pendingFile = null
      setText('')

      setIsSubmitting(true)
      try {
        const response = await optimizeAPI.upload(file, mode)
        refresh()
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
      refresh()
      navigate(`/result/${response.data.id}`)
    } catch (error) {
      setIsSubmitting(false)
      toast.error(error.message || '提交失败')
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="text-center space-y-3 mb-8">
            <h1 className="text-3xl sm:text-4xl font-serif font-bold bg-gradient-to-r from-primary-600 via-blue-600 to-violet-600 bg-clip-text text-transparent">
              AI 学术写作助手
            </h1>
            <p className="text-slate-500 text-lg">
              选择优化模式开始
            </p>
          </div>

          <ModeSelector value={mode} onChange={setMode} variant="cards" />
        </div>
      </div>

      <div className="border-t border-slate-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <TextInput
            value={text}
            onChange={setText}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
            variant="chat"
          />
        </div>
      </div>
    </div>
  )
}

export default HomePage
