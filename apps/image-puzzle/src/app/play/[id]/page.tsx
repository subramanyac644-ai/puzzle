'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import PuzzlePlayer from '@/components/Game/PuzzlePlayer';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';

export default function PlayPage() {
  return (
    <ProtectedRoute>
      <PuzzlePlayerWrapper />
    </ProtectedRoute>
  );
}

function PuzzlePlayerWrapper() {
  const params = useParams();
  const id = params?.id as string;
  
  if (!id) return <div>Invalid Puzzle ID</div>;
  
  return <PuzzlePlayer />;
}
