import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const TahaLogoSvg: React.FC<LogoProps> = ({ className = "w-full h-auto", showText = true }) => {
  return (
    <svg
      viewBox="0 0 500 650"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Metallic Gold Gradient */}
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F5D061" />
          <stop offset="25%" stopColor="#E6A11D" />
          <stop offset="50%" stopColor="#FFF2A1" />
          <stop offset="75%" stopColor="#D48C11" />
          <stop offset="100%" stopColor="#9E6100" />
        </linearGradient>

        <linearGradient id="goldTextGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFE885" />
          <stop offset="30%" stopColor="#EBAA25" />
          <stop offset="70%" stopColor="#C9800B" />
          <stop offset="100%" stopColor="#8A5200" />
        </linearGradient>

        <filter id="goldGlow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#9E6100" floodOpacity="0.3" />
        </filter>
      </defs>

      <g filter="url(#goldGlow)" fill="url(#goldGrad)" stroke="url(#goldGrad)">
        {/* Horizontal Base Line */}
        <rect x="75" y="330" width="350" height="12" rx="3" />

        {/* Left Skyscraper (Smallest) */}
        <path
          d="M 105 170 L 175 125 L 175 330 L 105 330 Z"
          fill="none"
          strokeWidth="14"
          strokeLinejoin="round"
        />

        {/* Middle Skyscraper */}
        <path
          d="M 175 125 L 245 80 L 245 330 L 175 330 Z"
          fill="none"
          strokeWidth="14"
          strokeLinejoin="round"
        />

        {/* Right Skyscraper (Tallest) */}
        <path
          d="M 235 20 L 340 55 L 340 210 M 340 210 L 340 330"
          fill="none"
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* House in Front Bottom Right */}
        <path
          d="M 280 330 L 280 255 L 335 210 L 390 255 L 390 330 Z"
          fill="none"
          strokeWidth="14"
          strokeLinejoin="round"
        />

        {/* 4 Windows in House (2x2 grid) */}
        <rect x="318" y="292" width="16" height="16" rx="2" strokeWidth="2" />
        <rect x="340" y="292" width="16" height="16" rx="2" strokeWidth="2" />
        <rect x="318" y="312" width="16" height="16" rx="2" strokeWidth="2" />
        <rect x="340" y="312" width="16" height="16" rx="2" strokeWidth="2" />
      </g>

      {showText && (
        <g textAnchor="middle" fill="url(#goldTextGrad)" stroke="#8A5200" strokeWidth="0.8">
          {/* "مكتب" */}
          <text
            x="250"
            y="415"
            fontSize="42"
            fontWeight="bold"
            fontFamily="'Cairo', 'Traditional Arabic', sans-serif"
          >
            مكـتب
          </text>

          {/* "طه معاذ" */}
          <text
            x="250"
            y="525"
            fontSize="82"
            fontWeight="900"
            fontFamily="'Cairo', 'Traditional Arabic', sans-serif"
            letterSpacing="2"
          >
            طه معـاذ
          </text>

          {/* "للعقار والمقاولات" */}
          <text
            x="250"
            y="610"
            fontSize="48"
            fontWeight="bold"
            fontFamily="'Cairo', 'Traditional Arabic', sans-serif"
          >
            للعقار والمقاولات
          </text>
        </g>
      )}
    </svg>
  );
};
