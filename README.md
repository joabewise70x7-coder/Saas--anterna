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

## Segurança da fundação

- `tenant_id` é obrigatório nas tabelas tenant-owned.
- Relações entre tenant e categoria/produto/pedido usam integridade referencial composta quando aplicável.
- Dados públicos do catálogo são somente leitura para `anon`/`authenticated` e ficam limitados a registros ativos.
- `orders` e `order_items` não possuem grants nem policies de escrita para clientes nesta fase.
- O Storage mantém leitura pública para assets públicos, mas uploads/updates/deletes por clientes estão bloqueados até existir um caminho autenticado e tenant-aware.
- A aplicação usa somente variáveis públicas do Supabase no frontend; service role/secret keys nunca devem ser expostas.
- `.env`, `.env.local`, `.env.*.local`, `node_modules` e `dist` são ignorados pelo Git.

### Limitação deliberada do catálogo público

Nesta fundação ainda não existe autenticação nem uma identidade de tenant confiável no JWT. Por isso, não é correto fingir que uma requisição anônima ao Data API possui um `tenant_id` seguro derivado da URL `/p/:slug`. O frontend resolve o tenant por slug e deve solicitar apenas os dados necessários daquele tenant.

Como o catálogo é conteúdo público, a leitura de registros ativos de todos os tenants continua permitida nesta fase. Isso não deve ser confundido com isolamento de dados privados. Quando existir uma identidade de tenant confiável (por exemplo, contexto derivado de autenticação/custom claims ou um caminho server-side), as policies poderão restringir as linhas por tenant de forma efetiva.

### Estratégia futura para criação de pedidos

O browser não deverá receber permissão direta para inserir pedidos arbitrários. O MVP deverá usar um caminho controlado no servidor (por exemplo, Edge Function/server endpoint) que derive/valide o tenant e os produtos pertencentes a ele antes de gravar `orders` e `order_items`. As constraints compostas permanecem como segunda camada de defesa.

## Storage

Assets públicos devem seguir o padrão:

`tenants/{tenant_id}/...`

Nesta fase, somente leitura pública é concedida no bucket `tenant-assets`. Escrita pelo browser está bloqueada para evitar que um cliente escolha ou sobrescreva caminhos de outro tenant. A futura camada autenticada/server-side deverá validar o `tenant_id` antes de permitir upload, atualização ou exclusão.

## Desenvolvimento

1. Copie `.env.example` para `.env.local`.
2. Preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
3. Execute `supabase/migrations/001_foundation.sql` e depois `supabase/migrations/002_harden_multi_tenant_foundation.sql` no projeto Supabase.
4. Instale dependências com `npm install`.
5. Rode `npm run dev`.

## Rotas de teste

- `/p/maverick`
- `/p/pizza-house`
- `/` mostra uma entrada neutra da fundação.
- Qualquer rota inexistente mostra 404.

## Escopo desta etapa

Esta etapa cria somente a fundação multi-tenant + PWA e suas correções de segurança/integridade. Não inclui painel administrativo, autenticação, assinaturas, cobrança ou recursos do MVP de pedidos.

## Validação

O build local deve ser validado com:

```bash
npm install
npm run build
```

O ambiente de execução usado para a auditoria não possui acesso de rede ao GitHub, então `npm install`/`npm run build` não puderam ser executados aqui. Não há CI configurado neste repositório para substituir essa validação.
