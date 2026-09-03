import { supabase } from '../../lib/supabase'
import type { Tenant } from '../../types/tenant'

export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  if (!supabase) return null

  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()

  if (error) throw error
  return data as Tenant | null
}
