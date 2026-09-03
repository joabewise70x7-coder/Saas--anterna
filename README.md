# SaaS Anterna

Fundação de uma plataforma SaaS multi-tenant para pizzarias.

## Arquitetura

- Um único projeto React + TypeScript + Vite.
- Cada pizzaria é um registro em `tenants`.
- Tenant público identificado por `/p/:slug`.
- Configuração visual carregada do banco e aplicada por CSS variables.
- Supabase/PostgreSQL como camada de dados.
- RLS habilitado nas tabelas tenant-aware.
- Storage `tenant-assets` preparado para `tenants/{tenant_id}/...`.
- PWA mobile-first preparado para Vercel.

## Desenvolvimento

1. Copie `.env.example` para `.env.local`.
2. Preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
3. Execute a migration `supabase/migrations/001_foundation.sql` no projeto Supabase.
4. Instale dependências com `npm install`.
5. Rode `npm run dev`.

## Rotas de teste

- `/p/maverick`
- `/p/pizza-house`

## Escopo desta etapa

Esta etapa cria somente a fundação multi-tenant + PWA. Não inclui painel administrativo, autenticação, assinaturas, cobrança ou recursos avançados.

## Próxima etapa

O MVP de pedidos será construído sobre esta fundação, reutilizando o mesmo core para todos os tenants.
