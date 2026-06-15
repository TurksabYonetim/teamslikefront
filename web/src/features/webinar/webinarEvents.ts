// web/src/features/webinar/webinarEvents.ts
import type { AgendaItem, TicketTier } from "./webinar.types";

export function ticketsRemaining(tier: TicketTier): number {
  return Math.max(0, tier.quantity - tier.sold);
}

export function isSoldOut(tier: TicketTier): boolean {
  return ticketsRemaining(tier) === 0;
}

export function ticketRevenue(tiers: TicketTier[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const tier of tiers) out[tier.currency] = (out[tier.currency] ?? 0) + tier.sold * tier.price;
  return out;
}

export function formatPrice(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

function toMin(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function agendaByDay(items: AgendaItem[]): { day: string; items: AgendaItem[] }[] {
  const order: string[] = [];
  const map = new Map<string, AgendaItem[]>();
  for (const it of items) {
    if (!map.has(it.day)) { map.set(it.day, []); order.push(it.day); }
    map.get(it.day)!.push(it);
  }
  return order.map((day) => ({
    day,
    items: map.get(day)!.slice().sort((a, b) => toMin(a.start) - toMin(b.start)),
  }));
}

export function agendaConflicts(items: AgendaItem[]): [AgendaItem, AgendaItem][] {
  const clashes: [AgendaItem, AgendaItem][] = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i], b = items[j];
      if (a.day !== b.day || a.track !== b.track) continue;
      if (toMin(a.start) < toMin(b.end) && toMin(b.start) < toMin(a.end)) clashes.push([a, b]);
    }
  }
  return clashes;
}
