"use client";

import { useState, type SubmitEvent } from "react";
import { credentialsSchema } from "@/features/auth/validation";
import { AuthFormShell } from "@/features/auth/components/AuthFormShell";
import { useAuthSubmission } from "@/features/auth/components/useAuthSubmission";
import { useLocale } from "@/components/shared/LocaleProvider";

type FieldErrors = {
  email?: string;
  password?: string;
};

export function LoginForm() {
  const { t } = useLocale();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const { errorMessage, isSubmitting, submit } = useAuthSubmission("login");

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);
    const validation = credentialsSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!validation.success) {
      const nextErrors: FieldErrors = {};
      for (const issue of validation.error.issues) {
        const field = issue.path[0];
        if ((field === "email" || field === "password") && !nextErrors[field]) {
          nextErrors[field] = issue.message;
        }
      }
      setFieldErrors(nextErrors);
      return;
    }

    await submit(validation.data);
  }

  return (
    <AuthFormShell
      mode="login"
      title={t("loginTitle")}
      eyebrow={t("loginEyebrow")}
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-form__field">
          <label htmlFor="email">{t("email")}</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder={t("emailPlaceholder")}
            required
            maxLength={254}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
          />
          {fieldErrors.email ? (
            <p className="auth-form__field-error" id="email-error">
              {fieldErrors.email}
            </p>
          ) : null}
        </div>

        <div className="auth-form__field">
          <label htmlFor="password">{t("password")}</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder={t("passwordPlaceholder")}
            required
            minLength={8}
            maxLength={72}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={
              fieldErrors.password ? "password-error" : undefined
            }
          />
          {fieldErrors.password ? (
            <p className="auth-form__field-error" id="password-error">
              {fieldErrors.password}
            </p>
          ) : null}
        </div>

        {errorMessage ? (
          <p className="auth-form__error" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <button
          className="auth-form__submit"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? t("submitting") : t("loginSubmit")}
        </button>
      </form>
    </AuthFormShell>
  );
}
