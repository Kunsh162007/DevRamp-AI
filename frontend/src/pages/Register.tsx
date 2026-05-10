import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Check, Cpu } from 'lucide-react'
import api from '../services/api'
import { useAuthStore } from '../stores/authStore'

const LEVELS = [
  { value: 'BEGINNER', label: 'Beginner', desc: 'Just starting out', emoji: '🌱' },
  { value: 'INTERMEDIATE', label: 'Intermediate', desc: '1-3 years exp', emoji: '⚡' },
  { value: 'ADVANCED', label: 'Advanced', desc: '3+ years exp', emoji: '🚀' },
]

export default function Register() {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [level, setLevel] = useState('BEGINNER')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async () => {
    setLoading(true); setError('')
    try {
      const { data } = await api.post('/auth/register', { name, email, password, level })
      setAuth(data.user, data.token)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed')
      setStep(1)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-bg-orb" style={{ width: 600, height: 600, background: '#8b5cf6', top: -200, right: -100, opacity: 0.12 }} />
      <div className="auth-bg-orb" style={{ width: 400, height: 400, background: 'var(--accent-cyan)', bottom: -100, left: -100, opacity: 0.1, animationDelay: '3s' }} />

      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🚀</div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: 6 }}>Create your account</h1>
          <div className="flex items-center gap-2" style={{ justifyContent: 'center' }}>
            <div className="bob-indicator"><Cpu size={12} />IBM Bob will guide your journey</div>
          </div>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28, alignItems: 'center' }}>
          {[1, 2].map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: step >= s ? 'var(--brand-primary)' : 'var(--bg-secondary)',
                border: `2px solid ${step >= s ? 'var(--brand-primary)' : 'var(--border-medium)'}`,
                fontSize: '0.75rem', fontWeight: 700, color: step >= s ? 'white' : 'var(--text-muted)',
                transition: 'all 0.25s',
              }}>
                {step > s ? <Check size={12} /> : s}
              </div>
              {s < 2 && <div style={{ flex: 1, height: 2, background: step > s ? 'var(--brand-primary)' : 'var(--border-medium)', transition: 'background 0.3s' }} />}
            </div>
          ))}
        </div>

        {error && (
          <div style={{ padding: '10px 14px', marginBottom: 16, background: 'var(--accent-rose-dim)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: 'var(--radius-md)', color: 'var(--accent-rose)', fontSize: '0.85rem' }}>{error}</div>
        )}

        {step === 1 && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="input" type="text" placeholder="Jane Doe"
                value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Work Email</label>
              <input className="input" type="email" placeholder="jane@company.com"
                value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="input" type="password" placeholder="Min. 6 characters"
                value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button className="btn btn-primary" style={{ justifyContent: 'center', marginTop: 8 }}
              disabled={!name || !email || !password}
              onClick={() => setStep(2)}>
              Continue <ArrowRight size={16} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: '0.875rem', marginBottom: 4 }}>What's your experience level? IBM Bob will personalize your learning path.</p>
            {LEVELS.map(l => (
              <button key={l.value} onClick={() => setLevel(l.value)}
                style={{
                  padding: '14px 16px', background: level === l.value ? 'rgba(99,102,241,0.12)' : 'var(--bg-secondary)',
                  border: `2px solid ${level === l.value ? 'var(--brand-primary)' : 'var(--border-medium)'}`,
                  borderRadius: 'var(--radius-md)', cursor: 'pointer', textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: 14, transition: 'all 0.2s',
                }}>
                <span style={{ fontSize: 24 }}>{l.emoji}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{l.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{l.desc}</div>
                </div>
                {level === l.value && <Check size={18} style={{ marginLeft: 'auto', color: 'var(--brand-primary)' }} />}
              </button>
            ))}
            <button className="btn btn-primary" style={{ justifyContent: 'center', marginTop: 8 }}
              onClick={handleSubmit} disabled={loading}>
              {loading ? <><div className="spinner" style={{ width: 16, height: 16 }} />Creating account...</> : <>🚀 Start Learning with Bob</>}
            </button>
            <button className="btn btn-ghost" style={{ justifyContent: 'center' }} onClick={() => setStep(1)}>Back</button>
          </div>
        )}

        <div className="divider" />
        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--brand-light)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
