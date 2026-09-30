import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Plus, Search } from "lucide-react";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/actions/admin-guard";
import { resolveEquipmentPhotoUrl } from "@/lib/storage";
import { EquipmentPhoto } from "@/components/EquipmentPhoto";
import { EmptyState } from "@/components/ui/EmptyState";

const SEARCH_FIELDS = ["equipamento", "codigoSap", "conjunto", "subconjunto", "linha"] as const;

export default async function EquipamentosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireAdmin();
  const q = (await searchParams).q?.trim() ?? "";

  const where: Prisma.EquipmentWhereInput = q
    ? { OR: SEARCH_FIELDS.map((field) => ({ [field]: { contains: q, mode: "insensitive" } })) }
    : {};

  const equipments = await db.equipment.findMany({
    where,
    orderBy: [{ linha: "asc" }, { equipamento: "asc" }],
  });

  const rows = await Promise.all(
    equipments.map(async (e) => ({ ...e, photo: await resolveEquipmentPhotoUrl(e.photoUrl) })),
  );

  return (
    <main className="p-4 md:p-10">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold uppercase tracking-tight text-black">Equipamentos</h1>
        <Link
          href="/admin/equipamentos/nova"
          className="flex shrink-0 items-center gap-2 bg-yellow px-4 py-2.5 font-sans text-xs font-bold uppercase tracking-wide text-black hover:bg-yellow/90"
        >
          <Plus size={14} aria-hidden="true" /> Cadastrar
        </Link>
      </div>

      <form className="mt-6 flex gap-2" method="get" role="search">
        <input
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Equipamento, Código SAP, conjunto, subconjunto ou linha"
          aria-label="Pesquisar equipamentos"
          className="input max-w-lg"
        />
        <button
          type="submit"
          className="flex items-center gap-2 bg-black px-4 py-2.5 font-sans text-xs font-bold uppercase text-white"
        >
          <Search size={14} aria-hidden="true" />
          <span className="hidden sm:inline">Pesquisar</span>
        </button>
      </form>

      <p className="mt-4 font-aux text-xs text-black/50">
        {rows.length} {rows.length === 1 ? "equipamento" : "equipamentos"}
        {q && (
          <>
            {" "}para “{q}” ·{" "}
            <Link href="/admin/equipamentos" className="underline hover:text-black">
              limpar pesquisa
            </Link>
          </>
        )}
      </p>

      {rows.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            title={q ? "Nenhum equipamento encontrado" : "Nenhum equipamento cadastrado"}
            description={q ? "Tente outro termo de pesquisa." : "Cadastre o primeiro equipamento para gerar o QR Code."}
          />
        </div>
      ) : (
        <div className="mt-2 overflow-x-auto border border-black/10 bg-white">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-black/10 font-aux text-[11px] uppercase tracking-widest text-black/50">
                <th scope="col" className="px-4 py-3">Equipamento</th>
                <th scope="col" className="hidden px-4 py-3 md:table-cell">Conjunto</th>
                <th scope="col" className="hidden px-4 py-3 md:table-cell">Subconjunto</th>
                <th scope="col" className="hidden px-4 py-3 sm:table-cell">Linha</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e.id} className="border-b border-black/5 last:border-0 hover:bg-tan/40">
                  <td className="px-4 py-3">
                    <Link href={`/admin/equipamentos/${e.id}`} className="flex items-center gap-3">
                      <EquipmentPhoto
                        src={e.photo}
                        alt={e.equipamento}
                        sizes="48px"
                        className="h-12 w-12 shrink-0 border border-black/10 bg-tan"
                      />
                      <div className="min-w-0">
                        <p className="font-sans text-sm font-semibold text-black hover:underline">{e.equipamento}</p>
                        <p className="font-aux text-xs tabular-nums text-black/50">SAP {e.codigoSap}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="hidden px-4 py-3 font-aux text-sm text-black/70 md:table-cell">{e.conjunto}</td>
                  <td className="hidden px-4 py-3 font-aux text-sm text-black/70 md:table-cell">{e.subconjunto}</td>
                  <td className="hidden px-4 py-3 font-aux text-sm text-black/70 sm:table-cell">{e.linha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
