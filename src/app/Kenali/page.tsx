
'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UserCircle2, ShieldCheck, Landmark, ShieldAlert, HeartHandshake } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type Official = {
  id: string;
  name: string;
  position: string;
  imageUrl?: string;
  category: 'perangkat' | 'bpd' | 'rtrw' | 'linmas' | 'posyandu';
};

export default function KenaliKamiPage() {
  const firestore = useFirestore();

  const officialsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'officials'), orderBy('name', 'asc'));
  }, [firestore]);

  const { data: officials, isLoading } = useCollection<Official>(officialsQuery);

  const processedData = useMemo(() => {
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

    const linmas = officials
      .filter(o => o.category === 'linmas')
      .sort((a, b) => {
        const getLinmasRank = (pos: string) => {
          const p = pos.toLowerCase();
          if (p.includes('danton') || p.includes('komandan pleton') || p.includes('kepala satgas')) return 1;
          if (p.includes('danru') || p.includes('komandan regu')) return 2;
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

    return { perangkat, bpd, rtrwGroups, linmas, posyandu };
  }, [officials]);

  const categories = [
    { id: 'perangkat', label: 'Perangkat Desa', icon: UserCircle2 },
    { id: 'bpd', label: 'BPD Desa', icon: ShieldCheck },
    { id: 'rtrw', label: 'Ketua RT / RW', icon: Landmark },
    { id: 'posyandu', label: 'Kader Posyandu', icon: HeartHandshake },
    { id: 'linmas', label: 'Satuan Linmas', icon: ShieldAlert },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background overflow-x-hidden w-full">
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md font-sans">
        <div className="container mx-auto px-4 h-16 sm:h-20 flex items-center justify-between">
          <Logo />
          <Link href="/">
            <Button variant="ghost" className="font-bold gap-2 text-primary hover:bg-primary/10 text-xs sm:text-sm">
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
        <div className="max-w-4xl mx-auto text-center mb-6 sm:mb-12 space-y-2 sm:space-y-4">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-display font-semibold text-slate-900 uppercase tracking-tighter">
            Pemerintahan <span className="text-primary italic">Desa</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.3em] font-sans">Mengenal Struktur Organisasi Desa Karanggintung</p>
        </div>

        <Tabs defaultValue="perangkat" className="w-full space-y-5 sm:space-y-10">
          <div className="flex justify-center mb-6 sm:mb-12 w-full">
            <TabsList className="bg-slate-200/60 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl h-auto grid grid-cols-6 sm:flex sm:flex-wrap justify-center border border-slate-200/80 gap-1 w-full max-w-3xl">
              {categories.map((cat, idx) => {
                const colSpan = idx < 3 ? "col-span-2 sm:col-auto" : "col-span-3 sm:col-auto";
                return (
                  <TabsTrigger
                    key={cat.id}
                    value={cat.id}
                    className={cn(
                      "rounded-lg sm:rounded-xl px-1.5 sm:px-6 md:px-8 py-2 sm:py-3 font-black uppercase text-[8px] min-[380px]:text-[9px] sm:text-[10px] tracking-wider data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all flex items-center justify-center gap-1 sm:gap-1.5",
                      colSpan
                    )}
                  >
                    <cat.icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                    <span className="truncate">{cat.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          <TabsContent value="perangkat">
            {isLoading ? (
              <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-4 gap-2 min-[380px]:gap-2.5 sm:gap-6 lg:gap-8">
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-xl sm:rounded-[2.5rem]" />)}
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-4 gap-2 min-[380px]:gap-2.5 sm:gap-6 lg:gap-8">
                {processedData.perangkat.map(official => (
                  <OfficialCard key={official.id} official={official} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="bpd">
            {isLoading ? (
              <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-4 gap-2 min-[380px]:gap-2.5 sm:gap-6 lg:gap-8">
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-xl sm:rounded-[2.5rem]" />)}
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-4 gap-2 min-[380px]:gap-2.5 sm:gap-6 lg:gap-8">
                {processedData.bpd.map(official => (
                  <OfficialCard key={official.id} official={official} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rtrw">
            {isLoading ? (
              <div className="space-y-6 sm:space-y-12">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 sm:h-64 w-full rounded-2xl sm:rounded-3xl" />)}
              </div>
            ) : (
              <div className="space-y-8 sm:space-y-20">
                {processedData.rtrwGroups.map((group, i) => (
                  <div key={i} className="space-y-4 sm:space-y-8">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="h-px flex-1 bg-slate-200" />
                      <h3 className="font-black text-[9px] min-[380px]:text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.4em] text-slate-500 bg-white px-4 sm:px-6 py-1 sm:py-2 rounded-full border">
                        {group.rwLabel}
                      </h3>
                      <div className="h-px flex-1 bg-slate-200" />
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-5 gap-2 min-[380px]:gap-2.5 sm:gap-6">
                      {group.members.map(official => (
                        <OfficialCard key={official.id} official={official} isSmall />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="posyandu">
            {isLoading ? (
              <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-4 gap-2 min-[380px]:gap-2.5 sm:gap-6 lg:gap-8">
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-xl sm:rounded-[2.5rem]" />)}
              </div>
            ) : processedData.posyandu.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-4 gap-2 min-[380px]:gap-2.5 sm:gap-6 lg:gap-8">
                {processedData.posyandu.map(official => (
                  <OfficialCard key={official.id} official={official} />
                ))}
              </div>
            ) : (
              <div className="p-8 sm:p-12 text-center bg-slate-50 rounded-2xl sm:rounded-3xl border border-dashed border-slate-200">
                <HeartHandshake className="h-8 w-8 sm:h-12 sm:w-12 text-slate-300 mx-auto mb-2 sm:mb-3" />
                <p className="text-xs sm:text-sm text-slate-500 font-medium">Data Kader Posyandu belum ditambahkan.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="linmas">
            {isLoading ? (
              <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-4 gap-2 min-[380px]:gap-2.5 sm:gap-6 lg:gap-8">
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-xl sm:rounded-[2.5rem]" />)}
              </div>
            ) : processedData.linmas.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-4 gap-2 min-[380px]:gap-2.5 sm:gap-6 lg:gap-8">
                {processedData.linmas.map(official => (
                  <OfficialCard key={official.id} official={official} />
                ))}
              </div>
            ) : (
              <div className="p-8 sm:p-12 text-center bg-slate-50 rounded-2xl sm:rounded-3xl border border-dashed border-slate-200">
                <ShieldAlert className="h-8 w-8 sm:h-12 sm:w-12 text-slate-300 mx-auto mb-2 sm:mb-3" />
                <p className="text-xs sm:text-sm text-slate-500 font-medium">Data Satuan Linmas belum ditambahkan.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <footer className="bg-[#081325] text-slate-400 py-8 sm:py-12 border-t border-slate-800/80 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <Logo />
          <p className="mt-4 sm:mt-8 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-500">
            © 2026 Pemerintah Desa Karanggintung • Website Resmi Pemerintahan Desa
          </p>
        </div>
      </footer>
    </div>
  );
}

function OfficialCard({ official, isSmall = false }: { official: Official, isSmall?: boolean }) {
  return (
    <div className="group bg-white rounded-xl sm:rounded-2xl md:rounded-[2.5rem] border border-slate-100 shadow-xs sm:shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between">
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
            <UserCircle2 className="h-8 w-8 sm:h-16 sm:w-16 text-primary/15" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent opacity-40 sm:opacity-60" />
      </div>
      <div className="p-1.5 min-[380px]:p-2 sm:p-5 space-y-1 sm:space-y-2 relative">
        <div className="w-5 h-0.5 sm:w-10 sm:h-1 bg-secondary rounded-full mb-1 sm:mb-3 group-hover:w-full transition-all duration-300" />
        <h3 className="text-[10px] min-[380px]:text-[10.5px] sm:text-base font-black text-slate-900 uppercase leading-tight font-sans line-clamp-2">
          {official.name}
        </h3>
        <p className="text-[7.5px] min-[380px]:text-[8px] sm:text-[10px] font-bold text-primary uppercase tracking-tight sm:tracking-widest font-sans italic line-clamp-2">
          {official.position}
        </p>
      </div>
    </div>
  );
}
