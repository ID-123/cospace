import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getActiveSpaceById } from '@/database/queries/spaces';

type SpaceDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default function SpaceDetailPage({ params }: SpaceDetailPageProps) {
  return (
    <Suspense fallback={<p>Cargando detalles del espacio...</p>}>
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
      <Link href="/spaces">← Volver a los espacios</Link>

      <h1>{space.name}</h1>
      <p>{space.description}</p>

      <section className="space-detail__information">
        <p>
          <span>Capacidad</span> <strong>{space.capacity} personas</strong>
        </p>

        <p>
          <span>Precio por hora</span> <strong>${space.pricePerHour.toLocaleString('es-CO')}</strong>
        </p>
      </section>
    </main>
  );
}