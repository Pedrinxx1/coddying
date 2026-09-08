import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Lock, Mail, User2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useSession } from "@/hooks/useSession";

export const Route = createFileRoute("/entrar")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { modo?: "login" | "cadastro" | undefined } =>
    search["modo"] === "cadastro" ? { modo: "cadastro" } : {},
  head: () => ({
    meta: [
      { title: "Entrar ou criar conta grátis | Codding" },
      {
        name: "description",
        content:
          "Acesse sua conta Codding para salvar progresso nos cursos, conquistas, sequência de estudo e códigos do playground.",
      },
      { property: "og:title", content: "Entrar no Codding" },
      { property: "og:description", content: "Sua conta gratuita para aprender programação." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { modo } = Route.useSearch();
  const navigate = useNavigate();
  const { user, loading } = useSession();
  const [mode, setMode] = useState<"login" | "cadastro">(modo ?? "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: "err" | "ok"; text: string } | null>(null);

  useEffect(() => setMode(modo ?? "login"), [modo]);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/painel", replace: true });
  }, [loading, user, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      if (mode === "cadastro") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setMsg({
            type: "ok",
            text: "Conta criada! Confirme o e-mail que enviamos para começar a estudar.",
          });
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setMsg({
        type: "err",
        text: err instanceof Error ? traduz(err.message) : "Não foi possível continuar.",
      });
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setBusy(true);
    setMsg(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      setMsg({ type: "err", text: "Não foi possível entrar com o Google. Tente novamente." });
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/painel", replace: true });
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="grid-bg hidden flex-col justify-between border-r border-border p-12 lg:flex">
        <Link to="/" className="flex items-center gap-2">
          <span className="bg-brand flex h-9 w-9 items-center justify-center rounded-xl font-mono text-sm font-bold text-primary-foreground">
            {"</>"}
          </span>
          <span className="font-display text-lg font-extrabold">Codding</span>
        </Link>
        <div>
          <h2 className="font-display text-4xl font-extrabold tracking-tight">
            Aprenda programando <span className="text-gradient">de verdade</span>
          </h2>
          <ul className="mt-8 space-y-4 text-muted-foreground">
            {[
              "Progresso salvo em cada lição concluída",
              "Sequência de dias e conquistas para manter o ritmo",
              "Exercícios com correção automática",
              "Seus códigos do playground salvos na nuvem",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-cyan" />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-muted-foreground">100% gratuito. Sem cartão de crédito.</p>
      </div>

      <div className="flex items-center justify-center px-4 py-16 sm:px-8">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 inline-flex items-center gap-2 lg:hidden">
            <span className="bg-brand flex h-9 w-9 items-center justify-center rounded-xl font-mono text-sm font-bold text-primary-foreground">
              {"</>"}
            </span>
            <span className="font-display text-lg font-extrabold">Codding</span>
          </Link>

          <h1 className="font-display text-3xl font-extrabold tracking-tight">
            {mode === "login" ? "Bem-vindo de volta" : "Criar conta grátis"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "login"
              ? "Entre para continuar de onde parou."
              : "Leva menos de um minuto e é para sempre grátis."}
          </p>

          <button
            onClick={google}
            disabled={busy}
            className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-semibold transition-colors hover:border-blue disabled:opacity-60"
          >
            <svg className="h-4 w-4" viewBox="0 0 48 48" aria-hidden>
              <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.2 17.7 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.1 24.6c0-1.6-.1-3.1-.4-4.6H24v9.1h12.4c-.5 2.9-2.2 5.4-4.7 7l7.6 5.9c4.4-4.1 6.8-10.2 6.8-17.4z" />
              <path fill="#FBBC05" d="M10.4 28.7c-.5-1.4-.8-2.9-.8-4.7s.3-3.3.8-4.7l-7.8-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.8-6.1z" />
              <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.9l-7.6-5.9c-2.1 1.4-4.8 2.3-8.3 2.3-6.3 0-11.7-3.7-13.6-9.8l-7.8 6.1C6.5 42.6 14.6 48 24 48z" />
            </svg>
            Continuar com Google
          </button>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> ou com e-mail <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "cadastro" && (
              <label className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-3 focus-within:border-cyan">
                <User2 className="h-4 w-4 text-muted-foreground" />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full bg-transparent text-sm outline-none"
                />
              </label>
            )}
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
            <label className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-3 focus-within:border-cyan">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha (mín. 6 caracteres)"
                className="w-full bg-transparent text-sm outline-none"
              />
            </label>

            {msg && (
              <p
                className={`rounded-xl border px-3 py-2.5 text-sm ${
                  msg.type === "err"
                    ? "border-destructive/40 text-destructive"
                    : "border-success/40 text-success"
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
              {mode === "login" ? "Entrar" : "Criar minha conta"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "login" ? "Ainda não tem conta?" : "Já tem uma conta?"}{" "}
            <button
              onClick={() => {
                setMode(mode === "login" ? "cadastro" : "login");
                setMsg(null);
              }}
              className="font-semibold text-cyan"
            >
              {mode === "login" ? "Criar agora" : "Entrar"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function traduz(m: string) {
  if (m.includes("Invalid login credentials")) return "E-mail ou senha incorretos.";
  if (m.includes("already registered")) return "Esse e-mail já tem conta. Faça login.";
  if (m.includes("Email not confirmed")) return "Confirme seu e-mail antes de entrar.";
  return m;
}
