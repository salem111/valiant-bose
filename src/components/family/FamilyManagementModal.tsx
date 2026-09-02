import React, { useState } from 'react';
import { UserProfile, FamilyInfo, AgencyInfo } from '../../types';
import { X, Shield, Users, Trophy, Gift, Sparkles, Award, Star, Briefcase, ChevronRight, CheckCircle2 } from 'lucide-react';

interface FamilyManagementModalProps {
  user: UserProfile;
  onClose: () => void;
  onUpdateCoins: (deltaCoins: number) => void;
}

export const FamilyManagementModal: React.FC<FamilyManagementModalProps> = ({
  user,
  onClose,
  onUpdateCoins,
}) => {
  const [activeTab, setActiveTab] = useState<'my_family' | 'rankings' | 'agency'>('my_family');
  const [claimedReward, setClaimedReward] = useState(false);

  const [familyData, setFamilyData] = useState<FamilyInfo>({
    id: 'fam_black_heart',
    name: 'عائلة القلب الأسود',
    tag: '🖤[BH]',
    badgeIcon: '🖤',
    level: 7,
    exp: 42500,
    maxExp: 50000,
    leaderId: user.id,
    leaderName: user.name,
    leaderAvatar: user.avatar,
    membersCount: 48,
    maxMembers: 100,
    rank: 1,
    announcement: 'أهلاً بكم في أقوى عائلات التطبيق! الالتزام بالاحترام ودعم الأعضاء في التحديات هو شعارنا دائماً.',
    members: [
      { id: user.id, name: user.name, avatar: user.avatar, role: 'Leader', contribution: 15400, isOnline: true, joinDate: '2026-01-01' },
      { id: 'mem_2', name: 'البرنس أحمد', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', role: 'Elder', contribution: 8900, isOnline: true, joinDate: '2026-01-15' },
      { id: 'mem_3', name: 'الملكة ديما', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', role: 'Elder', contribution: 7200, isOnline: false, joinDate: '2026-02-01' },
      { id: 'mem_4', name: 'الكابتن سيف', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150', role: 'Member', contribution: 3400, isOnline: true, joinDate: '2026-02-10' },
    ],
  });

  const agencyData: AgencyInfo = {
    id: 'agency_bh_official',
    name: 'وكالة القلب الأسود الرسمية للمضيفين',
    code: 'BH-8829',
    agentName: user.name,
    hostsCount: 32,
    totalHoursMonth: 480,
    totalDiamondsMonth: 1250000,
    commissionRate: 20,
  };

  const topFamilies = [
    { rank: 1, name: 'عائلة القلب الأسود 🖤', tag: '[BH]', level: 7, power: '1.2M ⭐', leader: user.name },
    { rank: 2, name: 'صقور المملكة 🦅', tag: '[FALCON]', level: 6, power: '980K ⭐', leader: 'أبو فهد' },
    { rank: 3, name: 'فرسان الليل ⚔️', tag: '[KNIGHTS]', level: 5, power: '750K ⭐', leader: 'الجنرال' },
  ];

  const handleClaimReward = () => {
    if (claimedReward) return;
    setClaimedReward(true);
    onUpdateCoins(300);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 font-sans text-white animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#181a2e] via-[#0d0f1c] to-[#06070e] border-2 border-purple-500/70 rounded-3xl p-5 text-center shadow-[0_0_40px_rgba(168,85,247,0.3)] space-y-4 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-purple-900/50 pb-2.5">
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5">
            <Shield className="w-5 h-5 text-purple-400" />
            <h3 className="font-black text-sm text-purple-300">نظام العائلات والوكالات 🛡️</h3>
          </div>

          <div className="w-6" />
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 gap-1.5 bg-slate-900/90 p-1 rounded-2xl border border-slate-800 text-xs font-black">
          <button
            onClick={() => setActiveTab('my_family')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1 ${activeTab === 'my_family' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>عائلتي</span>
          </button>

          <button
            onClick={() => setActiveTab('rankings')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1 ${activeTab === 'rankings' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>ترتيب العائلات</span>
          </button>

          <button
            onClick={() => setActiveTab('agency')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1 ${activeTab === 'agency' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>لوحة الوكالة</span>
          </button>
        </div>

        {/* 🛡️ TAB 1: MY FAMILY OVERVIEW */}
        {activeTab === 'my_family' && (
          <div className="overflow-y-auto space-y-3 flex-1 pr-1 text-right">
            {/* Family Header Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border border-purple-500/50 shadow-lg relative overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-amber-400 flex items-center justify-center text-2xl shadow-md border-2 border-purple-300">
                  {familyData.badgeIcon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-white truncate">{familyData.name}</span>
                    <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-md">
                      Level {familyData.level}
                    </span>
                  </div>
                  <span className="text-[10px] text-purple-300 font-bold block mt-0.5">
                    الوسم: {familyData.tag} • المركز #{familyData.rank} عالمياً
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    القائد: {familyData.leaderName} 👑 • الأعضاء: {familyData.membersCount}/{familyData.maxMembers}
                  </span>
                </div>
              </div>

              {/* EXP Progress bar */}
              <div className="mt-3 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>{Math.round((familyData.exp / familyData.maxExp) * 100)}%</span>
                  <span>نقاط خبرة العائلة: {familyData.exp.toLocaleString()} / {familyData.maxExp.toLocaleString()}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-700">
                  <div
                    style={{ width: `${(familyData.exp / familyData.maxExp) * 100}%` }}
                    className="h-full bg-gradient-to-r from-purple-500 to-amber-400 rounded-full"
                  />
                </div>
              </div>
            </div>

            {/* Daily Clan Reward Claim Chest */}
            <div className="p-3 bg-slate-900/90 rounded-2xl border border-amber-400/40 flex items-center justify-between">
              <button
                onClick={handleClaimReward}
                disabled={claimedReward}
                className={`py-1.5 px-3 rounded-xl text-xs font-black transition-all flex items-center gap-1 ${claimedReward ? 'bg-slate-800 text-slate-500' : 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md active:scale-95'}`}
              >
                <Gift className="w-3.5 h-3.5" />
                <span>{claimedReward ? 'تم الاستلام ✅' : 'استلام 300 🪙'}</span>
              </button>

              <div className="text-right">
                <span className="text-xs font-black text-amber-300 block">صندوق دعم العائلة اليومي 🎁</span>
                <span className="text-[10px] text-slate-400">مكافأة يومية مجانية لكافة أفراد العائلة</span>
              </div>
            </div>

            {/* Family Members Roster */}
            <div className="space-y-2">
              <span className="text-xs font-black text-slate-300 px-1 block">قائمة الأعضاء ({familyData.members.length}):</span>
              {familyData.members.map((mem) => (
                <div
                  key={mem.id}
                  className="p-2.5 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-amber-400 font-mono font-bold">
                      ⭐ {mem.contribution.toLocaleString()}
                    </span>
                    <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-md ${mem.role === 'Leader' ? 'bg-amber-500 text-slate-950' : mem.role === 'Elder' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-300'}`}>
                      {mem.role === 'Leader' ? '👑 القائد' : mem.role === 'Elder' ? '⚔️ نائب' : 'عضو'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="text-right">
                      <span className="text-xs font-black text-white block">{mem.name}</span>
                      <span className="text-[9px] text-emerald-400">{mem.isOnline ? 'متصل الآن 🟢' : 'غير متصل'}</span>
                    </div>
                    <img src={mem.avatar} alt={mem.name} className="w-9 h-9 rounded-full object-cover border border-purple-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 🏆 TAB 2: RANKINGS */}
        {activeTab === 'rankings' && (
          <div className="overflow-y-auto space-y-2.5 flex-1 pr-1 text-right">
            <span className="text-xs font-black text-slate-300 px-1 block">ترتيب أقوى عائلات الأسبوع 👑</span>
            {topFamilies.map((tf) => (
              <div
                key={tf.rank}
                className="p-3 rounded-2xl bg-slate-900/80 border border-purple-500/30 flex items-center justify-between"
              >
                <div className="text-left">
                  <span className="text-xs font-black text-amber-300 block">{tf.power}</span>
                  <span className="text-[9px] text-slate-400">القوة الإجمالية</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-black text-white block">{tf.name}</span>
                    <span className="text-[10px] text-purple-300">القائد: {tf.leader} • ليفل {tf.level}</span>
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${tf.rank === 1 ? 'bg-amber-400 text-slate-950 shadow-[0_0_10px_rgba(251,191,36,0.8)]' : tf.rank === 2 ? 'bg-slate-300 text-slate-950' : 'bg-amber-700 text-white'}`}>
                    #{tf.rank}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 💼 TAB 3: AGENCY DASHBOARD */}
        {activeTab === 'agency' && (
          <div className="overflow-y-auto space-y-3 flex-1 pr-1 text-right">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-500/50 shadow-lg space-y-3">
              <div>
                <span className="text-xs font-black text-blue-300 block">{agencyData.name}</span>
                <span className="text-[10px] text-slate-400">كود الوكالة: <strong className="text-white">{agencyData.code}</strong> • الوكيل: {agencyData.agentName}</span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 text-center pt-2">
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="font-mono font-black text-sm text-amber-300 block">{agencyData.hostsCount}</span>
                  <span className="text-[9px] text-slate-400 font-bold">المضيفين النشطين</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="font-mono font-black text-sm text-cyan-300 block">{agencyData.totalHoursMonth}h</span>
                  <span className="text-[9px] text-slate-400 font-bold">ساعات البث</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="font-mono font-black text-sm text-emerald-300 block">{(agencyData.totalDiamondsMonth / 1000).toFixed(0)}K</span>
                  <span className="text-[9px] text-slate-400 font-bold">إجمالي الماسات 💎</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                <span className="font-bold text-amber-300">{agencyData.commissionRate}% أرباح صافية</span>
                <span className="text-slate-400">نسبة عمولة الوكيل:</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
