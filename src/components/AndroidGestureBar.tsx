import React from 'react';

export const AndroidGestureBar: React.FC = () => {
  return (
    <div
      id="android-native-gesture-bar"
      className="w-full bg-slate-950/90 py-1.5 flex items-center justify-center border-t border-slate-900/50 sticky bottom-0 z-50 backdrop-blur-md select-none"
    >
      {/* Android 14 Minimalist Bottom Navigation Gesture Bar */}
      <div className="w-32 h-1 bg-slate-400/80 hover:bg-amber-400 rounded-full transition-colors shadow-sm cursor-pointer" />
    </div>
  );
};
