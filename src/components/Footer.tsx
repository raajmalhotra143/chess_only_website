import React from 'react';

const Footer = () => (
  <footer className="w-full py-12 px-8 bg-neutral-950 border-t border-neutral-800/30">
    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="font-inter text-xs uppercase tracking-widest text-neutral-600">
        © 2024 Play Chess Online. The Silent Strategist Edition.
      </div>
      <div className="flex gap-8">
        {['About', 'GitHub', 'Terms', 'Privacy', 'Support'].map((link) => (
          <a
            key={link}
            href="#"
            className="font-inter text-xs uppercase tracking-widest text-neutral-600 hover:text-neutral-400 underline decoration-green-900 underline-offset-4 opacity-80 hover:opacity-100 transition-all"
          >
            {link}
          </a>
        ))}
      </div>
    </div>
  </footer>
);

export default Footer;
