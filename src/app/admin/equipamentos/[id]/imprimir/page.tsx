import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/actions/admin-guard";
import { getPublicEquipmentUrl, renderQrSvg } from "@/lib/equipment";
import { PrintButton } from "@/components/admin/PrintButton";

export default async function ImprimirQrPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const equipment = await db.equipment.findUnique({ where: { id } });
  if (!equipment) notFound();

  const qrSvg = await renderQrSvg(await getPublicEquipmentUrl(equipment.qrIdentifier));

  return (
    <main className="p-4 md:p-10 print:p-0">
      <div className="flex items-center justify-between gap-3 print:hidden">
        <Link
          href={`/admin/equipamentos/${id}`}
          className="font-aux text-xs uppercase tracking-wide text-black/50 hover:text-black"
        >
          ← {equipment.equipamento}
        </Link>
        <PrintButton />
      </div>

      {/* Printable label: only this block is visible on paper. */}
      <div className="mx-auto mt-8 w-full max-w-[9cm] border-2 border-black bg-white p-5 text-center print:mt-0">
        <div
          className="mx-auto w-full [&>svg]:h-auto [&>svg]:w-full"
          role="img"
          aria-label={`QR Code do equipamento ${equipment.equipamento}`}
          dangerouslySetInnerHTML={{ __html: qrSvg }}
        />
        <p className="mt-2 font-display text-lg font-bold leading-tight text-black">{equipment.equipamento}</p>
        <p className="mt-1 font-aux text-sm tabular-nums text-black">SAP {equipment.codigoSap}</p>
        <p className="font-aux text-xs text-black/70">
          {equipment.linha} · {equipment.subconjunto}
        </p>
      </div>
    </main>
  );
}
