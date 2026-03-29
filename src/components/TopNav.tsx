import React from 'react';
import { useNavigate } from 'react-router-dom';

interface NavLinkProps {
  href?: string;
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

const NavLink = ({ href = '#', active, children, onClick }: NavLinkProps) => (
  <a
    href={href}
    onClick={onClick}
    className={`font-manrope text-sm tracking-tight transition-colors ${
      active
        ? 'text-green-400 border-b-2 border-green-400 pb-1'
        : 'text-neutral-400 hover:text-neutral-200'
    }`}
  >
    {children}
  </a>
);

interface TopNavProps {
  activeLink?: string;
}

const TopNav = ({ activeLink = 'play' }: TopNavProps) => {
  const navigate = useNavigate();
  return (
    <nav className="fixed top-0 w-full z-50 bg-neutral-900/80 backdrop-blur-xl flex justify-between items-center px-8 h-16 shadow-2xl shadow-black/50">
      <div
        className="text-2xl font-bold tracking-tighter text-green-400 italic font-headline cursor-pointer"
        onClick={() => navigate('/')}
      >
        Play Chess Online
      </div>
      <div className="hidden md:flex items-center gap-8">
        <NavLink active={activeLink === 'play'} onClick={() => navigate('/')}>Play</NavLink>
        <NavLink>Puzzles</NavLink>
        <NavLink>Learn</NavLink>
        <NavLink>Community</NavLink>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-neutral-800/50 rounded-lg transition-all active:scale-95 duration-200">
          <span className="material-symbols-outlined text-neutral-400">dark_mode</span>
        </button>
        <button className="p-2 hover:bg-neutral-800/50 rounded-lg transition-all active:scale-95 duration-200">
          <span className="material-symbols-outlined text-neutral-400">settings</span>
        </button>
        <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant/20">
          <img
            alt="User Profile Avatar"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqTu9TMdbDVCa-x9tmfmvqdpn_90pKZBTs713Re4wg66iYcj9nio7ySR5UQSY5Z6qdSeNOlQhbE8RAHwMmWtEOJP3gAn-eUcG6AM2qACJqfLLLG26x7b-vA_7A8TtrayCfgZDgsxoYCVP3tLUC6L21afhYKLUkDVeDoB_BSW7l5UmjlBYD1T2Bi6yxkKJlL41kMAwy33ZtU_jTDiDki33ihSJkItJSQJDo1j8dzRc45tGjct4C0k0UteO12bo16EqvMCfhV12hIkA"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </nav>
  );
};

export default TopNav;
