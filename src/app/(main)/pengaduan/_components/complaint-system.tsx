'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { summarizeComplaintFeedback } from '@/lib/gemini-client';
import { Complaint, CitizenProfile } from '@/lib/types';
import {
  Loader2,
  Send,
  Lightbulb,
  MessageSquare,
  Tag,
  Calendar,
  CornerDownRight,
  User,
  MapPin,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { addDoc, collection, serverTimestamp, query, orderBy, limit, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { getCitizenProfile } from '@/lib/citizens';

export function ComplaintSystem() {
  const [newComplaintText, setNewComplaintText] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterAddress, setReporterAddress] = useState('');
  const [profile, setProfile] = useState<CitizenProfile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { firestore, user } = useFirebase();

  const isAdmin = !!user;

  useEffect(() => {
    if (user && firestore) {
      getCitizenProfile(firestore, user.uid).then(setProfile);
    }
  }, [user, firestore]);

  const complaintsQuery = useMemoFirebase(() => {
    if (!firestore || !user || user.isAnonymous) return null;
    const baseQuery = collection(firestore, 'complaints');
    
    if (!isAdmin) {
      return query(
        baseQuery, 
        where('submitterAuthUid', '==', (user as any).uid),
        limit(100)
      );
    }

    return query(baseQuery, orderBy('submissionDate', 'desc'), limit(100));
  }, [firestore, user, isAdmin]);

  const { data: rawComplaints, isLoading: isLoadingComplaints } = useCollection<Complaint>(complaintsQuery, { realtime: true });

  const complaints = useMemo(() => {
    if (!rawComplaints) return null;
    if (isAdmin) return rawComplaints;

    return [...rawComplaints].sort((a, b) => {
      const dateA = a.submissionDate?.toMillis?.() || 0;
      const dateB = b.submissionDate?.toMillis?.() || 0;
      return dateB - dateA;
    });
  }, [rawComplaints, isAdmin]);

  const handleSubmit = async () => {
    if (!reporterName.trim() || !reporterAddress.trim() || !newComplaintText.trim()) {
      toast({
        title: 'Data Belum Lengkap',
        description: 'Silakan isi Nama, Alamat, dan isi Pengaduan Anda.',
        variant: 'destructive',
      });
      return;
    }

    if (!firestore) {
      toast({
        title: 'Gagal Mengirim',
        description: 'Koneksi ke database gagal. Coba lagi nanti.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { summary, keywords, sentiment } =
        await summarizeComplaintFeedback({
          complaintText: newComplaintText,
        });

      const complaintData = {
        description: newComplaintText,
        summaryLLM: summary,
        sentiment: sentiment,
        keywords: keywords,
        submitterAuthUid: user ? user.uid : null,
        reporterName: reporterName.toUpperCase(),
        reporterAddress: reporterAddress,
        phoneNumber: profile?.phoneNumber || '',
        email: profile?.email || '',
        status: 'New',
        submissionDate: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      await addDoc(collection(firestore, 'complaints'), complaintData);
      
      setNewComplaintText('');
      setReporterName('');
      setReporterAddress('');
      
      toast({
        title: 'Pengaduan Terkirim',
        description: 'Terima kasih atas masukan Anda. Kami akan segera meninjau laporan ini.',
      });
    } catch (error) {
      toast({
        title: 'Gagal Mengirim',
        description: 'Terjadi kesalahan saat memproses aduan. Coba lagi nanti.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
      {/* FORM CARD */}
      <div className="lg:col-span-1">
        <Card className="rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden border border-slate-200/80 bg-white">
          <CardHeader className="bg-primary text-white p-4 sm:p-6 md:p-8 space-y-1">
            <CardTitle className="text-base sm:text-lg md:text-xl font-extrabold uppercase tracking-tight">Buat Pengaduan</CardTitle>
            <CardDescription className="text-white/80 font-medium text-xs sm:text-sm">
              Sampaikan keluhan atau saran Anda secara langsung kepada pemerintah desa.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 md:p-8 space-y-3.5 sm:space-y-5">
            <div className="space-y-3 sm:space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">Nama Pengadu</Label>
                <Input 
                  placeholder="Nama Lengkap Anda"
                  value={reporterName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReporterName(e.target.value)}
                  disabled={isSubmitting}
                  className="rounded-xl border-slate-200 bg-slate-50/80 h-9 sm:h-11 text-xs sm:text-sm px-3"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">Alamat</Label>
                <Input 
                  placeholder="Dusun / RT / RW"
                  value={reporterAddress}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReporterAddress(e.target.value)}
                  disabled={isSubmitting}
                  className="rounded-xl border-slate-200 bg-slate-50/80 h-9 sm:h-11 text-xs sm:text-sm px-3"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">Isi Pengaduan</Label>
                <Textarea
                  placeholder="Tuliskan keluhan atau saran Anda secara detail di sini..."
                  className="rounded-xl border-slate-200 bg-slate-50/80 focus:ring-accent min-h-[100px] sm:min-h-[140px] text-xs sm:text-sm p-3"
                  value={newComplaintText}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewComplaintText(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-primary text-white font-bold h-10 sm:h-12 rounded-xl hover:bg-slate-800 transition-all text-xs sm:text-sm uppercase tracking-wider shadow-md shadow-primary/20"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              KIRIM PENGADUAN
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* HISTORY CARD */}
      <div className="lg:col-span-2">
        <Card className="rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200/80 bg-white overflow-hidden">
          <CardHeader className="p-4 sm:p-6 md:p-8 border-b border-slate-100 space-y-1">
            <CardTitle className="text-base sm:text-lg md:text-xl font-extrabold uppercase tracking-tight text-slate-900">
               {isAdmin ? 'Seluruh Pengaduan Warga' : 'Riwayat Pengaduan Saya'}
            </CardTitle>
            <CardDescription className="font-medium text-slate-500 text-xs sm:text-sm">
              Daftar laporan yang telah dikirimkan dan status penanganannya.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-3.5 sm:p-6 md:p-8 pt-3 sm:pt-6">
            {isLoadingComplaints || !user ? (
                 <div className="space-y-3">
                    <Skeleton className="h-16 w-full rounded-xl" />
                    <Skeleton className="h-16 w-full rounded-xl" />
                    <Skeleton className="h-16 w-full rounded-xl" />
                 </div>
            ) : complaints?.length === 0 ? (
                <div className="text-center py-12 sm:py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-4">
                    <MessageSquare className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-400 font-bold uppercase text-[10px] sm:text-xs tracking-wider">Belum ada pengaduan yang tercatat.</p>
                </div>
            ) : (
                <Accordion
                type="single"
                collapsible
                className="w-full space-y-2.5 sm:space-y-3"
                >
                {complaints?.map((complaint) => (
                    <AccordionItem
                    value={complaint.id}
                    key={complaint.id}
                    className="border border-slate-200/80 rounded-xl sm:rounded-2xl px-3.5 sm:px-5 transition-all hover:border-primary/20 hover:shadow-sm bg-white overflow-hidden"
                    >
                    <AccordionTrigger className="py-3 sm:py-4 hover:no-underline">
                        <div className="flex flex-col gap-1 text-left w-full pr-2">
                        <div className="flex justify-between items-start gap-2">
                            <p className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-1 uppercase tracking-tight">
                            {complaint.description}
                            </p>
                        </div>
                        <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                            <Calendar className="h-3 w-3 text-primary/60 shrink-0" />
                            <span>{complaint.submissionDate?.toDate().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric'})}</span>
                        </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 sm:space-y-6 pt-1 sm:pt-2 pb-4 sm:pb-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
                          <div className="space-y-1.5">
                            <p className="font-bold uppercase tracking-wider text-[9px] sm:text-[10px] text-slate-400 flex items-center gap-1.5">
                                <User className="w-3 h-3 text-primary/60" />
                                Identitas Pengadu
                            </p>
                            <div className="p-3 sm:p-4 rounded-xl bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold border border-slate-100 space-y-1">
                                <p className="uppercase">{complaint.reporterName || 'Anonim'}</p>
                                <p className="text-[11px] sm:text-xs text-slate-500 flex items-center gap-1.5"><MapPin className="h-3 w-3 shrink-0" /> {complaint.reporterAddress || '-'}</p>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <p className="font-bold uppercase tracking-wider text-[9px] sm:text-[10px] text-slate-400 flex items-center gap-1.5">
                                <MessageSquare className="w-3 h-3 text-primary/60" />
                                Detail Laporan
                            </p>
                            <div className="p-3 sm:p-4 rounded-xl bg-slate-50 text-slate-700 text-xs sm:text-sm font-medium border border-slate-100 leading-relaxed italic">
                                &quot;{complaint.description}&quot;
                            </div>
                          </div>
                        </div>

                        <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-dashed border-primary/20 bg-primary/5 space-y-3">
                          <h4 className="font-bold uppercase tracking-wider text-[9px] sm:text-[10px] text-primary flex items-center gap-1.5">
                              <Lightbulb className="w-3.5 h-3.5" />
                              Analisis AI Desa
                          </h4>
                          <div className="space-y-3 text-xs sm:text-sm">
                            <div className="space-y-1">
                              <p className="font-bold text-slate-900 uppercase text-[9px] sm:text-[10px]">Ringkasan Masalah:</p>
                              <p className="text-slate-600 leading-relaxed font-medium italic">
                                &quot;{complaint.summaryLLM}&quot;
                              </p>
                            </div>
                            <div className="space-y-1.5">
                              <p className="font-bold text-slate-900 uppercase text-[9px] sm:text-[10px]">Topik Terdeteksi:</p>
                              <div className="flex flex-wrap gap-1.5">
                                  {complaint.keywords?.map((kw, i) => (
                                  <Badge
                                      key={i}
                                      variant="outline"
                                      className="font-bold border-primary/20 text-primary uppercase text-[8px] sm:text-[9px] px-2.5 py-0.5 bg-white shadow-xs"
                                  >
                                      <Tag className="mr-1 h-2 w-2" />
                                      {kw}
                                  </Badge>
                                  ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {complaint.adminResponse && (
                            <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-emerald-800 bg-emerald-950 text-white space-y-2 sm:space-y-3 shadow-md">
                                <h4 className="font-bold uppercase tracking-wider text-[9px] sm:text-[10px] text-emerald-300 flex items-center gap-1.5">
                                    <CornerDownRight className="w-3.5 h-3.5" />
                                    Tanggapan Pemerintah Desa
                                </h4>
                                <p className="text-xs sm:text-sm font-medium leading-relaxed italic text-emerald-50">
                                    &quot;{complaint.adminResponse}&quot;
                                </p>
                            </div>
                        )}
                    </AccordionContent>
                    </AccordionItem>
                ))}
                </Accordion>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
