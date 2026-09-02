import React, { useState, useRef } from 'react';
import { UserProfile, VoiceRoom } from '../types';
import { useI18n } from '../lib/i18n';
import {
  X,
  Mic,
  Lock,
  Globe,
  Plus,
  Sparkles,
  HelpCircle,
  Users,
  FileText,
  Armchair,
  ShieldCheck,
  Image as ImageIcon,
  ChevronRight,
  Camera,
  Upload,
} from 'lucide-react';

interface CreateRoomModalProps {
  user: UserProfile;
  onClose: () => void;
  onCreateRoomSuccess: (newRoom: VoiceRoom) => void;
  onOpenAdminPanel: () => void;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  user,
  onClose,
  onCreateRoomSuccess,
  onOpenAdminPanel,
}) => {
  const { t, dir } = useI18n();
  const [roomName, setRoomName] = useState('');
  const [description, setDescription] = useState('');
  const [seatCount, setSeatCount] = useState<number>(15);
  const [regionType, setRegionType] = useState<'arabic' | 'foreign'>('arabic');
  const [selectedCountry, setSelectedCountry] = useState<string>('السعودية 🇸🇦');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('العربية');
  const [privacyType, setPrivacyType] = useState<'public' | 'private'>('public');
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);

  const ARABIC_COUNTRIES = [
    'السعودية 🇸🇦',
    'الإمارات 🇦🇪',
    'مصر 🇪🇬',
    'الكويت 🇰🇼',
    'الأردن 🇯🇴',
    'العراق 🇮🇶',
    'المغرب 🇲🇦',
    'عُمان 🇴🇲',
    'البحرين 🇧🇭',
    'قطر 🇶🇦',
    'تونس 🇹🇳',
    'الجزائر 🇩🇿',
    'لبنان 🇱🇧',
    'فلسطين 🇵🇸',
    'سوريا 🇸🇾',
    'اليمن 🇾🇪',
  ];

  const FOREIGN_COUNTRIES = [
    'الولايات المتحدة 🇺🇸',
    'بريطانيا 🇬🇧',
    'تركيا 🇹🇷',
    'ألمانيا 🇩🇪',
    'فرنسا 🇫🇷',
    'كندا 🇨🇦',
    'إسبانيا 🇪🇸',
    'إيطاليا 🇮🇹',
    'البرازيل 🇧🇷',
    'روسيا 🇷🇺',
    'كوريا الجنوبية 🇰🇷',
    'اليابان 🇯🇵',
  ];

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const SEAT_OPTIONS = [10, 12, 14, 15, 20, 30];

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatarImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setCoverImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (user.hasActiveRoom) {
    return (
      <div dir={dir} className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 font-sans select-none">
        <div className="w-full max-w-sm bg-[#0d091a] border-2 border-amber-500/50 rounded-3xl p-6 shadow-2xl space-y-4 text-center my-auto animate-in zoom-in-95 duration-200 relative">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto text-3xl shadow-lg">
            🎙️
          </div>
          <h3 className="text-lg font-black text-white">لديك غرفة بالفعل!</h3>
          <p className="text-xs text-slate-300 font-medium leading-relaxed">
            لقد قمت بإنشاء غرفة سابقة باسم <span className="text-amber-300 font-bold">"{user.roomName || 'غرفتي الخاصة'}"</span>. يُسمح بإنشاء غرفة واحدة فقط لكل حساب.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={onClose}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-2xl transition-all shadow-lg text-xs"
            >
              حسناً، فهمت 👍
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validation (اسم الغرفة إجباري وحد أقصى 30 حرف)
    if (!roomName.trim()) {
      alert('⚠️ يرجى إدخال اسم الغرفة!');
      return;
    }

    if (roomName.trim().length > 30) {
      alert('⚠️ اسم الغرفة يجب ألا يتجاوز 30 حرفاً!');
      return;
    }

    // 2. Persistent Single Room Check Validation
    if (user.hasActiveRoom) {
      alert('⚠️ لديك غرفة مفعلة بالفعل مسبقاً! لا يمكنك إنشاء أكثر من غرفة واحدة لكل حساب.');
      return;
    }

    setIsSubmitting(true);

    // Simulated API POST Request & Agora RTC Channel Creation
    setTimeout(() => {
      const createdRoom: VoiceRoom = {
        id: `room-${Date.now()}`,
        title: roomName.trim(),
        announcement: description.trim() || 'أهلاً بكم في غرفتي الصوتية المباشرة!',
        hostId: user.id,
        ownerId: user.id,
        hostName: user.name,
        hostAvatar: avatarImage || user.avatar,
        coverImage: coverImage || avatarImage || user.avatar,
        category: 'غرف جديدة',
        tag: privacyType === 'public' ? 'عامة' : 'خاصة',
        level: 1,
        rank: 1,
        listenersCount: 1,
        diamonds: 0,
        createdAt: Date.now(),
        regionType: regionType,
        country: selectedCountry,
        language: selectedLanguage,
        hasFriendsInside: false,
        friendsCountInside: 0,
        backgroundUrl:
          coverImage ||
          'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
        isLockedWithPin: privacyType === 'private',
        pinCode: privacyType === 'private' ? '1234' : undefined,
        agoraChannel: `room-${Date.now()}`,
        mods: [],
        seats: Array.from({ length: seatCount }, (_, index) => {
          const seatNum = index + 1;
          return {
            seatId: seatNum,
            isHostSeat: seatNum === 1,
            isLocked: false,
            isMuted: false,
            points: 0,
          };
        }),
        messages: [
          {
            id: Date.now().toString(),
            senderName: 'نظام SALEEM',
            senderAvatar: '',
            text: `تم إنشاء الغرفة الصوتية وحجز ${seatCount} مقعد للبث المباشر بنجاح!`,
            timestamp: 'الآن',
            isSystemNotice: true,
          },
        ],
      };

      setIsSubmitting(false);
      onCreateRoomSuccess(createdRoom);
    }, 800);
  };

  return (
    <div dir={dir} className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 font-sans select-none overflow-y-auto">
      <div className="w-full max-w-md bg-[#0d091a] border-2 border-purple-500/40 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4 text-start my-auto animate-in zoom-in-95 duration-200 relative">
        
        {/* Hidden File Inputs */}
        <input
          type="file"
          ref={avatarInputRef}
          onChange={handleAvatarFileChange}
          accept="image/*"
          className="hidden"
        />
        <input
          type="file"
          ref={coverInputRef}
          onChange={handleCoverFileChange}
          accept="image/*"
          className="hidden"
        />

        {/* TOP SCREEN HEADER */}
        <div className="flex items-center justify-between pb-2 border-b border-purple-900/40">
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="text-center">
            <h2 className="font-black text-lg text-white">إنشاء غرفة</h2>
            <p className="text-[10px] text-purple-300">أنشئ غرفتك الصوتية الخاصة</p>
          </div>

          <button
            type="button"
            onClick={() => alert('تتيح لك هذه الشاشة تخصيص غرفتك الصوتية وعدد مقاعد المتحدثين وتحديد نوع الخصوصية.')}
            className="w-8 h-8 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 flex items-center justify-center cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>

        {/* CENTER CIRCULAR ROOM AVATAR HEADER */}
        <div className="flex flex-col items-center justify-center py-2">
          <div
            onClick={() => avatarInputRef.current?.click()}
            className="relative w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-purple-600 via-indigo-500 to-amber-400 shadow-2xl cursor-pointer hover:scale-105 transition-transform group"
          >
            <div className="w-full h-full rounded-full bg-[#170e2e] flex items-center justify-center overflow-hidden relative">
              {avatarImage ? (
                <img src={avatarImage} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-purple-900/80 to-indigo-950 flex items-center justify-center">
                  <Mic className="w-10 h-10 text-amber-400" />
                </div>
              )}
            </div>

            {/* Plus Badge */}
            <div className="absolute bottom-0 left-0 w-7 h-7 rounded-full bg-purple-600 border-2 border-[#0d091a] text-white flex items-center justify-center font-black text-sm shadow">
              <Plus className="w-4 h-4" />
            </div>
          </div>
          <span className="text-[10px] text-purple-300 mt-1.5">أيقونة الغرفة العلوية</span>
        </div>

        {/* FORM FIELDS */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. ROOM NAME (اسم الغرفة) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-200">
              <span className="flex items-center gap-1.5 text-purple-300">
                <Users className="w-4 h-4 text-purple-400" />
                <span>اسم الغرفة</span>
              </span>
            </div>

            <div className="relative bg-[#150f29] border border-purple-500/30 focus-within:border-purple-400 rounded-xl px-3 py-2.5 transition-colors flex items-center justify-between">
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value.slice(0, 30))}
                placeholder="مثال: دردشة الأصدقاء"
                className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                maxLength={30}
                required
              />
              <span className="font-mono text-[11px] text-slate-400 shrink-0 mr-2">
                {roomName.length}/30
              </span>
            </div>
          </div>

          {/* 2. ROOM DESCRIPTION (وصف الغرفة اختياري) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-200">
              <span className="flex items-center gap-1.5 text-purple-300">
                <FileText className="w-4 h-4 text-purple-400" />
                <span>وصف الغرفة (اختياري)</span>
              </span>
            </div>

            <div className="relative bg-[#150f29] border border-purple-500/30 focus-within:border-purple-400 rounded-xl px-3 py-2 transition-colors flex flex-col justify-between h-20">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 100))}
                placeholder="اكتب وصفاً مختصراً عن غرفتك..."
                className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none resize-none h-12"
                maxLength={100}
              />
              <div className="text-left">
                <span className="font-mono text-[10px] text-slate-400">
                  {description.length}/100
                </span>
              </div>
            </div>
          </div>

          {/* 3. REGION & COUNTRY (المنطقة والدولة: عربية أو أجنبية) */}
          <div className="space-y-2 bg-[#120c24] p-3 rounded-2xl border border-purple-500/20">
            <div className="flex items-center justify-between text-xs font-bold text-purple-300">
              <span className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-amber-400" />
                <span>تصنيف المنطقة والدولة</span>
              </span>
            </div>

            {/* Region Type Switcher: Arabic vs Foreign */}
            <div className="grid grid-cols-2 gap-2 bg-[#1a1232] p-1 rounded-xl border border-purple-500/30">
              <button
                type="button"
                onClick={() => {
                  setRegionType('arabic');
                  setSelectedCountry('السعودية 🇸🇦');
                  setSelectedLanguage('العربية');
                }}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  regionType === 'arabic'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🇸🇦 دول عربية</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRegionType('foreign');
                  setSelectedCountry('الولايات المتحدة 🇺🇸');
                  setSelectedLanguage('English');
                }}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  regionType === 'foreign'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🌐 دول أجنبية</span>
              </button>
            </div>

            {/* Country Selector */}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-300 font-bold">الدولة المحددة:</span>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full bg-[#18112e] border border-purple-500/40 text-white text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400"
              >
                {(regionType === 'arabic' ? ARABIC_COUNTRIES : FOREIGN_COUNTRIES).map((c) => (
                  <option key={c} value={c} className="bg-slate-900 text-white font-bold py-1">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 4. SEAT COUNT (عدد المقاعد) */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
              <Armchair className="w-4 h-4 text-purple-400" />
              <span>عدد المقاعد</span>
            </div>

            <div className="grid grid-cols-6 gap-1.5">
              {SEAT_OPTIONS.map((num) => (
                <button
                  type="button"
                  key={num}
                  onClick={() => setSeatCount(num)}
                  className={`py-2 rounded-xl text-xs font-mono font-black transition-all cursor-pointer ${
                    seatCount === num
                      ? 'bg-purple-950/80 border-2 border-purple-500 text-purple-200 shadow-lg shadow-purple-500/30 scale-105'
                      : 'bg-[#150f29] border border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* 4. ROOM LANGUAGE (لغة الغرفة) */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
              <Globe className="w-4 h-4 text-purple-400" />
              <span>لغة الغرفة الصوتية</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'العربية', label: '🇸🇦 العربية' },
                { id: 'English', label: '🇬🇧 English' },
                { id: 'التركية', label: '🇹🇷 التركية' },
              ].map((lang) => (
                <button
                  type="button"
                  key={lang.id}
                  onClick={() => setSelectedLanguage(lang.id)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                    selectedLanguage === lang.id
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md border-amber-400'
                      : 'bg-[#150f29] border border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* 5. ROOM PRIVACY (نوع الغرفة) */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>نوع الغرفة</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Public Option */}
              <button
                type="button"
                onClick={() => setPrivacyType('public')}
                className={`p-3 rounded-2xl border text-right transition-all cursor-pointer relative flex flex-col justify-between h-24 ${
                  privacyType === 'public'
                    ? 'bg-purple-950/60 border-2 border-purple-500 shadow-md'
                    : 'bg-[#150f29] border-slate-800 hover:border-slate-700 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      privacyType === 'public'
                        ? 'border-purple-400 bg-purple-500 text-slate-950'
                        : 'border-slate-600'
                    }`}
                  >
                    {privacyType === 'public' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>

                  <div className="flex items-center gap-1 text-white font-black text-xs">
                    <span>عامة</span>
                    <Globe className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                </div>

                <p className="text-[10px] text-slate-300 leading-tight">
                  ستظهر غرفتك في القائمة ويمكن للجميع الانضمام
                </p>
              </button>

              {/* Private Option */}
              <button
                type="button"
                onClick={() => setPrivacyType('private')}
                className={`p-3 rounded-2xl border text-right transition-all cursor-pointer relative flex flex-col justify-between h-24 ${
                  privacyType === 'private'
                    ? 'bg-purple-950/60 border-2 border-purple-500 shadow-md'
                    : 'bg-[#150f29] border-slate-800 hover:border-slate-700 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      privacyType === 'private'
                        ? 'border-purple-400 bg-purple-500 text-slate-950'
                        : 'border-slate-600'
                    }`}
                  >
                    {privacyType === 'private' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>

                  <div className="flex items-center gap-1 text-white font-black text-xs">
                    <span>خاصة</span>
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                </div>

                <p className="text-[10px] text-slate-300 leading-tight">
                  غرفتك لن تظهر في القائمة ويحتاج الأعضاء لرابط للدخول
                </p>
              </button>
            </div>
          </div>

          {/* 5. ROOM COVER PHOTO (صورة الغرفة اختياري) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-purple-300">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-purple-400" />
                <span>صورة الغرفة (اختياري)</span>
              </span>
            </div>

            <div
              onClick={() => coverInputRef.current?.click()}
              className="border-2 border-dashed border-purple-500/40 hover:border-purple-400 bg-[#150f29] rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors relative overflow-hidden"
            >
              {coverImage ? (
                <div className="w-full h-20 rounded-xl overflow-hidden relative">
                  <img src={coverImage} alt="Ghaff" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-xs font-bold text-white">
                    انقر للتغيير 📷
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-9 h-9 rounded-xl bg-purple-900/50 border border-purple-500/40 text-purple-300 flex items-center justify-center">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-slate-300 font-bold">إضافة صورة للغرفة</span>
                </>
              )}
            </div>
          </div>

          {/* SUBMIT BUTTON (إنشاء الغرفة) */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-purple-500 to-amber-400 text-white font-black text-sm rounded-2xl shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-3"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>{isSubmitting ? 'جاري تجهيز وقناة البث...' : 'إنشاء الغرفة'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
