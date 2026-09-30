import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/actions/admin-guard";
import { updateEquipmentAction } from "@/lib/actions/equipment";
import { resolveEquipmentPhotoUrl } from "@/lib/storage";
import { EquipmentForm } from "@/components/admin/EquipmentForm";

export default async function EditarEquipamentoPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const equipment = await db.equipment.findUnique({ where: { id } });
  if (!equipment) notFound();

  const photoUrl = await resolveEquipmentPhotoUrl(equipment.photoUrl);

  return (
    <main className="p-4 md:p-10">
      <Link
        href={`/admin/equipamentos/${id}`}
        className="font-aux text-xs uppercase tracking-wide text-black/50 hover:text-black"
      >
        ← {equipment.equipamento}
      </Link>
      <h1 className="mt-2 font-display text-2xl font-bold uppercase tracking-tight text-black">
        Editar equipamento
      </h1>
      <p className="mt-1 font-aux text-sm text-black/60">
        O QR Code não muda ao editar — etiquetas já impressas continuam válidas.
      </p>
      <div className="mt-6">
        <EquipmentForm
          equipment={equipment}
          photoUrl={photoUrl}
          action={updateEquipmentAction.bind(null, id)}
          submitLabel="Salvar alterações"
        />
      </div>
    </main>
  );
}
