# Crianças do Encontro

Sistema de login + cadastro (CRUD) das crianças de um encontro: dados da
criança, dos pais, saúde/alimentação e dias de permanência, com busca e
filtros.

Stack: **Next.js (App Router) + TypeScript + Tailwind + Prisma + PostgreSQL**,
pronto para deploy na **Vercel**.

> **Sobre o banco de dados:** SQLite (arquivo único) não foi usado porque a
> Vercel roda em funções serverless com sistema de arquivos somente leitura —
> um `.db` local não persiste entre execuções e os dados seriam perdidos. Por
> isso o projeto usa Postgres (via integração **Vercel Postgres**, que por trás
> é Neon), que é gratuito para esse volume de uso e funciona perfeitamente
> com Prisma.

## 1. Rodando localmente

```bash
npm install
cp .env.example .env
```

Preencha o `.env`:
- `ADMIN_USERNAME` / `ADMIN_PASSWORD`: usuário e senha fixos de login.
- `AUTH_SECRET`: uma string aleatória longa (gere com `openssl rand -base64 32`).
- `POSTGRES_PRISMA_URL` / `POSTGRES_URL_NON_POOLING`: veja o passo 2 abaixo
  para criar um banco gratuito (pode ser o mesmo banco usado em produção,
  ou um banco separado só para desenvolvimento).

Depois de configurar o `.env`:

```bash
npx prisma db push   # cria a tabela no banco a partir do prisma/schema.prisma
npm run dev          # http://localhost:3000
```

## 2. Criando o banco de dados (Vercel Postgres)

1. Crie o projeto na Vercel (veja passo 3) ou acesse o dashboard da Vercel.
2. Vá em **Storage → Create Database → Postgres** (Neon).
3. Depois de criado, conecte o banco ao seu projeto (aba **Connect Project**).
   Isso cria automaticamente as variáveis `POSTGRES_PRISMA_URL` e
   `POSTGRES_URL_NON_POOLING` no projeto.
4. Para rodar localmente, copie essas duas variáveis do dashboard da Vercel
   (Settings → Environment Variables) para o seu `.env`.

Alternativa: você pode usar qualquer Postgres (Neon, Supabase, etc.) — só
preencher `POSTGRES_PRISMA_URL` e `POSTGRES_URL_NON_POOLING` com a connection
string do provedor escolhido (pode ser a mesma URL nas duas, se o provedor
não tiver uma URL "pooled" separada).

## 3. Deploy na Vercel

1. Suba este projeto para um repositório no GitHub/GitLab.
2. Na Vercel, clique em **Add New → Project** e importe o repositório.
3. Antes do primeiro deploy (ou logo depois), configure em
   **Settings → Environment Variables**:
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `AUTH_SECRET`
   - `POSTGRES_PRISMA_URL` e `POSTGRES_URL_NON_POOLING` (criadas automaticamente
     se você conectar um banco Vercel Postgres ao projeto — passo 2).
4. Faça o deploy. O script `build` já roda `prisma generate` automaticamente.
5. Depois do primeiro deploy, crie a tabela no banco rodando **uma vez**,
   com o `.env` de produção apontando pra ele:
   ```bash
   npx prisma db push
   ```
   (Ou rode esse comando localmente com `POSTGRES_PRISMA_URL` /
   `POSTGRES_URL_NON_POOLING` apontando para o banco de produção.)

## Funcionalidades

- **Login** com usuário/senha únicos (variáveis de ambiente), sessão via
  cookie assinado (JWT), todas as páginas protegidas por middleware.
- **Lista** de crianças com todas as informações visíveis em cada card.
- **Busca** por nome da criança, da mãe ou do pai.
- **Filtros** por equipe dos pais, dia do encontro e "possui alergia/
  medicação/restrição alimentar".
- **Cadastrar**, **editar** e **excluir** (com confirmação) crianças.

## Campos cadastrados

Nome da criança, data de nascimento (idade calculada automaticamente), nome
da mãe, nome do pai, telefones de contato, equipe dos pais no encontro,
alergias, medicamentos, restrições alimentares, se fará as alimentações,
quais dias ficará (sexta/sábado/domingo) e observações relevantes.

## Estrutura

```
app/
  login/                    página e action de login
  (app)/                    área logada (protegida pelo middleware)
    layout.tsx              cabeçalho + botão sair
    page.tsx                lista, busca e filtros
    children/
      actions.ts            server actions: criar, editar, excluir, listar
      ChildForm.tsx          formulário usado no cadastro e na edição
      new/page.tsx           página "nova criança"
      [id]/edit/page.tsx     página "editar criança"
lib/
  prisma.ts                 cliente Prisma
  auth.ts                   sessão (JWT em cookie) e verificação de login
  constants.ts              dias do encontro
  utils.ts                  cálculo de idade, formatação de data
proxy.ts                     protege todas as rotas exceto /login (Proxy do Next.js)
prisma/schema.prisma         modelo do banco de dados
```
