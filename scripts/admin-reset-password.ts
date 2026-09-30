import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();
const MIN_PASSWORD_LENGTH = 12;

/** Resets the admin password from ADMIN_PASSWORD. Never creates a user and never prints the password. */
async function main() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error("ADMIN_PASSWORD não definida. Exemplo: ADMIN_PASSWORD='...' npm run admin:reset-password");
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`ADMIN_PASSWORD precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`);
  }

  const admin = await db.user.findFirst({ orderBy: { createdAt: "asc" } });
  if (!admin) throw new Error("Nenhum usuário administrativo encontrado. Rode `npm run seed` primeiro.");

  await db.user.update({ where: { id: admin.id }, data: { passwordHash: await bcrypt.hash(password, 10) } });
  console.log(`Senha atualizada para ${admin.email}.`);
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
