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

      <div className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="grid lg:grid-cols-12 gap-10 items-start">

          {/* SIDEBAR NAVIGATION (Desktop) / TOP SCROLL (Mobile) */}
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

            {/* Mobile Menu Dropdown Selector */}
            <div className="block lg:hidden w-full relative mb-6">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-full flex items-center justify-between bg-primary text-white px-5 py-4 rounded-xl shadow-md font-black uppercase text-[10px] tracking-wider"
              >
                <div className="flex items-center gap-3">
                  {React.createElement(activeTabObj.icon, { className: "h-5 w-5 text-white" })}
                  <span>{activeTabObj.label}</span>
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
                            setActiveTab(tab.id);
                            setIsMenuOpen(false);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
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
          <main className="lg:col-span-9 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
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
    <div className="space-y-12">
      <div className="grid md:grid-cols-12 gap-8 items-stretch">
        <div className="md:col-span-4 lg:col-span-4">
          <Card className="rounded-3xl md:rounded-[3rem] overflow-hidden border-none shadow-xl bg-white sticky top-28">
            <div className="aspect-[3/4] relative bg-slate-100">
              <img
                src={imageUrl}
                alt="Kepala Desa Karanggintung"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent" />
            </div>
            <div className="p-6 md:p-8 text-center bg-primary text-white">
              <h3 className="text-xl font-black uppercase tracking-tight font-display italic">TURMONO</h3>
              <p className="text-[10px] font-bold text-white/90 uppercase tracking-[0.3em] mt-1">Kepala Desa Karanggintung</p>
            </div>
          </Card>
        </div>
        <div className="md:col-span-8 lg:col-span-8 bg-white p-6 md:p-14 rounded-3xl md:rounded-[4rem] border shadow-sm space-y-8">
          <div className="space-y-4">
            <Badge className="bg-emerald-50 text-emerald-700 font-black uppercase text-[10px] tracking-widest px-4 py-1.5 border-none shadow-sm">
              Profil Resmi Desa Karanggintung
            </Badge>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-tight uppercase font-display italic tracking-tighter">
              Tentang <span className="text-primary not-italic">Desa Karanggintung</span>
            </h2>
            <p className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest">
              Kecamatan Gandrungmangu, Kabupaten Cilacap, Provinsi Jawa Tengah
            </p>
          </div>
          <div className="prose prose-slate max-w-none space-y-4 text-slate-700 text-sm md:text-base leading-relaxed">
            <p className="text-sm md:text-base leading-relaxed text-slate-600 font-medium italic border-l-4 md:border-l-8 border-secondary pl-4 md:pl-6 py-2">
              "Desa Karanggintung merupakan salah satu desa yang berada di wilayah Kecamatan Gandrungmangu, Kabupaten Cilacap, Provinsi Jawa Tengah. Desa Karanggintung memiliki karakter wilayah pedesaan dengan kehidupan masyarakat yang masih menjunjung tinggi nilai gotong royong, kebersamaan, kehidupan sosial, keagamaan, serta memiliki potensi di bidang pertanian dan berbagai kegiatan ekonomi masyarakat."
            </p>
            <p>
              Sebagai bagian dari Kecamatan Gandrungmangu, Desa Karanggintung terus mengalami perkembangan dalam berbagai bidang. Pembangunan desa diarahkan untuk meningkatkan kualitas pelayanan kepada masyarakat, mengembangkan potensi lokal, memperkuat perekonomian masyarakat, serta menciptakan tata kelola pemerintahan desa yang transparan, akuntabel dan berorientasi pada kepentingan masyarakat.
            </p>
            <p>
              Dengan dukungan masyarakat dan berbagai potensi yang dimiliki, Desa Karanggintung terus berupaya menjadi desa yang maju, mandiri, sejahtera dan berkelanjutan.
            </p>
          </div>
          <div className="pt-4 flex flex-wrap gap-2 sm:gap-4">
            {["Gotong Royong", "Kebersamaan", "Religius", "Pertanian Maju", "Tata Kelola Transparan", "Pelayanan Prima"].map(tag => (
              <div key={tag} className="flex items-center gap-2 px-5 py-2 bg-slate-50 border rounded-full text-[10px] font-black uppercase tracking-widest text-primary">
                <CheckCircle2 className="h-3 w-3 text-secondary" /> {tag}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5 PILAR IDENTITAS DESA KARANGGINTUNG */}
      <div className="bg-white p-8 md:p-14 rounded-3xl md:rounded-[4rem] border shadow-sm space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge className="bg-emerald-50 text-emerald-700 font-black uppercase text-[10px] tracking-widest px-4 py-1.5 border-none shadow-sm">
            Karakteristik & Nilai Luhur
          </Badge>
          <h3 className="text-3xl md:text-4xl font-black text-slate-900 uppercase font-display italic">
            Identitas <span className="text-primary not-italic">Desa Karanggintung</span>
          </h3>
          <p className="text-slate-500 font-medium text-sm">Lima pilar fundamental yang membentuk jati diri dan arah kemajuan Desa Karanggintung</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
              title: 'Sumber Daya Manusia',
              desc: 'Masyarakat menjadi kekuatan utama dalam menggerakkan pembangunan dan kemajuan desa.',
              icon: Users,
              color: 'text-amber-700 bg-amber-50 border-amber-100'
            },
            {
              title: 'Inovasi',
              desc: 'Pemanfaatan teknologi dan keterbukaan terhadap perubahan menjadi bagian dari langkah Desa Karanggintung menuju masa depan.',
              icon: Zap,
              color: 'text-blue-700 bg-blue-50 border-blue-100'
            },
            {
              title: 'Tata Kelola Prima',
              desc: 'Pemerintahan desa berorientasi melayani dengan prinsip transparansi, akuntabilitas, dan efisiensi.',
              icon: ShieldCheck,
              color: 'text-indigo-700 bg-indigo-50 border-indigo-100'
            },
          ].map((item, i) => (
            <Card key={i} className="rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 p-6 space-y-4 group">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", item.color)}>
                <item.icon className="h-6 w-6" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-lg font-black uppercase tracking-tight text-slate-800 font-display">{item.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{item.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* ARAH PEMBANGUNAN & PRINSIP TATA KELOLA */}
      <div className="bg-gradient-to-br from-primary to-slate-900 p-8 md:p-14 rounded-3xl md:rounded-[4rem] text-white shadow-2xl space-y-8">
        <div className="max-w-3xl space-y-3">
          <Badge className="bg-white/10 text-secondary border-white/10 font-black uppercase text-[10px] tracking-widest px-4 py-1.5">
            Komitmen Pelayanan Publik
          </Badge>
          <h3 className="text-3xl md:text-4xl font-black uppercase font-display italic">
            Prinsip Tata Kelola <span className="text-secondary not-italic">Pemerintahan Desa</span>
          </h3>
          <p className="text-slate-300 text-sm leading-relaxed font-medium">
            Pemerintah Desa Karanggintung berkomitmen untuk terus meningkatkan kualitas pelayanan publik dan mewujudkan pemerintahan yang bersih dengan mengedepankan prinsip:
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: 'Transparansi', desc: 'Keterbukaan informasi dan anggaran kepada publik.' },
            { label: 'Akuntabilitas', desc: 'Setiap kebijakan dapat dipertanggungjawabkan.' },
            { label: 'Partisipasi Masyarakat', desc: 'Melibatkan warga dalam perencanaan pembangunan.' },
            { label: 'Efektivitas', desc: 'Pencapaian target kerja yang berdaya guna nyata.' },
            { label: 'Efisiensi', desc: 'Pemanfaatan sumber daya desa secara tepat guna.' },
            { label: 'Pelayanan Cepat & Mudah', desc: 'Birokrasi ramah warga berbasis teknologi digital.' },
          ].map((principle, i) => (
            <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-2 text-secondary font-black text-xs uppercase tracking-wider">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{principle.label}</span>
              </div>
              <p className="text-xs text-slate-300 font-medium pl-6">{principle.desc}</p>
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
    <div className="space-y-10">
      <div className="space-y-3">
        <Badge className="bg-primary/10 text-primary font-black uppercase text-[10px] tracking-widest px-4 py-1.5 border-none shadow-sm">
          Aparatur & Kelembagaan
        </Badge>
        <h2 className="text-3xl md:text-4xl font-black text-slate-900 uppercase font-display italic">
          Struktur <span className="text-primary not-italic">Pemerintahan</span>
        </h2>
        <p className="text-slate-500 font-medium text-sm md:text-base border-l-4 border-secondary pl-4 uppercase tracking-tight">
          Mengenal Pelayan Masyarakat & Lembaga Desa Karanggintung
        </p>
      </div>

      <Tabs value={subTab} onValueChange={setSubTab} className="w-full space-y-8">
        {/* SUB-TABS NAVIGATION */}
        <div className="w-full overflow-x-auto pb-2 scrollbar-none">
          <TabsList className="bg-slate-100/80 p-1.5 rounded-2xl h-auto inline-flex md:flex flex-nowrap md:flex-wrap items-center justify-start md:justify-center border border-slate-200/80 gap-1.5">
            {subCategories.map((cat) => (
              <TabsTrigger
                key={cat.id}
                value={cat.id}
                className="rounded-xl px-4 sm:px-6 py-3 font-black uppercase text-[10px] md:text-[11px] tracking-wider transition-all whitespace-nowrap gap-2 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                <cat.icon className="h-4 w-4 shrink-0" />
                <span>{cat.label}</span>
                {!isLoading && cat.count > 0 && (
                  <span className={cn(
                    "ml-1 px-2 py-0.5 rounded-full text-[9px] font-black",
                    subTab === cat.id ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                  )}>
                    {cat.count}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* TAB 1: PERANGKAT DESA */}
        <TabsContent value="perangkat" className="space-y-8 focus-visible:outline-none animate-in fade-in-50 duration-300">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary text-white rounded-2xl shadow-lg">
              <UserCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-800">Perangkat Desa</h3>
              <p className="text-xs text-slate-500 font-semibold">Pemerintah Desa Karanggintung</p>
            </div>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-3xl md:rounded-[2.5rem]" />)}
            </div>
          ) : data.perangkat?.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-8">
              {data.perangkat.map((o: Official) => <OfficialCard key={o.id} official={o} />)}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
              <UserCircle2 className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">Data Perangkat Desa belum ditambahkan.</p>
            </div>
          )}
        </TabsContent>

        {/* TAB 2: BPD DESA */}
        <TabsContent value="bpd" className="space-y-8 focus-visible:outline-none animate-in fade-in-50 duration-300">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-secondary text-white rounded-2xl shadow-lg">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-800">Badan Permusyawaratan Desa (BPD)</h3>
              <p className="text-xs text-slate-500 font-semibold">Lembaga Permusyawaratan & Pengawasan Desa</p>
            </div>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-3xl md:rounded-[2.5rem]" />)}
            </div>
          ) : data.bpd?.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-8">
              {data.bpd.map((o: Official) => <OfficialCard key={o.id} official={o} />)}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
              <ShieldCheck className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">Data BPD Desa belum ditambahkan.</p>
            </div>
          )}
        </TabsContent>

        {/* TAB 3: RT / RW */}
        <TabsContent value="rtrw" className="space-y-8 focus-visible:outline-none animate-in fade-in-50 duration-300">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg">
              <Landmark className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-800">Lembaga Kemasyarakatan (RT / RW)</h3>
              <p className="text-xs text-slate-500 font-semibold">Pengurus Rukun Warga dan Rukun Tetangga</p>
            </div>
          </div>
          {isLoading ? (
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-3xl" />)}
            </div>
          ) : data.rtrwGroups?.length > 0 ? (
            <div className="space-y-10 md:space-y-14">
              {data.rtrwGroups.map((group: any, i: number) => (
                <div key={i} className="space-y-6 p-6 md:p-8 bg-white rounded-3xl md:rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-slate-100" />
                    <Badge className="bg-slate-100 text-slate-600 font-black uppercase text-[9px] md:text-[10px] tracking-[0.2em] md:tracking-[0.3em] px-4 md:px-6 py-1.5 rounded-full border border-slate-200">
                      {group.rwLabel}
                    </Badge>
                    <div className="h-px flex-1 bg-slate-100" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                    {group.members.map((o: Official) => <OfficialCard key={o.id} official={o} isSmall />)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
              <Landmark className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">Data RT / RW belum ditambahkan.</p>
            </div>
          )}
        </TabsContent>

        {/* TAB 4: KADER POSYANDU */}
        <TabsContent value="posyandu" className="space-y-8 focus-visible:outline-none animate-in fade-in-50 duration-300">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-600 text-white rounded-2xl shadow-lg">
              <HeartHandshake className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-800">Kader Posyandu Desa</h3>
              <p className="text-xs text-slate-500 font-semibold">Kader Pelayanan Kesehatan & Posyandu Desa Karanggintung</p>
            </div>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-3xl md:rounded-[2.5rem]" />)}
            </div>
          ) : data.posyandu?.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
              {data.posyandu.map((o: Official) => <OfficialCard key={o.id} official={o} />)}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
              <HeartHandshake className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">Data Kader Posyandu belum ditambahkan.</p>
            </div>
          )}
        </TabsContent>

        {/* TAB 5: LINMAS DESA */}
        <TabsContent value="linmas" className="space-y-8 focus-visible:outline-none animate-in fade-in-50 duration-300">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-600 text-white rounded-2xl shadow-lg">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-800">Satuan Linmas (Satlinmas)</h3>
              <p className="text-xs text-slate-500 font-semibold">Satuan Perlindungan Masyarakat Desa Karanggintung</p>
            </div>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-3xl md:rounded-[2.5rem]" />)}
            </div>
          ) : data.linmas?.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
              {data.linmas.map((o: Official) => <OfficialCard key={o.id} official={o} />)}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
              <ShieldAlert className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">Data Satuan Linmas belum ditambahkan.</p>
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
    <div className="space-y-16 max-w-4xl mx-auto">
      <div className="text-center space-y-4">
        <Badge className="bg-emerald-50 text-emerald-700 font-black uppercase text-[10px] tracking-widest px-4 py-1.5 border-none shadow-sm">
          Sejarah & Filosofi Desa
        </Badge>
        <h2 className="text-3xl md:text-5xl font-black text-slate-900 uppercase font-display italic tracking-tight">
          Menelusuri Jejak Berdirinya <span className="text-primary not-italic">Desa Karanggintung</span>
        </h2>
        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em]">Kecamatan Gandrungmangu, Kabupaten Cilacap</p>
      </div>

      {/* Rincian Sejarah Narrative Card */}
      <Card className="rounded-3xl md:rounded-[3rem] border-none shadow-sm bg-white p-8 md:p-14 space-y-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
          <History className="h-4 w-4" /> Narasi Sejarah Desa
        </div>
        <div className="prose prose-slate max-w-none text-slate-700 space-y-5 text-base leading-relaxed">
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

        {/* ASAL USUL DAN FILOSOFI NAMA */}
        <div className="pt-8 border-t border-slate-100 space-y-6">
          <h3 className="text-2xl font-black text-slate-900 uppercase font-display italic">
            Asal-Usul dan Filosofi Nama <span className="text-primary not-italic">Karanggintung</span>
          </h3>
          <p className="text-slate-600 text-sm md:text-base leading-relaxed">
            Nama <strong>"Karanggintung"</strong> dipercaya memiliki keterkaitan dengan kondisi wilayah pada masa awal terbentuknya permukiman:
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-2">
              <span className="text-xs font-black uppercase text-emerald-800 tracking-widest">Karang</span>
              <p className="text-sm font-bold text-slate-800 leading-snug">
                Dalam penggunaan nama tempat di wilayah Jawa merujuk pada suatu kawasan, tempat, atau pekarangan.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-teal-50/70 border border-teal-100 space-y-2">
              <span className="text-xs font-black uppercase text-teal-800 tracking-widest">Gintung</span>
              <p className="text-sm font-bold text-slate-800 leading-snug">
                Berkaitan dengan keberadaan pohon gintung raksasa yang dahulu menjadi ciri khas dan penanda wilayah.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-3 shadow-lg">
            <p className="text-xs font-bold text-secondary uppercase tracking-widest">Makna Filosofis</p>
            <p className="text-sm md:text-base text-slate-200 leading-relaxed font-medium italic">
              "Pohon gintung dalam kisah asal-usul desa tidak hanya menjadi bagian dari sejarah nama, tetapi juga dimaknai sebagai simbol akar sejarah masyarakat Karanggintung. Dari sebuah penanda alam, berkembang sebuah permukiman. Dari permukiman berkembang sebuah masyarakat. Dan dari masyarakat tersebut tumbuh sebuah desa yang terus bergerak maju dari generasi ke generasi."
            </p>
            <p className="text-sm font-black text-white pt-2 border-t border-white/10">
              Karanggintung adalah desa yang tumbuh dari sejarah, dibangun dengan kebersamaan, dan terus melangkah menuju masa depan.
            </p>
          </div>
        </div>
      </Card>

      {/* TIMELINE JEJAK HISTORIS */}
      <div className="space-y-6">
        <h3 className="text-2xl font-black text-slate-900 uppercase font-display italic text-center">
          Tahapan <span className="text-primary not-italic">Perkembangan Desa</span>
        </h3>

        <div className="relative space-y-8">
          {/* Vertical Line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-primary/10 -translate-x-1/2" />

          {historyTimeline.map((event, i) => (
            <div key={i} className={cn(
              "relative flex items-center gap-10",
              i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
            )}>
              {/* Timeline Dot */}
              <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-10 h-10 rounded-2xl bg-primary border-4 border-white shadow-xl flex items-center justify-center z-10">
                <event.icon className="h-4 w-4 text-white" />
              </div>

              {/* Content Side */}
              <div className="flex-1 pl-12 md:pl-0">
                <Card className={cn(
                  "rounded-3xl md:rounded-[2.5rem] border-none shadow-sm hover:shadow-2xl transition-all duration-500 bg-white group overflow-hidden",
                  i % 2 === 0 ? "md:mr-12" : "md:ml-12"
                )}>
                  <div className={cn("h-2 w-full", i % 2 === 0 ? "bg-primary" : "bg-secondary")} />
                  <CardContent className="p-6 md:p-8 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest">{event.period}</span>
                      <Calendar className="h-4 w-4 text-slate-300" />
                    </div>
                    <h4 className="text-lg md:text-xl font-black uppercase text-slate-900 italic tracking-tight">{event.title}</h4>
                    <p className="text-slate-600 text-xs md:text-sm leading-relaxed font-medium">
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
    <div className="grid lg:grid-cols-12 gap-6 lg:gap-10">
      <div className="lg:col-span-8 space-y-6">
        <Card className="rounded-3xl md:rounded-[3rem] overflow-hidden border-none shadow-xl h-[350px] sm:h-[500px] md:h-[550px] relative group">
          <VillageMap />
          <div className="absolute top-4 md:top-8 left-4 md:left-8 pointer-events-none z-10">
            <Badge className="bg-primary text-white font-black uppercase text-[8px] md:text-[10px] tracking-widest px-4 md:px-6 py-1.5 md:py-2 rounded-full border-none shadow-2xl">
              Peta Interaktif Desa Karanggintung
            </Badge>
          </div>
        </Card>

        {/* Titik Koordinat & Ringkasan Jarak */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-2 flex flex-col justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Titik Koordinat</p>
              <p className="text-sm font-black text-slate-800 font-mono">-7.4584795, 108.8565081</p>
            </div>
            <a
              href="https://www.google.com/maps?q=-7.4584795,108.8565081"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors pt-2 border-t border-slate-100"
            >
              Buka Google Maps <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jarak ke Pusat Kecamatan</p>
            <p className="text-2xl font-black text-primary font-display">± 16 KM</p>
            <p className="text-xs text-slate-500 font-medium">Kecamatan Gandrungmangu</p>
          </div>
          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jarak ke Pusat Kabupaten</p>
            <p className="text-2xl font-black text-primary font-display">± 60 KM</p>
            <p className="text-xs text-slate-500 font-medium">Kabupaten Cilacap</p>
          </div>
        </div>
      </div>

      <div className="lg:col-span-4 space-y-8">
        <Card className="rounded-3xl md:rounded-[3rem] border-none bg-primary text-white overflow-hidden shadow-2xl">
          <CardContent className="p-6 md:p-10 space-y-8 md:space-y-10">
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-200">Geografis & Batas</p>
              <h3 className="text-3xl font-display font-semibold italic">Batas Wilayah</h3>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                Secara administratif, Desa Karanggintung memiliki luas wilayah sekitar <strong>9,88 km²</strong> (kurang lebih <strong>988 hektare</strong>) dan berbatasan langsung dengan desa-desa berikut:
              </p>
            </div>

            <div className="space-y-5">
              {[
                { dir: 'UTARA', label: 'Desa Rungkang' },
                { dir: 'SELATAN', label: 'Desa Karanganyar' },
                { dir: 'BARAT', label: 'Desa Karanggedang' },
                { dir: 'TIMUR', label: 'Desa Cinangsi' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 group cursor-default">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-black text-[10px] text-white border border-white/20 group-hover:bg-white group-hover:text-primary transition-all shrink-0">
                    {item.dir[0]}
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-black text-white/70 uppercase tracking-widest">Sebelah {item.dir}</p>
                    <p className="font-bold text-sm text-white">{item.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-white/10 space-y-3">
              <div className="flex items-center gap-3">
                <Compass className="h-5 w-5 text-emerald-200" />
                <p className="text-[10px] font-black uppercase tracking-widest text-white">Luas Wilayah Total</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/10 border border-white/20 font-mono text-xs text-white flex justify-between">
                <span>Luas: 9,88 km²</span>
                <span>Luas: ± 988 Ha</span>
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
    { group: '0–4 Tahun', count: 565, pct: '5.8%' },
    { group: '5–9 Tahun', count: 679, pct: '7.0%' },
    { group: '10–14 Tahun', count: 686, pct: '7.0%' },
    { group: '15–19 Tahun', count: 670, pct: '6.9%' },
    { group: '20–24 Tahun', count: 697, pct: '7.2%' },
    { group: '25–29 Tahun', count: 752, pct: '7.7%' },
    { group: '30–34 Tahun', count: 747, pct: '7.7%' },
    { group: '35–39 Tahun', count: 672, pct: '6.9%' },
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
    <div className="space-y-16">
      <div className="max-w-3xl space-y-4">
        <Badge className="bg-emerald-50 text-emerald-700 font-black uppercase text-[10px] tracking-widest px-4 py-1.5 border-none shadow-sm">
          Pembagian Wilayah Administrasi & Kependudukan
        </Badge>
        <h2 className="text-3xl md:text-4xl font-black text-slate-900 uppercase font-display italic">
          Wilayah & <span className="text-primary not-italic">Demografi Penduduk</span>
        </h2>
        <p className="text-slate-500 font-medium leading-relaxed text-sm md:text-base">
          Desa Karanggintung terbagi dalam wilayah administratif yang terdiri atas <strong>5 Dusun</strong>, <strong>6 Rukun Warga (RW)</strong>, dan <strong>51 Rukun Tetangga (RT)</strong>. Berdasarkan data tahun 2024, jumlah penduduk mencapai <strong>9.746 jiwa</strong> dengan kepadatan <strong>986 jiwa/km²</strong> dan rasio jenis kelamin <strong>104,10</strong>.
        </p>
      </div>

      {/* Ringkasan Demografi Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-1">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Penduduk</p>
          <p className="text-2xl font-black text-primary font-display">9.746 <span className="text-xs font-normal">jiwa</span></p>
        </div>
        <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-1">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Laki-laki</p>
          <p className="text-2xl font-black text-blue-600 font-display">4.971 <span className="text-xs font-normal">jiwa</span></p>
        </div>
        <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-1">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Perempuan</p>
          <p className="text-2xl font-black text-rose-600 font-display">4.775 <span className="text-xs font-normal">jiwa</span></p>
        </div>
        <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-1">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Jumlah Dusun</p>
          <p className="text-2xl font-black text-slate-800 font-display">5 Dusun</p>
        </div>
        <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-1">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Jumlah RW / RT</p>
          <p className="text-2xl font-black text-slate-800 font-display">6 / 51</p>
        </div>
        <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-1">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Kepadatan</p>
          <p className="text-2xl font-black text-emerald-700 font-display">986 <span className="text-[10px] font-normal">jiwa/km²</span></p>
        </div>
      </div>

      {/* 5 DUSUN CARD LIST */}
      <div className="space-y-6">
        <h3 className="text-2xl font-black text-slate-900 uppercase font-display italic">
          Wilayah Dusun <span className="text-primary not-italic">Desa Karanggintung</span>
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dusuns.map((dusun, i) => (
            <Card key={i} className="rounded-3xl border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white overflow-hidden group flex flex-col justify-between">
              <div className={cn("h-2.5 w-full", dusun.color)} />
              <CardContent className="p-6 md:p-8 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-lg font-black text-slate-800 tracking-tight font-display">{dusun.name}</h4>
                    <div className="p-2 bg-slate-50 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <Milestone className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">{dusun.desc}</p>
                </div>
                <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-primary font-black uppercase text-[9px] tracking-widest">
                  <span>Wilayah Administratif</span>
                  <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* DEMOGRAFI KELOMPOK UMUR & SARANA PENDIDIKAN */}
      <div className="grid md:grid-cols-12 gap-8">
        {/* KELOMPOK UMUR */}
        <div className="md:col-span-7 bg-white p-6 md:p-8 rounded-3xl border shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-lg font-black text-slate-900 uppercase font-display">Penduduk Menurut Kelompok Umur</h4>
              <p className="text-xs text-slate-400 font-bold">Data Kependudukan Tahun 2024</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Komposisi penduduk menunjukkan dominasi jumlah usia muda dan produktif yang menjadi modal kekuatan sumber daya manusia dalam membangun Desa Karanggintung.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ageGroups.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.group}</p>
                <p className="text-base font-black text-slate-900 font-display">{item.count.toLocaleString('id-ID')} <span className="text-[10px] font-normal text-slate-500">jiwa</span></p>
              </div>
            ))}
          </div>
        </div>

        {/* SARANA PENDIDIKAN */}
        <div className="md:col-span-5 bg-white p-6 md:p-8 rounded-3xl border shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-lg font-black text-slate-900 uppercase font-display">Lembaga Pendidikan</h4>
              <p className="text-xs text-slate-400 font-bold">Fasilitas Sekolah Dasar di Desa</p>
            </div>
          </div>
          <div className="space-y-2">
            {schools.map((school, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-primary text-white text-[10px]">
                  {i + 1}
                </span>
                <span>{school}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 italic leading-relaxed">
            *Didukung pula oleh kegiatan pendidikan diniyah, pengajian, dan pembelajaran keagamaan masyarakat.
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
      desc: 'Pertanian merupakan sektor utama penopang mata pencaharian warga. Lahan sawah dan perkebunan menghasilkan komoditas padi, jagung, kelapa, singkong, hortikultura, dan aneka tanaman produktif.',
      icon: Sprout,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50'
    },
    {
      title: 'Peternakan Rakyat',
      desc: 'Usaha peternakan sapi, kambing, ayam, dan itik berkembang aktif di masyarakat sebagai tabungan ekonomi keluarga dan penopang ketahanan pangan hewani.',
      icon: Beef,
      color: 'text-amber-700',
      bg: 'bg-amber-50'
    },
    {
      title: 'UMKM & Usaha Rumah Tangga',
      desc: 'Perdagangan, warung sembako, kuliner lokal, industri makanan olahan rumahan, kerajinan, dan produk unggulan masyarakat yang terus bertumbuh dinamis.',
      icon: Store,
      color: 'text-rose-700',
      bg: 'bg-rose-50'
    },
    {
      title: 'Potensi Wisata, SDA & Budaya',
      desc: 'Keindahan alam pedesaan yang asri, potensi sumber daya alam lestari, serta kekayaan tradisi lokal seperti sedekah bumi dan pagelaran seni kemasyarakatan.',
      icon: Landmark,
      color: 'text-teal-700',
      bg: 'bg-teal-50'
    },
  ];

  return (
    <div className="space-y-16">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge className="bg-emerald-50 text-emerald-700 font-black uppercase text-[10px] tracking-widest px-4 py-1.5 border-none shadow-sm">
          Potensi Ekonomi & Kemasyarakatan
        </Badge>
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 uppercase font-display italic">
          Potensi <span className="text-primary not-italic">Unggulan Desa</span>
        </h2>
        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em]">Sektor Pertanian, Peternakan, UMKM, dan Modal Sosial Karanggintung</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-8">
        {potentials.map((item, i) => (
          <Card key={i} className="rounded-3xl md:rounded-[2.5rem] border-none shadow-sm hover:shadow-2xl transition-all duration-500 bg-white group flex flex-col h-full">
            <CardContent className="p-8 md:p-10 flex flex-col h-full space-y-6">
              <div className={cn("w-16 h-16 rounded-3xl flex items-center justify-center transition-transform group-hover:rotate-12 group-hover:scale-110", item.bg, item.color)}>
                <item.icon className="h-8 w-8" />
              </div>
              <div className="space-y-3 flex-1">
                <h4 className="text-xl font-black uppercase tracking-tight text-slate-800 leading-tight font-display">{item.title}</h4>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  {item.desc}
                </p>
              </div>
              <div className="w-8 h-1 bg-secondary rounded-full group-hover:w-full transition-all duration-500" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* MODAL SOSIAL, KEAGAMAAN & GOTONG ROYONG */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
          <div className="p-3 bg-emerald-50 text-emerald-700 w-fit rounded-2xl"><Users className="h-6 w-6" /></div>
          <h4 className="text-lg font-black text-slate-900 uppercase font-display">Gotong Royong & Kearifan</h4>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Nilai kebersamaan, kerja bakti, musyawarah, dan tradisi sedekah bumi yang terus dirawat dan diwariskan kepada generasi muda.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
          <div className="p-3 bg-amber-50 text-amber-700 w-fit rounded-2xl"><Heart className="h-6 w-6" /></div>
          <h4 className="text-lg font-black text-slate-900 uppercase font-display">Kehidupan Keagamaan</h4>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Aktivitas keagamaan di masjid dan musala, pengajian rutin, peringatan hari besar Islam, dan pembinaan karakter masyarakat desa.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
          <div className="p-3 bg-blue-50 text-blue-700 w-fit rounded-2xl"><TrendingUp className="h-6 w-6" /></div>
          <h4 className="text-lg font-black text-slate-900 uppercase font-display">Potensi SDM Produktif</h4>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Hampir 10 ribu jiwa penduduk dengan mayoritas usia produktif siap menjadi penggerak kemajuan ekonomi desa mandiri dan berdaya saing.
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
    <div className="space-y-16">
      {/* Video Profile Section */}
      <section className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl"><PlayCircle className="h-6 w-6" /></div>
          <h3 className="text-2xl font-black uppercase tracking-tight text-slate-800">Video Profil Resmi Desa Karanggintung</h3>
        </div>
        <Card className="rounded-3xl md:rounded-[3rem] overflow-hidden border-none shadow-2xl aspect-video bg-slate-900 group">
          {youtubeEmbedUrl ? (
            <iframe
              src={youtubeEmbedUrl}
              title="Profil Desa Karanggintung"
              className="w-full h-full opacity-80 group-hover:opacity-100 transition-opacity"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="flex h-full min-h-[240px] md:min-h-[320px] items-center justify-center bg-slate-950 text-center text-slate-200">
              <div className="space-y-3 px-6">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-600 text-white">
                  <PlayCircle className="h-6 w-6" />
                </div>
                <p className="text-base md:text-lg font-semibold">Video profil desa belum dikonfigurasi.</p>
                <p className="text-xs md:text-sm text-slate-300">Silakan atur tautan YouTube di halaman Pengaturan Admin.</p>
              </div>
            </div>
          )}
        </Card>
      </section>

      {/* Photo Gallery Grid */}
      <section className="space-y-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary text-white rounded-2xl"><ImageIcon className="h-6 w-6" /></div>
          <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-800">Dokumentasi Kegiatan</h3>
        </div>

        {isLoadingNews ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 md:gap-6 space-y-4 md:space-y-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-2xl md:rounded-[2rem]" />
            ))}
          </div>
        ) : documentationPhotos.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="inline-flex p-4 bg-slate-100 rounded-full mb-4">
              <ImageIcon className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-slate-600 font-semibold">Belum ada dokumentasi kegiatan.</p>
            <p className="text-slate-400 text-sm">Foto dokumentasi akan muncul ketika berita dengan foto ditambahkan.</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 md:gap-6 space-y-4 md:space-y-6">
            {documentationPhotos.map((photo, i) => (
              <div key={i} className="rounded-2xl md:rounded-[2rem] overflow-hidden border-4 border-white shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer group relative">
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <p className="text-white text-sm font-semibold line-clamp-2">{photo.title}</p>
                  {photo.date && (
                    <p className="text-white/70 text-xs mt-1">{photo.date}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center py-10">
          <Link href="/BeritaDesa/">
            <Button variant="outline" className="rounded-xl font-bold gap-2 border-primary text-primary h-12 px-10">
              Lihat Seluruh Berita
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

function OfficialCard({ official, isSmall = false }: { official: Official, isSmall?: boolean }) {
  return (
    <div className={`group bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden`}>
      <div className="relative aspect-[4/5] w-full bg-slate-100 overflow-hidden">
        {official.imageUrl ? (
          <img src={official.imageUrl} alt={official.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/5">
            <UserCircle2 className="h-16 w-16 text-primary/10" />
          </div>
        )}
      </div>
      <div className={`${isSmall ? 'p-4' : 'p-6'} space-y-2`}>
        <div className="w-10 h-1 bg-secondary rounded-full group-hover:w-full transition-all duration-500" />
        <h3 className={`${isSmall ? 'text-[11px]' : 'text-sm'} font-black text-slate-900 uppercase leading-tight line-clamp-2`}>
          {official.name}
        </h3>
        <p className={`${isSmall ? 'text-[8px]' : 'text-[10px]'} font-bold text-primary uppercase tracking-widest italic`}>
          {official.position}
        </p>
      </div>
    </div>
  );
}
