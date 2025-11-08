# Finanças a Dois 💰

Aplicativo de gestão financeira compartilhada, desenvolvido como um MVP completo com suporte a Web (PWA) e Mobile (Expo).

## 🚀 Funcionalidades

- **Autenticação via Magic Link**: Login sem senha usando email
- **Onboarding Automático**: Configuração inicial com dados de exemplo
- **Dashboard Completo**: KPIs, principais categorias e lançamentos recentes
- **Gestão de Transações**: Criar, visualizar, editar e excluir receitas e despesas
- **Histórico com Filtros**: Visualização completa de todas as transações
- **PWA**: Instalável como aplicativo nativo no navegador
- **Mobile Offline**: Suporte a operações offline com sincronização automática
- **RBAC**: Controle de acesso baseado em roles (OWNER/PARTNER)

## 📦 Estrutura do Monorepo

```
finance/
├── apps/
│   ├── web/          # Next.js 14 + App Router + PWA
│   └── mobile/       # Expo + React Navigation (a ser criado)
├── packages/
│   └── shared/       # Schemas Zod, tipos e utilitários
└── package.json      # Scripts do monorepo
```

## 🛠️ Tecnologias

### Web
- Next.js 14 (App Router)
- NextAuth.js (Email Provider)
- Prisma (SQLite)
- Tailwind CSS
- React Query
- Zod

### Mobile
- Expo
- React Navigation
- React Query
- AsyncStorage
- NetInfo

### Shared
- Zod (schemas e validações)
- TypeScript

## ⚙️ Setup Local

### Pré-requisitos

- Node.js >= 18
- pnpm >= 8

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/rafaelgarbinatto/finance.git
cd finance
```

2. Instale as dependências:
```bash
pnpm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example apps/web/.env.local
```

Edite `apps/web/.env.local` com suas configurações:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
EMAIL_SERVER="smtp://user:pass@smtp.example.com:587"
EMAIL_FROM="noreply@example.com"
```

4. Execute as migrações do banco de dados:
```bash
pnpm db:migrate
```

5. Popule o banco com dados de exemplo:
```bash
pnpm db:seed
```

6. Inicie o servidor de desenvolvimento:
```bash
pnpm dev:web
```

7. Acesse http://localhost:3000

## 🗄️ Banco de Dados

O projeto usa Prisma com SQLite para simplicidade no desenvolvimento. Para produção, pode-se usar PostgreSQL ou MySQL.

### Comandos Úteis

```bash
# Executar migrações
pnpm db:migrate

# Seed (popular com dados de exemplo)
pnpm db:seed

# Abrir Prisma Studio (visualizador de dados)
pnpm db:studio

# Gerar cliente Prisma
pnpm --filter web db:generate
```

### Dados de Seed

O seed cria:
- 1 família: "Rafael + Nine"
- 1 usuário OWNER: rafael@example.com
- 9 categorias: 3 receitas e 6 despesas
- 8 transações de exemplo para o mês atual

## 🔐 Autenticação

O app usa NextAuth.js com Email Provider (magic link). Para testar localmente:

1. Configure um servidor SMTP válido no `.env.local`
2. Ou use um serviço como [Ethereal Email](https://ethereal.email/) para testes
3. Faça login com qualquer email válido
4. Verifique a caixa de entrada para o link mágico

## 📱 Mobile App (Expo)

**Status**: A ser implementado

Para iniciar o app mobile:
```bash
pnpm dev:mobile
```

## 🌐 PWA

A aplicação web é um PWA completo:
- Instalável em dispositivos móveis e desktop
- Service Worker para cache de assets
- Network-first para APIs
- Funciona offline (leitura)

## 🏗️ Build

### Web

```bash
pnpm build:web
```

### Mobile

```bash
pnpm build:mobile
```

## 📝 Scripts Disponíveis

### Monorepo
- `pnpm dev` - Inicia todos os apps em modo dev
- `pnpm build` - Build de todos os apps
- `pnpm lint` - Lint em todos os packages

### Web
- `pnpm dev:web` - Inicia Next.js em modo dev
- `pnpm build:web` - Build do Next.js
- `pnpm db:migrate` - Executa migrations
- `pnpm db:seed` - Popula o banco
- `pnpm db:studio` - Abre Prisma Studio

### Mobile
- `pnpm dev:mobile` - Inicia Expo

## 🎯 Fluxo de Uso

1. **Login**: Use email para receber magic link
2. **Onboarding**: Configure sua família (primeira vez)
3. **Dashboard**: Visualize KPIs e transações recentes
4. **Novo Lançamento**: Botão + flutuante → formulário
5. **Histórico**: Visualize e filtre todas as transações

## 🔒 Controle de Acesso (RBAC)

- **OWNER**: Pode editar/deletar qualquer transação
- **PARTNER**: Pode editar/deletar apenas suas próprias transações

## 🤝 Contribuição

Este é um projeto MVP. Contribuições são bem-vindas!

## 📄 Licença

MIT

## 👨‍💻 Autor

Rafael Garbinatto
