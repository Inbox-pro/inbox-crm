import React from 'react';

interface InboxLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textClassName?: string;
  crmBadge?: boolean;
}

export const InboxLogo: React.FC<InboxLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  textClassName = '',
  crmBadge = true,
}) => {
  const sizeStyles = {
    xs: { icon: 'w-7 h-7', text: 'text-sm', sub: 'text-[9px]', badge: 'text-[8px] px-1' },
    sm: { icon: 'w-8 h-8', text: 'text-base', sub: 'text-[10px]', badge: 'text-[9px] px-1.5' },
    md: { icon: 'w-10 h-10', text: 'text-lg', sub: 'text-xs', badge: 'text-[10px] px-1.5' },
    lg: { icon: 'w-12 h-12', text: 'text-2xl', sub: 'text-sm', badge: 'text-xs px-2' },
    xl: { icon: 'w-16 h-16', text: 'text-3xl', sub: 'text-base', badge: 'text-xs px-2.5' },
  }[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Exact Vector Envelope Graphic */}
      <div className={`relative shrink-0 ${sizeStyles.icon}`}>
        <svg
          viewBox="0 0 160 140"
          className="w-full h-full drop-shadow-xs overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* White Letter Paper */}
          <rect
            x="24"
            y="24"
            width="112"
            height="76"
            rx="5"
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth="2"
          />
          {/* Letter Text Lines */}
          <line x1="38" y1="44" x2="100" y2="44" stroke="#93C5FD" strokeWidth="3" strokeLinecap="round" />
          <line x1="38" y1="56" x2="120" y2="56" stroke="#93C5FD" strokeWidth="3" strokeLinecap="round" />
          <line x1="38" y1="68" x2="88" y2="68" stroke="#93C5FD" strokeWidth="3" strokeLinecap="round" />

          {/* Top Flap (Green) */}
          <polygon points="20,50 80,4 140,50" fill="#48A43F" />

          {/* Left Fold (Orange) */}
          <polygon points="16,48 80,94 16,134" fill="#D95328" />

          {/* Right Fold (Vibrant Blue) */}
          <polygon points="144,48 144,134 44,134 110,72" fill="#0084C7" />

          {/* Bottom Fold Accent */}
          <polygon points="16,134 44,134 80,94" fill="#BF360C" fillOpacity="0.12" />
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className={`flex flex-col leading-tight ${textClassName}`}>
          <div className="flex items-center gap-1.5">
            <span className={`font-bold tracking-tight text-slate-900 dark:text-white ${sizeStyles.text}`}>
              Inbox
            </span>
            {crmBadge && (
              <span className={`font-extrabold uppercase rounded-md bg-blue-600 text-white shadow-xs ${sizeStyles.badge}`}>
                CRM
              </span>
            )}
          </div>
          <div className="h-[1.5px] w-full bg-slate-300 dark:bg-slate-700 my-0.5" />
          <span className={`font-medium tracking-wide text-slate-600 dark:text-slate-400 ${sizeStyles.sub}`}>
            Infotech Pvt.Ltd.
          </span>
        </div>
      )}
    </div>
  );
};
