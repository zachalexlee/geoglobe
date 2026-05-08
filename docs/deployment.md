# GeoGlobe Deployment Guide

## Required Environment Variables

All environments require the following variables to be set:

- **DATABASE_URL** — PostgreSQL connection string (e.g. `postgresql://user:pass@host:5432/geoglobe`)
- **NEXTAUTH_URL** — Full URL of your deployed app (e.g. `https://geoglobe.vercel.app`)
- **NEXTAUTH_SECRET** — Random secret string for NextAuth.js session encryption (generate with `openssl rand -base64 32`)
- **GOOGLE_CLIENT_ID** — Google OAuth client ID from Google Cloud Console
- **GOOGLE_CLIENT_SECRET** — Google OAuth client secret from Google Cloud Console
- **NEXT_PUBLIC_APP_URL** — Public-facing app URL (same as `NEXTAUTH_URL` in most cases)

---

## Deploying to Vercel

1. Visit [vercel.com](https://vercel.com) and sign in or create an account.
2. Click **Add New → Project** and import your GeoGlobe GitHub repository.
3. Vercel will auto-detect the Next.js framework. The `vercel.json` in the project root pre-configures the build command and security headers.
4. In the **Environment Variables** section, add all required variables listed above:
   - `DATABASE_URL`
   - `NEXTAUTH_URL` (set to your Vercel deployment URL, e.g. `https://geoglobe.vercel.app`)
   - `NEXTAUTH_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `NEXT_PUBLIC_APP_URL`
5. Click **Deploy**. Vercel will run `npm run build` and deploy automatically.

> **Tip:** After the first deploy, update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` with the final production URL if it differs from the preview URL.

---

## Deploying the Database to Railway

1. Visit [railway.app](https://railway.app) and sign in or create an account.
2. Create a **New Project** and add a **PostgreSQL** service from the service catalog.
3. Once provisioned, go to the PostgreSQL service → **Variables** tab and copy the `DATABASE_URL` connection string.
4. Paste that value as the `DATABASE_URL` environment variable in both Railway (for the app service) and Vercel (if hosting the app there).

### Deploying the App on Railway

1. In the same Railway project, add a **New Service → GitHub Repo** and select your GeoGlobe repository.
2. Railway will use the `railway.toml` in the project root to configure the build (`npm run build`) and start command (`npm start`).
3. Add all required environment variables in the service's **Variables** tab.
4. Railway will deploy the app and perform health checks at `/api/health`.

---

## Running Prisma Migrations in Production

After deploying (on either platform), run the following command to apply pending database migrations without resetting data:

```bash
npx prisma migrate deploy
```

For Railway, you can run this as a one-off command via the Railway CLI:

```bash
railway run npx prisma migrate deploy
```

For Vercel, use a **Vercel Build Step** or run it locally against the production `DATABASE_URL`:

```bash
DATABASE_URL="your-production-url" npx prisma migrate deploy
```

---

## Running the Seed Script

To populate the database with initial seed data, run:

```bash
npx prisma db seed
```

Or against production explicitly:

```bash
DATABASE_URL="your-production-url" npx prisma db seed
```

> **Warning:** Only run the seed script once on a fresh database, or ensure your seed script is idempotent (safe to run multiple times).

---

## Health Check

The app exposes a health check endpoint at `/api/health` which returns:

```json
{ "status": "ok", "timestamp": "2026-05-07T12:00:00.000Z" }
```

Railway uses this endpoint to verify the app is running before routing traffic.
