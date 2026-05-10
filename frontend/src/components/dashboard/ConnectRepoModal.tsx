import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X, GitBranch, Loader2, Cpu } from 'lucide-react'
import api from '../../services/api'

interface Props {
  onClose: () => void
  onSuccess: () => void
}

export default function ConnectRepoModal({ onClose, onSuccess }: Props) {
  const [url, setUrl] = useState('')
  const [branch, setBranch] = useState('main')
  const qc = useQueryClient()

  const mutation = useMutation({
    mutationFn: async () => (await api.post('/api/repositories', { url, branch })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['repositories'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      onSuccess()
    },
  })

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(8px)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div className="animate-fade-in" style={{
        width: '100%', maxWidth: 480, background: 'var(--bg-card)',
        border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-xl)',
        padding: 32, position: 'relative',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 16, right: 16, background: 'none', border: 'none',
          cursor: 'pointer', color: 'var(--text-muted)',
        }}><X size={20} /></button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 'var(--radius-md)',
            background: 'var(--brand-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><GitBranch size={22} style={{ color: 'var(--brand-light)' }} /></div>
          <div>
            <h3>Connect Repository</h3>
            <p style={{ fontSize: '0.8rem', marginTop: 2 }}>IBM Bob will analyze and generate your learning path</p>
          </div>
        </div>

        <div className="bob-indicator" style={{ marginBottom: 20 }}>
          <Cpu size={12} />
          <span>Bob will analyze: structure · dependencies · patterns · learning path</span>
        </div>

        {mutation.isError && (
          <div style={{ padding: '10px 14px', marginBottom: 16, background: 'var(--accent-rose-dim)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: 'var(--radius-md)', color: 'var(--accent-rose)', fontSize: '0.85rem' }}>
            {(mutation.error as any)?.response?.data?.error || 'Failed to connect repository'}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">GitHub Repository URL</label>
            <input className="input" type="url" placeholder="https://github.com/user/repository"
              value={url} onChange={e => setUrl(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Branch</label>
            <input className="input" placeholder="main" value={branch} onChange={e => setBranch(e.target.value)} />
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }}
              disabled={!url || mutation.isPending} onClick={() => mutation.mutate()}>
              {mutation.isPending
                ? <><Loader2 size={16} className="animate-spin" /> Bob is analyzing...</>
                : <><Cpu size={16} /> Analyze with IBM Bob</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
