import React from 'react';

const MobileNav = () => (
  <div className="md:hidden fixed bottom-0 left-0 w-full bg-neutral-900/90 backdrop-blur-xl z-50 flex justify-around items-center h-20 px-4">
    {[
      { icon: 'home', label: 'Home', active: false },
      { icon: 'grid_view', label: 'Play', active: true, filled: true },
      { icon: 'extension', label: 'Puzzles', active: false },
      { icon: 'mail', label: 'Mail', active: false },
      { icon: 'account_circle', label: 'Profile', active: false },
    ].map((item) => (
      <button
        key={item.label}
        className={`flex flex-col items-center gap-1 active:scale-95 transition-all ${
          item.active ? 'text-green-400' : 'text-neutral-400 hover:text-green-400'
        }`}
      >
        <span
          className="material-symbols-outlined"
          style={item.filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
        >
          {item.icon}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
      </button>
    ))}
  </div>
);

export default MobileNav;
