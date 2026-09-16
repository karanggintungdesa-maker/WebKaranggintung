'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Home, MapPin, Layers, Sparkles, Activity, PieChart as PieIcon, BarChart2 } from 'lucide-react';

const COLORS = ['#059669', '#0284c7', '#14b8a6', '#f59e0b', '#8b5cf6'];

interface StatisticsChartsProps {
  statsDoc?: any;
  isLoading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const dataObj = payload[0].payload;
    return (
      <div className="rounded-2xl border border-white/20 bg-slate-900/95 p-4 shadow-xl backdrop-blur-md text-white text-xs space-y-1 z-50">
        <p className="font-bold uppercase tracking-wider text-slate-300">{label || dataObj?.name || payload[0].name}</p>
        <p className="text-lg font-black font-mono text-emerald-400">
          {Number(payload[0].value).toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-300">jiwa</span>
        </p>
        {dataObj?.pct && (
          <p className="text-[11px] font-semibold text-emerald-300/90">
            Proporsi: {dataObj.pct}
          </p>
        )}
      </div>
    );
  }
  return null;
};

export function StatisticsCharts({ statsDoc, isLoading }: StatisticsChartsProps) {
  const [chartView, setChartView] = useState<'dusun' | 'umur'>('dusun');

  const firestore = useFirestore();
  const profileRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'villageProfile', 'default');
  }, [firestore]);

  const { data: profile } = useDoc<Record<string, any>>(profileRef);

  const population = statsDoc?.total || 9746;
  const areaKm = profile?.areaKm || profile?.area || profile?.luas || '9,88';
  const totalKK = statsDoc?.totalKK || 3120;
  const male = statsDoc?.maleCount ?? 4971;
  const female = statsDoc?.femaleCount ?? 4775;

  const genderData = useMemo(() => {
    const other = statsDoc?.otherCount ?? 0;
    return [
      { name: `Laki-laki (${male.toLocaleString('id-ID')} / 51%)`, value: male, pct: '51.0%' },
      { name: `Perempuan (${female.toLocaleString('id-ID')} / 49%)`, value: female, pct: '49.0%' },
      ...(other > 0 ? [{ name: 'Lainnya', value: other, pct: '0%' }] : []),
    ];
  }, [statsDoc, male, female]);

  const dusunDistribution = useMemo(() => {
    if (statsDoc?.dusunBreakdown && Array.isArray(statsDoc.dusunBreakdown) && statsDoc.dusunBreakdown.length > 0) {
      return statsDoc.dusunBreakdown;
    }
    return [
      { name: 'Dsn. Karanggintung', count: 2450, pct: '25.1%' },
      { name: 'Dsn. Pagergunung', count: 2180, pct: '22.4%' },
      { name: 'Dsn. Sindangraja', count: 1920, pct: '19.7%' },
      { name: 'Dsn. Penumbang', count: 1750, pct: '18.0%' },
      { name: 'Dsn. Karangtawang', count: 1446, pct: '14.8%' },
    ];
  }, [statsDoc]);

  const ageDistribution = useMemo(() => {
    return [
      { name: '0–4 Th', count: 565, pct: '5.8%' },
      { name: '5–9 Th', count: 679, pct: '7.0%' },
      { name: '10–14 Th', count: 686, pct: '7.0%' },
      { name: '15–19 Th', count: 670, pct: '6.9%' },
      { name: '20–24 Th', count: 697, pct: '7.2%' },
      { name: '25–29 Th', count: 752, pct: '7.7%' },
      { name: '30–34 Th', count: 747, pct: '7.7%' },
      { name: '35–39 Th', count: 672, pct: '6.9%' },
      { name: '40–44 Th', count: 641, pct: '6.6%' },
      { name: '45–49 Th', count: 630, pct: '6.5%' },
      { name: '50–54 Th', count: 615, pct: '6.3%' },
      { name: '55–59 Th', count: 580, pct: '6.0%' },
      { name: '60+ Th', count: 1412, pct: '14.5%' },
    ];
  }, []);

  if (isLoading) {
    return (
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-[340px] rounded-[2rem]" />
        <Skeleton className="h-[340px] rounded-[2rem]" />
        <Skeleton className="h-[340px] rounded-[2rem]" />
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-3">
      {/* CARD 1: KILAS DATA WILAYAH & DEMOGRAFI */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.45 }}
        whileHover={{ y: -6, scale: 1.01 }}
        className="relative overflow-hidden rounded-[2rem] border-0 bg-white/95 backdrop-blur-md p-6 sm:p-7 shadow-md transition-all duration-300 hover:shadow-xl flex flex-col justify-between"
      >
        <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-emerald-500/5 blur-xl pointer-events-none" />

        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-700">Demografi Resmi</p>
              <h4 className="text-base font-bold text-slate-900">Kilas Data Wilayah & Penduduk</h4>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/90 border-0">
              <div className="flex items-center gap-2.5">
                <Users className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-semibold text-slate-600">Total Penduduk</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-slate-900 font-mono">{population.toLocaleString('id-ID')}</span>
                <span className="text-[10px] text-slate-500 font-medium ml-1">Jiwa</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-2xl bg-blue-50/70 border-0">
                <p className="text-[9px] font-black uppercase tracking-wider text-blue-700">Laki-laki</p>
                <p className="text-sm font-black text-blue-900 font-mono mt-0.5">{male.toLocaleString('id-ID')} <span className="text-[9px] font-semibold text-blue-600">(51%)</span></p>
              </div>
              <div className="p-3 rounded-2xl bg-rose-50/70 border-0">
                <p className="text-[9px] font-black uppercase tracking-wider text-rose-700">Perempuan</p>
                <p className="text-sm font-black text-rose-900 font-mono mt-0.5">{female.toLocaleString('id-ID')} <span className="text-[9px] font-semibold text-rose-600">(49%)</span></p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/90 border-0">
              <div className="flex items-center gap-2.5">
                <Home className="h-4 w-4 text-amber-600" />
                <span className="text-xs font-semibold text-slate-600">Kepala Keluarga (KK)</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-slate-900 font-mono">{totalKK.toLocaleString('id-ID')}</span>
                <span className="text-[10px] text-slate-500 font-medium ml-1">KK</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/90 border-0">
              <div className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-semibold text-slate-600">Luas & Kepadatan</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-slate-900 font-mono">{areaKm} km² · 986 jiwa/km²</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/50 border-0">
              <div className="flex items-center gap-2.5">
                <Activity className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-semibold text-slate-700">Sex Ratio (Rasio Jenis Kelamin)</span>
              </div>
              <span className="text-xs font-black text-emerald-800 font-mono">104,10</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 flex items-center justify-between text-xs text-slate-500 font-medium border-t border-slate-100">
          <span className="flex items-center gap-1.5 text-emerald-700 font-semibold text-[11px]">
            <Sparkles className="h-3.5 w-3.5" />
            Data Resmi Desa Karanggintung
          </span>
          <span className="text-[9px] uppercase font-bold text-slate-400">Kec. Gandrungmangu</span>
        </div>
      </motion.div>

      {/* CARD 2: KOMPOSISI JENIS KELAMIN */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.45, delay: 0.08 }}
        whileHover={{ y: -6, scale: 1.01 }}
        className="relative overflow-hidden rounded-[2rem] border-0 bg-white/95 backdrop-blur-md p-6 sm:p-7 shadow-md transition-all duration-300 hover:shadow-xl flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl">
                <PieIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-700">Persentase</p>
                <h4 className="text-base font-bold text-slate-900">Komposisi Jenis Kelamin</h4>
              </div>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700">
              9.746 Jiwa
            </span>
          </div>

          <div style={{ width: '100%', height: 210 }} className="my-2">
            <ResponsiveContainer>
              <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <Pie
                  data={genderData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={75}
                  innerRadius={45}
                  paddingAngle={4}
                  startAngle={90}
                  endAngle={-270}
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 11, fontWeight: 600 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-2 pt-3 grid grid-cols-2 gap-2 border-t border-slate-100 text-center">
          <div className="p-2 rounded-xl bg-slate-50">
            <p className="text-[10px] font-bold text-slate-500 uppercase">Laki-Laki</p>
            <p className="text-xs font-black text-emerald-700 font-mono">4.971 Jiwa (51%)</p>
          </div>
          <div className="p-2 rounded-xl bg-slate-50">
            <p className="text-[10px] font-bold text-slate-500 uppercase">Perempuan</p>
            <p className="text-xs font-black text-sky-700 font-mono">4.775 Jiwa (49%)</p>
          </div>
        </div>
      </motion.div>

      {/* CARD 3: SEBARAN PENDUDUK PER DUSUN & USIA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.45, delay: 0.16 }}
        whileHover={{ y: -6, scale: 1.01 }}
        className="relative overflow-hidden rounded-[2rem] border-0 bg-white/95 backdrop-blur-md p-6 sm:p-7 shadow-md transition-all duration-300 hover:shadow-xl flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl">
                <BarChart2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-700">Distribusi</p>
                <h4 className="text-base font-bold text-slate-900">
                  {chartView === 'dusun' ? 'Sebaran 5 Dusun' : 'Piramida Kelompok Usia'}
                </h4>
              </div>
            </div>

            {/* View Switch Buttons */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setChartView('dusun')}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                  chartView === 'dusun'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Dusun
              </button>
              <button
                type="button"
                onClick={() => setChartView('umur')}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                  chartView === 'umur'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Usia
              </button>
            </div>
          </div>

          <div style={{ width: '100%', height: 210 }} className="my-2">
            <ResponsiveContainer>
              <BarChart
                data={chartView === 'dusun' ? dusunDistribution : ageDistribution}
                margin={{ top: 12, right: 10, left: -20, bottom: chartView === 'dusun' ? 15 : 0 }}
              >
                <defs>
                  <linearGradient id="barGradientDusun" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#059669" stopOpacity={1} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 9, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  angle={chartView === 'dusun' ? -15 : -35}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="url(#barGradientDusun)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-2 pt-3 flex items-center justify-between text-xs text-slate-500 font-medium border-t border-slate-100">
          <span className="text-[10px] font-bold text-slate-500 uppercase">
            {chartView === 'dusun' ? '5 Dusun Terdata Lengkap' : '13 Kategori Rentang Umur'}
          </span>
          <span className="text-[10px] font-black text-emerald-700">
            Total 9.746 Jiwa
          </span>
        </div>
      </motion.div>
    </div>
  );
}
