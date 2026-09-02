import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Signal, BellRing } from 'lucide-react';

interface AndroidStatusBarProps {
  appName?: string;
  isNativeApp?: boolean;
}

export const AndroidStatusBar: React.FC<AndroidStatusBarProps> = ({
  appName = 'SALEEM VOICE',
  isNativeApp = true,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };

    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      id="android-native-status-bar"
      className="w-full bg-slate-950/95 text-slate-200 px-4 py-1.5 flex items-center justify-between text-[11px] font-mono select-none border-b border-slate-900 z-50 sticky top-0 backdrop-blur-md"
    >
      {/* Right side (Arabic RTL): Android Clock & App Icon */}
      <div className="flex items-center gap-2">
        <span className="font-bold text-amber-400 tracking-wider text-[11px]">{currentTime || '12:00'}</span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="متصل بالشبكة بسرعة فائقة" />
        <span className="text-[10px] text-slate-400 font-sans font-black bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.2 rounded-md">
          Android 14 API 34
        </span>
      </div>

      {/* Middle: Native Android Hole-Punch Camera Notch */}
      <div className="flex items-center justify-center">
        <div className="w-3.5 h-3.5 rounded-full bg-black ring-1 ring-slate-800 flex items-center justify-center shadow-inner">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-900 border border-slate-800" />
        </div>
      </div>

      {/* Left side: Android Signal, Wi-Fi, 5G, Battery */}
      <div className="flex items-center gap-1.5 text-slate-300">
        <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-1 rounded">5G</span>
        <Signal className="w-3.5 h-3.5 text-slate-200" />
        <Wifi className="w-3.5 h-3.5 text-amber-400" />
        <div className="flex items-center gap-0.5">
          <span className="text-[10px] font-bold text-slate-300">98%</span>
          <BatteryMedium className="w-4 h-4 text-emerald-400" />
        </div>
      </div>
    </div>
  );
};
