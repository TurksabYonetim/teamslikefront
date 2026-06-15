# TeamsLike Web (React + Vite)

TeamsLike API'sinin frontend'i. **React + TypeScript + Vite + React Router + TanStack Query + Tailwind CSS v4**.

## Çalıştırma

```bash
cd web
npm install
cp .env.example .env   # gerekirse VITE_API_BASE_URL düzenle
npm run dev            # http://localhost:5173
```

Diğer komutlar: `npm run build`, `npm run preview`, `npm run typecheck`.

## Mimari — feature-based

```
src/
├── main.tsx, App.tsx          # giriş + provider/router montajı
├── config.ts                  # env yapılandırması
├── styles/index.css           # Tailwind v4 + tasarım token'ları (@theme)
├── lib/
│   ├── api.ts                 # merkezi axios (Bearer token + 401 yönetimi)
│   ├── token.ts               # localStorage token store
│   └── queryClient.ts         # TanStack Query client
├── providers/AppProviders.tsx # QueryClientProvider + devtools
├── routes/
│   ├── router.tsx             # tüm rotalar (createBrowserRouter)
│   └── ProtectedRoute.tsx     # token yoksa /login
├── components/
│   ├── Icon.tsx, PlaceholderPage.tsx
│   ├── layout/ (AppShell, NavRail, Topbar, nav.ts)
│   └── ui/ (Avatar, Spinner)
└── features/
    ├── auth/    # auth.api/types/hooks + LoginPage  ✅ çalışır dilim
    └── dashboard/  # DashboardPage
```

## Yeni feature ekleme akışı

1. `src/features/<feature>/` klasörü aç: `<feature>.api.ts`, `<feature>.types.ts`, `<feature>.hooks.ts`, `<Feature>Page.tsx`.
2. API çağrılarını `lib/api.ts`'teki `api` instance'ı ile yaz; veriyi TanStack Query hook'larıyla sar.
3. `routes/router.tsx`'te ilgili `PlaceholderPage`'i gerçek sayfayla değiştir.
4. Gerekirse `components/layout/nav.ts`'e nav öğesi ekle.

## Durum

- ✅ Proje iskeleti, tasarım sistemi, API client, auth (login + /me), dashboard
- ⏳ Diğer modüller (kanallar, inbox, meetings, telefon, copilot, randevu...) placeholder — backend kodu geldikçe doldurulacak
