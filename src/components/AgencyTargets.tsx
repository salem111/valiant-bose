import React, { useEffect, useState } from "react";
import { getTargets, TargetLevel } from "../services/targetsApi";
import { Sparkles, Target, Clock, Calendar, DollarSign, Award, Shield, Search, RefreshCw, Zap } from "lucide-react";

export default function AgencyTargets() {
  const [targets, setTargets] = useState<TargetLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<"all" | "bronze" | "silver" | "gold">("all");

  useEffect(() => {
    loadTargets();
  }, []);

  async function loadTargets() {
    try {
      setLoading(true);
      setError("");
      const data = await getTargets();
      setTargets(data);
    } catch (err) {
      console.error("Failed to load targets:", err);
      setError("تعذر تحميل التارجت");
    } finally {
      setLoading(false);
    }
  }

  const filteredTargets = targets.filter((target) => {
    const matchesSearch =
      target.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      target.diamondsTarget.toString().includes(searchQuery);

    if (!matchesSearch) return false;

    if (filterCategory === "bronze") return target.diamondsTarget <= 65000;
    if (filterCategory === "silver") return target.diamondsTarget > 65000 && target.diamondsTarget <= 375000;
    if (filterCategory === "gold") return target.diamondsTarget >= 500000;
    return true;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4 text-amber-300">
        <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
        <span className="text-sm font-bold animate-pulse">جاري تحميل جدول التارجت الأسبوعي...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-right dir-rtl select-none">
      {/* Target System Highlights Bar */}
      <div className="bg-gradient-to-r from-amber-950/80 via-purple-950/70 to-slate-950 border border-amber-500/40 rounded-3xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center font-black shadow-lg">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base text-amber-300 flex items-center gap-1.5">
                <span>سلم التارجت الأسبوعي الرسمي (10K - 1M)</span>
                <Sparkles className="w-4 h-4 text-yellow-400" />
              </h3>
              <p className="text-[10px] text-slate-400">نظام دورة الـ 7 أيام مع احتساب مكافآت المضيف والوكيل بالدولار 💵</p>
            </div>
          </div>
          <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-400/40 px-3 py-1 rounded-full font-mono font-bold">
            {targets.length} مستويات 🎯
          </span>
        </div>

        {/* System Rules Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
          <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-2xl">
            <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400">
              <Calendar className="w-3 h-3 text-cyan-400" />
              <span>دورة التارجت</span>
            </div>
            <strong className="text-xs text-cyan-300 font-bold block mt-0.5">7 أيام أسبوعياً</strong>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-2xl">
            <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>الحد الأدنى للساعات</span>
            </div>
            <strong className="text-xs text-amber-300 font-bold block mt-0.5">8 ساعات بث</strong>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-2xl">
            <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400">
              <Award className="w-3 h-3 text-emerald-400" />
              <span>الأيام الفعالة</span>
            </div>
            <strong className="text-xs text-emerald-300 font-bold block mt-0.5">4 أيام نشطة</strong>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-2xl">
            <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400">
              <Zap className="w-3 h-3 text-purple-400" />
              <span>بداية اليوم</span>
            </div>
            <strong className="text-xs text-purple-300 font-bold block mt-0.5">الساعة 13:00 (1م)</strong>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم أو عدد الألماسات (مثال: 100K أو 1M)..."
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl pr-9 pl-4 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 font-sans"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-[10px] font-bold overflow-x-auto custom-scrollbar">
          <button
            type="button"
            onClick={() => setFilterCategory("all")}
            className={`px-3 py-1.5 rounded-xl transition-all shrink-0 cursor-pointer ${
              filterCategory === "all" ? "bg-amber-500 text-slate-950 font-black shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            الكل ({targets.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory("bronze")}
            className={`px-3 py-1.5 rounded-xl transition-all shrink-0 cursor-pointer ${
              filterCategory === "bronze" ? "bg-amber-500 text-slate-950 font-black shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            10K - 65K 🥉
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory("silver")}
            className={`px-3 py-1.5 rounded-xl transition-all shrink-0 cursor-pointer ${
              filterCategory === "silver" ? "bg-amber-500 text-slate-950 font-black shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            100K - 375K 🥈
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory("gold")}
            className={`px-3 py-1.5 rounded-xl transition-all shrink-0 cursor-pointer ${
              filterCategory === "gold" ? "bg-amber-500 text-slate-950 font-black shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            500K - 1M 👑
          </button>
        </div>
      </div>

      {/* Target Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredTargets.map((target) => {
          const isHighTier = target.diamondsTarget >= 1000000;
          return (
            <div
              key={target.id}
              className={`border rounded-3xl p-3.5 space-y-2.5 transition-all duration-300 hover:scale-[1.01] shadow-lg relative overflow-hidden ${
                isHighTier
                  ? "bg-gradient-to-br from-purple-950/70 via-slate-900 to-[#120a22] border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
                  : "bg-gradient-to-br from-slate-900/90 via-slate-950 to-slate-900 border-slate-800 hover:border-amber-500/50"
              }`}
            >
              {/* Top Header inside Card */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow ${
                    isHighTier ? "bg-purple-500/20 text-purple-300 border border-purple-400/40" : "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                  }`}>
                    {isHighTier ? "👑" : "💎"}
                  </div>
                  <div>
                    <h4 className="font-black text-xs sm:text-sm text-white">{target.name}</h4>
                    <span className="text-[9px] text-slate-400 font-mono">
                      {target.requiredHours}h بث • {target.requiredDays} أيام
                    </span>
                  </div>
                </div>

                <div className="text-left">
                  <span className="font-mono font-black text-xs sm:text-sm text-amber-300 block">
                    💎 {target.diamondsTarget.toLocaleString()}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">ألماسة مطلوبة</span>
                </div>
              </div>

              {/* Rewards Box */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80">
                <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-2 text-center">
                  <span className="text-[9px] text-emerald-300/80 block font-sans">مكافأة المضيف 🎙️</span>
                  <strong className="text-xs sm:text-sm font-black text-emerald-400 font-mono">
                    ${target.hostReward.toLocaleString()}
                  </strong>
                </div>

                <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-2 text-center">
                  <span className="text-[9px] text-amber-300/80 block font-sans">مكافأة الوكيل 🏢</span>
                  <strong className="text-xs sm:text-sm font-black text-amber-300 font-mono">
                    ${typeof target.agentReward === "number" ? target.agentReward.toFixed(2) : target.agentReward}
                  </strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTargets.length === 0 && (
        <div className="text-center py-8 text-slate-500 text-xs">
          لا يوجد تارجت مطابق لبحثك.
        </div>
      )}
    </div>
  );
}
