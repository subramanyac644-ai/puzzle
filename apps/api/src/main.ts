import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import multer from 'multer';
import path from 'path';
import * as fs from 'fs';
import { AuthResponse, LeaderboardEntry } from '@core-hubble/shared/types';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

const app = express();
const port = process.env.PORT || 3333;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only JPG, PNG and WEBP images are allowed'));
  }
});

// Extend Express Request type
interface AuthRequest extends Request {
  userId?: string;
  role?: string;
}

// Middleware: Authenticate
const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Unauthorized: No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    req.userId = decoded.userId;
    req.role = decoded.role;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

// Middleware: Admin only
const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.role !== 'admin') return res.status(403).json({ error: 'Forbidden: Admin access required' });
  next();
};

// 1. Auth: Register
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: 'user',
      },
    });
    res.status(201).json({ message: 'User created successfully' });
  } catch (error: any) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Username already exists' });
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// 2. Auth: Login
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    const response: AuthResponse = { 
      token, 
      user: { id: user.id, username: user.username, role: user.role } 
    };
    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// 3. Admin: Upload Puzzle
app.post('/api/admin/puzzles', authenticate, isAdmin, upload.single('image'), async (req: AuthRequest, res) => {
  const { level } = req.body;
  if (!req.file || !level) return res.status(400).json({ error: 'Image file and level required' });

  try {
    const puzzle = await prisma.puzzle.create({
      data: {
        imageUrl: `/uploads/${req.file.filename}`,
        level,
        uploadedBy: req.userId!,
      },
    });
    res.status(201).json(puzzle);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload puzzle' });
  }
});

// 3a. Admin: List all puzzles
app.get('/api/admin/puzzles', authenticate, isAdmin, async (req: AuthRequest, res) => {
  try {
    const puzzles = await prisma.puzzle.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(puzzles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch puzzles' });
  }
});

// 3b. Admin: Delete puzzle
app.delete('/api/admin/puzzles/:id', authenticate, isAdmin, async (req: AuthRequest, res) => {
  const { id } = req.params;
  try {
    // 1. Get puzzle to check image path
    const puzzle = await prisma.puzzle.findUnique({ where: { id: id as string } });
    if (!puzzle) return res.status(404).json({ error: 'Puzzle not found' });

    // 2. If it's a local file, delete it from disk
    if (puzzle.imageUrl.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', puzzle.imageUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // 3. Delete from DB
    await prisma.score.deleteMany({ where: { puzzleId: id as string } }); // Related scores
    await prisma.puzzle.delete({ where: { id: id as string } });
    
    res.json({ message: 'Puzzle deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete puzzle' });
  }
});

// 3c. Admin: List all users
app.get('/api/admin/users', authenticate, isAdmin, async (req: AuthRequest, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// 3d. Admin: Delete user
app.delete('/api/admin/users/:id', authenticate, isAdmin, async (req: AuthRequest, res) => {
  const { id } = req.params as { id: string };
  
  if (id === req.userId) {
    return res.status(400).json({ error: 'You cannot delete your own admin account' });
  }

  try {
    // 1. Check if user exists
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // 1b. Check if user is an admin
    if (user.role === 'admin') {
      return res.status(400).json({ error: 'Admin accounts cannot be deleted' });
    }

    // 2. Delete related scores first
    await prisma.score.deleteMany({ where: { userId: id } });
    
    // 3. Delete user
    await prisma.user.delete({ where: { id } });
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// 4. Gameplay: Get Puzzles by Level
app.get('/api/puzzles/:level', async (req, res) => {
  const { level } = req.params;
  try {
    const puzzles = await prisma.puzzle.findMany({ where: { level } });
    res.json(puzzles);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch puzzles' });
  }
});

// 4a. Gameplay: Get Single Puzzle by ID
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

// 4b. Gameplay: User Upload Puzzle
app.post('/api/user/puzzles', authenticate, (req: AuthRequest, res, next) => {
  upload.single('image')(req, res, function (err) {
    if (err) {
      if (err.message === 'Only JPG, PNG and WEBP images are allowed') {
         return res.status(400).json({ error: 'Only JPG, PNG, and WEBP formats are allowed.' });
      }
      return res.status(400).json({ error: 'File upload error' });
    }
    next();
  });
}, async (req: AuthRequest, res) => {
  const { level } = req.body;
  if (!req.file || !level) return res.status(400).json({ error: 'Image file and level required' });

  try {
    const puzzle = await prisma.puzzle.create({
      data: {
        imageUrl: `/uploads/${req.file.filename}`,
        level,
        uploadedBy: req.userId!,
      },
    });
    res.status(201).json(puzzle);
  } catch (error) {
    console.error('User upload error:', error);
    res.status(500).json({ error: 'Failed to upload puzzle' });
  }
});

// 5. Scores: Submit Score
app.post('/api/scores', authenticate, async (req: AuthRequest, res) => {
  const { puzzleId, score, level } = req.body as { puzzleId: string; score: any; level: string };
  if (!puzzleId || score === undefined || !level) return res.status(400).json({ error: 'Puzzle ID, score, and level required' });

  try {
    const newScore = await prisma.score.create({
      data: {
        userId: req.userId as string,
        puzzleId: puzzleId,
        score: Number(score),
        level: level,
      },
    });
    res.status(201).json(newScore);
  } catch (error) {
    console.error('Submit score error:', error);
    res.status(500).json({ error: 'Failed to save score' });
  }
});

// 6. Leaderboard (Best Score per User)
app.get('/api/leaderboard/:level', async (req, res) => {
  const { level } = req.params;
  try {
    // Use a window function to get the single best score for each user at this level.
    // We sort by score DESC, then by completedAt ASC (first person to get the score wins ties).
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
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
