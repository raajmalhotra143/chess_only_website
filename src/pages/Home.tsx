import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { generateRoomCode, getPlayerId } from '../lib/utils';
import TopNav from '../components/TopNav';
import Footer from '../components/Footer';

const Home = () => {
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateGame = async () => {
    setLoading(true);
    const newRoomCode = generateRoomCode();
    const playerId = getPlayerId();
    try {
      const { error } = await supabase
        .from('rooms')
        .insert([{ room_code: newRoomCode, player_white: playerId, status: 'waiting', fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', history: [], white_time: 600, black_time: 600 }]);
      if (error) throw error;
      navigate(`/lobby/${newRoomCode}`);
    } catch (err) {
      console.error(err);
      alert('Failed to create game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGame = async () => {
    if (!roomCode || roomCode.length < 6) return;
    setLoading(true);
    try {
      const { data: room, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('room_code', roomCode.toUpperCase())
        .single();

      if (error || !room) {
        navigate('/error');
        return;
      }

      const playerId = getPlayerId();

      if (room.player_white === playerId || room.player_black === playerId) {
        navigate(room.status === 'waiting' ? `/lobby/${room.room_code}` : `/room/${room.room_code}`);
        return;
      }

      if (room.player_white && room.player_black) {
        navigate(`/room/${room.room_code}?spectate=true`);
        return;
      }

      if (!room.player_black) {
        const { error: updateError } = await supabase
          .from('rooms')
          .update({ player_black: playerId, status: 'playing' })
          .eq('id', room.id);
        if (updateError) throw updateError;
      }

      navigate(`/room/${room.room_code}`);
    } catch (err) {
      console.error(err);
      navigate('/error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-background font-body selection:bg-primary/30">
      <TopNav activeLink="play" />

      {/* Main Content Shell */}
      <main className="relative min-h-screen flex flex-col items-center justify-center pt-16 px-6 overflow-hidden">
        {/* Background Layer */}
        <div className="absolute inset-0 z-0 chess-bg-gradient" />
        <div className="absolute inset-0 z-0 opacity-20">
          <img
            alt="Minimalist Chess Board Background"
            className="w-full h-full object-cover grayscale blur-sm"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCd9zhgcSQQnCS7DeIAny2BKikx5BHI_r3slpJEyw0NODpxl95BDG5w1ywowdwfamq_khIaetuGXM87sl72oSxccaBgk65ib8hM_aeSopbhmjwyHHRF5xdw3AUgi18MC4WtibICoWNkh4f6kfrcBGun99VrPRJyM_Jdln5WiTXctU8LEVG27e-UVUUiCiID1gCUTO_DrEVmp7K8dXKcE9RwBImkaik3ffegTjpL6_jSPrjNED1j0cE0R9vOfbto3edAx-CXYTo47So"
          />
        </div>

        {/* Landing Content */}
        <div className="relative z-10 w-full max-w-4xl text-center space-y-12">
          {/* Hero Typography */}
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-headline font-extrabold tracking-tighter text-on-background">
              Play Chess Online
            </h1>
            <p className="text-xl md:text-2xl text-on-surface-variant font-light max-w-2xl mx-auto leading-relaxed">
              Play instantly with friends using a simple code.
            </p>
          </div>

          {/* Interaction Card */}
          <div className="glass-card p-8 md:p-12 rounded-xl shadow-2xl border border-outline-variant/10 max-w-lg mx-auto space-y-10">
            {/* Create Section */}
            <div className="space-y-6">
              <button
                onClick={handleCreateGame}
                disabled={loading}
                className="group relative w-full bg-gradient-to-br from-primary to-primary-container text-on-primary py-5 rounded-full font-headline font-bold text-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
                <span>{loading ? 'Creating...' : 'Create Game'}</span>
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="h-[1px] flex-1 bg-outline-variant/20" />
              <span className="text-sm uppercase tracking-widest text-outline font-bold">OR</span>
              <div className="h-[1px] flex-1 bg-outline-variant/20" />
            </div>

            {/* Join Section */}
            <div className="space-y-6 text-left">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-on-surface ml-1" htmlFor="room-code">
                  Room Code
                </label>
                <input
                  id="room-code"
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  placeholder="Enter Room Code"
                  className="w-full bg-surface-container-lowest border-none ring-1 ring-outline-variant/30 focus:ring-2 focus:ring-primary rounded-lg py-4 px-6 text-on-surface placeholder:text-neutral-600 transition-all outline-none text-center tracking-[0.5em] font-mono text-xl"
                />
              </div>
              <button
                onClick={handleJoinGame}
                disabled={loading || roomCode.length < 6}
                className="w-full bg-surface-variant/20 hover:bg-surface-variant/40 backdrop-blur-sm text-primary py-4 rounded-lg font-headline font-bold border border-primary/20 hover:border-primary/40 active:scale-95 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined">join_inner</span>
                <span>Join Game</span>
              </button>
            </div>
          </div>

          {/* Secondary Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
            <div className="bg-surface-container-low/40 backdrop-blur-md p-6 rounded-lg border border-outline-variant/5">
              <span className="material-symbols-outlined text-primary mb-3 block text-3xl">bolt</span>
              <h3 className="font-headline font-bold text-lg">Instant Play</h3>
              <p className="text-sm text-on-surface-variant mt-2">No accounts needed. Just generate a code and start the match.</p>
            </div>
            <div className="bg-surface-container-low/40 backdrop-blur-md p-6 rounded-lg border border-outline-variant/5">
              <span className="material-symbols-outlined text-secondary mb-3 block text-3xl">security</span>
              <h3 className="font-headline font-bold text-lg">Private Rooms</h3>
              <p className="text-sm text-on-surface-variant mt-2">Secure end-to-end game logic for competitive play.</p>
            </div>
            <div className="bg-surface-container-low/40 backdrop-blur-md p-6 rounded-lg border border-outline-variant/5">
              <span className="material-symbols-outlined text-tertiary mb-3 block text-3xl">leaderboard</span>
              <h3 className="font-headline font-bold text-lg">Elo Tracking</h3>
              <p className="text-sm text-on-surface-variant mt-2">Optional ranking system for "The Silent Strategist" edition.</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
