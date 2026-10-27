import type { Metadata } from 'next';
import { AuthForm } from '@/components/auth/AuthForm';

export const metadata: Metadata = {
  title: 'Crear cuenta | CoSpace',
  description: 'Crea tu cuenta para reservar espacios de coworking.',
};

export default function RegisterPage() {
  return (
    <AuthForm
      mode="register"
      title="Tu próxima jornada empieza aquí"
      description="Crea tu cuenta para descubrir espacios de coworking y reservar el que mejor se adapte a ti."
    />
  );
}
