import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { updateUserLogoutStatusInFirebase } from '../lib/firebase';
import { AvatarWithFrame } from './AvatarWithFrame';
import { AVATAR_FRAMES } from '../data/framesData';
import { useI18n, SUPPORTED_LANGUAGES, AppLanguage } from '../lib/i18n';
import {
  Crown,
  Wallet,
  Shield,
  DollarSign,
  Settings,
  Camera,
  BadgeCheck,
  Plus,
  User,
  ShieldCheck,
  Award,
  Gift,
  HelpCircle,
  Info,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Copy,
  Check,
  Smartphone,
  Key,
  Globe,
  Sparkles,
  Flame,
  Car,
  Image as ImageIcon,
  Clock,
  ArrowRight,
  ArrowLeft,
  Briefcase,
  Target,
  ShoppingBag,
  Send,
  Heart
} from 'lucide-react';
import { AgencyCenterModal } from './agency/AgencyCenterModal';
import { HostTargetModal } from './agency/HostTargetModal';
import { BackpackModal } from './backpack/BackpackModal';
import { CosmeticsStoreModal } from './store/CosmeticsStoreModal';
import { SpecialIdStoreModal } from './store/SpecialIdStoreModal';

interface ProfileViewProps {
  user: UserProfile;
  onOpenCoinStore: () => void;
  onOpenVipModal: () => void;
  onOpenAdminPanel: () => void;
  onOpenWithdrawalModal: () => void;
  onUpdateUser?: (updatedProps: Partial<UserProfile>) => void;
  onBack?: () => void;
  onLogout?: () => void;
}

