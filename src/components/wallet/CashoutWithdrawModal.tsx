import React, { useState } from 'react';
import { UserProfile, WithdrawalGateway } from '../../types';
import { X, DollarSign, CreditCard, Building, ShieldCheck, ArrowDownToLine, History, CheckCircle2, AlertCircle } from 'lucide-react';

import { ref, push, set } from 'firebase/database';
import { rtdb } from '../../lib/firebase';

interface CashoutWithdrawModalProps {
  user: UserProfile;
  onClose: () => void;
  onUpdateDiamonds: (deltaDiamonds: number) => void;
}

export const CashoutWithdrawModal: React.FC<CashoutWithdrawModalProps> = ({
  user,
  onClose,
  onUpdateDiamonds,
}) => {
  const [selectedGateway, setSelectedGateway] = useState<WithdrawalGateway>('zain_cash');
  const [diamondsToWithdraw, setDiamondsToWithdraw] = useState<number>(50000);
  const [accountDetails, setAccountDetails] = useState<string>('');
  const [beneficiaryName, setBeneficiaryName] = useState<string>(user.name);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Exchange rate: 10,000 Diamonds = $10.00 USD
  const RATE_PER_10K = 10;
  const calculatedUsd = (diamondsToWithdraw / 10000) * RATE_PER_10K;

  const gateways: Array<{ id: WithdrawalGateway; name: string; icon: string; minUsd: number; fee: string }> = [
    { id: 'zain_cash', name: 'زين كاش / أورنج موني 📱', icon: '💳', minUsd: 20, fee: '0%' },
    { id: 'bank_transfer', name: 'حساب بنكي محلي (IBAN) 🏦', icon: '🏛️', minUsd: 50, fee: '1%' },
    { id: 'vodafone_cash', name: 'فودافون كاش / إنستاباي ⚡', icon: '📱', minUsd: 10, fee: '0%' },
    { id: 'paypal', name: 'حساب PayPal العالمي 🌐', icon: '🅿️', minUsd: 30, fee: '2%' },
    { id: 'usdt_trc20', name: 'USDT محفظة كريبتو (TRC20) ₮', icon: '💎', minUsd: 50, fee: '$1' },
  ];

  const handleWithdrawSubmit = async () => {
    if (diamondsToWithdraw > user.diamonds) {
      setErrorMsg('⚠️ رصيدك من الماسات لا يكفي لإتمام هذا السحب!');
      return;
    }

    if (!accountDetails.trim()) {
      setErrorMsg('⚠️ يرجى إدخال رقم الحساب / المحفظة أو الآيبان!');
      return;
    }

    // Save withdrawal request to Firebase Realtime Database
    try {
      const withdrawalRef = push(ref(rtdb, `withdrawals/${user.id}`));
      await set(withdrawalRef, {
        userId: user.id,
        userName: user.name,
        beneficiaryName: beneficiaryName || user.name,
        gateway: selectedGateway,
        accountDetails: accountDetails.trim(),
        diamondsAmount: diamondsToWithdraw,
        usdAmount: calculatedUsd,
        status: 'pending',
        createdAt: Date.now(),
      });
    } catch (e) {
      console.warn('Could not save withdrawal to RTDB, proceed locally:', e);
    }

    onUpdateDiamonds(-diamondsToWithdraw);
    setIsSuccess(true);
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 font-sans text-white animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#16241b] via-[#0d1711] to-[#060a08] border-2 border-emerald-500/70 rounded-3xl p-5 text-center shadow-[0_0_40px_rgba(16,185,129,0.3)] space-y-4 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-emerald-900/50 pb-2.5">
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <h3 className="font-black text-sm text-emerald-300">سحب أرباح المذيعين الحقيقية 💵</h3>
          </div>

          <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-xs font-bold text-emerald-300">
            <span>💎 {user.diamonds.toLocaleString()}</span>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-red-950/80 border border-red-500/60 rounded-xl p-2.5 text-xs text-red-200 animate-bounce">
            {errorMsg}
          </div>
        )}

        {isSuccess ? (
          /* SUCCESS CONFIRMATION VIEW */
          <div className="p-6 space-y-3 my-auto text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.6)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-black text-white">تم إرسال طلب السحب بنجاح! 🎉</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              تم خصم <strong className="text-emerald-400 font-mono">{diamondsToWithdraw.toLocaleString()} ماسة</strong> وسيتم تحويل مبلغ <strong className="text-amber-300 font-mono">${calculatedUsd.toFixed(2)} USD</strong> لحسابك خلال 24 ساعة.
            </p>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg active:scale-95 transition-all mt-4"
            >
              تم
            </button>
          </div>
        ) : (
          /* WITHDRAW FORM */
          <div className="overflow-y-auto space-y-3 flex-1 pr-1 text-right">
            {/* Balance & USD Estimation Card */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/40 shadow-inner flex items-center justify-between">
              <div className="text-left">
                <span className="text-xs text-slate-400 font-bold block">المبلغ المقدر بالدولار:</span>
                <span className="text-lg font-black font-mono text-emerald-400">${calculatedUsd.toFixed(2)} USD</span>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 font-bold block">رصيد ماساتك المتاح:</span>
                <span className="text-base font-black font-mono text-cyan-300">💎 {user.diamonds.toLocaleString()}</span>
              </div>
            </div>

            {/* Diamonds Selection Amount */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-300 block">اختر كمية الماسات المراد سحبها:</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[20000, 50000, 100000, 200000].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDiamondsToWithdraw(d)}
                    className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all ${diamondsToWithdraw === d ? 'bg-emerald-600 text-white border-emerald-400 shadow-md' : 'bg-slate-900/70 border-slate-800 text-slate-400'}`}
                  >
                    {(d / 1000).toFixed(0)}K
                  </button>
                ))}
              </div>
            </div>

            {/* Gateway Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-300 block">اختر وسيلة الدفع / السحب:</label>
              <div className="space-y-1.5">
                {gateways.map((gw) => {
                  const isSelected = selectedGateway === gw.id;
                  return (
                    <div
                      key={gw.id}
                      onClick={() => setSelectedGateway(gw.id)}
                      className={`p-2.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${isSelected ? 'bg-emerald-950/70 border-emerald-400 text-white shadow-md' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                    >
                      <span className="text-[10px] text-slate-400 font-bold">عمولة: {gw.fee}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white">{gw.name}</span>
                        <span className="text-base">{gw.icon}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Account Details Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-300 block">رقم الحساب / الهاتف / الآيبان أو العنوان:</label>
              <input
                type="text"
                value={accountDetails}
                onChange={(e) => setAccountDetails(e.target.value)}
                placeholder="أدخل رقم المحفظة أو IBAN..."
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-right text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleWithdrawSubmit}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-slate-950 font-black text-sm shadow-xl active:scale-95 transition-all mt-2"
            >
              تأكيد سحب ${calculatedUsd.toFixed(2)} USD الآن 💸
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
