import React, { useState, useRef } from 'react';
import { VoiceRoom, UserProfile, MicSeat } from '../types';
import { SeatGridSettingsModal, SeatLayoutSelection } from './SeatGridSettingsModal';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Users,
  Mic,
  Lock,
  Unlock,
  Edit3,
  Check,
  UserPlus,
  UserX,
  Image as ImageIcon,
  Sparkles,
  Palette,
  Volume2,
  Trash2,
  Key,
  History,
  ShieldAlert,
  Crown,
  AlertCircle,
  Upload,
  Camera,
  Ban,
  Clock,
  UserMinus
} from 'lucide-react';


// Curated Luxury Room Covers
const PRESET_ROOM_COVERS = [
  { id: 'c1', title: 'سهرة VIP الملكية', url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80' },
  { id: 'c2', title: 'نيون ديسكو وفرفشة', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80' },
  { id: 'c3', title: 'طرب وعود أصيل', url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=500&auto=format&fit=crop&q=80' },
  { id: 'c4', title: 'قصر الملوك الذهبي', url: 'https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?w=500&auto=format&fit=crop&q=80' },
  { id: 'c5', title: 'مجرة الفضاء البنفسجية', url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80' },
  { id: 'c6', title: 'أجواء قهوة ودردشة', url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500&auto=format&fit=crop&q=80' },
];

// Curated Luxury Room Themes
const PRESET_ROOM_THEMES = [
  { id: 't1', name: 'القصر الذهبي الفاخر 🏛️', url: 'https://images.unsplash.com/photo-1519750157634-b6d493a0f77c?w=1080&auto=format&fit=crop&q=80', preview: 'bg-amber-950/80 border-amber-500' },
  { id: 't2', name: 'مجرة النجوم البنفسجية 🌌', url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1080&auto=format&fit=crop&q=80', preview: 'bg-purple-950/80 border-purple-500' },
  { id: 't3', name: 'شاطئ الغروب الاستوائي 🌅', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1080&auto=format&fit=crop&q=80', preview: 'bg-rose-950/80 border-rose-500' },
  { id: 't4', name: 'نيون السهرة VIP 🔥', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1080&auto=format&fit=crop&q=80', preview: 'bg-fuchsia-950/80 border-fuchsia-500' },
  { id: 't5', name: 'صالة الملوك المخملية 👑', url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1080&auto=format&fit=crop&q=80', preview: 'bg-indigo-950/80 border-indigo-500' },
  { id: 't6', name: 'أضواء طوكيو الليلية 🌃', url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1080&auto=format&fit=crop&q=80', preview: 'bg-cyan-950/80 border-cyan-500' },
  { id: 't7', name: 'الشفق القطبي الأخضر 💚', url: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?w=1080&auto=format&fit=crop&q=80', preview: 'bg-emerald-950/80 border-emerald-500' },
  { id: 't8', name: 'لهيب النار والحماس 💥', url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1080&auto=format&fit=crop&q=80', preview: 'bg-red-950/80 border-red-500' },
];

interface AuditLogEntry {
  id: string;
  user: string;
  role: 'المالك' | 'مدير' | 'مشرف';
  action: string;
  time: string;
}

interface RoomSettingsModalProps {
  room: VoiceRoom;
  user: UserProfile;
  onClose: () => void;
  onUpdateRoom: (updatedRoom: Partial<VoiceRoom>) => void;
}

export const RoomSettingsModal: React.FC<RoomSettingsModalProps> = ({
  room,
  user,
  onClose,
  onUpdateRoom,
}) => {
  // 1. Determine User Role & Permissions with comprehensive fallback compatibility
  const isOwner = Boolean(
    user.id === room.hostId ||
    (user.createdRoomId && room.id === user.createdRoomId) ||
    (room as any).ownerId === user.id ||
    (room as any).creatorId === user.id ||
    user.role === 'admin' ||
    user.role === 'owner'
  );

  const isManager = Boolean(
    isOwner ||
    room.mods?.includes(user.id) ||
    (user.name && room.mods?.includes(user.name)) ||
    (room as any).moderators?.includes(user.id) ||
    (user.name && (room as any).moderators?.includes(user.name)) ||
    (room as any).admins?.includes(user.id) ||
    (user.name && (room as any).admins?.includes(user.name)) ||
    (room as any).managers?.includes(user.id)
  );

  const userRole: 'المالك' | 'مدير' | 'مشرف' = isOwner ? 'المالك' : isManager ? 'مدير' : 'مشرف';

  // Navigation tab for settings vs audit log vs role permissions
  const [activeTab, setActiveTab] = useState<'settings' | 'audit' | 'roles'>('settings');

  // File Input References for Uploading
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const themeFileInputRef = useRef<HTMLInputElement>(null);

  // Sub-modal states
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showAddModModal, setShowAddModModal] = useState(false);
  const [showSeatSettingsModal, setShowSeatSettingsModal] = useState(false);

  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    {
      id: 'log-1',
      user: user.name || 'سالم (المالك)',
      role: 'المالك',
      action: 'فتح لوحة الإعدادات المتقدمة',
      time: 'الآن',
    },
  ]);

  // Toast alert
  const [authErrorMsg, setAuthErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const showToast = (msg: string, isError = false) => {
    if (isError) {
      setAuthErrorMsg(msg);
      setTimeout(() => setAuthErrorMsg(null), 3500);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const logAction = (actionText: string) => {
    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}`,
      user: user.name || 'سالم',
      role: userRole,
      action: actionText,
      time: 'الآن',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Helper function to check role permission
  const checkRoleAccess = (requiredRole: 'المالك' | 'مدير' | 'مشرف'): boolean => {
    // Room Owner always has full unrestricted access to everything!
    if (isOwner) return true;

    // Room Moderator/Manager has access to room settings (themes, cover, title, tag, announcement, welcome message, mic mode, auto-sit)
    if (requiredRole === 'مدير' || requiredRole === 'مشرف') {
      if (isManager) return true;
      showToast('⚠️ يتطلب هذا الإجراء صلاحيات مشرف الغرفة أو المالك.', true);
      return false;
    }

    // Owner-exclusive actions (Blacklist permanent ban, Removing other Mods, etc.)
    if (requiredRole === 'المالك') {
      showToast('⚠️ يتطلب هذا الإجراء صلاحيات مالك الغرفة فقط 👑 (القائمة السوداء وسحب الإشراف).', true);
      return false;
    }

    return true;
  };

  // State variables corresponding to room settings
  const [canManagerChangeLayout, setCanManagerChangeLayout] = useState<boolean>(
    room.managerPermissions?.canManageLayout ?? true
  );
  const [roomTitle, setRoomTitle] = useState(room.title);
  const [roomTag, setRoomTag] = useState(room.tag || 'دردشة ووناسة');
  const [announcement, setAnnouncement] = useState(room.announcement || 'أهلاً بكم في الغرفة الرسميّة ✨');
  const [welcomeMessage, setWelcomeMessage] = useState(room.welcomeMessage || '🖤✨ أهلاً بك في وكالة القلب الأسود! نورت الغرفة ✨🖤');
  const [isLockedWithPin, setIsLockedWithPin] = useState(Boolean(room.isLockedWithPin));
  const [pinCode, setPinCode] = useState(room.pinCode || '');
  const [tempPinInput, setTempPinInput] = useState(room.pinCode || '');
  const [seatCount, setSeatCount] = useState<number>(room.seats?.length || 20);
  const [autoSitEnabled, setAutoSitEnabled] = useState(room.autoSitEnabled !== false);
  const [entryPermission, setEntryPermission] = useState(room.entryPermission || 'عام');
  const [membershipFee, setMembershipFee] = useState(2000);
  const [coverImage, setCoverImage] = useState(room.coverImage || room.hostAvatar || PRESET_ROOM_COVERS[0].url);
  const [backgroundUrl, setBackgroundUrl] = useState(room.backgroundUrl || PRESET_ROOM_THEMES[0].url);

  // Real Moderators List from Room Data (no fake mocks)
  const [modsList, setModsList] = useState<string[]>(room.mods || []);
  const [newModIdInput, setNewModIdInput] = useState('');

  // Blacklist & 24h Kicked States from Room Data
  const [blackList, setBlackList] = useState<string[]>(room.blackList || (room as any).blacklistedUsers || []);
  const [kickedUsers, setKickedUsers] = useState<Record<string, { kickedAt: number; expiresAt: number; kickedBy?: string; reason?: string }>>(room.kickedUsers || {});
  const [showAddBlacklistModal, setShowAddBlacklistModal] = useState(false);
  const [newBlacklistIdInput, setNewBlacklistIdInput] = useState('');

  // Field editing sub-dialog state
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempInputValue, setTempInputValue] = useState('');

  // Handle Cover Photo Upload from Device
  const handleCoverFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const resultUrl = reader.result as string;
        setCoverImage(resultUrl);
        onUpdateRoom({ coverImage: resultUrl, hostAvatar: resultUrl });
        logAction('رفع وتغيير غلاف الغرفة من صور الجهاز 📸');
        showToast('✅ تم تحديث غلاف الغرفة بنجاح!');
        setShowCoverPicker(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Preset Cover Select
  const handleSelectPresetCover = (url: string, title: string) => {
    setCoverImage(url);
    onUpdateRoom({ coverImage: url, hostAvatar: url });
    logAction(`اختيار غلاف الغرفة: "${title}"`);
    showToast(`✅ تم اختيار غلاف: ${title}`);
    setShowCoverPicker(false);
  };

  // Handle Theme Background Upload from Device
  const handleThemeFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const resultUrl = reader.result as string;
        setBackgroundUrl(resultUrl);
        onUpdateRoom({ backgroundUrl: resultUrl });
        logAction('رفع خلفية مخصصة للغرفة من صور الجهاز 🎨');
        showToast('✅ تم تطبيق ثيم وخلفية الغرفة الجديدة بنجاح!');
        setShowThemePicker(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Preset Theme Select
  const handleSelectPresetTheme = (theme: typeof PRESET_ROOM_THEMES[0]) => {
    setBackgroundUrl(theme.url);
    onUpdateRoom({ backgroundUrl: theme.url });
    logAction(`تغيير ثيمة وخلفية الغرفة إلى "${theme.name}"`);
    showToast(`✅ تم تطبيق ثيمة: ${theme.name}`);
    setShowThemePicker(false);
  };

  // Handle PIN Save
  const handleSavePinCode = (lock: boolean, code: string) => {
    if (!checkRoleAccess('المالك')) return;
    if (lock && code.trim().length < 4) {
      showToast('⚠️ يرجى إدخال رمز سري مكون من 4 أرقام على الأقل', true);
      return;
    }
    setIsLockedWithPin(lock);
    setPinCode(code);
    onUpdateRoom({
      isLockedWithPin: lock,
      pinCode: lock ? code : '',
    });
    logAction(lock ? `قفل الغرفة برمز سري (${code}) 🔒` : 'فتح الغرفة للجميع وإلغاء القفل 🔓');
    showToast(lock ? `🔒 تم قفل الغرفة برمز سري: ${code}` : '🔓 تم فتح الغرفة للجميع!');
    setShowPinModal(false);
  };

  // Handle Moderator Add
  const handleAddModerator = (userIdToAdd: string) => {
    if (!checkRoleAccess('المالك')) return;
    const cleanId = userIdToAdd.trim();
    if (!cleanId) {
      showToast('⚠️ يرجى إدخال معرف المستخدم أو اختياره', true);
      return;
    }
    if (modsList.includes(cleanId)) {
      showToast('⚠️ هذا المستخدم مشرف بالفعل في الغرفة', true);
      return;
    }
    const updated = [...modsList, cleanId];
    setModsList(updated);
    onUpdateRoom({ mods: updated });
    logAction(`تعيين المستخدم (${cleanId}) كمشرف بالغرفة 🛡️`);
    showToast(`🛡️ تم تعيين المشرف (${cleanId}) بنجاح!`);
    setNewModIdInput('');
    setShowAddModModal(false);
  };

  // Handle Moderator Remove
  const handleRemoveModerator = (modIdToRemove: string) => {
    if (!checkRoleAccess('المالك')) return;
    const updated = modsList.filter((id) => id !== modIdToRemove);
    setModsList(updated);
    onUpdateRoom({ mods: updated });
    logAction(`سحب رتبة الإشراف من (${modIdToRemove}) ❌`);
    showToast(`❌ تم سحب الإشراف من (${modIdToRemove})`);
  };

  // Handle Add User to Blacklist (Permanent Ban - Owner Only)
  const handleAddToBlacklist = (userIdToBan: string, userName?: string) => {
    if (!checkRoleAccess('المالك')) return;
    const cleanId = userIdToBan.trim();
    if (!cleanId) {
      showToast('⚠️ يرجى إدخال معرّف المستخدم (ID) للحظر', true);
      return;
    }
    if (cleanId === room.hostId) {
      showToast('⚠️ لا يمكن حظر مالك الغرفة!', true);
      return;
    }
    if (blackList.includes(cleanId)) {
      showToast('⚠️ هذا المستخدم محظور بالفعل في القائمة السوداء', true);
      return;
    }

    const updatedBlacklist = [...blackList, cleanId];
    setBlackList(updatedBlacklist);

    // If seated, unseat them
    const updatedSeats = (room.seats || []).map((s) =>
      s.speakerUser?.id === cleanId ? { ...s, speakerUser: undefined } : s
    );

    onUpdateRoom({
      blackList: updatedBlacklist,
      seats: updatedSeats,
    });

    logAction(`إضافة المستخدم (${userName || cleanId}) إلى القائمة السوداء والحظر الدائم ⛔`);
    showToast(`⛔ تم حظر المستخدم (${userName || cleanId}) وإضافته للقائمة السوداء`);
    setShowAddBlacklistModal(false);
    setNewBlacklistIdInput('');
  };

  // Handle Remove from Blacklist (Unban - Owner Only)
  const handleRemoveFromBlacklist = (userIdToRemove: string) => {
    if (!checkRoleAccess('المالك')) return;
    const updated = blackList.filter((id) => id !== userIdToRemove);
    setBlackList(updated);
    onUpdateRoom({ blackList: updated });
    logAction(`رفع الحظر عن المستخدم (${userIdToRemove}) وإزالته من القائمة السوداء 🔓`);
    showToast(`🔓 تم رفع الحظر وإزالة المستخدم (${userIdToRemove}) من القائمة السوداء بنجاح`);
  };

  // Handle Cancel 24-Hour Kick Early
  const handleRemoveFromKicked = (userIdToForgive: string) => {
    if (!checkRoleAccess('مدير')) return;
    const updatedKicked = { ...kickedUsers };
    delete updatedKicked[userIdToForgive];
    setKickedUsers(updatedKicked);
    onUpdateRoom({ kickedUsers: updatedKicked });
    logAction(`إلغاء طرد المستخدم (${userIdToForgive}) قبل انتهاء 24 ساعة 🔓`);
    showToast(`🔓 تم إلغاء الطرد عن المستخدم (${userIdToForgive}) والسماح له بالدخول`);
  };

  const handleSaveSeatLayout = (layout: SeatLayoutSelection) => {
    setSeatCount(layout.count);
    const currentSeats = room.seats || [];
    const newSeats: MicSeat[] = Array.from({ length: layout.count }, (_, index) => {
      const seatNum = index + 1;
      const existing = currentSeats.find((s) => s.seatId === seatNum);
      if (existing) {
        return {
          ...existing,
          isHostSeat: layout.type === 'boss' && seatNum === 1 ? true : existing.isHostSeat,
        };
      }
      return {
        seatId: seatNum,
        isHostSeat: layout.type === 'boss' && seatNum === 1,
        isLocked: false,
        isMuted: false,
        points: 0,
      };
    });

    onUpdateRoom({
      seats: newSeats,
      seatLayout: layout,
    });

    logAction(`تغيير تصميم المقاعد إلى (${layout.type === 'boss' ? 'مايك البوس' : 'مايك أساسي'}) - ${layout.count} مقعد`);
    showToast('✅ تم حفظ هيكلية وتنسيق المقاعد الجديد!');
    setShowSeatSettingsModal(false);
  };

  const handleSaveField = (fieldKey: string) => {
    if (fieldKey === 'title') {
      if (!checkRoleAccess('مدير')) return;
      setRoomTitle(tempInputValue);
      onUpdateRoom({ title: tempInputValue });
      logAction(`تغيير اسم الغرفة إلى "${tempInputValue}"`);
      showToast('✅ تم تحديث اسم الغرفة بنجاح');
    } else if (fieldKey === 'tag') {
      if (!checkRoleAccess('مدير')) return;
      setRoomTag(tempInputValue);
      onUpdateRoom({ tag: tempInputValue });
      logAction(`تحديث موضوع الغرفة إلى "${tempInputValue}"`);
      showToast('✅ تم تحديث تصنيف وموضوع الغرفة');
    } else if (fieldKey === 'announcement') {
      if (!checkRoleAccess('مدير')) return;
      setAnnouncement(tempInputValue);
      onUpdateRoom({ announcement: tempInputValue });
      logAction('تحديث إعلان الغرفة الرسمي');
      showToast('✅ تم تحديث الإعلان الرسمي');
    } else if (fieldKey === 'welcomeMessage') {
      if (!checkRoleAccess('مدير')) return;
      setWelcomeMessage(tempInputValue);
      onUpdateRoom({ welcomeMessage: tempInputValue });
      logAction('تحديث رسالة الترحيب للغرفة');
      showToast('✅ تم تحديث رسالة الترحيب للزوار');
    }
    setEditingField(null);
  };

  // Find real potential candidates from current seats
  const roomAttendees = (room.seats || [])
    .map((s) => s.speakerUser)
    .filter((u): u is UserProfile => Boolean(u && u.id !== room.hostId && !modsList.includes(u.id)));

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center font-sans dir-rtl animate-fadeIn text-white">
      {/* Background click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Hidden File Inputs for Cover & Theme */}
      <input
        ref={coverFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleCoverFileUpload}
        className="hidden"
      />
      <input
        ref={themeFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleThemeFileUpload}
        className="hidden"
      />

      {/* Main Settings Panel Modal */}
      <div className="relative z-10 w-full max-w-md bg-[#121214] border-t sm:border border-purple-500/40 sm:rounded-3xl rounded-t-3xl shadow-2xl p-4 space-y-3 max-h-[92vh] overflow-y-auto no-scrollbar">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1.5 text-base font-black text-slate-100">
            <ChevronRight className="w-5 h-5 text-amber-400" />
            <h2>إعدادات الغرفة المتقدمة</h2>
          </div>

          <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2 py-0.5 rounded-full text-[10px] font-bold">
            <Crown className="w-3 h-3" />
            <span>{userRole}</span>
          </div>
        </div>

        {/* Server Notification / Error Banners */}
        {authErrorMsg && (
          <div className="bg-red-950/90 border border-red-500/60 rounded-xl p-2.5 text-xs text-red-200 flex items-center gap-2 shadow-lg animate-bounce">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{authErrorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-950/90 border border-emerald-500/60 rounded-xl p-2.5 text-xs text-emerald-200 flex items-center gap-2 shadow-lg animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-[#1a1a1e] p-1 rounded-xl border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-1.5 rounded-lg transition-all ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            الإعدادات
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
              activeTab === 'audit'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>سجل الإجراءات</span>
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
              activeTab === 'roles'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>الصلاحيات</span>
          </button>
        </div>

        {/* TAB 1: MAIN SETTINGS */}
        {activeTab === 'settings' && (
          <div className="space-y-4 pt-1">
            {/* SECTION 1: معلومات أساسية (Basic Info) */}
            <div className="space-y-1">
              <h3 className="text-xs font-black text-amber-300 px-1 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>معلومات أساسية</span>
              </h3>

              <div className="bg-[#1f1f23] rounded-2xl border border-purple-500/20 divide-y divide-slate-800/60 overflow-hidden shadow-lg">
                {/* 1. اسم الغرفة */}
                <div
                  onClick={() => {
                    if (!checkRoleAccess('مدير')) return;
                    setEditingField('title');
                    setTempInputValue(roomTitle);
                  }}
                  className="flex items-center justify-between p-3 hover:bg-slate-800/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-1 text-slate-400">
                    <ChevronLeft className="w-4 h-4" />
                    <span className="text-xs font-black text-amber-300 line-clamp-1 max-w-[180px]">
                      {roomTitle}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-slate-200">اسم الغرفة</span>
                </div>

                {/* 2. موضوع الغرفة */}
                <div
                  onClick={() => {
                    if (!checkRoleAccess('مدير')) return;
                    setEditingField('tag');
                    setTempInputValue(roomTag);
                  }}
                  className="flex items-center justify-between p-3 hover:bg-slate-800/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-1 text-slate-400">
                    <ChevronLeft className="w-4 h-4" />
                    <span className="text-xs font-bold text-purple-300 bg-purple-900/40 px-2 py-0.5 rounded-md border border-purple-500/30">
                      {roomTag}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-slate-200">موضوع الغرفة</span>
                </div>

                {/* 3. إعلان الغرفة */}
                <div
                  onClick={() => {
                    if (!checkRoleAccess('مدير')) return;
                    setEditingField('announcement');
                    setTempInputValue(announcement);
                  }}
                  className="flex items-center justify-between p-3 hover:bg-slate-800/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-1 text-slate-400 max-w-[200px]">
                    <ChevronLeft className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-medium text-slate-300 line-clamp-1">
                      {announcement}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-slate-200">إعلان الغرفة</span>
                </div>

                {/* 4. غلاف الغرفة (Active Real Picker & Upload) */}
                <div
                  onClick={() => {
                    if (!checkRoleAccess('مدير')) return;
                    setShowCoverPicker(true);
                  }}
                  className="flex items-center justify-between p-3 hover:bg-purple-950/30 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <ChevronLeft className="w-4 h-4 text-purple-400 group-hover:text-amber-300 transition-colors" />
                    <div className="relative w-8 h-8 rounded-xl overflow-hidden border-2 border-amber-400/80 shadow-md">
                      <img
                        src={coverImage}
                        alt="Cover"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-200 block">غلاف الغرفة</span>
                    <span className="text-[10px] text-amber-400">انقر لتغيير الصورة أو الرفع 📸</span>
                  </div>
                </div>

                {/* 5. ثيمة الغرفة (Active Real Picker & Upload) */}
                <div
                  onClick={() => {
                    if (!checkRoleAccess('مدير')) return;
                    setShowThemePicker(true);
                  }}
                  className="flex items-center justify-between p-3 hover:bg-purple-950/30 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <ChevronLeft className="w-4 h-4 text-purple-400 group-hover:text-amber-300 transition-colors" />
                    <div className="w-8 h-8 rounded-xl overflow-hidden border border-purple-400 shadow-md relative">
                      <img
                        src={backgroundUrl}
                        alt="Theme"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20" />
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-200 block">ثيمة وخلفية الغرفة</span>
                    <span className="text-[10px] text-purple-300">10 خلفيات ملكية + رفع مخصص 🎨</span>
                  </div>
                </div>

                {/* 6. رسالة ترحيب (Active Real Welcome Broadcast) */}
                <div
                  onClick={() => {
                    if (!checkRoleAccess('مدير')) return;
                    setEditingField('welcomeMessage');
                    setTempInputValue(welcomeMessage);
                  }}
                  className="flex items-center justify-between p-3 hover:bg-slate-800/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-1 text-slate-400 max-w-[200px]">
                    <ChevronLeft className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-medium text-slate-300 line-clamp-1">
                      "{welcomeMessage}"
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-medium text-slate-200 block">رسالة الترحيب</span>
                    <span className="text-[9px] text-slate-400">تظهر تلقائياً للزوار بالشات</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: طاقم المشرفين الحقيقيين (Real Moderators List) */}
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between px-1 mb-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!checkRoleAccess('المالك')) return;
                    setShowAddModModal(true);
                  }}
                  className="text-xs font-black text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/30 shadow active:scale-95 transition-transform cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ إضافة مشرف</span>
                </button>
                <h3 className="text-xs font-black text-purple-300 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>المشرفون والإدارة ({modsList.length})</span>
                </h3>
              </div>

              <div className="bg-[#1f1f23] rounded-2xl border border-purple-500/20 p-3 space-y-2.5 shadow-lg">
                {/* Host Card */}
                <div className="flex items-center justify-between p-2.5 bg-slate-900/90 border border-amber-500/30 rounded-xl">
                  <div className="flex items-center gap-1 text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                    <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>صاحب الغرفة (المالك)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-xs font-black text-white">{room.hostName || user.name}</p>
                      <p className="text-[9px] text-slate-400 font-mono">ID: {room.hostId.slice(-6)}</p>
                    </div>
                    <img
                      src={room.hostAvatar || user.avatar}
                      alt={room.hostName}
                      className="w-9 h-9 rounded-full object-cover border-2 border-amber-400 shadow"
                    />
                  </div>
                </div>

                {/* Moderators List */}
                {modsList.length === 0 ? (
                  <div className="text-center py-4 px-2 bg-slate-900/40 rounded-xl border border-dashed border-slate-800 space-y-1">
                    <p className="text-xs text-slate-400 font-medium">لا يوجد مشرفين حالياً في الغرفة</p>
                    <p className="text-[10px] text-slate-500">اضغط على زر [+ إضافة مشرف] لتعيين أحد الحاضرين كمشرف معتمد.</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {modsList.map((modId) => {
                      const speakerOnSeat = (room.seats || []).find((s) => s.speakerUser?.id === modId)?.speakerUser;
                      const modName = speakerOnSeat?.name || `مشرف #${modId.slice(-4)}`;
                      const modAvatar = speakerOnSeat?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';

                      return (
                        <div
                          key={modId}
                          className="flex items-center justify-between p-2 bg-slate-900/80 border border-purple-500/30 rounded-xl hover:border-amber-400/40 transition-all"
                        >
                          {isOwner && (
                            <button
                              type="button"
                              onClick={() => handleRemoveModerator(modId)}
                              className="px-2 py-1 bg-red-950/60 hover:bg-red-900 text-red-300 hover:text-white border border-red-500/40 rounded-lg text-[10px] font-black flex items-center gap-1 active:scale-95 transition-all shadow"
                              title="سحب الإشراف"
                            >
                              <UserX className="w-3 h-3" />
                              <span>إزالة</span>
                            </button>
                          )}
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <p className="text-xs font-bold text-white">{modName}</p>
                              <p className="text-[9px] text-purple-300 font-mono">مشرف • ID: {modId.slice(-5)}</p>
                            </div>
                            <img
                              src={modAvatar}
                              alt={modName}
                              className="w-8 h-8 rounded-full object-cover border border-purple-400 shadow"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 3: المايك والجلوس التلقائي (Mic & Auto Sit) */}
            <div className="space-y-1 pt-1">
              <h3 className="text-xs font-black text-amber-300 px-1 mb-2 flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-amber-400" />
                <span>إعدادات المايك والمقاعد</span>
              </h3>

              <div className="bg-[#1f1f23] rounded-2xl border border-purple-500/20 p-3 space-y-3 shadow-lg">
                {/* مقعد ميكروفون */}
                <div
                  onClick={() => setShowSeatSettingsModal(true)}
                  className="flex items-center justify-between cursor-pointer hover:bg-slate-800/40 p-1.5 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-1 text-slate-400">
                    <ChevronLeft className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-black text-amber-300">
                      {room.seatLayout ? (room.seatLayout.type === 'boss' ? 'مايك البوس الملكي' : 'القالب الأساسي') : 'القالب الأساسي'} ({seatCount} مقعد)
                    </span>
                  </div>
                  <span className="text-xs font-medium text-slate-200">هيكلية وتنسيق المقاعد</span>
                </div>

                {/* الجلوس التلقائي Toggle Switch */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      if (!checkRoleAccess('مدير')) return;
                      const nextVal = !autoSitEnabled;
                      setAutoSitEnabled(nextVal);
                      onUpdateRoom({ autoSitEnabled: nextVal });
                      logAction(`${nextVal ? 'تفعيل' : 'إيقاف'} خاصية الجلوس التلقائي المباشر`);
                      showToast(nextVal ? '🔓 تم تفعيل الجلوس المباشر للجمهور' : '🔒 تم تفعيل نظام طلب الإذن للصعود');
                    }}
                    className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-300 cursor-pointer ${
                      autoSitEnabled ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                        autoSitEnabled ? '-translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-200 block">الجلوس التلقائي المباشر</span>
                    <span className="text-[10px] text-slate-400">
                      {autoSitEnabled ? 'مفعل (صعود مباشر بدون طلب)' : 'معطل (يتطلب موافقة المضيف)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 4: صلاحيات الدخول وقفل الغرفة */}
            <div className="space-y-1 pt-1 pb-4">
              <h3 className="text-xs font-black text-purple-300 px-1 mb-2">إعدادات وصلاحيات الدخول</h3>

              <div className="bg-[#1f1f23] rounded-2xl border border-purple-500/20 divide-y divide-slate-800/60 overflow-hidden shadow-lg">
                {/* صلاحيات الدخول إلى الغرفة (عامة / مقفلة برمز سري) */}
                <div
                  onClick={() => {
                    if (!checkRoleAccess('مدير')) return;
                    setTempPinInput(pinCode);
                    setShowPinModal(true);
                  }}
                  className="flex items-center justify-between p-3 hover:bg-slate-800/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <ChevronLeft className="w-4 h-4 text-slate-400" />
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border shadow-sm ${
                      isLockedWithPin
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}>
                      {isLockedWithPin ? `🔒 مقفلة برمز (${pinCode || '****'})` : '🌐 عامة ومفتوحة'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-medium text-slate-200 block">صلاحيات الدخول إلى الغرفة</span>
                    <span className="text-[10px] text-slate-400">
                      {isLockedWithPin ? 'دخول الأعضاء يتطلب الرمز السري 🔐' : 'مفتوحة للجميع بدون أي رمز سري 🌐'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 5: القائمة السوداء والمحظورين نهائياً (حصري لصاحب الغرفة فقط 👑) */}
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between px-1 mb-2">
                {isOwner && (
                  <button
                    type="button"
                    onClick={() => setShowAddBlacklistModal(true)}
                    className="text-xs font-black text-rose-400 hover:text-rose-300 flex items-center gap-1 bg-rose-500/10 px-2.5 py-1 rounded-xl border border-rose-500/30 shadow active:scale-95 transition-transform cursor-pointer"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>+ حظر مستخدم</span>
                  </button>
                )}
                <h3 className="text-xs font-black text-rose-300 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span>القائمة السوداء والحظر الدائم {isOwner ? `(${blackList.length})` : '(خاص بالمالك 👑)'}</span>
                </h3>
              </div>

              {!isOwner ? (
                <div className="bg-[#1f1f23] rounded-2xl border border-rose-500/20 p-4 text-center space-y-1.5 shadow-lg">
                  <div className="flex items-center justify-center gap-1.5 text-rose-300 text-xs font-black">
                    <Lock className="w-4 h-4 text-rose-400" />
                    <span>صلاحية حصرية لمالك الغرفة فقط 👑</span>
                  </div>
                  <p className="text-[10px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                    لا يمكن للمشرفين رؤية أو تعديل القائمة السوداء أو رفع الحظر. هذه الصلاحية مخصصة حصرياً لصاحب الغرفة لحماية أمان الأعضاء.
                  </p>
                </div>
              ) : (
                <div className="bg-[#1f1f23] rounded-2xl border border-rose-500/30 p-3 space-y-2 shadow-lg">
                  {blackList.length === 0 ? (
                    <div className="text-center py-4 px-2 bg-slate-900/40 rounded-xl border border-dashed border-slate-800 space-y-1">
                      <p className="text-xs text-slate-400 font-medium">لا يوجد مستخدمين محظورين حالياً في القائمة السوداء</p>
                      <p className="text-[10px] text-slate-500">المستخدم المحظور لا يمكنه دخول الغرفة نهائياً إلا إذا تم رفع الحظر عنه من قبلك.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {blackList.map((bId) => {
                        const bName = `مستخدم محظور #${bId.slice(-4)}`;
                        const bAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';

                        return (
                          <div
                            key={bId}
                            className="flex items-center justify-between p-2 bg-slate-900/90 border border-rose-500/30 rounded-xl hover:border-rose-400 transition-all"
                          >
                            <button
                              type="button"
                              onClick={() => handleRemoveFromBlacklist(bId)}
                              className="px-2.5 py-1 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 hover:text-white border border-emerald-500/40 rounded-lg text-[10px] font-black flex items-center gap-1 active:scale-95 transition-all shadow cursor-pointer"
                              title="رفع الحظر والسماح بالدخول"
                            >
                              <Unlock className="w-3 h-3" />
                              <span>رفع الحظر 🔓</span>
                            </button>
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <p className="text-xs font-bold text-white">{bName}</p>
                                <p className="text-[9px] text-rose-300 font-mono">محظور نهائياً ⛔ • ID: {bId.slice(-6)}</p>
                              </div>
                              <img
                                src={bAvatar}
                                alt={bName}
                                className="w-8 h-8 rounded-full object-cover border border-rose-500 shadow"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SECTION 6: المطرودون لمدة 24 ساعة (24-Hour Temporary Kicks) */}
            <div className="space-y-1 pt-1 pb-4">
              <div className="flex items-center justify-between px-1 mb-2">
                <span className="text-[10px] text-amber-300/80 font-mono">طرد تلقائي مؤقت</span>
                <h3 className="text-xs font-black text-amber-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>المطرودون مؤقتاً (24 ساعة) ({Object.entries(kickedUsers).filter(([_, info]) => Boolean((info as any)?.expiresAt && (info as any).expiresAt > Date.now())).length})</span>
                </h3>
              </div>

              <div className="bg-[#1f1f23] rounded-2xl border border-amber-500/30 p-3 space-y-2 shadow-lg">
                {Object.entries(kickedUsers).filter(([_, info]) => Boolean((info as any)?.expiresAt && (info as any).expiresAt > Date.now())).length === 0 ? (
                  <div className="text-center py-3.5 px-2 bg-slate-900/40 rounded-xl border border-dashed border-slate-800 space-y-1">
                    <p className="text-xs text-slate-400 font-medium">لا يوجد مطرودون مؤقتاً حالياً</p>
                    <p className="text-[10px] text-slate-500">عند طرد أي شخص يتم منعه من الدخول لمدة 24 ساعة ثم يُرفع تلقائياً.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(kickedUsers)
                      .filter(([_, info]) => Boolean((info as any)?.expiresAt && (info as any).expiresAt > Date.now()))
                      .map(([kId, kInfo]) => {
                        const kName = `مستخدم مطرود #${kId.slice(-4)}`;
                        const kAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
                        
                        const remainingMs = Math.max(0, (kInfo as any).expiresAt - Date.now());
                        const remHours = Math.floor(remainingMs / (1000 * 60 * 60));
                        const remMins = Math.ceil((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

                        return (
                          <div
                            key={kId}
                            className="flex items-center justify-between p-2 bg-slate-900/90 border border-amber-500/30 rounded-xl hover:border-amber-400 transition-all"
                          >
                            <button
                              type="button"
                              onClick={() => handleRemoveFromKicked(kId)}
                              className="px-2.5 py-1 bg-amber-950/80 hover:bg-amber-900 text-amber-300 hover:text-white border border-amber-500/40 rounded-lg text-[10px] font-black flex items-center gap-1 active:scale-95 transition-all shadow cursor-pointer"
                              title="إلغاء الطرد الفوري"
                            >
                              <Unlock className="w-3 h-3" />
                              <span>إلغاء الطرد 🔓</span>
                            </button>
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <p className="text-xs font-bold text-white">{kName}</p>
                                <p className="text-[9px] text-amber-300 font-mono">
                                  ⏱️ متبقي {remHours} س و {remMins} د • ID: {kId.slice(-6)}
                                </p>
                              </div>
                              <img
                                src={kAvatar}
                                alt={kName}
                                className="w-8 h-8 rounded-full object-cover border border-amber-400 shadow"
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AUDIT LOG (سجل الإجراءات) */}
        {activeTab === 'audit' && (
          <div className="space-y-3 pt-1 pb-4">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="text-slate-400">سجل التغييرات المعتمد والمحفوظ بالسيرفر</span>
              <span className="font-bold text-amber-400">{auditLogs.length} إجراء مسجل</span>
            </div>

            <div className="bg-[#1f1f23] rounded-2xl border border-slate-800/80 divide-y divide-slate-800/60 overflow-hidden">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3 space-y-1 text-right">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 dir-ltr text-[10px]">{log.time}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-200">{log.user}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                          log.role === 'المالك'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        }`}
                      >
                        {log.role}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-amber-200 font-medium leading-relaxed">
                    {log.action}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: ROLE PERMISSIONS MATRIX (جدول الصلاحيات) */}
        {activeTab === 'roles' && (
          <div className="space-y-3 pt-1 pb-4 text-xs">
            <div className="bg-[#1f1f23] rounded-2xl border border-slate-800/80 p-3 space-y-3">
              <h4 className="font-bold text-amber-300 text-sm border-b border-slate-800 pb-2">
                جدول الصلاحيات حسب الرتبة
              </h4>

              <div className="space-y-2.5">
                {/* 1. Owner */}
                <div className="p-3 bg-slate-900/90 rounded-2xl border border-amber-500/40 space-y-1.5 shadow">
                  <div className="flex items-center justify-between font-black text-amber-400">
                    <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/40">
                      صلاحيات كاملة 👑
                    </span>
                    <span>صاحب الغرفة (المالك)</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    التحكم الكامل: تعيين وسحب المشرفين، قفل الغرفة بالرمز السري، <strong className="text-rose-300">القائمة السوداء والحظر الدائم (حصرياً للمالك)</strong>، تعديل الاسم، الثيمات، المقاعد، وكافة الإعدادات.
                  </p>
                </div>

                {/* 2. Moderator */}
                <div className="p-3 bg-slate-900/90 rounded-2xl border border-purple-500/40 space-y-1.5 shadow">
                  <div className="flex items-center justify-between font-black text-purple-300">
                    <span className="text-[10px] bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-500/40">
                      إدارة الغرفة 🛡️
                    </span>
                    <span>المشرف المعين (Moderator)</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    تعديل اسم وموضوع الغرفة، تحديث الإعلان الرسمي، تغيير خلفية وثيمة وغلاف الغرفة، تعديل رسالة الترحيب، كتم المقاعد، والطرد المؤقت (24 ساعة).
                  </p>
                </div>

                {/* 3. Regular Audience */}
                <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between font-bold text-slate-400">
                    <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                      عضو عادي 👥
                    </span>
                    <span>المستمع / العضو</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    لا يمكنه فتح زر أو شاشة الإعدادات إطلاقاً. يقتصر دوره على الاستماع والمشاركة وإرسال الهدايا.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* SUB-MODAL 1: COVER PHOTO PICKER & UPLOAD DIALOG */}
        {/* ============================================================ */}
        {showCoverPicker && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
            <div className="w-full max-w-sm bg-[#160c24] border-2 border-amber-500/60 rounded-3xl p-4 space-y-3.5 text-right shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-amber-500/30 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-500/20 text-amber-300 rounded-xl border border-amber-400/40">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-white">تغيير غلاف الغرفة 📸</h3>
                    <p className="text-[9px] text-amber-200">اختر صورة جاهزة أو ارفع من جهازك</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCoverPicker(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Upload Custom File Button */}
              <button
                type="button"
                onClick={() => coverFileInputRef.current?.click()}
                className="w-full py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>رفع صورة من الاستوديو / الجهاز 📂</span>
              </button>

              {/* Preset Covers Grid */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-300">أو اختر من الأغلفة الملكية المقترحة:</span>
                <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto no-scrollbar pt-1">
                  {PRESET_ROOM_COVERS.map((cov) => (
                    <div
                      key={cov.id}
                      onClick={() => handleSelectPresetCover(cov.url, cov.title)}
                      className="group relative aspect-square rounded-2xl overflow-hidden border-2 border-purple-500/40 hover:border-amber-400 cursor-pointer transition-all active:scale-95 shadow"
                    >
                      <img src={cov.url} alt={cov.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1">
                        <span className="text-[8.5px] font-bold text-white leading-tight truncate">{cov.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* SUB-MODAL 2: THEME & BACKGROUND PICKER DIALOG */}
        {/* ============================================================ */}
        {showThemePicker && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
            <div className="w-full max-w-sm bg-[#160c24] border-2 border-purple-500/60 rounded-3xl p-4 space-y-3.5 text-right shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-purple-500/30 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-500/20 text-purple-300 rounded-xl border border-purple-400/40">
                    <Palette className="w-4 h-4 text-amber-300" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-white">ثيمات وخلفيات الغرفة 🎨</h3>
                    <p className="text-[9px] text-purple-200">اختر خلفية مميزة تتغير فورياً للجميع</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowThemePicker(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Upload Custom Theme Button */}
              <button
                type="button"
                onClick={() => themeFileInputRef.current?.click()}
                className="w-full py-3 bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>رفع خلفية مخصصة من الجهاز 🖼️</span>
              </button>

              {/* Preset Themes List */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-300">اختر من الـ 8 خلفيات الأسطورية:</span>
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto no-scrollbar pt-1">
                  {PRESET_ROOM_THEMES.map((thm) => (
                    <div
                      key={thm.id}
                      onClick={() => handleSelectPresetTheme(thm)}
                      className="group relative h-20 rounded-2xl overflow-hidden border-2 border-purple-500/40 hover:border-amber-400 cursor-pointer transition-all active:scale-95 shadow"
                    >
                      <img src={thm.url} alt={thm.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex items-end p-1.5">
                        <span className="text-[10px] font-black text-white leading-tight">{thm.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* SUB-MODAL 3: ROOM PIN CODE & PRIVACY LOCK DIALOG */}
        {/* ============================================================ */}
        {showPinModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
            <div className="w-full max-w-sm bg-[#160c24] border-2 border-amber-500/60 rounded-3xl p-4 space-y-3.5 text-right shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-amber-500/30 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-500/20 text-amber-300 rounded-xl border border-amber-400/40">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-white">صلاحيات الدخول وقفل الغرفة 🔐</h3>
                    <p className="text-[9px] text-amber-200">حدد ما إذا كانت الغرفة عامة ومفتوحة أو مقفلة برمز سري</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 pt-1">
                {/* Option 1: Public Room */}
                <div
                  onClick={() => setTempPinInput('')}
                  className={`p-3 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                    tempPinInput === ''
                      ? 'bg-emerald-950/60 border-emerald-400 text-white shadow'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Unlock className="w-4 h-4 text-emerald-400" />
                    <div className="text-right">
                      <p className="text-xs font-black text-white">غرفة عامة ومفتوحة 🌐</p>
                      <p className="text-[10px] text-slate-400">متاحة لجميع المستخدمين بدون أي رمز</p>
                    </div>
                  </div>
                  {tempPinInput === '' && <Check className="w-4 h-4 text-emerald-400" />}
                </div>

                {/* Option 2: Password PIN Protected */}
                <div
                  className={`p-3 rounded-2xl border-2 space-y-2 transition-all ${
                    tempPinInput !== '' || isLockedWithPin
                      ? 'bg-amber-950/50 border-amber-400 text-white shadow'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-400" />
                      <div className="text-right">
                        <p className="text-xs font-black text-amber-200">غرفة خاصة برمز سري 🔐</p>
                        <p className="text-[10px] text-amber-300/70">يتطلب من أي زائر إدخال الرمز للدخول</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-1">
                    <label className="block text-[10px] font-bold text-slate-300 mb-1">
                      أدخل رمز الدخول السري (4 أرقام):
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={tempPinInput}
                      onChange={(e) => setTempPinInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="مثال: 1234"
                      className="w-full bg-slate-950 border border-amber-500/50 rounded-xl p-2 text-center font-mono font-black text-base text-amber-300 tracking-widest focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Save PIN Actions */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleSavePinCode(true, tempPinInput || '1234')}
                    className="py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs rounded-xl shadow active:scale-95 transition-transform cursor-pointer"
                  >
                    🔒 قفل بالرمز
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSavePinCode(false, '')}
                    className="py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    🔓 فتح كعامة
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* SUB-MODAL 4: ADD MODERATOR REAL USER PICKER */}
        {/* ============================================================ */}
        {showAddModModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
            <div className="w-full max-w-sm bg-[#160c24] border-2 border-purple-500/60 rounded-3xl p-4 space-y-3.5 text-right shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-purple-500/30 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-500/20 text-purple-300 rounded-xl border border-purple-400/40">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-white">إضافة مشرف جديد 🛡️</h3>
                    <p className="text-[9px] text-purple-200">اختر من الحاضرين أو أدخل ID المستخدم</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddModModal(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Manual ID Input */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-[10px] font-bold text-slate-300">
                  أدخل معرف المستخدم (User ID):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newModIdInput}
                    onChange={(e) => setNewModIdInput(e.target.value)}
                    placeholder="مثال: 8829104 أو اسم الحساب"
                    className="flex-1 bg-slate-950 border border-purple-500/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 text-right"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddModerator(newModIdInput)}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs rounded-xl shadow active:scale-95 cursor-pointer shrink-0"
                  >
                    تعيين
                  </button>
                </div>
              </div>

              {/* Attendees List in Room */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-bold text-amber-300">أو اختر من المتواجدين على مقاعد الغرفة:</span>
                {roomAttendees.length === 0 ? (
                  <p className="text-[10px] text-slate-400 p-3 bg-slate-900/60 rounded-xl text-center border border-slate-800">
                    لا يوجد أعضاء آخرين على المقاعد حالياً. يمكنك كتابة ID المستخدم بالأعلى مباشرة.
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-44 overflow-y-auto no-scrollbar">
                    {roomAttendees.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between p-2 bg-slate-900/90 border border-slate-800 rounded-xl hover:border-amber-400/50 transition-all"
                      >
                        <button
                          type="button"
                          onClick={() => handleAddModerator(att.id)}
                          className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[10px] font-black shadow active:scale-95"
                        >
                          + تعيين مشرف
                        </button>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p className="text-xs font-bold text-white">{att.name}</p>
                            <p className="text-[9px] text-slate-400 font-mono">ID: {att.id.slice(-5)}</p>
                          </div>
                          <img src={att.avatar} alt={att.name} className="w-7 h-7 rounded-full object-cover border border-purple-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* SUB-MODAL 5: ADD TO BLACKLIST (PERMANENT BAN) USER PICKER */}
        {/* ============================================================ */}
        {showAddBlacklistModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
            <div className="w-full max-w-sm bg-[#180914] border-2 border-rose-500/60 rounded-3xl p-4 space-y-3.5 text-right shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-rose-500/30 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-rose-500/20 text-rose-300 rounded-xl border border-rose-400/40">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-white">حظر وإضافة للقائمة السوداء ⛔</h3>
                    <p className="text-[9px] text-rose-300">منع المستخدم من دخول الغرفة نهائياً</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddBlacklistModal(false)}
                  className="text-slate-400 hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Manual ID Input */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-[10px] font-bold text-slate-300">
                  أدخل معرف المستخدم (User ID) المراد حظره:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newBlacklistIdInput}
                    onChange={(e) => setNewBlacklistIdInput(e.target.value)}
                    placeholder="مثال: 8829104 أو اسم الحساب"
                    className="flex-1 bg-slate-950 border border-rose-500/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-400 text-right"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddToBlacklist(newBlacklistIdInput)}
                    className="px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 text-white font-black text-xs rounded-xl shadow active:scale-95 cursor-pointer shrink-0"
                  >
                    حظر نهائي
                  </button>
                </div>
              </div>

              {/* Attendees List in Room */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-bold text-rose-300">أو اختر من المتواجدين على مقاعد الغرفة:</span>
                {roomAttendees.length === 0 ? (
                  <p className="text-[10px] text-slate-400 p-3 bg-slate-900/60 rounded-xl text-center border border-slate-800">
                    لا يوجد أعضاء آخرين على المقاعد حالياً. يمكنك كتابة ID المستخدم بالأعلى مباشرة.
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-44 overflow-y-auto no-scrollbar">
                    {roomAttendees.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between p-2 bg-slate-900/90 border border-slate-800 rounded-xl hover:border-rose-400/50 transition-all"
                      >
                        <button
                          type="button"
                          onClick={() => handleAddToBlacklist(att.id, att.name)}
                          className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[10px] font-black shadow active:scale-95 cursor-pointer"
                        >
                          ⛔ حظر
                        </button>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p className="text-xs font-bold text-white">{att.name}</p>
                            <p className="text-[9px] text-slate-400 font-mono">ID: {att.id.slice(-5)}</p>
                          </div>
                          <img src={att.avatar} alt={att.name} className="w-7 h-7 rounded-full object-cover border border-rose-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal Generic Field Editor Input Dialog */}
        {editingField && (
          <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-sm bg-slate-900 border border-purple-500/50 rounded-2xl p-4 space-y-3 text-right shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-xs text-amber-300">
                  تعديل {editingField === 'title' ? 'اسم الغرفة' : editingField === 'tag' ? 'الموضوع' : editingField === 'announcement' ? 'الإعلان' : 'رسالة الترحيب'}
                </span>
                <button
                  type="button"
                  onClick={() => setEditingField(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {editingField === 'announcement' || editingField === 'welcomeMessage' ? (
                <textarea
                  rows={3}
                  value={tempInputValue}
                  onChange={(e) => setTempInputValue(e.target.value)}
                  className="w-full bg-slate-950 border border-purple-500/40 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400 text-right leading-relaxed"
                />
              ) : (
                <input
                  type="text"
                  value={tempInputValue}
                  onChange={(e) => setTempInputValue(e.target.value)}
                  className="w-full bg-slate-950 border border-purple-500/40 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400 text-right"
                />
              )}

              <button
                type="button"
                onClick={() => handleSaveField(editingField)}
                className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs shadow flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-transform"
              >
                <Check className="w-4 h-4" />
                <span>حفظ التعديلات بالسيرفر</span>
              </button>
            </div>
          </div>
        )}

        {/* Seat Layout Customization Modal */}
        {showSeatSettingsModal && (
          <SeatGridSettingsModal
            currentLayout={room.seatLayout || { type: 'basic', count: seatCount }}
            userLevel={user.vipLevel || 5}
            onSave={handleSaveSeatLayout}
            onClose={() => setShowSeatSettingsModal(false)}
          />
        )}
      </div>
    </div>
  );
};

