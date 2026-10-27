import { Suspense } from 'react';
import { SpaceCatalog } from '@/components/shared/SpaceCatalog';

export default function SpacesPage() {
  return (
    <main>
      <h1>Espacios disponibles</h1>

      <Suspense fallback={<p>Cargando espacios...</p>}>
        <SpaceCatalog />
      </Suspense>
    </main>
  );
}