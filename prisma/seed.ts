import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Load .env when present (the Prisma CLI does this, a plain tsx script does not).
try {
  process.loadEnvFile();
} catch {
  // No .env file: rely on variables already set in the shell.
}

const db = new PrismaClient();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_NAME = process.env.ADMIN_NAME ?? "Administrador";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const MIN_PASSWORD_LENGTH = 12;

/**
 * Creates the single admin account. No fallback credentials, ever: a
 * hardcoded password here would be a known login baked into source control.
 * Re-running never overwrites an existing admin's password.
 */
async function main() {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error("Defina ADMIN_EMAIL e ADMIN_PASSWORD: ADMIN_EMAIL='...' ADMIN_PASSWORD='...' npm run seed");
  }
  if (ADMIN_PASSWORD.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`ADMIN_PASSWORD precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`);
  }

  const existing = await db.user.count();
  if (existing > 0) {
    console.log("Já existe um usuário administrativo. Nada foi alterado.");
    return;
  }

  await db.user.create({
    data: { name: ADMIN_NAME, email: ADMIN_EMAIL, passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 10) },
  });
  console.log(`Admin criado: ${ADMIN_EMAIL} (senha não exibida).`);
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
