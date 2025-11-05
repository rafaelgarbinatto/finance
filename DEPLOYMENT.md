# Deployment & Testing Guide

## Quick Start

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment
```bash
# Copy example env
cp .env.example apps/web/.env

# Edit apps/web/.env with your settings:
# - DATABASE_URL: SQLite file path (e.g., file:/absolute/path/to/dev.db)
# - NEXTAUTH_SECRET: Generate with: openssl rand -base64 32
# - EMAIL_SERVER: SMTP configuration for magic links
```

### 3. Initialize Database
```bash
cd apps/web
npx prisma db push
npx tsx prisma/seed.ts
```

### 4. Start Web App
```bash
# From root
pnpm dev

# Or from apps/web
npm run dev
```

Visit: http://localhost:3000

### 5. Start Mobile App (Optional)
```bash
# Configure API base URL in apps/mobile/app.json (extra.apiBaseUrl)
# Or set EXPO_PUBLIC_API_BASE_URL environment variable

# From root
pnpm dev:mobile

# Or from apps/mobile
npm start
```

## Verification Checklist

### Web App
- [ ] Homepage loads without errors
- [ ] Can navigate to /new (new transaction)
- [ ] Can navigate to /history
- [ ] Can navigate to /onboarding
- [ ] Dashboard shows KPIs (should show seeded data)
- [ ] PWA manifest is accessible at /manifest.webmanifest
- [ ] Service worker loads at /sw.js

### API Endpoints
Test with curl or Postman:

```bash
# Dashboard (requires authentication)
curl http://localhost:3000/api/v1/dashboard

# Categories
curl http://localhost:3000/api/v1/categories?kind=income

# Health check (if user is authenticated)
curl http://localhost:3000/api/v1/me
```

### Database
```bash
cd apps/web
sqlite3 dev.db "SELECT * FROM users;"
sqlite3 dev.db "SELECT * FROM categories LIMIT 5;"
sqlite3 dev.db "SELECT * FROM transactions LIMIT 5;"
```

## Production Deployment

### Web App (Vercel/Netlify)
1. Set environment variables in hosting platform
2. Add build command: `pnpm build --filter=web`
3. Set output directory: `apps/web/.next`
4. Configure DATABASE_URL to point to production SQLite or upgrade to PostgreSQL

### Mobile App (EAS)
```bash
cd apps/mobile
npx eas build --platform android
npx eas build --platform ios
```

## Troubleshooting

### Database Issues
- Ensure DATABASE_URL uses absolute path: `file:/full/path/to/dev.db`
- Re-initialize: `rm apps/web/dev.db && pnpm db:push && pnpm db:seed`

### Import Errors
- Shared package is copied to `apps/web/app/lib/shared`
- If imports fail, verify files exist in that directory

### Build Errors
- Clear Next.js cache: `rm -rf apps/web/.next`
- Reinstall deps: `rm -rf node_modules && pnpm install`

### Authentication
- Magic links require valid SMTP server
- For testing, check console for magic link tokens
- Or use a service like Mailtrap for development

## Known Limitations

1. **No Real Images**: Icon placeholders (.txt files) need to be replaced with actual PNG images
2. **No Email Testing**: Email provider needs to be configured for magic links to work
3. **SQLite in Production**: Consider upgrading to PostgreSQL for production
4. **No Telemetry**: Analytics and monitoring need to be added separately
5. **No Tests**: Automated tests were explicitly excluded from MVP scope

## Next Steps

1. Replace placeholder icons with real images (192x192, 512x512 for PWA)
2. Configure production email provider
3. Add error monitoring (e.g., Sentry)
4. Add analytics (e.g., Plausible, Umami)
5. Add automated tests
6. Implement real-time sync between users
7. Add data export/backup functionality
