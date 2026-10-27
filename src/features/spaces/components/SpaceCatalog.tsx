import { getActiveSpaces } from '@/database/queries/spaces';
import { SpaceCard } from '@/features/spaces/components/SpaceCard';
import { LocalizedHeading } from '@/components/shared/LocalizedHeading';

export async function SpaceCatalog() {
  const spaces = await getActiveSpaces();

  if (spaces.length === 0) {
    return <LocalizedHeading translationKey="noSpaces" as="p" />;
  }

  return (
    <section className="space-catalog" aria-label="Catálogo de espacios">
      {spaces.map((space) => (
        <SpaceCard
          key={space.id}
          id={space.id}
          name={space.name}
          description={space.description}
          type={space.type}
          capacity={space.capacity}
          pricePerHour={space.pricePerHour}
        />
      ))}
    </section>
  );
}