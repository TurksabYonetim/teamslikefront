import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bookingApi } from "./booking.api";
import type {
  AvailabilityRule,
  CreateBookingRequest,
  CreateEventTypeRequest,
  CreatePublicBookingRequest,
  EventType,
  ListBookingsParams,
  UpdateEventTypeRequest,
} from "./booking.types";

const EVENT_TYPES_KEY = ["booking", "event-types"] as const;
const AVAILABILITY_KEY = ["booking", "availability"] as const;
const BOOKINGS_KEY = ["booking", "bookings"] as const;

// ---- event types ----------------------------------------------------

export function useEventTypes() {
  return useQuery({
    queryKey: EVENT_TYPES_KEY,
    queryFn: () => bookingApi.listEventTypes(),
    staleTime: 30_000,
  });
}

export function useCreateEventType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateEventTypeRequest) =>
      bookingApi.createEventType(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: EVENT_TYPES_KEY }),
  });
}

export function useUpdateEventType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: string; body: UpdateEventTypeRequest }) =>
      bookingApi.updateEventType(args.id, args.body),
    // Optimistic update: liste anında güncellenir, hata olursa geri alınır.
    onMutate: async ({ id, body }) => {
      await qc.cancelQueries({ queryKey: EVENT_TYPES_KEY });
      const prev = qc.getQueryData<EventType[]>(EVENT_TYPES_KEY);
      if (prev) {
        qc.setQueryData<EventType[]>(
          EVENT_TYPES_KEY,
          prev.map((e) => (e.id === id ? { ...e, ...body } : e)),
        );
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(EVENT_TYPES_KEY, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: EVENT_TYPES_KEY }),
  });
}

export function useDeleteEventType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bookingApi.removeEventType(id),
    // Optimistic remove: satır anında kaybolur (undo toast ile geri alınabilir).
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: EVENT_TYPES_KEY });
      const prev = qc.getQueryData<EventType[]>(EVENT_TYPES_KEY);
      if (prev) {
        qc.setQueryData<EventType[]>(
          EVENT_TYPES_KEY,
          prev.filter((e) => e.id !== id),
        );
      }
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(EVENT_TYPES_KEY, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: EVENT_TYPES_KEY }),
  });
}

// ---- availability ---------------------------------------------------

export function useAvailability() {
  return useQuery({
    queryKey: AVAILABILITY_KEY,
    queryFn: () => bookingApi.getAvailability(),
    staleTime: 30_000,
  });
}

export function usePutAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rules: AvailabilityRule[]) => bookingApi.putAvailability(rules),
    onMutate: async (rules) => {
      await qc.cancelQueries({ queryKey: AVAILABILITY_KEY });
      const prev = qc.getQueryData<AvailabilityRule[]>(AVAILABILITY_KEY);
      qc.setQueryData<AvailabilityRule[]>(AVAILABILITY_KEY, rules);
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(AVAILABILITY_KEY, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: AVAILABILITY_KEY }),
  });
}

// ---- bookings -------------------------------------------------------

export function useBookings(params?: ListBookingsParams) {
  return useQuery({
    queryKey: [...BOOKINGS_KEY, params ?? null],
    queryFn: () => bookingApi.listBookings(params),
    staleTime: 30_000,
  });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateBookingRequest) => bookingApi.createBooking(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: BOOKINGS_KEY }),
  });
}

// ---- public ---------------------------------------------------------

export function usePublicEventTypes(slug: string | undefined) {
  return useQuery({
    queryKey: ["booking", "public", "event-types", slug],
    queryFn: () => bookingApi.getPublicEventTypes(slug as string),
    enabled: !!slug,
    staleTime: 30_000,
    retry: false,
  });
}

export function useCreatePublicBooking() {
  return useMutation({
    mutationFn: (args: {
      tenantSlug: string;
      body: CreatePublicBookingRequest;
    }) => bookingApi.createPublicBooking(args.tenantSlug, args.body),
  });
}
