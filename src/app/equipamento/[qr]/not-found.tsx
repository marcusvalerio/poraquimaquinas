export default function EquipamentoNaoEncontrado() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-tan px-6 text-center">
      <div>
        <h1 className="font-display text-2xl font-bold text-black">Equipamento não encontrado</h1>
        <p className="mt-2 font-aux text-sm text-black/60">
          Este QR Code não corresponde a nenhum equipamento cadastrado.
        </p>
      </div>
    </main>
  );
}
