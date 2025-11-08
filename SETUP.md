# Setup Guide - Finanças a Dois

## Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/rafaelgarbinatto/finance.git
cd finance
pnpm install
```

### 2. Configure Environment Variables

Create `.env.local` file in `apps/web`:

```bash
cp .env.example apps/web/.env.local
```

Edit `apps/web/.env.local`:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"

# Email Configuration (Required for magic link auth)
EMAIL_SERVER="smtp://username:password@smtp.example.com:587"
EMAIL_FROM="noreply@yourdomain.com"
```

**Email Provider Options:**

For local development/testing, you can use:
- [Ethereal Email](https://ethereal.email/) - Creates fake email accounts for testing
- [Mailtrap](https://mailtrap.io/) - Email testing service
- Gmail SMTP (requires app password)

### 3. Setup Database

```bash
# Generate Prisma client
cd apps/web
pnpm prisma generate

# Run migrations
pnpm db:migrate

# Seed with example data
pnpm db:seed
```

This will create:
- Family: "Rafael + Nine"
- User: rafael@example.com (OWNER)
- 9 categories (3 income, 6 expense)
- 8 sample transactions for current month

### 4. Start Development

```bash
# From root directory
pnpm dev:web
```

Visit http://localhost:3000

## Mobile App Setup

The mobile app needs the web API to be running.

### 1. Configure API URL

Edit `apps/mobile/app.json` and set your local IP or use the environment variable:

```bash
export EXPO_PUBLIC_API_BASE_URL="http://YOUR_LOCAL_IP:3000"
```

Or modify `app.json`:
```json
"extra": {
  "apiBaseUrl": "http://192.168.1.100:3000"
}
```

### 2. Start Expo

```bash
pnpm dev:mobile
```

### 3. Test on Device/Emulator

- Install Expo Go app on your phone
- Scan QR code shown in terminal
- Or press 'a' for Android emulator, 'i' for iOS simulator

## Testing the Application

### 1. Authentication Flow

1. Go to http://localhost:3000
2. You'll be redirected to sign-in page
3. Enter any email address
4. Check your email inbox for magic link
5. Click the link to authenticate

### 2. Onboarding Flow (First-time users)

1. After authentication, if you don't have a family, you'll see the onboarding page
2. Optionally enter a family name
3. Click "Ativar Minha Conta"
4. This creates your family, categories, and sample transactions

### 3. Using Seeded Data

If you ran the seed script, you can login with:
- Email: rafael@example.com
- This user already has a family and sample data

## Database Management

```bash
# View database in Prisma Studio
pnpm db:studio

# Reset database
cd apps/web
rm dev.db
pnpm prisma migrate deploy
pnpm db:seed
```

## Project Structure

```
finance/
├── apps/
│   ├── web/                  # Next.js web application
│   │   ├── src/
│   │   │   ├── app/          # App Router pages
│   │   │   │   ├── api/      # API routes
│   │   │   │   ├── auth/     # Auth pages
│   │   │   │   ├── new/      # New transaction
│   │   │   │   ├── history/  # Transaction history
│   │   │   │   └── onboarding/
│   │   │   ├── lib/          # Utilities
│   │   │   └── components/   # React components
│   │   ├── prisma/           # Database schema & migrations
│   │   └── public/           # Static files & PWA
│   │
│   └── mobile/               # Expo mobile app
│       ├── src/
│       │   ├── screens/      # App screens
│       │   └── lib/          # API client & offline queue
│       └── App.tsx
│
├── packages/
│   └── shared/               # Shared package
│       └── src/
│           ├── schemas/      # Zod schemas
│           ├── types/        # TypeScript types
│           └── utils/        # Utility functions
│
└── package.json              # Root package
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/magic-link` - Request magic link
- `GET /api/v1/auth/callback` - Email callback handler
- `GET /api/v1/me` - Get current user

### Transactions
- `GET /api/v1/transactions` - List transactions (with pagination)
- `POST /api/v1/transactions` - Create transaction
- `GET /api/v1/transactions/:id` - Get transaction
- `PATCH /api/v1/transactions/:id` - Update transaction
- `DELETE /api/v1/transactions/:id` - Delete transaction

### Categories
- `GET /api/v1/categories` - List categories
- `POST /api/v1/categories` - Create category

### Dashboard
- `GET /api/v1/dashboard` - Get dashboard data (KPIs, top categories, recent transactions)

### Invites
- `GET /api/v1/invites` - List invites
- `POST /api/v1/invites` - Create invite (OWNER only)

### Onboarding
- `POST /api/v1/onboarding/activate` - Activate account with sample data

## Troubleshooting

### Email Not Sending

1. Check EMAIL_SERVER and EMAIL_FROM in .env.local
2. Test with Ethereal Email for development
3. For Gmail, enable 2FA and create an app password

### Database Issues

```bash
# Delete database and start fresh
cd apps/web
rm dev.db
pnpm prisma migrate deploy
pnpm db:seed
```

### Mobile App Can't Connect

1. Make sure web server is running
2. Use your local IP address, not localhost
3. Check firewall settings
4. Both devices must be on same network

### PWA Not Installing

1. PWA requires HTTPS in production
2. For localhost, Chrome allows PWA
3. Check manifest.webmanifest is served correctly
4. Ensure service worker is registered

## Production Deployment

### Web App

1. Set production environment variables
2. Change DATABASE_URL to production database (PostgreSQL recommended)
3. Update NEXTAUTH_URL to production domain
4. Configure production email service
5. Build and deploy:

```bash
pnpm build:web
```

### Mobile App

Build with EAS:

```bash
cd apps/mobile
npm install -g eas-cli
eas login
eas build --platform android
eas build --platform ios
```

## Next Steps

- Configure your email provider
- Customize family name and categories
- Invite family members (OWNER can create invites)
- Install as PWA on mobile devices
- Build mobile app with EAS

## Support

For issues or questions, please open an issue on GitHub.
