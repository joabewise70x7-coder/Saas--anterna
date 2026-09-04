import { useEffect, useState } from 'react'
import type { Category, Product } from '../types/tenant'
import { getCatalog } from '../services/catalog/catalogService'

export function useCatalog(tenantId?: string) {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(Boolean(tenantId))
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false

    if (!tenantId) {
      setCategories([])
      setProducts([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    getCatalog(tenantId)
      .then(({ categories: nextCategories, products: nextProducts }) => {
        if (cancelled) return
        setCategories(nextCategories)
        setProducts(nextProducts)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err : new Error('Erro ao carregar cardápio'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [tenantId])

  return { categories, products, loading, error }
}
