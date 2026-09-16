import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateVillageNewsDraftInputSchema = z.object({
  title: z.string().describe('Judul kegiatan desa yang akan dijadikan berita.'),
  subtitle: z.string().describe('Sub judul singkat yang menjelaskan inti kegiatan.'),
  date: z.string().describe('Tanggal berita yang akan ditampilkan.'),
  author: z.string().optional().describe('Nama penulis atau tim yang membuat berita.'),
});

export type GenerateVillageNewsDraftInput = z.infer<typeof GenerateVillageNewsDraftInputSchema>;

const GenerateVillageNewsDraftOutputSchema = z.object({
  content: z.string().describe('Teks berita lengkap dalam 4-7 paragraf yang siap dimasukkan ke kolom isi berita.'),
});

export type GenerateVillageNewsDraftOutput = z.infer<typeof GenerateVillageNewsDraftOutputSchema>;

const generateVillageNewsPrompt = ai.definePrompt({
  name: 'generateVillageNewsDraftPrompt',
  input: { schema: GenerateVillageNewsDraftInputSchema },
  output: { schema: GenerateVillageNewsDraftOutputSchema },
  prompt: `Kamu adalah jurnalis resmi untuk website pemerintah desa. Buat draft berita kegiatan desa yang informatif, hangat, resmi, dan mudah dipahami.

Data input:
- Judul kegiatan: {{{title}}}
- Sub judul: {{{subtitle}}}
- Tanggal berita: {{{date}}}
- Penulis: {{{author}}}

Tugasmu:
- Tulis berita yang sesuai dengan judul kegiatan, sub judul, dan tanggal berita.
- Fokus pada kegiatan desa yang bersifat pelayanan, pemberdayaan, kerja sama, sosialisasi, perayaan, atau kegiatan masyarakat.
- Buat isi berita dalam 4 sampai 7 paragraf yang padu dan natural.
- Pisahkan setiap paragraf dengan satu baris kosong agar terlihat rapi.
- Gunakan bahasa Indonesia yang resmi namun enak dibaca.
- Sertakan nuansa positif, partisipatif, dan memperlihatkan manfaat kegiatan bagi masyarakat desa.
- Jangan menggunakan bullet points, daftar, atau heading tambahan.
- Jangan menulis angka yang tidak relevan.
- Hanya kembalikan teks berita yang siap dipakai di kolom isi berita.

Pastikan hasilnya bukan singkatan atau template kosong, melainkan narasi berita yang lengkap.`,
});

const generateVillageNewsFlow = ai.defineFlow(
  {
    name: 'generateVillageNewsFlow',
    inputSchema: GenerateVillageNewsDraftInputSchema,
    outputSchema: GenerateVillageNewsDraftOutputSchema,
  },
  async (input) => {
    const { output } = await generateVillageNewsPrompt(input);
    return output!;
  }
);

export async function generateVillageNewsDraft(input: GenerateVillageNewsDraftInput): Promise<GenerateVillageNewsDraftOutput> {
  return generateVillageNewsFlow(input);
}
