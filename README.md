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
- Prisma + PostgreSQL
- Auth.js (NextAuth v5) com credenciais + bcrypt — um único usuário administrativo
- Supabase Storage (bucket **privado**) para as fotos, servidas por URL assinada
- `qrcode` para gerar o QR em SVG/PNG

## Como rodar

```bash
npm install
cp .env.example .env   # preencha DATABASE_URL / DIRECT_URL / AUTH_SECRET
npx prisma migrate deploy
ADMIN_EMAIL='voce@empresa.com' ADMIN_PASSWORD='senha-forte-12+' npm run seed
npm run dev
```

Acesse `http://localhost:3000` (redireciona para o login). Em desenvolvimento,
sem Supabase configurado, as fotos são gravadas em `public/uploads/`.

Trocar a senha do admin: pela tela **Minha conta**, ou pela linha de comando
com `ADMIN_PASSWORD='nova-senha' npm run admin:reset-password`.

## Deploy

1. Postgres gerenciado: `DATABASE_URL` (pooled) e `DIRECT_URL` (direta, usada
   pelo `prisma migrate deploy`, que roda no `npm run build`).
2. `AUTH_SECRET` forte (`openssl rand -base64 32`).
3. **`NEXTAUTH_URL` com o domínio público real** — é esse domínio que vai
   gravado no QR Code. Configure antes de imprimir etiquetas.
4. Supabase: crie um bucket privado (padrão `equipment-photos`, ou defina
   `SUPABASE_BUCKET`) e configure `SUPABASE_URL` + `SUPABASE_SECRET_KEY`. Sem
   isso, o upload de fotos falha em produção de propósito, em vez de gravar em
   disco efêmero.
5. Rode o seed uma vez contra o banco de produção para criar o admin.

## Validações e segurança

- Todos os campos de texto são obrigatórios (navegador + servidor, com zod).
- Fotos: JPG, PNG ou WEBP até 8MB; o servidor confere a assinatura real do arquivo.
- Código SAP único; `qrIdentifier` único e não editável.
- Toda criação, edição e exclusão exige sessão (middleware + verificação em
  cada Server Action/rota). A página pública consulta apenas pelo
  `qrIdentifier`, seleciona só os campos exibidos e não é indexada.
