'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  useSidebar,
} from '@/components/ui/sidebar';

import { Logo } from '@/components/logo';
import {
  FileCheck,
  Megaphone,
  LogOut,
  Settings,
  LayoutDashboard,
  Loader2,
  MessageSquare,
  Users,
  FilePlus,
  Files,
  ChevronDown,
  Newspaper,
  PlusCircle,
  List,
  Building2,
  Menu,
  X,
  ArrowLeft,
  FileStack,
  BookOpen,
  BarChart3,
  ShieldCheck,
  Landmark,
  Store,
  Globe,
  Home,
} from 'lucide-react';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth, useFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const adminNavItems = [
  { href: '/admin/pelayanan', icon: BookOpen, label: 'Data Pelayanan' },
  { href: '/admin/penduduk', icon: Users, label: 'Data Penduduk' },
  { href: '/admin/pemerintahan', icon: Building2, label: 'Pemerintahan Desa' },
  { href: '/admin/tata-kelola-desa', icon: BarChart3, label: 'Tata Kelola Desa' },
  { href: '/admin/desa-anti-korupsi', icon: ShieldCheck, label: 'Desa Anti Korupsi' },
  { href: '/admin/potensi-desa', icon: Landmark, label: 'Potensi Desa' },
  { href: '/admin/umkm-industri', icon: Store, label: 'UMKM & Industri Kreatif' },
  { href: '/admin/pengaduan', icon: MessageSquare, label: 'Jawab Pengaduan' },
  { href: '/admin/pengumuman', icon: Megaphone, label: 'Kelola Pengumuman' },
  { href: '/admin/settings', icon: Settings, label: 'Pengaturan' },
];

