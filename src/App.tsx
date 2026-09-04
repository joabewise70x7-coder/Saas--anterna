import { ArrowRight, ChevronDown, Clock3, MapPin, MessageCircle, Star, UtensilsCrossed } from 'lucide-react'
import { Route, Routes, useParams } from 'react-router-dom'
import { useMemo } from 'react'
import { useCatalog } from './hooks/useCatalog'
import { useTenant } from './hooks/useTenant'
import { useTenantTheme } from './hooks/useTenantTheme'
import type { Product } from './types/tenant'
import './styles.css'

function whatsappUrl(phone: string | null, message: string) {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '')
  return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}` : null
}

function LoadingState() {
  return <main className="state-screen"><div className="loading-card"><span className="spinner" /><p>Carregando sua experiência…</p></div></main>
}

function EmptyMenu() {
  return <div className="empty-menu"><UtensilsCrossed size={28} /><h3>Cardápio em preparação</h3><p>Esta pizzaria ainda não configurou os produtos do cardápio.</p></div>
}

function TenantPage() {
  const { slug } = useParams<{ slug: string }>()
  const { tenant, loading: tenantLoading, error: tenantError } = useTenant(slug)
  const { categories, products, loading: catalogLoading, error: catalogError } = useCatalog(tenant?.id)
  useTenantTheme(tenant)

  const whatsapp = useMemo(() => whatsappUrl(tenant?.whatsapp ?? null, `Olá, ${tenant?.name ?? ''}! Vim pelo cardápio online e gostaria de fazer um pedido.`), [tenant])

  if (tenantLoading) return <LoadingState />
  if (tenantError) return <main className="state-screen"><div className="state-card"><span className="state-icon">!</span><h1>Não foi possível carregar</h1><p>Ocorreu um erro ao buscar os dados desta pizzaria.</p></div></main>
  if (!tenant) return <main className="state-screen"><div className="state-card"><span className="state-icon">×</span><h1>Pizzaria não encontrada</h1><p>O endereço informado não corresponde a um tenant ativo.</p></div></main>

  const productsByCategory = (categoryId: string) => products.filter((product) => product.category_id === categoryId)
  const uncategorized = products.filter((product) => !product.category_id)

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label={`Ir para o início de ${tenant.name}`}>
          {tenant.logo_url ? <img src={tenant.logo_url} alt={`Logo ${tenant.name}`} /> : <span className="brand-mark">🍕</span>}
          <span>{tenant.name}</span>
        </a>
        <nav className="desktop-nav" aria-label="Navegação principal">
          <a href="#cardapio">Cardápio</a>
          {tenant.address && <a href="#localizacao">Localização</a>}
        </nav>
        {whatsapp ? <a className="header-cta" href={whatsapp} target="_blank" rel="noreferrer">Pedir agora <ArrowRight size={16} /></a> : <a className="header-cta disabled" href="#cardapio">Ver cardápio</a>}
      </header>

      <main id="top">
        <section className={`hero ${tenant.banner_url ? 'hero-with-image' : ''}`} style={tenant.banner_url ? { backgroundImage: `linear-gradient(90deg, var(--tenant-secondary) 0%, color-mix(in srgb, var(--tenant-secondary) 72%, transparent) 58%, transparent 100%), url(${tenant.banner_url})` } : undefined}>
          <div className="hero-glow" />
          <div className="hero-content">
            <div className="hero-badge"><Star size={14} fill="currentColor" /> Experiência artesanal</div>
            <h1>O sabor que<br /><em>você merece.</em></h1>
            <p>{tenant.description || `Peça da ${tenant.name} com praticidade e descubra nosso cardápio.`}</p>
            <div className="hero-actions">
              {whatsapp ? <a className="primary-btn" href={whatsapp} target="_blank" rel="noreferrer">Pedir agora <ArrowRight size={18} /></a> : <a className="primary-btn" href="#cardapio">Explorar cardápio <ArrowRight size={18} /></a>}
              <a className="ghost-btn" href="#cardapio">Ver sabores <ChevronDown size={17} /></a>
            </div>
            <div className="hero-meta"><span><Clock3 size={16} /> Atendimento online</span>{tenant.address && <span><MapPin size={16} /> {tenant.address}</span>}</div>
          </div>
        </section>

        <section id="cardapio" className="menu-section">
          <div className="section-heading"><div><span className="section-kicker">Nosso cardápio</span><h2>Escolha seu favorito.</h2></div><p>{products.length ? `${products.length} opções disponíveis` : 'Confira o cardápio'}</p></div>
          {catalogLoading ? <div className="catalog-loading"><span className="spinner" /> Carregando cardápio…</div> : catalogError ? <div className="empty-menu error-menu"><h3>Não foi possível carregar o cardápio</h3><p>Tente novamente em instantes.</p></div> : !products.length ? <EmptyMenu /> : <div className="catalog">
            {categories.map((category) => {
              const categoryProducts = productsByCategory(category.id)
              if (!categoryProducts.length) return null
              return <section className="category-block" key={category.id}><div className="category-title"><h3>{category.name}</h3>{category.description && <p>{category.description}</p>}</div><div className="product-grid">{categoryProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div></section>
            })}
            {uncategorized.length > 0 && <section className="category-block"><div className="category-title"><h3>Mais opções</h3></div><div className="product-grid">{uncategorized.map((product) => <ProductCard key={product.id} product={product} />)}</div></section>}
          </div>}
        </section>

        <section className="trust-strip"><div><span>01</span><strong>Ingredientes selecionados</strong><small>Qualidade em cada detalhe</small></div><div><span>02</span><strong>Pedido simples</strong><small>Prático direto pelo WhatsApp</small></div><div><span>03</span><strong>Feito para você</strong><small>Uma experiência personalizada</small></div></section>
        {tenant.address && <section id="localizacao" className="location-section"><span className="section-kicker">Onde estamos</span><h2>Venha nos visitar.</h2><p>{tenant.address}</p></section>}
      </main>

      {whatsapp && <a className="floating-whatsapp" href={whatsapp} target="_blank" rel="noreferrer" aria-label="Fazer pedido pelo WhatsApp"><MessageCircle size={23} /><span>Pedir pelo WhatsApp</span></a>}
      <footer><span>{tenant.name}</span><small>Cardápio online</small></footer>
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
  return <article className={`product-card ${product.is_featured ? 'featured' : ''}`}>
    <div className="product-image">{product.image_url ? <img src={product.image_url} alt={product.name} loading="lazy" /> : <div className="image-placeholder"><UtensilsCrossed size={24} /></div>}{product.is_featured && <span className="featured-badge">Destaque</span>}</div>
    <div className="product-info"><div><h4>{product.name}</h4>{product.description && <p>{product.description}</p>}</div><strong>R$ {Number(product.base_price).toFixed(2).replace('.', ',')}</strong></div>
  </article>
}

function FoundationHome() { return <main className="state-screen"><div className="state-card"><span className="state-icon">🍕</span><h1>Cardápio online</h1><p>Acesse a página da sua pizzaria usando o endereço do tenant.</p></div></main> }
function NotFound() { return <main className="state-screen"><div className="state-card"><span className="state-icon">404</span><h1>Página não encontrada</h1><p>O endereço informado não existe.</p></div></main> }

export default function App() {
  return <Routes><Route path="/" element={<FoundationHome />} /><Route path="/p/:slug" element={<TenantPage />} /><Route path="*" element={<NotFound />} /></Routes>
}
