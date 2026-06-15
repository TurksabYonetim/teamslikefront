import { Topbar } from "@/components/layout/Topbar";
import { Icon } from "@/components/Icon";

/**
 * Henüz inşa edilmemiş feature'lar için yer tutucu.
 * Backend kodu geldikçe ilgili feature klasöründe gerçek sayfayla değiştirilecek.
 */
export function PlaceholderPage({ title }: { title: string }) {
  return (
    <>
      <Topbar title={title} />
      <div className="flex-1 grid place-items-center bg-surface-2 text-center p-10">
        <div>
          <div className="w-16 h-16 rounded-2xl bg-brand-soft text-brand grid place-items-center mx-auto mb-4">
            <Icon name="sparkles" className="w-8 h-8" />
          </div>
          <h2 className="text-ink-2 font-semibold mb-1.5">{title}</h2>
          <p className="text-muted text-[13.5px] max-w-xs mx-auto">
            Bu modül henüz inşa edilmedi. Backend kodunu paylaştığında bu ekranı
            gerçek veriyle hayata geçireceğiz.
          </p>
        </div>
      </div>
    </>
  );
}
