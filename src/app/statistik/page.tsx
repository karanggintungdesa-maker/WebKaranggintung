'use client';

import React, { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users,
  GraduationCap,
  Activity,
  Heart,
  TrendingUp,
  Building2,
  Target,
  Award,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ShieldCheck,
  Download,
  FileDown,
  Home,
  UserCheck,
  CheckCircle2,
  Calendar,
  MapPin,
  Stethoscope,
  BookOpen,
  Sparkles,
  Layers,
  Coins,
  Store,
  Sprout,
  HeartPulse,
  Scale,
  HandHeart,
  Check,
  Info
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

const COLORS = ['#1e293b', '#eab308', '#059669', '#0d9488', '#8b5cf6', '#f43f5e'];

const tabs = [
  { id: 'kependudukan', label: 'Kependudukan', icon: Users, desc: 'Demografi & Sebaran Penduduk' },
  { id: 'pendidikan', label: 'Pendidikan', icon: GraduationCap, desc: 'Tingkat Pendidikan & Fasilitas Belajar' },
  { id: 'kesehatan', label: 'Kesehatan', icon: Activity, desc: 'Fasilitas Kesehatan & Stunting' },
  { id: 'sosial', label: 'Sosial', icon: HandHeart, desc: 'Bantuan Sosial & Kemasyarakatan' },
  { id: 'ekonomi', label: 'Ekonomi', icon: TrendingUp, desc: 'Sektor Usaha, Pertanian & BUMDes' },
  { id: 'pembangunan', label: 'Pembangunan Desa', icon: Building2, desc: 'Infrastruktur & Realisasi APBDes' },
  { id: 'sdgs', label: 'SDGs Desa', icon: Target, desc: '18 Gol Pembangunan Berkelanjutan' },
  { id: 'indeks', label: 'Indeks Desa', icon: Award, desc: 'Laporan Indeks Desa 2025 (Status Berkembang)' },
];

export default function StatistikPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <StatistikContent />
    </Suspense>
  );
}

function StatistikContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryTab = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState('kependudukan');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (queryTab && tabs.some(t => t.id === queryTab)) {
      setActiveTab(queryTab);
    }
  }, [queryTab]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    router.replace(`/statistik?tab=${tabId}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeTabObj = tabs.find(t => t.id === activeTab) || tabs[0];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans overflow-x-hidden w-full">
      {/* TOP HEADER */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-md shadow-xs sm:shadow-sm">
        <div className="container mx-auto px-4 h-16 sm:h-20 flex items-center justify-between">
          <Logo />
          <Link href="/">
            <Button variant="ghost" className="font-bold gap-1.5 sm:gap-2 text-primary hover:bg-slate-100 rounded-xl text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4">
              <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Beranda</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white py-6 sm:py-12 md:py-16 border-b border-slate-700/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl space-y-1.5 sm:space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[8px] sm:text-[10px] font-black uppercase tracking-wider sm:tracking-widest">
              <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-400 shrink-0" />
              Portal Data & Transparansi Publik
            </div>
            <h1 className="text-xl sm:text-3xl md:text-5xl font-extrabold tracking-tight font-display">
              Statistik Desa Karanggintung
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed">
              Pusat data terpadu dan indikator pembangunan Desa Karanggintung, Gandrungmangu, Cilacap.
            </p>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="flex-1 container mx-auto px-2.5 sm:px-4 py-4 sm:py-8 md:py-12 w-full min-w-0">
        <div className="grid lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-10 items-start w-full min-w-0">

          {/* SIDEBAR NAVIGATION (Desktop) / MOBILE MENU (Mobile) */}
          <aside className="lg:col-span-3 lg:sticky lg:top-28 z-40 w-full min-w-0">
            {/* Desktop Navigation List */}
            <div className="hidden lg:flex bg-white rounded-[2.5rem] p-4 border shadow-sm flex-col gap-2">
              <div className="px-4 py-2 border-b border-slate-100 mb-1">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Kategori Statistik</p>
              </div>
              {tabs.map((tab) => {
                const isCurrent = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={cn(
                      "flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 whitespace-nowrap w-full group text-left",
                      isCurrent
                        ? "bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]"
                        : "text-slate-600 hover:bg-slate-50 hover:text-primary"
                    )}
                  >
                    <tab.icon className={cn("h-5 w-5 shrink-0 transition-transform group-hover:scale-110", isCurrent ? "text-white" : "text-slate-400")} />
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-black uppercase text-[10px] tracking-widest leading-tight">{tab.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Mobile Navigation (Grid 4 Kolom x 2 Baris Penuh 1 Layar Tanpa Geser) */}
            <div className="block lg:hidden w-full mb-4 space-y-2">
              <div className="bg-slate-200/70 p-1 rounded-xl border border-slate-300/60 grid grid-cols-4 gap-1 w-full">
                {tabs.map((tab) => {
                  const isCurrent = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={cn(
                        "py-2 px-1 rounded-lg flex flex-col items-center justify-center gap-1 transition-all text-center",
                        isCurrent
                          ? "bg-primary text-white shadow-sm font-black"
                          : "bg-white/80 text-slate-600 hover:bg-white font-bold"
                      )}
                    >
                      <tab.icon className={cn("h-3.5 w-3.5 shrink-0", isCurrent ? "text-white" : "text-slate-500")} />
                      <span className="text-[7.5px] min-[380px]:text-[8px] uppercase tracking-tight leading-tight line-clamp-1 w-full">
                        {tab.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Active Tab Subtitle Info Banner */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200/70 rounded-xl text-emerald-800 text-[9.5px] min-[380px]:text-[10px]">
                <activeTabObj.icon className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                <p className="truncate">
                  <span className="font-black uppercase text-emerald-950">{activeTabObj.label}</span>
                  <span className="text-emerald-700/80 ml-1.5 hidden min-[380px]:inline">— {activeTabObj.desc}</span>
                </p>
              </div>
            </div>

            {/* Quick Access Card (Desktop Only) */}
            <div className="hidden lg:block mt-8 p-8 bg-slate-900 rounded-[3rem] text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10"><ShieldCheck className="w-24 h-24" /></div>
              <div className="relative z-10 space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary">Akses Cepat</p>
                <h4 className="text-xl font-display font-semibold italic">Butuh bantuan administrasi desa?</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Layanan pengajuan surat dan dokumen kependudukan kini dapat diakses secara daring 24 jam.
                </p>
                <Link href="/layanan-surat/">
                  <Button className="bg-secondary text-white font-black uppercase text-[10px] tracking-widest w-full h-12 rounded-xl mt-2 hover:bg-yellow-600">
                    Buka Layanan Surat
                  </Button>
                </Link>
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT AREA */}
          <main className="lg:col-span-9 space-y-4 sm:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full min-w-0">
            {activeTab === 'kependudukan' && <KependudukanTab />}
            {activeTab === 'pendidikan' && <PendidikanTab />}
            {activeTab === 'kesehatan' && <KesehatanTab />}
            {activeTab === 'sosial' && <SosialTab />}
            {activeTab === 'ekonomi' && <EkonomiTab />}
            {activeTab === 'pembangunan' && <PembangunanTab />}
            {activeTab === 'sdgs' && <SDGsTab />}
            {activeTab === 'indeks' && <IndeksTab />}
          </main>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-[#081325] text-slate-400 py-12 border-t border-slate-800/80 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <Logo />
          <p className="mt-8 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            © 2026 Pemerintah Desa Karanggintung • Kecamatan Gandrungmangu, Kabupaten Cilacap
          </p>
        </div>
      </footer>
    </div>
  );
}

// ==========================================
// 1. TAB KEPENDUDUKAN
// ==========================================
function KependudukanTab() {
  const [filterDusun, setFilterDusun] = useState('Semua Wilayah');
  const firestore = useFirestore();
  const { toast } = useToast();

  const statsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'villageProfile', 'statistics');
  }, [firestore]);

  const { data: statsDoc, isLoading } = useDoc<any>(statsRef);

  const stats = useMemo(() => {
    const defaultData = {
      total: 9746,
      totalKK: 3120,
      male: 4971,
      female: 4775,
      density: 986,
      malePercent: 51,
      femalePercent: 49,
      ageData: [
        { name: 'Anak (0-14 Th)', value: 2140 },
        { name: 'Produktif (15-64 Th)', value: 6510 },
        { name: 'Lansia (65+ Th)', value: 1096 },
      ],
      jobData: [
        { name: 'Petani / Perkebunan', value: 3250 },
        { name: 'Buruh Tani / Harian', value: 1680 },
        { name: 'Pedagang / Wirausaha', value: 890 },
        { name: 'Karyawan Swasta', value: 1120 },
        { name: 'PNS / TNI / Polri', value: 145 },
        { name: 'Pelajar / Mahasiswa', value: 1420 },
        { name: 'Lainnya', value: 1241 },
      ],
      religionData: [
        { name: 'Islam', value: 9680 },
        { name: 'Kristen', value: 45 },
        { name: 'Katolik', value: 15 },
        { name: 'Lainnya', value: 6 },
      ],
      mutationData: [
        { month: 'Jan', lahir: 12, mati: 5, datang: 8, pindah: 4 },
        { month: 'Feb', lahir: 15, mati: 3, datang: 10, pindah: 6 },
        { month: 'Mar', lahir: 10, mati: 7, datang: 12, pindah: 2 },
        { month: 'Apr', lahir: 18, mati: 4, datang: 6, pindah: 8 },
        { month: 'Mei', lahir: 14, mati: 2, datang: 15, pindah: 5 },
        { month: 'Jun', lahir: 16, mati: 4, datang: 9, pindah: 3 },
      ]
    };

    if (!statsDoc) return defaultData;

    let target = statsDoc;
    if (filterDusun !== 'Semua Wilayah' && statsDoc.dusunData?.[filterDusun]) {
      target = statsDoc.dusunData[filterDusun];
    }

    return {
      total: target.total || defaultData.total,
      totalKK: target.totalKK || defaultData.totalKK,
      male: target.male || Math.round((target.total || defaultData.total) * 0.51),
      female: target.female || Math.round((target.total || defaultData.total) * 0.49),
      density: target.density || defaultData.density,
      malePercent: target.malePercent || 51,
      femalePercent: target.femalePercent || 49,
      ageData: target.ageData || defaultData.ageData,
      jobData: target.jobData || defaultData.jobData,
      religionData: target.religionData || defaultData.religionData,
      mutationData: statsDoc.mutationData || defaultData.mutationData,
    };
  }, [statsDoc, filterDusun]);

  const handleDownloadExcel = () => {
    const dataRows = [
      { Kategori: 'Total Penduduk', Nilai: stats.total, Satuan: 'Jiwa' },
      { Kategori: 'Kepala Keluarga (KK)', Nilai: stats.totalKK, Satuan: 'KK' },
      { Kategori: 'Laki-Laki', Nilai: stats.male, Satuan: 'Jiwa' },
      { Kategori: 'Perempuan', Nilai: stats.female, Satuan: 'Jiwa' },
      { Kategori: 'Kepadatan Penduduk', Nilai: stats.density, Satuan: 'Jiwa/km²' },
    ];
    const ws = XLSX.utils.json_to_sheet(dataRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Kependudukan");
    XLSX.writeFile(wb, `Statistik_Kependudukan_Karanggintung_${filterDusun}.xlsx`);
    toast({ title: "Berhasil Unduh", description: "Data statistik telah disimpan dalam format Excel." });
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Data Statistik Kependudukan Desa Karanggintung', 14, 20);
    doc.setFontSize(10);
    doc.text(`Wilayah: ${filterDusun} | Kecamatan Gandrungmangu, Kabupaten Cilacap`, 14, 28);

    autoTable(doc, {
      startY: 36,
      head: [['Indikator Kependudukan', 'Jumlah', 'Keterangan']],
      body: [
        ['Total Penduduk', `${stats.total.toLocaleString()} Jiwa`, 'Terdata dalam database desa'],
        ['Total Kepala Keluarga', `${stats.totalKK.toLocaleString()} KK`, 'Rumah tangga terdaftar'],
        ['Penduduk Laki-Laki', `${stats.male.toLocaleString()} Jiwa`, `${stats.malePercent}% dari total`],
        ['Penduduk Perempuan', `${stats.female.toLocaleString()} Jiwa`, `${stats.femalePercent}% dari total`],
        ['Kepadatan Penduduk', `${stats.density} Jiwa/km²`, 'Rasio wilayah 9.88 km²'],
      ],
    });

    doc.save(`Statistik_Kependudukan_${filterDusun}.pdf`);
    toast({ title: "Berhasil Cetak", description: "Dokumen PDF kependudukan sedang diunduh." });
  };

  return (
    <div className="space-y-4 sm:space-y-8 w-full min-w-0">
      {/* Header filter & exports */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl border shadow-xs sm:shadow-sm">
        <div>
          <h2 className="text-base sm:text-xl font-black text-slate-800 tracking-tight">Statistik Kependudukan</h2>
          <p className="text-[10px] sm:text-xs text-slate-500">Agregasi data demografi, kelompok usia, dan profesi warga desa.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Select value={filterDusun} onValueChange={setFilterDusun}>
            <SelectTrigger className="w-full sm:w-[180px] h-9 sm:h-10 rounded-xl border-slate-200 text-xs font-bold">
              <SelectValue placeholder="Pilih Wilayah" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Semua Wilayah">Semua Wilayah</SelectItem>
              <SelectItem value="Dusun Karanggintung">Dusun Karanggintung</SelectItem>
              <SelectItem value="Dusun Pagergunung">Dusun Pagergunung</SelectItem>
              <SelectItem value="Dusun Sindangraja">Dusun Sindangraja</SelectItem>
              <SelectItem value="Dusun Penumbang">Dusun Penumbang</SelectItem>
              <SelectItem value="Dusun Karangtawang">Dusun Karangtawang</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button onClick={handleDownloadExcel} variant="outline" size="sm" className="flex-1 sm:flex-initial gap-1.5 rounded-xl text-xs font-bold text-slate-700 h-9 sm:h-10">
              <Download className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Excel</span>
            </Button>
            <Button onClick={handleDownloadPDF} variant="outline" size="sm" className="flex-1 sm:flex-initial gap-1.5 rounded-xl text-xs font-bold text-slate-700 h-9 sm:h-10">
              <FileDown className="h-3.5 w-3.5 text-red-600 shrink-0" />
              <span>PDF</span>
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards (2 Kolom Compact di Mobile) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        <Card className="rounded-xl sm:rounded-3xl border-slate-100 shadow-xs sm:shadow-sm bg-gradient-to-br from-emerald-700 to-emerald-900 text-white p-2.5 min-[380px]:p-3 sm:p-6 space-y-0.5 sm:space-y-1">
          <p className="text-[7.5px] min-[380px]:text-[8.5px] sm:text-[10px] font-bold text-emerald-200 uppercase tracking-wider">Total Penduduk</p>
          <h3 className="text-lg min-[380px]:text-xl sm:text-3xl font-black font-display">{stats.total.toLocaleString()}</h3>
          <p className="text-[8px] min-[380px]:text-[9px] sm:text-[11px] text-emerald-100/80 flex items-center gap-1 truncate">
            <Users className="h-3 w-3 shrink-0" /> Jiwa Terdaftar
          </p>
        </Card>

        <Card className="rounded-xl sm:rounded-3xl border-slate-100 shadow-xs sm:shadow-sm bg-white p-2.5 min-[380px]:p-3 sm:p-6 space-y-0.5 sm:space-y-1">
          <p className="text-[7.5px] min-[380px]:text-[8.5px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kepala Keluarga</p>
          <h3 className="text-lg min-[380px]:text-xl sm:text-3xl font-black text-slate-800 font-display">{stats.totalKK.toLocaleString()}</h3>
          <p className="text-[8px] min-[380px]:text-[9px] sm:text-[11px] text-slate-500 flex items-center gap-1 truncate">
            <Home className="h-3 w-3 text-primary shrink-0" /> Rumah Tangga (KK)
          </p>
        </Card>

        <Card className="rounded-xl sm:rounded-3xl border-slate-100 shadow-xs sm:shadow-sm bg-white p-2.5 min-[380px]:p-3 sm:p-6 space-y-0.5 sm:space-y-1">
          <p className="text-[7.5px] min-[380px]:text-[8.5px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Laki-Laki</p>
          <h3 className="text-lg min-[380px]:text-xl sm:text-3xl font-black text-blue-600 font-display">{stats.male.toLocaleString()}</h3>
          <p className="text-[8px] min-[380px]:text-[9px] sm:text-[11px] text-slate-500 flex items-center gap-1 truncate">
            <UserCheck className="h-3 w-3 text-blue-500 shrink-0" /> {stats.malePercent}% Komposisi
          </p>
        </Card>

        <Card className="rounded-xl sm:rounded-3xl border-slate-100 shadow-xs sm:shadow-sm bg-white p-2.5 min-[380px]:p-3 sm:p-6 space-y-0.5 sm:space-y-1">
          <p className="text-[7.5px] min-[380px]:text-[8.5px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Perempuan</p>
          <h3 className="text-lg min-[380px]:text-xl sm:text-3xl font-black text-pink-600 font-display">{stats.female.toLocaleString()}</h3>
          <p className="text-[8px] min-[380px]:text-[9px] sm:text-[11px] text-slate-500 flex items-center gap-1 truncate">
            <UserCheck className="h-3 w-3 text-pink-500 shrink-0" /> {stats.femalePercent}% Komposisi
          </p>
        </Card>
      </div>

      {/* 5 Dusun Breakdown Cards (2 Kolom di Mobile) */}
      <div className="bg-white p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl border shadow-xs sm:shadow-sm space-y-2.5 sm:space-y-4">
        <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800">Distribusi Penduduk Berdasarkan 5 Dusun</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
          {[
            { dusun: 'Karanggintung', jiwa: 2450, kk: 780, rt: 9, rw: 2 },
            { dusun: 'Pagergunung', jiwa: 2180, kk: 695, rt: 8, rw: 2 },
            { dusun: 'Sindangraja', jiwa: 1920, kk: 615, rt: 7, rw: 2 },
            { dusun: 'Penumbang', jiwa: 1750, kk: 560, rt: 7, rw: 2 },
            { dusun: 'Karangtawang', jiwa: 1446, kk: 470, rt: 6, rw: 1 },
          ].map((d, idx) => (
            <div key={idx} className={cn(
              "p-2.5 min-[380px]:p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-colors",
              idx === 4 ? "col-span-2 sm:col-span-1" : ""
            )}>
              <span className="text-[8px] min-[380px]:text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-emerald-700">Dusun</span>
              <h4 className="font-bold text-slate-800 text-xs sm:text-sm mt-0.5 truncate">{d.dusun}</h4>
              <p className="text-sm sm:text-lg font-black text-slate-900 mt-1">{d.jiwa.toLocaleString()} <span className="text-[9px] sm:text-xs font-normal text-slate-500">Jiwa</span></p>
              <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 flex justify-between text-[8px] min-[380px]:text-[9px] sm:text-[10px] text-slate-500 font-semibold">
                <span>{d.kk} KK</span>
                <span>{d.rt} RT / {d.rw} RW</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Row: Kelompok Umur & Pekerjaan */}
      <div className="grid md:grid-cols-2 gap-3 sm:gap-6">
        <Card className="rounded-2xl sm:rounded-3xl border-slate-100 shadow-xs sm:shadow-sm p-3.5 sm:p-6 bg-white space-y-2 sm:space-y-4">
          <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800">Kelompok Usia Penduduk</h3>
          <div className="h-52 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.ageData} layout="vertical" margin={{ left: 5, right: 10, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 9 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={85} />
                <Tooltip formatter={(value: any) => [`${value} Jiwa`, 'Jumlah']} />
                <Bar dataKey="value" fill="#059669" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="rounded-2xl sm:rounded-3xl border-slate-100 shadow-xs sm:shadow-sm p-3.5 sm:p-6 bg-white space-y-2 sm:space-y-4">
          <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800">Mata Pencaharian Utama</h3>
          <div className="h-52 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.jobData} layout="vertical" margin={{ left: 5, right: 10, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 9 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 8.5 }} width={95} />
                <Tooltip formatter={(value: any) => [`${value} Orang`, 'Jumlah']} />
                <Bar dataKey="value" fill="#0284c7" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Mutasi Penduduk Bulanan */}
      <Card className="rounded-2xl sm:rounded-3xl border-slate-100 shadow-xs sm:shadow-sm p-3.5 sm:p-6 bg-white space-y-2 sm:space-y-4">
        <div className="flex flex-col min-[380px]:flex-row min-[380px]:items-center justify-between gap-1">
          <div>
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800">Dinamika Mutasi Penduduk</h3>
            <p className="text-[10px] sm:text-xs text-slate-500">Pencatatan kelahiran, kematian, kepindahan, dan kedatangan.</p>
          </div>
          <Badge className="bg-emerald-600 text-white font-bold text-[8.5px] sm:text-[10px] w-fit">Pembaruan Bulanan</Badge>
        </div>
        <div className="h-52 sm:h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.mutationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Line type="monotone" dataKey="lahir" stroke="#059669" name="Lahir" strokeWidth={2} />
              <Line type="monotone" dataKey="mati" stroke="#dc2626" name="Mati" strokeWidth={2} />
              <Line type="monotone" dataKey="datang" stroke="#0284c7" name="Masuk" strokeWidth={2} />
              <Line type="monotone" dataKey="pindah" stroke="#f59e0b" name="Keluar" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

// ==========================================
// 2. TAB PENDIDIKAN
// ==========================================
function PendidikanTab() {
  const eduStats = [
    { label: 'SD / Sederajat', percent: 38, count: 3703, color: '#059669' },
    { label: 'SMP / MTs', percent: 26, count: 2534, color: '#0284c7' },
    { label: 'SMA / SMK / MA', percent: 24, count: 2339, color: '#f59e0b' },
    { label: 'Diploma / Sarjana (S1-S3)', percent: 8, count: 780, color: '#8b5cf6' },
    { label: 'Belum / Tidak Sekolah', percent: 4, count: 390, color: '#94a3b8' },
  ];

  const sdList = [
    { name: 'SD Negeri Karanggintung 01', dusun: 'Dusun Karanggintung', siswa: 210, guru: 12, akreditasi: 'A' },
    { name: 'SD Negeri Karanggintung 02', dusun: 'Dusun Pagergunung', siswa: 185, guru: 10, akreditasi: 'A' },
    { name: 'SD Negeri Karanggintung 03', dusun: 'Dusun Sindangraja', siswa: 165, guru: 9, akreditasi: 'B' },
    { name: 'SD Negeri Karanggintung 04', dusun: 'Dusun Penumbang', siswa: 172, guru: 10, akreditasi: 'B' },
    { name: 'SD Negeri Karanggintung 05', dusun: 'Dusun Karangtawang', siswa: 154, guru: 9, akreditasi: 'B' },
    { name: 'SD Negeri Karanggintung 06', dusun: 'Dusun Karanggintung', siswa: 198, guru: 11, akreditasi: 'A' },
    { name: 'SD Negeri Karanggintung 07', dusun: 'Dusun Pagergunung', siswa: 142, guru: 8, akreditasi: 'B' },
  ];

  return (
    <div className="space-y-4 sm:space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Card className="rounded-2xl sm:rounded-3xl p-2.5 min-[380px]:p-3 sm:p-6 bg-gradient-to-br from-blue-700 to-blue-900 text-white shadow-sm">
          <p className="text-[8px] min-[380px]:text-[10px] font-bold text-blue-200 uppercase tracking-wider">Melek Huruf</p>
          <h3 className="text-base min-[380px]:text-lg sm:text-3xl font-black mt-1 sm:mt-2 font-display">99.2%</h3>
          <p className="text-[8px] min-[380px]:text-[10px] sm:text-xs text-blue-100/80 mt-0.5 sm:mt-1 leading-tight line-clamp-2">Bebas buta aksara</p>
        </Card>

        <Card className="rounded-2xl sm:rounded-3xl p-2.5 min-[380px]:p-3 sm:p-6 bg-white border-slate-100 shadow-sm">
          <p className="text-[8px] min-[380px]:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Wajib Belajar</p>
          <h3 className="text-base min-[380px]:text-lg sm:text-3xl font-black text-slate-800 mt-1 sm:mt-2 font-display">96.4%</h3>
          <p className="text-[8px] min-[380px]:text-[10px] sm:text-xs text-emerald-600 font-semibold mt-0.5 sm:mt-1 leading-tight line-clamp-2">12 Tahun tuntas</p>
        </Card>

        <Card className="rounded-2xl sm:rounded-3xl p-2.5 min-[380px]:p-3 sm:p-6 bg-white border-slate-100 shadow-sm">
          <p className="text-[8px] min-[380px]:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lembaga</p>
          <h3 className="text-base min-[380px]:text-lg sm:text-3xl font-black text-primary mt-1 sm:mt-2 font-display">24 Unit</h3>
          <p className="text-[8px] min-[380px]:text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 leading-tight line-clamp-2">Formal & agama</p>
        </Card>
      </div>

      {/* Tingkat Pendidikan Breakdown */}
      <Card className="rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 bg-white border-slate-100 shadow-sm space-y-3 sm:space-y-6">
        <div>
          <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800">Tingkat Pendidikan Terakhir Penduduk</h3>
          <p className="text-[10px] sm:text-xs text-slate-500">Komposisi jenjang kelulusan warga masyarakat Desa Karanggintung.</p>
        </div>

        <div className="space-y-2.5 sm:space-y-4">
          {eduStats.map((item, idx) => (
            <div key={idx} className="space-y-1 sm:space-y-1.5">
              <div className="flex justify-between text-[10px] sm:text-xs font-bold">
                <span className="text-slate-700">{item.label}</span>
                <span className="text-slate-900">{item.count.toLocaleString()} Jiwa ({item.percent}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 sm:h-3 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 7 SD Negeri Table */}
      <Card className="rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 bg-white border-slate-100 shadow-sm space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800">Daftar 7 Sekolah Dasar Negeri (SDN)</h3>
            <p className="text-[10px] sm:text-xs text-slate-500">Fasilitas pendidikan dasar negeri di Desa Karanggintung.</p>
          </div>
          <Badge className="bg-primary text-white font-bold text-[9px] sm:text-[10px] px-2 py-0.5 shrink-0">7 Sekolah</Badge>
        </div>

        <div className="overflow-x-auto -mx-1 sm:mx-0">
          <table className="w-full text-left text-[10px] sm:text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[8px] sm:text-[10px]">
                <th className="py-2 px-2 sm:py-3 sm:px-4 font-bold">Sekolah</th>
                <th className="py-2 px-2 sm:py-3 sm:px-4 font-bold">Dusun</th>
                <th className="py-2 px-2 sm:py-3 sm:px-4 font-bold text-center">Siswa</th>
                <th className="py-2 px-2 sm:py-3 sm:px-4 font-bold text-center">Guru</th>
                <th className="py-2 px-2 sm:py-3 sm:px-4 font-bold text-center">Akreditasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {sdList.map((sd, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2 px-2 sm:py-3.5 sm:px-4 font-bold text-slate-800 flex items-center gap-1.5">
                    <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600 shrink-0" />
                    <span className="sm:hidden">{sd.name.replace('SD Negeri Karanggintung ', 'SDN ')}</span>
                    <span className="hidden sm:inline">{sd.name}</span>
                  </td>
                  <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-slate-600">
                    <span className="sm:hidden">{sd.dusun.replace('Dusun ', '')}</span>
                    <span className="hidden sm:inline">{sd.dusun}</span>
                  </td>
                  <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-center font-semibold">
                    <span className="sm:hidden">{sd.siswa}</span>
                    <span className="hidden sm:inline">{sd.siswa} Siswa</span>
                  </td>
                  <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-center">
                    <span className="sm:hidden">{sd.guru}</span>
                    <span className="hidden sm:inline">{sd.guru} Guru</span>
                  </td>
                  <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-center">
                    <span className={cn(
                      "px-1.5 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black",
                      sd.akreditasi === 'A' ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                    )}>
                      <span className="sm:hidden">{sd.akreditasi}</span>
                      <span className="hidden sm:inline">Akreditasi {sd.akreditasi}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Lembaga Pendidikan Non-Formal & Keagamaan */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="p-2.5 min-[380px]:p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-100 shadow-sm">
          <p className="text-[8px] min-[380px]:text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">PAUD / TK</p>
          <h4 className="text-xs min-[380px]:text-sm sm:text-xl font-bold text-slate-800 mt-1">6 Unit</h4>
          <p className="text-[8px] min-[380px]:text-[10px] sm:text-xs text-slate-500 mt-1 sm:mt-2 line-clamp-2">Pendidikan pra-sekolah dusun.</p>
        </div>

        <div className="p-2.5 min-[380px]:p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-100 shadow-sm">
          <p className="text-[8px] min-[380px]:text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Keagamaan</p>
          <h4 className="text-xs min-[380px]:text-sm sm:text-xl font-bold text-slate-800 mt-1">9 TPQ</h4>
          <p className="text-[8px] min-[380px]:text-[10px] sm:text-xs text-slate-500 mt-1 sm:mt-2 line-clamp-2">Madrasah & Al-Qur'an anak.</p>
        </div>

        <div className="p-2.5 min-[380px]:p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-100 shadow-sm">
          <p className="text-[8px] min-[380px]:text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pesantren</p>
          <h4 className="text-xs min-[380px]:text-sm sm:text-xl font-bold text-slate-800 mt-1">2 Ponpes</h4>
          <p className="text-[8px] min-[380px]:text-[10px] sm:text-xs text-slate-500 mt-1 sm:mt-2 line-clamp-2">Pusat kajian santri desa.</p>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. TAB KESEHATAN
// ==========================================
function KesehatanTab() {
  return (
    <div className="space-y-4 sm:space-y-8">
      {/* Top Health Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        <Card className="rounded-2xl sm:rounded-3xl p-3 sm:p-6 bg-gradient-to-br from-emerald-600 to-teal-800 text-white shadow-sm">
          <p className="text-[8px] min-[380px]:text-[10px] font-bold text-emerald-200 uppercase tracking-wider">BPJS / KIS</p>
          <h3 className="text-xl min-[380px]:text-2xl sm:text-3xl font-black mt-1 sm:mt-2 font-display">94.8%</h3>
          <p className="text-[9px] min-[380px]:text-[10px] sm:text-xs text-emerald-100/80 mt-0.5 sm:mt-1">Jaminan kesehatan</p>
        </Card>

        <Card className="rounded-2xl sm:rounded-3xl p-3 sm:p-6 bg-white border-slate-100 shadow-sm">
          <p className="text-[8px] min-[380px]:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stunting</p>
          <h3 className="text-xl min-[380px]:text-2xl sm:text-3xl font-black text-emerald-600 mt-1 sm:mt-2 font-display">4.2%</h3>
          <p className="text-[9px] min-[380px]:text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">Status Hijau (Aman)</p>
        </Card>

        <Card className="rounded-2xl sm:rounded-3xl p-3 sm:p-6 bg-white border-slate-100 shadow-sm">
          <p className="text-[8px] min-[380px]:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Posyandu</p>
          <h3 className="text-xl min-[380px]:text-2xl sm:text-3xl font-black text-slate-800 mt-1 sm:mt-2 font-display">9 Pos</h3>
          <p className="text-[9px] min-[380px]:text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">Balita & Lansia</p>
        </Card>

        <Card className="rounded-2xl sm:rounded-3xl p-3 sm:p-6 bg-white border-slate-100 shadow-sm">
          <p className="text-[8px] min-[380px]:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mobil Siaga</p>
          <h3 className="text-xl min-[380px]:text-2xl sm:text-3xl font-black text-blue-600 mt-1 sm:mt-2 font-display">24 Jam</h3>
          <p className="text-[9px] min-[380px]:text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">Antar-jemput darurat</p>
        </Card>
      </div>

      {/* Fasilitas Layanan Kesehatan */}
      <Card className="rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 bg-white border-slate-100 shadow-sm space-y-3 sm:space-y-4">
        <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800">Fasilitas & Tenaga Kesehatan di Desa</h3>
        <div className="grid md:grid-cols-3 gap-2.5 sm:gap-4">
          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 sm:space-y-2">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Stethoscope className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <h4 className="font-bold text-slate-800 text-xs sm:text-sm">PKD / Poskesdes Karanggintung</h4>
            <p className="text-[10px] sm:text-xs text-slate-500">Pusat Kesehatan Desa melayani pemeriksaan dasar, imunisasi, dan rujukan Puskesmas.</p>
            <span className="inline-block text-[9px] sm:text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md">Bidan Desa Siaga</span>
          </div>

          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 sm:space-y-2">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <HeartPulse className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <h4 className="font-bold text-slate-800 text-xs sm:text-sm">Rumah Desa Sehat (RDS)</h4>
            <p className="text-[10px] sm:text-xs text-slate-500">Forum koordinasi konvergensi pencegahan stunting & pemenuhan gizi keluarga.</p>
            <span className="inline-block text-[9px] sm:text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md">Program Konvergensi</span>
          </div>

          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 sm:space-y-2">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <h4 className="font-bold text-slate-800 text-xs sm:text-sm">Posbindu PTM Lansia</h4>
            <p className="text-[10px] sm:text-xs text-slate-500">Pemeriksaan tensi, gula darah, dan kolesterol berkala bagi warga usia lanjut.</p>
            <span className="inline-block text-[9px] sm:text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md">Skrining Rutin</span>
          </div>
        </div>
      </Card>

      {/* Program Penurunan Stunting */}
      <Card className="rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 bg-white border-slate-100 shadow-sm space-y-3 sm:space-y-4">
        <div>
          <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800">Tren Penurunan Stunting (2021 - 2025)</h3>
          <p className="text-[10px] sm:text-xs text-slate-500">Kerja keras kader Posyandu, Bidan Desa, dan Pemdes menekan stunting secara berkelanjutan.</p>
        </div>

        <div className="grid grid-cols-5 gap-1 min-[380px]:gap-1.5 sm:gap-3 pt-1 sm:pt-2">
          {[
            { year: '2021', rate: '14.8%', status: 'Waspada', bg: 'bg-amber-50 text-amber-800 border-amber-200' },
            { year: '2022', rate: '11.2%', status: '-3.6%', bg: 'bg-blue-50 text-blue-800 border-blue-200' },
            { year: '2023', rate: '8.4%', status: 'Aman', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
            { year: '2024', rate: '5.8%', status: 'Terkendali', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
            { year: '2025', rate: '4.2%', status: 'Hijau', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
          ].map((item, idx) => (
            <div key={idx} className={cn("p-1.5 min-[380px]:p-2 sm:p-4 rounded-xl sm:rounded-2xl border text-center", item.bg)}>
              <span className="text-[7px] min-[380px]:text-[8px] sm:text-[10px] font-bold uppercase tracking-wider opacity-80 block truncate">
                <span className="sm:hidden">{item.year}</span>
                <span className="hidden sm:inline">Tahun {item.year}</span>
              </span>
              <h4 className="text-xs min-[380px]:text-sm sm:text-2xl font-black mt-0.5 sm:mt-1 font-display">{item.rate}</h4>
              <p className="text-[7px] min-[380px]:text-[8px] sm:text-[10px] font-bold mt-0.5 sm:mt-1 truncate">{item.status}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ==========================================
// 4. TAB SOSIAL
// ==========================================
function SosialTab() {
  const bansosList = [
    { program: 'Program Keluarga Harapan (PKH)', kpm: '420 KPM', desc: 'Bantuan bersyarat bidang kesehatan & pendidikan', budget: 'Kemensos RI' },
    { program: 'Bantuan Pangan Non Tunai (BPNT)', kpm: '580 KPM', desc: 'Penyaluran sembako pangan bergizi', budget: 'Kemensos RI' },
    { program: 'Bantuan Langsung Tunai (BLT Dana Desa)', kpm: '65 KPM', desc: 'Keluarga miskin ekstrem dan lansia tunggal', budget: 'APBDes Karanggintung' },
    { program: 'Penerima Bantuan Iuran JKN (PBI-JK)', kpm: '3.210 Jiwa', desc: 'Iuran jaminan kesehatan BPJS gratis', budget: 'Pemerintah Pusat' },
  ];

  return (
    <div className="space-y-4 sm:space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Card className="rounded-2xl sm:rounded-3xl p-2.5 min-[380px]:p-3 sm:p-6 bg-gradient-to-br from-purple-700 to-indigo-900 text-white shadow-sm">
          <p className="text-[8px] min-[380px]:text-[10px] font-bold text-purple-200 uppercase tracking-wider">Penerima</p>
          <h3 className="text-base min-[380px]:text-lg sm:text-3xl font-black mt-1 sm:mt-2 font-display">1.065</h3>
          <p className="text-[8px] min-[380px]:text-[10px] sm:text-xs text-purple-100/80 mt-0.5 sm:mt-1 leading-tight line-clamp-2">KPM DTKS</p>
        </Card>

        <Card className="rounded-2xl sm:rounded-3xl p-2.5 min-[380px]:p-3 sm:p-6 bg-white border-slate-100 shadow-sm">
          <p className="text-[8px] min-[380px]:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lembaga</p>
          <h3 className="text-base min-[380px]:text-lg sm:text-3xl font-black text-slate-800 mt-1 sm:mt-2 font-display">6 LKD</h3>
          <p className="text-[8px] min-[380px]:text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 leading-tight line-clamp-2">PKK, Karang Taruna</p>
        </Card>

        <Card className="rounded-2xl sm:rounded-3xl p-2.5 min-[380px]:p-3 sm:p-6 bg-white border-slate-100 shadow-sm">
          <p className="text-[8px] min-[380px]:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Poskamling</p>
          <h3 className="text-base min-[380px]:text-lg sm:text-3xl font-black text-emerald-600 mt-1 sm:mt-2 font-display">100%</h3>
          <p className="text-[8px] min-[380px]:text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 leading-tight line-clamp-2">37 RT rutin</p>
        </Card>
      </div>

      {/* Tabel Bantuan Sosial */}
      <Card className="rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 bg-white border-slate-100 shadow-sm space-y-3 sm:space-y-4">
        <div>
          <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800">Penyaluran Program Jaring Pengaman Sosial</h3>
          <p className="text-[10px] sm:text-xs text-slate-500">Program bansos resmi terverifikasi DTKS Kemensos di Karanggintung.</p>
        </div>

        <div className="overflow-x-auto -mx-1 sm:mx-0">
          <table className="w-full text-left text-[10px] sm:text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[8px] sm:text-[10px]">
                <th className="py-2 px-2 sm:py-3 sm:px-4 font-bold">Nama Program</th>
                <th className="py-2 px-2 sm:py-3 sm:px-4 font-bold hidden sm:table-cell">Deskripsi Manfaat</th>
                <th className="py-2 px-2 sm:py-3 sm:px-4 font-bold text-center">Penerima</th>
                <th className="py-2 px-2 sm:py-3 sm:px-4 font-bold text-right">Sumber</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {bansosList.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2 px-2 sm:py-3.5 sm:px-4">
                    <p className="font-bold text-slate-800 text-[10px] sm:text-xs">{item.program}</p>
                    <p className="text-[9px] text-slate-500 sm:hidden mt-0.5 line-clamp-1">{item.desc}</p>
                  </td>
                  <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-slate-600 hidden sm:table-cell">{item.desc}</td>
                  <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-center font-bold text-emerald-700 whitespace-nowrap">{item.kpm}</td>
                  <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-right">
                    <span className="bg-slate-100 text-slate-700 px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold whitespace-nowrap">{item.budget}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Lembaga Sosial & Partisipasi Warga */}
      <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-100 shadow-sm space-y-2 sm:space-y-3">
          <h4 className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
            <Users className="h-4 w-4 text-primary shrink-0" />
            Lembaga Kemasyarakatan Desa (LKD)
          </h4>
          <p className="text-[10px] sm:text-xs text-slate-600 leading-relaxed">
            Pemberdayaan masyarakat didukung oleh organisasi aktif seperti TP-PKK (12 Pokja aktif), Karang Taruna Tunas Harapan (kegiatan pemuda & olahraga), LPMD (perencanaan pembangunan), serta Satgas Linmas beranggotakan 35 personel siaga bencana & kamtibmas.
          </p>
        </div>

        <div className="p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-100 shadow-sm space-y-2 sm:space-y-3">
          <h4 className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
            <Heart className="h-4 w-4 text-red-500 shrink-0" />
            Kearifan Lokal & Gotong Royong
          </h4>
          <p className="text-[10px] sm:text-xs text-slate-600 leading-relaxed">
            Masyarakat Desa Karanggintung senantiasa memelihara tradisi gotong royong seperti Sedekah Bumi tahunan, Sadranan, kerja bakti lingkungan mingguan, dan tradisi Sambatan bedah rumah warga prasejahtera.
          </p>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 5. TAB EKONOMI
// ==========================================
function EkonomiTab() {
  return (
    <div className="space-y-4 sm:space-y-8">
      {/* Top Economic Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        <Card className="rounded-2xl sm:rounded-3xl p-3 sm:p-6 bg-gradient-to-br from-amber-600 to-amber-800 text-white shadow-sm">
          <p className="text-[8px] min-[380px]:text-[10px] font-bold text-amber-200 uppercase tracking-wider">Pertanian</p>
          <h3 className="text-xl min-[380px]:text-2xl sm:text-3xl font-black mt-1 sm:mt-2 font-display">62%</h3>
          <p className="text-[9px] min-[380px]:text-[10px] sm:text-xs text-amber-100/80 mt-0.5 sm:mt-1">Tulang punggung warga</p>
        </Card>

        <Card className="rounded-2xl sm:rounded-3xl p-3 sm:p-6 bg-white border-slate-100 shadow-sm">
          <p className="text-[8px] min-[380px]:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Padi Tahunan</p>
          <h3 className="text-xl min-[380px]:text-2xl sm:text-3xl font-black text-slate-800 mt-1 sm:mt-2 font-display">1.450 Ton</h3>
          <p className="text-[9px] min-[380px]:text-[10px] sm:text-xs text-emerald-600 font-semibold mt-0.5 sm:mt-1">480+ Ha sawah</p>
        </Card>

        <Card className="rounded-2xl sm:rounded-3xl p-3 sm:p-6 bg-white border-slate-100 shadow-sm">
          <p className="text-[8px] min-[380px]:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gula Semut</p>
          <h3 className="text-xl min-[380px]:text-2xl sm:text-3xl font-black text-slate-800 mt-1 sm:mt-2 font-display">320 Ton</h3>
          <p className="text-[9px] min-[380px]:text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">Komoditas ekspor</p>
        </Card>

        <Card className="rounded-2xl sm:rounded-3xl p-3 sm:p-6 bg-white border-slate-100 shadow-sm">
          <p className="text-[8px] min-[380px]:text-[10px] font-bold text-slate-400 uppercase tracking-wider">UMKM</p>
          <h3 className="text-xl min-[380px]:text-2xl sm:text-3xl font-black text-primary mt-1 sm:mt-2 font-display">140+</h3>
          <p className="text-[9px] min-[380px]:text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">Unit usaha mikro</p>
        </Card>
      </div>

      {/* Komoditas & Populasi Ternak */}
      <div className="grid md:grid-cols-2 gap-3 sm:gap-6">
        <Card className="rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 bg-white border-slate-100 shadow-sm space-y-3 sm:space-y-4">
          <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5 sm:gap-2">
            <Sprout className="h-4 w-4 text-emerald-600 shrink-0" />
            Komoditas Pertanian & Perkebunan
          </h3>
          <div className="space-y-2 sm:space-y-3">
            {[
              { name: 'Padi Sawah (IR-64 & Ciherang)', yield: '1.450 Ton / thn', area: '480 Ha' },
              { name: 'Kelapa & Nira Gula Jawa / Semut', yield: '320 Ton / thn', area: '180 Ha' },
              { name: 'Jagung Hibrida & Pipil', yield: '210 Ton / thn', area: '65 Ha' },
              { name: 'Singkong & Umbi-umbian', yield: '180 Ton / thn', area: '45 Ha' },
              { name: 'Hortikultura (Cabai, Sayur)', yield: '95 Ton / thn', area: '30 Ha' },
            ].map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-100 text-[10px] sm:text-xs">
                <div>
                  <p className="font-bold text-slate-800">{item.name}</p>
                  <p className="text-[9px] text-slate-500">Estimasi: {item.area}</p>
                </div>
                <span className="font-black text-emerald-700 bg-emerald-50 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md shrink-0">{item.yield}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 bg-white border-slate-100 shadow-sm space-y-3 sm:space-y-4">
          <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5 sm:gap-2">
            <Coins className="h-4 w-4 text-amber-600 shrink-0" />
            Populasi Ternak & BUMDes Karanggintung
          </h3>
          <div className="space-y-2.5 sm:space-y-3">
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              <div className="p-2 sm:p-3 rounded-xl bg-slate-50 border text-center">
                <p className="text-[8px] min-[380px]:text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase">Sapi</p>
                <p className="text-base min-[380px]:text-lg sm:text-xl font-black text-slate-800 mt-0.5 sm:mt-1">240</p>
                <p className="text-[8px] min-[380px]:text-[9px] sm:text-[10px] text-slate-500">Ekor</p>
              </div>
              <div className="p-2 sm:p-3 rounded-xl bg-slate-50 border text-center">
                <p className="text-[8px] min-[380px]:text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase">Kambing</p>
                <p className="text-base min-[380px]:text-lg sm:text-xl font-black text-slate-800 mt-0.5 sm:mt-1">890</p>
                <p className="text-[8px] min-[380px]:text-[9px] sm:text-[10px] text-slate-500">Ekor</p>
              </div>
              <div className="p-2 sm:p-3 rounded-xl bg-slate-50 border text-center">
                <p className="text-[8px] min-[380px]:text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase">Unggas</p>
                <p className="text-base min-[380px]:text-lg sm:text-xl font-black text-slate-800 mt-0.5 sm:mt-1">12K+</p>
                <p className="text-[8px] min-[380px]:text-[9px] sm:text-[10px] text-slate-500">Ekor</p>
              </div>
            </div>

            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1 sm:space-y-1.5">
              <h4 className="font-bold text-emerald-950 text-[10px] sm:text-xs uppercase tracking-wider">BUMDes Makmur Karanggintung</h4>
              <p className="text-[10px] sm:text-xs text-emerald-900 leading-relaxed">
                Mengelola unit simpan pinjam desa, penyaluran sarana pertanian (pupuk & benih), air bersih Pamsimas, dan kemitraan pemasaran produk gula semut UMKM.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ==========================================
// 6. TAB PEMBANGUNAN DESA
// ==========================================
function PembangunanTab() {
  return (
    <div className="space-y-4 sm:space-y-8">
      {/* Overview APBDes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        <Card className="rounded-2xl sm:rounded-3xl p-3 sm:p-6 bg-gradient-to-br from-emerald-800 to-slate-900 text-white shadow-sm">
          <p className="text-[8px] min-[380px]:text-[10px] font-bold text-emerald-200 uppercase tracking-wider">APBDes</p>
          <h3 className="text-xl min-[380px]:text-2xl sm:text-3xl font-black mt-1 sm:mt-2 font-display">98.4%</h3>
          <p className="text-[9px] min-[380px]:text-[10px] sm:text-xs text-emerald-100/80 mt-0.5 sm:mt-1">Serapan anggaran</p>
        </Card>

        <Card className="rounded-2xl sm:rounded-3xl p-3 sm:p-6 bg-white border-slate-100 shadow-sm">
          <p className="text-[8px] min-[380px]:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jalan Desa</p>
          <h3 className="text-xl min-[380px]:text-2xl sm:text-3xl font-black text-slate-800 mt-1 sm:mt-2 font-display">42 Km</h3>
          <p className="text-[9px] min-[380px]:text-[10px] sm:text-xs text-emerald-600 font-semibold mt-0.5 sm:mt-1">88% Kondisi Mantap</p>
        </Card>

        <Card className="rounded-2xl sm:rounded-3xl p-3 sm:p-6 bg-white border-slate-100 shadow-sm">
          <p className="text-[8px] min-[380px]:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Drainase</p>
          <h3 className="text-xl min-[380px]:text-2xl sm:text-3xl font-black text-slate-800 mt-1 sm:mt-2 font-display">28 Km</h3>
          <p className="text-[9px] min-[380px]:text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">Irigasi & saluran air</p>
        </Card>

        <Card className="rounded-2xl sm:rounded-3xl p-3 sm:p-6 bg-white border-slate-100 shadow-sm">
          <p className="text-[8px] min-[380px]:text-[10px] font-bold text-slate-400 uppercase tracking-wider">PJU</p>
          <h3 className="text-xl min-[380px]:text-2xl sm:text-3xl font-black text-amber-600 mt-1 sm:mt-2 font-display">350 Titik</h3>
          <p className="text-[9px] min-[380px]:text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">Penerangan 5 dusun</p>
        </Card>
      </div>

      {/* Program Pembangunan Prioritas */}
      <Card className="rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 bg-white border-slate-100 shadow-sm space-y-3 sm:space-y-4">
        <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800">Capaian Infrastruktur & Fasilitas Publik</h3>
        <div className="grid md:grid-cols-2 gap-2.5 sm:gap-4">
          {[
            {
              title: 'Peningkatan Jalan Usaha Tani & Poros Desa',
              desc: 'Rabat beton dan pengaspalan hotmix menghubungkan sentra pertanian antar-dusun menuju jalan kabupaten.',
              status: 'Selesai 100%',
              tag: 'Infrastruktur Jalan'
            },
            {
              title: 'Pembangunan Jaringan Air Bersih Pamsimas',
              desc: 'Instalasi pipa air bersih dan tandon utama melayani kebutuhan 1.200+ sambungan rumah tangga.',
              status: 'Aktif Beroperasi',
              tag: 'Sanitasi & Air'
            },
            {
              title: 'Rehabilitasi Rumah Tidak Layak Huni (RTLH)',
              desc: 'Bantuan stimulan bedah rumah swadaya untuk 45 unit rumah keluarga prasejahtera.',
              status: 'Tuntas 45 Unit',
              tag: 'Perumahan Warga'
            },
            {
              title: 'Gedung Serbaguna & Sarana Olahraga Desa',
              desc: 'Fasilitas pertemuan umum, lapangan bola voli, dan lapangan sepak bola Karanggintung.',
              status: 'Fasilitas Umum',
              tag: 'Sarana Olahraga'
            }
          ].map((item, idx) => (
            <div key={idx} className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 sm:space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
                  {item.tag}
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" /> {item.status}
                </span>
              </div>
              <h4 className="font-bold text-slate-800 text-xs sm:text-sm">{item.title}</h4>
              <p className="text-[10px] sm:text-xs text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ==========================================
// 7. TAB SDGS DESA (18 GOL PEMBANGUNAN)
// ==========================================
function SDGsTab() {
  const sdgsGoals = [
    { no: 1, title: 'Desa Tanpa Kemiskinan', score: 84.5, color: '#e5243b', status: 'Sangat Baik' },
    { no: 2, title: 'Desa Tanpa Kelaparan', score: 88.0, color: '#dda63a', status: 'Sangat Baik' },
    { no: 3, title: 'Desa Sehat dan Sejahtera', score: 91.2, color: '#4c9f38', status: 'Unggul' },
    { no: 4, title: 'Pendidikan Desa Berkualitas', score: 86.8, color: '#c5192d', status: 'Sangat Baik' },
    { no: 5, title: 'Keterlibatan Perempuan Desa', score: 78.5, color: '#ff3a21', status: 'Baik' },
    { no: 6, title: 'Desa Layak Air Bersih & Sanitasi', score: 92.0, color: '#26bde2', status: 'Unggul' },
    { no: 7, title: 'Desa Berenergi Bersih & Terbarukan', score: 74.0, color: '#fcc30b', status: 'Baik' },
    { no: 8, title: 'Pertumbuhan Ekonomi Desa Merata', score: 76.5, color: '#a21942', status: 'Baik' },
    { no: 9, title: 'Infrastruktur & Inovasi Desa', score: 85.0, color: '#fd6925', status: 'Sangat Baik' },
    { no: 10, title: 'Desa Tanpa Kesenjangan', score: 79.0, color: '#dd1367', status: 'Baik' },
    { no: 11, title: 'Kawasan Permukiman Aman & Nyaman', score: 88.4, color: '#fd9d24', status: 'Sangat Baik' },
    { no: 12, title: 'Konsumsi & Produksi Sadar Lingkungan', score: 70.2, color: '#bf8b2e', status: 'Baik' },
    { no: 13, title: 'Desa Tanggap Perubahan Iklim', score: 72.5, color: '#3f7e44', status: 'Baik' },
    { no: 14, title: 'Desa Peduli Lingkungan Laut/Perairan', score: 68.0, color: '#0a97d9', status: 'Cukup' },
    { no: 15, title: 'Desa Peduli Lingkungan Darat', score: 82.0, color: '#56c02b', status: 'Sangat Baik' },
    { no: 16, title: 'Desa Damai Berkeadilan', score: 94.0, color: '#00689d', status: 'Unggul' },
    { no: 17, title: 'Kemitraan untuk Pembangunan Desa', score: 80.5, color: '#19486a', status: 'Sangat Baik' },
    { no: 18, title: 'Kelembagaan Desa Dinamis & Budaya Adaptif', score: 85.2, color: '#00457c', status: 'Sangat Baik' },
  ];

  return (
    <div className="space-y-4 sm:space-y-8">
      {/* Banner SDGs */}
      <div className="p-4 min-[380px]:p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-blue-900 via-teal-900 to-emerald-900 text-white relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-2xl space-y-2 sm:space-y-3">
          <Badge className="bg-white/20 text-white text-[8px] min-[380px]:text-[10px] font-black uppercase tracking-widest border-none">
            SDGs Desa
          </Badge>
          <h2 className="text-lg sm:text-2xl md:text-3xl font-black font-display tracking-tight">
            Skor SDGs: 72.84
          </h2>
          <p className="text-[10px] sm:text-xs text-slate-200 leading-relaxed">
            Pencapaian 18 tujuan pembangunan berkelanjutan desa untuk mewujudkan Desa Karanggintung yang mandiri dan berdaya saing.
          </p>
        </div>
      </div>

      {/* 18 Goals Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
        {sdgsGoals.map((g) => (
          <div
            key={g.no}
            className="p-2.5 min-[380px]:p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow space-y-2 sm:space-y-3 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span
                className="h-5 w-5 min-[380px]:h-6 min-[380px]:w-6 sm:h-7 sm:w-7 rounded-md sm:rounded-lg text-white font-black text-[10px] sm:text-xs flex items-center justify-center shrink-0"
                style={{ backgroundColor: g.color }}
              >
                {g.no}
              </span>
              <span className="text-[8px] min-[380px]:text-[9px] sm:text-[10px] font-black text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded truncate max-w-[80px] sm:max-w-none text-center">
                {g.status}
              </span>
            </div>

            <h4 className="font-bold text-slate-800 text-[11px] min-[380px]:text-xs sm:text-sm leading-tight line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem]">
              {g.title}
            </h4>

            <div className="space-y-1">
              <div className="flex justify-between text-[9px] sm:text-xs font-bold">
                <span className="text-slate-400 text-[8px] sm:text-[10px] uppercase tracking-wider">Capaian</span>
                <span className="text-slate-900">{g.score}%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 sm:h-2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${g.score}%`, backgroundColor: g.color }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 8. TAB INDEKS DESA (INDEKS DESA 2025)
