import { LoginForm } from "./login-form";

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background-alt px-6">
      <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-8 shadow-sm">
        <p className="mb-1 font-serif text-lg tracking-[0.1em]">
          WE ARE DELGADO
        </p>
        <p className="mb-8 text-sm text-muted">Backoffice</p>
        <LoginForm />
      </div>
    </main>
  );
}
