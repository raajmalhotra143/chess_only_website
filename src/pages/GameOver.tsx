import React from 'react';
import { useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav';
import SideNav from '../components/SideNav';
import Footer from '../components/Footer';

interface GameOverProps {
  result?: 'win' | 'lose' | 'draw';
  reason?: string;
  moves?: number;
  accuracy?: string;
  timeLeft?: string;
  opponentName?: string;
  opponentRating?: number;
  onPlayAgain?: () => void;
}

const GameOver = ({
  result = 'win',
  reason = 'BY Checkmate',
  moves = 34,
  accuracy = '92.4%',
  timeLeft = '2:14',
  opponentName = 'Garry_K',
  opponentRating = 2410,
  onPlayAgain,
}: GameOverProps) => {
  const navigate = useNavigate();

  const resultLabel = result === 'win' ? 'Win' : result === 'lose' ? 'Defeat' : 'Draw';
  const resultIcon = result === 'win' ? 'emoji_events' : result === 'lose' ? 'sentiment_dissatisfied' : 'handshake';
  const resultColor = result === 'win' ? 'text-primary' : result === 'lose' ? 'text-error' : 'text-secondary';

  // Background chess board (purely decorative)
  const boardCells = Array.from({ length: 64 }, (_, i) => {
    const row = Math.floor(i / 8);
    const col = i % 8;
    const isDark = (row + col) % 2 === 1;
    return <div key={i} className={isDark ? 'bg-surface-container-lowest' : 'bg-surface-bright'} />;
  });

  return (
    <div className="bg-background text-on-background font-body min-h-screen selection:bg-primary-container selection:text-on-primary-container">
      <TopNav activeLink="play" />
      <SideNav activeItem="play" />

      {/* Main Content Canvas */}
      <main className="lg:pl-64 pt-16 min-h-screen relative overflow-hidden flex items-center justify-center p-6 bg-surface">
        {/* Background Game Scene (Board Snapshot) */}
        <div className="absolute inset-0 opacity-20 pointer-events-none scale-110 blur-sm flex items-center justify-center">
          <div className="w-[600px] h-[600px] grid grid-cols-8 grid-rows-8 rounded-lg overflow-hidden border-4 border-surface-container-lowest">
            {boardCells}
          </div>
        </div>

        {/* Game Over Modal Content */}
        <div className="relative z-10 w-full max-w-xl">
          <div className="glass-card rounded-xl border border-outline-variant/20 shadow-2xl p-8 md:p-12 text-center">
            {/* Icon/Badge */}
            <div className={`mb-6 inline-flex p-4 rounded-full bg-primary-container/20 ${resultColor} ring-1 ring-primary/30`}>
              <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                {resultIcon}
              </span>
            </div>

            {/* Result Headline */}
            <h1 className="font-headline text-6xl md:text-8xl font-black tracking-tighter text-on-surface mb-2">
              {resultLabel}
            </h1>

            {/* Subtext/Reason */}
            <div className="flex items-center justify-center gap-2 mb-10 text-neutral-400 font-manrope font-semibold tracking-wider uppercase text-sm">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              {reason}
            </div>

            {/* Match Statistics Bento Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-12">
              <div className="bg-surface-container-low p-4 rounded-lg flex flex-col items-center">
                <span className="text-xs text-neutral-500 uppercase font-bold mb-1">Accuracy</span>
                <span className="text-2xl font-bold font-headline text-green-400">{accuracy}</span>
              </div>
              <div className="bg-surface-container-low p-4 rounded-lg flex flex-col items-center">
                <span className="text-xs text-neutral-500 uppercase font-bold mb-1">Moves</span>
                <span className="text-2xl font-bold font-headline text-on-surface">{moves}</span>
              </div>
              <div className="hidden md:flex bg-surface-container-low p-4 rounded-lg flex-col items-center">
                <span className="text-xs text-neutral-500 uppercase font-bold mb-1">Time Left</span>
                <span className="text-2xl font-bold font-headline text-on-surface">{timeLeft}</span>
              </div>
            </div>

            {/* Action Hierarchy */}
            <div className="flex flex-col gap-4">
              <button
                onClick={onPlayAgain || (() => navigate('/'))}
                className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary py-5 rounded-xl font-headline font-extrabold text-lg shadow-lg shadow-primary/20 active:scale-95 transition-all"
              >
                Play Again
              </button>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => navigate('/')}
                  className="flex items-center justify-center gap-2 bg-surface-variant/20 hover:bg-surface-variant/40 border border-outline-variant/20 py-4 rounded-xl font-semibold transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-lg">home</span> Back to Home
                </button>
                <button className="flex items-center justify-center gap-2 bg-surface-variant/20 hover:bg-surface-variant/40 border border-outline-variant/20 py-4 rounded-xl font-semibold transition-all active:scale-95">
                  <span className="material-symbols-outlined text-lg">analytics</span> Analysis
                </button>
              </div>
            </div>

            {/* Opponent Feedback */}
            <div className="mt-8 pt-8 border-t border-outline-variant/10 flex items-center justify-center gap-6">
              <div className="flex items-center gap-3 grayscale opacity-60">
                <img
                  alt="Opponent Profile"
                  className="w-8 h-8 rounded-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKQFfNFY78W4m0qZBt-Jp-5cXgCoMw5Ul2nZj7F9K4lJCN-rWZvwwfS9mJYVz35fuRcV6kGVcpqW83x3DkRFW3AxjNLK2Rpz4eVm5gZ2l55v02-d3JrOHWxpPCAEF27dUavXfY6qql0pUrmzcMQsv_-LvcstnOOVzmvpY8G98tIYPCIarWsj09AjRJViNqEkrYAPtHsDvb9XtJMAByRWDNlKvSJhRg7nm8vHPh1A0wahNDMsqYbqpf3xkV2ACTnoC3B4vhoWEDV3k"
                />
                <div className="text-left">
                  <div className="text-xs font-bold leading-tight">{opponentName}</div>
                  <div className="text-[10px] text-neutral-500">{opponentRating} • {result === 'win' ? 'Lost' : 'Won'}</div>
                </div>
              </div>
              <div className="h-6 w-px bg-outline-variant/20" />
              <button className="text-xs font-bold text-primary hover:underline underline-offset-4 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">person_add</span> Rematch?
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-neutral-950 w-full py-12 px-8 border-t border-neutral-800/30 flex flex-col md:flex-row justify-between items-center gap-6 z-50 relative lg:pl-72">
        <div className="font-inter text-xs uppercase tracking-widest text-neutral-600">
          © 2024 Play Chess Online. The Silent Strategist Edition.
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          {['About', 'GitHub', 'Terms', 'Privacy', 'Support'].map(l => (
            <a key={l} href="#" className="font-inter text-xs uppercase tracking-widest text-neutral-600 hover:text-neutral-400 opacity-80 hover:opacity-100 underline decoration-green-900 underline-offset-4">{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
};

export default GameOver;
