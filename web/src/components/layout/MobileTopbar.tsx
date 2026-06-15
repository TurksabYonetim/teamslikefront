import { Logo } from "@/components/Logo";
import { Icon } from "@/components/Icon";

/** Yalnızca mobilde görünen üst bar: hamburger + logo + bildirim. */
export function MobileTopbar({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="fixed top-0 inset-x-0 z-30 h-14 flex items-center gap-2 px-3 bg-surface border-b border-line md:hidden">
      <button
        onClick={onMenu}
        className="p-2 rounded-lg text-muted hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-line"
      >
        <span className="sr-only">Menüyü aç</span>
        <Icon name="menu" className="w-6 h-6" />
      </button>
      <Logo className="h-7" />
      <div className="flex-1" />
      <button type="button" aria-label="Bildirimler" className="p-2 rounded-lg text-muted hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-line">
        <span className="sr-only">Bildirimler</span>
        <Icon name="bell" className="w-6 h-6" />
      </button>
    </header>
  );
}
