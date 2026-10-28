"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/components/shared/LocaleProvider";

export function LogoutButton() {
  const router = useRouter();
  const { t } = useLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogout() {
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });

      if (!response.ok) {
        setErrorMessage(t("logoutError"));
        return;
      }

      router.replace("/");
      router.refresh();
    } catch {
      setErrorMessage(t("connectionError"));
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
        {isSubmitting ? t("loggingOut") : t("logout")}
      </button>
      {errorMessage ? (
        <span className="session-menu__error" role="alert">
          {errorMessage}
        </span>
      ) : null}
    </span>
  );
}
