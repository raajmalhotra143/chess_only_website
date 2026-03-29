import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Lobby from './pages/Lobby';
import Game from './pages/Game';
import ErrorPage from './pages/Error';
import GameOver from './pages/GameOver';
import Loading from './pages/Loading';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lobby/:roomCode" element={<Lobby />} />
        <Route path="/room/:roomCode" element={<Game />} />
        <Route path="/error" element={<ErrorPage />} />
        <Route path="/game-over" element={<GameOver />} />
        <Route path="/loading" element={<Loading />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
