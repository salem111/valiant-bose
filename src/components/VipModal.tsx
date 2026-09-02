import React from 'react';
import { UserProfile } from '../types';
import { Crown, Sparkles, X, Check, ShieldCheck, Zap } from 'lucide-react';
import { useI18n } from '../lib/i18n';

interface VipModalProps {
  user: UserProfile;
  onClose: () => void;
  onOpenCoinStore: () => void;
}

export const VipModal: React.FC<VipModalProps> = ({ user, onClose, onOpenCoinStore }) => {
  const { t, dir } = useI18n();
  const VIP_LEVELS = [
    { level: 1, name: 'VIP الفضي', color: 'from-slate-400 to-slate-600', perk: 'إطار فضي مميز + دخول هادئ للغرف' },
    { level: 3, name: 'VIP الذهبي', color: 'from-amber-400 to-yellow-600', perk: 'إطار التاج الذهبي + خصم 10% على الهدايا' },
    { level: 5, name: 'Crown VIP الأسطوري', color: 'from-purple-500 via-amber-400 to-yellow-300', perk: 'تأثير دخول فراري ملكي + مايك أسطوري + أولوية الدعم' },
  ];

  return (
    <div dir={dir} className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-3xl p-5 shadow-2xl space-y-4 text-start animate-scaleUp">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-base text-amber-300">نظام ورتب VIP الملكي 👑</h2>
              <p className="text-[11px] text-slate-400">تميز في الغرف الصوتية بالحصول على التاج الذهبي والإطارات الخاصة</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current VIP Status Card */}
        <div className="bg-gradient-to-r from-amber-600 via-purple-900 to-slate-950 p-4 rounded-2xl border border-amber-400/40 text-white space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-black text-lg text-amber-300">{user.vipRank} (مستوى {user.vipLevel})</span>
            <span className="bg-amber-400 text-slate-950 font-bold text-xs px-2.5 py-0.5 rounded-full">نشط الآن</span>
          </div>
          <p className="text-xs text-slate-200">
            أنت تمتلك صلاحيات VIP 5 الأسطورية كاملة مع شارات الملك على جميع المقاعد الصوتية!
          </p>
        </div>

        {/* VIP Levels Grid */}
        <div className="space-y-2">
          {VIP_LEVELS.map((v) => (
            <div key={v.level} className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${v.color} flex items-center justify-center text-slate-950 font-black text-xs`}>
                  {v.level}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white">{v.name}</h4>
                  <p className="text-[10px] text-slate-400">{v.perk}</p>
                </div>
              </div>
              <Check className="w-4 h-4 text-emerald-400" />
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            onClose();
            onOpenCoinStore();
          }}
          className="w-full py-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs rounded-xl shadow-lg hover:brightness-110"
        >
          شحن الرصيد لترقية VIP الفورية 🪙
        </button>
      </div>
    </div>
  );
};
