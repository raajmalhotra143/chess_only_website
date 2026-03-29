import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChess } from '../hooks/useChess';
import { ChessPiece, PieceColor, PieceType } from '../components/ChessPiece';

// ─── Board colours matching the reference image ────────────────────────────────
const LIGHT_SQ = '#ebecd0'; // soft cream light
const DARK_SQ  = '#779556'; // classic grass green dark
const SELECT_SQ      = '#f6f669cc';  // semi-yellow for selected
const LAST_MOVE_LIGHT = '#f4f6b6'; // lighter yellow highlight for cream sq
const LAST_MOVE_DARK  = '#b9ca43'; // yellow-green highlight for dark sq

const Game = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const { game, room, playerColor, loading, makeMove, resign, isMyTurn } = useChess(roomCode ?? '');

  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showResignConfirm, setShowResignConfirm] = useState(false);
  const movingRef = useRef(false);   // prevent double-click race

  // ── square click handler ──────────────────────────────────────────────────
  const handleSquareClick = async (sq: string) => {
    if (!playerColor || movingRef.current) return;

    // De-select
    if (selectedSquare === sq) {
      setSelectedSquare(null);
      return;
    }

    // Try to move if a piece is already selected
    if (selectedSquare) {
      const legalTargets = game
        .moves({ square: selectedSquare as any, verbose: true })
        .map((m: any) => m.to);

      if (legalTargets.includes(sq)) {
        movingRef.current = true;
        const ok = await makeMove({ from: selectedSquare, to: sq, promotion: 'q' });
        movingRef.current = false;

        if (ok) {
          setLastMove({ from: selectedSquare, to: sq });
          setSelectedSquare(null);
          return;
        }
      }
      // Clicked on own piece → re-select
      setSelectedSquare(null);
    }

    // Select if it's own piece on own turn
    const piece = game.get(sq as any);
    if (piece && piece.color === playerColor && isMyTurn) {
      setSelectedSquare(sq);
    }
  };

  // ── pre-compute legal moves for highlighting ──────────────────────────────
  const legalTargets: string[] = selectedSquare
    ? game.moves({ square: selectedSquare as any, verbose: true }).map((m: any) => m.to)
    : [];

  // ── render 64 board squares ───────────────────────────────────────────────
  const renderBoard = () => {
    const board = game.board();
    const rows = isFlipped ? [...board].reverse() : board;
    const cells: React.ReactNode[] = [];

    rows.forEach((row: any[], ri: number) => {
      const rank = isFlipped ? ri + 1 : 8 - ri;
      const rowPieces = isFlipped ? [...row].reverse() : row;

      rowPieces.forEach((piece: any, fi: number) => {
        const file = String.fromCharCode(97 + (isFlipped ? 7 - fi : fi));
        const sq = `${file}${rank}`;
        const isDark = (ri + fi) % 2 === 1;

        const isSelected    = selectedSquare === sq;
        const isLastFrom    = lastMove?.from === sq;
        const isLastTo      = lastMove?.to === sq;
        const isLegalTarget = legalTargets.includes(sq);

        // Determine square colour
        let bgColor: string;
        if (isSelected) {
          bgColor = SELECT_SQ;
        } else if (isLastFrom || isLastTo) {
          bgColor = isDark ? LAST_MOVE_DARK : LAST_MOVE_LIGHT;
        } else {
          bgColor = isDark ? DARK_SQ : LIGHT_SQ;
        }

        // Label colours (contrast against bg)
        const labelColor = isDark ? LIGHT_SQ : DARK_SQ;

        cells.push(
          <div
            key={sq}
            onClick={() => handleSquareClick(sq)}
            style={{ backgroundColor: bgColor }}
            className="relative flex items-center justify-center cursor-pointer select-none"
          >
            {/* Rank number on leftmost file */}
            {fi === 0 && (
              <span
                className="absolute top-0.5 left-1 text-[10px] font-bold z-10 leading-none pointer-events-none"
                style={{ color: labelColor }}
              >
                {rank}
              </span>
            )}
            {/* File letter on bottom rank */}
            {ri === 7 && (
              <span
                className="absolute bottom-0.5 right-1 text-[10px] font-bold z-10 leading-none pointer-events-none"
                style={{ color: labelColor }}
              >
                {file.toUpperCase()}
              </span>
            )}

            {/* Legal move indicator */}
            {isLegalTarget && !piece && (
              <div className="w-[33%] h-[33%] rounded-full pointer-events-none" style={{ backgroundColor: 'rgba(0,0,0,0.22)' }} />
            )}
            {isLegalTarget && piece && (
              <div
                className="absolute inset-0 rounded-sm pointer-events-none"
                style={{ boxShadow: 'inset 0 0 0 4px rgba(0,0,0,0.30)' }}
              />
            )}

            {/* Chess piece */}
            {piece && (
              <ChessPiece
                color={piece.color as PieceColor}
                type={piece.type as PieceType}
              />
            )}
          </div>
        );
      });
    });

    return cells;
  };

  // ── helpers ───────────────────────────────────────────────────────────────
  const formatTime = (t: number) =>
    `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;

  const history: string[] = room?.history ?? [];
  const movePairs = history.reduce((acc: string[][], m: string, i: number) => {
    if (i % 2 === 0) acc.push([m]);
    else acc[acc.length - 1].push(m);
    return acc;
  }, []);

  const opponentTime = playerColor === 'w' ? (room?.black_time ?? 0) : (room?.white_time ?? 0);
  const myTime       = playerColor === 'w' ? (room?.white_time ?? 0) : (room?.black_time ?? 0);

  const isGameOver = room?.status === 'finished';

  // ── Determine game result ─────────────────────────────────────────────────
  type ResultType = 'win' | 'lose' | 'draw';
  const getGameResult = (): { type: ResultType; reason: string } | null => {
    if (!isGameOver) return null;
    if (game.isCheckmate()) {
      // game.turn() is the color that is IN checkmate (the loser)
      const loserColor = game.turn();
      if (!playerColor) return { type: 'draw', reason: 'By Checkmate' };
      return {
        type: loserColor !== playerColor ? 'win' : 'lose',
        reason: 'By Checkmate',
      };
    }
    if (game.isStalemate())       return { type: 'draw', reason: 'By Stalemate' };
    if (game.isThreefoldRepetition()) return { type: 'draw', reason: 'By Repetition' };
    if (game.isInsufficientMaterial()) return { type: 'draw', reason: 'Insufficient Material' };
    if (game.isDraw())            return { type: 'draw', reason: 'By 50-Move Rule' };
    // Game ended by resignation or external finish
    return { type: 'lose', reason: 'By Resignation' };
  };
  const gameResult = getGameResult();

  // ── loading skeleton ──────────────────────────────────────────────────────
  if (loading || !room) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-on-surface font-headline font-bold text-lg">Loading Match...</p>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="bg-background text-on-background font-body min-h-screen flex flex-col selection:bg-primary selection:text-on-primary relative">

      {/* ─── GAME OVER MODAL OVERLAY ─────────────────────────────────────── */}
      {isGameOver && gameResult && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: 'rgba(13,13,13,0.78)', backdropFilter: 'blur(6px)' }}
        >
          {/* Ambient glows */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

          {/* Card */}
          <div
            className="relative z-10 w-full max-w-md rounded-xl border border-outline-variant/20 shadow-2xl p-8 md:p-12 text-center"
            style={{ background: 'rgba(42,42,42,0.90)', backdropFilter: 'blur(24px)' }}
          >
            {/* Badge icon */}
            <div className={`mb-6 inline-flex p-4 rounded-full ring-1 ${
              gameResult.type === 'win'
                ? 'bg-primary-container/20 text-primary ring-primary/30'
                : gameResult.type === 'lose'
                  ? 'bg-error-container/20 text-error ring-error/30'
                  : 'bg-secondary-container/20 text-secondary ring-secondary/30'
            }`}>
              <span
                className="material-symbols-outlined text-5xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {gameResult.type === 'win' ? 'emoji_events' : gameResult.type === 'lose' ? 'sentiment_dissatisfied' : 'handshake'}
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-headline text-6xl md:text-7xl font-black tracking-tighter text-on-surface mb-2">
              {gameResult.type === 'win' ? 'Victory' : gameResult.type === 'lose' ? 'Defeat' : 'Draw'}
            </h1>

            {/* Reason */}
            <div className="flex items-center justify-center gap-2 mb-10 text-neutral-400 font-semibold tracking-wider uppercase text-sm">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              {gameResult.reason}
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-3 mb-10">
              <div className="bg-surface-container-low p-4 rounded-lg flex flex-col items-center">
                <span className="text-xs text-neutral-500 uppercase font-bold mb-1">Moves</span>
                <span className="text-2xl font-bold font-headline text-on-surface">{history.length}</span>
              </div>
              <div className="bg-surface-container-low p-4 rounded-lg flex flex-col items-center">
                <span className="text-xs text-neutral-500 uppercase font-bold mb-1">My Time</span>
                <span className="text-2xl font-bold font-headline text-on-surface">{formatTime(myTime)}</span>
              </div>
              <div className="bg-surface-container-low p-4 rounded-lg flex flex-col items-center">
                <span className="text-xs text-neutral-500 uppercase font-bold mb-1">Color</span>
                <span className="text-2xl font-bold font-headline text-on-surface capitalize">
                  {playerColor === 'w' ? '♔ W' : playerColor === 'b' ? '♚ B' : '—'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4">
              <button
                onClick={() => navigate('/')}
                className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary py-4 rounded-xl font-headline font-extrabold text-lg shadow-lg shadow-primary/20 active:scale-95 transition-all"
              >
                Play Again
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => navigate('/')}
                  className="flex items-center justify-center gap-2 bg-surface-variant/20 hover:bg-surface-variant/40 border border-outline-variant/20 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-lg">home</span> Home
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center justify-center gap-2 bg-surface-variant/20 hover:bg-surface-variant/40 border border-outline-variant/20 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-lg">analytics</span> Review
                </button>
              </div>
            </div>

            {/* Opponent info */}
            <div className="mt-8 pt-6 border-t border-outline-variant/10 flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-3 opacity-70">
                <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-lg">
                  {gameResult.type === 'win' ? '🕹️' : '♟️'}
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-on-surface">Opponent</div>
                  <div className="text-[10px] text-neutral-500">
                    {gameResult.type === 'win' ? 'Lost' : gameResult.type === 'lose' ? 'Won' : 'Drew'}
                  </div>
                </div>
              </div>
              <div className="h-6 w-px bg-outline-variant/20" />
              <button
                onClick={() => navigate('/')}
                className="text-xs font-bold text-primary hover:underline underline-offset-4 flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-xs">replay</span> Rematch?
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── RESIGN CONFIRM MODAL ────────────────────────────────────────── */}
      {showResignConfirm && (
        <div
          className="fixed inset-0 z-[101] flex items-center justify-center p-4"
          style={{ background: 'rgba(13,13,13,0.70)', backdropFilter: 'blur(4px)' }}
        >
          <div
            className="relative z-10 w-full max-w-sm rounded-xl border border-outline-variant/20 shadow-2xl p-8 text-center"
            style={{ background: 'rgba(42,42,42,0.95)', backdropFilter: 'blur(24px)' }}
          >
            <span className="material-symbols-outlined text-4xl text-error mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>flag</span>
            <h2 className="font-headline font-bold text-xl text-on-surface mb-2">Resign Game?</h2>
            <p className="text-neutral-500 text-sm mb-8">This will end the game and count as a loss.</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowResignConfirm(false)}
                className="py-3 rounded-xl font-bold text-sm bg-surface-container-high hover:bg-surface-container-highest transition-all text-neutral-300"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowResignConfirm(false); resign(); }}
                className="py-3 rounded-xl font-bold text-sm bg-error/20 hover:bg-error/40 text-error transition-all border border-error/20"
              >
                Yes, Resign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Top Navigation ─────────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 bg-neutral-900/80 backdrop-blur-xl flex justify-between items-center px-8 h-16 shadow-2xl shadow-black/50">
        <span
          className="text-2xl font-bold tracking-tighter text-green-400 italic font-headline cursor-pointer"
          onClick={() => navigate('/')}
        >
          Play Chess Online
        </span>
        <div className="hidden md:flex gap-6 items-center">
          {['Play', 'Puzzles', 'Learn', 'Community'].map(l => (
            <a key={l} className="text-neutral-400 hover:text-neutral-200 transition-colors font-manrope text-sm" href="#">{l}</a>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-neutral-800/50 rounded-lg transition-all text-neutral-400">
            <span className="material-symbols-outlined">dark_mode</span>
          </button>
          <button className="p-2 hover:bg-neutral-800/50 rounded-lg transition-all text-neutral-400">
            <span className="material-symbols-outlined">settings</span>
          </button>
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <img alt="avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhCdQAS_iwj2-SDazqYyPGRPAWjXVH5lWauFG3gR-1mHnVZFt_htQB-jMsJIrsXsTqttRl_UmqpHS78rL071-NJ3EDRFE7vsdUjyL-WhVuJ6iE0pmLA7NUvB6p91p46-_42YwFsbZGZCDsWeG031ZIDMjXUgGaq1677uX3iChY-xEVNirFnbgQm2cDBkgOzs4vtM1FbA0olAHD7C8e3d_jzcR9RxU4CqR7KM2koDep9Ub1iBTMac6k2oJNKu86RA0O-fqgq4mAWdI" className="w-full h-full object-cover" />
          </div>
        </div>
      </nav>

      {/* ─── Side Navigation ────────────────────────────────────────────── */}
      <aside className="hidden lg:flex h-screen w-64 fixed left-0 top-0 bg-neutral-900 flex-col py-6 pt-24 z-40">
        <div className="px-6 mb-8">
          <div className="flex items-center gap-3 mb-6 p-3 bg-neutral-950 rounded-xl">
            <div className="w-10 h-10 rounded-lg overflow-hidden">
              <img alt="Profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-yhvzpb091JNxM-bw03rN5XWiQbg5JHlm697k77uxHSTbOoNsTL0sygc5cwSlzTHnMxzgfii-bvCcmS80atbffWiQb0lZooMGpiUxo9Oc2w3k1YtJCe0q6XOC-M1RoBxJ6qLIsoIqHEArQcyKcZFgXjUgz5AGm-_vmIzLwoPLT4ls66wMrCjUuEwIgipXXba0emVIT-okbKeeaqPNAjcwVRbffFZca4ZDy1Rni__Ht6NoG61rhg4Y4a4fXHFbhb5dfTGQY-1pXYU" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-green-400 font-black text-sm font-headline">The Silent Strategist</p>
              <p className="text-neutral-500 text-xs">Rating: 2450</p>
            </div>
          </div>
          <button onClick={() => navigate('/')} className="w-full py-3 px-4 signature-gradient text-on-primary font-bold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all">
            <span className="material-symbols-outlined">grid_view</span> New Game
          </button>
        </div>
        <div className="flex-grow space-y-1">
          {[
            { icon: 'home', label: 'Home', active: true, fn: () => navigate('/') },
            { icon: 'grid_view', label: 'Play' },
            { icon: 'extension', label: 'Puzzles' },
            { icon: 'mail', label: 'Messages' },
            { icon: 'history', label: 'Archive' },
          ].map(item => (
            <div key={item.label} onClick={item.fn} className={`flex items-center gap-4 px-4 py-3 mx-2 rounded-xl transition-all cursor-pointer ${item.active ? 'bg-green-900/20 text-green-400' : 'text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800'}`}>
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-manrope font-semibold">{item.label}</span>
            </div>
          ))}
        </div>
        <div className="px-2 mt-auto">
          {['settings', 'help'].map(icon => (
            <div key={icon} className="text-neutral-500 hover:text-neutral-200 px-4 py-3 hover:bg-neutral-800 rounded-xl transition-all cursor-pointer flex items-center gap-4">
              <span className="material-symbols-outlined">{icon}</span>
              <span className="font-manrope font-semibold capitalize">{icon}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* ─── Main Content ───────────────────────────────────────────────── */}
      <main className="flex-grow pt-20 pb-8 lg:ml-64 flex flex-col items-center justify-center px-4 lg:px-8">
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ── Chess board column ─────────────────────────────────────── */}
          <div className="lg:col-span-8 flex flex-col items-center gap-4">

            {/* Opponent card */}
            <div className="w-full flex justify-between items-center p-4 bg-surface-container-low rounded-xl border-l-4 border-transparent">
              <div className="flex items-center gap-4">
                <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-outline-variant/30">
                  <img alt="Opponent" className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkCA7PJj0DImsXPYo6U8CVyTMzn9tirJMpGKYqUVkD9U4aySQyWWPI4QFnqM9fu1uLV8oNUghvM4lJjIM3YbH9pc50CEg-k4DnhLrCFAe8vW0-l7RvWsTZ-j5nmkRFh9PyNCnuWV0FOOU_OUhWFnnnNnHl6E9dFr2b3b4BS7FaGK9xLRnSAn1TVT1f6kP1nE6AvkOX1ISzkCdHMPBO_wPLwCZuzUpzWhdvfzj62Gc5Y4ccp4G_ifOSRQ8umCa_HDJVL-I9BGSUuAo"
                  />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-surface-container-low" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-headline font-bold text-on-surface">Opponent</h3>
                    <span className="bg-primary-container/20 text-primary px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                      {playerColor === 'w' ? 'Black' : 'White'}
                    </span>
                  </div>
                  {!isMyTurn && !isGameOver && (
                    <p className="text-primary/70 text-xs mt-1 animate-pulse italic">Opponent is thinking...</p>
                  )}
                </div>
              </div>
              <div className="bg-surface-container-high px-5 py-3 rounded-xl font-headline font-black text-2xl tracking-tight text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-neutral-500 text-lg">timer</span>
                {formatTime(opponentTime)}
              </div>
            </div>

            {/* ── The Chess Board ──────────────────────────────────────── */}
            <div
              className="w-full aspect-square shadow-2xl rounded"
              style={{
                maxWidth: '600px',
                boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 0 3px #2a2a2a',
              }}
            >
              <div
                className="grid w-full h-full rounded overflow-hidden"
                style={{ gridTemplateColumns: 'repeat(8,1fr)', gridTemplateRows: 'repeat(8,1fr)' }}
              >
                {renderBoard()}
              </div>
            </div>

            {/* Your card */}
            <div className={`w-full flex justify-between items-center p-4 bg-surface-container-low rounded-xl border-l-4 shadow-lg ${isMyTurn && !isGameOver ? 'border-primary shadow-primary/5' : 'border-transparent'}`}>
              <div className="flex items-center gap-4">
                <div className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 ${isMyTurn ? 'border-primary/40' : 'border-outline-variant/20'}`}>
                  <img alt="You" className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhCdQAS_iwj2-SDazqYyPGRPAWjXVH5lWauFG3gR-1mHnVZFt_htQB-jMsJIrsXsTqttRl_UmqpHS78rL071-NJ3EDRFE7vsdUjyL-WhVuJ6iE0pmLA7NUvB6p91p46-_42YwFsbZGZCDsWeG031ZIDMjXUgGaq1677uX3iChY-xEVNirFnbgQm2cDBkgOzs4vtM1FbA0olAHD7C8e3d_jzcR9RxU4CqR7KM2koDep9Ub1iBTMac6k2oJNKu86RA0O-fqgq4mAWdI"
                  />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-surface-container-low" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-headline font-bold text-on-surface">The Silent Strategist</h3>
                    <div className="flex items-center gap-1 text-[10px] text-primary font-bold">
                      <span className="material-symbols-outlined scale-75">wifi</span>LIVE
                    </div>
                  </div>
                  <p className="text-neutral-500 text-sm font-label">
                    {playerColor === 'w' ? 'White' : playerColor === 'b' ? 'Black' : 'Spectator'} • Room: {roomCode}
                  </p>
                  <div className="mt-1.5 flex gap-2">
                    {['👍', '🔥', '👏'].map(e => (
                      <button key={e} className="w-6 h-6 flex items-center justify-center bg-neutral-800 rounded-md hover:bg-neutral-700 text-sm transition-colors">{e}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="signature-gradient px-5 py-3 rounded-xl font-headline font-black text-2xl tracking-tight text-on-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">timer</span>
                {formatTime(myTime)}
              </div>
            </div>

            {/* Turn / status banner */}
            {(() => {
              if (isGameOver) return (
                <div className="py-2 px-8 rounded-full font-headline font-bold text-sm tracking-widest uppercase border bg-error/10 text-error border-error/20">
                  Game Over
                </div>
              );
              if (room?.status === 'waiting') return (
                <div className="py-2 px-8 rounded-full font-headline font-bold text-sm tracking-widest uppercase border bg-surface-container text-neutral-500 border-transparent animate-pulse">
                  ⌛ Waiting for Opponent...
                </div>
              );
              if (isMyTurn) return (
                <div className="py-2 px-8 rounded-full font-headline font-bold text-sm tracking-widest uppercase border bg-primary/10 text-primary border-primary/20 animate-pulse">
                  ✦ Your Turn
                </div>
              );
              return (
                <div className="py-2 px-8 rounded-full font-headline font-bold text-sm tracking-widest uppercase border bg-surface-container text-neutral-500 border-transparent">
                  Opponent's Turn...
                </div>
              );
            })()}
          </div>

          {/* ── Right Sidebar ──────────────────────────────────────────── */}
          <div className="lg:col-span-4 flex flex-col gap-5">

            {/* Move History */}
            <div className="bg-surface-container-low rounded-xl flex flex-col overflow-hidden border border-outline-variant/10 shadow-xl" style={{ height: 480 }}>
              <div className="p-4 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container">
                <h4 className="font-headline font-bold text-sm uppercase tracking-widest text-neutral-400">Move History</h4>
                <div className="flex gap-1">
                  {['first_page', 'chevron_left', 'chevron_right', 'last_page'].map(icon => (
                    <button key={icon} className="p-1.5 hover:bg-surface-container-high rounded transition-all text-neutral-500">
                      <span className="material-symbols-outlined text-base">{icon}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-grow overflow-y-auto p-2">
                {movePairs.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-neutral-600 text-sm italic">No moves yet</div>
                ) : (
                  <div className="grid grid-cols-12 gap-y-0.5 text-sm font-label">
                    {movePairs.map((pair: string[], i: number) => (
                      <React.Fragment key={i}>
                        <div className="col-span-2 text-neutral-600 text-center py-1.5">{i + 1}.</div>
                        <div className={`col-span-5 py-1.5 px-2 rounded cursor-pointer transition-colors ${i === movePairs.length - 1 && history.length % 2 === 1 ? 'font-bold text-primary bg-primary/10 border-l-2 border-primary' : 'text-on-surface hover:bg-surface-container-highest'}`}>
                          {pair[0]}
                        </div>
                        <div className={`col-span-5 py-1.5 px-2 rounded cursor-pointer transition-colors ${i === movePairs.length - 1 && history.length % 2 === 0 && pair[1] ? 'font-bold text-primary bg-primary/10 border-l-2 border-primary' : 'text-on-surface hover:bg-surface-container-highest'} ${!pair[1] ? 'italic opacity-40' : ''}`}>
                          {pair[1] || '...'}
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>

              {/* Eval bar */}
              <div className="p-3 border-t border-outline-variant/10 bg-surface-container-lowest">
                <div className="flex items-center gap-3">
                  <div className="h-1 bg-primary rounded-full" style={{ width: '35%' }} />
                  <div className="h-1 bg-surface-container-highest flex-grow rounded-full" />
                  <span className="text-[10px] font-bold text-neutral-500">+0.42</span>
                </div>
              </div>
            </div>

            {/* Game Controls */}
            <div className="grid grid-cols-2 gap-3">
              <button
                disabled={!playerColor || isGameOver}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-surface-container-high hover:bg-surface-container-highest rounded-xl transition-all font-bold text-sm text-neutral-300 disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-lg">handshake</span> Offer Draw
              </button>
              <button
                onClick={() => setShowResignConfirm(true)}
                disabled={!playerColor}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-error-container/20 hover:bg-error-container/40 rounded-xl transition-all font-bold text-sm text-error disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-lg">flag</span> Resign
              </button>
              <button
                onClick={() => setIsFlipped(f => !f)}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-surface-container-high hover:bg-surface-container-highest rounded-xl transition-all font-bold text-sm text-neutral-300"
              >
                <span className="material-symbols-outlined text-lg">flip</span> Flip Board
              </button>
              <button className="flex items-center justify-center gap-2 py-3 px-4 bg-surface-container-high hover:bg-surface-container-highest rounded-xl transition-all font-bold text-sm text-neutral-300">
                <span className="material-symbols-outlined text-lg">volume_up</span> Sound
              </button>
            </div>

            {isGameOver && (
              <button
                onClick={() => navigate('/')}
                className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary py-4 rounded-xl font-headline font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all"
              >
                New Game
              </button>
            )}

            {/* Spectators */}
            <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/5">
              <div className="flex items-center justify-between mb-4">
                <h5 className="text-xs font-headline font-bold text-neutral-500 uppercase tracking-widest">Spectators</h5>
                <span className="bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded text-[10px]">1,248 online</span>
              </div>
              <div className="flex -space-x-2">
                {[
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuAFCzpqCFLvCE-DLFnJjwrdMRpaToo9v-63zphohzHOwiKdI3fZJ_fBL0N4GZFq872qYpg4grLUUUrLKScbMqfDAd5FXErTycamYQFJIA_c8sltLUULJIf7kafpdRFtDiyvj9LBX42_F7K95uRnbP-fKqJKBbGKoi9hGSSbdhMBi_LxEANY9KicRhUVnJi--_ml9vHql-EXFs7plPyUcXVJLrpwwP3LAbprA-rDC3U-VTYLqNFYkKRWwetxGzCjOSnee3rhcwGyNc0',
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuBWtbgpNq1Br5Gee94NyufSKCBsDEh7Vbl11liKB7kIk1Z-sv0Ps3AZOMbz1yS8-jKecDieBsnxzKLpZwbJ2GfzeOHViCWb9rCZvz9WiXVueOXLlJLDLeDkxuF6gubxKhnoIq5kpQ_gVjx85PDU24QYqJ_SExAaoKqZ1uX2Rnk7RZnOznLwAg0MQvYdWx_3nQzM3zCafJYL9QhGSJG0dTz2haVOmVhpHyIHdjDiLjEEOGYcufF4ugy99IKdKpYPMbdFRDqXAxJoEOs',
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuCThdjLb-j4EYH9zdyyuwNMOPixmxKTUztmTnZLN0U1YFt9GfaF8WPVlxR5lec9wNdFYKQ2mfiocjX3Oo1ToyxlVDB7a1dH6i8GVi5936GcDz64WSelZDxW9YFIEegfBZHHlHl0sH9okacwSFD8BO6uQ4Te5kVouVleMfvabsttT1KV9BCRObuimDbJXlfotjfgmK4SGbR6lyJOtk3W7LDnZTSqiiwBs6vOwNe8LMbxaY_kvVdeupmNpoVQyDYFL-9ZsJ-3xOXntEQ',
                ].map((src, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-surface-container-low overflow-hidden">
                    <img alt="Spectator" src={src} className="w-full h-full object-cover" />
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-surface-container-low bg-neutral-800 flex items-center justify-center text-[10px] text-neutral-400 font-bold">+1k</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ─── Footer ─────────────────────────────────────────────────────── */}
      <footer className="w-full py-10 px-8 bg-neutral-950 border-t border-neutral-800/30 flex flex-col md:flex-row justify-between items-center gap-4 lg:ml-64 lg:w-[calc(100%-16rem)]">
        <span className="font-inter text-xs uppercase tracking-widest text-neutral-600">
          © 2024 Play Chess Online · The Silent Strategist Edition
        </span>
        <div className="flex gap-6">
          {['About', 'GitHub', 'Terms', 'Support'].map(l => (
            <a key={l} href="#" className="text-neutral-600 hover:text-neutral-400 underline decoration-green-900 underline-offset-4 font-inter text-xs uppercase tracking-widest">{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
};

export default Game;
