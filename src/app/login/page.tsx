'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lock, Mail, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc } from 'firebase/firestore';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();

  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Jika sudah memiliki sesi admin aktif di browser, langsung arahkan ke admin
  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('isAdmin') === 'true') {
      router.replace('/admin/surat');
    }
  }, [router]);

  const heroRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'heroImage', 'default');
  }, [firestore]);

  const { data: heroData } = useDoc<{ imageUrl: string }>(heroRef);
  const heroImageUrl = heroData?.imageUrl || "https://images.unsplash.com/photo-1602989106211-81de671c23a9?q=80&w=2000";

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      toast({
        title: 'Input Belum Lengkap',
        description: 'Silakan masukkan email dan kata sandi administrator.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      if (!auth) {
        throw new Error("Layanan autentikasi Firebase belum siap. Silakan muat ulang halaman.");
      }

      // Autentikasi langsung ke Firebase Authentication
      await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);

      // Simpan otoritas admin di LocalStorage browser
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('adminEmail', cleanEmail);

      toast({
        title: 'Login Berhasil',
        description: 'Selamat datang di Panel Administrasi Desa Karanggintung!'
      });

      // Redirect ke panel admin via client-side navigation
      router.push('/admin/surat');


    } catch (error: any) {
      console.error("Firebase Login Error:", error);

      let errorMessage = 'Email atau kata sandi salah. Silakan periksa kembali.';

      if (
        error.code === 'auth/invalid-credential' ||
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/user-not-found'
      ) {
        errorMessage = 'Email atau kata sandi tidak cocok dengan akun yang terdaftar di Firebase.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Format email yang Anda masukkan tidak valid.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'Akun administrator ini telah dinonaktifkan di Firebase Console.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Terlalu banyak percobaan gagal. Akses diblokir sementara demi keamanan. Coba beberapa saat lagi.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Gagal terhubung ke server autentikasi. Silakan periksa koneksi internet Anda.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Metode login Email/Password belum diaktifkan di Firebase Authentication Console.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: 'Akses Ditolak',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 bg-slate-50 font-sans">
      <div className="flex items-center justify-center py-12 px-4 sm:px-6">
        <div className="mx-auto grid w-full max-w-[400px] gap-8 bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
          <div className="grid gap-2 text-center">
            <div className="flex justify-center mb-2">
              <Logo />
            </div>
            <h1 className="text-3xl font-black font-display text-slate-900 uppercase tracking-tight">
              Portal Admin
            </h1>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Sistem Pengelolaan Digital & Pelayanan Desa Karanggintung
            </p>
          </div>

          <form onSubmit={handleEmailLogin} className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="email" className="font-bold text-[11px] uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-emerald-600" />
                Email Administrator
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@karanggintung.desa.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="email"
                className="h-12 rounded-xl border-slate-200 focus:ring-emerald-600 font-medium text-sm"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="font-bold text-[11px] uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-emerald-600" />
                Kata Sandi
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Masukkan kata sandi..."
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="current-password"
                className="h-12 rounded-xl border-slate-200 focus:ring-emerald-600 font-medium text-sm"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl bg-emerald-700 hover:bg-emerald-600 font-black text-white shadow-lg shadow-emerald-700/20 uppercase tracking-wider text-xs transition-all hover:scale-[1.01] mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  Memverifikasi...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-white" />
                  MASUK KE PANEL ADMIN
                </span>
              )}
            </Button>
          </form>

          <div className="pt-2 border-t border-slate-100 text-center">
            <Link href="/" className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors inline-flex items-center gap-1">
              ← Kembali ke Beranda Publik
            </Link>
          </div>
        </div>
      </div>

      <div className="hidden bg-emerald-900 lg:block relative overflow-hidden">
        <Image
          src={heroImageUrl}
          alt="Desa Karanggintung"
          fill
          className="object-cover opacity-50 grayscale-[40%] hover:grayscale-0 transition-all duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-900/60 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12 text-white space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-black uppercase tracking-widest text-emerald-200">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
            Panel Khusus Perangkat & Administrator Desa
          </div>
          <h2 className="text-4xl font-semibold font-display leading-tight italic">
            Melayani dengan Inovasi, Membangun dari Hati.
          </h2>
          <p className="font-bold uppercase tracking-[0.3em] text-white/70 text-xs">
            Pemerintah Desa Karanggintung • Gandrungmangu, Cilacap
          </p>
        </div>
      </div>
    </div>
  );
}