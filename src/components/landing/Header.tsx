'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { Menu, ArrowRight, ChevronDown, Home, Lock } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const primaryLinks = [
  { href: '/pelayanan-desa/', label: 'Pelayanan Desa' },
  { href: '/profil-desa/', label: 'Profil Desa' },
  { href: '/BeritaDesa/', label: 'Berita Desa' },
];

const statistikSubLinks = [
  { href: '/statistik?tab=kependudukan', label: 'Kependudukan' },
  { href: '/statistik?tab=pendidikan', label: 'Pendidikan' },
  { href: '/statistik?tab=kesehatan', label: 'Kesehatan' },
  { href: '/statistik?tab=sosial', label: 'Sosial' },
  { href: '/statistik?tab=ekonomi', label: 'Ekonomi' },
  { href: '/statistik?tab=pembangunan', label: 'Pembangunan Desa' },
  { href: '/statistik?tab=sdgs', label: 'SDGs Desa' },
  { href: '/statistik?tab=indeks', label: 'Indeks Desa' },
];

const moreLinks = [
  { href: '/layanan-surat/', label: 'Layanan Surat' },
  { href: '/#cek-pbb', label: 'Cek Pajak PBB-P2' },
  { href: '/tata-kelola-desa/', label: 'Tata Kelola Desa' },
  { href: '/desa-anti-korupsi/', label: 'Desa Anti Korupsi' },
  { href: '/pengumuman/', label: 'Pengumuman' },
  { href: '/pengaduan/', label: 'Pengaduan Warga' },
  { href: '/nomor-penting/', label: 'Nomor Penting' },
];

const potensiSubLinks = [
  { href: '/potensi-desa?tab=pariwisata-kebudayaan', label: 'Pariwisata & Kebudayaan' },
  { href: '/potensi-desa?tab=bumdes', label: 'BUMDes Karanggintung' },
  { href: '/potensi-desa?tab=pertanian-perkebunan', label: 'Pertanian & Perkebunan' },
  { href: '/potensi-desa?tab=sda-lingkungan', label: 'Sumber Daya Alam & Lingkungan' }
];

const umkmSubLinks = [
  { href: '/umkm-dan-industri-kreatif?tab=informasi', label: 'Informasi' },
  { href: '/umkm-dan-industri-kreatif?tab=katalog', label: 'Katalog Produk' }
];

