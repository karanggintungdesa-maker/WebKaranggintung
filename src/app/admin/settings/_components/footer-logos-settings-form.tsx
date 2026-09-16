'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Trash2, Upload, Plus, ExternalLink, ArrowUp, ArrowDown, ImageIcon } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { FooterLogosInfo, FooterLogoItem } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { uploadToCloudinary } from '@/lib/upload-cloudinary';

interface LogoItemProps {
  item: FooterLogoItem;
  index: number;
  total: number;
  onUpload: (file: File, id: string) => Promise<void>;
  onRemove: (id: string) => void;
  onLinkChange: (id: string, link: string) => void;
  onNameChange: (id: string, name: string) => void;
  onMove: (index: number, direction: 'up' | 'down') => void;
  isUploading: boolean;
}

function LogoItemCard({
  item,
  index,
  total,
  onUpload,
  onRemove,
  onLinkChange,
  onNameChange,
  onMove,
  isUploading,
}: LogoItemProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await onUpload(file, item.id);
  };

  return (
    <div className="relative rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md">
      {/* Header Item: Nomor & Tombol Aksi */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
            {index + 1}
          </span>
          <span className="text-xs font-bold text-slate-800 truncate">
            {item.name || `Logo #${index + 1}`}
          </span>
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={index === 0}
            onClick={() => onMove(index, 'up')}
            className="h-7 w-7 text-slate-400 hover:text-slate-700 disabled:opacity-30"
            title="Geser ke atas"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={index === total - 1}
            onClick={() => onMove(index, 'down')}
            className="h-7 w-7 text-slate-400 hover:text-slate-700 disabled:opacity-30"
            title="Geser ke bawah"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onRemove(item.id)}
            className="h-7 w-7 text-rose-500 hover:bg-rose-50 hover:text-rose-600"
            title="Hapus logo ini"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="space-y-2.5">
        {/* Pratinjau Gambar */}
        <div className="relative flex h-20 w-full items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/70 p-2">
          {item.url ? (
            <div className="relative h-full w-full flex items-center justify-center">
              <Image
                src={item.url}
                alt={item.name || `Logo ${index + 1}`}
                width={120}
                height={60}
                className="max-h-16 w-auto object-contain drop-shadow-sm"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-0.5 text-slate-400">
              <ImageIcon className="h-6 w-6 stroke-[1.5]" />
              <span className="text-[10px] font-medium">Belum ada file logo</span>
            </div>
          )}
        </div>

        {/* Tombol Upload */}
        <div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full gap-2 text-xs font-semibold h-8"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                Mengunggah...
              </>
            ) : (
              <>
                <Upload className="h-3.5 w-3.5 text-primary" />
                {item.url ? 'Ganti Logo' : 'Pilih & Upload Logo'}
              </>
            )}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp, image/svg+xml"
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading}
          />
        </div>

        {/* Nama / Keterangan */}
        <div className="space-y-1">
          <Label className="text-[10px] font-semibold text-slate-700">Nama Instansi / Mitra (Opsional)</Label>
          <Input
            placeholder="Contoh: Kementerian Komdigi"
            value={item.name || ''}
            onChange={(e) => onNameChange(item.id, e.target.value)}
            className="text-xs h-8"
          />
        </div>

        {/* Link / URL Tujuan */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] font-semibold text-slate-700">Link Tujuan (Opsional)</Label>
            {item.link && (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-0.5 text-[10px] text-sky-600 hover:underline"
              >
                Buka <ExternalLink className="h-2.5 w-2.5" />
              </a>
            )}
          </div>
          <Input
            placeholder="https://..."
            value={item.link || ''}
            onChange={(e) => onLinkChange(item.id, e.target.value)}
            type="url"
            className="text-xs h-8 font-mono"
          />
        </div>
      </div>
    </div>
  );
}

