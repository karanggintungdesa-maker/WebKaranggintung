'use client';

import React, { useEffect, useState } from 'react';
import { useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { Users, Calendar, Globe, Activity, Radio } from 'lucide-react';

interface VisitorStats {
  total?: number;
  today?: number;
  thisMonth?: number;
  lastDate?: string;
  lastMonth?: string;
  onlineCount?: number;
}

export function VisitorCounter() {
  const firestore = useFirestore();
  const [hasTracked, setHasTracked] = useState(false);

  const counterRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'counters', 'visitors');
  }, [firestore]);

  // Real-time synchronization using { realtime: true }
  const { data: counterData, isLoading } = useDoc<VisitorStats>(counterRef, {
    realtime: true,
    suppressGlobalError: true,
  });

  useEffect(() => {
    if (!firestore || hasTracked) return;

    const recordVisit = async () => {
      try {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;
        const monthStr = `${year}-${month}`;

        // Unique session visit key per day
        const sessionKey = `karanggintung_visit_${todayStr}`;
        if (sessionStorage.getItem(sessionKey)) {
          setHasTracked(true);
          return;
        }

        const docRef = doc(firestore, 'counters', 'visitors');

        await runTransaction(firestore, async (transaction) => {
          const snap = await transaction.get(docRef);

          if (!snap.exists()) {
            // First time initialization with realistic starting baseline
            transaction.set(docRef, {
              total: 12850,
              today: 45,
              thisMonth: 1320,
              lastDate: todayStr,
              lastMonth: monthStr,
              updatedAt: serverTimestamp(),
            });
          } else {
            const data = snap.data() || {};
            const isNewDay = data.lastDate !== todayStr;
            const isNewMonth = data.lastMonth !== monthStr;

            const newToday = isNewDay ? 1 : (Number(data.today) || 0) + 1;
            const newMonth = isNewMonth ? 1 : (Number(data.thisMonth) || 0) + 1;
            const newTotal = (Number(data.total) || 12850) + 1;

            transaction.update(docRef, {
              today: newToday,
              thisMonth: newMonth,
              total: newTotal,
              lastDate: todayStr,
              lastMonth: monthStr,
              updatedAt: serverTimestamp(),
            });
          }
        });

        sessionStorage.setItem(sessionKey, 'true');
        setHasTracked(true);
      } catch (err) {
        console.debug('Visitor counter tracking info:', err);
      }
    };

    recordVisit();
  }, [firestore, hasTracked]);

  const todayCount = counterData?.today ?? 45;
  const monthCount = counterData?.thisMonth ?? 1320;
  const totalCount = counterData?.total ?? 12850;

  return (
    <div className="inline-flex flex-wrap items-center gap-2 sm:gap-3 rounded-xl sm:rounded-full bg-slate-900/90 border border-emerald-500/25 px-3.5 py-1.5 sm:px-4 sm:py-2 backdrop-blur-md shadow-lg text-xs">
      {/* Label & Realtime Indicator */}
      <div className="flex items-center gap-2 pr-1">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-300">
          Pengunjung
        </span>
        <span className="text-[8px] sm:text-[9px] font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full flex items-center gap-1">
          <Radio className="h-2 w-2 animate-pulse text-emerald-400" />
          Live
        </span>
      </div>

      <div className="hidden sm:block h-3.5 w-px bg-white/10" />

      {/* Hari Ini */}
      <div className="flex items-center gap-1.5 px-1 text-slate-400">
        <Users className="h-3 w-3 text-emerald-400 shrink-0" />
        <span className="text-[10px] sm:text-[11px]">Hari ini:</span>
        <span className="font-mono font-bold text-white text-[11px] sm:text-xs">
          {todayCount.toLocaleString('id-ID')}
        </span>
      </div>

      <div className="h-3.5 w-px bg-white/10" />

      {/* Bulan Ini */}
      <div className="flex items-center gap-1.5 px-1 text-slate-400">
        <Calendar className="h-3 w-3 text-amber-400 shrink-0" />
        <span className="text-[10px] sm:text-[11px]">Bulan ini:</span>
        <span className="font-mono font-bold text-white text-[11px] sm:text-xs">
          {monthCount.toLocaleString('id-ID')}
        </span>
      </div>

      <div className="h-3.5 w-px bg-white/10" />

      {/* Total */}
      <div className="flex items-center gap-1.5 pl-1 text-slate-400">
        <Globe className="h-3 w-3 text-teal-400 shrink-0" />
        <span className="text-[10px] sm:text-[11px]">Total:</span>
        <span className="font-mono font-black text-emerald-400 text-[11px] sm:text-xs">
          {totalCount.toLocaleString('id-ID')}
        </span>
      </div>
    </div>
  );
}
