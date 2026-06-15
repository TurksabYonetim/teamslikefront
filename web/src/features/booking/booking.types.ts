/** Booking API tipleri — /v1 event-types, availability, bookings sözleşmesine göre. */

export interface EventType {
  id: string;
  name: string;
  slug: string;
  duration_min: number;
  description: string;
  active: boolean;
  created_at: string;
}

export interface CreateEventTypeRequest {
  name: string;
  slug: string;
  duration_min: number;
  description?: string;
  active?: boolean;
}

export interface UpdateEventTypeRequest {
  name?: string;
  slug?: string;
  duration_min?: number;
  description?: string;
  active?: boolean;
}

/** weekday: 0=Pazartesi .. 6=Pazar. start/end null ise o gün kapalı. */
export interface AvailabilityRule {
  weekday: number;
  start_time: string | null; // "HH:MM:SS" | "HH:MM"
  end_time: string | null;
  timezone: string;
}

export interface CreateBookingRequest {
  event_type_id: string;
  invitee_name: string;
  invitee_email: string;
  start_at: string;
}

export interface Booking {
  id: string;
  event_type_id: string;
  invitee_name: string;
  invitee_email: string;
  start_at: string;
  end_at: string;
  status: string;
  created_at: string;
}

export interface ListBookingsParams {
  start?: string;
  end?: string;
}

/** Public (auth'suz) slug ile dönen yanıt. */
export interface PublicEventTypes {
  tenant_slug: string;
  tenant_name: string;
  event_types: EventType[];
  availability: AvailabilityRule[];
}

export interface CreatePublicBookingRequest {
  event_type_slug: string;
  invitee_name: string;
  invitee_email: string;
  start_at: string;
}
