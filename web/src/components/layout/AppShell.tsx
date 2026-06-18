import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import clsx from "clsx";
import { Sidebar } from "./Sidebar";
import { MobileTopbar } from "./MobileTopbar";
import { CommandPalette } from "@/components/CommandPalette";
import { Backdrop } from "@/components/ui";
import { ActiveCallBar } from "@/features/phone/ActiveCallBar";

/**
 * Responsive double-sidebar iskeleti.
 * - md+ : ikon rail + bağlamsal panel sabit (akış içinde)
 * - <md : sidebarlar soldan kayan drawer; hamburger açar, backdrop/route kapatır
 */
export function AppShell() {
  const [open, setOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const location = useLocation();

  // Sohbet görünümünde (kanal/DM) masaüstünde ana sidebar gizlenir — topluluk
  // rayı + sohbet listesi zaten gezinmeyi sağlar; geri dönüş: ray üstündeki
  // Ana sayfa (grid) düğmesi ya da mobilde hamburger. Mobil drawer korunur.
  const hideSidebarDesktop = /^\/(channels|dm)(\/|$)/.test(location.pathname);

  // rota değişince (mobil) drawer'ı kapat
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // global komut paleti kısayolu (Cmd/Ctrl+K)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-surface-2">
      {/* mobil üst bar */}
      <MobileTopbar onMenu={() => setOpen(true)} />

      {/* backdrop (yalnızca mobil, drawer açıkken) */}
      {open && (
        <Backdrop level="drawer" onClick={() => setOpen(false)} className="md:hidden" />
      )}

      {/* sidebarlar: mobilde drawer, md+ akış içinde */}
      <div
        className={clsx(
          "fixed inset-y-0 left-0 z-40 flex shadow-2xl motion-safe:transition-transform duration-[var(--dur-modal)] ease-[var(--ease-drawer)] md:static md:z-auto md:translate-x-0 md:shadow-none",
          open ? "translate-x-0" : "-translate-x-full",
          hideSidebarDesktop && "md:hidden",
        )}
      >
        <Sidebar />
      </div>

      {/* içerik */}
      <main className="flex flex-1 flex-col overflow-hidden bg-surface min-w-0 pt-14 md:pt-0">
        <Outlet />
      </main>

      {/* global komut paleti (Cmd/Ctrl+K) */}
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />

      {/* global telefon çubuğu (aktif çağrı varken görünür, tüm rotalarda) */}
      <ActiveCallBar />
    </div>
  );
}
