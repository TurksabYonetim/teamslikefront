import { mockId, nowIso } from "@/lib/mockStore";
import type {
  CopilotConversation,
  CopilotMessage,
  CreateConversationRequest,
  PostMessageRequest,
  PostMessageResponse,
} from "./copilot.types";

/**
 * Frontend-only copilot: oturumlar ve mesajlar localStorage'da tutulur
 * (backend'de /v1/copilot uçları staging'de yok). Gerçek bir LLM bağlı
 * olmadığından asistan yanıtı yerel olarak üretilen bir "echo simülasyonu"dur.
 *
 * `copilotApi` imzası gerçek API ile birebir aynıdır → React Query hook'ları ve
 * component'ler hiç değişmeden çalışır. Gerçek backend hazır olunca bu dosya
 * yeniden axios çağrılarına döndürülebilir.
 */

const CONV_KEY = "tl_mock_copilot_conversations";
const MSG_KEY = "tl_mock_copilot_messages";

/** Sahte ağ gecikmesi (ms) — skeleton ve "yazıyor…" akışı doğal görünsün. */
const LATENCY_MS = 140;
/** Echo asistan yanıtının ekstra gecikmesi — düşünüyormuş hissi versin. */
const REPLY_MS = 600;

function delay<T>(value: T, ms = LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* kota / private mode → sessiz geç */
  }
}

/** İlk açılışta tek bir hoş geldin oturumu + asistan girişi seed'lenir. */
function ensureSeed(): { convs: CopilotConversation[]; msgs: CopilotMessage[] } {
  let convs = read<CopilotConversation[]>(CONV_KEY, []);
  let msgs = read<CopilotMessage[]>(MSG_KEY, []);
  if (convs.length === 0 && localStorage.getItem(CONV_KEY) == null) {
    const ts = nowIso();
    const conv: CopilotConversation = {
      id: mockId(),
      title: "Hoş geldiniz",
      created_at: ts,
      updated_at: ts,
    };
    const intro: CopilotMessage = {
      id: mockId(),
      conversation_id: conv.id,
      role: "assistant",
      content:
        "Merhaba! Ben **Copilot** (simülasyon modu). Aşağıdan bir mesaj " +
        "yazıp gönderin — gerçek bir model bağlı olmadığından şimdilik " +
        "örnek bir yanıt üreteceğim. Arayüzü serbestçe deneyebilirsiniz.",
      created_at: ts,
    };
    convs = [conv];
    msgs = [intro];
    write(CONV_KEY, convs);
    write(MSG_KEY, msgs);
  }
  return { convs, msgs };
}

/** Kullanıcı mesajına karşılık üretilen yer tutucu (echo) asistan yanıtı. */
function simulatedReply(userText: string): string {
  const trimmed = userText.trim();
  const quoted = trimmed.length > 160 ? `${trimmed.slice(0, 157)}…` : trimmed;
  return (
    `*(Simülasyon yanıtı — gerçek model henüz bağlı değil.)*\n\n` +
    `İsteminizi aldım:\n\n> ${quoted}\n\n` +
    `Gerçek bir LLM bağlandığında yanıt burada görünecek. Şimdilik gönderme, ` +
    `kaydırma ve geçmiş akışını test edebilirsiniz.`
  );
}

/** Oturum başlığını ilk kullanıcı mesajından türet (backend davranışını taklit). */
function deriveTitle(text: string): string {
  const t = text.trim().replace(/\s+/g, " ");
  return t.length > 40 ? `${t.slice(0, 40)}…` : t || "Yeni sohbet";
}

export const copilotApi = {
  listConversations: (): Promise<CopilotConversation[]> => {
    const { convs } = ensureSeed();
    const sorted = [...convs].sort((a, b) =>
      b.updated_at.localeCompare(a.updated_at),
    );
    return delay(sorted);
  },

  createConversation: (
    body: CreateConversationRequest = {},
  ): Promise<CopilotConversation> => {
    const { convs } = ensureSeed();
    const ts = nowIso();
    const conv: CopilotConversation = {
      id: mockId(),
      title: body.title ?? "",
      created_at: ts,
      updated_at: ts,
    };
    write(CONV_KEY, [...convs, conv]);
    return delay(conv);
  },

  deleteConversation: (id: string): Promise<void> => {
    const convs = read<CopilotConversation[]>(CONV_KEY, []);
    const msgs = read<CopilotMessage[]>(MSG_KEY, []);
    write(
      CONV_KEY,
      convs.filter((c) => c.id !== id),
    );
    write(
      MSG_KEY,
      msgs.filter((m) => m.conversation_id !== id),
    );
    return delay(undefined);
  },

  listMessages: (conversationId: string): Promise<CopilotMessage[]> => {
    const { msgs } = ensureSeed();
    const rows = msgs
      .filter((m) => m.conversation_id === conversationId)
      .sort((a, b) => a.created_at.localeCompare(b.created_at));
    return delay(rows);
  },

  postMessage: (
    conversationId: string,
    body: PostMessageRequest,
  ): Promise<PostMessageResponse> => {
    const convs = read<CopilotConversation[]>(CONV_KEY, []);
    const msgs = read<CopilotMessage[]>(MSG_KEY, []);

    const userTs = nowIso();
    const user_message: CopilotMessage = {
      id: mockId(),
      conversation_id: conversationId,
      role: "user",
      content: body.content,
      created_at: userTs,
    };
    const assistant_message: CopilotMessage = {
      id: mockId(),
      conversation_id: conversationId,
      role: "assistant",
      content: simulatedReply(body.content),
      // Asistan yanıtı kullanıcıdan sonra sıralansın.
      created_at: new Date(Date.parse(userTs) + 1).toISOString(),
    };

    write(MSG_KEY, [...msgs, user_message, assistant_message]);

    // Oturumu güncelle: updated_at tazele, başlık boşsa ilk mesajdan türet.
    const hadMessages = msgs.some((m) => m.conversation_id === conversationId);
    write(
      CONV_KEY,
      convs.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              updated_at: assistant_message.created_at,
              title:
                c.title || (!hadMessages ? deriveTitle(body.content) : c.title),
            }
          : c,
      ),
    );

    return delay({ user_message, assistant_message }, REPLY_MS);
  },
};
