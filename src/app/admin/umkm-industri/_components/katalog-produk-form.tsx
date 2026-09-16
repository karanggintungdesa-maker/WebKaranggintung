'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFirestore } from '@/firebase';
import { doc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Image as ImageIcon, X, Sparkles, Tag, Plus, Check } from 'lucide-react';
import { ProductUmkm } from '@/lib/types';
import { uploadToCloudinary } from '@/lib/upload-cloudinary';

interface KatalogProdukFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: ProductUmkm | null;
}

export const PRODUCT_CATEGORIES = [
  'Kuliner & Olahan',
  'Kerajinan & Kriya',
  'Pertanian & Perkebunan',
  'Fashion & Tekstil',
  'Jasa Kreatif',
  'Lainnya'
] as const;

export const BADGE_OPTIONS = [
  'Produk Unggulan',
  'Organik & Sehat',
  'Karya Tangan Asli',
  'Resep Turun-Temurun',
  'Khas Budaya Desa',
  'Best Seller',
  'P-IRT & Halal',
  'Baru'
];

export function KatalogProdukForm({ open, onOpenChange, product }: KatalogProdukFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Kuliner & Olahan',
    businessName: '',
    owner: '',
    price: '',
    priceUnit: 'pcs',
    location: '',
    phone: '',
    badge: 'Produk Unggulan',
    imageUrl: '',
    description: '',
    featuresText: '',
    shopeeUrl: '',
    tokopediaUrl: '',
    lazadaUrl: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        category: product.category || 'Kuliner & Olahan',
        businessName: product.businessName || '',
        owner: product.owner || '',
        price: product.price?.toString() || '',
        priceUnit: product.priceUnit || 'pcs',
        location: product.location || '',
        phone: product.phone || '',
        badge: product.badge || 'Produk Unggulan',
        imageUrl: product.imageUrl || '',
        description: product.description || '',
        featuresText: product.features ? product.features.join('\n') : '',
        shopeeUrl: product.shopeeUrl || '',
        tokopediaUrl: product.tokopediaUrl || '',
        lazadaUrl: product.lazadaUrl || '',
      });
    } else if (open) {
      setFormData({
        name: '',
        category: 'Kuliner & Olahan',
        businessName: '',
        owner: '',
        price: '',
        priceUnit: 'bks',
        location: 'Desa Karanggintung',
        phone: '0895321109179',
        badge: 'Produk Unggulan',
        imageUrl: '',
        description: '',
        featuresText: '100% Produk Warga Desa\nHigienis & Berkualitas\nBisa Pesan Antar',
        shopeeUrl: '',
        tokopediaUrl: '',
        lazadaUrl: '',
      });
    }
  }, [product, open]);

  // Quota-saving client-side compression for product images (Max dimension 1000px, JPEG quality 0.8, < 250KB)
  const compressProductImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result;
        if (typeof dataUrl !== 'string') {
          reject(new Error('Gagal membaca file gambar.'));
          return;
        }

        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDimension = 1000; // Optimal catalog image size
          let { width, height } = img;

          if (width > height) {
            if (width > maxDimension) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            }
          } else if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Tidak dapat mengompres gambar.'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          const tryCompress = (quality: number, attempt: number) => {
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error('Gagal memproses gambar.'));
                  return;
                }

                const compressedFile = new File(
                  [blob],
                  file.name.replace(/\.[^.]+$/, '.jpg'),
                  {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                  }
                );

                if (compressedFile.size > 250 * 1024 && attempt < 3) {
                  tryCompress(Math.max(0.6, quality - 0.15), attempt + 1);
                } else {
                  resolve(compressedFile);
                }
              },
              'image/jpeg',
              quality
            );
          };

          tryCompress(0.8, 1);
        };
        img.onerror = () => reject(new Error('File gambar tidak valid.'));
        img.src = dataUrl;
      };
      reader.onerror = () => reject(new Error('Gagal membaca file.'));
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      toast({
        title: 'Mengompres Foto Produk...',
        description: 'Menyesuaikan resolusi agar hemat kuota penyimpanan Cloudinary.',
      });

      const compressedFile = await compressProductImage(file);
      const secureUrl = await uploadToCloudinary(compressedFile, 'umkm-karanggintung');

      setFormData((prev) => ({
        ...prev,
        imageUrl: secureUrl,
      }));

      toast({
        title: 'Foto Produk Berhasil Diunggah',
        description: 'Foto telah tersimpan di Cloudinary dengan ukuran file super ringan.',
      });
    } catch (error: any) {
      toast({
        title: 'Gagal Unggah Foto',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore) return;

    if (!formData.name.trim()) {
      toast({ title: 'Input Tidak Valid', description: 'Nama produk harus diisi.', variant: 'destructive' });
      return;
    }
    if (!formData.businessName.trim()) {
      toast({ title: 'Input Tidak Valid', description: 'Nama usaha/toko harus diisi.', variant: 'destructive' });
      return;
    }
    if (!formData.price || isNaN(Number(formData.price))) {
      toast({ title: 'Input Tidak Valid', description: 'Harga produk harus berupa angka valid.', variant: 'destructive' });
      return;
    }
    if (!formData.imageUrl) {
      toast({ title: 'Input Tidak Valid', description: 'Silakan unggah foto produk.', variant: 'destructive' });
      return;
    }

    // Clean phone number (convert 08... to 628...)
    let cleanPhone = formData.phone.trim().replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.slice(1);
    }
    if (!cleanPhone) {
      cleanPhone = '62895321109179';
    }

    const featuresArray = formData.featuresText
      .split('\n')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      businessName: formData.businessName.trim(),
      owner: formData.owner.trim(),
      price: Number(formData.price),
      priceUnit: formData.priceUnit.trim() || 'pcs',
      location: formData.location.trim() || 'Desa Karanggintung',
      phone: cleanPhone,
      badge: formData.badge.trim() || 'Produk Unggulan',
      imageUrl: formData.imageUrl,
      description: formData.description.trim(),
      features: featuresArray,
      shopeeUrl: formData.shopeeUrl.trim(),
      tokopediaUrl: formData.tokopediaUrl.trim(),
      lazadaUrl: formData.lazadaUrl.trim(),
    };

    setIsSubmitting(true);

    try {
      if (product) {
        await setDoc(
          doc(firestore, 'katalogProduk', product.id),
          {
            ...payload,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
        toast({ title: 'Sukses', description: `Produk "${payload.name}" berhasil diperbarui.` });
      } else {
        await addDoc(collection(firestore, 'katalogProduk'), {
          ...payload,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast({ title: 'Sukses', description: `Produk "${payload.name}" berhasil ditambahkan ke katalog.` });
      }
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Gagal Menyimpan',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl border border-slate-100 shadow-2xl p-4 sm:p-6 md:p-8">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-2xl font-black uppercase italic tracking-tight font-display text-slate-800">
            {product ? 'Edit Produk Katalog UMKM' : 'Tambah Produk UMKM Baru'}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-slate-500 font-medium">
            Lengkapi data produk UMKM untuk dipromosikan di halaman publik Katalog Desa Karanggintung.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 mt-3 sm:mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5 sm:space-y-2 sm:col-span-2">
              <Label htmlFor="prod-name" className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-600">
                Nama Produk *
              </Label>
              <Input
                id="prod-name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Contoh: Keripik Singkong Renyah Rasa Balado"
                className="rounded-xl border-slate-200 h-10 sm:h-12 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-50/50 focus:bg-white"
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="prod-cat" className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-600">
                Kategori Produk
              </Label>
              <Select
                value={formData.category}
                onValueChange={(val) => setFormData((prev) => ({ ...prev, category: val }))}
              >
                <SelectTrigger id="prod-cat" className="rounded-xl border-slate-200 h-10 sm:h-12 font-bold text-xs sm:text-sm text-slate-700 bg-slate-50/50">
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat} className="font-semibold text-xs sm:text-sm text-slate-600">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="prod-badge" className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-600">
                Label / Badge Produk
              </Label>
              <Select
                value={formData.badge}
                onValueChange={(val) => setFormData((prev) => ({ ...prev, badge: val }))}
              >
                <SelectTrigger id="prod-badge" className="rounded-xl border-slate-200 h-10 sm:h-12 font-bold text-xs sm:text-sm text-slate-700 bg-slate-50/50">
                  <SelectValue placeholder="Pilih Badge" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {BADGE_OPTIONS.map((badge) => (
                    <SelectItem key={badge} value={badge} className="font-semibold text-xs sm:text-sm text-slate-600">
                      {badge}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="prod-business" className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-600">
                Nama Usaha / Toko / Brand *
              </Label>
              <Input
                id="prod-business"
                value={formData.businessName}
                onChange={(e) => setFormData((prev) => ({ ...prev, businessName: e.target.value }))}
                placeholder="Contoh: UMKM Berkah Karang"
                className="rounded-xl border-slate-200 h-10 sm:h-12 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-50/50 focus:bg-white"
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="prod-owner" className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-600">
                Nama Pemilik / Pengrajin
              </Label>
              <Input
                id="prod-owner"
                value={formData.owner}
                onChange={(e) => setFormData((prev) => ({ ...prev, owner: e.target.value }))}
                placeholder="Contoh: Ibu Siti Khotimah"
                className="rounded-xl border-slate-200 h-10 sm:h-12 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-50/50 focus:bg-white"
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="prod-price" className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-600">
                Harga (Rp) *
              </Label>
              <Input
                id="prod-price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                placeholder="Contoh: 15000"
                className="rounded-xl border-slate-200 h-10 sm:h-12 text-xs sm:text-sm font-bold text-amber-800 bg-slate-50/50 focus:bg-white"
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="prod-unit" className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-600">
                Satuan Harga
              </Label>
              <Input
                id="prod-unit"
                value={formData.priceUnit}
                onChange={(e) => setFormData((prev) => ({ ...prev, priceUnit: e.target.value }))}
                placeholder="Contoh: bks (250 gr) / pcs / botol / porsi"
                className="rounded-xl border-slate-200 h-10 sm:h-12 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-50/50 focus:bg-white"
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="prod-phone" className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-600">
                No. WhatsApp Pemesanan *
              </Label>
              <Input
                id="prod-phone"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="Contoh: 0895321109179"
                className="rounded-xl border-slate-200 h-10 sm:h-12 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-50/50 focus:bg-white"
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="prod-location" className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-600">
                Lokasi / Dusun
              </Label>
              <Input
                id="prod-location"
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="Contoh: Dusun Karanganyar, RT 02 / RW 03"
                className="rounded-xl border-slate-200 h-10 sm:h-12 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-50/50 focus:bg-white"
              />
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="prod-desc" className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-600">
              Deskripsi Produk
            </Label>
            <Textarea
              id="prod-desc"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Ceritakan komposisi, cita rasa, kegunaan, atau keunikan produk ini..."
              className="rounded-xl border-slate-200 min-h-[90px] sm:min-h-[100px] text-xs sm:text-sm font-semibold text-slate-700 bg-slate-50/50 focus:bg-white p-3 sm:p-4 resize-none leading-relaxed"
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="prod-features" className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-600">
              Keunggulan / Fitur Utama (1 baris per poin)
            </Label>
            <Textarea
              id="prod-features"
              value={formData.featuresText}
              onChange={(e) => setFormData((prev) => ({ ...prev, featuresText: e.target.value }))}
              placeholder="100% Singkong Pilihan Petani Lokal&#10;Tanpa Bahan Pengawet&#10;Kemasan Standar Higienis"
              className="rounded-xl border-slate-200 min-h-[70px] sm:min-h-[80px] text-xs sm:text-sm font-semibold text-slate-700 bg-slate-50/50 focus:bg-white p-3 sm:p-4 resize-none"
            />
          </div>

          {/* Marketplace Online Links */}
          <div className="space-y-2.5 sm:space-y-3.5 pt-2.5 sm:pt-3 pb-1 border-t border-slate-100">
            <div>
              <Label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-700">
                Link Toko Online / Marketplace (Opsional)
              </Label>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
                Masukkan tautan produk atau toko UMKM di marketplace agar pembeli dapat langsung memesan secara online.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-4">
              {/* Shopee */}
              <div className="space-y-1.5 bg-orange-50/50 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-orange-100">
                <Label htmlFor="prod-shopee" className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#EE4D2D] flex items-center gap-1.5">
                  <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-[#EE4D2D]" />
                  Shopee URL
                </Label>
                <Input
                  id="prod-shopee"
                  type="url"
                  value={formData.shopeeUrl}
                  onChange={(e) => setFormData((prev) => ({ ...prev, shopeeUrl: e.target.value }))}
                  placeholder="https://shopee.co.id/..."
                  className="rounded-xl border-orange-200 h-9 sm:h-10 text-xs font-semibold text-slate-700 bg-white focus:border-[#EE4D2D] focus:ring-[#EE4D2D]"
                />
              </div>

              {/* Tokopedia */}
              <div className="space-y-1.5 bg-emerald-50/50 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-emerald-100">
                <Label htmlFor="prod-tokopedia" className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#03AC0E] flex items-center gap-1.5">
                  <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-[#03AC0E]" />
                  Tokopedia URL
                </Label>
                <Input
                  id="prod-tokopedia"
                  type="url"
                  value={formData.tokopediaUrl}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tokopediaUrl: e.target.value }))}
                  placeholder="https://tokopedia.com/..."
                  className="rounded-xl border-emerald-200 h-9 sm:h-10 text-xs font-semibold text-slate-700 bg-white focus:border-[#03AC0E] focus:ring-[#03AC0E]"
                />
              </div>

              {/* Lazada */}
              <div className="space-y-1.5 bg-blue-50/50 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-blue-100">
                <Label htmlFor="prod-lazada" className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#0F146D] flex items-center gap-1.5">
                  <span className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-[#0F146D]" />
                  Lazada URL
                </Label>
                <Input
                  id="prod-lazada"
                  type="url"
                  value={formData.lazadaUrl}
                  onChange={(e) => setFormData((prev) => ({ ...prev, lazadaUrl: e.target.value }))}
                  placeholder="https://lazada.co.id/..."
                  className="rounded-xl border-blue-200 h-9 sm:h-10 text-xs font-semibold text-slate-700 bg-white focus:border-[#0F146D] focus:ring-[#0F146D]"
                />
              </div>
            </div>
          </div>

          {/* Photo Upload with Quota Compression */}
          <div className="space-y-2 sm:space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <Label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-600">
                Foto Produk (Cloudinary Hemat Kuota) *
              </Label>
              <span className="text-[9px] sm:text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 w-fit">
                Preset: webdesa (Maks 1000px, &lt;250KB)
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start">
              {formData.imageUrl ? (
                <div className="group relative aspect-[4/3] w-36 sm:w-44 rounded-xl sm:rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-50 shadow-xs shrink-0">
                  <img src={formData.imageUrl} alt="Preview Produk" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      onClick={() => setFormData((prev) => ({ ...prev, imageUrl: '' }))}
                      className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-rose-600 text-white hover:bg-rose-700 shadow-md"
                      title="Ganti Foto"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : null}

              <label className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-amber-400 transition-all cursor-pointer group w-full">
                {isUploading ? (
                  <div className="flex flex-col items-center py-2">
                    <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-amber-600 mb-2" />
                    <span className="text-xs font-bold text-slate-600">Sedang mengompres & mengunggah...</span>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="h-6 w-6 sm:h-8 sm:w-8 text-slate-400 group-hover:scale-110 group-hover:text-amber-600 transition-all duration-300 mb-1.5 sm:mb-2" />
                    <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-700">
                      {formData.imageUrl ? 'Ganti Foto Produk' : 'Pilih / Unggah Foto Produk'}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium mt-1 text-center">
                      Foto otomatis dikompres sebelum dikirim ke Cloudinary agar menghemat kuota server
                    </span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <DialogFooter className="pt-3 sm:pt-4 border-t border-slate-50 flex-col-reverse sm:flex-row gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto rounded-xl h-10 sm:h-12 font-bold px-5 sm:px-6 border-slate-200 text-xs sm:text-sm text-slate-600 hover:bg-slate-50"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="w-full sm:w-auto rounded-xl h-10 sm:h-12 font-black px-6 sm:px-8 bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 text-xs sm:text-sm"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>SIMPAN PRODUK</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
