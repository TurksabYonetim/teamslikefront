import axios from "axios";
import { api } from "@/lib/api";
import { config } from "@/config";
import type {
  Booking,
  CreateBookingRequest,
  CreateEventTypeRequest,
  CreatePublicBookingRequest,
  EventType,
  AvailabilityRule,
  ListBookingsParams,
  PublicEventTypes,
  UpdateEventTypeRequest,
} from "./booking.types";

/**
 * Public uçlar auth gerektirmez; staff JWT göndermemek için merkezi
 * interceptor'lı `api` yerine çıplak axios örneği kullanılır.
 */
const publicClient = axios.create({
  baseURL: config.apiBaseUrl,
  headers: { "Content-Type": "application/json" },
});

export const bookingApi = {
  // ---- event types -------------------------------------------------
  listEventTypes: () =>
    api.get<EventType[]>("/v1/event-types").then((r) => r.data),

  createEventType: (body: CreateEventTypeRequest) =>
    api.post<EventType>("/v1/event-types", body).then((r) => r.data),

  updateEventType: (id: string, body: UpdateEventTypeRequest) =>
    api.patch<EventType>(`/v1/event-types/${id}`, body).then((r) => r.data),

  removeEventType: (id: string) =>
    api.delete<void>(`/v1/event-types/${id}`).then((r) => r.data),

  // ---- availability ------------------------------------------------
  getAvailability: () =>
    api.get<AvailabilityRule[]>("/v1/availability").then((r) => r.data),

  putAvailability: (rules: AvailabilityRule[]) =>
    api
      .put<AvailabilityRule[]>("/v1/availability", { rules })
      .then((r) => r.data),

  // ---- bookings ----------------------------------------------------
  listBookings: (params?: ListBookingsParams) =>
    api.get<Booking[]>("/v1/bookings", { params }).then((r) => r.data),

  createBooking: (body: CreateBookingRequest) =>
    api.post<Booking>("/v1/bookings", body).then((r) => r.data),

  // ---- public (no auth) --------------------------------------------
  getPublicEventTypes: (slug: string) =>
    publicClient
      .get<PublicEventTypes>(`/v1/public/event-types/${slug}`)
      .then((r) => r.data),

  createPublicBooking: (tenantSlug: string, body: CreatePublicBookingRequest) =>
    publicClient
      .post<Booking>("/v1/public/bookings", body, {
        params: { tenant_slug: tenantSlug },
      })
      .then((r) => r.data),
};
