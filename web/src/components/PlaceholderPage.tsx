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
      <div className="flex-1 grid place-items-center bg-surface-2 text-center p-10 lg:p-16">
        <div>
          <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-brand-soft text-brand grid place-items-center mx-auto mb-4 lg:mb-5">
            <Icon name="sparkles" className="w-8 h-8 lg:w-10 lg:h-10" />
          </div>
          <h2 className="text-base lg:text-lg font-semibold text-ink mb-1.5">{title}</h2>
          <p className="text-muted text-sm max-w-xs sm:max-w-sm mx-auto">
            Bu modül henüz inşa edilmedi. Backend kodunu paylaştığında bu ekranı
            gerçek veriyle hayata geçireceğiz.
          </p>
        </div>
      </div>
    </>
  );
}
