import React from 'react';

const Loading = ({ message = 'Connecting to game' }: { message?: string }) => {
  return (
    <div className="bg-background text-on-background font-body min-h-screen flex flex-col overflow-hidden">
      {/* Main Canvas */}
      <main className="flex-grow flex flex-col items-center justify-center relative px-6">
        {/* Background Ambient Glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-secondary/5 rounded-full blur-[120px]" />
        </div>

        {/* Central Loading Cluster */}
        <div className="relative z-10 flex flex-col items-center max-w-lg w-full">
          {/* Strategic Loader */}
          <div className="relative mb-12 flex items-center justify-center">
            {/* Inner Glow */}
            <div className="absolute w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            {/* Rotating Chess Piece Icon */}
            <div className="animate-spin-slow p-8 rounded-full border border-outline-variant/20 bg-surface-container-low flex items-center justify-center shadow-2xl">
              <span className="material-symbols-outlined text-7xl text-primary" style={{ fontVariationSettings: "'wght' 200" }}>
                chess_pawn
              </span>
            </div>
            {/* Orbiting Elements */}
            <div className="absolute w-48 h-48 border border-outline-variant/10 rounded-full animate-[spin_10s_linear_infinite]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_#88d982]" />
            </div>
          </div>

          {/* Typography Content */}
          <div className="text-center space-y-4">
            <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tighter text-on-surface">
              {message}<span className="text-primary animate-bounce inline-block">...</span>
            </h1>
            <p className="font-body text-on-surface-variant text-lg max-w-xs mx-auto leading-relaxed">
              Establishing a secure link to the grandmaster's server. Your board is being prepared.
            </p>
          </div>

          {/* Status Indicator */}
          <div className="mt-12 glass-panel px-6 py-3 rounded-full border border-outline-variant/20 flex items-center gap-4">
            <div className="flex gap-1.5">
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-pulse [animation-delay:200ms]" />
              <div className="w-1.5 h-1.5 bg-primary/30 rounded-full animate-pulse [animation-delay:400ms]" />
            </div>
            <span className="font-label text-xs uppercase tracking-[0.2em] text-on-surface/60 font-semibold">
              The Silent Strategist v2.4
            </span>
          </div>
        </div>
      </main>

      {/* Progress Track */}
      <div className="fixed bottom-0 left-0 w-full h-1 bg-surface-container-lowest">
        <div className="h-full bg-gradient-to-r from-primary/20 via-primary to-primary/20 w-1/3 animate-[loading-bar_3s_infinite_ease-in-out]" />
      </div>

      {/* Decorative Corner Graphics */}
      <div className="fixed top-12 left-12 opacity-10 pointer-events-none hidden md:block">
        <div className="font-headline text-8xl font-black italic tracking-tighter text-outline">CHESS</div>
      </div>
      <div className="fixed bottom-12 right-12 opacity-10 pointer-events-none hidden md:block">
        <div className="font-headline text-8xl font-black italic tracking-tighter text-outline">ONLINE</div>
      </div>
    </div>
  );
};

export default Loading;
