import type { Session } from "next-auth";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AUTH_ENABLED } from "@/lib/app";

const OPEN_SESSION: Session = {
  user: { id: "", name: "Administrador", email: "" },
  expires: new Date(Date.now() + 86_400_000).toISOString(),
};

/** Server-side check for every admin page and mutation (middleware is not the only barrier). */
export async function requireAdmin() {
  if (!AUTH_ENABLED) return OPEN_SESSION;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session;
}
