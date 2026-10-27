'use client';

import { useState, type SubmitEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { credentialsSchema, registrationSchema } from '@/auth/validation';

type AuthFormProps = {
  mode: 'login' | 'register';
  title: string;
  description: string;
};

type AuthError = {
  error?: {
    message?: string;
  };
  user?: {
    role?: 'user' | 'admin';
  };
};

type FieldErrors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export function AuthForm({ mode, title, description }: AuthFormProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRegister = mode === 'register';

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);
    const formValues = {
      email: formData.get('email'),
      password: formData.get('password'),
      ...(isRegister ? { confirmPassword: formData.get('confirmPassword') } : {}),
    };
    const validation = isRegister
      ? registrationSchema.safeParse(formValues)
      : credentialsSchema.safeParse(formValues);

    if (!validation.success) {
      const nextFieldErrors: FieldErrors = {};

      for (const issue of validation.error.issues) {
        const field = issue.path[0];
        if (
          (field === 'email' ||
            field === 'password' ||
            field === 'confirmPassword') &&
          !nextFieldErrors[field]
        ) {
          nextFieldErrors[field] = issue.message;
        }
      }

      setFieldErrors(nextFieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: validation.data.email,
          password: validation.data.password,
        }),
      });

      if (!response.ok) {
        const result = (await response.json()) as AuthError;
        setErrorMessage(
          result.error?.message ??
            'No se pudo completar la solicitud. Inténtalo de nuevo.',
        );
        return;
      }

      const result = (await response.json()) as AuthError;
      router.replace(result.user?.role === 'admin' ? '/admin' : '/dashboard');
      router.refresh();
    } catch {
      setErrorMessage('No fue posible conectar con el servidor. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="auth-card" aria-labelledby="auth-title">
      <p className="auth-card__eyebrow">
        {isRegister ? 'ÚNETE A COSPACE' : 'TU ESPACIO TE ESPERA'}
      </p>
      <h1 id="auth-title">{title}</h1>
      <p className="auth-card__description">{description}</p>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-form__field">
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="tu@correo.com"
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
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={isRegister ? 'new-password' : 'current-password'}
            placeholder={isRegister ? 'Al menos 8 caracteres' : 'Tu contraseña'}
            required
            minLength={8}
            maxLength={72}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={
              fieldErrors.password
                ? 'password-error'
                : isRegister
                  ? 'password-help'
                  : undefined
            }
          />
          {fieldErrors.password ? (
            <p className="auth-form__field-error" id="password-error">
              {fieldErrors.password}
            </p>
          ) : isRegister ? (
            <p className="auth-form__hint" id="password-help">
              Usa al menos 8 caracteres para proteger tu cuenta.
            </p>
          ) : null}
        </div>

        {isRegister ? (
          <div className="auth-form__field">
            <label htmlFor="confirmPassword">Confirma tu contraseña</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Escríbela nuevamente"
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
        ) : null}

        {errorMessage ? (
          <p className="auth-form__error" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <button className="auth-form__submit" type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? 'Un momento...'
            : isRegister
              ? 'Crear cuenta'
              : 'Iniciar sesión'}
        </button>
      </form>

      <p className="auth-card__switch">
        {isRegister
          ? '¿Ya tienes una cuenta?'
          : '¿Aún no tienes una cuenta?'}{' '}
        <Link href={isRegister ? '/login' : '/register'}>
          {isRegister ? 'Inicia sesión' : 'Crea una cuenta'}
        </Link>
      </p>

      <Link href="/spaces" className="auth-card__back">
        ← Explorar espacios
      </Link>
    </section>
  );
}
