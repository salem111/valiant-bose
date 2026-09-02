import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { Crown, Bell, Shield, Wallet, Sparkles, CheckCircle2, ChevronDown, RefreshCw } from 'lucide-react';
import { useI18n } from '../lib/i18n';
import { getApiBaseUrl } from '../config';
import { getUserAuthToken } from '../lib/firebase';

interface NotificationItem {
  id: string;
  text: string;
  time: string;
  unread: boolean;
  type?: string;
}

interface HeaderProps {
  user: UserProfile;
  onOpenCoinStore: () => void;
  onOpenAdminPanel: () => void;
  onOpenVipModal: () => void;
  onOpenProfile: () => void;
  onOpenWithdrawalModal?: () => void;
  onOpenDailySpin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onOpenCoinStore,
  onOpenAdminPanel,
  onOpenVipModal,
  onOpenProfile,
  onOpenWithdrawalModal,
  onOpenDailySpin,
}) => {
  const { t, dir } = useI18n();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoadingNotifs, setIsLoadingNotifs] = useState(false);

  const fetchServerNotifications = async () => {
    if (!user.id) return;
    try {
      setIsLoadingNotifs(true);
      const apiBase = getApiBaseUrl();
      const token = await getUserAuthToken(user.id);
      if (!token) return;
      const headers: Record<string, string> = { Authorization: `Bearer ${token}` };

      const res = await fetch(`${apiBase}/notifications/user/${user.id}`, { headers });
      const data = await res.json().catch(() => ({}));
      if (data.success && Array.isArray(data.notifications)) {
        const formatted = data.notifications.map((n: any) => ({
          id: n.id,
          text: `${n.title}\n${n.message}`,
          time: new Date(n.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
          unread: !n.isRead,
          type: n.type,
        }));
        setNotifications(formatted);
      }
    } catch (err) {
      console.warn('Failed to load server notifications, using defaults:', err);
    } finally {
      setIsLoadingNotifs(false);
    }
  };

  useEffect(() => {
    fetchServerNotifications();
    const interval = setInterval(fetchServerNotifications, 15000);
    const onFocus = () => fetchServerNotifications();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [user.id]);

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    try {
      const apiBase = getApiBaseUrl();
      const token = await getUserAuthToken(user.id);
      if (!token) return;
      const headers: Record<string, string> = { Authorization: `Bearer ${token}` };

      for (const n of notifications) {
        if (n.unread && n.id.startsWith('NOTIF-')) {
          await fetch(`${apiBase}/notifications/${n.id}/read`, {
            method: 'POST',
            headers,
          }).catch(() => {});
        }
      }
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header id="saleem-main-header" className="sticky top-0 z-30 bg-[#0c071d]/90 backdrop-blur-xl border-b border-amber-500/20 px-3 pt-2 pt-safe pb-2 text-white shadow-2xl gpu-layer">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* User Profile Digital Data Bar */}
        <div className="flex items-center gap-2 bg-[#150d30]/80 border border-purple-500/20 hover:border-amber-400/50 px-2.5 py-1.5 rounded-2xl shadow-lg backdrop-blur-md transition-all">
          <div className="relative cursor-pointer group" onClick={onOpenProfile}>
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8.5 h-8.5 rounded-full object-cover ring-2 ring-amber-400/80 group-hover:scale-105 transition-transform"
            />
            {/* Crown / Level Badge */}
            <span className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow">
              👑
            </span>
          </div>

          <div className="flex flex-col cursor-pointer" onClick={onOpenProfile}>
            <div className="flex items-center gap-1">
              <span className="font-bold text-xs text-white hover:text-amber-300 transition-colors truncate max-w-[90px] sm:max-w-[120px]">
                {user.name}
              </span>
              <span className="text-[9px] bg-purple-500/30 text-purple-200 border border-purple-400/40 px-1 py-0.2 rounded-md font-mono">
                {user.levelStatus || 'Lv.1'}
              </span>
            </div>
            <span className="text-[9.5px] text-slate-400 font-mono">ID: {user.id}</span>
          </div>
        </div>

        {/* Currency Balances & Admin Button Right side */}
        <div className="flex items-center gap-2">
          {/* Gold Coin Counter */}
          <div
            onClick={onOpenCoinStore}
            className="flex items-center gap-1.5 bg-[#180f33]/90 hover:bg-[#201445] border border-amber-400/30 hover:border-amber-400 rounded-2xl px-2.5 py-1 text-[11px] cursor-pointer shadow-md transition-all hover:scale-102"
            title={t('recharge')}
          >
            <span className="text-sm leading-none">🪙</span>
            <div className="flex flex-col">
              <span className="font-black text-amber-300 leading-tight font-mono text-[11px]">
                {user.coins.toLocaleString()}
              </span>
              <span className="text-[8px] text-amber-200/60 leading-none">{t('coinsGold')}</span>
            </div>
            <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 rounded-full w-4 h-4 flex items-center justify-center font-black text-[11px] ml-0.5 shadow">
              +
            </span>
          </div>

          {/* Gems Counter */}
          <div
            onClick={onOpenWithdrawalModal || onOpenCoinStore}
            className="flex items-center gap-1.5 bg-[#180f33]/90 hover:bg-[#201445] border border-cyan-400/30 hover:border-cyan-400 rounded-2xl px-2.5 py-1 text-[11px] cursor-pointer shadow-md transition-all hover:scale-102"
            title={t('withdraw')}
          >
            <span className="text-sm leading-none">💎</span>
            <div className="flex flex-col">
              <span className="font-black text-cyan-300 leading-tight font-mono text-[11px]">
                {user.diamonds.toLocaleString()}
              </span>
              <span className="text-[8px] text-cyan-200/60 leading-none">{t('diamondsGems')}</span>
            </div>
          </div>

          {/* Daily Spin Wheel Button */}
          {onOpenDailySpin && (
            <button
              onClick={onOpenDailySpin}
              className="p-2 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-pink-500/20 hover:from-amber-500/30 hover:to-pink-500/30 border border-amber-400/50 text-amber-300 transition-all hover:scale-110 active:scale-95 shadow-md cursor-pointer flex items-center justify-center"
              title={t('dailySpin')}
            >
              <span className="text-base animate-bounce">🎡</span>
            </button>
          )}

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
              title={t('notifications')}
            >
              <Bell className="w-3.5 h-3.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white font-bold text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className={`absolute ${dir === 'rtl' ? 'left-0' : 'right-0'} mt-2 w-64 bg-slate-900 border border-amber-500/30 rounded-xl shadow-2xl p-2.5 z-50 text-start`}>
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-1.5">
                  <span className="font-bold text-xs text-amber-300">{t('notificationsTitle')}</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[10px] text-slate-400 hover:text-amber-400 flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {t('markAllRead')}
                    </button>
                  )}
                </div>
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 text-xs">
                  {notifications.length === 0 ? (
                    <div className="text-center py-4 text-slate-500 text-[10px]">
                      لا توجد إشعارات جديدة حالياً
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={async () => {
                          if (n.unread && n.id.startsWith('NOTIF-')) {
                            setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, unread: false } : item));
                            const apiBase = getApiBaseUrl();
                            const token = await getUserAuthToken(user.id);
                            if (!token) return;
                            const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
                            fetch(`${apiBase}/notifications/${n.id}/read`, { method: 'POST', headers }).catch(() => {});
                          }
                        }}
                        className={`p-2 rounded-lg transition-colors cursor-pointer ${
                          n.unread ? 'bg-amber-500/10 border-r-2 border-amber-500 text-slate-100 font-semibold' : 'bg-slate-800/50 text-slate-400'
                        }`}
                      >
                        <p className="text-[10px] leading-snug whitespace-pre-line">{n.text}</p>
                        <span className="text-[8px] text-slate-500 mt-1 block">{n.time}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Admin Panel Link */}
          <button
            onClick={onOpenAdminPanel}
            className="flex items-center gap-1 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md transition-all border border-red-400/30"
            title={t('adminPanelTitle')}
          >
            <Shield className="w-3 h-3" />
            <span className="hidden sm:inline">{t('admin')}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
