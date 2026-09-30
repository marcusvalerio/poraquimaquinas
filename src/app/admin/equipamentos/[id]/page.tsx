import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, ExternalLink, Pencil, Printer } from "lucide-react";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/actions/admin-guard";
import { resolveEquipmentPhotoUrl } from "@/lib/storage";
import { getPublicEquipmentUrl, renderQrSvg } from "@/lib/equipment";
import { EquipmentPhoto } from "@/components/EquipmentPhoto";
import { DeleteEquipmentButton } from "@/components/admin/DeleteEquipmentButton";

const buttonClass =
  "flex items-center justify-center gap-2 border border-black/20 bg-white px-3 py-2 font-aux text-xs font-semibold uppercase text-black/80 hover:border-black/50";

export default async function EquipamentoDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ salvo?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { salvo } = await searchParams;

  const equipment = await db.equipment.findUnique({ where: { id } });
  if (!equipment) notFound();

  const [photoUrl, publicUrl] = await Promise.all([
    resolveEquipmentPhotoUrl(equipment.photoUrl),
    getPublicEquipmentUrl(equipment.qrIdentifier),
  ]);
  const qrSvg = await renderQrSvg(publicUrl);
  const qrBase = `/admin/equipamentos/${id}/qr`;

  return (
    <main className="p-4 md:p-10">
      <Link href="/admin/equipamentos" className="font-aux text-xs uppercase tracking-wide text-black/50 hover:text-black">
        ← Equipamentos
      </Link>

      {salvo && (
        <p role="status" className="mt-4 border-l-2 border-green bg-green/20 px-3 py-2 font-aux text-sm text-black">
          Equipamento salvo. O QR Code abaixo já está pronto para impressão.
        </p>
      )}

      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold text-black">{equipment.equipamento}</h1>
          <p className="font-aux text-sm tabular-nums text-black/60">Código SAP {equipment.codigoSap}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/admin/equipamentos/${id}/editar`} className={buttonClass}>
            <Pencil size={14} aria-hidden="true" /> Editar
          </Link>
          <DeleteEquipmentButton id={id} name={equipment.equipamento} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <section className="border border-black/10 bg-white">
          <EquipmentPhoto
            src={photoUrl}
            alt={equipment.equipamento}
            className="aspect-[4/3] w-full border-b border-black/10 bg-tan/60"
          />
          <dl className="grid grid-cols-1 gap-x-6 gap-y-4 p-5 sm:grid-cols-3">
            <Info label="Conjunto" value={equipment.conjunto} />
            <Info label="Subconjunto" value={equipment.subconjunto} />
            <Info label="Linha" value={equipment.linha} />
            <Info label="Descrição técnica" value={equipment.descricaoTecnica} wide />
            <Info label="Função / utilização do subconjunto" value={equipment.funcaoSubconjunto} wide />
          </dl>
        </section>

        <aside className="h-fit border border-black/10 bg-white p-5">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-black">QR Code</h2>
          <div
            className="mx-auto mt-4 w-full max-w-[240px] [&>svg]:h-auto [&>svg]:w-full"
            role="img"
            aria-label={`QR Code do equipamento ${equipment.equipamento}`}
            // SVG markup generated server-side by the qrcode library from our own URL.
            dangerouslySetInnerHTML={{ __html: qrSvg }}
          />
          <p className="mt-3 break-all text-center font-aux text-[11px] text-black/50">{publicUrl}</p>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <a href={`${qrBase}?format=png&download=1`} className={buttonClass}>
              <Download size={14} aria-hidden="true" /> PNG
            </a>
            <a href={`${qrBase}?format=svg&download=1`} className={buttonClass}>
              <Download size={14} aria-hidden="true" /> SVG
            </a>
            <Link href={`/admin/equipamentos/${id}/imprimir`} className={buttonClass}>
              <Printer size={14} aria-hidden="true" /> Imprimir
            </Link>
            <a href={publicUrl} target="_blank" rel="noopener noreferrer" className={buttonClass}>
              <ExternalLink size={14} aria-hidden="true" /> Abrir
            </a>
          </div>
        </aside>
      </div>
    </main>
  );
}

function Info({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? "sm:col-span-3" : undefined}>
      <dt className="font-aux text-[11px] font-medium uppercase tracking-widest text-black/50">{label}</dt>
      <dd className="mt-1 whitespace-pre-line font-sans text-sm text-black">{value}</dd>
    </div>
  );
}
