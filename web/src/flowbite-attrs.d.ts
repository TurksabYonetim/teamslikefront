import "react";

/**
 * Flowbite JS'in okuduğu standart-dışı trigger attribute'ları React tiplerine ekler.
 * Bunlar DOM'a aynen geçirilir; Flowbite (initFlowbite) datepicker/rangepicker'ı
 * bu attribute'lara bakarak başlatır. Birebir HTML dönüşümü için gereklidir.
 */
declare module "react" {
  interface HTMLAttributes<T> {
    datepicker?: boolean | string;
    "datepicker-autohide"?: boolean | string;
    "datepicker-format"?: string;
    "datepicker-buttons"?: boolean | string;
    "datepicker-autoselect-today"?: boolean | string;
    "datepicker-title"?: string;
    "datepicker-orientation"?: string;
    "datepicker-max-date"?: string;
    "datepicker-min-date"?: string;
    "inline-datepicker"?: boolean | string;
    "date-rangepicker"?: boolean | string;
    // kaynak HTML'de bazı elementlerde geçen, görsel etkisiz standart-dışı attribute'lar
    href?: string;
    action?: string;
    method?: string;
    pubdate?: boolean | string;
  }
}
