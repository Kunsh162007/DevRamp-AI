import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Zap, Cpu, GitBranch, BookOpen, MessageSquare, BarChart3 } from 'lucide-react'
import api from '../services/api'
import { useAuthStore } from '../stores/authStore'

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
  { icon: GitBranch, label: 'Repo Analysis', desc: 'Instant codebase understanding', color: 'var(--brand-primary)' },
  { icon: BookOpen,  label: 'Learning Paths', desc: 'AI-personalized curriculum', color: 'var(--accent-cyan)' },
  { icon: MessageSquare, label: 'AI Mentor', desc: 'Ask anything about your code', color: 'var(--accent-green)' },
  { icon: BarChart3, label: 'Progress Tracking', desc: 'See your onboarding velocity', color: 'var(--accent-amber)' },
]

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { data } = await api.post('/auth/login', { email, password })
      setAuth(data.user, data.token)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-primary)', position: 'relative', overflow: 'hidden' }}>
      {/* Aurora orbs */}
      <div className="auth-bg-orb" style={{ width: 500, height: 500, background: 'var(--brand-primary)', top: -100, left: -100 }} />
      <div className="auth-bg-orb" style={{ width: 400, height: 400, background: 'var(--accent-cyan)', bottom: -80, right: -80, animationDelay: '2s' }} />

      {/* Left Panel — Branding */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
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
          From codebase to
          <br />
          <span className="gradient-text">first commit</span>
          <br />
          in 2 days.
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: 48, maxWidth: 420 }}>
          IBM Bob analyzes your repositories and generates a personalized learning path — so new developers become productive instantly.
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
        width: 480, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 40, borderLeft: '1px solid var(--border-subtle)',
        background: 'rgba(13,21,40,0.6)', backdropFilter: 'blur(20px)',
      }}>
        <div style={{ width: '100%', maxWidth: 380 }} className="animate-fade-in">
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: '1.75rem', marginBottom: 6 }}>Welcome back</h1>
            <p style={{ fontSize: '0.875rem' }}>Sign in to your DevRamp AI account</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 24 }}>
            <div className="bob-indicator">
              <Cpu size={12} />
              <span>IBM Bob Ready</span>
            </div>
          </div>

          {error && (
            <div style={{
              padding: '10px 14px', marginBottom: 16,
              background: 'var(--accent-rose-dim)', border: '1px solid rgba(244,63,94,0.3)',
              borderRadius: 'var(--radius-md)', color: 'var(--accent-rose)', fontSize: '0.85rem',
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="input" type="email" placeholder="you@company.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input className="input" type={showPass ? 'text' : 'password'}
                  placeholder="••••••••" value={password}
                  onChange={e => setPassword(e.target.value)} required
                  style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', marginTop: 8 }} disabled={loading}>
              {loading ? <><div className="spinner" style={{ width: 16, height: 16 }} />Signing in...</> : <><Zap size={16} />Sign In</>}
            </button>
          </form>

          <div className="divider" />
          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            New to DevRamp AI?{' '}
            <Link to="/register" style={{ color: 'var(--brand-light)', fontWeight: 600, textDecoration: 'none' }}>
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
