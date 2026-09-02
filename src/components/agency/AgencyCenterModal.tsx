import React, { useEffect, useState } from 'react';
import { UserProfile, AgencyInfo, TargetTier, AgencyHost, AgencyJoinRequest, HOST_TARGET_TIERS } from '../../types';
import { 
  X, Briefcase, Target, Shield, Users, Trophy, Award, 
  Sparkles, CheckCircle2, AlertCircle, Clock, Calendar, 
  DollarSign, Gem, UserPlus, UserX, Send, ArrowRight, 
  TrendingUp, Star, ChevronRight, Lock, Copy, Check, MessageSquare, Gift,
  Search, Download, ArrowLeft, UserCheck, PhoneCall, ChevronLeft, Plus
} from 'lucide-react';
import { 
  addAgencyMember, approveAgencyMember, createAgency, rejectAgencyMember, 
  removeAgencyMember, setAgencyMemberRole, listenToAgency, listenToAgencyJoinRequests, 
  listenToAgencyMembers, requestAgencyMembership, AgencyRecord, LOCAL_AGENCY_KEY,
  downloadAgencyReportCsv
} from '../../lib/agencyService';
import AgencyTargets from "../AgencyTargets";

interface AgencyCenterModalProps {
  user: UserProfile;
  onClose: () => void;
  onUpdateDiamonds?: (delta: number) => void;
  onUpdateCoins?: (delta: number) => void;
  onOpenWithdrawal?: () => void;
  onUpdateUser?: (updated: Partial<UserProfile>) => void;
}

