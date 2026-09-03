export interface Tenant {
  id: string
  name: string
  slug: string
  logo_url: string | null
  favicon_url: string | null
  primary_color: string
  secondary_color: string
  accent_color: string
  background_color: string
  banner_url: string | null
  whatsapp: string | null
  phone: string | null
  description: string | null
  address: string | null
  delivery_fee: number
  minimum_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  tenant_id: string
  name: string
  description: string | null
  image_url: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  tenant_id: string
  category_id: string | null
  name: string
  description: string | null
  image_url: string | null
  base_price: number
  product_type: string
  is_featured: boolean
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}
