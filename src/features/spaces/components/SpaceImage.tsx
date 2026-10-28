"use client";

import Image from "next/image";
import type { Space } from "@/database/entities/space";
import { useLocale } from "@/components/shared/LocaleProvider";

const spaceImages: Record<Space["type"], string> = {
  desk: "/images/space-desk.svg",
  meeting_room: "/images/space-meeting-room.svg",
  booth: "/images/space-booth.svg",
};

type SpaceImageProps = {
  type: Space["type"];
  name: string;
  className?: string;
  width: number;
  height: number;
  eager?: boolean;
};

export function SpaceImage({
  type,
  name,
  className,
  width,
  height,
  eager = false,
}: SpaceImageProps) {
  const { t } = useLocale();

  return (
    <Image
      className={className}
      src={spaceImages[type]}
      alt={`${t("spaceImage")} ${name}`}
      width={width}
      height={height}
      loading={eager ? "eager" : "lazy"}
    />
  );
}
