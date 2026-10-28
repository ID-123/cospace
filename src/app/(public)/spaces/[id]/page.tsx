import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getActiveSpaceById } from "@/database/queries/spaces";
import { getBogotaDate } from "@/features/reservations/reservations";
import { ReservationForm } from "@/features/reservations/components/ReservationForm";
import { LocalizedText } from "@/components/shared/LocalizedText";
import { SpaceImage } from "@/features/spaces/components/SpaceImage";
import { LocalizedPrice } from "@/components/shared/LocalizedPrice";
import { LocalizedHeading } from "@/components/shared/LocalizedHeading";

type SpaceDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default function SpaceDetailPage({ params }: SpaceDetailPageProps) {
  return (
    <Suspense
      fallback={
        <LocalizedHeading translationKey="loadingSpaceDetails" as="p" />
      }
    >
      <SpaceDetail params={params} />
    </Suspense>
  );
}

async function SpaceDetail({ params }: SpaceDetailPageProps) {
  const { id } = await params;
  const space = await getActiveSpaceById(id);

  if (!space) {
    notFound();
  }

  return (
    <main className="space-detail">
      <Link href="/spaces">
        ← <LocalizedText translationKey="backToSpaces" />
      </Link>

      <article className="space-detail__card">
        <section className="space-detail__summary">
          <SpaceImage
            className="space-detail__image"
            type={space.type}
            name={space.name}
            width={1200}
            height={675}
            eager
          />
          <h1>{space.name}</h1>
          <p className="space-detail__description">{space.description}</p>

          <div className="space-detail__information">
            <p>
              <span>
                <LocalizedText translationKey="capacity" />
              </span>
              <strong>
                {space.capacity}{" "}
                <LocalizedText
                  translationKey={space.capacity === 1 ? "person" : "people"}
                />
              </strong>
            </p>

            <p>
              <span>
                <LocalizedText translationKey="hourlyPrice" />
              </span>
              <strong>
                <LocalizedPrice amount={space.pricePerHour} />
              </strong>
            </p>
          </div>
        </section>

        <section className="space-detail__booking">
          <h2>
            <LocalizedText translationKey="bookSpace" />
          </h2>
          <ReservationForm
            spaceId={space.id}
            today={getBogotaDate(new Date())}
          />
        </section>
      </article>
    </main>
  );
}
