import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Cpu, Network, LayoutTemplate, Braces, Package, FileCode2, Loader2, AlertCircle, ArrowLeft } from 'lucide-react'
import api from '../services/api'

export default function Explorer() {
  const { repoId } = useParams()
  const navigate = useNavigate()
  const [selectedComp, setSelectedComp] = useState<any>(null)

  const { data: repos = [] } = useQuery({
    queryKey: ['repositories'],
    queryFn: async () => (await api.get('/repositories')).data,
  })

  const { data: repo, isLoading, error } = useQuery({
    queryKey: ['repository', repoId],
    queryFn: async () => {
      if (!repoId) throw new Error('No repository ID')
      const res = await api.get(`/repositories/${repoId}`)
      return res.data
    },
    enabled: !!repoId,
    retry: 2,
  })

  if (!repoId) {
    return (
      <div className="animate-fade-in" style={{
        padding: 40, textAlign: 'center', background: 'var(--bg-card)',
        border: '1px dashed var(--border-medium)', borderRadius: 'var(--radius-lg)'
      }}>
        <Network size={48} style={{ color: 'var(--brand-primary)', margin: '0 auto 16px' }} />
        <h2 style={{ marginBottom: 8 }}>Select a repository to explore</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
          IBM Bob's Context Awareness engine has mapped the architecture, components, and dependencies.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          {repos.filter((r: any) => r.status === 'READY').map((r: any) => (
            <button key={r.id} className="btn btn-secondary" onClick={() => navigate(`/explorer/${r.id}`)}>
              {r.name}
            </button>
          ))}
          {repos.filter((r: any) => r.status === 'READY').length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No repositories ready yet. Connect a repository from the dashboard.
            </p>
          )}
        </div>
      </div>
    )
  }

  // Handle error state
  if (error) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <AlertCircle size={48} style={{ color: 'var(--accent-rose)', margin: '0 auto 16px' }} />
          <h3 style={{ marginBottom: 8 }}>Failed to load repository</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.875rem' }}>
            {error instanceof Error ? error.message : 'Unknown error occurred'}
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Handle analyzing state
  if (repo?.status === 'ANALYZING') {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <Loader2 size={48} style={{ color: 'var(--brand-primary)', margin: '0 auto 16px' }} className="animate-spin" />
          <h3 style={{ marginBottom: 8 }}>Analyzing Repository</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.875rem' }}>
            IBM Bob is analyzing your codebase. This may take a few minutes...
          </p>
          <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Handle error state from repository
  if (repo?.status === 'ERROR') {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <AlertCircle size={48} style={{ color: 'var(--accent-rose)', margin: '0 auto 16px' }} />
          <h3 style={{ marginBottom: 8 }}>Analysis Failed</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.875rem' }}>
            Failed to analyze repository. Please try again.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button
              className="btn btn-primary"
              onClick={async () => {
                await api.post(`/repositories/${repoId}/analyze`)
                window.location.reload()
              }}
            >
              Retry Analysis
            </button>
            <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Handle loading state
  if (isLoading || !repo) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}><div className="spinner" /></div>
  }

  const analysis = repo.analysis || {}
  const components = analysis.components || []

  return (
    <div className="explorer-layout animate-fade-in" style={{ margin: '-32px', marginTop: 0 }}>
      
      {/* 1. File Structure / Components List */}
      <div className="explorer-sidebar">
        <div className="flex items-center gap-2 mb-4" style={{ padding: '0 8px' }}>
          <Package size={16} style={{ color: 'var(--brand-light)' }} />
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Components</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {components.map((c: any) => (
            <button key={c.name} onClick={() => setSelectedComp(c)}
              style={{
                width: '100%', padding: '8px 12px', textAlign: 'left',
                background: selectedComp?.name === c.name ? 'rgba(99,102,241,0.1)' : 'transparent',
                border: `1px solid ${selectedComp?.name === c.name ? 'rgba(99,102,241,0.3)' : 'transparent'}`,
                borderRadius: 'var(--radius-md)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s',
              }}>
              {c.type === 'page' ? <LayoutTemplate size={14} style={{ color: 'var(--accent-cyan)' }} /> : 
               c.type === 'hook' ? <Braces size={14} style={{ color: 'var(--accent-amber)' }} /> :
               <FileCode2 size={14} style={{ color: 'var(--text-secondary)' }} />}
              <span style={{ fontSize: '0.85rem', color: selectedComp?.name === c.name ? 'var(--brand-light)' : 'var(--text-primary)' }}>
                {c.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Main Visualization / Code View */}
      <div className="explorer-main">
        {selectedComp ? (
          <div style={{ padding: 32, height: '100%', overflowY: 'auto' }}>
            <div className="flex items-center gap-3 mb-6">
              <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: 'var(--brand-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileCode2 size={24} style={{ color: 'var(--brand-light)' }} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 2 }}>{selectedComp.name}</h2>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{selectedComp.path}</div>
              </div>
              <div className={`badge ${selectedComp.complexity === 'high' ? 'badge-rose' : selectedComp.complexity === 'medium' ? 'badge-amber' : 'badge-green'}`} style={{ marginLeft: 'auto' }}>
                {selectedComp.complexity} complexity
              </div>
            </div>

            <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
              <div className="flex items-start gap-3">
                <Cpu size={20} style={{ color: 'var(--brand-primary)', marginTop: 2, flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>IBM Bob Analysis</div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{selectedComp.description}</p>
                </div>
              </div>
            </div>

            <h3 style={{ marginBottom: 16 }}>Dependencies</h3>
            {selectedComp.dependencies?.length > 0 ? (
              <div className="grid-3">
                {selectedComp.dependencies.map((dep: string) => (
                  <div key={dep} style={{ padding: 12, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Package size={14} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ fontSize: '0.85rem' }}>{dep}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No internal dependencies detected.</p>
            )}
          </div>
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <div className="auth-bg-orb" style={{ width: 400, height: 400, background: 'var(--brand-primary)', opacity: 0.1, animationDuration: '8s' }} />
            <Network size={64} style={{ color: 'var(--border-active)', marginBottom: 24 }} />
            <h2 style={{ marginBottom: 8 }}>Architecture Map</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Select a component from the sidebar to view IBM Bob's analysis.</p>
          </div>
        )}
      </div>

      {/* 3. Repo Overview Panel */}
      <div className="explorer-panel">
        <h3 style={{ marginBottom: 20 }}>Repository Overview</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: 16, background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Framework</div>
            <div style={{ fontWeight: 600 }}>{repo.framework || 'Unknown'} / {repo.language || 'Unknown'}</div>
          </div>
          
          <div style={{ padding: 16, background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Scale</div>
            <div className="flex items-center gap-4">
              <div><span style={{ fontWeight: 600 }}>{analysis.fileCount || 0}</span> <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Files</span></div>
              <div><span style={{ fontWeight: 600 }}>{(analysis.lineCount || 0).toLocaleString()}</span> <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Lines</span></div>
            </div>
          </div>

          <div style={{ padding: 16, background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Detected Patterns</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(analysis.patterns || []).map((p: string) => (
                <span key={p} className="badge" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>{p}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
