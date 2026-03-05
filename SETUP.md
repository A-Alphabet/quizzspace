# QuizzSpace - Setup Instructions

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Copy `.env.example` to `.env.local` and fill in your values:
```bash
cp .env.example .env.local
```

**Required variables:**
- `DATABASE_URL`: PostgreSQL connection string (e.g., from Supabase or Neon)
- `ABLY_API_KEY`: Get this from [Ably](https://ably.com)

### 3. Set Up Database
```bash
# Generate Prisma client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init

# Optional: Seed database
npx prisma db seed
```

### 4. Run Development Server
```bash
# With SWC disabled (Windows workaround)
$env:NEXT_DISABLE_SWC=1; npm run dev

# Or on macOS/Linux:
NEXT_DISABLE_SWC=1 npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Build for Production
```bash
$env:NEXT_DISABLE_SWC=1; npm run build
```

## Deployment to Vercel

### Prerequisites
- GitHub repository linked
- PostgreSQL database created (Supabase/Neon recommended)
- Ably account with API key generated

### Steps
1. Push code to GitHub
2. Connect repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings:
   - `DATABASE_URL`
   - `ABLY_API_KEY`
4. Deploy

---

## Database Setup Options

### Using Supabase (Recommended)
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Copy PostgreSQL connection string to `DATABASE_URL`
4. Run migrations

### Using Neon
1. Create account at [neon.tech](https://neon.tech)
2. Create new database
3. Copy connection string to `DATABASE_URL`
4. Run migrations

---

## Troubleshooting

**Windows Build Issues:**
- Build failures with SWC? Use: `$env:NEXT_DISABLE_SWC=1; npm run build`

**Database Connection Errors:**
- Check `DATABASE_URL` format
- Verify PostgreSQL server is running
- Test with: `npx prisma db execute --stdin < <<'EOF'\nSELECT 1;\nEOF\n`

**Realtime Not Working:**
- Verify `ABLY_API_KEY` in `.env.local`
- Confirm `/api/ably/auth` returns a token request payload
- Browser console should show Ably connection logs

---

## Architecture

- **Frontend**: Next.js 14 App Router, React, TailwindCSS
- **Backend**: Next.js API Routes (serverless)
- **Database**: PostgreSQL with Prisma ORM
- **Real-time**: Ably pub/sub
- **Validation**: Zod schemas
- **Deployment**: Vercel

---

## API Endpoints

See [README.md](./README.md) for full API documentation.

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/quiz` | POST | Create quiz |
| `/api/quiz/[id]` | GET | Get quiz details |
| `/api/session` | POST | Create game session |
| `/api/session/[code]` | GET | Get session status |
| `/api/player` | POST | Join session |
| `/api/answer` | POST | Submit answer |
| `/api/session/control` | POST | Host controls (start/next) |
