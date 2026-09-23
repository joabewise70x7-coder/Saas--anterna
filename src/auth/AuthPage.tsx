import { FormEvent, useState } from 'react'
import { ArrowRight, CheckCircle2, LockKeyhole, Mail, UserRound } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

export default function AuthPage() {
  const { configured, loading: authLoading, user, signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (authLoading) {
    return <main className="auth-screen"><div className="auth-card auth-loading"><span className="spinner" /><p>Verificando sessão…</p></div></main>
  }

  if (user) {
    return <main className="auth-screen"><div className="auth-card"><div className="auth-icon"><CheckCircle2 size={28} /></div><span className="section-kicker">Sessão ativa</span><h1>Você já está autenticado.</h1><p>Esta conta poderá acessar as áreas administrativas quando estiver vinculada a uma pizzaria.</p><Link className="auth-primary" to="/admin">Continuar <ArrowRight size={18} /></Link></div></main>
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    setMessage(null)

    if (mode === 'signin') {
      const result = await signIn(email.trim(), password)
      if (result.error) setError(result.error.message)
      else navigate((location.state as { from?: string } | null)?.from || '/admin', { replace: true })
    } else {
      const result = await signUp(email.trim(), password, fullName)
      if (result.error) setError(result.error.message)
      else if (result.needsEmailConfirmation) setMessage('Conta criada. Verifique seu e-mail para confirmar a conta antes de entrar.')
      else navigate('/admin', { replace: true })
    }

    setBusy(false)
  }

  return (
    <main className="auth-screen">
      <section className="auth-card">
        <div className="auth-brand"><span>🍕</span><strong>SaaS Anterna</strong></div>
        <span className="section-kicker">Área administrativa</span>
        <h1>{mode === 'signin' ? 'Entrar na sua conta' : 'Criar conta'}</h1>
        <p>{mode === 'signin' ? 'Acesse o gerenciamento do seu SaaS.' : 'Crie o acesso que será usado para administrar as pizzarias.'}</p>

        {!configured && <div className="auth-alert error">Supabase não está configurado neste ambiente.</div>}
        {error && <div className="auth-alert error">{error}</div>}
        {message && <div className="auth-alert success">{message}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'signup' && <label><span>Nome</span><div className="auth-input"><UserRound size={17} /><input value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" placeholder="Seu nome" required /></div></label>}
          <label><span>E-mail</span><div className="auth-input"><Mail size={17} /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="voce@exemplo.com" required /></div></label>
          <label><span>Senha</span><div className="auth-input"><LockKeyhole size={17} /><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} minLength={6} placeholder="Mínimo de 6 caracteres" required /></div></label>
          <button className="auth-primary" type="submit" disabled={busy || !configured}>{busy ? 'Aguarde…' : mode === 'signin' ? 'Entrar' : 'Criar conta'} <ArrowRight size={18} /></button>
        </form>

        <button className="auth-switch" type="button" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); setMessage(null) }}>
          {mode === 'signin' ? 'Ainda não tenho uma conta' : 'Já tenho uma conta'}
        </button>
        <Link className="auth-back" to="/">Voltar para o início</Link>
      </section>
    </main>
  )
}
