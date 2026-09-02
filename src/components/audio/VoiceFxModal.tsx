import React, { useState } from 'react';
import { X, Mic, Volume2, Sparkles, Sliders, Radio, Music2, Activity } from 'lucide-react';

interface VoiceFxModalProps {
  onClose: () => void;
  currentEffect: string;
  onSelectEffect: (effectName: string) => void;
}

export const VoiceFxModal: React.FC<VoiceFxModalProps> = ({
  onClose,
  currentEffect,
  onSelectEffect,
}) => {
  const [activeTab, setActiveTab] = useState<'voice' | 'soundboard'>('soundboard');
  const [micVolume, setMicVolume] = useState(85);
  const [playingSfx, setPlayingSfx] = useState<string | null>(null);

  const voiceEffects = [
    { id: 'normal', name: 'الصوت الطبيعي', icon: '🎤', desc: 'نقاء صوتي قياسي' },
    { id: 'studio', name: 'صدى الاستوديو 🎙️', icon: '✨', desc: 'Reverb احترافي عميق' },
    { id: 'deep', name: 'صوت عميق فخم 🦁', icon: '🕶️', desc: 'Bass Boost جهير قوي' },
    { id: 'chipmunk', name: 'كرتون سريع 🐿️', icon: '🎈', desc: 'Pitch عالي ومرح' },
    { id: 'robot', name: 'روبوت سايبورغ 🤖', icon: '⚡', desc: 'تأثير إلكتروني آلي' },
    { id: 'stage', name: 'قاعة مسرح ضخمة 🏛️', icon: '🌌', desc: 'مؤثر صدى الحفلات' },
  ];

  const soundboardEffects = [
    { id: 'applause', name: 'تصفيق حار 👏', icon: '👏', color: 'from-amber-500 to-yellow-600', freq: [440, 880, 1200] },
    { id: 'cheer', name: 'هتاف الجمهور 🎉', icon: '🥳', color: 'from-purple-500 to-indigo-600', freq: [500, 750, 1000] },
    { id: 'laugh', name: 'ضحك جماعي 😂', icon: '🤣', color: 'from-emerald-500 to-teal-600', freq: [300, 450, 600] },
    { id: 'drumroll', name: 'طبل تشويقي 🥁', icon: '🥁', color: 'from-rose-500 to-red-600', freq: [150, 200, 250] },
    { id: 'horn', name: 'بوق الحفلات 📢', icon: '🎺', color: 'from-cyan-500 to-blue-600', freq: [600, 800, 1200] },
    { id: 'victory', name: 'جرس النصر 🔔', icon: '🏆', color: 'from-yellow-400 to-amber-500', freq: [880, 1100, 1320] },
    { id: 'boom', name: 'انفجار درامي 💥', icon: '💣', color: 'from-orange-500 to-rose-700', freq: [80, 120, 160] },
    { id: 'mystery', name: 'مؤثر الغموض 🕵️', icon: '🔮', color: 'from-fuchsia-600 to-purple-800', freq: [220, 330, 440] },
  ];

  // Synthesize realistic sound effects using Web Audio API
  const playSynthesizedSfx = (sfx: typeof soundboardEffects[0]) => {
    try {
      setPlayingSfx(sfx.id);
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      sfx.freq.forEach((f, index) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = sfx.id === 'boom' || sfx.id === 'drumroll' ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(f, audioCtx.currentTime);
        
        if (sfx.id === 'horn') {
          osc.frequency.exponentialRampToValueAtTime(f * 1.5, audioCtx.currentTime + 0.3);
        } else if (sfx.id === 'boom') {
          osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.5);
        }

        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6 + index * 0.1);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(audioCtx.currentTime + index * 0.05);
        osc.stop(audioCtx.currentTime + 0.8 + index * 0.1);
      });

      setTimeout(() => setPlayingSfx(null), 800);
    } catch (e) {
      console.log('AudioContext play error:', e);
      setPlayingSfx(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 font-sans text-white animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-[#141829] via-[#0b0e1a] to-[#06070d] border-2 border-indigo-500/70 rounded-3xl p-5 text-center shadow-[0_0_40px_rgba(99,102,241,0.3)] space-y-4 overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-indigo-900/50 pb-2.5">
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5">
            <Radio className="w-5 h-5 text-indigo-400 animate-pulse" />
            <h3 className="font-black text-sm text-indigo-300">مغير الصوت والمؤثرات 🎙️</h3>
          </div>

          <div className="w-6" />
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('soundboard')}
            className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${activeTab === 'soundboard' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>لوحة المؤثرات SFX</span>
          </button>

          <button
            onClick={() => setActiveTab('voice')}
            className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${activeTab === 'voice' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>فلاتر الصوت المباشر</span>
          </button>
        </div>

        {/* 🎧 SOUNDBOARD GRID */}
        {activeTab === 'soundboard' && (
          <div className="space-y-3">
            <div className="text-right text-[11px] text-slate-400 font-bold flex items-center justify-between px-1">
              <span>انقر لبث المؤثر الصوتي فوراً في الغرفة:</span>
              <Activity className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {soundboardEffects.map((sfx) => {
                const isPlaying = playingSfx === sfx.id;
                return (
                  <button
                    key={sfx.id}
                    onClick={() => playSynthesizedSfx(sfx)}
                    className={`p-3 rounded-2xl bg-gradient-to-r ${sfx.color} text-white font-black text-xs shadow-lg flex items-center justify-between active:scale-95 transition-all ${isPlaying ? 'ring-2 ring-white scale-105 animate-pulse' : 'hover:brightness-110'}`}
                  >
                    <span className="text-sm">{sfx.icon}</span>
                    <span className="text-[11px] font-black">{sfx.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 🎙️ VOICE CHANGER FILTERS */}
        {activeTab === 'voice' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {voiceEffects.map((vf) => {
                const isSelected = currentEffect === vf.id || (currentEffect === '' && vf.id === 'normal');
                return (
                  <button
                    key={vf.id}
                    onClick={() => onSelectEffect(vf.id)}
                    className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between ${isSelected ? 'bg-indigo-600/40 border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-lg">{vf.icon}</span>
                      {isSelected && <span className="text-[9px] bg-indigo-500 text-white px-1.5 py-0.2 rounded-md font-bold">نشط</span>}
                    </div>
                    <span className="text-xs font-black text-white">{vf.name}</span>
                    <span className="text-[9px] text-slate-400 mt-0.5">{vf.desc}</span>
                  </button>
                );
              })}
            </div>

            {/* Mic Gain Slider */}
            <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2 text-right">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-mono text-indigo-400 font-bold">{micVolume}%</span>
                <span className="flex items-center gap-1 font-bold">
                  <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                  قوة التقاط المايك (Gain)
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={micVolume}
                onChange={(e) => setMicVolume(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
