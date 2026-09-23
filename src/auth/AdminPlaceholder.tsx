import { LogOut, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from './AuthContext'

export default function AdminPlaceholder() {
  const { user, signOut } = useAuth()

  async function handleSignOut() {
    await signOut()
  }

  return (
    <main className="admin-screen">
      <section className="admin-card">
        <div className="admin-icon"><ShieldCheck size={30} /></div>
        <span className="section-kicker">Autenticação concluída</span>
        <h1>Área administrativa preparada.</h1>
        <p>A conta <strong>{user?.email}</strong> está autenticada. O próximo passo é vincular usuários às pizzarias e, então, liberar o gerenciamento por tenant.</p>
        <div className="admin-actions">
          <Link className="auth-primary" to="/">Ver cardápio público</Link>
          <button className="auth-secondary" onClick={handleSignOut}><LogOut size={17} /> Sair</button>
        </div>
      </section>
    </main>
  )
}
