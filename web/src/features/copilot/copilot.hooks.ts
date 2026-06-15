import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { copilotApi } from "./copilot.api";
import type {
  CopilotConversation,
  CopilotMessage,
  CreateConversationRequest,
  PostMessageResponse,
} from "./copilot.types";

const CONVERSATIONS_KEY = ["copilot", "conversations"] as const;

const messagesKey = (conversationId: string) =>
  ["copilot", "messages", conversationId] as const;

/** Tüm copilot oturumlarını (tenant + kullanıcı) getirir. */
export function useConversations() {
  return useQuery({
    queryKey: CONVERSATIONS_KEY,
    queryFn: () => copilotApi.listConversations(),
    staleTime: 30_000,
  });
}

/** Bir oturumun mesajlarını getirir. conversationId yoksa sorgu kapalıdır. */
export function useMessages(conversationId: string | null) {
  return useQuery({
    queryKey: messagesKey(conversationId ?? "__none__"),
    queryFn: () => copilotApi.listMessages(conversationId as string),
    enabled: !!conversationId,
    staleTime: 10_000,
  });
}

/** Yeni oturum oluşturur; başarıda listeyi tazeler. */
export function useCreateConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateConversationRequest = {}) =>
      copilotApi.createConversation(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
    },
  });
}

/**
 * Oturumu siler.
 * Optimistic: liste anında güncellenir; hata durumunda önceki liste geri yüklenir.
 * Geri dönen `prev` ile (undo) listeyi eski haline döndürmek mümkündür.
 */
export function useDeleteConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => copilotApi.deleteConversation(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: CONVERSATIONS_KEY });
      const prev = qc.getQueryData<CopilotConversation[]>(CONVERSATIONS_KEY);
      if (prev) {
        qc.setQueryData<CopilotConversation[]>(
          CONVERSATIONS_KEY,
          prev.filter((c) => c.id !== id),
        );
      }
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(CONVERSATIONS_KEY, ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
    },
  });
}

/**
 * Oturum başlığını client-side (optimistic) yeniden adlandırır.
 *
 * Backend'de title genelde ilk mesajdan türetilir ve ayrı bir PATCH ucu
 * YOKTUR. Bu nedenle yeniden adlandırma yalnızca react-query önbelleğinde
 * yapılır: liste tazelenene kadar (örn. yeni mesaj/sayfa yenileme) görünür
 * kalır. Bu, mock/echo aşamasında salt-frontend bir kolaylıktır.
 */
export function useRenameConversation() {
  const qc = useQueryClient();
  return {
    rename(id: string, title: string) {
      qc.setQueryData<CopilotConversation[]>(CONVERSATIONS_KEY, (cur) =>
        (cur ?? []).map((c) => (c.id === id ? { ...c, title } : c)),
      );
    },
  };
}

/**
 * Bir oturuma mesaj gönderir (kullanıcı mesajı + echo asistan yanıtı).
 * Optimistic: kullanıcı mesajı anında mesaj listesine eklenir; sunucu yanıtı
 * gelince hem kullanıcı hem asistan mesajları gerçek kayıtlarla değiştirilir.
 * Hata durumunda önceki mesaj listesi geri yüklenir.
 */
export function useSendMessage(conversationId: string | null) {
  const qc = useQueryClient();
  const key = messagesKey(conversationId ?? "__none__");
  return useMutation({
    mutationFn: (content: string) => {
      if (!conversationId) {
        return Promise.reject(new Error("No active conversation"));
      }
      return copilotApi.postMessage(conversationId, { content });
    },
    onMutate: async (content) => {
      if (!conversationId) return { prev: undefined };
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<CopilotMessage[]>(key);
      const optimistic: CopilotMessage = {
        id: `optimistic-${Date.now()}`,
        conversation_id: conversationId,
        role: "user",
        content,
        created_at: new Date().toISOString(),
      };
      qc.setQueryData<CopilotMessage[]>(key, [...(prev ?? []), optimistic]);
      return { prev };
    },
    onError: (_err, _content, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev);
    },
    onSuccess: (res: PostMessageResponse) => {
      // Replace the optimistic user message with the real pair.
      qc.setQueryData<CopilotMessage[]>(key, (cur) => {
        const base = (cur ?? []).filter(
          (m) => !m.id.startsWith("optimistic-"),
        );
        return [...base, res.user_message, res.assistant_message];
      });
      // İlk mesaj başlığı türetebileceği için oturum listesini tazele.
      qc.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: key });
    },
  });
}
