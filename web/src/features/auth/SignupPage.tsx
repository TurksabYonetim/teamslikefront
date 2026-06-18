import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSignup } from "./auth.hooks";
import { apiErrorMessage } from "@/lib/api";
import { AuthShell } from "./AuthShell";
import { AuthField } from "./AuthField";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Form = {
  tenant_name: string;
  tenant_slug: string;
  admin_full_name: string;
  admin_email: string;
  admin_password: string;
};

export function SignupPage() {
  const navigate = useNavigate();
  const signup = useSignup();
  const toast = useToast();
  const { t } = useTranslation("auth");

  const [agree, setAgree] = useState(true);
  const [form, setForm] = useState<Form>({
    tenant_name: "",
    tenant_slug: "",
    admin_full_name: "",
    admin_email: "",
    admin_password: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [touched, setTouched] = useState(false);

  // slug otomatik öneri için: kullanıcı slug'ı elle düzenleyene kadar isimden türet
  const [slugEdited, setSlugEdited] = useState(false);

  const validate = () => {
    const next: typeof errors = {};
    if (!form.tenant_name.trim()) next.tenant_name = t("errors.tenantNameRequired");
    if (!form.tenant_slug.trim()) next.tenant_slug = t("errors.tenantRequired");
    if (!form.admin_full_name.trim()) next.admin_full_name = t("errors.fullNameRequired");
    if (!form.admin_email.trim()) next.admin_email = t("errors.emailRequired");
    else if (!EMAIL_RE.test(form.admin_email)) next.admin_email = t("errors.emailInvalid");
    if (!form.admin_password) next.admin_password = t("errors.passwordRequired");
    else if (form.admin_password.length < 8) next.admin_password = t("errors.passwordShort");
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!agree || !validate()) return;
    signup.mutate(form, {
      onSuccess: () => {
        toast.show({ message: t("signup.success"), variant: "success" });
        navigate("/", { replace: true });
      },
    });
  };

  const clearError = (key: keyof Form) => {
    if (touched) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const bind = (key: keyof Form) => ({
    name: key,
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setForm((f) => ({ ...f, [key]: value }));
      clearError(key);
    },
    error: errors[key],
  });

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tenant_name = e.target.value;
    setForm((f) => ({
      ...f,
      tenant_name,
      tenant_slug: slugEdited
        ? f.tenant_slug
        : tenant_name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, ""),
    }));
    clearError("tenant_name");
    if (!slugEdited) clearError("tenant_slug");
  };

  const onSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugEdited(true);
    setForm((f) => ({ ...f, tenant_slug: e.target.value }));
    clearError("tenant_slug");
  };

  return (
    <AuthShell>
      <header className="space-y-1">
        <h1 className="text-xl font-semibold leading-tight tracking-tight text-ink sm:text-2xl dark:text-white">
          {t("signup.title")}
        </h1>
        <p className="text-sm text-muted">{t("signup.subtitle")}</p>
      </header>

      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        <AuthField
          label={t("signup.tenantNameLabel")}
          placeholder={t("placeholders.tenantName")}
          autoComplete="organization"
          required
          name="tenant_name"
          value={form.tenant_name}
          onChange={onNameChange}
          error={errors.tenant_name}
        />
        <AuthField
          label={t("signup.tenantSlugLabel")}
          placeholder={t("placeholders.tenant")}
          className="font-mono"
          autoCapitalize="none"
          spellCheck={false}
          hint={t("signup.tenantSlugHint")}
          required
          name="tenant_slug"
          value={form.tenant_slug}
          onChange={onSlugChange}
          error={errors.tenant_slug}
        />
        <AuthField
          label={t("signup.fullNameLabel")}
          placeholder={t("placeholders.fullName")}
          autoComplete="name"
          required
          {...bind("admin_full_name")}
        />
        <AuthField
          label={t("signup.emailLabel")}
          type="email"
          inputMode="email"
          placeholder={t("placeholders.adminEmail")}
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          required
          {...bind("admin_email")}
        />
        <AuthField
          label={t("signup.passwordLabel")}
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          hint={t("signup.passwordHint")}
          required
          reveal={{ show: t("signup.showPassword"), hide: t("signup.hidePassword") }}
          {...bind("admin_password")}
        />

        <div>
          <label className="flex items-start gap-3 text-sm font-normal text-muted">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="checkbox mt-0.5 shrink-0"
            />
            <span>
              {t("signup.agreePrefix")}{" "}
              <a className="font-medium text-brand hover:underline" href="#">
                {t("signup.terms")}
              </a>{" "}
              {t("signup.and")}{" "}
              <a className="font-medium text-brand hover:underline" href="#">
                {t("signup.privacy")}
              </a>
              {t("signup.agreeSuffix")}
            </span>
          </label>
          {touched && !agree && (
            <p role="alert" className="mt-1.5 text-xs font-medium text-danger">
              {t("signup.agreeRequired")}
            </p>
          )}
        </div>

        {signup.isError && (
          <div
            role="alert"
            className="rounded-lg bg-danger/10 px-4 py-2.5 text-sm text-danger"
          >
            {apiErrorMessage(signup.error)}
          </div>
        )}

        <Button
          type="submit"
          loading={signup.isPending}
          disabled={!agree}
          className="w-full"
        >
          {signup.isPending ? t("signup.submitting") : t("signup.submit")}
        </Button>

        <p className="text-sm font-normal text-muted">
          {t("signup.haveAccount")}{" "}
          <Link
            to="/login"
            className="rounded font-medium text-brand outline-none hover:underline focus-visible:ring-2 focus-visible:ring-brand"
          >
            {t("signup.loginLink")}
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
