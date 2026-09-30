# poraquimaquinas — Identificação de equipamentos por QR Code

MVP com dois contextos:

1. **Área administrativa** (`/admin/equipamentos`, protegida por login) —
   cadastrar, pesquisar, editar e excluir equipamentos. Após salvar, a tela do
   equipamento mostra o QR Code com download PNG/SVG, etiqueta para impressão
   e link para a página pública.
2. **Página pública** (`/equipamento/{qrIdentifier}`, sem login) — somente
   leitura, otimizada para celular: foto, conjunto, subconjunto, linha,
   equipamento, Código SAP, descrição técnica e função do subconjunto.

O `qrIdentifier` é um UUID gerado pelo banco e nunca muda. O Código SAP é o
identificador de negócio (único) e pode ser editado sem reimprimir etiquetas.

## Stack

- Next.js 15 (App Router, Server Actions) + TypeScript + Tailwind CSS
- Prisma + PostgreSQL no **Neon**
- Auth.js (NextAuth v5) com credenciais + bcrypt — um único usuário administrativo
- **Neon Object Storage** (compatível com S3, bucket **privado**) para as fotos, servidas por URL assinada
- `qrcode` para gerar o QR em SVG/PNG

## Como rodar (local)

```bash
npm install
cp .env.example .env   # preencha DATABASE_URL, DIRECT_URL e AUTH_SECRET
npm run db:migrate     # aplica as migrations (usa DIRECT_URL)
ADMIN_EMAIL='voce@empresa.com' ADMIN_PASSWORD='senha-forte-12+' npm run seed
npm run dev
```

Acesse `http://localhost:3000` (redireciona para o login). Em desenvolvimento,
sem o storage configurado, as fotos são gravadas em `public/uploads/`.

Trocar a senha do admin: pela tela **Minha conta**, ou pela linha de comando
com `ADMIN_PASSWORD='nova-senha' npm run admin:reset-password`.

## Deploy na Vercel

O projeto usa a configuração padrão de Next.js da Vercel — não há
`vercel.json`, servidor customizado nem Docker. Build: `npm run build`
(`prisma generate && next build`). **O build não acessa o banco nem o
storage**: ele passa mesmo sem nenhuma variável configurada.

### 1. Environment Variables (Vercel → Settings → Environment Variables)

**Obrigatórias em runtime (banco):**

| Variável | Valor |
| --- | --- |
| `DATABASE_URL` | String *pooled* do Neon (host com `-pooler`, `?sslmode=require`) |

**Obrigatórias para autenticação:**

| Variável | Valor |
| --- | --- |
| `AUTH_SECRET` | Valor aleatório forte (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Domínio público, ex. `https://app.suaempresa.com` — **é o domínio gravado nos QR Codes**. Cadastre só no ambiente *Production*. |

**Obrigatórias para upload/exibição de fotos (Neon Object Storage):**

| Variável | Valor |
| --- | --- |
| `AWS_ENDPOINT_URL_S3` | Endpoint S3 do branch (Neon Console → Connect → Storage) |
| `AWS_ACCESS_KEY_ID` | `token_id` da credencial de storage |
| `AWS_SECRET_ACCESS_KEY` | `s3_secret_access_key` da credencial |
| `AWS_REGION` | Região do projeto Neon, ex. `us-east-1` |
| `STORAGE_BUCKET` | Bucket **privado**; opcional, padrão `equipment-photos` |

Sem as variáveis de storage o sistema funciona, mas o cadastro com foto
retorna um erro claro e as fotos não são exibidas.

**Não cadastrar na Vercel:** `DIRECT_URL` (só para migrations, ver abaixo) e
`ADMIN_EMAIL` / `ADMIN_NAME` / `ADMIN_PASSWORD` (só para os scripts locais de
seed e reset de senha). `AUTH_TRUST_HOST` também não é necessária na Vercel.

### 2. Migrations de produção

As migrations **não** rodam no build da Vercel — assim um deploy nunca
quebra por falta de acesso ao banco. Elas são aplicadas separadamente,
**antes** do deploy que depende da mudança de schema:

```bash
# Na sua máquina, com DIRECT_URL apontando para o banco de produção:
DIRECT_URL='postgresql://...' DATABASE_URL='postgresql://...' npm run db:migrate
npm run db:status   # confirma "Database schema is up to date!"
```

Ordem para uma mudança de schema: criar a migration → `npm run db:migrate`
em produção → push/merge (a Vercel faz o deploy). Deploys sem mudança de
schema não exigem nenhum passo de banco.

### 3. Primeiro deploy

1. Aplique as migrations (passo 2) e crie o admin uma única vez:
   `ADMIN_EMAIL='...' ADMIN_PASSWORD='...' npm run seed` apontando para o
   banco de produção.
2. Importe o repositório na Vercel (framework detectado: Next.js) e cadastre
   as variáveis do passo 1.
3. **Deployment Protection:** a proteção padrão da Vercel exige login da
   Vercel em URLs `*.vercel.app`. Como a página `/equipamento/...` precisa ser
   pública para quem escaneia o QR Code, desative a proteção para Production
   (Settings → Deployment Protection) ou use um domínio próprio.
4. Depois de ter o domínio definitivo, ajuste `NEXTAUTH_URL` e faça
   *Redeploy* — antes de imprimir etiquetas.

### Limites da Vercel

- Fotos até **4MB**: funções da Vercel recusam requisições acima de 4,5MB.

## Validações e segurança

- Todos os campos de texto são obrigatórios (navegador + servidor, com zod).
- Fotos: JPG, PNG ou WEBP até 4MB; o servidor confere a assinatura real do arquivo.
- Código SAP único; `qrIdentifier` único e não editável.
- Toda criação, edição e exclusão exige sessão (middleware + verificação em
  cada Server Action/rota). A página pública consulta apenas pelo
  `qrIdentifier`, seleciona só os campos exibidos e não é indexada.
