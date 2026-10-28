import type { Metadata } from "next";
import { LocaleProvider } from "@/components/shared/LocaleProvider";
import { RequestLocaleProvider } from "@/components/shared/RequestLocaleProvider";
import { Suspense } from "react";
import "./globals.css";

const themeScript = `(() => { try { const theme = document.cookie.split('; ').find(row => row.startsWith('cospace_theme='))?.split('=')[1]; document.documentElement.dataset.theme = theme === 'dark' ? 'dark' : 'light'; document.documentElement.style.colorScheme = theme === 'dark' ? 'dark' : 'light'; } catch (_) {} })();`;

export const metadata: Metadata = {
  title: "CoSpace | Espacios de coworking",
  description: "Encuentra y reserva tu próximo espacio de coworking.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <Suspense fallback={<LocaleProvider initialLocale="es">{children}</LocaleProvider>}>
          <RequestLocaleProvider>{children}</RequestLocaleProvider>
        </Suspense>
      </body>
    </html>
  );
}
