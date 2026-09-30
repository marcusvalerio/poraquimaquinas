import Link from "next/link";
import { requireAdmin } from "@/lib/actions/admin-guard";
import { createEquipmentAction } from "@/lib/actions/equipment";
import { EquipmentForm } from "@/components/admin/EquipmentForm";

export default async function NovoEquipamentoPage() {
  await requireAdmin();

  return (
    <main className="p-4 md:p-10">
      <Link href="/admin/equipamentos" className="font-aux text-xs uppercase tracking-wide text-black/50 hover:text-black">
        ← Equipamentos
      </Link>
      <h1 className="mt-2 font-display text-2xl font-bold uppercase tracking-tight text-black">
        Cadastrar equipamento
      </h1>
      <p className="mt-1 font-aux text-sm text-black/60">
        O QR Code exclusivo é gerado automaticamente ao salvar.
      </p>
      <div className="mt-6">
        <EquipmentForm action={createEquipmentAction} submitLabel="Salvar equipamento" />
      </div>
    </main>
  );
}
