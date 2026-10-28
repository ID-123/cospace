import { getCurrentSession } from "@/features/auth/session";
import { NavbarLinks } from "@/components/shared/NavbarLinks";
import { NavbarShell } from "@/components/shared/NavbarShell";
import { SessionMenu } from "@/features/dashboard/components/SessionMenu";

export async function Navbar() {
  const session = await getCurrentSession();

  return (
    <NavbarShell>
      <NavbarLinks role={session?.role} />
      <SessionMenu user={session} />
    </NavbarShell>
  );
}