export function FooterLogosSettingsForm() {
  const [items, setItems] = useState<FooterLogoItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const { toast } = useToast();

  const firestore = useFirestore();

  const footerLogosRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'footerLogos', 'default');
  }, [firestore]);

  const { data: footerLogosData, isLoading: isDataLoading } = useDoc<FooterLogosInfo>(footerLogosRef);

  useEffect(() => {
    if (footerLogosData) {
      if (Array.isArray(footerLogosData.items) && footerLogosData.items.length > 0) {
        setItems(footerLogosData.items);
      } else {
        // Konversi slot legacy (logo1..logo4) menjadi item dinamis
        const migrated: FooterLogoItem[] = [];
        [1, 2, 3, 4].forEach((num) => {
          const url = (footerLogosData as any)[`logo${num}Url`];
          const link = (footerLogosData as any)[`logo${num}Link`];
          if (url) {
            migrated.push({
              id: `logo-legacy-${num}`,
              url,
              link: link || '',
              name: `Logo ${num}`,
            });
          }
        });

        if (migrated.length > 0) {
          setItems(migrated);
        } else {
          // Default minimal 1 slot jika kosong
          setItems([
            { id: `logo-${Date.now()}`, url: '', link: '', name: 'Logo 1' },
          ]);
        }
      }
    } else if (!isDataLoading) {
      setItems([
        { id: `logo-${Date.now()}`, url: '', link: '', name: 'Logo 1' },
      ]);
    }
  }, [footerLogosData, isDataLoading]);

  // Tambah slot logo baru
  const handleAddNewLogo = () => {
    const newItem: FooterLogoItem = {
      id: `logo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      url: '',
      link: '',
      name: `Logo ${items.length + 1}`,
    };
    setItems((prev) => [...prev, newItem]);
    toast({
      title: 'Slot Logo Ditambahkan',
      description: 'Silakan pilih gambar logo dan masukkan link tujuan.',
    });
  };

  // Upload ke Cloudinary
  const handleUpload = async (file: File, id: string) => {
    if (!file) return;
    setUploadingId(id);

    try {
      const imageUrl = await uploadToCloudinary(file, 'footer-logos');

      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, url: imageUrl } : item))
      );

      toast({
        title: 'Upload Berhasil',
        description: 'Gambar logo berhasil diupload ke Cloudinary.',
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Gagal Upload',
        description: error.message || 'Terjadi kesalahan saat mengupload gambar.',
        variant: 'destructive',
      });
    } finally {
      setUploadingId(null);
    }
  };

  // Hapus item
  const handleRemove = (id: string) => {
    setItems((prev) => {
      const filtered = prev.filter((item) => item.id !== id);
      if (filtered.length === 0) {
        return [{ id: `logo-${Date.now()}`, url: '', link: '', name: 'Logo 1' }];
      }
      return filtered;
    });
    toast({ title: 'Logo Dihapus' });
  };

  // Ubah link
  const handleLinkChange = (id: string, link: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, link } : item))
    );
  };

  // Ubah nama
  const handleNameChange = (id: string, name: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, name } : item))
    );
  };

  // Geser urutan item
  const handleMove = (index: number, direction: 'up' | 'down') => {
    setItems((prev) => {
      const newItems = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newItems.length) return prev;

      const temp = newItems[index];
      newItems[index] = newItems[targetIndex];
      newItems[targetIndex] = temp;
      return newItems;
    });
  };

  // Simpan perubahan ke Firestore
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !footerLogosRef) return;

    setIsSaving(true);

    try {
      // Filter item yang memiliki URL logo
      const validItems = items.filter((i) => i.url && i.url.trim() !== '');

      const payload: FooterLogosInfo = {
        items: validItems,
        // Dukungan kompatibilitas mundur
        logo1Url: validItems[0]?.url || '',
        logo1Link: validItems[0]?.link || '',
        logo2Url: validItems[1]?.url || '',
        logo2Link: validItems[1]?.link || '',
        logo3Url: validItems[2]?.url || '',
        logo3Link: validItems[2]?.link || '',
        logo4Url: validItems[3]?.url || '',
        logo4Link: validItems[3]?.link || '',
      };

      await setDoc(footerLogosRef, payload, { merge: true });
      toast({
        title: 'Logo Berhasil Disimpan',
        description: `${validItems.length} logo mitra telah diperbarui di banner atas footer.`,
      });
    } catch (error) {
      console.error('Error saving footer logos:', error);
      toast({
        title: 'Gagal Menyimpan',
        description: 'Terjadi kesalahan saat menyimpan ke Firestore.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isDataLoading) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-slate-200 rounded-2xl sm:rounded-3xl overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 p-3.5 sm:p-6">
        <div>
          <CardTitle className="text-xs sm:text-base font-bold text-slate-900">Logo Mitra / Instansi (Footer)</CardTitle>
          <CardDescription className="mt-0.5 text-[11px] sm:text-xs text-slate-500">
            Kelola logo mitra yang tampil di banner bergulir di atas footer.
          </CardDescription>
        </div>

        {/* Tombol + Tambah Logo Baru */}
        <Button
          type="button"
          onClick={handleAddNewLogo}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shrink-0 h-8 text-xs w-full sm:w-auto"
        >
          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
          Tambah Logo
        </Button>
      </CardHeader>

      <CardContent className="p-3.5 sm:p-6 pt-3.5 sm:pt-6">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Grid Logo Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {items.map((item, index) => (
              <LogoItemCard
                key={item.id}
                item={item}
                index={index}
                total={items.length}
                onUpload={handleUpload}
                onRemove={handleRemove}
                onLinkChange={handleLinkChange}
                onNameChange={handleNameChange}
                onMove={handleMove}
                isUploading={uploadingId === item.id}
              />
            ))}

            {/* Kartu Tombol Tambah di Grid */}
            <button
              type="button"
              onClick={handleAddNewLogo}
              className="flex min-h-[120px] sm:min-h-[160px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-4 text-slate-500 transition-all hover:border-emerald-500/60 hover:bg-emerald-50/30 hover:text-emerald-700"
            >
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white shadow-sm border border-slate-200">
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
              </div>
              <div className="text-center">
                <p className="text-xs font-bold">Tambah Logo Baru</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Klik untuk tambah slot logo</p>
              </div>
            </button>
          </div>

          {/* Tombol Simpan Perubahan */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-slate-100">
            <div className="text-xs text-slate-500">
              Total {items.filter((i) => i.url).length} logo terisi dari {items.length} slot.
            </div>

            <Button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto h-8 sm:h-9 text-xs gap-2 bg-primary hover:bg-slate-800 px-5"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Menyimpan Perubahan...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Simpan Semua Perubahan
                </>
              )}
            </Button>
          </div>

          {/* Petunjuk & Bantuan */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-sm text-emerald-950">
            <p className="font-semibold mb-2 flex items-center gap-1.5 text-emerald-900">
              💡 Petunjuk Pengelolaan Logo Mitra:
            </p>
            <div className="space-y-1.5 text-emerald-800 text-xs leading-relaxed">
              <p>• <strong>Tambah Logo</strong>: Klik tombol <strong>+ Tambah Logo</strong> di sudut kanan atas atau kartu bergaris putus-putus.</p>
              <p>• <strong>Format Gambar</strong>: PNG transparan, JPG, WebP, atau SVG (resolusi terbaik: minimal tinggi 120px).</p>
              <p>• <strong>Link Tujuan</strong>: Jika diisi, pengunjung yang mengklik logo di halaman utama akan diarahkan ke link tersebut di tab baru.</p>
              <p>• <strong>Urutan Tampilan</strong>: Gunakan panah naik (↑) atau turun (↓) di setiap kartu untuk mengatur susunan logo.</p>
              <p>• <strong>Simpan</strong>: Jangan lupa klik <strong>Simpan Semua Perubahan</strong> setelah selesai mengedit.</p>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
