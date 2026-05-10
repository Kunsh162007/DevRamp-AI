import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, GitBranch, MessageSquare, BookOpen, BarChart3, LogOut, Zap } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
  { icon: GitBranch, label: 'Explorer', to: '/explorer' },
  { icon: MessageSquare, label: 'AI Mentor', to: '/mentor' },
  { icon: BookOpen, label: 'Learning', to: '/learning' },
  { icon: BarChart3, label: 'Progress', to: '/progress' },
]

export default function Layout() {
  const { user, clearAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => { clearAuth(); navigate('/login') }

  return (
    <div style={{ display: 'flex' }}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🚀</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>DevRamp AI</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>POWERED BY IBM BOB</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Navigation</div>
          {navItems.map(({ icon: Icon, label, to }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon className="nav-icon" size={18} />
              <span>{label}</span>
            </NavLink>
          ))}

          <div className="nav-section-label" style={{ marginTop: 16 }}>IBM Bob Status</div>
          <div className="bob-indicator" style={{ margin: '4px 0' }}>
            <div className="bob-dot" />
            <span>Bob Active • Mock Mode</span>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--brand-primary), #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 700, flexShrink: 0,
            }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="truncate" style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user?.name}</div>
              <div className="flex items-center gap-2" style={{ marginTop: 2 }}>
                <Zap size={10} style={{ color: 'var(--accent-amber)' }} />
                <span style={{ fontSize: '0.7rem', color: 'var(--accent-amber)' }}>{user?.xp || 0} XP</span>
              </div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm w-full" onClick={handleLogout}
            style={{ justifyContent: 'flex-start', gap: 8 }}>
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>

      {/* Topbar */}
      <header className="topbar">
        <div className="topbar-left">
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Welcome back,</span>{' '}
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user?.name?.split(' ')[0]}</span>
          </div>
        </div>
        <div className="topbar-right">
          <div className="badge badge-brand">
            <Zap size={10} /> {user?.xp || 0} XP
          </div>
          <div className="badge badge-green">
            {user?.level || 'BEGINNER'}
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
