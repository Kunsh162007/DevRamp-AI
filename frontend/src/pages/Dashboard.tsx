import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  GitBranch, Clock, TrendingUp, Plus,
  Cpu, CheckCircle2, AlertCircle, Loader2, ArrowRight, Users
} from 'lucide-react'
import api from '../services/api'
import ConnectRepoModal from '../components/dashboard/ConnectRepoModal'

export default function Dashboard() {
  const [showConnect, setShowConnect] = useState(false)
  const navigate = useNavigate()

  const { data: dash, isLoading, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => (await api.get('/analytics/dashboard')).data,
  })

  const { data: repos = [] } = useQuery({
    queryKey: ['repositories'],
    queryFn: async () => (await api.get('/repositories')).data,
  })

  const stats = dash?.stats || {}

  const statCards = [
    { label: 'Repos Connected', value: stats.repositoriesConnected ?? 0, icon: GitBranch, color: 'var(--brand-primary)', bg: 'var(--brand-glow)' },
    { label: 'Modules Completed', value: stats.modulesCompleted ?? 0, icon: CheckCircle2, color: 'var(--accent-green)', bg: 'var(--accent-green-dim)' },
    { label: 'Days Saved', value: stats.timeSavedDays ?? 0, icon: Clock, color: 'var(--accent-cyan)', bg: 'var(--accent-cyan-dim)', suffix: 'd' },
    { label: 'Bob Interactions', value: stats.bobInteractions ?? 0, icon: Cpu, color: 'var(--accent-amber)', bg: 'var(--accent-amber-dim)' },
  ]

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Your AI-powered onboarding command center</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowConnect(true)}>
            <Plus size={16} /> Connect Repository
          </button>
        </div>
      </div>

      {/* IBM Bob Banner */}
      <div className="bob-banner" style={{
        padding: '16px 20px', marginBottom: 28,
        background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))',
        border: '1px solid rgba(99,102,241,0.25)', borderRadius: 'var(--radius-lg)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div className="flex items-center gap-3">
          <div className="bob-indicator"><div className="bob-dot" /><span>IBM Bob Active</span></div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            All 5 capabilities ready: Analysis · Learning · Mentor · Docs · Review
          </span>
        </div>
        <div className="badge badge-brand">Mock Mode</div>
      </div>

      {/* Stats Grid */}
      <div className="grid-4 mb-6">
        {statCards.map(({ label, value, icon: Icon, color, bg, suffix }, i) => (
          <div key={label} className={`stat-card animate-fade-in stagger-${i + 1}`}>
            <div className="flex items-center justify-between mb-4">
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={18} style={{ color }} />
              </div>
            </div>
            <div className="stat-number" style={{ color }}>
              {isLoading ? <div className="skeleton" style={{ height: 40, width: 80 }} /> : `${value}${suffix || ''}`}
            </div>
            {label === 'Days Saved' && (
              <div style={{ marginTop: 8, fontSize: '0.7rem', color: 'var(--accent-green)' }}>
                <TrendingUp size={10} style={{ display: 'inline', marginRight: 4 }} />
                vs. traditional onboarding
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24 }}>

        {/* Repositories */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3>Repositories</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowConnect(true)}>
              <Plus size={14} /> Add repo
            </button>
          </div>

          {repos.length === 0 ? (
            <div style={{
              padding: 40, textAlign: 'center',
              background: 'var(--bg-card)', border: '1px dashed var(--border-medium)',
              borderRadius: 'var(--radius-lg)',
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔗</div>
              <h3 style={{ marginBottom: 8 }}>Connect your first repository</h3>
              <p style={{ marginBottom: 20, fontSize: '0.875rem' }}>
                IBM Bob will analyze it and generate a personalized learning path
              </p>
              <button className="btn btn-primary" onClick={() => setShowConnect(true)}>
                <Plus size={16} /> Connect Repository
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {repos.map((repo: any) => (
                <div key={repo.id} className="glass-card repo-card" style={{ padding: '16px 20px', cursor: 'pointer' }}
                  onClick={() => navigate(`/explorer/${repo.id}`)}>  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div style={{
                        width: 40, height: 40, borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <GitBranch size={18} style={{ color: 'var(--brand-light)' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{repo.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{repo.language || 'Unknown'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={repo.status} />
                      <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bob Activity */}
        <div>
          <h3 style={{ marginBottom: 16 }}>IBM Bob Activity</h3>
          <div className="glass-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { cap: 'Repository Analysis', count: stats.bobInteractions > 0 ? Math.ceil(stats.bobInteractions * 0.3) : 0, color: 'var(--brand-primary)', icon: '🔍' },
                { cap: 'Learning Path Gen', count: stats.bobInteractions > 0 ? Math.ceil(stats.bobInteractions * 0.2) : 0, color: 'var(--accent-cyan)', icon: '📚' },
                { cap: 'Code Explanation', count: stats.bobInteractions > 0 ? Math.ceil(stats.bobInteractions * 0.25) : 0, color: 'var(--accent-green)', icon: '💡' },
                { cap: 'Code Review', count: stats.bobInteractions > 0 ? Math.ceil(stats.bobInteractions * 0.15) : 0, color: 'var(--accent-amber)', icon: '⚡' },
                { cap: 'Doc Generation', count: stats.bobInteractions > 0 ? Math.ceil(stats.bobInteractions * 0.1) : 0, color: 'var(--accent-rose)', icon: '📖' },
              ].map(({ cap, count, color, icon }) => (
                <div key={cap}>
                  <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                    <div style={{ fontSize: '0.8rem', display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span>{icon}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{cap}</span>
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color }}>{count}</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{
                      width: `${stats.bobInteractions > 0 ? (count / stats.bobInteractions) * 100 : 0}%`,
                      background: color,
                    }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="divider" />
            <div className="flex items-center justify-between">
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Bob calls</span>
              <span style={{ fontWeight: 700, color: 'var(--brand-light)' }}>{stats.bobInteractions || 0}</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div style={{ marginTop: 16, padding: 16, background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
              <Users size={16} style={{ color: 'var(--accent-cyan)' }} />
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Impact Metrics</span>
            </div>
            {[
              { label: 'Time to first commit', before: '14 days', after: '2 days', saving: '85%' },
              { label: 'Time to productive', before: '90 days', after: '21 days', saving: '77%' },
            ].map(m => (
              <div key={m.label} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>{m.label}</div>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-rose)', textDecoration: 'line-through' }}>{m.before}</span>
                  <ArrowRight size={10} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-green)', fontWeight: 600 }}>{m.after}</span>
                  <span className="badge badge-green" style={{ fontSize: '0.6rem' }}>-{m.saving}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showConnect && <ConnectRepoModal onClose={() => setShowConnect(false)} onSuccess={() => { setShowConnect(false); refetch() }} />}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string; icon: any }> = {
    PENDING:   { label: 'Pending',   cls: 'badge-amber', icon: Clock },
    ANALYZING: { label: 'Analyzing', cls: 'badge-brand', icon: Loader2 },
    READY:     { label: 'Ready',     cls: 'badge-green', icon: CheckCircle2 },
    ERROR:     { label: 'Error',     cls: 'badge-rose',  icon: AlertCircle },
  }
  const { label, cls, icon: Icon } = map[status] || map.PENDING
  return (
    <div className={`badge ${cls}`}>
      <Icon size={10} className={status === 'ANALYZING' ? 'animate-spin' : ''} />
      {label}
    </div>
  )
}
