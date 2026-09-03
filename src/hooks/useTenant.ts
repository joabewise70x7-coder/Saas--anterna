import { useEffect, useState } from 'react'
import type { Tenant } from '../types/tenant'
import { getTenantBySlug } from '../services/tenant/tenantService'

export function useTenant(slug?: string) {
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(Boolean(slug))
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false

    if (!slug) {
      setTenant(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    getTenantBySlug(slug)
      .then((data) => { if (!cancelled) setTenant(data) })
      .catch((err: unknown) => { if (!cancelled) setError(err instanceof Error ? err : new Error('Erro ao carregar tenant')) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [slug])

  return { tenant, loading, error }
}
