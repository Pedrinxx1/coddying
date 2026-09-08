import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LayoutDashboard, LogOut, Menu, Terminal, User2, X } from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";

export function SiteHeader({ crumb }: { crumb?: string }) {
  const { user, loading } = useSession();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      setName(null);
      return;
    }
    supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) =>
        setName(data?.display_name ?? user.email?.split("@")[0] ?? "Aluno"),
      );
  }, [user]);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="bg-brand flex h-9 w-9 items-center justify-center rounded-xl font-mono text-sm font-bold text-primary-foreground">
            {"</>"}
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight">Codding</span>
        </Link>
        {crumb && <span className="hidden text-sm text-muted-foreground sm:block">/ {crumb}</span>}

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          <Link
            to="/cursos"
            className="rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            Cursos
          </Link>
          <Link
            to="/playground"
            className="rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            Playground
          </Link>
          {user && (
            <Link
              to="/painel"
              className="rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              Meu painel
            </Link>
          )}
          {loading ? (
            <span className="ml-2 h-9 w-28 animate-pulse rounded-xl bg-surface-2" />
          ) : user ? (
            <div className="ml-2 flex items-center gap-2">
              <Link
                to="/painel"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm font-semibold"
              >
                <User2 className="h-4 w-4 text-cyan" />
                <span className="max-w-[9rem] truncate">{name ?? "Aluno"}</span>
              </Link>
              <button
                onClick={signOut}
                title="Sair"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="ml-2 flex items-center gap-2">
              <Link
                to="/entrar"
                className="rounded-xl border border-border px-4 py-2 text-sm font-semibold transition-colors hover:border-blue"
              >
                Entrar
              </Link>
              <Link
                to="/entrar"
                search={{ modo: "cadastro" }}
                className="bg-brand rounded-xl px-4 py-2 text-sm font-bold whitespace-nowrap text-primary-foreground"
              >
                Começar grátis
              </Link>
            </div>
          )}
        </nav>

        <button
          onClick={() => setOpen((v) => !v)}
          className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border md:hidden"
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            <Link to="/cursos" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2 text-sm font-semibold">
              Cursos
            </Link>
            <Link
              to="/playground"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold"
            >
              <Terminal className="h-4 w-4" /> Playground
            </Link>
            {user ? (
              <>
                <Link
                  to="/painel"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold"
                >
                  <LayoutDashboard className="h-4 w-4" /> Meu painel
                </Link>
                <button
                  onClick={signOut}
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-muted-foreground"
                >
                  <LogOut className="h-4 w-4" /> Sair
                </button>
              </>
            ) : (
              <Link
                to="/entrar"
                onClick={() => setOpen(false)}
                className="bg-brand rounded-xl px-4 py-2.5 text-center text-sm font-bold text-primary-foreground"
              >
                Entrar / Criar conta
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
