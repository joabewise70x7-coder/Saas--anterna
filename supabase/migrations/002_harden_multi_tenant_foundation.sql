-- Hardening migration for the public multi-tenant foundation.
-- This migration does not add MVP features, authentication, checkout or billing.

-- -----------------------------------------------------------------------------
-- 1. Cross-tenant referential integrity
-- -----------------------------------------------------------------------------
-- Composite uniqueness makes (tenant_id, id) a valid target for composite FKs.
alter table public.categories
  add constraint categories_tenant_id_id_key unique (tenant_id, id);

alter table public.products
  add constraint products_tenant_id_id_key unique (tenant_id, id);

alter table public.orders
  add constraint orders_tenant_id_id_key unique (tenant_id, id);

-- Remove child FKs whose single-column form cannot prove tenant ownership.
alter table public.products
  drop constraint if exists products_category_id_fkey;

alter table public.order_items
  drop constraint if exists order_items_product_id_fkey;

alter table public.order_items
  drop constraint if exists order_items_order_id_fkey;

-- A category/product referenced by another tenant cannot be attached.
-- RESTRICT is intentional here: it preserves the child's tenant_id instead
-- of nulling it through a composite SET NULL action.
alter table public.products
  add constraint products_category_same_tenant_fk
  foreign key (tenant_id, category_id)
  references public.categories (tenant_id, id)
  on delete restrict;

alter table public.order_items
  add constraint order_items_product_same_tenant_fk
  foreign key (tenant_id, product_id)
  references public.products (tenant_id, id)
  on delete restrict;

alter table public.order_items
  add constraint order_items_order_same_tenant_fk
  foreign key (tenant_id, order_id)
  references public.orders (tenant_id, id)
  on delete cascade;

create index if not exists products_tenant_category_idx
  on public.products (tenant_id, category_id);

create index if not exists order_items_tenant_product_idx
  on public.order_items (tenant_id, product_id);

create index if not exists order_items_tenant_order_idx
  on public.order_items (tenant_id, order_id);

-- -----------------------------------------------------------------------------
-- 2. RLS / least privilege
-- -----------------------------------------------------------------------------
-- The public catalog is intentionally readable because it is customer-facing.
-- There is no authenticated tenant context in this foundation yet, so the
-- database cannot truthfully infer a tenant from an anonymous browser request.
-- We therefore keep public reads limited to active public catalog rows and
-- explicitly close all order writes until the controlled MVP write path exists.

-- Remove the original broad policies before recreating explicit role-scoped ones.
drop policy if exists "public can read active tenants" on public.tenants;
drop policy if exists "public can read active categories" on public.categories;
drop policy if exists "public can read active products" on public.products;
drop policy if exists "public can read active sizes" on public.pizza_sizes;
drop policy if exists "public can read active flavors" on public.pizza_flavors;
drop policy if exists "public can read active crusts" on public.crusts;
drop policy if exists "public can read active addons" on public.addons;
drop policy if exists "public can create orders for active tenants" on public.orders;
drop policy if exists "public can create order items for active tenants" on public.order_items;

-- Explicitly limit exposed table privileges to what this foundation needs.
revoke all on table public.tenants from anon, authenticated;
revoke all on table public.categories from anon, authenticated;
revoke all on table public.products from anon, authenticated;
revoke all on table public.pizza_sizes from anon, authenticated;
revoke all on table public.pizza_flavors from anon, authenticated;
revoke all on table public.crusts from anon, authenticated;
revoke all on table public.addons from anon, authenticated;
revoke all on table public.orders from anon, authenticated;
revoke all on table public.order_items from anon, authenticated;

grant select on table public.tenants to anon, authenticated;
grant select on table public.categories to anon, authenticated;
grant select on table public.products to anon, authenticated;
grant select on table public.pizza_sizes to anon, authenticated;
grant select on table public.pizza_flavors to anon, authenticated;
grant select on table public.crusts to anon, authenticated;
grant select on table public.addons to anon, authenticated;

create policy "public read active tenants"
  on public.tenants
  for select
  to anon, authenticated
  using (is_active = true);

create policy "public read active categories"
  on public.categories
  for select
  to anon, authenticated
  using (
    is_active = true
    and exists (
      select 1
      from public.tenants t
      where t.id = categories.tenant_id
        and t.is_active = true
    )
  );

create policy "public read active products"
  on public.products
  for select
  to anon, authenticated
  using (
    is_active = true
    and exists (
      select 1
      from public.tenants t
      where t.id = products.tenant_id
        and t.is_active = true
    )
  );

create policy "public read active pizza sizes"
  on public.pizza_sizes
  for select
  to anon, authenticated
  using (
    is_active = true
    and exists (
      select 1
      from public.tenants t
      where t.id = pizza_sizes.tenant_id
        and t.is_active = true
    )
  );

create policy "public read active pizza flavors"
  on public.pizza_flavors
  for select
  to anon, authenticated
  using (
    is_active = true
    and exists (
      select 1
      from public.tenants t
      where t.id = pizza_flavors.tenant_id
        and t.is_active = true
    )
  );

create policy "public read active crusts"
  on public.crusts
  for select
  to anon, authenticated
  using (
    is_active = true
    and exists (
      select 1
      from public.tenants t
      where t.id = crusts.tenant_id
        and t.is_active = true
    )
  );

create policy "public read active addons"
  on public.addons
  for select
  to anon, authenticated
  using (
    is_active = true
    and exists (
      select 1
      from public.tenants t
      where t.id = addons.tenant_id
        and t.is_active = true
    )
  );

-- orders and order_items intentionally have no anon/authenticated policies
-- and no anon/authenticated grants in this foundation stage.

-- -----------------------------------------------------------------------------
-- 3. Storage hardening
-- -----------------------------------------------------------------------------
-- Public reads remain allowed for public branding/menu assets.
-- Browser uploads/updates/deletes are denied until a future authenticated,
-- tenant-aware write path can validate tenants/{tenant_id}/... server-side.
drop policy if exists "public can read tenant assets" on storage.objects;

revoke insert, update, delete on table storage.objects from anon, authenticated;
grant select on table storage.objects to anon, authenticated;

create policy "public read tenant assets"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'tenant-assets');

-- -----------------------------------------------------------------------------
-- 4. Safety documentation for the future order write path
-- -----------------------------------------------------------------------------
comment on table public.orders is
  'Order writes are intentionally closed to anon/authenticated roles in the foundation. Future MVP writes must use a controlled server-side path that derives and validates tenant ownership.';

comment on table public.order_items is
  'Order item writes are intentionally closed to anon/authenticated roles in the foundation. Composite FKs enforce tenant consistency when the future controlled write path is introduced.';
