import { useEffect } from 'react'
import type { Tenant } from '../types/tenant'

export function useTenantTheme(tenant: Tenant | null) {
  useEffect(() => {
    if (!tenant) return

    const root = document.documentElement
    root.style.setProperty('--tenant-primary', tenant.primary_color)
    root.style.setProperty('--tenant-secondary', tenant.secondary_color)
    root.style.setProperty('--tenant-accent', tenant.accent_color)
    root.style.setProperty('--tenant-background', tenant.background_color)
    document.title = tenant.name

    return () => {
      root.style.removeProperty('--tenant-primary')
      root.style.removeProperty('--tenant-secondary')
      root.style.removeProperty('--tenant-accent')
      root.style.removeProperty('--tenant-background')
    }
  }, [tenant])
}
