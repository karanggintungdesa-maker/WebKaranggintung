'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Phone, Plus, Trash2, Shield, Heart, Landmark, Users } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { ImportantNumberContact, ImportantNumbersData } from '@/lib/types';

const defaultContacts: ImportantNumberContact[] = [
  { id: '1', label: 'Kepala Desa', number: '082324502378', category: 'pemerintah' },
  { id: '2', label: 'Babinsa', number: '081282148178', category: 'keamanan' },
  { id: '3', label: 'Bhabinkamtibmas', number: '085229658988', category: 'keamanan' },
  { id: '4', label: 'Bidan Desa', number: '081226370112', category: 'kesehatan' },
  { id: '5', label: 'Camat Gandrungmangu', number: '08122727683', category: 'pemerintah' },
  { id: '6', label: 'Koramil Gandrungmangu', number: '085229658988', category: 'keamanan' },
  { id: '7', label: 'Polsek Gandrungmangu', number: '083867770110', category: 'keamanan' },
  { id: '8', label: 'Puskesmas Karangpucung', number: '082234577980', category: 'kesehatan' },
  { id: '9', label: 'Kadus 1', number: '082138337494', category: 'wilayah' },
  { id: '10', label: 'Kadus 2', number: '085282256678', category: 'wilayah' },
  { id: '11', label: 'Kadus 3', number: '083113339132', category: 'wilayah' },
];

export function ImportantNumbersSettingsForm() {
  const [contacts, setContacts] = useState<ImportantNumberContact[]>([]);
  const [servicePhoneNumber, setServicePhoneNumber] = useState('085111318412');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();

  const numbersRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'villageProfile', 'importantNumbers');
  }, [firestore]);

  const { data: numbersData, isLoading: isDataLoading } = useDoc<ImportantNumbersData>(numbersRef);

  useEffect(() => {
    if (numbersData) {
      if (numbersData.contacts && numbersData.contacts.length > 0) {
        setContacts(numbersData.contacts);
      } else {
        setContacts(defaultContacts);
      }
      if (numbersData.servicePhoneNumber) {
        setServicePhoneNumber(numbersData.servicePhoneNumber);
      }
    } else if (!isDataLoading) {
      setContacts(defaultContacts);
    }
  }, [numbersData, isDataLoading]);

  const handleContactChange = (index: number, field: keyof ImportantNumberContact, value: string) => {
    const updated = [...contacts];
    updated[index] = { ...updated[index], [field]: value };
    setContacts(updated);
  };

  const handleAddContact = () => {
    const newId = Date.now().toString();
    setContacts([
      ...contacts,
      { id: newId, label: 'Jabatan / Nama Kontak Baru', number: '08...', category: 'pemerintah' }
    ]);
  };

  const handleDeleteContact = (index: number) => {
    const updated = contacts.filter((_, i) => i !== index);
    setContacts(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !numbersRef) return;
    setIsSaving(true);

    try {
      await setDoc(
        numbersRef,
        {
          contacts,
          servicePhoneNumber,
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );
      toast({
        title: 'Nomor Penting Disimpan',
        description: 'Seluruh nomor penting dan nomor pelayanan desa berhasil diperbarui.'
      });
    } catch (error) {
      console.error('Error saving important numbers:', error);
      toast({
        title: 'Gagal Menyimpan',
        description: 'Terjadi kesalahan saat menyimpan nomor penting.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isDataLoading) {
    return <Skeleton className="h-[400px] w-full rounded-2xl" />;
  }

  return (
    <Card className="shadow-sm border border-slate-200 rounded-2xl sm:rounded-3xl overflow-hidden">
      <CardHeader className="p-3.5 sm:p-6 pb-2.5 sm:pb-4 border-b border-slate-100">
        <CardTitle className="flex items-center gap-2 text-xs sm:text-base font-bold text-slate-900">
          <Phone className="h-4 w-4 text-primary shrink-0" />
          Nomor Penting & Pelayanan
        </CardTitle>
        <CardDescription className="text-[11px] sm:text-xs">
          Kelola daftar nomor telepon darurat, perangkat desa, instansi, serta nomor pelayanan utama publik.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3.5 sm:p-6 pt-3.5 sm:pt-4">
        <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-5">
          {/* Main Service Phone Number */}
          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-1.5 sm:space-y-2">
            <Label htmlFor="service-phone" className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-primary" />
              Nomor Utama Pelayanan Desa Karanggintung
            </Label>
            <Input
              id="service-phone"
              type="text"
              placeholder="Contoh: 0851 1131 8412"
              value={servicePhoneNumber}
              onChange={(e) => setServicePhoneNumber(e.target.value)}
              disabled={isSaving}
              className="bg-white font-mono font-bold text-xs h-8 sm:h-9"
            />
            <p className="text-[10px] text-slate-500 font-medium">
              Nomor ini ditampilkan di kartu banner panggilan utama halaman publik /nomor-penting.
            </p>
          </div>

          {/* List of Contact Items */}
          <div className="space-y-2.5 sm:space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Daftar Kontak ({contacts.length})
                </h4>
                <p className="text-[10px] text-slate-500">
                  Ubah nama instansi/jabatan, nomor HP, dan kategori.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddContact}
                disabled={isSaving}
                className="w-full sm:w-auto rounded-lg sm:rounded-xl gap-1.5 font-bold text-xs border-primary text-primary hover:bg-primary/5 shrink-0 h-7 sm:h-8"
              >
                <Plus className="h-3.5 w-3.5" />
                Tambah Nomor
              </Button>
            </div>

            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {contacts.map((contact, index) => (
                <div
                  key={contact.id || index}
                  className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col gap-2 transition-all hover:border-emerald-300"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="space-y-1 min-w-0">
                      <Label className="text-[9px] uppercase font-bold text-slate-400">Label Kontak</Label>
                      <Input
                        type="text"
                        placeholder="Nama Jabatan / Kontak"
                        value={contact.label}
                        onChange={(e) => handleContactChange(index, 'label', e.target.value)}
                        disabled={isSaving}
                        className="bg-white text-xs font-bold h-8"
                      />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <Label className="text-[9px] uppercase font-bold text-slate-400">Nomor Telepon</Label>
                      <Input
                        type="text"
                        placeholder="No. Telepon"
                        value={contact.number}
                        onChange={(e) => handleContactChange(index, 'number', e.target.value)}
                        disabled={isSaving}
                        className="bg-white font-mono text-xs font-bold h-8"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 space-y-1 min-w-0">
                      <Label className="text-[9px] uppercase font-bold text-slate-400">Kategori</Label>
                      <Select
                        value={contact.category}
                        onValueChange={(val) => handleContactChange(index, 'category', val)}
                        disabled={isSaving}
                      >
                        <SelectTrigger className="bg-white text-xs font-bold h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pemerintah" className="text-xs font-bold">Pemerintahan</SelectItem>
                          <SelectItem value="keamanan" className="text-xs font-bold">Keamanan</SelectItem>
                          <SelectItem value="kesehatan" className="text-xs font-bold">Kesehatan</SelectItem>
                          <SelectItem value="wilayah" className="text-xs font-bold">Kepala Dusun</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteContact(index)}
                      disabled={isSaving || contacts.length <= 1}
                      className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg sm:rounded-xl mt-3.5 h-8 w-8 shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto h-8 sm:h-9 px-5 rounded-lg sm:rounded-xl font-bold bg-primary text-white text-xs shadow-md shadow-primary/20 hover:bg-emerald-800"
          >
            {isSaving ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-2 h-3.5 w-3.5" />}
            Simpan Nomor Penting
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
