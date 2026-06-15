/** Intelligence (transkript + analitik) API tipleri — /v1/transcripts sözleşmesine göre. */

export interface Transcript {
  id: string;
  title: string;
  content: string;
  language: string;
  meeting_id: string | null;
  created_at: string;
}

export interface CreateTranscriptRequest {
  title: string;
  content?: string;
  language?: string;
  meeting_id?: string | null;
}

export interface UpdateTranscriptRequest {
  title?: string;
  content?: string;
  language?: string;
  meeting_id?: string | null;
}

/** Bir transkript için client-side hesaplanan basit analitik. */
export interface TranscriptAnalytics {
  /** Toplam kelime sayısı. */
  words: number;
  /** Toplam karakter sayısı. */
  characters: number;
  /** Satır (paragraf) sayısı. */
  lines: number;
  /** Cümle sayısı (. ! ? … ile tahmini). */
  sentences: number;
  /**
   * Tahmini konuşma süresi (dakika). Ortalama konuşma hızı ~130 kelime/dakika
   * varsayımıyla hesaplanır.
   */
  speakingMinutes: number;
  /** Analitikte kullanılan kelime/dakika varsayımı. */
  wpm: number;
}

/** Kelime frekansı (en sık geçen kelimeler grafiği için). */
export interface WordFrequency {
  word: string;
  count: number;
}

/** "İsim: ..." kalıbından ayrıştırılan konuşmacı segmenti. */
export interface TranscriptSegment {
  /** Konuşmacı adı. */
  speaker: string;
  /** Varsa zaman damgası (örn. "00:12"). */
  timestamp: string | null;
  /** Segment metni. */
  text: string;
}
