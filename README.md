# Finanças a Dois

Gerenciamento financeiro para casais - MVP completo com Web (PWA) e Mobile (Expo).

## 🏗️ Arquitetura

Este é um monorepo pnpm com 3 pacotes:

- **apps/web**: Aplicação Next.js 14 com App Router, Prisma, NextAuth, e PWA
- **apps/mobile**: Aplicação Expo com React Navigation e sincronização offline
- **packages/shared**: Schemas Zod, tipos TypeScript, e utilitários compartilhados

## 🚀 Setup

### Pré-requisitos

- Node.js 20+
- pnpm 8+
- SQLite (incluído)

### Instalação

```bash
# Instalar dependências
pnpm install

# Configurar ambiente
cp .env.example .env

# Edite o .env com suas configurações:
# - DATABASE_URL: caminho para o arquivo SQLite
# - NEXTAUTH_URL: URL da aplicação (http://localhost:3000 para dev)
# - NEXTAUTH_SECRET: chave secreta para JWT (gere com: openssl rand -base64 32)
# - EMAIL_SERVER: configuração SMTP para magic links
# - EMAIL_FROM: email remetente

# Criar banco de dados
pnpm db:push

# Seed inicial (opcional - cria dados de exemplo)
pnpm db:seed
```

## 📱 Desenvolvimento

### Web App

```bash
# Iniciar servidor de desenvolvimento
pnpm dev

# Build para produção
pnpm build

# Abrir Prisma Studio (GUI para banco de dados)
pnpm db:studio
```

Acesse em: http://localhost:3000

### Mobile App

```bash
# Configurar variável de ambiente
# Edite apps/mobile/app.json e ajuste extra.apiBaseUrl
# ou defina EXPO_PUBLIC_API_BASE_URL no ambiente

# Iniciar Expo
pnpm dev:mobile

# Build para Android/iOS (requer EAS CLI)
cd apps/mobile
npx eas build --platform android
npx eas build --platform ios
```

## 🔐 Autenticação

O sistema usa NextAuth v5 com Email Magic Link:

1. Usuário insere email na tela de login
2. Sistema envia link mágico por email
3. Usuário clica no link e é autenticado
4. JWT session com role e familyId

## 📊 Funcionalidades

### Backend API (REST v1)

- **GET /api/v1/me** - Dados do usuário atual
- **POST /api/v1/auth/magic-link** - Enviar magic link
- **GET /api/v1/dashboard?month=YYYY-MM** - KPIs e resumo mensal
- **GET/POST /api/v1/categories** - Listar/criar categorias
- **PATCH/DELETE /api/v1/categories/:id** - Atualizar/deletar categoria
- **GET/POST /api/v1/transactions** - Listar/criar transações
- **PATCH/DELETE /api/v1/transactions/:id** - Atualizar/deletar transação
- **POST /api/v1/invites** - Criar convite (OWNER only)
- **POST /api/v1/invites/accept** - Aceitar convite
- **POST /api/v1/onboarding/activate** - Ativar mês com seed

### Web UI

- **/** - Dashboard com KPIs, top categorias, e transações recentes
- **/new** - Formulário para nova transação (3 taps/clicks)
- **/history** - Histórico com filtros (Todos/Receitas/Despesas)
- **/onboarding** - Onboarding com preview de seed
- **/auth/signin** - Tela de login com magic link

### Mobile UI

- **Dashboard** - Mesmo que web, com pull-to-refresh
- **+ Lançar** - Formulário para nova transação com suporte offline
- **Histórico** - Lista de transações com filtros

### Offline-First (Mobile)

O app mobile suporta modo offline:

1. Transações criadas offline são salvas no AsyncStorage
2. Quando reconectar, transações são enviadas em ordem
3. Usa `Idempotency-Key` para evitar duplicatas
4. Transações falhas são mantidas na fila

## 🗄️ Banco de Dados

### Modelos

- **User**: Usuários (OWNER | PARTNER)
- **Family**: Família compartilhada
- **Category**: Categorias (INCOME | EXPENSE)
- **Transaction**: Transações com Decimal(12,2)
- **Setting**: Configurações da família
- **Invite**: Convites para novos membros
- **VerificationToken**: Tokens para magic links

### Seed

O seed cria dados de exemplo para o mês atual:

**Categorias de Receita:**
- Salário
- Outros

**Categorias de Despesa:**
- Cartão, Casa, Carro, Limpeza, Internet/Telefone, Clube, Condomínio, Mercado, Restaurante, Saúde, Lazer, Outros

**Transações de Exemplo:**
- Receitas: R$ 22.150,00
- Despesas: R$ 22.167,00
- Saldo: R$ -17,00

## 🔒 Segurança

- Autenticação via JWT com NextAuth v5
- Validação de dados com Zod
- ETag/If-Match para concorrência otimista
- Role-based access control (OWNER/PARTNER)
- Idempotency-Key para POSTs

## 📄 API Conventions

- RFC7807 Problem JSON para erros
- Campos em snake_case no JSON
- Valores monetários em BRL como string "0000.00"
- Datas em ISO 8601 (YYYY-MM-DD)
- Paginação com cursor

## 🌐 PWA

A aplicação web é instalável como PWA:

- Manifest em `/manifest.webmanifest`
- Service Worker com cache stale-while-revalidate
- Ícones 192x192 e 512x512 (placeholders incluídos)

## 🛠️ Comandos Úteis

```bash
# Instalar dependências
pnpm install

# Desenvolvimento web
pnpm dev

# Desenvolvimento mobile
pnpm dev:mobile

# Build web
pnpm build

# Prisma
pnpm db:push        # Sincronizar schema
pnpm db:seed        # Popular com dados
pnpm db:studio      # GUI do banco
```

## 📦 Estrutura de Arquivos

```
.
├── apps/
│   ├── web/
│   │   ├── app/
│   │   │   ├── api/v1/          # API routes
│   │   │   ├── auth/            # Auth pages
│   │   │   ├── lib/             # Auth & Prisma
│   │   │   ├── page.tsx         # Dashboard
│   │   │   ├── new/             # New transaction
│   │   │   ├── history/         # History
│   │   │   └── onboarding/      # Onboarding
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts
│   │   └── public/
│   │       ├── manifest.webmanifest
│   │       └── sw.js
│   └── mobile/
│       ├── screens/             # Dashboard, New, History
│       ├── lib/                 # API & offline queue
│       └── App.tsx
└── packages/
    └── shared/
        └── src/
            ├── schemas/         # Zod schemas
            ├── types/           # TypeScript types
            └── utils/           # Utilities
```

## 🚧 Notas de Implementação

- **Sem telemetria**: Nenhuma ferramenta de analytics incluída
- **Sem testes automatizados**: Foco em MVP funcional
- **Microcopy em pt-BR**: Interface em português brasileiro
- **SQLite**: Banco de dados local para simplificar deploy
- **Valores BRL**: Moeda brasileira com 2 decimais

## 🎯 Acceptance Criteria

- [x] Magic link login funcionando
- [x] Onboarding aplica seed do mês
- [x] Adicionar transação em 3 taps/clicks
- [x] Dashboard com KPIs, top categorias, recentes
- [x] Histórico com filtro e endpoints edit/delete
- [x] Mobile offline launch e sync on reconnect
- [x] PWA instalável e app EAS-compilável

## 📞 Suporte

Para questões sobre desenvolvimento, consulte o código ou abra uma issue no GitHub.
