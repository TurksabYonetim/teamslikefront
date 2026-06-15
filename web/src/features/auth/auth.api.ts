import { api } from "@/lib/api";
import type {
  AuthUser,
  LoginRequest,
  SignupRequest,
  SignupResponse,
  TokenPair,
} from "./auth.types";

export const authApi = {
  login: (body: LoginRequest) =>
    api.post<TokenPair>("/v1/auth/login", body).then((r) => r.data),

  signup: (body: SignupRequest) =>
    api.post<SignupResponse>("/v1/auth/signup", body).then((r) => r.data),

  me: () => api.get<AuthUser>("/v1/auth/me").then((r) => r.data),
};
