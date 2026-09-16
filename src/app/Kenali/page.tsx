
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
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md font-sans">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Logo />
          <Link href="/">
            <Button variant="ghost" className="font-bold gap-2 text-primary hover:bg-primary/10">
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto text-center mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-display font-semibold text-slate-900 uppercase tracking-tighter">
            Pemerintahan <span className="text-primary italic">Desa</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em] font-sans">Mengenal Struktur Organisasi Desa Karanggintung</p>
        </div>

        <Tabs defaultValue="perangkat" className="w-full">
          <div className="flex justify-center mb-12">
            <TabsList className="bg-slate-200/50 p-1.5 rounded-2xl h-auto flex flex-wrap justify-center border gap-1">
              {categories.map(cat => (
                <TabsTrigger
                  key={cat.id}
                  value={cat.id}
                  className="rounded-xl px-6 md:px-8 py-3 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
                >
                  <cat.icon className="mr-2 h-4 w-4" />
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="perangkat">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-[4/5] rounded-[2.5rem]" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {processedData.perangkat.map(official => (
                  <OfficialCard key={official.id} official={official} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="bpd">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-[4/5] rounded-[2.5rem]" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {processedData.bpd.map(official => (
                  <OfficialCard key={official.id} official={official} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rtrw">
            {isLoading ? (
              <div className="space-y-12">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-3xl" />)}
              </div>
            ) : (
              <div className="space-y-20">
                {processedData.rtrwGroups.map((group, i) => (
                  <div key={i} className="space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="h-px flex-1 bg-slate-200" />
                      <h3 className="font-black text-xs uppercase tracking-[0.4em] text-slate-400 bg-white px-6 py-2 rounded-full border">
                        {group.rwLabel}
                      </h3>
                      <div className="h-px flex-1 bg-slate-200" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-[4/5] rounded-[2.5rem]" />)}
              </div>
            ) : processedData.posyandu.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {processedData.posyandu.map(official => (
                  <OfficialCard key={official.id} official={official} />
                ))}
              </div>
            ) : (
              <div className="p-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <HeartHandshake className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">Data Kader Posyandu belum ditambahkan.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="linmas">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-[4/5] rounded-[2.5rem]" />)}
              </div>
            ) : processedData.linmas.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {processedData.linmas.map(official => (
                  <OfficialCard key={official.id} official={official} />
                ))}
              </div>
            ) : (
              <div className="p-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <ShieldAlert className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">Data Satuan Linmas belum ditambahkan.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <footer className="bg-[#081325] text-slate-400 py-12 border-t border-slate-800/80 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <Logo />
          <p className="mt-8 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            © 2026 Pemerintah Desa Karanggintung • Website Resmi Pemerintahan Desa
          </p>
        </div>
      </footer>
    </div>
  );
}

function OfficialCard({ official, isSmall = false }: { official: Official, isSmall?: boolean }) {
  return (
    <div className={`group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden`}>
      <div className="relative aspect-[4/5] w-full bg-slate-100 overflow-hidden">
        {official.imageUrl ? (
          <img
            src={official.imageUrl}
            alt={official.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/5">
            <UserCircle2 className="h-20 w-20 text-primary/10" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent opacity-60" />
      </div>
      <div className={`${isSmall ? 'p-5' : 'p-6'} space-y-2 relative`}>
        <div className="w-10 h-1 bg-secondary rounded-full mb-3 group-hover:w-full transition-all duration-500" />
        <h3 className={`${isSmall ? 'text-xs' : 'text-base'} font-black text-slate-900 uppercase leading-tight font-sans line-clamp-2`}>
          {official.name}
        </h3>
        <p className={`${isSmall ? 'text-[8px]' : 'text-[10px]'} font-bold text-primary uppercase tracking-widest font-sans italic`}>
          {official.position}
        </p>
      </div>
    </div>
  );
}
