# 🚀 Production Setup Guide

## Step 1: Database Setup (PostgreSQL)

Choose either **Supabase** or **Neon** for free PostgreSQL hosting.

### Option A: Supabase (Recommended)
1. Go to https://supabase.com and sign up
2. Create new project
3. Copy the **PostgreSQL Connection String** from Project Settings → Database → Connection Pooler
4. Format: `postgresql://[user]:[password]@[host]:[port]/[database]`

### Option B: Neon
1. Go to https://neon.tech and sign up
2. Create new project
3. Copy the **Connection String** (it should look like above)

---

## Step 2: Configure Environment Variables

### Create `.env.local` in project root
```bash
# Database (from Step 1)
POSTGRES_PRISMA_URL="postgresql://user:password@host:port/database"

# Ably credentials (get from https://ably.com)
ABLY_API_KEY="your_api_key"
MASTER_PASSWORD="replace_with_strong_admin_password"

# Optional: API URL (for Vercel production)
NEXT_PUBLIC_API_URL="https://your-domain.vercel.app"
```

### Get Ably Key:
1. Go to https://ably.com and sign up (free tier available)
2. Create new app
3. Copy your API key (`appId.keyId:secret`)
4. Add to `.env.local`

---

## Step 3: Initialize Database

```bash
# Generate Prisma client
npx prisma generate

# Create database tables from schema
npx prisma migrate dev --name init

# (Optional) Seed with sample data
npx prisma db seed
```

---

## Step 4: Run Development Server

```bash
npm run dev
```

Open: http://localhost:3000

---

## Step 5: Test the Application

### Basic Test Flow:
1. **Create Quiz** - Click "Create Quiz" → Add title → Add 3+ questions → Publish
2. **Join Game** - Copy join code → Open in new tab → Enter code & name → Join
3. **Play** - Wait in lobby → Answer questions → See results

---

## Step 6: Deploy to Vercel

### Prerequisites:
- GitHub repository (already set up ✅)
- Vercel account (https://vercel.com)
- Database URL ready
- Ably API key ready

### Deployment Steps:

1. **Create Vercel Project**
   - Go to https://vercel.com/new
   - Select "Import Git Repository"
   - Choose your GitHub repo (quizzspace)
   - Click Import

2. **Configure Environment Variables**
   - In Vercel project settings → Environment Variables
   - Add all variables from `.env.local`:
     ```
     DATABASE_URL
       POSTGRES_PRISMA_URL
       ABLY_API_KEY
       MASTER_PASSWORD
     NEXT_PUBLIC_API_URL (optional)
     ```

3. **Deploy**
   - Vercel will automatically deploy on git push
   - Builds take ~2-3 minutes
   - Your URL: `https://quizzspace-{random}.vercel.app`

---

## Troubleshooting

### Database Connection Error
**Error:** `Error connecting to PostgreSQL`
- Check `DATABASE_URL` format is correct
- Check `POSTGRES_PRISMA_URL` format is correct
- Verify credentials and host are accessible
- Test connection: `npx prisma db execute --stdin < test.sql`

### Prisma Migration Error
**Error:** `P1001 Can't reach database`
- Ensure DATABASE_URL is set in `.env.local`
- Ensure POSTGRES_PRISMA_URL is set in `.env.local`
- Verify PostgreSQL server is running
- Check connection string format

### Realtime Not Connecting
**Error:** JavaScript console shows Ably connection error
- Verify `ABLY_API_KEY` in `.env.local`
- Check `/api/ably/auth` responds with a token request
- Enable JavaScript in browser

### Build Fails on Vercel
- Ensure build command is `prisma generate && next build`
- Ensure database migrations are applied before traffic cutover:
   ```bash
   npm run prisma:migrate:deploy
   ```

### Health Check Fails
**Error:** `/api/health` returns non-200
- Confirm `DATABASE_URL` is valid and database is reachable
- Verify required env vars are configured in Vercel

---

## Verification Checklist

- [ ] Database created and connection string obtained
- [ ] Ably app created and API key obtained
- [ ] `.env.local` file created with all variables
- [ ] `npm install` completed without errors
- [ ] `npx prisma generate` ran successfully
- [ ] `npx prisma migrate dev` completed
- [ ] `npm run dev` starts without errors
- [ ] http://localhost:3000 loads in browser
- [ ] `GET /api/health` returns `{ status: "ok" }`
- [ ] Can create quiz without errors
- [ ] Can join game with code
- [ ] Real-time updates work (leaderboard updates)
- [ ] GitHub repo is up to date
- [ ] Vercel deployment linked and configured

---

## Production Checklist Before Launch

- [ ] Test all quiz flows end-to-end
- [ ] Test with multiple players simultaneously
- [ ] Verify real-time updates work correctly
- [ ] Check accessibility (tab navigation, screen reader)
- [ ] Test error scenarios (invalid codes, network issues)
- [ ] Monitor Vercel logs for any errors
- [ ] Set up database backups
- [ ] Monitor Ably usage and costs
- [ ] Enable HTTPS (Vercel default)
- [ ] Configure custom domain (optional)

---

## Commands Reference

```bash
# Development
$env:NEXT_DISABLE_SWC=1; npm run dev

# Build
$env:NEXT_DISABLE_SWC=1; npm run build

# Database
npx prisma migrate dev --name <name>    # Create migration
npx prisma studio                       # Open database UI
npx prisma generate                     # Regenerate client

# Git
git status
git add .
git commit -m "message"
git push origin main
```