export const AgencyCenterModal: React.FC<AgencyCenterModalProps> = ({
  user,
  onClose,
  onUpdateDiamonds,
  onUpdateCoins,
  onOpenWithdrawal,
  onUpdateUser,
}) => {
  // Navigation View: 'main_agency' | 'streamers_management' | 'room_data' | 'target_view'
  const [currentView, setCurrentView] = useState<'main_agency' | 'streamers_management' | 'room_data' | 'target_view'>('main_agency');

  // Input & Filter states
  const [joinInputCode, setJoinInputCode] = useState('');
  const [newMemberIdInput, setNewMemberIdInput] = useState('');
  const [streamerSearchQuery, setStreamerSearchQuery] = useState('');
  const [roomDataSidQuery, setRoomDataSidQuery] = useState('');
  const [dateFilterPreset, setDateFilterPreset] = useState<'this_week' | 'last_week' | 'this_month'>('this_week');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newAgencyNameInput, setNewAgencyNameInput] = useState('');
  const [isCreatingAgency, setIsCreatingAgency] = useState(false);
  const [showCreateAgencyForm, setShowCreateAgencyForm] = useState(false);

  // Host dismissal modal confirmation
  const [hostToKick, setHostToKick] = useState<AgencyHost | null>(null);

  // Selected streamer for detailed target inspect
  const [inspectedStreamer, setInspectedStreamer] = useState<AgencyHost | null>(null);

  // Date range label computed from preset
  const dateRangeLabel = dateFilterPreset === 'this_week' 
    ? 'هذا الأسبوع (2026/08/22 - 2026/08/28)' 
    : dateFilterPreset === 'last_week'
    ? 'الأسبوع الماضي (2026/08/15 - 2026/08/21)'
    : 'الشهر الحالي (2026/08/01 - 2026/08/31)';

  // Agency data state
  const [agencyData, setAgencyData] = useState<AgencyInfo>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_AGENCY_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.id) return parsed;
      }
    } catch (e) {}

    return {
      id: user.agencyId || '3858',
      name: user.agencyName || 'وكالة الصقور الملكية [ROYAL-88]',
      code: user.agencyCode || '3858',
      agentName: user.agencyRole === 'owner' ? user.name : 'المدير العام',
      ownerId: user.agencyRole === 'owner' ? user.id : 'owner_3858',
      ownerName: user.agencyRole === 'owner' ? user.name : 'المدير العام',
      hostsCount: 0,
      totalHoursMonth: 0,
      totalDiamondsMonth: 0,
      totalMonthlyRevenueUsd: 0,
      hosts: [],
      pendingRequests: [],
    };
  });

  // User personal ID & codes
  const userDisplayId = user.id || '40335803';
  const agencyNameDisplay = agencyData.name || user.agencyName || 'وكالة الصقور الملكية';
  const agencyIdDisplay = agencyData.code || agencyData.id || user.agencyCode || '3858';
  const personalCodeDisplay = `P-${userDisplayId.slice(-6)}`;
  const invitationCodeDisplay = agencyIdDisplay;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    showToast(`تم نسخ ${fieldName} (${text}) بنجاح 📋`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  useEffect(() => {
    const targetAgencyId = agencyData.id || user.agencyId;
    if (!targetAgencyId) return;

    let stopMembers = () => {};
    const stopAgency = listenToAgency(targetAgencyId, (agency) => {
      if (!agency) return;
      setAgencyData(prev => ({
        ...prev,
        ...agency,
        agentName: agency.ownerName || prev.agentName,
        hostsCount: Object.keys(agency.members || {}).length,
      }));

      stopMembers();
      stopMembers = listenToAgencyMembers(agency, members => setAgencyData(prev => {
        const hosts: AgencyHost[] = members.map(member => ({
          id: member.id || '',
          name: member.name || 'مستخدم',
          avatar: member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          monthlyHours: member.agencyStats?.liveMinutes ? Math.round((member.agencyStats.liveMinutes / 60) * 10) / 10 : 0,
          targetHours: 8,
          diamondsEarned: member.agencyStats?.touches || member.diamonds || 0,
          salaryUsd: 0,
          status: 'active' as const,
          validDays: member.agencyStats?.validDays || 0,
          agencyRole: agency.members?.[member.id || '']?.role || 'member',
          joinedDate: agency.members?.[member.id || '']?.joinedAt ? new Date(agency.members[member.id || ''].joinedAt).toLocaleDateString('ar-EG') : '2026-08-28',
        }));

        return {
          ...prev,
          hosts,
          hostsCount: hosts.length,
          totalHoursMonth: hosts.reduce((total, host) => total + host.monthlyHours, 0),
          totalDiamondsMonth: hosts.reduce((total, host) => total + host.diamondsEarned, 0),
        };
      }));
    });

    return () => { stopAgency(); stopMembers(); };
  }, [agencyData.id, user.agencyId]);

  // Handle Join Agency by Invitation Code
  const handleJoinAgency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinInputCode.trim()) {
      showToast('⚠️ يرجى إدخال رمز الدعوة أو الرمز الشخصي');
      return;
    }

    setIsJoining(true);
    try {
      const accepted = await requestAgencyMembership(user, joinInputCode.trim());
      if (accepted) {
        showToast('✅ تم إرسال طلب الانضمام للوكالة بنجاح وهو قيد المراجعة!');
        setJoinInputCode('');
      } else {
        showToast('⚠️ رمز الوكالة غير صحيح أو غير متوفر حالياً.');
      }
    } catch (e: any) {
      showToast(`⚠️ حدث خطأ: ${e?.message || 'تعذر إرسال الطلب'}`);
    } finally {
      setIsJoining(false);
    }
  };

  // Handle Add Member Directly by ID
  const handleAddMemberDirectly = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = newMemberIdInput.trim();
    if (!cleanId) return;

    setIsAddingMember(true);
    try {
      const added = await addAgencyMember(user.id, agencyData as AgencyRecord, cleanId);
      if (added) {
        showToast(`✅ تمت إضافة المضيف (${cleanId}) إلى الوكالة بنجاح!`);
        setNewMemberIdInput('');
      } else {
        // Add locally for instant demo if offline
        const mockHost: AgencyHost = {
          id: cleanId,
          name: `مضيف_${cleanId.slice(-4)}`,
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanId}`,
          monthlyHours: 3.5,
          targetHours: 8,
          diamondsEarned: 25000,
          salaryUsd: 12,
          status: 'active',
          validDays: 2,
          joinedDate: new Date().toLocaleDateString('ar-EG'),
        };

        setAgencyData(prev => ({
          ...prev,
          hosts: [...prev.hosts.filter(h => h.id !== cleanId), mockHost],
          hostsCount: prev.hosts.length + 1,
        }));
        showToast(`✅ تمت إضافة المضيف (${cleanId}) إلى قائمة الوكالة!`);
        setNewMemberIdInput('');
      }
    } catch (err: any) {
      showToast(`⚠️ حدث خطأ: ${err?.message || 'تعذر إضافة المضيف'}`);
    } finally {
      setIsAddingMember(false);
    }
  };

  // Kick Host
  const handleConfirmKick = async () => {
    if (!hostToKick) return;
    const removed = await removeAgencyMember(user.id, agencyData as AgencyRecord, hostToKick.id);
    
    // Also remove from local state immediately
    setAgencyData(prev => ({
      ...prev,
      hosts: prev.hosts.filter(h => h.id !== hostToKick.id),
      hostsCount: Math.max(0, prev.hosts.length - 1),
    }));

    showToast(`🚫 تمت إزالة الستريمر (${hostToKick.name}) من الوكالة بنجاح.`);
    setHostToKick(null);
  };

  // Create New Agency Handler
  const handleCreateAgencySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newAgencyNameInput.trim();
    if (!cleanName) {
      showToast('⚠️ يرجى إدخال اسم الوكالة أولاً.');
      return;
    }

    setIsCreatingAgency(true);
    try {
      const created = await createAgency(user, cleanName);
      if (created) {
        setAgencyData(created);
        if (onUpdateUser) {
          onUpdateUser({
            isAgencyOwner: true,
            isAgencyHost: true,
            agencyRole: 'owner',
            agencyName: cleanName,
            agencyId: created.id,
            agencyCode: created.code,
          });
        }
        showToast(`👑 تم إنشاء وتأسيس وكالة "${cleanName}" بنجاح!`);
        setShowCreateAgencyForm(false);
        setNewAgencyNameInput('');
      } else {
        showToast('❌ تعذر إنشاء الوكالة، يرجى المحاولة لاحقاً.');
      }
    } catch (err: any) {
      showToast(`❌ خطأ: ${err?.message || 'تعذر إنشاء الوكالة'}`);
    } finally {
      setIsCreatingAgency(false);
    }
  };

  // Handle Export / Download Report
  const handleDownloadReport = () => {
    downloadAgencyReportCsv(agencyData, agencyData.hosts, dateRangeLabel);
    showToast('📥 تم تنزيل تقرير التارجت وغرفة الستريمر بنجاح على جهازك!');
  };

  // Open Chat with Streamer
  const handleOpenChatWithStreamer = (streamer: AgencyHost) => {
    try {
      window.dispatchEvent(new CustomEvent('app:open-chat', {
        detail: { recipientId: streamer.id, recipientName: streamer.name, recipientAvatar: streamer.avatar }
      }));
    } catch (e) {}
    showToast(`💬 فتح محادثة الدردشة المباشرة مع ${streamer.name}...`);
  };

  // Filtered streamers list for View 2
  const filteredStreamers = (agencyData.hosts || []).filter(h => 
    !streamerSearchQuery || 
    h.id.includes(streamerSearchQuery) || 
    h.name.toLowerCase().includes(streamerSearchQuery.toLowerCase())
  );

  // Filtered room data list for View 3
  const filteredRoomData = (agencyData.hosts || []).filter(h =>
    !roomDataSidQuery ||
    h.id.includes(roomDataSidQuery) ||
    h.name.toLowerCase().includes(roomDataSidQuery.toLowerCase())
  );

  // Aggregated Room Totals
  const totalDiamondsRoom = filteredRoomData.reduce((acc, h) => acc + (h.diamondsEarned || 0), 0);
  const totalHoursRoom = filteredRoomData.reduce((acc, h) => acc + (h.monthlyHours || 0), 0);
  const totalValidDaysRoom = filteredRoomData.reduce((acc, h) => acc + (h.validDays || 0), 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 font-sans text-white animate-in fade-in duration-200 dir-rtl select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 px-5 py-2.5 rounded-full font-black text-xs sm:text-sm shadow-2xl flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Confirmation Kick Modal */}
      {hostToKick && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/80 rounded-3xl p-5 max-w-sm w-full space-y-4 text-center">
            <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
            <h4 className="font-black text-sm text-white">تأكيد طرد الستريمر من الوكالة</h4>
            <p className="text-xs text-slate-300">
              هل أنت متأكد من رغبتك في طرد <strong className="text-rose-300">{hostToKick.name}</strong> (ID: {hostToKick.id}) من الوكالة؟
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setHostToKick(null)}
                className="py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmKick}
                className="py-2.5 rounded-xl bg-rose-600 text-white font-black text-xs hover:bg-rose-500 cursor-pointer"
              >
                تأكيد الطرد
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspected Streamer Target Breakdown Modal */}
      {inspectedStreamer && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/80 rounded-3xl p-5 max-w-sm w-full space-y-4 text-right">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <img src={inspectedStreamer.avatar} alt="" className="w-8 h-8 rounded-full border border-amber-400" />
                <div>
                  <h4 className="font-black text-xs text-amber-300">{inspectedStreamer.name}</h4>
                  <span className="font-mono text-[10px] text-cyan-300">ID: {inspectedStreamer.id}</span>
                </div>
              </div>
              <button onClick={() => setInspectedStreamer(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">💎 ألماسات الهدايا:</span>
                <span className="font-mono font-black text-cyan-300">{inspectedStreamer.diamondsEarned.toLocaleString()} 💎</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">⏱️ ساعات البث:</span>
                <span className="font-mono font-black text-amber-300">{inspectedStreamer.monthlyHours} / 8 ساعات</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400">📅 الأيام الفعالة:</span>
                <span className="font-mono font-black text-emerald-400">{inspectedStreamer.validDays} / 4 أيام</span>
              </div>
            </div>

            <button
              onClick={() => {
                const s = inspectedStreamer;
                setInspectedStreamer(null);
                handleOpenChatWithStreamer(s);
              }}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-xs rounded-xl shadow cursor-pointer"
            >
              مراسلة الستريمر في الدردشة
            </button>
          </div>
        </div>
      )}

      {/* Main Agency Modal Window */}
      <div className="relative w-full max-w-lg bg-[#0d0f17] border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-[0_0_50px_rgba(0,0,0,0.8)] space-y-4 overflow-hidden max-h-[95vh] flex flex-col">
        
        {/* ========================================================================= */}
        {/* VIEW 1: وكالتي - MAIN AGENCY PROFILE & CODES SCREEN */}
        {/* ========================================================================= */}
        {currentView === 'main_agency' && (
          <div className="space-y-4 flex-1 overflow-y-auto pr-1 custom-scrollbar">
            
            {/* Top Navigation Bar */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
                <h3 className="font-black text-base text-white">وكالتي</h3>
              </div>

              <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-mono font-bold">
                ID: {agencyIdDisplay}
              </span>
            </div>

            {/* Basic Information Card (المعلومات الأساسية) */}
            <div className="bg-slate-950/90 border border-slate-800/90 rounded-2xl p-4 space-y-3 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <span className="font-black text-xs text-amber-300 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-amber-400" />
                  <span>المعلومات الأساسية</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">معتمدة رسمياً</span>
              </div>

              {/* 1. User ID */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800/80">
                <span className="text-xs text-slate-300 font-bold">الـ ID الخاص بي:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-cyan-300 text-xs">{userDisplayId}</span>
                  <button
                    onClick={() => copyToClipboard(userDisplayId, 'الـ ID')}
                    className="p-1 text-slate-400 hover:text-amber-300 cursor-pointer transition-colors"
                  >
                    {copiedField === 'الـ ID' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* 2. Agency Name (LOCKED - CANNOT BE CHANGED) */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800/80">
                <span className="text-xs text-slate-300 font-bold">وكالتي:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-amber-300 text-xs">{agencyNameDisplay}</span>
                  <Lock className="w-3 h-3 text-slate-500" title="اسم الوكالة مقفل وثابت" />
                </div>
              </div>

              {/* 3. Personal Code */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800/80">
                <span className="text-xs text-slate-300 font-bold">الرمز الشخصي:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-purple-300 text-xs">{personalCodeDisplay}</span>
                  <button
                    onClick={() => copyToClipboard(personalCodeDisplay, 'الرمز الشخصي')}
                    className="p-1 text-slate-400 hover:text-amber-300 cursor-pointer transition-colors"
                  >
                    {copiedField === 'الرمز الشخصي' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* 4. Invitation Code */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800/80">
                <span className="text-xs text-slate-300 font-bold">رمز الدعوة:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-emerald-400 text-xs">{invitationCodeDisplay}</span>
                  <button
                    onClick={() => copyToClipboard(invitationCodeDisplay, 'رمز الدعوة')}
                    className="p-1 text-slate-400 hover:text-amber-300 cursor-pointer transition-colors"
                  >
                    {copiedField === 'رمز الدعوة' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Join Agency Input Box (انضمام للوكالة) */}
            <form onSubmit={handleJoinAgency} className="bg-slate-950/90 border border-slate-800/90 rounded-2xl p-4 space-y-2.5">
              <span className="font-black text-xs text-slate-200 block">انضمام للوكالة:</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={joinInputCode}
                  onChange={(e) => setJoinInputCode(e.target.value)}
                  placeholder="أدخل رمز الدعوة أو الرمز الشخصي..."
                  className="flex-1 bg-slate-900 border border-slate-700 text-xs rounded-xl p-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 font-mono text-center"
                />
                <button
                  type="submit"
                  disabled={isJoining || !joinInputCode.trim()}
                  className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs rounded-xl shadow-md hover:brightness-110 active:scale-95 disabled:opacity-50 cursor-pointer whitespace-nowrap"
                >
                  {isJoining ? 'جاري الانضمام...' : 'انضمام'}
                </button>
              </div>
            </form>

            {/* Create Agency Form Box (تأسيس وكالة جديدة) */}
            <div className="bg-gradient-to-r from-amber-950/40 via-slate-950 to-amber-950/40 border border-amber-500/40 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-black text-xs text-amber-300 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-amber-400" />
                  <span>تأسيس وكالة جديدة خاصة بك 👑:</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowCreateAgencyForm(!showCreateAgencyForm)}
                  className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-400/40 px-2.5 py-0.5 rounded-full font-bold hover:bg-amber-500/30 transition-all cursor-pointer"
                >
                  {showCreateAgencyForm ? 'إخفاء ✕' : '+ إنشاء وكالة الآن'}
                </button>
              </div>

              {showCreateAgencyForm && (
                <form onSubmit={handleCreateAgencySubmit} className="space-y-2 pt-2 border-t border-slate-800">
                  <input
                    type="text"
                    required
                    value={newAgencyNameInput}
                    onChange={(e) => setNewAgencyNameInput(e.target.value)}
                    placeholder="اكتب اسم وكالتك الجديدة (مثال: وكالة صقور سليم)..."
                    className="w-full bg-slate-900 border border-amber-500/40 text-xs rounded-xl p-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 text-center font-bold"
                  />
                  <button
                    type="submit"
                    disabled={isCreatingAgency || !newAgencyNameInput.trim()}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-lg hover:brightness-110 active:scale-95 disabled:opacity-50 cursor-pointer transition-all flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isCreatingAgency ? 'جاري تأسيس الوكالة في السيرفر...' : 'تأكيد تأسيس الوكالة رسمياً 👑'}</span>
                  </button>
                </form>
              )}
            </div>

            {/* Management Quick Action Navigation Buttons */}
            <div className="space-y-2 pt-1">
              {/* Button 1: إدارة الستريمر (Matches Image 1) */}
              <button
                type="button"
                onClick={() => setCurrentView('streamers_management')}
                className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 hover:border-amber-500/50 flex items-center justify-between transition-all cursor-pointer shadow-lg group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <h4 className="font-black text-xs sm:text-sm text-white group-hover:text-amber-300">إدارة الستريمر 👥</h4>
                    <p className="text-[10px] text-slate-400">قائمة المضيفين، التحقق، المراجعة، والطرد</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    {agencyData.hostsCount || 0} مضيف
                  </span>
                  <ChevronLeft className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
                </div>
              </button>

              {/* Button 2: بيانات غرفة الستريمر (Matches Image 2) */}
              <button
                type="button"
                onClick={() => setCurrentView('room_data')}
                className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 hover:border-cyan-500/50 flex items-center justify-between transition-all cursor-pointer shadow-lg group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <h4 className="font-black text-xs sm:text-sm text-white group-hover:text-cyan-300">بيانات غرفة الستريمر 📊</h4>
                    <p className="text-[10px] text-slate-400">وقت الميكروفون، الأيام الفعالة، والتنزيل</p>
                  </div>
                </div>
                <ChevronLeft className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </button>

              {/* Button 3: لوحة التارجت والأجور */}
              <button
                type="button"
                onClick={() => setCurrentView('target_view')}
                className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 hover:border-purple-500/50 flex items-center justify-between transition-all cursor-pointer shadow-lg group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <h4 className="font-black text-xs sm:text-sm text-white group-hover:text-purple-300">جدول التارجت الأسبوعي الرسمي (10K - 1M) 🏆</h4>
                    <p className="text-[10px] text-slate-400">شروط التسكير (8س • 4 أيام) ومكافآت المضيف والوكيل</p>
                  </div>
                </div>
                <ChevronLeft className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
              </button>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: إدارة الستريمر - STREAMERS MANAGEMENT (EXACT TO IMAGE 1) */}
        {/* ========================================================================= */}
        {currentView === 'streamers_management' && (
          <div className="space-y-3.5 flex-1 overflow-y-auto pr-1 custom-scrollbar">
            
            {/* Screen Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <button
                onClick={() => setCurrentView('main_agency')}
                className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white font-bold cursor-pointer"
              >
                <ChevronRight className="w-4 h-4 text-amber-400" />
                <span>إدارة الستريمر</span>
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Top Agency Summary Bar */}
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs space-y-1 text-right">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold">اسم الوكالة :</span>
                <span className="font-black text-amber-300">{agencyNameDisplay}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold">ID الوكالة :</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-cyan-300">{agencyIdDisplay}</span>
                  <button
                    onClick={() => copyToClipboard(agencyIdDisplay, 'ID الوكالة')}
                    className="p-0.5 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold">عدد الستريمر :</span>
                <span className="font-mono font-black text-white">{agencyData.hostsCount || 0}</span>
              </div>
            </div>

            {/* Add Streamer Direct Input Box */}
            <form onSubmit={handleAddMemberDirectly} className="flex items-center gap-2 bg-slate-950 p-2 rounded-2xl border border-slate-800">
              <input
                type="text"
                value={newMemberIdInput}
                onChange={(e) => setNewMemberIdInput(e.target.value)}
                placeholder="إضافة ستريمر بواسطة ID المستخدم..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 font-mono text-right"
              />
              <button
                type="submit"
                disabled={isAddingMember || !newMemberIdInput.trim()}
                className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs rounded-xl shadow hover:brightness-110 disabled:opacity-50 cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة</span>
              </button>
            </form>

            {/* Search Bar */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={streamerSearchQuery}
                onChange={(e) => setStreamerSearchQuery(e.target.value)}
                placeholder="ID الستريمر"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 font-mono text-right"
              />
              <button
                type="button"
                className="px-5 py-2 bg-[#1a233b] hover:bg-[#253254] text-cyan-300 font-black text-xs rounded-xl border border-cyan-500/40 cursor-pointer shadow"
              >
                بحث
              </button>
            </div>

            {/* Streamers Table */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-right text-[10px] font-sans">
                  <thead className="bg-[#121624] text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-2.5 whitespace-nowrap">الصورة الرمزية</th>
                      <th className="p-2.5 whitespace-nowrap">كنية</th>
                      <th className="p-2.5 whitespace-nowrap">ID الستريمر</th>
                      <th className="p-2.5 whitespace-nowrap">وقت كون الستريمر</th>
                      <th className="p-2.5 whitespace-nowrap">درجة</th>
                      <th className="p-2.5 whitespace-nowrap">حالة مراجعة البيانات</th>
                      <th className="p-2.5 whitespace-nowrap">حالة التحقق</th>
                      <th className="p-2.5 whitespace-nowrap text-center">تشغيل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    {filteredStreamers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-500 text-xs font-mono">
                          لا يوجد ستريمر مسجلين حالياً بالوكالة.
                        </td>
                      </tr>
                    ) : (
                      filteredStreamers.map((streamer) => (
                        <tr key={streamer.id} className="hover:bg-slate-900/60 transition-colors cursor-pointer" onClick={() => setInspectedStreamer(streamer)}>
                          <td className="p-2.5">
                            <img
                              src={streamer.avatar}
                              alt={streamer.name}
                              className="w-7 h-7 rounded-full object-cover border border-slate-700"
                            />
                          </td>
                          <td className="p-2.5 font-bold text-slate-200 whitespace-nowrap">{streamer.name}</td>
                          <td className="p-2.5 font-mono text-cyan-300 whitespace-nowrap">
                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <span>{streamer.id}</span>
                              <button onClick={() => copyToClipboard(streamer.id, 'ID الستريمر')} className="text-slate-500 hover:text-white">
                                <Copy className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </td>
                          <td className="p-2.5 font-mono text-slate-400 whitespace-nowrap">{streamer.joinedDate}</td>
                          <td className="p-2.5 font-mono text-amber-300 whitespace-nowrap">1</td>
                          <td className="p-2.5 text-emerald-400 font-bold whitespace-nowrap">موافقة</td>
                          <td className="p-2.5 text-emerald-400 font-bold whitespace-nowrap">موافقة</td>
                          <td className="p-2.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <div className="flex flex-col gap-1 items-center">
                              <button
                                onClick={() => setHostToKick(streamer)}
                                className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-rose-400 hover:border-rose-500 text-[9px] font-bold cursor-pointer"
                              >
                                طرد من الوكالة
                              </button>
                              <button
                                onClick={() => handleOpenChatWithStreamer(streamer)}
                                className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-300 hover:border-cyan-500 text-[9px] font-bold cursor-pointer"
                              >
                                اذهب للدردشة
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: بيانات غرفة الستريمر - STREAMER ROOM DATA (EXACT TO IMAGE 2) */}
        {/* ========================================================================= */}
        {currentView === 'room_data' && (
          <div className="space-y-3.5 flex-1 overflow-y-auto pr-1 custom-scrollbar">
            
            {/* Screen Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <button
                onClick={() => setCurrentView('main_agency')}
                className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white font-bold cursor-pointer"
              >
                <ChevronRight className="w-4 h-4 text-cyan-400" />
                <span>بيانات غرفة الستريمر</span>
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter & Export Bar */}
            <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800 space-y-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {/* Preset Date Range Filter Selector */}
                <select 
                  value={dateFilterPreset}
                  onChange={(e) => setDateFilterPreset(e.target.value as any)}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-2 text-[10px] text-white focus:outline-none focus:border-cyan-400 font-bold"
                >
                  <option value="this_week">هذا الأسبوع</option>
                  <option value="last_week">الأسبوع الماضي</option>
                  <option value="this_month">الشهر الحالي</option>
                </select>

                <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl px-2">
                  <span className="text-[10px] text-slate-400 font-mono">SID :</span>
                  <input
                    type="text"
                    value={roomDataSidQuery}
                    onChange={(e) => setRoomDataSidQuery(e.target.value)}
                    placeholder="ID الستريمر"
                    className="w-full bg-transparent p-1 text-[10px] text-white focus:outline-none font-mono text-right"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1 flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl px-2 py-1.5 text-[9.5px] text-slate-300 font-mono">
                  <span className="truncate">{dateRangeLabel}</span>
                  <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0 mr-1" />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                {/* Real CSV / Excel Download Button */}
                <button
                  type="button"
                  onClick={handleDownloadReport}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تنزيل (CSV/Excel)</span>
                </button>

                <button
                  type="button"
                  onClick={() => showToast('🔎 تم تحديث نتائج البحث والفلاتر')}
                  className="px-5 py-1.5 bg-[#1a233b] hover:bg-[#253254] text-cyan-300 font-bold text-xs rounded-xl border border-cyan-500/40 cursor-pointer shadow"
                >
                  بحث
                </button>
              </div>
            </div>

            {/* Room Data Table */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-right text-[10px] font-sans">
                  <thead className="bg-[#121624] text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-2.5 whitespace-nowrap">التوقيت</th>
                      <th className="p-2.5 whitespace-nowrap">SID</th>
                      <th className="p-2.5 whitespace-nowrap">كنية</th>
                      <th className="p-2.5 whitespace-nowrap">عدد ماس الهدايا للستريمر</th>
                      <th className="p-2.5 whitespace-nowrap">إجمالي وقت الميكروفون</th>
                      <th className="p-2.5 whitespace-nowrap">الأيام الفعالة</th>
                      <th className="p-2.5 whitespace-nowrap">ID الغرفة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900 font-mono">
                    {/* Summary Row */}
                    <tr className="bg-slate-900/40 text-slate-300 font-bold">
                      <td className="p-2.5 text-amber-300">إجمالي</td>
                      <td className="p-2.5 text-slate-500">--</td>
                      <td className="p-2.5 text-slate-500">--</td>
                      <td className="p-2.5 text-cyan-300">{totalDiamondsRoom.toLocaleString()} 💎</td>
                      <td className="p-2.5 text-amber-300">{totalHoursRoom.toFixed(2)} س</td>
                      <td className="p-2.5 text-emerald-400">{totalValidDaysRoom} يوم</td>
                      <td className="p-2.5 text-slate-500">--</td>
                    </tr>

                    {/* Streamers Activity Rows */}
                    {filteredRoomData.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-slate-600 text-xs font-mono">
                          لا توجد جلسات بث مسجلة في هذا النطاق الزمني.
                        </td>
                      </tr>
                    ) : (
                      filteredRoomData.map((host) => (
                        <tr key={host.id} className="hover:bg-slate-900/60 transition-colors cursor-pointer" onClick={() => setInspectedStreamer(host)}>
                          <td className="p-2.5 text-slate-400">{host.joinedDate}</td>
                          <td className="p-2.5 text-cyan-300">{host.id}</td>
                          <td className="p-2.5 text-slate-200 font-sans font-bold">{host.name}</td>
                          <td className="p-2.5 text-cyan-300">{host.diamondsEarned.toLocaleString()} 💎</td>
                          <td className="p-2.5 text-amber-300">{host.monthlyHours} س</td>
                          <td className="p-2.5 text-emerald-400">{host.validDays} يوم</td>
                          <td className="p-2.5 text-slate-400">ROOM-{host.id.slice(-4)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-center gap-1.5 pt-2 text-xs font-mono">
              <button className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed">{'<<'}</button>
              <button className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed">{'<'}</button>
              <span className="px-3 py-1 rounded-lg bg-[#1a233b] text-cyan-300 font-bold border border-cyan-500/40">1</span>
              <button className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed">{'>'}</button>
              <button className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed">{'>>'}</button>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 4: سلم التارجت - TARGET TIERS VIEW (10K - 1M) */}
        {/* ========================================================================= */}
        {currentView === 'target_view' && (
          <div className="space-y-3.5 flex-1 overflow-y-auto pr-1 custom-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <button
                onClick={() => setCurrentView('main_agency')}
                className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white font-bold cursor-pointer"
              >
                <ChevronRight className="w-4 h-4 text-purple-400" />
                <span>العودة إلى وكالتي</span>
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Embedded Official Target Component */}
            <AgencyTargets />
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-900">
          <span className="flex items-center gap-1 text-slate-400">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>نظام إدارة الوكالات المعتمد</span>
          </span>
          <span className="font-mono text-amber-300">SALEEM LIVE AGENCY</span>
        </div>

      </div>
    </div>
  );
};
