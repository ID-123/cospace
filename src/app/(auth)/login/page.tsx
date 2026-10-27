import type { Metadata } from 'next';
import { AuthForm } from '@/components/auth/AuthForm';

export const metadata: Metadata = {
  title: 'Iniciar sesión | CoSpace',
  description: 'Ingresa a tu cuenta de CoSpace.',
};

export default function LoginPage() {
  return (
    <AuthForm
      mode="login"
      title="Qué bueno verte"
      description="Inicia sesión para continuar con tus reservas."
    />
  );
}
