import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { useTenant } from './hooks/useTenant'
import { useTenantTheme } from './hooks/useTenantTheme'
import { isSupabaseConfigured } from './lib/supabase'
import './styles.css'

function TenantPage() {
  const { slug } = useParams<{ slug: string }>()
  const { tenant, loading, error } = useTenant(slug)
  useTenantTheme(tenant)

  if (loading) return <main className="state">Carregando tenant…</main>
  if (error) return <main className="state error">Não foi possível carregar este tenant.</main>
  if (!tenant) return <main className="state">Tenant não encontrado ou inativo.</main>

  return (
    <main className="tenant-page">
      <section className="tenant-card">
        {tenant.logo_url ? <img className="logo" src={tenant.logo_url} alt={`Logo ${tenant.name}`} /> : <div className="logo-fallback">🍕</div>}
        <div className="eyebrow">Tenant carregado</div>
        <h1>{tenant.name}</h1>
        <p>{tenant.description || 'Fundação SaaS multi-tenant carregada com sucesso.'}</p>
        <div className="swatches">
          <span style={{ background: tenant.primary_color }} />
          <span style={{ background: tenant.secondary_color }} />
          <span style={{ background: tenant.accent_color }} />
          <span style={{ background: tenant.background_color }} />
        </div>
        <dl>
          <div><dt>Slug</dt><dd>/{tenant.slug}</dd></div>
          <div><dt>WhatsApp</dt><dd>{tenant.whatsapp || 'Não configurado'}</dd></div>
          <div><dt>Status</dt><dd>Ativo</dd></div>
        </dl>
      </section>
      {!isSupabaseConfigured && <p className="config-warning">Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para conectar ao banco.</p>}
    </main>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/p/:slug" element={<TenantPage />} />
      <Route path="/" element={<Navigate to="/p/maverick" replace />} />
      <Route path="*" element={<Navigate to="/p/maverick" replace />} />
    </Routes>
  )
}
