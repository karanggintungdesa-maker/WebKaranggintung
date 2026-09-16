'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart3, TrendingUp, FileText, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ApbdesData, RealisasiApbdesData, ProdukHukumDesa } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// ─────────────────────────────────────────────────────────────────────────────
// 3D Isometric Bar Chart Component
// ─────────────────────────────────────────────────────────────────────────────

interface IsometricBarProps {
  label: string;
  value: number;
  percentage: number;         // 0–100
  colorTop: string;           // CSS color top face
  colorFront: string;         // CSS color front face
  colorSide: string;          // CSS color side face
  maxHeightPx?: number;
  delay?: number;
  formatter?: (v: number) => string;
}

function IsometricBar({
  label,
  value,
  percentage,
  colorTop,
  colorFront,
  colorSide,
  maxHeightPx = 220,
  delay = 0,
  formatter,
}: IsometricBarProps) {
  const barH = Math.max(12, (percentage / 100) * maxHeightPx);
  const W = 64;   // bar width
  const D = 20;   // depth offset (isometric top)
  const pedestalH = 32;

  const formattedValue = formatter ? formatter(value) : value.toLocaleString('id-ID');

  return (
    <div className="flex flex-col items-center gap-3" style={{ minWidth: 90 }}>
      {/* Label atas */}
      <div className="text-center">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 leading-tight block max-w-[90px] text-center">
          {label.length > 22 ? label.substring(0, 22) + '…' : label}
        </span>
      </div>

      {/* SVG 3D bar */}
      <div
        className="relative"
        style={{
          width: W + D,
          height: maxHeightPx + D + pedestalH + 8,
          display: 'flex',
          alignItems: 'flex-end',
        }}
      >
        <svg
          width={W + D}
          height={maxHeightPx + D + pedestalH + 8}
          viewBox={`0 0 ${W + D} ${maxHeightPx + D + pedestalH + 8}`}
          style={{ overflow: 'visible' }}
        >
          {/* ── PEDESTAL (white base) ── */}
          {/* Pedestal front face */}
          <polygon
            points={`
              0,${maxHeightPx + D}
              ${W},${maxHeightPx + D}
              ${W},${maxHeightPx + D + pedestalH}
              0,${maxHeightPx + D + pedestalH}
            `}
            fill="white"
            stroke="#e2e8f0"
            strokeWidth="1"
          />
          {/* Pedestal side face */}
          <polygon
            points={`
              ${W},${maxHeightPx + D}
              ${W + D},${maxHeightPx}
              ${W + D},${maxHeightPx + pedestalH}
              ${W},${maxHeightPx + D + pedestalH}
            `}
            fill="#f1f5f9"
            stroke="#e2e8f0"
            strokeWidth="1"
          />
          {/* Pedestal top face */}
          <polygon
            points={`
              ${D / 2},${maxHeightPx + D - D / 2}
              ${W + D / 2},${maxHeightPx + D - D / 2}
              ${W + D},${maxHeightPx}
              ${D},${maxHeightPx}
            `}
            fill="#f8fafc"
            stroke="#e2e8f0"
            strokeWidth="1"
          />

          {/* ── COLORED BAR ── */}
          {(() => {
            const barY = maxHeightPx + D - barH; // top-left of bar front face

            return (
              <g
                style={{
                  transform: `translateY(${barH}px) scaleY(0)`,
                  transformOrigin: `0 ${maxHeightPx + D}px`,
                  animation: `isoBarGrow 0.7s cubic-bezier(.22,1,.36,1) ${delay}ms forwards`,
                }}
              >
                {/* Front face */}
                <polygon
                  points={`
                    0,${barY}
                    ${W},${barY}
                    ${W},${maxHeightPx + D}
                    0,${maxHeightPx + D}
                  `}
                  fill={colorFront}
                />
                {/* Side face */}
                <polygon
                  points={`
                    ${W},${barY}
                    ${W + D},${barY - D}
                    ${W + D},${maxHeightPx}
                    ${W},${maxHeightPx + D}
                  `}
                  fill={colorSide}
                />
                {/* Top face */}
                <polygon
                  points={`
                    ${D / 2},${barY - D / 2}
                    ${W + D / 2},${barY - D / 2}
                    ${W + D},${barY - D}
                    ${D},${barY - D}
                  `}
                  fill={colorTop}
                />

                {/* Percentage label on front face — show only if bar is tall enough */}
                {barH > 48 && (
                  <text
                    x={W / 2}
                    y={barY + barH / 2 + 5}
                    textAnchor="middle"
                    fill="white"
                    fontSize="13"
                    fontWeight="900"
                    fontFamily="sans-serif"
                  >
                    {percentage.toFixed(0)}%
                  </text>
                )}
              </g>
            );
          })()}
        </svg>
      </div>

      {/* Value label bawah */}
      <div className="text-center space-y-0.5">
        <div
          className="text-sm font-black tabular-nums"
          style={{ color: colorFront }}
        >
          {formattedValue}
        </div>
        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">nominal</div>
      </div>
    </div>
  );
}

