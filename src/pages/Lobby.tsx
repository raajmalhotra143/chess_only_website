import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getPlayerId } from '../lib/utils';
import TopNav from '../components/TopNav';
import SideNav from '../components/SideNav';
import MobileNav from '../components/MobileNav';
import Footer from '../components/Footer';

const Lobby = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const playerId = getPlayerId();

  useEffect(() => {
    if (!roomCode) return;

    const fetchRoom = async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('room_code', roomCode)
        .single();

      if (error || !data) { navigate('/error'); return; }
      setRoom(data);
      setLoading(false);
      if (data.status === 'playing') navigate(`/room/${roomCode}`);
    };

    fetchRoom();

    const channel = supabase
      .channel(`lobby:${roomCode}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `room_code=eq.${roomCode}` }, (payload) => {
        setRoom(payload.new);
        if (payload.new.status === 'playing') navigate(`/room/${roomCode}`);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [roomCode, navigate]);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode || '');
    alert('Room code copied!');
  };

  const shareLink = () => {
    const url = `${window.location.origin}/room/${roomCode}`;
    navigator.clipboard.writeText(url);
    alert('Game link copied!');
  };

  const leaveRoom = () => {
    if (window.confirm('Leave this lobby?')) navigate('/');
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-on-surface font-headline font-bold">Connecting to Lobby...</p>
    </div>
  );

  const isHost = room?.player_white === playerId;
  const opponentJoined = !!room?.player_black;

  return (
    <div className="bg-background text-on-background font-body selection:bg-primary/30 antialiased min-h-screen overflow-x-hidden">
      <TopNav activeLink="play" />
      <SideNav activeItem="play" />

      {/* Main Content Area */}
      <main className="lg:pl-64 pt-16 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-12 flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
          {/* Lobby Heading */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tighter mb-4 text-on-surface">
              Multiplayer Lobby
            </h1>
            <p className="text-neutral-400 font-body text-lg max-w-lg mx-auto">
              Prepare your strategy. The world's quietest battlefield awaits.
            </p>
          </div>

          <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Room & Status Column */}
            <div className="lg:col-span-7 space-y-6">
              {/* Room Code Card */}
              <div className="bg-surface-container-low p-8 rounded-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-primary/10 transition-colors" />
                <label className="text-xs font-label uppercase tracking-widest text-outline mb-4 block">Room Access Code</label>
                <div className="flex items-center justify-between bg-surface-container-lowest p-6 rounded-lg border border-outline-variant/10">
                  <span className="text-5xl md:text-6xl font-headline font-black text-primary tracking-widest uppercase">{roomCode}</span>
                  <button
                    onClick={copyRoomCode}
                    className="flex items-center justify-center w-14 h-14 bg-surface-container-high rounded-lg hover:bg-surface-variant transition-all active:scale-90 text-on-surface shadow-lg"
                  >
                    <span className="material-symbols-outlined text-2xl">content_copy</span>
                  </button>
                </div>
                <div className="mt-8 flex flex-wrap gap-4">
                  <button
                    onClick={shareLink}
                    className="flex-1 min-w-[140px] py-4 bg-signature-gradient text-on-primary rounded-lg font-headline font-bold flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-primary/10 transition-all active:scale-95"
                  >
                    <span className="material-symbols-outlined">share</span> Share Link
                  </button>
                  <button
                    onClick={leaveRoom}
                    className="flex-1 min-w-[140px] py-4 glass-panel text-on-surface rounded-lg font-headline font-bold flex items-center justify-center gap-2 hover:bg-surface-variant transition-all active:scale-95"
                  >
                    <span className="material-symbols-outlined">close</span> Cancel
                  </button>
                </div>
              </div>

              {/* Status Display */}
              <div className="flex items-center gap-4 bg-surface-container-high/40 p-6 rounded-xl border-l-4 border-secondary shadow-sm">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary" />
                </div>
                <p className="text-secondary font-medium tracking-wide italic">
                  {opponentJoined ? 'Opponent has joined! Starting game...' : 'Waiting for opponent to join...'}
                </p>
              </div>
            </div>

            {/* Right: Players Column */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-surface-container-low rounded-xl p-6 h-full flex flex-col gap-6">
                <h2 className="font-headline font-bold text-lg text-on-surface-variant px-2">
                  Players ({opponentJoined ? '2' : '1'}/2)
                </h2>

                {/* Player 1 (Host) */}
                <div className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-lg border border-primary/20">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary">
                        <img
                          alt="Host Profile"
                          className="w-full h-full object-cover"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9qHGIHxipXJUt4Hr6zJPgEzankDuI59QZ9J7osejNDs5QD5JvY5CK_YO5HM_LsE2XNPQzNeB0pJfXp9Rbum547Dz9VkScrJeRKA452TIA4fWPvVaNTB4pyAFl2dqGLINxUR7qlfPJ7TqRAljEo1CtwueSKUWHd1fs9dOzaFvfUQrfzYuX0CFlsutkHgpbyyS8J6hPkCMD41-8JL9h2cwK0QfL5A928N0DN3PUNwVuvE4K2WOqztm-nNt8HPzrPsiVtQjfxJbwSYo"
                        />
                      </div>
                      <span className="absolute -bottom-1 -right-1 bg-primary text-on-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">Host</span>
                    </div>
                    <div>
                      <div className="font-headline font-bold text-on-surface">The Silent Strategist</div>
                      <div className="text-xs text-outline font-medium">Grandmaster • 2450 Elo</div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                </div>

                {/* Player 2 (Waiting or Joined) */}
                {opponentJoined ? (
                  <div className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-lg border border-secondary/20">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-secondary">
                        <img
                          alt="Opponent"
                          className="w-full h-full object-cover"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkCA7PJj0DImsXPYo6U8CVyTMzn9tirJMpGKYqUVkD9U4aySQyWWPI4QFnqM9fu1uLV8oNUghvM4lJjIM3YbH9pc50CEg-k4DnhLrCFAe8vW0-l7RvWsTZ-j5nmkRFh9PyNCnuWV0FOOU_OUhWFnnnNnHl6E9dFr2b3b4BS7FaGK9xLRnSAn1TVT1f6kP1nE6AvkOX1ISzkCdHMPBO_wPLwCZuzUpzWhdvfzj62Gc5Y4ccp4G_ifOSRQ8umCa_HDJVL-I9BGSUuAo"
                        />
                      </div>
                      <div>
                        <div className="font-headline font-bold text-on-surface">Challenger</div>
                        <div className="text-xs text-outline font-medium">Player 2 • Black</div>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-surface-container-high/50 border-2 border-dashed border-outline-variant/30 rounded-lg">
                    <div className="flex items-center gap-4 opacity-60">
                      <div className="w-14 h-14 rounded-full bg-surface-container-highest flex items-center justify-center border-2 border-dashed border-outline-variant">
                        <span className="material-symbols-outlined text-outline text-3xl">person_add</span>
                      </div>
                      <div>
                        <div className="font-headline font-bold text-on-surface italic">Waiting...</div>
                        <div className="text-xs text-outline font-medium italic">Empty Slot</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-auto pt-6 space-y-4">
                  <button
                    onClick={leaveRoom}
                    className="w-full py-4 text-error font-headline font-bold flex items-center justify-center gap-2 hover:bg-error-container/10 rounded-lg transition-all active:scale-95"
                  >
                    <span className="material-symbols-outlined">logout</span> Leave Room
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Promotional Footer Card */}
          <div className="w-full max-w-4xl mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface-container-low p-6 rounded-xl flex items-center gap-6 group hover:bg-surface-container-high transition-colors">
              <div className="w-16 h-16 rounded-lg bg-surface-container-lowest flex items-center justify-center text-secondary transition-transform group-hover:scale-110">
                <span className="material-symbols-outlined text-4xl">emoji_events</span>
              </div>
              <div>
                <h4 className="font-headline font-bold text-on-surface">Tournament Mode</h4>
                <p className="text-sm text-outline">Enable rated play for this lobby.</p>
              </div>
            </div>
            <div className="bg-surface-container-low p-6 rounded-xl flex items-center gap-6 group hover:bg-surface-container-high transition-colors">
              <div className="w-16 h-16 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary transition-transform group-hover:scale-110">
                <span className="material-symbols-outlined text-4xl">timer</span>
              </div>
              <div>
                <h4 className="font-headline font-bold text-on-surface">Time Control</h4>
                <p className="text-sm text-outline">10 min + 5 sec increment</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="lg:pl-64">
        <Footer />
      </div>

      <MobileNav />
    </div>
  );
};

export default Lobby;
