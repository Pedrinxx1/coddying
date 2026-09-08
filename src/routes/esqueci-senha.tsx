import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/esqueci-senha")({
  head: () => ({
    meta: [
      { title: "Recuperar senha da sua conta | Codding" },
      {
        name: "description",
        content: "Esqueceu a senha do Codding? Informe seu e-mail e enviamos um link seguro para você criar uma nova senha.",
      },
      { property: "og:title", content: "Recuperar senha — Codding" },
      { property: "og:description", content: "Receba um link por e-mail e volte a estudar em minutos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: "err" | "ok"; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    setBusy(false);
    setMsg(
      error
        ? { type: "err", text: "Não foi possível enviar agora. Confira o e-mail e tente de novo." }
        : {
            type: "ok",
            text: "Pronto! Se existir uma conta com esse e-mail, o link para criar uma nova senha já está a caminho.",
          },
    );
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4 py-16">
      <div className="w-full max-w-md">
        <Link to="/entrar" search={{}} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Voltar para o login
        </Link>
        <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight">Esqueceu a senha?</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Digite o e-mail da sua conta e enviamos um link para você criar uma nova.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-3">
          <label className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-3 focus-within:border-cyan">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>

          {msg && (
            <p
              className={`rounded-xl border px-3 py-2.5 text-sm ${
                msg.type === "err" ? "border-destructive/40 text-destructive" : "border-success/40 text-success"
              }`}
            >
              {msg.text}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="bg-brand inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Enviar link de recuperação
          </button>
        </form>
      </div>
    </div>
  );
}