// Warna palet per index
const ISO_PALETTES = [
  { top: '#34d399', front: '#10b981', side: '#059669' },     // emerald
  { top: '#60a5fa', front: '#3b82f6', side: '#1d4ed8' },     // blue
  { top: '#a78bfa', front: '#8b5cf6', side: '#6d28d9' },     // violet
  { top: '#f9a8d4', front: '#ec4899', side: '#be185d' },     // pink
  { top: '#fcd34d', front: '#f59e0b', side: '#b45309' },     // amber
  { top: '#5eead4', front: '#14b8a6', side: '#0f766e' },     // teal
  { top: '#fb923c', front: '#f97316', side: '#c2410c' },     // orange
  { top: '#86efac', front: '#22c55e', side: '#15803d' },     // green
];

interface IsometricChartProps {
  data: { name: string; nominal: number }[];
  title: string;
  subtitle: string;
  emptyText?: string;
}

function IsometricChart({ data, title, subtitle, emptyText }: IsometricChartProps) {
  const maxNominal = Math.max(...data.map(d => d.nominal), 1);

  return (
    <Card className="rounded-[2.5rem] border-none shadow-xl">
      <CardContent className="p-8 space-y-6">
        <div>
          <h4 className="text-xl font-black text-slate-900 font-display">{title}</h4>
          <p className="text-sm text-slate-500 font-medium">{subtitle}</p>
        </div>

        {data.length === 0 ? (
          <div className="text-center py-12 text-slate-400 font-bold">{emptyText || 'Data kosong'}</div>
        ) : (
          <>
            {/* CSS animation keyframe injected once */}
            <style>{`
              @keyframes isoBarGrow {
                from { transform: scaleY(0); }
                to   { transform: scaleY(1); }
              }
            `}</style>

            {/* Scrollable bar area */}
            <div className="overflow-x-auto pb-2">
              <div
                className="flex gap-6 items-end justify-start min-w-max px-4 pt-4"
                style={{ minHeight: 340 }}
              >
                {data.map((item, i) => {
                  const pct = (item.nominal / maxNominal) * 100;
                  const palette = ISO_PALETTES[i % ISO_PALETTES.length];
                  return (
                    <IsometricBar
                      key={item.name}
                      label={item.name}
                      value={item.nominal}
                      percentage={pct}
                      colorTop={palette.top}
                      colorFront={palette.front}
                      colorSide={palette.side}
                      maxHeightPx={220}
                      delay={i * 100}
                      formatter={(v) => `Rp ${(v / 1e6).toFixed(1)}jt`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Legend / total */}
            <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-100">
              {data.map((item, i) => {
                const palette = ISO_PALETTES[i % ISO_PALETTES.length];
                return (
                  <div key={item.name} className="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <span
                      className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: palette.front }}
                    />
                    <span className="truncate max-w-[150px]">{item.name}</span>
                    <span className="text-slate-400">
                      Rp {item.nominal.toLocaleString('id-ID')}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function TataKelolaDesa() {
  const [activeTab, setActiveTab] = useState('apbdes');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const firestore = useFirestore();

  const apbdesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'apbdes'), orderBy('tahun', 'desc'));
  }, [firestore]);

  const realisasiQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'realisasiApbdes'), orderBy('tahun', 'desc'));
  }, [firestore]);

  const produkHukumQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'produkHukumDesa'), orderBy('tahun', 'desc'));
  }, [firestore]);

  const { data: allApbdes, isLoading: isLoadingApbdes } = useCollection<ApbdesData>(apbdesQuery);
  const { data: allRealisasi, isLoading: isLoadingRealisasi } = useCollection<RealisasiApbdesData>(realisasiQuery);
  const { data: allProdukHukum, isLoading: isLoadingProduk } = useCollection<ProdukHukumDesa>(produkHukumQuery);

  const currentApbdes = useMemo(() => allApbdes?.find(d => d.tahun === selectedYear), [allApbdes, selectedYear]);
  const currentRealisasi = useMemo(() => allRealisasi?.find(d => d.tahun === selectedYear), [allRealisasi, selectedYear]);
  const currentProdukHukum = useMemo(() => allProdukHukum?.filter(p => p.tahun === selectedYear) || [], [allProdukHukum, selectedYear]);

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    allApbdes?.forEach(d => years.add(d.tahun));
    allRealisasi?.forEach(d => years.add(d.tahun));
    allProdukHukum?.forEach(d => years.add(d.tahun));
    return Array.from(years).sort((a, b) => b - a);
  }, [allApbdes, allRealisasi, allProdukHukum]);

  const apbdesChartData = useMemo(() => {
    if (!currentApbdes?.items) return [];
    const bidangData: Record<string, any> = {};
    currentApbdes.items.forEach(item => {
      if (!bidangData[item.bidang]) bidangData[item.bidang] = { name: item.bidang, nominal: 0 };
      bidangData[item.bidang].nominal += item.nominal;
    });
    return Object.values(bidangData);
  }, [currentApbdes]);

  const apbdesSumberChartData = useMemo(() => {
    if (!currentApbdes?.items) return [];
    const sumberData: Record<string, any> = {};
    currentApbdes.items.forEach(item => {
      const src = item.sumberAnggaran || 'Lainnya';
      if (!sumberData[src]) sumberData[src] = { name: src, nominal: 0 };
      sumberData[src].nominal += item.nominal;
    });
    return Object.values(sumberData);
  }, [currentApbdes]);

  const realisasiChartData = useMemo(() => {
    if (!currentRealisasi?.items) return [];
    const bidangData: Record<string, any> = {};
    currentRealisasi.items.forEach(item => {
      if (!bidangData[item.bidang]) bidangData[item.bidang] = { name: item.bidang, nominal: 0 };
      bidangData[item.bidang].nominal += item.nominal;
    });
    return Object.values(bidangData);
  }, [currentRealisasi]);

  const realisasiSumberChartData = useMemo(() => {
    if (!currentRealisasi?.items) return [];
    const sumberData: Record<string, any> = {};
    currentRealisasi.items.forEach(item => {
      const src = item.sumberAnggaran || 'Lainnya';
      if (!sumberData[src]) sumberData[src] = { name: src, nominal: 0 };
      sumberData[src].nominal += item.nominal;
    });
    return Object.values(sumberData);
  }, [currentRealisasi]);

  const absorptionStats = useMemo(() => {
    if (!currentApbdes || !currentRealisasi || currentApbdes.totalAnggaran === 0) return { percentage: 0, formatted: '0.0%' };
    const pct = (currentRealisasi.totalRealisasi / currentApbdes.totalAnggaran) * 100;
    return { percentage: pct, formatted: pct.toFixed(1) + '%' };
  }, [currentApbdes, currentRealisasi]);

  const outputAchievementStats = useMemo(() => {
    if (!currentApbdes?.items || !currentRealisasi?.items) return { percentage: 0, formatted: '0.0%' };
    let totalItems = 0, totalAchievementSum = 0;
    currentRealisasi.items.forEach(realisasiItem => {
      const apbdesItem = currentApbdes.items.find(
        a => a.kegiatan.trim().toLowerCase() === realisasiItem.kegiatan.trim().toLowerCase()
      ) || currentApbdes.items.find(
        a => a.kodeRekening.trim() === realisasiItem.kodeRekening.trim() &&
          a.bidang.trim().toLowerCase() === realisasiItem.bidang.trim().toLowerCase()
      );
      if (apbdesItem && apbdesItem.nominal > 0) {
        totalAchievementSum += Math.min(100, (realisasiItem.nominal / apbdesItem.nominal) * 100);
        totalItems++;
      } else if (realisasiItem.nominal > 0) {
        totalAchievementSum += 100;
        totalItems++;
      }
    });
    const pct = totalItems > 0 ? totalAchievementSum / totalItems : 0;
    return { percentage: pct, formatted: pct.toFixed(1) + '%' };
  }, [currentApbdes, currentRealisasi]);

  const tabs = [
    { id: 'apbdes', label: 'APBDes', icon: BarChart3 },
    { id: 'realisasi', label: 'Realisasi APBDes', icon: TrendingUp },
    { id: 'produk', label: 'Produk Hukum Desa', icon: FileText },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Logo />
          <Link href="/">
            <Button variant="ghost" className="font-bold gap-2 text-primary hover:bg-slate-100 rounded-xl">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Beranda</span>
            </Button>
          </Link>
        </div>
      </header>

      <div className="flex-1 container mx-auto px-4 py-8 md:py-12">
        {/* JUDUL */}
        <div className="mb-12 space-y-4">
          <h1 className="text-5xl font-black text-slate-900 uppercase font-display italic">
            Tata Kelola <span className="text-primary not-italic">Desa</span>
          </h1>
          <p className="text-slate-500 font-bold max-w-2xl">
            Transparansi anggaran dan produk hukum desa Karanggintung untuk akuntabilitas publik.
          </p>
        </div>

        {/* TABS */}
        <div className="mb-12">
          <div className="flex gap-2 flex-wrap">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className={cn(
                  'px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all flex items-center gap-2',
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-primary hover:text-primary'
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* YEAR SELECTOR */}
        <div className="mb-8">
          <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
            <SelectTrigger className="w-48 rounded-xl border-slate-300">
              <SelectValue placeholder="Pilih Tahun" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map(year => (
                <SelectItem key={year} value={year.toString()}>Tahun {year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ── APBDES TAB ── */}
        {activeTab === 'apbdes' && (
          <div className="space-y-8">
            {isLoadingApbdes ? (
              <Skeleton className="h-96 rounded-3xl" />
            ) : currentApbdes ? (
              <>
                {/* Overview card */}
                <Card className="rounded-[2.5rem] border-none shadow-xl bg-gradient-to-br from-emerald-50 to-teal-50/50">
                  <CardContent className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                      <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full uppercase tracking-wider">
                        Anggaran Pendapatan &amp; Belanja Desa
                      </span>
                      <h3 className="text-3xl font-black text-slate-900">APBDes Tahun {selectedYear}</h3>
                      <p className="text-slate-500 font-medium">Rekapitulasi rencana anggaran belanja desa Karanggintung.</p>
                    </div>
                    <div className="p-6 bg-white rounded-3xl shadow-sm border border-slate-100/80 min-w-[280px]">
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Rencana Anggaran</span>
                      <div className="text-3xl font-black text-emerald-700 mt-1 font-display">
                        Rp {currentApbdes.totalAnggaran.toLocaleString('id-ID')}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 3D Isometric Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <IsometricChart
                    data={apbdesChartData}
                    title="Perbandingan Total per Bidang"
                    subtitle="Rincian alokasi anggaran belanja untuk setiap bidang pembangunan."
                    emptyText="Data Bidang Kosong"
                  />
                  <IsometricChart
                    data={apbdesSumberChartData}
                    title="Perbandingan Total per Sumber Anggaran"
                    subtitle="Asal/sumber dana anggaran pendapatan dan belanja desa."
                    emptyText="Data Sumber Anggaran Kosong"
                  />
                </div>
              </>
            ) : (
              <div className="text-center py-16 px-6">
                <BarChart3 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 font-semibold">Data APBDes tahun {selectedYear} belum tersedia.</p>
              </div>
            )}
          </div>
        )}

        {/* ── REALISASI TAB ── */}
        {activeTab === 'realisasi' && (
          <div className="space-y-8">
            {isLoadingRealisasi ? (
              <Skeleton className="h-96 rounded-3xl" />
            ) : currentRealisasi ? (
              <>
                {/* Metric Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <Card className="rounded-[2.5rem] border-none shadow-xl bg-gradient-to-br from-emerald-50 to-teal-50/50 flex flex-col justify-between p-8 min-h-[220px]">
                    <div className="space-y-2">
                      <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full uppercase tracking-wider">Realisasi Anggaran Belanja</span>
                      <h3 className="text-2xl font-black text-slate-900 font-display">Realisasi {selectedYear}</h3>
                    </div>
                    <div className="space-y-3 mt-4">
                      <div>
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Realisasi Belanja</span>
                        <div className="text-3xl font-black text-emerald-700 mt-1 font-display">
                          Rp {currentRealisasi.totalRealisasi.toLocaleString('id-ID')}
                        </div>
                      </div>
                      {currentApbdes && (
                        <div className="text-xs text-slate-500 font-bold">
                          Dari Rencana Anggaran: Rp {currentApbdes.totalAnggaran.toLocaleString('id-ID')}
                        </div>
                      )}
                    </div>
                  </Card>

                  <Card className="rounded-[2.5rem] border-none shadow-xl p-8 flex flex-col justify-between min-h-[220px]">
                    <div className="space-y-1">
                      <h4 className="text-lg font-black text-slate-900 font-display">Penyerapan Anggaran</h4>
                      <p className="text-xs text-slate-500 font-medium">Persentase rencana anggaran yang telah direalisasikan.</p>
                    </div>
                    <div className="my-4">
                      <div className="text-5xl md:text-6xl font-black text-emerald-600 font-display italic">{absorptionStats.formatted}</div>
                      <div className="w-full bg-slate-100 rounded-full h-3 mt-3 overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, absorptionStats.percentage)}%` }} />
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Anggaran Terserap</span>
                  </Card>

                  <Card className="rounded-[2.5rem] border-none shadow-xl p-8 flex flex-col justify-between min-h-[220px]">
                    <div className="space-y-1">
                      <h4 className="text-lg font-black text-slate-900 font-display">Capaian Output</h4>
                      <p className="text-xs text-slate-500 font-medium">Rata-rata persentase realisasi kegiatan pembangunan desa.</p>
                    </div>
                    <div className="my-4">
                      <div className="text-5xl md:text-6xl font-black text-teal-600 font-display italic">{outputAchievementStats.formatted}</div>
                      <div className="w-full bg-slate-100 rounded-full h-3 mt-3 overflow-hidden">
                        <div className="bg-teal-500 h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, outputAchievementStats.percentage)}%` }} />
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Kegiatan Terealisasi</span>
                  </Card>
                </div>

                {/* 3D Isometric Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <IsometricChart
                    data={realisasiChartData}
                    title="Perbandingan Total per Bidang"
                    subtitle="Jumlah realisasi belanja untuk masing-masing bidang pembangunan."
                    emptyText="Data Bidang Kosong"
                  />
                  <IsometricChart
                    data={realisasiSumberChartData}
                    title="Perbandingan Total per Sumber Anggaran"
                    subtitle="Realisasi belanja dikelompokkan berdasarkan asal/sumber anggaran."
                    emptyText="Data Sumber Anggaran Kosong"
                  />
                </div>
              </>
            ) : (
              <div className="text-center py-16 px-6">
                <TrendingUp className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 font-semibold">Data Realisasi APBDes tahun {selectedYear} belum tersedia.</p>
              </div>
            )}
          </div>
        )}

        {/* ── PRODUK HUKUM TAB ── */}
        {activeTab === 'produk' && (
          <div className="space-y-8">
            {isLoadingProduk ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-48 rounded-3xl" />
                ))}
              </div>
            ) : currentProdukHukum.length === 0 ? (
              <div className="text-center py-16 px-6">
                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 font-semibold">Belum ada produk hukum tahun {selectedYear}.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentProdukHukum.map(produk => (
                  <Card key={produk.id} className="rounded-[2.5rem] border-none shadow-sm hover:shadow-xl transition-all">
                    <CardContent className="p-6 space-y-4">
                      <div className="space-y-2">
                        <Badge className="bg-primary/10 text-primary font-black uppercase text-[9px]">
                          {produk.jenis.toUpperCase()}
                        </Badge>
                        <h3 className="text-lg font-black text-slate-900 line-clamp-2">{produk.nama}</h3>
                        <p className="text-sm text-slate-600">Nomor: {produk.nomor}</p>
                      </div>
                      {produk.filePdfUrl && (
                        <a href={produk.filePdfUrl} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" className="w-full rounded-xl gap-2 text-xs font-bold">
                            <FileText className="h-4 w-4" />
                            Lihat PDF
                          </Button>
                        </a>
                      )}
                      {produk.driveLink && (
                        <a href={produk.driveLink} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" className="w-full rounded-xl gap-2 text-xs font-bold text-primary hover:bg-primary/10">
                            <ChevronRight className="h-4 w-4" />
                            Buka di Drive
                          </Button>
                        </a>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="bg-[#081325] text-slate-400 py-8 mt-16 border-t border-slate-800/80">
        <div className="container mx-auto px-4 text-center text-sm text-slate-500">
          © 2026 Pemerintah Desa Karanggintung Digital Portal - Tata Kelola Desa
        </div>
      </footer>
    </div>
  );
}
