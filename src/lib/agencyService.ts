import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  increment,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, set, get, update, remove, onValue } from 'firebase/database';
import { db, rtdb, ensureFirebaseAuthSession } from './firebase';
import { UserProfile, AgencyInfo, AgencyHost, AgencyJoinRequest, HostTargetTier, HOST_TARGET_TIERS } from '../types';

export const LOCAL_AGENCY_KEY = 'saleem_user_active_agency';

export interface AgencyRecord extends AgencyInfo {
  members?: Record<string, { role: 'owner' | 'assistant' | 'member'; joinedAt: number }>;
}

/**
 * 1. Creates a new agency in Firestore & RTDB with unique invite code
 */
export async function createAgency(
  ownerUser: UserProfile,
  agencyName: string,
  agencyLogo?: string
): Promise<AgencyInfo | null> {
  const cleanName = (agencyName || '').trim();
  if (!cleanName) return null;

  try {
    const ownerId = ownerUser?.id || 'user_' + Date.now();
    const ownerName = ownerUser?.name || 'صاحب الوكالة';
    const ownerAvatar = ownerUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';

    const agencyCode = `AGY-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const agencyId = `agency_${agencyCode.toLowerCase()}_${Date.now()}`;
    const now = Date.now();

    const agencyPayload: AgencyInfo = {
      id: agencyId,
      name: cleanName,
      code: agencyCode,
      agentName: ownerName,
      ownerId: ownerId,
      ownerName: ownerName,
      logo: agencyLogo || ownerAvatar,
      level: 'المستوى 1 🥉',
      hostsCount: 1,
      totalHoursMonth: 0,
      totalDiamondsMonth: 0,
      commissionRate: 15,
      monthlyCommissionRate: '15%',
      totalMonthlyRevenueUsd: 0,
    };

    // 1. Instant local persistence
    try {
      localStorage.setItem(LOCAL_AGENCY_KEY, JSON.stringify(agencyPayload));
    } catch (e) {}

    // 2. Dispatch global event
    try {
      window.dispatchEvent(
        new CustomEvent('app:agency-updated', {
          detail: { agencyId, agency: agencyPayload, action: 'created' },
        })
      );
    } catch (e) {}

    // 3. Non-blocking Background Sync to Firebase
    (async () => {
      try {
        await ensureFirebaseAuthSession().catch(() => {});

        // Firestore with 3s timeout
        Promise.race([
          setDoc(doc(db, 'agencies', agencyId), {
            ...agencyPayload,
            createdAt: serverTimestamp(),
          }),
          new Promise((_, reject) => setTimeout(() => reject('timeout'), 3000)),
        ])
          .then(() => {
            setDoc(doc(db, 'agencies', agencyId, 'members', ownerId), {
              userId: ownerId,
              name: ownerName,
              avatar: ownerAvatar,
              agencyRole: 'owner',
              status: 'active',
              monthlyHours: 0,
              diamondsEarned: Number(ownerUser?.diamonds) || 0,
              validDays: 0,
              joinedDate: new Date().toLocaleDateString('ar-EG'),
              joinedAt: now,
            }).catch(() => {});
            updateDoc(doc(db, 'users', ownerId), {
              agencyId,
              agencyRole: 'owner',
              agencyName: cleanName,
              agencyCode,
              isAgencyOwner: true,
              isAgencyHost: true,
            }).catch(() => {});
          })
          .catch(() => {});

        // RTDB with 3s timeout
        Promise.race([
          set(ref(rtdb, `agencies/${agencyId}`), {
            ...agencyPayload,
            members: {
              [ownerId]: { role: 'owner', joinedAt: now },
            },
            createdAt: now,
          }),
          new Promise((_, reject) => setTimeout(() => reject('timeout'), 3000)),
        ])
          .then(() => {
            update(ref(rtdb, `users/${ownerId}`), {
              agencyId,
              agencyRole: 'owner',
              agencyName: cleanName,
              agencyCode,
              isAgencyOwner: true,
              isAgencyHost: true,
            }).catch(() => {});
          })
          .catch(() => {});
      } catch (e) {}
    })();

    return agencyPayload;
  } catch (err) {
    console.error('❌ [agencyService] Error creating agency:', err);
    return null;
  }
}

/**
 * 2. Request membership to an agency by code
 */
export async function requestAgencyMembership(
  user: UserProfile,
  agencyCode: string
): Promise<boolean> {
  if (!user?.id || !agencyCode.trim()) return false;

  const cleanCode = agencyCode.trim().toUpperCase();

  try {
    await ensureFirebaseAuthSession().catch(() => {});
    const now = Date.now();

    // 1. Find agency
    let foundAgencyId: string | null = null;
    try {
      const q = query(collection(db, 'agencies'), where('code', '==', cleanCode));
      const snap = await getDocs(q);
      if (!snap.empty) {
        foundAgencyId = snap.docs[0].id;
      }
    } catch (e) {}

    if (!foundAgencyId) {
      try {
        const rtdbSnap = await get(ref(rtdb, 'agencies'));
        if (rtdbSnap.exists()) {
          const all = rtdbSnap.val();
          const matchKey = Object.keys(all).find((k) => all[k]?.code === cleanCode);
          if (matchKey) foundAgencyId = matchKey;
        }
      } catch (e) {}
    }

    if (!foundAgencyId) return false;

    // 2. Add join request in Firestore & RTDB
    try {
      await setDoc(doc(db, 'agencies', foundAgencyId, 'joinRequests', user.id), {
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        status: 'pending',
        appliedAt: serverTimestamp(),
      });
    } catch (e) {}

    try {
      await set(ref(rtdb, `agencies/${foundAgencyId}/joinRequests/${user.id}`), {
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        status: 'pending',
        appliedAt: now,
      });
    } catch (e) {}

    return true;
  } catch (err) {
    console.error('❌ [agencyService] Error requesting agency membership:', err);
    return false;
  }
}

/**
 * 3. Approve an agency join request
 */
export async function approveAgencyMember(
  ownerUserId: string,
  agency: AgencyRecord,
  targetUserId: string
): Promise<boolean> {
  if (!agency?.id || !targetUserId) return false;

  try {
    await ensureFirebaseAuthSession().catch(() => {});
    const now = Date.now();

    // 1. Fetch user data
    let targetName = 'مستخدم';
    let targetAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
    try {
      const uSnap = await getDoc(doc(db, 'users', targetUserId));
      if (uSnap.exists()) {
        const uData = uSnap.data();
        targetName = uData.name || targetName;
        targetAvatar = uData.avatar || targetAvatar;
      }
    } catch (e) {}

    // 2. Add to members in Firestore
    try {
      await setDoc(doc(db, 'agencies', agency.id, 'members', targetUserId), {
        userId: targetUserId,
        name: targetName,
        avatar: targetAvatar,
        agencyRole: 'member',
        status: 'active',
        monthlyHours: 0,
        diamondsEarned: 0,
        validDays: 0,
        joinedDate: new Date().toLocaleDateString('ar-EG'),
        joinedAt: now,
      });
      await deleteDoc(doc(db, 'agencies', agency.id, 'joinRequests', targetUserId));
      await updateDoc(doc(db, 'agencies', agency.id), {
        hostsCount: increment(1),
      });
      await updateDoc(doc(db, 'users', targetUserId), {
        agencyId: agency.id,
        agencyRole: 'member',
        agencyName: agency.name,
        agencyCode: agency.code,
        isAgencyHost: true,
      });
    } catch (e) {}

    // 3. Update in RTDB
    try {
      await set(ref(rtdb, `agencies/${agency.id}/members/${targetUserId}`), {
        role: 'member',
        joinedAt: now,
      });
      await remove(ref(rtdb, `agencies/${agency.id}/joinRequests/${targetUserId}`));
      await update(ref(rtdb, `users/${targetUserId}`), {
        agencyId: agency.id,
        agencyRole: 'member',
        agencyName: agency.name,
        agencyCode: agency.code,
        isAgencyHost: true,
      });
    } catch (e) {}

    return true;
  } catch (err) {
    console.error('❌ [agencyService] Error approving agency member:', err);
    return false;
  }
}

/**
 * 4. Reject an agency join request
 */
export async function rejectAgencyMember(
  ownerUserId: string,
  agency: AgencyRecord,
  targetUserId: string
): Promise<boolean> {
  if (!agency?.id || !targetUserId) return false;

  try {
    await ensureFirebaseAuthSession().catch(() => {});
    try {
      await deleteDoc(doc(db, 'agencies', agency.id, 'joinRequests', targetUserId));
    } catch (e) {}
    try {
      await remove(ref(rtdb, `agencies/${agency.id}/joinRequests/${targetUserId}`));
    } catch (e) {}
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * 5. Add a member directly by ID
 */
export async function addAgencyMember(
  ownerUserId: string,
  agency: AgencyRecord,
  targetUserId: string
): Promise<boolean> {
  return await approveAgencyMember(ownerUserId, agency, targetUserId);
}

/**
 * 6. Remove a member from agency
 */
export async function removeAgencyMember(
  ownerUserId: string,
  agency: AgencyRecord,
  targetUserId: string
): Promise<boolean> {
  if (!agency?.id || !targetUserId) return false;

  try {
    await ensureFirebaseAuthSession().catch(() => {});

    try {
      await deleteDoc(doc(db, 'agencies', agency.id, 'members', targetUserId));
      await updateDoc(doc(db, 'agencies', agency.id), {
        hostsCount: increment(-1),
      }).catch(() => {});
      await updateDoc(doc(db, 'users', targetUserId), {
        agencyId: null,
        agencyRole: null,
        agencyName: null,
        agencyCode: null,
        isAgencyHost: false,
        isAgencyOwner: false,
      }).catch(() => {});
    } catch (e) {}

    try {
      await remove(ref(rtdb, `agencies/${agency.id}/members/${targetUserId}`));
      await update(ref(rtdb, `users/${targetUserId}`), {
        agencyId: null,
        agencyRole: null,
        agencyName: null,
        agencyCode: null,
        isAgencyHost: false,
        isAgencyOwner: false,
      });
    } catch (e) {}

    return true;
  } catch (err) {
    return false;
  }
}

/**
 * 7. Set member role (e.g. promote to assistant)
 */
export async function setAgencyMemberRole(
  ownerUserId: string,
  agency: AgencyRecord,
  targetUserId: string,
  newRole: 'assistant' | 'member'
): Promise<boolean> {
  if (!agency?.id || !targetUserId) return false;

  try {
    await ensureFirebaseAuthSession().catch(() => {});
    try {
      await updateDoc(doc(db, 'agencies', agency.id, 'members', targetUserId), { agencyRole: newRole });
      await updateDoc(doc(db, 'users', targetUserId), { agencyRole: newRole });
    } catch (e) {}
    try {
      await update(ref(rtdb, `agencies/${agency.id}/members/${targetUserId}`), { role: newRole });
      await update(ref(rtdb, `users/${targetUserId}`), { agencyRole: newRole });
    } catch (e) {}
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * 8. Real-time listeners for agency data
 */
export function listenToAgency(agencyId: string, callback: (agency: AgencyRecord | null) => void) {
  if (!agencyId) return () => {};
  const agencyRef = ref(rtdb, `agencies/${agencyId}`);
  return onValue(agencyRef, (snap) => {
    if (snap.exists()) {
      callback({ id: agencyId, ...snap.val() });
    } else {
      callback(null);
    }
  });
}

export function listenToAgencyMembers(agency: AgencyRecord, callback: (members: any[]) => void) {
  if (!agency?.id) return () => {};
  const membersRef = ref(rtdb, `agencies/${agency.id}/members`);
  return onValue(membersRef, async (snap) => {
    if (snap.exists()) {
      const data = snap.val() || {};
      const memberIds = Object.keys(data);
      const membersList: any[] = [];

      for (const uId of memberIds) {
        try {
          const userSnap = await get(ref(rtdb, `users/${uId}`));
          if (userSnap.exists()) {
            membersList.push({ id: uId, ...userSnap.val() });
          } else {
            membersList.push({ id: uId, name: 'عضو', avatar: '' });
          }
        } catch (e) {
          membersList.push({ id: uId, name: 'عضو', avatar: '' });
        }
      }
      callback(membersList);
    } else {
      callback([]);
    }
  });
}

export function listenToAgencyJoinRequests(agencyId: string, callback: (requests: Record<string, any>) => void) {
  if (!agencyId) return () => {};
  const reqRef = ref(rtdb, `agencies/${agencyId}/joinRequests`);
  return onValue(reqRef, (snap) => {
    if (snap.exists()) {
      callback(snap.val());
    } else {
      callback({});
    }
  });
}

/**
 * 9. Activity tracking (Gifts touches, Live Session streaming hours & valid days)
 */
export async function recordAgencyGiftActivity(
  receiverUserId: string,
  diamonds: number,
  roomId?: string
): Promise<void> {
  if (!receiverUserId || diamonds <= 0) return;

  try {
    const userRef = ref(rtdb, `users/${receiverUserId}`);
    const snap = await get(userRef);
    if (!snap.exists()) return;

    const val = snap.val();
    const currentTouches = (val.agencyStats?.touches || 0) + diamonds;
    const currentTarget = (Number(val.targetDiamonds) || 0) + diamonds;

    await update(ref(rtdb, `users/${receiverUserId}/agencyStats`), {
      touches: currentTouches,
      lastTouchAt: Date.now(),
      targetRoomId: roomId || '',
    });

    await update(userRef, {
      targetDiamonds: currentTarget,
      monthlyDiamonds: (Number(val.monthlyDiamonds) || 0) + diamonds,
      totalReceivedDiamonds: (Number(val.totalReceivedDiamonds) || 0) + diamonds,
    });

    // Update agency member diamond score
    if (val.agencyId) {
      await update(ref(rtdb, `agencies/${val.agencyId}/members/${receiverUserId}`), {
        diamondsEarned: currentTouches,
      });
    }
  } catch (e) {}
}

/**
 * احراز مفتاح اليوم وفقاً لساعة البدء (13:00 ظهراً)
 */
export function getAgencyTargetDayKey(timestamp: number = Date.now()): string {
  const d = new Date(timestamp);
  // إذا كانت الساعة قبل 13:00 (1:00م)، يُحسب اليوم على تاريخ الأمس
  if (d.getHours() < 13) {
    d.setDate(d.getDate() - 1);
  }
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function startAgencyLiveSession(userId: string, roomId: string) {
  if (!userId) return;
  update(ref(rtdb, `users/${userId}/agencyStats`), {
    liveSessionStartedAt: Date.now(),
    targetRoomId: roomId,
  }).catch(() => {});
}

export async function stopAgencyLiveSession(userId: string) {
  if (!userId) return;

  try {
    const statsRef = ref(rtdb, `users/${userId}/agencyStats`);
    const snap = await get(statsRef);
    if (!snap.exists()) return;

    const stats = snap.val() || {};
    const startedAt = stats.liveSessionStartedAt;
    if (!startedAt) return;

    const elapsedMinutes = Math.max(1, Math.round((Date.now() - startedAt) / 60000));
    const newLiveMinutes = (stats.liveMinutes || 0) + elapsedMinutes;
    const todayKey = getAgencyTargetDayKey();
    const activeDayKeys = stats.activeDayKeys || {};
    const todayAccumulated = (activeDayKeys[todayKey] || 0) + elapsedMinutes;
    activeDayKeys[todayKey] = todayAccumulated;

    // حساب الأيام الفعالة: كل يوم يحتاج ساعتين على الأقل (120 دقيقة)
    let validDays = 0;
    Object.values(activeDayKeys).forEach((mins) => {
      if (typeof mins === 'number' && mins >= 120) {
        validDays += 1;
      }
    });

    await update(statsRef, {
      liveMinutes: newLiveMinutes,
      validDays,
      activeDayKeys,
      liveSessionStartedAt: null,
      lastLiveEndedAt: Date.now(),
    });
  } catch (e) {}
}

/**
 * 🎯 التحقق البرمجي الكامل من تقدم واستيفاء شروط التارجت الأسبوعي
 */
export interface WeeklyTargetEvaluation {
  targetId: string;
  targetName: string;
  diamondsTarget: number;
  hostRewardUsd: number;
  agentRewardUsd: number;
  
  // الألماسات
  currentDiamonds: number;
  diamondsMet: boolean;
  diamondsPercent: number;
  diamondsRemaining: number;

  // الساعات
  currentMinutes: number;
  currentHours: number;
  requiredHours: number;
  hoursMet: boolean;
  hoursPercent: number;
  hoursRemaining: number;

  // الأيام الفعالة
  validDays: number;
  requiredDays: number;
  daysMet: boolean;
  daysPercent: number;
  daysRemaining: number;

  // اليوم الحالي
  todayLiveMinutes: number;
  todayMet: boolean;
  todayMinutesRemaining: number;

  // الحالة الكلية
  isFullyCompleted: boolean;
  isClaimed: boolean;
}

export function evaluateWeeklyTarget(user: UserProfile, targetId: string = 'target_10k'): WeeklyTargetEvaluation {
  const targetMap: Record<string, { name: string; diamonds: number; hostUsd: number; agentUsd: number }> = {
    target_10k: { name: 'Target 10K', diamonds: 10000, hostUsd: 6, agentUsd: 1.11 },
    target_20k: { name: 'Target 20K', diamonds: 20000, hostUsd: 12, agentUsd: 2.22 },
    target_40k: { name: 'Target 40K', diamonds: 40000, hostUsd: 20, agentUsd: 4.44 },
    target_65k: { name: 'Target 65K', diamonds: 65000, hostUsd: 28, agentUsd: 7.22 },
    target_100k: { name: 'Target 100K', diamonds: 100000, hostUsd: 50, agentUsd: 11.11 },
    target_150k: { name: 'Target 150K', diamonds: 150000, hostUsd: 67, agentUsd: 22.22 },
    target_275k: { name: 'Target 275K', diamonds: 275000, hostUsd: 123, agentUsd: 40.74 },
    target_375k: { name: 'Target 375K', diamonds: 375000, hostUsd: 153, agentUsd: 69.44 },
    target_500k: { name: 'Target 500K', diamonds: 500000, hostUsd: 200, agentUsd: 92.59 },
    target_750k: { name: 'Target 750K', diamonds: 750000, hostUsd: 310, agentUsd: 138.89 },
    target_1m: { name: 'Target 1M', diamonds: 1000000, hostUsd: 375, agentUsd: 222.22 },
  };

  const target = targetMap[targetId] || targetMap['target_10k'];
  const currentDiamonds = Number(user.targetDiamonds || user.diamonds || user.agencyStats?.touches) || 0;
  const currentMinutes = Number(user.agencyStats?.liveMinutes) || 0;
  const currentHours = Math.round((currentMinutes / 60) * 10) / 10;
  const validDays = Number(user.agencyStats?.validDays) || 0;

  const todayKey = getAgencyTargetDayKey();
  const todayLiveMinutes = Number(user.agencyStats?.activeDayKeys?.[todayKey]) || 0;

  const requiredHours = 8;
  const requiredDays = 4;

  const diamondsMet = currentDiamonds >= target.diamonds;
  const hoursMet = currentMinutes >= requiredHours * 60;
  const daysMet = validDays >= requiredDays;
  const todayMet = todayLiveMinutes >= 120;

  const diamondsPercent = Math.min(100, Math.round((currentDiamonds / target.diamonds) * 100));
  const hoursPercent = Math.min(100, Math.round((currentMinutes / (requiredHours * 60)) * 100));
  const daysPercent = Math.min(100, Math.round((validDays / requiredDays) * 100));

  const isFullyCompleted = diamondsMet && hoursMet && daysMet;
  const isClaimed = Boolean(user.agencyStats?.claimedTargets?.[targetId]);

  return {
    targetId,
    targetName: target.name,
    diamondsTarget: target.diamonds,
    hostRewardUsd: target.hostUsd,
    agentRewardUsd: target.agentUsd,
    currentDiamonds,
    diamondsMet,
    diamondsPercent,
    diamondsRemaining: Math.max(0, target.diamonds - currentDiamonds),
    currentMinutes,
    currentHours,
    requiredHours,
    hoursMet,
    hoursPercent,
    hoursRemaining: Math.max(0, requiredHours - currentHours),
    validDays,
    requiredDays,
    daysMet,
    daysPercent,
    daysRemaining: Math.max(0, requiredDays - validDays),
    todayLiveMinutes,
    todayMet,
    todayMinutesRemaining: Math.max(0, 120 - todayLiveMinutes),
    isFullyCompleted,
    isClaimed,
  };
}

/**
 * 🏆 استلام وتسكير مكافأة التارجت المحقق
 */
export async function claimTargetReward(userId: string, targetId: string): Promise<{ success: boolean; rewardDiamonds: number; hostUsd: number }> {
  if (!userId) throw new Error('معرف المستخدم غير صالح');

  const userRef = ref(rtdb, `users/${userId}`);
  const snap = await get(userRef);
  if (!snap.exists()) throw new Error('المستخدم غير موجود');

  const user = snap.val();
  const evaluation = evaluateWeeklyTarget(user, targetId);

  if (!evaluation.isFullyCompleted) {
    throw new Error('لم تكتمل جميع شروط التارجت (الألماسات، 8 ساعات، 4 أيام نشاط)');
  }

  if (evaluation.isClaimed) {
    throw new Error('تم استلام مكافأة هذا التارجت بالفعل لهذه الدورة');
  }

  // إضافة ألماسات مكافأة التارجت إلى رصيد targetRewardDiamonds ليتمكن من فكها
  const rewardDiamonds = evaluation.diamondsTarget;
  const currentRewardDiamonds = Number(user.targetRewardDiamonds) || 0;

  await update(userRef, {
    targetRewardDiamonds: currentRewardDiamonds + rewardDiamonds,
    [`agencyStats/claimedTargets/${targetId}`]: Date.now(),
    [`agencyStats/lastClaimedAt`]: Date.now(),
  });

  return {
    success: true,
    rewardDiamonds,
    hostUsd: evaluation.hostRewardUsd,
  };
}

/**
 * 📥 تصدير تقرير التارجت وغرفة الستريمر بصيغة CSV متوافقة مع Excel والهواتف
 */
export function downloadAgencyReportCsv(agency: AgencyInfo, hosts: AgencyHost[], dateRangeLabel: string = 'هذا الأسبوع') {
  const headers = [
    'اسم الوكالة',
    'ID الوكالة',
    'النطاق الزمني',
    'SID (ID الستريمر)',
    'كنية الستريمر',
    'تاريخ الانضمام',
    'ماس الهدايا المحقق (💎)',
    'وقت الميكروفون (ساعة)',
    'الأيام الفعالة (يوم)',
    'مستوى التارجت',
    'راتب المضيف المستحق ($)',
    'حالة مراجعة البيانات',
    'حالة التحقق'
  ];

  const rows = hosts.map(h => {
    // Determine closest target
    let tierName = 'بداية التارجت';
    let salary = 0;
    for (const t of HOST_TARGET_TIERS) {
      if (h.diamondsEarned >= t.requiredDiamonds) {
        tierName = t.tierName;
        salary = t.baseSalaryUsd;
      }
    }

    return [
      `"${agency.name || 'وكالتي'}"`,
      `"${agency.code || agency.id || '3858'}"`,
      `"${dateRangeLabel}"`,
      `"${h.id}"`,
      `"${h.name.replace(/"/g, '""')}"`,
      `"${h.joinedDate || '2026-08-28'}"`,
      h.diamondsEarned || 0,
      h.monthlyHours || 0,
      h.validDays || 0,
      `"${tierName}"`,
      `"$${salary} USD"`,
      '"موافقة"',
      '"موافقة"'
    ];
  });

  // If no hosts, add summary line
  if (rows.length === 0) {
    rows.push([
      `"${agency.name || 'وكالتي'}"`,
      `"${agency.code || agency.id || '3858'}"`,
      `"${dateRangeLabel}"`,
      '"--"',
      '"لا يوجد ستريمر مسجلين"',
      '"--"',
      0,
      0,
      0,
      '"--"',
      '"$0 USD"',
      '"--"',
      '"--"'
    ]);
  }

  // Prepend UTF-8 Byte Order Mark (\uFEFF) so Excel opens Arabic text accurately
  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `agency_report_${(agency.code || 'agency').toLowerCase()}_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
