import React from 'react';
import { useNavigate } from 'react-router-dom';

interface SideNavProps {
  activeItem?: string;
}

const SideNav = ({ activeItem = 'play' }: SideNavProps) => {
  const navigate = useNavigate();

  const items = [
    { id: 'home', icon: 'home', label: 'Home', action: () => navigate('/') },
    { id: 'play', icon: 'grid_view', label: 'Play', action: () => navigate('/') },
    { id: 'puzzles', icon: 'extension', label: 'Puzzles' },
    { id: 'messages', icon: 'mail', label: 'Messages' },
    { id: 'archive', icon: 'history', label: 'Archive' },
  ];

  const bottomItems = [
    { id: 'settings', icon: 'settings', label: 'Settings' },
    { id: 'help', icon: 'help', label: 'Help' },
  ];

  return (
    <aside className="hidden lg:flex flex-col py-6 h-screen w-64 fixed left-0 top-0 bg-neutral-900 z-40">
      <div className="px-6 mb-12 mt-20">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center overflow-hidden">
            <img
              alt="Grandmaster Profile"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBOfay0cNL9K_Rj5F-BL1iT7jjQ-BApNIZHYdDL6baDHfjN5JaYlkbuFBv53W2i2OaB__asEAbkNZbqL-mtJZMdzEqo8EtjhU5nVTbl7LbAtSaCJOVF1FIvQDrocDqyWvDFRAKY4E3Yo-184AcM3oF8qaEMczpQ3U3Od_04ooJOdO271DR4S7CTeEzQDwU1x8lYyMFl8Sleog3DXxsrRZPmwNLi4dOz3X-rbamtOEpZQFx7v-rBXTAUGPsSUhUasTtxg-wSSpTLGKI"
            />
          </div>
          <div>
            <h3 className="text-sm font-headline font-bold text-on-surface">The Silent Strategist</h3>
            <p className="text-xs text-primary font-semibold">Rating: 2450</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/')}
          className="w-full py-3 bg-signature-gradient text-on-primary rounded-xl font-headline font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity active:scale-[0.98]"
        >
          New Game
        </button>
      </div>

      <div className="flex flex-col flex-1 font-manrope font-semibold">
        {items.map((item) => (
          <a
            key={item.id}
            onClick={item.action}
            className={`flex items-center gap-4 px-4 py-3 rounded-xl mx-2 transition-all cursor-pointer ${
              activeItem === item.id
                ? 'bg-green-900/20 text-green-400'
                : 'text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800'
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            {item.label}
          </a>
        ))}
      </div>

      <div className="mt-auto px-2 space-y-1 font-manrope font-semibold">
        {bottomItems.map((item) => (
          <a
            key={item.id}
            className="flex items-center gap-4 px-4 py-3 text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800 rounded-xl mx-2 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            {item.label}
          </a>
        ))}
      </div>
    </aside>
  );
};

export default SideNav;
