# Quick Start Guide - Kanny Kanban Backend

Get the Kanny Kanban backend API running in under 5 minutes!

## Prerequisites

Make sure you have installed:
- **Node.js** (v18+): `node --version`
- **PostgreSQL** (v14+): `psql --version`
- **pnpm** (v8+): `pnpm --version`

If you don't have pnpm:
```bash
npm install -g pnpm
```

## Step 1: Install Dependencies

```bash
pnpm install
```

## Step 2: Set Up Database

### Option A: Use Default PostgreSQL

1. Create a database:
```bash
createdb kanny_kanban
```

2. The `.env` file is already configured with default credentials:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/kanny_kanban?schema=public"
```

### Option B: Custom Database

Edit `.env` and update the `DATABASE_URL` with your credentials.

## Step 3: Run Database Migrations

```bash
pnpm prisma:migrate
```

When prompted for migration name, enter: `init`

## Step 4: Seed Database (Optional)

```bash
pnpm prisma:seed
```

This creates a demo user and sample data:
- **Email**: demo@example.com
- **Password**: password123

## Step 5: Start the Server

```bash
pnpm dev
```

You should see:
```
🚀 Server running on http://localhost:5000
📝 Environment: development
🌐 CORS enabled for: http://localhost:3000
```

## Step 6: Test the API

### Check Health
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-08T..."
}
```

### Sign In (if you seeded)
```bash
curl -X POST http://localhost:5000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"password123"}'
```

You'll get a response with a token:
```json
{
  "user": {
    "id": 1,
    "email": "demo@example.com",
    "name": "Demo User",
    "createdAt": "..."
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Get User's Boards (use the token from above)
```bash
curl http://localhost:5000/api/boards \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🎉 You're Done!

The API is now running on `http://localhost:5000`

## Next Steps

1. **Explore API**: Check [README.md](README.md) for all endpoints
2. **Use Prisma Studio**: Run `pnpm prisma:studio` to view/edit data in a GUI
3. **Connect Frontend**: Point your frontend to `http://localhost:5000/api`
4. **Run Tests**: `pnpm test --coverage` (controllers, middleware, utilities)

## Troubleshooting

### "Database does not exist"
```bash
createdb kanny_kanban
```

### "Port 5000 already in use"
Change `PORT` in `.env` file

### "Cannot connect to database"
- Verify PostgreSQL is running: `pg_isready`
- Check your database credentials in `.env`

### "Prisma Client not generated"
```bash
pnpm prisma:generate
```

## Environment Variables

Default `.env` is already configured. Update these for production:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL="postgresql://user:password@host:5432/database"
JWT_SECRET=change-this-in-production
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

## Useful Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm prisma:studio` | Open database GUI |
| `pnpm prisma:migrate` | Create new migration |
| `pnpm test` | Run tests |

---

**Having issues?** Check the full [README.md](README.md) or [PROGRESS.md](PROGRESS.md)
