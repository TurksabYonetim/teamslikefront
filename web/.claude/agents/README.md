# Yazılım Şirketi Agent Ekibi

Bu klasör, TeamsLike web projesi için rol-bazlı bir yazılım şirketi ekibini
agent olarak tanımlar. Her agent kendi uzmanlık alanında otonom çalışır ve
işi doğru role devredebilir. Agent'lar `.md` dosyaları olarak otomatik keşfedilir.

## Ekip

| Agent | Rol | Ne zaman devreye girer | Renk |
| --- | --- | --- | --- |
| `workflow-coordinator` | Agent Koordinatörü | Çok rollü/belirsiz işlerde agent seçimi, görev atama, sıra ve kalite kapısı belirleme | orange |
| `design-engineer` | Tasarım Mühendisi | Her UI işi — **her zaman** `emil-design-eng` + `impeccable` standartlarını uygular/denetler | pink |
| `project-manager` | Proje Yöneticisi | Kapsam, plan, bağımlılık, risk, teslimat sırası | blue |
| `scrum-master` | Scrum Master | Sprint, standup, retro, refinement, bloker kaldırma | yellow |
| `product-owner` | Ürün Sahibi | Değer, backlog önceliği, story, kabul kriteri | cyan |
| `frontend-architect` | Frontend Mimarı | React/Vite/Tailwind mimarisi, route/state/query sınırları, performans, i18n/a11y mimari kararları | purple |
| `software-developer` | Yazılım Geliştirici | Özellik, bugfix, refactor, genel uygulama | green |
| `backend-architect` | Backend/Sistem Mimarı | API, veri modeli, sistem sınırları, ölçek | cyan |
| `qa-test-engineer` | QA / Test | Test stratejisi, test yazımı, kapsam, regresyon | green |
| `code-reviewer` | Kod İnceleme | Merge öncesi kalite kapısı (salt-okunur) | yellow |
| `devops-engineer` | DevOps / Release | CI/CD, build, deploy, sürümleme | blue |
| `security-specialist` | Siber Güvenlik | Açık avı + CVE taraması (`npm audit`/OSV/GitHub Advisory) + güvenli sürüm | red |
| `tech-writer` | Teknik Yazar | README, API dokümanı, changelog, ADR | cyan |

## Tipik akış

0. **workflow-coordinator** — isteği sınıflandırır; hangi agent'ların hangi sırayla çalışacağını belirler.
1. **product-owner** — neyin, neden inşa edileceğini ve kabul kriterini tanımlar.
2. **project-manager** — işi parçalara ayırır, bağımlılık/risk/sıra çıkarır.
3. **scrum-master** — sprint'e alır, akışı korur, blokerleri kaldırır.
4. **backend-architect** — sistem/API/veri modelini tasarlar.
5. **frontend-architect** — büyük frontend işlerinde route/state/query/component sınırlarını belirler.
6. **software-developer** — uygular; **design-engineer** UI'yı standartlarla cilalar.
7. **qa-test-engineer** — testleri yazar ve çalıştırır.
8. **security-specialist** — güvenlik + bağımlılık güncelliğini denetler.
9. **code-reviewer** — merge öncesi kalite kapısı.
10. **devops-engineer** — CI/CD ile test edip teslim eder.
11. **tech-writer** — dokümante eder.

## Kim Yönetir?

- **Ana yürütücü:** Claude/Codex ana oturumu. Tool çağırma, dosya düzenleme ve nihai teslim burada yapılır.
- **Koordinatör:** `workflow-coordinator`. Büyük veya belirsiz işlerde hangi agent'ın devreye gireceğini, görev sırasını, paralel çalışabilecek alanları ve kalite kapılarını belirler.
- **Teslimat planı sahibi:** `project-manager`. Koordinatörün seçtiği iş akışını efor, bağımlılık, risk ve teslimat sırasına çevirir.
- **Süreç sahibi:** `scrum-master`. Sprint, standup, retro, refinement ve bloker takibi yapar; teknik görev atayıcısı değildir.
- **Uygulama sahibi:** `software-developer`, UI standardı için `design-engineer`, mimari kararlar için `frontend-architect`/`backend-architect`.

## Notlar

- Tüm agent'lar proje talimatlarına (`CLAUDE.md`, `DESIGN.md`, `PRODUCT.md`) tabidir;
  çakışmada **proje talimatı önceliklidir**.
- `workflow-coordinator` kod yazmaz; görev atar, sırayı belirler ve kalite kapılarını zorunlu kılar.
- `design-engineer`, UI işinde `skills:` frontmatter ile `emil-design-eng` ve
  `impeccable` skill'lerini her zaman önden yükler.
- `product-owner`, `project-manager` ve `scrum-master` salt-okunur çalışır.
- `frontend-architect`, `backend-architect`, `security-specialist` ve `code-reviewer`
  karar/denetim üretir; doğrudan kod düzeltmez. Uygulama işi ilgili geliştirme rolüne devredilir.
- Küçük işler için tüm zinciri çağırma: doğru en küçük rol setini seç. Büyük/riski yüksek
  işlerde PO/PM → mimar → developer/design → QA/security/review sırası kullanılır.
- **Context7 MCP = güncel kütüphane dokümantasyonu/API aracıdır (CVE tarayıcısı değil).**
  Her teknik agent (`software-developer`, `backend-architect`, `design-engineer`,
  `frontend-architect`, `devops-engineer`, `qa-test-engineer`, `security-specialist`) kendi alanında
  güncel API/sürümü doğrulamak için kullanır — hafızadan API uydurmayı önler.
- Bilinen güvenlik açıkları (CVE) **Context7 ile değil**, `npm audit` / OSV.dev /
  GitHub Advisory Database ile taranır; bu `security-specialist`'in işidir.
- `code-reviewer` salt-okunurdur; düzeltmeyi uygulamaz, ilgili role devreder.
