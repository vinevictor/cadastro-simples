# Crianças do Encontro

Sistema de login + cadastro (CRUD) das crianças de um encontro: dados da
criança, dos pais, saúde/alimentação e dias de permanência, com busca e
filtros.

Stack: **Next.js (App Router) + TypeScript + Tailwind + Prisma + PostgreSQL**,
pronto para deploy na **Vercel**.

> **Sobre o banco de dados:** SQLite (arquivo único) não foi usado porque a
> Vercel roda em funções serverless com sistema de arquivos somente leitura —
> um `.db` local não persiste entre execuções e os dados seriam perdidos. Por
> isso o projeto usa Postgres via **Prisma Postgres** (Storage → Create
> Database, na própria Vercel), que é gratuito para esse volume de uso e já
> vem com connection pooling embutido.

## 1. Rodando localmente

```bash
npm install
cp .env.example .env
```

Preencha o `.env`:
- `ADMIN_USERNAME` / `ADMIN_PASSWORD`: usuário e senha fixos de login.
- `AUTH_SECRET`: uma string aleatória longa (gere com `openssl rand -base64 32`).
- `DATABASE_URL`: veja o passo 2 abaixo para criar um banco gratuito.

Depois de configurar o `.env`:

```bash
npx prisma db push   # cria a tabela no banco a partir do prisma/schema.prisma
npm run dev          # http://localhost:3000
```

## 2. Criando o banco de dados (Prisma Postgres)

1. No dashboard da Vercel, abra o projeto e vá em **Storage → Create Database**.
2. Escolha **Prisma Postgres** (Free) e confirme a criação.
3. Clique em **Connect** para vincular o banco ao seu projeto. Isso cria
   automaticamente a variável `DATABASE_URL` no projeto (ambientes Preview e
   Production).
4. Para rodar localmente, copie o valor de `DATABASE_URL` do dashboard da
   Vercel (Settings → Environment Variables) para o seu `.env`.

Alternativa: você pode usar qualquer Postgres (Neon, Supabase, etc.) — só
preencher `DATABASE_URL` com a connection string do provedor escolhido.

## 3. Deploy na Vercel

1. Suba este projeto para um repositório no GitHub/GitLab.
2. Na Vercel, clique em **Add New → Project** e importe o repositório.
3. Configure em **Settings → Environment Variables**:
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `AUTH_SECRET`
   - `DATABASE_URL` (criada automaticamente se você conectar um banco Prisma
     Postgres ao projeto — passo 2).
4. Faça o deploy. O script `build` já roda `prisma generate` automaticamente.
5. Depois do primeiro deploy, crie a tabela no banco rodando **uma vez**,
   com o `.env` local apontando pro banco de produção:
   ```bash
   npx prisma db push
   ```
6. Se você adicionou/alterou variáveis de ambiente depois do primeiro deploy,
   faça um **Redeploy** manual (Deployments → ⋯ → Redeploy) para elas
   entrarem em vigor.

## Funcionalidades

- **Login** com dois papéis: **admin** (`ADMIN_USERNAME`/`ADMIN_PASSWORD`,
  acesso total) e **auxiliar** (`AUX_USERNAME`/`AUX_PASSWORD`, só visualiza —
  não vê botões de cadastrar/editar/excluir e não consegue acessar essas
  rotas mesmo digitando a URL direto).
- **Grupos por faixa etária**: em "Grupos por idade" (só admin) você define
  faixas (ex: 4 a 6 anos) e uma cor. Ao cadastrar/editar uma criança, o grupo
  é sugerido automaticamente pela data de nascimento, mas pode ser trocado.
  A lista mostra a cor do grupo em cada card e permite filtrar por grupo.
- **Lista** de crianças com todas as informações visíveis em cada card.
- **Busca** por nome da criança, da mãe ou do pai.
- **Filtros** por equipe, dia do encontro, grupo de idade e "possui alergia/
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
