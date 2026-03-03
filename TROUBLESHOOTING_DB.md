# 🔧 Database Connection Troubleshooting

## Current Status
✅ `.env.local` is properly configured with SSL mode  
✅ Prisma can read the environment variable  
❌ **Supabase database is unreachable**

---

## Error: Can't reach database server

Your connection string is:
```
postgresql://postgres:0b4xhM80KdK21uyd@db.swcgjctjbjyjtiinaven.supabase.co:5432/postgres?sslmode=require
```

This means Supabase isn't responding at that address. Here's how to fix:

### Option 1: Check if Supabase Project is Active

1. Go to https://app.supabase.com/projects
2. Look for your project (db.swcgjctjbjyjtiinaven...)
3. Check if it says "PAUSED" - Free tier pauses after 1 week of inactivity
4. If paused, click **Resume** button
5. Wait 30 seconds for it to fully restart
6. Try migration again

### Option 2: Get Fresh Connection String

If the project is active but still failing:

1. Go to https://app.supabase.com → Your Project
2. Click **Settings** → **Database** → **Connection Pooler**
3. Select **Session mode** (not Transaction mode)
4. Copy the entire connection string
5. **IMPORTANT:** Change `[YOUR-PASSWORD]` to your actual database password
6. Update `.env.local` with the new string
7. Try again

**Format should be:**
```
postgresql://postgres:[PASSWORD]@[HOST]:6543/postgres?sslmode=require
```

### Option 3: Create New Supabase Project

If the old project is broken:

1. Go to https://app.supabase.com
2. Click **New Project**
3. Give it a name and strong password
4. Create project (wait 2-3 minutes)
5. Go to **Settings** → **Database** → **Connection Pooler**
6. Copy the Session mode connection string
7. Update `.env.local` with the new URL
8. Try again

---

## Quick Diagnostic

Run this to test the connection:

```bash
# Set environment variable (using PowerShell)
$env:DATABASE_URL="your_connection_string_here"

# Test if Prisma can reach database
npx prisma db execute --stdin
# Then type: SELECT 1;
# Press Ctrl+D to exit
```

If it connects, you'll see: `Result: 1`

---

## Common Issues

### "Port 5432" error
- Supabase uses port **6543** for connection pooler
- Make sure your URL has `:6543` not `:5432`
- Or use Session mode connection string

### "Connection refused"
- Firewall/network is blocking Supabase
- Try from a different network (hotspot, etc.)
- If still blocked, contact your network admin

### "Invalid password"
- Double-check the password in connection string
- Make sure special characters aren't escaped
- Go to Supabase dashboard and reset password if needed

### "No database called 'postgres'"
- Supabase creates 'postgres' by default
- Check your project actually created a database
- Try creating a new project

---

## Next Steps

1. ✅ Check if Supabase project is paused/active
2. ✅ Get fresh connection string from Supabase
3. ✅ Update DATABASE_URL in `.env.local`
4. ✅ Run: `$env:DATABASE_URL='...'; npx prisma migrate dev --name init`

If that still doesn't work, try our local SQLite fallback (see below).

---

## Alternative: Use SQLite for Development

If Supabase continues to fail, use SQLite locally:

1. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

2. Update `.env.local`:
```
DATABASE_URL="file:./dev.db"
```

3. Run migration:
```bash
npx prisma migrate dev --name init
```

**Note:** SQLite only works locally. For Vercel deployment, you'll need PostgSQL.

---

## Need Help?

- Supabase Docs: https://supabase.com/docs/guides/database/setup
- Prisma Connection Help: https://www.prisma.io/docs/orm/overview/databases/postgresql
- Contact Supabase Support: https://app.supabase.com/support (in-app)
