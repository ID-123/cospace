'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleLogout() {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });

      if (!response.ok) {
        setErrorMessage('No se pudo cerrar sesión. Inténtalo de nuevo.');
        return;
      }

      router.replace('/');
      router.refresh();
    } catch {
      setErrorMessage('No fue posible conectar con el servidor.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <span className="session-menu">
      <button
        className="session-menu__logout"
        type="button"
        onClick={handleLogout}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Cerrando...' : 'Cerrar sesión'}
      </button>
      {errorMessage ? (
        <span className="session-menu__error" role="alert">
          {errorMessage}
        </span>
      ) : null}
    </span>
  );
}
