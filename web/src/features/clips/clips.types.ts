/** Clips API tipleri — /v1/clips sözleşmesine göre. */

export interface Clip {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string | null;
  duration_s: number | null;
  created_at: string;
}

export interface CreateClipRequest {
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string | null;
  duration_s?: number | null;
}

export interface UpdateClipRequest {
  title?: string;
  description?: string;
  video_url?: string;
  thumbnail_url?: string | null;
  duration_s?: number | null;
}
