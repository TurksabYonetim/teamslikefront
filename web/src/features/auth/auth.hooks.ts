import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "./auth.api";
import { tokenStore } from "@/lib/token";
import { config } from "@/config";
import type { AuthUser, LoginRequest, SignupRequest } from "./auth.types";

const ME_KEY = ["auth", "me"] as const;

/** Backend olmadan UI'ı gezmek için sahte kullanıcı. */
const DEMO_USER: AuthUser = {
  id: "u-demo",
  email: "demo@acme.com",
  full_name: "Demo Kullanıcı",
  role: "admin",
  tenant_id: "t-demo",
};

/** Oturum açan staff kullanıcısını getirir (token varsa). */
export function useMe() {
  return useQuery({
    queryKey: ME_KEY,
    queryFn: () =>
      tokenStore.get() === config.demoToken
        ? Promise.resolve(DEMO_USER)
        : authApi.me(),
    enabled: !!tokenStore.get(),
    staleTime: 5 * 60_000,
  });
}

/** Staff login mutation'ı. Başarıda token saklanır ve /me yenilenir. */
export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: LoginRequest) => authApi.login(body),
    onSuccess: (tokens) => {
      tokenStore.set(tokens.access_token, tokens.refresh_token);
      qc.invalidateQueries({ queryKey: ME_KEY });
    },
  });
}

/** Tenant signup mutation'ı. Başarıda admin token saklanır. */
export function useSignup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: SignupRequest) => authApi.signup(body),
    onSuccess: (res) => {
      const tokens = res.tokens;
      if (tokens?.access_token) {
        tokenStore.set(tokens.access_token, tokens.refresh_token);
        qc.invalidateQueries({ queryKey: ME_KEY });
      }
    },
  });
}

/** Oturumu kapatır ve query cache'ini temizler. */
export function useLogout() {
  const qc = useQueryClient();
  return () => {
    tokenStore.clear();
    qc.clear();
    window.location.href = "/login";
  };
}
