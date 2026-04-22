import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import HomePage from './pages/HomePage'
import HistoryPage from './pages/HistoryPage'
import SettingsPage from './pages/SettingsPage'
import ToolsPage from './pages/ToolsPage'
import ResultPage from './pages/ResultPage'

function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/result/:id" element={<ResultPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
      
      <footer className="border-t border-slate-200/80 mt-16 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-slate-400">
            <div className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="text-sm">MyZero</span>
            <div className="w-1 h-1 rounded-full bg-slate-300" />
          </div>
          <p className="text-xs text-slate-300">AI 学术写作助手</p>
        </div>
      </footer>
    </div>
  )
}

export default App
