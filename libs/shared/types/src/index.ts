export interface User {
  id: string;
  username: string;
  role: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Puzzle {
  id: string;
  imageUrl: string;
  level: string;
  uploadedBy: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Score {
  id: string;
  userId: string;
  puzzleId: string;
  score: number;
  level: string;
  completedAt: string | Date;
  user?: { username: string };
  puzzle?: Puzzle;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    role: string;
  };
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
}
