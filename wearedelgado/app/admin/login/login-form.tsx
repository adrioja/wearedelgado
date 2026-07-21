"use client";

import { useActionState } from "react";
import { signInAction, type LoginFormState } from "./actions";

const initialState: LoginFormState = { status: "idle" };

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    signInAction,
    initialState
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm text-muted">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-md border border-border bg-surface px-3 py-2 text-base text-foreground outline-none transition-colors focus:border-accent-ink"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm text-muted">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="rounded-md border border-border bg-surface px-3 py-2 text-base text-foreground outline-none transition-colors focus:border-accent-ink"
        />
      </div>

      <div aria-live="polite" className="min-h-6 text-sm">
        {state.status === "error" && (
          <p className="text-red-700">{state.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="min-h-11 cursor-pointer rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ink focus-visible:ring-offset-2"
      >
        {isPending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
