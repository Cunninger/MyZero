import React, { createContext, useCallback, useRef } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { Menu, Settings } from 'lucide-react'
import Sidebar from './components/Sidebar'
import HomePage from './pages/HomePage'
import SettingsPage from './pages/SettingsPage'
import ToolsPage from './pages/ToolsPage'
import ResultPage from './pages/ResultPage'
import StatsPage from './pages/StatsPage'
import { useSidebarState } from './hooks/useSidebarState'

export const HistoryRefreshContext = createContext({ refresh: () => {} })

function App() {
  const { isOpen, toggle, width, startResize } = useSidebarState()
  const sidebarRef = useRef({ refresh: () => {} })

  const setRefresh = useCallback((fn) => {
    sidebarRef.current.refresh = fn
  }, [])

  const refreshHistory = useCallback(() => {
    sidebarRef.current.refresh()
  }, [])

  return (
    <HistoryRefreshContext.Provider value={{ refresh: refreshHistory }}>
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <Sidebar isOpen={isOpen} onToggle={toggle} onRefreshRef={setRefresh} width={width} startResize={startResize} />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <div className="h-14 flex items-center justify-between px-4 border-b border-slate-200/80 bg-white/80 shrink-0">
            <button
              onClick={toggle}
              className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="打开侧边栏"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>

            <div className="md:hidden font-serif font-bold text-slate-800">
              MyZero
            </div>

            <Link
              to="/settings"
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-slate-700 ml-auto"
              aria-label="设置"
            >
              <Settings className="w-5 h-5" />
            </Link>
          </div>

          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/tools" element={<ToolsPage />} />
              <Route path="/result/:id" element={<ResultPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/stats" element={<StatsPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </HistoryRefreshContext.Provider>
  )
}

export default App