export function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isScrollable, setIsScrollable] = useState(false);
  const [mobileStatistikOpen, setMobileStatistikOpen] = useState(false);
  const [mobilePotensiOpen, setMobilePotensiOpen] = useState(false);
  const [mobileUmkmOpen, setMobileUmkmOpen] = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  const isSolid = isScrolled || (pathname !== null && pathname !== '/');

  useEffect(() => {
    const checkScrollable = () => {
      try {
        const scrollable = document.documentElement.scrollHeight > window.innerHeight;
        setIsScrollable(scrollable);
        return scrollable;
      } catch (e) {
        setIsScrollable(false);
        return false;
      }
    };

    const onScroll = () => {
      const scrollableNow = checkScrollable();
      setIsScrolled(window.scrollY > 16 || scrollableNow);
    };

    // Initial checks
    const initialScrollable = checkScrollable();
    setIsScrolled(window.scrollY > 16 || initialScrollable);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => {
      const s = checkScrollable();
      setIsScrolled(window.scrollY > 16 || s);
    });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', () => {
        const s = checkScrollable();
        setIsScrolled(window.scrollY > 16 || s);
      });
    };
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 z-50 w-full border-b transition-all duration-300',
        isSolid
          ? 'border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-[0_8px_30px_rgba(15,23,42,0.06)]'
          : 'border-transparent bg-transparent backdrop-blur-none'
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className={cn('transition-colors', isSolid ? 'text-slate-900' : 'text-white')} aria-label="Beranda Portal Portal Desa Karanggintung">
          <Logo />
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-3 xl:gap-4 md:flex">
          <Link
            href="/pelayanan-desa/"
            className={cn(
              'group relative text-[10.5px] font-semibold uppercase tracking-[0.10em] transition-colors duration-300 whitespace-nowrap',
              isSolid ? 'text-emerald-800 hover:text-emerald-700' : 'text-white/90 hover:text-white'
            )}
          >
            <span>Pelayanan Desa</span>
            <span className={cn(
              'absolute bottom-[-0.4rem] left-0 h-0.5 w-full origin-left scale-x-0 rounded-full transition-transform duration-300 group-hover:scale-x-100',
              isSolid ? 'bg-emerald-600' : 'bg-white'
            )} />
          </Link>

          <Link
            href="/profil-desa/"
            className={cn(
              'group relative text-[10.5px] font-semibold uppercase tracking-[0.10em] transition-colors duration-300 whitespace-nowrap',
              isSolid ? 'text-emerald-800 hover:text-emerald-700' : 'text-white/90 hover:text-white'
            )}
          >
            <span>Profil Desa</span>
            <span className={cn(
              'absolute bottom-[-0.4rem] left-0 h-0.5 w-full origin-left scale-x-0 rounded-full transition-transform duration-300 group-hover:scale-x-100',
              isScrolled ? 'bg-emerald-600' : 'bg-white'
            )} />
          </Link>

          {/* Dropdown "Statistik" */}
          <DropdownMenu>
            <DropdownMenuTrigger className={cn(
              'group relative flex items-center gap-1 text-[10.5px] font-semibold uppercase tracking-[0.10em] transition-colors duration-300 whitespace-nowrap outline-none',
              isSolid ? 'text-emerald-800 hover:text-emerald-700' : 'text-white/90 hover:text-white'
            )}>
              <span>Statistik</span>
              <ChevronDown className="h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              <span className={cn(
                'absolute bottom-[-0.4rem] left-0 h-0.5 w-full origin-left scale-x-0 rounded-full transition-transform duration-300 group-hover:scale-x-100',
                isSolid ? 'bg-emerald-600' : 'bg-white'
              )} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="mt-3 w-56 rounded-xl border border-slate-100 bg-white/95 backdrop-blur-xl p-2 shadow-xl shadow-slate-200/50">
              {statistikSubLinks.map((link) => (
                <DropdownMenuItem key={link.href} asChild className="rounded-lg px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600 transition-colors hover:text-emerald-700 hover:bg-emerald-50 cursor-pointer">
                  <Link href={link.href}>{link.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link
            href="/BeritaDesa/"
            className={cn(
              'group relative text-[10.5px] font-semibold uppercase tracking-[0.10em] transition-colors duration-300 whitespace-nowrap',
              isSolid ? 'text-emerald-800 hover:text-emerald-700' : 'text-white/90 hover:text-white'
            )}
          >
            <span>Berita Desa</span>
            <span className={cn(
              'absolute bottom-[-0.4rem] left-0 h-0.5 w-full origin-left scale-x-0 rounded-full transition-transform duration-300 group-hover:scale-x-100',
              isSolid ? 'bg-emerald-600' : 'bg-white'
            )} />
          </Link>

          {/* Dropdown "Potensi Desa" */}
          <DropdownMenu>
            <DropdownMenuTrigger className={cn(
              'group relative flex items-center gap-1 text-[10.5px] font-semibold uppercase tracking-[0.10em] transition-colors duration-300 whitespace-nowrap outline-none',
              isSolid ? 'text-emerald-800 hover:text-emerald-700' : 'text-white/90 hover:text-white'
            )}>
              <span>Potensi Desa</span>
              <ChevronDown className="h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              <span className={cn(
                'absolute bottom-[-0.4rem] left-0 h-0.5 w-full origin-left scale-x-0 rounded-full transition-transform duration-300 group-hover:scale-x-100',
                isSolid ? 'bg-emerald-600' : 'bg-white'
              )} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="mt-3 w-60 rounded-xl border border-slate-100 bg-white/95 backdrop-blur-xl p-2 shadow-xl shadow-slate-200/50">
              {potensiSubLinks.map((link) => (
                <DropdownMenuItem key={link.href} asChild className="rounded-lg px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600 transition-colors hover:text-emerald-700 hover:bg-emerald-50 cursor-pointer">
                  <Link href={link.href}>{link.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Dropdown "UMKM & Industri Kreatif" */}
          <DropdownMenu>
            <DropdownMenuTrigger className={cn(
              'group relative flex items-center gap-1 text-[10.5px] font-semibold uppercase tracking-[0.10em] transition-colors duration-300 whitespace-nowrap outline-none',
              isSolid ? 'text-emerald-800 hover:text-emerald-700' : 'text-white/90 hover:text-white'
            )}>
              <span>UMKM & Industri Kreatif</span>
              <ChevronDown className="h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              <span className={cn(
                'absolute bottom-[-0.4rem] left-0 h-0.5 w-full origin-left scale-x-0 rounded-full transition-transform duration-300 group-hover:scale-x-100',
                isSolid ? 'bg-emerald-600' : 'bg-white'
              )} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="mt-3 w-52 rounded-xl border border-slate-100 bg-white/95 backdrop-blur-xl p-2 shadow-xl shadow-slate-200/50">
              {umkmSubLinks.map((link) => (
                <DropdownMenuItem key={link.href} asChild className="rounded-lg px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600 transition-colors hover:text-emerald-700 hover:bg-emerald-50 cursor-pointer">
                  <Link href={link.href}>{link.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Dropdown "Lainnya" */}
          <DropdownMenu>
            <DropdownMenuTrigger className={cn(
              'group relative flex items-center gap-1 text-[10.5px] font-semibold uppercase tracking-[0.10em] transition-colors duration-300 whitespace-nowrap outline-none',
              isSolid ? 'text-emerald-800 hover:text-emerald-700' : 'text-white/90 hover:text-white'
            )}>
              <span>Lainnya</span>
              <ChevronDown className="h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              <span className={cn(
                'absolute bottom-[-0.4rem] left-0 h-0.5 w-full origin-left scale-x-0 rounded-full transition-transform duration-300 group-hover:scale-x-100',
                isSolid ? 'bg-emerald-600' : 'bg-white'
              )} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="mt-3 w-52 rounded-xl border border-slate-100 bg-white/95 backdrop-blur-xl p-2 shadow-xl shadow-slate-200/50">
              {moreLinks.map((link) => (
                <DropdownMenuItem key={link.href} asChild className="rounded-lg px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600 transition-colors hover:text-emerald-700 hover:bg-emerald-50 cursor-pointer">
                  <Link href={link.href}>{link.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link href="/login/" aria-label="Masuk area admin">
            <Button variant="outline" size="sm" className={cn(
              'h-7 rounded-full border px-3 text-[9px] font-medium',
              isSolid
                ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                : 'border-white/20 bg-white/10 text-white hover:bg-white/15'
            )}>
              Admin
            </Button>
          </Link>
          <Link href="/layanan-surat/" aria-label="Ajukan layanan desa">
            <Button className="h-7 rounded-full bg-emerald-700 px-3 text-[9px] font-medium text-white shadow-[0_12px_30px_rgba(5,150,105,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-800">
              Ajukan Layanan
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 lg:hidden">
          <Link href="/login/" aria-label="Masuk area admin">
            <Button
              variant="outline"
              size="sm"
              className={cn(
                'h-7 rounded-full border px-2.5 text-[10px] font-bold tracking-wider gap-1 transition-all',
                isSolid
                  ? 'border-slate-300/80 bg-white/90 text-slate-700 hover:bg-slate-100 hover:text-emerald-700 shadow-xs'
                  : 'border-white/30 bg-black/20 backdrop-blur-md text-white hover:bg-black/30'
              )}
            >
              <Lock className="h-2.5 w-2.5" />
              <span>Admin</span>
            </Button>
          </Link>

          <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className={cn('rounded-full h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center', isSolid ? 'text-slate-700 hover:bg-slate-100' : 'text-white hover:bg-white/10')} aria-label="Buka menu navigasi">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[340px] max-w-[85vw] border-l border-white/10 bg-slate-950/95 text-white p-4 sm:p-6">
              <SheetHeader className="sr-only">
                <SheetTitle>Menu navigasi</SheetTitle>
                <SheetDescription>Menu cepat layanan desa</SheetDescription>
              </SheetHeader>
              <div className="mt-4 flex flex-col gap-4 h-[calc(100vh-64px)] overflow-y-auto pb-12 pr-1 no-scrollbar">
                <Link href="/" onClick={() => setMobileSheetOpen(false)} className="inline-flex shrink-0">
                  <Logo />
                </Link>
                <div className="space-y-2">
                  <Link href="/pelayanan-desa/" onClick={() => setMobileSheetOpen(false)} className="block rounded-xl border border-white/10 px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-white/80 transition-colors hover:bg-white/10 hover:text-white">
                    Pelayanan Desa
                  </Link>

                  <Link href="/profil-desa/" onClick={() => setMobileSheetOpen(false)} className="block rounded-xl border border-white/10 px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-white/80 transition-colors hover:bg-white/10 hover:text-white">
                    Profil Desa
                  </Link>

                  {/* Collapsible Statistik on Mobile */}
                  <div className="rounded-xl border border-white/10 overflow-hidden">
                    <button
                      onClick={() => setMobileStatistikOpen(!mobileStatistikOpen)}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <span>Statistik</span>
                      <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", mobileStatistikOpen && "rotate-180")} />
                    </button>
                    {mobileStatistikOpen && (
                      <div className="bg-white/5 border-t border-white/5 p-1.5 space-y-0.5">
                        {statistikSubLinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className="block rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  <Link href="/BeritaDesa/" className="block rounded-xl border border-white/10 px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-white/80 transition-colors hover:bg-white/10 hover:text-white">
                    Berita Desa
                  </Link>

                  {/* Collapsible Potensi Desa on Mobile */}
                  <div className="rounded-xl border border-white/10 overflow-hidden">
                    <button
                      onClick={() => setMobilePotensiOpen(!mobilePotensiOpen)}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <span>Potensi Desa</span>
                      <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", mobilePotensiOpen && "rotate-180")} />
                    </button>
                    {mobilePotensiOpen && (
                      <div className="bg-white/5 border-t border-white/5 p-1.5 space-y-0.5">
                        {potensiSubLinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className="block rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Collapsible UMKM & Industri Kreatif on Mobile */}
                  <div className="rounded-xl border border-white/10 overflow-hidden">
                    <button
                      onClick={() => setMobileUmkmOpen(!mobileUmkmOpen)}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <span>UMKM & Industri Kreatif</span>
                      <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", mobileUmkmOpen && "rotate-180")} />
                    </button>
                    {mobileUmkmOpen && (
                      <div className="bg-white/5 border-t border-white/5 p-1.5 space-y-0.5">
                        {umkmSubLinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className="block rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  {moreLinks.map((link) => (
                    <Link key={link.href} href={link.href} className="block rounded-xl border border-white/10 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-white/80 transition-colors hover:bg-white/10 hover:text-white">
                      {link.label}
                    </Link>
                  ))}
                </div>
                <div className="space-y-2 mt-2">
                  <Link href="/layanan-surat/" onClick={() => setMobileSheetOpen(false)} className="block">
                    <Button className="h-10 sm:h-12 w-full rounded-xl sm:rounded-full bg-emerald-600 text-white font-bold text-xs">
                      Ajukan Layanan
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/" onClick={() => setMobileSheetOpen(false)} className="block">
                    <Button variant="outline" className="h-10 sm:h-12 w-full rounded-xl sm:rounded-full border-white/20 bg-white/10 text-white hover:bg-white/20 font-bold text-xs gap-2">
                      <Home className="h-4 w-4" />
                      Beranda
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
