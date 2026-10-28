"use client";

import Link from "next/link";
import type { Space } from "@/database/entities/space";
import { useLocale } from "@/components/shared/LocaleProvider";
import { SpaceImage } from "@/features/spaces/components/SpaceImage";
import { LocalizedPrice } from "@/components/shared/LocalizedPrice";

type SpaceCardProps = {
  id: string;
  name: string;
  description: string;
  type: Space["type"];
  capacity: number;
  pricePerHour: number;
  eager?: boolean;
};

export function SpaceCard({
  id,
  name,
  description,
  type,
  capacity,
  pricePerHour,
  eager = false,
}: SpaceCardProps) {
  const { t } = useLocale();

  return (
    <article className="space-card">
      <SpaceImage
        className="space-card__image"
        type={type}
        name={name}
        width={640}
        height={360}
        eager={eager}
      />
      <div className="space-card__content">
        <span className="space-card__label">{t("availableSpace")}</span>
        <h2>{name}</h2>
        <p>{description}</p>
      </div>

      <div className="space-card__details">
        <p>
          <span>{t("capacity")}</span>
          <strong>
            {capacity} {capacity === 1 ? t("person") : t("people")}
          </strong>
        </p>

        <p>
          <span>{t("hourlyPrice")}</span>
          <strong>
            <LocalizedPrice amount={pricePerHour} />
          </strong>
        </p>
      </div>
      <Link className="space-card__link" href={`/spaces/${id}`}>
        {t("viewDetails")} →
      </Link>
    </article>
  );
}
