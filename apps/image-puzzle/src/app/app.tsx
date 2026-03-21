import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Navbar from './components/Layout/Navbar';
import MainPage from './components/Layout/MainPage';
import UserDashboard from './components/Dashboard/UserDashboard';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import AdminDashboard from './components/Admin/AdminDashboard';
import Leaderboard from './components/Leaderboard/Leaderboard';
import LevelSelection from './components/Game/LevelSelection';
import PuzzlePlayer from './components/Game/PuzzlePlayer';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import '../styles.css';

export function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <DndProvider backend={HTML5Backend}>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            
            <Route path="/play/:id" element={
              <ProtectedRoute>
                <PuzzlePlayer />
              </ProtectedRoute>
            } />
            
            <Route path="/admin" element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </DndProvider>
      </div>
    </Router>
  );
}

export default App;
