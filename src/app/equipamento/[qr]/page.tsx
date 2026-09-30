import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { db } from "@/lib/db";
import { isValidQrIdentifier } from "@/lib/equipment";
import { resolveEquipmentPhotoUrl } from "@/lib/storage";
import { EquipmentPhoto } from "@/components/EquipmentPhoto";

// Signed photo URLs expire, so this page is always rendered per request.
export const dynamic = "force-dynamic";

export const viewport: Viewport = { themeColor: "#1F1F1B" };

/**
 * Public, read-only lookup by QR identifier. Selects only the fields shown on
 * the page — internal ids and timestamps never reach the client.
 */
const findByQr = cache(async (qr: string) => {
  if (!isValidQrIdentifier(qr)) return null;
  return db.equipment.findUnique({
    where: { qrIdentifier: qr },
    select: {
      photoUrl: true,
      conjunto: true,
      subconjunto: true,
      linha: true,
      equipamento: true,
      codigoSap: true,
      descricaoTecnica: true,
      funcaoSubconjunto: true,
    },
  });
});

export async function generateMetadata({ params }: { params: Promise<{ qr: string }> }): Promise<Metadata> {
  const equipment = await findByQr((await params).qr);
  return {
    title: equipment ? `${equipment.equipamento} · SAP ${equipment.codigoSap}` : "Equipamento não encontrado",
    robots: { index: false, follow: false },
  };
}

export default async function EquipamentoPublicoPage({ params }: { params: Promise<{ qr: string }> }) {
  const equipment = await findByQr((await params).qr);
  if (!equipment) notFound();

  const photoUrl = await resolveEquipmentPhotoUrl(equipment.photoUrl);

  return (
    <main className="min-h-screen bg-tan pb-10">
      <header className="bg-black px-4 py-3 text-white">
        <p className="mx-auto max-w-2xl font-aux text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">
          Identificação de equipamento
        </p>
      </header>

      <div className="mx-auto max-w-2xl">
        <EquipmentPhoto
          src={photoUrl}
          alt={`Foto do equipamento ${equipment.equipamento}`}
          priority
          className="aspect-[4/3] w-full border-b border-black/10 bg-white"
        />

        <div className="px-4 pt-5">
          <h1 className="font-display text-3xl font-bold leading-tight text-black">{equipment.equipamento}</h1>
          <p className="mt-2 inline-block bg-yellow px-2.5 py-1 font-sans text-base font-semibold tabular-nums text-black">
            SAP {equipment.codigoSap}
          </p>

          <dl className="mt-6 divide-y divide-black/10 border-y border-black/10">
            <Row label="Conjunto" value={equipment.conjunto} />
            <Row label="Subconjunto" value={equipment.subconjunto} />
            <Row label="Linha" value={equipment.linha} />
          </dl>

          <Section title="Descrição técnica" text={equipment.descricaoTecnica} />
          <Section title="Função / utilização do subconjunto" text={equipment.funcaoSubconjunto} />
        </div>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 py-3 sm:flex-row sm:gap-4">
      <dt className="font-aux text-xs font-semibold uppercase tracking-widest text-black/50 sm:w-32 sm:shrink-0 sm:pt-0.5">
        {label}
      </dt>
      <dd className="font-sans text-lg font-medium text-black">{value}</dd>
    </div>
  );
}

function Section({ title, text }: { title: string; text: string }) {
  return (
    <section className="mt-6">
      <h2 className="font-aux text-xs font-semibold uppercase tracking-widest text-black/50">{title}</h2>
      <p className="mt-2 whitespace-pre-line font-sans text-base leading-relaxed text-black">{text}</p>
    </section>
  );
}
