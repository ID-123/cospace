"use client";

import { useMemo, useState } from "react";
import type { ActiveSpace } from "@/database/queries/spaces";
import { SpaceCard } from "@/features/spaces/components/SpaceCard";
import { useLocale } from "@/components/shared/LocaleProvider";

export function SpaceCatalogGrid({ spaces }: { spaces: ActiveSpace[] }) {
  const { t } = useLocale();
  const [query, setQuery] = useState("");
  const filteredSpaces = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return spaces;

    return spaces.filter((space) =>
      `${space.name} ${space.description} ${space.type}`
        .toLocaleLowerCase()
        .includes(normalizedQuery),
    );
  }, [query, spaces]);

  return (
    <>
      <div className="space-search">
        <label className="visually-hidden" htmlFor="space-search">
          {t("searchSpaces")}
        </label>
        <input
          id="space-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
          placeholder={t("searchSpacesPlaceholder")}
        />
      </div>

      {filteredSpaces.length === 0 ? (
        <p className="space-catalog__empty" role="status">
          {t("noMatchingSpaces")}
        </p>
      ) : (
        <section className="space-catalog" aria-label={t("spacesTitle")}>
          {filteredSpaces.map((space, index) => (
            <SpaceCard key={space.id} {...space} eager={index === 0} />
          ))}
        </section>
      )}
    </>
  );
}
