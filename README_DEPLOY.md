# 🚀 Deployment Guide: Puzzle Game

Follow these steps to deploy your application to Render (Backend) and Vercel (Frontend).

## 1. Backend: Render.com
Your API is designed to work on Render with a PostgreSQL database.

### Environment Variables
Set these in the Render dashboard under **Settings > Environment Variables**:
- `DATABASE_URL`: Your PostgreSQL connection string.
- `JWT_SECRET`: A long, random string for security.
- `PORT`: Set to `3333` (or Render will provide one).

### Images
> [!NOTE]
> Images are stored as **Base64 strings** in your database. This means they will persist even if Render restarts or redeploys your service.

---

## 2. Frontend: Vercel.com
Your frontend is a **Next.js** application.

### Environment Variables
Set these in the Vercel dashboard:
- `JWT_SECRET`: Same as backend (required for Auth).
- `DATABASE_URL`: Your PostgreSQL connection string (required for server-side Prisma).

### Build & Output (Zero-Config)
I've added a `vercel.json` to the root, so you should be able to use:
- Framework Preset: **Next.js**
- Build Command: `npx nx build image-puzzle`
- Output Directory: `dist/apps/image-puzzle/.next`

---

## 3. Local Testing
Before you push to production, you can test the production-ready configuration locally:
1. Create a `.env` file in `apps/image-puzzle/` (or the root if using Vite globally).
2. Add `VITE_API_BASE_URL=http://localhost:3333`.
3. Run `npm run start` and verify it still works.

---

## 🔒 Security Toggles
In `apps/api/src/main.ts`, the CORS policy is currently open (`app.use(cors())`). For maximum security in production, you can update it to:
```typescript
app.use(cors({
  origin: 'https://your-vercel-app-url.vercel.app'
}));
```
