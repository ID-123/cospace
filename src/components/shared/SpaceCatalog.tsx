import { getActiveSpaces } from '@/database/queries/spaces';
import { SpaceCard } from '@/components/shared/SpaceCard';

export async function SpaceCatalog() {
  const spaces = await getActiveSpaces();

  if (spaces.length === 0) {
    return <p>No hay espacios disponibles.</p>;
  }

  return (
    <section className="space-catalog" aria-label="Catálogo de espacios">
      {spaces.map((space) => (
        <SpaceCard
          key={space.id}
          id={space.id}
          name={space.name}
          description={space.description}
          capacity={space.capacity}
          pricePerHour={space.pricePerHour}
        />
      ))}
    </section>
  );
}