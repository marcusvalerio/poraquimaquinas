import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/** Server-side check for every admin page and mutation (middleware is not the only barrier). */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session;
}
