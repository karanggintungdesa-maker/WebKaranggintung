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
    <div className="space-y-3 sm:space-y-6 font-sans w-full max-w-full overflow-x-hidden">
      {/* Header Section */}
      <div className="border-b border-slate-200 pb-3 sm:pb-5">
        <div className="flex items-center justify-between gap-2 min-w-0">
          <h1 className="text-sm sm:text-2xl font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5 min-w-0">
            <Store className="h-4 w-4 sm:h-6 sm:w-6 text-amber-600 shrink-0" />
            <span className="truncate">Kelola UMKM &amp; Industri</span>
          </h1>
          {activeTab === 'informasi' ? (
            <Button
              onClick={() => {
                setEditingInfo(null);
                setInfoModalOpen(true);
              }}
              className="shrink-0 rounded-lg sm:rounded-full h-8 sm:h-11 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] sm:text-xs uppercase px-3 sm:px-6 shadow-lg shadow-amber-600/10 flex items-center gap-1.5"
            >
              <PlusCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Tambah </span><span>Info</span>
            </Button>
          ) : (
            <Button
              onClick={() => {
                setEditingProduct(null);
                setProductModalOpen(true);
              }}
              className="shrink-0 rounded-lg sm:rounded-full h-8 sm:h-11 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] sm:text-xs uppercase px-3 sm:px-6 shadow-lg shadow-amber-600/10 flex items-center gap-1.5"
            >
              <PlusCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Tambah </span><span>Produk</span>
            </Button>
          )}
        </div>
        <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 leading-relaxed line-clamp-1">
          Manajemen informasi UMKM &amp; katalog produk Desa Karanggintung
        </p>
      </div>

      {/* Stats Overview - 3 col on ALL screens */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-4 w-full">
        <div className="bg-white p-2.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-100 shadow-xs flex flex-col gap-1 min-w-0">
          <div className="h-7 w-7 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Info className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
          </div>
          <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400 block leading-tight">Informasi</span>
          <h3 className="text-base sm:text-2xl font-black text-slate-800 leading-none">{umkmInfoList.length}</h3>
        </div>

        <div className="bg-white p-2.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-100 shadow-xs flex flex-col gap-1 min-w-0">
          <div className="h-7 w-7 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShoppingBag className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
          </div>
          <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400 block leading-tight">Produk</span>
          <h3 className="text-base sm:text-2xl font-black text-emerald-700 leading-none">{productsList?.length || 0}</h3>
        </div>

        <div className="bg-white p-2.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-100 shadow-xs flex flex-col gap-1 min-w-0">
          <div className="h-7 w-7 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <PackageCheck className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
          </div>
          <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400 block leading-tight">Storage</span>
          <h3 className="text-[10px] sm:text-sm font-black text-teal-700 leading-tight">Cloud</h3>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-1 sm:gap-4 w-full">
        <button
          onClick={() => setActiveTab('informasi')}
          className={cn(
            'flex-1 flex items-center justify-center gap-1 sm:gap-2 pb-2 sm:pb-3 px-1 sm:px-3 font-bold text-[10px] sm:text-xs uppercase tracking-wider transition-all',
            activeTab === 'informasi'
              ? 'text-amber-700 border-b-2 border-amber-600'
              : 'text-slate-400 hover:text-slate-600'
          )}
        >
          <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
          <span className="truncate">Informasi ({umkmInfoList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('katalog')}
          className={cn(
            'flex-1 flex items-center justify-center gap-1 sm:gap-2 pb-2 sm:pb-3 px-1 sm:px-3 font-bold text-[10px] sm:text-xs uppercase tracking-wider transition-all',
            activeTab === 'katalog'
              ? 'text-amber-700 border-b-2 border-amber-600'
              : 'text-slate-400 hover:text-slate-600'
          )}
        >
          <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
          <span className="truncate">Katalog ({productsList?.length || 0})</span>
        </button>
      </div>

      {/* TAB 1: INFORMASI UMKM */}
      {activeTab === 'informasi' && (
        <div className="space-y-4 sm:space-y-6 w-full">
          {isLoadingInfo ? (
            <div className="flex flex-col items-center justify-center py-16 sm:py-20 bg-white border border-slate-100 rounded-2xl sm:rounded-3xl shadow-xs">
              <Loader2 className="h-7 w-7 sm:h-8 sm:w-8 animate-spin text-amber-600 mb-2" />
              <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-widest">Memuat informasi UMKM...</p>
            </div>
          ) : umkmInfoList.length === 0 ? (
            <div className="rounded-2xl sm:rounded-3xl bg-white p-6 sm:p-12 text-center shadow-xs border border-slate-100">
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Info className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <h3 className="text-slate-800 font-black text-sm sm:text-base uppercase">Belum Ada Informasi Khusus</h3>
                <p className="text-[11px] sm:text-xs text-slate-500 max-w-md">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-6 w-full">
              {umkmInfoList.map((item) => (
                <div key={item.id} className="rounded-2xl sm:rounded-3xl bg-white border border-slate-100 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-all w-full max-w-full">
                  <div className="w-full">
                    {item.imageUrls && item.imageUrls.length > 0 ? (
                      <div className="space-y-2 p-2.5 sm:p-3 bg-slate-50 w-full">
                        <div className="aspect-[16/9] w-full relative rounded-xl sm:rounded-2xl bg-slate-100 overflow-hidden shadow-xs">
                          <img src={item.imageUrls[0]} alt={item.title} className="w-full h-full object-cover" />
                          <div className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-sm text-white text-[8px] sm:text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                            {item.imageUrls.length} Foto Terlampir
                          </div>
                        </div>
                        {item.imageUrls.length > 1 && (
                          <div className="flex gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1 max-w-full">
                            {item.imageUrls.map((imgUrl, imgIdx) => (
                              <div key={imgIdx} className="aspect-[4/3] h-10 sm:h-12 rounded-lg overflow-hidden border-0 bg-white shrink-0 shadow-2xs">
                                <img src={imgUrl} alt={`Foto ${imgIdx + 1}`} className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="aspect-[16/9] w-full bg-slate-50 flex items-center justify-center text-slate-300">
                        <ImageIcon className="h-8 w-8 sm:h-10 sm:w-10" />
                      </div>
                    )}

                    <div className="p-3.5 sm:p-6 space-y-2 sm:space-y-3 min-w-0">
                      <div className="space-y-1 min-w-0">
                        <Badge className="bg-amber-50 text-amber-700 border-none text-[8px] sm:text-[9px] font-bold uppercase">
                          Informasi UMKM
                        </Badge>
                        <h3 className="text-sm sm:text-lg font-black text-slate-800 uppercase tracking-tight leading-snug break-words">
                          {item.title}
                        </h3>
                        {item.subtitle && (
                          <p className="text-[10px] sm:text-xs font-bold text-amber-700 break-words">{item.subtitle}</p>
                        )}
                      </div>

                      <p className="text-[10px] sm:text-xs text-slate-600 line-clamp-3 leading-relaxed font-medium break-words">
                        {item.narrative}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 sm:p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-end gap-1.5 sm:gap-2 min-w-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingInfo(item);
                        setInfoModalOpen(true);
                      }}
                      className="rounded-lg sm:rounded-xl h-7 sm:h-9 px-2.5 sm:px-3 text-[10px] sm:text-xs font-bold text-slate-700 hover:bg-slate-100 border border-slate-200 bg-white shadow-2xs"
                    >
                      <Edit className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                      <span>Edit</span>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteInfo(item.id, item.title)}
                      className="rounded-lg sm:rounded-xl h-7 sm:h-9 px-2.5 sm:px-3 text-[10px] sm:text-xs font-bold bg-rose-600 hover:bg-rose-700"
                    >
                      <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                      <span>Hapus</span>
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
        <div className="space-y-3 sm:space-y-6 w-full max-w-full">
          {/* Search & Category Filter */}
          <div className="bg-white p-2.5 sm:p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col gap-2 w-full max-w-full overflow-hidden">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                placeholder="Cari produk / nama usaha..."
                className="pl-8 h-8 sm:h-10 rounded-xl text-xs font-medium border-slate-200 w-full"
              />
            </div>

            <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-1 py-0.5 w-full">
              <button
                onClick={() => setCategoryFilter('Semua')}
                className={cn(
                  'px-2 sm:px-3 py-0.5 sm:py-1.5 rounded-lg text-[9px] sm:text-xs font-bold transition-all whitespace-nowrap shrink-0',
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
                    'px-2 sm:px-3 py-0.5 sm:py-1.5 rounded-lg text-[9px] sm:text-xs font-bold transition-all whitespace-nowrap shrink-0',
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

          {/* Products List / Cards */}
          {isLoadingProducts ? (
            <div className="flex flex-col items-center justify-center py-16 sm:py-20 bg-white border border-slate-100 rounded-2xl sm:rounded-3xl shadow-xs">
              <Loader2 className="h-7 w-7 sm:h-8 sm:w-8 animate-spin text-amber-600 mb-2" />
              <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-widest">Memuat katalog produk...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-2xl sm:rounded-3xl bg-white p-6 sm:p-12 text-center shadow-xs border border-slate-100">
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <ShoppingBag className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <h3 className="text-slate-800 font-black text-sm sm:text-base uppercase">Belum Ada Produk Terdaftar</h3>
                <p className="text-[11px] sm:text-xs text-slate-500 max-w-md">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6 w-full max-w-full">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-all w-full max-w-full"
                >
                  <div className="w-full">
                    <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
                      <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" />
                      {prod.badge && (
                        <div className="absolute top-2 left-2 bg-slate-900/85 text-white px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase">
                          {prod.badge}
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-bold uppercase">
                        {prod.category}
                      </div>
                    </div>

                    <div className="p-3 sm:p-5 space-y-2 sm:space-y-3 min-w-0">
                      <div className="min-w-0">
                        <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 block truncate">{prod.businessName}</span>
                        <h4 className="font-black text-slate-800 text-xs sm:text-base leading-snug line-clamp-2 break-words">{prod.name}</h4>
                      </div>

                      <div className="flex items-baseline justify-between pt-0.5 sm:pt-1 min-w-0">
                        <span className="text-[10px] sm:text-xs text-slate-400 font-bold shrink-0">Harga:</span>
                        <span className="text-xs sm:text-base font-black text-amber-700 truncate text-right">
                          Rp {prod.price.toLocaleString('id-ID')}
                          <span className="text-[9px] sm:text-[10px] font-medium text-slate-400 ml-1">/ {prod.priceUnit}</span>
                        </span>
                      </div>

                      <div className="text-[10px] sm:text-[11px] text-slate-500 space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-600 shrink-0" />
                          <span className="truncate">{prod.location || 'Desa Karanggintung'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 min-w-0">
                          <MessageCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">+{prod.phone} ({prod.owner})</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 sm:p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-1.5 sm:gap-2 min-w-0">
                    <a
                      href={`https://wa.me/${prod.phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] sm:text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1 min-w-0 truncate"
                    >
                      <span className="truncate">Tes WhatsApp</span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>

                    <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingProduct(prod);
                          setProductModalOpen(true);
                        }}
                        className="rounded-lg sm:rounded-xl h-7 sm:h-8 px-2 sm:px-3 text-[10px] sm:text-xs font-bold text-slate-700 hover:bg-slate-100 border-slate-200"
                      >
                        <Edit className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                        <span>Edit</span>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteProduct(prod.id, prod.name)}
                        className="rounded-lg sm:rounded-xl h-7 sm:h-8 px-2 sm:px-2.5 text-[10px] sm:text-xs font-bold bg-rose-600 hover:bg-rose-700"
                      >
                        <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
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
