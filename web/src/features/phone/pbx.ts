import type {
  BusinessHours,
  CallQueue,
  Delegate,
  HuntGroup,
  HuntMember,
  IVRMenu,
  IVROption,
  MonitorMode,
  QueueAgent,
  QueuedCall,
} from "./phone.types";

/**
 * Pür PBX-domain yardımcıları (çağrı dağıtımı, mesai saatleri, IVR yönlendirme).
 * Framework'ten bağımsız → birim test edilebilir.
 */

/** Kuyruğa düşen çağrı için hangi ajanın çalınacağını seç. */
export function pickAgent(queue: CallQueue, lastIndex = -1): QueueAgent | null {
  const agents = queue.agents;
  if (agents.length === 0) return null;

  if (queue.strategy === "longest_idle") {
    const available = agents.filter((a) => a.available);
    if (available.length === 0) return null;
    return available.reduce((max, a) => (a.idleSec > max.idleSec ? a : max));
  }

  if (queue.strategy === "simultaneous" || queue.strategy === "sequential") {
    return agents.find((a) => a.available) ?? null;
  }

  if (queue.strategy === "weighted") {
    const available = agents.filter((a) => a.available);
    if (available.length === 0) return null;
    return available.reduce((best, a) => ((a.weight ?? 1) > (best.weight ?? 1) ? a : best));
  }

  // round_robin & rotating: cursor sonrası ilk uygun (wrap). Bu mock'ta rotating,
  // round_robin ile aynı davranır (gerçek rotasyon farkı backend sorumluluğu).
  for (let i = 1; i <= agents.length; i++) {
    const idx = (lastIndex + i) % agents.length;
    if (agents[idx].available) return agents[idx];
  }
  return null;
}

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * `date` programın içinde mi (haftalık pencere, tatil değil).
 * NOT: Karşılaştırma yerel saatle yapılır; `schedule.timezone` yalnızca bilgilendirme amaçlıdır.
 * Çağıran, tarihi programın saat dilimine göre vermelidir (frontend mock varsayımı).
 */
export function isWithinHours(schedule: BusinessHours, date: Date = new Date()): boolean {
  if (schedule.holidays.includes(isoDate(date))) return false;
  const window = schedule.weekly.find((w) => w.day === date.getDay());
  if (!window) return false;
  const minutes = date.getHours() * 60 + date.getMinutes();
  return minutes >= window.openMin && minutes < window.closeMin;
}

export interface IVRResolution {
  option?: IVROption;
  nextMenu?: IVRMenu;
}

/** Menü içinde bir DTMF tuşunu çöz; `menu` aksiyonu alt menüye iner. */
export function ivrResolve(menus: IVRMenu[], menuId: string, key: string): IVRResolution {
  const menu = menus.find((m) => m.id === menuId);
  const option = menu?.options.find((o) => o.key === key);
  if (!option) return {};
  if (option.action === "menu" && option.target) {
    return { option, nextMenu: menus.find((m) => m.id === option.target) };
  }
  return { option };
}

/** Yetkinlik-bazlı yönlendirme: `skill` taşıyan ajanlar arasından strateji ile seç.
 *  NOT: `lastIndex`, filtrelenmiş alt-liste üzerindeki indekstir (tam `agents` listesi değil). */
export function pickAgentBySkill(queue: CallQueue, skill: string, lastIndex = -1): QueueAgent | null {
  const skilled = queue.agents.filter((a) => a.skills?.includes(skill));
  if (skilled.length === 0) return null;
  return pickAgent({ ...queue, agents: skilled }, lastIndex);
}

export interface MonitorAudio {
  supervisorHearsParties: boolean;
  agentHearsSupervisor: boolean;
  customerHearsSupervisor: boolean;
  agentConnected: boolean;
}

/** Süpervizör izleme modu için audio yönlendirmesi (listen/whisper/barge/takeover). */
export function monitorAudio(mode: MonitorMode): MonitorAudio {
  switch (mode) {
    case "listen":
      return { supervisorHearsParties: true, agentHearsSupervisor: false, customerHearsSupervisor: false, agentConnected: true };
    case "whisper":
      return { supervisorHearsParties: true, agentHearsSupervisor: true, customerHearsSupervisor: false, agentConnected: true };
    case "barge":
      return { supervisorHearsParties: true, agentHearsSupervisor: true, customerHearsSupervisor: true, agentConnected: true };
    case "takeover":
      return { supervisorHearsParties: true, agentHearsSupervisor: false, customerHearsSupervisor: true, agentConnected: false };
  }
}

/** Paylaşılan hat delegesi sahibi adına bu eylemi yapabilir mi. */
export function canActOnBehalf(delegate: Delegate, action: "answer" | "place"): boolean {
  return action === "answer" ? delegate.canAnswer : delegate.canPlaceOnBehalf;
}

/** Grup çağrı pickup: kuyruktaki en eski bekleyen çağrı (en küçük `since`). */
export function oldestWaiting(queue: CallQueue): QueuedCall | null {
  if (queue.waiting.length === 0) return null;
  return queue.waiting.reduce((oldest, c) => (c.since < oldest.since ? c : oldest));
}

/** Sıradaki çağıran için tahmini bekleme (sn): (önündekiler × AHT) ÷ uygun ajan. */
export function estimatedWaitSec(queue: CallQueue, avgHandleSec = 180): number {
  const ahead = queue.waiting.filter((c) => !c.callbackRequested).length;
  const agents = queue.agents.filter((a) => a.available).length;
  if (agents === 0) return ahead * avgHandleSec;
  return Math.round((ahead * avgHandleSec) / agents);
}

/** Hunt-group hedef seçimi. `all` ringde herkesi çalar; UI için temsilî olarak ilk uygun
 *  üyeyi döndürür. `sequential` → cursor sonrası ilk uygun (wrap). */
export function nextHuntMember(group: HuntGroup, lastIndex = -1): HuntMember | null {
  const members = group.members;
  if (members.length === 0) return null;
  if (group.ring === "all") return members.find((m) => m.available) ?? null;
  for (let i = 1; i <= members.length; i++) {
    const idx = (lastIndex + i) % members.length;
    if (members[idx].available) return members[idx];
  }
  return null;
}
