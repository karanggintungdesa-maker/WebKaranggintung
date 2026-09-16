'use client';

import React, { useState, useMemo } from 'react';
import { PageHeader } from '@/components/page-header';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, UserPlus, FileUp, UserCircle2, ShieldCheck, Landmark, ShieldAlert, HeartHandshake } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { OfficialForm, OfficialCategory, Official } from './_components/official-form';
import { ImportOfficialDialog } from './_components/import-official-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminPemerintahanPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<OfficialCategory>('perangkat');
  const [editingOfficial, setEditingOfficial] = useState<Official | null>(null);
  
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  const officialsQuery = useMemoFirebase(() => {
    if (!firestore) {
      return null;
    }
    return query(collection(firestore, 'officials'), orderBy('name', 'asc'));
  }, [firestore]);

  const { data: officials, isLoading } = useCollection<Official>(officialsQuery);

  const processedData = useMemo(() => {
    if (!officials) return { perangkat: [], bpd: [], rtrw: [], linmas: [], posyandu: [] };

    const getPerangkatRank = (pos: string) => {
      const p = pos.toLowerCase();
      if (p.includes('staf') || p.includes('staff')) return 5;
      if (p.includes('kepala desa') || p.includes('kades')) return 1;
      if (p.includes('sekretaris') || p.includes('sekdes')) return 2;
      if (p.includes('kasi') || p.includes('kaur')) return 3;
      if (p.includes('kadus') || p.includes('kepala dusun')) return 4;
      return 6;
    };

    const perangkat = [...officials]
      .filter(o => o.category === 'perangkat')
      .sort((a, b) => getPerangkatRank(a.position) - getPerangkatRank(b.position));

    const bpd = [...officials]
      .filter(o => o.category === 'bpd')
      .sort((a, b) => {
        if (a.position.toLowerCase().includes('ketua') && !b.position.toLowerCase().includes('ketua')) return -1;
        if (!a.position.toLowerCase().includes('ketua') && b.position.toLowerCase().includes('ketua')) return 1;
        return a.name.localeCompare(b.name);
      });

    const rtrw = [...officials]
      .filter(o => o.category === 'rtrw')
      .sort((a, b) => {
        const rwA = a.position.match(/RW\s?(\d+)/i)?.[1] || '0';
        const rwB = b.position.match(/RW\s?(\d+)/i)?.[1] || '0';
        if (rwA !== rwB) return parseInt(rwA) - parseInt(rwB);

        const isRwHeadA = a.position.toLowerCase().includes('ketua rw');
        const isRwHeadB = b.position.toLowerCase().includes('ketua rw');
        if (isRwHeadA && !isRwHeadB) return -1;
        if (!isRwHeadA && isRwHeadB) return 1;

        const rtA = a.position.match(/RT\s?(\d+)/i)?.[1] || '0';
        const rtB = b.position.match(/RT\s?(\d+)/i)?.[1] || '0';
        return parseInt(rtA) - parseInt(rtB);
      });

    const linmas = [...officials]
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

    const posyandu = [...officials]
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

    return { perangkat, bpd, rtrw, linmas, posyandu };
  }, [officials]);

  const handleDelete = async (id: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, 'officials', id));
      toast({ title: "Data Dihapus" });
    } catch (e: any) {
      toast({ title: "Gagal Menghapus", variant: "destructive" });
    }
  };

  const getTabLabel = (tab: OfficialCategory) => {
    switch (tab) {
      case 'perangkat': return 'Perangkat Desa';
      case 'bpd': return 'BPD Desa';
      case 'rtrw': return 'RT / RW';
      case 'linmas': return 'Satuan Linmas';
      case 'posyandu': return 'Kader Posyandu';
    }
  };

  if (isUserLoading || !user) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Pemerintahan & Kelembagaan Desa"
        description="Manajemen pengurus Perangkat Desa, BPD, RT/RW, Satuan Linmas, dan Kader Posyandu Desa Karanggintung."
      />

      <Tabs defaultValue="perangkat" className="w-full space-y-4 sm:space-y-8" onValueChange={(v) => setActiveTab(v as OfficialCategory)}>
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 sm:gap-6">
          <TabsList className="bg-slate-100 p-1 sm:p-1.5 rounded-2xl h-auto flex-wrap justify-start shadow-inner gap-1">
            <TabsTrigger value="perangkat" className="rounded-xl px-3 sm:px-5 py-2 sm:py-3 font-black uppercase text-[9px] sm:text-[10px] tracking-wider sm:tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
               <UserCircle2 className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600" /> Perangkat Desa
            </TabsTrigger>
            <TabsTrigger value="bpd" className="rounded-xl px-3 sm:px-5 py-2 sm:py-3 font-black uppercase text-[9px] sm:text-[10px] tracking-wider sm:tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
               <ShieldCheck className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" /> BPD Desa
            </TabsTrigger>
            <TabsTrigger value="rtrw" className="rounded-xl px-3 sm:px-5 py-2 sm:py-3 font-black uppercase text-[9px] sm:text-[10px] tracking-wider sm:tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
               <Landmark className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600" /> RT / RW
            </TabsTrigger>
            <TabsTrigger value="posyandu" className="rounded-xl px-3 sm:px-5 py-2 sm:py-3 font-black uppercase text-[9px] sm:text-[10px] tracking-wider sm:tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
               <HeartHandshake className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-rose-600" /> Kader Posyandu
            </TabsTrigger>
            <TabsTrigger value="linmas" className="rounded-xl px-3 sm:px-5 py-2 sm:py-3 font-black uppercase text-[9px] sm:text-[10px] tracking-wider sm:tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
               <ShieldAlert className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600" /> Satuan Linmas
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsImportOpen(true)} className="rounded-xl font-bold h-9 sm:h-11 px-3.5 sm:px-5 text-xs sm:text-sm border-slate-200 flex-1 sm:flex-none">
              <FileUp className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Impor {getTabLabel(activeTab)}
            </Button>
            <Button size="sm" onClick={() => { setEditingOfficial(null); setIsFormOpen(true); }} className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold h-9 sm:h-11 px-3.5 sm:px-5 text-xs sm:text-sm shadow-md shadow-emerald-700/20 flex-1 sm:flex-none">
              <UserPlus className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Tambah {getTabLabel(activeTab)}
            </Button>
          </div>
        </div>

        <TabsContent value="perangkat" className="space-y-4 outline-none">
          <OfficialTable 
            data={processedData.perangkat} 
            isLoading={isLoading} 
            onEdit={(o) => { setEditingOfficial(o); setIsFormOpen(true); }} 
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="bpd" className="space-y-4 outline-none">
          <OfficialTable 
            data={processedData.bpd} 
            isLoading={isLoading} 
            onEdit={(o) => { setEditingOfficial(o); setIsFormOpen(true); }} 
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="rtrw" className="space-y-4 outline-none">
          <div className="p-3 sm:p-4 bg-amber-50 border border-amber-100 rounded-xl sm:rounded-2xl text-[10px] font-bold text-amber-800 uppercase tracking-widest mb-4 sm:mb-6">
            Sistem mengurutkan berdasarkan nomor RW lalu nomor RT di dalamnya.
          </div>
          <OfficialTable 
            data={processedData.rtrw} 
            isLoading={isLoading} 
            onEdit={(o) => { setEditingOfficial(o); setIsFormOpen(true); }} 
            onDelete={handleDelete}
            isRtrw
          />
        </TabsContent>

        <TabsContent value="posyandu" className="space-y-4 outline-none">
          <div className="p-3 sm:p-4 bg-rose-50 border border-rose-100 rounded-xl sm:rounded-2xl text-[10px] font-bold text-rose-800 uppercase tracking-widest mb-4 sm:mb-6">
            Kader Posyandu Desa Karanggintung untuk pelayanan kesehatan balita, ibu hamil, dan lansia.
          </div>
          <OfficialTable 
            data={processedData.posyandu} 
            isLoading={isLoading} 
            onEdit={(o) => { setEditingOfficial(o); setIsFormOpen(true); }} 
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="linmas" className="space-y-4 outline-none">
          <div className="p-3 sm:p-4 bg-amber-50 border border-amber-100 rounded-xl sm:rounded-2xl text-[10px] font-bold text-amber-800 uppercase tracking-widest mb-4 sm:mb-6">
            Satuan Perlindungan Masyarakat (Satlinmas) Desa Karanggintung untuk menjaga ketertiban, keamanan, dan perlindungan warga.
          </div>
          <OfficialTable 
            data={processedData.linmas} 
            isLoading={isLoading} 
            onEdit={(o) => { setEditingOfficial(o); setIsFormOpen(true); }} 
            onDelete={handleDelete}
          />
        </TabsContent>
      </Tabs>

      <OfficialForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        official={editingOfficial} 
        defaultCategory={activeTab}
      />
      <ImportOfficialDialog 
        open={isImportOpen} 
        onOpenChange={setIsImportOpen} 
        defaultCategory={activeTab}
      />
    </>
  );
}

