"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteEquipmentAction } from "@/lib/actions/equipment";

export function DeleteEquipmentButton({ id, name }: { id: string; name: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const confirmed = window.confirm(
      `Excluir o equipamento "${name}"?\n\nO QR Code impresso deixará de funcionar. Esta ação não pode ser desfeita.`,
    );
    if (!confirmed) return;
    startTransition(() => deleteEquipmentAction(id));
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="flex items-center gap-2 border border-red/40 px-3 py-2 font-aux text-xs font-semibold uppercase text-red hover:bg-red/5 disabled:opacity-50"
    >
      <Trash2 size={14} aria-hidden="true" /> {isPending ? "Excluindo..." : "Excluir"}
    </button>
  );
}
