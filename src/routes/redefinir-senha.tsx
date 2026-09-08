import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/redefinir-senha")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Criar uma nova senha | Codding" },
      {
        name: "description",
        content: "Defina uma nova senha para sua conta Codding e volte a acompanhar seu progresso nos cursos.",
      },
      { property: "og:title", content: "Nova senha — Codding" },
      { property: "og:description", content: "Escolha uma nova senha e retome os estudos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [pronto, setPronto] = useState(false);
  const [senha, setSenha] = useState("");
  const [confirma, setConfirma] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: "err" | "ok"; text: string } | null>(null);

  useEffect(() => {
    let alive = true;
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setPronto(true);
    });
    void supabase.auth.getSession().then(({ data }) => {
      if (alive && data.session) setPronto(true);
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (senha !== confirma) {
      setMsg({ type: "err", text: "As duas senhas precisam ser iguais." });
      return;
    }
    setBusy(true);
    setMsg(null);
    const { error } = await supabase.auth.updateUser({ password: senha });
    setBusy(false);
    if (error) {
      setMsg({ type: "err", text: "Não foi possível salvar. Peça um novo link e tente de novo." });
      return;
    }
    setMsg({ type: "ok", text: "Senha alterada! Levando você para o painel..." });
    setTimeout(() => navigate({ to: "/painel", replace: true }), 1200);
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4 py-16">
      <div className="w-full max-w-md">
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Criar nova senha</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {pronto
            ? "Escolha uma senha com pelo menos 6 caracteres."
            : "Abra esta página pelo link que enviamos no seu e-mail para poder trocar a senha."}
        </p>

        <form onSubmit={submit} className="mt-8 space-y-3">
          <label className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-3 focus-within:border-cyan">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <input
              type="password"
              required
              minLength={6}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Nova senha"
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>
          <label className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-3 focus-within:border-cyan">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <input
              type="password"
              required
              minLength={6}
              value={confirma}
              onChange={(e) => setConfirma(e.target.value)}
              placeholder="Repita a nova senha"
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
            disabled={busy || !pronto}
            className="bg-brand inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Salvar nova senha
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/esqueci-senha" className="font-semibold text-cyan">
            Pedir um novo link
          </Link>
        </p>
      </div>
    </div>
  );
}