function AdminMobileHeader() {
  const { toggleSidebar, openMobile } = useSidebar();

  return (
    <header className="md:hidden sticky top-0 z-40 w-full h-14 sm:h-16 bg-primary flex items-center justify-between px-3.5 sm:px-6 shadow-md border-b border-white/10 text-white">
      <Logo />
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Link href="/" title="Menuju Web Publik">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-[10px] font-bold text-white hover:bg-white/10 gap-1 rounded-lg border border-white/20"
          >
            <Globe className="h-3.5 w-3.5" />
            <span className="hidden min-[360px]:inline">Web Publik</span>
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-9 w-9 text-white hover:bg-white/10 rounded-lg"
          aria-label="Toggle menu navigasi"
        >
          {openMobile ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>
    </header>
  );
}

function AdminSidebarInner({
  handleLogout,
  isSuratOpen,
  setIsSuratOpen,
  isBeritaOpen,
  setIsBeritaOpen,
}: {
  handleLogout: () => void;
  isSuratOpen: boolean;
  setIsSuratOpen: (val: boolean) => void;
  isBeritaOpen: boolean;
  setIsBeritaOpen: (val: boolean) => void;
}) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar className="border-r border-white/10 bg-primary">
      <SidebarHeader className="p-4 sm:p-6 md:p-8">
        <Logo />
      </SidebarHeader>

      <SidebarContent className="px-3.5 sm:px-6">
        <div className="mb-4 sm:mb-6 px-3 sm:px-4">
          <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Navigasi Admin</p>
        </div>

        <SidebarMenu className="gap-2 sm:gap-3 font-sans">
          <div className="mb-1.5 sm:mb-2 mt-1 sm:mt-2 px-3 sm:px-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">Prioritas Utama</p>
          </div>

          <Collapsible
            open={isSuratOpen}
            onOpenChange={setIsSuratOpen}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  tooltip="Manajemen Surat"
                  isActive={pathname.startsWith('/admin/surat')}
                  className="rounded-xl sm:rounded-2xl h-10 sm:h-12 transition-all data-[active=true]:bg-secondary data-[active=true]:text-primary-foreground"
                >
                  <Files className={pathname.startsWith('/admin/surat') ? 'text-primary-foreground' : 'text-white/40'} />
                  <span className="font-bold text-xs sm:text-sm">Manajemen Surat</span>
                  <ChevronDown className={cn("ml-auto h-4 w-4 transition-transform duration-200", isSuratOpen && "rotate-180")} />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenu className="ml-4 sm:ml-6 mt-1.5 sm:mt-2 border-l pl-2 border-white/10 gap-1">
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === '/admin/surat'} className="rounded-lg sm:rounded-xl h-9 sm:h-10 transition-all data-[active=true]:text-secondary">
                      <Link href="/admin/surat" onClick={handleNavClick} className="flex items-center gap-2.5 sm:gap-3">
                        <FileCheck className="h-4 w-4" />
                        <span className="font-bold text-xs">Kelola Surat</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === '/admin/surat/input'} className="rounded-lg sm:rounded-xl h-9 sm:h-10 transition-all data-[active=true]:text-secondary">
                      <Link href="/admin/surat/input" onClick={handleNavClick} className="flex items-center gap-2.5 sm:gap-3">
                        <FilePlus className="h-4 w-4" />
                        <span className="font-bold text-xs">Pengajuan Baru</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === '/admin/surat/capil'} className="rounded-lg sm:rounded-xl h-9 sm:h-10 transition-all data-[active=true]:text-secondary">
                      <Link href="/admin/surat/capil" onClick={handleNavClick} className="flex items-center gap-2.5 sm:gap-3">
                        <FileStack className="h-4 w-4" />
                        <span className="font-bold text-xs">Formulir Capil</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>

          <Collapsible
            open={isBeritaOpen}
            onOpenChange={setIsBeritaOpen}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  tooltip="Berita"
                  isActive={pathname.startsWith('/admin/berita')}
                  className="rounded-xl sm:rounded-2xl h-10 sm:h-12 transition-all data-[active=true]:bg-secondary data-[active=true]:text-primary-foreground"
                >
                  <Newspaper className={pathname.startsWith('/admin/berita') ? 'text-primary-foreground' : 'text-white/40'} />
                  <span className="font-bold text-xs sm:text-sm">Berita Desa</span>
                  <ChevronDown className={cn("ml-auto h-4 w-4 transition-transform duration-200", isBeritaOpen && "rotate-180")} />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenu className="ml-4 sm:ml-6 mt-1.5 sm:mt-2 border-l pl-2 border-white/10 gap-1">
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === '/admin/berita/buat'} className="rounded-lg sm:rounded-xl h-9 sm:h-10 transition-all data-[active=true]:text-secondary">
                      <Link href="/admin/berita/buat" onClick={handleNavClick} className="flex items-center gap-2.5 sm:gap-3">
                        <PlusCircle className="h-4 w-4" />
                        <span className="font-bold text-xs">Buat Berita</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === '/admin/berita'} className="rounded-lg sm:rounded-xl h-9 sm:h-10 transition-all data-[active=true]:text-secondary">
                      <Link href="/admin/berita" onClick={handleNavClick} className="flex items-center gap-2.5 sm:gap-3">
                        <List className="h-4 w-4" />
                        <span className="font-bold text-xs">Rincian Berita</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>

          <div className="mb-1.5 sm:mb-2 mt-3 sm:mt-4 px-3 sm:px-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">Data & Informasi</p>
          </div>

          {adminNavItems
            .filter((item) => item.href !== '/admin/settings')
            .map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.href)}
                  tooltip={item.label}
                  className="rounded-xl sm:rounded-2xl h-10 sm:h-12 transition-all data-[active=true]:bg-secondary data-[active=true]:text-primary-foreground"
                >
                  <Link href={item.href} onClick={handleNavClick} className="flex items-center gap-2.5 sm:gap-3">
                    <item.icon className={pathname.startsWith(item.href) ? 'text-primary-foreground' : 'text-white/40'} />
                    <span className="font-bold text-xs sm:text-sm">{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}

          <div className="mb-1.5 sm:mb-2 mt-3 sm:mt-4 px-3 sm:px-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/40">Sistem</p>
          </div>

          <SidebarMenuItem key="/admin/settings">
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith('/admin/settings')}
              tooltip="Pengaturan"
              className="rounded-xl sm:rounded-2xl h-10 sm:h-12 transition-all data-[active=true]:bg-secondary data-[active=true]:text-primary-foreground"
            >
              <Link href="/admin/settings" onClick={handleNavClick} className="flex items-center gap-2.5 sm:gap-3">
                <Settings className={pathname.startsWith('/admin/settings') ? 'text-primary-foreground' : 'text-white/40'} />
                <span className="font-bold text-xs sm:text-sm">Pengaturan</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 sm:p-6 md:p-8">
        <div className="bg-white/5 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-white/10 space-y-3 sm:space-y-4">
          <SidebarMenuItem className="list-none">
            <SidebarMenuButton
              onClick={handleLogout}
              className="w-full justify-center bg-secondary text-primary-foreground rounded-xl sm:rounded-2xl hover:bg-yellow-600 transition-all font-black shadow-lg shadow-secondary/30 h-10 sm:h-11 text-xs"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span>KELUAR</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { auth, user } = useFirebase();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSuratOpen, setIsSuratOpen] = useState(pathname.startsWith('/admin/surat'));
  const [isBeritaOpen, setIsBeritaOpen] = useState(pathname.startsWith('/admin/berita'));

  useEffect(() => {
    if (isLoggingOut) return;
    const adminFlag = typeof window !== 'undefined' ? localStorage.getItem('isAdmin') : null;
    
    if (adminFlag === 'true') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
      router.replace('/login');
    }
  }, [isLoggingOut, router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('adminEmail');
      if (auth) await signOut(auth);
      window.location.href = '/login';
    } catch (error) {
      console.error('Gagal logout:', error);
      setIsLoggingOut(false);
    }
  };

  if (isAdmin === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-primary">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-white mb-4" />
          <p className="text-[10px] font-black tracking-[0.4em] text-white/70 uppercase">Memverifikasi Otoritas Admin...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AdminSidebarInner
        handleLogout={handleLogout}
        isSuratOpen={isSuratOpen}
        setIsSuratOpen={setIsSuratOpen}
        isBeritaOpen={isBeritaOpen}
        setIsBeritaOpen={setIsBeritaOpen}
      />

      <SidebarInset className="bg-background flex flex-col min-h-screen">
        <AdminMobileHeader />
        <main className="max-w-[1400px] mx-auto w-full p-2.5 sm:p-6 md:p-10 flex-1 overflow-x-hidden">
          {children}
        </main>

        <footer className="bg-[#081325] border-t border-slate-800/80 py-4 sm:py-6 px-3 sm:px-6 md:px-12 mt-auto text-slate-400">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2.5 sm:gap-4 text-center sm:text-left">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-1.5 h-3.5 sm:h-4 bg-emerald-500 rounded-full shrink-0" />
              <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Sistem Administrasi Desa Karanggintung v1.0
              </p>
            </div>
            <p className="text-[9px] sm:text-[10px] font-medium text-slate-500 uppercase">
              © 2026 Pemerintah Desa Karanggintung
            </p>
          </div>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
