create extension if not exists pgcrypto;

create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  logo_url text,
  favicon_url text,
  primary_color text not null default '#C92A24',
  secondary_color text not null default '#171717',
  accent_color text not null default '#C49A4A',
  background_color text not null default '#FFFFFF',
  banner_url text,
  whatsapp text,
  phone text,
  description text,
  address text,
  delivery_fee numeric(10,2) not null default 0 check (delivery_fee >= 0),
  minimum_order numeric(10,2) not null default 0 check (minimum_order >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  description text,
  image_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  description text,
  image_url text,
  base_price numeric(10,2) not null default 0 check (base_price >= 0),
  product_type text not null default 'pizza',
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.pizza_sizes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  description text,
  price numeric(10,2) not null default 0 check (price >= 0),
  max_flavors integer not null default 1 check (max_flavors > 0),
  sort_order integer not null default 0,
  is_active boolean not null default true
);

create table public.pizza_flavors (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  description text,
  additional_price numeric(10,2) not null default 0 check (additional_price >= 0),
  image_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true
);

create table public.crusts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  description text,
  price numeric(10,2) not null default 0 check (price >= 0),
  image_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true
);

create table public.addons (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  description text,
  price numeric(10,2) not null default 0 check (price >= 0),
  image_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  customer_name text not null,
  customer_phone text,
  delivery_address text,
  delivery_number text,
  delivery_neighborhood text,
  delivery_complement text,
  delivery_reference text,
  payment_method text,
  subtotal numeric(10,2) not null default 0,
  delivery_fee numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  notes text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  quantity integer not null default 1 check (quantity > 0),
  unit_price numeric(10,2) not null default 0,
  total_price numeric(10,2) not null default 0,
  size jsonb,
  flavors jsonb,
  crust jsonb,
  addons jsonb,
  notes text
);

create index categories_tenant_id_idx on public.categories(tenant_id);
create index products_tenant_id_idx on public.products(tenant_id);
create index products_category_id_idx on public.products(category_id);
create index pizza_sizes_tenant_id_idx on public.pizza_sizes(tenant_id);
create index pizza_flavors_tenant_id_idx on public.pizza_flavors(tenant_id);
create index crusts_tenant_id_idx on public.crusts(tenant_id);
create index addons_tenant_id_idx on public.addons(tenant_id);
create index orders_tenant_id_idx on public.orders(tenant_id);
create index order_items_tenant_id_idx on public.order_items(tenant_id);
create index order_items_order_id_idx on public.order_items(order_id);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger tenants_updated_at before update on public.tenants for each row execute function public.set_updated_at();
create trigger categories_updated_at before update on public.categories for each row execute function public.set_updated_at();
create trigger products_updated_at before update on public.products for each row execute function public.set_updated_at();
create trigger orders_updated_at before update on public.orders for each row execute function public.set_updated_at();

alter table public.tenants enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.pizza_sizes enable row level security;
alter table public.pizza_flavors enable row level security;
alter table public.crusts enable row level security;
alter table public.addons enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Public ordering foundation: tenants expose only active public data.
create policy "public can read active tenants" on public.tenants for select using (is_active = true);
create policy "public can read active categories" on public.categories for select using (is_active = true and exists (select 1 from public.tenants t where t.id = tenant_id and t.is_active));
create policy "public can read active products" on public.products for select using (is_active = true and exists (select 1 from public.tenants t where t.id = tenant_id and t.is_active));
create policy "public can read active sizes" on public.pizza_sizes for select using (is_active = true and exists (select 1 from public.tenants t where t.id = tenant_id and t.is_active));
create policy "public can read active flavors" on public.pizza_flavors for select using (is_active = true and exists (select 1 from public.tenants t where t.id = tenant_id and t.is_active));
create policy "public can read active crusts" on public.crusts for select using (is_active = true and exists (select 1 from public.tenants t where t.id = tenant_id and t.is_active));
create policy "public can read active addons" on public.addons for select using (is_active = true and exists (select 1 from public.tenants t where t.id = tenant_id and t.is_active));

-- Orders are intentionally not publicly readable. Creation is restricted to active tenants.
create policy "public can create orders for active tenants" on public.orders for insert with check (exists (select 1 from public.tenants t where t.id = tenant_id and t.is_active));
create policy "public can create order items for active tenants" on public.order_items for insert with check (exists (select 1 from public.tenants t where t.id = tenant_id and t.is_active));

-- Keep child tenant ownership consistent with the order tenant.
create or replace function public.validate_order_item_tenant()
returns trigger language plpgsql as $$
declare parent_tenant uuid;
begin
  select tenant_id into parent_tenant from public.orders where id = new.order_id;
  if parent_tenant is null or parent_tenant <> new.tenant_id then
    raise exception 'order_items tenant_id must match order tenant';
  end if;
  return new;
end;
$$;
create trigger order_items_tenant_check before insert or update on public.order_items for each row execute function public.validate_order_item_tenant();

insert into public.tenants (name, slug, whatsapp, primary_color, secondary_color, accent_color, background_color, is_active, description)
values ('Maverick Pizzaria', 'maverick', '558195977543', '#C92A24', '#171717', '#C49A4A', '#FFFFFF', true, 'Pizza artesanal e pedidos online.');

insert into public.tenants (name, slug, whatsapp, primary_color, secondary_color, accent_color, background_color, is_active, description)
values ('Pizza House', 'pizza-house', '558199999999', '#2563EB', '#0F172A', '#F59E0B', '#F8FAFC', true, 'Tenant de teste para validar isolamento multi-tenant.');

-- Storage bucket is prepared; tenant-specific folders use tenants/{tenant_id}/...
insert into storage.buckets (id, name, public) values ('tenant-assets', 'tenant-assets', true) on conflict (id) do nothing;

create policy "public can read tenant assets" on storage.objects for select using (bucket_id = 'tenant-assets');
