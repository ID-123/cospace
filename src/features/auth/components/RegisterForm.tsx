'use client';

import { useState, type SubmitEvent } from 'react';
import { registrationSchema } from '@/features/auth/validation';
import { AuthFormShell } from '@/features/auth/components/AuthFormShell';
import { useAuthSubmission } from '@/features/auth/components/useAuthSubmission';
import { useLocale } from '@/components/shared/LocaleProvider';

type FieldErrors = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export function RegisterForm() {
  const { t } = useLocale();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const { errorMessage, isSubmitting, submit } = useAuthSubmission('register');

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);
    const validation = registrationSchema.safeParse({
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
    });

    if (!validation.success) {
      const nextErrors: FieldErrors = {};
      for (const issue of validation.error.issues) {
        const field = issue.path[0];
        if (
          (field === 'firstName' ||
            field === 'lastName' ||
            field === 'phone' ||
            field === 'email' ||
            field === 'password' ||
            field === 'confirmPassword') &&
          !nextErrors[field]
        ) {
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
      mode="register"
      title={t('registerTitle')}
      eyebrow={t('registerEyebrow')}
    >
      <form className="auth-form auth-form--register" onSubmit={handleSubmit} noValidate>
        <div className="auth-form__field">
          <label htmlFor="firstName">{t('firstName')}</label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            autoComplete="given-name"
            placeholder={t('firstNamePlaceholder')}
            required
            maxLength={80}
            aria-invalid={Boolean(fieldErrors.firstName)}
            aria-describedby={fieldErrors.firstName ? 'first-name-error' : undefined}
          />
          {fieldErrors.firstName ? (
            <p className="auth-form__field-error" id="first-name-error">
              {fieldErrors.firstName}
            </p>
          ) : null}
        </div>

        <div className="auth-form__field">
          <label htmlFor="lastName">{t('lastName')}</label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            autoComplete="family-name"
            placeholder={t('lastNamePlaceholder')}
            required
            maxLength={80}
            aria-invalid={Boolean(fieldErrors.lastName)}
            aria-describedby={fieldErrors.lastName ? 'last-name-error' : undefined}
          />
          {fieldErrors.lastName ? (
            <p className="auth-form__field-error" id="last-name-error">
              {fieldErrors.lastName}
            </p>
          ) : null}
        </div>

        <div className="auth-form__field">
          <label htmlFor="phone">{t('phone')}</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+57 300 123 4567"
            required
            maxLength={20}
            aria-invalid={Boolean(fieldErrors.phone)}
            aria-describedby={fieldErrors.phone ? 'phone-error' : undefined}
          />
          {fieldErrors.phone ? (
            <p className="auth-form__field-error" id="phone-error">
              {fieldErrors.phone}
            </p>
          ) : null}
        </div>

        <div className="auth-form__field">
          <label htmlFor="email">{t('email')}</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder={t('emailPlaceholder')}
            required
            maxLength={254}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? 'email-error' : undefined}
          />
          {fieldErrors.email ? (
            <p className="auth-form__field-error" id="email-error">
              {fieldErrors.email}
            </p>
          ) : null}
        </div>

        <div className="auth-form__field">
          <label htmlFor="password">{t('password')}</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder={t('passwordInputHint')}
            required
            minLength={8}
            maxLength={72}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={
              fieldErrors.password
                ? 'password-error'
                : 'password-help'
            }
          />
          {fieldErrors.password ? (
            <p className="auth-form__field-error" id="password-error">
              {fieldErrors.password}
            </p>
          ) : (
            <p className="auth-form__hint" id="password-help">
              {t('passwordHelp')}
            </p>
          )}
        </div>

        <div className="auth-form__field">
          <label htmlFor="confirmPassword">{t('confirmPassword')}</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder={t('confirmPasswordPlaceholder')}
            required
            minLength={8}
            maxLength={72}
            aria-invalid={Boolean(fieldErrors.confirmPassword)}
            aria-describedby={
              fieldErrors.confirmPassword ? 'confirm-password-error' : undefined
            }
          />
          {fieldErrors.confirmPassword ? (
            <p className="auth-form__field-error" id="confirm-password-error">
              {fieldErrors.confirmPassword}
            </p>
          ) : null}
        </div>

        {errorMessage ? (
          <p className="auth-form__error" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <button className="auth-form__submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? t('submitting') : t('registerSubmit')}
        </button>
      </form>
    </AuthFormShell>
  );
}
