import { useQuery } from '@tanstack/react-query'
import { Trophy, Zap, Clock, CheckCircle2, TrendingUp } from 'lucide-react'
import api from '../services/api'
import { useAuthStore } from '../stores/authStore'

export default function Progress() {
  const { user } = useAuthStore()
  
  const { data: dash, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => (await api.get('/api/analytics/dashboard')).data,
  })

  if (isLoading) return <div className="spinner" style={{ margin: '100px auto' }} />
  const stats = dash?.stats || {}

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Your Progress</h1>
        <p className="page-subtitle">Track your onboarding journey and XP</p>
      </div>

      <div className="glass-card" style={{ padding: 40, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 32, background: 'linear-gradient(135deg, var(--bg-card), rgba(99,102,241,0.05))' }}>
        <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(135deg, var(--brand-primary), var(--accent-cyan))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, boxShadow: '0 0 40px rgba(99,102,241,0.4)', flexShrink: 0 }}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div className="flex items-center gap-3 mb-2">
            <h2 style={{ fontSize: '2rem' }}>{user?.name}</h2>
            <div className="badge badge-brand">{user?.level}</div>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>DevRamp Developer • Joined recently</p>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div className="flex justify-between mb-2">
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Level 5</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{user?.xp || 0} / 1000 XP</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${((user?.xp || 0) / 1000) * 100}%` }} />
              </div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent-amber-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-amber)' }}>
              <Trophy size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid-3">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Modules Completed</span>
            <CheckCircle2 size={20} style={{ color: 'var(--accent-green)' }} />
          </div>
          <div className="stat-number" style={{ color: 'var(--accent-green)' }}>{stats.modulesCompleted || 0}</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Time Learning</span>
            <Clock size={20} style={{ color: 'var(--brand-light)' }} />
          </div>
          <div className="stat-number" style={{ color: 'var(--brand-light)' }}>{Math.round((stats.totalTimeMinutes || 0)/60)}<span style={{ fontSize: '1rem' }}>h</span></div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Total XP Earned</span>
            <Zap size={20} style={{ color: 'var(--accent-amber)' }} />
          </div>
          <div className="stat-number" style={{ color: 'var(--accent-amber)' }}>{stats.xp || 0}</div>
        </div>
      </div>
    </div>
  )
}
