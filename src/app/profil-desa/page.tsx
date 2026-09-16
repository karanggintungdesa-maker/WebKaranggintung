'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  User,
  Users,
  History,
  Map as MapIcon,
  Milestone,
  Zap,
  Image as ImageIcon,
  PlayCircle,
  MapPin,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Landmark,
  UserCircle2,
  Calendar,
  Compass,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Activity,
  Heart,
  GraduationCap,
  Stethoscope,
  Fish,
  Sprout,
  Store,
  Beef,
  Target,
  ShieldAlert,
  HeartHandshake
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCollection, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { VillageMap } from '@/components/village-map';

type Official = {
  id: string;
  name: string;
  position: string;
  imageUrl?: string;
  category: 'perangkat' | 'bpd' | 'rtrw' | 'linmas' | 'posyandu';
};

export default function ProfilDesaPage() {
  const [activeTab, setActiveTab] = useState('sambutan');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const firestore = useFirestore();

  // Data for Kenali Kami (Tab 2)
  const officialsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'officials'), orderBy('name', 'asc'));
  }, [firestore]);

  const { data: officials, isLoading: isLoadingOfficials } = useCollection<Official>(officialsQuery);

  // Get news data for Dokumentasi Kegiatan (Tab 7 - Galeri)
  const newsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'news'), orderBy('updatedAt', 'desc'));
  }, [firestore]);

  const { data: newsData, isLoading: isLoadingNews } = useCollection<any>(newsQuery);

  // Get village profile data for video URL
  const profileRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'villageProfile', 'default');
  }, [firestore]);

  const { data: profileData } = useDoc<{ youtubeVideoUrl?: string; kadesPhotoUrl?: string; description?: string }>(profileRef);

  const getYoutubeEmbedUrl = (url: string | undefined) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/);
    const videoId = match ? match[1] : url;
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const youtubeEmbedUrl = getYoutubeEmbedUrl(profileData?.youtubeVideoUrl);

  const processedOfficials = useMemo(() => {
    if (!officials) return { perangkat: [], bpd: [], rtrwGroups: [], linmas: [], posyandu: [] };

    const getPerangkatRank = (pos: string) => {
      const p = pos.toLowerCase();
      if (p.includes('staf') || p.includes('staff')) return 5;
      if (p.includes('kepala desa') || p.includes('kades')) return 1;
      if (p.includes('sekretaris') || p.includes('sekdes')) return 2;
      if (p.includes('kasi') || p.includes('kaur')) return 3;
      if (p.includes('kadus') || p.includes('kepala dusun')) return 4;
      return 6;
    };

    const perangkat = officials
      .filter(o => o.category === 'perangkat')
      .sort((a, b) => getPerangkatRank(a.position) - getPerangkatRank(b.position));

    const bpd = officials
      .filter(o => o.category === 'bpd')
      .sort((a, b) => {
        if (a.position.toLowerCase().includes('ketua') && !b.position.toLowerCase().includes('ketua')) return -1;
        if (!a.position.toLowerCase().includes('ketua') && b.position.toLowerCase().includes('ketua')) return 1;
        return a.name.localeCompare(b.name);
      });

    const rtrwRaw = officials.filter(o => o.category === 'rtrw');
    const rwGroups: Record<string, Official[]> = {};

    rtrwRaw.forEach(item => {
      const rwMatch = item.position.match(/RW\s?(\d+)/i);
      const rwNum = rwMatch ? rwMatch[1].padStart(2, '0') : '99';
      if (!rwGroups[rwNum]) rwGroups[rwNum] = [];
      rwGroups[rwNum].push(item);
    });

    const sortedRwKeys = Object.keys(rwGroups).sort();
    const rtrwGroups = sortedRwKeys.map(key => {
      return {
        rwLabel: `Wilayah RW ${key}`,
        members: rwGroups[key].sort((a, b) => {
          if (a.position.toLowerCase().includes('ketua rw') && !b.position.toLowerCase().includes('ketua rw')) return -1;
          if (!a.position.toLowerCase().includes('ketua rw') && b.position.toLowerCase().includes('ketua rw')) return 1;
          const rtA = a.position.match(/RT\s?(\d+)/i)?.[1] || '0';
          const rtB = b.position.match(/RT\s?(\d+)/i)?.[1] || '0';
          return parseInt(rtA) - parseInt(rtB);
        })
      };
    });

    const linmas = officials
      .filter(o => o.category === 'linmas')
      .sort((a, b) => {
        const getLinmasRank = (pos: string) => {
          const p = pos.toLowerCase();
          if (p.includes('danton') || p.includes('komandan pleton') || p.includes('kepala')) return 1;
          if (p.includes('danru') || p.includes('komandan regu') || p.includes('wakil')) return 2;
          return 3;
        };
        const rankDiff = getLinmasRank(a.position) - getLinmasRank(b.position);
        if (rankDiff !== 0) return rankDiff;
        return a.name.localeCompare(b.name);
      });

    const posyandu = officials
      .filter(o => o.category === 'posyandu')
      .sort((a, b) => {
        const getPosyanduRank = (pos: string) => {
          const p = pos.toLowerCase();
          if (p.includes('ketua') || p.includes('koordinator')) return 1;
          if (p.includes('sekretaris')) return 2;
          if (p.includes('bendahara')) return 3;
          return 4;
        };
        const rankDiff = getPosyanduRank(a.position) - getPosyanduRank(b.position);
        if (rankDiff !== 0) return rankDiff;
        return a.name.localeCompare(b.name);
      });

    return { perangkat, bpd, rtrwGroups, linmas, posyandu };
  }, [officials]);

  const tabs = [
    { id: 'sambutan', label: 'Profil & Sambutan', icon: User },
    { id: 'kenali', label: 'Kenali Kami', icon: Users },
    { id: 'sejarah', label: 'Sejarah Desa', icon: History },
    { id: 'peta', label: 'Peta & Batas', icon: MapIcon },
    { id: 'wilayah', label: 'Data Wilayah', icon: Milestone },
    { id: 'potensi', label: 'Potensi Unggulan', icon: Zap },
    { id: 'galeri', label: 'Galeri Media', icon: ImageIcon },
  ];

  const activeTabObj = tabs.find(t => t.id === activeTab) || tabs[0];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans overflow-x-hidden w-full">
      {/* TOP HEADER */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 h-16 sm:h-20 flex items-center justify-between">
          <Logo />
          <Link href="/">
            <Button variant="ghost" className="font-bold gap-1.5 text-primary hover:bg-slate-100 rounded-xl h-8 px-2.5 sm:h-10 sm:px-4 text-xs sm:text-sm">
              <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Beranda</span>
            </Button>
          </Link>
        </div>
      </header>

      <div className="flex-1 container mx-auto px-2.5 sm:px-4 py-4 sm:py-6 md:py-12 max-w-7xl">
        <div className="grid lg:grid-cols-12 gap-5 lg:gap-10 items-start">

          {/* SIDEBAR NAVIGATION (Desktop) / TOP FULL-SCREEN GRID (Mobile - Tidak Perlu Menggeser) */}
          <aside className="lg:col-span-3 lg:sticky lg:top-28 z-40">
            {/* Desktop Navigation List */}
            <div className="hidden lg:flex bg-white rounded-[2.5rem] p-4 border shadow-sm flex-col gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={cn(
                    "flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 whitespace-nowrap w-full group text-left",
                    activeTab === tab.id
                      ? "bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]"
                      : "text-slate-500 hover:bg-slate-50 hover:text-primary"
                  )}
                >
                  <tab.icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", activeTab === tab.id ? "text-white" : "text-slate-400")} />
                  <span className="font-black uppercase text-[10px] tracking-widest">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Mobile Navigation: Grid Penuh 1 Layar (Semua Tab Terlihat Tanpa Perlu Menggeser) */}
            <div className="block lg:hidden w-full mb-4">
              <div className="grid grid-cols-12 gap-1 p-1 bg-white rounded-xl border border-slate-200/90 shadow-xs w-full">
                {/* Baris 1: 4 Tab (Sambutan, Kenali, Sejarah, Peta) */}
                {tabs.slice(0, 4).map((tab) => {
                  const isCurrent = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={cn(
                        "col-span-3 flex flex-col items-center justify-center py-2 px-0.5 rounded-lg text-center transition-all",
                        isCurrent
                          ? "bg-primary text-white shadow-xs font-black"
                          : "text-slate-600 hover:bg-slate-50 hover:text-primary font-bold"
                      )}
                    >
                      <tab.icon className={cn("h-3.5 w-3.5 mb-0.5 shrink-0", isCurrent ? "text-white" : "text-slate-400")} />
                      <span className="text-[8px] min-[380px]:text-[9px] uppercase tracking-tight truncate w-full">
                        {tab.id === 'sambutan' ? 'Profil' : tab.id === 'kenali' ? 'Kenali' : tab.id === 'sejarah' ? 'Sejarah' : 'Peta'}
                      </span>
                    </button>
                  );
                })}
                {/* Baris 2: 3 Tab (Wilayah, Potensi, Galeri) */}
                {tabs.slice(4, 7).map((tab) => {
                  const isCurrent = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={cn(
                        "col-span-4 flex flex-col items-center justify-center py-2 px-1 rounded-lg text-center transition-all",
                        isCurrent
                          ? "bg-primary text-white shadow-xs font-black"
                          : "text-slate-600 hover:bg-slate-50 hover:text-primary font-bold"
                      )}
                    >
                      <tab.icon className={cn("h-3.5 w-3.5 mb-0.5 shrink-0", isCurrent ? "text-white" : "text-slate-400")} />
                      <span className="text-[8px] min-[380px]:text-[9px] uppercase tracking-tight truncate w-full">
                        {tab.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="hidden lg:block mt-8 p-8 bg-slate-900 rounded-[3rem] text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10"><ShieldCheck className="w-24 h-24" /></div>
              <div className="relative z-10 space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary">Akses Cepat</p>
                <h4 className="text-xl font-display font-semibold italic">Butuh bantuan administrasi?</h4>
                <Link href="/layanan-surat/">
                  <Button className="bg-secondary text-white font-black uppercase text-[10px] tracking-widest w-full h-12 rounded-xl mt-4">
                    Buka Layanan Surat
                  </Button>
                </Link>
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT AREA */}
          <main className="lg:col-span-9 space-y-6 sm:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full min-w-0">
            {activeTab === 'sambutan' && <SambutanTab kadesPhotoUrl={profileData?.kadesPhotoUrl} customDesc={profileData?.description} />}
            {activeTab === 'kenali' && <KenaliTab data={processedOfficials} isLoading={isLoadingOfficials} />}
            {activeTab === 'sejarah' && <SejarahTab />}
            {activeTab === 'peta' && <PetaTab />}
            {activeTab === 'wilayah' && <WilayahTab />}
            {activeTab === 'potensi' && <PotensiTab />}
            {activeTab === 'galeri' && <GaleriTab youtubeEmbedUrl={youtubeEmbedUrl} newsData={newsData} isLoadingNews={isLoadingNews} />}
          </main>
        </div>
      </div>

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

// --- TAB COMPONENTS ---

function SambutanTab({ kadesPhotoUrl, customDesc }: { kadesPhotoUrl?: string; customDesc?: string }) {
  const imageUrl = kadesPhotoUrl || "https://picsum.photos/seed/kades/600/800";
  return (
    <div className="space-y-6 sm:space-y-12">
      <div className="grid md:grid-cols-12 gap-4 sm:gap-8 items-stretch">
        <div className="md:col-span-4 lg:col-span-4">
          <Card className="rounded-2xl sm:rounded-3xl md:rounded-[3rem] overflow-hidden border-none shadow-md sm:shadow-xl bg-white md:sticky md:top-28">
            <div className="aspect-[4/3] sm:aspect-[3/4] relative bg-slate-100">
              <img
                src={imageUrl}
                alt="Kepala Desa Karanggintung"
                className="w-full h-full object-cover object-top sm:object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent" />
            </div>
            <div className="p-3.5 sm:p-6 md:p-8 text-center bg-primary text-white">
              <h3 className="text-base sm:text-xl font-black uppercase tracking-tight font-display italic">TURMONO</h3>
              <p className="text-[8.5px] sm:text-[10px] font-bold text-white/90 uppercase tracking-[0.2em] sm:tracking-[0.3em] mt-0.5 sm:mt-1">Kepala Desa Karanggintung</p>
            </div>
          </Card>
        </div>
        <div className="md:col-span-8 lg:col-span-8 bg-white p-4 sm:p-6 md:p-14 rounded-2xl sm:rounded-3xl md:rounded-[4rem] border shadow-xs sm:shadow-sm space-y-4 sm:space-y-8">
          <div className="space-y-2 sm:space-y-4">
            <Badge className="bg-emerald-50 text-emerald-700 font-black uppercase text-[8px] sm:text-[10px] tracking-widest px-2.5 sm:px-4 py-1 sm:py-1.5 border-none shadow-xs">
              Profil Resmi Desa Karanggintung
            </Badge>
            <h2 className="text-xl sm:text-3xl md:text-5xl font-black text-slate-900 leading-tight uppercase font-display italic tracking-tight">
              Tentang <span className="text-primary not-italic">Desa Karanggintung</span>
            </h2>
            <p className="text-[10px] sm:text-xs md:text-sm font-bold text-slate-400 uppercase tracking-wider sm:tracking-widest">
              Kecamatan Gandrungmangu, Kabupaten Cilacap, Provinsi Jawa Tengah
            </p>
          </div>
          <div className="prose prose-slate max-w-none space-y-2.5 sm:space-y-4 text-slate-700 text-xs sm:text-base leading-relaxed">
            <p className="text-xs sm:text-base leading-relaxed text-slate-600 font-medium italic border-l-3 md:border-l-8 border-secondary pl-3 md:pl-6 py-1 md:py-2">
              "Desa Karanggintung merupakan salah satu desa yang berada di wilayah Kecamatan Gandrungmangu, Kabupaten Cilacap, Provinsi Jawa Tengah. Desa Karanggintung memiliki karakter wilayah pedesaan dengan kehidupan masyarakat yang masih menjunjung tinggi nilai gotong royong, kebersamaan, kehidupan sosial, keagamaan, serta memiliki potensi di bidang pertanian dan berbagai kegiatan ekonomi masyarakat."
            </p>
            <p>
              Sebagai bagian dari Kecamatan Gandrungmangu, Desa Karanggintung terus mengalami perkembangan dalam berbagai bidang. Pembangunan desa diarahkan untuk meningkatkan kualitas pelayanan kepada masyarakat, mengembangkan potensi lokal, memperkuat perekonomian masyarakat, serta menciptakan tata kelola pemerintahan desa yang transparan, akuntabel dan berorientasi pada kepentingan masyarakat.
            </p>
            <p>
              Dengan dukungan masyarakat dan berbagai potensi yang dimiliki, Desa Karanggintung terus berupaya menjadi desa yang maju, mandiri, sejahtera dan berkelanjutan.
            </p>
          </div>
          <div className="pt-2 sm:pt-4 flex flex-wrap gap-1.5 sm:gap-4">
            {["Gotong Royong", "Kebersamaan", "Religius", "Pertanian Maju", "Tata Kelola Transparan", "Pelayanan Prima"].map(tag => (
              <div key={tag} className="flex items-center gap-1.5 px-2.5 sm:px-5 py-1 sm:py-2 bg-slate-50 border rounded-full text-[8px] min-[380px]:text-[9px] sm:text-[10px] font-black uppercase tracking-wider sm:tracking-widest text-primary">
                <CheckCircle2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-secondary shrink-0" /> {tag}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5 PILAR IDENTITAS DESA KARANGGINTUNG (2 KOLOM DI MOBILE) */}
      <div className="bg-white p-4 sm:p-8 md:p-14 rounded-2xl sm:rounded-3xl md:rounded-[4rem] border shadow-xs sm:shadow-sm space-y-4 sm:space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-1.5 sm:space-y-3">
          <Badge className="bg-emerald-50 text-emerald-700 font-black uppercase text-[8px] sm:text-[10px] tracking-widest px-2.5 sm:px-4 py-1 sm:py-1.5 border-none shadow-xs">
            Karakteristik & Nilai Luhur
          </Badge>
          <h3 className="text-xl sm:text-3xl md:text-4xl font-black text-slate-900 uppercase font-display italic">
            Identitas <span className="text-primary not-italic">Desa Karanggintung</span>
          </h3>
          <p className="text-slate-500 font-medium text-[11px] sm:text-sm">Pilar fundamental yang membentuk jati diri dan arah kemajuan Desa Karanggintung</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6">
          {[
            {
              title: 'Sejarah',
              desc: 'Berakar dari kisah pohon gintung yang menjadi penanda wilayah pada masa awal terbentuknya permukiman.',
              icon: History,
              color: 'text-emerald-700 bg-emerald-50 border-emerald-100'
            },
            {
              title: 'Kebersamaan',
              desc: 'Gotong royong dan kepedulian masyarakat menjadi kekuatan utama dalam membangun desa.',
              icon: Heart,
              color: 'text-rose-700 bg-rose-50 border-rose-100'
            },
            {
              title: 'Pertanian',
              desc: 'Potensi pertanian menjadi salah satu bagian penting dalam kehidupan dan perekonomian masyarakat.',
              icon: Sprout,
              color: 'text-teal-700 bg-teal-50 border-teal-100'
            },
            {
              title: 'SDM Unggul',
              desc: 'Masyarakat menjadi kekuatan utama dalam menggerakkan pembangunan dan kemajuan desa.',
              icon: Users,
              color: 'text-amber-700 bg-amber-50 border-amber-100'
            },
            {
              title: 'Inovasi',
              desc: 'Pemanfaatan teknologi dan keterbukaan terhadap perubahan menjadi langkah menuju masa depan.',
              icon: Zap,
              color: 'text-blue-700 bg-blue-50 border-blue-100'
            },
            {
              title: 'Tata Kelola',
              desc: 'Pemerintahan desa melayani dengan prinsip transparansi, akuntabilitas, dan efisiensi prima.',
              icon: ShieldCheck,
              color: 'text-indigo-700 bg-indigo-50 border-indigo-100'
            },
          ].map((item, i) => (
            <Card key={i} className="rounded-xl sm:rounded-3xl border border-slate-100 shadow-xs hover:shadow-xl transition-all duration-300 p-2.5 min-[380px]:p-3 sm:p-6 space-y-1.5 sm:space-y-4 group">
              <div className={cn("w-7 h-7 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shrink-0", item.color)}>
                <item.icon className="h-3.5 w-3.5 sm:h-6 sm:w-6" />
              </div>
              <div className="space-y-0.5 sm:space-y-1.5">
                <h4 className="text-[11px] sm:text-lg font-black uppercase tracking-tight text-slate-800 font-display line-clamp-1 sm:line-clamp-none">{item.title}</h4>
                <p className="text-[9.5px] sm:text-xs text-slate-600 leading-relaxed font-medium line-clamp-3 sm:line-clamp-none">{item.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* ARAH PEMBANGUNAN & PRINSIP TATA KELOLA (2 KOLOM DI MOBILE) */}
      <div className="bg-gradient-to-br from-primary to-slate-900 p-4 sm:p-8 md:p-14 rounded-2xl sm:rounded-3xl md:rounded-[4rem] text-white shadow-xl space-y-4 sm:space-y-8">
        <div className="max-w-3xl space-y-1.5 sm:space-y-3">
          <Badge className="bg-white/10 text-secondary border-white/10 font-black uppercase text-[8px] sm:text-[10px] tracking-widest px-2.5 sm:px-4 py-1 sm:py-1.5">
            Komitmen Pelayanan Publik
          </Badge>
          <h3 className="text-xl sm:text-3xl md:text-4xl font-black uppercase font-display italic">
            Prinsip Tata Kelola <span className="text-secondary not-italic">Pemerintahan Desa</span>
          </h3>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-medium">
            Pemerintah Desa Karanggintung berkomitmen mewujudkan pemerintahan bersih dan berdaya guna tinggi:
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
          {[
            { label: 'Transparansi', desc: 'Keterbukaan informasi dan anggaran kepada publik.' },
            { label: 'Akuntabilitas', desc: 'Setiap kebijakan dapat dipertanggungjawabkan.' },
            { label: 'Partisipasi Warga', desc: 'Melibatkan warga dalam perencanaan pembangunan.' },
            { label: 'Efektivitas', desc: 'Pencapaian target kerja yang berdaya guna nyata.' },
            { label: 'Efisiensi', desc: 'Pemanfaatan sumber daya desa secara tepat guna.' },
            { label: 'Layanan Cepat', desc: 'Birokrasi ramah warga berbasis teknologi digital.' },
          ].map((principle, i) => (
            <div key={i} className="p-2.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 space-y-1 hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-1.5 text-secondary font-black text-[9px] min-[380px]:text-[10px] sm:text-xs uppercase tracking-wider">
                <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                <span className="truncate">{principle.label}</span>
              </div>
              <p className="text-[8.5px] sm:text-xs text-slate-300 font-medium pl-4 sm:pl-6 line-clamp-2 sm:line-clamp-none">{principle.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KenaliTab({ data, isLoading }: { data: any, isLoading: boolean }) {
  const [subTab, setSubTab] = useState('perangkat');

  const subCategories = [
    { id: 'perangkat', label: 'Perangkat Desa', icon: UserCircle2, count: data.perangkat?.length || 0 },
    { id: 'bpd', label: 'BPD Desa', icon: ShieldCheck, count: data.bpd?.length || 0 },
    { id: 'rtrw', label: 'RT / RW', icon: Landmark, count: data.rtrwGroups?.reduce((acc: number, g: any) => acc + (g.members?.length || 0), 0) || 0 },
    { id: 'posyandu', label: 'Kader Posyandu', icon: HeartHandshake, count: data.posyandu?.length || 0 },
    { id: 'linmas', label: 'Linmas Desa', icon: ShieldAlert, count: data.linmas?.length || 0 },
  ];

  return (
    <div className="space-y-6 sm:space-y-10">
      <div className="space-y-2 sm:space-y-3">
        <Badge className="bg-primary/10 text-primary font-black uppercase text-[9px] sm:text-[10px] tracking-widest px-3 sm:px-4 py-1 sm:py-1.5 border-none shadow-xs">
          Aparatur & Kelembagaan
        </Badge>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 uppercase font-display italic">
          Struktur <span className="text-primary not-italic">Pemerintahan</span>
        </h2>
        <p className="text-slate-500 font-medium text-xs sm:text-sm md:text-base border-l-4 border-secondary pl-3 sm:pl-4 uppercase tracking-tight">
          Mengenal Pelayan Masyarakat & Lembaga Desa Karanggintung
        </p>
      </div>

      <Tabs value={subTab} onValueChange={setSubTab} className="w-full space-y-5 sm:space-y-8">
        {/* SUB-TABS NAVIGATION (Full screen no scroll on mobile) */}
        <div className="w-full">
          <TabsList className="bg-slate-100/90 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl h-auto grid grid-cols-6 sm:flex sm:flex-wrap items-center justify-center border border-slate-200/80 gap-1 sm:gap-1.5 w-full">
            {subCategories.map((cat, idx) => {
              const colSpan = idx < 3 ? "col-span-2 sm:col-auto" : "col-span-3 sm:col-auto";
              return (
                <TabsTrigger
                  key={cat.id}
                  value={cat.id}
                  className={cn(
                    "rounded-lg sm:rounded-xl px-1 sm:px-4 md:px-5 py-1.5 sm:py-2.5 font-black uppercase text-[8px] min-[380px]:text-[9px] sm:text-[11px] tracking-wider transition-all gap-1 sm:gap-2 flex items-center justify-center data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md",
                    colSpan
                  )}
                >
                  <cat.icon className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                  <span className="truncate">{cat.label}</span>
                  {!isLoading && cat.count > 0 && (
                    <span className={cn(
                      "ml-0.5 px-1 py-0.2 rounded-full text-[7.5px] sm:text-[9px] font-black shrink-0",
                      subTab === cat.id ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                    )}>
                      {cat.count}
                    </span>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {/* TAB 1: PERANGKAT DESA (3 KARTU PER BARIS DI MOBILE) */}
        <TabsContent value="perangkat" className="space-y-5 sm:space-y-8 focus-visible:outline-none animate-in fade-in-50 duration-300">
          <div className="flex items-center gap-2.5 sm:gap-4">
            <div className="p-2 sm:p-3 bg-primary text-white rounded-xl sm:rounded-2xl shadow-md">
              <UserCircle2 className="h-4 w-4 sm:h-6 sm:w-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-xl md:text-2xl font-black uppercase tracking-tight text-slate-800">Perangkat Desa</h3>
              <p className="text-[10px] sm:text-xs text-slate-500 font-semibold">Pemerintah Desa Karanggintung</p>
            </div>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-2 min-[380px]:gap-2.5 md:gap-8">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-xl sm:rounded-2xl md:rounded-[2.5rem]" />)}
            </div>
          ) : data.perangkat?.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-2 min-[380px]:gap-2.5 md:gap-8">
              {data.perangkat.map((o: Official) => <OfficialCard key={o.id} official={o} />)}
            </div>
          ) : (
            <div className="p-8 sm:p-12 text-center bg-white rounded-2xl sm:rounded-3xl border border-dashed border-slate-200">
              <UserCircle2 className="h-8 w-8 sm:h-12 sm:w-12 text-slate-300 mx-auto mb-2 sm:mb-3" />
              <p className="text-xs sm:text-sm text-slate-500 font-medium">Data Perangkat Desa belum ditambahkan.</p>
            </div>
          )}
        </TabsContent>

        {/* TAB 2: BPD DESA (3 KARTU PER BARIS DI MOBILE) */}
        <TabsContent value="bpd" className="space-y-5 sm:space-y-8 focus-visible:outline-none animate-in fade-in-50 duration-300">
          <div className="flex items-center gap-2.5 sm:gap-4">
            <div className="p-2 sm:p-3 bg-secondary text-white rounded-xl sm:rounded-2xl shadow-md">
              <ShieldCheck className="h-4 w-4 sm:h-6 sm:w-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-xl md:text-2xl font-black uppercase tracking-tight text-slate-800">Badan Permusyawaratan Desa (BPD)</h3>
              <p className="text-[10px] sm:text-xs text-slate-500 font-semibold">Lembaga Permusyawaratan & Pengawasan Desa</p>
            </div>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-2 min-[380px]:gap-2.5 md:gap-8">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-xl sm:rounded-2xl md:rounded-[2.5rem]" />)}
            </div>
          ) : data.bpd?.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-2 min-[380px]:gap-2.5 md:gap-8">
              {data.bpd.map((o: Official) => <OfficialCard key={o.id} official={o} />)}
            </div>
          ) : (
            <div className="p-8 sm:p-12 text-center bg-white rounded-2xl sm:rounded-3xl border border-dashed border-slate-200">
              <ShieldCheck className="h-8 w-8 sm:h-12 sm:w-12 text-slate-300 mx-auto mb-2 sm:mb-3" />
              <p className="text-xs sm:text-sm text-slate-500 font-medium">Data BPD Desa belum ditambahkan.</p>
            </div>
          )}
        </TabsContent>

        {/* TAB 3: RT / RW (3 KARTU PER BARIS DI MOBILE) */}
        <TabsContent value="rtrw" className="space-y-5 sm:space-y-8 focus-visible:outline-none animate-in fade-in-50 duration-300">
          <div className="flex items-center gap-2.5 sm:gap-4">
            <div className="p-2 sm:p-3 bg-slate-900 text-white rounded-xl sm:rounded-2xl shadow-md">
              <Landmark className="h-4 w-4 sm:h-6 sm:w-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-xl md:text-2xl font-black uppercase tracking-tight text-slate-800">Lembaga Kemasyarakatan (RT / RW)</h3>
              <p className="text-[10px] sm:text-xs text-slate-500 font-semibold">Pengurus Rukun Warga dan Rukun Tetangga</p>
            </div>
          </div>
          {isLoading ? (
            <div className="space-y-4 sm:space-y-6">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-36 sm:h-48 w-full rounded-2xl sm:rounded-3xl" />)}
            </div>
          ) : data.rtrwGroups?.length > 0 ? (
            <div className="space-y-6 sm:space-y-10 md:space-y-14">
              {data.rtrwGroups.map((group: any, i: number) => (
                <div key={i} className="space-y-3 sm:space-y-6 p-3.5 sm:p-6 md:p-8 bg-white rounded-2xl md:rounded-[2.5rem] border border-slate-100 shadow-xs sm:shadow-sm">
                  <div className="flex items-center gap-2.5 sm:gap-4">
                    <div className="h-px flex-1 bg-slate-100" />
                    <Badge className="bg-slate-100 text-slate-600 font-black uppercase text-[8px] min-[380px]:text-[9px] md:text-[10px] tracking-[0.15em] md:tracking-[0.3em] px-3 sm:px-6 py-1 sm:py-1.5 rounded-full border border-slate-200">
                      {group.rwLabel}
                    </Badge>
                    <div className="h-px flex-1 bg-slate-100" />
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 min-[380px]:gap-2.5 md:gap-6">
                    {group.members.map((o: Official) => <OfficialCard key={o.id} official={o} isSmall />)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 sm:p-12 text-center bg-white rounded-2xl sm:rounded-3xl border border-dashed border-slate-200">
              <Landmark className="h-8 w-8 sm:h-12 sm:w-12 text-slate-300 mx-auto mb-2 sm:mb-3" />
              <p className="text-xs sm:text-sm text-slate-500 font-medium">Data RT / RW belum ditambahkan.</p>
            </div>
          )}
        </TabsContent>

        {/* TAB 4: KADER POSYANDU (3 KARTU PER BARIS DI MOBILE) */}
        <TabsContent value="posyandu" className="space-y-5 sm:space-y-8 focus-visible:outline-none animate-in fade-in-50 duration-300">
          <div className="flex items-center gap-2.5 sm:gap-4">
            <div className="p-2 sm:p-3 bg-rose-600 text-white rounded-xl sm:rounded-2xl shadow-md">
              <HeartHandshake className="h-4 w-4 sm:h-6 sm:w-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-xl md:text-2xl font-black uppercase tracking-tight text-slate-800">Kader Posyandu Desa</h3>
              <p className="text-[10px] sm:text-xs text-slate-500 font-semibold">Kader Pelayanan Kesehatan & Posyandu Desa Karanggintung</p>
            </div>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-2 min-[380px]:gap-2.5 md:gap-8">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-xl sm:rounded-2xl md:rounded-[2.5rem]" />)}
            </div>
          ) : data.posyandu?.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-2 min-[380px]:gap-2.5 md:gap-8">
              {data.posyandu.map((o: Official) => <OfficialCard key={o.id} official={o} />)}
            </div>
          ) : (
            <div className="p-8 sm:p-12 text-center bg-white rounded-2xl sm:rounded-3xl border border-dashed border-slate-200">
              <HeartHandshake className="h-8 w-8 sm:h-12 sm:w-12 text-slate-300 mx-auto mb-2 sm:mb-3" />
              <p className="text-xs sm:text-sm text-slate-500 font-medium">Data Kader Posyandu belum ditambahkan.</p>
            </div>
          )}
        </TabsContent>

        {/* TAB 5: LINMAS DESA (3 KARTU PER BARIS DI MOBILE) */}
        <TabsContent value="linmas" className="space-y-5 sm:space-y-8 focus-visible:outline-none animate-in fade-in-50 duration-300">
          <div className="flex items-center gap-2.5 sm:gap-4">
            <div className="p-2 sm:p-3 bg-amber-600 text-white rounded-xl sm:rounded-2xl shadow-md">
              <ShieldAlert className="h-4 w-4 sm:h-6 sm:w-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-xl md:text-2xl font-black uppercase tracking-tight text-slate-800">Satuan Linmas (Satlinmas)</h3>
              <p className="text-[10px] sm:text-xs text-slate-500 font-semibold">Satuan Perlindungan Masyarakat Desa Karanggintung</p>
            </div>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-2 min-[380px]:gap-2.5 md:gap-8">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-xl sm:rounded-2xl md:rounded-[2.5rem]" />)}
            </div>
          ) : data.linmas?.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-2 min-[380px]:gap-2.5 md:gap-8">
              {data.linmas.map((o: Official) => <OfficialCard key={o.id} official={o} />)}
            </div>
          ) : (
            <div className="p-8 sm:p-12 text-center bg-white rounded-2xl sm:rounded-3xl border border-dashed border-slate-200">
              <ShieldAlert className="h-8 w-8 sm:h-12 sm:w-12 text-slate-300 mx-auto mb-2 sm:mb-3" />
              <p className="text-xs sm:text-sm text-slate-500 font-medium">Data Satuan Linmas belum ditambahkan.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SejarahTab() {
  const historyTimeline = [
    {
      period: 'Masa Awal',
      title: 'Kawasan Hutan & Penanda Pohon Gintung',
      desc: 'Wilayah Karanggintung pada masa awal merupakan kawasan yang masih berupa hutan dan belum banyak dihuni. Di kawasan ini tumbuh sebuah pohon gintung berukuran sangat besar dan menjulang tinggi hingga terlihat dari wilayah Bantarsari, menjadi penanda alam (landmark) bagi masyarakat sekitar.',
      icon: Sprout
    },
    {
      period: 'Asal-Usul Nama',
      title: 'Terbentuknya Permukiman & Nama Karanggintung',
      desc: 'Seiring berjalannya waktu, kawasan di sekitar pohon gintung berkembang menjadi tempat tinggal dan permukiman masyarakat. Ciri khas pohon tersebut melahirkan nama "Karanggintung" (Karang = kawasan/pekarangan, Gintung = pohon gintung penanda wilayah).',
      icon: Landmark
    },
    {
      period: 'Perkembangan Desa',
      title: 'Pembangunan Sosial, Keagamaan & Pembagian Wilayah',
      desc: 'Secara bertahap masyarakat Karanggintung membangun kehidupan sosial, ekonomi, pendidikan diniyah, dan keagamaan. Permukiman semakin luas dan terorganisasi hingga terbentuk wilayah desa dengan pembagian administratif teratur: 5 Dusun, 6 RW, dan 51 RT.',
      icon: Users
    },
    {
      period: 'Karanggintung Hari Ini',
      title: 'Desa Maju, Mandiri & Berkelanjutan',
      desc: 'Kini Desa Karanggintung telah berkembang menjadi desa dengan 9.746 jiwa penduduk, infrastruktur modern, lembaga pendidikan terpadu, dan keterbukaan terhadap inovasi teknologi informasi dalam pelayanan publik.',
      icon: TrendingUp
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-16 max-w-4xl mx-auto">
      <div className="text-center space-y-1.5 sm:space-y-4">
        <Badge className="bg-emerald-50 text-emerald-700 font-black uppercase text-[8px] sm:text-[10px] tracking-widest px-2.5 sm:px-4 py-1 sm:py-1.5 border-none shadow-xs">
          Sejarah & Filosofi Desa
        </Badge>
        <h2 className="text-xl sm:text-3xl md:text-5xl font-black text-slate-900 uppercase font-display italic tracking-tight">
          Menelusuri Jejak Berdirinya <span className="text-primary not-italic">Desa Karanggintung</span>
        </h2>
        <p className="text-slate-500 font-bold uppercase text-[8.5px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.4em]">Kecamatan Gandrungmangu, Kabupaten Cilacap</p>
      </div>

      {/* Rincian Sejarah Narrative Card */}
      <Card className="rounded-2xl sm:rounded-3xl md:rounded-[3rem] border-none shadow-xs sm:shadow-sm bg-white p-4 sm:p-8 md:p-14 space-y-4 sm:space-y-8">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[9px] sm:text-xs font-bold uppercase tracking-wider text-emerald-700">
          <History className="h-3.5 w-3.5" /> Narasi Sejarah Desa
        </div>
        <div className="prose prose-slate max-w-none text-slate-700 space-y-2.5 sm:space-y-5 text-xs sm:text-base leading-relaxed">
          <p>
            Sejarah Desa Karanggintung merupakan bagian dari perjalanan panjang masyarakat dalam membuka kawasan permukiman dan membangun kehidupan bersama. Berdasarkan cerita dan riwayat yang berkembang di masyarakat, wilayah Karanggintung pada masa awal merupakan kawasan yang masih berupa hutan dan belum banyak dihuni oleh masyarakat.
          </p>
          <p>
            Pada masa tersebut, di kawasan ini tumbuh sebuah <strong>pohon gintung yang berukuran sangat besar dan menjulang tinggi</strong>. Keberadaan pohon tersebut menjadi salah satu penanda wilayah bagi masyarakat sekitar. Pohon gintung yang tinggi bahkan disebut dapat terlihat dari wilayah Bantarsari.
          </p>
          <p>
            Seiring berjalannya waktu, kawasan di sekitar pohon tersebut mulai berkembang menjadi tempat tinggal dan permukiman masyarakat. Keberadaan pohon gintung yang menjadi ciri khas wilayah tersebut kemudian dipercaya memiliki hubungan dengan munculnya nama <strong>Karanggintung</strong>.
          </p>
          <p>
            Nama Karanggintung selanjutnya melekat sebagai nama wilayah dan terus digunakan oleh masyarakat hingga berkembang menjadi sebuah desa. Dalam perjalanan sejarahnya, masyarakat Karanggintung secara bertahap membangun kehidupan sosial, ekonomi, keagamaan dan pemerintahan desa. Permukiman yang semula berkembang dari kelompok-kelompok masyarakat kemudian semakin luas dan terorganisasi hingga terbentuk wilayah desa dengan pembagian administratif yang lebih teratur.
          </p>
          <p>
            Perjalanan tersebut menjadikan Desa Karanggintung sebagai sebuah desa yang memiliki sejarah dan identitas lokal yang kuat serta terus berkembang mengikuti perubahan zaman.
          </p>
        </div>

        {/* ASAL USUL DAN FILOSOFI NAMA (2 KOLOM DI MOBILE) */}
        <div className="pt-4 sm:pt-8 border-t border-slate-100 space-y-3 sm:space-y-6">
          <h3 className="text-base sm:text-2xl font-black text-slate-900 uppercase font-display italic">
            Asal-Usul dan Filosofi Nama <span className="text-primary not-italic">Karanggintung</span>
          </h3>
          <p className="text-slate-600 text-xs sm:text-base leading-relaxed">
            Nama <strong>"Karanggintung"</strong> dipercaya memiliki keterkaitan dengan kondisi wilayah pada masa awal terbentuknya permukiman:
          </p>

          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            <div className="p-3 sm:p-6 rounded-xl sm:rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-1 sm:space-y-2">
              <span className="text-[9px] sm:text-xs font-black uppercase text-emerald-800 tracking-wider">Karang</span>
              <p className="text-[10.5px] sm:text-sm font-bold text-slate-800 leading-snug">
                Merujuk pada suatu kawasan, tempat, atau pekarangan hunian warga.
              </p>
            </div>
            <div className="p-3 sm:p-6 rounded-xl sm:rounded-2xl bg-teal-50/70 border border-teal-100 space-y-1 sm:space-y-2">
              <span className="text-[9px] sm:text-xs font-black uppercase text-teal-800 tracking-wider">Gintung</span>
              <p className="text-[10.5px] sm:text-sm font-bold text-slate-800 leading-snug">
                Pohon gintung raksasa yang dahulu menjadi ciri khas dan penanda wilayah.
              </p>
            </div>
          </div>

          <div className="p-3.5 sm:p-6 rounded-xl sm:rounded-2xl bg-slate-900 text-white space-y-2 sm:space-y-3 shadow-md sm:shadow-lg">
            <p className="text-[9px] sm:text-xs font-bold text-secondary uppercase tracking-widest">Makna Filosofis</p>
            <p className="text-xs sm:text-base text-slate-200 leading-relaxed font-medium italic">
              "Pohon gintung dalam kisah asal-usul desa tidak hanya menjadi bagian dari sejarah nama, tetapi juga dimaknai sebagai simbol akar sejarah masyarakat Karanggintung. Dari sebuah penanda alam, berkembang sebuah permukiman. Dari permukiman berkembang sebuah masyarakat. Dan dari masyarakat tersebut tumbuh sebuah desa yang terus bergerak maju dari generasi ke generasi."
            </p>
            <p className="text-xs sm:text-sm font-black text-white pt-1.5 sm:pt-2 border-t border-white/10">
              Karanggintung adalah desa yang tumbuh dari sejarah, dibangun dengan kebersamaan, dan terus melangkah menuju masa depan.
            </p>
          </div>
        </div>
      </Card>

      {/* TIMELINE JEJAK HISTORIS */}
      <div className="space-y-4 sm:space-y-6">
        <h3 className="text-lg sm:text-2xl font-black text-slate-900 uppercase font-display italic text-center">
          Tahapan <span className="text-primary not-italic">Perkembangan Desa</span>
        </h3>

        <div className="relative space-y-4 sm:space-y-8">
          {/* Vertical Line */}
          <div className="absolute left-3 sm:left-4 md:left-1/2 top-0 bottom-0 w-1 bg-primary/10 -translate-x-1/2" />

          {historyTimeline.map((event, i) => (
            <div key={i} className={cn(
              "relative flex items-center gap-4 sm:gap-10",
              i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
            )}>
              {/* Timeline Dot */}
              <div className="absolute left-3 sm:left-4 md:left-1/2 -translate-x-1/2 w-7 h-7 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-primary border-2 sm:border-4 border-white shadow-md sm:shadow-xl flex items-center justify-center z-10">
                <event.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
              </div>

              {/* Content Side */}
              <div className="flex-1 pl-8 sm:pl-12 md:pl-0">
                <Card className={cn(
                  "rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] border-none shadow-xs sm:shadow-sm hover:shadow-2xl transition-all duration-500 bg-white group overflow-hidden",
                  i % 2 === 0 ? "md:mr-12" : "md:ml-12"
                )}>
                  <div className={cn("h-1.5 sm:h-2 w-full", i % 2 === 0 ? "bg-primary" : "bg-secondary")} />
                  <CardContent className="p-3.5 sm:p-6 md:p-8 space-y-1.5 sm:space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[8.5px] sm:text-[10px] font-black text-primary uppercase tracking-wider sm:tracking-widest">{event.period}</span>
                      <Calendar className="h-3.5 w-3.5 text-slate-300" />
                    </div>
                    <h4 className="text-xs min-[380px]:text-sm sm:text-xl font-black uppercase text-slate-900 italic tracking-tight">{event.title}</h4>
                    <p className="text-slate-600 text-[10px] sm:text-xs md:text-sm leading-relaxed font-medium">
                      {event.desc}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Empty Side (For desktop symmetry) */}
              <div className="hidden md:flex flex-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PetaTab() {
  return (
    <div className="grid lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-10">
      <div className="lg:col-span-8 space-y-4 sm:space-y-6">
        <Card className="rounded-2xl sm:rounded-3xl md:rounded-[3rem] overflow-hidden border-none shadow-md sm:shadow-xl h-[260px] sm:h-[450px] md:h-[550px] relative group">
          <VillageMap />
          <div className="absolute top-3 sm:top-4 md:top-8 left-3 sm:left-4 md:left-8 pointer-events-none z-10">
            <Badge className="bg-primary text-white font-black uppercase text-[7.5px] min-[380px]:text-[8.5px] md:text-[10px] tracking-wider md:tracking-widest px-2.5 sm:px-4 md:px-6 py-1 sm:py-1.5 md:py-2 rounded-full border-none shadow-xl">
              Peta Interaktif Desa Karanggintung
            </Badge>
          </div>
        </Card>

        {/* Titik Koordinat & Ringkasan Jarak (3 Kolom Compact di Mobile) */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-4">
          <div className="p-2 min-[380px]:p-2.5 sm:p-6 rounded-xl sm:rounded-3xl bg-white border border-slate-100 shadow-xs sm:shadow-sm space-y-1 sm:space-y-2 flex flex-col justify-between">
            <div className="space-y-0.5">
              <p className="text-[7px] min-[380px]:text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-wider">Koordinat</p>
              <p className="text-[8.5px] min-[380px]:text-[9.5px] sm:text-sm font-black text-slate-800 font-mono truncate">-7.458..., 108.856...</p>
            </div>
            <a
              href="https://www.google.com/maps?q=-7.4584795,108.8565081"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[7.5px] min-[380px]:text-[8.5px] sm:text-xs font-bold text-primary hover:text-primary/80 transition-colors pt-1 sm:pt-2 border-t border-slate-100"
            >
              <span>Maps</span> <ArrowRight className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 shrink-0" />
            </a>
          </div>
          <div className="p-2 min-[380px]:p-2.5 sm:p-6 rounded-xl sm:rounded-3xl bg-white border border-slate-100 shadow-xs sm:shadow-sm space-y-0.5 sm:space-y-1">
            <p className="text-[7px] min-[380px]:text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-wider">Ke Kecamatan</p>
            <p className="text-sm min-[380px]:text-lg sm:text-2xl font-black text-primary font-display">± 16 KM</p>
            <p className="text-[7px] min-[380px]:text-[8px] sm:text-xs text-slate-500 font-medium truncate">Gandrungmangu</p>
          </div>
          <div className="p-2 min-[380px]:p-2.5 sm:p-6 rounded-xl sm:rounded-3xl bg-white border border-slate-100 shadow-xs sm:shadow-sm space-y-0.5 sm:space-y-1">
            <p className="text-[7px] min-[380px]:text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-wider">Ke Kabupaten</p>
            <p className="text-sm min-[380px]:text-lg sm:text-2xl font-black text-primary font-display">± 60 KM</p>
            <p className="text-[7px] min-[380px]:text-[8px] sm:text-xs text-slate-500 font-medium truncate">Cilacap</p>
          </div>
        </div>
      </div>

      <div className="lg:col-span-4 space-y-4 sm:space-y-8">
        <Card className="rounded-2xl sm:rounded-3xl md:rounded-[3rem] border-none bg-primary text-white overflow-hidden shadow-xl">
          <CardContent className="p-4 sm:p-6 md:p-10 space-y-4 sm:space-y-8 md:space-y-10">
            <div className="space-y-1.5 sm:space-y-4">
              <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.4em] text-emerald-200">Geografis & Batas</p>
              <h3 className="text-xl sm:text-3xl font-display font-semibold italic">Batas Wilayah</h3>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                Luas wilayah sekitar <strong>9,88 km²</strong> (± <strong>988 hektare</strong>) dengan batas:
              </p>
            </div>

            {/* Batas Wilayah 2 Kolom di Mobile */}
            <div className="grid grid-cols-2 gap-2 sm:gap-5">
              {[
                { dir: 'UTARA', label: 'Desa Rungkang' },
                { dir: 'SELATAN', label: 'Desa Karanganyar' },
                { dir: 'BARAT', label: 'Desa Karanggedang' },
                { dir: 'TIMUR', label: 'Desa Cinangsi' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 sm:gap-4 group cursor-default">
                  <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/20 flex items-center justify-center font-black text-[9px] sm:text-[10px] text-white border border-white/20 group-hover:bg-white group-hover:text-primary transition-all shrink-0">
                    {item.dir[0]}
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-[7.5px] sm:text-[9px] font-black text-white/70 uppercase tracking-wider">{item.dir}</p>
                    <p className="font-bold text-[11px] sm:text-sm text-white truncate">{item.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 sm:pt-6 border-t border-white/10 space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <Compass className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-200 shrink-0" />
                <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-wider sm:tracking-widest text-white">Luas Wilayah Total</p>
              </div>
              <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white/10 border border-white/20 font-mono text-[10px] sm:text-xs text-white flex justify-between">
                <span>Luas: 9,88 km²</span>
                <span>± 988 Ha</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function WilayahTab() {
  const dusuns = [
    { name: '1. DUSUN KARANGGINTUNG', desc: 'Pusat pemerintahan desa, pelayanan administrasi publik, dan sentra kegiatan kemasyarakatan.', color: 'bg-primary' },
    { name: '2. DUSUN PAGERGUNUNG', desc: 'Wilayah permukiman yang asri dengan lahan pertanian produktif dan kebersamaan warga.', color: 'bg-secondary' },
    { name: '3. DUSUN SINDANGRAJA', desc: 'Kawasan permukiman masyarakat dengan kegiatan sosial, keagamaan, dan pendidikan diniyah yang aktif.', color: 'bg-emerald-700' },
    { name: '4. DUSUN PENUMBANG', desc: 'Kawasan pertanian, perkebunan rakyat, dan peternakan sebagai penopang ekonomi keluarga.', color: 'bg-amber-600' },
    { name: '5. DUSUN KARANGTAWANG', desc: 'Kawasan pengembangan potensi lokal, perdagangan, usaha rumah tangga, dan pertanian.', color: 'bg-slate-900' },
  ];

  const ageGroups = [
    { group: '0–4 Thn', count: 565, pct: '5.8%' },
    { group: '5–9 Thn', count: 679, pct: '7.0%' },
    { group: '10–14 Thn', count: 686, pct: '7.0%' },
    { group: '15–19 Thn', count: 670, pct: '6.9%' },
    { group: '20–24 Thn', count: 697, pct: '7.2%' },
    { group: '25–29 Thn', count: 752, pct: '7.7%' },
    { group: '30–34 Thn', count: 747, pct: '7.7%' },
    { group: '35–39 Thn', count: 672, pct: '6.9%' },
  ];

  const schools = [
    'SD Negeri Karanggintung 01',
    'SD Negeri Karanggintung 02',
    'SD Negeri Karanggintung 03',
    'SD Negeri Karanggintung 04',
    'SD Negeri Karanggintung 05',
    'SD Negeri Karanggintung 06',
    'SD Negeri Karanggintung 07',
  ];

  return (
    <div className="space-y-6 sm:space-y-16">
      <div className="max-w-3xl space-y-1.5 sm:space-y-4">
        <Badge className="bg-emerald-50 text-emerald-700 font-black uppercase text-[8px] sm:text-[10px] tracking-widest px-2.5 sm:px-4 py-1 sm:py-1.5 border-none shadow-xs">
          Pembagian Wilayah Administrasi & Kependudukan
        </Badge>
        <h2 className="text-xl sm:text-3xl md:text-4xl font-black text-slate-900 uppercase font-display italic">
          Wilayah & <span className="text-primary not-italic">Demografi Penduduk</span>
        </h2>
        <p className="text-slate-500 font-medium leading-relaxed text-xs sm:text-sm md:text-base">
          Desa Karanggintung terbagi dalam <strong>5 Dusun</strong>, <strong>6 RW</strong>, dan <strong>51 RT</strong>. Total penduduk <strong>9.746 jiwa</strong> (kepadatan <strong>986 jiwa/km²</strong>, rasio jenis kelamin <strong>104,10</strong>).
        </p>
      </div>

      {/* Ringkasan Demografi (3 Kolom Compact di Mobile) */}
      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-1.5 sm:gap-4">
        <div className="p-2 min-[380px]:p-2.5 sm:p-5 rounded-xl sm:rounded-3xl bg-white border border-slate-100 shadow-xs sm:shadow-sm space-y-0.5 sm:space-y-1 text-center sm:text-left">
          <p className="text-[7px] min-[380px]:text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-wider">Total Warga</p>
          <p className="text-xs min-[380px]:text-sm sm:text-2xl font-black text-primary font-display">9.746 <span className="text-[8px] sm:text-xs font-normal">jiwa</span></p>
        </div>
        <div className="p-2 min-[380px]:p-2.5 sm:p-5 rounded-xl sm:rounded-3xl bg-white border border-slate-100 shadow-xs sm:shadow-sm space-y-0.5 sm:space-y-1 text-center sm:text-left">
          <p className="text-[7px] min-[380px]:text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-wider">Laki-laki</p>
          <p className="text-xs min-[380px]:text-sm sm:text-2xl font-black text-blue-600 font-display">4.971 <span className="text-[8px] sm:text-xs font-normal">jiwa</span></p>
        </div>
        <div className="p-2 min-[380px]:p-2.5 sm:p-5 rounded-xl sm:rounded-3xl bg-white border border-slate-100 shadow-xs sm:shadow-sm space-y-0.5 sm:space-y-1 text-center sm:text-left">
          <p className="text-[7px] min-[380px]:text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-wider">Perempuan</p>
          <p className="text-xs min-[380px]:text-sm sm:text-2xl font-black text-rose-600 font-display">4.775 <span className="text-[8px] sm:text-xs font-normal">jiwa</span></p>
        </div>
        <div className="p-2 min-[380px]:p-2.5 sm:p-5 rounded-xl sm:rounded-3xl bg-white border border-slate-100 shadow-xs sm:shadow-sm space-y-0.5 sm:space-y-1 text-center sm:text-left">
          <p className="text-[7px] min-[380px]:text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-wider">Jumlah Dusun</p>
          <p className="text-xs min-[380px]:text-sm sm:text-2xl font-black text-slate-800 font-display">5 Dusun</p>
        </div>
        <div className="p-2 min-[380px]:p-2.5 sm:p-5 rounded-xl sm:rounded-3xl bg-white border border-slate-100 shadow-xs sm:shadow-sm space-y-0.5 sm:space-y-1 text-center sm:text-left">
          <p className="text-[7px] min-[380px]:text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-wider">RW / RT</p>
          <p className="text-xs min-[380px]:text-sm sm:text-2xl font-black text-slate-800 font-display">6 / 51</p>
        </div>
        <div className="p-2 min-[380px]:p-2.5 sm:p-5 rounded-xl sm:rounded-3xl bg-white border border-slate-100 shadow-xs sm:shadow-sm space-y-0.5 sm:space-y-1 text-center sm:text-left">
          <p className="text-[7px] min-[380px]:text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-wider">Kepadatan</p>
          <p className="text-xs min-[380px]:text-sm sm:text-2xl font-black text-emerald-700 font-display">986 <span className="text-[7.5px] sm:text-[10px] font-normal">jiwa/km²</span></p>
        </div>
      </div>

      {/* 5 DUSUN CARD LIST */}
      <div className="space-y-3 sm:space-y-6">
        <h3 className="text-base sm:text-2xl font-black text-slate-900 uppercase font-display italic">
          Wilayah Dusun <span className="text-primary not-italic">Desa Karanggintung</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6">
          {dusuns.map((dusun, i) => (
            <Card key={i} className="rounded-2xl sm:rounded-3xl border-none shadow-xs sm:shadow-sm hover:shadow-xl transition-all duration-300 bg-white overflow-hidden group flex flex-col justify-between">
              <div className={cn("h-1.5 sm:h-2.5 w-full", dusun.color)} />
              <CardContent className="p-3.5 sm:p-6 md:p-8 space-y-2 sm:space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-1 sm:space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs min-[380px]:text-sm sm:text-lg font-black text-slate-800 tracking-tight font-display">{dusun.name}</h4>
                    <div className="p-1 sm:p-2 bg-slate-50 rounded-lg sm:rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <Milestone className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </div>
                  </div>
                  <p className="text-[10px] sm:text-xs text-slate-600 font-medium leading-relaxed">{dusun.desc}</p>
                </div>
                <div className="pt-2 sm:pt-4 border-t border-slate-50 flex items-center justify-between text-primary font-black uppercase text-[8px] sm:text-[9px] tracking-wider">
                  <span>Wilayah Administratif</span>
                  <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* DEMOGRAFI KELOMPOK UMUR & SARANA PENDIDIKAN */}
      <div className="grid md:grid-cols-12 gap-4 sm:gap-8">
        {/* KELOMPOK UMUR */}
        <div className="md:col-span-7 bg-white p-3.5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border shadow-xs sm:shadow-sm space-y-3 sm:space-y-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2.5 bg-emerald-50 text-emerald-700 rounded-lg sm:rounded-xl">
              <Users className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <h4 className="text-sm sm:text-lg font-black text-slate-900 uppercase font-display">Penduduk Menurut Kelompok Umur</h4>
              <p className="text-[9px] sm:text-xs text-slate-400 font-bold">Data Kependudukan Tahun 2024</p>
            </div>
          </div>
          <p className="text-[10px] sm:text-xs text-slate-600 leading-relaxed font-medium">
            Komposisi penduduk menunjukkan dominasi jumlah usia muda dan produktif sebagai modal utama pembangunan desa.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-3">
            {ageGroups.map((item, idx) => (
              <div key={idx} className="p-2 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-0.5">
                <p className="text-[8px] min-[380px]:text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.group}</p>
                <p className="text-xs sm:text-base font-black text-slate-900 font-display">{item.count.toLocaleString('id-ID')} <span className="text-[8px] sm:text-[10px] font-normal text-slate-500">jiwa</span></p>
              </div>
            ))}
          </div>
        </div>

        {/* SARANA PENDIDIKAN */}
        <div className="md:col-span-5 bg-white p-3.5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border shadow-xs sm:shadow-sm space-y-3 sm:space-y-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2.5 bg-blue-50 text-blue-700 rounded-lg sm:rounded-xl">
              <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <h4 className="text-sm sm:text-lg font-black text-slate-900 uppercase font-display">Lembaga Pendidikan</h4>
              <p className="text-[9px] sm:text-xs text-slate-400 font-bold">Fasilitas Sekolah Dasar di Desa</p>
            </div>
          </div>
          <div className="space-y-1.5 sm:space-y-2">
            {schools.map((school, i) => (
              <div key={i} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-slate-50 border border-slate-100 text-[10.5px] sm:text-xs font-bold text-slate-700">
                <span className="flex h-4 w-4 sm:h-5 sm:w-5 shrink-0 items-center justify-center rounded-md sm:rounded-lg bg-primary text-white text-[9px] sm:text-[10px]">
                  {i + 1}
                </span>
                <span className="truncate">{school}</span>
              </div>
            ))}
          </div>
          <p className="text-[9.5px] sm:text-[11px] text-slate-500 italic leading-relaxed">
            *Didukung pula oleh kegiatan pendidikan diniyah, pengajian, dan TPQ di seluruh dusun.
          </p>
        </div>
      </div>
    </div>
  );
}

function PotensiTab() {
  const potentials = [
    {
      title: 'Pertanian & Perkebunan',
      desc: 'Sektor utama penopang mata pencaharian warga berupa padi, jagung, kelapa, singkong, dan tanaman hortikultura produktif.',
      icon: Sprout,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50'
    },
    {
      title: 'Peternakan Rakyat',
      desc: 'Usaha ternak sapi, kambing, ayam, dan itik sebagai tabungan ekonomi dan penopang ketahanan pangan hewani.',
      icon: Beef,
      color: 'text-amber-700',
      bg: 'bg-amber-50'
    },
    {
      title: 'UMKM & Industri Rumahan',
      desc: 'Perdagangan, warung sembako, kuliner lokal, industri makanan olahan rumahan, dan aneka kerajinan masyarakat.',
      icon: Store,
      color: 'text-rose-700',
      bg: 'bg-rose-50'
    },
    {
      title: 'Potensi Wisata & Budaya',
      desc: 'Keindahan alam pedesaan asri, potensi sumber daya alam lestari, serta tradisi lokal dan seni sedekah bumi.',
      icon: Landmark,
      color: 'text-teal-700',
      bg: 'bg-teal-50'
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-16">
      <div className="text-center space-y-1.5 sm:space-y-4 max-w-3xl mx-auto">
        <Badge className="bg-emerald-50 text-emerald-700 font-black uppercase text-[8px] sm:text-[10px] tracking-widest px-2.5 sm:px-4 py-1 sm:py-1.5 border-none shadow-xs">
          Potensi Ekonomi & Kemasyarakatan
        </Badge>
        <h2 className="text-xl sm:text-4xl md:text-5xl font-black text-slate-900 uppercase font-display italic">
          Potensi <span className="text-primary not-italic">Unggulan Desa</span>
        </h2>
        <p className="text-slate-500 font-bold uppercase text-[8.5px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.4em]">Sektor Pertanian, Peternakan, UMKM, dan Modal Sosial</p>
      </div>

      {/* 4 Potensi Cards (2 Kolom di Mobile) */}
      <div className="grid grid-cols-2 gap-2 sm:gap-6 md:gap-8">
        {potentials.map((item, i) => (
          <Card key={i} className="rounded-xl sm:rounded-3xl md:rounded-[2.5rem] border-none shadow-xs sm:shadow-sm hover:shadow-2xl transition-all duration-300 bg-white group flex flex-col h-full">
            <CardContent className="p-3 min-[380px]:p-3.5 sm:p-8 md:p-10 flex flex-col h-full space-y-2 sm:space-y-6">
              <div className={cn("w-8 h-8 sm:w-16 sm:h-16 rounded-xl sm:rounded-3xl flex items-center justify-center transition-transform group-hover:rotate-12 group-hover:scale-110 shrink-0", item.bg, item.color)}>
                <item.icon className="h-4 w-4 sm:h-8 sm:w-8" />
              </div>
              <div className="space-y-1 sm:space-y-3 flex-1">
                <h4 className="text-xs min-[380px]:text-sm sm:text-xl font-black uppercase tracking-tight text-slate-800 leading-tight font-display line-clamp-2">{item.title}</h4>
                <p className="text-[9.5px] sm:text-sm text-slate-600 leading-relaxed font-medium line-clamp-3 sm:line-clamp-none">
                  {item.desc}
                </p>
              </div>
              <div className="w-5 h-0.5 sm:w-8 sm:h-1 bg-secondary rounded-full group-hover:w-full transition-all duration-500" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* MODAL SOSIAL, KEAGAMAAN & GOTONG ROYONG (3 Kolom di Mobile) */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-6">
        <div className="p-2 min-[380px]:p-2.5 sm:p-8 rounded-xl sm:rounded-3xl bg-white border border-slate-100 shadow-xs sm:shadow-sm space-y-1.5 sm:space-y-4">
          <div className="p-1.5 sm:p-3 bg-emerald-50 text-emerald-700 w-fit rounded-lg sm:rounded-2xl shrink-0"><Users className="h-3.5 w-3.5 sm:h-6 sm:w-6" /></div>
          <h4 className="text-[10px] sm:text-lg font-black text-slate-900 uppercase font-display line-clamp-2">Gotong Royong</h4>
          <p className="text-[8.5px] sm:text-xs text-slate-600 leading-relaxed font-medium line-clamp-3 sm:line-clamp-none">
            Nilai kebersamaan, kerja bakti, dan tradisi sedekah bumi yang dirawat turun temurun.
          </p>
        </div>

        <div className="p-2 min-[380px]:p-2.5 sm:p-8 rounded-xl sm:rounded-3xl bg-white border border-slate-100 shadow-xs sm:shadow-sm space-y-1.5 sm:space-y-4">
          <div className="p-1.5 sm:p-3 bg-amber-50 text-amber-700 w-fit rounded-lg sm:rounded-2xl shrink-0"><Heart className="h-3.5 w-3.5 sm:h-6 sm:w-6" /></div>
          <h4 className="text-[10px] sm:text-lg font-black text-slate-900 uppercase font-display line-clamp-2">Keagamaan</h4>
          <p className="text-[8.5px] sm:text-xs text-slate-600 leading-relaxed font-medium line-clamp-3 sm:line-clamp-none">
            Aktivitas pengajian rutin, masjid/musala aktif, dan pendidikan karakter generasi desa.
          </p>
        </div>

        <div className="p-2 min-[380px]:p-2.5 sm:p-8 rounded-xl sm:rounded-3xl bg-white border border-slate-100 shadow-xs sm:shadow-sm space-y-1.5 sm:space-y-4">
          <div className="p-1.5 sm:p-3 bg-blue-50 text-blue-700 w-fit rounded-lg sm:rounded-2xl shrink-0"><TrendingUp className="h-3.5 w-3.5 sm:h-6 sm:w-6" /></div>
          <h4 className="text-[10px] sm:text-lg font-black text-slate-900 uppercase font-display line-clamp-2">SDM Produktif</h4>
          <p className="text-[8.5px] sm:text-xs text-slate-600 leading-relaxed font-medium line-clamp-3 sm:line-clamp-none">
            Penduduk mayoritas usia produktif siap menggerakkan kemajuan perekonomian mandiri.
          </p>
        </div>
      </div>
    </div>
  );
}

function GaleriTab({ youtubeEmbedUrl, newsData, isLoadingNews }: { youtubeEmbedUrl: string | null, newsData?: any[] | null, isLoadingNews?: boolean }) {
  const documentationPhotos = useMemo(() => {
    if (!newsData) return [];
    return newsData
      .filter(news => news.imageUrl && news.mediaType !== 'video')
      .map(news => ({
        url: news.imageUrl,
        title: news.title,
        date: news.date,
      }));
  }, [newsData]);

  return (
    <div className="space-y-6 sm:space-y-16">
      {/* Video Profile Section */}
      <section className="space-y-3 sm:space-y-8">
        <div className="flex items-center gap-2.5 sm:gap-4">
          <div className="p-2 sm:p-3 bg-rose-50 text-rose-600 rounded-xl sm:rounded-2xl"><PlayCircle className="h-4 w-4 sm:h-6 sm:w-6" /></div>
          <h3 className="text-base sm:text-2xl font-black uppercase tracking-tight text-slate-800">Video Profil Resmi Desa</h3>
        </div>
        <Card className="rounded-2xl sm:rounded-3xl md:rounded-[3rem] overflow-hidden border-none shadow-md sm:shadow-2xl aspect-video bg-slate-900 group">
          {youtubeEmbedUrl ? (
            <iframe
              src={youtubeEmbedUrl}
              title="Profil Desa Karanggintung"
              className="w-full h-full opacity-80 group-hover:opacity-100 transition-opacity"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="flex h-full min-h-[180px] sm:min-h-[240px] md:min-h-[320px] items-center justify-center bg-slate-950 text-center text-slate-200">
              <div className="space-y-2 sm:space-y-3 px-4 sm:px-6">
                <div className="mx-auto flex h-9 w-9 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-rose-600 text-white">
                  <PlayCircle className="h-4 w-4 sm:h-6 sm:w-6" />
                </div>
                <p className="text-xs sm:text-base md:text-lg font-semibold">Video profil desa belum dikonfigurasi.</p>
                <p className="text-[10px] sm:text-xs md:text-sm text-slate-400">Silakan atur tautan YouTube di Pengaturan Admin.</p>
              </div>
            </div>
          )}
        </Card>
      </section>

      {/* Photo Gallery Grid (2 Kolom Masonry di Mobile) */}
      <section className="space-y-3 sm:space-y-10">
        <div className="flex items-center gap-2.5 sm:gap-4">
          <div className="p-2 sm:p-3 bg-primary text-white rounded-xl sm:rounded-2xl"><ImageIcon className="h-4 w-4 sm:h-6 sm:w-6" /></div>
          <h3 className="text-base sm:text-2xl font-black uppercase tracking-tight text-slate-800">Dokumentasi Kegiatan</h3>
        </div>

        {isLoadingNews ? (
          <div className="columns-2 sm:columns-2 lg:columns-3 gap-2 sm:gap-4 md:gap-6 space-y-2 sm:space-y-4 md:space-y-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-36 sm:h-64 rounded-xl sm:rounded-2xl md:rounded-[2rem]" />
            ))}
          </div>
        ) : documentationPhotos.length === 0 ? (
          <div className="text-center py-10 sm:py-16 px-4 sm:px-6">
            <div className="inline-flex p-3 sm:p-4 bg-slate-100 rounded-full mb-3 sm:mb-4">
              <ImageIcon className="h-6 w-6 sm:h-8 sm:w-8 text-slate-400" />
            </div>
            <p className="text-xs sm:text-base text-slate-600 font-semibold">Belum ada dokumentasi kegiatan.</p>
            <p className="text-[10px] sm:text-sm text-slate-400">Foto dokumentasi akan muncul otomatis dari berita terkini.</p>
          </div>
        ) : (
          <div className="columns-2 sm:columns-2 lg:columns-3 gap-2 sm:gap-4 md:gap-6 space-y-2 sm:space-y-4 md:space-y-6">
            {documentationPhotos.map((photo, i) => (
              <div key={i} className="rounded-xl sm:rounded-2xl md:rounded-[2rem] overflow-hidden border-2 sm:border-4 border-white shadow-xs sm:shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer group relative">
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2.5 sm:p-6">
                  <p className="text-white text-[10px] sm:text-sm font-semibold line-clamp-2">{photo.title}</p>
                  {photo.date && (
                    <p className="text-white/70 text-[8px] sm:text-xs mt-0.5 sm:mt-1">{photo.date}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center py-4 sm:py-10">
          <Link href="/BeritaDesa/">
            <Button variant="outline" className="rounded-xl font-bold gap-1.5 sm:gap-2 border-primary text-primary h-10 sm:h-12 px-6 sm:px-10 text-xs sm:text-sm">
              Lihat Seluruh Berita
              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

function OfficialCard({ official, isSmall = false }: { official: Official, isSmall?: boolean }) {
  return (
    <div className="group bg-white rounded-xl sm:rounded-2xl md:rounded-[2rem] border border-slate-100/90 shadow-xs sm:shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between">
      <div className="relative aspect-[3/4] w-full bg-slate-100 overflow-hidden">
        {official.imageUrl ? (
          <img
            src={official.imageUrl}
            alt={official.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/5">
            <UserCircle2 className="h-8 w-8 sm:h-12 sm:w-12 md:h-16 md:w-16 text-primary/15" />
          </div>
        )}
      </div>
      <div className="p-1.5 min-[380px]:p-2 sm:p-4 md:p-5 space-y-1 sm:space-y-1.5">
        <div className="w-5 h-0.5 sm:w-8 sm:h-1 bg-secondary rounded-full group-hover:w-full transition-all duration-300" />
        <h3 className="text-[10px] min-[380px]:text-[10.5px] sm:text-xs md:text-sm font-black text-slate-900 uppercase leading-tight line-clamp-2">
          {official.name}
        </h3>
        <p className="text-[7.5px] min-[380px]:text-[8px] sm:text-[9px] md:text-[10px] font-bold text-primary uppercase tracking-tight italic line-clamp-2">
          {official.position}
        </p>
      </div>
    </div>
  );
}
