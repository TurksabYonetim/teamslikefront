import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usersApi, type ApiUser, type CreateUserRequest } from "./users.api";
import { applyOverlay, useUsersOverlay } from "./users.overlay";

const USERS_KEY = ["users", "list"] as const;
const userKey = (id: string) => ["users", "detail", id] as const;

/**
 * Kullanıcı listesi. GET /v1/users/ verisini, yerel overlay (düzenle/sil/
 * pasifleştir) katmanıyla birleştirip döner.
 */
export function useUsers() {
  const { overlay } = useUsersOverlay();
  const query = useQuery({
    queryKey: USERS_KEY,
    queryFn: usersApi.list,
  });

  const users = useMemo<ApiUser[]>(
    () => (query.data ? applyOverlay(query.data, overlay) : []),
    [query.data, overlay],
  );

  return { ...query, users };
}

/** Tek kullanıcı detayı (GET /v1/users/{id}); modal açıkken çalışır. */
export function useUser(id: string | null) {
  return useQuery({
    queryKey: userKey(id ?? ""),
    queryFn: () => usersApi.get(id as string),
    enabled: !!id,
  });
}

/** Yeni kullanıcı oluşturur (POST /v1/users/) ve listeyi tazeler. */
export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateUserRequest) => usersApi.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USERS_KEY });
    },
  });
}
