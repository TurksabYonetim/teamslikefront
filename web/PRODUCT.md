# Product

## Register

product

## Users
İşletme/kurum çalışanları ve ekipleri. Bağlam: gün boyu açık kalan bir çalışma alanı —
mesajlaşma, toplantı, telefon, görevler, doküman/canvas, randevu, destek ve yönetim
panelleri arasında sık geçiş yapan, bir işi tamamlamaya odaklı kullanıcılar. Çoğunlukla
masaüstü, ama mobilde de erişiliyor.

## Product Purpose
Microsoft Teams benzeri, tek çatı altında toplanmış bir kurumsal işbirliği uygulaması
(TeamsLike). Mesajlaşma, görüntülü toplantı, bulut telefon, kanban/görevler, doküman &
canvas, randevu, copilot/yapay zekâ ve yönetim/governance modüllerini içerir. Başarı =
kullanıcı aracın kendisini fark etmeden işini bitirir; arayüz göreve karışmaz.

## Brand Personality
Üç kelime: **güvenilir · kurumsal · sakin.** Ses gürültüsüz, net, profesyonel —
bağırmayan bir uzman. Microsoft Teams'in kurumsal ciddiyeti + Linear/Stripe sınıfı
"kazanılmış aşinalık" (sürpriz değil, tutarlılık). Türkçe arayüz; dil resmi ama soğuk
değil, doğrudan ve anlaşılır. Duygusal hedef: güven, sükûnet, kontrol hissi. Mavi
birincil + gri nötr; renk az ve amaçlı.

## Anti-references
- **Genel SaaS klişeleri (AI-slop tells):** gradyan metin, dekoratif glassmorphism,
  hero-metrik şablonu, her bölümde küçük uppercase tracked eyebrow, 01/02/03 numaralı
  bölüm işaretleyicileri, yan-şerit (side-stripe) border'lar, aynı boyut ikon+başlık
  kart ızgaraları, mor-gradient "AI" estetiği.
- **Eski/ağır kurumsal:** 2010'lar ERP hissi — sıkışık tablolar, gri-üstüne-gri
  yüzeyler, görsel hiyerarşisi olmayan yoğun ekranlar, okunması yorucu küçük gri gövde
  metni. Yoğunluk evet, ama nefes alan ve hiyerarşik (bkz. Design Principles 2).
- **Bağıran tipografi:** dev clamp başlıklar, ekranı dolduran fontlar. "Çok büyük" = yanlış.
- **Tutarsız bileşen sözlüğü:** aynı rolün iki yerde farklı görünmesi.
- Tüketici/oyunsu UI (aşırı renk, emoji ağırlığı, abartılı animasyon) kurumsal güveni
  zayıflattığı için kapsam dışı.

## Design Principles
1. **Araç göze görünmez.** Tipografi ve boşluk hiyerarşiyi taşır; dekorasyon değil.
2. **Tutarlılık > sürpriz.** Aynı rol her ekranda aynı görünür (başlık, gövde, input, border).
3. **Sabit ölçek, kibar boyut.** Product register: sabit rem tip ölçeği; başlıklar kapaklı,
   gövde okunaklı. Responsive = yapısal (sidebar/kolon), akışkan tipografi değil.
4. **Az ve amaçlı renk.** Mavi yalnızca aksiyon/aktif/seçili; gri ölçek geri kalan her şey.
5. **Her bileşenin tüm durumları var.** default/hover/focus/active/disabled/loading/error.

## Accessibility & Inclusion
**Hedef: WCAG 2.2 AAA.** Kamu/kurumsal bağlam standardı.
- **Kontrast:** gövde/küçük metin ≥ 7:1, büyük metin (≥24px veya ≥18.66px bold) ≥ 4.5:1.
  Gri metin token'ları (`muted`, link/ghost) bu eşiğe göre kalibre edildi; yeni gri metin
  AAA doğrulanmadan eklenmez (bkz. DESIGN.md §2 kontrast tablosu).
- Dokunmatik/işaretçi hedefleri ≥ 44×44px; tıklama alanları AAA minimumuna uyar.
- Klavye ile tam gezinme + her etkileşimli öğede görünür, tutarlı focus halkası.
- `prefers-reduced-motion` her animasyon için zorunlu alternatif (crossfade/anlık).
- Renk asla tek bilgi taşıyıcısı değil (durum = renk + ikon/metin); renk körlüğü gözetilir.
- Anlamsal HTML + ARIA; ekran okuyucu akışı. Tek tip AÇIK tema.
