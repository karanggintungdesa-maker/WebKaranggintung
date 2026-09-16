'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  ShieldCheck, 
  MapPinned, 
  Store, 
  Baby, 
  Skull, 
  Heart, 
  Home, 
  Music, 
  Users, 
  Flower2, 
  UserCheck, 
  Activity, 
  HandHelping,
  ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SktmForm } from './forms/sktm-form';
import { SkckForm } from './forms/skck-form';
import { PindahForm } from './forms/pindah-form';
import { SkuForm } from './forms/sku-form';
import { KelahiranForm } from './forms/kelahiran-form';
import { KematianForm } from './forms/kematian-form';
import { BelumMenikahForm } from './forms/belum-menikah-form';
import { DomisiliForm } from './forms/domisili-form';
import { IjinKeramaianForm } from './forms/ijin-keramaian-form';
import { MoyangForm } from './forms/moyang-form';
import { PemakamanForm } from './forms/pemakaman-form';
import { WaliForm } from './forms/wali-form';
import { ReaktivasiBpjsForm } from './forms/reaktivasi-bpjs-form';
import { PengantarUmumForm } from './forms/pengantar-umum-form';
import { KeteranganUmumForm } from './forms/keterangan-umum-form';

interface LetterServiceProps {
  isAdmin?: boolean;
}

const letterOptions = [
  { type: 'Surat Keterangan Umum', icon: FileText, color: 'bg-slate-100 text-slate-700', description: 'Keperluan administratif desa secara umum.' },
  { type: 'Surat Keterangan Tidak Mampu', icon: HandHelping, color: 'bg-orange-100 text-orange-600', description: 'Untuk bantuan sosial & biaya sekolah.' },
  { type: 'Surat Pengantar SKCK', icon: ShieldCheck, color: 'bg-emerald-100 text-emerald-700', description: 'Persyaratan melamar pekerjaan / kepolisian.' },
  { type: 'Surat Pengantar Pindah', icon: MapPinned, color: 'bg-teal-100 text-teal-700', description: 'Keterangan pindah domisili antar wilayah.' },
  { type: 'Surat Keterangan Usaha', icon: Store, color: 'bg-purple-100 text-purple-600', description: 'Untuk pengajuan KUR / identitas UMKM.' },
  { type: 'Surat Keterangan Kelahiran', icon: Baby, color: 'bg-pink-100 text-pink-600', description: 'Data kelahiran baru bagi warga desa.' },
  { type: 'Surat Keterangan Kematian', icon: Skull, color: 'bg-slate-200 text-slate-700', description: 'Surat keterangan duka cita & lapor diri.' },
  { type: 'Surat Keterangan Belum Menikah', icon: Heart, color: 'bg-red-100 text-red-600', description: 'Syarat pernikahan atau status lajang.' },
  { type: 'Surat Keterangan Domisili', icon: Home, color: 'bg-amber-100 text-amber-700', description: 'Keterangan tempat tinggal sementara.' },
  { type: 'Surat Ijin Keramaian', icon: Music, color: 'bg-indigo-100 text-indigo-600', description: 'Syarat mengadakan acara / hajatan.' },
  { type: 'Surat Keterangan Moyang', icon: Users, color: 'bg-teal-100 text-teal-600', description: 'Keterangan silsilah keluarga / garis keturunan.' },
  { type: 'Surat Keterangan Pemakaman', icon: Flower2, color: 'bg-emerald-100 text-emerald-700', description: 'Ijin penguburan di makam umum desa.' },
  { type: 'Surat Keterangan Wali', icon: UserCheck, color: 'bg-teal-100 text-teal-700', description: 'Keterangan perwalian anak di bawah umur.' },
  { type: 'Surat Keterangan Reaktivasi BPJS Kesehatan', icon: Activity, color: 'bg-rose-100 text-rose-600', description: 'Pengurusan BPJS yang terblokir / nonaktif.' },
  { type: 'Surat Pengantar Umum', icon: FileText, color: 'bg-slate-100 text-slate-700', description: 'Keperluan pengantar administrasi umum lainnya.' },
];

