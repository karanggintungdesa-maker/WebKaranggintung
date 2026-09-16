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
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      {/* TOP HEADER */}
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

      {/* HERO SECTION */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white py-12 md:py-16 border-b border-slate-700/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-black uppercase tracking-widest mb-4">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              Portal Data & Transparansi Publik
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight font-display mb-3">
              Statistik Desa Karanggintung
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Pusat data terpadu dan indikator pembangunan Desa Karanggintung, Kecamatan Gandrungmangu, Kabupaten Cilacap.
            </p>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="grid lg:grid-cols-12 gap-10 items-start">

          {/* SIDEBAR NAVIGATION (Desktop) / MOBILE MENU (Mobile) */}
          <aside className="lg:col-span-3 lg:sticky lg:top-28 z-40">
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

            {/* Mobile Menu Dropdown Selector */}
            <div className="block lg:hidden w-full relative mb-6">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-full flex items-center justify-between bg-primary text-white px-5 py-4 rounded-xl shadow-md font-black uppercase text-[10px] tracking-wider"
              >
                <div className="flex items-center gap-3">
                  {React.createElement(activeTabObj.icon, { className: "h-5 w-5 text-white shrink-0" })}
                  <div className="text-left">
                    <p className="leading-tight">{activeTabObj.label}</p>
                  </div>
                </div>
                <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isMenuOpen && "rotate-180")} />
              </button>

              {isMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                  <div className="absolute left-0 right-0 mt-2 z-50 bg-white border rounded-xl shadow-xl overflow-hidden py-1 divide-y divide-slate-100 animate-in fade-in slide-in-from-top-2 duration-200">
                    {tabs.map((tab) => {
                      const isCurrent = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => {
                            handleTabChange(tab.id);
                            setIsMenuOpen(false);
                          }}
                          className={cn(
                            "w-full flex items-center gap-4 px-5 py-3.5 text-left text-xs font-bold transition-colors",
                            isCurrent ? "bg-slate-50 text-primary" : "text-slate-600 hover:bg-slate-50"
                          )}
                        >
                          <tab.icon className={cn("h-4 w-4 shrink-0", isCurrent ? "text-primary" : "text-slate-400")} />
                          <span className="uppercase tracking-wider">{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Quick Access Card */}
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
          <main className="lg:col-span-9 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
    <div className="space-y-8">
      {/* Header filter & exports */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Statistik Kependudukan</h2>
          <p className="text-xs text-slate-500">Agregasi data demografi, kelompok usia, dan profesi warga desa.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={filterDusun} onValueChange={setFilterDusun}>
            <SelectTrigger className="w-[180px] rounded-xl border-slate-200 text-xs font-bold">
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

          <Button onClick={handleDownloadExcel} variant="outline" size="sm" className="gap-2 rounded-xl text-xs font-bold text-slate-700">
            <Download className="h-3.5 w-3.5 text-emerald-600" />
            Excel
          </Button>
          <Button onClick={handleDownloadPDF} variant="outline" size="sm" className="gap-2 rounded-xl text-xs font-bold text-slate-700">
            <FileDown className="h-3.5 w-3.5 text-red-600" />
            PDF
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="rounded-3xl border-slate-100 shadow-sm bg-gradient-to-br from-emerald-700 to-emerald-900 text-white p-6">
          <p className="text-[10px] font-bold text-emerald-200 uppercase tracking-widest">Total Penduduk</p>
          <h3 className="text-3xl font-black mt-2 font-display">{stats.total.toLocaleString()}</h3>
          <p className="text-[11px] text-emerald-100/80 mt-1 flex items-center gap-1">
            <Users className="h-3.5 w-3.5" /> Jiwa Terdaftar
          </p>
        </Card>

        <Card className="rounded-3xl border-slate-100 shadow-sm bg-white p-6">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kepala Keluarga</p>
          <h3 className="text-3xl font-black text-slate-800 mt-2 font-display">{stats.totalKK.toLocaleString()}</h3>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <Home className="h-3.5 w-3.5 text-primary" /> Rumah Tangga (KK)
          </p>
        </Card>

        <Card className="rounded-3xl border-slate-100 shadow-sm bg-white p-6">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Laki-Laki</p>
          <h3 className="text-3xl font-black text-blue-600 mt-2 font-display">{stats.male.toLocaleString()}</h3>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <UserCheck className="h-3.5 w-3.5 text-blue-500" /> {stats.malePercent}% Komposisi
          </p>
        </Card>

        <Card className="rounded-3xl border-slate-100 shadow-sm bg-white p-6">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Perempuan</p>
          <h3 className="text-3xl font-black text-pink-600 mt-2 font-display">{stats.female.toLocaleString()}</h3>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <UserCheck className="h-3.5 w-3.5 text-pink-500" /> {stats.femalePercent}% Komposisi
          </p>
        </Card>
      </div>

      {/* 5 Dusun Breakdown Cards */}
      <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">Distribusi Penduduk Berdasarkan 5 Dusun</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { dusun: 'Karanggintung', jiwa: 2450, kk: 780, rt: 9, rw: 2 },
            { dusun: 'Pagergunung', jiwa: 2180, kk: 695, rt: 8, rw: 2 },
            { dusun: 'Sindangraja', jiwa: 1920, kk: 615, rt: 7, rw: 2 },
            { dusun: 'Penumbang', jiwa: 1750, kk: 560, rt: 7, rw: 2 },
            { dusun: 'Karangtawang', jiwa: 1446, kk: 470, rt: 6, rw: 1 },
          ].map((d, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-colors">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Dusun</span>
              <h4 className="font-bold text-slate-800 text-sm mt-0.5">{d.dusun}</h4>
              <p className="text-lg font-black text-slate-900 mt-2">{d.jiwa.toLocaleString()} <span className="text-xs font-normal text-slate-500">Jiwa</span></p>
              <div className="mt-2 pt-2 border-t border-slate-200/60 flex justify-between text-[10px] text-slate-500 font-semibold">
                <span>{d.kk} KK</span>
                <span>{d.rt} RT / {d.rw} RW</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Row: Kelompok Umur & Pekerjaan */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="rounded-3xl border-slate-100 shadow-sm p-6 bg-white">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 mb-4">Kelompok Usia Penduduk</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.ageData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
                <Tooltip formatter={(value: any) => [`${value} Jiwa`, 'Jumlah']} />
                <Bar dataKey="value" fill="#059669" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="rounded-3xl border-slate-100 shadow-sm p-6 bg-white">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 mb-4">Mata Pencaharian Utama</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.jobData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={130} />
                <Tooltip formatter={(value: any) => [`${value} Orang`, 'Jumlah']} />
                <Bar dataKey="value" fill="#0284c7" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Mutasi Penduduk Bulanan */}
      <Card className="rounded-3xl border-slate-100 shadow-sm p-6 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">Dinamika Mutasi Penduduk (2025/2026)</h3>
            <p className="text-xs text-slate-500">Pencatatan kelahiran, kematian, kepindahan, dan kedatangan warga.</p>
          </div>
          <Badge className="bg-emerald-600 text-white font-bold text-[10px]">Pembaruan Bulanan</Badge>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.mutationData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="lahir" stroke="#059669" name="Kelahiran" strokeWidth={2} />
              <Line type="monotone" dataKey="mati" stroke="#dc2626" name="Kematian" strokeWidth={2} />
              <Line type="monotone" dataKey="datang" stroke="#0284c7" name="Penduduk Masuk" strokeWidth={2} />
              <Line type="monotone" dataKey="pindah" stroke="#f59e0b" name="Penduduk Keluar" strokeWidth={2} />
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
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="rounded-3xl p-6 bg-gradient-to-br from-blue-700 to-blue-900 text-white shadow-sm">
          <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Tingkat Melek Huruf</p>
          <h3 className="text-3xl font-black mt-2 font-display">99.2%</h3>
          <p className="text-xs text-blue-100/80 mt-1">Bebas buta aksara usia produktif</p>
        </Card>

        <Card className="rounded-3xl p-6 bg-white border-slate-100 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Wajib Belajar 12 Tahun</p>
          <h3 className="text-3xl font-black text-slate-800 mt-2 font-display">96.4%</h3>
          <p className="text-xs text-emerald-600 font-semibold mt-1">Tuntas pendidikan dasar & menengah</p>
        </Card>

        <Card className="rounded-3xl p-6 bg-white border-slate-100 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Lembaga Pendidikan</p>
          <h3 className="text-3xl font-black text-primary mt-2 font-display">24 Unit</h3>
          <p className="text-xs text-slate-500 mt-1">Formal, non-formal & keagamaan</p>
        </Card>
      </div>

      {/* Tingkat Pendidikan Breakdown */}
      <Card className="rounded-3xl p-6 bg-white border-slate-100 shadow-sm space-y-6">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">Tingkat Pendidikan Terakhir Penduduk</h3>
          <p className="text-xs text-slate-500">Komposisi jenjang kelulusan warga masyarakat Desa Karanggintung.</p>
        </div>

        <div className="space-y-4">
          {eduStats.map((item, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-700">{item.label}</span>
                <span className="text-slate-900">{item.count.toLocaleString()} Jiwa ({item.percent}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
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
      <Card className="rounded-3xl p-6 bg-white border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">Daftar 7 Sekolah Dasar Negeri (SDN)</h3>
            <p className="text-xs text-slate-500">Fasilitas pendidikan dasar negeri yang tersebar di wilayah Desa Karanggintung.</p>
          </div>
          <Badge className="bg-primary text-white font-bold text-[10px]">7 Sekolah Aktif</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 font-bold">Nama Sekolah</th>
                <th className="py-3 px-4 font-bold">Lokasi Dusun</th>
                <th className="py-3 px-4 font-bold text-center">Jumlah Siswa</th>
                <th className="py-3 px-4 font-bold text-center">Tenaga Pendidik</th>
                <th className="py-3 px-4 font-bold text-center">Akreditasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {sdList.map((sd, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-800 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-emerald-600 shrink-0" />
                    {sd.name}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{sd.dusun}</td>
                  <td className="py-3.5 px-4 text-center font-semibold">{sd.siswa} Siswa</td>
                  <td className="py-3.5 px-4 text-center">{sd.guru} Guru</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-[10px] font-black",
                      sd.akreditasi === 'A' ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                    )}>
                      Akreditasi {sd.akreditasi}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Lembaga Pendidikan Non-Formal & Keagamaan */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pendidikan Anak Usia Dini</p>
          <h4 className="text-xl font-bold text-slate-800 mt-1">6 Unit PAUD / TK</h4>
          <p className="text-xs text-slate-500 mt-2">Mendukung kesiapan belajar pra-sekolah di setiap dusun.</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Keagamaan & Karakter</p>
          <h4 className="text-xl font-bold text-slate-800 mt-1">9 TPQ & Madrasah</h4>
          <p className="text-xs text-slate-500 mt-2">Pendidikan Al-Qur'an dan diniyah bagi anak-anak desa.</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pondok Pesantren</p>
          <h4 className="text-xl font-bold text-slate-800 mt-1">2 Pondok Pesantren</h4>
          <p className="text-xs text-slate-500 mt-2">Pusat kajian ilmu agama dan pembinaan akhlak santri.</p>
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
    <div className="space-y-8">
      {/* Top Health Metrics */}
      <div className="grid sm:grid-cols-4 gap-4">
        <Card className="rounded-3xl p-6 bg-gradient-to-br from-emerald-600 to-teal-800 text-white shadow-sm">
          <p className="text-[10px] font-bold text-emerald-200 uppercase tracking-widest">Cakupan BPJS / KIS</p>
          <h3 className="text-3xl font-black mt-2 font-display">94.8%</h3>
          <p className="text-xs text-emerald-100/80 mt-1">Jaminan kesehatan menyeluruh</p>
        </Card>

        <Card className="rounded-3xl p-6 bg-white border-slate-100 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Prevalensi Stunting</p>
          <h3 className="text-3xl font-black text-emerald-600 mt-2 font-display">4.2%</h3>
          <p className="text-xs text-slate-500 mt-1">Status Hijau (Di bawah batas WHO)</p>
        </Card>

        <Card className="rounded-3xl p-6 bg-white border-slate-100 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Posyandu Aktif</p>
          <h3 className="text-3xl font-black text-slate-800 mt-2 font-display">9 Pos</h3>
          <p className="text-xs text-slate-500 mt-1">Posyandu Balita & Posbindu Lansia</p>
        </Card>

        <Card className="rounded-3xl p-6 bg-white border-slate-100 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mobil Siaga Desa</p>
          <h3 className="text-3xl font-black text-blue-600 mt-2 font-display">24 Jam</h3>
          <p className="text-xs text-slate-500 mt-1">Layanan antar-jemput darurat</p>
        </Card>
      </div>

      {/* Fasilitas Layanan Kesehatan */}
      <Card className="rounded-3xl p-6 bg-white border-slate-100 shadow-sm space-y-4">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">Fasilitas & Tenaga Kesehatan di Desa</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Stethoscope className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm">PKD / Poskesdes Karanggintung</h4>
            <p className="text-xs text-slate-500">Pusat Kesehatan Desa melayani pemeriksaan dasar, imunisasi, dan rujukan Puskesmas.</p>
            <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">Bidan Desa Siaga</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <HeartPulse className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm">Rumah Desa Sehat (RDS)</h4>
            <p className="text-xs text-slate-500">Forum koordinasi konvergensi pencegahan stunting & pemenuhan gizi keluarga.</p>
            <span className="inline-block text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">Program Konvergensi</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Activity className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm">Posbindu Penyakit Tidak Menular</h4>
            <p className="text-xs text-slate-500">Pemeriksaan tensi, gula darah, dan kolesterol berkala bagi warga usia lanjut.</p>
            <span className="inline-block text-[10px] font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md">Skrining Lansia Rutin</span>
          </div>
        </div>
      </Card>

      {/* Program Penurunan Stunting */}
      <Card className="rounded-3xl p-6 bg-white border-slate-100 shadow-sm space-y-4">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">Tren Penurunan Angka Stunting (2021 - 2025)</h3>
        <p className="text-xs text-slate-500">Kerja keras kader Posyandu, Bidan Desa, dan Pemdes berhasil menekan stunting secara berkelanjutan.</p>

        <div className="grid sm:grid-cols-5 gap-3 pt-2">
          {[
            { year: '2021', rate: '14.8%', status: 'Zona Waspada', bg: 'bg-amber-50 text-amber-800 border-amber-200' },
            { year: '2022', rate: '11.2%', status: 'Penurunan 3.6%', bg: 'bg-blue-50 text-blue-800 border-blue-200' },
            { year: '2023', rate: '8.4%', status: 'Zona Aman', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
            { year: '2024', rate: '5.8%', status: 'Terkendali', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
            { year: '2025', rate: '4.2%', status: 'Sangat Rendah (Hijau)', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
          ].map((item, idx) => (
            <div key={idx} className={cn("p-4 rounded-2xl border text-center", item.bg)}>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Tahun {item.year}</span>
              <h4 className="text-2xl font-black mt-1 font-display">{item.rate}</h4>
              <p className="text-[10px] font-bold mt-1">{item.status}</p>
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
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="rounded-3xl p-6 bg-gradient-to-br from-purple-700 to-indigo-900 text-white shadow-sm">
          <p className="text-[10px] font-bold text-purple-200 uppercase tracking-widest">Total Penerima Manfaat</p>
          <h3 className="text-3xl font-black mt-2 font-display">1.065 KPM</h3>
          <p className="text-xs text-purple-100/80 mt-1">Terverifikasi DTKS Kemensos</p>
        </Card>

        <Card className="rounded-3xl p-6 bg-white border-slate-100 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lembaga Kemasyarakatan</p>
          <h3 className="text-3xl font-black text-slate-800 mt-2 font-display">6 Lembaga</h3>
          <p className="text-xs text-slate-500 mt-1">PKK, Karang Taruna, LPMD, Linmas, RT/RW</p>
        </Card>

        <Card className="rounded-3xl p-6 bg-white border-slate-100 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Poskamling Aktif</p>
          <h3 className="text-3xl font-black text-emerald-600 mt-2 font-display">100%</h3>
          <p className="text-xs text-slate-500 mt-1">Siskamling di 37 RT berjalan rutin</p>
        </Card>
      </div>

      {/* Tabel Bantuan Sosial */}
      <Card className="rounded-3xl p-6 bg-white border-slate-100 shadow-sm space-y-4">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">Penyaluran Program Jaring Pengaman Sosial</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 font-bold">Nama Program</th>
                <th className="py-3 px-4 font-bold">Deskripsi Manfaat</th>
                <th className="py-3 px-4 font-bold text-center">Jumlah Penerima</th>
                <th className="py-3 px-4 font-bold text-right">Sumber Anggaran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {bansosList.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-800">{item.program}</td>
                  <td className="py-3.5 px-4 text-slate-600">{item.desc}</td>
                  <td className="py-3.5 px-4 text-center font-bold text-emerald-700">{item.kpm}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">{item.budget}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Lembaga Sosial & Partisipasi Warga */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-3">
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Lembaga Kemasyarakatan Desa (LKD)
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Pemberdayaan masyarakat didukung oleh organisasi aktif seperti TP-PKK (12 Pokja aktif), Karang Taruna Tunas Harapan (kegiatan pemuda & olahraga), LPMD (perencanaan pembangunan), serta Satgas Linmas beranggotakan 35 personel siaga bencana & kamtibmas.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-3">
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Heart className="h-4 w-4 text-red-500" />
            Kearifan Lokal & Gotong Royong
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
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
    <div className="space-y-8">
      {/* Top Economic Metrics */}
      <div className="grid sm:grid-cols-4 gap-4">
        <Card className="rounded-3xl p-6 bg-gradient-to-br from-amber-600 to-amber-800 text-white shadow-sm">
          <p className="text-[10px] font-bold text-amber-200 uppercase tracking-widest">Sektor Pertanian</p>
          <h3 className="text-3xl font-black mt-2 font-display">62%</h3>
          <p className="text-xs text-amber-100/80 mt-1">Tulang punggung ekonomi warga</p>
        </Card>

        <Card className="rounded-3xl p-6 bg-white border-slate-100 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Produksi Padi Tahunan</p>
          <h3 className="text-3xl font-black text-slate-800 mt-2 font-display">1.450 Ton</h3>
          <p className="text-xs text-emerald-600 font-semibold mt-1">Luas sawah 480+ Hektar</p>
        </Card>

        <Card className="rounded-3xl p-6 bg-white border-slate-100 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gula Semut / Kelapa</p>
          <h3 className="text-3xl font-black text-slate-800 mt-2 font-display">320 Ton</h3>
          <p className="text-xs text-slate-500 mt-1">Komoditas ekspor & lokal</p>
        </Card>

        <Card className="rounded-3xl p-6 bg-white border-slate-100 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">UMKM Terdaftar</p>
          <h3 className="text-3xl font-black text-primary mt-2 font-display">140+ Unit</h3>
          <p className="text-xs text-slate-500 mt-1">Usaha mikro & kerajinan desa</p>
        </Card>
      </div>

      {/* Komoditas & Populasi Ternak */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="rounded-3xl p-6 bg-white border-slate-100 shadow-sm space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Sprout className="h-4 w-4 text-emerald-600" />
            Komoditas Pertanian & Perkebunan
          </h3>
          <div className="space-y-3">
            {[
              { name: 'Padi Sawah (IR-64 & Ciherang)', yield: '1.450 Ton / thn', area: '480 Ha' },
              { name: 'Kelapa & Nira Gula Jawa / Semut', yield: '320 Ton / thn', area: '180 Ha' },
              { name: 'Jagung Hibrida & Pipil', yield: '210 Ton / thn', area: '65 Ha' },
              { name: 'Singkong & Umbi-umbian', yield: '180 Ton / thn', area: '45 Ha' },
              { name: 'Hortikultura (Cabai, Terong, Kacang)', yield: '95 Ton / thn', area: '30 Ha' },
            ].map((item, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <p className="font-bold text-slate-800">{item.name}</p>
                  <p className="text-[10px] text-slate-500">Estimasi Lahan: {item.area}</p>
                </div>
                <span className="font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">{item.yield}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="rounded-3xl p-6 bg-white border-slate-100 shadow-sm space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Coins className="h-4 w-4 text-amber-600" />
            Populasi Ternak & BUMDes Karanggintung
          </h3>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-xl bg-slate-50 border text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Sapi Potong</p>
                <p className="text-xl font-black text-slate-800 mt-1">240</p>
                <p className="text-[10px] text-slate-500">Ekor</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Kambing/Domba</p>
                <p className="text-xl font-black text-slate-800 mt-1">890</p>
                <p className="text-[10px] text-slate-500">Ekor</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Unggas Ayam</p>
                <p className="text-xl font-black text-slate-800 mt-1">12.000+</p>
                <p className="text-[10px] text-slate-500">Ekor</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1.5">
              <h4 className="font-bold text-emerald-950 text-xs uppercase tracking-wider">BUMDes Makmur Karanggintung</h4>
              <p className="text-xs text-emerald-900 leading-relaxed">
                Mengelola unit usaha simpan pinjam desa, penyaluran sarana produksi pertanian (pupuk & benih), pengelolaan air bersih Pamsimas, dan kemitraan pemasaran produk gula semut UMKM.
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
    <div className="space-y-8">
      {/* Overview APBDes */}
      <div className="grid sm:grid-cols-4 gap-4">
        <Card className="rounded-3xl p-6 bg-gradient-to-br from-emerald-800 to-slate-900 text-white shadow-sm">
          <p className="text-[10px] font-bold text-emerald-200 uppercase tracking-widest">Realisasi APBDes</p>
          <h3 className="text-3xl font-black mt-2 font-display">98.4%</h3>
          <p className="text-xs text-emerald-100/80 mt-1">Kinerja serapan anggaran tinggi</p>
        </Card>

        <Card className="rounded-3xl p-6 bg-white border-slate-100 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Jalan Rabat & Aspal</p>
          <h3 className="text-3xl font-black text-slate-800 mt-2 font-display">42 Km</h3>
          <p className="text-xs text-emerald-600 font-semibold mt-1">88% Kondisi Mantap</p>
        </Card>

        <Card className="rounded-3xl p-6 bg-white border-slate-100 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Drainase & Irigasi</p>
          <h3 className="text-3xl font-black text-slate-800 mt-2 font-display">28 Km</h3>
          <p className="text-xs text-slate-500 mt-1">Saluran tersier & pemukiman</p>
        </Card>

        <Card className="rounded-3xl p-6 bg-white border-slate-100 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PJU Tenaga Surya / Listrik</p>
          <h3 className="text-3xl font-black text-amber-600 mt-2 font-display">350 Titik</h3>
          <p className="text-xs text-slate-500 mt-1">Penerangan jalan 5 dusun</p>
        </Card>
      </div>

      {/* Program Pembangunan Prioritas */}
      <Card className="rounded-3xl p-6 bg-white border-slate-100 shadow-sm space-y-4">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">Capaian Infrastruktur & Fasilitas Publik</h3>
        <div className="grid md:grid-cols-2 gap-4">
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
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
                  {item.tag}
                </span>
                <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" /> {item.status}
                </span>
              </div>
              <h4 className="font-bold text-slate-800 text-sm">{item.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
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
    <div className="space-y-8">
      {/* Banner SDGs */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-900 via-teal-900 to-emerald-900 text-white relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-2xl space-y-3">
          <Badge className="bg-white/20 text-white text-[10px] font-black uppercase tracking-widest border-none">
            Sustainable Development Goals Desa
          </Badge>
          <h2 className="text-2xl md:text-3xl font-black font-display tracking-tight">
            Skor SDGs Desa Karanggintung: 72.84
          </h2>
          <p className="text-xs text-slate-200 leading-relaxed">
            Pencapaian 18 tujuan pembangunan berkelanjutan desa untuk mewujudkan desa yang mandiri, berdaya saing, inklusif, dan ramah lingkungan.
          </p>
        </div>
      </div>

      {/* 18 Goals Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sdgsGoals.map((g) => (
          <div
            key={g.no}
            className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow space-y-3 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span
                className="h-7 w-7 rounded-lg text-white font-black text-xs flex items-center justify-center shrink-0"
                style={{ backgroundColor: g.color }}
              >
                {g.no}
              </span>
              <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {g.status}
              </span>
            </div>

            <h4 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2 min-h-[2.5rem]">
              {g.title}
            </h4>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-400 text-[10px] uppercase tracking-wider">Capaian Indikator</span>
                <span className="text-slate-900">{g.score}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
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
      title: '1. Pembentukan Perdes & Tata Kelola Lingkungan Hidup',
      impact: '+15 Skor',
      difficulty: 'Mudah',
      desc: 'Menerbitkan Peraturan Desa (Perdes) pelestarian lingkungan, pembentukan Bank Sampah Dusun, dan jadwal pengangkutan sampah terpadu.',
    },
    {
      title: '2. Layanan Dokter Kunjungan Berkala & Siaga Darurat',
      impact: '+10 Skor',
      difficulty: 'Sedang',
      desc: 'Membangun MoU kemitraan dengan Puskesmas Gandrungmangu untuk jadwal dokter praktik mingguan di PKD/Poskesdes Karanggintung.',
    },
    {
      title: '3. Pelatihan Vokasi, Kursus & Balai Latihan Kerja Desa',
      impact: '+10 Skor',
      difficulty: 'Mudah',
      desc: 'Mengaktifkan pelatihan non-formal (digital marketing gula semut, tata boga, kerajinan) bekerjasama dengan Disnaker/LPK.',
    },
    {
      title: '4. Pemeliharaan Berkala & Penutupan Lubang Jalan Poros',
      impact: '+12 Skor',
      difficulty: 'Sedang',
      desc: 'Meningkatkan status jalan aspal/beton yang rusak sedang menjadi mantap melalui padat karya tunai dan swadaya dusun.',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner Status Indeks Desa 2025 */}
      <Card className="rounded-3xl p-8 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white shadow-xl relative overflow-hidden border-none">
        <div className="relative z-10 grid md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-[10px] font-black uppercase tracking-widest">
              <Award className="h-3.5 w-3.5 text-amber-400" />
              Laporan Resmi Indeks Desa 2025
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold font-display">
              Status: DESA BERKEMBANG
            </h2>
            <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
              Berdasarkan data <strong>Indeks Desa 2025</strong>, Desa Karanggintung (Kecamatan Gandrungmangu, Kabupaten Cilacap) berstatus <strong>Berkembang</strong> dengan perolehan total skor <strong>437</strong> dari nilai maksimal <strong>635</strong>. Rata-rata skor berada di angka <strong>3.44</strong> (skala 5).
            </p>
            <p className="text-xs text-emerald-200/90 font-medium">
              Lebih dari separuh indikator (<strong>65 indikator</strong>) telah mencapai skor maksimal (Skor 5), namun masih terdapat <strong>38 indikator</strong> yang berada di skor terendah (Skor 1) yang menjadi fokus pembenahan.
            </p>
          </div>
          <div className="md:col-span-4 bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center border border-white/10 space-y-3">
            <div>
              <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest">Total Skor Diperoleh</p>
              <h3 className="text-4xl md:text-5xl font-black mt-1 text-white font-display">437 <span className="text-lg font-normal text-emerald-200">/ 635</span></h3>
            </div>
            <div className="pt-2 border-t border-white/10 flex justify-around text-center">
              <div>
                <p className="text-[9px] text-slate-300 uppercase font-bold">Rata-rata Skor</p>
                <p className="text-lg font-black text-emerald-300">3.44 <span className="text-xs font-normal text-slate-300">/ 5.0</span></p>
              </div>
              <div>
                <p className="text-[9px] text-slate-300 uppercase font-bold">Status Desa</p>
                <p className="text-sm font-black text-amber-300 uppercase">Berkembang</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* KPI Cards Ringkasan Indikator */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="rounded-3xl p-5 bg-white border-slate-100 shadow-sm">
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Skor 5 (Sangat Baik)</p>
          <h3 className="text-3xl font-black text-slate-800 mt-1 font-display">65 <span className="text-xs font-normal text-slate-500">Indikator</span></h3>
          <p className="text-xs text-emerald-600 font-bold mt-1">51.1% Capaian Maksimal</p>
        </Card>

        <Card className="rounded-3xl p-5 bg-white border-slate-100 shadow-sm">
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Skor 4 (Baik)</p>
          <h3 className="text-3xl font-black text-slate-800 mt-1 font-display">6 <span className="text-xs font-normal text-slate-500">Indikator</span></h3>
          <p className="text-xs text-blue-600 font-bold mt-1">4.7% Memadai</p>
        </Card>

        <Card className="rounded-3xl p-5 bg-white border-slate-100 shadow-sm">
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Skor 3 (Sedang)</p>
          <h3 className="text-3xl font-black text-slate-800 mt-1 font-display">14 <span className="text-xs font-normal text-slate-500">Indikator</span></h3>
          <p className="text-xs text-amber-600 font-bold mt-1">11.0% Menengah</p>
        </Card>

        <Card className="rounded-3xl p-5 bg-white border-slate-100 shadow-sm">
          <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">Skor 1 & 2 (Kritis)</p>
          <h3 className="text-3xl font-black text-rose-600 mt-1 font-display">42 <span className="text-xs font-normal text-slate-500">Indikator</span></h3>
          <p className="text-xs text-rose-600 font-bold mt-1">33.0% Butuh Intervensi</p>
        </Card>
      </div>

      {/* Tabel & Distribusi Kinerja Indikator */}
      <Card className="rounded-3xl p-6 bg-white border-slate-100 shadow-sm space-y-6">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">Statistik dan Kinerja Indikator Indeks Desa</h3>
          <p className="text-xs text-slate-500">Sebaran evaluasi 127 total indikator penilaian Indeks Desa 2025.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 font-bold">Kategori Skor</th>
                <th className="py-3 px-4 font-bold text-center">Jumlah Indikator</th>
                <th className="py-3 px-4 font-bold text-center">Persentase</th>
                <th className="py-3 px-4 font-bold">Interpretasi & Kondisi Lapangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {indicatorStats.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-bold">
                    <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-black border", item.badgeColor)}>
                      {item.score}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-black text-slate-900">{item.count} Indikator</td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-700">{item.percent}%</td>
                  <td className="py-3.5 px-4 text-slate-600">{item.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Visual Progress Breakdown */}
        <div className="space-y-2 pt-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Komposisi Indikator Berdasarkan Skor</p>
          <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex">
            {indicatorStats.map((item, idx) => (
              <div
                key={idx}
                style={{ width: `${item.percent}%`, backgroundColor: item.barColor }}
                title={`${item.score}: ${item.percent}%`}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-4 text-[10px] font-bold text-slate-600 pt-1">
            {indicatorStats.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.barColor }} />
                <span>{item.score.split(' ')[0]} ({item.percent}%)</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Rincian Analisis Sektoral (Pendidikan, Kesehatan, Ekonomi, Infrastruktur, Sosial, Lingkungan, Pemerintahan) */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* 1. Pendidikan & Kesehatan */}
        <Card className="rounded-3xl p-6 bg-white border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b pb-3">
            <div className="h-8 w-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <GraduationCap className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">1. Pendidikan & Kesehatan</h3>
              <p className="text-[10px] text-slate-400">Analisis akses layanan dasar masyarakat</p>
            </div>
          </div>

          <div className="space-y-3 text-xs leading-relaxed text-slate-600">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex justify-between items-center">
                <p className="font-bold text-slate-800">Sektor Pendidikan</p>
                <Badge className="bg-emerald-600 text-white text-[9px] font-bold">Skor 5 (SD/SMP)</Badge>
              </div>
              <p>Desa memiliki akses dan partisipasi sangat baik pada jenjang SD/MI hingga SMP/MTs (skor 5).</p>
              <p className="text-rose-600 font-semibold pt-1">
                ⚠️ Kendala: Akses menuju SMA/SMK/Sederajat sangat sulit (skor 1), dan tidak ada pendidikan non-formal atau pusat kursus yang aktif.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex justify-between items-center">
                <p className="font-bold text-slate-800">Sektor Kesehatan</p>
                <Badge className="bg-emerald-600 text-white text-[9px] font-bold">Skor 5 (Bidan & Posyandu)</Badge>
              </div>
              <p>Akses air minum harian, ketersediaan Bidan, Tenaga Kesehatan lain, serta aktivitas Posyandu berjalan sangat baik (skor 5).</p>
              <p className="text-rose-600 font-semibold pt-1">
                ⚠️ Kendala: Belum tersedianya layanan dokter tetap maupun sarana transportasinya (skor 1).
              </p>
            </div>
          </div>
        </Card>

        {/* 2. Ekonomi & Infrastruktur */}
        <Card className="rounded-3xl p-6 bg-white border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b pb-3">
            <div className="h-8 w-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">2. Ekonomi & Infrastruktur</h3>
              <p className="text-[10px] text-slate-400">Potensi pendapatan & konektivitas wilayah</p>
            </div>
          </div>

          <div className="space-y-3 text-xs leading-relaxed text-slate-600">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex justify-between items-center">
                <p className="font-bold text-slate-800">Kekuatan Ekonomi Desa</p>
                <Badge className="bg-emerald-600 text-white text-[9px] font-bold">Unggulan</Badge>
              </div>
              <p>Terdapat produk unggulan desa dengan merek dagang yang sudah terdaftar dan penjualan ke luar desa.</p>
              <p>BUMDes berbadan hukum beroperasi dengan baik, didukung dengan adanya fasilitas kredit KUR dan sinyal telekomunikasi kuat (4G/5G).</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex justify-between items-center">
                <p className="font-bold text-slate-800">Kendala Infrastruktur</p>
                <Badge className="bg-amber-600 text-white text-[9px] font-bold">Perlu Pembenahan</Badge>
              </div>
              <p>Tidak terdapat pasar desa, perbankan komersial, maupun KUD aktif.</p>
              <p className="text-slate-700">Permukaan jalan desa utamanya aspal/beton (skor 5), namun kualitas jalan mengalami <strong>rusak sedang</strong>. Akses transportasi angkutan umum juga minim beroperasi.</p>
            </div>
          </div>
        </Card>

        {/* 3. Lingkungan Hidup (Sangat Kritis) */}
        <Card className="rounded-3xl p-6 bg-white border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b pb-3">
            <div className="h-8 w-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              <Sprout className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">3. Lingkungan Hidup (Sangat Kritis)</h3>
              <p className="text-[10px] text-rose-500 font-bold">Area prioritas intervensi mendesak</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 text-xs leading-relaxed space-y-2 text-rose-950">
            <p className="font-bold text-rose-900">⚠️ Pengelolaan lingkungan sama sekali belum berjalan:</p>
            <ul className="space-y-1.5 list-disc pl-4 text-rose-900">
              <li>Tidak ada peraturan desa (Perdes) pelestarian lingkungan.</li>
              <li>Belum tersedianya Tempat Penampungan Sampah (TPS) terpadu.</li>
              <li>Belum ada sistem pengolahan limbah cair rumah tangga & peternakan (skor 1).</li>
              <li>Tidak tersedianya fasilitas dan jalur evakuasi mitigasi bencana.</li>
            </ul>
          </div>
        </Card>

        {/* 4. Sosial, Tata Kelola & Pemerintahan */}
        <Card className="rounded-3xl p-6 bg-white border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b pb-3">
            <div className="h-8 w-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">4. Sosial & Tata Kelola Pemerintahan</h3>
              <p className="text-[10px] text-emerald-600 font-bold">Kekuatan modal sosial & administrasi</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-xs leading-relaxed space-y-2 text-emerald-950">
            <p className="font-bold text-emerald-900">✅ Keunggulan Modal Sosial & Tata Kelola:</p>
            <ul className="space-y-1.5 list-disc pl-4 text-emerald-900">
              <li>Sangat unggul dalam penyelesaian konflik warga secara musyawarah & damai.</li>
              <li>Tingginya partisipasi gotong royong warga dan keaktifan ronda Satkamling di seluruh RT.</li>
              <li>Pelayanan administrasi kantor desa berjalan setiap hari kerja secara terbuka.</li>
              <li>Aset desa berhasil diinventarisasi dengan tertib.</li>
              <li>Pendapatan Asli Desa (PADes) mengalami peningkatan yang stabil setiap tahun.</li>
            </ul>
          </div>
        </Card>
      </div>

      {/* Rekomendasi Proyeksi Menjadi Desa "Maju" */}
      <Card className="rounded-3xl p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/20 text-secondary text-[10px] font-black uppercase tracking-widest mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              Rencana Strategis
            </div>
            <h3 className="text-xl font-black font-display tracking-tight text-white">
              Analisis Proyeksi: Area Termudah Ditingkatkan Menuju "Desa Maju"
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Fokus pada *Quick Wins* berbiaya efisien dengan dampak lonjakan skor indikator tertinggi untuk melompat dari status Berkembang ke Maju.
            </p>
          </div>
          <Badge className="bg-emerald-600 text-white text-xs font-black uppercase px-4 py-2 self-start sm:self-auto shrink-0">
            Target 2026: Desa Maju
          </Badge>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {quickWins.map((qw, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/50 transition-colors space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-white">{qw.title}</span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                  {qw.impact}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{qw.desc}</p>
              <div className="pt-1 flex items-center gap-2 text-[10px] text-slate-400 font-semibold">
                <span>Tingkat Kesulitan: <strong className="text-amber-300">{qw.difficulty}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
