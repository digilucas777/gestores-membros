# Trafego / BORDERLESS — Área de Membros

Plataforma de aulas em vídeo para gestores com acesso via magic link.

## Stack

- Next.js 15 (App Router)
- Supabase (Auth + Postgres)
- Tailwind CSS
- TypeScript
- Vercel

## Setup local

1. Clone o repositório
2. Instale dependências: `npm install`
3. Copie as variáveis de ambiente: `cp .env.local.example .env.local`
4. Preencha `.env.local` com as credenciais do Supabase
5. Execute o schema no Supabase SQL Editor: copie e cole `supabase/schema.sql`
6. Rode o dev server: `npm run dev`

## Variáveis de ambiente

| Variável | Onde encontrar |
|----------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase > Project Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase > Project Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase > Project Settings > API |
| `ADMIN_EMAIL` | Seu próprio email |
| `NEXT_PUBLIC_APP_URL` | URL do Vercel após deploy |

## Deploy no Vercel

1. Crie o repositório no GitHub: `gestores-membros`
2. Push: `git remote add origin https://github.com/SEU_USUARIO/gestores-membros.git && git push -u origin main`
3. Acesse vercel.com > Add New Project > importe `gestores-membros`
4. Configure as variáveis de ambiente (mesmas do `.env.local`, com `NEXT_PUBLIC_APP_URL` = URL do Vercel)
5. Deploy

## Configurar Supabase para produção

Após ter a URL do Vercel:

1. Supabase > Authentication > URL Configuration
2. **Site URL:** `https://seu-projeto.vercel.app`
3. **Redirect URLs:** adicione `https://seu-projeto.vercel.app/auth/callback`

## Rotas

| Rota | Acesso | Descrição |
|------|--------|-----------|
| `/login` | Público | Login via magic link |
| `/aulas` | Gestores + Admin | Lista de aulas |
| `/aulas/[id]` | Gestores + Admin | Player de vídeo |
| `/admin` | Admin | Dashboard |
| `/admin/gestores` | Admin | Gerenciar gestores |
| `/admin/modulos` | Admin | Gerenciar módulos |
| `/admin/aulas` | Admin | Gerenciar aulas |
