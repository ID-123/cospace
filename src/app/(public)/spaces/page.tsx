import { Suspense } from "react";
import { SpaceCatalog } from "@/features/spaces/components/SpaceCatalog";
import { LocalizedHeading } from "@/components/shared/LocalizedHeading";

export default function SpacesPage() {
  return (
    <main>
      <LocalizedHeading translationKey="spacesTitle" />

      <Suspense
        fallback={<LocalizedHeading translationKey="loadingSpaces" as="p" />}
      >
        <SpaceCatalog />
      </Suspense>
    </main>
  );
}
