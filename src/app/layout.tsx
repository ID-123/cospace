import type { Metadata } from "next";
import { LocaleProvider } from "@/components/shared/LocaleProvider";
import { RequestLocaleProvider } from "@/components/shared/RequestLocaleProvider";
import { Suspense } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "CoSpace | Espacios de coworking",
  description: "Encuentra y reserva tu próximo espacio de coworking.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Suspense fallback={<LocaleProvider initialLocale="es">{children}</LocaleProvider>}>
          <RequestLocaleProvider>{children}</RequestLocaleProvider>
        </Suspense>
      </body>
    </html>
  );
}
