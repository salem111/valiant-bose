const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'public', 'assets', 'icons', '3d');
fs.mkdirSync(dir, { recursive: true });

// 1. 3D Crown Icon
const crownSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="goldGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="20%" stop-color="#fef08a"/>
      <stop offset="50%" stop-color="#f59e0b"/>
      <stop offset="80%" stop-color="#b45309"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
    <linearGradient id="rubyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff75c3"/>
      <stop offset="50%" stop-color="#e11d48"/>
      <stop offset="100%" stop-color="#881337"/>
    </linearGradient>
    <linearGradient id="diamondGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="40%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <circle cx="60" cy="60" r="50" fill="url(#bgGlow)"/>
  <path d="M20 75 Q60 88 100 75 L95 86 Q60 98 25 86 Z" fill="url(#goldGrad1)" filter="url(#glow)"/>
  <path d="M22 75 L30 42 L48 62 L60 22 L72 62 L90 42 L98 75 Q60 88 22 75 Z" fill="url(#goldGrad1)"/>
  <path d="M60 28 L68 58 L72 62 L60 22 Z" fill="#ffffff" opacity="0.6"/>
  <polygon points="60,18 66,24 60,30 54,24" fill="url(#rubyGrad)" filter="url(#glow)"/>
  <circle cx="60" cy="24" r="2" fill="#ffffff"/>
  <circle cx="30" cy="42" r="5" fill="url(#diamondGrad)"/>
  <circle cx="90" cy="42" r="5" fill="url(#diamondGrad)"/>
  <path d="M60 62 L68 70 L60 78 L52 70 Z" fill="url(#rubyGrad)" filter="url(#glow)"/>
  <circle cx="60" cy="70" r="2" fill="#ffffff"/>
  <circle cx="38" cy="82" r="2.5" fill="#fef08a"/>
  <circle cx="60" cy="86" r="3" fill="#fef08a"/>
  <circle cx="82" cy="82" r="2.5" fill="#fef08a"/>
</svg>`;
fs.writeFileSync(path.join(dir, 'crown_3d.svg'), crownSvg);

// 2. 3D Gamepad Icon
const gamesSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <radialGradient id="gameGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#a855f7"/>
      <stop offset="40%" stop-color="#6b21a8"/>
      <stop offset="100%" stop-color="#2e1065"/>
    </linearGradient>
    <linearGradient id="neonCyan" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#67e8f9"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>
    <linearGradient id="neonPink" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f472b6"/>
      <stop offset="100%" stop-color="#db2777"/>
    </linearGradient>
    <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <circle cx="60" cy="60" r="50" fill="url(#gameGlow)"/>
  <path d="M32 38 C42 38 48 46 60 46 C72 46 78 38 88 38 C104 38 110 54 106 82 C104 94 92 94 82 84 L72 74 C66 70 54 70 48 74 L38 84 C28 94 16 94 14 82 C10 54 16 38 32 38 Z" fill="url(#bodyGrad)" stroke="#c084fc" stroke-width="1.5" filter="url(#neonGlow)"/>
  <path d="M34 42 C44 42 50 48 60 48 C70 48 76 42 86 42 C94 42 98 48 100 58 C80 50 40 50 20 58 C22 48 26 42 34 42 Z" fill="#ffffff" opacity="0.2"/>
  <path d="M35 52 H41 V58 H47 V64 H41 V70 H35 V64 H29 V58 H35 Z" fill="url(#neonCyan)" filter="url(#neonGlow)"/>
  <circle cx="85" cy="52" r="3.5" fill="url(#neonPink)" filter="url(#neonGlow)"/>
  <circle cx="93" cy="60" r="3.5" fill="#38bdf8" filter="url(#neonGlow)"/>
  <circle cx="85" cy="68" r="3.5" fill="#4ade80" filter="url(#neonGlow)"/>
  <circle cx="77" cy="60" r="3.5" fill="#fbbf24" filter="url(#neonGlow)"/>
  <circle cx="48" cy="74" r="6" fill="#1e1b4b" stroke="#a855f7" stroke-width="1"/>
  <circle cx="72" cy="74" r="6" fill="#1e1b4b" stroke="#a855f7" stroke-width="1"/>
</svg>`;
fs.writeFileSync(path.join(dir, 'games_3d.svg'), gamesSvg);

