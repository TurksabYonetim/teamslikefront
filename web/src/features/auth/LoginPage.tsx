import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLogin } from "./auth.hooks";
import { apiErrorMessage } from "@/lib/api";
import { AuthShell } from "./AuthShell";
import { AuthField } from "./AuthField";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginPage() {
  const navigate = useNavigate();
  const login = useLogin();
  const toast = useToast();
  const { t } = useTranslation("auth");

  const [form, setForm] = useState({ tenant_slug: "acme", email: "", password: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [touched, setTouched] = useState(false);

  const validate = () => {
    const next: typeof errors = {};
    if (!form.tenant_slug.trim()) next.tenant_slug = t("errors.tenantRequired");
    if (!form.email.trim()) next.email = t("errors.emailRequired");
    else if (!EMAIL_RE.test(form.email)) next.email = t("errors.emailInvalid");
    if (!form.password) next.password = t("errors.passwordRequired");
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = (body: typeof form) => {
    login.mutate(body, {
      onSuccess: () => {
        toast.show({ message: t("login.success"), variant: "success" });
        navigate("/", { replace: true });
      },
    });
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!validate()) return;
    submit(form);
  };

  const bind = (key: keyof typeof form) => ({
    name: key,
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setForm((f) => ({ ...f, [key]: value }));
      if (touched) setErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    error: errors[key],
  });

  const onDemo = () =>
    submit({
      tenant_slug: "teamslike-demo",
      email: "demo-admin@teamslike.dev",
      password: "Demo!2026Teams",
    });

  return (
    <AuthShell>
      <header className="space-y-1">
        <h1 className="text-xl font-semibold leading-tight text-ink sm:text-2xl dark:text-white">
          {t("login.title")}
        </h1>
        <p className="text-sm text-muted">{t("login.subtitle")}</p>
      </header>

      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        <AuthField
          label={t("login.tenantLabel")}
          placeholder={t("placeholders.tenant")}
          autoComplete="organization"
          autoCapitalize="none"
          spellCheck={false}
          hint={t("login.tenantHint")}
          {...bind("tenant_slug")}
        />
        <AuthField
          label={t("login.emailLabel")}
          type="email"
          inputMode="email"
          placeholder={t("placeholders.email")}
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          required
          {...bind("email")}
        />
        <AuthField
          label={t("login.passwordLabel")}
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          required
          reveal={{ show: t("login.showPassword"), hide: t("login.hidePassword") }}
          {...bind("password")}
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              name="remember"
              className="checkbox"
            />
            {t("login.remember")}
          </label>
          <a
            href="#"
            className="rounded text-sm font-medium text-brand outline-none hover:underline focus-visible:ring-2 focus-visible:ring-brand"
          >
            {t("login.forgot")}
          </a>
        </div>

        {login.isError && (
          <div
            role="alert"
            className="rounded-lg bg-danger/10 px-4 py-2.5 text-sm text-danger"
          >
            {apiErrorMessage(login.error)}
          </div>
        )}

        <Button type="submit" loading={login.isPending} className="w-full">
          {login.isPending ? t("login.submitting") : t("login.submit")}
        </Button>

        <Button
          type="button"
          variant="secondary"
          onClick={onDemo}
          disabled={login.isPending}
          className="w-full"
        >
          {t("login.demo")}
        </Button>

        <p className="text-sm text-muted">
          {t("login.noAccount")}{" "}
          <Link
            to="/signup"
            className="rounded font-medium text-brand outline-none hover:underline focus-visible:ring-2 focus-visible:ring-brand"
          >
            {t("login.signupLink")}
          </Link>
        </p>
        <p className="text-sm text-muted">
          {t("login.customer")}{" "}
          <Link
            to="/portal"
            className="rounded font-medium text-brand outline-none hover:underline focus-visible:ring-2 focus-visible:ring-brand"
          >
            {t("login.portalLink")}
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
