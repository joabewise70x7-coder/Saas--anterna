import { supabase } from '../../lib/supabase'
import type { Category, Product } from '../../types/tenant'

export async function getCatalog(tenantId: string): Promise<{ categories: Category[]; products: Product[] }> {
  const [{ data: categories, error: categoriesError }, { data: products, error: productsError }] = await Promise.all([
    supabase.from('categories').select('*').eq('tenant_id', tenantId).eq('is_active', true).order('sort_order', { ascending: true }),
    supabase.from('products').select('*').eq('tenant_id', tenantId).eq('is_active', true).order('sort_order', { ascending: true }),
  ])

  if (categoriesError) throw categoriesError
  if (productsError) throw productsError

  return {
    categories: (categories ?? []) as Category[],
    products: (products ?? []) as Product[],
  }
}
