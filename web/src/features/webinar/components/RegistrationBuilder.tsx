// web/src/features/webinar/components/RegistrationBuilder.tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/Icon";
import { Badge, Button, IconButton, useToast } from "@/components/ui";
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

  const inputCls = "h-11 w-full rounded-md border border-line bg-surface px-2 text-base text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand";

  return (
    <div className="space-y-4">
      <CapacityPanel />
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Alan builder */}
        <Card>
          <h3 className="mb-2 text-base font-semibold text-ink">{t("regFields")}</h3>
          <ul className="mb-3 space-y-1.5">
            {fields.map((f) => (
              <li key={f.id} className="flex items-center gap-2 rounded-md border border-line px-3 py-1.5 text-base">
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
            <label className="flex flex-1 flex-col gap-1 text-base text-muted">
              {t("fieldLabel")}
              <input value={label} onChange={(e) => setLabel(e.target.value)} className={inputCls} />
            </label>
            <label className="flex flex-col gap-1 text-base text-muted">
              {t("fieldTypeLabel")}
              <select value={type} onChange={(e) => setType(e.target.value as RegFieldType)} className="h-11 rounded-md border border-line bg-surface px-2 text-base text-ink">
                {TYPES.map((ty) => <option key={ty} value={ty}>{t(`fieldType.${ty}`)}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-1.5 text-base text-ink">
              <input type="checkbox" checked={required} onChange={(e) => setRequired(e.target.checked)} className="h-4 w-4" />
              {t("required")}
            </label>
            <Button onClick={addField} leftIcon={<Icon name="plus" className="h-4 w-4" />}>{t("addField")}</Button>
          </div>
        </Card>

        {/* Canlı form önizleme */}
        <Card>
          <h3 className="mb-2 text-base font-semibold text-ink">{t("formPreview")}</h3>
          <div className="space-y-2">
            {fields.map((f) => (
              <label key={f.id} className="block">
                <span className="text-base text-ink">
                  {f.label}{f.required ? <span className="text-danger"> *</span> : null}
                </span>
                {f.type === "select" ? (
                  <select
                    value={values[f.id] ?? ""}
                    onChange={(e) => setValues((v) => ({ ...v, [f.id]: e.target.value }))}
                    className={`mt-1 ${inputCls}`}
                  >
                    <option value="">—</option>
                    {(f.options ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input
                    value={values[f.id] ?? ""}
                    onChange={(e) => setValues((v) => ({ ...v, [f.id]: e.target.value }))}
                    className={`mt-1 ${inputCls}`}
                  />
                )}
                {errors[f.id] ? <span className="text-base text-danger">{t(`regError.${errors[f.id]}`)}</span> : null}
              </label>
            ))}
            <Button className="w-full" onClick={submit}>{t("register")}</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
