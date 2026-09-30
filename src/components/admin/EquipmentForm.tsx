"use client";

import { useState, useTransition } from "react";
import { ImageField } from "@/components/admin/ImageField";

type EquipmentValues = {
  conjunto: string;
  subconjunto: string;
  linha: string;
  equipamento: string;
  codigoSap: string;
  descricaoTecnica: string;
  funcaoSubconjunto: string;
};

export function EquipmentForm({
  equipment,
  photoUrl,
  action,
  submitLabel,
}: {
  equipment?: EquipmentValues;
  photoUrl?: string | null;
  action: (formData: FormData) => Promise<{ error: string } | undefined>;
  submitLabel: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // onSubmit (instead of <form action>) keeps the typed values in place when
  // the server returns a validation error — React resets action-driven forms.
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = await action(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl border border-black/10 bg-white p-5 md:p-6">
      <ImageField initialImageUrl={photoUrl} label="Foto do equipamento" />

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Equipamento" name="equipamento" defaultValue={equipment?.equipamento} />
        <Field label="Código SAP" name="codigoSap" defaultValue={equipment?.codigoSap} maxLength={60} />
        <Field label="Conjunto" name="conjunto" defaultValue={equipment?.conjunto} />
        <Field label="Subconjunto" name="subconjunto" defaultValue={equipment?.subconjunto} />
        <Field label="Linha" name="linha" defaultValue={equipment?.linha} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4">
        <Field label="Descrição técnica" name="descricaoTecnica" defaultValue={equipment?.descricaoTecnica} multiline />
        <Field
          label="Função / utilização do subconjunto"
          name="funcaoSubconjunto"
          defaultValue={equipment?.funcaoSubconjunto}
          multiline
        />
      </div>

      {error && (
        <p role="alert" className="mt-5 border-l-2 border-red bg-red/10 px-3 py-2 font-aux text-sm text-black">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="mt-6 w-full bg-black px-6 py-3 font-sans text-xs font-bold uppercase tracking-wide text-white hover:bg-black/85 disabled:opacity-50 sm:w-auto"
      >
        {isPending ? "Salvando..." : submitLabel}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  multiline,
  maxLength,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  multiline?: boolean;
  maxLength?: number;
}) {
  const id = `field-${name}`;
  return (
    <div>
      <label htmlFor={id} className="font-aux text-xs font-medium uppercase tracking-wide text-black/60">
        {label} <span className="text-red">*</span>
      </label>
      <div className="mt-1">
        {multiline ? (
          <textarea id={id} name={name} defaultValue={defaultValue} required maxLength={5000} rows={4} className="input" />
        ) : (
          <input id={id} name={name} defaultValue={defaultValue} required maxLength={maxLength ?? 120} className="input" />
        )}
      </div>
    </div>
  );
}
