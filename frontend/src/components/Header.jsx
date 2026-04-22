import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { PenTool, Settings, History, Home, Wrench } from 'lucide-react'

const Header = () => {
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-1 rounded-md bg-gradient-to-br from-primary-500 to-violet-500 group-hover:shadow-lg group-hover:shadow-primary-500/20 transition-shadow">
              <PenTool className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
            </div>
            <span className="font-serif text-xl font-bold bg-gradient-to-r from-primary-700 to-slate-800 bg-clip-text text-transparent">MyZero</span>
          </Link>

          <nav className="flex items-center gap-1">
            <NavLink to="/" active={isActive('/')} icon={<Home className="w-4 h-4" />} label="首页" />
            <NavLink to="/tools" active={isActive('/tools')} icon={<Wrench className="w-4 h-4" />} label="工具" />
            <NavLink to="/history" active={isActive('/history')} icon={<History className="w-4 h-4" />} label="历史" />
            <NavLink to="/settings" active={isActive('/settings')} icon={<Settings className="w-4 h-4" />} label="设置" />
          </nav>
        </div>
      </div>
    </header>
  )
}

const NavLink = ({ to, active, icon, label }) => (
  <Link
    to={to}
    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
      active
        ? 'bg-primary-50 text-primary-700 shadow-sm'
        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
    }`}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </Link>
)

export default Header
