import React, { useState, useEffect } from 'react';
import { UserProfile, TransactionRecord, WithdrawalRequest } from '../types';
import {
  Shield,
  ShieldCheck,
  RefreshCw,
  DollarSign,
  KeyRound,
  Check,
  X,
  Clock,
  Copy,
  CheckCircle2,
  AlertCircle,
  Award,
  Crown,
  Wallet,
  Send,
  RotateCw,
  ExternalLink,
  Ban,
} from 'lucide-react';
import { useI18n } from '../lib/i18n';
import { getApiBaseUrl } from '../config';
import { getUserAuthToken } from '../lib/firebase';

interface AdminPanelModalProps {
  user: UserProfile;
  transactions: TransactionRecord[];
  withdrawalRequests: WithdrawalRequest[];
  onClose: () => void;
  onToggleUserRoomPermission: (userId: string, allowed: boolean) => void;
  onManualAddCoins: (amount: number) => void;
  onUpdateWithdrawalStatus?: (requestId: string, newStatus: 'PROCESSING' | 'SUCCESS' | 'REJECTED', rejectionReason?: string) => void;
}

export interface ServerWithdrawalItem {
  id: string;
  userId: string;
  diamondsAmount: number;
  usdAmount: number;
  gateway: string;
  accountDetails: string;
  beneficiaryName: string | null;
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'REJECTED';
  payoutReference: string | null;
  rejectionReason: string | null;
  createdAt: string;
  processedAt: string | null;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  user,
  transactions,
  withdrawalRequests,
  onClose,
  onToggleUserRoomPermission,
  onManualAddCoins,
}) => {
  const { t, dir } = useI18n();
  const [activeTab, setActiveTab] = useState<'withdrawals' | 'transactions' | 'permissions'>('withdrawals');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'REJECTED'>('ALL');
  const [manualAmount, setManualAmount] = useState<number>(5000);

  // Live Server Withdrawals State
  const [serverList, setServerList] = useState<ServerWithdrawalItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Active Action Prompts (Confirm Payout vs Reject Prompt)
  const [activePrompt, setActivePrompt] = useState<{
    requestId: string;
    type: 'CONFIRM_SUCCESS' | 'REJECT_AND_REFUND';
    inputVal: string;
  } | null>(null);

  // Copy state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Fetch all withdrawal requests directly from Server (Admin API)
  const fetchWithdrawals = async () => {
    setIsLoading(true);
    try {
      const apiBase = getApiBaseUrl();
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') {
        params.set('statusFilter', statusFilter);
      }

      const queryString = params.toString();
      const url = `${apiBase}/withdrawals/admin/all${queryString ? `?${queryString}` : ''}`;

      const token = await getUserAuthToken(user.id);
      if (!token) {
        throw new Error('جلسة المشرف غير متاحة أو لا تطابق حساب المشرف الحالي. يرجى تسجيل الدخول من جديد.');
      }
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(url, {
        headers,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data.message ||
          data.error ||
          `فشل جلب طلبات السحب من السيرفر (كود الحالة: ${res.status})`
        );
      }

      if (!data.success || !Array.isArray(data.withdrawals)) {
        throw new Error('استجابة السيرفر غير صالحة أو غير متوقعة.');
      }

      setServerList(data.withdrawals);
    } catch (err: any) {
      console.error('Failed to fetch admin withdrawals:', err);
      setFeedbackMessage({
        type: 'error',
        text: err.message || 'تعذر الاتصال بالسيرفر لجلب طلبات السحب.',
      });
      setServerList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'withdrawals') {
      fetchWithdrawals();
    }
  }, [activeTab, statusFilter]);

  // Execute Operational Action on Server
  const handleExecuteAction = async (
    requestId: string,
    action: 'START_PROCESSING' | 'CONFIRM_SUCCESS' | 'REJECT_AND_REFUND',
    payoutReference?: string,
    rejectionReason?: string
  ) => {
    setActionLoadingId(requestId);
    setFeedbackMessage(null);
    try {
      const apiBase = getApiBaseUrl();

      const token = await getUserAuthToken(user.id);
      if (!token) {
        throw new Error('جلسة المشرف غير متاحة أو لا تطابق حساب المشرف الحالي. يرجى تسجيل الدخول من جديد.');
      }
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${apiBase}/withdrawals/review`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          requestId,
          action,
          payoutReference: payoutReference?.trim(),
          rejectionReason: rejectionReason?.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'فشلت معالجة الطلب');
      }

      setFeedbackMessage({
        type: 'success',
        text: data.message || 'تم تحديث حالة الطلب بنجاح',
      });

      setActivePrompt(null);
      await fetchWithdrawals();
    } catch (err: any) {
      setFeedbackMessage({
        type: 'error',
        text: err.message || 'حدث خطأ أثناء الاتصال بالسيرفر',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Compute analytics
  const totalRevenue = transactions.reduce((acc, tx) => acc + tx.priceUsd, 0);
  const pendingCount = serverList.filter((r) => r.status === 'PENDING').length;
  const processingCount = serverList.filter((r) => r.status === 'PROCESSING').length;

  return (
    <div dir={dir} className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 text-start select-none font-sans">
      <div className="w-full max-w-4xl bg-slate-900 border border-red-500/40 rounded-3xl p-5 shadow-2xl space-y-4 text-white max-h-[90vh] overflow-y-auto animate-scaleUp">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 text-white flex items-center justify-center font-black shadow-lg">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-black text-base text-red-400 flex items-center gap-2">
                <span>لوحة تحكم إدارة SALEEM (Admin Review Hub)</span>
                <span className="text-[10px] bg-red-500/20 text-red-300 border border-red-500/40 px-2 py-0.5 rounded-full font-mono">
                  PROD-READY
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">إدارة ومراجعة طلبات سحب الكاش، تأكيد إيصالات التحويل، واسترجاع الأرصدة</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Feedback Banner */}
        {feedbackMessage && (
          <div
            className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-between animate-in fade-in duration-200 ${
              feedbackMessage.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/60 text-emerald-300'
                : 'bg-rose-950/90 border-rose-500/60 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedbackMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{feedbackMessage.text}</span>
            </div>
            <button onClick={() => setFeedbackMessage(null)} className="text-slate-400 hover:text-white text-xs">✕</button>
          </div>
        )}

        {/* Quick Analytics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-950 p-3 rounded-2xl border border-amber-500/30">
            <span className="text-[10px] text-slate-400 block font-bold">طلبات بانتظار المراجعة (PENDING)</span>
            <span className="font-black text-amber-300 text-lg font-mono">{pendingCount} طلبات ⏳</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-sky-500/30">
            <span className="text-[10px] text-slate-400 block font-bold">طلبات قيد التحويل (PROCESSING)</span>
            <span className="font-black text-sky-300 text-lg font-mono">{processingCount} طلبات 🔄</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-emerald-500/30">
            <span className="text-[10px] text-slate-400 block font-bold">إجمالي مبيعات Google Play</span>
            <span className="font-black text-emerald-400 text-lg font-mono">${totalRevenue.toFixed(2)}</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'withdrawals' ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'bg-slate-800 text-slate-300'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>مراجعة طلبات السحب والكاش 💸</span>
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'transactions' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300'
            }`}
          >
            سجل مبيعات Google Play
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'permissions' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300'
            }`}
          >
            إدارة الصلاحيات الشحن
          </button>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: WITHDRAWALS MANAGEMENT (LIVE SERVER ADMIN REVIEW) */}
        {/* ========================================================= */}
        {activeTab === 'withdrawals' && (
          <div className="space-y-4">
            
            {/* Filter Bar & Live Refresh Button */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <div className="flex flex-wrap items-center gap-1.5">
                {(['ALL', 'PENDING', 'PROCESSING', 'SUCCESS', 'REJECTED'] as const).map((filterKey) => (
                  <button
                    key={filterKey}
                    onClick={() => setStatusFilter(filterKey)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold cursor-pointer transition-all ${
                      statusFilter === filterKey
                        ? 'bg-red-600 text-white font-black shadow'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {filterKey === 'ALL' && 'الكل'}
                    {filterKey === 'PENDING' && '⏳ قيد المراجعة'}
                    {filterKey === 'PROCESSING' && '🔄 قيد التحويل'}
                    {filterKey === 'SUCCESS' && '✅ مكتمل'}
                    {filterKey === 'REJECTED' && '❌ مرفوض'}
                  </button>
                ))}
              </div>

              <button
                onClick={fetchWithdrawals}
                disabled={isLoading}
                className="text-xs text-amber-300 hover:text-amber-200 flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1 rounded-xl cursor-pointer disabled:opacity-50"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>تحديث السيرفر الحي</span>
              </button>
            </div>

            {/* Withdrawals List */}
            {isLoading && serverList.length === 0 ? (
              <div className="bg-slate-950 p-10 rounded-2xl border border-slate-800 text-center text-slate-400 text-xs space-y-2">
                <RotateCw className="w-6 h-6 text-amber-400 animate-spin mx-auto" />
                <p>جاري جلب قائمة طلبات السحب من السيرفر...</p>
              </div>
            ) : serverList.length === 0 ? (
              <div className="bg-slate-950 p-10 rounded-2xl border border-slate-800 text-center text-slate-400 text-xs space-y-2">
                <div className="text-3xl">💎</div>
                <p>لا توجد طلبات سحب تطابق الفلتر المحدد حالياً.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1 custom-scrollbar">
                {serverList.map((req) => {
                  const isOperating = actionLoadingId === req.id;
                  const formattedDate = req.createdAt ? new Date(req.createdAt).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' }) : 'الآن';

                  return (
                    <div
                      key={req.id}
                      className="bg-slate-950 p-4 rounded-3xl border border-slate-800 space-y-3.5 shadow-xl hover:border-slate-700 transition-all"
                    >
                      {/* 1. Header with User info & Financial amounts */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 p-3 rounded-2xl border border-slate-800">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-white">معرف المستخدم: {req.userId}</span>
                            <span className="font-mono text-[10px] text-slate-400">({req.id})</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            تاريخ التقديم: {formattedDate}
                          </div>
                        </div>

                        <div className="text-right sm:text-left bg-slate-950 px-3.5 py-1.5 rounded-xl border border-emerald-500/30">
                          <div className="font-mono font-black text-emerald-400 text-base">${Number(req.usdAmount || 0).toFixed(2)} USD</div>
                          <div className="text-[10px] text-amber-300 font-mono font-bold">
                            {req.diamondsAmount.toLocaleString()} 💎 مخصومة
                          </div>
                        </div>
                      </div>

                      {/* 2. Gateway & Destination details with Copy button */}
                      <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 text-xs space-y-2">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                          <span className="font-bold text-slate-300 flex items-center gap-1.5">
                            <Wallet className="w-3.5 h-3.5 text-amber-400" />
                            <span>وسيلة التحويل:</span>
                          </span>
                          <span className="font-black text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/30 text-[11px]">
                            {req.gateway}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-slate-400 text-[10px] block font-bold">رقم الحساب / المحفظة:</span>
                            <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 mt-0.5">
                              <span className="font-mono font-bold text-cyan-300 select-all text-xs truncate">
                                {req.accountDetails}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopy(req.accountDetails, req.id)}
                                className="mr-auto px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-amber-300 text-[10px] font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                              >
                                {copiedId === req.id ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                <span>{copiedId === req.id ? 'تم النسخ' : 'نسخ'}</span>
                              </button>
                            </div>
                          </div>

                          <div>
                            <span className="text-slate-400 text-[10px] block font-bold">اسم المستفيد:</span>
                            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 text-xs font-bold text-slate-200 truncate mt-0.5">
                              {req.beneficiaryName || 'غير محدد'}
                            </div>
                          </div>
                        </div>

                        {/* Status References (if completed or rejected) */}
                        {req.payoutReference && (
                          <div className="text-[11px] font-mono text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-xl">
                            ✅ رقم مرجع المعاملة (Payout Ref): <span className="font-bold text-white select-all">{req.payoutReference}</span>
                          </div>
                        )}

                        {req.rejectionReason && (
                          <div className="text-[11px] text-rose-300 bg-rose-950/60 border border-rose-500/30 px-2.5 py-1 rounded-xl">
                            ❌ سبب الرفض: <span className="font-bold text-rose-200">{req.rejectionReason}</span>
                          </div>
                        )}
                      </div>

                      {/* 3. Action Controls Area (Strict State Machine Actions) */}
                      <div className="pt-1">
                        
                        {/* PENDING State Actions */}
                        {req.status === 'PENDING' && (
                          <div className="space-y-2">
                            {activePrompt?.requestId === req.id && activePrompt.type === 'REJECT_AND_REFUND' ? (
                              <div className="bg-rose-950/80 border border-rose-500/50 p-3 rounded-2xl space-y-2">
                                <span className="text-[11px] font-bold text-rose-300 block">
                                  أدخل سبب الرفض (سيتم استرجاع {req.diamondsAmount.toLocaleString()} 💎 للمستخدم فوراً):
                                </span>
                                <input
                                  type="text"
                                  placeholder="مثال: رقم المحفظة غير مطابق لاسم صاحب الحساب"
                                  value={activePrompt.inputVal}
                                  onChange={(e) => setActivePrompt({ ...activePrompt, inputVal: e.target.value })}
                                  className="w-full bg-slate-900 border border-rose-500/50 rounded-xl px-3 py-1.5 text-xs text-white"
                                />
                                <div className="flex items-center gap-2 justify-end">
                                  <button
                                    onClick={() => setActivePrompt(null)}
                                    className="px-3 py-1 rounded-xl bg-slate-800 text-slate-300 text-xs cursor-pointer"
                                  >
                                    إلغاء
                                  </button>
                                  <button
                                    onClick={() => handleExecuteAction(req.id, 'REJECT_AND_REFUND', undefined, activePrompt.inputVal)}
                                    disabled={isOperating || !activePrompt.inputVal.trim()}
                                    className="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                                  >
                                    تأكيد الرفض والاسترجاع
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-wrap items-center gap-2">
                                <button
                                  onClick={() => handleExecuteAction(req.id, 'START_PROCESSING')}
                                  disabled={isOperating}
                                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow disabled:opacity-50 transition-all"
                                >
                                  {isOperating ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                                  <span>بدء المعالجة والتحويل (START_PROCESSING) 🔄</span>
                                </button>

                                <button
                                  onClick={() => setActivePrompt({ requestId: req.id, type: 'REJECT_AND_REFUND', inputVal: '' })}
                                  disabled={isOperating}
                                  className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                  <span>رفض واسترجاع الرصيد ❌</span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* PROCESSING State Actions */}
                        {req.status === 'PROCESSING' && (
                          <div className="space-y-2">
                            {activePrompt?.requestId === req.id && activePrompt.type === 'CONFIRM_SUCCESS' ? (
                              <div className="bg-emerald-950/80 border border-emerald-500/50 p-3 rounded-2xl space-y-2">
                                <span className="text-[11px] font-bold text-emerald-300 block">
                                  أدخل مرجع الحوالة / رقم الإيصال المالي (payoutReference إلزامي):
                                </span>
                                <input
                                  type="text"
                                  placeholder="مثال: ZC-TXN-998811 أو Tron TxHash"
                                  value={activePrompt.inputVal}
                                  onChange={(e) => setActivePrompt({ ...activePrompt, inputVal: e.target.value })}
                                  className="w-full bg-slate-900 border border-emerald-500/50 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                                />
                                <div className="flex items-center gap-2 justify-end">
                                  <button
                                    onClick={() => setActivePrompt(null)}
                                    className="px-3 py-1 rounded-xl bg-slate-800 text-slate-300 text-xs cursor-pointer"
                                  >
                                    إلغاء
                                  </button>
                                  <button
                                    onClick={() => handleExecuteAction(req.id, 'CONFIRM_SUCCESS', activePrompt.inputVal)}
                                    disabled={isOperating || !activePrompt.inputVal.trim()}
                                    className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                                  >
                                    تأكيد وصول الحوالة وإغلاق الطلب بنجاح ✓
                                  </button>
                                </div>
                              </div>
                            ) : activePrompt?.requestId === req.id && activePrompt.type === 'REJECT_AND_REFUND' ? (
                              <div className="bg-rose-950/80 border border-rose-500/50 p-3 rounded-2xl space-y-2">
                                <span className="text-[11px] font-bold text-rose-300 block">
                                  أدخل سبب فشل التحويل لدى المزود (سيتم استرجاع {req.diamondsAmount.toLocaleString()} 💎 فوراً):
                                </span>
                                <input
                                  type="text"
                                  placeholder="مثال: فشل التحويل من زين كاش بسبب إغلاق محفظة المستلم"
                                  value={activePrompt.inputVal}
                                  onChange={(e) => setActivePrompt({ ...activePrompt, inputVal: e.target.value })}
                                  className="w-full bg-slate-900 border border-rose-500/50 rounded-xl px-3 py-1.5 text-xs text-white"
                                />
                                <div className="flex items-center gap-2 justify-end">
                                  <button
                                    onClick={() => setActivePrompt(null)}
                                    className="px-3 py-1 rounded-xl bg-slate-800 text-slate-300 text-xs cursor-pointer"
                                  >
                                    إلغاء
                                  </button>
                                  <button
                                    onClick={() => handleExecuteAction(req.id, 'REJECT_AND_REFUND', undefined, activePrompt.inputVal)}
                                    disabled={isOperating || !activePrompt.inputVal.trim()}
                                    className="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                                  >
                                    تأكيد فشل الدفع واسترجاع الرصيد
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-wrap items-center gap-2">
                                <button
                                  onClick={() => setActivePrompt({ requestId: req.id, type: 'CONFIRM_SUCCESS', inputVal: '' })}
                                  disabled={isOperating}
                                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow disabled:opacity-50 transition-all"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>تأكيد نجاح الدفع (CONFIRM_SUCCESS) ✅</span>
                                </button>

                                <button
                                  onClick={() => setActivePrompt({ requestId: req.id, type: 'REJECT_AND_REFUND', inputVal: '' })}
                                  disabled={isOperating}
                                  className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                  <span>فشل التحويل واسترجاع الرصيد ❌</span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Terminal States (SUCCESS or REJECTED) */}
                        {req.status === 'SUCCESS' && (
                          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-xl">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>المعاملة مغلقة ومكتملة بنجاح (SUCCESS - غير قابلة للتعديل)</span>
                          </div>
                        )}

                        {req.status === 'REJECTED' && (
                          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-400 bg-rose-950/60 border border-rose-500/30 px-3 py-1 rounded-xl">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>المعاملة مرفوضة ومسترجعة الرصيد (REJECTED - غير قابلة للتعديل)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TRANSACTIONS TABLE */}
        {activeTab === 'transactions' && (
          <div className="space-y-2">
            <h3 className="font-bold text-xs text-slate-300">سجل طلبات الشحن عبر Google Play Developer API</h3>
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-2.5">رقم الطلب (GPA Order ID)</th>
                    <th className="p-2.5">المستخدم</th>
                    <th className="p-2.5">الحزمة</th>
                    <th className="p-2.5">العملات</th>
                    <th className="p-2.5">السعر</th>
                    <th className="p-2.5">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-900/50">
                      <td className="p-2.5 font-mono text-amber-300">{tx.googleOrderId}</td>
                      <td className="p-2.5 font-bold">{tx.userName}</td>
                      <td className="p-2.5">{tx.packageName}</td>
                      <td className="p-2.5 font-mono text-emerald-400">+{tx.amountCoins.toLocaleString()}</td>
                      <td className="p-2.5 font-mono">${tx.priceUsd}</td>
                      <td className="p-2.5">
                        <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-500/30">
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: PERMISSIONS & MANUAL TOP-UP */}
        {activeTab === 'permissions' && (
          <div className="space-y-4">
            <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/30 space-y-3">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                <KeyRound className="w-4 h-4" />
                <span>إعادة تفعيل قيد إنشاء الغرف (is_allowed_to_create_room: true)</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                وفقاً لمواصفات التطبيق، بعد إنشاء غرفة صوتية واحدة يتم تقييد الحساب تلقائياً. يمكنك هنا كمسؤول إعادة تفعيل الصلاحية فورياً للحساب الحقيقي:
              </p>
              <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-white">{user.name} ({user.id})</span>
                <button
                  onClick={() => onToggleUserRoomPermission(user.id, !user.isAllowedToCreateRoom)}
                  className={`px-4 py-2 rounded-xl text-xs font-black shadow transition-all ${
                    user.isAllowedToCreateRoom
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-red-600 text-white hover:bg-red-500'
                  }`}
                >
                  {user.isAllowedToCreateRoom ? 'الصلاحية مفعلة ✓' : 'إعادة التفعيل الآن 🔓'}
                </button>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/30 space-y-3">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                <DollarSign className="w-4 h-4" />
                <span>التعديل اليدوي للرصيد (الإضافة المباشرة)</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={manualAmount}
                  onChange={(e) => setManualAmount(Number(e.target.value))}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white w-full"
                />
                <button
                  onClick={() => {
                    onManualAddCoins(manualAmount);
                    alert(`تمت إضافة ${manualAmount} عملة يدوياً لقاعدة البيانات!`);
                  }}
                  className="bg-emerald-500 text-slate-950 font-black text-xs px-5 py-2 rounded-xl whitespace-nowrap cursor-pointer"
                >
                  إضافة الرصيد
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
