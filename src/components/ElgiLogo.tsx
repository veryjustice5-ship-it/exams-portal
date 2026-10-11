import React from 'react';

interface ElgiLogoProps {
  className?: string;
  variant?: 'full' | 'icon' | 'badge';
  showText?: boolean;
}

export const ElgiLogo: React.FC<ElgiLogoProps> = ({
  className = 'w-10 h-10',
  variant = 'icon',
  showText = false,
}) => {
  return (
    <div className={`flex items-center gap-2.5 ${showText ? '' : ''}`}>
      <div className={`relative overflow-hidden rounded-xl bg-white p-0.5 shadow-xs border border-amber-400/40 shrink-0 ${className}`}>
        <img
          src="/src/assets/images/elgi_institute_logo_1791722819865.jpg"
          alt="e-Learning GROUP INSTITUTE (ELGI)"
          className="w-full h-full object-contain"
          onError={(e) => {
            // High-fidelity SVG fallback if image cannot load
            const target = e.currentTarget;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent && !parent.querySelector('.svg-fallback')) {
              const svg = document.createElement('div');
              svg.className = 'svg-fallback w-full h-full flex flex-col items-center justify-center bg-blue-950 text-amber-400 font-extrabold text-xs';
              svg.innerHTML = 'ELGI';
              parent.appendChild(svg);
            }
          }}
        />
      </div>

      {showText && (
        <div className="leading-tight text-left">
          <span className="block text-sm font-extrabold tracking-tight text-white font-sans">
            e-Learning GROUP INSTITUTE
          </span>
          <span className="block text-[11px] font-semibold text-amber-300 font-mono tracking-wider">
            ELGI EXAMINATION PORTAL
          </span>
        </div>
      )}
    </div>
  );
};
