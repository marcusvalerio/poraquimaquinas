import { LoginForm } from "@/components/LoginForm";
import { APP_NAME } from "@/lib/app";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <div className="w-full max-w-sm">
        <p className="font-display text-lg font-extrabold uppercase tracking-tight">{APP_NAME}</p>
        <h1 className="mt-8 font-display text-2xl font-bold">Acessar o sistema</h1>
        <p className="mt-1 font-aux text-sm text-white/50">
          Área administrativa de equipamentos.
        </p>

        <div className="mt-8">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
