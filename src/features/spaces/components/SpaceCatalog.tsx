import { getActiveSpaces } from "@/database/queries/spaces";
import { SpaceCatalogGrid } from "@/features/spaces/components/SpaceCatalogGrid";
import { LocalizedHeading } from "@/components/shared/LocalizedHeading";

export async function SpaceCatalog() {
  const spaces = await getActiveSpaces();

  if (spaces.length === 0) {
    return <LocalizedHeading translationKey="noSpaces" as="p" />;
  }

  return <SpaceCatalogGrid spaces={spaces} />;
}
