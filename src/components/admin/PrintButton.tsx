"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="flex items-center gap-2 bg-black px-5 py-3 font-sans text-xs font-bold uppercase tracking-wide text-white hover:bg-black/85"
    >
      <Printer size={14} aria-hidden="true" /> Imprimir
    </button>
  );
}
