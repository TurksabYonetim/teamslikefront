// web/src/features/webinar/components/RegistrationBuilder.tsx
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Sortable from "sortablejs";
import { Icon } from "@/components/Icon";
import { Badge, Button, IconButton, Select, useToast } from "@/components/ui";
import { useStore } from "@/lib/createStore";
import { webinarStore } from "../webinar.store";
import { validateRegistration } from "../webinar.dom";
import { CapacityPanel } from "./CapacityPanel";
import { Card } from "./Card";
import type { RegField, RegFieldType } from "../webinar.types";

const TYPES: RegFieldType[] = ["text", "email", "select"];

export function RegistrationBuilder() {
  const { t } = useTranslation("webinar");
  const event = useStore(webinarStore, (s) => s.events.find((e) => e.id === s.activeEventId)!);
  const register = (values: Record<string, string>) => webinarStore.getState().register(values);
  const toast = useToast();

  const [fields, setFields] = useState<RegField[]>(() => [...event.registrationFields]);
  const listRef = useRef<HTMLUListElement>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [label, setLabel] = useState("");
  const [type, setType] = useState<RegFieldType>("text");
  const [required, setRequired] = useState(true);

  // Sürükle-sırala — SortableJS (forceFallback: dokunmatikte de çalışır, handle ile).
  // onEnd'de DOM sırası okunup React state'ine yansıtılır (Kanban ile aynı konvansiyon).
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const sortable = Sortable.create(el, {
      handle: ".reg-drag-handle",
      animation: 150,
      forceFallback: true,
      ghostClass: "opacity-40",
      easing: "cubic-bezier(0.23, 1, 0.32, 1)", // matches --ease-out
      onStart: () => {
        document.body.style.userSelect = "none";
      },
      onEnd: () => {
        document.body.style.userSelect = "auto";
        const ids = Array.from(
          el.querySelectorAll<HTMLElement>("[data-fid]"),
        ).map((n) => n.dataset.fid);
        setFields((prev) =>
          ids
            .map((id) => prev.find((f) => f.id === id))
            .filter((f): f is RegField => Boolean(f)),
        );
      },
    });
    return () => sortable.destroy();
  }, []);

  const addField = () => {
    if (!label.trim()) return;
    setFields((f) => [...f, { id: `f_${Date.now()}`, label: label.trim(), required, type }]);
    setLabel("");
  };
  const submit = () => {
    const res = validateRegistration(fields, values);
    setErrors(res.errors);
    if (res.ok) {
      register(values);
      toast.show({ message: t("registered"), variant: "success" });
      setValues({});
    }
  };

  // Tüm form kontrolleri tek yükseklik: 36px (= Select sm). utilities katmanı
  // components'ten sonra geldiği için .input'in min-h-11/p-2.5'ini ! olmadan ezer.
  const inputCls = "input min-h-0 h-9 py-1.5 text-sm";

  return (
    <div className="space-y-4">
      <CapacityPanel />
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Alan builder — sürükle-sırala görünümü (kavrama tutamaçlı satırlar) */}
        <Card>
          <h3 className="mb-2 text-base font-semibold text-ink">{t("regFields")}</h3>
          <ul ref={listRef} className="mb-3 space-y-2">
            {fields.map((f) => (
              <li
                key={f.id}
                data-fid={f.id}
                className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2 py-2"
              >
                <span
                  className="reg-drag-handle flex-none cursor-grab touch-none rounded-md p-2 text-ink-3 hover:bg-surface-2 active:cursor-grabbing"
                  aria-hidden
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 7a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 7a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm9-14a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 7a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 7a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-ink" title={f.label}>
                    {f.label}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <Badge tone="neutral">{t(`fieldType.${f.type}`)}</Badge>
                    {f.required ? <Badge tone="accent">{t("required")}</Badge> : null}
                  </div>
                </div>
                <IconButton
                  label={t("removeField")}
                  className="flex-none"
                  onClick={() => setFields((x) => x.filter((y) => y.id !== f.id))}
                >
                  <Icon name="trash" className="h-4 w-4" />
                </IconButton>
              </li>
            ))}
          </ul>
          <div className="space-y-2.5 border-t border-line pt-3">
            <div className="grid gap-2.5 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm font-medium text-ink">
                {t("fieldLabel")}
                <input
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addField()}
                  className={inputCls}
                />
              </label>
              <Select<RegFieldType>
                value={type}
                onChange={setType}
                size="sm"
                label={t("fieldTypeLabel")}
                options={TYPES.map((ty) => ({ value: ty, label: t(`fieldType.${ty}`) }))}
                className="w-full"
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={required}
                aria-label={t("required")}
                onClick={() => setRequired((v) => !v)}
                className="inline-flex items-center gap-2 text-sm text-ink"
              >
                <span
                  className={
                    "relative h-5 w-9 flex-none rounded-full transition-colors focus-visible:outline-none motion-reduce:transition-none " +
                    (required ? "bg-brand" : "bg-surface-3")
                  }
                >
                  <span
                    className={
                      "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-[left] duration-150 ease-[var(--ease-out)] motion-reduce:transition-none " +
                      (required ? "left-[1.125rem]" : "left-0.5")
                    }
                  />
                </span>
                {t("required")}
              </button>
              <Button
                size="sm"
                onClick={addField}
                disabled={!label.trim()}
                leftIcon={<Icon name="plus" className="h-3.5 w-3.5" />}
                className="h-9 shrink-0 whitespace-nowrap text-sm"
              >
                {t("addField")}
              </Button>
            </div>
          </div>
        </Card>

        {/* Canlı form önizleme — zorunlu alan sayaçlı */}
        <Card>
          <div className="mb-2 flex items-center gap-2">
            <h3 className="text-base font-semibold text-ink">{t("formPreview")}</h3>
            {fields.some((f) => f.required) ? (
              <span className="ml-auto inline-flex items-center rounded-full bg-surface-3 px-2 py-0.5 text-xs font-medium text-ink-2">
                {t("requiredCount", { n: fields.filter((f) => f.required).length })}
              </span>
            ) : null}
          </div>
          <div className="space-y-2">
            {fields.map((f) =>
              f.type === "select" ? (
                <div key={f.id} className="block">
                  <span className="text-sm font-medium text-ink">
                    {f.label}{f.required ? <span className="text-danger"> *</span> : null}
                  </span>
                  <Select
                    value={values[f.id] ?? ""}
                    onChange={(v) => setValues((prev) => ({ ...prev, [f.id]: v }))}
                    aria-label={f.label}
                    size="sm"
                    placeholder="—"
                    options={[
                      { value: "", label: "—" },
                      ...(f.options ?? []).map((o) => ({ value: o, label: o })),
                    ]}
                    className="mt-1 w-full"
                  />
                  {errors[f.id] ? <span className="mt-1 block text-sm text-danger">{t(`regError.${errors[f.id]}`)}</span> : null}
                </div>
              ) : (
                <label key={f.id} className="block">
                  <span className="text-sm font-medium text-ink">
                    {f.label}{f.required ? <span className="text-danger"> *</span> : null}
                  </span>
                  <input
                    value={values[f.id] ?? ""}
                    onChange={(e) => setValues((v) => ({ ...v, [f.id]: e.target.value }))}
                    aria-required={f.required || undefined}
                    className={`mt-1 ${inputCls}`}
                  />
                  {errors[f.id] ? <span className="mt-1 block text-sm text-danger">{t(`regError.${errors[f.id]}`)}</span> : null}
                </label>
              ),
            )}
            <Button size="sm" className="mt-1 h-9 w-full text-sm" onClick={submit}>{t("register")}</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
