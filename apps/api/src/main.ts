import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { prisma } from '@core-hubble/prisma';
import { verifyToken, signToken, AuthUser } from '@core-hubble/auth';
import { API_BASE_URL, LeaderboardEntry } from '@core-hubble/utils';
import bcrypt from 'bcryptjs';

const app = express();
const port = process.env.PORT || 3000;

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/webp') {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG and WEBP images are allowed'));
    }
  }
});

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Auth Middleware
interface AuthRequest extends Request {
  userId?: string;
  role?: string;
}

const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies.get?.('jwt') || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const decoded = verifyToken(token);
  if (!decoded) return res.status(401).json({ error: 'Invalid token' });

  req.userId = decoded.userId;
  req.role = decoded.role;
  next();
};

const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
};

// --- Routes ---

// 1. Health Check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// 2. Auth
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  try {
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) return res.status(400).json({ error: 'Username already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, password: hashedPassword, role: 'user' }
    });

    const token = signToken({ userId: user.id, role: user.role });
    res.cookie('jwt', token, { httpOnly: true, secure: true, sameSite: 'none' });
    res.status(201).json({ user: { id: user.id, username: user.username, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signToken({ userId: user.id, role: user.role });
    res.cookie('jwt', token, { httpOnly: true, secure: true, sameSite: 'none' });
    res.json({ user: { id: user.id, username: user.username, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({ 
      where: { id: req.userId },
      select: { id: true, username: true, role: true }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('jwt', { httpOnly: true, secure: true, sameSite: 'none' });
  res.json({ message: 'Logged out successfully' });
});

// 3. Puzzles
app.get('/api/puzzles/:level', async (req, res) => {
  const { level } = req.params;
  try {
    const puzzles = await prisma.puzzle.findMany({ where: { level } });
    res.json(puzzles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch puzzles' });
  }
});

app.get('/api/puzzles/single/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const puzzle = await prisma.puzzle.findUnique({ where: { id } });
    if (!puzzle) return res.status(404).json({ error: 'Puzzle not found' });
    res.json(puzzle);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch puzzle' });
  }
});

// 4. Scores
app.post('/api/scores', authenticate, async (req: AuthRequest, res) => {
  const { puzzleId, score, level } = req.body;
  try {
    const newScore = await prisma.score.create({
      data: {
        userId: req.userId!,
        puzzleId,
        score: Number(score),
        level
      }
    });
    res.status(201).json(newScore);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save score' });
  }
});

app.get('/api/leaderboard/:level', async (req, res) => {
  const { level } = req.params;
  try {
    const rankings = await prisma.$queryRaw<any[]>`
      SELECT username, score, "completedAt" as "bestAt"
      FROM (
        SELECT u.username, s.score, s."completedAt",
               ROW_NUMBER() OVER(PARTITION BY s."userId" ORDER BY s.score DESC, s."completedAt" ASC) as rn
        FROM "User" u
        JOIN "Score" s ON u.id = s."userId"
        WHERE s.level = ${level}
      ) t
      WHERE rn = 1
      ORDER BY score DESC, "bestAt" ASC
      LIMIT 50
    `;
    
    const leaderboard: LeaderboardEntry[] = rankings.map((s, idx) => ({
        rank: idx + 1,
        username: s.username,
        score: Number(s.score)
    }));
    
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// 5. Admin
app.post('/api/admin/puzzles', authenticate, isAdmin, upload.single('image'), async (req: AuthRequest, res) => {
  const { level } = req.body;
  if (!req.file || !level) return res.status(400).json({ error: 'Image and level required' });

  try {
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    const puzzle = await prisma.puzzle.create({
      data: {
        imageUrl: base64Image,
        level,
        uploadedBy: req.userId!
      }
    });
    res.status(201).json(puzzle);
  } catch (error) {
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.listen(Number(port), '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});
