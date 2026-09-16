'use client';

import React, { useState, useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Store,
  ShoppingBag,
  Info,
  PlusCircle,
  Trash2,
  Edit,
  Loader2,
  ImageIcon,
  Search,
  MessageCircle,
  Tag,
  ExternalLink,
  MapPin,
  TrendingUp,
  PackageCheck
} from 'lucide-react';
import { PotensiDesa, ProductUmkm } from '@/lib/types';
import { UmkmInfoForm } from './_components/umkm-info-form';
import { KatalogProdukForm, PRODUCT_CATEGORIES } from './_components/katalog-produk-form';
import { cn } from '@/lib/utils';

export default function AdminUmkmIndustriPage() {
  const { toast } = useToast();
  const firestore = useFirestore();

  const [activeTab, setActiveTab] = useState<'informasi' | 'katalog'>('informasi');

  // Modal states for Informasi
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [editingInfo, setEditingInfo] = useState<PotensiDesa | null>(null);

  // Modal states for Katalog Produk
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductUmkm | null>(null);

  // Product filters
  const [searchProduct, setSearchProduct] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua');

  // Query Informasi (from potensiDesa collection category === 'umkm-industri')
  const infoQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'potensiDesa'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: allPotentials, isLoading: isLoadingInfo } = useCollection<PotensiDesa>(infoQuery, { suppressGlobalError: true });

  const umkmInfoList = useMemo(() => {
    if (!allPotentials) return [];
    return allPotentials.filter((item) => item.category === 'umkm-industri');
  }, [allPotentials]);

  // Query Katalog Produk (from katalogProduk collection)
  const productsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'katalogProduk'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: productsList, isLoading: isLoadingProducts } = useCollection<ProductUmkm>(productsQuery, { suppressGlobalError: true });

  // Filter products
  const filteredProducts = useMemo(() => {
    if (!productsList) return [];
    return productsList.filter((prod) => {
      const matchSearch =
        prod.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
        prod.businessName.toLowerCase().includes(searchProduct.toLowerCase()) ||
        (prod.owner && prod.owner.toLowerCase().includes(searchProduct.toLowerCase()));
      const matchCategory = categoryFilter === 'Semua' || prod.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [productsList, searchProduct, categoryFilter]);

  // Delete Handlers
  const handleDeleteInfo = async (id: string, title: string) => {
    if (!firestore) return;
    if (!window.confirm(`Apakah Anda yakin ingin menghapus informasi "${title}"?`)) return;

    try {
      await deleteDoc(doc(firestore, 'potensiDesa', id));
      toast({
        title: 'Berhasil Dihapus',
        description: `Informasi "${title}" berhasil dihapus.`,
      });
    } catch (error: any) {
      toast({
        title: 'Gagal Menghapus',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!firestore) return;
    if (!window.confirm(`Apakah Anda yakin ingin menghapus produk "${name}" dari katalog?`)) return;

    try {
      await deleteDoc(doc(firestore, 'katalogProduk', id));
      toast({
        title: 'Berhasil Dihapus',
        description: `Produk "${name}" berhasil dihapus dari katalog.`,
      });
    } catch (error: any) {
      toast({
        title: 'Gagal Menghapus',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-wider flex items-center gap-2.5">
            <Store className="h-6 w-6 text-amber-600 animate-pulse" />
            <span>Kelola UMKM & Industri Kreatif</span>
          </h1>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            Manajemen informasi pemberdayaan warga dan katalog produk karya masyarakat Desa Karanggintung
          </p>
        </div>

        {activeTab === 'informasi' ? (
          <Button
            onClick={() => {
              setEditingInfo(null);
              setInfoModalOpen(true);
            }}
            className="rounded-full h-11 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider px-6 shrink-0 shadow-lg shadow-amber-600/10 flex items-center gap-2"
          >
            <PlusCircle className="h-4.5 w-4.5" />
            <span>Tambah Informasi</span>
          </Button>
        ) : (
          <Button
            onClick={() => {
              setEditingProduct(null);
              setProductModalOpen(true);
            }}
            className="rounded-full h-11 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider px-6 shrink-0 shadow-lg shadow-amber-600/10 flex items-center gap-2"
          >
            <PlusCircle className="h-4.5 w-4.5" />
            <span>Tambah Produk Baru</span>
          </Button>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border-0 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Ulasan Informasi</span>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{umkmInfoList.length} Item</h3>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Info className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border-0 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Produk di Katalog</span>
            <h3 className="text-2xl font-black text-emerald-700 mt-1">{productsList?.length || 0} Produk</h3>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ShoppingBag className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border-0 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Penyimpanan Media</span>
            <h3 className="text-sm font-black text-teal-700 mt-1">Cloudinary (Hemat Kuota)</h3>
          </div>
          <div className="h-12 w-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <PackageCheck className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('informasi')}
          className={cn(
            'flex items-center gap-2 pb-3 px-2 font-bold text-xs uppercase tracking-wider transition-all',
            activeTab === 'informasi'
              ? 'text-amber-700 border-b-2 border-amber-600'
              : 'text-slate-400 hover:text-slate-600'
          )}
        >
          <Info className="h-4 w-4" />
          <span>Tab 1: Informasi UMKM ({umkmInfoList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('katalog')}
          className={cn(
            'flex items-center gap-2 pb-3 px-2 font-bold text-xs uppercase tracking-wider transition-all',
            activeTab === 'katalog'
              ? 'text-amber-700 border-b-2 border-amber-600'
              : 'text-slate-400 hover:text-slate-600'
          )}
        >
          <ShoppingBag className="h-4 w-4" />
          <span>Tab 2: Katalog Produk ({productsList?.length || 0})</span>
        </button>
      </div>

      {/* TAB 1: INFORMASI UMKM */}
      {activeTab === 'informasi' && (
        <div className="space-y-6">
          {isLoadingInfo ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white border-0 rounded-3xl shadow-sm">
              <Loader2 className="h-8 w-8 animate-spin text-amber-600 mb-2" />
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Memuat informasi UMKM...</p>
            </div>
          ) : umkmInfoList.length === 0 ? (
            <div className="rounded-3xl bg-white p-12 text-center shadow-sm">
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="h-14 w-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Info className="h-7 w-7" />
                </div>
                <h3 className="text-slate-800 font-black text-base uppercase">Belum Ada Informasi Khusus</h3>
                <p className="text-xs text-slate-500 max-w-md">
                  Klik tombol <strong>Tambah Informasi</strong> di atas untuk mempublikasikan narasi sentra usaha atau profil UMKM baru.
                </p>
                <Button
                  onClick={() => {
                    setEditingInfo(null);
                    setInfoModalOpen(true);
                  }}
                  className="rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Tambah Sekarang
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {umkmInfoList.map((item) => (
                <div key={item.id} className="rounded-3xl bg-white border-0 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all">
                  <div>
                    {item.imageUrls && item.imageUrls.length > 0 ? (
                      <div className="space-y-2 p-3 bg-slate-50">
                        <div className="aspect-[16/9] w-full relative rounded-2xl bg-slate-100 overflow-hidden shadow-sm">
                          <img src={item.imageUrls[0]} alt={item.title} className="w-full h-full object-cover" />
                          <div className="absolute bottom-2.5 right-2.5 bg-slate-900/80 backdrop-blur-sm text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full">
                            {item.imageUrls.length} Foto Terlampir
                          </div>
                        </div>
                        {item.imageUrls.length > 1 && (
                          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                            {item.imageUrls.map((imgUrl, imgIdx) => (
                              <div key={imgIdx} className="aspect-[4/3] h-12 rounded-lg overflow-hidden border-0 bg-white shrink-0 shadow-xs">
                                <img src={imgUrl} alt={`Foto ${imgIdx + 1}`} className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="aspect-[16/9] w-full bg-slate-50 flex items-center justify-center text-slate-300">
                        <ImageIcon className="h-10 w-10" />
                      </div>
                    )}

                    <div className="p-6 space-y-3">
                      <div className="space-y-1">
                        <Badge className="bg-amber-50 text-amber-700 border-none text-[9px] font-bold uppercase">
                          Informasi UMKM
                        </Badge>
                        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight leading-snug">
                          {item.title}
                        </h3>
                        {item.subtitle && (
                          <p className="text-xs font-bold text-amber-700">{item.subtitle}</p>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed font-medium">
                        {item.narrative}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50/70 flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingInfo(item);
                        setInfoModalOpen(true);
                      }}
                      className="rounded-xl h-9 text-xs font-bold text-slate-700 hover:bg-slate-100 border-0 bg-white shadow-2xs"
                    >
                      <Edit className="h-3.5 w-3.5 mr-1.5" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteInfo(item.id, item.title)}
                      className="rounded-xl h-9 text-xs font-bold bg-rose-600 hover:bg-rose-700 border-0"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                      Hapus
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: KATALOG PRODUK */}
      {activeTab === 'katalog' && (
        <div className="space-y-6">
          {/* Search & Category Filter */}
          <div className="bg-white p-4 rounded-2xl border-0 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                placeholder="Cari produk / nama usaha..."
                className="pl-10 h-10 rounded-xl text-xs font-medium border-slate-200"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
              <button
                onClick={() => setCategoryFilter('Semua')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
                  categoryFilter === 'Semua'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                Semua
              </button>
              {PRODUCT_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
                    categoryFilter === cat
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Products List / Table */}
          {isLoadingProducts ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white border-0 rounded-3xl shadow-sm">
              <Loader2 className="h-8 w-8 animate-spin text-amber-600 mb-2" />
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Memuat katalog produk...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-3xl bg-white p-12 text-center shadow-sm">
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="h-14 w-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <ShoppingBag className="h-7 w-7" />
                </div>
                <h3 className="text-slate-800 font-black text-base uppercase">Belum Ada Produk Terdaftar</h3>
                <p className="text-xs text-slate-500 max-w-md">
                  Tambahkan produk warga pertama Anda sekarang untuk dipromosikan di halaman publik portal desa.
                </p>
                <Button
                  onClick={() => {
                    setEditingProduct(null);
                    setProductModalOpen(true);
                  }}
                  className="rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Tambah Produk Pertama
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white rounded-3xl border-0 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all"
                >
                  <div>
                    <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
                      <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" />
                      {prod.badge && (
                        <div className="absolute top-2.5 left-2.5 bg-slate-900/85 text-white px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase">
                          {prod.badge}
                        </div>
                      )}
                      <div className="absolute top-2.5 right-2.5 bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase">
                        {prod.category}
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block">{prod.businessName}</span>
                        <h4 className="font-black text-slate-800 text-base leading-snug line-clamp-2">{prod.name}</h4>
                      </div>

                      <div className="flex items-baseline justify-between pt-1">
                        <span className="text-xs text-slate-400 font-bold">Harga:</span>
                        <span className="text-base font-black text-amber-700">
                          Rp {prod.price.toLocaleString('id-ID')}
                          <span className="text-[10px] font-medium text-slate-400 ml-1">/ {prod.priceUnit}</span>
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-500 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                          <span className="truncate">{prod.location || 'Desa Karanggintung'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MessageCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span>+{prod.phone} ({prod.owner})</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                    <a
                      href={`https://wa.me/${prod.phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
                    >
                      <span>Tes WhatsApp</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>

                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingProduct(prod);
                          setProductModalOpen(true);
                        }}
                        className="rounded-xl h-8 px-3 text-xs font-bold text-slate-700 hover:bg-slate-100"
                      >
                        <Edit className="h-3.5 w-3.5 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteProduct(prod.id, prod.name)}
                        className="rounded-xl h-8 px-3 text-xs font-bold bg-rose-600 hover:bg-rose-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Forms Modals */}
      <UmkmInfoForm
        open={infoModalOpen}
        onOpenChange={setInfoModalOpen}
        infoData={editingInfo}
      />

      <KatalogProdukForm
        open={productModalOpen}
        onOpenChange={setProductModalOpen}
        product={editingProduct}
      />
    </div>
  );
}
