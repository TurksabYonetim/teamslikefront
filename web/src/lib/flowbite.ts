import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { initFlowbite } from "flowbite";

/**
 * Flowbite'ın data-* bileşenlerini (tabs, drawer, tooltip, dropdown, accordion)
 * mount ve her rota değişiminde yeniden init eder. Flowbite sayfalarını kullanan
 * her component'te çağrılmalı.
 */
export function useInitFlowbite() {
  const location = useLocation();
  useEffect(() => {
    const id = window.requestAnimationFrame(() => initFlowbite());
    return () => window.cancelAnimationFrame(id);
  }, [location.pathname, location.search]);
}