import { fetchUserRelationships } from '../lib/friendsService';

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onOpenCoinStore,
  onOpenVipModal,
  onOpenAdminPanel,
  onOpenWithdrawalModal,
  onUpdateUser,
  onBack,
  onLogout
}) => {
  const { language, setLanguage, t, currentOption, dir } = useI18n();

  // Active sub-modals state
  const [activeModal, setActiveModal] = useState<
    | 'settings'
    | 'personal_info'
    | 'security'
    | 'agency_center'
    | 'host_target'
    | 'backpack_inventory'
    | 'cosmetics_store'
    | 'special_id_store'
    | 'level_achievements'
    | 'gifts_history'
    | 'support'
    | 'about'
    | 'cp_space'
    | 'language'
    | 'logout_confirm'
    | null
  >(null);

  // Dynamic live relationship counts
  const [relationshipCounts, setRelationshipCounts] = useState<{ following: number; followers: number; friends: number }>({
    following: user.followingCount || 0,
    followers: user.followersCount || 0,
    friends: 0,
  });

  useEffect(() => {
    const loadCounts = async () => {
      if (!user.id) return;
      try {
        const data = await fetchUserRelationships(user.id);
        setRelationshipCounts({
          following: data.following.length,
          followers: data.followers.length,
          friends: data.friends.length,
        });
      } catch (e) {}
    };

    loadCounts();
    window.addEventListener('app:relationship-changed', loadCounts);
    return () => {
      window.removeEventListener('app:relationship-changed', loadCounts);
    };
  }, [user.id]);

  // Settings form state
  const [editName, setEditName] = useState(user.name);
  const [editBio, setEditBio] = useState(user.bio || 'Saleem Live ... Pure Voice Entertainment 💜');
  const [editAge, setEditAge] = useState('24');
  const [copiedId, setCopiedId] = useState(false);

  // Security 2FA and privacy persistent toggles
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(() => {
    return localStorage.getItem('saleem_2fa_enabled') === 'true';
  });
  const [hideOnlineStatus, setHideOnlineStatus] = useState<boolean>(() => {
    return localStorage.getItem('saleem_hide_online') === 'true';
  });

  // Support ticket state
  const [supportMessage, setSupportMessage] = useState('');
  const [submittedTickets, setSubmittedTickets] = useState<Array<{ id: string; msg: string; date: string }>>(() => {
    try {
      const saved = localStorage.getItem('saleem_support_tickets');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Toast notification inside profile
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCopyId = () => {
    navigator.clipboard?.writeText(user.id);
    setCopiedId(true);
    showToast(`${t('toastCopied')} ID: ${user.id}`);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Avatar upload mock handler
  const handleAvatarUpload = () => {
    const avatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80'
    ];
    const newAvatar = avatars[Math.floor(Math.random() * avatars.length)];
    if (onUpdateUser) {
      onUpdateUser({ avatar: newAvatar });
    }
    showToast(t('equippedSuccess'));
  };

  // Handle Security Toggle Saves
  const handleToggle2FA = (val: boolean) => {
    setTwoFactorEnabled(val);
    localStorage.setItem('saleem_2fa_enabled', String(val));
    showToast(val ? '2FA Enabled 🔒' : '2FA Disabled');
  };

  const handleToggleHideOnline = (val: boolean) => {
    setHideOnlineStatus(val);
    localStorage.setItem('saleem_hide_online', String(val));
    showToast(val ? 'Online status hidden 👻' : 'Online status visible 🟢');
  };

  // Handle Support ticket submission
  const handleSubmitTicket = () => {
    if (!supportMessage.trim()) return;
    const newTicket = {
      id: `TCK-${Date.now().toString().slice(-4)}`,
      msg: supportMessage.trim(),
      date: new Date().toLocaleDateString()
    };
    const updated = [newTicket, ...submittedTickets];
    setSubmittedTickets(updated);
    localStorage.setItem('saleem_support_tickets', JSON.stringify(updated));
    setSupportMessage('');
    showToast(t('ticketSentSuccess'));
    setActiveModal(null);
  };

  const ChevronIcon = dir === 'rtl' ? ChevronLeft : ChevronRight;
  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;

  return (
    <div id="saleem-profile-page" className="space-y-4 text-start pb-6 max-w-2xl mx-auto">
      
      {/* 1. TOP HEADER CONTROL BAR */}
      <div className="bg-slate-900/90 border border-purple-900/50 rounded-2xl p-3 flex items-center justify-between backdrop-blur-md shadow-lg sticky top-0 z-20">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition-all active:scale-95 cursor-pointer flex items-center gap-1"
          title={t('navHome')}
        >
          <BackIcon className="w-5 h-5" />
        </button>

        {/* Centered Page Title */}
        <div className="text-center">
          <h1 className="font-black text-base sm:text-lg text-white">{t('profileTitle')}</h1>
          <span className="text-[10px] text-amber-400 font-mono">{t('accountManagement')}</span>
        </div>

        {/* Gear Settings Button (⚙️) */}
        <button
          onClick={() => setActiveModal('settings')}
          className="p-2.5 rounded-xl bg-purple-900/60 hover:bg-purple-800 border border-purple-500/40 text-purple-200 transition-all active:scale-95 cursor-pointer"
          title={t('editProfile')}
        >
          <Settings className="w-5 h-5 text-amber-300 animate-spin-slow" />
        </button>
      </div>

      {/* 1. PERSONAL IDENTITY CARD */}
      <div className="relative bg-gradient-to-br from-purple-950 via-slate-900 to-slate-950 border-2 border-purple-500/40 rounded-3xl p-5 shadow-2xl space-y-4 overflow-hidden">
        {/* Background Glowing Watermark */}
        <div className="absolute -start-10 -top-10 w-40 h-40 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-start">
          {/* Avatar Container with Equipped Frame Overlay & Camera Button */}
          <div className="relative shrink-0 flex items-center justify-center">
            <AvatarWithFrame
              src={user.avatar}
              frameId={user.equippedFrame || undefined}
              size="2xl"
              onClick={handleAvatarUpload}
            />

            {/* Camera Icon Floating Button */}
            <button
              onClick={handleAvatarUpload}
              className="absolute -bottom-1 -start-1 bg-purple-600 hover:bg-purple-500 border-2 border-slate-950 text-white p-1.5 rounded-full shadow-lg transition-transform active:scale-90 cursor-pointer z-20"
              title={t('changeAvatar')}
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* User Meta Information */}
          <div className="flex-1 space-y-1.5">
            {/* Display Name & Verified Badge */}
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="font-black text-xl text-white tracking-wide">{user.name}</h2>
              <span className="p-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-400/40" title={t('verifiedAccount')}>
                <BadgeCheck className="w-5 h-5 text-purple-400 fill-purple-400/30" />
              </span>
              <button
                onClick={onOpenVipModal}
                className="bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 text-xs px-2.5 py-0.5 rounded-full font-bold border border-amber-400/40 flex items-center gap-1 cursor-pointer transition-transform active:scale-95"
              >
                <Crown className="w-3.5 h-3.5 text-amber-300" />
                <span>{user.vipRank || 'VIP'}</span>
              </button>
            </div>

            {/* Digital ID, Email & Hexagonal Level Badge Row */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
              {/* ID Badge with Copy Button */}
              <div
                onClick={handleCopyId}
                className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-700/80 hover:border-amber-400 px-3 py-1 rounded-full text-slate-300 font-mono text-[11px] cursor-pointer transition-colors"
                title={t('copyId')}
              >
                <span className="text-amber-400 font-bold">{t('idLabel')}</span>
                <span>{user.id}</span>
                {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              </div>

              {/* Email Badge if available */}
              {user.email && (
                <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-700 px-3 py-1 rounded-full text-slate-300 text-[11px]">
                  <span className="text-amber-400">✉️</span>
                  <span className="truncate max-w-[140px]">{user.email}</span>
                </div>
              )}

              {/* Level Badge */}
              <div className="flex items-center gap-1.5 bg-purple-900/80 border border-purple-500/60 px-3 py-1 rounded-full text-purple-200 font-black text-[11px] shadow">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                <span>Lvl {user.level || 42}</span>
              </div>

              {/* Agency Owner or Member Badge */}
              {(user.isAgencyOwner || user.agencyRole === 'owner') ? (
                <div className="flex items-center gap-1 bg-gradient-to-r from-amber-500/30 to-yellow-600/30 border border-amber-400/60 px-3 py-1 rounded-full text-amber-300 font-bold text-[11px] shadow">
                  <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                  <span>صاحب وكالة: {user.agencyName || 'وكالتي'} 👑</span>
                </div>
              ) : user.agencyName ? (
                <div className="flex items-center gap-1 bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border border-purple-400/40 px-3 py-1 rounded-full text-purple-200 font-bold text-[11px] shadow">
                  <Briefcase className="w-3.5 h-3.5 text-purple-300" />
                  <span>عضو وكالة: {user.agencyName}</span>
                </div>
              ) : null}
            </div>

            {/* Personal Status / Bio */}
            <p className="text-xs text-purple-200/90 italic pt-0.5 font-medium">
              "{user.bio || 'Saleem Live ... Pure Voice Entertainment 💜'}"
            </p>
          </div>
        </div>

        {/* Follow Stats Summary Row (Followers, Following, Friends) */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-purple-900/40 text-center text-xs">
          <div className="bg-slate-950/60 p-2 rounded-2xl border border-slate-800">
            <span className="text-slate-400 text-[10px] block">{t('followers')}</span>
            <span className="font-black text-amber-300 font-mono text-sm">
              {relationshipCounts.followers.toLocaleString()}
            </span>
          </div>
          <div className="bg-slate-950/60 p-2 rounded-2xl border border-slate-800">
            <span className="text-slate-400 text-[10px] block">{t('following')}</span>
            <span className="font-black text-cyan-300 font-mono text-sm">
              {relationshipCounts.following.toLocaleString()}
            </span>
          </div>
          <div className="bg-slate-950/60 p-2 rounded-2xl border border-slate-800">
            <span className="text-slate-400 text-[10px] block">الأصدقاء 🤝</span>
            <span className="font-black text-emerald-300 font-mono text-sm">
              {relationshipCounts.friends.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* 3. QUICK BALANCE WALLET CARD */}
      <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-purple-950/80 border-2 border-amber-500/50 p-4 rounded-3xl shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 font-black text-2xl shadow">
            🪙
          </div>
          <div>
            <span className="text-[11px] text-amber-200 font-bold block">{t('coinsBalance')}</span>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-2xl text-amber-300 font-mono">{user.coins.toLocaleString()}</span>
              <span className="text-xs text-amber-400 font-bold">{t('coinsGold')}</span>
            </div>
          </div>
        </div>

        {/* Recharge Button (+) */}
        <button
          onClick={onOpenCoinStore}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white font-black text-xs rounded-2xl shadow-lg transition-transform active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{t('recharge')}</span>
        </button>
      </div>

      {/* PROMINENT CASH WITHDRAWAL & DIAMONDS CARD */}
      <div
        onClick={onOpenWithdrawalModal}
        className="bg-gradient-to-r from-emerald-950 via-slate-900 to-amber-950/80 p-4 rounded-3xl border-2 border-amber-500/60 shadow-xl flex items-center justify-between cursor-pointer hover:border-amber-400 transition-all active:scale-98"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center font-black shadow-lg">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-black text-xs sm:text-sm text-amber-300">استبدال وسحب الألماسات 💎🪙</h3>
              <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.2 rounded-full font-bold">
                تحويل 25% ⚡
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-300">
              {t('diamondsBalance')}: <span className="font-bold text-cyan-300 font-mono">{user.diamonds.toLocaleString()} 💎</span>
            </p>
          </div>
        </div>

        <button className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs rounded-xl shadow-md hover:brightness-110 cursor-pointer whitespace-nowrap">
          استبدال / سحب
        </button>
      </div>

      {/* 🎯 HOST MONTHLY TARGET & EARNINGS CARD */}
      <div
        onClick={() => setActiveModal('host_target')}
        className="bg-gradient-to-r from-amber-950/80 via-purple-950/80 to-[#120a21] p-4 rounded-3xl border-2 border-amber-500/70 shadow-xl flex items-center justify-between cursor-pointer hover:border-amber-400 transition-all active:scale-98"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-500 text-slate-950 flex items-center justify-center font-black shadow-lg">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-black text-xs sm:text-sm text-amber-300">لوحة التارجت والأجور الشهرية 🎯</h3>
              <span className="text-[9px] bg-amber-500 text-slate-950 font-bold px-1.5 py-0.2 rounded-full">مباشر</span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-300">
              تارجت الشهر: <span className="font-bold text-amber-300 font-mono">💎 {Number(user.targetDiamonds || user.diamonds || 0).toLocaleString()}</span> • الراتب: <span className="font-bold text-emerald-400 font-mono">${((Number(user.targetDiamonds || user.diamonds || 0)) / 5000).toFixed(2)} USD</span>
            </p>
          </div>
        </div>

        <button className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs rounded-xl shadow-md hover:from-amber-400 hover:to-yellow-400 cursor-pointer whitespace-nowrap">
          عرض التارجت 📊
        </button>
      </div>

      {/* 💍 CP RELATIONSHIP & PARTNER SPACE */}
      <div className="bg-gradient-to-r from-pink-950/70 via-[#1e0a1e]/90 to-purple-950/70 border-2 border-pink-500/50 rounded-3xl p-3.5 shadow-[0_0_20px_rgba(236,72,153,0.2)] flex items-center justify-between relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center">
            {/* User Avatar */}
            <img
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-pink-400 z-10"
            />
            {/* Heart / Ring Center Badge */}
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center text-xs -mx-2 z-20 shadow-md border border-white">
              💍
            </div>
            {/* Partner Avatar or Add Placeholder */}
            {user.cpPartnerAvatar ? (
              <img
                src={user.cpPartnerAvatar}
                alt={user.cpPartnerName || 'Partner'}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-pink-400 z-10"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-dashed border-pink-400/60 flex items-center justify-center text-pink-300 text-xs font-bold">
                +CP
              </div>
            )}
          </div>

          <div className="text-start">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xs text-pink-200">
                {user.cpPartnerName ? `${t('cpPartner')}: ${user.cpPartnerName}` : t('cpSpaceTitle')}
              </span>
              <span className="text-[8.5px] bg-pink-500/20 text-pink-300 border border-pink-400/40 px-1.5 py-0.2 rounded-full font-mono font-bold">
                Lvl {user.cpLevel || 1}
              </span>
            </div>
            <p className="text-[9.5px] text-slate-300 mt-0.5">
              {t('cpPartnerDesc')}
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveModal('cp_space')}
          className="px-3 py-1.5 bg-gradient-to-r from-pink-600 to-rose-500 text-white font-bold text-xs rounded-xl shadow hover:brightness-110 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
        >
          {user.cpPartnerName ? t('cpSpace') : t('cpRequest')}
        </button>
      </div>

      {/* 4. ACCOUNT TOOLS & MODALS LIST */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-2 space-y-1.5 shadow-xl">
        <h3 className="px-3 pt-2 text-xs font-black text-purple-300">{t('accountOptions')}</h3>

        {/* 1. Personal Info */}
        <button
          onClick={() => setActiveModal('personal_info')}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800/80 transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300">
              <User className="w-5 h-5" />
            </div>
            <div className="text-start">
              <span className="font-bold text-xs text-white block group-hover:text-amber-300 transition-colors">{t('personalInfo')}</span>
              <span className="text-[10px] text-slate-400">{t('personalInfoDesc')}</span>
            </div>
          </div>
          <ChevronIcon className="w-5 h-5 text-slate-500 group-hover:text-amber-400 transition-colors" />
        </button>

        {/* 2. Security & Privacy */}
        <button
          onClick={() => setActiveModal('security')}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800/80 transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-start">
              <span className="font-bold text-xs text-white block group-hover:text-amber-300 transition-colors">{t('security')}</span>
              <span className="text-[10px] text-slate-400">{t('securityDesc')}</span>
            </div>
          </div>
          <ChevronIcon className="w-5 h-5 text-slate-500 group-hover:text-amber-400 transition-colors" />
        </button>

        {/* 3. Agency Center & Target */}
        <button
          onClick={() => setActiveModal('agency_center')}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-yellow-950/70 hover:bg-slate-800/80 border-2 border-amber-500/50 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 border border-amber-300/50 flex items-center justify-center text-slate-950 font-black shadow">
              <Briefcase className="w-5 h-5 text-slate-950" />
            </div>
            <div className="text-start">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xs text-amber-300 block group-hover:text-yellow-200 transition-colors">
                  {t('agencyCenter')} 🏢🎯
                </span>
                <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.2 rounded-full font-bold">
                  {t('agencies')}
                </span>
              </div>
              <span className="text-[10px] text-slate-300">{t('agencyCenterDesc')}</span>
            </div>
          </div>
          <ChevronIcon className="w-5 h-5 text-amber-400 group-hover:text-yellow-300 transition-colors" />
        </button>

        {/* 4. Full Backpack & Virtual Inventory Modal (الباك باك الشامل) */}
        <button
          onClick={() => setActiveModal('backpack_inventory')}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/60 to-slate-950/80 hover:bg-slate-800/80 border border-purple-500/40 transition-all cursor-pointer group shadow"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
              <Wallet className="w-5 h-5" />
            </div>
            <div className="text-start">
              <span className="font-bold text-xs text-purple-200 block group-hover:text-amber-300 transition-colors">
                {t('walletInventory')} 🧰
              </span>
              <span className="text-[10px] text-slate-400">{t('walletInventoryDesc')}</span>
            </div>
          </div>
          <ChevronIcon className="w-5 h-5 text-purple-400 group-hover:text-amber-400 transition-colors" />
        </button>

        {/* 5. Frames & Cosmetics Store (متجر التميز والإطارات والمركبات) */}
        <button
          onClick={() => setActiveModal('cosmetics_store')}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800/80 transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-pink-500/20 border border-pink-400/40 flex items-center justify-center text-pink-300">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="text-start">
              <span className="font-bold text-xs text-white block group-hover:text-amber-300 transition-colors">
                {t('cosmeticsStore')} 👑✨
              </span>
              <span className="text-[10px] text-slate-400">{t('cosmeticsStoreDesc')}</span>
            </div>
          </div>
          <ChevronIcon className="w-5 h-5 text-slate-500 group-hover:text-amber-400 transition-colors" />
        </button>

        {/* 5.2 Special VIP IDs Store (متجر المعرفات والأرقام الملكية) */}
        <button
          onClick={() => setActiveModal('special_id_store')}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/40 to-slate-950/80 hover:bg-slate-800/80 border border-amber-500/40 transition-all cursor-pointer group shadow"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Crown className="w-5 h-5" />
            </div>
            <div className="text-start">
              <span className="font-bold text-xs text-amber-300 block group-hover:text-yellow-200 transition-colors">
                {t('specialIdStore')} 💎
              </span>
              <span className="text-[10px] text-slate-400">شراء أرقام ومعرفات ملكية مميزة نادرة</span>
            </div>
          </div>
          <ChevronIcon className="w-5 h-5 text-amber-400 group-hover:text-yellow-300 transition-colors" />
        </button>

        {/* 6. Level & Achievements */}
        <button
          onClick={() => setActiveModal('level_achievements')}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800/80 transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Award className="w-5 h-5" />
            </div>
            <div className="text-start">
              <span className="font-bold text-xs text-white block group-hover:text-amber-300 transition-colors">{t('levelAchievements')}</span>
              <span className="text-[10px] text-slate-400">{t('levelAchievementsDesc')}</span>
            </div>
          </div>
          <ChevronIcon className="w-5 h-5 text-slate-500 group-hover:text-amber-400 transition-colors" />
        </button>

        {/* 7. Support & Help */}
        <button
          onClick={() => setActiveModal('support')}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800/80 transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div className="text-start">
              <span className="font-bold text-xs text-white block group-hover:text-amber-300 transition-colors">{t('support')}</span>
              <span className="text-[10px] text-slate-400">{t('supportDesc')}</span>
            </div>
          </div>
          <ChevronIcon className="w-5 h-5 text-slate-500 group-hover:text-amber-400 transition-colors" />
        </button>

        {/* 8. Change App Language */}
        <button
          onClick={() => setActiveModal('language')}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800/80 transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Globe className="w-5 h-5" />
            </div>
            <div className="text-start">
              <span className="font-bold text-xs text-white block group-hover:text-amber-300 transition-colors">
                {t('languageSetting')}
              </span>
              <span className="text-[10px] text-slate-400">
                {currentOption.flag} {currentOption.nativeName} ({currentOption.name})
              </span>
            </div>
          </div>
          <ChevronIcon className="w-5 h-5 text-slate-500 group-hover:text-amber-400 transition-colors" />
        </button>

        {/* 9. About App */}
        <button
          onClick={() => setActiveModal('about')}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800/80 transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
              <Info className="w-5 h-5" />
            </div>
            <div className="text-start">
              <span className="font-bold text-xs text-white block group-hover:text-amber-300 transition-colors">{t('aboutApp')}</span>
              <span className="text-[10px] text-slate-400">{t('aboutAppDesc')}</span>
            </div>
          </div>
          <ChevronIcon className="w-5 h-5 text-slate-500 group-hover:text-amber-400 transition-colors" />
        </button>

        {/* 10. Admin Panel Link */}
        <button
          onClick={onOpenAdminPanel}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-red-950/30 hover:bg-red-900/40 border border-red-500/30 transition-all cursor-pointer group mt-2"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-400/40 flex items-center justify-center text-red-400">
              <Shield className="w-5 h-5" />
            </div>
            <div className="text-start">
              <span className="font-bold text-xs text-red-300 block">{t('adminPanelTitle')}</span>
              <span className="text-[10px] text-red-200/70">{t('adminPanelDesc')}</span>
            </div>
          </div>
          <ChevronIcon className="w-5 h-5 text-red-400" />
        </button>
      </div>

      {/* 5. BOTTOM EDGE LOGOUT BUTTON */}
      <div className="pt-2">
        <button
          onClick={() => setActiveModal('logout_confirm')}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-98 cursor-pointer border border-red-400/40"
        >
          <LogOut className="w-5 h-5" />
          <span>{t('logout')}</span>
        </button>
      </div>

      {/* ==================== SUB-MODALS ==================== */}

      {/* 🌐 LANGUAGE SELECTION MODAL */}
      {activeModal === 'language' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in duration-200 select-none">
          <div className="absolute inset-0" onClick={() => setActiveModal(null)} />
          <div className="w-full max-w-sm bg-[#150f29] border-2 border-amber-400/80 rounded-3xl p-4 sm:p-5 space-y-4 shadow-[0_0_40px_rgba(245,158,11,0.3)] relative z-10 text-start text-white">
            <div className="flex items-center justify-between border-b border-purple-900/50 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                  <Globe className="w-4 h-4" />
                </div>
                <h3 className="font-black text-sm text-amber-300">{t('changeLanguage')}</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-full bg-slate-900 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    showToast(`🌐 ${lang.nativeName}`);
                    setActiveModal(null);
                  }}
                  className={`w-full p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                    language === lang.code
                      ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-400 text-amber-300 shadow-md scale-[1.02]'
                      : 'bg-slate-900/70 border-slate-800 text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{lang.flag}</span>
                    <div className="text-start">
                      <p className="font-black text-xs text-white">{lang.nativeName}</p>
                      <p className="text-[10px] text-slate-400">{lang.name}</p>
                    </div>
                  </div>

                  {language === lang.code && (
                    <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs">
                      ✓
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 🧰 FULL BACKPACK & INVENTORY MODAL */}
      {activeModal === 'backpack_inventory' && (
        <BackpackModal
          user={user}
          isOpen={true}
          onClose={() => setActiveModal(null)}
          onUpdateUser={(updated) => {
            if (onUpdateUser) onUpdateUser(updated);
            showToast(t('equippedSuccess'));
          }}
          onOpenStore={() => {
            setActiveModal('cosmetics_store');
          }}
        />
      )}

      {/* 👑 COSMETICS & FRAMES STORE MODAL */}
      {activeModal === 'cosmetics_store' && (
        <CosmeticsStoreModal
          user={user}
          onClose={() => setActiveModal(null)}
          onUpdateCoins={(delta) => {
            if (onUpdateUser) onUpdateUser({ coins: Math.max(0, user.coins + delta) });
          }}
          onEquipFrame={(frameId) => {
            if (onUpdateUser) onUpdateUser({ equippedFrame: frameId });
            showToast(t('equippedSuccess'));
          }}
          onEquipVehicle={(vehicleId) => {
            if (onUpdateUser) onUpdateUser({ equippedEntrance: vehicleId });
            showToast(t('equippedSuccess'));
          }}
        />
      )}

      {/* 👑 SPECIAL VIP ID STORE MODAL */}
      {activeModal === 'special_id_store' && (
        <SpecialIdStoreModal
          user={user}
          onClose={() => setActiveModal(null)}
          onPurchaseId={(newId, cost) => {
            if (onUpdateUser) {
              onUpdateUser({
                id: newId,
                coins: Math.max(0, user.coins - cost),
              });
            }
            showToast(`تم تعيين المعرف الملكي الجديد: ID: ${newId} 👑`);
          }}
          onOpenCoinStore={onOpenCoinStore}
        />
      )}

      {/* 🏢 AGENCY CENTER MODAL */}
      {activeModal === 'agency_center' && (
        <AgencyCenterModal
          user={user}
          onClose={() => setActiveModal(null)}
          onUpdateDiamonds={(delta) => {
            if (onUpdateUser) {
              onUpdateUser({ diamonds: (user.diamonds || 0) + delta });
            }
          }}
          onUpdateCoins={(delta) => {
            if (onUpdateUser) {
              onUpdateUser({ coins: (user.coins || 0) + delta });
            }
          }}
          onOpenWithdrawal={() => {
            setActiveModal(null);
            onOpenWithdrawalModal();
          }}
          onUpdateUser={onUpdateUser}
        />
      )}

      {/* ⚙️ SETTINGS MODAL */}
      {activeModal === 'settings' && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-slate-900 to-purple-950 border-2 border-purple-500/60 rounded-3xl p-5 max-w-md w-full space-y-4 shadow-2xl text-start animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b border-purple-500/30 pb-3">
              <div className="flex items-center gap-2 text-purple-300 font-black text-sm">
                <Settings className="w-5 h-5 text-amber-300" />
                <span>{t('editProfile')}</span>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">{t('name')}:</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-950 border border-purple-500/40 rounded-xl px-3 py-2 text-white font-bold focus:border-amber-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">{t('bio')}:</label>
                <input
                  type="text"
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full bg-slate-950 border border-purple-500/40 rounded-xl px-3 py-2 text-white font-bold focus:border-amber-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">{t('age')}:</label>
                <input
                  type="number"
                  value={editAge}
                  onChange={(e) => setEditAge(e.target.value)}
                  className="w-full bg-slate-950 border border-purple-500/40 rounded-xl px-3 py-2 text-white font-bold focus:border-amber-400 outline-none"
                />
              </div>

              <div className="border-t border-purple-900/40 pt-3 space-y-2">
                <h4 className="font-bold text-amber-300">{t('changePassword')}</h4>
                <input
                  type="password"
                  placeholder={t('currentPassword')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
                />
                <input
                  type="password"
                  placeholder={t('newPassword')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>
            </div>

            <button
              onClick={() => {
                if (onUpdateUser) {
                  onUpdateUser({ name: editName, bio: editBio });
                }
                showToast(t('toastSettingsSaved'));
                setActiveModal(null);
              }}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-amber-500 text-white font-black text-xs rounded-2xl shadow-lg hover:brightness-110 cursor-pointer active:scale-95 transition-all"
            >
              {t('saveChanges')}
            </button>
          </div>
        </div>
      )}

      {/* 2. PERSONAL INFO MODAL */}
      {activeModal === 'personal_info' && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-blue-500/50 rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl text-start animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2 text-blue-300 font-black text-sm">
                <User className="w-5 h-5 text-blue-400" />
                <span>{t('personalInfo')}</span>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full bg-white/10 text-slate-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Email:</span>
                <span className="font-bold text-white">{user.email || 'user@saleem.live'}</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block">User ID:</span>
                <span className="font-bold text-emerald-400">{user.id}</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Registration Date:</span>
                <span className="font-bold text-amber-300">2026/01/15</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Region:</span>
                <span className="font-bold text-white">Global 🌐</span>
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 bg-blue-600 text-white font-black text-xs rounded-xl shadow cursor-pointer"
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      )}

      {/* 3. SECURITY MODAL */}
      {activeModal === 'security' && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl text-start animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2 text-emerald-300 font-black text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>{t('security')}</span>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full bg-white/10 text-slate-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="font-bold text-white block">{t('twoFactorAuth')}</span>
                  <span className="text-[10px] text-slate-400">{t('twoFactorDesc')}</span>
                </div>
                <input
                  type="checkbox"
                  checked={twoFactorEnabled}
                  onChange={(e) => handleToggle2FA(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="font-bold text-white block">{t('hideOnlineStatus')}</span>
                  <span className="text-[10px] text-slate-400">{t('hideOnlineDesc')}</span>
                </div>
                <input
                  type="checkbox"
                  checked={hideOnlineStatus}
                  onChange={(e) => handleToggleHideOnline(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-amber-300 block text-[11px]">{t('connectedDevices')}:</span>
                <div className="flex items-center justify-between text-[10px] text-slate-300 pt-1">
                  <span>📱 Samsung Galaxy / Mobile</span>
                  <span className="text-emerald-400 font-bold">{t('activeNow')}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                showToast(t('toastSettingsSaved'));
                setActiveModal(null);
              }}
              className="w-full py-2.5 bg-emerald-600 text-white font-black text-xs rounded-xl shadow cursor-pointer"
            >
              {t('saveChanges')}
            </button>
          </div>
        </div>
      )}

      {/* 5. LEVEL & ACHIEVEMENTS MODAL */}
      {activeModal === 'level_achievements' && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl text-start animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2 text-amber-300 font-black text-sm">
                <Award className="w-5 h-5 text-amber-400" />
                <span>{t('levelAchievements')}</span>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full bg-white/10 text-slate-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-2xl border border-amber-500/30 space-y-1.5">
                <div className="flex justify-between font-bold">
                  <span className="text-white">Lvl {user.level || 42}</span>
                  <span className="text-amber-300">4,200 / 5,000 XP</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full w-[84%]" />
                </div>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-white text-[11px]">Daily Quests & Rewards:</h4>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-200 text-[10px]">Stay 15 min in room</p>
                    <p className="text-[8px] text-amber-400">+100 {t('coinsGold')}</p>
                  </div>
                  <button
                    onClick={() => {
                      if (onUpdateUser) onUpdateUser({ coins: user.coins + 100 });
                      showToast('+100 🪙');
                    }}
                    className="px-2.5 py-1 bg-amber-500 text-slate-950 font-black text-[9px] rounded-lg cursor-pointer"
                  >
                    Claim
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* 6. CP SPACE MODAL */}
      {activeModal === 'cp_space' && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-slate-900 to-pink-950 border-2 border-pink-500/60 rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl text-start animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-pink-500/30 pb-2.5">
              <div className="flex items-center gap-2 text-pink-300 font-black text-sm">
                <Heart className="w-5 h-5 text-pink-400" />
                <span>{t('cpSpaceTitle')}</span>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full bg-white/10 text-slate-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center py-3 space-y-2">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center text-3xl shadow-xl border-2 border-white">
                💍
              </div>
              <h4 className="font-black text-white text-sm">{user.cpPartnerName ? `CP: ${user.cpPartnerName}` : t('cpRequest')}</h4>
              <p className="text-xs text-pink-200">{t('cpPartnerDesc')}</p>
            </div>

            <button
              onClick={() => {
                showToast('💍 CP Request Sent!');
                setActiveModal(null);
              }}
              className="w-full py-2.5 bg-gradient-to-r from-pink-600 to-rose-500 text-white font-black text-xs rounded-xl shadow cursor-pointer"
            >
              {t('cpRequest')}
            </button>
          </div>
        </div>
      )}

      {/* 7. SUPPORT TICKET MODAL */}
      {activeModal === 'support' && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-cyan-500/50 rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl text-start animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2 text-cyan-300 font-black text-sm">
                <HelpCircle className="w-5 h-5 text-cyan-400" />
                <span>{t('support')}</span>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full bg-white/10 text-slate-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300 leading-relaxed text-[11px]">
                {t('supportTicketTitle')}:
              </p>

              <textarea
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                placeholder={t('supportTicketPlaceholder')}
                className="w-full h-24 bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs outline-none focus:border-cyan-400"
              />
            </div>

            <button
              onClick={handleSubmitTicket}
              className="w-full py-2.5 bg-cyan-600 text-white font-black text-xs rounded-xl shadow cursor-pointer flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t('sendTicket')}</span>
            </button>
          </div>
        </div>
      )}

      {/* 8. ABOUT APP MODAL */}
      {activeModal === 'about' && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-indigo-500/50 rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-purple-600 to-amber-500 border border-amber-300/50 flex items-center justify-center text-2xl shadow-xl">
              👑
            </div>

            <div>
              <h3 className="font-black text-base text-white">{t('appName')} LIVE</h3>
              <p className="text-xs text-amber-300 font-mono">v3.8.5 - Build 2026</p>
              <p className="text-[10px] text-slate-400 mt-1">{t('tagline')}</p>
            </div>

            <div className="text-[10px] text-slate-300 space-y-1 border-t border-slate-800 pt-3">
              <p>{t('rightsReserved')}</p>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 bg-indigo-600 text-white font-black text-xs rounded-xl shadow cursor-pointer"
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      )}

      {/* 8.5 HOST TARGET AND SALARY MODAL */}
      {activeModal === 'host_target' && (
        <HostTargetModal
          user={user}
          onClose={() => setActiveModal(null)}
          onOpenWithdrawal={() => {
            setActiveModal(null);
            onOpenWithdrawalModal();
          }}
        />
      )}

      {/* 9. LOGOUT CONFIRMATION DIALOG */}
      {activeModal === 'logout_confirm' && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-red-500/70 rounded-3xl p-5 max-w-xs w-full space-y-4 shadow-2xl text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 mx-auto rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-400">
              <LogOut className="w-7 h-7" />
            </div>

            <div>
              <h3 className="font-black text-base text-white">{t('logoutConfirmTitle')}</h3>
              <p className="text-xs text-slate-300 mt-1">{t('logoutConfirmDesc')}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button
                onClick={async () => {
                  setActiveModal(null);
                  if (user && user.id) {
                    await updateUserLogoutStatusInFirebase(user);
                  }
                  if (onLogout) {
                    onLogout();
                  } else {
                    showToast(t('toastLoggedOut'));
                  }
                }}
                className="py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl shadow-lg cursor-pointer"
              >
                {t('confirmLogout')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Banner Alert */}
      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[100] bg-purple-950/95 border border-amber-400/80 text-amber-200 font-black text-xs px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-3 duration-200">
          {toast}
        </div>
      )}

    </div>
  );
};
