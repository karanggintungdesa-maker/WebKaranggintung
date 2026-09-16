/**
 * @fileOverview Client-side Gemini API helper using the REST API directly.
 * This replaces Genkit-based flows which are server-only and incompatible
 * with Next.js static export (output: 'export').
 */

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Read from env — set NEXT_PUBLIC_GEMINI_API_KEY in .env.local
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? '';

async function callGemini(prompt: string): Promise<string> {
  if (!API_KEY) {
    throw new Error('NEXT_PUBLIC_GEMINI_API_KEY is not set.');
  }
  const res = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

// ---------------------------------------------------------------------------
// Equivalents of Genkit flows — callable from client components
// ---------------------------------------------------------------------------

export interface SummarizeComplaintFeedbackInput {
  complaintText: string;
}
export interface SummarizeComplaintFeedbackOutput {
  summary: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  keywords: string[];
}

export async function summarizeComplaintFeedback(
  input: SummarizeComplaintFeedbackInput
): Promise<SummarizeComplaintFeedbackOutput> {
  const prompt = `Kamu adalah asisten AI yang membantu merangkum pengaduan atau masukan warga untuk administrator desa.
Berikan ringkasan singkat, identifikasi sentimen (positive/neutral/negative), dan kata kunci utama.
Balas HANYA dalam format JSON berikut tanpa penjelasan tambahan:
{"summary":"...","sentiment":"neutral","keywords":["...", "..."]}

Teks Pengaduan:
${input.complaintText}`;

  const raw = await callGemini(prompt);
  // Extract JSON from the response
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Invalid response from Gemini');
  return JSON.parse(match[0]) as SummarizeComplaintFeedbackOutput;
}

// ---------------------------------------------------------------------------

export interface SummarizeVillageDocumentInput {
  documentContent: string;
}
export interface SummarizeVillageDocumentOutput {
  summary: string;
}

export async function summarizeVillageDocument(
  input: SummarizeVillageDocumentInput
): Promise<SummarizeVillageDocumentOutput> {
  const prompt = `Kamu adalah ahli administrator desa. Ringkas dokumen berikut menjadi poin-poin penting yang jelas dan singkat dalam bahasa Indonesia.
Balas HANYA dalam format JSON: {"summary":"..."}

Isi Dokumen:
${input.documentContent}`;

  const raw = await callGemini(prompt);
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Invalid response from Gemini');
  return JSON.parse(match[0]) as SummarizeVillageDocumentOutput;
}

// ---------------------------------------------------------------------------

export interface GenerateVillageNewsDraftInput {
  title: string;
  subtitle: string;
  date: string;
  author?: string;
}
export interface GenerateVillageNewsDraftOutput {
  content: string;
}

export async function generateVillageNewsDraft(
  input: GenerateVillageNewsDraftInput
): Promise<GenerateVillageNewsDraftOutput> {
  try {
    const res = await fetch('/api/ai/generate-news', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.content) {
        return { content: data.content.trim() };
      }
    }
  } catch (apiError) {
    console.warn('Call to /api/ai/generate-news failed, using client fallback:', apiError);
  }

  // Fallback jika fetch gagal (misal koneksi jaringan)
  const cleanTitle = input.title || 'Kegiatan Desa Karanggintung';
  const cleanSubtitle = input.subtitle || 'Pembangunan dan Pelayanan Masyarakat';
  const cleanDate = input.date || 'Hari ini';

  const fallbackDraft = `KARANGGINTUNG – Pemerintah Desa Karanggintung, Kecamatan Gandrungmangu, Kabupaten Cilacap terus menggiatkan berbagai agenda pembangunan dan pelayanan prima untuk masyarakat. Pada ${cleanDate}, diselenggarakan kegiatan "${cleanTitle}" yang berfokus pada ${cleanSubtitle}.

Kegiatan ini diikuti oleh jajaran perangkat desa, Badan Permusyawaratan Desa (BPD), pengurus RT/RW, dan tokoh masyarakat dengan semangat kebersamaan dan gotong royong yang tinggi.

Pemerintah Desa Karanggintung menegaskan komitmennya untuk terus mendukung inisiatif positif yang berdampak langsung bagi peningkatan kesejahteraan warga di 5 Dusun (Karanggintung, Pagergunung, Sindangraja, Penumbang, dan Karangtawang).

Melalui sinergi yang solid antara pemerintah desa dan seluruh lapisan masyarakat, program ini diharapkan dapat berjalan secara berkesinambungan demi mewujudkan Desa Karanggintung yang maju, mandiri, dan sejahtera.`;

  return { content: fallbackDraft };
}

// ---------------------------------------------------------------------------

export interface GenerateDocumentNumberInput {
  manualNumber: number;
}
export type GenerateDocumentNumberOutput = string;

function toRoman(num: number): string {
  const roman: Record<string, number> = {
    M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90,
    L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1,
  };
  let str = '';
  for (const i of Object.keys(roman)) {
    const q = Math.floor(num / roman[i]);
    num -= q * roman[i];
    str += i.repeat(q);
  }
  return str;
}

export function generateDocumentNumber(
  input: GenerateDocumentNumberInput
): GenerateDocumentNumberOutput {
  // This function is purely computational — no AI needed
  const now = new Date();
  const monthInRoman = toRoman(now.getMonth() + 1);
  const year = now.getFullYear();
  const villageCode = '02';
  return `${String(input.manualNumber).padStart(3, '0')}/${monthInRoman}/${villageCode}/${year}`;
}
