import axios, { type AxiosAdapter, type InternalAxiosRequestConfig } from "axios";
import { config } from "@/config";
import { tokenStore } from "@/lib/token";

/**
 * OFFLINE DEMO ADAPTER
 * --------------------
 * Demo oturumunda (token === config.demoToken) backend yoktur — ör. GitHub
 * Pages'te yalnızca statik SPA yayınlanır ve API çağrıları CORS'a takılıp
 * "Network Error" verir. Bu adapter demo modunda axios isteklerini ağa hiç
 * çıkarmadan karşılar: bilinen endpoint'ler için örnek veri, bilinmeyenler için
 * güvenli boş varsayılan (liste → [], mutasyon → gönderilen gövdenin yankısı)
 * döner. Gerçek oturumda (normal token) hiçbir şey değişmez; varsayılan axios
 * adapter'ına devredilir.
 *
 * Yeni bir sayfa demo'da "Network Error" veriyorsa ilgili endpoint'i aşağıdaki
 * GET_FIXTURES'a ekle.
 */

const now = () => new Date();
const isoInMin = (min: number) => new Date(now().getTime() + min * 60_000).toISOString();
const uid = () =>
  globalThis.crypto?.randomUUID?.() ?? `demo_${Math.random().toString(36).slice(2)}`;

/** GET endpoint → örnek yanıt. Anahtar, sorgu dizesi olmadan path'tir. */
const GET_FIXTURES: Record<string, unknown> = {
  "/v1/meetings/": [
    {
      id: "mtg_standup",
      title: "Günlük Standup",
      room_name: "tl-standup",
      join_url: "https://meet.jit.si/tl-standup",
      moderator_token: null,
      scheduled_at: isoInMin(0),
      duration_minutes: 30,
      status: "live",
    },
    {
      id: "mtg_launch",
      title: "Q3 Lansman Değerlendirme",
      room_name: "tl-launch",
      join_url: "https://meet.jit.si/tl-launch",
      moderator_token: null,
      scheduled_at: isoInMin(45),
      duration_minutes: 60,
      status: "scheduled",
    },
    {
      id: "mtg_design",
      title: "Tasarım Kritiği",
      room_name: "tl-design",
      join_url: "https://meet.jit.si/tl-design",
      moderator_token: null,
      scheduled_at: isoInMin(180),
      duration_minutes: 45,
      status: "scheduled",
    },
  ],
  "/v1/users/": [
    {
      id: "u-demo",
      tenant_id: "t-demo",
      email: "demo@acme.com",
      full_name: "Demo Kullanıcı",
      role: "owner",
      is_active: true,
      created_at: isoInMin(-60 * 24 * 30),
    },
    {
      id: "u-defne",
      tenant_id: "t-demo",
      email: "defne@acme.com",
      full_name: "Defne Yıldız",
      role: "admin",
      is_active: true,
      created_at: isoInMin(-60 * 24 * 20),
    },
    {
      id: "u-marco",
      tenant_id: "t-demo",
      email: "marco@acme.com",
      full_name: "Marco Rossi",
      role: "member",
      is_active: true,
      created_at: isoInMin(-60 * 24 * 10),
    },
  ],
  "/v1/tenants/me": {
    id: "t-demo",
    name: "Acme (Demo)",
    slug: "teamslike-demo",
    plan: "pro",
  },
  "/v1/tenants/me/signing-secret": { signing_secret: "demo_signing_secret" },
  "/v1/admin/overview": {},
};

/**
 * İstek path'ini sorgu dizesinden arındırıp döndürür. baseURL adapter
 * aşamasında henüz birleştirilmediği için config.url genelde "/v1/..." gelir;
 * yine de baseURL ile gelmiş olma ihtimaline karşı onu da soyar.
 */
function pathOf(cfg: InternalAxiosRequestConfig): string {
  let url = cfg.url ?? "";
  if (cfg.baseURL && url.startsWith(cfg.baseURL)) url = url.slice(cfg.baseURL.length);
  return url.split("?")[0];
}

/** Demo modunda bu istek için yanıt gövdesi üretir. */
function demoBody(cfg: InternalAxiosRequestConfig): unknown {
  const method = (cfg.method ?? "get").toLowerCase();
  const path = pathOf(cfg);

  if (method === "get") {
    if (path in GET_FIXTURES) return GET_FIXTURES[path];
    // Bilinmeyen GET: koleksiyon uçları liste bekler → güvenli boş dizi.
    return [];
  }

  // Mutasyonlar (POST/PUT/PATCH/DELETE): gönderilen gövdeyi sahte id ile yankıla.
  let body: Record<string, unknown> = {};
  try {
    body = typeof cfg.data === "string" ? JSON.parse(cfg.data) : (cfg.data ?? {});
  } catch {
    body = {};
  }
  return { id: uid(), created_at: now().toISOString(), ...body };
}

/**
 * api instance'ına demo adapter'ı kurar. Demo token yoksa gerçek adapter'a
 * devreder; böylece prod/gerçek backend davranışı hiç etkilenmez.
 */
export function installDemoAdapter(instance: { defaults: { adapter?: unknown } }) {
  const real = axios.getAdapter(axios.defaults.adapter) as AxiosAdapter;
  instance.defaults.adapter = (cfg: InternalAxiosRequestConfig) => {
    if (tokenStore.get() !== config.demoToken) return real(cfg);
    return Promise.resolve({
      data: demoBody(cfg),
      status: 200,
      statusText: "OK (demo)",
      headers: {},
      config: cfg,
    });
  };
}
