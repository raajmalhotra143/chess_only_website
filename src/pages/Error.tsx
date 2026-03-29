import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav';
import Footer from '../components/Footer';

interface ErrorPageProps {
  message?: string;
}

const ErrorPage = ({ message }: ErrorPageProps) => {
  const navigate = useNavigate();
  const [retryCode, setRetryCode] = useState('');

  const handleRetry = () => {
    if (retryCode.length >= 6) navigate(`/room/${retryCode.toUpperCase()}`);
  };

  return (
    <div className="bg-background text-on-background font-body min-h-screen flex flex-col">
      <TopNav />

      <main className="flex-grow flex items-center justify-center p-6 mt-16">
        {/* Error Canvas Container */}
        <div className="max-w-2xl w-full relative">
          {/* Background Ambient Glow */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-error/5 rounded-full blur-[120px]" />

          <div className="glass-panel rounded-xl p-8 md:p-12 text-center border border-outline-variant/10 shadow-2xl">
            {/* Iconic Warning Section */}
            <div className="mb-8 inline-flex items-center justify-center w-20 h-20 rounded-full bg-surface-container-lowest text-error border border-error/20">
              <span className="material-symbols-outlined text-4xl">block</span>
            </div>

            <h1 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-on-surface">
              {message || 'Invalid or full room code'}
            </h1>
            <p className="text-on-surface-variant text-lg max-w-md mx-auto mb-10 leading-relaxed">
              The strategist was unable to locate your match. The room may be at maximum capacity or the code was entered incorrectly.
            </p>

            {/* Input Interaction */}
            <div className="max-w-sm mx-auto mb-8">
              <label className="block text-left text-xs font-label uppercase tracking-widest text-outline mb-2 ml-1">
                Retry Room Code
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={retryCode}
                  onChange={(e) => setRetryCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  placeholder="e.g. AB12CD"
                  className="w-full bg-surface-container-lowest border-none rounded-lg py-4 px-6 text-xl font-headline font-bold text-center tracking-[0.2em] focus:ring-2 focus:ring-primary/50 transition-all outline-none placeholder:text-surface-variant placeholder:tracking-normal"
                />
                <div className="absolute inset-0 rounded-lg pointer-events-none border border-outline-variant/20 group-hover:border-outline-variant/40 transition-colors" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleRetry}
                className="signature-gradient text-on-primary font-headline font-bold px-8 py-4 rounded-full w-full md:w-auto min-w-[180px] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/')}
                className="bg-surface-variant/30 text-on-surface-variant font-headline font-bold px-8 py-4 rounded-full w-full md:w-auto min-w-[180px] hover:bg-surface-variant/50 active:scale-95 transition-all"
              >
                Back to Home
              </button>
            </div>

            {/* Tactical Hint */}
            <div className="mt-12 pt-8 border-t border-outline-variant/10 flex items-center justify-center gap-3 text-sm text-outline">
              <span className="material-symbols-outlined text-sm">info</span>
              <span>Check with the host to ensure the code hasn't expired.</span>
            </div>
          </div>

          {/* Asymmetric Decorative Element */}
          <div className="hidden lg:block absolute -right-32 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
            <span className="material-symbols-outlined" style={{ fontSize: '200px' }}>chess</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ErrorPage;
