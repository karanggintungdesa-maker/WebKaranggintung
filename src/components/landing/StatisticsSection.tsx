'use client';

import { motion } from 'framer-motion';
import { useMemoFirebase, useCollection, useDoc, useFirestore, useUser } from '@/firebase';
import { collection, query, limit, where, doc } from 'firebase/firestore';
import { ArrowUpRight, Home, Users, FileText, BarChart3, BadgeCheck, MapPin, Sparkles } from 'lucide-react';
import { StatisticsCharts } from './StatisticsCharts';

export function StatisticsSection() {
  const firestore = useFirestore();

  const statsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'villageProfile', 'statistics');
  }, [firestore]);

  const { data: statsDoc, isLoading: statsLoading } = useDoc<any>(statsRef);
  const { user } = useUser();

  const submissionsQuery = useMemoFirebase(() => {
    if (!firestore || !user || user.isAnonymous) return null;
    return query(
      collection(firestore, 'letterRequests'),
      where('requestorAuthUid', '==', user.uid),
      limit(5000)
    );
  }, [firestore, user]);

  const { data: submissions } = useCollection(submissionsQuery);

  const metricsList = [
    {
      label: 'Jumlah Penduduk',
      value: statsDoc?.total ? Number(statsDoc.total).toLocaleString('id-ID') : '9.746',
      subtext: '4.971 L · 4.775 P',
      unit: 'Jiwa',
      icon: Users,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
      gradient: 'from-emerald-500/10 to-emerald-500/0'
    },
    {
      label: 'Kepala Keluarga',
      value: statsDoc?.totalKK ? Number(statsDoc.totalKK).toLocaleString('id-ID') : '3.120',
      subtext: 'Rata-rata 3,1 jiwa/KK',
      unit: 'Rumah Tangga (KK)',
      icon: Home,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
      gradient: 'from-amber-500/10 to-amber-500/0'
    },
    {
      label: 'Jumlah Dusun',
      value: '5',
      subtext: '5 Wilayah Kerja',
      unit: 'Wilayah Dusun',
      icon: MapPin,
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
      gradient: 'from-emerald-500/10 to-emerald-500/0'
    },
    {
      label: 'Rukun Warga (RW)',
      value: '6',
      subtext: 'RW 01 s.d. RW 06',
      unit: 'Wilayah RW',
      icon: BarChart3,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
      gradient: 'from-blue-500/10 to-blue-500/0'
    },
    {
      label: 'Rukun Tetangga (RT)',
      value: '51',
      subtext: 'Tersebar di 6 RW',
      unit: 'Wilayah RT',
      icon: BadgeCheck,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-100',
      gradient: 'from-teal-500/10 to-teal-500/0'
    },
    {
      label: 'Kepadatan Penduduk',
      value: '986',
      subtext: 'Luas 9,88 km²',
      unit: 'Jiwa / km² (988 Ha)',
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-100',
      gradient: 'from-purple-500/10 to-purple-500/0'
    },
  ];

  return (
    <section className="py-24 sm:py-28 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45 }}
          className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              Statistik Desa Karanggintung
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Data terbaru mengenai kondisi Desa Karanggintung.
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Informasi terbuka mengenai demografi kependudukan, wilayah administratif, dan perkembangan Desa Karanggintung, Kecamatan Gandrungmangu.
            </p>
          </div>
          <a
            href="/statistik?tab=kependudukan"
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-colors group"
          >
            <span>Lihat statistik lengkap</span>
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </motion.div>

        {/* Live Metric Cards Grid */}
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 md:gap-6">
          {metricsList.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                whileHover={{ y: -6, scale: 1.03 }}
                className="group relative overflow-hidden rounded-[1.75rem] border-0 bg-white/95 backdrop-blur-sm p-5 shadow-sm transition-all duration-300 hover:shadow-xl flex flex-col justify-between"
              >
                <div className={`absolute top-0 right-0 h-20 w-20 rounded-full bg-gradient-to-bl ${item.gradient} blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500`} />

                <div>
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${item.bgColor} ${item.color} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 leading-tight">
                    {item.label}
                  </p>
                </div>

                <div className="mt-4 pt-2">
                  <p className="text-2xl font-black tracking-tight text-slate-900 font-mono font-display">
                    {item.value}
                  </p>
                  <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mt-0.5">
                    {item.unit}
                  </p>
                  {item.subtext && (
                    <p className="text-[9px] font-medium text-slate-400 mt-1">
                      {item.subtext}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Charts Container */}
        <div className="mt-8">
          <StatisticsCharts statsDoc={statsDoc} isLoading={statsLoading} />
        </div>
      </div>
    </section>
  );
}
