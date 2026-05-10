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

  const TICKER_ITEMS = [
    'const bob = new IBMBob({ mode: "live" })',
    'await bob.analyzeRepository(repoUrl)',
    'const path = await bob.generateLearningPath()',
    'const explanation = await bob.explainCode(query)',
    'const review = await bob.reviewCode(snippet)',
    'const docs = await bob.generateDocs(components)',
    'bob.on("insight", (data) => dashboard.update(data))',
  ]

  const FEATURES = [
    { icon: Cpu, label: 'IBM Bob Powered', desc: 'Enterprise-grade AI analysis', color: 'var(--brand-primary)' },
    { icon: Check, label: 'Instant Onboarding', desc: 'Go from 0 to commit in days', color: 'var(--accent-cyan)' },
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-primary)', position: 'relative', overflow: 'hidden' }}>
      {/* Aurora orbs */}
      <div className="auth-bg-orb" style={{ width: 600, height: 600, background: '#8b5cf6', top: -200, right: -100, opacity: 0.12 }} />
      <div className="auth-bg-orb" style={{ width: 400, height: 400, background: 'var(--accent-cyan)', bottom: -100, left: -100, opacity: 0.1, animationDelay: '3s' }} />

      {/* Left Panel — Branding */}
      <div style={{
        flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 80px', position: 'relative',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 60 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--brand-primary), #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, boxShadow: '0 0 30px rgba(99,102,241,0.5)',
          }}>🚀</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>DevRamp AI</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>POWERED BY IBM BOB</div>
          </div>
        </div>

        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: 16 }}>
          Join the future of
          <br />
          <span className="gradient-text">developer onboarding</span>.
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: 48, maxWidth: 420 }}>
          Create your account to connect repositories and let IBM Bob generate a personalized learning path for you.
        </p>

        {/* Features */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {FEATURES.map(({ icon: Icon, label, desc, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 'var(--radius-md)', flexShrink: 0,
                background: `${color}18`, border: `1px solid ${color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={18} style={{ color }} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Scrolling ticker */}
        <div className="code-ticker" style={{ marginTop: 48 }}>
          <div className="code-ticker-inner">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} style={{ color: i % 3 === 0 ? 'var(--brand-light)' : i % 3 === 1 ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Auth Card */}
      <div style={{
        width: 480, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 40, borderLeft: '1px solid var(--border-subtle)',
        background: 'rgba(13,21,40,0.6)', backdropFilter: 'blur(20px)',
      }}>
        <div style={{ width: '100%', maxWidth: 380 }} className="animate-fade-in">
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: '1.6rem', marginBottom: 6 }}>Create your account</h1>
            <div className="flex items-center gap-2">
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
    </div>
  )
}