// ==========================================
function IndeksTab() {
  const indicatorStats = [
    { score: 'Skor 5 (Sangat Baik)', count: 65, percent: 51.1, desc: 'Layanan dasar, sinyal, dan administrasi optimal.', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300', barColor: '#059669' },
    { score: 'Skor 4 (Baik)', count: 6, percent: 4.7, desc: 'Waktu layanan dan beberapa fasilitas cukup memadai.', badgeColor: 'bg-blue-100 text-blue-800 border-blue-300', barColor: '#0284c7' },
    { score: 'Skor 3 (Sedang)', count: 14, percent: 11.0, desc: 'Aksesibilitas dan partisipasi pada tingkat menengah.', badgeColor: 'bg-amber-100 text-amber-800 border-amber-300', barColor: '#f59e0b' },
    { score: 'Skor 2 (Rendah)', count: 4, percent: 3.1, desc: 'Layanan atau partisipasi sangat terbatas.', badgeColor: 'bg-orange-100 text-orange-800 border-orange-300', barColor: '#ea580c' },
    { score: 'Skor 1 (Sangat Kurang)', count: 38, percent: 29.9, desc: 'Fasilitas/layanan tidak tersedia atau rusak.', badgeColor: 'bg-rose-100 text-rose-800 border-rose-300', barColor: '#e11d48' },
  ];

  const quickWins = [
    {
      title: '1. Pembentukan Perdes & Tata Kelola Lingkungan',
      impact: '+15 Skor',
      difficulty: 'Mudah',
      desc: 'Menerbitkan Perdes pelestarian lingkungan, Bank Sampah Dusun, dan jadwal angkut sampah terpadu.',
    },
    {
      title: '2. Dokter Kunjungan Berkala & Siaga Darurat',
      impact: '+10 Skor',
      difficulty: 'Sedang',
      desc: 'Membangun MoU kemitraan dengan Puskesmas untuk dokter praktik mingguan di PKD Karanggintung.',
    },
    {
      title: '3. Pelatihan Vokasi & Balai Latihan Kerja Desa',
      impact: '+10 Skor',
      difficulty: 'Mudah',
      desc: 'Mengaktifkan pelatihan non-formal (digital marketing gula semut, tata boga, kerajinan) bekerjasama dengan Disnaker/LPK.',
    },
    {
      title: '4. Pemeliharaan & Tambal Lubang Jalan Poros',
      impact: '+12 Skor',
      difficulty: 'Sedang',
      desc: 'Meningkatkan jalan aspal/beton rusak sedang menjadi mantap melalui padat karya tunai dan swadaya.',
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-8">
      {/* Top Banner Status Indeks Desa 2025 */}
      <Card className="rounded-2xl sm:rounded-3xl p-4 min-[380px]:p-5 sm:p-8 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white shadow-xl relative overflow-hidden border-none">
        <div className="relative z-10 grid md:grid-cols-12 gap-4 sm:gap-6 items-center">
          <div className="md:col-span-8 space-y-2 sm:space-y-3">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-[8px] min-[380px]:text-[10px] font-black uppercase tracking-widest">
              <Award className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-400" />
              Laporan Indeks Desa 2025
            </div>
            <h2 className="text-xl min-[380px]:text-2xl sm:text-3xl md:text-4xl font-extrabold font-display">
              Status: DESA BERKEMBANG
            </h2>
            <p className="text-[10px] sm:text-xs md:text-sm text-slate-200 leading-relaxed">
              Berdasarkan data <strong>Indeks Desa 2025</strong>, Desa Karanggintung (Kec. Gandrungmangu, Kab. Cilacap) berstatus <strong>Berkembang</strong> dengan total skor <strong>437</strong> dari nilai maksimal <strong>635</strong>. Rata-rata skor <strong>3.44</strong> (skala 5).
            </p>
            <p className="text-[10px] sm:text-xs text-emerald-200/90 font-medium">
              Sebanyak <strong>65 indikator</strong> meraih skor maksimal (Skor 5), dengan <strong>38 indikator</strong> di skor terendah (Skor 1) menjadi fokus pembenahan.
            </p>
          </div>
          <div className="md:col-span-4 bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-3.5 sm:p-6 text-center border border-white/10 space-y-2 sm:space-y-3">
            <div>
              <p className="text-[8px] min-[380px]:text-[10px] font-bold text-emerald-300 uppercase tracking-widest">Total Skor</p>
              <h3 className="text-2xl min-[380px]:text-3xl sm:text-4xl md:text-5xl font-black mt-0.5 sm:mt-1 text-white font-display">
                437 <span className="text-sm sm:text-lg font-normal text-emerald-200">/ 635</span>
              </h3>
            </div>
            <div className="pt-2 border-t border-white/10 flex justify-around text-center">
              <div>
                <p className="text-[8px] sm:text-[9px] text-slate-300 uppercase font-bold">Rata-rata</p>
                <p className="text-sm sm:text-lg font-black text-emerald-300">3.44 <span className="text-[9px] sm:text-xs font-normal text-slate-300">/ 5</span></p>
              </div>
              <div>
                <p className="text-[8px] sm:text-[9px] text-slate-300 uppercase font-bold">Status</p>
                <p className="text-xs sm:text-sm font-black text-amber-300 uppercase">Berkembang</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* KPI Cards Ringkasan Indikator */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        <Card className="rounded-2xl sm:rounded-3xl p-3 sm:p-5 bg-white border-slate-100 shadow-sm">
          <p className="text-[8px] min-[380px]:text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Skor 5 (Sangat Baik)</p>
          <h3 className="text-xl min-[380px]:text-2xl sm:text-3xl font-black text-slate-800 mt-1 font-display">65 <span className="text-[10px] sm:text-xs font-normal text-slate-500">Indikator</span></h3>
          <p className="text-[9px] min-[380px]:text-[10px] sm:text-xs text-emerald-600 font-bold mt-0.5 sm:mt-1">51.1% Maksimal</p>
        </Card>

        <Card className="rounded-2xl sm:rounded-3xl p-3 sm:p-5 bg-white border-slate-100 shadow-sm">
          <p className="text-[8px] min-[380px]:text-[10px] font-bold text-blue-600 uppercase tracking-wider">Skor 4 (Baik)</p>
          <h3 className="text-xl min-[380px]:text-2xl sm:text-3xl font-black text-slate-800 mt-1 font-display">6 <span className="text-[10px] sm:text-xs font-normal text-slate-500">Indikator</span></h3>
          <p className="text-[9px] min-[380px]:text-[10px] sm:text-xs text-blue-600 font-bold mt-0.5 sm:mt-1">4.7% Memadai</p>
        </Card>

        <Card className="rounded-2xl sm:rounded-3xl p-3 sm:p-5 bg-white border-slate-100 shadow-sm">
          <p className="text-[8px] min-[380px]:text-[10px] font-bold text-amber-600 uppercase tracking-wider">Skor 3 (Sedang)</p>
          <h3 className="text-xl min-[380px]:text-2xl sm:text-3xl font-black text-slate-800 mt-1 font-display">14 <span className="text-[10px] sm:text-xs font-normal text-slate-500">Indikator</span></h3>
          <p className="text-[9px] min-[380px]:text-[10px] sm:text-xs text-amber-600 font-bold mt-0.5 sm:mt-1">11.0% Menengah</p>
        </Card>

        <Card className="rounded-2xl sm:rounded-3xl p-3 sm:p-5 bg-white border-slate-100 shadow-sm">
          <p className="text-[8px] min-[380px]:text-[10px] font-bold text-rose-600 uppercase tracking-wider">Skor 1 & 2 (Kritis)</p>
          <h3 className="text-xl min-[380px]:text-2xl sm:text-3xl font-black text-rose-600 mt-1 font-display">42 <span className="text-[10px] sm:text-xs font-normal text-slate-500">Indikator</span></h3>
          <p className="text-[9px] min-[380px]:text-[10px] sm:text-xs text-rose-600 font-bold mt-0.5 sm:mt-1">33.0% Butuh Intervensi</p>
        </Card>
      </div>

      {/* Tabel & Distribusi Kinerja Indikator */}
      <Card className="rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 bg-white border-slate-100 shadow-sm space-y-3 sm:space-y-6">
        <div>
          <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800">Statistik Kinerja Indikator Indeks Desa</h3>
          <p className="text-[10px] sm:text-xs text-slate-500">Sebaran evaluasi 127 total indikator penilaian Indeks Desa 2025.</p>
        </div>

        <div className="overflow-x-auto -mx-1 sm:mx-0">
          <table className="w-full text-left text-[10px] sm:text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[8px] sm:text-[10px]">
                <th className="py-2 px-1.5 sm:py-3 sm:px-4 font-bold">Skor</th>
                <th className="py-2 px-1.5 sm:py-3 sm:px-4 font-bold text-center">Jumlah</th>
                <th className="py-2 px-1.5 sm:py-3 sm:px-4 font-bold text-center">%</th>
                <th className="py-2 px-1.5 sm:py-3 sm:px-4 font-bold">Interpretasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {indicatorStats.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2 px-1.5 sm:py-3.5 sm:px-4 font-bold">
                    <span className={cn("px-1.5 sm:px-2.5 py-0.5 rounded-full text-[8px] min-[380px]:text-[9px] sm:text-[10px] font-black border whitespace-nowrap", item.badgeColor)}>
                      <span className="sm:hidden">{item.score.split(' ')[0]} {item.score.split(' ')[1]}</span>
                      <span className="hidden sm:inline">{item.score}</span>
                    </span>
                  </td>
                  <td className="py-2 px-1.5 sm:py-3.5 sm:px-4 text-center font-black text-slate-900 whitespace-nowrap">
                    <span className="sm:hidden">{item.count}</span>
                    <span className="hidden sm:inline">{item.count} Indikator</span>
                  </td>
                  <td className="py-2 px-1.5 sm:py-3.5 sm:px-4 text-center font-bold text-slate-700 whitespace-nowrap">{item.percent}%</td>
                  <td className="py-2 px-1.5 sm:py-3.5 sm:px-4 text-slate-600 text-[9px] sm:text-xs">{item.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Visual Progress Breakdown */}
        <div className="space-y-1.5 sm:space-y-2 pt-1 sm:pt-2">
          <p className="text-[8px] min-[380px]:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Komposisi Indikator Berdasarkan Skor</p>
          <div className="h-3 sm:h-4 w-full bg-slate-100 rounded-full overflow-hidden flex">
            {indicatorStats.map((item, idx) => (
              <div
                key={idx}
                style={{ width: `${item.percent}%`, backgroundColor: item.barColor }}
                title={`${item.score}: ${item.percent}%`}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-4 text-[8px] min-[380px]:text-[9px] sm:text-[10px] font-bold text-slate-600 pt-1">
            {indicatorStats.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1">
                <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.barColor }} />
                <span>{item.score.split(' ')[0]} ({item.percent}%)</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Rincian Analisis Sektoral (Pendidikan, Kesehatan, Ekonomi, Infrastruktur, Sosial, Lingkungan, Pemerintahan) */}
      <div className="grid md:grid-cols-2 gap-3 sm:gap-6">
        {/* 1. Pendidikan & Kesehatan */}
        <Card className="rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 bg-white border-slate-100 shadow-sm space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2 border-b pb-2 sm:pb-3">
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg sm:rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <GraduationCap className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800">1. Pendidikan & Kesehatan</h3>
              <p className="text-[9px] sm:text-[10px] text-slate-400">Akses layanan dasar masyarakat</p>
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3 text-[10px] sm:text-xs leading-relaxed text-slate-600">
            <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex justify-between items-center">
                <p className="font-bold text-slate-800">Sektor Pendidikan</p>
                <Badge className="bg-emerald-600 text-white text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5">Skor 5 (SD/SMP)</Badge>
              </div>
              <p>Desa memiliki akses dan partisipasi sangat baik pada jenjang SD/MI hingga SMP/MTs (skor 5).</p>
              <p className="text-rose-600 font-semibold pt-0.5">
                ⚠️ Akses menuju SMA/SMK sangat sulit (skor 1), dan belum ada kursus vokasi aktif.
              </p>
            </div>

            <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex justify-between items-center">
                <p className="font-bold text-slate-800">Sektor Kesehatan</p>
                <Badge className="bg-emerald-600 text-white text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5">Skor 5 (Bidan & Posyandu)</Badge>
              </div>
              <p>Air minum harian, ketersediaan Bidan, dan aktivitas Posyandu berjalan optimal (skor 5).</p>
              <p className="text-rose-600 font-semibold pt-0.5">
                ⚠️ Belum tersedianya dokter tetap dan transportasi rujukan darurat (skor 1).
              </p>
            </div>
          </div>
        </Card>

        {/* 2. Ekonomi & Infrastruktur */}
        <Card className="rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 bg-white border-slate-100 shadow-sm space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2 border-b pb-2 sm:pb-3">
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg sm:rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800">2. Ekonomi & Infrastruktur</h3>
              <p className="text-[9px] sm:text-[10px] text-slate-400">Potensi pendapatan & konektivitas</p>
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3 text-[10px] sm:text-xs leading-relaxed text-slate-600">
            <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex justify-between items-center">
                <p className="font-bold text-slate-800">Kekuatan Ekonomi</p>
                <Badge className="bg-emerald-600 text-white text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5">Unggulan</Badge>
              </div>
              <p>Produk gula semut bermerek dagang terdaftar, BUMDes berbadan hukum, kredit KUR, dan sinyal 4G kuat.</p>
            </div>

            <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex justify-between items-center">
                <p className="font-bold text-slate-800">Kendala Infrastruktur</p>
                <Badge className="bg-amber-600 text-white text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5">Perlu Pembenahan</Badge>
              </div>
              <p>Jalan desa utamanya aspal/beton (skor 5) namun kualitasnya <strong>rusak sedang</strong>. Angkutan umum minim.</p>
            </div>
          </div>
        </Card>

        {/* 3. Lingkungan Hidup (Sangat Kritis) */}
        <Card className="rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 bg-white border-slate-100 shadow-sm space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2 border-b pb-2 sm:pb-3">
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg sm:rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              <Sprout className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800">3. Lingkungan Hidup</h3>
              <p className="text-[9px] sm:text-[10px] text-rose-500 font-bold">Prioritas intervensi mendesak</p>
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-rose-50/70 border border-rose-200/80 text-[10px] sm:text-xs leading-relaxed space-y-1.5 text-rose-950">
            <p className="font-bold text-rose-900">⚠️ Area kritis yang butuh intervensi:</p>
            <ul className="space-y-1 list-disc pl-3.5 sm:pl-4 text-rose-900">
              <li>Belum ada Perdes pelestarian lingkungan hidup.</li>
              <li>Belum tersedianya TPS sampah terpadu & pengolahan limbah.</li>
              <li>Tidak tersedianya fasilitas & jalur evakuasi mitigasi bencana.</li>
            </ul>
          </div>
        </Card>

        {/* 4. Sosial, Tata Kelola & Pemerintahan */}
        <Card className="rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 bg-white border-slate-100 shadow-sm space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2 border-b pb-2 sm:pb-3">
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg sm:rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800">4. Sosial & Tata Kelola</h3>
              <p className="text-[9px] sm:text-[10px] text-emerald-600 font-bold">Kekuatan modal sosial & administrasi</p>
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-[10px] sm:text-xs leading-relaxed space-y-1.5 text-emerald-950">
            <p className="font-bold text-emerald-900">✅ Keunggulan modal sosial & tata kelola:</p>
            <ul className="space-y-1 list-disc pl-3.5 sm:pl-4 text-emerald-900">
              <li>Penyelesaian konflik warga secara musyawarah & damai.</li>
              <li>Gotong royong tinggi & ronda Satkamling aktif 37 RT.</li>
              <li>Pelayanan kantor desa terbuka setiap hari kerja & PADes stabil.</li>
            </ul>
          </div>
        </Card>
      </div>

      {/* Rekomendasi Proyeksi Menjadi Desa "Maju" */}
      <Card className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary/20 text-secondary text-[8px] min-[380px]:text-[10px] font-black uppercase tracking-widest mb-1">
              <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              Rencana Strategis
            </div>
            <h3 className="text-base sm:text-xl font-black font-display tracking-tight text-white">
              Quick Wins Menuju "Desa Maju"
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-300 mt-0.5">
              Area prioritas berbiaya efisien dengan dampak lonjakan skor indikator tertinggi.
            </p>
          </div>
          <Badge className="bg-emerald-600 text-white text-[10px] sm:text-xs font-black uppercase px-3 py-1.5 self-start sm:self-auto shrink-0">
            Target 2026: Maju
          </Badge>
        </div>

        <div className="grid sm:grid-cols-2 gap-2.5 sm:gap-4">
          {quickWins.map((qw, idx) => (
            <div key={idx} className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/50 transition-colors space-y-1.5 sm:space-y-2">
              <div className="flex justify-between items-center gap-2">
                <span className="text-xs font-black text-white">{qw.title}</span>
                <span className="text-[9px] sm:text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded shrink-0">
                  {qw.impact}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-300 leading-relaxed">{qw.desc}</p>
              <div className="pt-0.5 flex items-center gap-2 text-[9px] sm:text-[10px] text-slate-400 font-semibold">
                <span>Kesulitan: <strong className="text-amber-300">{qw.difficulty}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