export function LetterService({ isAdmin = false }: LetterServiceProps) {
  const [selectedLetter, setSelectedLetter] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const renderForm = () => {
    const props = { isAdmin };
    switch (selectedLetter) {
      case 'Surat Keterangan Umum': return <KeteranganUmumForm {...props} />;
      case 'Surat Keterangan Tidak Mampu': return <SktmForm {...props} />;
      case 'Surat Pengantar SKCK': return <SkckForm {...props} />;
      case 'Surat Pengantar Pindah': return <PindahForm {...props} />;
      case 'Surat Keterangan Usaha': return <SkuForm {...props} />;
      case 'Surat Keterangan Kelahiran': return <KelahiranForm {...props} />;
      case 'Surat Keterangan Kematian': return <KematianForm {...props} />;
      case 'Surat Keterangan Belum Menikah': return <BelumMenikahForm {...props} />;
      case 'Surat Keterangan Domisili': return <DomisiliForm {...props} />;
      case 'Surat Ijin Keramaian': return <IjinKeramaianForm {...props} />;
      case 'Surat Keterangan Moyang': return <MoyangForm {...props} />;
      case 'Surat Keterangan Pemakaman': return <PemakamanForm {...props} />;
      case 'Surat Keterangan Wali': return <WaliForm {...props} />;
      case 'Surat Keterangan Reaktivasi BPJS Kesehatan': return <ReaktivasiBpjsForm {...props} />;
      case 'Surat Pengantar Umum': return <PengantarUmumForm {...props} />;
      default: return null;
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-8">
      {!selectedLetter ? (
        <div className="space-y-6">

          {/* ── Section Title ── */}
          <div className="text-center space-y-1.5 sm:space-y-2">
            <h2 className="text-xl min-[380px]:text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight font-display italic">
              Pilih <span className="text-primary not-italic">Layanan Surat</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-md mx-auto">
              Pilih jenis surat yang Anda butuhkan untuk memulai pengisian formulir pengajuan.
            </p>
          </div>

          {/* ── Card Grid — compact 2 columns on mobile ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3">
            {letterOptions.map((opt) => (
              <button
                key={opt.type}
                onClick={() => {
                  setSelectedLetter(opt.type);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="group relative bg-white rounded-2xl p-2.5 min-[380px]:p-3 sm:p-5 flex flex-col items-center text-center gap-2 sm:gap-2.5 border border-slate-100 shadow-xs sm:shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-primary/20 transition-all duration-300 cursor-pointer"
              >
                {/* Icon */}
                <div className={cn(
                  'w-8 h-8 min-[380px]:w-9 min-[380px]:h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105 shrink-0',
                  opt.color
                )}>
                  <opt.icon className="h-4 w-4 sm:h-[22px] sm:w-[22px]" />
                </div>

                {/* Name */}
                <div className="space-y-0.5 sm:space-y-1 w-full">
                  <h3 className="text-[10px] min-[380px]:text-[11px] sm:text-xs font-bold text-slate-800 leading-tight group-hover:text-primary transition-colors line-clamp-2 text-center">
                    {opt.type}
                  </h3>
                  <p className="text-[8.5px] min-[380px]:text-[9px] sm:text-[10px] text-slate-400 font-medium leading-relaxed line-clamp-2 hidden sm:block text-center">
                    {opt.description}
                  </p>
                </div>

                {/* CTA hint */}
                <span className="text-[8px] min-[380px]:text-[8.5px] sm:text-[9px] font-bold text-primary/80 uppercase tracking-wider group-hover:text-primary transition-colors">
                  Ajukan &rarr;
                </span>
              </button>
            ))}
          </div>
        </div>

      ) : (
        /* ── Form Card ── */
        <Card className="rounded-2xl sm:rounded-3xl border-none shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
          <CardHeader className="bg-primary p-5 sm:p-7 md:p-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 sm:p-6 opacity-10 pointer-events-none">
              <FileText className="w-20 h-20 sm:w-28 sm:h-28" />
            </div>
            <div className="space-y-3 sm:space-y-4 relative z-10">
              <Button
                variant="ghost"
                onClick={() => setSelectedLetter('')}
                className="text-white hover:bg-white/10 -ml-2 font-bold uppercase text-[9px] tracking-[0.3em] h-7 px-2 gap-1.5"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Kembali
              </Button>
              <div className="space-y-1">
                <CardTitle className="text-lg sm:text-2xl md:text-3xl font-black uppercase font-display italic tracking-tight leading-tight">
                  {selectedLetter}
                </CardTitle>
                <CardDescription className="text-white/60 font-medium text-sm">
                  Lengkapi formulir pengajuan {isAdmin ? 'oleh Admin ' : ''}secara akurat dan lengkap.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 md:p-10 bg-white">
            {renderForm()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