function OfficialTable({ 
  data, 
  isLoading, 
  onEdit, 
  onDelete,
  isRtrw = false
}: { 
  data: Official[], 
  isLoading: boolean, 
  onEdit: (o: Official) => void, 
  onDelete: (id: string) => void,
  isRtrw?: boolean
}) {
  return (
    <div className="rounded-2xl sm:rounded-[2rem] border bg-white overflow-hidden shadow-sm">
      {/* Mobile Card List View (block sm:hidden) - Full screen width, zero horizontal scrolling */}
      <div className="block sm:hidden divide-y divide-slate-100">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-3.5 space-y-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-11 w-11 rounded-xl" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-8 w-full rounded-lg" />
            </div>
          ))
        ) : data.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs italic">
            Data belum tersedia. Klik tombol Tambah untuk menambahkan data baru.
          </div>
        ) : (
          data.map((official, idx) => {
            let showDivider = false;
            let rwNum = '';
            if (isRtrw && idx > 0) {
              const prevRw = data[idx - 1].position.match(/RW\s?(\d+)/i)?.[1];
              const currRw = official.position.match(/RW\s?(\d+)/i)?.[1];
              if (prevRw !== currRw) {
                showDivider = true;
                rwNum = currRw || '';
              }
            }

            return (
              <React.Fragment key={official.id}>
                {showDivider && (
                  <div className="p-2 bg-slate-50 border-y text-center">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                      Pemisah Wilayah RW {rwNum ? `0${rwNum}`.slice(-2) : ''}
                    </span>
                  </div>
                )}
                <div className="p-3.5 space-y-2.5 bg-white">
                  <div className="flex items-start gap-3">
                    <div className="h-11 w-11 rounded-xl overflow-hidden border bg-muted shrink-0">
                      {official.imageUrl ? (
                        <img src={official.imageUrl} alt={official.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <UserCircle2 className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="font-black text-xs uppercase text-slate-800 leading-snug break-words">
                        {official.name}
                      </p>
                      <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tight ${
                        official.position.toLowerCase().includes('ketua') || official.position.toLowerCase().includes('danton') || official.position.toLowerCase().includes('kepala')
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-slate-100 text-slate-600'
                      }`}>
                        {official.position}
                      </span>
                    </div>
                  </div>

                  {/* Baris Tombol Aksi Sentuh */}
                  <div className="flex items-center gap-2 pt-1.5 border-t border-slate-100">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(official)}
                      className="h-8 text-[11px] font-bold rounded-lg flex-1 text-emerald-700 hover:text-emerald-800 border-emerald-200 hover:bg-emerald-50 gap-1.5"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      <span>Edit Data</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => official.id && onDelete(official.id)}
                      className="h-8 px-2.5 text-[11px] font-bold rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 gap-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Hapus</span>
                    </Button>
                  </div>
                </div>
              </React.Fragment>
            );
          })
        )}
      </div>

      {/* Desktop Table View (hidden sm:block) */}
      <div className="hidden sm:block overflow-x-auto w-full">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="pl-8 h-14 font-black uppercase text-[10px] tracking-widest text-slate-400">Foto</TableHead>
              <TableHead className="h-14 font-black uppercase text-[10px] tracking-widest text-slate-400">Nama Lengkap</TableHead>
              <TableHead className="h-14 font-black uppercase text-[10px] tracking-widest text-slate-400">Jabatan / Peran</TableHead>
              <TableHead className="text-right pr-8 h-14 font-black uppercase text-[10px] tracking-widest text-slate-400">Kelola</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={4} className="px-8 py-4"><Skeleton className="h-10 w-full" /></TableCell></TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-slate-400 font-medium italic">Data belum tersedia. Klik tombol Tambah untuk menambahkan data baru.</TableCell>
              </TableRow>
            ) : (
              data.map((official, idx) => {
                let showDivider = false;
                if (isRtrw && idx > 0) {
                  const prevRw = data[idx - 1].position.match(/RW\s?(\d+)/i)?.[1];
                  const currRw = official.position.match(/RW\s?(\d+)/i)?.[1];
                  if (prevRw !== currRw) showDivider = true;
                }

                return (
                  <React.Fragment key={official.id}>
                    {showDivider && (
                      <TableRow className="bg-slate-50 hover:bg-slate-50">
                        <TableCell colSpan={4} className="h-10 py-0 text-center">
                          <div className="flex items-center gap-2">
                             <div className="h-px flex-1 bg-slate-200" />
                             <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Pemisah Wilayah RW</span>
                             <div className="h-px flex-1 bg-slate-200" />
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow className="hover:bg-slate-50/80 transition-colors group">
                      <TableCell className="pl-8">
                         <div className="h-10 w-10 rounded-xl overflow-hidden border bg-muted">
                            {official.imageUrl ? (
                              <img src={official.imageUrl} alt={official.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                 <UserCircle2 className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                         </div>
                      </TableCell>
                      <TableCell className="font-black text-sm uppercase py-5 text-slate-700">
                        {official.name}
                      </TableCell>
                      <TableCell>
                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter ${
                          official.position.toLowerCase().includes('ketua') || official.position.toLowerCase().includes('danton') || official.position.toLowerCase().includes('kepala')
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-slate-100 text-slate-600'
                        }`}>
                          {official.position}
                        </span>
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        <div className="flex justify-end gap-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-200 hover:text-emerald-700 hover:border-emerald-300" onClick={() => onEdit(official)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-400 hover:text-red-600" onClick={() => official.id && onDelete(official.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
