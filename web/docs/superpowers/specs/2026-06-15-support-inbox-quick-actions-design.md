# Support Inbox — Gömülü aksiyonları yüzeye çıkar (Tasarım Spec)

**Tarih:** 2026-06-15
**Modül:** `web/src/features/support`
**Program:** UX "3 tık → 1 tık" — modül-sıralı (2/9: support)
**Yaklaşım:** B — sadece butonlar (klavye yok)

## Amaç

Support Inbox'ta en sık yapılan ve şu an gömülü/erişilemez olan aksiyonları tek tıkla
erişilebilir kılmak. Audit'te `assign`/`assignNext` store action'larının var olduğu ama
hiçbir UI tarafından açılmadığı (self-assign imkânsız) ve "çözümle"nin durum `<select>`
içinde 2 tık gerektirdiği tespit edildi. Support inbox'ta yıkıcı işlem yok; çözümle/
yeniden-aç geri alınabilir → onay gerekmez.

## Kapsam

- **Yalnız** `src/features/support/components/ConversationView.tsx` başlık aksiyon satırı +
  i18n locale dosyaları.
- Klavye kısayolu YOK (yaklaşım B). Başka bileşen/dosya değişmez.

### Kapsam dışı (YAGNI)
- Klavye gezinme / kısayollar (yaklaşım A — ileride ayrı ele alınabilir).
- Liste satırında inline aksiyonlar.
- Yeni store action'ı — mevcutlar (`assign`, `assignNext`, `setStatus`) kullanılır.

## Mevcut durum (audit referansı)

`ConversationView.tsx` başlığı şu an: `[Kişi adı] [Atanan rozeti] —— [durum <select>]`.
`conversationStore` action'ları (hepsi mevcut): `assign(convId, agentId)`,
`assignNext(convId)` (round-robin), `setStatus(convId, status)`. `ME_ID` bu dosyada zaten
`../support.data`'tan import edili.

## Tasarım

### Başlık aksiyon grubu (sağa hizalı)
Yeni hâl: `[Kişi adı] [Atanan rozeti] —— [Bana ata] [Sıradakine] [Çözümle/Yeniden aç] [durum <select>]`

Durum `<select>` **kalır** (snooze/pending dahil tam kontrol).

### 1. Çözümle / Yeniden aç toggle (P2)
- `conv.status !== "resolved"` ise **"Çözümle"** butonu → `setStatus(conv.id, "resolved")`.
- `conv.status === "resolved"` ise **"Yeniden aç"** butonu → `setStatus(conv.id, "open")`.
- Birincil (primary) görsel ağırlık; tek tık.

### 2. Bana ata (P3)
- **"Bana ata"** butonu → `assign(conv.id, ME_ID)`.
- `conv.assigneeId === ME_ID` ise buton **pasif (disabled)** (zaten bende).
- Şu an UI'da hiç olmayan `assign` action'ını yüzeye çıkarır.

### 3. Sıradakine ata (P3)
- İkincil küçük buton/ikon **"Sıradakine ata"** → `assignNext(conv.id)` (round-robin dağıtım).
- Şu an erişilemez olan `assignNext`'i yüzeye çıkarır.

## i18n anahtarları (support namespace, tr + en simetrik)

`conversation.resolve` (Çözümle / Resolve),
`conversation.reopen` (Yeniden aç / Reopen),
`conversation.assignToMe` (Bana ata / Assign to me),
`conversation.assignNext` (Sıradakine ata / Assign to next).

## Hata / sınır durumları

- Aktif konuşma yokken `ConversationView` zaten erken `return` eder; butonlar yalnız
  `conv` varken render edilir.
- "Bana ata" zaten bana atalıyken disabled.
- Yıkıcı işlem yok → onay adımı yok.
- Mevcut animasyon/motion-reduce desenlerine dokunulmaz.

## Test stratejisi (vitest + @testing-library/react)

`ConversationView.test.tsx` (mevcut desen):
- "Çözümle" tıkla → aktif konuşmanın `status === "resolved"`; ardından "Yeniden aç"
  tıkla → `status === "open"`.
- "Bana ata" tıkla → `assigneeId === ME_ID`; buton sonrasında disabled olur.
- "Sıradakine ata" tıkla → `assigneeId` bir ajana atanır (dolu olur).
- i18n: yeni 4 anahtar tr + en'de simetrik.

## Kabul kriterleri

1. Çözümlenmemiş konuşmada tek tıkla "Çözümle" → resolved; resolved'da "Yeniden aç" → open.
2. "Bana ata" tek tıkla self-assign yapar; zaten bende ise pasif.
3. "Sıradakine ata" round-robin ile atar.
4. Durum `<select>` tam kontrol için korunur.
5. `npm run typecheck` ve `npm test` temiz geçer (yeni testler dahil).