// 3. 3D Moments / Camera Icon
const momentsSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <radialGradient id="momGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ec4899" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#ec4899" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="camGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f43f5e"/>
      <stop offset="40%" stop-color="#be123c"/>
      <stop offset="100%" stop-color="#4c0519"/>
    </linearGradient>
    <linearGradient id="lensGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="40%" stop-color="#6366f1"/>
      <stop offset="80%" stop-color="#a855f7"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <filter id="camGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <circle cx="60" cy="60" r="50" fill="url(#momGlow)"/>
  <rect x="22" y="36" width="76" height="52" rx="16" fill="url(#camGrad)" stroke="#fb7185" stroke-width="1.5" filter="url(#camGlow)"/>
  <path d="M42 36 L48 26 H72 L78 36 Z" fill="url(#camGrad)" stroke="#fb7185" stroke-width="1"/>
  <circle cx="60" cy="62" r="20" fill="#1e1b4b" stroke="#f59e0b" stroke-width="2.5" filter="url(#camGlow)"/>
  <circle cx="60" cy="62" r="16" fill="url(#lensGrad)"/>
  <ellipse cx="55" cy="56" rx="6" ry="3" fill="#ffffff" opacity="0.6" transform="rotate(-30 55 56)"/>
  <circle cx="84" cy="46" r="4" fill="#fef08a" filter="url(#camGlow)"/>
  <circle cx="84" cy="46" r="1.5" fill="#ffffff"/>
  <polygon points="20,24 23,30 20,36 17,30" fill="#fbbf24" filter="url(#camGlow)"/>
  <polygon points="98,28 100,32 98,36 96,32" fill="#f472b6" filter="url(#camGlow)"/>
</svg>`;
fs.writeFileSync(path.join(dir, 'moments_3d.svg'), momentsSvg);

// 4. 3D Trophy Icon
const trophySvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <radialGradient id="tropGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="tropGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="20%" stop-color="#fef08a"/>
      <stop offset="50%" stop-color="#f59e0b"/>
      <stop offset="80%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
    <filter id="tropFilter" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <circle cx="60" cy="60" r="50" fill="url(#tropGlow)"/>
  <path d="M34 32 C18 32 18 56 38 60" fill="none" stroke="url(#tropGold)" stroke-width="4" stroke-linecap="round"/>
  <path d="M86 32 C102 32 102 56 82 60" fill="none" stroke="url(#tropGold)" stroke-width="4" stroke-linecap="round"/>
  <path d="M32 26 H88 V46 C88 64 74 72 60 72 C46 72 32 64 32 46 Z" fill="url(#tropGold)" filter="url(#tropFilter)"/>
  <path d="M54 72 H66 V84 H54 Z" fill="url(#tropGold)"/>
  <rect x="36" y="84" width="48" height="12" rx="4" fill="url(#tropGold)" filter="url(#tropFilter)"/>
  <polygon points="60,40 63,47 70,47 64,52 66,59 60,55 54,59 56,52 50,47 57,47" fill="#ffffff" filter="url(#tropFilter)"/>
</svg>`;
fs.writeFileSync(path.join(dir, 'trophy_3d.svg'), trophySvg);

// 5. 3D Gift Box Icon
const giftSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <radialGradient id="giftGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#f43f5e" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#f43f5e" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="boxWine" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e11d48"/>
      <stop offset="40%" stop-color="#881337"/>
      <stop offset="100%" stop-color="#4c0519"/>
    </linearGradient>
    <linearGradient id="ribbonGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="30%" stop-color="#fde047"/>
      <stop offset="70%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
    <filter id="giftFilter" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <circle cx="60" cy="60" r="50" fill="url(#giftGlow)"/>
  <rect x="26" y="48" width="68" height="44" rx="8" fill="url(#boxWine)" stroke="#fb7185" stroke-width="1.5" filter="url(#giftFilter)"/>
  <rect x="22" y="38" width="76" height="14" rx="5" fill="url(#boxWine)" stroke="#fb7185" stroke-width="1.5" filter="url(#giftFilter)"/>
  <rect x="54" y="38" width="12" height="54" fill="url(#ribbonGold)"/>
  <rect x="26" y="64" width="68" height="10" fill="url(#ribbonGold)"/>
  <path d="M60 38 C50 20 30 26 46 36 C54 40 60 38 60 38 Z" fill="url(#ribbonGold)" filter="url(#giftFilter)"/>
  <path d="M60 38 C70 20 90 26 74 36 C66 40 60 38 60 38 Z" fill="url(#ribbonGold)" filter="url(#giftFilter)"/>
  <circle cx="60" cy="37" r="4" fill="#fef08a"/>
</svg>`;
fs.writeFileSync(path.join(dir, 'gift_3d.svg'), giftSvg);

// 6. 3D Lucky Wheel Icon
const wheelSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <radialGradient id="whlGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#06b6d4" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="whlGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fde047"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
    <filter id="whlFilter" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <circle cx="60" cy="60" r="50" fill="url(#whlGlow)"/>
  <circle cx="60" cy="60" r="38" fill="#1e1b4b" stroke="url(#whlGold)" stroke-width="4" filter="url(#whlFilter)"/>
  <path d="M60 60 L60 26 A34 34 0 0 1 84 36 Z" fill="#f43f5e"/>
  <path d="M60 60 L84 36 A34 34 0 0 1 94 60 Z" fill="#eab308"/>
  <path d="M60 60 L94 60 A34 34 0 0 1 84 84 Z" fill="#06b6d4"/>
  <path d="M60 60 L84 84 A34 34 0 0 1 60 94 Z" fill="#8b5cf6"/>
  <path d="M60 60 L60 94 A34 34 0 0 1 36 84 Z" fill="#ec4899"/>
  <path d="M60 60 L36 84 A34 34 0 0 1 26 60 Z" fill="#10b981"/>
  <path d="M60 60 L26 60 A34 34 0 0 1 36 36 Z" fill="#f97316"/>
  <path d="M60 60 L36 36 A34 34 0 0 1 60 26 Z" fill="#3b82f6"/>
  <circle cx="60" cy="60" r="10" fill="url(#whlGold)" filter="url(#whlFilter)"/>
  <circle cx="60" cy="60" r="4" fill="#ffffff"/>
  <polygon points="60,20 54,12 66,12" fill="#ef4444" filter="url(#whlFilter)"/>
</svg>`;
fs.writeFileSync(path.join(dir, 'wheel_3d.svg'), wheelSvg);

// 7. 3D Agency / Castle Icon
const agencySvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs>
    <radialGradient id="agnGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="agnGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f43f5e"/>
      <stop offset="50%" stop-color="#7c3aed"/>
      <stop offset="100%" stop-color="#1e1b4b"/>
    </linearGradient>
    <linearGradient id="goldBase" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fde047"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
    <filter id="agnFilter" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <circle cx="60" cy="60" r="50" fill="url(#agnGlow)"/>
  <path d="M45 42 L60 20 L75 42 V88 H45 Z" fill="url(#agnGrad)" stroke="#c084fc" stroke-width="1.5" filter="url(#agnFilter)"/>
  <path d="M24 52 L36 34 L48 52 V88 H24 Z" fill="url(#agnGrad)" stroke="#c084fc" stroke-width="1"/>
  <path d="M72 52 L84 34 L96 52 V88 H72 Z" fill="url(#agnGrad)" stroke="#c084fc" stroke-width="1"/>
  <path d="M52 88 V68 Q60 60 68 68 V88 Z" fill="url(#goldBase)" filter="url(#agnFilter)"/>
  <polygon points="60,20 60,12 68,16" fill="#f59e0b"/>
  <polygon points="36,34 36,28 42,31" fill="#fb7185"/>
  <polygon points="84,34 84,28 90,31" fill="#fb7185"/>
</svg>`;
fs.writeFileSync(path.join(dir, 'agency_3d.svg'), agencySvg);

console.log('Successfully generated all 7 luxury 3D cinematic icons!');
