/**
 * Tarayıcı tarafında HS256 JWT imzalama (Web Crypto / SubtleCrypto).
 *
 * Müşteri portalı için tenant `signing_secret`'ı ile kısa ömürlü "buyer" JWT
 * üretmekte kullanılır. Backend sözleşmesi (signing-secret note):
 *   Claims: iss=<tenant_slug>, sub=<your_user_id>, email, name, exp
 *
 * GÜVENLİK NOTU: signing_secret tarayıcıya konursa son kullanıcı görebilir.
 * Bu yalnızca DEMO/geliştirme içindir; PROD'da buyer JWT imzalama mutlaka
 * sunucu tarafında yapılmalı ve secret istemciye hiç gönderilmemelidir.
 */

function base64url(input: ArrayBuffer | Uint8Array | string): string {
  let bytes: Uint8Array;
  if (typeof input === "string") {
    bytes = new TextEncoder().encode(input);
  } else if (input instanceof Uint8Array) {
    bytes = input;
  } else {
    bytes = new Uint8Array(input);
  }
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export interface JwtClaims {
  [key: string]: unknown;
  iss?: string;
  sub?: string;
  email?: string;
  name?: string;
  iat?: number;
  nbf?: number;
  exp?: number;
}

/** Verilen payload'ı HS256 ile imzalar ve compact JWT döner. */
export async function signJwtHS256(payload: JwtClaims, secret: string): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));
  const data = `${encodedHeader}.${encodedPayload}`;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sigBuf = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return `${data}.${base64url(sigBuf)}`;
}

export interface BuyerTokenInput {
  signingSecret: string;
  tenantSlug: string;
  /** Buyer'ın sizin sisteminizdeki benzersiz kimliği (external sub). */
  sub: string;
  email?: string;
  name?: string;
  /** Token ömrü (saniye). Varsayılan 1 saat. */
  ttlSec?: number;
}

/**
 * tl-api portalı için buyer JWT üretir.
 * `/v1/portal/me/*` uçları bu token'ı `Authorization: Bearer` ile bekler.
 */
export async function mintBuyerToken({
  signingSecret,
  tenantSlug,
  sub,
  email,
  name,
  ttlSec = 3600,
}: BuyerTokenInput): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const claims: JwtClaims = {
    iss: tenantSlug,
    sub,
    iat: now,
    nbf: now,
    exp: now + ttlSec,
  };
  if (email) claims.email = email;
  if (name) claims.name = name;
  return signJwtHS256(claims, signingSecret);
}
