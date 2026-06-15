# teamslike-main/web — Sekme Özellik Envanteri

> Otomatik özellik denetimi — `web/src/features` altındaki **10 sekme**, **217 kaynak dosya**, **2963 özellik**.

> Üretim: 122 paralel analiz agent'ı (Workflow) · 2026-06-12


---

## İçindekiler

- [Messaging (Sohbet)](#messaging) — 534 özellik
- [Meetings (Toplantılar)](#meetings) — 354 özellik
- [Telephony (Telefon/UCaaS)](#telephony) — 406 özellik
- [Webinar](#webinar) — 274 özellik
- [Support (Destek)](#support) — 375 özellik
- [Scheduling (Planlama)](#scheduling) — 199 özellik
- [Docs & WorkHub](#docs) — 309 özellik
- [Intelligence (Toplantı Zekâsı)](#intelligence) — 277 özellik
- [AI Canvas](#canvas) — 68 özellik
- [Admin (Yönetim Konsolu)](#admin) — 167 özellik

---

<a id="messaging"></a>

## Messaging sekmesi

Messaging sekmesi; Slack, Microsoft Teams, WhatsApp, Telegram, Chatwoot, Zoom ve Google Meet deneyimlerini tek bir yerli (native) yüzeyde birleştiren omnichannel bir sohbet modülüdür. Kanallar, özel/paylaşımlı kanallar, yayın (broadcast) kanalları, birebir/grup DM'ler ve müşteri/destek konuşmalarını; thread'ler, anketler, sesli mesajlar, hikayeler, topluluklar ve AI yardımcı (Copilot) yetenekleriyle birlikte sunar. Tüm domain mantığı framework'siz saf fonksiyonlar olarak test edilebilir biçimde yazılmış, veri modeli Faz 2 FastAPI backend entegrasyonuna hazır tutulmuştur.

### Sayfa kabuğu & düzen

- **İzin tabanlı erişim kontrolü** — `messaging.view` yetkisi olmayan kullanıcıya Forbidden bileşeni gösterilir; sayfaya erişim yetkiyle korunur.
- **URL deep-link ile kanal/konu seçimi** — Aktif kanal (`?c=`) ve konu (`?t=`) URL'e yansıtılır; seçim paylaşılabilir, yenilemede korunur ve bildirimler bu seçimi hedefleyebilir.
- **Çalışma alanı değişiminde otomatik kanal seçimi** — Workspace değişince o alana ait görünür bir kanal (tercihen DM olmayan ilk kanal) otomatik seçilir; bayat seçim yerine içerik görünür şekilde değişir.
- **Çoklu çalışma alanı (multi-tenant) entegrasyonu** — `useTenantStore`'dan `workspaceId` okunur; kanallar workspaceId'ye göre filtrelenir (null = tüm alanlar), DM'ler workspace'ten bağımsız küresel kalır.
- **Duyarlı (responsive) düzen** — `useIsMobile`/`useMediaQuery` ile mobil tespiti yapılır; masaüstünde çok panel, mobilde tek panel kullanılır.
- **Mobil tek-panel görünüm** — Mobilde kanal listesi VEYA açık konuşma gösterilir; kanal/konu seçimi konuşmayı açar.
- **Mobil geri butonu** — Konuşma panelinin üstündeki geri (CaretLeft) butonu kanal listesine döndürür (`common.back`).
- **i18n çoklu dil desteği** — Tüm metinler `react-i18next` ile `messaging.*`, `intel.*`, `common.*`, `nav.*` anahtarları üzerinden lokalize edilir; parametreli ve `returnObjects` (dizi) çeviriler dahil.

### Ana yapısal bileşenler

- **Topluluklar çubuğu (CommunitiesBar)** — Sol kenarda dar (w-14) dikey navigasyon çubuğu toplulukları (grup-üstü-grup) listeler; her topluluk adının ilk iki harfiyle yuvarlatılmış kare avatar rozeti ve tooltip ile gösterilir.
- **Tüm Topluluklar butonu** — Çubuğun üstünde SquaresFour ikonlu buton; aktif topluluğu null yaparak tüm topluluk görünümüne döner.
- **Topluluk seçimi ve ilk kanala atlama** — Bir topluluğa tıklanınca topluluk aktif edilir ve `communityChannels` ile bulunan ilk kanalına otomatik geçilir.
- **Aktif topluluk vurgusu** — Seçili topluluk/buton accent renkle ve `aria-current` ile işaretlenir; diğerleri hover ile yanıt verir.
- **Mesajlaşma kenar çubuğu (MessagingSidebar)** — 240px (w-64) genişliğinde, kanal/DM/konu listesini barındıran ana navigasyon bölgesi.
- **Hikayeler çubuğu (StoriesBar)** — Konuşma alanının üstünde WhatsApp Status / Telegram Stories tarzı geçici durum halkası şeridi.
- **Kanal başlığı (ChannelHeader)** — Aktif kanalın ad, tür ikonu, rozet, arama ve aksiyonlarını barındıran üst başlık çubuğu.
- **Sabitlenmiş öğeler çubuğu (PinnedBar)** — Aktif konudaki sabitlenmiş mesajları gösteren çubuk.
- **Mesaj listesi (MessageList)** — Aktif konuşmanın mesaj akışını render eden ana liste.
- **Yazıyor göstergesi (TypingIndicator)** — Mesaj listesi ile composer arasında karşı tarafın yazdığını gösterir.
- **Mesaj oluşturucu (MessageComposer)** — Konuşma panelinin altındaki mesaj yazma/gönderme alanı.
- **Thread (konu zinciri) paneli** — `threadRootId` aktifken açılan sağ panel; bir mesajın yanıt zincirini ayrı gösterir.
- **Detaylar paneli (DetailsPanel)** — `detailsOpen` aktifken açılan kanal/kişi detay paneli.

### Kenar çubuğu (Sidebar) yetenekleri

- **Klasör/filtre sekmeleri** — `all`, `unread`, `dms`, `channels` klasörleri tablist olarak sunulur; seçili klasör sohbetleri filtreler.
- **Çalışma alanı kapsamı** — Kanallar aktif workspace'e kapsamlandırılır (`inWorkspace`); DM'ler küresel gösterilir.
- **Sabitlenmiş sohbetler bölümü** — `pinned=true` sohbetler raptiye ikonlu ayrı başlık altında en üstte listelenir.
- **Kanallar ve DM'ler bölümleri** — DM olmayan sabitlenmemiş kanallar "Kanallar", `kind === 'dm'` sabitlenmemiş sohbetler "DM'ler" başlığı altında gruplanır.
- **Sohbet satırı (ChatRow) seçimi** — Satıra tıklamak `setChannel` ile aktif kanalı değiştirir; aktif satır vurgulanır.
- **Kanal türü ikonları (Glyph)** — private→Lock, broadcast→Megaphone, normal→Hash.
- **DM avatarı ve presence göstergesi** — DM satırlarında üye avatarı ve sağ-altta `PresenceDot` ile çevrimiçi durumu.
- **Müşteri konuşma durumu noktası** — `isCustomer` sohbetlerde durum rengiyle nokta: open=warning, pending=accent, resolved=positive.
- **E2EE / sessize alınmış / arşiv / etiket rozetleri** — Uçtan uca şifreli kanallarda yeşil LockKey, sessizde BellSlash, arşivde "Arşivlendi" rozeti ve özel etiket rozeti (opaklık azaltma ile).
- **Broadcast abone sayısı** — Broadcast kanallarda `subscribers` binlik formatla (örn. 12.5k) gösterilir.
- **Okunmamış sayaç rozeti** — `unread` değeri olan sohbetlerde accent tonlu sayaç rozeti.
- **Sohbet aksiyon menüsü (kebab)** — Hover/focus ile beliren DotsThree (Radix DropdownMenu) menüsü; sabitleme, sessize alma, okunmadı işaretleme, arşivleme.
- **Sohbet sabitle / sessize al / okunmadı işaretle / arşivle** — `togglePinChat`, `toggleMuteChat`, `toggleMarkUnread`, `archiveChannel` ile sohbet seviyesinde durum değişiklikleri; menü metni duruma göre değişir.
- **Konu (topic) alt listesi açma** — Birden fazla konusu olan aktif kanalda CaretDown/CaretRight ile konu listesi açılır; `setTopic` ile konu seçilir (aktif konu `aria-current`).
- **Yeni oluşturma menüsü (Plus)** — Yeni kanal (Hash) veya yeni DM (ChatCircle) seçenekleri.
- **Kanal yokken başlangıç boş durumu** — Kanal yoksa yeni kanal oluşturma butonlu getting-started EmptyState gösterilir.

### Kanal başlığı (ChannelHeader) yetenekleri

- **Kanal tür ikonu (KindGlyph)** — private=kilit, shared=üç kişi, broadcast=megafon, dm=sohbet balonu, channel=hashtag.
- **Kanal başlık ve alt başlık** — channel/private için `#ad`, diğerleri için sade ad; alt başlık broadcast'te abone sayısı, kanalda konu başlığı, DM'de "direkt mesaj".
- **E2EE şifreleme rozeti** — Uçtan uca şifreli kanalda pozitif tonlu kilitli rozet.
- **Kaybolan mesaj zamanlayıcı rozeti** — `disappearing` 'off' dışındaysa uyarı tonlu Timer rozeti ve süre etiketi.
- **Paylaşımlı kanal / dış organizasyon rozeti** — shared kanallarda bağlı dış organizasyonları (externalOrgs) virgülle listeler, yoksa "paylaşımlı kanal" etiketi.
- **Müşteri konuşma durum değiştirici** — `isCustomer` kanallarda open/pending/resolved arası Radix dropdown ile `setStatus` durum değişimi.
- **Masaüstü kanal içi arama kutusu** — sm+ ekranlarda büyüteç ikonlu arama input'u; `setSearch` ile günceller.
- **Mobil genişleyen arama çubuğu** — Küçük ekranda büyüteç IconButton ile açılan, otomatik odaklanan tam genişlik arama çubuğu; `aria-expanded`, kapatınca aramayı temizler.
- **AI Catch Up (yakala)** — Sparkle ikonlu buton; Copilot'a kanal bağlamıyla "catch up" özet isteği gönderir.
- **Intelligence analiz aksiyonu** — Müşteri kanallarında Brain ikonlu buton; `openIntelligence('src_support')` ile zeka/analiz panelini açar.
- **Kanaldan toplantı başlatma** — Broadcast dışı kanallarda VideoCamera butonu; `startMeeting` ile aktif kanal/konu/başlık bilgisiyle toplantı başlatır.
- **Devam eden toplantı bildirim çubuğu ve katılma** — Bağlı toplantı `ongoing` ise başlık altında bilgi çubuğu; "Çağrıya katıl" butonu `joinCall` ile bağlanır. Toplantı durumu `useLinkedMeetingState` ile izlenir.
- **Kaydedilenleri filtreleme (savedOnly)** — BookmarkSimple IconButton; yalnızca kaydedilen mesajları gösterme modunu aç/kapatır.
- **Detay paneli aç/kapa** — Info IconButton; `toggleDetails` ile detay panelini açar/kapatır.
- **Responsive ve erişilebilir başlık** — Buton etiketleri küçük ekranda gizlenir, ikonlar `aria-hidden`, IconButton'lar label/`aria-expanded`, arama odak halkası sunar.

### Mesaj baloncuğu (MessageBubble) yetenekleri

- **İki düzenli baloncuk** — `bubble` prop'una göre WhatsApp/Telegram tarzı sağa/sola hizalı baloncuk veya Slack/Teams tarzı avatarlı liste düzeni.
- **Kendi mesajı / başkası ayrımı** — `authorId` ile oturum kullanıcısı (me) karşılaştırılarak hizalama, renk ve yalnızca sahibe açık aksiyonlar (düzenle, herkesten sil) belirlenir.
- **Mesaj gruplama (grouped)** — Ardışık aynı yazar mesajlarında avatar/ad/zaman damgası gizlenir; hover'da saat görünür.
- **Avatar ve göreli zaman damgası** — Gruplanmamış mesajlarda 36px Avatar; zaman `relTime` ile i18n uyumlu göreli olarak gösterilir.
- **Zengin metin render'ı (renderRich)** — Düz metin gövdeleri markdown-lite biçimlendirme (mention/format) ile gösterilir.
- **Hızlı tepki menüsü ve tepki rozetleri** — Smiley butonu `QUICK_REACTIONS` emojilerini açar; mevcut tepkiler emoji + sayaç pill'leriyle gösterilir, kendi tepkin vurgulanır (`aria-pressed`), tıklayınca `toggleReaction`.
- **Yanıtla (reply target)** — Araç çubuğu/menüden `setReplyTarget` ile doğrudan yanıt hedefi belirlenir.
- **Konu içinde yanıtla (thread)** — Kanal görünümünde ChatCircleText butonu `openThread` ile mesajı thread olarak açar; `repliesCount>0` ise "n yanıt" bağlantısı gösterilir.
- **Alıntılı yanıt (quoted reply)** — `replyToId` ile bulunan kaynak mesaj, yazar adı ve kısaltılmış gövde önizlemesiyle alıntı bloğu olarak gösterilir.
- **Mesaj çevirisi (translate)** — Translate butonu çeviriyi tetikler, `bodyAlt` sonucu gösterilir, tekrar tıklayınca açılıp kapanır; `translating` sırasında CircleNotch animasyonu ve "çevriliyor" metni.
- **Mesaj iletme (forward)** — ForwardDialog'u açar; iletilenlerde `forwardedFrom` ile "şu kişiden iletildi" etiketi.
- **Sabitleme / kaydetme / önemli / öncelik** — `togglePin` (PushPin rozeti), `toggleSave` (BookmarkSimple), `toggleImportant` (sol kenarda danger çizgi + "önemli" rozeti) ve `setMessagePriority` (acil/normal, Warning ikonlu "acil" rozeti).
- **Mesaj bilgisi diyaloğu** — `messageInfo` ile MessageInfoDialog açılır (teslim/okundu detayı).
- **Copilot ile özetle** — "Buradan itibaren özetle" aksiyonu `useAskCopilot` ile yazar bağlamıyla AI özet isteği gönderir.
- **Mesajı kopyala** — `navigator.clipboard` ile gövdeyi kopyalar, "kopyalandı" toast'ı gösterir.
- **Hatırlatıcı (remind me)** — Pozitif toast verir ve 6 sn sonra mesaj özetiyle hatırlatma toast'ı zamanlar.
- **Inline mesaj düzenleme** — Sahibe açık Edit aksiyonu inline textarea açar; `saveEdit` → `editMessage`, düzenlenende "(düzenlendi)" etiketi.
- **Benden sil (geri al ile)** — `deleteForMe` mesajı gizler; toast'taki "geri al" `restoreForMe` çağırır.
- **Herkesten sil (onaylı)** — ConfirmDialog ile onaylı `deleteForEveryone`; danger renkli menü öğesi.
- **Hover araç çubuğu ve sağ tık bağlam menüsü** — Mesaj üzerine gelince/odaklanınca tepki, yanıtla, thread, çevir ve ⋯ menüsü; dokunmatik cihazda her zaman görünür. Kanal düzeninde Radix ContextMenu ile sağ tık menüsü (yanıtla/ilet/sabitle/kaydet/önemli/kopyala/benden sil/herkesten sil). ⋯ DotsThree menüsü tüm aksiyonları gruplar.
- **Özel mesaj türü render'ları** — sistem (E2EE kilit bilgisi), çağrı (katılma kartı + `useJoinCall`), sesli (VoiceMessage), anket (PollMessage), dosya (FileMessage), çıkartma (büyük emoji, `role=img`), not (warning çizgili "not" rozeti).
- **Durum/meta göstergeleri** — Teslim tikleri (DeliveryTicks), kaybolan mesaj (Timer/ephemeral), görüntülenme sayısı (Eye, 1000+ → "k"), sessiz mesaj (BellSlash), silinmiş mesaj italik "silindi", `hiddenForMe` ise render edilmez.
- **Erişilebilirlik ve hareket azaltma** — `role=article`, tabIndex, aria-label/aria-pressed/aria-hidden, focus-visible ring; araç çubuğu `motion-reduce:transition-none`.

### Mesaj oluşturucu (MessageComposer) yetenekleri

- **İki modlu besteci (Reply / Note)** — "Yanıt" ve "Not" modları; not modu sarı (warning) kabukla ekibe görünmeyen dahili not gönderir.
- **Konu bazlı taslak kaydı** — Metin `draftsByTopic` içinde aktif konuya göre saklanır; konu değişince taslak otomatik yüklenir, mod 'reply'e döner.
- **Kaydedilmemiş taslak koruması** — `useUnsavedGuard` ile metin doluyken sekme kapatma/yenileme uyarısı.
- **Zengin metin biçimlendirme araç çubuğu** — Kalın, italik, kod, alıntı ve madde listesi butonları; seçim duyarlı sarmalama (selectionStart/End), seçim yoksa "metin" yer tutucu.
- **Emoji ve GIF/Sticker seçici** — EmojiPicker seçilen emojiyi sona ekler; GifStickerPicker seçilen sticker'ı doğrudan `sendSticker` ile gönderir.
- **Slash komut otomatik tamamlama** — "/" ile summarize, draft, translate gibi AI komutları filtrelenir; seçince ilgili prompt Copilot'a sorulur.
- **@mention otomatik tamamlama** — Sondaki @kelime ile here, channel ve TEAM üyeleri eşleşir; seçince mention eklenir ve textarea'ya odaklanılır.
- **Akıllı yanıt önerileri (Smart Replies)** — Reply modunda ve yanıt hedefi yokken i18n'den gelen hazır yanıt çipleri; tıklayınca metin alanına yazılır.
- **Yanıtla önizleme ve iptal** — Yazar adı ve gövdenin ilk 70 karakteri accent çubukla önizlenir; X ile iptal.
- **Dosya/Fotoğraf ekleme menüsü** — Ataç menüsünden mock fotoğraf (photo.png, isImage) veya belge (document.pdf) `sendFile` ile gönderilir, toast gösterilir.
- **Hazır yanıt (canned) ekleme** — Şimşek menüsünde CANNED veri setinden başlık+gövde önizlemeli hazır yanıtlar; seçilen gövde taslağa yazılır.
- **Sesli mesaj kaydı** — Mikrofon butonu `sendVoice(12, me)` ile 12 sn'lik mock sesli mesaj gönderir.
- **Anket oluşturma** — ChartBar butonu CreatePollDialog'u açar.
- **Sessiz gönderim (silent)** — BellSlash butonu bildirimsiz gönderimi aç/kapatır; `send`'e `silent=true` geçirilir.
- **Mesaj zamanlama (schedule)** — Saat butonu metni `scheduleMessage` ile ileri zamana planlar; aktif konudaki zamanlanmış mesaj sayısı çip olarak gösterilir, tıklayınca ScheduledTray açılır.
- **AI taslak oluşturma ve yeniden yazma** — Sparkle butonu `messaging.ai.draft` prompt'unu bağlamla Copilot'a sorar; sihirli değnek menüsü metni professional/friendly/concise tonunda `rewriteMessage` ile yeniden yazar (boş metinde devre dışı).
- **Enter ile gönderme kısayolu** — Shift'siz Enter (mention adayı yokken) gönderir, Shift+Enter yeni satır; sm ekranlarda "Enter ile gönder" ipucu.
- **Bağlama duyarlı yer tutucu ve bağlam adı** — Placeholder moda/kanal türüne göre değişir; AI çağrılarına `#kanal / konu` veya DM adı (`ctxName`) bağlam olarak geçirilir.
- **Yayın kanalı salt-okunur durumu** — Broadcast kanalda besteci salt-okunur bilgi mesajıyla değiştirilir.
- **Gönder butonu durum yönetimi** — PaperPlaneRight butonu metin boşken devre dışı.
- **Erişilebilirlik** — role=tablist/tab + aria-selected mod sekmeleri, sr-only textarea etiketi, aria-label butonlar, aria-hidden ikonlar.

### Paneller & diyaloglar

- **Detaylar paneli (DetailsPanel)** — Masaüstünde sabit kolon (lg:w-72), mobilde tam ekran kayan panel (max-w-sm) + yarı saydam overlay ile kapatma; aktif kanal yoksa render edilmez. Avatar + presence başlık kartı, sohbet türü ve e2ee/özel etiket rozetleri, kanal üyeleri listesi (ilk 4), öncelik seçici (urgent/high/medium/low — müşteri sohbetlerinde), kaybolan mesaj zamanlayıcısı (off/24h/7d), paylaşılan medya özeti (mock), CSAT 1-5 yıldız puanlama (müşteri sohbetlerinde).
- **Thread (konu zinciri) yan paneli (ThreadPanel)** — Masaüstünde sabit, mobilde sağdan tam genişlikli (max-w-md) overlay; kök mesaj gösterimi, yanıtları filtreleme/sıralama (en yeni üstte), yanıt sayısı göstergesi, kaydırılabilir akış. İki satırlık textarea ile yanıt yazma (Enter gönder / Shift+Enter satır, boşta devre dışı), `useAskCopilot` ile AI thread özeti, `closeThread`/overlay ile kapatma.
- **Yeni Kanal Oluşturma diyaloğu (CreateChannelDialog)** — Kanal adı girişi, üç seçenekli tür seçici (Genel/Hash, Özel/Lock, Paylaşılan/UsersThree, `aria-pressed`), slug normalizasyonu (boşluk→tire, küçük harf), boş ad doğrulaması, `createChannel(name, kind)` ve form sıfırlama.
- **Yeni DM Oluşturma diyaloğu (NewDmDialog)** — TEAM'den mevcut kullanıcı hariç aday listesi, çoklu üye seçimi (toggle, `aria-pressed`), seçili durum görsel geri bildirimi (accent kenarlık + Check), avatar + presence, kaydırılabilir liste, `createDm(sel)`, boş seçimde gönderim engeli, tekil/grup etiketi (startDm/startGroupDm).
- **Anket Oluşturma diyaloğu (CreatePollDialog)** — Soru girişi, dinamik seçenekler (min 2, ekle/sil), çoklu seçim/anonim/quiz toggle'ları, quiz modunda doğru cevap radyosu, geçerlilik doğrulaması, `createPoll(question, options, {multi, anonymous, quiz, correctIndex}, me)` ve form sıfırlama.
- **Mesaj İletme diyaloğu (ForwardDialog)** — Aktif kanal hariç tüm kanalları (CHANNELS) kaydırılabilir liste olarak gösterir; kanal türü ikonu ve ad biçimi (DM sade / diğer #), `forward(messageId, channelId)`, başarı toast'ı ve otomatik kapanma.
- **Mesaj Bilgisi diyaloğu (MessageInfoDialog)** — WhatsApp tarzı; mesaj gövdesi (yoksa "sesli mesaj") accent çubukla önizlenir, alıcı bazlı teslim/okundu (TEAM'den ilk 4; son alıcı "iletildi", diğerleri "okundu"), her alıcı için avatar (32px), ad ve göreli zaman (mock).
- **Global Mesaj Arama diyaloğu (GlobalSearchDialog)** — Slack/Teams tarzı kurumsal arama; otomatik odaklı arama girişi, en az 2 karakterde canlı filtreleme (max 40 sonuç), silinmiş/gizli mesajların elenmesi, sonuca tıklayıp `setChannel`/`setTopic` ile konuşmaya atlama, sonuç bağlam etiketleri (yazar/kanal/konu), sesli mesaj gövde yedeği, durum bazlı boş/ipucu mesajları.
- **Kaydedilenler çekmecesi (SavedDrawer)** — Tüm sohbetlerdeki `saved=true` ve silinmemiş mesajları tek modalda listeler; öğeye tıklayıp ilgili sohbete gitme (`setChannel`/`setTopic`), kaynak kanal/konu bağlamı, gövde önizleme + sesli mesaj yedeği, boş durum mesajı.
- **Zamanlanmış Mesajlar Tepsisi (ScheduledTray)** — Telegram tarzı; aktif konuya göre `scheduled` mesajları listeler, saat ikonu + gövde + aksiyonlar, "şimdi gönder" (`sendScheduledNow`) ve "sil" (`deleteScheduled`), boş durum mesajı.

### İçerik & mesaj bileşenleri

- **Sabitlenmiş mesajlar çubuğu (PinnedBar)** — Aktif konunun pinned ve silinmemiş mesajlarını filtreler (yoksa render edilmez); sabit mesaj sayacı + ilk mesaj önizlemesi, X ile `togglePin` ile sabitlemeyi kaldırma.
- **Mesaj listesi akışı (MessageList)** — Aktif konunun kök mesajları (`parentId === null`); konu bazlı filtre, zamanlanmış/gizli mesajları gizleme, savedOnly filtresi, mesaj içi arama (body), zaman sıralaması (tMinutes), thread yanıt sayısı (`repliesCount`), DM'lerde balon görünümü, kanallarda 8 dk eşiğiyle ardışık mesaj gruplama, okunmamış ayırıcı ("Yeni mesajlar", role=separator), otomatik en alta kaydırma, ilk yükleme iskeleti (`useFirstLoad`, 6 satır ListSkeleton), boş/sonuçsuz durumları.
- **Sesli mesaj oynatıcı (VoiceMessage)** — WhatsApp/Telegram tarzı mock çalar; oynat/duraklat toggle, oynatma hızı (1x→1.5x→2x döngüsel), deterministik 15 çubuklu dalga formu, mm:ss süre, yerel React state, role=group + aria-label'lar.
- **Anket/Quiz mesaj kartı (PollMessage)** — Telegram/WhatsApp/Teams tarzı; tür rozeti (quiz/anonim/herkese açık), multi/closed etiketleri, seçeneğe oy verme (`vote`), oy yüzdesi ilerleme çubuğu, kendi oyunun işaretlenmesi (Check + accent + aria-pressed), seçenek başına oy sayısı/yüzdesi, toplam oy sayısı (i18n çoğul), quiz doğru cevap vurgusu (kapatıldığında), sahibin anketi kapatması (`closePoll`), kapalı ankette oylamanın devre dışı kalması.
- **Dosya eki mesajı (FileMessage)** — Görsel ekler gradyan önizleme kartında (ikon + ad + boyut), görsel olmayanlar tıklanabilir indirme butonu olarak; mock placeholder indirme (`downloadText`), indirme başarı toast'ı, dosya boyutu biçimlendirme (`fmtSize` KB/MB), uzun ad truncate.
- **Teslimat durumu göstergesi (DeliveryTicks)** — WhatsApp tarzı tikler: sending=ClockCountdown, sent=tek Check, delivered=çift Checks, read=accent çift Checks; durum yoksa render edilmez, her durum aria-label'lı.
- **Bağlantı önizleme kartı (LinkPreview / unfurl)** — Mesajdaki ilk URL için Slack/Teams/Telegram tarzı önizleme; URL ayıklama (`firstUrl`), alan adı normalleştirme (www. temizleme), yeni sekmede güvenli açma (target=_blank, rel=noopener noreferrer).
- **Emoji seçici (EmojiPicker)** — Smiley tetikleyicili Radix dropdown popover; EMOJI_PALETTE 8 kolonlu ızgara, `onPick(emoji)` callback, klavye gezinme/highlight.
- **GIF/Sticker seçici (GifStickerPicker)** — Sticker tetikleyicili Radix dropdown panel; 16 büyük emoji STICKERS 6 kolonlu ızgara, `onPick` callback.
- **Akıllı yanıt çipleri (SmartReplies)** — Chatwoot Captain tarzı AI önerili yuvarlak çipler; Sparkle etiketi, i18n `returnObjects` listesi, `onPick(text)` callback, boş/geçersiz listede render edilmez.
- **Yazıyor göstergesi (TypingIndicator)** — Simüle edilmiş "X yazıyor..."; kanala göre yazan kişi (DM ise karşı taraf, değilse "Defne Yıldız"), zamanlayıcı tabanlı göster/gizle (1600ms göster, 5200ms gizle, kanal değişiminde sıfırla), `aria-live=polite`.
- **Hikaye/Durum şeridi (StoriesBar)** — Yatay kaydırılabilir geçici durum halkaları; kesik çizgili + ile ekleme (toggle, `aria-expanded`), metin girişi + gönder (`addStory`, Enter kısayolu, boş engeli), avatar halka rengi görüldü durumuna göre (görülmemiş=accent, görülmüş=soluk), tıklayınca görüldü işaretleme (`markSeen`) ve içerik paneli (`aria-live=polite`), panel kapatma.
- **SourceBadge (no-op)** — Eski "gelen entegrasyon kaynağı" rozeti artık null döndürür; sohbet özellikleri yerli olarak klonlandığı için geriye dönük uyumluluk amacıyla tutulur.

### State & store'lar

- **Mesajlaşma Zustand store (useMessagingStore)** — Kanallar, konular, mesajlar, aktif seçimler, arama, taslaklar, thread durumu ve detay panelini yöneten merkezi store; seed verisi `./data`'dan (CHANNELS, MESSAGES, TOPICS) ve `./members`'tan yüklenir. Benzersiz ID üreteci (`uid`, crypto.randomUUID + fallback).
- **Kanal & konu seçimi** — `setChannel` aktif kanalı değiştirir (okunmamış sayacı/manuel okunmadı sıfırlanır, konu/thread/arama/yanıt hedefi temizlenir); `setTopic` aktif konu seçer; kanal açılırken ilk konu otomatik aktif edilir (`firstTopicOf`).
- **Thread aç/kapama** — `openThread`/`closeThread` ile `threadRootId` üzerinden yanıt zinciri görünümü.
- **Arama, savedOnly ve klasör filtreleri** — `setSearch` (kanal/konu değişiminde temizlenir), `toggleSavedOnly`, `setFolder` (yeni kanal/DM'de 'all'a döner).
- **Konu bazlı taslak ve yanıt hedefi** — `setDraft` (draftsByTopic, gönderince temizlenir), `setReplyTarget` (gönderince temizlenir).
- **Mesaj gönderme (send)** — Aktif kanal/konuya metin gönderir; isteğe bağlı yanıt hedefi ve sessiz gönderim; kanal kaybolan mesaj modundaysa `ephemeral` işaretlenir.
- **Teslim durumu animasyonu (progressDelivery)** — sending → sent (600ms) → delivered (1300ms) → read (2600ms).
- **Yanıt, not, sesli, dosya, sticker gönderimi** — `reply` (parentId'li thread yanıtı, kanal/konu devralır), `sendNote` (kind:note, teslim durumsuz), `sendVoice` (kind:voice, voiceSec + teslim animasyonu), `sendFile` (kind:file, FileAttachment), `sendSticker` (kind:sticker).
- **Zamanlanmış mesaj akışı** — `scheduleMessage` (scheduled:true kuyruğa), `sendScheduledNow` (anında gönder + animasyon), `deleteScheduled` (iptal/sil).
- **Toplantı↔sohbet köprüsü** — `postCall` (kind:call + meetingId çağrı kartı), `postExternal` (aktif olmayan kanal/konuya mesaj, boş metin engellenir).
- **Mesaj düzenleme & silme** — `editMessage` (gövde günceller + edited:true), `deleteForEveryone` (deleted:true, gövde/reaksiyon temizlenir), `deleteForMe`/`restoreForMe` (hiddenForMe gizle/geri al).
- **Mesaj işaretleme** — `togglePin`, `toggleSave`, `toggleImportant`, `setMessagePriority` (normal/important/urgent).
- **Mesaj iletme (forward)** — Hedef kanalın ilk konusuna ekler, `forwardedFrom` kaynak etiketi ve `bodyAlt` çevirisi korunur.
- **Sohbet seviyesi aksiyonlar** — `togglePinChat`, `toggleMuteChat`, `toggleMarkUnread` (işaretlide unread≥1, kaldırınca sıfırlanır), `archiveChannel`.
- **Müşteri/destek iş akışı** — `setStatus` (ConversationStatus), `setPriority` (ConvPriority), `setDisappearing` (DisappearTimer; 'off' değilse o kanal mesajları ephemeral), `submitCsat` (rating + durum otomatik 'resolved').
- **Detay paneli** — `toggleDetails` ile `detailsOpen`.
- **Anket aksiyonları** — `createPoll` (multi/anonymous/quiz/correctOptionId, boş seçenekler filtrelenir), `vote` (tekli ankette önceki oy iptal, çoklu ankette çoklu, tekrar tıklayınca geri al, kapalıda engellenir), `closePoll`.
- **Emoji reaksiyonu (toggleReaction)** — Ekler/kaldırır, kalmayan emoji düşer, kullanıcılar emoji bazında gruplanır (userIds).
- **Mesaj çevirisi (translate)** — Önce 'translating' (450ms), sonra 'translated' ve `bodyAlt`'a sahte çeviri metni.
- **Kanal & DM oluşturma** — `createChannel` (ad + ChannelKind, varsayılan 'general' konusu, aktif eder), `createDm` (tekil/grup adlandırma "isim, isim +N", e2ee bayrağı, 'main' konusu), `archiveChannel`.
- **Topluluklar store (useCommunitiesStore)** — Kanal gruplarını (grup-of-gruplar) yöneten Zustand store; topluluk listesi, aktif topluluk seçimi (`activeCommunityId`, null=tüm kanallar), `setActiveCommunity`, `reset()` ile tohum verisine dönüş. Seed: "Engineering" (ch_eng, ch_design, ch_product) ve "Company-wide" (ch_announce, ch_product).
- **Hikayeler store (useStoriesStore)** — WhatsApp Status / Telegram Stories tarzı 24 saatlik durumları yönetir; `addStory` (başa ekler, tMinutes:0), `markSeen` (kullanıcı için seenBy, tekrar eklemez), `reset` (seed'e döner), `unseenFor` (izleyici için görülmemiş + kendine ait olmayanlar), artan story ID üreteci (`st_<zaman>_<n>`).
- **Auth store entegrasyonu** — `useAuthStore`'dan `principal.id` (varsayılan 'usr_1') ile oturum kullanıcısı (me) belirlenir; sahiplik, oy, tepki, hikaye ve gönderimlerde kullanılır.
- **Toast bildirim entegrasyonu** — `useToastStore.push` ile kopyalama, silme, hatırlatıcı, dosya, sesli mesaj, zamanlama, indirme ve iletme aksiyonlarında ton (positive/neutral) ve aksiyon butonlu toast'lar.
- **Copilot AI entegrasyonu** — `useAskCopilot` ile slash komutları, AI taslak, catch up, thread özeti ve diğer çağrılar bağlam adıyla Copilot'a iletilir.

### Domain mantığı & yardımcılar (saf fonksiyonlar)

- **Çerçeveden bağımsız domain katmanı** — Tüm mesajlaşma yardımcıları framework'siz saf fonksiyonlar olarak yazılmış, birim test edilebilir.
- **Teslimat durumu makinesi (deliveryNext)** — sending→sent→delivered→read sırasıyla bir adım ilerletir; read terminaldir.
- **Düzenleme penceresi (canEditWithin)** — WhatsApp tarzı 15 dakikalık düzenleme penceresini dakika cinsinden hesaplar.
- **Medya albümü gruplama (groupAlbums)** — Aynı yazardan belirli aralıkta (varsayılan 2 dk) ardışık görsel/sticker mesajları albümlere gruplar; medya olmayanlar tekil kalır.
- **Sesli not dalga formu (voiceWaveform)** — Seed id'den deterministik sözde-rasgele dalga formu (varsayılan 24 bar, 0..1 yükseklik) üretir.
- **Anahtar kelime/vurgu eşleşmesi (highlightHit)** — Metnin verilen kelime listesinden biriyle büyük/küçük harf duyarsız tam alt-dize eşleşmesi olup olmadığını kontrol eder.
- **Topluluk kanallarını çözümleme (communityChannels)** — Topluluğun üye kanallarını channelIds sırasını koruyarak çözer; geçersiz id'leri eler.
- **Mesaj önceliği sıralama (priorityRank)** — Teams tarzı önceliği sayıya çevirir: urgent=2, important=1, diğer=0.
- **Copilot tarzı yeniden yazma (rewriteMessage)** — Taslağı professional/friendly/concise tonlarda deterministik yeniden yazar (concise dolgu kelimelerini temizler, friendly ünlem ekler, professional nokta ile bitirir); harici model yok.
- **Acil mesaj yeniden bildirim zamanlaması (urgentRepeatSchedule)** — Teams urgent mesajları okunana kadar belirli aralıkla (varsayılan 2 dk, 20 dk pencere) yeniden bildirir; ping sayısı, sonraki ping zamanı ve aktiflik hesaplar.
- **Markdown-lite zengin metin oluşturucu (renderRich / rich.tsx)** — Hafif markdown'ı React düğümlerine çevirir (boş metinde null); XSS-güvenli (dangerouslySetInnerHTML kullanmaz), kararlı React key üretimi, `parseInline` token ayrıştırıcı.
- **Desteklenen biçimlendirme sözdizimi** — Çitli kod bloğu (\`\`\`), satır içi kod (\`), kalın (**), italik (* ve _), üstü çizili (~~), bağlantı [metin](url) (yalnızca http/https güvenli, yeni sekme; güvensiz şema düz metne düşer), @mention rozeti, madde imli liste (-/*), alıntı bloğu (>), satır sonu/boş satır aralığı.
- **Üye kimliği erişimcileri (members.ts re-export)** — Kimliği `@/lib/identity`'den yeniden dışa aktarır (`memberById`, `memberName`, `presenceOf`); mesajlaşma kimliği sahiplenmez, bağlam sınırı `scripts/check-boundaries.mjs` ile zorlanır.

### Veri modeli (types.ts & data.ts)

- **Kanal türleri (ChannelKind)** — public, private, shared (kuruluşlar arası/B2B), broadcast (tek yönlü yayın), dm (doğrudan/müşteri); Slack/Teams/WhatsApp/Telegram deneyimlerini klonlar.
- **Mesaj türleri (MessageKind)** — text (varsayılan), voice, note, system, call, poll, file, sticker.
- **Mesaj önceliği (MessagePriority)** — normal/important/urgent; urgent okunana kadar tekrar bildirim gönderir.
- **Mesaj teslim durumu (DeliveryStatus)** — sending/sent/delivered/read (WhatsApp tikleri).
- **Konuşma yaşam döngüsü (ConversationStatus)** — open/pending/resolved (Chatwoot tarzı destek akışı).
- **Konuşma öncelik seviyesi (ConvPriority)** — urgent/high/medium/low (destek konuşmaları).
- **Sohbet klasörleri (ChatFolder)** — all/unread/dms/channels.
- **Kaybolan mesaj zamanlayıcısı (DisappearTimer)** — off/24h/7d.
- **Mesaj veri modeli (Message)** — id, channelId, topicId, parentId, authorId, authorName, body, bodyAlt (çeviri), tMinutes, reactions, replyToId, status, kind, pinned/saved/important/edited/deleted/scheduled/silent/ephemeral, hiddenForMe, forwardedFrom, viewCount, voiceSec, poll, file, sticker, callMeetingId, translating/translated, systemKey gibi zengin alanlar.
- **Mesaj iş parçacığı ve yanıtlama** — `parentId` ile thread, `replyToId` ile alıntılı yanıt, `topicId` ile başlığa bağlama.
- **Mesaj durum bayrakları** — düzenleme (edited), herkesten silme (deleted tombstone), benden gizleme (hiddenForMe), sabitleme/kaydetme/önemli, sessiz/zamanlanmış, iletilmiş (forwardedFrom), efemera (ephemeral), broadcast görüntülenme (viewCount), çeviri (translating/translated/bodyAlt).
- **Dosya eki (FileAttachment)** — name, fileType, sizeKb, isImage.
- **Anket (Poll / PollOption)** — soru, seçenekler (id/text/votes), multi/anonymous/quiz/closed/correctOptionId.
- **Hikaye/Durum (Story)** — id, authorId, kind (text/image), text, mediaName, seenBy, tMinutes.
- **Topluluk (Community)** — id, name, channelIds (grup-of-gruplar).
- **Emoji tepkileri (Reaction)** — emoji + tepki veren userIds listesi.
- **Konu/başlık (Topic)** — kanala bağlı başlık; DM'lerde 'main' konusu.
- **Kanal alanları** — id, name, kind, pinned, muted, archived, unread, unreadManual, workspaceId, dmUserId, memberIds, e2ee, subscribers, externalOrgs, label, isCustomer, status, assigneeId, priority, csat, disappearing.
- **Müşteri/destek konuşma alanları (Chatwoot)** — isCustomer, status, label, assigneeId, priority, CSAT (1-5); örnek Jordan Blake DM'i (status:open, label:billing, assigneeId:usr_1, priority:high).
- **Çalışma alanı kapsamı (workspace scoping)** — Kanallar workspaceId (ws_core, ws_growth) ile bağlanır; tanımsızsa her alanda görünür (DM'ler gibi).
- **Kuruluşlar arası paylaşımlı kanal** — shared kanallarda partner kuruluş adları (externalOrgs); B2B/Teams Connect senaryoları.
- **Hazır yanıtlar (CANNED)** — Başlık + gövdeli şablonlar (Greeting, Pricing, Follow-up).
- **Hızlı tepki paleti (QUICK_REACTIONS)** — 👍 ✅ 🎉 ❤️ 👀 🔥.
- **Emoji seçici paleti (EMOJI_PALETTE)** — Kategorize edilmiş ~40 emoji (yüz ifadeleri, eller, kalpler, semboller, nesneler).
- **Seed/mock veri (data.ts)** — CHANNELS (kanal/private/broadcast/dm; okunmamış sayaçları, pinned/muted, workspace kapsamı, e2ee, broadcast subscribers:1240, müşteri konuşması, harici kullanıcılar ext_priya/ext_jordan, çift dilli bodyAlt, markdown/mention gövdeler, dosya/anket/sesli/sistem/not/zamanlanmış örnekleri), TOPICS (Q3 launch, Roadmap, RFC: realtime layer), MESSAGES, UNREAD_FROM (okunmamış ayırıcı konumu, tp_rfc→m13, tp_dm_jordan→cj1).
- **Göreceli zaman damgası (tMinutes)** — "kaç dakika önce" biçiminde göreli zaman; sıralama ve gösterim için.
- **FastAPI uyumlu veri şekli** — Tüm tipler Faz 2 backend entegrasyonuna uygun tasarlanmıştır.


---

<a id="meetings"></a>

## Meetings sekmesi

Meetings sekmesi, anlık ve planlı görüntülü toplantıları, kalıcı video odalarını ve toplantı içi tüm zenginleştirilmiş deneyimi (sahne, paneller, AI özetleri, moderasyon) tek bir merkezde toplayan omnichannel toplantı modülüdür. Google Meet, Zoom ve Webex paritesini hedefleyen bu sekme; açılış, katılım öncesi ve toplantı odası fazlarından oluşan faz tabanlı bir akışla, koyu tema (AAA kontrast) bir sahnede, i18n ve a11y desteğiyle çalışır.

### Genel mimari ve akış

- **Yetki kontrolü (meetings.view)** — Sayfa açılışında useAuthStore üzerinden `can("meetings.view")` izni denetlenir; izin yoksa Prohibit ikonlu Forbidden bileşeniyle erişim engellenir.
- **Faz tabanlı akış yönlendirmesi** — useMeetingStore'daki `phase` state'ine göre üç ekran arasında geçiş yapılır: `idle` → MeetingsLanding, `prejoin` → PreJoin, diğer → MeetingRoom.
- **Toplantı fazı yaşam döngüsü (idle/prejoin/in)** — Toplantı yaşam döngüsü boşta, katılım öncesi ve toplantı içi olarak üç fazda yönetilir; faz değişimleri UI akışını yönlendirir.
- **Koyu tema sahne paleti** — Toplantı sahnesi `data-theme="dark"` sarmalayıcı ve `bg-bg` arka planıyla koyu token paletine sabitlenir, tam yükseklik (h-full) flex layout kullanır.
- **i18n çoklu dil desteği** — Tüm metinler, etiketler, aria-label'lar, placeholder ve toast mesajları react-i18next `useTranslation`/`t()` ile `meetings.*`, `messaging.poll.*`, `intel.*` gibi çeviri anahtarları üzerinden render edilir; sayı/oran değerleri interpolasyonla aktarılır, sabit metin gömülmez.
- **Erişilebilirlik (a11y) altyapısı** — Butonlarda aria-label/aria-pressed/title, dekoratif ikon ve ayraçlarda aria-hidden, canlı bölgelerde aria-live="polite" (zamanlayıcı, filigran, altyazı), giriş alanlarında aria-label, klavye (Enter) gönderimi ve focus-visible:ring-accent odak halkası kullanılır.
- **Zustand useMeetingStore (tek kaynaklı state)** — Toplantının tüm durumu ve aksiyonları (phase, participants, layout, sidePanel, kayıt, altyazı, moderasyon, efektler, breakout, lobi vb.) merkezi useMeetingStore'dan okunur ve yazılır.

### Ana akışlar (Landing & PreJoin)

- **Toplantılar açılış sayfası (Landing)** — `idle` fazında gösterilen, maksimum genişlikli, i18n çevirili başlık ve alt başlık içeren toplantı merkezi.
- **Anlık toplantı başlatma (startInstant)** — Üst sağdaki "Yeni toplantı" butonu ve kişisel oda kartındaki "Odayı başlat" butonu tek dokunuşla "Instant meeting" başlığıyla prejoin fazına geçer.
- **Hızlı toplantıya katılma** — Üst köşedeki "Katıl" butonu sabit `mtg_standup` toplantısı için prejoin ekranını açar.
- **Kişisel oda kartı (Webex pariteli)** — Host'a özel kalıcı kişisel oda URL'sini (PERSONAL_ROOM_URL) gösterir; link, başlat ve kopyalama aksiyonlarını barındırır.
- **Kişisel oda linkini kopyalama** — Kopyala ikon butonu `navigator.clipboard.writeText` ile kişisel oda URL'sini panoya kopyalar.
- **Yaklaşan/canlı toplantılar listesi** — MEETINGS mock verisinden gelen toplantıları responsive grid (1/2/3 sütun) içinde kart olarak listeler.
- **Canlı / başlangıç rozeti** — Toplantı canlıysa danger tonlu "Canlı" rozeti, değilse kaç dakika sonra başlayacağını (inMin) gösteren nötr rozet çıkar.
- **Katılımcı avatar yığını** — Her kartta ilk 4 katılımcının avatarı üst üste bindirilir, fazlası için "+N" sayacı gösterilir; isimler `memberName(id)` ile çözülür ve aria-label ile katılımcı sayısı duyurulur.
- **Toplantı kartından katılma** — Her karttaki "Katıl" butonu `openPrejoin(m.id)` ile ilgili toplantının ön katılım ekranını açar.
- **Katılım öncesi (PreJoin) ekranı** — `prejoin` fazında gösterilen, cihaz/efekt ayarlarının yapıldığı tam ekran ortalı önizleme sayfası; aktif toplantı başlığını (activeTitle) ve alt başlığı gösterir.
- **Kamera önizleme alanı** — 16:9 oranlı önizleme; kamera açıkken accent gradient arka plan, kapalıyken "Kamera kapalı" etiketi gösterilir.
- **Kullanıcı avatarı önizlemede** — Oturum açan kullanıcının displayName'i (authStore.principal) ile büyük avatar, yoksa "You" fallback'i gösterilir.
- **PreJoin mikrofon/kamera toggle** — Yuvarlak toggle butonları micOn/camOn durumuna göre Microphone/MicrophoneSlash ve VideoCamera/VideoCameraSlash ikonu gösterir; `toggleMic`/`toggleCam` çağırır, açık durumda nötr kenarlık, kapalı durumda danger (kırmızı) zemin verir.
- **Arka plan bulanıklaştırma (blur) toggle** — Aperture ikonlu buton `toggleBlur` ile arka plan bulanıklaştırma efektini açıp kapar.
- **Kamera/mikrofon cihazı seçimi** — Açılır select'lerle kamera (örn. "FaceTime HD Camera") ve mikrofon (örn. "MacBook Pro Microphone") cihazı seçilir; aria-label ile etiketlenir.
- **AI Companion toggle (PreJoin)** — Sparkle ikonlu tam genişlik buton `toggleAiCompanion` ile AI asistanını açar/kapatır (varsayılan açık); durum metni ve aria-pressed gösterir.
- **Şimdi katıl / iptal** — Büyük "Şimdi katıl" butonu `join` aksiyonunu tetikler; "İptal" (ghost) butonu `leave` ile prejoin'den çıkar.

### Toplantı odası (MeetingRoom) sahnesi

- **Toplantı odası kabuğu (MeetingRoom)** — Üst bar, lobi banner'ı, sahne + ekran paylaşımları, kontrol çubuğu ve yan/host/engage panellerini birleştiren ana toplantı düzeni (min-height sıfır esnek flex).
- **Üst bilgi çubuğu (top bar)** — Aktif toplantı başlığı, kayıt rozeti, katılımcı sayısı ve AI Companion rozetini gösterir.
- **Kayıt durumu rozeti ve süre biçimlendirme** — Kayıt aktifken danger zeminde dolu Record ikonu ve `fmt()` ile mm:ss biçiminde süre gösteren rozet.
- **Kayıt zamanlayıcı tiki** — `recording` true iken her saniye `tickRecord` ile `recordSec` artıran setInterval efekti; başlat/durdurda otomatik başlar/temizlenir.
- **Katılımcı sayısı göstergesi** — Üst barda store participants uzunluğuna bağlı toplam katılımcı sayısını gösteren etiket.
- **AI Companion göstergesi** — aiCompanion açıkken üst barda Sparkle ikonlu accent renkli kısa AI Companion etiketi.
- **Lobi banner'ı ve admit/deny** — Lobi kuyruğundaki ilk kişi için banner; "Admit" (içeri al) ve "Deny" (reddet) butonlarıyla `admit`/`denyLobby` tetiklenir.
- **Aktif konuşmacı rotasyonu (rotateSpeaker)** — 3.2 saniyede bir `rotateSpeaker` ile mikrofonu açık katılımcılar arasından rastgele aktif konuşmacı seçilir (simülasyon).
- **Canlı altyazı akışı (overlay)** — captionsOn açıkken her 2.6 saniyede `pushCaption` ile yeni altyazı üretilir; sahne üzerinde son 2 satır konuşmacı adıyla aria-live overlay'de gösterilir.
- **Yüzen emoji reaksiyonları (overlay)** — reactions dizisindeki emojiler sahnenin altında pointer-events kapalı bir overlay'de yüzen büyük emojiler olarak gösterilir.
- **Beyaz tahta overlay** — whiteboardOpen true iken sahne üzerine Whiteboard bileşeni katman olarak yerleştirilir.
- **Sahne ve panel kompozisyonu** — Stage, ControlBar ve SidePanel/HostPanel/EngagePanel alt bileşenleri tek odada modüler olarak birleştirilir.

### Sahne (Stage) & video karoları

- **Video kişi karosu (Tile)** — Her katılımcı için karo: kamera açıkken degrade arka plan, kapalıyken baş harfli avatar; büyük (ana sahne) ve normal (ızgara) boyut varyantı.
- **Konuşan kişi vurgusu (ring)** — Aktif konuşan ve mikrofonu açık katılımcının karosu accent renkli halka ile vurgulanır.
- **Bağlantı kalitesi göstergesi** — Karonun sol üstünde good/fair/poor kalitesine göre yeşil/sarı/kırmızı nokta; üzerine gelince çevrilmiş kalite metni (title) çıkar.
- **Mikrofon kapalı (muted) rozeti** — Mikrofonu kapalı katılımcının isim etiketi yanında üstü çizili mikrofon ikonu.
- **El kaldırma rozeti** — Eli kalkık katılımcının karosunun sağ altında uyarı renkli el ikonu.
- **Spotlight rozeti** — Spotlight verilen katılımcının karosu uyarı renkli halkayla çevrelenir, sağ üstte PushPin ikonu gösterilir.
- **İsim etiketi / "Siz" gösterimi** — Karonun sol altında ad gösterilir; kendi karonda "Siz" yazılır, uzun adlar kırpılır (truncate).
- **Filmstrip (alt küçük karo şeridi)** — Konuşmacı/spotlight/ekran paylaşımı düzenlerinde ikincil katılımcılar yatay kaydırılabilir küçük karolar şeridinde gösterilir.
- **Ekran paylaşımı görünümü** — Bir katılımcı ekran paylaşırken sahne, monitor ikonlu ve "X ekranını paylaşıyor" etiketli özel paylaşım yüzeyine geçer; altında tüm katılımcı filmstrip'i kalır.
- **Konuşmacı (speaker) düzeni** — layout "speaker" iken aktif konuşmacı (yoksa ilk katılımcı) büyük tek karo, diğerleri filmstrip'te.
- **Spotlight düzeni** — spotlightId ayarlıysa o katılımcı büyük karo olarak öne çıkar, kalanlar filmstrip'te.
- **Izgara (grid) düzeni** — Varsayılan düzende katılımcılar duyarlı ızgarada (mobilde 2, sm üstü 3 sütun) ortalanmış gösterilir.
- **Sahne düzeni öncelik mantığı** — Render önceliği ekran paylaşımı > spotlight/konuşmacı > ızgara; katılımcı yoksa hiçbir şey çizilmez (null).

### Kontrol çubuğu (ControlBar)

- **Mikrofon aç/kapat (mute/unmute)** — Yuvarlak buton; açıkken Microphone, kapalıyken MicrophoneSlash + danger ton, `toggleMic` çağırır.
- **Kamera aç/kapat (start/stop cam)** — Yuvarlak buton; açıkken VideoCamera, kapalıyken VideoCameraSlash + danger ton, `toggleCam` çağırır.
- **Ekran paylaşımı (share/stop)** — Aktifken active vurgu tonu ve pressed; `toggleScreen` çağırır, başlarken düzen otomatik speaker'a geçer.
- **El kaldır/indir (raise/lower hand)** — Aktifken active tonu ve pressed; `toggleHand` çağırır.
- **Reaksiyon (emoji) menüsü** — Radix dropdown ile üstte açılan, yuvarlak hap şeklinde gölgeli emoji paleti; MEETING_REACTIONS'taki her emoji `sendReaction` ile gönderilir.
- **Altyazılar (captions) aç/kapat** — Aktifken active tonu ve pressed; `toggleCaptions` çağırır.
- **Toplantı kaydı (record/stop)** — Kayıt sırasında danger ton ve dolu (fill) Record ikonu; `toggleRecording` çağırır.
- **Düzen (layout) değiştirme** — grid ile speaker arasında toggle; `setLayout` mevcut düzeni tersine çevirir.
- **AI notları (Copilot)** — Sparkle butonu `useAskCopilot` kancasıyla `meetings.ai.notes` promptu ve aktif başlık (activeTitle) üzerinden Copilot'a soru sorarak AI not özeti üretir.
- **Engage paneli açma** — ChartBar butonu yan paneli engage sekmesine açar/kapatır; `setSidePanel` ile yönetilir, aktifken active tonu.
- **Beyaz tahta aç/kapat** — ChalkboardSimple butonu `toggleWhiteboard` ile beyaz tahtayı açar/kapatır; whiteboardOpen'a bağlı active tonu.
- **Katılımcılar paneli** — Users butonu yan paneli participants sekmesine açar/kapatır (aynı sekme açıksa kapatan toggle mantığı).
- **Sohbet paneli** — ChatCircle butonu yan paneli chat sekmesine açar/kapatır.
- **Host kontrolleri paneli (koşullu)** — Yalnızca self rolü host/cohost ise gösterilen ShieldCheck butonu, yan paneli host sekmesine açar/kapatır.
- **Toplantıdan ayrıl (leave)** — Danger tonlu PhoneDisconnect butonu `leave()` çağırır, "leftToast" bildirimi gösterir; AI companion açıksa 600ms sonra pozitif "aiSummaryToast" bildirimi gösterir.
- **RoundBtn yeniden kullanılabilir buton** — forwardRef'li yuvarlak (h-12 w-12) ikon butonu; label/tone/pressed/onClick prop'larıyla default/active/danger tonlarını ve aria-label/aria-pressed/title'ı destekler.
- **Duruma bağlı buton tonları** — Tone tipi (default/active/danger): danger kırmızı zemin, active accent zemin, default kenarlıklı raised zemin + hover efekti.
- **Görsel ayraçlar (separator)** — sm ekranlarda görünen dikey çizgi ayraçları (h-8 w-px) ile gruplama; küçük ekranda gizli, flex-wrap esnek yerleşim.
- **Toast bildirim entegrasyonu** — useToastStore `push` ile ayrılma/AI özet/host bildirimleri (tone: neutral/positive/danger) gösterir.

### Yan panel (SidePanel) — Katılımcılar / Sohbet / Altyazı

- **Çoklu sekmeli yan panel** — Toplantı sağ kenarında katılımcılar, sohbet ve altyazı sekmelerini barındıran tablist tabanlı panel kabuğu; none/host/engage durumlarında ve "none" iken render edilmez.
- **Sekme geçişi ve aktif durum** — TABS'tan üretilen sekmeler tıklanınca `setSidePanel` ile değişir; seçili sekme aria-selected ve renkle vurgulanır. Panel X butonuyla kapatılır.
- **Lobi bekleme kuyruğu** — lobbyQueue doluysa uyarı çerçeveli blokta bekleyen kişiler avatar+ad ile listelenir; her kişi için "Kabul" (admit) ve "Reddet" (denyLobby) butonları sunulur.
- **Breakout yöneticisi açma** — Katılımcılar sekmesindeki Breakouts butonu BreakoutManager dialogunu açar (breakoutOpen state).
- **Katılımcı listesi** — Tüm katılımcılar avatar+ad ile listelenir; kullanıcı kendisi "(siz)" etiketiyle işaretlenir.
- **Katılımcı rol rozeti** — Attendee dışındaki roller için lokalize edilmiş (meetings.role.*) accent rozet gösterilir.
- **Katılımcı durum göstergeleri** — El kaldırma, kamera açık ve spotlight (PushPin) durumları satırda erişilebilir etiketli ikonlarla gösterilir.
- **Katılımcı mikrofon aç/kapa** — Her satırdaki mikrofon butonu `toggleParticipantMute` ile sustur/aç; durum Microphone/MicrophoneSlash + aria-label ile yansır.
- **Host moderasyon menüsü** — Host/cohost ise ve katılımcı kendisi değilse DotsThree menüsü (Radix dropdown) açılır; spotlight, el indirme, cohost yapma ve çıkarma aksiyonlarını sunar.
- **Spotlight aç/kapa** — Menüden `toggleSpotlight` ile katılımcı sahnelenir; spotlightId'ye göre Spotlight/Unspotlight etiketi değişir.
- **El indirme (host)** — Katılımcı el kaldırmışsa menüden `toggleParticipantHand` ile elini indirme aksiyonu.
- **Cohost yapma** — Attendee için `makeCoHost` ile cohost yetkisi (Crown ikonu).
- **Katılımcıyı çıkarma** — `removeParticipant` ile katılımcı atılır (danger renkli aksiyon).
- **Toplantı sohbeti listesi** — Sohbet sekmesinde mesajlar yazar adı, göreli zaman (relTime) ve gövde ile listelenir.
- **Sohbet mesajı yazma alanı** — Otomatik yükseklikli (rows=1) textarea, gizli label ile erişilebilir; Gönder IconButton metin boşsa devre dışı (PaperPlaneRight ikonu).
- **Enter ile gönderme kısayolu** — Enter (Shift'siz) gönderir, Shift+Enter satır atlar; submitChat boş metni engeller.
- **Altyazı aç/kapa** — captionsOn'a göre değişen birincil/ikincil butonla `toggleCaptions` canlı altyazıyı açar/kapatır.
- **Altyazı dili seçimi (EN/TR)** — Segmentli kontrol ile captionLang en/tr arasında `setCaptionLang` ile değiştirilir; aktif dil aria-pressed ve renkle gösterilir.
- **Canlı altyazı akışı (panel)** — captions konuşmacı+metin olarak gösterilir; boşsa boş durum metni, doluysa yeni satır geldikçe `scrollIntoView({block:'end'})` ile otomatik en alta kaydırılır; konteyner aria-live="polite".

### Engage (Etkileşim) paneli — Anket / Q&A / Recap

- **Engage yan paneli** — Sağda 320px sabit panel; yalnızca sidePanel "engage" iken render edilir, başlık ve kapatma (X) içerir.
- **Host/cohost yetki tespiti** — Katılımcılar içinden isSelf bulunup rolü host/cohost ise anket oluşturma/kapatma ve soru cevaplama yetkileri açılır.
- **Mevcut kullanıcı kimliği (me)** — Auth store'dan principal.id alınır (yoksa "usr_1"); oylama, soru sorma ve upvote'ta kullanıcı kimliği olarak kullanılır.
- **Canlı anket görüntüleme ve oylama** — Aktif anket varsa soru+seçenekler listelenir; seçeneğe tıklayınca `votePoll` ile oy verilir, kendi oyu Check ikonu ve accent kenarlıkla işaretlenir (aria-pressed); anket kapalıysa butonlar devre dışı.
- **Anket sonuç yüzdesi ve bar** — Her seçenek için toplam oya göre yüzde hesaplanır, arka planda dolgu barı çizilir; toplam oy sayısı altta gösterilir.
- **Anket oluşturma formu (host)** — Aktif anket yokken ve host ise soru + en az iki seçenekle anket oluşturma formu sunulur; `launchPoll` ile başlatılıp form temizlenir.
- **Anket seçeneği ekleme** — "Seçenek ekle" butonuyla dinamik olarak yeni boş seçenek alanı eklenir (pollOpts).
- **Anket başlatma doğrulaması** — Başlat butonu soru boşsa veya dolu seçenek 2'den azsa devre dışı kalır.
- **Anket kapatma (host)** — Host ve anket açıkken "Kapat" butonu `closeMeetingPoll` ile anketi kapatır.
- **Anket boş durumu** — Aktif anket yoksa ve kullanıcı host değilse "anket yok" mesajı gösterilir.
- **Q&A soru sorma** — Metin girişiyle soru `askQuestion` ile gönderilir (Enter veya PaperPlaneRight ikonu); boş soru engellenir, gönderimden sonra alan temizlenir.
- **Q&A upvote'a göre sıralama** — Sorular upvote sayısına göre azalan sıralanır; en çok oylanan en üstte.
- **Soru upvote'lama** — Her soru `upvoteQuestion` ile beğenilir; kendi beğenisi accent renk ve dolu ArrowFatUp ikonuyla işaretlenir (aria-pressed), upvote sayısı gösterilir.
- **Soruyu cevaplandı işaretleme (host)** — Host "Cevapla" ile `answerQuestion` çağırır; cevaplananlar "Cevaplandı" etiketi ve %60 opaklıkla soluklaştırılır.
- **Soru yazarı gösterimi** — Her soruda `memberName(authorId)` ile yazar adı çözümlenir.
- **Recap (özet) bölümü** — "Özeti gör" butonu RecordingSummaryDialog'u açar (recapOpen state).
- **Intelligence panelini açma** — "Intelligence aç" butonu `useOpenIntelligence` ile "src_standup" kaynağını açarak entegre zeka/analiz görünümüne yönlendirir.

### Host kontrolleri (HostPanel) & granüler moderasyon (MeetGmPanel)

- **Host kontrolleri yan paneli** — Host'a özel sağda açılan panel; sidePanel "host" değilse render edilmez, başlık + X kapatma (`setSidePanel('none')`) içerir. İçinde MeetParityPanel, MeetGmPanel ve FacilitatorPanel gömülü render edilir.
- **SettingRow toggle satırı** — Etiket, ikon ve Açık/Kapalı durumu gösteren, aria-pressed'li yeniden kullanılabilir toggle (açıkken accent).
- **Toplantı kilitleme (Lock Meeting)** — `toggleLock` ile locked state'i; kilitliyken Lock, açıkken LockOpen ikonu, yeni katılımları engeller.
- **Bekleme odası (Waiting Room)** — `toggleWaitingRoom` ile waitingRoom; açıkken katılımcılar lobide host onayı bekler.
- **Katılımcı ekran paylaşımına izin** — `toggleAttendeeShare` ile allowAttendeeShare (Monitor ikonu).
- **Katılımcı sohbetine izin** — `toggleAttendeeChat` ile allowAttendeeChat (ChatCircle ikonu).
- **Tümünü sustur (Mute All)** — `muteAll()` kendisi hariç tüm mikrofonları kapatır, nötr tonlu toast gösterir.
- **Tüm elleri indir** — `lowerAllHands()` kaldırılmış tüm elleri indirir (HandPalm ikonlu ikincil buton).
- **Herkes için bitir (Tehlike bölgesi)** — `endForAll()` toplantıyı herkes için sonlandırır (katılımcı listesi + spotlight temizlenir, idle'a döner); danger varyantlı buton, kırmızı başlıklı bölüm, danger tonlu toast.
- **Granüler moderasyon bölümü** — MeetGmPanel'de gelişmiş moderasyon ayarlarını gruplayan başlıklı bölüm (meetings.gm.title).
- **Ses kilidi (Audio Lock)** — `toggleAudioLock` ile audioLock; katılımcıların kendi sesini açmasını engeller (MicrophoneSlash ikonu).
- **Video kilidi (Video Lock)** — `toggleVideoLock` ile videoLock; tüm kameraları zorla kapalı tutar (VideoCameraSlash ikonu).
- **Onay gerektir (Require Consent)** — `toggleRequireConsent` ile requireConsent; kayıt/not alma öncesi katılımcı onayını zorunlu kılar (ShieldCheck ikonu).
- **Erişim katmanı seçimi (Access Tier)** — open/trusted/restricted dropdown'u `setAccessTier` ile accessTier (varsayılan trusted) ayarlar.
- **Erişim katmanı kabul kararı (accessTierDecision)** — Gelen katılımcı için katmana göre admit/knock/deny: open herkesi alır, trusted davetli veya güvenilir alan adındaysa alır yoksa kapı çalar, restricted yalnız davetlileri alır.
- **Katılımcı başına kontrol listesi** — Kendisi hariç katılımcılar (others) listelenir; her satırda isim (truncate), rol rozeti ve aksiyon butonları; liste boşsa render edilmez.
- **Katılımcı sabitleme (Pin)** — `togglePin(id)` ile sabitler/kaldırır; pinnedIds'e göre aria-pressed ve dolu/boş PushPin ikonu, accent renk.
- **İzleyici yapma (Make Viewer)** — `makeViewer(id)` katılımcıyı yalnızca-izleme rolüne çevirir (mic/cam kapatılır, "Everyone is a viewer"); viewer için nötr rozet, Eye ikonu.
- **Bekleme odasına gönderme** — `sendToWaitingRoom(id)` aktif katılımcıyı toplantıdan çıkarıp lobi kuyruğuna geri taşır (UserMinus ikonu).
- **Sabitlenen katılımcı sayacı** — pinnedIds.length değerini interpolasyonla gösteren bilgi metni (meetings.gm.pinned).
- **Anotasyon/işaretleme toggle** — `toggleAnnotate` ile annotateOn; paylaşılan içerik üzerine yerel ek açıklama çizimi açar (PencilSimple ikonu).
- **Uzaktan kontrol akışı (Remote Control)** — Üç durumlu akış: talep yoksa `requestRemoteControl`, controllerId varsa `stopRemoteControl`, aksi halde `grantRemoteControl`; aktifken pozitif rozet. (request'te self id, grant'ta ilk other kullanılır.)
- **Benim için Not Al (AI Take Notes)** — Sparkle ikonlu; `generateNotes` ile altyazılardan not üretir, summary/decisions/nextSteps bölümleri checkbox ile seçilir (`toggleNoteSection`).
- **Not alıcıları seçimi (Recipients)** — all/inorg/hosts dropdown'u `setNotesRecipients` ile notesRecipients (varsayılan inorg) belirler.
- **Üretilen toplantı notları görüntüleme** — meetingNotes varsa seçili bölümlere göre özet, kararlar (; ile birleşik) ve sonraki adımlar gösterilir (model: summary:string, decisions:string[], nextSteps:string[]).
- **Konuşma çevirisi / sesli dublaj (Speech Translation)** — `toggleSpeechTranslation` açar; açıkken `setSpeechPair` ile kaynak→hedef dil çifti (varsayılan en→tr) seçilir.
- **Dil çifti seçici** — en/tr/es/fr/de/pt/it (LANGS) büyük harf etiketli iki dropdown; speechFrom/speechTo state'leri, erişilebilir aria-label'lar.
- **Gönderim/alım çözünürlüğü ayarı** — auto/fhd/hd/sd/audio dropdown'ları `setSendResolution`/`setReceiveResolution` ile gönderme ve alma için ayrı kalite tavanı belirler.
- **Bant genişliği politikası (Bandwidth Policy)** — auto/limited/audio dropdown'u `setBandwidthPolicy` ile bandwidthPolicy ayarlar.
- **Veri tasarrufu modu (Data Saver)** — `toggleDataSaver` ile dataSaver (GearSix ikonu).
- **Kalite/bant genişliği bölümü** — GearSix ikonlu başlıkla çözünürlük ve bant genişliği ayarlarını gruplar (meetings.gm.quality).

### Meet/Zoom/Webex parite paneli (MeetParityPanel) & efektler

- **Google Meet parite paneli** — Companion mod, gürültü engelleme, breakout zamanlayıcı, katılım, yakalama efektleri ve arşiv arama bölümlerini içeren panel.
- **Companion (ikinci cihaz) modu** — `toggleCompanion` ile companionMode; ikinci bir cihazdan toplantıya eşlik (Google Meet tarzı companion join).
- **Gürültü engelleme (Noise Cancellation)** — `toggleNoiseCancellation` ile noiseCancellation; mikrofon ortam gürültüsünü bastırır.
- **Breakout otomatik dönüş zamanlayıcısı** — Breakout odalarından ana toplantıya otomatik dönüş geri sayımı; Başlat (5 dk) ve Temizle aksiyonları, kalan saniye aria-live ile canlı, süre dolunca "bitti" bilgisi. `startBreakoutTimer`/`clearBreakoutTimer` dakika bazlı epoch hedefi kurar/temizler.
- **Breakout geri sayım hesaplama (breakoutCountdown)** — Hedef epoch ile şimdiyi karşılaştırıp kalan saniye (negatife düşmez) ve süre dolup dolmadığını döndüren saf fonksiyon (Countdown: remainingSec, expired).
- **Saniyelik canlı zamanlayıcı tiki** — breakoutEndsAt ayarlıyken her saniye "now" state'ini güncelleyen setInterval; unmount/değişimde temizlenir.
- **Katılım raporu (Attendance)** — Davetli ile fiilen katılanları karşılaştırarak mevcut/davetli sayısı ve yüzdelik katılım oranı; katılımcılar + lobi kuyruğu birleştirilerek davetli listesi oluşturulur.
- **Katılım raporu hesaplama (attendanceReport)** — Davetli ve mevcut id listelerinden invited, present, noShow ve rate (0..1) üreten saf fonksiyon (Attendance modeli); toplantı sonrası analitik için.
- **Yakalama & kalite efektleri (Capture FX)** — 14 kamera/ses/güvenlik efektini ikonlu toggle'lar halinde sunar; her efekt ilgili boolean state ve `toggleMeetFx(key)` aksiyonunu kullanır.
- **MeetFx efekt seti (14 efekt) ve generic toggle** — portraitTouchUp, studioLook, adaptiveAudio, liveSharing, watermark, focusMode, avatars, deepfakeDetection, pushToTalk, gestureRecognition, immersiveShare, musicMode, aiFraming, nameLabels efektlerini kapsayan tipli birleşim; tümü tek bir generic `toggleMeetFx` üzerinden açılıp kapatılır.
- **Meet parite efektleri** — Portrait Touch-Up, Studio Look, Adaptive Audio (hibrit oda laptop birleştirme), Live Sharing (senkron co-watch) ve Watermark ayrı ayrı açılıp kapatılabilir.
- **Zoom parite efektleri** — Focus Mode (katılımcıların birbirinin videosunu görmemesi), Avatars (kamera yerine 3D avatar), Deepfake Detection (sentetik yüz/ses işaretleme), Push-to-Talk (bas-konuş).
- **Webex parite efektleri** — Gesture Recognition (el hareketi algılama), Immersive Share (sunucu videosunun içeriğe bindirilmesi), Music Mode (hi-fi ses), AI Framing (otomatik çerçeveleme), Name Labels (yüz üstü isim etiketleri).
- **Filigran (watermark) etiketi gösterimi** — Watermark açıkken kullanıcı adı, toplantı id ve kayıt süresini içeren kişiye özel anti-leak filigran aria-live bölgede gösterilir.
- **Filigran etiketi üretimi (watermarkLabel)** — Kullanıcı adı, toplantı id ve saniyeyi "ad · id · mm:ss" biçiminde birleştirip kişiye özel anti-leak filigran metni üreten saf fonksiyon.
- **Aranabilir toplantı arşivi** — Geçmiş toplantıları (recap + transcript + kayıt bağlı merkezi hub) arama kutusuyla listeler; kayıt/transkript varlığını ikonlarla işaretler, özet satırını gösterir.
- **Arşiv tam metin arama (searchArchive)** — Başlık ve özette büyük/küçük harf duyarsız, boşluk kırpılmış tam metin araması yapan saf fonksiyon; boş sorguda tüm girişleri döndürür, sonuç yoksa boş durum mesajı (MagnifyingGlass ikonu, aria-label).
- **ArchiveEntry modeli ve mock arşiv** — id, title, dateMs, hasRecording, hasTranscript, summary alanlı kayıt tipi ve 3 örnekli MEETING_ARCHIVE mock (Daily Standup, Sales call — Acme, Design sync); Google Meet çıktı dağınıklığını gidermeyi hedefler.
- **MeetParityPanel Toggle bileşeni** — Sol ikon, orta etiket ve sağda "Açık/Kapalı" durumu gösteren, aria-pressed'li, hover vurgulu yeniden kullanılabilir aç/kapa düğmesi.

### AI Facilitator paneli (FacilitatorPanel)

- **AI Facilitator (Kolaylaştırıcı) paneli** — Teams paritesi hedefli; zamanlanmış gündem, zaman takibi ve aksiyon maddesi çıkarımını tek bölümde toplar.
- **Zamanlı gündem (agenda)** — Sabit üç maddelik gündem (intro 5dk, demo 15dk, qa 10dk) `buildAgenda` ile kurulur; `agendaTotal` toplam süreyi hesaplar, mevcut madde başlığı gösterilir, gündem yoksa boş mesaj.
- **Gündem oluşturma (buildAgenda)** — Gündem maddelerini (başlık + dakika) kümülatif çizelgeye yerleştirir, her maddeye startMin/endMin atar, negatif süreleri 0'a sıkıştırır.
- **Gündem toplam süresi (agendaTotal)** — Tüm maddelerin planlanan toplam süresini dakika cinsinden hesaplar, negatifleri yok sayar.
- **Zaman takibi (timekeeper)** — elapsedMin state'i ile geçen dakika; Minus/Plus butonlarıyla 5'er dakika geri/ileri (geri sarımda 0 alt sınırı), geçen/toplam dakika tabular-nums ve aria-live="polite" ile canlı.
- **Gündem ilerleme takibi (agendaProgress)** — Geçen süreye göre mevcut maddeyi (current/index), aşım süresini (overrunMin) ve bitti mi (done) durumunu hesaplar.
- **Gündem ilerleme ve aşım rozeti** — Tamamlandıysa aşım varsa "warning" tonlu aşım rozeti (overrunMin), yoksa "positive" tonlu "zamanında" rozeti gösterir.
- **Aksiyon maddesi madenciliği (extractActionItems)** — Altyazı satırlarından ipucu kelimelere (action item, todo, follow-up, will, I'll, let's, assign, by Monday/EOD/next week vb.) göre aksiyon maddeleri çıkarır; sahip varsayılan konuşmacıdır. Her madde owner accent rozeti ve metinle listelenir, sayı başlıkta, yoksa boş mesaj.
- **Aksiyon ipucu regex'i (ACTION_CUE)** — Bir satırı taahhüt/aksiyon olarak işaretleyen büyük/küçük harf duyarsız ipucu desenleri (gün adları ve EOD dahil).
- **Toplantı bölümleri (meetingChapters)** — Webex paritesinde transkripti her perChapter (varsayılan 4) satırlık bölümlere ayırır; başlık ilk satırın 48 karaktere kısaltılmış hali, sıralı (numaralı) liste, sayı başlıkta, yoksa boş mesaj.
- **Bölüm başlığı kısaltma** — 48 karakteri aşan başlıklar sonuna … eklenerek kısaltılır; bölüm başına satır sayısı (lineCount) tutulur.
- **Altyazı verisinden besleme** — Panel store captions'ı dinler; her satır speaker+text olarak haritalanıp aksiyon maddesi ve bölüm çıkarımına girdi olur.
- **Backend paritesi tasarımı** — Facilitator mantığı saf/framework'süz yazılmıştır; aynı gündem/aksiyon/bölüm hesaplama mantığı backend tarafında da çalıştırılabilir.

### Diyaloglar (BreakoutManager, CreateRoomDialog, RecordingSummaryDialog)

- **Breakout oda yöneticisi modalı** — open/onOpenChange ile kontrol edilen Modal'da breakout odalarını yönetir; başlık meetings.breakouts, ipucu meetings.breakoutsHint.
- **Breakout oda oluşturma (2/3/4)** — Kullanıcı 2/3/4 oda seçeneğiyle `createBreakouts(n)` çağırır (her biri secondary buton); self hariç katılımcılar round-robin dağıtılır.
- **Breakout odalarını kapatma** — En az bir oda varken ghost varyantlı "Odaları kapat" butonu `closeBreakouts` ile tüm odaları kapatır.
- **Breakout oda listesi ve katılımcı gösterimi** — Her oda adı (b.name) ve katılımcılarıyla liste öğesi olarak gösterilir; katılımcı yoksa "—". participantIds id'leri `memberName(id)` ile isme çevrilip virgülle birleştirilir.
- **Breakout veri modeli** — Breakout: id, name, participantIds (kimlik dizisi).
- **Kalıcı video oda oluşturma dialog'u (CreateRoomDialog)** — Moderatör tarafından oluşturulan Jitsi tarzı kalıcı oda dialog'u; oda oluşturma formu sunar, `createRoom` çağırır.
- **Oda adı girişi** — Metin input'u (placeholder roomNamePh); boş/whitespace ad ile gönderim engellenir (name.trim()).
- **Oda kilidi (locked) toggle** — Kilitli olup olmadığını belirleyen toggle; açıkken accent, kapalıyken muted (varsayılan kapalı).
- **Bekleme odası (waiting room) toggle** — Bekleme odası özelliğini açıp kapatan toggle (varsayılan açık), açıkken accent.
- **Oda parolası girişi** — Opsiyonel parola input'u (placeholder roomPasswordPh); boşsa undefined gönderilir.
- **createRoom store aksiyonu** — Oda adı ve { locked, waitingRoom, password } seçenekleriyle yeni oda yaratır; gönderimden sonra form sıfırlanır (name/password boş, locked false, waitingRoom true) ve dialog kapanır.
- **Form gönder/iptal aksiyonları** — Oluştur butonu boş adda disabled, submit ile oda oluşturur; İptal (ghost) butonu ve onOpenChange(false) dialog'u kapatır.
- **CreateRoomDialog Toggle yardımcısı** — on/set/label prop'lu, aria-pressed'li, açık/kapalı durumuna göre accent/muted stilli yerel Toggle.
- **Yerel form state yönetimi (oda dialog)** — React.useState ile name/locked/waitingRoom/password tutulur (store'dan bağımsız geçici form state).
- **Kayıt Özeti Dialogu (RecordingSummaryDialog)** — Kayıt sonrası açılan, AI özeti, eylem maddeleri ve transkripti tek ekranda gösteren denetimli (open/onOpenChange) Modal (Teams/Zoom/Meet tarzı kayıt sonrası artefakt).
- **AI Özeti bölümü** — Sparkle ikonuyla vurgulanmış başlık altında AI üretimi özet metni.
- **Eylem maddeleri listesi** — Madde işaretli 3 eylem maddesi (recapAction1-3).
- **Transkript görünümü** — CAPTION_SCRIPT'i konuşmacı adı + İngilizce metin olarak satır satır listeler; speakerId `memberName` ile isme çevrilir.
- **Transkript/özet indirme** — İndir butonu CAPTION_SCRIPT'i "konuşmacı: metin" formatında düz metne (meeting-recap.txt) çevirip `downloadText` ile indirir.
- **İndirme onay bildirimi (toast)** — İndirme sonrası useToastStore ile pozitif tonlu toast (recapDownloaded).
- **Kaydırılabilir içerik alanı** — Dialog içeriği max yükseklik (70vh) ile sınırlanır, taşmada dikey kaydırma yapılır.

### Beyaz tahta (Whiteboard)

- **Serbest çizim beyaz tahtası** — Pointer (fare/dokunma/kalem) ile SVG polyline serbest çizim yapılan, sahnenin üstünde tam ekran açılan hafif işbirlikçi katman.
- **Renk paleti seçimi** — 5 önceden tanımlı renkten (siyah, kırmızı, mavi, yeşil, turuncu) kalem rengi seçilir; seçili renk çerçeve ve aria-pressed ile işaretlenir.
- **Tahtayı temizle** — Çöp ikonlu "Temizle" butonu tüm strokes dizisini boşaltır.
- **Beyaz tahtayı kapatma** — X butonu store'daki `toggleWhiteboard` ile katmanı kapatır.
- **Pointer tabanlı çizim etkileşimi** — onPointerDown yeni stroke başlatır, onPointerMove son stroke'a nokta ekler, onPointerUp/Leave bitirir; koordinatlar SVG sınırına göre hesaplanır, touch-none ile dokunma kaydırması engellenir.
- **Stroke veri modeli (yerel state)** — Çizimler useState ile {points, color}[] olarak tutulur, çizim durumu useRef ile yönetilir; store'a yazılmaz, bileşen yerel.
- **Beyaz tahta store entegrasyonu** — useMeetingStore'dan yalnızca `toggleWhiteboard` seçilir (kapatma için); çizim verisi store'a yazılmaz.

### Toplantı içi yetenekler & store aksiyonları

- **Sohbet kanalından toplantı başlatma (startFromChannel)** — Mesajlaşma kanalı/konusu ile köprü kurarak (2↔3 bridge) o kanala bağlı toplantı başlatır; linkedChannelId/linkedTopicId tutulur.
- **Mesajlaşma köprüsü bağı (linkedChannelId/linkedTopicId)** — Toplantı bir sohbetten başlatıldığında bağlı kanal/konu kimliği state'te tutulur, ayrılma/bitirmede temizlenir.
- **Meeting↔Kanal sohbet köprüsü** — Toplantı bir kanaldan başlatıldıysa sohbet o kanalın konuşmasına çift yönlü bağlanır; chatItems linkedTopicId varsa bridgedChat'ten, yoksa store.chat'ten gelir.
- **Bağlı kanalda mesaj gönderme** — Bağlı topic varsa mesaj `postToLinkedChannel` ile kanala, yoksa `sendChat` ile yerel toplantı sohbetine gönderilir.
- **Tam sohbeti açma kısayolu** — Bağlı kanal varsa "Tam sohbeti aç" butonu `openLinkedChat` ile kanal sohbetini ana arayüzde açar.
- **Toplantıya katılma (join)** — Mic/cam durumuyla katılımcıları yükler, aktif konuşmacıyı ayarlar, bekleme odası açıksa lobi kuyruğunu doldurur, sohbet/Q&A seed'ini yükler ve toplantı içi state'i sıfırlar.
- **Toplantıdan ayrılma (leave)** — Toplantıyı sonlandırıp idle'a döner; altyazı, companion, gürültü engelleme ve tüm görüntü/ses efektlerini sıfırlar.
- **Yerel mikrofon/kamera/el kontrolü** — `toggleMic`/`toggleCam`/`toggleHand` kendi mic/cam/el durumunu açıp kapatır ve self katılımcı kaydına yansır.
- **Ekran paylaşımı (toggleScreen)** — Ekran paylaşımını başlatır/durdurur; başlarken düzeni otomatik "speaker" moduna geçirir.
- **AI Companion (toggleAiCompanion)** — Toplantı AI asistanını açıp kapatır (varsayılan açık).
- **Lobi kuyruğu yönetimi (admit/denyLobby)** — Bekleme odasındaki katılımcıları (id+ad) host kabul edebilir (admit, attendee olarak ekler) veya reddedebilir (LobbyEntry modeli).
- **Katılımcı el kaldırma/sustur toggle (host)** — `toggleParticipantHand` ve `toggleParticipantMute` ile host belirli bir katılımcının el durumunu ve mikrofonunu değiştirir.
- **Çoklu sabitleme / pin (togglePin, MAX_PINS=6)** — Birden fazla katılımcıyı (6'ya kadar) görünümde sabitler; `togglePinList` yardımcısı listeyi yönetir, aynı id tekrar gönderilince kaldırır, liste doluyken yeni ekleme yapılmaz. MAX_PINS sabitleme UI kapasitesini belirler.
- **Ses kilidi bazlı susturma kaldırma yetkisi (effectiveCanUnmute)** — Host/cohost kilidi atlar, viewer asla konuşamaz, diğer roller ses kilidine tabidir.
- **Video kilidi bazlı kamera açma yetkisi (effectiveCanCam)** — Host/cohost daima kamerayı açabilir, viewer hiç açamaz, diğerleri video kilidine tabidir.
- **Çözünürlük profili / bitrate eşlemesi (resolutionProfile)** — Çözünürlük seviyesini (fhd/hd/sd/audio/auto) etikete ve yaklaşık uplink bitrate'ine eşler: 1080p 3200, 720p 1800, 360p 600, audio 0, auto 2000 kbps.
- **AI toplantı notları üretimi (buildMeetingNotes / generateNotes)** — Canlı altyazılardan deterministik yapılandırılmış not üretir: özet (ilk iki altyazı), kararlar, sonraki adımlar; karar/aksiyon ipuçlarını metinden ayrıştırır.
- **Karar ve sonraki adım ipucu sözlükleri (DECISION_CUES/NEXTSTEP_CUES)** — Notları kategorize etmek için çok dilli (TR/EN) anahtar kelime listeleri; karar (decid, agree, karar, onayla...) ve sonraki adım (next, action, takip, yapılacak...).
- **Konuşma çevirisi / seslendirme (toggleSpeechTranslation / setSpeechPair)** — Canlı ses dublajını açar; kaynak→hedef dil çifti (speechFrom/speechTo, varsayılan en→tr) ayarlanır.
- **Toplantı içi anket (MeetingPoll)** — Host soru + seçeneklerle anket başlatır (`launchPoll`, boş seçenekleri filtreler), kullanıcılar tek seçimle oy verir (`votePoll`, diğer oylar kaldırılır), host kapatır (`closeMeetingPoll`).
- **Soru-Cevap / Q&A (QnaItem)** — Katılımcılar soru sorar (`askQuestion`, 100 ile sınırlı), upvote'lanır (`upvoteQuestion`, toggle), host yanıtlandı işaretler (`answerQuestion`); QNA_SEED ile başlatılır.
- **Floating reaksiyonlar (sendReaction)** — Emoji reaksiyonu gönderir; 2.5 sn sonra otomatik kaybolur, en fazla 50 tutulur (hazır set MEETING_REACTIONS).
- **Toplantı içi sohbet (sendChat)** — Metin mesajı gönderir; MEETING_CHAT_SEED ile başlatılır, en fazla 200 mesaj tutulur.
- **Düzen seçimi: grid/speaker (setLayout)** — Görünümü ızgara/konuşmacı arasında değiştirir; ekran paylaşımı otomatik speaker'a geçer.
- **Yan panel sekmeleri (setSidePanel)** — none/participants/chat/captions/host/engage arasında sekme değiştirir.
- **Kayıt (toggleRecording + tickRecord)** — Kaydı başlatır/durdurur; recordSec her saniye tickRecord ile artar (simülasyon).
- **Canlı altyazılar (toggleCaptions + pushCaption)** — Altyazıları açar/kapatır; CAPTION_SCRIPT'ten konuşmacı adıyla satır üretilir, son 30 satır tutulur.
- **Altyazı dili (setCaptionLang)** — Altyazı dilini en/tr arasında değiştirir; pushCaption seçilen dile göre metin üretir.
- **Breakout otomatik dönüş sayacı (startBreakoutTimer/clearBreakoutTimer)** — Breakout odalarından ana toplantıya otomatik dönüş için dakika bazlı geri sayım hedefi (epoch ms) kurar/temizler.

### Veri & state modelleri

- **Toplantı fazı modeli (MeetingPhase)** — idle/prejoin/in faz tipi; UI akışını yönlendirir.
- **Kalıcı video odaları (VideoRoom / ROOMS)** — Jitsi tarzı moderatör odaları: ad, oluşturan, kilit, bekleme odası, şifre, katılımcı sayısı. `createRoom`/`deleteRoom`/`joinRoom` ile yönetilir; joinRoom seçilen odanın kilit/bekleme ayarını devralarak prejoin'e geçer; Landing'de kilit ikonu, katılımcı sayısı, bekleme odası etiketi gösterilir; ConfirmDialog ile silme onayı (confirmRoomId state) ve oda adıyla kişiselleştirilmiş onay metni.
- **Katılımcı veri modeli (Participant / ConnectionQuality)** — id, ad, rol, mic/cam/el durumu, isSelf, ekran paylaşımı ve bağlantı kalitesi (good/fair/poor); karoların görsel durumunu belirler.
- **Katılımcı rol modeli (ParticipantRole)** — host/cohost/attendee/viewer rolleri ile yetki ayrımı; self katılımcı (Ismail K.) host işaretli, moderasyon aksiyonlarının hedefini belirler.
- **Kendisi/diğerleri ayrımı (isSelf)** — participants, isSelf bayrağına göre self ve others olarak ayrıştırılır; remote control isteğinde self id, grant'ta ilk other kullanılır.
- **Toplantı özeti modeli (MeetingSummary / MEETINGS)** — Liste için id, başlık, host, başlamaya kalan dakika (startsInMin), katılımcı id'leri (participantIds) ve canlı (live) bayrağı; Standup canlı, diğerleri 15 ve 60 dk sonra.
- **Aktif oda katılımcıları (ROOM_PARTICIPANTS)** — Canlı odadaki katılımcılar: ad, rol, mic/cam, el kaldırma, isSelf ve bağlantı kalitesi (örn. Marco Rossi el kalkık, Tom Becker zayıf bağlantıda).
- **Lobi tohum verisi (LOBBY_SEED / LobbyEntry)** — Lobide bekleyen kişi (Sara Lindqvist); host'un admit akışı için tohum (id+ad).
- **Çift dilli altyazı/transkript (CAPTION_SCRIPT / CaptionLine)** — Altyazılar açıkken döngüsel oynatılan simüle canlı transkript; her satırda konuşmacı kimliği ve İngilizce (en) + Türkçe (tr) metin.
- **Toplantı sohbeti tohumu (MEETING_CHAT_SEED / MeetingChat)** — Yazar kimliği, emoji destekli gövde ve kaç dakika önce gönderildiği (tMin).
- **Q&A tohumu (QNA_SEED / QnaItem)** — Yazar, soru metni, oy veren kullanıcı listesi (upvotes) ve yanıtlandı (answered) durumu.
- **Anket modeli (MeetingPoll)** — Toplantı içi anket sorusu, seçenekleri ve oyları.
- **Toplantı notları modeli (MeetingNotes)** — summary, decisions[], nextSteps[] alanları; not bölümleri seçimi ve alıcı tipiyle ilişkili.
- **Floating reaksiyon modeli (FloatingReaction / MEETING_REACTIONS)** — Yüzen emoji reaksiyon kaydı ve hazır emoji seti.
- **Breakout modeli (Breakout)** — id, name, participantIds.
- **Erişim/kalite/alıcı tipleri** — AccessTier (open/trusted/restricted), BandwidthPolicy (auto/limited/audio), ResolutionLevel (auto/fhd/hd/sd/audio), NotesRecipients (all/inorg/hosts), RemoteControl, Caption/CaptionLang, MeetingLayout, SidePanelTab (none/participants/chat/captions/host/engage), MeetFx tipleri ../types'tan import edilir.
- **Mock/seed veri kaynakları** — MEETINGS, ROOMS, ROOM_PARTICIPANTS, LOBBY_SEED, MEETING_CHAT_SEED, QNA_SEED ve CAPTION_SCRIPT ile toplantı/oda/katılımcı/lobi/sohbet/Q&A/altyazı senaryosu mock'lanır.
- **Dizi sınırlama yardımcıları (capArray/slice)** — Sohbet (200), Q&A (100), reaksiyon (50), altyazı (son 30) dizileri performans için sınırlandırılır.
- **UID üretimi** — crypto.randomUUID varsa onunla, yoksa Math.random fallback ile benzersiz kimlik üretilir.
- **Toplantı tipleri import yüzeyi** — data.ts; CaptionLine, MeetingChat, MeetingSummary, Participant ve VideoRoom tiplerini ./types üzerinden tüketerek tip güvenli mock veri yüzeyi sağlar.


---

<a id="telephony"></a>

## Telephony sekmesi

Telephony sekmesi, kurumsal bir UCaaS (Unified Communications) modülüdür: tuş takımından çağrı kuyruklarına, AI resepsiyonistten süpervizör izlemeye kadar tüm telefon iş akışlarını tek bir 10 sekmeli kabuk altında toplar. Carrier-agnostik mock API + WebSocket olay sözleşmesi üzerine kuruludur; tüm durum Zustand store'larıyla yönetilir ve gerçek SIP/REST/WS backend'ine UI değişmeden geçilebilecek şekilde tasarlanmıştır (Zoom/Webex/Teams paritesi hedeflenir).

### Modül kabuğu & navigasyon

- **Telefon/UCaaS ana düzeni (PhoneLayout)** — `nav.telephony` başlığı ve `phone.subtitle` alt başlığıyla max-w-6xl ortalanmış üst seviye kabuk; aktif sekmeye göre ilgili paneli render eder.
- **10 sekmeli sekme şeridi** — Tek tablist içinde keypad, directory, voicemail, messages, reception, queues, attendant, ivr, routing, analytics sekmeleri; her birinin kendi Phosphor ikonu (SquaresFour, AddressBook, Voicemail, ChatCircle, Robot, UsersThree, Headset, TreeStructure, GitBranch, ChartBar) ve `phone.tabs.<id>` etiketi vardır.
- **İkonlu sekme butonları** — Aktif sekme accent renk ve alt çizgiyle vurgulanır; ikonlar `aria-hidden` ile dekoratif işaretlenir.
- **Sekme klavye navigasyonu** — `useTabKeys` hook'u ile ok tuşlarıyla gezinme; roving tabindex (aktif sekme tabIndex=0, diğerleri -1).
- **URL üzerinden derin bağlantı (deep-link)** — `useUrlSelection` ile aktif sekme `?tab=` sorgu parametresine yazılır; paylaşılabilir, yenilemeye dayanıklı ve geçerli sekme id doğrulamalıdır.
- **Erişilebilir sekme yapısı (ARIA)** — `role=tablist/tab`, `aria-label`, `aria-selected` ve focus-visible ring ile WAI-ARIA uyumu.
- **İzin tabanlı erişim kontrolü** — `useAuthStore.can('telephony.view')` ile yetki yoksa modül yerine Forbidden bileşeni gösterilir.
- **Sekme-panel eşleştirmesi (koşullu render)** — Aktif tab'a göre Directory, VoicemailInbox, MessagesPane, ReceptionistBuilder, CallQueuePanel, AttendantConsole, IVRBuilder, RoutingRuleBuilder, CallAnalytics bileşenleri render edilir; keypad sekmesi lg ekranlarda Dialer + CallHistory ikili grid düzenidir.
- **i18n çoklu dil desteği** — react-i18next ile tüm başlık, sekme ve alt başlık metinleri (`nav.telephony`, `phone.subtitle`, `phone.tabs.*`) çevrilir.

### Ana akışlar — Tuş takımı & rehber

- **Tuş takımı (Dialer) numara giriş alanı** — `inputMode='tel'` ile büyük ortalanmış input; +1 numaralarda canlı ulusal gruplama formatına dönüştürür.
- **12 tuşlu DTMF tuş takımı** — 1-9, *, 0, # için 3 sütunlu ızgara; rakam altında klasik telefon harfleri (ABC, DEF… ve 0 için +) gösterilir.
- **Arama yapma (place) butonu** — Yeşil daire içinde dolu telefon simgesi; boş numarada veya aktif çağrı varken devre dışı, `callStore.place` ile çağrı başlatıp girişi temizler.
- **Geri silme (backspace) butonu** — Son karakteri siler; alan boşken devre dışı.
- **Enter ile arama** — Numara alanında Enter aramayı başlatır.
- **Canlı numara biçimlendirme** — `normalizeNumber` ile E.164'e dönüştürüp `formatNumber` ile `+1 (XXX) XXX-XXXX` okunabilir biçimde gösterir.
- **Aktif çağrı koruması** — Çağrı sürerken yeni arama başlatma engellenir (buton disabled).
- **Rehber (Directory) arama kutusu** — Büyüteç ikonlu, ad ve numara üzerinde büyük/küçük harf duyarsız canlı arama (`searchContacts`); boş sorguda tüm kişiler döner.
- **Favoriler / hızlı arama çubuğu** — Arama boşken favori kişileri yuvarlak çip butonları olarak gösterir; çipe tıklayınca doğrudan arar, aktif çağrı varken devre dışı.
- **Kişi listesi (ad + numara)** — Sonuçları ad ve biçimli numarayla ayraçlı satırlar halinde listeler; uzun metinler truncate edilir.
- **Favori ekle/çıkar (yıldız) butonu** — `directoryStore.toggleFavorite` ile e164 numarasını favorilere ekler/çıkarır; dolu/boş yıldız ve primary/ghost varyantla durum gösterilir.
- **Kişiden arama başlatma** — Satırdaki telefon butonuyla kişiyi `callStore.place` üzerinden arar; aktif çağrıda devre dışı.

### Ana akışlar — Aktif çağrı kontrolü (ActiveCallBar)

- **Aktif çağrı çubuğu (ActiveCallBar)** — Ekran altında sabit yüzen çağrı kontrol kabuğu; aktif/çalan/beklemede çağrı, park edilmiş çağrı veya bekleyen wrap-up yoksa hiç render edilmez.
- **Gelen çağrı yanıtla/reddet** — Inbound ringing durumunda yeşil yanıtla ve `hangup('declined')` reddet butonları.
- **Otomatik outbound yanıtlama simülasyonu** — Outbound ringing'de 900ms sonra `answer` çağrılarak karşı tarafın açması simüle edilir.
- **Sustur/aç (mute) kontrolü** — `toggleMute` ile mikrofon susturulur; ikon (Microphone/MicrophoneSlash) ve buton varyantı değişir.
- **Beklet/devam ettir (hold/resume)** — Hold ile çağrı bekletilir; hold durumunda ve danışma yokken resume butonu görünür.
- **Bekletme müziği aç/kapa** — Hold durumunda `toggleHoldMusic` ile bekletme müziği açılıp kapatılır; `aria-pressed` ve MusicNotes ikonu ile gösterilir.
- **Kayıt aç/kapa** — `toggleRecording` ile kayıt başlatılır/durdurulur; aktifken buton danger varyantında, ayrıca kırmızı dolu Record ikonlu 'REC' rozeti gösterilir.
- **Çağrı park etme** — `park` aksiyonuyla aktif çağrı park edilir (BookmarkSimple ikonu).
- **Park edilmiş çağrılar şeridi** — Park edilen çağrılar üst şeritte listelenir; tıklayıp `pickup` ile geri alınır, ad CONTACTS'tan çözümlenir.
- **DTMF tuş takımı (çağrı içi)** — Açılır 6 sütunlu DTMF klavyesi (1-9, *, 0, #); her tuş `sendDtmf` ile gönderilir ve dizi 'sent: …' olarak gösterilir.
- **Sıcak transfer (warm transfer) / danışma** — Numara girip `startConsult` ile danışma çağrısı başlatma; transfer alanı yalnızca danışma yokken görünür, geçersiz numarada disable.
- **Çağrıya ekleme (konferans)** — Girilen numarayı `addToCall` ile çağrıya katarak konferans oluşturur; ekleme sonrası panel kapanır.
- **Danışma sürecinde transfer kontrolleri** — Danışılan taraf gösterilirken `completeTransfer`, `mergeConsult` ve `cancelConsult` aksiyonları sunulur.
- **Konferans katılımcı sayısı göstergesi** — `call.participants` varsa '+N onConference' ile ek katılımcı sayısı gösterilir.
- **Süpervizör çağrı izleme modları** — `admin.access` yetkili kullanıcıya listen/whisper/barge/takeover modları sunulur (gelen çalan çağrı hariç); `setMonitor`/`stopMonitor`, aktif mod `aria-pressed` ile işaretlenir.
- **İzleme ses yönü göstergesi** — `monitorAudio(monitor)` ile ajanın/müşterinin süpervizörü duyup duymadığı (agentHears/agentSilent, customerHears) `aria-live` ile canlı gösterilir.
- **Yetki bazlı süpervizör görünümü** — İzleme modlarının görünürlüğü `useAuthStore.can('admin.access')` ile belirlenir.
- **Çağrı durumu ve süre göstergesi** — CallStateChip ile durum, aktif çağrıda `fmtDuration` ile tabular-nums saniye bazlı süre gösterilir.
- **Arayan adı ve numara çözümleme** — Yöne göre uzak taraf (outbound→to, inbound→from) belirlenir; `callerName` ile ad, `formatNumber` ile numara, farklıysa iki ayrı satırda gösterilir.
- **Arayan sınıflandırma (spam/blocked) uyarısı** — `classifyCaller` spam/blocked tespit ederse ShieldWarning ikonlu danger rozeti gösterilir (CONTACTS + blocklist).
- **AI Koç (Intelligence) açma** — `aiCoach` butonu `openIntel('src_sales')` ile satış kaynaklı AI koçluk panelini açar; küçük ekranlarda gizlenir.
- **Çağrıyı sonlandırma (hangup)** — `hangup()` ile çağrı kapatılır; reddetmede `hangup('declined')` çağrılır.
- **Saniyelik süre sayacı (tick)** — Çağrı aktifken her saniye `useCallStore.tick()` ile süre ilerletilir; aktif değilken interval temizlenir.
- **Erişilebilirlik (a11y)** — `role=region`, `aria-label`, `aria-live=polite`, `aria-pressed`, etiketli IconButton ve DTMF tuşlarıyla erişilebilirlik sağlanır.

### Ana akışlar — Çağrı sonrası (WrapUpCard)

- **Çağrı sonrası kapanış kartı (WrapUpCard)** — Çağrı bittikten sonra görünen, shadow-xl ile öne çıkan, clipboard ikonlu ve karşı taraf adlı disposition kartı; bekleyen wrap-up yoksa render edilmez.
- **Çağrı sonucu (outcome) seçimi** — resolved, follow_up, no_answer, sale, spam değerlerinden i18n etiketli dropdown (varsayılan 'resolved').
- **Çağrı notu girişi** — Serbest metin not; kaydederken trim edilir.
- **Etiket (tags) girişi** — Virgülle ayrılmış etiketler ('vip, renewal' placeholder); bölünür, trim'lenir, boşlar elenip dizi olarak kaydedilir.
- **Dispozisyon kaydetme (saveDisposition)** — Sonuç, not ve etiketleri müşteri profiline senkronize eder, ardından formu sıfırlar.
- **Kapanışı atlama (dismissWrapUp)** — Ghost varyantlı Skip ile kart kaydedilmeden kapatılır.
- **Karşı taraf çözümleme** — `wrap.direction`'a göre to/from numarası `callerName` ile ada çevrilip başlıkta gösterilir.

### Paneller — Çağrı geçmişi (CallHistory)

- **Çağrı geçmişi listesi** — `useCallStore.history`'den kronolojik kart listesi; yön ikonu, kişi adı, zaman, süre, rozetler ve aksiyon butonları.
- **İlk yükleme iskelet ekranı (skeleton)** — `useFirstLoad` ile ilk yüklemede 5 satırlık ListSkeleton.
- **Boş durum mesajı** — Geçmiş boşsa çevrilmiş 'empty' metni.
- **Çağrı yönü ikonu (gelen/giden)** — Inbound PhoneIncoming, outbound PhoneOutgoing; kaçırılan çağrıda danger rengi.
- **Uzak taraf & kişi adı çözümleme (callerName)** — Yöne göre uzak numara CONTACTS ile ada çevrilir; eşleşme yoksa numara gösterilir.
- **Göreli zaman gösterimi (ago)** — 60 dk altında dakika, üstünde saat cinsinden 'n dakika/saat önce' (minimum 1 dakika).
- **Çağrı süresi gösterimi** — `durationSec>0` ise `fmtDuration` ile '· süre' olarak gösterilir.
- **Çağrı sonuç (endReason) rozeti** — `reasonTone` eşlemesiyle completed=positive, missed=danger, declined=warning, voicemail=accent.
- **Spam/engellenmiş rozeti** — Sınıflandırma spam/blocked ise ShieldWarning ikonlu danger rozeti (`phone.caller.<cls>`).
- **Numara engelleme/engel kaldırma aksiyonu** — ProhibitInset butonuyla engelliyse `unblock`, değilse `blockNumber`; etiket ve varyant (primary/ghost) duruma göre değişir.
- **Geri arama (place) aksiyonu** — PhoneCall butonuyla `place(remote)`; aktif çağrı varsa veya numara engelliyse devre dışı.
- **Metin taşma kırpma & a11y** — Kişi adı truncate; IconButton'lara çevrilmiş label, dekoratif ikonlara `aria-hidden`.

### Paneller — Sesli mesaj (VoicemailInbox)

- **Sesli mesaj gelen kutusu (VoicemailInbox)** — Bırakılan sesli mesajları kart liste, başlık ve karşılama seçici barıyla gösterir.
- **Liste başlangıç durumu** — VOICEMAILS mock'undan kopyalanıp yerel state'e yüklenir, mutasyondan korunur.
- **Sesli mesaj çalma (Play)** — Play butonu mesajı çalar, pozitif toast gösterir ve otomatik dinlenmiş (heard) işaretler.
- **Dinlendi işaretleme (markHeard)** — Dinlenmemiş mesajlarda Check ikon-butonu çalmadan dinlenmiş işaretler ve yeni rozetini kaldırır.
- **E-posta ile iletme (forwardEmail)** — Zarf butonuyla mesajı e-postaya iletir, pozitif toast bildirir.
- **Yeni mesaj rozeti** — `heard=false` mesajlarda accent renkli 'yeni' rozeti; dinlendikten sonra kaybolur.
- **Arayan adı çözümleme** — `vm.from` numarası CONTACTS üzerinden `callerName` ile ada çevrilir.
- **Sesli mesaj süresi gösterimi** — `durationSec` `fmtDuration` ile biçimlenir.
- **Sesli mesaj transkripti** — Varsa 'Transkript:' etiketiyle metne dökülmüş içerik gösterilir.
- **Karşılama (greeting) seçici** — GREETINGS listesinden karşılama seçimi (varsayılan ilk), yerel state'te tutulur.
- **Boş durum (EmptyState)** — Liste boşsa voicemail ikonlu 'boş' EmptyState.

### Paneller — Mesajlar / SMS (MessagesPane)

- **SMS/Mesaj konuşma listesi** — Sol panelde tüm thread'leri kişi adıyla listeler; tıklanan aktif olur ve vurgulanır.
- **Okunmamış mesaj rozeti** — `unread>0` accent renkli badge.
- **Aktif konuşma başlığı** — Kişi adı ve E.164 formatlı numara; grup ise katılımcı sayısı ve UsersThree ikonu.
- **Grup konuşma desteği** — `participants` varsa konuşma grup olarak ele alınır; başlıkta üye bilgisi (groupMembers) gösterilir.
- **Mesaj balonu görünümü** — Outbound sağa hizalı accent, inbound sola hizalı surface balonlar.
- **Mesaj eki (media) gösterimi** — Ekler Paperclip ikonu ve dosya adıyla balon içinde listelenir.
- **Mesaj gönderme** — Composer metni `send` ile aktif thread'e gönderilir; boş/whitespace engellenir, sonra taslak temizlenir.
- **Enter ile gönderme** — Composer'da Enter mesajı gönderir.
- **SMS zamanlama (Schedule)** — Saat butonuyla taslak 1 saat sonrasına (`Date.now()+3.600.000`) `scheduleSms` ile zamanlanır; boş taslakta devre dışı.
- **Zamanlanmış mesaj sayacı** — Aktif thread'in zamanlanmış mesajı varsa composer üstünde saat ikonu ve adet (scheduledCount).
- **Hazır yanıtlar (canned responses)** — SMS_CANNED hazır yanıtları pill butonları olarak; tıklanınca taslağa yazılır.
- **Mesaj şablonu uygulama** — SMS_TEMPLATES dropdown'undan seçilen şablon `renderTemplate` ile name/date/quote doldurulup composer'a yerleştirilir.
- **Boş durum gösterimi** — Aktif konuşma yoksa sohbet ikonlu EmptyState.
- **Taslak (draft) state yönetimi** — Composer içeriği yerel state ile yönetilir.

### Paneller — Çağrı kuyrukları (CallQueuePanel)

- **Çağrı kuyrukları paneli (CallQueuePanel)** — PBX kuyruklarını kart listesi olarak; strateji, bekleyen çağrı, ajan durumu ve aksiyonlar tek görünümde.
- **Çalışma saatleri durum şeridi** — Üstte `schedule.name` ile kuyruğun açık/kapalı durumu (`isWithinHours`) rozetle gösterilir.
- **Kuyruk strateji rozeti** — `q.strategy` accent rozetle (`phone.queue.strategy.*`).
- **Tahmini bekleme süresi göstergesi** — `estimatedWaitSec(q)` dakika cinsinden saat ikonuyla.
- **Bekleyen çağrı sayacı** — `q.waiting.length` ile bekleyen adedi.
- **Ajan durum rozetleri (müsaitlik)** — Her ajan yuvarlak nokta göstergesiyle; müsait yeşil, meşgul gri.
- **Ajan yetkinlik (skill) etiketleri** — Ajanın skills dizisi ad yanında virgülle (teknik, satış vb.).
- **Bekleyen çağrı listesi** — Bekleyen çağrılar arayan adıyla telefon ikonlu; boşsa `phone.queue.empty`.
- **Geri arama talebi (callback)** — `requestCallback(queueId, waitId)` ile kuyruğa alınır; talep edilmişse 'callbackQueued' rozeti, değilse tıklanabilir buton.
- **Çağrı simülasyonu (enqueue)** — 'Simulate' butonu sabit +19995550000 ile `enqueue` ile test çağrısı ekler.
- **Sıradaki çağrıyı ata (assignNext)** — Bekleyen ilk çağrıyı uygun ajana atar, pozitif toast; bekleyen yoksa devre dışı.
- **Grup yakalama (group pickup)** — `groupPickup(queueId)` ile çağrıyı kapar; `simulateInbound`+`answer` ile sahiplik verir, pozitif toast.
- **Yetkinliğe göre atama (assignBySkill)** — Seçili skill'e göre `assignNextBySkill`; uygun ajan yoksa 'noAgent' danger toast.
- **Yetkinlik seçim dropdown'u** — Ajanların benzersiz skill'lerinden türetilen, kuyruk bazlı (`skillByQueue`) seçim; skill yoksa gösterilmez.
- **Hunt grupları (avlanma grupları) kartı** — `huntGroups` varsa ayrı kartta; grup adı, ring stratejisi rozeti ve üye müsaitlik göstergeleri.
- **Hunt grubu çaldırma (ringHunt)** — `ringHunt(groupId)` ile gruba zil; ulaşılan üyeyle pozitif, ulaşılamazsa 'noAgent' danger toast.
- **Hunt grubu ring stratejisi rozeti** — `g.ring` neutral rozetle (`phone.hunt.ring.*`).

### Paneller — Resepsiyonist konsolu (AttendantConsole)

- **Resepsiyonist/operatör konsolu (AttendantConsole)** — Headset başlıklı kartta kuyruk KPI'ları, ajan varlığı ve sıradaki çağrı atamasını gösteren tablo.
- **Kuyruk KPI tablosu** — Her kuyruk için bekleyen çağrı sayısı, tahmini bekleme süresi (dk), ajan listesi ve müsait ajan sayısı.
- **Tahmini bekleme süresi hesabı** — `estimatedWaitSec(q)` saniyeden dakikaya yuvarlanır, Clock ikonuyla.
- **Ajan varlık/müsaitlik göstergesi** — Ajanın ilk adı + yeşil (müsait)/gri (meşgul) nokta; `title` ile tam ad.
- **Müsait ajan sayısı rozeti** — Müsait sayısı (>0 pozitif, 0 danger) rozetle.
- **Sıradakini ata (assignNext)** — Her kuyruk için buton; bekleyen yoksa disable, sonuç (atanan ajan / kuyruk boş) toast ile bildirilir.

### Paneller — IVR oluşturucu (IVRBuilder)

- **IVR menü listesi görüntüleme** — PBX store'undaki tüm IVR menülerini kart halinde; her menü için ad, id ve karşılama (greeting) metni.
- **IVR menü seçeneklerini listeleme** — Her menünün seçenekleri (tuş, etiket, aksiyon, hedef) satır satır; tuş kbd rozetinde, aksiyon renkli badge'de.
- **IVR seçeneği ekleme formu** — Menü, tuş, etiket, aksiyon (then) ve hedef alanlarıyla satır içi seçenek ekleme.
- **IVR hedef menü seçimi** — Açılır listeden hangi menüye seçenek ekleneceği seçilir.
- **IVR tuş atama** — 1-9, 0, *, # arasından tuş (varsayılan 4).
- **IVR aksiyon tipi seçimi** — menu, queue, voicemail, forward, extension (varsayılan queue), i18n etiketli.
- **IVR etiket ve hedef girişi** — Serbest metin etiket (boşsa aksiyon adı otomatik) ve hedef (boşsa undefined).
- **IVR lokal state & form sıfırlama** — Menüler local state'te (store'dan kopya, immutable map güncellemesi); seçenek eklenince etiket/hedef temizlenir.

### Paneller — Yönlendirme kuralı oluşturucu (RoutingRuleBuilder)

- **Yönlendirme kuralı oluşturucu kartı** — Kuralların listelenip eklenebildiği ve canlı önizlendiği tek kart.
- **Kural listesi (When → Then)** — Her kural 'When <koşul> → Then <aksiyon>' okunabilir satırı, aksiyon rozeti ve varsa biçimli hedef numara (`formatNumber`).
- **Yönlendirme koşulları** — always, afterHours, busy, noAnswer (RoutingCondition).
- **Yönlendirme aksiyonları** — forward, voicemail, ivr (RoutingActionKind).
- **Koşula bağlı hedef alanı** — Aksiyon 'forward'/'ivr' iken hedef numara alanı görünür (`needsTarget`); voicemail'de gizlenir.
- **Kural ekleme ve otomatik sıralama** — Benzersiz id (`rr_<timestamp>`) ve ilk hat (`LINES[0].id`) ile; 'always' kuralları her zaman listenin sonuna itilir, hedef temizlenir.
- **Canlı yönlendirme önizlemesi** — afterHours/busy/noAnswer onay kutularıyla bağlam seçilir; `evaluateRouting` ile tetiklenecek kural ve hedef gerçek zamanlı önizlenir, eşleşme yoksa '—'.
- **Yerel kural state yönetimi** — Kurallar ROUTING_RULES'tan kopyalanıp koşul/aksiyon/hedef/bağlam ayrı state'lerle yönetilir.

### Paneller — AI Resepsiyonist oluşturucu (ReceptionistBuilder)

- **AI resepsiyonist yapılandırma paneli** — Sol kartta karşılama, mesai dışı mesaj, niyetler ve yakalama alanları tek ekranda; AI çağrı karşılayıcısı uçtan uca kurulur.
- **Resepsiyonist aç/kapat anahtarı** — Başlık butonuyla etkinleştirme; durum 'On/Off' rozetiyle.
- **Karşılama mesajı düzenleme** — Çok satırlı textarea ile karşılama metni canlı düzenlenir (`setGreeting`).
- **Çalışma saatleri dışı mesaj düzenleme** — Ayrı textarea ile mesai dışı karşılama (`setAfterHoursGreeting`).
- **Açık/kapalı saat durumu rozeti** — SCHEDULE + `isWithinHours` ile 'Open now' / 'After hours' rozeti.
- **Dinamik karşılama önizleme** — `receptionistGreeting(config, open)` ile o anki gerçek karşılama metni önizlenir.
- **Bilgi yakalama alanları seçimi** — fieldset içinde name/phone/reason onay kutularıyla toplanacak bilgi (`toggleCaptureField`).
- **SMS takip onay kutusu** — Çağrı sonrası SMS takip gönderimi (`toggleSmsFollowUp`).
- **Niyet (intent) listesi** — Etiket, tetikleyici cümleler (virgülle, taşma kırpılmış) ve aksiyon rozeti; her satırda silme butonu.
- **Yeni niyet ekleme formu** — Etiket, cümleler (virgülle bölünüp trim+filter) ve aksiyon seçimi; etiket boşsa/cümle yoksa eklenmez, form sıfırlanır.
- **Niyet aksiyon türleri** — route_queue, route_extension, answer_faq, book, voicemail, human; aksiyona göre rozet tonu (accent/positive/warning/neutral).
- **Niyet silme (removeIntent)** — Çöp kutusu butonuyla, 'common.delete' etiketiyle.
- **Canlı resepsiyonist test aracı (simülatör)** — Sağ kartta yazılan ifadeyle AI yanıtı ve algılanan niyet gerçek zamanlı test edilir (`simulateCaller`).
- **Sohbet transkripti (Caller/AI baloncukları)** — Turlar baloncuk olarak; caller sağ accent, AI sol surface, User/Robot ikonlarıyla.
- **Boş transkript durumu** — Tur yoksa EmptyState (empty/emptyHint).
- **Algılanan niyet ve aksiyon göstergesi** — Algılanan niyet etiketi (yoksa 'noIntent') ve seçilen aksiyon rozeti.
- **Test ifadesi gönderimi & Enter kısayolu** — Uçak butonu veya Enter ile gönderim; boşken disable, sonra alan temizlenir.
- **Oturum sıfırlama (resetSession)** — 'Reset' butonuyla turlar, niyet ve aksiyon sıfırlanır.

### Paneller — Çağrı analitiği (CallAnalytics)

- **Çağrı analitiği özet kartları (KPI'lar)** — Toplam çağrı, kaçırılma oranı (yüzde), ortalama işleme süresi (formatlı) ve kayıtlı çağrı sayısı StatCard'ları.
- **computeCallStats ile istatistik hesaplama** — Çağrı geçmişinden toplam, missedRate, avgHandleSec ve recorded türetir.
- **Kaçırılma oranı yüzde gösterimi** — `missedRate` `Math.round` ile '%X' biçiminde.
- **Ortalama işleme süresi biçimlendirme** — `avgHandleSec` `fmtDuration` ile okunabilir süreye.
- **Saatlik çağrı hacmi çubuk grafiği** — `volumeByHour` ile 24 saatlik kovalar, CSS yükseklik oranlarıyla mini çubuk grafiği; en yüksek kovaya göre normalize.
- **Çubuk grafik normalizasyonu ve min yükseklik** — Yükseklik `(count/max)*100%`; sayı varsa min 4px, sıfırsa 0.
- **Grafik saat eksen etiketleri** — Her 6 saatte bir (`hour % 6 === 0`) saat etiketi.
- **Çubuk hover ipucu (title)** — 'HH:00 · sayı' formatında native title tooltip.
- **Hacim grafiği erişilebilirliği** — Kapsayıcı `role="img"` + çevrilmiş `aria-label`.
- **Kuyruk SLA listesi** — PBX kuyruklarını ad, bekleyen çağrı sayısı ve maksimum bekleme süresi (`maxWaitSec`) ile listeler.

### Detay yetenekler — Çağrı motoru & state makinesi (callStore)

- **Aktif çağrı Zustand store'u (useCallStore)** — Merkezi çağrı durum makinesi: aktif çağrı, geçmiş, hatlar, yönlendirme kuralları, sessize alma, bekletme müziği, park, kayıtlar, danışma bacağı, izleme modu, wrap-up ve engelli liste.
- **Benzersiz çağrı kimliği üretimi (newId)** — Zaman damgası + artan sıra (seq) ile çakışmasız id.
- **Giden çağrı başlatma (place)** — Numarayı normalize edip birincil hatta 'ringing' giden çağrı oluşturur, mute'u sıfırlar.
- **Gelen çağrı simülasyonu (simulateInbound)** — Normalize numaradan 'ringing' gelen çağrı simüle eder.
- **Çağrıyı cevaplama (answer)** — Aktif çağrıyı 'active' yapar.
- **Çağrıyı bekletme/devam (hold/resume)** — Yalnızca 'active'i 'hold'a, yalnızca 'hold'u tekrar 'active'e alır.
- **Çağrı aktarma (transfer)** — Kör aktarma; çağrıyı 'completed' nedeniyle sonlandırır.
- **Çağrıyı sonlandırma (hangup)** — Verilen nedenle (varsayılan 'completed') sonlandırır, geçmişe ekler, izlemeyi durdurur, wrap-up sırasına alır.
- **Sessize alma aç/kapa (toggleMute)** — Mikrofon sessize alma durumunu tersine çevirir.
- **Bekletme müziği aç/kapa (toggleHoldMusic)** — Bekletilen tarafa müzik çalma PBX ayarını açıp kapatır.
- **Çağrı süresi sayacı (tick)** — Her saniye sonlanmamış aktif çağrının `durationSec`'ini 1 artırır.
- **WS olaylarını state makinesine uygulama (applyEvent)** — Tipli WS olaylarını (call.placed/answered/ended/routed, voicemail.left, sms.received) idempotent uygular; tekrarlanan call.placed yok sayılır.
- **Çağrı park etme / alma (park / pickup)** — `park` aktif çağrıyı 'hold' ile parkedCalls'a taşır; `pickup(id)` belirli park edilmiş çağrıyı 'active' yapar.
- **DTMF tuş gönderme (sendDtmf)** — Basılan tuşu çağrının dtmf dizisine ekler (IVR/menü gezintisi).
- **Çağrı kaydı aç/kapa (toggleRecording)** — Kaydı başlatır/durdurur; başlatınca consent:true içeren Recording eklenir.
- **Konferansa katılımcı ekleme (addToCall)** — Normalize ek uzak bacağı participants'a ekleyerek konferans oluşturur.
- **Sıcak aktarma — danışma başlatma (startConsult)** — Çağrıyı bekletip danışma bacağını arayarak warm transfer başlatır.
- **Aktarmayı tamamlama (completeTransfer)** — Çağrıyı danışılan tarafa devredip kendi bacağını sonlandırır, consult'u temizler.
- **Danışma bacağını birleştirme — 3'lü konferans (mergeConsult)** — Danışma bacağını katılımcı olarak ekleyip 'active' yaparak üç yönlü konferans oluşturur.
- **Danışmayı iptal edip dönme (cancelConsult)** — Danışma bacağını bırakıp orijinal çağrıyı 'active'e geri getirir.
- **Süpervizör izleme modu (setMonitor / stopMonitor)** — Aktif çağrıda listen/whisper/barge/takeover modunu ayarlar/durdurur.
- **Wrap-up sonuçlandırma (saveDisposition / dismissWrapUp)** — `pendingWrapUp` için sonuç kodu kaydeder veya atlar.
- **Numara engelleme/engel kaldırma (blockNumber / unblock)** — Spam kontrolü için engelli listesine ekler/çıkarır (tekrarları yok sayar).
- **Store sıfırlama (reset)** — Tüm çağrı state'ini başlangıca, geçmişi CALL_HISTORY'ye döndürür.
- **Çağrı geçmişi tamponlama** — `endCurrent` sonlanan çağrıyı endReason ile işaretleyip geçmişin başına ekler, son 100 kayıtla sınırlar.
- **Yönlendirme & numara normalizasyonu** — ROUTING_RULES tutulur; tüm numaralar `normalizeNumber` ile E.164'e normalize edilir, CALL_HISTORY/LINES seed verisiyle gelir.

### Detay yetenekler — PBX motoru (pbx.ts + pbxStore)

- **PBX Zustand store (usePbxStore)** — Kuyruklar, IVR menüleri, iş takvimi ve hunt gruplarını yönetir; round-robin (rrIndex) ve sequential hunt (huntIndex) imleçlerini kalıcı tutar.
- **Mock PBX verisi yükleme** — QUEUES, IVR_MENUS, SCHEDULE, HUNT_GROUPS'u başlangıç durumuna yükler; `cloneQueues` ile derin kopyalayıp mutasyondan korur.
- **Çağrı kuyruğa alma (enqueue)** — Kuyruğa çağıran numarayla yeni bekleyen çağrı ekler (benzersiz id + since).
- **Sonraki çağrıyı atama (assignNext)** — İlk bekleyeni çıkarıp stratejiyle ajan seçer, rrIndex'i günceller, atanan ajan ve çağrıyı döndürür.
- **Yetkinlik bazlı atama (assignNextBySkill)** — İlk bekleyeni belirtilen yeteneğe sahip ajanlar arasından strateji ile atar.
- **Grup çağrı kapma (groupPickup)** — Yönlendirme olmadan en eski bekleyen çağrıyı kullanıcının kapmasını sağlar.
- **Geri arama talebi (requestCallback)** — Bekleyen çağrıyı `callbackRequested` işaretler, canlı kuyruğu serbest bırakır.
- **Hunt grubu çaldırma (ringHunt)** — Sonraki üyeyi döndürür; sequential'da huntIndex'i ilerletir.
- **PBX sıfırlama (reset)** — Kuyruk, hunt grubu ve imleçleri mock'a döndürür.
- **Benzersiz çağrı kimliği (newId)** — Zaman damgası + sayaç ile `qc_` önekli id.
- **Çağrı dağıtım stratejisi seçimi (pickAgent)** — simultaneous, sequential, round_robin, rotating, longest_idle, weighted stratejilerini destekler; uygun olmayan ajanları atlar.
- **En uzun boşta kalan strateji (longest_idle)** — Müsait ajanlar arasından idleSec en yükseği seçer.
- **Ağırlıklı strateji (weighted)** — En yüksek weight (varsayılan 1) ajanı; eşitlikte liste sırası.
- **Round-robin / rotating dönen imleç** — `lastIndex`'ten sonraki müsait ajanı seçer, sona gelince başa sarar, müsaitsizleri atlar.
- **Yetenek bazlı yönlendirme (pickAgentBySkill)** — Belirtilen skill'e sahip ajanları filtreleyip strateji ile seçer.
- **Çalışma saatleri kontrolü (isWithinHours)** — Haftalık açık/kapanış penceresini ve tatil günlerini kontrol eder.
- **IVR DTMF tuş çözümleme (ivrResolve)** — Basılan tuşu çözer, seçeneği bulur, alt menüye yönlendiriyorsa hedef menüyü döndürür.
- **Süpervizör izleme ses yönlendirmesi (monitorAudio)** — listen (sessiz), whisper (sadece ajana), barge (üç taraflı), takeover (ajanı devre dışı bırakıp müşteriyi devralma) ses akışını belirler.
- **Paylaşılan hat vekil yetki kontrolü (canActOnBehalf)** — Vekilin sahip adına yanıtlama (canAnswer) / arama (canPlaceOnBehalf) yetkisini kontrol eder.
- **Grup çağrı kapma — en eski bekleyen (oldestWaiting)** — En küçük since damgalı çağrıyı bulur.
- **Tahmini bekleme süresi (estimatedWaitSec)** — (öndeki çağıran × ortalama görüşme süresi) ÷ müsait ajan; callback isteyenler düşülür, müsait ajan yoksa toplam döner.
- **Hunt grubu üye seçimi (nextHuntMember)** — all'da ilk müsait, sequential'da imleçten sonraki müsait üye (başa sararak).

### Detay yetenekler — AI Resepsiyonist motoru (receptionist.ts + receptionistStore)

- **AI Resepsiyonist (sanal ön büro)** — Karşılayan, niyet tanıyan, SSS yanıtlayan, yönlendiren, detay toplayan, randevu alan ve talep üzerine insana devreden her zaman açık modül (Zoom Virtual Agent / Teams Copilot Call Delegation paritesi).
- **Niyet eşleştirme (token-örtüşme NLU)** — `matchIntent`: niyetin tetikleyici ifadelerinin tüm token'ları metinde geçiyorsa eşler; uzun ifadeler daha ağır puanlanır, beraberlikte en erken niyet kazanır, örtüşme yoksa null.
- **Unicode-duyarlı tokenizasyon (tokens)** — Metni küçük harfe çevirip noktalamayı temizleyerek (`\p{L}\p{N}`) kelime token'ları üretir; çok dilli/aksanlı girdi desteği.
- **Açık/mesai-dışı karşılama seçimi (receptionistGreeting)** — İş saatlerine göre normal ya da mesai-dışı karşılama döndürür.
- **Aksiyon çözümleme + geri-düşüş (resolveAction)** — Eşleşen niyetin aksiyonunu döndürür; eşleşmezse config fallback'ine (varsayılan 'human') düşer.
- **Bilgi yakalama tamamlık kontrolü (captureComplete)** — Gerekli yakalama alanlarının (name/phone/reason) hepsinin dolu olduğunu doğrular.
- **Aksiyona göre demo yanıt üretimi (receptionistReply)** — answer_faq için niyetin cevabı, diğer aksiyonlar için kısa onay cümleleri üretir.
- **Framework-bağımsız saf NLU katmanı** — Tüm yardımcılar framework'süz, birim-test edilebilir; gerçek FastAPI/NLU backend'inin aynı sonucu hesaplayabileceği temiz arayüz.
- **Zustand resepsiyonist store (useReceptionistStore)** — config (klonlanmış mock) ve session state'leri + tüm aksiyonlar (toggleEnabled, setGreeting, setAfterHoursGreeting, toggleSmsFollowUp, toggleCaptureField, addIntent, removeIntent, simulateCaller, resetSession).
- **Etkinleştirme & karşılama düzenleme** — `toggleEnabled` ile aç/kapa; `setGreeting`/`setAfterHoursGreeting` ile metinler.
- **SMS takip & yakalama alanı aç/kapa** — `toggleSmsFollowUp` ve `toggleCaptureField` (toggle davranışı).
- **Niyet ekleme/silme** — `addIntent` otomatik id (`int_new_N`) ile ekler, `removeIntent` çıkarır.
- **Canlı çağrı simülasyonu (simulateCaller)** — İfadeyi alır, niyet eşler, aksiyon çözer, yanıt üretir, caller+ai turlarını ekler; hat yalnızca answer_faq'ta açık kalır, diğer aksiyonlarda oturum done=true ile biter.
- **Oturum sıfırlama (resetSession)** — Aktif oturumu boş oturumla değiştirir.
- **Tur/niyet id üreteçleri** — `mkTurn` artan turnSeq ile `rt_N`, `addIntent` artan intentSeq ile `int_new_N`.
- **Derin config klonlama (cloneConfig)** — captureFields ve intents.phrases dizilerini ayrı kopyalayarak immutability sağlar.
- **Resepsiyonist mock yapılandırması (Aura)** — Etkin, İngilizce karşılamalar, sch_main saatleri, name/phone/reason yakalama, human fallback, SMS takip açık, 5 hazır niyet.
- **Önceden tanımlı 5 niyet seti** — Sales→q_sales, Support→q_support, Opening hours (SSS), Book a meeting (randevu), Billing→dahili 210.

### Detay yetenekler — Yönlendirme & numara yardımcıları (routing.ts)

- **Numara normalizasyonu (normalizeNumber)** — Serbest formatı E.164 benzeri stringe çevirir; boşlukları kırpar, '+'ı korur, '00'ı '+' yapar, rakam-dışı karakterleri temizler.
- **Numara görüntü formatlama (formatNumber)** — +1 numaralarda ulusal gruplama (`+1 (XXX) XXX-XXXX`), diğerlerini olduğu gibi bırakır.
- **Find-me/follow-me yönlendirme değerlendirmesi (evaluateRouting)** — Bağlama göre en spesifik eşleşen kuralı seçer; koşullu kurallar 'always'i yener, hiçbiri yoksa null.
- **Presence'a göre varsayılan yönlendirme (presenceToRouting)** — Çevrimiçiyse forward, değilse voicemail.
- **Arayan kimliği çözümleme (callerName)** — Numarayı rehberdeki kişi adına çevirir; eşleşme yoksa biçimli numara.
- **Arayan itibar sınıflandırması (classifyCaller)** — blocklist→blocked, rehber→trusted, heuristik (7 haneden kısa veya 5+ aynı rakam tekrarı = robocall paterni)→spam, aksi→unknown.
- **Rehber/dizin arama (searchContacts)** — Ad ve numara üzerinde büyük/küçük harf duyarsız arama; boş sorguda tüm kişiler.
- **Şablon değişken doldurma (renderTemplate)** — `{{değişken}}` yer tutucularını değerlerle değiştirir; bilinmeyenleri olduğu gibi bırakır.

### Detay yetenekler — SMS state (smsStore)

- **SMS thread state yönetimi (useSmsStore)** — Konuşma listeleri, aktif konuşma ve zamanlanmış mesajları yönetir; başlangıç SMS_THREADS'ten klonlanır.
- **Aktif konuşma seçimi (setActiveThread)** — Thread'i aktif işaretler ve okunmamış sayacını sıfırlar.
- **SMS gönderme (send)** — LINE_E164'ten alıcıya outbound metin; benzersiz id + sentAt.
- **Medyalı (MMS) mesaj gönderme (sendMedia)** — Metne ek olarak medya ekleri (SmsMedia[]); thread yoksa işlem yapılmaz.
- **Şablon ile gönderme (sendTemplate)** — Şablon string + değişkeni `renderTemplate` ile doldurup normal SMS olarak gönderir.
- **Gelen mesaj alma (receive)** — Dış SmsMessage'i thread'e ekler, okunmamışı bir artırır.
- **Okundu işaretleme (markRead)** — Thread'in unread sayacını sıfırlar.
- **Zamanlanmış SMS planlama (scheduleSms)** — Gelecekteki bir zamana (at) mesaj zamanlar.
- **Zamanı gelenleri gönderme (flushDue)** — `now`'a göre vadesi dolanları outbound gönderir ve listeden çıkarır.
- **SMS store sıfırlama (reset)** — Thread'leri yeniden klonlar, aktifi ilk thread'e alır, zamanlanmışları temizler.

### Detay yetenekler — Favoriler state (directoryStore)

- **Favoriler / hızlı arama store'u (useDirectoryStore)** — Yalnızca favori numaralarını (e164) tutar; kişilerin kendisi statiktir.
- **Favori ekle/çıkar geçişi (toggleFavorite)** — Numara favorilerdeyse çıkarır, değilse ekler.
- **Favorileri sıfırlama (reset)** — Tüm favori numaralarını temizler.

### Detay yetenekler — API & transport sözleşmesi

- **Telefon hatlarını listeleme (GET /lines)** — `fetchLines` mock'u atanmış hatları (PhoneLine[]) ~150ms gecikmeyle döndürür; carrier-agnostik httpClient sözleşmesini taklit eder.
- **Arama kayıtlarını getirme (GET /calls)** — `fetchCalls` mock'u geçmiş arama günlüğünü (Call[]) döndürür.
- **Sesli mesajları getirme (GET /voicemails)** — `fetchVoicemails` mock'u sesli mesaj kayıtlarını (Voicemail[]) döndürür.
- **SMS konularını getirme (GET /sms)** — `fetchSmsThreads` mock'u mesajlaşma konularını (SmsThread[]) döndürür.
- **Giden çağrı başlatma (POST /calls)** — `placeCall(to, lineId)` numarayı normalize edip belirtilen hat üzerinden 'ringing' giden Call oluşturur.
- **Çağrı durumu güncelleme (PATCH /calls/:id)** — `patchCall(id, state)` bekletme/devam/aktarma geçişlerini sunucuya iletip echo döndürür.
- **Carrier-agnostik mock API + WS call.* olayları** — Tüm fonksiyonlar FastAPI REST sözleşmesini taklit eder, gecikme simülasyonu içerir; çağrı durum değişiklikleri ayrıca WS `call.*` olaylarından gelir, böylece gerçek client'a geçişte UI/store değişmez.
- **Carrier-agnostik transport mimarisi** — SIP/VoIP arka ucunun call.* olaylarını WS üzerinden yayınladığı, hat/sesli mesaj/SMS için REST sunduğu, UI'ın yalnızca transport'u (mock → httpClient/WebSocket) değiştirdiği sözleşme tabanlı mimari.
- **Conversation Intelligence entegrasyonu** — Canlı transkript/koçluk için Faz 4 Conversation Intelligence bağlamını `transcriptId` referansları üzerinden tüketir.
- **Toast bildirim entegrasyonu** — `useToastStore.push` ile atama/yakalama/geri arama/çaldırma/çalma/iletme sonuçları positive veya danger tonlu bildirimlerle gösterilir.

### Veri modelleri — Çağrı & telefon

- **Çağrı yönü modeli (CallDirection)** — gelen (inbound) / giden (outbound) sınıflandırması.
- **Çağrı yaşam döngüsü durum makinesi (CallState)** — ringing → active ⇄ hold → ended geçişleri.
- **Çağrı sonlanma nedeni (CallEndReason)** — completed / missed / declined / voicemail.
- **Çağrı kaydı (Call)** — Hat, yön, from/to, durum, başlangıç, süre; konferans katılımcıları, DTMF tuşları, kayıt durumu/recordingId alanları.
- **Konferans çağrısı katılımcıları** — from/to ötesinde ek uzak bacaklar `participants` ile.
- **DTMF tuş gönderimi (IVR navigasyonu)** — Gönderilen DTMF rakamları `dtmf` alanında tutulur.
- **Çağrı kaydı işareti & ilişkilendirme** — Kaydedilip kaydedilmediği `recording` bayrağı ve `recordingId` referansıyla izlenir.
- **Çağrı kaydı kaydı (Recording)** — Çağrı id, başlangıç, süre, rıza (consent) ve opsiyonel transkript referansı.
- **Kayıt rızası (consent) işareti** — Kaydın yasal rıza ile yapıldığını işaretler.
- **Çağrı olay sözleşmesi (CallEvent / WS)** — call.placed/answered/ended/routed, voicemail.left, sms.received tipli WS olayları; mock dispatcher ↔ EventSource/WebSocket şeffaf değiştirilebilir.
- **Çağrı olay tipi türevi (CallEventType)** — CallEvent birleşiminden olay tiplerini çıkaran yardımcı tip.
- **Çağrı durum çipi (CallStateChip)** — Durumu renk + ikon + metinle gösterir; ringing (warning/PhoneCall), active (positive/PhoneCall), hold (accent/Pause), ended (muted/PhoneX) eşlemesi — asla yalnız renge dayanmaz.
- **Süre biçimlendirme (fmtDuration)** — Saniyeyi m:ss formatına çevirir (saniye iki haneye sıfırla doldurulur).
- **Çağrı sonucu (CallOutcome)** — resolved / follow_up / no_answer / sale / spam.
- **Çağrı sonrası disposition (kapanış)** — Sonuç, not ve etiketleri müşteri profiline senkronlayan after-call wrap-up modeli.
- **Presence (durum) sinyali** — find-me/follow-me'nin tükettiği online/away/offline sinyali.

### Veri modelleri — Hat, rehber & yönlendirme

- **Telefon hattı (PhoneLine)** — E164 numara, etiket, dahililer ve opsiyonel vekiller.
- **İş yeri telefon hattı ve dahililer** — Ana hat (E.164 + etiket) altında Sales/Support/Billing gibi numaralı dahililer (extensions).
- **Dahili numara (Extension)** — Kısa kurumsal dahili (örn. 101) etiket ve kimlikle.
- **Paylaşımlı hat vekili (Delegate)** — Hattı sahip adına yanıtlayan/arama başlatan vekil; `canAnswer` / `canPlaceOnBehalf` izinleri.
- **Kişi adres defteri (Contact)** — Caller-ID çözümlemesi için ad + E164; CONTACTS dizisi (Jordan Blake, Acme Procurement, Dana Wu vb.) statik veridir.
- **Çağrı yönlendirme kuralı (RoutingRule)** — Koşula (always/afterHours/busy/noAnswer) göre forward/voicemail/ivr aksiyonu; hedef numara/extension/IVR menü id'si taşıyabilir.
- **Find-me/follow-me yönlendirme kuralları** — Mesai dışı/meşgul/cevapsız/her zaman koşullarına göre sesli mesaja, başka numaraya veya IVR'a aktarma; en özgül kural önce, 'always' catch-all en sonda.
- **Arayan itibar sınıflandırması (CallerClass)** — trusted / unknown / spam / blocked (spam/robocall etiketleme).
- **Çağrı geçmişi / arama günlüğü (CALL_HISTORY)** — Sona ermiş çağrıların yön, kimden-kime, süre, başlangıç, bitiş nedeni ve recordingId kaydı.

### Veri modelleri — SMS & mesajlaşma

- **SMS mesajı (SmsMessage)** — Thread, from/to, gövde, gönderim zamanı, outbound yönü ve MMS ekleri.
- **SMS sohbet dizisi (SmsThread)** — Kişi adı, E164, mesaj listesi, unread sayacı ve grup MMS için participants.
- **Grup MMS / grup konuşma desteği** — `participants` ile grup dizilerinde üye numaraları (1:1 ve grup SMS).
- **SMS/MMS eki (SmsMedia)** — Görsel/dosya türündeki MMS ekleri (ör. order-form.pdf, banner.png) ad ve türle.
- **Zamanlanmış SMS (ScheduledSms)** — Gelecek bir zamana (at, epoch ms) bir thread'e zamanlanmış mesaj.
- **SMS şablonu (SmsTemplate)** — `{{name}}`/`{{date}}`/`{{quote}}` yer tutuculu yeniden kullanılabilir şablon (demo onayı, teklif takibi).
- **Hazır SMS yanıtları (SMS_CANNED)** — Tek tıkla gönderilebilen önceden yazılmış kısa yanıtlar (ör. randevu linki).

### Veri modelleri — PBX (kuyruk, IVR, hunt, saatler)

- **Çağrı kuyruğu (CallQueue)** — Ad, hat, strateji, temsilciler, maxWaitSec, taşma (overflowAction/overflowTarget) ve bekleyen çağrılar içeren ACD modeli.
- **Çağrı kuyrukları (ACD ring grupları)** — Stratejili (round_robin, longest_idle) kuyruklar; max bekleme süresi ve taşma aksiyonu (voicemail veya numaraya yönlendirme).
- **Çağrı kuyruğu dağıtım stratejisi (RingStrategy)** — simultaneous, round_robin, longest_idle, sequential, rotating, weighted (Zoom + Webex paritesi).
- **Kuyruk taşma (overflow) yönetimi** — `maxWaitSec` aşıldığında `overflowAction`/`overflowTarget` ile yönlendirir.
- **Kuyruk temsilcisi (QueueAgent)** — Ad, idleSec, müsaitlik, skills (yetenek bazlı yönlendirme) ve weight (ağırlıklı dağıtım).
- **Yetenek bazlı yönlendirme (skills-based)** — Çağrıların temsilci yeteneklerine göre yönlendirilmesi (demo, pricing, billing, tier1/tier2 vb.).
- **Ağırlıklı çağrı dağıtımı** — `weight` ile yüksek ağırlıklı temsilcilere daha fazla çağrı.
- **Kuyrukta bekleyen çağrı (QueuedCall)** — Arayan numara, giriş zamanı (since) ve `callbackRequested` (Webex paritesi).
- **Kuyruk geri arama (callback) talebi** — Arayanın hatta beklemek yerine geri aranmayı seçmesi.
- **Hunt grubu (HuntGroup)** — ACD bekleme/analitiği olmadan sabit grubu çaldırma; all (hepsi) veya sequential (sırayla) modları.
- **Hunt grubu üyesi (HuntMember)** — Ad ve müsaitlik (available).
- **IVR menüsü (IVRMenu)** — Ad, sesli karşılama (greeting) ve seçenekler listesi.
- **IVR menü seçeneği (IVROption)** — DTMF tuşu (1-9, 0, *, #), etiket ve aksiyon (menu/queue/voicemail/forward/extension) + hedef.
- **Çok seviyeli IVR / otomatik santral menüleri** — Tuş bazlı sesli menü; seçenekler kuyruğa, alt menüye, dahiliye, numaraya veya sesli mesaja yönlendirir, alt menüler iç içe.
- **Haftalık çalışma saati penceresi (HoursWindow)** — Gün (0=Pazar…6=Cumartesi), açılış/kapanış dakikaları.
- **İş saatleri (BusinessHours)** — Ad, saat dilimi (Europe/Istanbul), haftalık pencereler (Pzt-Cuma 09:00-18:00) ve tatil günleri; mesai içi/dışı kararını besler.

### Veri modelleri — İzleme & resepsiyonist

- **Süpervizör canlı izleme modu (MonitorMode)** — listen / whisper / barge / takeover.
- **İzleme ses yönlendirme modeli (MonitorAudio)** — supervisorHearsParties, agentHearsSupervisor, customerHearsSupervisor, agentConnected boolean'ları.
- **AI Resepsiyonist aksiyon türleri (ReceptionistActionKind, 6 tip)** — route_queue, route_extension, answer_faq, book, voicemail, human.
- **AI Resepsiyonist niyet (ReceptionistIntent)** — id, label, tetikleyici phrases, action, target (kuyruk id / dahili / e164) ve answer_faq için sözlü answer.
- **Resepsiyonist veri toplama alanları (CaptureField)** — name / phone / reason.
- **AI Resepsiyonist yapılandırması (ReceptionistConfig)** — id, enabled, greeting, afterHoursGreeting, hoursId, intents, captureFields, fallback aksiyonu ve smsFollowUp (Zoom paritesi).
- **Resepsiyonist mesai dışı karşılama** — `hoursId` dışında çalınan ayrı after-hours karşılama.
- **Resepsiyonist SMS takibi** — Çağrı sonrası SMS takip gönderimi (`smsFollowUp`, Zoom AI Receptionist paritesi).
- **Resepsiyonist konuşma turu (ReceptionistTurn)** — caller veya AI tarafından söylenen tek tur (id, who, text).
- **Resepsiyonist çağrı oturumu (ReceptionistSession)** — turns, detectedIntentId, action, captured (name/phone/reason) ve done durumu.
- **Sanal resepsiyonist yapılandırması (RECEPTIONIST mock)** — Açılıp kapatılabilen, karşılama/mesai-dışı metinleri, bağlı program, toplanacak alanlar, human fallback ve SMS takip.
- **Seçilebilir sesli mesaj karşılamaları (GREETINGS / VoicemailGreeting)** — Default, Mesai dışı, Tatil gibi adlandırılmış karşılamalar.

### Analitik veri modelleri (analytics.ts)

- **CallStats veri modeli** — total, inbound, outbound, missed, missedRate (0..1), avgHandleSec, recorded (Call-Quality-Dashboard muadili).
- **computeCallStats** — Call dizisinden toplam, gelen/giden, kaçırılan sayı/oran, ortalama görüşme süresi (süresi>0 olanların ortalaması) ve kayıtlı sayısını hesaplar.
- **Gelen/giden çağrı ayrımı** — `direction`'a göre inbound sayılır, outbound toplamdan çıkarılır.
- **Kaçırılan çağrı oranı** — `endReason==='missed'` çağrılar / toplam (toplam 0 ise 0).
- **Ortalama görüşme süresi** — `durationSec>0` çağrıların yuvarlanmış ortalaması; yanıtlanmış yoksa 0.
- **Kayıt altına alınan çağrı sayısı** — `recordingId` dolu çağrılar.
- **HourBucket veri modeli** — Saatlik yoğunluk kovası: hour (0-23) ve count.
- **volumeByHour** — Çağrıları `startedAt`'in yerel saatine göre 24 saatlik kovaya dağıtır; heatmap/grafik verisi üretir.

### Çapraz kesit — tasarım & erişilebilirlik

- **Tasarım token tabanlı stil sistemi** — border, bg, surface, raised, fg, muted, ring, positive gibi tema token sınıfları ve `cn` yardımcısı; ortak Card ve IconButton primitive'leri üzerine kurulu.
- **Genel erişilebilirlik (a11y)** — Tüm panellerde aria-label, sr-only etiketler, htmlFor/id eşlemeleri, focus-visible ring ve dekoratif ikonlarda aria-hidden uygulanır.
- **Genel i18n çoklu dil desteği** — Tüm metinler react-i18next ile `phone.*` anahtarları (phone.queue.*, phone.hunt.*, phone.hours.*, phone.caller.*, phone.state.*, phone.monitor.*, phone.wrapUp.*, phone.voicemail.* vb.) üzerinden çevrilir; sayaç/parametre interpolasyonu (n, from, agent, name, waiting, maxWait) kullanılır.


---

<a id="webinar"></a>

## Webinar sekmesi

Webinar sekmesi, uçtan uca etkinlik yönetimi sunan kapsamlı bir omnichannel canlı yayın modülüdür: hostlar için bir yönetim konsolu ile katılımcılar için yüksek kontrastlı canlı yayın deneyimini tek bir kabuk altında birleştirir. Live, simulive, evergreen, ondemand ve town-hall modlarını; kayıt/onay/bekleme listesi yaşam döngüsünü; biletleme, ajanda, yaka kartı, anket ve Q&A gibi tüm Teams town-hall paritesi yeteneklerini içerir.

### Ana akışlar

- **Webinar sayfası kabuğu** — Maksimum genişlikte ortalanmış düzende başlık, aktif etkinlik başlığı ve görünüm sekmelerini barındıran ana sayfa (WebinarPage).
- **Konsol / Canlı Önizleme sekme geçişi** — `role=tablist` ile gruplanmış iki sekme: aktif faz `console` ise EventConsole (yönetim), `live` ise EventLive (katılımcı) render edilir. Sekmelerde Konsol için Monitor, canlı için Television ikonu kullanılır.
- **Canlıya geç / canlıdan çık** — Konsol sekmesi `exitLive()`, Canlı Önizleme sekmesi `goLive()` store eylemini çağırarak etkinlik fazını (`phase`) değiştirir; faz host yönetim ekranı ile katılımcı deneyimi arasında geçer.
- **İzin tabanlı erişim koruması** — `webinar.view` yetkisi yoksa sayfa içeriği yerine Forbidden bileşeni gösterilir (authStore `can()` kontrolü).
- **Etkinlik derin bağlantısı (`?event=`)** — `useUrlSelection` ile aktif etkinlik URL `event` parametresine senkronlanır; paylaşılabilir, yenilemeye dayanıklı, yalnızca var olan etkinlik id'lerini kabul eder.
- **Etkinlik konsolu (EventConsole)** — Webinar yönetimini beş sekme altında toplayan üst seviye kabuk: Builder, Registration, Events, Backstage, Analytics. Her sekme bir ikonla eşleşir (Sliders, ClipboardText, Ticket, FilmSlate, ChartBar) ve aktif sekmeye göre ilgili panel render edilir.
- **Konsol klavye gezinmesi ve ARIA** — `useTabKeys` ile ok tuşlarıyla sekme gezinme; sekme şeridi WAI-ARIA tab desenine uygun (`role=tablist/tab`, `aria-selected`, roving `tabIndex` aktif 0 / diğerleri -1), aktif sekme accent renk ve alt çizgi (border-accent), focus-visible ring-accent ile klavye odağı.
- **Canlı etkinlik (katılımcı) görünümü (EventLive)** — Katılımcı deneyimini yüksek kontrastlı koyu sahne temasında (`data-theme=dark`, AAA kontrast hedefi) sunan yayın ekranı; etkinlik başlığı, sağ üstte SignOut ikonlu Çıkış butonu (`exitLive`).
- **Canlı görünüm duyarlı düzeni** — lg ekranlarda 3 kolonlu grid: sahne (~58vh) + altyazı 2 kolon, anket + Q&A 1 kolon; küçük ekranda dikey istiflenir. Üstte CtaBanner.

### Konsol panelleri

- **Etkinlik Oluşturucu (EventBuilder)** — Etkinlik detayları ve oturumları yan yana iki kart halinde gösteren responsive grid (lg:grid-cols-2).
- **Etkinlik detay kartı** — Başlık, mod, kapasite ve marka bilgilerini tanım listesi (dl) içinde gösterir.
- **Etkinlik durum rozeti** — `eventStatus(startsAt, durationSec)` ile hesaplanan duruma göre renkli rozet: live=pozitif, upcoming=accent, diğer=neutral.
- **Etkinlik modu seçici (5 mod)** — live, simulive, evergreen, ondemand, townhall arasından buton grubuyla seçim; seçilen mod store'a yazılır, aktif mod accent kenarlık/renk ile vurgulanır, her buton `aria-pressed` taşır.
- **Kapasite gösterimi** — `capacity.toLocaleString()` ile yerel binlik ayraçlı biçim.
- **Marka vurgu rengi göstergesi** — `branding.accent` rengini hem küçük renk önizleme karesi hem de hex/renk metni olarak gösterir.
- **Oturumlar listesi** — Aktif etkinliğin oturumlarını takvim ikonu, başlık ve `toLocaleTimeString` (saat:dakika) neutral rozetiyle listeler.
- **Kayıt formu oluşturucu (RegistrationBuilder)** — İki sütunlu düzende alan oluşturucu ile canlı form önizlemesini yan yana, üstte kapasite paneliyle sunan kayıt formu tasarım arayüzü.
- **Kayıt alanı ekleme / silme** — Etiket, tip (text/email/select) ve zorunluluk seçimiyle alan ekleme (boş etiket engellenir, id timestamp ile üretilir, eklemede giriş temizlenir); her alan yanında Trash ikonlu, erişilebilir etiketli silme butonu.
- **Alan tipi seçimi (text/email/select)** — `TYPES` sabitiyle desteklenen tipler, i18n ile çevrilen etiketler.
- **Zorunlu alan işaretleme** — Checkbox ile zorunluluk (varsayılan zorunlu); zorunlu alanlar listede accent rozeti, önizlemede yıldız (\*) ile gösterilir.
- **Alan listesi rozetleri** — Her satırda tip rozeti (neutral) ve zorunluysa "gerekli" rozeti (accent).
- **Canlı form önizlemesi** — Tanımlı alanlardan gerçek zamanlı form üretir; select için seçenek listesi (boş `—` varsayılan, seçili değer state'te), diğerleri için metin input'u; kullanıcı gerçek değer girebilir.
- **Kayıt doğrulama (required + email)** — `validateRegistration` saf fonksiyonu zorunlu alan boşluğunu ve e-posta formatını (regex) kontrol eder; hatalar alan id → hata kodu (`required`/`email`) eşlemesiyle döner ve ilgili alan altında danger renkli, i18n çevirili mesaj (`webinar.regError.*`) olarak gösterilir.
- **Kayıt gönderimi ve başarı toast'ı** — Doğrulama başarılıysa `register` aksiyonu çağrılır, pozitif "kayıt olundu" toast'ı gösterilir, form değerleri sıfırlanır.
- **Etkinlik yöneticisi (EventManager)** — Biletleme, ajanda ve yaka kartı yönetimini birleştiren panel; responsive grid (lg:grid-cols-2), bilet kartı tam genişlik (lg:col-span-2), ajanda ve badge kartları yan yana.
- **Backstage paneli** — Yayın arkası/sahne yönetim arayüzü (FilmSlate sekmesi).
- **Analitik paneli (AnalyticsTab)** — Etkinlik istatistik/raporlama sekmesi.

### Biletleme (EventManager)

- **Bilet katmanları tablosu** — Her satırda katman adı, fiyat (ücretsizse "Free"), satılan/toplam ve kalan adet.
- **Para birimine göre toplam gelir rozetleri** — `ticketRevenue` ile satılan biletlerden elde edilen gelir para birimi bazında pozitif rozetlerle başlıkta gösterilir.
- **Bilet satışı (Sell)** — `sellTicket(tier.id)` ile bir satış kaydeder, satılan sayısını artırır (mock checkout).
- **Tükendi (Sold out) durumu ve buton kilidi** — `isSoldOut(tier)` true ise kalan sütununda danger "Sold out" rozeti ve Sell butonu disabled.
- **Bilet katmanı ekleme** — Ad, para birimi (USD/EUR/TRY/GBP select), fiyat (number, min 0) ve adet (number, min 1) ile yeni katman; ad boşsa engellenir, eklemeden sonra ad temizlenir.
- **Bilet katmanı silme** — `removeTier(tier.id)` çöp kutusu IconButton'u ile katmanı kaldırır.
- **Para birimi seçenekleri (CURRENCIES)** — Sabit liste: USD, EUR, TRY, GBP.

### Ajanda (EventManager)

- **Güne göre gruplanmış ajanda** — `agendaByDay(agenda)` oturumları güne göre gruplar; her gün başlığı altında saat aralığı (start–end), başlık, track ve varsa konuşmacı listelenir.
- **Ajanda çakışma uyarısı** — `agendaConflicts(agenda)` çakışan oturum sayısını hesaplar; çakışma varsa başlıkta uyarı ikonlu, sayılı warning rozeti.
- **Ajanda oturumu ekleme / silme** — Gün, track, başlangıç/bitiş saati ve başlık ile yeni öğe (varsayılan Day 1, Main stage, 11:00–11:30; başlık boşsa engellenir, eklemede temizlenir); `removeAgendaItem(item.id)` ile çöp kutusu silme.

### Yaka kartı / badge (EventManager)

- **Yaka kartı önizlemesi** — Seçili alanları örnek kayıt verisiyle önizler; sol kenarda `badge.accent` renginde vurgu çubuğu, `name` büyük kalın, diğer alanlar normal.
- **Yaka kartı alan seçimi (toggle)** — name, email, company, role alanları (`BADGE_FIELDS`) checkbox'larla açılır/kapanır; `toggleBadgeField(f)` ile güncellenir ve önizlemeyi etkiler. Etiketler `EVENTS[0].registrationFields` üzerinden çözülür.
- **Onaylı kayıtlar için yazdırma kuyruğu** — "Print confirmed" butonu `queueBadges(confirmedIds)` ile ev_launch etkinliğinin onaylı kayıt id'lerini kuyruğa ekler; adet accent rozetiyle gösterilir.
- **Yazdırma kuyruğunu temizleme** — Kuyrukta öğe varsa görünen "Clear queue" butonu `clearQueue()` ile boşaltır.

### Backstage paneli

- **Panelist listesi** — `PANELISTS` verisinden her panelist için UserCircle ikonu, isim ve Badge ile etiketlenen rol; bordürlü liste kartı.
- **Role göre renk tonu** — `roleTone` eşlemesi: host=accent, panelist=neutral, moderator=positive.
- **Yayına geçme (Go Live)** — Broadcast ikonlu birincil buton ile `goLive` aksiyonunu tetikleyerek webinarı canlıya alır.
- **Simulive/Evergreen koşullu başlatma** — Mod `simulive` veya `evergreen` ise FilmSlate ikonlu ikincil buton; tıklanınca pozitif tonlu `simuliveStarted` toast'ı gönderir. Yayın aksiyon butonları `mode` değerine göre koşullu görünür/gizlenir.
- **Yayın (Broadcast) kartı ve ipucu** — Yayın başlığı, açıklayıcı ipucu metni (broadcastHint) ve esnek sarılan (flex-wrap) buton grubu.

### Kapasite paneli (CapacityPanel)

- **Kapasite paneli** — Kapasite katmanları, manuel onay kuyruğu ve bekleme listesinden kabulü tek kartta birleştiren, Teams town-hall pariteli panel.
- **Town-hall mod rozeti** — Etkinlik tipi `townhall` ise başlıkta accent tonlu mod etiketi; diğer tiplerde gizli.
- **Etkileşimli katılımcı kapasitesi göstergesi** — Etkileşimli katılımcı sayısını kullanıcı ikonuyla used/limit biçiminde gösterir.
- **Kapasite dolu uyarısı** — Etkileşimli kapasite dolduğunda (`cap.interactive.full`) warning tonlu "dolu" rozeti.
- **Yalnızca izleme kapasitesi göstergesi** — View-only kapasite tanımlıysa TV ikonuyla used/limit; tanımsızsa gizli.
- **Bekleme listesi sayacı** — Bekleme listesindeki (waitlisted) kişi sayısını gösteren bilgi kutusu.
- **Sıradakini kabul et (admitNext)** — Bekleme listesinde kişi varsa görünen yukarı ok ikonlu buton; `admitNext` ile sıradaki kişiyi (FIFO) kabul eder.
- **Bekleyen onay kuyruğu listesi** — Onay durumu `pending` kayıtları "pending, {n}" başlığı altında ayrı bölümde listeler; kayıt yoksa gizli. Kayıtlar aktif etkinliğe ve pending durumuna göre filtrelenir.
- **Kayıt onaylama / reddetme** — Her bekleyen satırda Check ikonlu buton (`approveRegistration`) ve X ikonlu buton (`rejectRegistration`); IconButton'lara çeviri etiketi verilir.
- **Bekleyen katılımcı adı gösterimi** — `r.values.name` gösterilir; ad yoksa kayıt id'sine düşülür, uzun adlar truncate ile kısaltılır.

### Sahne ve canlı katmanlar

- **Canlı sahne görünümü (StageView)** — Üst bar, ortadaki oynat/başlık alanı ve alt zaman çizelgesi olmak üzere üç bölümlü kart.
- **Canlı/mod durum rozeti** — Canlı ise tehlike (kırmızı) tonu ve "live" etiketi, değilse nötr ton ve moda göre çevrilmiş mod etiketi (simulive/evergreen vb.).
- **Eşzamanlı katılımcı sayacı** — Üst sağ köşede UsersThree ikonuyla anlık katılımcı sayısı, yerelleştirilmiş binlik ayraçla (`toLocaleString`).
- **Etkinlik başlığı ve oturum gösterimi** — Merkezde etkinlik başlığı ve ilk oturum (`sessions[0]`) başlığı, üzerinde dolu Play ikonu bulunan vurgu renkli yuvarlak rozetle.
- **Simulive ilerleme zaman çizelgesi** — `simulivePosition` ile hesaplanan yüzdeye (`pos.pct`) göre dolan ilerleme çubuğu; aria-label ile erişilebilir.
- **Süre biçimlendirme (dk:sn)** — Saniyeyi mm:ss biçimine çeviren `fmt` yardımcısı (saniye iki haneye tamamlanır); geçen ve toplam sürede kullanılır.
- **Saniyelik canlı zamanlayıcı** — `useEffect` içinde 1 saniyede bir `now` state'ini güncelleyen `setInterval`; temizlemede interval kaldırılır.
- **CTA banner (CtaBanner)** — Katılımcılara yatay aksiyon çubuğu: başlık metni ve sağa hizalı eylem butonları içeren vurgu renkli kenarlıklı kart.
- **CTA aksiyon butonları** — `CTAS` mock verisindeki her öğe için ikincil buton; yanında dış-bağlantı (ArrowSquareOut) ikonu ve CTA etiketi.
- **CTA tıklama ile toast (intent kaydı)** — Tıklamada pozitif tonlu toast yayılır ve etkileşim niyeti kaydedilir; bu niyet Faz 4'te Konuşma Zekası'na (Conversation Intelligence) beslenmek üzere tasarlanmıştır.
- **Canlı altyazı katmanı (CaptionsLayer)** — Canlı altyazı/transkript satırlarını gösteren ince bar; çeviri/altyazı bağlantı noktasını (seam) simüle eder.
- **Altyazı aç/kapat** — ClosedCaptioning ikonlu buton; açıkken accent kenarlık/renk, kapalıyken soluk stil, `aria-pressed` durumu.
- **Otomatik dönen altyazı satırları** — Açıkken `setInterval` ile her 3 saniyede bir önceden tanımlı satırlar arasında döngüsel (`% LINES.length`) geçiş; kapatıldığında zamanlayıcı temizlenir.
- **Aktif altyazı metni gösterimi** — Açıkken o anki satır (`LINES[i]`) tek satırda truncate ile, `aria-live=polite` ile duyurulur; kapalıyken gizli.

### Anket (PollOverlay + pollStore)

- **Canlı anket overlay'i** — Yalnızca `state === 'live'` anketleri filtreleyip gösterir; canlı anket yoksa null döner.
- **Anket oylama** — Seçeneğe tıklamak `vote(p.id, o.id, me)` ile geçerli kullanıcının oyunu kaydeder; kimlik authStore `principal.id` (yoksa `usr_1` fallback). Kullanıcı başka seçenek seçmişse önceki oy kaldırılır, aynı seçeneğe tekrar oy mükerrer kayıt oluşturmaz (kullanıcı başına tek oy).
- **Oy yüzdesi ve görsel doluluk çubuğu** — `(o.votes.length / total) * 100` yuvarlanır; seçenek arka planında yüzdeye eşit genişlikte doluluk çubuğu, sağda yüzde metni.
- **Kullanıcının kendi oyu işareti** — Oy verdiği seçenek (`o.votes.includes(me)`) accent kenarlıkla vurgulanır, check ikonu gösterilir, `aria-pressed=true`.
- **Toplam oy sayısı gösterimi** — Her anketin altında tüm seçeneklerin oy toplamı `webinar.votes` interpolasyonuyla (`{ n: total }`).
- **Anket başlatma (launch)** — Soru ve seçenek metinleriyle yeni canlı anket; durum `live`, seçenekler o1, o2... id'leri ve boş oy listeleriyle, benzersiz zaman damgalı id (`pl_<timestamp>_<sayac>`) ile üretilir.
- **Anket kapatma (close)** — Anketin durumunu `closed` yaparak oylamayı sonlandırır.
- **Anketleri sıfırlama (reset)** — Tüm anketleri orijinal mock veriden derin kopya ile başlangıç durumuna döndürür.

### Soru-Cevap (QnaBoard + qnaStore)

- **Q&A panosu** — Katılımcıların soru sorabildiği, oyladığı ve moderatörlerin yanıtlandı işaretleyebildiği kart tabanlı tahta; Question ikonlu başlık, soru listesi `role=feed` + aria-label ile dinamik akış olarak işaretlenir.
- **Soru sorma (ask)** — Input'a yazıp gönder butonu veya Enter ile soru ekleme; boş/yalnızca boşluk engellenir, gönderimden sonra input temizlenir. Soru otomatik benzersiz id (`q_<zaman>_<seq>`), ev_launch event, boş oy listesi, `answered=false`, `tSec=0` ile eklenir; soran kişi oturum açmış kullanıcı (principal id, yoksa usr_1).
- **Enter ile soru gönderme kısayolu** — Input'ta Enter submit tetikler; faresiz hızlı gönderim.
- **Gönder butonu disabled durumu** — Metin boşsa PaperPlaneRight ikonlu primary buton devre dışı.
- **Soru oylama (upvote toggle)** — Her kullanıcı bir soruyu oylayabilir ve geri çekebilir (toggle); oy sayısı buton üzerinde, oyladıysa ArrowFatUp dolu (fill) ve buton vurgu renginde, `aria-pressed` ile durum bildirilir.
- **Soruları oy ve zamana göre sıralama** — `sortQna` saf fonksiyonu oy sayısına göre azalan, eşitlikte `tSec`'e göre artan sıralar (orijinal diziyi mutasyona uğratmaz); en çok oylanan üste.
- **Moderatör için yanıtlandı işaretleme** — `admin.access` yetkili moderatörler yanıtlanmamış soruları `answer` ile "yanıtlandı" işaretler; yetkisiz kullanıcılarda aksiyon gizli (authStore `can('admin.access')`).
- **Yanıtlandı durum rozeti ve soluklaştırma** — Yanıtlanan sorular pozitif "yanıtlandı" etiketi alır ve kart opaklığı düşürülür (opacity-60).
- **Q&A sıfırlama (reset)** — Soru listesini ilk mock veriden (QNA) klonlayarak başlangıç durumuna döndürür.

### Analitik (AnalyticsTab)

- **Özet KPI kartları** — Üstte 4 StatCard: kayıtlı, katılan, gelmeyen (no-show) ve katılım oranı (show rate); responsive grid (mobilde 2, masaüstünde 4 kolon).
- **Katılımcı segmentasyonu** — `segmentAttendees` ile aktif etkinliğin kayıtları registered/attended/noShow/showRate metriklerine dönüştürülür; showRate yüzdeye çevrilip yuvarlanır.
- **UTM kaynak dağılımı** — Kayıtların `utm.source` alanına göre gruplanmasıyla trafik kaynakları ve kayıt sayıları; kaynak yoksa "direct" sayılır.
- **Etkileşim (engagement) kartı** — Canlı katılımcı sayısı (locale formatlı) ve toplam anket oyu sayısını tanım listesinde (dl/dt/dd) gösterir, altında niyet (intent) açıklama notu.
- **Toplam anket oyu hesaplama** — Tüm anketlerin tüm seçeneklerindeki oy dizisi uzunlukları toplanarak hesaplanır.
- **Aktif etkinliğe göre kayıt filtreleme** — Tüm kayıtlar `activeEventId` ile filtrelenerek yalnızca aktif webinara ait kayıtlar analize alınır.

### Veri & state (store'lar)

- **Etkinlik (Event) Zustand store (eventStore)** — Aktif etkinlik, çalışma modu, faz, kayıtlar ve katılımcı sayısını tek noktada tutan merkezi store.
- **Çoklu etkinlik listesi ve aktif seçim** — `EVENTS` tutulur, `setEvent` ile aktif etkinlik değişir; seçimde etkinlik tipi moda otomatik yansır.
- **Çalışma modu (mode / setMode)** — live/simulive/evergreen/ondemand modları arası geçiş.
- **Faz geçişi (goLive / exitLive)** — `phase` host konsolu ile katılımcı canlı görünümü arasında geçer.
- **Etkinlik kaydı oluşturma (register)** — Form değerleriyle yeni kayıt; onay durumu `nextApproval` ile otomatik hesaplanır, benzersiz id atanır.
- **Kayıt onaylama / reddetme** — `approveRegistration` / `rejectRegistration` ile bekleyen kayıt approved/rejected'a geçer (town-hall manuel onay).
- **Bekleme listesinden FIFO terfi (admitNext)** — `admitFromWaitlist` ile en eski bekleme listesi kaydını onaylıya yükseltir.
- **Store sıfırlama (reset)** — Aktif etkinlik, mod, faz, kayıtlar ve katılımcı sayısını varsayılana döndürür.
- **Benzersiz kayıt id üretimi** — `newId` zaman damgası + artan sayaç ile `rg_` önekli kimlikler üretir.
- **Katılımcı sayısı temel değeri** — `attendees`, `ATTENDEE_BASE` (8421) değerinden başlatılır.
- **Etkinlik yönetimi store (useEventsStore)** — Biletler, ajanda ve yaka kartı yapılandırmasını tutar; başlangıç verisi `TICKET_TIERS`, `AGENDA`, `EVENT_BADGE` mock kaynaklarından derin kopyalanarak yüklenir. Aksiyonlar: addTier, removeTier (id `tt_new_<sayac>`, sold 0), sellTicket (stok varsa artırır), addAgendaItem (id `ag_new_<sayac>`), removeAgendaItem, toggleBadgeField (varsa çıkar, yoksa ekle), queueBadges (Set ile tekrarsız), clearQueue.
- **Anket store (usePollStore)** — Canlı anketleri yönetir; başlangıç `POLLS`'tan derin kopyalanır (seçenek ve oylar kopyalanır). launch/vote/close/reset aksiyonları ve benzersiz id üretimi.
- **Q&A store (useQnaStore)** — Soru akışını yönetir: ask, upvote (toggle), answer, reset; başlangıç `QNA`'dan upvotes dizisi dahil derin kopyalanarak (mock mutasyona uğramaz), id'ler artan `seq` ile üretilir.
- **PollStore / EventStore / Auth store entegrasyonları** — Bileşenler selector hook'larıyla `activeEventId`, registrations, attendees, polls, mode ve `principal.id`'yi okur; aktif etkinliğe göre filtreleme ve oylama kimliği bunlardan türetilir.

### Veri modelleri (types & data)

- **AppEvent** — Bir webinarı tam modeller: id, başlık, tip, startsAt, durationSec, etkileşimli kapasite, town-hall salt-izleme taşma kapasitesi, host onay gereksinimi, markalama, registrationFields ve sessions.
- **EventType** — live | simulive | evergreen | ondemand | townhall.
- **Etkinlik türleri ve çalışma modları** — Etkinlikler live ve townhall türü destekler; çalışma modu (`eventStore.mode`) çalışma anında geçersiz kılınabilir. Demo: lansman 45 sn önce başlamış canlı, town hall yarına planlı.
- **Session / Oturum** — id, eventId, başlık, startsAt (epoch ms); çok oturumlu etkinlikler. Lansman: Keynote, Live demo, Q&A.
- **EventBranding (branding.accent)** — Katılımcı modunda tenant aksanını ezen hex aksan rengi (örn. #6d28d9, #0ea5e9); sahne ve rozet renklendirmesini besler.
- **RegFieldType / RegField** — Alan tipleri text/email/select; alan modeli id, label, required, type ve select için options. `AppEvent.registrationFields` içinde tutulur, dinamik/özelleştirilebilir form sağlar.
- **Özelleştirilebilir kayıt formu alanları** — Her etkinlik için dinamik form (text/email/select, required, select options örn. Role/Team); lansman ve town hall farklı alan setlerine sahip.
- **RegistrationStatus** — registered | attended | no_show.
- **RegApproval (onay/bekleme listesi)** — Teams tarzı: approved | pending | rejected | waitlisted.
- **Registration modeli ve yaşam döngüsü** — id, eventId, dinamik values, status ve approval, utm verisi. Town hall kayıtları onay ve bekleme listesi yaşam döngüsünü gösterir.
- **UTM kaynak izleme** — `utm.source` (linkedin, email, x; yoksa direct) ile pazarlama atıf/kanal takibi.
- **viewOnlyCapacity (salt-izleme taşma kapasitesi)** — Town hall'da etkileşimli kapasitenin ötesinde salt-izleme katılımcı katmanı (etkileşimli 3000, view-only 10.000).
- **requireApproval (host onay gereksinimi)** — Kayıt onaylanmadan önce host onayı gerektiren akış.
- **PanelistRole / Panelist** — Roller host | panelist | moderator; panelist isim ve rol ile modellenir. Lansman: host, iki panelist, bir moderatör.
- **PollState / PollOption / Poll** — Anket durumu draft | live | closed; seçenek metin ve oy veren kimlik listesi; anket soru, seçenekler ve durumdan oluşur. Demo: canlı öncelik anketi, taslak NPS benzeri tavsiye anketi.
- **QnaItem** — id, eventId, authorId, text, upvotes, answered, tSec (yayın içi zaman damgası). Yanıtlanmış/yanıtlanmamış sorular beğeni sayılarıyla seed edilir.
- **EventCta** — id, label, url (örn. Ücretsiz deneme başlat, Sunumu indir); tıklamalar intent verisini besler.
- **TicketTier** — id, name, currency (ISO 4217, USD/EUR/TRY), price (0=ücretsiz), quantity, sold; çoklu para birimli biletleme. Demo: General/Pro/VIP/Yerel katmanları (VIP tükenmiş).
- **AgendaItem** — day, track, start, end, title, opsiyonel speaker; çok günlü/çok salonlu program (Day 1/Day 2, Main stage/Workshop room).
- **EventBadge** — Yerinde yaka kartı düzeni: basılacak fields (name, company, role) ve accent rengi.
- **ATTENDEE_BASE** — Simüle taban eşzamanlı katılımcı sayısı (8421); canlı sayacın başlangıç değeri.
- **WebinarEvent (WS kontratı)** — `event.*` tipli domain etkinlikleri: event.scheduled, registration.created, attendee.joined, poll.launched, qna.upvoted, simulive.started; mock dispatcher veya gerçek WebSocket/EventSource ile şeffaf değişim.
- **Statik seed veri dışa aktarımları** — EVENTS, REGISTRATIONS, PANELISTS, POLLS, QNA, CTAS, TICKET_TIERS, AGENDA, EVENT_BADGE; store ve bileşenler için demo veri kaynağı.

### Saf hesaplama yardımcıları (webinar.ts & events.ts)

- **validateRegistration + EMAIL regex + RegValidation** — Zorunlu alan ve e-posta format doğrulaması; boşluksuz, @ ve nokta barındıran adresleri kabul eden regex; sonuç modeli `ok` + alan id→hata haritası.
- **simulivePosition + SimulivePosition** — "As-live" mantığıyla geçen saniye, yüzde ilerleme (0-100) ve canlı durum; negatif ve süre aşımı kırpılır. Model: elapsedSec, pct, live.
- **segmentAttendees + AttendeeSegments** — Kayıt-katılım/no-show hunisi: registered, attended, noShow ve showRate (0-1).
- **sortQna** — Q&A öğelerini upvote'a göre azalan, eşitlikte tSec'e göre artan sıralar (kopya üzerinde).
- **eventStatus + EventStatus tipi** — startsAt ve süreden upcoming | live | ended durumunu hesaplar (şu anki zaman parametrik).
- **registrationCapacity + CapacityTier/EventCapacity** — Etkileşimli koltuk kullanımı, view-only taşma katmanı, waitlisted ve pending sayıları; town hall'da view-only overflow'u dolu/limit hesabıyla üretir (Teams paritesi). Modeller: kapasite katmanı (used, limit, full) ve etkinlik kapasitesi (interactive, opsiyonel viewOnly, waitlisted, pending).
- **nextApproval** — Yeni kaydın onay durumu: onay gerekiyorsa pending, etkileşimli kapasite doluysa waitlisted, aksi halde approved.
- **admitFromWaitlist** — Koltuk boşaldığında bekleme listesinden terfi edilecek en eski (FIFO) kaydı bulur, yoksa null.
- **approvalOf yardımcısı** — Bir kaydın onay durumunu güvenli okur; tanımsızsa varsayılan approved.
- **ticketsRemaining** — Kalan adet (quantity − sold), negatife düşmez (Math.max 0 taban).
- **isSoldOut** — Kalan 0 ise true.
- **ticketRevenue** — Tüm katmanların gelirini (satılan × fiyat) ISO para birimine göre gruplayarak toplar.
- **formatPrice** — Intl.NumberFormat ile (en-US) para birimi sembollü biçim; geçersiz para biriminde "tutar para-birimi" fallback'i.
- **agendaByDay** — Ajandayı güne göre gruplar, ilk görülme gün sırasını korur, gün içinde başlangıç saatine göre sıralar.
- **toMin** — "HH:MM" saat metnini gece yarısından dakikaya çevirir (sıralama ve çakışma için).
- **agendaConflicts** — Aynı gün ve aynı track'te zaman aralıkları örtüşen oturum çiftlerini bularak çakışmaları saptar.

### Mock API katmanı (api.ts)

- **Mock API katmanı (FastAPI sözleşmesi)** — Backend FastAPI sözleşmesini taklit eden, yapay gecikmeli Promise tabanlı API yüzeyi; OpenAPI httpClient ile değiştirildiğinde UI/store değişmez, canlı güncellemeler WS `event.*` ile gelir.
- **Etkinlik listesi / tekil getirme** — `fetchEvents()` tüm etkinlikleri (`AppEvent[]`), `fetchEvent(id)` tekil etkinliği (`AppEvent | undefined`) döndürür.
- **Kayıt gönderimi (POST /registrations)** — `submitRegistration(eventId, values)` ile form alanları gönderilir; status `registered` kaydı üretir.
- **Anket oluşturma (POST /polls)** — `createPoll(eventId, question, options)` ile state `live`, her seçeneği boş oy listesiyle başlayan anket.
- **Q&A oluşturma / oy verme** — `createQna(eventId, authorId, text)` ile answered:false, boş upvotes, tSec:0 öğe; `upvoteQna(id)` soruya oy verir ve id'sini döndürür.
- **Yapay gecikme yardımcısı (delay)** — Tüm mock çağrılarını varsayılan 150ms gecikmeyle saran jenerik `delay<T>()`; gerçek ağ davranışını simüle eder.

### Yatay yetenekler

- **i18n çoklu dil desteği** — Tüm metinler react-i18next `t()` ile çevrilir (nav.webinar, webinar.console, webinar.livePreview, webinar.tabs.*, webinar.analytics.*, webinar.cap.*, webinar.modeLabel.*, webinar.status.*, webinar.events.*, webinar.role.*, webinar.regError.*, webinar.captions, webinar.votes, webinar.timeline, common.* vb.); sayılı metinler interpolasyonla (`{ n }`) üretilir.
- **Erişilebilirlik (a11y)** — Sekmelerde WAI-ARIA tab deseni; dekoratif ikonlarda `aria-hidden`; IconButton/form alanlarında `aria-label`; oylama ve aç/kapat butonlarında `aria-pressed`; Q&A listesinde `role=feed`; altyazıda `aria-live=polite`; zaman çizelgesinde `aria-label`; checkbox/fieldset/legend yapısı; focus-visible ring stilleri; katılımcı sahnesinde `data-theme=dark` ile AAA kontrast hedefi.
- **Toast bildirim entegrasyonu** — `useToastStore.push` ile başlık ve ton içeren toast'lar (simulive başlatma onayı, CTA niyet kaydı, başarılı kayıt geri bildirimi).


---

<a id="support"></a>

## Support sekmesi

Support sekmesi, Chatwoot sınıfı bir omnichannel destek deneyimini tek bir alanda toplar: çoklu kanaldan gelen konuşmaları yönetmek için birleşik bir ajan gelen kutusu, no-code bot/AI ajanı tasarımı, mesajlaşma maliyeti modellemesi ve iş gücü optimizasyonu (WFO/WEM) bir arada sunulur. Alan; izin korumalı, çok dilli (i18n) ve erişilebilir (a11y) bir kabuk içinde dört ana görünüme ayrılır.

### Genel kabuk & navigasyon

- **Dört sekmeli görünüm yapısı** — Destek alanı üstte Inbox, Otomasyon, İş Gücü ve Ajan Stüdyosu olmak üzere dört ana görünüme ayrılır; seçili sekme aktif renkle vurgulanır ve içerik alanı seçime göre değişir.
- **Sekme tablist (ARIA) ve klavye gezinme** — Sekmeler `role=tablist`/`role=tab`, `aria-selected` ve roving tabIndex ile işaretlenir; `useTabKeys` ile ok tuşlarıyla sekmeler arasında klavye gezinmesi yapılır (yalnızca aktif sekme tabbable).
- **İzin tabanlı erişim koruması** — `support.view` yetkisi olmayan kullanıcıya tüm alan yerine Forbidden bileşeni gösterilir; yetki `authStore.can` ile kontrol edilir.
- **Açık konuşmanın URL'e derin bağlanması (?conv=)** — Aktif konuşma kimliği `?conv=` sorgu parametresine yazılır; açık ticket paylaşılabilir, sayfa yenilemede korunur ve bildirimler belirli bir ticket'a yönlendirilebilir. Geçersiz id'ler konuşma listesiyle doğrulanır.
- **Workspace değişiminde konuşma yeniden seçimi** — Aktif workspace değiştiğinde o workspace'e ait (veya `workspaceId` boş) görünür konuşmalar filtrelenir; seçili konuşma görünmüyorsa ilk görünür konuşma otomatik seçilir.
- **Çoklu dil desteği (i18n)** — Tüm sekme etiketleri, başlıklar, butonlar ve aria metinleri `react-i18next` `useTranslation`/`t()` ile (`support.*`, `nav.support`, `common.*` anahtarları) çevrilir.

### Inbox düzeni & responsive davranış

- **Masaüstü çok-panolu inbox düzeni** — Masaüstünde inbox dört sütunlu çalışır: InboxNav (sol navigasyon), sabit genişlikli ConversationList, ConversationView (ticket içeriği) ve ContactPanel (kişi paneli) yan yana gösterilir.
- **Mobil tek-pano (single-pane) inbox akışı** — Mobilde liste ve ticket aynı anda gösterilmez; bir konuşma seçilince ticket panosuna kayılır. Mobil tespiti `useIsMobile` ile yapılır.
- **Konuşma seçiminde otomatik pano geçişi** — Aktif konuşma değiştiğinde mobil pano ticket görünümüne kayar; ilk render'da (`firstSelect` ref) bu geçiş atlanır.
- **Mobilde geri (Back) navigasyonu** — Mobil ticket panosunun üstünde CaretLeft ikonlu Geri butonu vardır; tıklandığında liste panosuna döner.

### Inbox navigasyonu & filtreleme (InboxNav)

- **Inbox yan navigasyonu** — Masaüstünde (md ve üstü) görünen, sol kenarlıklı, sabit genişlikli (`w-48`) panel gelen kutularını ve durum filtrelerini listeler; mobilde gizlidir.
- **Tüm gelen kutuları seçeneği** — Tray ikonlu "Tüm gelen kutuları" butonu aktif inbox'ı `null` yaparak filtreyi kaldırır ve tüm kanalları birlikte gösterir.
- **Kanala göre gelen kutusu listesi** — Her inbox kendi kanal tipinin ikonu (`CHANNEL_ICON`) ve adıyla listelenir; tıklanınca aktif edilir.
- **Aktif gelen kutusu vurgusu** — Seçili inbox `bg-surface`/`text-fg` ile vurgulanır, diğerleri muted+hover olur; aktiflik `aria-current` ile belirtilir.
- **Durum filtresi (status chip'leri)** — all, open, pending, snoozed, resolved durumlarına göre filtreleyen buton grubu; seçili durum accent kenarlık ve `aria-pressed` ile işaretlenir.

### Konuşma listesi (ConversationList)

- **Konuşma listesi** — Aktif inbox kapsamındaki konuşmaları seçilebilir, kaydırılabilir, `aria-label`'li kartlar halinde listeler.
- **Çok katmanlı filtreleme** — Konuşmalar üç filtreden geçer: aktif workspace kapsamı (`workspaceId` null ise her yerde görünür), aktif inbox eşleşmesi ve durum filtresi (all veya seçili status).
- **Konuşma seçimi** — Karta tıklanınca `setActive` ile konuşma aktif yapılır; aktif kart `aria-current` ve farklı arka planla (`bg-surface`) vurgulanır.
- **İlk yükleme iskeleti (skeleton)** — `useFirstLoad` true iken liste yerine 7 satırlık ListSkeleton gösterilir.
- **Boş durum (EmptyState)** — Filtrelenmiş liste boşsa Tray ikonu ve `support.empty` başlığıyla boş durum gösterilir.
- **Kanal ikonu gösterimi** — Konuşmanın inbox'ının `channelType` değerine göre `CHANNEL_ICON` haritasından ikon seçilir; inbox bulunamazsa varsayılan livechat ikonu kullanılır.
- **Kişi adı gösterimi** — `contactName(contactId)` ile kişi adı kart başlığında truncate ile gösterilir.
- **Okunmamış mesaj rozeti** — `unread > 0` ise accent tonlu rozetle okunmamış adet gösterilir.
- **Son mesaj önizlemesi** — Son mesaj (`messages.at(-1)`) varsa gövdesi tek satır truncate ile önizlenir.
- **Öncelik göstergesi** — `PRIORITY` haritasından önceliğe göre ikon, renk tonu ve i18n etiketi gösterilir.
- **Durum rozeti** — Konuşma durumu neutral tonlu rozetle `support.status.*` anahtarından çevrilerek gösterilir.
- **SLA durumu rozeti** — `slaState(slaDueAt)` sonucuna göre breached ise danger (WarningCircle), due_soon ise warning (Clock) rozeti gösterilir; aksi halde rozet çıkmaz.
- **Konuşma etiketleri gösterimi** — `labels` dizisindeki her etiket küçük çerçeveli çip olarak kart altında listelenir.

### Konuşma görünümü & yanıtlama (ConversationView)

- **Konuşma görüntüleme paneli** — Seçili konuşmayı başlık, makro çubuğu, mesaj akışı ve yanıt kutusuyla gösteren ana panel; aktif konuşma store'dan ID ile bulunur.
- **Boş durum (konuşma seçilmedi)** — Aktif konuşma yoksa ortada `support.selectConv` çevirisiyle uyarı gösterilir.
- **Konuşma başlığı (kişi adı)** — Başlıkta konuşmanın kişisi `contactName` ile kalın yazılır.
- **Atanan temsilci rozeti** — Konuşmaya temsilci atanmışsa `support.assignedTo` çevirisiyle temsilci adını içeren nötr Badge gösterilir.
- **Konuşma durumu seçici** — Başlıkta open/pending/snoozed/resolved seçimi sunan, değişince `setStatus` çağıran, `aria-label`'li select.
- **Makro hızlı uygulama çubuğu** — `MACROS`'taki her makro için Lightning ikonlu buton; tıklanınca `applyMacro` ile makro uygulanır.
- **Mesaj akışı (thread)** — Tüm mesajlar kaydırılabilir alanda listelenir; `aria-live="polite"` ile ekran okuyuculara güncelleme bildirilir.
- **Gelen/giden mesaj baloncukları** — Mesajlar yönüne göre (out=sağa accent, in=sola surface) hizalanıp renklendirilir, maks. %80 genişlik.
- **Dahili not (internal note) gösterimi** — `authorType='note'` mesajlar uyarı renginde sol kenarlıklı, `support.note` etiketli özel kutuda stillenir.
- **Otomatik en alta kaydırma** — Mesaj sayısı değişince `useEffect` ile akış `endRef`'e otomatik kaydırılır.
- **Yanıt gönderme** — Yanıt modunda taslak `sendReply` ile mevcut kullanıcı (me) adına gönderilir; sonrasında taslak ve öneri temizlenir.
- **Dahili not ekleme modu** — Note ikonlu IconButton ile not/yanıt modu arasında geçilir; not modunda metin `addNote` ile eklenir, giriş kutusu uyarı renkli kenarlıkla ayrışır.
- **Enter ile gönderme klavye kısayolu** — Giriş kutusunda Enter ile submit fonksiyonu çağrılır.
- **Boş taslak gönderim koruması** — Taslak boş/yalnızca boşluksa veya aktif konuşma ID yoksa gönderim engellenir; gönder butonu da boş taslakta devre dışıdır.

### AI yanıt önerisi & hazır yanıtlar

- **AI yanıt önerisi (insan onaylı)** — Sparkle ikonlu butonla `aiSuggest` çağrılır, dönen taslak ayrı bir kartta gösterilir; temsilci "Taslağı ekle" ile kutuya alabilir veya "Kapat" ile yok sayabilir. Yükleme sırasında buton devre dışıdır.
- **Niyet (intent) tabanlı yanıt sınıflandırması** — `aiSuggest` son gelen (in) mesajı regex ile inceler: invoice/refund/billing/charge → faturalama yanıtı, error/500/broken/bug/crash → mühendislik eskalasyon yanıtı, aksi halde → genel yardım yanıtı (deterministik üç öneri).
- **Hazır yanıt (canned response) otomatik tamamlama** — Taslak `/` ile başlayınca shortcode'a göre eşleşen `CANNED` yanıtlar pill butonlar olarak önerilir; tıklanınca `renderCanned` ile değişkenler doldurularak eklenir.
- **Hazır yanıt şablon değişkeni doldurma** — `renderCanned` ile gövdedeki `{{name}}`/`{{plan}}` gibi yer tutucular kişinin adı ve `attributes.plan` değeriyle doldurulur; tanımsız değişkenler olduğu gibi korunur.

### Kişi & bağlam paneli (ContactPanel)

- **İletişim/bağlam paneli** — Aktif konuşmanın sağında, yalnızca xl ekranlarda görünen kaydırılabilir kenar paneli; aktif konuşma/kişi yoksa hiçbir şey render etmez.
- **Kişi kimlik kartı** — Kişinin adını ve dolu olan iletişim kimliklerini (e-posta, telefon, sosyal) ikonlarıyla listeler.
- **Kişi öznitelikleri kartı** — Kişinin `attributes` anahtar-değer çiftlerini (şirket, plan vb.) tanım listesi olarak gösterir (anahtar solda, değer sağda).
- **Etiket ekleme/kaldırma (Labels)** — Konuşmaya etiket eklenip kaldırılabilir; mevcut etiketler çip, her çipte X ile silinir, boşken "etiket yok" mesajı çıkar.
- **Etiket girişi ve Enter ile ekleme** — Metin kutusuna yazıp Enter veya Plus butonuyla etiket eklenir; boş/whitespace trim edilip yok sayılır, sonrasında kutu temizlenir.
- **CSAT yıldız puanlama** — 1-5 arası tıklanabilir yıldızlarla memnuniyet puanı verilir; seçili puana kadar yıldızlar dolu (warning) gösterilir, `submitCsat` ile kaydedilir.
- **Takım CSAT ortalaması rozeti** — `csatAverage(conversations)` ile hesaplanan ortalama, 0'dan büyükse accent rozetle bir ondalık (`toFixed(1)`) olarak başlıkta gösterilir.
- **Bilgi Bankası paneli gömme** — Panelin altına KbPanel gömülerek bilgi bankası aynı kenar çubuğunda sunulur.

### Bilgi Bankası (KbPanel)

- **Bilgi Bankası paneli** — BookOpen ikonlu, kart içinde sunulan, ajanların makale arayıp okumasını sağlayan panel; başlık `support.kb` ile çevrilir.
- **KB arama kutusu** — MagnifyingGlass ikonlu kontrollü input ile anlık arama; placeholder/aria-label `support.kbSearch` anahtarından gelir, metin değiştikçe sonuçlar yeniden filtrelenir.
- **KB başlık + gövde arama mantığı** — `searchKb`/`searchKbRemote` sorguyu trim+lowercase yapar, boşsa tüm makaleleri döner, doluysa başlık VEYA gövdede büyük/küçük harf duyarsız eşleşmeye göre filtreler.
- **Makale aç/kapa (akordeon)** — Her sonuç bir butondur; tıklanınca gövdesi açılır, tekrar tıklanınca kapanır; aynı anda tek makale açık tutulur.
- **KB yerel state yönetimi** — Arama sorgusu (`q`) ve açık makale id'si (`open`) `useState` ile bileşen düzeyinde yönetilir; harici store kullanılmaz.

### Otomasyon görünümü (AutomationView)

- **Otomasyon görünümü kompozisyonu** — Otomasyon yüzeyini tek kaydırılabilir, `max-w-4xl` ortalanmış sütunda toplar; sırasıyla Kanallar paneli, Akış Oluşturucu ve Maliyet panelini dikey istifler. Kanal kurulumu, no-code bot akışları ve mesajlaşma maliyetini tek ekranda sunar.

### Kanal bağlantı & onboarding (ChannelsPanel)

- **Kanal bağlantı paneli** — Tüm gelen kutularının kanal bağlantı/kurulum durumunu Card içinde listeler; Meta Embedded Signup ve Coexistence akışına parite sağlayan onboarding görünümü.
- **Bağlı kanal sayacı rozeti** — Panel başlığında positive tonlu Badge ile canlı (connected/coexistence) kanal sayısını `connectedCount(inboxes)` ile gösterir.
- **Kanal başına ikon gösterimi** — Her satırda kanal tipine (livechat/email/whatsapp/instagram/facebook/telegram/sms) göre `CHANNEL_ICON` haritasından logo/ikon render edilir.
- **Onboarding adım rozeti** — Her kanal için bağlantı durumundan türeyen adım (connect/verifying/migrating/live) i18n etiketiyle ve bağlantı tonuna göre renklendirilmiş Badge olarak gösterilir.
- **Onboarding ilerleme çubuğu** — Adım ilerlemesi (0..1) yüzdeye (`Math.round(progress*100)%`) çevrilip ince ilerleme çubuğu olarak görselleştirilir (arka plan border, dolgu accent).
- **Bağlantı durumu → ton eşlemesi** — connected→positive, coexistence→accent, pending→warning, disconnected→neutral olacak şekilde sabit TONE haritasıyla rozet rengi belirlenir.
- **Coexistence uygunluk rozeti** — Kanal Coexistence'a uygunsa (`canEnableCoexistence`) satıra accent tonlu "Coexistence" rozeti eklenir; numarayı mevcut WhatsApp Business uygulamasını kaybetmeden Cloud API'ye taşıma akışını işaret eder.
- **Coexistence uygunluk kuralı** — Coexistence yalnızca `channelType='whatsapp'`, `provider='cloud_api'` ve bağlantı 'disconnected' değilken (pending/coexistence/connected) sunulur.
- **Kanal onboarding adımları (Embedded Signup → Coexistence → Live)** — Bağlantı durumunu 4 aşamalı onboarding akışına eşler: connect, verifying, migrating, live; her adıma 0..1 ilerleme değeri atayarak progress bar'ı besler.
- **`channelOnboardingState` yardımcısı** — Bir bağlantı durumunu (disconnected/pending/coexistence/connected) onboarding adımı ve ilerleme yüzdesine dönüştürür; varsayılan 'disconnected'. Framework bağımsız ve birim test edilebilir.
- **Onboarding adım/ilerleme eşleme tablosu (STEP)** — Eşleme: disconnected→connect/0, pending→verifying/0.5, coexistence→migrating/0.75, connected→live/1.
- **Canlı kanal sayacı (`connectedCount`)** — Verilen inbox listesinde canlı (connected/coexistence) gelen kutularını sayar; bağlı kanal rozeti/istatistiklerini besler.
- **Varsayılan bağlantı durumu (disconnected)** — `connection` tanımsız olan gelen kutuları 'disconnected' kabul edilir (yardımcı varsayılanı ve satır içi nullish fallback ile).
- **Uzun kanal adı kırpma** — Kanal adı `min-w-0 + flex-1 + truncate` ile tek satırda kesilir; rozetler için alan korunur.

### No-code chatbot akış oluşturucu (FlowBuilder)

- **No-code chatbot akış oluşturucu paneli** — Kod yazmadan görsel chatbot akışı tasarlamayı sağlayan kart tabanlı panel; çoklu akış, düğüm listesi, düğüm ekleme/silme ve simülasyon tek yüzeyde toplanır.
- **Görsel chatbot akış motoru (no-code)** — Tipli düğümlerden oluşan bir grafik olarak modellenen akışları çalıştıran saf gezinme/doğrulama motoru; framework bağımsız, birim test edilebilir; backend ile UI aynı sözleşmeyi paylaşır.
- **Akış seçici (dropdown)** — Mevcut akışlar arasında geçiş yapan açılır liste; seçilen akış aktif edilir ve panel o akışın düğümlerini gösterir.
- **Düğüm tipi ekleme butonları** — message, question, collect, condition, handoff ve end olmak üzere altı düğüm tipinden istenileni akışa ekleyen artı butonları; her yeni düğüm tipine göre varsayılan metinle eklenir.
- **Düğüm silme** — Her düğüm satırındaki çöp kutusu butonuyla düğüm kaldırılır; silinince ona işaret eden tüm kenarlar (next, yes, no, seçenekler) otomatik temizlenir.
- **Düğüm tipine göre ikon ve etiket** — Her tip kendi ikonuyla (sohbet, soru, form, dallanma, devir, bayrak) ve çevrilmiş tip rozetiyle listelenir.
- **Başlangıç düğümü işareti** — Akışın `startId`'sine eşit düğüm "start" rozetiyle vurgulanır.
- **WhatsApp Flow (collect) rozeti** — `collect` tipi düğümler sohbet içi form (WhatsApp Flow) olarak "waFlow" rozetiyle işaretlenir; collect düğümleri form alanları (`fields`) taşır ve tamamlanınca `next` ile devam eder.
- **Akış istatistik özeti** — Panel başlığında her düğüm tipinden kaç adet olduğu sayım olarak gösterilir; yalnızca sayısı sıfırdan büyük tipler nokta ayraçlı dizilir.
- **Kopuk hedef (dangling) doğrulaması** — Var olmayan düğüme işaret eden kenarlar tespit edilip uyarı kutusunda canlı bölgeyle kaç tane olduğu bildirilir; akış bütünlüğü doğrulanır.
- **Akış simülasyonu (Çalıştır)** — Her soru düğümünde ilk seçeneği varsayılan cevap alarak akışı baştan sona gezer; döngüye karşı güvenli traversal kullanılır.
- **Simülasyon yolu gösterimi** — Ziyaret edilen düğümler okla ("→") metinleriyle bağlanır; düğüm bulunamazsa id'si yazılır, canlı bölgeyle duyurulur.
- **Düğüm metni truncate gösterimi** — Düğüm metni tek satırda kırpılarak gösterilir; uzun metinlerde liste düzeni korunur.

### Botflow motoru & modelleri

- **BotNode düğüm tipleri (6 tür)** — message (mesaj), question (seçenekli soru), collect (WhatsApp Flow form), condition (koşul), handoff (insana aktarma) ve end (bitiş); her tür farklı davranış ve dallanma mantığına sahip.
- **BotNode veri modeli** — Bir düğümün `id`, `kind`, `text`, `next`, `options`, `fields` ve koşul alanları (`variable`, `equals`, `yes`, `no`) içeren tipli yapısı.
- **BotOption seçenek dalı modeli** — Soru düğümlerinde her seçenek için `label` ve `next` (hedef düğüm id) içeren dallanma modeli.
- **BotField form alanı modeli (WhatsApp Flow)** — `collect` düğümünün sohbet içi form alanlarını temsil eden `id`+`label` modeli; WhatsApp Flow tarzı in-chat formu modeller.
- **BotFlow akış modeli** — Bir akışın `id`, `name`, `startId` ve `nodes` (düğüm listesi) içeren üst düzey yapısı.
- **StepInput adım girdi modeli** — Gezinme adımında soru için seçilen seçenek etiketini (`answer`) ve koşullar için değişkenleri (`vars`) taşıyan girdi modeli.
- **`nodeById` düğüm arama** — Akış içinde id ile düğüm bulan yardımcı; bulunamazsa undefined döner.
- **`nextNodeId` sonraki düğüm çözümleme** — Düğüm tipine göre sonraki düğümü çözer: message/collect için `next`, question için seçilen seçeneğin hedefi, condition için değişken karşılaştırmasıyla yes/no dalı; handoff/end terminal olduğundan null döner.
- **Koşul (condition) dallanma mantığı** — `vars[variable] === equals` karşılaştırmasıyla yes ya da no dalına yönlendirir; değişken tabanlı dallanma sağlar.
- **`traverse` akış gezinme (döngü güvenli)** — Akışı `startId`'den başlayarak, düğüm id'sine anahtarlanmış `answers` ve `vars` ile gezer; ziyaret edilen id'leri döner ve `seen` set'iyle döngülere karşı güvenlidir.
- **`danglingTargets` sarkan hedef doğrulaması** — Var olmayan düğüme işaret eden kenar hedeflerini (next, yes, no, seçenek hedefleri) tespit eder; akış oluşturucu için doğrulama sağlar.
- **`flowStats` düğüm sayım istatistiği** — Akıştaki düğümleri türüne göre sayar ve her tür için adet döner; builder genel bakışı için.

### Botflow state (botflowStore)

- **Botflow Zustand store** — Akışları, aktif akış id'sini ve düğüm ekle/sil/aktif-akış/reset aksiyonlarını tutan istemci durum deposu; iki seed akışla (Support triage, Lead capture) başlatılır.
- **Çoklu akış desteği ve aktif akış seçimi** — Store birden fazla akış tutar, `activeFlowId` ile aktif akışı izler; `setActiveFlow` ile akışlar arası geçiş yapılır.
- **Düğüm ekleme (`addNode`)** — Aktif akışa belirtilen türde yeni düğüm ekler; benzersiz id üretir ve türe göre varsayılan metin (`DEFAULT_TEXT`) atar.
- **Düğüm silme ve kenar temizliği (`removeNode`)** — Aktif akıştan düğümü siler ve ona işaret eden tüm kenarları (next, yes, no, seçenek hedefleri) otomatik temizler; sarkan referans bırakmaz.
- **Akışı sıfırlama (`reset`)** — Store'u tohum akışlara ve varsayılan aktif akışa döndürür.
- **`activeFlow` seçici** — Aktif akış id'sine karşılık gelen akışı, yoksa ilk akışı döndürür; UI bu seçiciyle aktif akışa abone olur.
- **Benzersiz düğüm id üretimi** — `Date.now()` ve artan sayaç (`seq`) ile çakışmasız `n_<zaman>_<sayı>` id üretir.
- **Düğüm türüne göre varsayılan metinler (`DEFAULT_TEXT`)** — Her tür için varsayılan etiketler (örn. message: "New message", handoff: "Hand off to agent"); yeni düğüme otomatik atanır.
- **Derin kopya (clone) ile immutability** — Akış ve düğümleri derin kopyalayan yardımcı; seed verisinin store içinde değişmesini önler ve immutable güncellemeler sağlar.
- **Tohum akış: Support triage** — Karşılama, konu seçimi (Billing/Technical/Other), fatura bilgisi toplama formu, teknik çözüm mesajı, çözüldü bitişi ve insana aktarma içeren hazır triyaj akışı.
- **Tohum akış: Lead capture** — Teşekkür mesajı, ad/şirket toplayan form ve satışa yönlendirme içeren hazır lead yakalama akışı.

### WhatsApp maliyet paneli (CostPanel)

- **WhatsApp maliyet paneli** — Mesajlaşma maliyet motorunu (rate card + 24 saat penceresi + aylık tahmin) bölge seçimiyle gösteren kart bileşeni.
- **Bölge (region) seçici** — `RATE_CARD`'da tanımlı bölgeler arasından seçim; ücret kartını ve aylık tahmini etkiler, varsayılan 'TR'.
- **Ücret kartı tablosu (kategori bazlı)** — marketing/utility/authentication/service için seçili bölgenin mesaj başına ücretini gösterir; ücret 0 ise "ücretsiz", değilse 4 ondalıklı dolar tutarı olarak hizalanır.
- **24 saatlik müşteri hizmet penceresi göstergesi** — `windowState` ile son mesajdan geçen dakikaya göre pencere açık/kapalı hesaplanır; açıkken kalan saat pozitif Badge'de, kapalıyken danger Badge'de gösterilir.
- **Pencere süresi kaydırıcısı (slider)** — 0-1500 dakika aralığında range input ile son mesajdan geçen süre ayarlanır; pencere durumu yeniden hesaplanır (aria-label içerir).
- **Öngörülebilir aylık fatura tahmini** — `monthlyEstimate` ile örnek trafik karışımı ve seçili bölge üzerinden aylık toplam maliyet 2 ondalıkla ve toplam mesaj sayısıyla gösterilir.
- **Örnek aylık trafik karışımı (mock veri)** — Sabit dağılım: 1200 marketing, 3000 utility, 800 authentication (pencere dışı), 5000 service (pencere içi) mesajından oluşan `BillingContext` dizisi.

### Mesajlaşma maliyet motoru (messagingCost)

- **Mesajlaşma maliyet motoru** — Konuşma penceresi + kategori bazlı tarife kartı modelleyerek öngörülebilir fatura hesaplayan framework-bağımsız motor; AI çözüm başına fiyatlandırmaya karşı omnichannel parite farklılaştırıcısı.
- **Mesaj kategorileri tipi (`MessageCategory`)** — Mesajları marketing, utility, authentication, service olmak üzere dört faturalama kategorisine ayırır.
- **24 saatlik müşteri hizmet penceresi (CSW)** — Her gelen müşteri mesajıyla yeniden açılan 24 saatlik (1440 dk) hizmet penceresi sabiti (`CSW_MIN`); bu pencerede ücretsiz iletişim sağlar.
- **72 saatlik ücretsiz giriş penceresi (Free Entry Point)** — Tıkla-WhatsApp reklamı/Facebook girişiyle açılan 72 saatlik (4320 dk) tüm mesajların ücretsiz olduğu pencere sabiti (`FREE_ENTRY_MIN`).
- **Pencere durumu hesaplama (`windowState`)** — Son gelen mesaj zamanına ve şu ana göre 24 saatlik pencerenin açık olup olmadığını ve kalan dakikayı hesaplar; geri sayım/uyarı göstermek için kullanılır.
- **Pencere durumu veri modeli (`WindowState`)** — Pencerenin açık olup olmadığını (`open`) ve kalan dakikayı (`remainingMin`) tutar.
- **Faturalama bağlamı veri modeli (`BillingContext`)** — Bir mesajın kategorisini, 24h pencere içinde olup olmadığını (`withinWindow`) ve ücretsiz giriş penceresinde olup olmadığını (`freeEntryPoint`) tutar.
- **Mesaj faturalanabilirlik kuralı (`messageBillable`)** — Giden mesajın ücretli olup olmadığını belirler: ücretsiz giriş noktası her zaman bedava, service pencere içinde bedava, utility pencere içinde bedava dışında ücretli, marketing ve authentication her zaman ücretli.
- **Bölgesel tarife kartı (`RATE_CARD`)** — TR, US ve default bölgeleri için kategori bazlı USD birim fiyatları (örn. TR marketing 0.0109, utility/authentication 0.0009, service 0); Meta TR 2026-04-01 tarifesine dayalı tohum veri.
- **Hacim kademesi tipi (`VolumeTier`)** — standard, growth ve scale olmak üzere üç aylık hacim kademesi.
- **Hacim kademesi indirim hesaplama (`volumeTier`)** — Aylık hacme göre kademe ve indirim çarpanı döner: 1M+ scale (0.8), 250K+ growth (0.9), altı standard (1.0).
- **Tek mesaj maliyeti hesaplama (`messageCost`)** — Bir mesajın USD maliyetini (4 ondalık) hesaplar; faturalanabilir değilse 0; bölge tarifesini hacim indirim çarpanıyla birleştirir, varsayılan bölge TR.
- **Aylık harcama tahmini (`monthlyEstimate`)** — Bir aylık mesaj listesinin toplam tahmini harcamasını hesaplar; hacim kademesi mesaj sayısından türetilir, sonuç 2 ondalığa yuvarlanır.

### AI Agent Studio (AgentStudio)

- **AI Agent Studio üç sütunlu düzen** — Geniş ekranda 16rem/1fr/20rem grid ile agent listesi, tasarım alanı ve test+yayın panelini yan yana gösterir; responsive olarak tek sütuna iner.
- **Agent listesi ve seçimi** — Sol sütunda tüm AI agent'ları ad ve durum rozetiyle (draft/testing/published) listeler; tıklanınca `selectAgent` ile aktif edilir ve `aria-current` ile vurgulanır.
- **Yeni agent oluşturma** — İsim girişi ve artı butonuyla `createAgent` çağrılır; sonrası giriş temizlenir; alan placeholder/aria-label ile etiketlenir.
- **Agent durum rozeti tonlaması** — draft=neutral, testing=warning, published=positive (`statusTone`); durum metinleri i18n ile çevrilir.
- **Agent ad ve hedef düzenleme** — Orta panelde aktif agent'ın adı (`setName`) ve hedefi (`setGoal`, çok satırlı textarea) düzenlenir.
- **Kanal seçimi (webchat/whatsapp/voice/email)** — Agent'ın çalışacağı kanallar onay kutularıyla seçilir; `CHANNELS` sabiti kanalları sunar, `toggleChannel` ile açılıp kapatılır.
- **Araç (Tool) etkinleştirme** — Tanımlı araçlar onay kutularıyla `toggleTool` ile etkinleştirilir/devre dışı bırakılır; her araç id ve label ile listelenir.
- **Intent yönetimi — liste ve silme** — Niyetler etiket ve örnek ifadeleriyle (phrases) listelenir; her satırda çöp kutusuyla `removeIntent` ile silinir.
- **Intent ekleme formu** — Etiket, virgülle ayrılmış örnek ifadeler ve yanıt alanlarıyla `addIntent`; ifadeler virgülden bölünüp trim edilir, boşlar atılır; tüm alanlar dolu değilse eklenmez, başarıdan sonra form temizlenir.
- **Sandbox test konuşması** — Sağ panelde agent ile yazılı sohbet; ifade gönderince `runTest` çalışır, `testLog` konuşma balonları olarak gösterilir, agent ve user mesajları farklı hizalama/renk ve ikonlarla (Robot/User) ayrışır.
- **Sandbox Enter ile gönderme + boş giriş engeli** — Test girişinde Enter mesaj gönderir (varsayılan engellenir); gönder butonu ve `send` boş/whitespace ifadelerde devre dışıdır.
- **Boş sandbox durumu** — Test log boşken Robot ikonlu EmptyState ile boş sandbox mesajı gösterilir.
- **Çözüm oranı ve çalıştırma metrikleri** — Sandbox başlığında çözüm oranı (`resolutionRate` yüzdeye yuvarlanmış) accent rozetiyle, altında toplam çalıştırma sayısı (`agent.metrics.runs`) gösterilir.
- **Yayınlama (Publish) hazırlık kontrolü** — `agentReady` ile yayına hazırlık denetlenir; hazırsa Yayınla butonu görünür (zaten published ise devre dışı, "Yayında"), değilse eksik gereksinimler (`ready.missing`) uyarı kutusunda i18n çevirileriyle listelenir.

### Studio motoru & state (studio / studioStore)

- **AI Agent Studio yardımcıları** — Yapay zeka ajanı oluşturma için doğrulama, niyet eşleştirme, test çalıştırma ve metrik hesaplama sağlayan framework-bağımsız, birim test edilebilir saf yardımcılar.
- **Metin tokenizasyonu (`tokens`)** — Metni küçük harfe çevirip noktalama/sembolleri temizleyerek kelime tokenlarına böler; çok dilli (Unicode harf/sayı) destekli niyet eşleştirmenin temeli.
- **Niyet eşleştirme (`matchAgentIntent`)** — Kullanıcı metnini niyet ifadeleriyle token örtüşmesine göre puanlayıp en iyi eşleşen niyeti döner (yoksa null); bir ifadenin tüm tokenları metinde geçiyorsa puan kazanır.
- **Ajan yayın hazırlık kontrolü (`agentReady`)** — Yayından önce eksik gereksinimleri (name, goal, channels, intents) döner ve hazır olup olmadığını (`ok`) belirtir; yayın butonu/gate akışını besler.
- **Ajan test çalıştırma (`runAgentTest`)** — Ajanın bir ifadeye vereceği yanıtı simüle eder; eşleşen niyet varsa o niyetin yanıtını çözümlenmiş, yoksa ekibe yönlendirme mesajıyla çözümlenmemiş (deflection) döner.
- **Otomatik çözüm oranı (`resolutionRate`)** — Çözülen ÷ toplam çalıştırma oranını 0..1 hesaplar; hiç çalıştırma yoksa 0; stüdyo metrik panelinde otomasyon başarısı göstergesi.
- **AI Agent Studio store** — `useStudioStore`; agent listesi, aktif agent ve test günlüğünü tutar; başlangıçta `STUDIO_AGENTS` mock verisini klonlayarak yükler ve ilk ajanı aktif yapar.
- **Ajan seçme (`selectAgent`)** — Bir ajanı aktif hale getirir; ajan değişince `testLog` sıfırlanır, sandbox temiz başlar.
- **Yeni ajan oluşturma (`createAgent`)** — Verilen isimle taslak ajan üretir; isim boşsa "New agent"; kanallar/araçlar/intent'ler boş, metrikler sıfır (runs:0, resolved:0), yeni ajan otomatik aktif edilir.
- **Ajan adını düzenleme (`setName`)** — Aktif ajanın adını günceller.
- **Ajan hedefini düzenleme (`setGoal`)** — Aktif ajanın amacını/hedefini metin olarak günceller.
- **Kanal açma/kapama (`toggleChannel`)** — Aktif ajan için kanalı (webchat/whatsapp/voice/email) ekler veya kaldırır.
- **Araç etkin/devre dışı (`toggleTool`)** — Aktif ajanın bir aracının `enabled` bayrağını tersine çevirir.
- **Intent ekleme (`addIntent`)** — Aktif ajana yeni niyet ekler; id otomatik üretilir (`ai_new_*`); niyetler eşleşme cümleleri (phrases) içerir.
- **Intent silme (`removeIntent`)** — Aktif ajandan id'ye göre niyet kaldırır.
- **Ajanı yayınlama (`publish`)** — Aktif ajanın durumunu 'published' yapar.
- **Ajan test sandbox'ı (`runTest`)** — Bir ifadeyi aktif ajana karşı çalıştırır; `runAgentTest` ile yanıt/intent/çözüm üretir; hem kullanıcı hem ajan dönüşünü (intentId ile) test günlüğüne ekler.
- **Test metrik takibi** — Her testte aktif ajanın `metrics.runs` 1 artar; talep çözüldüyse `metrics.resolved` de artar.
- **Test günlüğünü sıfırlama (`resetTest`)** — `testLog`'u boşaltarak sandbox'ı sıfırdan başlatır.
- **Derin kopya ile mutasyon güvenliği (`cloneAgent`)** — Ajanı ve içindeki dizileri (channels, knowledge, tools, intents+phrases) ile metrics nesnesini derin kopyalar; mock veriyi referansla değiştirmeyi önler.
- **Aktif ajana hedefli patch (`patchActive`)** — Yalnızca aktif ajanı dönüştürüp diğerlerini olduğu gibi bırakan yardımcı; tüm tekil ajan güncellemeleri bu helper üzerinden immutable yapılır.

### İş Gücü Optimizasyonu paneli (WorkforcePanel / WFO/WEM)

- **İş Gücü Optimizasyonu (WFO/WEM) paneli** — İki kolonlu (`lg:grid-cols-2`) responsive grid içinde tahmin/personel, uyum ve kalite kartlarını barındıran ana iş gücü yönetim paneli.
- **Tahmin & personel tablosu** — ChartLineUp ikonlu tam genişlik kart; interval bazında hacim, gereken, planlanan ve açık (gap) sütunlarıyla personel tahmini tablosu.
- **Hacim düzenleme (inline input)** — Her interval satırında `type=number, min=0` input ile tahmini hacim düzenlenir; `onChange` ile `setVolume(id, value)` çağrılır (focus-visible ring destekli).
- **Personel açığı rozeti (Gap Badge)** — `staffingGap` (planlanan − gereken) hesaplanır; negatifse danger, sıfırsa neutral, pozitifse positive Badge; pozitiflere "+" öneki eklenir.
- **Self-Heal (kendini iyileştirme) aksiyonu** — Yalnızca gap < 0 satırlarda görünen Plus butonu; tıklanınca `bumpScheduled(id)` ile o interval'in planlanan personelini 1 artırır.
- **Yetersiz personel uyarı rozeti** — `understaffed(intervals)` ile açık interval sayısı hesaplanır; >0 ise Lightning ikonlu warning Badge ("understaffed", n adet) başlıkta uyarı gösterir.
- **Tahmini yeniden üret (Regenerate)** — ArrowsClockwise ikonlu secondary buton; `regenerateForecast` ile tüm interval'leri Erlang-benzeri occupancy yaklaşımıyla yeniden hesaplar.
- **Uyum (Adherence) kartı** — Gauge ikonlu kart; her ajan için planlanan ile uyumlu dakika oranını yüzdeye çevirip ilerleme çubuğuyla gösterir.
- **Uyum yüzdesi renk kodlaması** — ≥90 positive, ≥80 warning, altı danger; hem metin hem ilerleme çubuğu dolgu rengi bu eşiklere göre değişir (motion-reduce destekli).
- **Kalite karnesi (Quality Scorecard) kartı** — ClipboardText ikonlu kart; seçilen ajan için ağırlıklı kriterleri puanlayıp QA değerlendirmesi kaydetmeyi sağlar.
- **Ajan seçimi (dropdown)** — `AGENTS` listesinden değerlendirilecek ajanı seçen, etiketli (label htmlFor) select; varsayılan ilk ajan, state `agentId` ile yönetilir.
- **Kriter puanlama (0-5 skalası)** — Her kriter için ağırlığı (×weight) gösterilir ve 0–5 arası select ile puanlanır; aria-label kriter adıdır, `scores` state'i kriter id bazında güncellenir.
- **Canlı toplam skor (Live Total)** — `scorecardTotal` ile 0..100 normalize ağırlıklı toplam anlık hesaplanıp accent Badge ile gösterilir.
- **Skor kaydetme (Save Score)** — Plus ikonlu primary buton; `addEvaluation(agentId, 'cv_1', scores)` ile puanları yeni QA değerlendirmesi olarak ekler (artan `qa_new_<seq>` id).
- **Geçmiş değerlendirmeler listesi** — Kaydedilmiş QA değerlendirmeleri; ajan adı, ilgili `conversationId` ve `scorecardTotal` ile hesaplanan positive skor rozeti listelenir.
- **Ajan adı çözümleme (`agentName`)** — `AGENTS` içinde id ile ajanı bulup adını döner, bulamazsa id'yi döner; adherence ve değerlendirme listelerinde kullanılır.

### WFO motoru & state (wfo / wfoStore)

- **WFO/WEM Zustand store** — `useWfoStore`; intervals, shifts, adherence, criteria, evaluations state'i ve `setVolume`, `bumpScheduled`, `regenerateForecast`, `addEvaluation` aksiyonlarını barındırır; `setVolume` negatif hacmi 0'a kırpar ve satırı recompute eder.
- **Personel aralıkları state'i (intervals)** — Gün içi her aralık için tahmini hacme karşı planlanan/gereken ajan sayısını tutar; `STAFFING` mock'undan türetilir ve gereken ajan otomatik hesaplanır.
- **Vardiya listesi state'i (shifts)** — Ajanların başlangıç/bitiş saatli vardiyalarını tutar; `SHIFTS` mock'undan kopyalanır.
- **Uyum verisi state'i (adherence)** — Ajan bazında planlanan ve programa uyan dakikaları tutan satırlar; `ADHERENCE` mock'undan yüklenir.
- **Kalite scorecard kriterleri state'i (criteria)** — Ağırlıklı kriterleri (id, etiket, ağırlık) tutar; `SCORECARD` mock'undan yüklenir.
- **QA değerlendirmeleri state'i (evaluations)** — Tamamlanmış değerlendirmeleri tutar; her biri ajan, konuşma ve kriter başına 0-5 puan içerir; `QA_EVALUATIONS` mock'undan derin kopya ile yüklenir.
- **Tahmin yeniden hesaplama (`regenerateForecast`)** — Tüm aralıklar için mevcut hacme dayanarak gereken ajan sayısını yeniden hesaplar.
- **Tahmini hacim düzenleme (`setVolume`)** — Bir aralığın hacmini günceller (negatif 0'a sabitlenir) ve gereken ajanı anında yeniden hesaplar (canlı yeniden hesaplama).
- **İntraday kendi kendini iyileştirme (`bumpScheduled`)** — Yetersiz personelli aralığa tek tıkla bir ajan ekleyerek planlanan sayısını artırır (self-healing).
- **QA değerlendirmesi ekleme (`addEvaluation`)** — Bir ajan/konuşma için kriter başına puanlarla yeni değerlendirme ekler; benzersiz artan id (`qa_new_N`) atar.
- **Gereken ajan hesaplama (`requiredAgents`/recompute)** — Occupancy tabanlı Erlang-C yaklaşımıyla `ceil(hacim × AHT ÷ (aralık × hedef doluluk))`; store yüklenirken ve hacim değiştikçe uygulanır. Demo sabitleri: AHT=240sn, interval=1800sn, occupancy=0.85.
- **Personel açığı hesaplama (`staffingGap`)** — Bir aralık için planlanan eksi gereken ajan farkını döner; negatif değer yetersiz personeli gösterir.
- **Uyum oranı hesaplama (`adherence`)** — `min(adherentMin, scheduledMin) ÷ scheduledMin` (0..1, cap'li); planlanan 0 ise 0 döner.
- **Ağırlıklı scorecard toplamı (`scorecardTotal`)** — Her kriterin (puan/5)×weight kazanımının toplamı ÷ toplam ağırlık, 0..100 yuvarlanmış; eksik puanları 0 sayar, toplam ağırlık 0 ise 0 döner.
- **Yetersiz personel aralıkları (`understaffed`)** — Planlanan sayının gerekenden az olduğu aralıkları filtreleyerek self-healing intraday adaylarını listeler.
- **Sabit WFO parametreleri** — Ortalama işlem süresi (`WFO_AHT_SEC`), aralık uzunluğu (`WFO_INTERVAL_SEC`) ve hedef doluluk (`WFO_OCCUPANCY`) sabitleri tüm personel hesaplamalarının girdileridir.

### Konuşma state & gerçek zamanlı olaylar (conversationStore)

- **Konuşma store (Zustand)** — `useConversationStore`; aktif konuşma id'si, `setActive` ve konuşma listesini yönetir; layout boyunca seçim ve filtreleme bu store üzerinden yapılır.
- **Konuşma store başlangıç ve klonlama** — `CONVERSATIONS` mock'unu derin kopyalayarak (labels/messages dizileri ayrıştırılarak) başlatır; ilk konuşmayı aktif seçer ve agents listesini yükler.
- **Store sıfırlama (`reset`)** — Konuşmaları yeniden klonlayarak temiz duruma döndürür, ilk konuşmayı aktif yapar ve round-robin indeksini -1'e sıfırlar.
- **Aktif konuşma seçimi (`setActive`)** — Bir konuşmayı aktif işaretler ve seçildiğinde okunmamış (unread) sayacını sıfırlar.
- **Yanıt gönderme (`sendReply`)** — Aktif konuşmaya temsilci adına giden (out) mesaj ekler; temsilci ID ve metniyle ilişkilendirilir.
- **İç not ekleme (`addNote`)** — Yalnızca ekip içi görünen (private) not ekler; `authorType='note'` işaretlenir.
- **Manuel temsilci atama (`assign`)** — Belirtilen konuşmayı seçilen temsilciye atar (`assigneeId` günceller).
- **Round-robin otomatik atama (`assignNext`)** — `rrIndex` döngüsel sayacıyla `pickAgent` üzerinden sıradaki uygun temsilciyi seçer, indeksi günceller ve atar; uygun yoksa işlem yapmaz.
- **Konuşma durumu değiştirme (`setStatus`)** — Konuşma durumunu (open/pending/snoozed/resolved) günceller.
- **Öncelik değiştirme (`setPriority`)** — Konuşma öncelik seviyesini (urgent/high/medium/low/none) günceller.
- **Etiket ekleme (`addLabel`)** — Konuşmaya yeni etiket ekler; varsa tekrar eklemez (yinelenmeyi önler).
- **Etiket kaldırma (`removeLabel`)** — Konuşmadan belirtilen etiketi filtreleyerek çıkarır.
- **Makro uygulama (`applyMacro`)** — Makroyu `expandMacro` ile açıp tek seferde durum, öncelik, atama ve etiketleri (set ile yinelemesiz) günceller; makroda hazır yanıt varsa temsilci mesajı olarak ekler.
- **CSAT puanı gönderme (`submitCsat`)** — Konuşmaya müşteri memnuniyet puanını (rating) kaydeder.
- **Gerçek zamanlı olay uygulama (`applyEvent`)** — Dış `SupportEvent` olaylarını işler: `conversation.opened` (yoksa başa ekler), `conversation.assigned`, `conversation.resolved`, `message.received` (yinelemeyi atlayıp okunmamışı artırır), `csat.submitted` ve `ai.suggestion` (UI'da gösterilir, state değişmez); canlı/streaming güncellemeleri simüle eder.
- **Yeni gelen mesajda okunmamış artışı** — `message.received` olayında mesaj eklenir ve okunmamış sayacı bir artar; aktif konuşma açıldığında `setActive` ile sıfırlanır.
- **Mesaj yineleme/idempotent koruması** — `message.received` ve `conversation.opened` akışlarında ID kontrolü yapılır; aynı ID'li mesaj/konuşma tekrar gelirse yok sayılır.
- **Mesaj geçmişi sınırlama (capArray 300)** — Her konuşmanın mesaj listesi 300 öğeyle sınırlandırılır; yeni mesaj eklenince en eskiler düşürülür.
- **Benzersiz mesaj ID üretimi** — Zaman damgası ve artan sayaç (`seq`) ile `m_<timestamp>_<n>` formatında benzersiz mesaj id üretir.
- **Mesaj fabrikası ve varsayılanları (`newMessage`)** — Yeni mesajları varsayılanlarla (out yönü, agent yazar tipi, boş gövde, tMinutes 0) üretir ve verilen partial ile üzerine yazar.
- **Round-robin atama indeksi state (`rrIndex`)** — Temsilciler arası sıralı atamayı takip eden döngüsel sayaç; -1 başlar ve `assignNext` ile ilerler.
- **Kimlik (auth) store entegrasyonu** — `useAuthStore`'dan mevcut kullanıcı `principal.id` alınır (yoksa 'usr_1'); gönderilen yanıt/notların yazarı olarak kullanılır.

### Inbox state (inboxStore)

- **Inbox Zustand store** — `useInboxStore`; inbox listesi, aktif inbox id'si ve durum filtresini global yönetir; `setInbox`/`setFilter`/`reset` aksiyonlarını sunar, `INBOXES` mock'uyla ve varsayılan tüm inbox + all filtre ile başlar.
- **Aktif inbox seçimi (tümü dahil)** — `activeInboxId` null iken tüm inbox'lar gösterilir; `setInbox(id)` ile belirli kanala daraltılır.
- **Durum filtresi (status filter)** — `filterStatus` 'all' veya bir `ConversationStatus` alır; `setFilter` ile open/pending/snoozed/resolved arasında geçişle liste filtrelenir.
- **Filtreleri sıfırlama (`reset`)** — `activeInboxId`'yi null, `filterStatus`'u 'all' yaparak filtre/seçim durumunu varsayılana sıfırlar.
- **StatusFilter veri modeli** — Filtre tipi 'all' veya `ConversationStatus` birleşimi; nav butonları ve filtreleme bu tipe dayanır.

### API & entegrasyon katmanı

- **Konuşmaları getirme API (GET /conversations)** — `fetchConversations`, mock `CONVERSATIONS` verisini ~150ms gecikmeyle döndüren Promise tabanlı API; Chatwoot-ACL FastAPI kontratını taklit eder.
- **Inbox'ları getirme API (GET /inboxes)** — `fetchInboxes`, mock `INBOXES` verisini gecikmeyle döndürür.
- **Kişileri getirme API (GET /contacts)** — `fetchContacts`, mock `CONTACTS` verisini gecikmeyle döndürür.
- **Bilgi tabanı arama API (GET /kb?q=)** — `searchKbRemote`, `q` metnine göre `KB_ARTICLES` içinde `searchKb` ile arama yapıp eşleşen `KbArticle` listesi döndürür.
- **AI yanıt önerisi API (POST /ai/suggest)** — `aiSuggest`, konuşmanın son gelen (in) mesajına göre Captain-tarzı taslak yanıt üretir; insan onayından önce taslak sunar (niyet bazlı üç deterministik öneri).
- **Simüle edilmiş ağ gecikmesi yardımcısı (`delay`)** — Herhangi bir değeri varsayılan 150ms gecikmeyle Promise olarak çözer; gerçek ağ çağrılarını taklit ederek loading durumlarını simüle eder.
- **WebSocket canlı güncelleme kontratı (`conversation.*`)** — Canlı güncellemeler `conversation.*` WS olayları üzerinden gelir; mock API bu gerçek-zamanlı kontratın yerine geçer.
- **Gerçek zamanlı domain olayları (SupportEvent / WS sözleşmesi)** — `conversation.opened/assigned/resolved`, `message.received`, `ai.suggestion` ve `csat.submitted` olaylarını içeren tipli WS olay sözleşmesi; mock → WebSocket geçişi için ACL kontratı.
- **AI yanıt önerisi olayı (`ai.suggestion`)** — Bir konuşmaya AI tarafından üretilmiş yanıt metni önerisi akışı; ajana hazır yanıt önerme yeteneği.
- **Carrier-agnostik transport katmanı (ACL)** — Chatwoot backend'inin `conversation.*` WS akışı ve REST'i; UI yalnızca kontrat şekillerini tüketir, transport'u (mock → httpClient/WebSocket) değiştirir; backend bağımsızlığı sağlar.
- **AI ajan bilgi kaynakları (knowledge)** — Ajana bağlı bilgi kaynakları `kind` ile tiplenir: kb (yardım merkezi makaleleri) ve url (refund policy, pricing page); ajanın yanıt üretmek için kullandığı dayanakları modeller.

### Paylaşılan domain yardımcıları & UI primitive'leri

- **Çerçeve-bağımsız domain yardımcıları (`support.ts`)** — Saf (framework-free), birim test edilebilir omnichannel destek domain fonksiyonları; UI'dan bağımsız iş mantığı katmanı.
- **Round-robin ajan atama (`pickAgent`)** — Müsait ajanlar arasında sıradaki ajanı seçer; son atanan indeksten döngüsel ilerler (wrap), müsait olmayanları atlar, hiç müsait yoksa null döner.
- **SLA durumu hesaplama (`slaState`)** — SLA bitiş zamanına göre durum üretir: dolmuşsa 'breached', son 5 dakika içindeyse 'due_soon', aksi halde 'ok'.
- **Makro genişletme (`expandMacro`)** — Makro aksiyon listesini tek konuşma patch'ine indirger: reply, status, priority, assign ve birden çok label aksiyonunu birleştirir.
- **Hazır yanıt değişken yerleştirme (`renderCanned`)** — Gövdedeki `{{degisken}}` yer tutucularını verilen değerlerle değiştirir; tanımsız değişkenler korunur.
- **CSAT ortalaması (`csatAverage`)** — Puanlı konuşmalar üzerinden ortalama memnuniyeti iki ondalığa yuvarlar; puanlı konuşma yoksa 0 döner.
- **Bilgi tabanı arama (`searchKb`)** — KB makalelerini başlık ve gövde üzerinden büyük/küçük harf duyarsız alt-dize aramasıyla filtreler; boş sorguda hepsini döner.
- **`MacroPatch` / `SlaState` tipleri** — `MacroPatch` (reply, status, priority, labels, assigneeId) ve `SlaState` ('ok' | 'due_soon' | 'breached'); makro ve SLA mantığının veri sözleşmesi.
- **Kişi adı çözümleme yardımcısı (`contactName`)** — Kişi ID'sini `CONTACTS`'tan okunabilir ada çevirir; eşleşme yoksa ham ID döner.
- **Temsilci adı çözümleme yardımcısı (`agentName`)** — Opsiyonel temsilci ID'sini `AGENTS`'tan ada çevirir; ID yoksa undefined, eşleşme yoksa ham ID döner.
- **Öncelik ikon ve renk haritası (`PRIORITY`)** — Beş öncelik seviyesini (urgent, high, medium, low, none) ikon ve renk tonuyla (danger/warning/accent/muted) eşler.
- **Kanal ikon haritası (`CHANNEL_ICON`)** — Yedi omnichannel kanal türünü (livechat, email, whatsapp, instagram, facebook, telegram, sms) marka/tür ikonlarıyla eşler.
- **SLA durum ikonları (`SlaIcon`)** — SLA göstergesi için Clock ve WarningCircle ikonlarını bir araya getirir.
- **Tasarım sistemi primitive bileşenleri** — Badge, Button, Card, EmptyState, IconButton gibi paylaşılan UI primitive'leri ve `cn()` yardımcısıyla tutarlı stil; tema token'ları (text-fg, bg-surface, text-accent, border-border, text-muted, text-warning) kullanılır.
- **Erişilebilirlik (a11y) detayları** — `aria-current` (aktif öğe), `aria-label`/`sr-only` (etiketsiz girişler), `aria-hidden` (dekoratif ikonlar/progress), `aria-pressed` (filtre chip'leri), `aria-live="polite"` (dinamik bölgeler), focus-visible ring odak halkaları ve IconButton label'ları ile erişilebilirlik sağlanır; ilerleme çubuklarında motion-reduce desteği bulunur.

### Domain tipleri & veri modelleri

- **Mock veri katmanı (data) ve domain tipleri** — API, data modülünden `CONTACTS`, `CONVERSATIONS`, `INBOXES`, `KB_ARTICLES` mock yapılarını ve types modülünden `Contact`, `Conversation`, `Inbox`, `KbArticle` tiplerini kullanır; OpenAPI tipli httpClient'a geçişte UI/store'lar değişmeden kalacak şekilde tasarlanmıştır.
- **Omnichannel birleşik gelen kutusu modeli** — Live-chat, e-posta, WhatsApp, Instagram, Facebook, Telegram ve SMS kanallarını tek ajan gelen kutusunda birleştiren Chatwoot tarzı model; kanal tipi `ChannelType` olarak modellenir.
- **Inbox (kanal kutusu) tanımı & veri modeli** — `Inbox`: id, channelType, name, opsiyonel `connection` (connected/coexistence/pending/disconnected) ve `provider` (cloud_api/bsp/native) alanlarından oluşan, gelen kutularını kanala göre gruplayan temel sözleşme.
- **Kanal bağlantı yaşam döngüsü** — Bir kanalın bağlantı durumunu (connected, coexistence, pending, disconnected) izler; Embedded Signup → Coexistence → canlı akışını temsil eder.
- **Kanal sağlayıcı tipi (`ChannelProvider`)** — Numara/kanalın kim tarafından sağlandığını (cloud_api, bsp, native) belirtir; provisioning kaynağını ayırt eder.
- **Gelen kutuları (Inbox kanalları) seed** — Beş omnichannel inbox: Website chat, WhatsApp, Support email, Telegram bot ve Instagram DM; her biri kanal tipi, ad, bağlantı durumu ve sağlayıcı taşır.
- **Inbox bağlantı durumları seed** — connected, coexistence (WhatsApp), pending (Telegram) ve disconnected (Instagram) durumlarıyla kanal sağlık/kurulum durumunu görselleştirir.
- **Konuşma (Conversation) varlığı** — Bir konuşmayı workspace, inbox, kişi, atanan ajan, durum, öncelik, SLA bitiş zamanı, etiketler, okunmamış sayısı, CSAT ve mesaj listesiyle modeller; gelen kutusunun merkezi varlığı.
- **Konuşma listesi seed** — Dört örnek konuşma; her biri inbox, kişi, atanan temsilci, durum, öncelik, SLA bitiş, etiketler, okunmamış sayısı ve mesaj geçmişi içeren tam omnichannel kayıt.
- **Konuşma durumları (Status)** — open, pending, snoozed, resolved; gelen kutusu sekmeleri, durum filtreleri ve makro durum aksiyonları için kullanılır.
- **Konuşma öncelik seviyeleri (Priority)** — urgent, high, medium, low, none; sıralama, etiketleme ve makro öncelik aksiyonları için temel.
- **Workspace kapsamı (çoklu workspace)** — Konuşmalara opsiyonel `workspaceId` (ws_core, ws_growth) ile workspace atanır; tanımsızsa her yerde görünür (J5).
- **Konuşma atama (Assignee)** — Konuşmalar `assigneeId` ile bir ajana atanabilir; atama filtreleri ve `conversation.assigned` olayıyla çalışır.
- **SLA takibi** — Konuşmada `slaDueAt` (epoch ms) ile SLA bitiş zamanı tutulur (cv2'de geçmiş zaman ihlali, cv1'de yaklaşan süre); SLA sayacı/uyarısı için veri sağlar.
- **Okunmamış sayacı (unread)** — Her konuşmadaki okunmamış mesaj adedi (örn. cv2'de 2) liste kartında rozet olarak gösterilir.
- **Etiketler (labels)** — Konuşmalara serbest etiket listesi (billing, bug-report); filtreleme ve makro etiket aksiyonuyla otomatik eklenmeyi destekler.
- **CSAT memnuniyet puanı** — Konuşma bazında 1-5 CSAT (örn. çözülmüş cv4'te 5); `csat.submitted` olayıyla güncellenir, QA için kullanılır.
- **Mesaj akışı (yön ve yazar tipi)** — Mesajlar `direction` (in/out), `authorType` (contact/agent/bot/note), `authorId`, `body` ve göreli zaman (`tMinutes`) ile modellenir; gelen/giden balon ayrımı ve zaman damgası gösterimini sağlar.
- **Mesaj öğesi (MessageItem)** — Konuşma içi bir mesajı gövde, yön, yazar, zaman (dakika), gizli not bayrağı ve eklerle modeller.
- **Dahili not (private note)** — `MessageItem` üzerindeki `private` bayrağı ve `note` yazar tipiyle ajanların müşteriye görünmeyen dahili not bırakmasını sağlar.
- **Mesaj ekleri (attachments)** — Mesajlara ad ve görsel olup olmadığı (`isImage`) bilgisiyle ek iliştirilir; sohbet alanında dosya/görsel önizlemesi için `SupportAttachment` modeli.
- **Kişi (Contact) profili & rehberi** — Müşteriyi ad, kimlik bilgileri (e-posta, telefon, sosyal) ve serbest öznitelik haritasıyla modeller; seed olarak üç kişi (Jordan Blake, Dana Wu, Leo Pratt).
- **Çoklu kanal kimlik eşleme (identifiers)** — `Contact.identifiers` email, phone ve social alanlarını birleştirerek aynı kişinin farklı kanallardaki kimliklerini tek profilde toplar.
- **Kişi öznitelikleri (CRM attributes)** — `Contact.attributes` serbest anahtar-değer (plan: Pro/Enterprise/Free, company) ile CRM benzeri bağlam taşır; konuşma panelinde gösterilir.
- **Temsilci (Agent) varlığı & listesi** — Ajanları id, ad, müsaitlik (`available`) ve beceriler (`skills`) ile modeller; seed olarak üç temsilci (You, Sora Kim, Devin Roy).
- **Müsaitlik ve yetkinlik bazlı yönlendirme verisi** — `Agent.available` ve `skills` (billing, tier1, tier2) temsilcinin çevrimiçi olup olmadığını ve hangi beceri kuyruğuna yatkın olduğunu modeller; skill-based routing'i destekler.
- **Makrolar (Macro) — çok adımlı otomasyon** — `Process refund`, `Escalate to tier 2` gibi makrolar tek tıkla zincirleme aksiyon yürütür: reply (hazır yanıt), label, status, priority ve assign.
- **Makro aksiyon tipleri (MacroAction)** — reply, label, status, priority, assign türlerinde olabilir; bir konuşmada sıralı toplu işlemleri tek butonla tetikler.
- **Hazır yanıtlar (canned responses)** — Kısa kodla çağrılan şablonlar (`/hi`, `/refund`, `/hours`); composer'da slash kısayoluyla hızlı yanıt eklemeyi sağlar.
- **Hazır yanıt değişken yer tutucuları** — Canned gövdeleri `{{name}}`/`{{plan}}` gibi yer tutucular içerir; kişi/öznitelik verisinden dinamik kişiselleştirme öngörür.
- **Bilgi bankası makaleleri (KB) seed** — Üç yardım makalesi (yanlış fatura, export 500 hatası, plan yükseltme) başlık ve gövdeyle tanımlı; konuşma içi öneri/arama için.
- **KB makale veri modeli (`KbArticle`)** — `{id, title, body}` yapısı; ajanlara yanıt önerisi/referans için kullanılır.
- **WFO/WEM tahmin sabitleri seed** — Demo sabitleri: AHT 240sn, aralık 1800sn (30 dk), hedef occupancy 0.85; personel ihtiyacı hesaplamasının girdileri.
- **Personel planlama aralıkları (staffing) seed** — Saatlik aralıklar (09:00-12:00) için tahmini hacim, gereken ve planlanmış temsilci sayısı.
- **Vardiya planı (shifts) seed** — Temsilcilere atanmış başlangıç/bitiş saatli vardiyalar (usr_1 09:00-17:00, usr_3 10:00-18:00).
- **Plana uyum (adherence) metrikleri seed** — Her temsilci için planlanan ve uyulan dakika (scheduledMin/adherentMin) ile schedule adherence hesabı.
- **Kalite değerlendirme skorkartı (scorecard) seed** — Ağırlıklı QA kriterleri: Greeting & empathy (1), Resolution quality (3), Tone & clarity (2), Compliance (2).
- **QA değerlendirmeleri seed** — Bir temsilci/konuşma için kriter bazlı skorlar (sc_greet:5, sc_resolve:4 vb.); kalite denetim sonuçlarını tutar.
- **WFO/WEM veri modelleri (tipler)** — `StaffingInterval` (id, label, forecastVolume/forecast, required, scheduled), `Shift` (ajan + başlangıç/bitiş), `AdherenceRow` (agentId, scheduledMin, adherentMin), `ScorecardCriterion` (id, label, weight), `QaEvaluation` (id, agentId, conversationId, scores).
- **AI Agent Studio botları seed** — İki ajan: Support Concierge (yayında) ve Sales Assistant (taslak); her biri hedef, kanallar, durum, bilgi kaynakları, araçlar, niyetler ve metrikler içerir.
- **AI ajan hedef ve kanal yapılandırması** — `StudioAgent.goal` serbest amaç metni ve `channels` (webchat, whatsapp) ajanın çalışacağı kanalları; `status` published/draft yayın durumunu yönetir.
- **AI ajan araçları (tool toggle)** — Ajana bağlı araçlar (Create ticket, Look up order, Issue refund, Book meeting) `enabled` bayrağıyla tek tek açılıp kapatılır.
- **AI ajan niyetleri (intents)** — Niyet tanımları: tetikleyici ifadeler (phrases) ve hazır yanıt (reply) (örn. Invoice question, Refund, Password reset); eşleşmede otomatik yanıt üretir.
- **AI ajan performans metrikleri** — `StudioAgent.metrics` runs ve resolved sayılarını tutar (örn. 420 çalıştırma / 318 çözüm); çözüm oranı/etkinliği gösterir.
- **Studio veri modelleri (types)** — `StudioAgent` (id, name, goal, channels, status, knowledge, tools, intents, metrics{runs, resolved}), `AgentChannel`, `AgentKnowledge` (kb/url/file), `AgentTool`, `AgentIntent` (id, label, phrases, reply), `AgentTestTurn` (who: user/agent, text, intentId) tipleri.


---

<a id="scheduling"></a>

## Scheduling sekmesi

Scheduling sekmesi, Calendly/Cal.com tarzı randevu yönetimini ve Zoom Spaces tarzı fiziksel kaynak (hot-desk / oda) rezervasyonunu tek bir modülde birleştirir. Üç görünüm arasında geçiş yapılarak ekipler etkinlik türlerini yönetir, herkese açık rezervasyon linkleri paylaşır ve çalışma alanındaki masa/odaları gün granülasyonunda rezerve eder.

### Ana akışlar ve görünümler

- **Üç sekmeli planlama görünümü (Konsol / Genel Sayfa / Çalışma Alanı)** — Sayfa üstünde ikon+etiketli üç sekme (Sliders/Globe/Armchair) ile Konsol, herkese açık rezervasyon sayfası ve çalışma alanı rezervasyonu arasında geçiş; seçili sekme accent renkle vurgulanır.
- **Konsol düzeni: liste + editör panelleri** — 3 kolonlu grid; solda EventTypeList, sağda EventTypeEditor, AvailabilityEditor ve BookingsCalendar dikey olarak dizilir.
- **Herkese açık rezervasyon sayfası (PublicBookingPage)** — Ziyaretçinin kendi başına randevu alabildiği, merkezlenmiş ve maksimum genişliği sınırlı (max-w-3xl) kart tabanlı kamuya açık ekran.
- **Üç adımlı rezervasyon sihirbazı (slot/form/done)** — Saat seçimi → iletişim bilgisi → onay olmak üzere üç adımlı state makinesi; adımlar arası ileri-geri geçiş yapılabilir.
- **Çalışma alanı rezervasyonu / Hot-desk / Oda ekranı (WorkspaceReservation)** — Zoom Spaces paritesinde masa ve toplantı odası rezervasyon arayüzü; solda 2 kolon masa/oda listesi, sağda 1 kolon kullanıcının kendi rezervasyonları (lg:grid-cols-3 duyarlı ızgara).

### Konsol panelleri

- **Etkinlik Türü Listesi (EventTypeList)** — Workspace'e göre filtrelenmiş etkinlik türlerini Card içinde liste halinde gösterir; her öğe seçilebilir buton, aktif öğe accent kenarlıkla vurgulanır.
- **Etkinlik türü seçimi** — Bir öğeye tıklayınca setActiveEventType ile o tür aktif yapılır.
- **Süre rozeti (dakika gösterimi)** — Her tür için Clock ikonu ve dakika cinsinden süre (scheduling.minutes).
- **Atama tipi ikonlu rozeti** — neutral Badge içinde roundrobin ise UsersThree, değilse User ikonu ve atama türü çevirisi.
- **Genel rezervasyon URL slug gösterimi** — Her tür için `aura.dev/{slug}` biçiminde rezervasyon bağlantısı truncate ile.
- **İlk yükleme iskeleti (ListSkeleton)** — useFirstLoad ile ilk yüklemede 5 satırlık ListSkeleton ve common.loading durumu.
- **Hover ve aktif görsel durumlar** — Aktif olmayan öğeler hover'da surface arka planına ve border-border'a geçer; aktif öğe border-accent ile vurgulanır (cn yardımcısı).
- **Etkinlik Türü Düzenleyici (EventTypeEditor)** — Seçili türü Card içinde düzenleyen panel: başlık, atama rozeti, süre/tampon/asgari bildirim alanları ve host listesi. Aktif tür yoksa hiç render edilmez.
- **Sayısal giriş alanı bileşeni (num helper)** — Etiket+değerli, type=number, min=0 tekrar kullanılabilir input; değişimde Number'a çevirip set eder.
- **Süre alanı düzenleme** — Etkinlik türünün dakika cinsinden süresini (durationMin) düzenler.
- **Sonrası tampon (bufferAfter) düzenleme** — Etkinlik sonrası bırakılacak tampon süreyi düzenler.
- **Asgari bildirim süresi (minNotice) düzenleme** — Rezervasyon için gereken asgari önceden bildirim süresini (minNoticeMin) düzenler.
- **Atama türü rozeti** — Türün atama tipini accent tonlu Badge'de, scheduling.assignment.* anahtarıyla çevrilmiş gösterir.
- **Host isimleri gösterimi** — hostIds dizisini HOST_NAMES eşlemesiyle okunabilir isimlere çevirip virgülle birleştirir; eşleşme yoksa ham id.
- **Müsaitlik düzenleyici kartı (AvailabilityEditor)** — Kullanıcının haftalık müsaitlik takvimini gösteren kart; store'daki ilk schedule kaydını okur.
- **Haftalık gün listesi (Pazar–Cumartesi)** — WEEKDAYS dizisi (0–6) üzerinden 7 günü sırayla, scheduling.weekday.X çevirisiyle listeler.
- **Gün başına çalışma saati aralığı gösterimi** — Güne ait kural varsa 'HH:MM – HH:MM', yoksa 'unavailable' (müsait değil) metni.
- **Görsel müsait/müsait değil ayrımı** — Kuralı olan günler vurgulu (text-fg), olmayanlar soluk (text-muted) renkte.
- **Rezervasyonlar takvimi kartı (BookingsCalendar)** — Yaklaşan rezervasyonları liste halinde gösteren kart; başlıkta CalendarCheck ikonu.
- **Rezervasyonları başlangıç saatine göre sıralama** — bookings kopyalanıp startMs'e göre artan (en yakın önce) 'upcoming' listesi.
- **Rezervasyon satırı: davetli + etkinlik türü** — Her satırda davetli adı (inviteeName) ve eventTypeId ile eşleşen tür başlığı.
- **Ev sahibi (host) adı gösterimi** — hostId varsa HOST_NAMES'ten host adı, yoksa ham hostId tarih satırının yanında.
- **Rezervasyon durumu rozeti (Badge) ve renk tonları** — confirmed=positive, rescheduled=accent, pending=warning, cancelled=danger ton eşlemesi.

### Rezervasyon aksiyonları (konsol)

- **Rezervasyon yeniden planlama aksiyonu (reschedule)** — Aktif rezervasyon için ArrowsClockwise ikon butonu; store reschedule ile başlangıcı 24 saat ileri taşır.
- **Rezervasyon iptal aksiyonu (cancel)** — X ikonlu iptal butonu; tıklanınca cancelId state'ini ayarlayarak onay diyaloğunu açar.
- **İptal edilmiş rezervasyonlarda aksiyonların gizlenmesi** — status 'cancelled' satırlarda yeniden planla ve iptal butonları render edilmez.

### Herkese açık rezervasyon akışı (PublicBookingPage)

- **Etkinlik türü başlık alanı** — Kart üstünde host adı, etkinlik başlığı, süre (dk), konum tipi ve saat dilimi; host adı HOST_NAMES'ten, yoksa hostId fallback.
- **Tarih seçici (date input)** — Native HTML date input; varsayılan değer bir sonraki iş günü. Tarih değişince slotlar yeniden hesaplanır.
- **Otomatik bir sonraki iş günü hesaplama (nextWeekdayISO)** — Bugünden sonraki ilk hafta içi gün (Cumartesi/Pazar atlanır), YYYY-MM-DD formatında.
- **Müsait saat slotlarının üretimi (generateSlots)** — Seçili takvim, etkinlik türü, tarih ve şu ana göre uygun slotlar; geçmiş saatler Date.now() ile elenir.
- **Saat slotu seçim listesi (listbox)** — Slotlar 3–4 sütunlu duyarlı grid içinde buton olarak; role=listbox/option ve aria-selected ile erişilebilir. Slota tıklayınca otomatik form adımına geçilir.
- **Boş slot durumu (empty state)** — Uygun slot yoksa 'scheduling.noSlots' mesajı.
- **Saat formatlama (fmtTime)** — Slot başlangıcı (ms) 2 haneli saat:dakika yerel formatında (toLocaleTimeString).
- **İletişim bilgisi formu (isim + e-posta)** — Controlled input; her ikisi trim sonrası boşsa onay butonu devre dışı.
- **Forma seçili saatin gösterimi** — Form adımında seçilen slot saati üstte formatlanmış gösterilir.
- **Geri dön butonu (slot adımına)** — Form adımında CaretLeft ikonlu 'geri' butonu ile saat seçimine dönüş.
- **Rezervasyon onaylama (confirm / book)** — Seçili slot ve dolu ad/e-posta varsa store book(eventTypeId, name, email, startMs) çağrılır ve 'done' adımına geçilir; eksik veride erken çıkış.
- **Rezervasyon onay ekranı (done)** — Yeşil tikli onay rozeti, 'booked' başlığı, seçilen saat ve etkinlik başlığı.
- **Takvime ekle / ICS indirme** — buildIcs ile .ics dosyası üretilip downloadText ile (text/calendar) indirilir; başlangıç, süre, başlık ve katılımcı e-postası ICS'e yazılır.
- **Hatırlatma zamanları gösterimi (reminders)** — reminderTimes(startMs, [1440, 60]) ile randevudan 1 gün ve 1 saat önce hatırlatma zamanları hesaplanıp yerel tarih-saat olarak listelenir.
- **Kaydedilmemiş değişiklik koruması (useUnsavedGuard)** — Ad/e-posta kısmen doldurulmuşsa, kazara yenileme/sekme kapatmaya karşı 'scheduling-booking' kimliğiyle uyarı.

### Çalışma alanı rezervasyonu (Hot-desk / oda)

- **Tarih seçimi (date picker)** — Native date input ile rezervasyon günü; setDate ile store dateISO'ya yazılır, müsaitlik bu güne göre hesaplanır.
- **Zaman dilimi (slot) seçici — AM / PM / Tam gün** — Üç düğmeli segment kontrolü: sabah (güneş), öğleden sonra (ay), tam gün (saat); aria-pressed ve role=group ile erişilebilir, seçili düğme accent renkle vurgulanır.
- **Doluluk oranı rozeti** — Seçili gün doluluk yüzdesi (occupancyRate × 100); %80+ danger, %50+ warning, altı positive tonla.
- **Masa/oda müsaitlik listesi** — Seçili tarih+slota göre deskAvailability ile hesaplanan liste; her satırda tür ikonu (oda=kapı, masa=koltuk), etiket, oda kapasitesi, konum (zone) ve olanaklar (amenities).
- **Masa/oda türü ayrımı (desk vs room)** — Odalar için kapı ikonu ve koltuk sayısı (seats), masalar için koltuk ikonu; olanaklar virgülle birleştirilir.
- **Müsait masayı rezerve etme** — Boş (free) masa/oda için 'Rezerve et' düğmesi store.reserve(deskId) çağırır.
- **Dolu masa göstergesi** — Boş olmayan masada rezervasyon yerine, masayı alan kişinin adını (memberName) gösteren nötr tonlu 'X tarafından alındı' rozeti.
- **Kendi rezervasyonlarım paneli** — Sağ kolonda seçili güne ait rezervasyonlar deskId'ye göre sıralı; her satırda masa etiketi, kullanıcı adı ve slot bilgisi.
- **Boş rezervasyon durumu (empty state)** — Seçili güne rezervasyon yoksa 'mineEmpty' mesajı.
- **Check-in (giriş yapma) aksiyonu** — Check-in yapılmamış rezervasyonda CheckCircle ikonlu buton store.checkIn(id) çağırır; yapılmışsa pozitif tonlu 'Giriş yapıldı' rozeti.
- **Rezervasyon iptali** — Her satırda X ikonlu IconButton store.cancel(id) ile iptal; erişilebilir etiketle.

### Paneller, diyaloglar ve ortak bileşenler

- **İptal onay diyaloğu (ConfirmDialog)** — Davetli adıyla kişiselleştirilmiş onay metni; onaylanınca store cancel çağrılır ve state sıfırlanır, kapatılınca cancelId temizlenir.
- **Zaman dilimi seçici (TimezonePicker)** — Globe ikonlu, etiketli native select ile saat dilimi seçimi sağlayan kontrollü bileşen (value/onChange props); etiket scheduling.timezone ile çevrilir.
- **Önceden tanımlı saat dilimi listesi (ZONES)** — Europe/Istanbul, Europe/London, America/New_York, America/Los_Angeles, Asia/Tokyo ve UTC olmak üzere altı sabit seçenek.
- **Liste dışı mevcut saat dilimini başa ekleme** — Seçili değer ZONES'ta yoksa listenin başına eklenerek seçili kalması garanti edilir.

### Veri ve state

- **Zustand Planlama Store (useSchedulingStore)** — Etkinlik tipleri, müsaitlik takvimleri, rezervasyonlar ve aktif etkinlik tipini tutan merkezi state kaynağı; tüm konsol/randevu akışını besler (eventTypes, activeEventTypeId, setActiveEventType, book, cancel, reschedule, schedules).
- **Çalışma Alanı Rezervasyon Store'u (useWorkspaceStore)** — Hot-desking/oda rezervasyonu için merkezi Zustand store: desks, reservations, dateISO, slot state'leri ve setDate, setSlot, reserve, checkIn, cancel aksiyonları.
- **Varsayılan Etkinlik Tipi Seçimi (J5)** — Seed sırasından bağımsız, çekirdek çalışma alanına (workspaceId null veya 'ws_core') ait bir tipi varsayılan aktif seçer; bulunamazsa ilk tipe düşer.
- **Aktif Etkinlik Tipi Seçme (setActiveEventType)** — Görüntülenen/üzerinde çalışılan etkinlik tipini değiştirir.
- **Randevu Oluşturma (book)** — Davetli ad/e-posta ve başlangıç zamanıyla yeni rezervasyon; bitişi etkinlik süresinden hesaplar, durumu 'confirmed', konumu etkinlik tipinden alır.
- **Round-Robin Host Atama (store)** — roundrobin atamalı tipte host'lar arasında rrIndex ile sırayla döner; aksi halde ilk host atanır.
- **Randevu İptali (store cancel)** — Verilen rezervasyon ID'sinin durumunu 'cancelled' yapar.
- **Randevu Erteleme/Yeniden Planlama (store reschedule)** — Rezervasyonu yeni başlangıca taşır, bitişi yeniden hesaplar, durumu 'rescheduled' yapar (rescheduleBooking).
- **Olay Tabanlı Senkronizasyon (applyEvent)** — Dış planlama olaylarını (booking.requested/confirmed/cancelled/rescheduled) işleyip store'u senkronize eder; webhook benzeri güncellemeleri simüle eder.
- **Olay Idempotency** — booking.requested'te aynı ID'li rezervasyon varsa yeniden eklemeyi atlar; mükerrer kayıt engellenir.
- **Store Sıfırlama (scheduling reset)** — Rezervasyonları seed'e döndürür, aktif tipi varsayılana alır, round-robin indeksini sıfırlar.
- **Masa Rezervasyonu Yapma (workspace reserve)** — Aktif tarih+dilim için masayı rezerve eder; çakışma kontrolü (isDeskFree) geçemezse sessizce hiçbir şey yapmaz, aksi halde mevcut kullanıcı adına ekler.
- **Rezervasyon İptali (workspace cancel)** — Belirtilen ID'li kaydı listeden çıkarır.
- **Masaya Check-in (workspace checkIn)** — Rezervasyonun checkedIn alanını true yapar; diğerleri değişmez.
- **Tarih Seçimi (setDate)** — Aktif rezervasyon tarihini (dateISO, yyyy-mm-dd) günceller.
- **Gün Dilimi Seçimi (setSlot)** — Aktif gün dilimini (am/pm/full) değiştirir.
- **Store Sıfırlama (workspace reset)** — Rezervasyonları mock'tan yeniden klonlar, tarihi bugüne, dilimi full'a döndürür.
- **Bugünün Tarihi Varsayılanı (todayISO)** — İlk yüklemede ve reset sonrası aktif tarihi sistemin bugünkü ISO (yyyy-mm-dd) tarihine ayarlar.
- **Etkinlik türü URL deep-link (?type=…)** — Seçili tür useUrlSelection ile URL ?type parametresine bağlanır; link paylaşılabilir, yenilemede seçim korunur, geçerlilik listede mevcut olmasıyla doğrulanır.
- **Çalışma alanına göre etkinlik türü filtreleme ve otomatik yeniden seçim** — Aktif workspaceId değişince yalnızca o alana ait (veya workspaceId=null) tipler filtrelenir; seçim görünür değilse listenin ilk öğesi otomatik seçilir (J5).
- **Workspace kapsamlı filtreleme (liste)** — useTenantStore'dan workspaceId alınır; etkinlik türleri global (null) veya aktif workspace eşleşenleri gösterilir.
- **Zaman dilimi yerel state yönetimi (AvailabilityEditor)** — Seçilen zaman dilimi React.useState (tz/setTz) ile yerel tutulur; başlangıç schedule timezone'u ya da algılanan dilim.
- **Yerel düzenleme taslağı (EventTypeEditor draft state)** — duration, bufferAfter, minNotice React useState ile yerel tutulur; üretimde kaydetmede FastAPI PATCH /event-types/:id planlanır.
- **Aktif etkinlik değişiminde alanları senkronlama** — useEffect, et.id değişince duration/bufferAfter/minNotice yerel state'lerini seçili tipin değerleriyle doldurur.
- **Rezervasyon iptal/seçim state yönetimi (BookingsCalendar)** — Hangi rezervasyonun iptal edileceği React.useState (cancelId/setCancelId) ile string|null olarak yönetilir.
- **İptal hedefi türetimi (cancelTarget)** — cancelId'ye göre bookings içinden iptal edilecek nesne bulunur; diyalog açıklığı ve davetli adı bundan türetilir.
- **Benzersiz Rezervasyon ID Üretimi** — Randevuya `bk_<timestamp>_<seq>`, çalışma alanı rezervasyonuna `rsv_<timestamp>_<seq>` biçiminde zaman damgası + artan sıra ile benzersiz kimlik.
- **Seed Veri Yükleme / Klonlama** — Başlangıç durumu BOOKINGS/EVENT_TYPES/SCHEDULES (ve workspace için RESERVATIONS) mock'larından yüklenir; rezervasyonlar referans bozulmasını önlemek için cloneBookings/cloneReservations ile klonlanır.
- **Aktif Kullanıcı Kimliği (SELF_ID)** — Rezervasyon yapan kullanıcıyı temsil eden sabit kimlik (usr_1), WORKSPACE_SELF_ID olarak export edilir; gerçek backend'de auth/session'dan gelecek.

### API ve entegrasyon katmanı

- **Etkinlik türlerini getirme API'si (fetchEventTypes)** — GET /event-types sözleşmesini taklit eder, mock EVENT_TYPES dizisini gecikmeli döndürür.
- **Uygunluk takvimini getirme API'si (fetchAvailability)** — GET /availability'yi taklit eder, haftalık kural ve istisnaları içeren SCHEDULES verisini döndürür.
- **Zaman dilimi (slot) hesaplama API'si (fetchSlots)** — GET /slots?eventTypeId&date'i taklit eder; slotlar generateSlots ile istemci tarafında uygunluk+tampon+min-bildirim kurallarına göre hesaplanır (gerçek backend sunucuda hesaplar).
- **Rezervasyon oluşturma API'si (createBooking)** — POST /bookings'i taklit eder; ad/e-posta ile süreye göre endMs hesaplanmış, status=confirmed, konum ve ilk host atanmış Booking üretir.
- **Rezervasyon durumu güncelleme API'si (patchBooking)** — PATCH /bookings/:id'i taklit eder; verilen ID'nin durumunu (pending/confirmed/cancelled/rescheduled) günceller.
- **Mock gecikme katmanı (delay)** — Tüm API çağrıları delay() ile ~120ms gecikmeli Promise döndürür; httpClient'a geçildiğinde UI değişmeden gerçek backend'e bağlanabilir.
- **Masa/üye/müsaitlik entegrasyon yardımcıları** — ../workspace'ten deskAvailability ve occupancyRate saf fonksiyonları türetilmiş veri üretir; memberName(userId) ile kullanıcı ID'leri insan-okunur isimlere çevrilir.
- **Konum / toplantı entegrasyonu (aura_meet)** — EventType ve Booking location alanları 'aura_meet' video toplantı konumunu işaret eder; randevu/etkinliklerin sanal toplantı yerini tanımlar.
- **Toplantı ile bağlanma (meetingId linki)** — Bir rezervasyon meetingId ile gerçek bir toplantıya (Faz 3) bağlanabilir; randevudan toplantı oluşturma akışını destekler.
- **Tarayıcı Saat Dilimi Algılama (detectTimezone)** — Intl.DateTimeFormat ile tarayıcı saat dilimini en iyi çabayla algılar, hata durumunda 'UTC'ye düşer; UI'da override edilebilen varsayılanı sağlar.

### Saf yardımcılar (slot / hatırlatıcı / ICS / çakışma)

- **Bookable Slot Üretimi (generateSlots)** — Bir tarih için rezervasyona açık zaman dilimlerini üretir; hafta günü kuralı veya tarih override'ına göre süre ve buffer'larla adımlar.
- **Tarih Override Desteği** — Belirli tarih için override: gün tümüyle kapatılabilir (available=false), özel saat tanımlanabilir veya hafta günü kuralına geri düşülür.
- **Haftalık Müsaitlik Kuralları** — Her hafta gününe ait başlangıç/bitiş dakikalarıyla çalışma saatleri belirlenir; kural yoksa o gün slot üretilmez.
- **Süre + Buffer Adımlama** — Slot adımı etkinlik süresi + öncesi/sonrası buffer toplamı olarak hesaplanır; ardışık randevular arasında tampon bırakır.
- **Minimum İhbar Süresi Filtresi (minNotice)** — nowMs'e göre minimum ihbar süresinden yakın slotları eler; son dakika rezervasyonlarını engeller.
- **Randevu Çakışma Tespiti (hasConflict)** — Yeni aralığın mevcut rezervasyonlarla örtüşüp örtüşmediğini saf aralık-kesişim mantığıyla denetler; bitişik (adjacent) randevular çakışma sayılmaz, çift rezervasyon engellenir.
- **Round-Robin Host Seçimi (pickRoundRobin)** — Son indeksin bir sonrasını modüler aritmetikle seçer, sona gelince başa döner; adil host dağıtımı sağlar.
- **Dakikadan saate format dönüşümü (fmtMin)** — Dakika değerini (startMin/endMin) sıfır dolgulu HH:MM saat formatına çevirir.
- **Rezervasyon tarih/saat formatlama (fmt)** — startMs damgasını yerel ayara göre 'kısa gün, kısa ay, gün, saat:dakika' okunabilir metne çevirir.
- **Framework-bağımsız Saf Yardımcılar** — Tüm slot/host/erteleme/saat dilimi mantığı çerçeveden bağımsız, saf ve birim-test edilebilir fonksiyonlardır.
- **Yerel Saat Dilimi Frame Notu** — Slot zamanları takvimin yerel zaman çerçevesinde üretilir; davetli saat dilimi çözümlemesi backend'e bırakılır.
- **ICS takvim dosyası (.ics) üretimi (buildIcs)** — Onaylı randevu için RFC 5545 uyumlu VEVENT/VCALENDAR içeriği üreten saf fonksiyon; sonuç indirme akışına beslenir.
- **UTC tarih formatlama (icsDate)** — Epoch ms'yi RFC 5545 temel UTC biçimine (YYYYMMDDTHHMMSSZ) çevirir; iki haneli sıfır dolgusu uygular.
- **Etkinlik süresinden bitiş zamanı hesabı (ICS)** — Başlangıç + dakika cinsinden süreden DTEND'i otomatik hesaplar (start + durationMin×60000).
- **ICS metin kaçışlama (esc)** — Başlık/katılımcı adındaki özel karakterleri (virgül, noktalı virgül, ters bölü) ve yeni satırları RFC 5545'e göre kaçışlar; bozuk dosyaları önler.
- **Benzersiz etkinlik UID ve DTSTAMP** — Her etkinliğe başlangıca dayalı UID (aura-<start>@aura.local) ve DTSTAMP atar; PRODID -//AURA//Scheduling//EN.
- **Opsiyonel katılımcı (ATTENDEE) satırı** — attendeeEmail varsa mailto bağlantılı `ATTENDEE;CN=...` satırı eklenir; yoksa satır filtrelenip çıkarılır.
- **Toplantı hatırlatıcı zamanları (reminderTimes)** — Başlangıçtan önce verilen dakika offsetlerine ([1440, 60] = 1 gün + 1 saat önce) göre hatırlatıcı zaman damgaları üretir.
- **Hatırlatıcıların sıralanması ve geçmiş eleme** — Üretilen hatırlatıcılar yalnızca başlangıçtan öncekileri içerecek şekilde filtrelenir ve artan zamana göre sıralanır.

### Çalışma alanı (hot-desk) saf yardımcıları

- **Dilim çakışma kontrolü (slotsOverlap)** — İki gün dilimi aynı masa+tarihte çakışıyor mu hesaplar; full her iki yarımla çakışır, aksi halde eşitlik kontrolü.
- **Masa müsaitlik sorgusu (isDeskFree)** — Verilen tarih+dilim için bir masanın mevcut rezervasyonlara göre boş olup olmadığını döndürür; reserve aksiyonu bunu kullanır.
- **Masa müsaitlik haritası/anotasyonu (deskAvailability)** — Tüm masaları istenen tarih+dilim için free bayrağı ve doluysa onu işgal eden rezervasyon (takenBy) ile işaretler; masa kartı UI'ını besler.
- **Doluluk oranı hesabı (occupancyRate, slotWeight)** — Rezerve yarım-dilimleri toplam yarım-dilime (masa×2) bölerek doluluğu [0,1] aralığında hesaplar; full gün 2 yarım sayılır, boş havuz 0 döner.

### Veri modelleri

- **Etkinlik türü modeli (EventType)** — id, workspaceId, ownerId, slug, başlık (title), süre (durationMin), öncesi/sonrası tampon (bufferBefore/After), minimum bildirim (minNoticeMin), konum (aura_meet/phone/in_person), atama modu (solo/roundrobin/collective) ve host listesi (hostIds). Rezerve edilebilir Calendly/Cal.com tarzı randevu şablonu.
- **Etkinlik süresi ve tampon süreler** — durationMin ile randevu öncesi/sonrası bufferBefore/bufferAfter ayarlanabilir; slot hesaplaması bunları dikkate alır.
- **Minimum bildirim süresi (min-notice)** — minNoticeMin alanı randevunun ne kadar önceden alınması gerektiğini belirler; son dakika rezervasyonlarını engeller.
- **Toplantı konumu seçimi (MeetingLocation)** — Konum üç tipte: çevrimiçi (aura_meet), telefon (phone), yüz yüze (in_person); hem etkinlik türüne hem rezervasyona uygulanır.
- **Atama modları (solo / round-robin / collective)** — Tür tek kişiye (solo), sırayla dağıtıma (roundrobin) veya birlikte katılıma (collective) atanabilir; çok hostlu ekip randevuları desteklenir.
- **Çalışma alanına özgü etkinlik türleri** — Türler opsiyonel workspaceId ile bir çalışma alanına bağlanabilir; tanımsızsa her yerde görünür (çok kiracılı J5).
- **Haftalık uygunluk kuralları (HoursRule)** — Hafta günü ve yerel gece yarısından dakika cinsinden başlangıç/bitiş ile tekrarlayan müsaitlik pencereleri.
- **Tarihe özel istisnalar (DateOverride)** — Belirli tarih için müsaitlik tatil/ekstra mesai olarak ezilebilir; available bayrağı ve opsiyonel saat aralığı.
- **Saat dilimli uygunluk takvimi (AvailabilitySchedule)** — Sahibe ait, timezone bilgisiyle haftalık kuralları ve istisnaları bir araya getiren program (ownerId, timezone, rules, override'lar; örn. Europe/Istanbul, Pzt–Cum 09:00–17:00 / 540–1020).
- **Rezervasyon modeli (Booking)** — id, eventTypeId, davetli ad/e-posta (inviteeName/email), başlangıç/bitiş ms (startMs/endMs), durum, konum, host (hostId) ve opsiyonel toplantı bağlantısı (meetingId).
- **Rezervasyon durum akışı (BookingStatus)** — Rezervasyonlar pending → confirmed → cancelled → rescheduled durumlarında izlenir; randevu yaşam döngüsü durum makinesi.
- **Hatırlatıcılar (Reminder)** — Bir rezervasyona bağlı, e-posta/SMS/push kanalından, randevudan offsetMin dakika önce tetiklenen hatırlatma tanımı.
- **Rezerve edilebilir zaman dilimi (Slot)** — Uygunluk + tampon + min-notice'tan üretilen, kalıcı olmayan zaman penceresi; startMs/endMs (veya startMs/durationMin) ile temsil edilir.
- **Tipli domain olay sözleşmesi (SchedulingEvent)** — booking.requested/confirmed/cancelled/rescheduled, reminder.scheduled ve slot.held olaylarını ve payload alanlarını (booking, bookingId, startMs, endMs) içeren tipli olay birleşimi; webhook/event-bus sözleşmesini tanımlar.
- **Masa/oda kaynağı (Desk, DeskKind)** — Etiket (label), kat/bölge (zone), tip (desk/room), kapasite (capacity) ve donanım listesi (amenities: dual-monitor, dock, window, whiteboard, display, video, standing) ile rezerve edilebilir fiziksel kaynak.
- **Rezervasyon modeli (Reservation)** — id, deskId, userId, dateISO, slot (am/pm/full) ve checkedIn durumu; çalışma alanı store'unun temel state birimi.
- **Gün dilimi granülasyonu (DeskSlot)** — Hot-desk rezervasyonları am/pm/full dilimleriyle yapılır; full her iki yarımı kapsar.
- **Round-robin / solo host atama modeli** — EventType assignment ile tekil host (solo) veya host'lar arası sıralı dağıtım (roundrobin); örn. Strategy session iki hostlu round-robin.
- **Host isim eşleştirme (HOST_NAMES)** — Host kullanıcı ID'lerini görünen isimlere eşler (usr_1='You', usr_2='Aylin Demir').
- **Mock seed verileri (DESKS, RESERVATIONS, EVENT_TYPES, SCHEDULES, BOOKINGS)** — Frontend-only çalışmayı besleyen statik diziler; tarih hesapları Date.now() ve todayISO üzerinden üretilir, böylece seed kayıtlar varsayılan görünen güne düşer (3 etkinlik türü: Growth sync, Intro call, Strategy session; örnek rezervasyon/randevular).
- **IcsInput veri modeli** — ICS üretiminin girdi sözleşmesi: start (epoch ms), durationMin, title ve opsiyonel attendeeEmail.

### Erişilebilirlik, i18n ve detay yetenekler

- **Yetki kontrolü (scheduling.view)** — Kullanıcının scheduling.view yetkisi yoksa sayfa yerine Forbidden bileşeni gösterilir.
- **Sekme klavye gezinmesi (useTabKeys)** — Sekmeler arası ok tuşlarıyla gezinme; ARIA role=tablist/tab, aria-selected ve roving tabIndex (seçili 0, diğerleri -1) ile erişilebilir sekme deneyimi.
- **Erişilebilirlik: ikon butonu etiketleri ve aria-hidden** — IconButton'lara label (reschedule/cancel vb.) verilir, dekoratif ikonlara aria-hidden uygulanır.
- **Slot listesi ARIA desteği** — Slot listeleri listbox/option rolleri ve aria-selected ile; listeye aria-label verilir, ikonlar aria-hidden; klavye/ekran okuyucu uyumluluğu.
- **Çalışma alanı a11y** — aria-label (tarih, slot grubu, ikon butonlar), aria-pressed (slot seçimi), role=group, aria-hidden (dekoratif ikonlar).
- **Aktif öğe erişilebilirlik işareti** — Seçili etkinlik türü butonunda aria-current={activeId === et.id}; ikonlar aria-hidden.
- **Otomatik zaman dilimi algılama (detectTimezone — editor/public)** — Schedule'da timezone tanımlı değilse veya public sayfada kullanıcının yerel saat dilimi otomatik algılanıp varsayılan kullanılır; state'te (public'te salt okunur) tutulur.
- **Uzun metin taşma yönetimi (truncate)** — Davetli/etkinlik ve tarih/host satırları truncate ve min-w-0 ile taşmadan kesilir.
- **Boş durum metinleri (empty state)** — Hiç rezervasyon/slot yoksa ilgili çeviri metni (noBookings, noSlots, mineEmpty) gösterilir.
- **i18n çoklu dil desteği (react-i18next)** — Tüm metinler (başlık, alt başlık, sekme etiketleri nav.scheduling/scheduling.subtitle/console/publicPage/workspace.tab, weekday.X, assignment.*, bookingStatus.X, minutes, location.*, timezone, reschedule/cancel, unavailable, doluluk yüzdesi, koltuk sayısı) t() ile çevrilir; süre/konum/who gibi dinamik interpolasyonlar kullanılır.


---

<a id="docs"></a>

## Docs sekmesi

Docs sekmesi, Notion/Coda/Loom/Slack özelliklerini tek bir çalışma alanında birleştiren çok yüzeyli bir doküman ve işbirliği ortamıdır. Blok tabanlı belge düzenleme (Canvas), Kanban panosu (Board), düzenlenebilir ilişkisel tablolar (Table), otomasyon iş akışları (Workflows), async video mesajları (Clips) ve gömülü iş uygulamaları (Apps) sunar; tüm yüzeyler ortak bir Zustand store üzerinden gerçek zamanlı işbirliğini simüle eder.

### Çalışma alanı kabuğu ve gezinme

- **Sekmeli Docs çalışma alanı kabuğu** — DocsPage altı sekme render eder: Canvas, Board (Pano), Table (Tablo), Workflows (İş Akışları), Clips (Klipler) ve Apps (Uygulamalar); her sekme ayrı bir bileşen gösterir.
- **İkonlu sekme listesi (tablist)** — Her sekmenin kendi ikonu (FileText, Kanban, Table, Lightning, VideoCamera, SquaresFour) vardır; sekmeler role=tablist/role=tab ile WAI-ARIA tab desenine uygun render edilir.
- **Klavye ile sekme gezinme** — useTabKeys hook'u ile oklarla gezinilir; aktif sekme tabIndex=0, diğerleri tabIndex=-1 olacak şekilde roving tabindex uygulanır.
- **URL ile derin bağlantı (deep-link) sekme durumu** — Aktif sekme useUrlSelection ile `?tab=` sorgu parametresine yansıtılır; seçim paylaşılabilir ve yenilemede korunur, geçersiz değerler doğrulanıp yok sayılır.
- **Yetki kontrolü ve erişim engeli** — Sayfa authStore üzerinden `docs.view` yetkisini kontrol eder; yetki yoksa içerik yerine Forbidden bileşeni gösterilir.
- **Canvas + yorum kenar çubuğu yan yana düzeni** — Canvas sekmesinde CanvasEditor ana alanda, CommentSidebar sağda olacak şekilde iki sütunlu (`1fr_22rem`) grid içinde gösterilir.

### Canvas — blok tabanlı belge düzenleme

- **Doküman seçici (workspace-kapsamlı)** — Üstteki açılır menüden aktif doküman seçilir; yalnızca aktif workspace'e ait (veya workspace'siz) dokümanlar listelenir, seçim setActiveDoc ile store'a yazılır.
- **Workspace değişiminde aktif doküman senkronu** — Workspace değiştiğinde aktif doküman görünürler arasında değilse listenin ilk dokümanı otomatik aktif yapılır.
- **Workspace'e göre doküman filtreleme** — docs listesi workspaceId null veya mevcut workspaceId ile eşleşenlere göre süzülerek visibleDocs üretilir.
- **To-do ilerleme göstergesi** — docProgress ile yapılan/toplam to-do sayısı, yüzde ve mini ilerleme çubuğu (yalnızca toplam>0 ise) gösterilir.
- **Blok tabanlı içerik düzenleme** — Doküman blokları (text, heading, todo, divider) tipine göre ayrı bileşenler olarak sırayla render edilir.
- **Başlık (heading) bloğu inline düzenleme** — heading bloğu büyük yarı-kalın input olarak gösterilir; değişiklikler editBlock ile anlık güncellenir.
- **Metin (text) bloğu inline düzenleme** — text bloğu input olarak gösterilir; değişiklikler editBlock ile anlık kaydedilir, odakta yüzey arka planı uygulanır.
- **Ayraç (divider) bloğu** — divider bloğu içerik gerektirmeden yatay çizgi (hr) olarak render edilir.
- **To-do bloğu işaretle/kaldır** — todo bloğu tıklanabilir butondur; toggleBlock ile checked değişir, işaretliyse CheckSquare + üstü çizili metin, değilse Square gösterilir, aria-pressed ile erişilebilir.
- **Blok ekleme (tip seçimli)** — Alttaki formda tip (text/heading/todo/divider) seçilir, divider dışı tiplerde içerik girilir ve addBlock ile yeni blok eklenir; divider seçiliyken içerik alanı gizlenir.
- **Enter ile blok ekleme kısayolu** — İçerik input'unda Enter, boş olmayan ve divider olmayan içerik için add() çağırır.

### Board — Kanban panosu

- **Kanban panosu (kolon bazlı kart görünümü)** — Pano kolonlarını yan yana (mobilde 1, sm+ ekranda 3 sütun) gösterir; her kolon kendi kartlarını listeler (Coda/Trello tarzı).
- **Kolon başlığı ve kart sayacı** — Her kolonun başlığı ve kart adedi (cards.length) gösterilir.
- **Kartların kolona göre filtrelenmesi** — board.cards her kolon için columnId'ye göre filtrelenir.
- **Kart atanan kişisi (assignee) rozeti** — assigneeId varsa kullanıcı ikonuyla MEMBER_NAMES'ten çözülen ad (yoksa ham id) gösterilir.
- **Kartı sola/sağa taşıma (klavye erişilebilir)** — CaretLeft/CaretRight IconButton'ları moveCard çağırarak kartı komşu kolona taşır; drag-drop'a erişilebilir alternatif.
- **Taşıma butonlarının sınır kontrolü** — En soldaki kolonda sola, en sağdaki kolonda sağa taşı butonu devre dışı bırakılır.
- **Yeni kart ekleme (kolon bazlı taslak girişi)** — Kolon altındaki input'a başlık yazılıp Enter veya Plus ile kart eklenir; boş başlık reddedilir, ekleme sonrası input temizlenir.
- **Kolon başına ayrı taslak state'i** — draft `Record<string,string>` ile her kolonun input metni columnId'ye göre ayrı tutulur.
- **Enter ile kart gönderme kısayolu** — Kart ekleme input'unda Enter submitCard tetikler.

### Table — ilişkisel tablo ve görünümler

- **İlişkisel tablo (canlı düzenlenebilir hücreler)** — Coda 'doc-as-app' tarzı tablo; her hücre tipine göre düzenlenebilir, düzenlemeler store'a akar, toplamlar ve formül sütunları anında yeniden hesaplanır.
- **Dört görünüm anahtarı: Grid / Takvim / Gantt / Hill** — aria-pressed durumlu segmentli buton grubuyla tablo verisi grid, takvim, Gantt çubuk ve Basecamp tarzı Hill chart görünümleri arasında geçirilir.
- **Aktif tablo seçimi** — tables ve activeTableId üzerinden aktif tablo bulunur; bulunamazsa ilk tabloya, hiç tablo yoksa null'a düşülür.
- **Tip-duyarlı hücre düzenleyiciler** — Hücre, sütun tipine göre farklı kontrol render eder: formula salt-okunur, select açılır liste (options), person üye açılır listesi (MEMBER_NAMES), number/date/text için uygun input type'lı giriş.
- **Hücre düzenleme (editCell)** — Değer değiştikçe editCell(table, row, col, val) çağrılır; ham string store'da tutulur ve türev hesaplar güncellenir.
- **Satır ekleme / silme** — 'Satır ekle' butonu addTableRow ile boş hücreli satır ekler; her satır sonundaki Trash butonu deleteTableRow ile satırı kaldırır (hover'da danger rengi).
- **Sütun ekleme (ad + tip seçimi)** — Yeni sütun adı input'u ve tip select'i (text/number/date/person) ile addTableColumn çağrılır; ad boşsa varsayılan 'newColumn' kullanılır, ekleme sonrası input temizlenir.
- **Sütun silme** — Sütun başlığındaki X butonu deleteTableColumn ile sütunu kaldırır.
- **Sütun toplamı (footer Σ)** — number ve formula sütunları için columnTotal ile hesaplanan toplam 'Σ değer' biçiminde 2 ondalığa yuvarlanarak alt satırda gösterilir.
- **Yatay kaydırılabilir tablo (overflow-x)** — Grid görünümü geniş veride yatay kaydırılabilir overflow-x-auto sarmalayıcıyla sunulur.

#### Formül motoru

- **Güvenli formül motoru (evalFormula / eval'siz)** — Aritmetik formüller (`+ - * /`, parantez, tekli eksi) eval kullanmadan elle yazılmış tokenizer + özyinelemeli iniş ayrıştırıcı ile hesaplanır; başlıkta ƒ işaretiyle belirtilir, hatalı girişte exception fırlatır.
- **Formülde sütun adı referansı (case-insensitive)** — Formüller sütun adlarına referans verebilir (örn. `Qty * Price + 10`); ad çözümleyici satırın ilgili hücresindeki sayısal değeri döndürür, sayı değilse 0 kabul eder, büyük/küçük harf duyarsız eşleşir.
- **Hücre hesaplama ve görüntüleme (computeCell)** — Formül sütunları formülü hesaplayıp 2 ondalığa yuvarlar; diğer sütunlarda ham değeri gösterir, hatada '#ERR' yazar.

#### Türetilmiş tablo görünümleri

- **Takvim/ajanda görünümü (CalendarView)** — Tablonun ilk tarih kolonundan canlı hesaplanan, satırları tarihe göre gruplayıp sıralı listeleyen takvim görünümü.
- **Otomatik kolon tespiti (Calendar)** — İlk tarih kolonu, etiket için ilk metin kolonu (yoksa ilk kolon) ve kişi kolonu otomatik tespit edilir.
- **Takvim tarihe göre gruplama ve sıralama** — Satırlar tarih hücresine göre Map ile gruplanır (tarihsizler için varsayılan etiket), anahtarlar sıralı listelenir.
- **Takvim satır etiketi ve kişi gösterimi** — Her satır accent renkli işaret noktası + etiket değeriyle (boşsa tire) gösterilir; kişi kolonu varsa MEMBER_NAMES ile üye adı yazılır.
- **Gantt zaman çizelgesi görünümü (GanttView / ganttBars)** — İlk tarih sütununun min→max aralığında her satır, oransal konumda (startFrac 0..1, CSS left %) yatay eksende nokta/çubuk olarak yerleştirilir.
- **Gantt satır etiketi** — Çubuk satırının solunda ilk metin sütunundan (yoksa ilk sütun) alınan, sabit genişlikli ve truncate edilen etiket gösterilir.
- **Gantt başlığında tarih sütunu adı** — Başlıkta ChartBar ikonu ve 'gantt' yanında kullanılan tarih sütununun adı ` · SütunAdı` olarak dinamik gösterilir.
- **Hill (tepe) ilerleme grafiği (HillView / hillPoints)** — Basecamp tarzı: durum (select) sütununa göre satırları sinüs eğrisine yerleştirir; yokuş yukarı = çözülüyor, yokuş aşağı = uygulanıyor.
- **Durum sütunundan tepe konumu eşleme** — Durum değeri sabit eşlemeyle x konumuna çevrilir (todo=0.15, doing=0.5, done=0.85; eşleşmeyen 0.15), yükseklik y=sin(x·π) ile hesaplanır (zirve x=0.5).
- **SVG tepe eğrisi çizimi** — 51 noktalı sin eğrisi viewBox `0 0 100 44` içinde path olarak çizilir; ortada (x=50) kesik çizgili dikey ayraç bulunur.
- **Tepe grafiği veri noktaları** — Her satır accent renkli daire (circle) olarak eğri üzerine yerleştirilir.
- **Tepe grafiği etiket lejantı** — Grafiğin altında her noktanın etiketi accent yuvarlak işaretle birlikte sarılabilir (flex-wrap) lejant olarak listelenir.
- **Hill başlığında durum sütunu adı** — Başlıkta ChartLineUp ikonu ve 'hill' yanında kullanılan durum sütununun adı ` · SütunAdı` olarak dinamik gösterilir.
- **Türev görünüm boş durumları** — Tarih kolonu yoksa Calendar/Gantt 'tarih yok' (docs.table.noDate), durum kolonu yoksa Hill 'durum yok' (docs.table.noStatus) uyarısı gösterir.

### Workflows — otomasyon iş akışı oluşturucu

- **Workflow oluşturucu üç sütunlu düzen** — Solda iş akışı listesi/oluşturma kartı, sağda (lg:col-span-2) seçili iş akışının detay/çalıştırma paneli yer alan duyarlı yapı.
- **İş akışı listesi ve seçimi** — Tüm iş akışları liste halinde (Lightning ikonu + ad) gösterilir; satıra tıklayınca setSel ile seçilir ve sağ panel açılır.
- **Seçili iş akışı vurgusu ve aria-current** — Seçili satır görsel vurgulanır (bg-surface text-fg) ve aria-current ile işaretlenir; aksi halde muted stil uygulanır.
- **Yeni iş akışı oluşturma formu** — Ad girişi, tetikleyici select'i ve ekleme butonu ile yeni iş akışı oluşturulur; alanlar aria-label/placeholder ile etiketli.
- **İş akışı adı zorunlu doğrulama** — Ad boşken (name.trim() boş) ekle butonu devre dışı kalır, ekleme sonrası ad alanı temizlenir.
- **Tetikleyici seçimi (message/schedule/reaction)** — Açılır menüden mesaj, zamanlama veya tepki tetikleyicisi seçilir (docs.trigger.* çevirileri).
- **İş akışı detay başlığı ve tetikleyici rozeti** — Sağ panelde iş akışı adı, tetikleyici türünü gösteren accent Badge ve sağa hizalı Çalıştır butonu yer alır.
- **İş akışı adımları listesi (numaralı)** — Adımlar numaralı liste (ol) olarak; sıra numarası, adım türü (docs.stepKind.*) ve truncate edilmiş adım değeriyle gösterilir.
- **Boş adım durumu** — Adım yoksa 'docs.noSteps' mesajı gösterilir.
- **İş akışı çalıştırma (runWorkflow)** — Çalıştır butonu (Play) runWorkflow(wf.id) ile iş akışını yürütür ve çalıştırma günlüğü üretir.
- **Çalıştırma günlüğü (run log)** — Son çalıştırma (lastRun) varsa positive renkli kutuda 'Run log' başlığı altında her adım sonucu Check ikonuyla listelenir.

### Clips — async video mesajlaşma (Loom paritesi)

#### Liste ve kayıt

- **Klip listesi (iki kolon düzen)** — Solda klip listesi, sağda seçili klip detayı (`22rem/1fr` grid); kayıt ve gözden geçirme tek ekranda toplanır.
- **Klip arama (başlık/transkript/hashtag)** — Arama metni başlık, transkript ve hashtag'lerde büyük/küçük harf duyarsız aranır; konuşulan sözlere göre bile bulunabilir.
- **Arşivlenmişleri göster filtresi** — Onay kutusuyla arşivli klipler dahil edilir/çıkarılır; varsayılan gizlidir.
- **Yeni klip kaydetme (Record)** — Record butonu addClip ile mevcut kullanıcıyı yazar yaparak yeni klip ekler (ekran/video kaydını simüle eder).
- **Klip seçimi ve aktif vurgu** — Tıklanan klip kenarlık/arka planla vurgulanır; seçim yoksa filtrelenmiş listenin ilki otomatik seçilir.
- **Klip kartı meta bilgileri** — Her kartta video ikonu, başlık, yazar adı (MEMBER_NAMES) ve mm:ss süre gösterilir.
- **Süre biçimlendirme (mm:ss)** — fmt yardımcısı saniyeyi sıfır dolgulu dakika:saniye formatına çevirir.
- **Kart üzerinde AI özet, gizlilik ve görüntülenme göstergeleri** — summary varsa accent Sparkle ikonu, privacy 'link' ise uyarı tonlu erişim rozeti, göz ikonuyla görüntülenme sayısı kartta gösterilir.
- **İlk yükleme iskelet ekranı** — useFirstLoad ile ilk yüklemede liste ve detay için ListSkeleton gösterilir.
- **Boş durum ekranları** — Filtre sonucu boşsa 'klip yok', seçim yoksa 'klip seç' EmptyState video ikonuyla gösterilir.

#### Klip detayı, düzenleme ve AI

- **Klip başlığı ve durum rozetleri** — Başlık; kayıt modu, gizlilik (link uyarı tonu) ve arşiv durumu rozetleriyle, başlık satırında Eye ikonu + görüntülenme sayısıyla gösterilir.
- **Video oynatıcı yer tutucu** — 16:9 (aspect-video) alanda VideoCamera ikonlu oynatıcı placeholder'ı gösterilir.
- **Tamamlanma oranı göstergesi** — completionRate yüzdesi metin ve accent ilerleme çubuğu olarak gösterilir.
- **Dolgu sözcüklerini kaldırma (filler)** — Scissors butonu removeFiller ile dolgu kelimeleri kaldırır; tamamlandıysa buton devre dışı ve 'tamamlandı' metni.
- **Sessizlikleri kaldırma** — WaveSawtooth butonu removeSilence ile sessiz bölümleri kaldırır; silenceRemoved ise devre dışı.
- **Klip arşivleme/arşivden çıkarma** — archiveClip ile klip arşivlenir/geri alınır; buton metni archived durumuna göre değişir.
- **AI içerik üretimi** — Sparkle bölümünde generateAi(clip.id) ile özet/bölüm/görev üretimi tetiklenir.
- **AI özeti gösterimi** — clip.summary varsa AI üretimi özet paragraf olarak gösterilir.
- **AI bölümleri (chapters) listesi** — clip.chapters zaman damgası (mm:ss) ve başlıkla listelenir.
- **AI görev (tasks) listesi** — clip.tasks AI tarafından çıkarılan görevler madde imli liste olarak gösterilir.
- **Transkript görüntüleme** — clip.transcript gösterilir, yoksa tire (—).
- **Klipten dokümana dönüştürme** — FileText butonu clipToDoc(clip) çıktısını textarea'ya yazar (numaralı SOP adımları).
- **Klipten iş öğesine/ticket'a dönüştürme** — Kanban butonu clipToWorkItem(clip) ile başlık + onay kutulu görev gövdesi üretir (Jira/Linear).
- **Klipten mesaja dönüştürme** — PaperPlaneRight butonu clipToMessage(clip) ile sohbet/e-posta tonunda mesaj üretir.
- **Dönüştürme çıktısı (salt-okunur)** — Üretilen çıktı 5 satırlık salt-okunur, sr-only etiketli textarea'da gösterilir.

#### Etkileşim, paylaşım ve gizlilik

- **Emoji tepkileri (reactions)** — 👍🔥🎉👏 ile toggleReaction(clip.id, emoji) çağrılır; mevcut sayı ve aktif durum (aria-pressed, vurgulu kenarlık) gösterilir.
- **Zaman damgalı yorumlar** — clip.comments yazar adı (MEMBER_NAMES), zaman damgası ve gövdeyle listelenir; addClipComment ile yeni yorum (boş engelli, oturum sahibi yazar) eklenir.
- **Gizlilik seviyesi ayarı** — link/workspace/people seçeneklerinden açılır menüyle setClipPrivacy çağrılır (UsersThree ikonu).
- **Parola koruması** — LockKey alanında parola girilip setClipPassword ile kaydedilir (başlangıç değeri clip.password).
- **Bağlantı süre sonu ayarı** — Clock alanında '7 gün' butonu Date.now()+7 gün ayarlar, 'süre yok' null yapar; isLinkExpired ise danger rozeti gösterilir.
- **CTA (eylem çağrısı) yapılandırma ve tıklama izleme** — CursorClick bölümünde CTA etiketi/URL girilip setClipCta ile kaydedilir; etiket buton olarak gösterilir, tıklayınca clickCta ile sayaç (ctaClicks) artar.
- **Kişiselleştirilmiş kopya (variables) üretimi** — Sayı girişiyle (1-100, varsayılan 10) createVariables(clip.id, copies) çağrılır; üretilen kopya sayısı (variablesCopies) positive rozette gösterilir.

### Apps — birleşik iş uygulamaları hub'ı

- **Birleşik Uygulamalar Hub'ı (Apps Panel)** — Teams tarzı tek sekmede Onaylar, Vardiyalar ve Formlar bileşenlerini yan yana gösteren 3 kolonlu responsive grid (lg'de 3 sütun).

#### Onaylar (Approvals)

- **Onay özeti rozetleri** — approvalSummary ile bekleyen (uyarı, sayılı), onaylanan (pozitif) ve reddedilen (tehlike) sayıları rozet olarak gösterilir.
- **Yeni onay talebi oluşturma** — Girişe başlık yazıp Enter veya artı butonuyla yeni talep gönderilir; boş başlık engellenir, gönderim sonrası alan temizlenir.
- **Onay kararı verme (onayla/reddet)** — Bekleyen maddelerde CheckCircle/XCircle butonlarıyla decideApproval çağrılır; karar durumu rozetle gösterilir.
- **Onay listesi** — Tüm maddeler başlıkla listelenir (uzunlar truncate), durum (pending/approved/rejected) i18n etiketiyle gösterilir.

#### Vardiyalar (Shifts)

- **Haftalık çalışma saati göstergesi** — weeklyHours ile geçerli kullanıcının (WORKHUB_SELF_ID) haftalık toplam vardiya saati accent rozette gösterilir.
- **Vardiya çakışma uyarısı** — hasShiftConflict ile zaman çakışması varsa tehlike tonlu uyarı rozeti gösterilir.
- **Vardiya listesi ve zaman biçimlendirme** — Vardiyalar gün adı, başlangıç-bitiş saati (hhmm helper ile HH:MM) ve rol bilgisiyle listelenir.
- **Açık vardiya üstlenme (claim)** — Açık veya sahipsiz vardiyalarda HandGrabbing ikonlu 'üstlen' butonu claimShift çağırır; atanmışlarda sahibinin adı gösterilir.
- **Açık vardiya yok bildirimi** — openShifts boşsa 'açık vardiya yok' metni gösterilir.

#### Formlar (Forms)

- **Form anketi oylama** — Her form için soru ve seçenekler gösterilir; seçeneğe tıklayınca respondForm ile oy verilir.
- **Form yanıt sayımı ve oran çubuğu** — tallyResponses ile her seçeneğin oy sayısı hesaplanır, toplam üzerinden yüzde accent ilerleme çubuğuyla gösterilir.

### Yorum ve gerçek zamanlı işbirliği

- **Yorum kenar çubuğu (inline doc yorumları)** — Aktif dokümana ait satır içi yorumları listeleyen, yeni yorum ekleyen ve çözümleyen kenar paneli; işbirlikçi doküman incelemesini sağlar.
- **Presence (eş zamanlı izleyici avatarları)** — TEAM listesinden ilk 3 üyenin üst üste binen avatarları 'görüntüleyenler' olarak gösterilerek canlılık hissi verir.
- **Simüle edilmiş uzak eş düzenleme (CRDT/OT)** — 'Takım arkadaşı düzenlemesini simüle et' butonu applyRemoteEdit ile bir ekip arkadaşının (Defne) ilk metin/başlık bloğunu canlı dokümanda düzenlemesini birleştirir ve bilgi toast'u gösterir.
- **Yorum ekleme (blok bazlı)** — Seçilen veya ilk bloğa bağlı, mevcut kullanıcı yazarlı metin yorumu eklenir; boş gövde engellenir, gönderim sonrası alan temizlenir.
- **Yorum çözümleme (resolve)** — Çözümlenmemiş yorumda 'çözümle' butonu resolveComment çağırır; çözümlenen yorum soluk opaklık, üstü çizili metin ve 'çözüldü' etiketiyle gösterilir.
- **Yorum bloğu çapası (anchor seçici)** — Açılır menüden yorumun bağlanacağı blok seçilir; her seçenek içeriğin ilk 30 karakterini veya blok tipini gösterir, divider blokları hariç tutulur.
- **Yorum bağlam snippet'i** — Her yorumun altında bağlı bloğun içeriğinin ilk 40 karakteri ok işaretiyle (↳) gösterilir.
- **Yorum yazarı kimliği** — Her yorumda yazarın avatarı ve MEMBER_NAMES'ten çözülen adı gösterilir.
- **Yorum gönderme alanı** — 2 satırlık metin alanı ve uçak ikonlu gönder butonu; gövde boşken buton devre dışıdır.
- **Aktif dokümana göre yorum filtreleme** — commentsForDoc ile yalnızca activeDocId'ye ait yorumlar listelenir; openComments ile çözülmemişler ayrılabilir.
- **Yorum boş durumu** — Aktif dokümanda yorum yoksa 'yorum yok' mesajı gösterilir.

### Clips intelligence — saf AI/dönüşüm yardımcıları

- **Cümle ayrıştırma yardımcısı (sentences)** — Transkripti nokta, ünlem, soru işareti ve satır sonlarına göre cümlelere böler, trim edip boşları eler; tüm AI dönüşümlerinin temelidir.
- **Otomatik özet (autoSummary)** — İlk 1-2 cümleyi alıp maxLen (varsayılan 140) ile kırpar, nokta ekler, taşarsa üç nokta (…) ile keser.
- **Otomatik bölümler/zaman damgaları (autoChapters)** — En fazla max (varsayılan 5) cümleyi alıp video süresine eşit aralıklı zaman damgalı bölümler (atSec + ilk 5 kelimelik başlık) üretir.
- **Görev/aksiyon öğesi çıkarımı (extractTasks)** — Cümlelerden aksiyon ipucu kelimeleri (EN + TR) içerenleri filtreleyerek yapılacaklar çıkarır.
- **Dolgu kelime temizleme (removeFillerWords, EN + TR)** — İngilizce ve Türkçe dolgu kelime/ifadeleri (um, uh, like, you know, şey, yani, işte, falan, aslında vb.) kelime sınırı + duyarsız regex ile siler, çift boşluk ve noktalama öncesi boşlukları temizler; Loom'un yalnızca EN sunduğu özelliği TR'de de sağlar.
- **Dolgu kelime sözlüğü (FILLER_WORDS)** — Temizleme için sabit EN/TR dolgu kelime listesi (um, uh, erm, like, you know, i mean, actually, basically, literally, sort of, kind of; şey, yani, işte, hani, falan, aslında, aslında ya).
- **Aksiyon ipucu sözlüğü (ACTION_CUES)** — Görev çıkarımında taranan ipuçları: EN (follow up, todo, action, need to, we should, should, let's, next step, ship) ve TR (yapılacak, takip, gerekiyor, sonraki adım, halletmeli).
- **Klip → Doküman/SOP dönüşümü (clipToDoc)** — Klibi numaralı adımlardan oluşan Markdown dokümana (başlık + 1. 2. 3. adımlar) çevirir.
- **Klip → İş öğesi (Jira/Linear) dönüşümü (clipToWorkItem)** — Klipten başlık ve onay kutulu (`- [ ]`) görev gövdesi üretir; görev yoksa transkriptten çıkarır, hiç yoksa transkripti gövde yapar.
- **Klip → Mesaj (sohbet/e-posta) dönüşümü (clipToMessage)** — Klibi başlık + var olan özet ya da otomatik özetle kısa mesaja çevirir.
- **Paylaşım linki süre kontrolü (isLinkExpired)** — Public linkin süresinin dolup dolmadığını şimdiye göre kontrol eder; linkExpiresAt yoksa süre dolmaz.
- **İzlenme tamamlama oranı (completionRate)** — Klibin tamamlama oranını 0..1'e clamp eder; değer yoksa 0.
- **Toplam reaksiyon sayısı (reactionTotal)** — Tüm emoji reaksiyonlarının count toplamını hesaplar.
- **En çok izlenen klipler (topClips)** — Klipleri views'a göre azalan sıralayıp ilk n (varsayılan 5) klibi döndürür (analitik 'top clips').

### Workhub yardımcıları (saf fonksiyonlar)

- **Onay özeti sayacı (approvalSummary)** — Onay isteklerini durumlarına göre (bekleyen/onaylanan/reddedilen) sayıp özet nesne döner.
- **Haftalık çalışma saati hesabı (weeklyHours)** — Kullanıcının haftalık tüm vardiyalarının toplam süresini dakikadan saate çevirip 2 ondalıkla yuvarlar.
- **Vardiya çakışma kontrolü (shiftsOverlap)** — İki vardiyanın aynı gün içinde zaman çakışıp çakışmadığını hesaplar (temel mantık).
- **Çift rezervasyon tespiti (hasShiftConflict)** — Kullanıcının vardiyaları arasında çakışan olup olmadığını döner.
- **Açık vardiya listeleme (openShifts)** — Sahipsiz veya açık işaretli vardiyaları filtreler.
- **Anket yanıt sayımı (tallyResponses)** — Formun her seçeneği için yanıt sayısını, oysuzları 0 ile doldurarak hesaplar.

### Veri katmanı — store ve aksiyonlar

- **Docs & Workspace Zustand store (docsStore)** — Dokümanlar, pano, iş akışları, klipler, tablolar ve yorumlar için merkezi state; mock veriden klonlanan başlangıç durumu ve tüm aksiyonları barındırır.
- **Workhub Zustand store (workhubStore)** — Onaylar, vardiyalar, formlar ve yanıtları tutup aksiyonlarını yöneten merkezi durum deposu (Approvals/Shifts/Forms state'i).
- **Benzersiz ID üretimi (nid / uid)** — Önek + zaman damgası + artan sayaçla çakışmayan kimlikler üretir (yeni blok, kart, klip, satır, yorum, onay, form yanıtı vb.).
- **Derin klonlama (immutable başlangıç durumu)** — Docs, Board, Workflows, Clips, Tables ve Comments mock verisini iç içe dizilerle (bloklar, sütunlar, kartlar, bölümler, görevler, hücreler) derin klonlar, orijinal mock korunur.
- **Klip patch yardımcısı (patchClip)** — Klibi kimliğe göre bulup verilen dönüşüm fonksiyonuyla immutable günceller; tüm klip aksiyonlarının ortak çekirdeği.
- **Doküman aksiyonları** — setActiveDoc (aktif doküman), addBlock (tipli blok ekleme), editBlock (içerik güncelleme), toggleBlock (todo işaretleme, saf yardımcıyı kullanır).
- **Kanban aksiyonları** — addCard (başlık + sütunla kart ekleme), moveCard (kartı başka sütuna taşıma; drag-drop ve klavyenin ortak çekirdeği — saf fonksiyon).
- **İş akışı aksiyonları** — addWorkflow (ad + tetikleyiciyle boş adımlı akış), runWorkflow (adımları çalıştırıp lastRun'a yazma; bulunamazsa null; saf runWorkflow her adım için done StepResult günlüğü döndürür).
- **Klip aksiyonları** — addClip (42sn/screen_cam/workspace demo klip, listenin başına), generateAiClip (özet/bölüm/görev), setClipPrivacy, setClipPassword, setClipExpiry (ms veya null), addClipComment (atSec'e bağlı), toggleClipReaction (varsa kaldır/yoksa count 1), setClipCta, removeFiller, removeSilence (süreyi ~%10 kısaltır), trimClip (negatifsiz süre), archiveClip, addClipHashtag (yineleme önler), createVariables (negatifsiz), viewClip (izlenme+1), clickCta (tıklama+1).
- **Tablo aksiyonları** — setActiveTable, editCell, addTableRow, addTableColumn (text/number/date/select/person/formula), deleteTableRow, deleteTableColumn.
- **Yorum aksiyonları** — addComment (bloğa yazarlı yorum, listenin başına, atMin 0), resolveComment (çözümlendi işaretle), applyRemoteEdit (eş düzenleme simülasyonu).
- **Workhub aksiyonları** — requestApproval (yeni bekleyen talep başa), decideApproval (onaylandı/reddedildi), claimShift (açık vardiyayı mevcut kullanıcıya ata + kapat), respondForm (mevcut kullanıcı adına yanıt ekle).
- **Store sıfırlama (reset)** — docsStore ve workhubStore tüm state'i mock/seed başlangıç değerlerine geri döndürür (demo/test yenileme).
- **Aktif kullanıcı kimliği (SELF_ID / WORKHUB_SELF_ID / authStore)** — Eylemleri yapan kullanıcı (usr_1; docsStore'da authStore principal.id, varsayılan usr_1; workhub'da Ismail K.) atama, sahiplik ve yazarlıkta kullanılır.

### Saf yardımcı fonksiyonlar (docs.ts)

- **Todo bloğu işaretleme (toggleBlock)** — Dokümandaki todo bloğunun işaretli/işaretsiz durumunu değiştiren saf fonksiyon; drag-drop ve klavye aynı çekirdeği kullanır.
- **Kart sütun taşıma (moveCard)** — Kanban kartını başka sütuna taşıyan saf fonksiyon; sürükle-bırak ve klavyenin ortak çekirdeği.
- **İş akışı çalıştırma simülasyonu (runWorkflow)** — Adımları çalıştırmayı simüle eder; her adım için kind+value etiketiyle done statüsünde StepResult günlüğü döner.
- **Doküman tamamlanma ilerlemesi (docProgress)** — Todo blokları arasında tamamlanan oranı hesaplar; done, total ve 0-100 yüzde (pct) verir.
- **Yerel fmt (saniye→mm:ss)** — Bileşen düzeyinde süreyi okunabilir dakika:saniye formatına çevirir.

### Mock API ve veri (FastAPI sözleşme taklidi)

- **Belge (Doc) verisi getirme (fetchDocs)** — Blok tabanlı belgeleri ~120ms gecikmeli promise olarak döndürür; FastAPI `/docs` sözleşmesini taklit eder.
- **Pano (Board) verisi getirme (fetchBoard)** — Sütunlar ve kartlardan oluşan Kanban panosunu gecikmeli döndürür (`/boards`).
- **İş akışı verisi getirme (fetchWorkflows)** — Tetikleyici ve adımlardan oluşan iş akışı listesini gecikmeli döndürür (`/workflows`).
- **Klip verisi getirme (fetchClips)** — Async video mesaj klip listesini gecikmeli döndürür (`/clips`).
- **Sahte ağ gecikmesi yardımcısı (delay)** — `delay<T>(value, ms=120)` jeneriği, mock veriyi gerçek ağ çağrısı hissi için varsayılan 120ms gecikmeyle sarmalar.
- **Seed mock verileri (docs/board/workflow/clip)** — Üç örnek belge (Q3 Launch Plan, Onboarding runbook, Growth experiments; ws_core/ws_growth), Launch board (To do/In progress/Done + 4 atanmış kart), iki iş akışı (New customer onboarding — message; Daily standup reminder — schedule), iki klip (Feature walkthrough, Sprint retro recap; chapters, tasks, CTA, yorum, tepki, hashtag dahil), Launch budget tablosu (text/person/number/formula/select/date sütunları) ve satır içi belge yorumları (cm2 resolved:true dahil).
- **Seed mock verileri (workhub)** — Örnek onaylar (Q3 bütçe, işe alım teklifi, konferans seyahati), vardiyalar (Support/Sales rolleri + açık vardiya), öğle yemeği anketi ve yanıtları; demo deneyimini doldurur.
- **Üye adı arama tablosu (MEMBER_NAMES)** — Kullanıcı id'lerini görünen adlara eşler (usr_1: You, usr_2: Aylin Demir, usr_3: Sora Kim, usr_4: Devin Roy); atama, person sütunu ve yazar gösterimi için ortak kaynak.

### Veri modelleri (tip sözleşmeleri)

- **Doküman blok modeli (Block/BlockType)** — Bloklar heading/text/todo/divider tipinde; id, type, content ve todo için checked alanı taşır.
- **Doküman (Doc) modeli** — id, opsiyonel workspaceId (tanımsız = her yerde görünür), başlık ve Block dizisinden oluşur.
- **Kanban veri modeli (Board/Column/Card)** — Board: id, title, columns[], cards[]; Column: id, title; Card: id, title, columnId, opsiyonel assigneeId.
- **İş akışı modeli (Workflow/WorkflowStep/StepResult)** — Tetikleyici (message/schedule/reaction) ve sıralı adımlardan (send_message/assign/add_label/wait, her biri value taşır) oluşur; çalıştırma StepResult ile raporlanır.
- **Klip (Clip) zengin veri modeli** — title, authorId, durationSec, transcript, views, recordMode (screen/cam/bubble/screen_cam), privacy (link/workspace/people), password, linkExpiresAt (epoch ms; null/undefined = asla), summary, chapters (atSec+title), tasks, fillerRemoved, silenceRemoved, ctaLabel/ctaUrl/ctaClicks, comments (id, authorId, atSec, body), reactions (emoji+count), completionRate (0..1), hashtags, archived, variablesCopies alanlarını kapsar.
- **Klip yardımcı tipleri (ClipChapter/ClipComment/ClipReaction/ClipPrivacy/recordMode)** — Bölüm (atSec+title), zaman damgalı yorum, emoji+count tepki, gizlilik ve kayıt modu alt tipleri.
- **İlişkisel tablo modeli (DataTable/TableColumn/TableRow)** — DataTable: id, title, columns, rows; TableColumn: id, name, type, select için options[], formula için formula string; TableRow: id ve colId→ham string değer (cells).
- **Sütun tip enum'u (ColumnType)** — text, number, date, select, person, formula; yeni sütun eklemede yalnızca text/number/date/person sunulur, select/formula seed veriden gelir.
- **Türetilmiş görünüm tipleri (GanttBar/HillPoint)** — Görselleştirme verisi ganttBars/hillPoints saf fonksiyonlarıyla hesaplanır ve GanttBar/HillPoint tipleri dışa aktarılır.
- **Doküman yorum modeli (DocComment)** — docId/blockId hedefi, authorId, body, atMin zamanı ve opsiyonel resolved durumu; gerçek CRDT/OT yerine store'da simüle edilen eş düzenlemeyle çalışır.
- **Doc collab WS olay sözleşmesi (DocsEvent)** — Gerçek zamanlı collab `doc.*` kanalının tipli olayları: doc.edited, card.moved, todo.completed, workflow.ran, clip.posted, comment.added.
- **Onay isteği modeli (ApprovalRequest)** — id, başlık, talep eden, onaylayan, durum (pending/approved/rejected) ve createdMin zamanı.
- **Vardiya modeli (Shift)** — id, kullanıcı, gün (0=Pazar..6=Cmt), başlangıç/bitiş dakikası, rol ve açık (open) durumu; atanmamış 'open' vardiyalar talep edilebilir.
- **Form modeli (FormDef/FormOption/FormResponse)** — Form tanımı (id, başlık, soru, seçenekler) ve yanıt (formId, optionId, yanıtlayan).

### Çapraz kesen yetenekler (i18n & erişilebilirlik)

- **i18n çoklu dil desteği** — Tüm yüzeylerde başlık, alt başlık, sekme/etiket, durum ve aria metinleri react-i18next useTranslation/t ile çeviri anahtarlarından (nav.docs, docs.subtitle, docs.tabs.*, docs.table.*, docs.apps.*, docs.trigger.*, docs.stepKind.*, docs.comments.*, docs.clip.* vb.) alınır; gün adları docs.apps.days dizisinden gelir, durum/dinamik etiketler dinamik anahtarla çözülür.
- **Erişilebilirlik (a11y) öznitelikleri** — Sekmelerde/butonlarda aria-selected/aria-pressed/aria-current, listelerde role/aria-label, ikon ve grafiklerde aria-hidden, SVG'de role='img'+aria-label, input/select'lerde aria-label, salt-okunur çıktıda sr-only ve genelinde focus-visible ring ile klavye/ekran okuyucu desteği sağlanır.
- **Paylaşılan primitives ve ikonlar** — Görünümler ortak Card primitive'i içinde render edilir; ikonlar (ChartBar, ChartLineUp, Lightning, VideoCamera vb.) `@/lib/icons` üzerinden gelir.
- **Toast bildirimi entegrasyonu** — useToastStore.push ile uzak düzenleme uygulandığında nötr/bilgi tonlu bildirim gösterilir.


---

<a id="intelligence"></a>

## Intelligence sekmesi

Intelligence sekmesi, toplantı, çağrı ve destek konuşmalarını canlı ve sonradan analiz eden çok dilli bir konuşma zekası yüzeyidir. Canlı transkripsiyon, çeviri/altyazı, duygu ve niyet analizi, koçluk, AI özeti ve performans skorlamasını tek bir RBAC korumalı ekranda birleştirir; tüm akış, transport'tan bağımsız tiplenmiş SSE olayları üzerine kuruludur ve mock dispatcher gerçek FastAPI EventSource'a tek noktadan geçişe hazırdır.

### Sayfa kabuğu & erişim

- **Yetki korumalı sayfa erişimi (intelligence.view)** — Kullanıcıda `intelligence.view` yetkisi yoksa sayfa render edilmez, Forbidden bileşeni gösterilir; erişim authStore'un `can()` fonksiyonuyla kontrol edilir.
- **Sayfa başlığı ve alt başlık (i18n)** — Üstte `nav.intelligence` başlığı ve `intel.subtitle` açıklaması react-i18next ile çevrilir.
- **Responsive grid yerleşim** — Ana içerik `lg` breakpoint'te 3 kolonlu grid'e geçer: transkript 2 kolon, analiz panelleri 1 kolonluk dikey yığın olarak düzenlenir.
- **Kaynağın URL ile derin bağlanması (?source=)** — `useUrlSelection` ile aktif kaynak `?source=` query parametresine senkronlanır; paylaşılabilir ve yeniden yükleme güvenlidir, geçerli bir SOURCES id'si doğrulanarak `setSource`'a uygulanır.
- **Toast bildirim entegrasyonu** — `useToastStore.push` ile dışa aktarma ve koçluk olaylarında kullanıcıya tonlu (positive/danger) toast bildirimleri gösterilir.

### Üst aksiyon çubuğu & kontroller

- **AI Özetle aksiyonu (Copilot)** — Sparkle ikonlu birincil buton, aktif kaynağın başlığını bağlam alarak `useAskCopilot` ile `intel.ai.summarize` istemiyle AI özet çağrısı yapar.
- **AI Eylem Maddeleri aksiyonu (Copilot)** — ListChecks ikonlu ikincil buton, aktif kaynak bağlamıyla `intel.ai.actions` istemini göndererek eylem maddeleri üretir.
- **Recap Markdown dışa aktarma** — DownloadSimple ikonlu ghost buton, aktif kaynağın RECAPS verisinden TL;DR, kararlar, sonraki adımlar ve eylem maddelerini Markdown'a derleyip `{sourceId}-recap.md` olarak indirir ve "exported" pozitif toast gösterir.
- **Kaynak seçici (source dropdown)** — SOURCES listesinden aktif analiz kaynağını (toplantı/çağrı/konuşma) seçtiren select; her seçenek başlık ve tür etiketiyle (`intel.kindLabel.<kind>`) gösterilir, seçim `setSource` ile store'a yazılır.
- **Çeviri hedef dili seçici (translateTo)** — Translate ikonlu select LANGS listesinden hedef dili seçtirir; `off` seçeneği çeviriyi kapatır (`intel.translateOff`), seçim `setTargetLang` ile store'a yazılır.
- **Ses korumalı çeviri rozeti (voice-preserving)** — Hedef dil `off` ve `en` dışındayken LockKey ikonlu pozitif Badge ile ses koruyan çeviri göstergesi koşullu belirir.
- **Hedef dilde dinle / dublaj toggle (dub)** — Hedef dil `off` değilken görünen SpeakerHigh ikonlu toggle; dublajı açıp kapatır, `aria-pressed` ile durumu bildirir (`toggleDub`).
- **Gizlilik maskeleme / redact toggle** — EyeSlash ikonlu toggle hassas bilgileri maskeleme modunu açıp kapatır, sağa yaslanır, `aria-pressed` ile erişilebilir biçimde bildirilir (`toggleRedact`).
- **Canlı mod / Go Live toggle** — Broadcast ikonlu toggle; canlı modu açıp kapatır, aktifken kırmızı (danger) stil ve "liveOn", pasifken "goLive" metni gösterir, `aria-pressed` ile bildirir (`toggleLive`).

### Ana akışlar

- **Canlı SSE akışı aboneliği** — Canlı mod açıkken `subscribeIntel` ile mock SSE akışına abone olunur; her tiplenmiş olay store'un `applyEvent` yoluyla işlenir, 2600ms aralıkla ilerler ve akış bitince canlı mod otomatik kapanır. EventSource'a geçiş için tek değişiklik noktasıdır.
- **Canlı koçluk fısıltı toast'ı (yöneticilere)** — Canlı modda ve `admin.access` yetkisi olan kullanıcıda, coaching listesine yeni cue eklendiğinde son ipucu "coachingTriggered" toast'ı olarak gösterilir; cue `warning` ise danger, değilse positive tonunda. Coaching uzunluğu bir ref ile izlenir.
- **Transcript getirme API'si (fetchTranscript)** — FastAPI `GET /transcripts/:id` kontratının mock'u; verilen sourceId için dil çözümlenmiş ham transkripti (id, sourceType, sourceId, language, segments) 150ms gecikmeyle Promise olarak döner.
- **Analiz raporu getirme API'si (fetchAnalysis)** — FastAPI `GET /analysis/:id` kontratının mock'u; sourceId için transcript, sentiment, intents, scorecard ve highlights içeren AnalysisReport'u 200ms gecikmeyle döner; ASR+MT+LLM çıktısının birleşimini temsil eder.

### Paneller & kartlar

- **Transcript görüntüleyici (TranscriptViewer)** — İki kolonlu grid'in geniş (`lg:col-span-2`) tarafında, 62vh yükseklikte konuşmacı bazlı kronolojik transkript paneli; çerçeveli kart, başlık çubuğu ve kaydırılabilir içerik alanı içerir.
- **Çeviri oturumu paneli (TranslationSessionPanel)** — Üst bölümde canlı çeviri/altyazı oturumunu (TranslationSession aggregate) yöneten, başlatma/sonlandırma ve oturum ayarlarını kontrol eden panel.
- **Koçluk paneli (CoachingPanel)** — Toplantı sırasında canlı koçluk (whisper) ipuçlarını listeleyen panel; store'daki coaching dizisini görüntüler.
- **Recap paneli (RecapPanel)** — Zoom/Teams Intelligent Recap tarzı yapısal AI özeti: TL;DR, kararlar, eylemler ve sonraki adımlar.
- **Toplantı notları kartı (MeetingNotesCard)** — Notta/Otter tarzı kart; konuşmacı diarizasyonu, kelime/dakika, anahtar kelimeler ve aksiyon maddelerini canlı transkriptten hesaplayıp tek kartta gösterir.
- **Skorkart (Scorecard)** — Dialpad tarzı AI skor kartı; talk ratio, sentiment, sorular, tempo, monolog ve CSAT metriklerini iki sütunlu tanım listesinde özetler.
- **Rubrik kartı (RubricCard)** — Özel değerlendirme kriterlerinin (pass/fail) listelendiği kart.
- **Konuşmacı analitiği (SpeakerAnalytics)** — Kişi bazlı konuşma analitiği: kelime, konuşma süresi, sentiment, sözünü kesme, dolgu kelimeleri.
- **Sentiment zaman çizelgesi (SentimentTimeline)** — Duygu durumunun zamana göre değişimini gösteren zaman çizelgesi.
- **Niyet listesi (IntentList)** — Tespit edilen niyetleri güven skoruyla listeleyen, Demio/Dialpad benzeri panel.
- **Tracker kartı (TrackersCard)** — Dialpad Custom Moments tarzı anahtar kelime/rakip/konu izleyicilerini hit sayısıyla gösteren kart.
- **Öne çıkanlar makarası (HighlightReel)** — Karar/eylem/itiraz/soru gibi öne çıkan anları gösteren panel.

### Transcript görüntüleyici detayları

- **Transkript içi arama** — Arama kutusundaki metni segmentlerde (İngilizce, Türkçe ve tüm çeviri dilleri) büyük/küçük harf duyarsız arar ve eşleşmeyenleri filtreler.
- **Arama sonucu vurgulama** — Aranan terim segment metninde sarı (warning) zeminli `<mark>` ile vurgulanır; `highlight()` regex ile metni bölüp eşleşmeleri işaretler.
- **Konuşmacı filtresi** — Açılır menüden tek konuşmacı seçilerek transkript ona indirgenir; "Tüm konuşmacılar" filtreyi temizler, liste segmentlerden tekilleştirilir.
- **Algılanan kaynak dil rozeti** — Başlıkta aktif kaynağın algılanan dilini (örn. EN) büyük harf rozetiyle gösterir; kaynak yoksa varsayılan "EN".
- **Canlı çeviri / hedef dil altyazısı** — `targetLang` `off` değilse her segmentin altına accent renkli sol kenarlıklı kutuda hedef dile çeviri (`segmentText()`) gösterilir.
- **Seslendirme (dubbing) bildirim şeridi** — `dub` aktifse başlık altında SpeakerHigh ikonlu, hedef dilde seslendirme yapıldığını bildiren accent şerit (`aria-live='polite'`).
- **PII redaksiyon / uyumluluk maskeleme** — `redact` aktifse e-posta adresleri ve 4+ haneli rakam dizileri hem orijinal hem çeviri metninde maskelenir (•••@•••, ••••).
- **Konuşmacı avatarı ve kimlik çözümleme** — Her segmentte konuşmacının adıyla Avatar gösterilir; `speakerName` yoksa `memberName(speakerId)` ile kimlikten çözülür.
- **Segment zaman damgası** — Her segmentte başlangıç saniyesi `fmtClock(seg.startSec)` ile saat formatında gösterilir.
- **Segment duygu durumu çipi** — Her segmentin yanında SentimentChip ile o konuşmanın duygu durumu gösterilir.
- **Otomatik en alta kaydırma** — Segment sayısı değiştiğinde görüntüleyici en alttaki referans elemana `scrollIntoView` ile kayar; canlı akış hissi verir.
- **Boş durum mesajı** — Filtre/arama sonucu segment kalmazsa `intel.noMatches` mesajı gösterilir.
- **Erişilebilirlik etiketleri** — Arama ve konuşmacı filtresine `aria-label`, transkript ve dubbing alanlarına `aria-live='polite'`, ikonlara `aria-hidden` uygulanır.

### Çeviri & altyazı oturumu detayları

- **Çeviri oturumu başlat / sonlandır** — Oturum yoksa "Başlat" aktif kaynak ve varsayılan `['tr']` hedefiyle `startSession`'ı, oturum varsa "Sonlandır" `endSession`'ı çağırır.
- **Hedef dil çoklu seçim pilleri** — tr, en, es, de, fr, ar için aç/kapa pill butonları; tıklanınca hedef listeye eklenir/çıkarılır, en az bir dil garanti edilir (boşalırsa tıklanan dile sıfırlanır), `aria-pressed` ile bildirilir.
- **Ses koruma (voice-preserving) aç/kapa** — Waveform ikonlu buton ile orijinal sesi koruyarak çeviri modu açılıp kapatılır (`setVoicePreserving`), `aria-pressed` ve accent renkle gösterilir.
- **Kaynak dil rozeti** — Aktif oturumun kaynak dili (`session.sourceLang`) nötr tonlu Badge ile gösterilir.
- **Ses koruma durum rozeti** — LockKey ikonlu Badge ile ses korumanın durumu gösterilir; açıkken positive, kapalıyken nötr ton.
- **Tamponlanan segment sayacı** — Oturumda tamponlanan segment sayısı (`session.segments.length`) `intel.session.buffered` ile gösterilir.
- **Koşullu oturum arayüzü** — Oturum aktifken dil pilleri ve ses koruma kontrolü, oturum yokken yalnızca başlat butonu görünür.

### Koçluk paneli detayları

- **RBAC ile koçluk erişim kısıtlaması (admin.access)** — Panel yalnızca `admin.access` yetkili yöneticilere açıktır; yetki yoksa ve ipucu varsa kilit (Lock) ikonlu "kilitli" bilgi kutusu, ipucu da yoksa hiçbir şey gösterilmez.
- **Koçluk ipucu türlerine göre ikon/renk** — `tip` (Lightbulb, accent), `warning` (Warning, danger), `praise` (ThumbsUp, positive).
- **Koçluk ipucu liste öğesi** — Her ipucu tür ikonu, metin (`c.text`) ve `fmtClock` ile biçimli zaman damgası (`c.tSec`) ile satır olarak gösterilir; Headset ikonlu başlık "Coaching" etiketi taşır.
- **Erişilebilirlik: canlı bölge (aria-live polite)** — İpuçları listesi `aria-live='polite'` ile yeni ipuçlarını ekran okuyuculara duyurur; dekoratif ikonlar `aria-hidden`.

### Highlight makarası detayları

- **Highlight türü ikon/renk eşleştirmesi** — decision (SealCheck, accent), action (ListChecks, positive), objection (Warning, danger), question (Question, warning).
- **Transkript segmentine atlama (jump-to-segment)** — Bir öne çıkan ana tıklanınca ilgili `seg-{segmentId}` DOM elemanına yumuşak kaydırma (smooth scroll) ile ortalanarak gidilir.
- **Tıklanabilir önemli an satırları** — Her an ikon + tür etiketi + metin + sağ ok (ArrowRight) içeren tam genişlikte buton olarak render edilir; hover'da kenarlık accent rengine döner.
- **Önemli anlar boş durumu** — Hiç an yoksa `intel.none` boş durum mesajı gösterilir.

### Skorkart & rubrik detayları

- **Konuşma oranı (talk ratio) metriği** — Temsilcinin konuşma oranını yüzde olarak büyük puntoda gösterir.
- **Ortalama duygu durumu metriği** — Sayısal sentiment `sentimentFromValue` ile kategoriye dönüştürülüp SentimentChip rozetiyle gösterilir.
- **Soru sayısı metriği** — Görüşme boyunca sorulan soru adedini büyük puntoda gösterir.
- **Konuşma temposu (pace/WPM) metriği** — Konuşma hızını dakikadaki kelime sayısı + "wpm" birimiyle gösterir.
- **En uzun monolog süresi metriği** — Kesintisiz en uzun konuşma süresini (`monologueSec`) `fmtClock` ile formatlayıp gösterir.
- **CSAT yıldız puanı** — `csat` varsa 1-5 yıldızla müşteri memnuniyetini gösterir; dolu yıldızlar warning, kalanı muted; `csat` yoksa blok hiç render edilmez.
- **Tahmini CSAT (predicted CSAT) paneli** — `predictedCsat` varsa Sparkle (AI) ikonu ve 1-5 yıldızla AI tahmini gösteren ayrı kutu açılır; yoksa panel render edilmez.
- **Tahmini CSAT gerekçesi** — `csatReason` varsa tahmin altında AI gerekçesini açıklayan soluk metin.
- **İki sütunlu metrik tanım listesi düzeni** — Metrikler `grid-cols-2` dt/dd tanım listesi (dl) olarak semantik HTML ile hizalanır.
- **SentimentChip yardımcı entegrasyonu** — Skorkart, rozet çizimi ve değer→kategori çevirisi için SentimentChip, `sentimentFromValue` ve süre formatı için `fmtClock` kullanır.
- **Aktif kaynağa göre skorkart seçimi** — Store'dan `activeSourceId` okunup SCORECARDS'tan veri çekilir; veri yoksa render edilmez.
- **Aktif kaynağa göre rubrik seçimi** — `activeSourceId` ile RUBRICS'ten ilgili rubrik dizisi çekilir; kaynak değişince içerik otomatik güncellenir.
- **Rubrik yoksa gizlenme** — Aktif kaynak için kriter yoksa bileşen hiç render edilmez (null).
- **Geçen kriter sayacı rozeti** — Geçen/toplam formatında rozet; hepsi geçtiyse positive, aksi halde warning tonunda.
- **Kriter bazlı geç/kaldı ikonları** — Geçti için dolgulu CheckCircle (positive), kaldı için XCircle (danger).
- **Geç/kaldı erişilebilirlik etiketleri** — İkonlara `aria-label` olarak çevrilmiş `intel.pass` / `intel.fail` eklenir.
- **Kriter etiketi durum renklendirmesi** — Geçen kriterler `text-fg`, kalan kriterler soluk `text-muted` ile görsel öncelik verir.

### Konuşmacı analitiği & tracker detayları

- **Konuşma süresi yüzdesi ve saat gösterimi** — Her konuşmacının `talkSec` oranını yüzde olarak hesaplar ve mm:ss saat etiketiyle (`fmtClock`) gösterir; toplam tüm konuşmacıların `talkSec` toplamından türetilir.
- **Konuşma süresi ilerleme çubuğu** — Konuşma payını yüzdeye göre dolan, yuvarlatılmış bar ile görselleştirir.
- **Konuşmacı adı çözümleme** — Adı önce `stat.name`, yoksa `memberName(speakerId)` ile çözer.
- **Konuşmacı duygu durumu rozeti** — Sayısal duygu (-1..1) `sentimentFromValue` ile kategoriye çevrilip SentimentChip ile gösterilir.
- **Söz kesme (interruption) sayacı** — Her konuşmacı için söz kesme sayısı `intel.interruptions` çevirisiyle gösterilir.
- **Dolgu kelime (filler word) sayacı** — Her konuşmacı için dolgu kelime sayısı `intel.filler` çevirisiyle gösterilir.
- **Sıfıra bölünme koruması** — Toplam süre 0 olduğunda bölme hatasını önlemek için toplam en az 1 alınır (`|| 1`).
- **Tracker türüne göre ikon eşlemesi** — keyword→MagnifyingGlass, competitor→Flag, topic→Tag; 16px, muted, `aria-hidden`.
- **Tracker isabet (hits) rozeti** — Her izleyicinin geçiş sayısını `intel.hits` ile Badge içinde gösterir.
- **Rakip türü için tehlike vurgusu** — Tracker türü competitor ise rozet tonu danger, aksi halde neutral olur.
- **Tracker boş durum gizleme** — Aktif kaynak için tracker yoksa bileşen null döner.
- **Aktif kaynağa bağlı veri seçimi** — `activeSourceId` ile SPEAKER_STATS[id] / TRACKERS[id] filtrelenir; kaynak değiştikçe otomatik güncellenir, veri yoksa boş diziye düşer.

### Niyet & sentiment timeline detayları

- **Niyet güven skoru görselleştirmesi** — Her niyet için güven değeri yüzde (`confidence*100`) olarak metin ve accent renkli ilerleme çubuğuyla gösterilir; çubuk genişliği güvene göre ayarlanır.
- **Aktif kaynağa göre niyet verisi** — `activeSourceId` ile INTENTS[id]'den çekilir; kaynak değişince liste otomatik güncellenir.
- **Niyetler boş durumu** — Niyet yoksa `intel.none` mesajı gösterilir.
- **SVG çizgi grafiği (polyline)** — Duygu değerleri 300x80 viewBox'lı SVG içinde accent renkli polyline ile çizilir.
- **Boş veri durumu (erken çıkış)** — `sentiment` boşsa bileşen null döner, boş grafik gösterilmez.
- **Dinamik koordinat hesaplama (x/y ölçekleme)** — x ekseni nokta sayısına göre eşit aralıklı (tek nokta için PAD), y ekseni değeri orta hattan PAD dolgulu ölçeklenir.
- **Orta referans çizgisi (sıfır hattı)** — Grafiğin dikey ortasında nötr/sıfır seviyesini gösteren border renkli yatay çizgi.
- **Renk kodlu veri noktaları** — Her nokta `sentimentFromValue` ile sınıflandırılıp positive (--positive), negative (--danger), neutral (--muted) renkli daire olarak çizilir.
- **Erişilebilir grafik (role=img + aria-label)** — SVG `role="img"` ve çevrilmiş `aria-label` ile ekran okuyuculara anlam iletir.
- **Duygu lejantı (renk açıklaması)** — Grafiğin altında positive/neutral/negative için üç SentimentChip ile renk-anlam eşleştirmesi açıklanır.
- **Tema değişkenleriyle stillendirme** — Çizgi ve renkler CSS değişkenleriyle (--border, --accent, --positive, --danger, --muted) tanımlanır.

### Toplantı notları & recap detayları

- **Konuşmacı bazlı kelime/dakika (WPM) analizi** — `speakerStats` ile her konuşmacının dakikadaki kelime hızını hesaplayıp isim ve değerle listeler.
- **WPM oransal ilerleme çubuğu** — Her WPM değeri en yüksek WPM'e (`maxWpm`) göre normalize edilip dolu bar olarak görselleştirilir.
- **Anahtar kelime çıkarımı (etiket bulutu)** — `topKeywords` ile en sık geçen kelimeleri çıkarır ve sayısıyla (count) yuvarlatılmış etiket olarak gösterir.
- **Otomatik aksiyon maddesi çıkarımı** — `actionItems` ile transkriptten otomatik aksiyon maddeleri üretir, madde işaretli listeyle gösterir; yoksa `noActions` boş durumu.
- **Konuşmacı isim çözümleme (notlar)** — `nameOf`: konuşmacı adı `speakerId`'den farklıysa onu, değilse `memberName(speakerId)` kullanır.
- **TL;DR özet metni** — `recap.tldr` ile toplantının kısa özetini panelin başında gösterir.
- **Kararlar bölümü (koşullu)** — `recap.decisions` doluysa kararları listeler, boşsa gizlenir.
- **Sonraki adımlar bölümü (koşullu)** — `recap.nextSteps` doluysa listeler, boşsa render edilmez.
- **Aksiyon maddeleri listesi (sahip atamalı)** — `recap.actions` her maddeyi metin, sahip avatarı (`memberName ownerId`) ve sahip adıyla satır kartı olarak, benzersiz id ile gösterir.
- **Aksiyonu Sohbete Gönder** — Her aksiyon butonuyla `useSendActionToChat` üzerinden aksiyon metnini Messaging'e gönderir (Faz 2 cross-cut entegrasyonu).
- **Sohbete gönderim toast bildirimi** — Gönderim sonrası `useToastStore.push` ile pozitif "sentToChat" toast'ı gösterir.
- **Duyarlı grid yerleşimi (notlar/recap)** — MeetingNotesCard üç sütunlu (`sm:grid-cols-3`), RecapPanel iki sütunlu (`sm:grid-cols-2`) grid kullanır; sahip adı küçük ekranda gizlenir (`hidden sm:inline`).

### Ortak UI altyapısı

- **Ortak Card primitifi ve tasarım token'ları** — Paneller Card primitifi içinde fg/muted/accent/surface/border gibi tema token'larıyla tutarlı stillenir.
- **Tasarım primitive bileşen kullanımı** — Card (kart kabı) ve Badge gibi ortak UI primitive'leri kullanılır; tutarlı tasarım sistemi entegrasyonu sağlar.
- **Duygu Çipi (SentimentChip)** — Duyguyu (positive/neutral/negative) renk + ikon + metin ile birlikte gösteren satır içi rozet; üç kanaldan da bilgi verir.
- **Üç durumlu duygu ikon eşleştirmesi** — positive→Smiley (text-positive), neutral→SmileyMeh (text-muted), negative→SmileySad (text-danger).
- **Özelleştirilebilir className desteği** — SentimentChip dışarıdan `className` alıp `cn()` ile birleştirerek stil özelleştirmesine izin verir.
- **Erişilebilir duygu/ikon gösterimi (renk yalnız değil)** — SentimentChip duyguyu renk + ikon + metin ile sunar (AAA); ikonlar `aria-hidden`, anlam metinle de aktarılır.
- **i18n çoklu dil arayüz metinleri** — Tüm başlık, etiket, birim ve aksiyon metinleri react-i18next `t()` ile `intel.*` anahtarlarıyla çevrilir; sayı parametreleri interpolasyonla geçer.

### Yardımcı fonksiyonlar (saf, framework'ten bağımsız)

- **Saat biçimlendirme yardımcısı (fmtClock)** — Saniyeyi m:ss (saniye iki haneli sıfır dolgulu) biçimine çevirir.
- **Sayısal değerden duygu sınıflandırma (sentimentFromValue)** — >0.2 positive, <-0.2 negative, arası neutral.
- **Segment metnini dile göre çözme** — Segmentin metnini hedef dile göre döndürür: en→İngilizce, tr→Türkçe, diğerleri translations haritasından; yoksa tr'ye, o da yoksa en'e düşer, böylece UI hiç boş kalmaz.
- **Kaynak→hedef dil çifti çözümleme (MT yönlendirme)** — Hedef `off` veya kaynakla aynıysa `sameLang=true`, çeviri gerekmez; aksi halde makine çevirisi tetiklenir.
- **Ardışık segment birleştirme (mergeSegments)** — Aynı konuşmacıya ait ve `gapSec` (varsayılan 8sn) içindeki ardışık segmentleri tek satıra birleştirir; ilk segmentin id/startSec'i korunur, son segmentin sentiment'i kazanır.
- **Çeviri haritası birleştirme** — Birleştirilen segmentlerin `translations` haritalarını dil koduna göre harmanlar; her dilde iki metni boşlukla birleştirip kırpar, çeviri yoksa undefined döner.
- **Konuşmacı bazlı istatistik (diarization + WPM)** — Her konuşmacının kelime sayısı, tahmini süre (ardışık segment başlangıç farklarından, son segment için `tailSec` varsayılan 30sn) ve WPM'ini hesaplar.
- **Anahtar kelime çıkarımı (top keywords)** — En sık kelimeleri frekansa göre döndürür; stopword'ler ve 3 karakterden kısa tokenlar elenir, eşit frekansta alfabetik, varsayılan ilk 8.
- **Durak kelime (stopword) filtresi** — İngilizce yaygın bağlaç/zamir/edat ve dolgu kelimelerinden oluşan STOPWORDS kümesiyle gürültüyü temizler.
- **Aksiyon maddesi tespiti** — Regex ipuçlarıyla (action item, to-do, follow-up, will, need to, let's ve "by Monday/.../tomorrow/eod/saat" tarih kalıpları) olası aksiyonları yakalar.
- **Metin tokenizasyonu (normalize)** — Metni küçük harfe çevirir, alfasayısal ve kesme işareti dışını boşlukla değiştirip kelimelere böler, boş tokenları atar.
- **Kaynak dil olarak İngilizce (en) üzerinde çalışma** — Notlar zekası (konuşmacı, anahtar kelime, aksiyon) segmentin İngilizce kaynak metni üzerinde çalışır; çeviriden bağımsızdır.
- **Framework'ten bağımsız saf yardımcılar** — Notlar ve segment yardımcıları React/Zustand olmadan saf fonksiyonlardır; doğrudan birim test edilebilir.

### Veri & state — Intel store (Zustand)

- **Intelligence (Intel) Zustand store** — `useIntelStore` ile ekranın tüm durumunu (aktif kaynak, transkript segmentleri, duygu, koçluk, öne çıkanlar) tek merkezde tutar.
- **Aktif kaynak seçimi (setSource)** — Kaynak seçilince ilgili transkript/duygu/koçluk/highlight verilerini yükler; canlı akışı durdurur, arama/filtre/dub/redaksiyon durumlarını sıfırlar.
- **Canlı transkript segmentleri (segments)** — TranscriptSegment listesi; canlı yayında en fazla 300 segmentle sınırlanır (`capArray`).
- **Duygu durumu zaman serisi (sentiment)** — SentimentPoint dizisi; zaman damgalı (tSec) noktalar, 300 ile sınırlı.
- **Koçluk ipuçları (coaching)** — CoachingCue listesi; en fazla 60 ipucu.
- **Öne çıkanlar (highlights)** — Highlight dizisi; en fazla 60 öğe.
- **Canlı akış aç/kapat (toggleLive)** — `live` boolean'ı ile simüle canlı SSE akışını başlatıp durdurur.
- **Hedef çeviri dili seçimi (setTargetLang)** — `targetLang` ile altyazı çeviri dilini ayarlar; off/tr/en gibi kodları ve çeviri kapatmayı destekler.
- **Transkriptte arama (setSearch / search)** — Transkript metin araması durumu; kaynak değişiminde sıfırlanır.
- **Konuşmacıya göre filtreleme (setSpeakerFilter / speakerFilter)** — Transkripti belirli konuşmacıya filtreler; null tüm konuşmacıları gösterir.
- **Dublaj aç/kapat (toggleDub / dub)** — Çevrilmiş altyazının sesli dublaj modunu açıp kapatır.
- **Redaksiyon aç/kapat (toggleRedact / redact)** — Hassas bilgilerin transkriptte gizlenmesini açıp kapatır.
- **Tek mutasyon yolu ile olay uygulama (applyEvent)** — Tiplenmiş SSE olaylarını okuma modellerine uygulayan tek noktalı mutasyon; aktif kaynağa ait olmayan olayları yok sayar.
- **Idempotent olay işleme** — `applyEvent` her olayda mevcut id/tSec kontrolüyle yinelenen teslimat / yeniden abone olmada veri tekrarını önler (en-az-bir-kez teslimat güvenliği).
- **caption.emitted olayı işleme** — Yeni altyazı segmentini ekler; aynı id varsa yineleme engellenir, 300 ile sınırlanır.
- **intel.sentiment olayı işleme** — Yeni duygu noktasını ekler; aynı tSec varsa eklemez, 300 ile sınırlar.
- **intel.coaching olayı işleme** — Yeni koçluk ipucunu ekler; aynı id varsa eklemez, 60 ile sınırlar.
- **intel.highlight olayı işleme** — Yeni highlight'ı ekler; aynı id varsa eklemez, 60 ile sınırlar.
- **translation.ready olayı (captionsStore devri)** — Çeviri hazır olayı intel store'da işlenmez; çeviri tamponu captionsStore tarafından yönetilir (sorumluluk ayrımı).
- **Simüle canlı akış ilerletme (pushLive)** — Interval ile tetiklenen, feed'i tek tek ilerleten fonksiyon; feed bitince canlı modu kapatır.
- **Feed ilerleme göstergesi (feedIndex)** — Hangi feed öğesine gelindiğini izleyen sayaç; akış bitince `live`'ı false yapar.

### Veri & state — Çeviri/Altyazı store (captionsStore)

- **Çeviri ve Altyazı Oturumu Store'u (useCaptionsStore)** — Aktif dil çiftlerini ve canlı altyazı tamponunu yöneten bağımsız Zustand store; TranslationSession aggregatını canonical olarak sahiplenir, intelStore'dan ayrıdır.
- **Çeviri oturumu başlatma (startSession)** — Verilen kaynak için yeni oturum başlatır; kaynak dilini SOURCES'tan çözer (yoksa 'en'), hedef dilleri varsayılan `['tr']`, oturum id'sini `ts_<sourceId>` formatında üretir.
- **Hedef dilleri ayarlama (setTargetLangs)** — Aktif oturumun hedef dillerini günceller ve voicePreserving'i yeni dillere göre yeniden türetir; oturum yoksa hiçbir şey yapmaz.
- **Ses koruma (voice-preserving) ayarı** — `setVoicePreserving` ile açıp kapatır; `deriveVoicePreserving` ile hedeflerden biri 'off' olmayıp kaynaktan farklıysa otomatik açık türetilir.
- **Canlı altyazı segmenti ekleme (applyCaption)** — CaptionEmitted olayındaki segmenti tampona ekler; tampon en fazla 50 segment (BUFFER_CAP), fazlası baştan atılır.
- **Altyazı tamponu kapasite sınırı (BUFFER_CAP=50)** — Tampon son 50 segmenti tutar, bellek sınırlı kalır, yalnızca güncel altyazılar gösterilir.
- **Hedef dile çeviri birleştirme (applyTranslation)** — TranslationReady olayında, belirli segmentId için gelen çeviriyi ilgili segmentin translations sözlüğüne (dil koduna göre) işler.
- **Oturumu sonlandırma (endSession)** — Aktif oturumu temizler (session null), canlı altyazı akışını ve tamponunu sıfırlar.
- **Canlı SSE akışına bağlanma (connect)** — `subscribeIntel` ile bağlanır; kaynak değişmişse önce oturumu başlatır, caption.emitted'i applyCaption'a, translation.ready'yi applyTranslation'a yönlendirir, unsubscribe döndürür; opsiyonel `intervalMs` ile hız ayarlanır.
- **Segment metnini dile göre çözme (caption)** — Belirli segmentId ve dil kodu için tampondaki segment metnini `segmentText` ile çözer; segment yoksa undefined.

### Veri & state — Mock veri ve API katmanı

- **Çeviri haritası normalizasyonu (withTranslationsMap)** — Her segmentin daima var olan `tr` metnini açık `translations` haritasına `{tr: seg.tr, ...}` yerleştirip FastAPI Segment.translations kontratıyla (70+ hedef dil) uyumlu hale getirir.
- **Kaynak türü çözümleme (sourceType fallback)** — `fetchTranscript`, kaynağın kind alanını TranscriptSourceType'a eşler; bulunamazsa 'conversation', dil bulunamazsa 'en' varsayılanına düşer.
- **Mock veri kaynaklarının indekslenmesi** — API, TRANSCRIPTS/SENTIMENT/INTENTS/SCORECARDS/HIGHLIGHTS/SOURCES yapılarından sourceId anahtarıyla veri çeker, eksik anahtarlar için boş dizi varsayar.
- **İstihbarat kaynakları (IntelSource) listesi** — Üç örnek kaynak: Daily Standup (toplantı, 480sn), Sales call—Acme (çağrı, 540sn, canlı), Support—Jordan Blake (konuşma, 300sn); her biri başlık, tür, dil ve süre içerir.
- **Kaynak türü ayrımı (meeting / call / conversation)** — Her kaynak meeting/call/conversation olarak sınıflandırılır; UI bunları farklı bağlamlarda gösterebilir.
- **Canlı kaynak işareti (live)** — Sales kaynağı `live:true` ile işaretlenip canlı transkript/feed akışını tetikler.
- **Çok dilli transkript segmentleri** — TRANSCRIPTS her kaynak için zaman damgalı (startSec) segmentler tutar; her segmentte en/tr metin, konuşmacı kimliği ve duygu durumu bulunur.
- **Ek dil çevirileri (translations alanı)** — Bazı segmentlerde es ve de gibi ek dillerde hazır çeviri sunulur; dil değişince anında gösterilebilir.
- **Konuşmacı kimliği ve görünen ad** — Segmentlerde speakerId (usr_*, ext_*) ve opsiyonel speakerName ile dahili kullanıcılar ve harici katılımcılar ayırt edilir.
- **Segment bazlı duygu etiketi** — Her segment positive/neutral/negative duygu etiketi taşır; satır bazlı ton renklendirme/analizi için kullanılır.
- **Zaman içinde duygu eğrisi (SENTIMENT)** — Her kaynak için zaman damgalı (tSec), -1..+1 aralığında duygu noktaları.
- **Niyet tespiti ve güven skoru (INTENTS)** — Etiketli niyetler ve confidence skoru (örn. "Pricing objection" %88, "Buying signal" %83).
- **Konuşma karne kartı (SCORECARDS)** — talkRatio, sentiment, questions, pace, monologueSec metriklerini tutar.
- **CSAT ve tahmini CSAT skoru** — Scorecard'ta gerçek `csat`, `predictedCsat` ve `csatReason` açıklaması bulunur.
- **Konuşmacı bazlı analitik (SPEAKER_STATS)** — Her konuşmacı için words, talkSec, sentiment, interruptions ve fillerWords sayıları.
- **Söz kesme ve dolgu sözcük takibi** — interruptions ve fillerWords ile konuşma kalitesi ölçülür ve gösterilir.
- **Özel AI değerlendirme rubriği (RUBRICS)** — Her kaynak için pass/fail otomatik maddeleri (örn. "Kendini ve şirketi tanıttı", "İtirazı kabul etti", "Bütçeyi doğruladı").
- **Yapısal AI özeti / Intelligent Recap (RECAPS)** — tldr, decisions, actions (sahipli) ve nextSteps içeren yapılandırılmış özet.
- **Sahipli aksiyon maddeleri (action items)** — Recap actions, ownerId ile kullanıcılara atanmış görevler içerir (örn. "Send proposal to Acme today" → usr_1).
- **Özel Anlar / Trackers (TRACKERS)** — label, kind (keyword/competitor/topic) ve hits değerli izleyiciler.
- **Rakip tespit izleyicisi** — Tracker kind 'competitor' ile rakip adı (örn. "Competitor: Rival.io") geçince tespit edilip sayılır.
- **Konuşma öne çıkanları (HIGHLIGHTS)** — kind (decision/objection/action/question) ile sınıflı, her biri bir segmentId'ye bağlı özet metinli öne çıkanlar.
- **Highlight'tan transkripte bağlama (segmentId)** — Her öne çıkan madde belirli bir segmente referans verir, ilgili konuşma anına gidiş altyapısı sağlar.
- **Canlı koçluk ipuçları / whisper (COACHING)** — Yöneticilere özel (RBAC) canlı uyarılar: kind (warning/tip/praise), metin ve tSec (örn. "Price objection raised — acknowledge before countering").
- **RBAC — koçluk yöneticilere özel** — Koçluk ipuçlarının yalnızca yöneticilere gösterileceği belirtilir; rol bazlı görünürlük kontrolü.
- **Canlı akış feed'i (LIVE_FEED)** — Canlı kaynaklar için akışla gelen veriler: yeni segment (seg), duygu noktası (point), opsiyonel koçluk ipucu (cue) ve highlight.
- **Çoklu dil hedef listesi (70+ dil yüzeyi)** — LANGS listesi: Off, Türkçe, English, Español, Français, Deutsch, Português, العربية, 日本語, 中文; kod ve etiketle, en/tr için gerçek metin.
- **Çeviri kapatma seçeneği (Off)** — `off` kodlu seçenekle çeviri kapatılır, orijinal dile dönülebilir.

### Veri & state — SSE olay sözleşmesi & akış katmanı

- **İstihbarat olay tipleri (IntelEventType)** — Beş tipli sözleşme: caption.emitted, translation.ready, intel.sentiment, intel.coaching, intel.highlight.
- **SSE Alan Olayları (IntelEvent)** — SSE'yi tipleyen ayrımlanmış birleşim (discriminated union); tüm akış ve store mutasyonlarının temelidir.
- **Canlı altyazı yayını (caption.emitted)** — Yeni transkript segmentinin canlı yayınlandığı olay; gerçek zamanlı altyazıyı besler.
- **Çeviri hazır olayı (translation.ready)** — Belirli segment için belirli dilde çeviri metninin hazır olduğunu bildirir (segmentId + lang + text); asenkron çeviriyi destekler.
- **SSE kanal eşlemesi (EVENT_CHANNEL)** — Her olay tipini caption / translation / intel SSE kanalına eşler; FastAPI'nin caption.*/translation.*/intel.* yayınlarıyla hizalıdır.
- **channelOf yardımcı fonksiyonu** — Verilen olay tipinin hangi SSE kanalında ilerlediğini döndürür.
- **Alan-olayı okunabilir adları (DOMAIN_EVENT_NAME)** — Teknik olay tiplerini insan-okunur adlara eşler: CaptionEmitted, TranslationReady, SentimentShifted, CoachingCueRaised, HighlightDetected.
- **Taşıma katmanından bağımsız olay sözleşmesi** — Mock dispatcher (stream.ts) ile gerçek FastAPI SSE arasında aynı tipli olayları yeniden oynatma; transport değişse de tüketiciler değişmez.
- **Mock FastAPI SSE akış katmanı (stream.ts)** — Gerçek FastAPI SSE akışını (caption.*/translation.*/intel.*) taklit eder; gövdesi EventSource ile değiştirilince tüketici kodu değişmeden çalışır.
- **Gruplanmış olay üretimi (intelEventGroupsFor)** — Her feed öğesi için tiplenmiş olay grubu üretir: caption.emitted, translation.ready, intel.sentiment sırayla, varsa koçluk ve highlight; saf/timer'sız olduğu için deterministik test edilebilir.
- **Otomatik çeviri olayı üretimi (translation.ready)** — Her altyazı segmenti için `item.seg.tr` çevirisini 'tr' dilinde translation.ready olayı olarak yayınlar; otomatik Türkçe çeviri akışını besler.
- **Düzleştirilmiş olay dizisi (intelEventsFor)** — Bir kaynağın tüm olay gruplarını tek sıralı düz diziye çevirir; test ve toplu işleme için.
- **Canlı akışa abonelik (subscribeIntel)** — Simüle akışa abone olur, her tick'te bir feed öğesinin olay grubunu yayınlar, feed bitince onComplete çağırır, unsubscribe döndürür.
- **Yapılandırılabilir akış tick aralığı (intervalMs)** — SubscribeOpts ile tick aralığı ayarlanır (varsayılan 2600ms).
- **Akış tamamlanma geri çağrısı (onComplete)** — Feed tükendiğinde bir kez tetiklenen callback ile akış bitişine tepki verilir.
- **Mock akış dispatcher sözleşmesi** — stream.ts mock dispatcher'ı bu olayları yeniden oynatacak ve EventSource ile değiştirilince tüketiciler değişmeyecek şekilde tasarlanmış transport-bağımsız sözleşme.

### Veri modeli — çekirdek tipler

- **Duygu durumu tipi (Sentiment)** — Segment tonunu positive/neutral/negative olarak sınıflar; tüm duygu analizinin temeli.
- **Transkript segmenti (TranscriptSegment)** — id, speakerId, speakerName, startSec, sentiment, en (kaynak), tr (çeviri) ve translations (dil→metin haritası) alanlarını taşıyan atomik konuşma birimi.
- **Çok dilli çeviri haritası** — Her segment için `{dilKodu: metin}` açık çeviri haritası; 70+ hedef dilin MT çıktısını taşır, en/tr daima mevcut çift kalır.
- **Duygu zaman noktası (SentimentPoint)** — Belirli saniyede (tSec) -1..1 arası duygu değeri; duygu eğrisini çizmek için.
- **Niyet tespiti (Intent)** — Etiketli niyet ve 0-1 güven skoru; AI niyet analizini besler.
- **Koçluk ipucu (CoachingCue)** — Belirli anda (tSec) yükselen tip/warning/praise türünde mesaj; id, kind, text, tSec alanları.
- **Önemli an (Highlight)** — id, kind (decision/action/objection/question), text ve segmentId alanlı, bir segmenti önemli an olarak işaretleyen yapı.
- **Skor kartı tipi (Scorecard)** — talkRatio, ortalama sentiment, questions, pace (WPM), monologueSec, gerçek csat (1-5), predictedCsat ve csatReason.
- **Konuşmacı bazlı analitik tipi (SpeakerStat)** — speakerId, opsiyonel name, words, talkSec, sentiment (-1..1), interruptions, fillerWords.
- **Özel skor kriteri (RubricItem)** — id, label ve pass (boolean) ile geçti/kaldı sonuçlu özel skorlama kriteri (Dialpad AI Scorecards).
- **Yapay zeka özeti (Recap)** — tldr, decisions, sahipli actions (RecapAction: text + ownerId) ve nextSteps içeren yapısal özet.
- **İzleyici (Tracker)** — id, label, kind (keyword/competitor/topic) ve hits ile izleme (Dialpad Custom Moments).
- **İstihbarat kaynağı (IntelSource)** — başlık, tür (meeting/call/conversation), kaynak dil kodu, süre ve live bayrağı.
- **Dil seçeneği (LangOption)** — kod ve etiket çiftiyle dil seçeneği; dil/çeviri dropdown'larını besler.
- **Analiz raporu toplaması (AnalysisReport)** — FastAPI `GET /analysis/:id` sözleşmesini yansıtan birleşik rapor: transkript, duygu noktaları, niyetler, skor kartı ve önemli anlar.
- **Transkript kaynak türü (TranscriptSourceType)** — meeting/call/webinar/conversation; çoklu kanaldan transkript desteği.
- **Transkript toplaması (Transcript)** — FastAPI `GET /transcripts/:id` sözleşmesini yansıtan ham, dil-çözümlenmiş transkript: kaynak türü, kaynak kimliği, algılanan dil ve segmentler.
- **Çeviri & altyazı oturumu (TranslationSession)** — Çeviri bağlamının kök toplaması: aktif kaynak dil, hedef diller listesi, voicePreserving bayrağı ve canlı altyazı segment tamponu.
- **Ses koruyan çeviri (voicePreserving)** — Çeviride orijinal ses tonunu/karakterini koruyup korumamayı belirleyen bayrak.
- **LangPair veri modeli** — source, target, sameLang ve needsTranslation alanlarıyla dil çifti kararı; çeviri çağrısının tetiklenip tetiklenmeyeceğini belirler.
- **MergeOpts birleştirme seçeneği** — gapSec ile ardışık aynı-konuşmacı segmentleri arasında birleştirme için izin verilen maksimum başlangıç-zaman boşluğu.
- **SpeakerStat (notlar) veri modeli** — speakerId, name, words, seconds, wpm ile konuşmacı katılım panelini besleyen istatistik tipi.


---

<a id="canvas"></a>

## Canvas sekmesi

Canvas, toplantı, mesajlaşma, çağrı ve müşteri deneyimi (CX) bağlamını prompt güdümlü olarak düzenlenebilir bloklara sentezleyen, çok kullanıcılı kalıcı işbirlikçi pano sekmesidir (Microsoft Copilot Pages / Webex AI Canvas paritesi). Kullanıcı doğal dil prompt'u yazar veya öneri çiplerine tıklar; sistem bunları metin, özet, tablo, metrik, aksiyon ve kontrol listesi bloklarına dönüştürür.

### Genel sayfa kabuğu ve başlık

- **AI Canvas sayfa kabuğu (yetki korumalı)** — Prompt güdümlü, çok kullanıcılı AI Canvas board'unu render eden ana sayfa; ortalanmış, maksimum genişlikli (max-w-4xl) bir düzen kurar. `canvas.view` yetkisi yoksa Forbidden bileşeni gösterilir.
- **Doküman başlığı ve alt başlık** — Sparkle ikonuyla dokümanın dinamik başlığını (`doc.title`) ve i18n'li `canvas.subtitle` alt başlığını gösteren üst başlık alanı.
- **Çoklu kullanıcı (collaborator) avatarları** — `doc.collaborators` listesindeki her işbirlikçi için üst üste binen avatar yığını; her avatarda isim title olarak verilir ve grup `canvas.collaborators` etiketiyle erişilebilir kılınır.
- **Blok sayısı rozeti** — Doküman içindeki toplam blok sayısını (`doc.blocks.length`) i18n'li `canvas.blocks` metniyle nötr tonlu bir Badge içinde gösterir.

### Ana akışlar (prompt ile blok üretimi)

- **Serbest metin prompt çubuğu** — Kullanıcının doğal dil prompt'u yazıp gönderebildiği metin girişi; yerel React state (`text`) ile kontrol edilir, `canvas.promptPh` placeholder ve sr-only label ile erişilebilir.
- **Çalıştır (Run) butonu** — PaperPlaneRight ikonlu, `canvas.run` etiketli buton; metin boşken devre dışı kalır, tıklanınca `runPrompt` ile yeni blok üretir ve girişi temizler.
- **Enter ile prompt gönderme klavye kısayolu** — Prompt girişinde Enter'a basıldığında varsayılan davranış engellenip prompt çalıştırılır; boş/whitespace metin gönderimi engellenir.
- **Serbest metin prompt ile blok üretme** — Yazılan metin, prompt kütüphanesiyle anahtar kelime eşleştirmesine göre uygun blok şablonuna dönüştürülür; eşleşme yoksa metni gövde olarak alan bir `text` bloğu oluşturulur. Yeni blok listenin başına eklenir.
- **Prompt öneri çipleri** — `prompts` listesindeki her öneri için tıklanabilir yuvarlak (pill) buton; tıklanınca `runPromptId` ile o öneriye bağlı blok şablonunu üretir. `canvas.suggestions` etiketiyle gruplanır.
- **Öneri çipiyle blok üretme** — Belirli bir öneri çipi id'siyle o şablona ait blok üretilip belgenin en üstüne eklenir; geçersiz id sessizce yok sayılır.
- **Tümünü temizle aksiyonu** — En az bir blok varken görünen Trash ikonlu ghost IconButton; `canvas.clear` etiketiyle store'daki `clear()` ile tüm blokları siler.
- **Boş durum (EmptyState)** — Hiç blok yokken Sparkle ikonu, `canvas.empty` başlığı ve `canvas.emptyHint` ipucu ile boş durum ekranı gösterir.

### Prompt eşleştirme motoru

- **Keyword tabanlı prompt eşleştirme (matchPrompt)** — Serbest metni prompt kütüphanesindeki en iyi `CanvasPrompt`'a token/kelime örtüşmesiyle eşleştirir; bir prompt'un keywords'lerinin tamamen geçtiği eşleşmelere kelime uzunluğu kadar puan verip en yüksek skorlu adayı döner.
- **Metin tokenizasyonu** — Girdiyi küçük harfe çevirip harf/rakam dışı karakterleri ayırarak Unicode-duyarlı (`\p{L}`, `\p{N}`) token dizisine bölen yardımcı; eşleştirme algoritmasının temeli.
- **Blok türü şablonları (templateFor)** — Her blok türü için deterministik demo içerik üretir: summary/text için prose body, actions/checklist için 3'lü görev listesi, table için kanal/açık/SLA tablosu, metrics için Call SLA / CSAT / Avg handle metrikleri.
- **Eşleşen prompt'tan blok inşası (buildBlock)** — Eşleşen `CanvasPrompt` ve sıra numarasından (seq) deterministik bir `CanvasBlock` üretir; id, kind, title, sources kopyası ve türe uygun şablon içeriğini birleştirir.

### Blok kartı ve render

- **Kanvas blok kartı (CanvasBlockCard)** — Tek bir kanvas bloğunu kart (article) olarak render eden bileşen; blok türüne göre farklı içerik (özet, eylem listesi, kontrol listesi, tablo, metrikler) gösterir.
- **Sabitlenmiş blokları öne alan sıralama** — Bloklar render edilmeden önce pinned olanlar listenin başına gelecek şekilde sıralanır.
- **Blok kartı listesi render'ı** — Sıralanmış blokları `CanvasBlockCard` ile dikey boşluklu bir listede gösterir; her blok kendi id'siyle key'lenir.
- **Blok türü rozeti** — Her blok kartının başında bloğun türünü (kind) i18n ile çevrilmiş accent tonlu bir Badge olarak gösterir.
- **Blok başlığı** — Blok başlığını (`block.title`) kalın bir h3 başlık olarak gösterir.
- **Kaynak (source) etiketleri** — Bloğun hangi ürün modüllerinden (meetings, messaging, calling, support, intelligence, docs vb.) beslendiğini i18n ile çevrilmiş kaynak rozetleri olarak gösterir; kaynak yoksa bölüm gizlenir.

### Blok türüne özgü içerik

- **Özet/metin gövdesi gösterimi** — Blok türü `summary` veya `text` ise ve body doluysa serbest metin gövdesini paragraf olarak gösterir.
- **Eylem/kontrol listesi öğeleri** — Blok türü `actions` veya `checklist` ise öğeleri işaretlenebilir onay kutuları olarak listeler.
- **Liste öğesi işaretleme (toggle)** — Her liste öğesinin onay kutusu `toggleItem(block.id, it.id)` aksiyonunu çağırır; tamamlananlar üstü çizili ve soluk (muted line-through) gösterilir.
- **Kontrol listesi ilerleme çubuğu** — Sadece `checklist` türünde, `blockProgress(block)` ile hesaplanan tamamlanma oranını yüzde olarak accent renkli bir ilerleme çubuğunda gösterir.
- **Tablo bloğu gösterimi** — Blok türü `table` ise sütun başlıkları ve satır hücrelerinden oluşan tam genişlikte bir HTML tablosu render eder.
- **Metrik/KPI ızgarası** — Blok türü `metrics` ise etiket-değer çiftlerini duyarlı (2/3 sütunlu) bir ızgarada kart kutucukları olarak gösterir.

### Blok etkileşim aksiyonları

- **Blok sabitleme/sabit kaldırma (pin/unpin)** — Sabitleme butonu `togglePin` aksiyonuyla bloğu sabitler veya çıkarır; sabitliyken buton primary varyanta geçer, ikon dolu (fill) olur ve kartın etrafına accent renkli halka (ring) eklenir.
- **Bloğu yukarı taşıma** — `moveUp` butonu `moveBlock(block.id, 'up')` ile bloğu listede yukarı taşır (ArrowUp ikonu).
- **Bloğu aşağı taşıma** — `moveDown` butonu `moveBlock(block.id, 'down')` ile bloğu listede aşağı taşır (ArrowDown ikonu).
- **Bloğu silme** — Trash butonu `removeBlock(block.id)` ile bloğu kaldırır.
- **Blok yukarı/aşağı taşıma (sıralama)** — Bir bloğu komşu blokla yer değiştirerek listede kaydırır; sınırlarda (en üst/en alt) işlem yapılmaz.
- **Checklist/aksiyon öğesi toggle (toggleItem)** — Bir bloktaki belirli öğenin done durumunu değiştirip yeni (immutable) bir blok döndürür; öğe yoksa bloğu olduğu gibi geri verir. Checklist ve actions bloklarında öğe işaretleme sağlar.
- **Blok tamamlanma oranı (blockProgress)** — Öğe içeren bloklar için tamamlanan öğelerin oranını (0..1) hesaplar; öğe yoksa 0 döner.
- **Blok kindlerine göre sayım (docCounts)** — Dokümandaki blokları türlerine göre (summary, actions, table, checklist, metrics, text) sayan ve başlık istatistikleri için kullanılan saf yardımcı fonksiyon.

### Veri & state (Zustand store)

- **Zustand canvas store'u** — `useCanvasStore` ile belge (`doc`) ve prompt önerileri (`prompts`) durumu yönetilir; tüm aksiyonlar bu merkezi store üzerinden yürür. Blok kartı bileşeni `togglePin`, `removeBlock`, `toggleItem`, `moveBlock` aksiyonlarını seçici (selector) ile alır.
- **Blok silme (store)** — Verilen id'ye sahip blok belgeden kaldırılır ve belgenin güncellenme zamanı tazelenir.
- **Blok sabitleme (pin) açma/kapama (store)** — Bir bloğun pinned durumunu tersine çevirir; önemli bloklar sabitlenebilir.
- **Kontrol listesi/aksiyon öğesi tamamlama (store)** — Bir blok içindeki belirli bir öğenin done durumunu açıp kapatır.
- **Belge başlığını yeniden adlandırma (renameDoc)** — Canvas belgesinin başlığını günceller; yalnızca bu işlem `updatedAt`'i tazelemez.
- **Tüm blokları temizleme (clear)** — Belgedeki tüm blokları kaldırıp boş bir canvas bırakır ve güncellenme zamanını tazeler.
- **Güncellenme zaman damgası takibi (touch)** — Blok değişikliklerinde belgenin `updatedAt` alanı otomatik olarak güncel zamana (`Date.now`) çekilir; "son güncelleme" gösterimi mümkün olur.
- **Başlangıç mock belgesinin klonlanması (cloneDoc)** — Store başlatılırken `CANVAS_DOC` derin kopyalanır (collaborators, blocks, sources, items klonlanır); orijinal mock veri mutasyona karşı korunur.
- **Artımlı benzersiz id üretimi (seq)** — Üretilen yeni bloklar için seq sayacıyla (`cb_<n>`) benzersiz id atanır.

### Veri modeli

- **Çok türlü blok modeli (CanvasBlockKind / CanvasBlock)** — Bloklar 6 farklı türde olabilir: summary, actions, table, checklist, metrics, text; her tür kendi alanını kullanır.
- **Canvas belge modeli (CanvasDoc)** — id, title, blocks dizisi, collaborators ve updatedAt ile kalıcı, prompt güdümlü işbirlikçi pano belgesini temsil eder.
- **Prompt önerisi modeli (CanvasPrompt)** — id, label (çip etiketi), keywords (tetikleyici kelimeler), kind (üretilecek blok türü) ve sources ile bir blok şablonuna eşlenen prompt önerisini temsil eder.
- **Çapraz alan kaynak/provenance modeli (CanvasSource)** — Her blok hangi alanlardan sentezlendiğini gösteren sources dizisi taşır: meetings, messaging, calling, support, intelligence, docs. UI'da grounding/kaynak çipleri olarak gösterilir; şablon ve `buildBlock` akışında bloğa kopyalanır.
- **Kontrol listesi öğesi modeli (ChecklistItem)** — id, text ve done alanlarıyla yapılacak/aksiyon öğelerini temsil eder.
- **Tablo blok modeli (CanvasTable)** — columns (sütun başlıkları) ve rows (satır hücreleri) ile tablo verisini taşır.
- **Metrik blok modeli (CanvasMetric)** — label ve value çiftiyle KPI/metrik gösterimini temsil eder.
- **Blok gövde alanı (body / prose)** — summary ve text türü bloklar için serbest metin gövdesi tutulur.
- **Mock çok kullanıcılı işbirliği (collaborators / presence)** — Belge, çok kullanıcılı presence'ı temsil eden collaborators listesi taşır; gerçek senaryoda WS üzerinden eşzamanlı düzenleme yapılacağı (mock) belirtilmiştir. `CANVAS_COLLABORATORS` sabiti üç örnek isim (İsmail Karaca, Defne Yıldız, Marco Rossi) ile presence demosunu besler.

### Seed (başlangıç) verisi

- **Başlangıç kanvas dokümanı (CANVAS_DOC)** — id, başlık ("Workspace pulse"), işbirlikçiler, updatedAt zaman damgası ve başlangıç blokları içeren seed kanvas doküman veri modeli.
- **Prompt kütüphanesi (CANVAS_PROMPTS)** — Her girdi tetikleyici anahtar kelimeleri bir blok şablonuna (kind + sources) eşleyen 5 hazır prompt: haftalık özet, eylem maddeleri çıkar, destek/çağrı KPI'ları, kanala göre konuşma karşılaştırması, lansman hazırlık kontrol listesi.
- **Seed özet bloğu** — Toplantılar, mesajlaşma ve çağrı kaynaklarından beslenen örnek özet bloğu (32 toplantı, 4 eskalasyon çözüldü, %94 çağrı SLA gibi metinli içerik).
- **Seed eylem maddeleri bloğu** — Toplantılar ve intelligence kaynaklarından beslenen, biri tamamlanmış üç eylem maddesi (lansman risklerine sahip atama, fiyatlandırma metni onayı, go/no-go incelemesi) içeren örnek actions bloğu.

### Erişilebilirlik & i18n

- **i18n çeviri desteği** — `useTranslation` ile tüm etiketler (blok türü, kaynak, pin/unpin, taşı, sil) çeviri anahtarları üzerinden gösterilir.
- **Erişilebilirlik (aria etiketleri ve motion-reduce)** — IconButton'lara açıklayıcı label verilir, ikonlar `aria-hidden` işaretlenir ve ilerleme çubuğunda `motion-reduce:transition-none` ile hareket azaltma desteklenir.

### Entegrasyon konsepti

- **AI Canvas çapraz-alan sentez konsepti** — Toplantı, mesajlaşma, arama ve CX bağlamını düzenlenebilir bloklara sentezleyen, prompt güdümlü kalıcı işbirlikçi pano (Microsoft Copilot Pages / Webex AI Canvas paritesi). Backend'in blok üretimini stream edip multiplayer'ı WS ile senkronlayacağı, UI'ın bu şekilleri tükettiği bounded context.


---

<a id="admin"></a>

## Admin sekmesi

Admin sekmesi, çok kiracılı (multi-tenant) bir yönetim konsolu olarak planlama, denetim, güvenlik/uyumluluk, federasyon ve faturalandırmayı tek bir yerde toplar. Microsoft Purview ve Entra sınıfı yönetişim yetenekleriyle (DLP, hassasiyet etiketleri, yasal saklama, bilgi bariyerleri, iletişim uyumluluğu, koşullu erişim) Teams paritesi sunarken, ödeme/silme gibi tehlikeli aksiyonlar yalnızca UI akışı olarak ele alınır ve gerçek yürütme açık onayla backend'de yapılır.

### Ana akışlar & navigasyon

- **Admin Konsolu sekme navigasyonu** — 5 sekmeli (Genel Bakış, Denetim, Güvenlik, Federasyon, Faturalama) ARIA tablist yapısı; her sekme ikon + i18n etiketiyle gösterilir, seçili sekme accent renkle vurgulanır.
- **Sekme state yönetimi** — `React.useState` ile aktif sekme tutulur (varsayılan `overview`); tıklamada ilgili panel koşullu olarak render edilir.
- **Panel kompozisyonu** — Sekmeye göre OverviewDashboard, AuditLogViewer, SecurityPolicies, FederationSettings veya BillingPanel alt panellerinden biri gösterilir.
- **Yetki bazlı erişim kontrolü** — `useAuthStore`'dan gelen `can('admin.access')` izni yoksa tüm konsol yerine Forbidden bileşeni gösterilir.
- **Başlık ve alt başlık** — Konsol üstünde i18n'li büyük başlık (`nav.admin`) ve açıklama alt başlığı (`admin.subtitle`) gösterilir.
- **Erişilebilirlik ve i18n (konsol)** — tablist/tab role, `aria-selected`, `aria-label` ve `aria-hidden` ikonlar; tüm metinler react-i18next `t()` ile çevrilir (`nav.admin`, `admin.subtitle`, `admin.tabs.*`).

### Genel Bakış Panosu

- **Genel Bakış Panosu (OverviewDashboard)** — Plan, koltuk sayısı, faturalama durumu ve kota kullanımını tek bir panoda gösteren özet ekran.
- **Plan ve faturalama özet kartı** — Üst kartta mevcut plan adı (accent rozet), koltuk sayısı ve faturalama durumu (positive rozet) i18n çevirileriyle gösterilir.
- **Kota kartları ızgarası** — `quotas` dizisi üzerinden küçük ekranda 3 sütunlu responsive ızgarada her kota için ayrı kart üretir.
- **Kota seviyesi hesaplama (quotaState)** — `quotaState(used, limit)` ile her kota ok/warn/exceeded seviyesine sınıflandırılır.
- **Kota seviyesi görsel eşlemesi** — `LEVEL` haritası her QuotaLevel'a ikon (CheckCircle/Warning/XCircle), ton (positive/warning/danger) ve renk sınıfı atayarak rozet ve ilerleme çubuğunu renklendirir.
- **Kota kullanım oranı ve ilerleme çubuğu** — `used/limit` yüzdesi (limit 0 ise %0) hesaplanır ve %100 ile sınırlanmış, seviyeye göre renklendirilmiş ilerleme çubuğu olarak gösterilir.
- **Kota durum rozeti ve sayaç** — Her kota kartında durum ikonu+etiketi içeren rozet ve `used / limit` metni gösterilir.
- **Overview store entegrasyonu** — `billing` (plan/seats/status) ve `quotas` (key/used/limit) verileri `useAdminStore` üzerinden okunur.
- **Overview erişilebilirlik ve i18n** — Dekoratif ikon ve ilerleme dolgusu `aria-hidden`; tüm metinler ve dinamik anahtarlar (`admin.planName.*`, `admin.billingStatus.*`, `admin.quota.*`) react-i18next ile çevrilir.

### Denetim Günlüğü Görüntüleyici

- **Denetim Günlüğü Görüntüleyici (Audit Log Viewer)** — Denetim kayıtlarını bir Card içinde tablo olarak listeleyen panel; her kayıt için aksiyon, aktör, kaynak, IP ve zaman gösterilir.
- **Denetim kaydı tablo sütunları** — Aksiyon, Aktör, Kaynak, IP ve Zaman sütunlarından oluşan erişilebilir tablo başlığı (`scope=col`); IP yoksa em-dash (—) gösterilir.
- **Aksiyon metin araması** — Büyüteç ikonlu arama kutusuyla denetim kayıtlarını aksiyon adına göre `filterAudit` (büyük/küçük harf duyarsız içerik eşleşmesi) ile filtreleme.
- **Aktöre göre filtreleme** — Benzersiz aktör kimliklerinden türetilen açılır menüyle (tümü + her aktör) kayıtları belirli bir aktöre göre süzme.
- **Benzersiz aktör listesi türetme** — Mevcut kayıtlardaki `actorId` değerlerinden `Set` ile yinelenenler ayıklanarak filtre menüsü dinamik doldurulur.
- **Veri ikamet bölgesi (residency) seçimi** — global, EU, US, TR bölgeleri arasından seçim yaptıran açılır menü; veri ikameti politikası bağlamı sunar (bölge etiketleri büyük harfle).
- **Etkileşimli saklama penceresi (retention slider)** — 0-365 gün arası kaydırma çubuğuyla UI içinden saklama süresini ayarlama; seçilen günden eski kayıtlar listeden gizlenir (Calendly farklılaştırıcısı self-servis saklama).
- **Saklama süresine göre kayıt gizleme (retentionExpired)** — Her kaydın yaşını (`now - at`) gün cinsine çevirip `retentionExpired` ile eşiği aşanları görünür listeden çıkarır.
- **Temizlenen kayıt sayacı (purged göstergesi)** — Saklama nedeniyle gizlenen kayıt sayısını hesaplayıp 0'dan büyükse uyarı renginde rozet (`admin.purged`) gösterir.
- **Zaman damgası biçimlendirme** — Kayıt zamanını (ms) yerel ayara göre ay/gün/saat/dakika formatına çeviren `fmt` yardımcısı.
- **Boş durum mesajı (no audit)** — Görünür kayıt kalmadığında `colSpan` ile yayılan `admin.noAudit` boş durum satırı.
- **Audit store ve veri modeli** — `useAdminStore` selector'ı ile audit dizisi çekilir; her kaydın `id`, `action`, `actorId`, `resource`, `ip` (opsiyonel) ve `at` (ms) alanları okunur.
- **Denetim görüntüleyici erişilebilirlik ve i18n** — Arama, aktör, bölge ve saklama kontrolleri için `aria-label`, ikonlarda `aria-hidden`, tablo başlıklarında `scope=col`; tüm metinler (`admin.audit`, `admin.col.*`, `admin.residency` vb.) çevrilir.

### Güvenlik Politikaları & Test Aracı

- **Güvenlik Politikaları Paneli** — Tüm güvenlik politikalarını dikey liste halinde gösteren kart bileşeni; başlık `admin.security` ile çevrilir.
- **Politika listesi render'ı** — Store'dan gelen `policies` dizisi map edilerek her politika için ikon, çevrilmiş ad, yapılandırma alanları, durum rozeti ve aksiyon butonu içeren satır oluşturulur.
- **Politika başına ikon eşlemesi** — Her politika türüne (residency, retention, e2ee, dlp, sensitivity, legalHold, infoBarrier, commCompliance, conditionalAccess) görsel ikon atanır; ikonlar harita üzerinden eşlenir ve `aria-hidden` ile dekoratif işaretlenir.
- **Politika yapılandırma alanları (inline edit)** — Her politikanın `config` nesnesindeki anahtar/değer çiftleri düzenlenebilir metin girişleri olarak gösterilir; değişiklikte `setPolicyConfig` çağrılır ve store güncellenir.
- **Config girişi erişilebilirlik etiketi** — Her config girişi politika adı ve config anahtarını birleştiren `aria-label` taşır (ör. `DLP · detect`).
- **Politika durum rozeti** — Açık/kapalı durumu gösteren Badge; etkinse `positive` tonu + `admin.enabled`, değilse `neutral` tonu + `admin.disabled`.
- **Politika açma/kapama (doğrulamalı)** — ConfirmAction ile politika açılıp kapatılır; kullanıcı politika türünün büyük harfli halini (`verifyWord`) yazarak onaylar. Açıkken `danger`, kapalıyken `primary` varyantı kullanılır.
- **Politika store aksiyonları** — `togglePolicy` ile etkin/pasif durumu değiştirilir, `setPolicyConfig` ile belirli config anahtarı güncellenir; `policies` dizisi selector ile reaktif bağlanır.
- **Güvenlik paneli i18n** — Tüm etiketler (`admin.security`, `admin.policy.*`, `admin.enabled/disabled`, `admin.enable/disable`) çeviri anahtarları üzerinden gösterilir.
- **PolicyTester entegrasyonu** — Güvenlik politikaları kartının altına politika davranışını test eden PolicyTester bileşeni eklenir.
- **Politika Test Aracı (PolicyTester)** — DLP, denetlenen terimler, bariyerler ve hassasiyet etiketleri gibi governance yardımcılarını canlı deneyen interaktif test paneli.
- **Serbest metin DLP girişi** — Çok satırlı textarea ile kullanıcı metin girer; varsayılan örnek bir kredi kartı numarası ve `don't leak this` içerir, anlık tarama tetikler.
- **DLP tarama (dlpScan)** — Girilen metin `dlpScan` ile taranır; bulunan hassas veri türleri (kind) sayısı ve listesi rozet üzerinde gösterilir, bulgu varsa danger tonunda.
- **Denetlenen terim tespiti (flaggedTerms)** — Metin SUPERVISED listesindeki (`insider`, `bribe`, `leak`) terimlere karşı `flaggedTerms` ile taranır; eşleşme sayısı warning/positive tonlu rozette gösterilir.
- **Etik bariyer (information barrier) kontrolü** — from/to departman girişleri BARRIERS tanımına (`['Research','Sales']`) karşı `barrierBlocks` ile değerlendirilir; iletişimin engellenip engellenmediği rozette gösterilir.
- **Bariyer kaynak/hedef girişleri** — Varsayılan `Research` ve `Sales` değerleriyle gelen from ve to girişleri kullanıcının bariyer senaryosunu canlı değiştirmesini sağlar.
- **Hassasiyet etiketi seçimi** — public/general/confidential/restricted etiketleri arasında buton grubuyla seçim; seçili etiket `aria-pressed` ile işaretlenir ve accent kenarlıkla vurgulanır.
- **Hassasiyet sıralaması (sensitivityRank)** — Seçilen etiketin sayısal hassasiyet derecesi `sensitivityRank` ile hesaplanır ve neutral rozette gösterilir.
- **PolicyTester state ve canlı geri bildirim** — `text`, `from`, `to`, `label` durumları `useState` ile yönetilir; her değişiklik governance yardımcılarını anlık yeniden hesaplar ve sonuçlar renkli rozetlerle (danger/warning/positive/neutral) güncellenir.
- **PolicyTester i18n ve erişilebilirlik** — Başlık, alan etiketleri ve sonuç metinleri `admin.tester.*` ile çevrilir; etiket butonları `aria-pressed`, ikonlar `aria-hidden` taşır.

### Federasyon Ayarları

- **Federasyon ayarları listesi (FederationSettings)** — Federasyon bağlantılarını kart listesi olarak gösteren ve köprü (bridge) eklemeye olanak tanıyan yönetim paneli.
- **Federasyon kart gösterimi** — Her kayıt bir Card içinde ShareNetwork ikonu ve `protocol · remote` başlığıyla listelenir; `federation` dizisi map ile render edilir.
- **Bağlantı durumu rozeti** — `connected` alanına göre pozitif tonlu Bağlı (`admin.connected`) veya nötr tonlu Bağlı değil (`admin.disconnected`) Badge'i sağda (`ml-auto`) gösterilir.
- **Köprü (bridge) listesi gösterimi** — Her federasyonun `bridges` dizisindeki köprüler accent tonlu Badge'ler olarak listelenir; liste boşsa `admin.noBridges` metni gösterilir.
- **Köprü ekleme (addBridge)** — Input'a köprü adı girilip Ekle'ye basıldığında `adminStore.addBridge(f.id, value)` çağrılır; girdi trim edilir, eklemeden sonra ilgili draft temizlenir.
- **Federasyon başına taslak (draft) state'i** — Yerel `drafts: Record<string,string>` ile her federasyon için ayrı input değeri tutulur; input boş/sadece boşlukken Ekle butonu disabled olur.
- **FederationSettings store entegrasyonu** — `useAdminStore` üzerinden `federation` verisi ve `addBridge` aksiyonu selector ile okunur.
- **FederationSettings erişilebilirlik ve i18n** — Köprü input'una `aria-label` ve placeholder (`admin.bridgePh`); ShareNetwork ve Plus ikonları `aria-hidden`; metinler (`admin.addBridge` vb.) çevrilir.

### Faturalandırma Paneli

- **Faturalandırma paneli (Billing Panel)** — Mevcut plan, koltuk sayısı, AI kredileri ve faturaları iki Card içinde gösteren yönetici faturalandırma görünümü.
- **Mevcut plan rozeti ve koltuk göstergesi** — Aktif planı accent tonlu Badge ile (`admin.planName.*`), koltuk sayısını `admin.seats` etiketiyle gösterir.
- **Ödeme notu** — `admin.paymentNote` ile faturalandırmaya dair açıklayıcı bilgi metni gösterir.
- **AI kredi kullanım göstergesi** — Kullanılan/dahil AI kredilerini (`aiCreditsUsed/aiCreditsIncluded`) Sparkle ikonuyla gösterir; kullanım seviyesine göre rozet rengi positive/warning/danger değişir.
- **AI kredi durum eşikleri (aiCreditState)** — Kullanımı kota eşiklerine göre (warn ≥%80, exceeded ≥%100) değerlendirerek rozet tonunu belirler.
- **Kredi başı maliyet ve aşım hesaplama** — Yayınlanan `perCreditCost` ve dahil kotayı aşan tüketim için aşım ücretini `creditOverage` ile (USD, 2 ondalık) hesaplayan şeffaf AI faturalandırması.
- **Plan değiştirme seçici** — free, pro, business, enterprise planları arasından hedef plan seçtiren açılır menü (varsayılan hedef enterprise).
- **Onaylı plan yükseltme aksiyonu** — ConfirmAction ile seçilen planın büyük harfli adını (`verifyWord`) yazdırarak doğrulanan ve `upgradePlan` store aksiyonunu tetikleyen plan yükseltme akışı.
- **Hedef plan yerel state yönetimi** — `useState` ile seçilen hedef plan (`target`) tutulur ve seçici ile onay aksiyonu senkronize edilir.
- **Fatura listesi (invoices)** — Receipt ikonlu başlık altında her faturayı dönem (`period`) etiketiyle ayrı kart olarak listeler.
- **Fatura satır kalemleri ve toplam** — Her faturanın satır kalemlerini (`label + $amount`) listeler ve üst çizgiyle ayrılmış Toplam (`admin.total`, `$total`) satırı gösterir.
- **Billing store ve veri modeli** — `billing` (plan, seats, aiCreditsIncluded/Used, perCreditCost) ve `invoices` (id, period, lines, total) `useAdminStore` selector'larıyla okunup render edilir.
- **Faturalandırma paneli i18n** — Başlıklar, plan adları, kredi metinleri ve etiketler (`admin.billing`, `admin.aiCredits.*`, `admin.upgrade` vb.) çevrilir.

### Tehlikeli Aksiyon Onayı (ConfirmAction)

- **Tehlikeli Aksiyon Onay Bileşeni (ConfirmAction)** — Geri alınamaz/yıkıcı işlemler için açığa-çıkar → yazarak-doğrula → onayla desenini uygulayan yeniden kullanılabilir bileşen; politika, federasyon ve faturalandırma değişikliklerinde kullanılır.
- **İki aşamalı onay açma (reveal)** — Başlangıçta sadece tetik butonu (label) gösterilir; tıklanınca onay formu açılır (`open` state'i), yanlışlıkla tetiklemeyi önler.
- **Yazarak doğrulama (type-to-verify)** — Kullanıcı onayı etkinleştirmek için `verifyWord` ile birebir aynı kelimeyi yazmak zorundadır; aksi halde onay butonu `value !== verifyWord` ile disabled kalır.
- **Onay/İptal aksiyonları** — Onay butonu `onConfirm` callback'ini çağırır, formu kapatır ve input'u sıfırlar; İptal (ghost) butonu da formu kapatıp girilen değeri temizler.
- **Buton varyant desteği (variant)** — danger (varsayılan), primary, secondary varyantları desteklenir ve hem tetik hem onay butonuna uygulanır; İptal butonu sabit ghost varyantındadır.
- **Tehlike görsel uyarısı** — Form açıldığında danger renginde Warning ikonu ve danger renkli kenarlıkla riskli aksiyon görsel olarak vurgulanır.
- **ConfirmAction erişilebilirlik ve i18n** — Doğrulama input'una `aria-label` (`admin.typeToConfirm`) atanır, Warning ikonu `aria-hidden`; tüm metinler (`admin.typeToConfirm` {word} interpolasyonlu, `admin.confirm`, `admin.cancel`) çevrilir.

### Governance yardımcıları (admin.ts)

- **Kota durumu hesaplama (quotaState)** — Kullanım/limit oranına göre `ok`, `warn` (≥%80) veya `exceeded` (≥%100) döndürür; limit ≤0 ise `ok`.
- **Plan değişikliği oransal ücretlendirme (proration)** — Eski/yeni fiyat ve dönemde kalan gün sayısına göre kalan dönem için oransal fark ücretini (2 ondalık yuvarlanmış) hesaplar.
- **Denetim günlüğü filtreleme (filterAudit)** — Denetim olaylarını aktör (tam eşleşme) ve/veya aksiyon (büyük-küçük harf duyarsız alt dizi) ile filtreler.
- **Veri saklama süresi kontrolü (retentionExpired)** — Verinin yaşı (gün) saklama penceresini aştığında temizlenmesi gerektiğini bildirir.
- **Veri ikamet (residency) politikası kontrolü (residencyAllowed)** — Etkin residency politikasının bölge ile eşleşmesini doğrular; politika tipi residency değilse veya kapalıysa izin verir.
- **DLP hassas veri tarama (dlpScan)** — Metni öncelik sırasıyla IBAN (TR), kredi kartı, TC kimlik no (11 hane) ve e-posta için ReDoS-güvenli regex'lerle tarayıp bulguları (tür + eşleşme) döndürür.
- **DLP redaksiyon/maskeleme (dlpRedact)** — Tüm DLP eşleşmelerini varsayılan `•••` maskesiyle değiştirerek güvenli görüntüleme veya egress engelleme sağlar.
- **Hassasiyet etiketi sıralama (sensitivityRank)** — Etiketleri 0 (public) … 3 (restricted) olarak public/general/confidential/restricted sırasına göre rank'ler.
- **Hassasiyet düşürme engeli (sensitivityDowngradeBlocked)** — Etiketin daha düşük seviyeye indirilmesini engeller (yalnızca yukarı çıkabilir).
- **Bilgi bariyerleri (barrierBlocks)** — İki grubun bariyer çiftleri listesine göre (her iki yönde) iletişim kurmasının yasak olup olmadığını kontrol eder; aynı grup için engel yok.
- **İletişim uyumluluğu terim işaretleme (flaggedTerms)** — Bir mesajın denetlenen/engellenen terimlerden hangilerine takıldığını büyük-küçük harf duyarsız döndürür.
- **AI kredi kullanım durumu (aiCreditState)** — Kullanılan/dahil AI kredilerini kota eşiklerini (warn ≥%80, exceeded ≥%100) yeniden kullanarak değerlendirir.
- **AI kredi aşım maliyeti (creditOverage)** — Dahil edilen kontenjanın ötesinde tüketilen krediler için USD aşım maliyetini (2 ondalık yuvarlanmış) hesaplar.

### Zustand Store (useAdminStore)

- **Admin Zustand Store (useAdminStore)** — Denetim kayıtları, politikalar, federasyon, faturalandırma, faturalar ve kotaları tek bir Zustand store'unda tutan merkezi durum deposu; aksiyonlarla günceller.
- **Denetim kaydı oluşturma (recordAudit)** — Aksiyon, kaynak ve aktör kimliği alıp yeni bir denetim olayını (id, tenant, zaman damgası ile) listenin başına ekler; politika/federasyon/abonelik değişiklikleri otomatik denetim kaydı üretir.
- **Politika açma/kapama (togglePolicy)** — Bir politikanın `enabled` durumunu tersine çevirir ve aynı anda `policy.update` denetim kaydı oluşturur (UI'daki anahtar/switch etkileşimi).
- **Politika konfigürasyonu düzenleme (setPolicyConfig)** — Bir politikanın config sözlüğündeki belirli bir anahtarın değerini günceller (ör. retention gün, residency bölge).
- **Federasyon köprü ekleme (addBridge)** — Bir federasyon bağlantısına yeni köprü (ör. slack, teams) ekler; tekrar eden köprüyü engeller ve `federation.bridge` denetim kaydı üretir.
- **Plan yükseltme akışı (upgradePlan)** — Faturalandırma planını değiştirir (free/pro/business/enterprise) ve `subscription.update` denetim kaydı oluşturur; gerçek ödeme alınmaz, yalnızca UI akışıdır.
- **Domain olay uygulama (applyEvent)** — Backend'den gelen tipli admin olaylarını store'a uygular: `policy.changed`, `audit.recorded`, `subscription.updated`; denetim olaylarında id'ye göre yinelenenleri eler (idempotent ekleme).
- **Store sıfırlama (reset)** — Tüm admin durumunu (denetim, politikalar, federasyon, faturalandırma, faturalar, kotalar) başlangıç mock verilerine geri yükler.
- **Immutable klonlama yardımcıları** — `cloneAudit`, `clonePolicies`, `cloneFed` ve inline map kopyalama ile mock verilerin derin kopyaları üretilir; store mutasyonları orijinal data sabitlerini bozmaz.
- **Benzersiz denetim ID üretimi (aid)** — Zaman damgası ve artan sayaç (seq) birleştirerek her yeni denetim olayına benzersiz `au_` önekli kimlik üretir.

### API & entegrasyon yüzeyi

- **Admin API mock yüzeyi** — Admin FastAPI sözleşmesinin (`/admin/audit`, `/admin/policies`, `/federation`, `/billing`) mock'lanmış okuma uçları; tehlikeli mutasyonlar (ödeme, hard-delete) gerçek backend'de onayla çalışır, UI sadece akışı sunar.
- **Gecikme simülasyonu (delay)** — Generic `delay` yardımcısı ile varsayılan 120ms beklemeden sonra değer döndürerek ağ gecikmesini taklit eder; yükleme durumlarının test edilmesini sağlar.
- **Denetim kayıtlarını getirme (fetchAudit)** — Denetim olayları listesini asenkron getiren API fonksiyonu.
- **Politikaları getirme (fetchPolicies)** — Tüm güvenlik/uyumluluk politikalarını asenkron getiren API fonksiyonu.
- **Federasyon bağlantılarını getirme (fetchFederation)** — Federasyon/birlikte çalışabilirlik bağlantılarını asenkron getiren API fonksiyonu.
- **Faturalandırma verisini getirme (fetchBilling)** — Hesap, faturalar ve kotaları tek seferde döndürerek faturalandırma ekranının tüm verisini sağlayan API fonksiyonu.
- **Governance yardımcı API yüzeyi** — `../admin` modülünden `dlpScan`, `flaggedTerms`, `barrierBlocks`, `sensitivityRank` ve `quotaState` fonksiyonları ile `QuotaLevel` tipi tüketilir.
- **Tehlikeli aksiyonlar için yalnızca UI-akış güvenlik kuralı** — Ödeme, izin ve kalıcı silme gibi tehlikeli eylemler yalnızca UI akışı olarak ele alınır; açık onayla gerçek backend'de yürütülür, asla mock katmanında çalıştırılmaz.

### Veri modelleri & tipler (types.ts)

- **Denetim Olayı (AuditEvent) veri modeli** — `id`, `tenantId`, `actorId`, `action` (ör. policy.update, member.invite), `resource`, epoch-ms zaman damgası ve opsiyonel `meta` içerir; her yönetimsel eylemi kayıt altına alır.
- **Denetim günlüğü IP sütunu** — Denetim olaylarında opsiyonel IP adresi alanı; eylemin nereden yapıldığını izlemeyi sağlar (Calendly'ye karşı farklılaştırıcı).
- **Politika türleri (PolicyKind)** — residency, retention, e2ee ve Microsoft Purview sınıfı yönetişim türleri: dlp, sensitivity, legalHold, infoBarrier, commCompliance, conditionalAccess (Teams paritesi).
- **Veri Kaybı Önleme (DLP) politikası** — Hassas içeriğin dışarı sızmasını engelleyen politika türü.
- **Hassasiyet etiketi politikası ve katmanları (SensitivityLabel)** — İçeriği public, general, confidential, restricted katmanlarıyla az kısıtlıdan çok kısıtlıya sınıflandıran etiket sistemi.
- **Yasal Saklama (Legal Hold) politikası** — Dava/eDiscovery amacıyla değiştirilemez (immutable) saklama uygulayan politika türü.
- **Bilgi Bariyerleri (Information Barriers)** — Birbiriyle iletişim kuramayacak grupları ayıran politika türü.
- **İletişim Uyumluluğu (Communication Compliance)** — Denetlenen sohbet ve işaretlenmiş terimlerle iletişim uyumluluğu sağlayan politika türü.
- **Koşullu Erişim (Conditional Access)** — Entra tarzı, MFA veya riskli oturum koşullarına göre erişimi denetleyen politika türü.
- **Politika (Policy) veri modeli** — Her politikayı türü, etkin/pasif durumu (`enabled`) ve esnek config anahtar-değer haritasıyla temsil eder; açılıp kapatılabilir ve yapılandırılabilir.
- **Federasyon Bağlantısı (FederationLink)** — Matrix protokolü, uzak sunucu, köprü (bridge) listesi ve bağlantı durumu (`connected`) içerir; dış sistemlerle birlikte çalışabilirlik sağlar.
- **Faturalandırma hesabı modeli (BillingAccount)** — plan, status (active/past_due/trialing), koltuk sayısı ve şeffaf AI faturalandırma alanları (`aiCreditsIncluded`, `aiCreditsUsed`, `perCreditCost`) içeren hesap tipi.
- **Fatura ve fatura satırı modeli (Invoice / InvoiceLine)** — Dönem, etiketli tutar satırları (etiket + tutar) ve toplam içeren fatura veri yapısı.
- **Kota modeli (Quota)** — `key`, `limit` ve `used` içeren kota tipi (ör. storage_gb, ai_actions, seats); kullanım/limit göstergelerine veri sağlar.
- **Plan türleri (Plan)** — free, pro, business, enterprise abonelik plan seviyelerini tanımlayan tip.
- **DLP veri modelleri** — `DlpKind` (`iban`|`card`|`tckn`|`email`), `DlpFinding` (kind+match) ve `QuotaLevel` (`ok`|`warn`|`exceeded`) tipleri.
- **Tipli admin alan olayları (AdminEvent)** — `policy.changed`, `bridge.connected`, `audit.recorded`, `subscription.updated`, `quota.exceeded` olaylarını tanımlayan birleşik tip; admin gerçek-zamanlı sözleşmesini oluşturur ve bileşenler/backend bunlara tepki verir.
- **Çok kiracılı (multi-tenant) yönetişim kapsamı** — Federasyon, güvenlik/uyumluluk ve admin konsolu/faturalandırmayı kapsayan; her kiracı üzerinde kesişen yönetişim sağlayan FastAPI uyumlu sözleşme yapısı.

### Başlangıç / mock verisi (data.ts)

- **Denetim olayları mock verisi (AUDIT_EVENTS)** — Kimlik girişi, politika güncelleme, üye davet, federasyon bağlama ve fatura görüntüleme gibi 5 örnek denetim kaydı; her olayda tenant, IP, aktör, aksiyon, kaynak, zaman ve opsiyonel meta bulunur.
- **Politikalar mock verisi (POLICIES)** — 9 önceden tanımlı politika: residency (EU), retention (90 gün), e2ee (dm), DLP (kart/IBAN/TCKN algılama + block+notify), sensitivity etiketleri (varsayılan general), legal hold (finance/legal saklayıcılar, chat+files kapsamı, kapalı), info barrier (Research|Sales, kapalı), communication compliance (insider/bribe/leak, supervisor incelemesi, kapalı) ve conditional access (MFA zorunlu, risk: block-high, etkin).
- **Federasyon mock verisi (FEDERATION)** — Matrix protokolü üzerinden matrix.org'a bağlı, slack ve teams köprüleri olan tek federasyon bağlantısı örneği.
- **Faturalandırma mock verisi (BILLING)** — Business planı, aktif durum, 42 koltuk, 5000 dahil AI kredisi (4300 kullanılmış) ve kredi başı yayınlanmış 0.01 USD maliyet içeren örnek hesap.
- **Faturalar mock verisi (INVOICES)** — 2026-06 dönemine ait, Business plan (42 koltuk, 924 USD) ve AI eklentisi (120 USD) satırlarıyla toplam 1044 USD'lik örnek fatura.
- **Kotalar mock verisi (QUOTAS)** — Depolama (82/100 GB), AI aksiyonları (1000/1000, limit dolu) ve koltuklar (42/50) için üç örnek kota; kota aşım senaryosunu da gösterir.
- **Plan fiyat tablosu (PLAN_PRICES)** — free 0, pro 8, business 22, enterprise 40 USD plan fiyatlarını (koltuk başına) eşleyen sabit; plan yükseltme/karşılaştırma UI'i için fiyat kaynağı.


---
