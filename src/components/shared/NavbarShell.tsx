"use client";

import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import {
  LocaleSwitcher,
  ThemeSwitcher,
  useLocale,
} from "@/components/shared/LocaleProvider";

export function NavbarShell({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLocale();
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    function handlePointerDown(event: PointerEvent) {
      if (!headerRef.current?.contains(event.target as Node)) setIsOpen(false);
    }

    function handleResize() {
      if (window.innerWidth > 1080) setIsOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("resize", handleResize);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  function handleMenuClick(event: MouseEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("a")) setIsOpen(false);
  }

  return (
    <header
      ref={headerRef}
      className={`navbar${isOpen ? " navbar--open" : ""}`}
    >
      <Link
        href="/"
        className="navbar__brand"
        aria-label="CoSpace, inicio"
        onClick={() => setIsOpen(false)}
      >
        CoSpace
      </Link>
      <div className="navbar__mobile-preferences" aria-label={t("language")}>
        <LocaleSwitcher compact />
        <ThemeSwitcher />
      </div>
      <button
        className="navbar__menu-toggle"
        type="button"
        aria-expanded={isOpen}
        aria-controls="navbar-menu"
        aria-label={isOpen ? t("closeMenu") : t("openMenu")}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span />
        <span />
        <span />
      </button>
      <div id="navbar-menu" className="navbar__menu" onClick={handleMenuClick}>
        {children}
      </div>
    </header>
  );
}
