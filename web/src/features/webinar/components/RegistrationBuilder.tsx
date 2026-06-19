// web/src/features/webinar/components/RegistrationBuilder.tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [label, setLabel] = useState("");
  const [type, setType] = useState<RegFieldType>("text");
  const [required, setRequired] = useState(true);

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

  const inputCls = "input";

  return (
    <div className="space-y-4">
      <CapacityPanel />
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Alan builder — sürükle-sırala görünümü (kavrama tutamaçlı satırlar) */}
        <Card>
          <h3 className="mb-2 text-base font-semibold text-ink">{t("regFields")}</h3>
          <ul className="mb-3 space-y-1.5">
            {fields.map((f) => (
              <li key={f.id} className="flex items-center gap-2 rounded-md border border-line px-2.5 py-1.5 text-sm">
                <span className="flex-none cursor-grab text-ink-3" aria-hidden>
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 7a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 7a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm9-14a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 7a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 7a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
                  </svg>
                </span>
                <span className="flex-1 text-ink">{f.label}</span>
                <Badge tone="neutral">{t(`fieldType.${f.type}`)}</Badge>
                {f.required ? <Badge tone="accent">{t("required")}</Badge> : null}
                <IconButton label={t("removeField")} onClick={() => setFields((x) => x.filter((y) => y.id !== f.id))}>
                  <Icon name="trash" className="h-4 w-4" />
                </IconButton>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-end gap-2 border-t border-line pt-3">
            <label className="flex flex-1 flex-col gap-1 text-sm text-muted">
              {t("fieldLabel")}
              <input value={label} onChange={(e) => setLabel(e.target.value)} className={inputCls} />
            </label>
            <Select<RegFieldType>
              value={type}
              onChange={setType}
              label={t("fieldTypeLabel")}
              options={TYPES.map((ty) => ({ value: ty, label: t(`fieldType.${ty}`) }))}
              className="w-44"
            />
            <span className="inline-flex items-center gap-2 pb-2.5 text-base text-ink">
              <button
                type="button"
                role="switch"
                aria-checked={required}
                aria-label={t("required")}
                onClick={() => setRequired((v) => !v)}
                className={
                  "relative h-6 w-10 flex-none rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand motion-reduce:transition-none " +
                  (required ? "bg-blue-700" : "bg-surface-3")
                }
              >
                <span
                  className={
                    "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-[left] duration-150 ease-[var(--ease-out)] motion-reduce:transition-none " +
                    (required ? "left-[1.125rem]" : "left-0.5")
                  }
                />
              </button>
              {t("required")}
            </span>
            <Button onClick={addField} leftIcon={<Icon name="plus" className="h-4 w-4" />}>{t("addField")}</Button>
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
                  <span className="text-sm text-ink">
                    {f.label}{f.required ? <span className="text-danger"> *</span> : null}
                  </span>
                  <Select
                    value={values[f.id] ?? ""}
                    onChange={(v) => setValues((prev) => ({ ...prev, [f.id]: v }))}
                    aria-label={f.label}
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
                  <span className="text-sm text-ink">
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
            <Button className="w-full" onClick={submit}>{t("register")}</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
