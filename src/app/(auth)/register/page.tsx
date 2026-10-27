import type { Metadata } from 'next';
import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Crear cuenta | CoSpace',
  description: 'Crea tu cuenta para reservar espacios de coworking.',
};

export default function RegisterPage() {
  return <RegisterForm />;
}
