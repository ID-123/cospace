import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata: Metadata = {
  title: "Iniciar sesión | CoSpace",
  description: "Ingresa a tu cuenta de CoSpace.",
};

export default function LoginPage() {
  return <LoginForm />;
}
