import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen, LayoutDashboard, LogOut, Menu, Terminal, User2, X } from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";

export function SiteHeader({ crumb }: { crumb?: string }) {
  const { user, loading } = useSession();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState<string | null>(null);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!user) {
      setName(null);
      return;
    }
    let active = true;
    void (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .maybeSingle();
      if (active) setName(data?.display_name ?? user.email?.split("@")[0] ?? "Aluno");
    })();
    return () => {
      active = false;
    };
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
          className="ml-auto inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border md:hidden"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          aria-controls="menu-celular"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 top-16 z-50 md:hidden">
          <button
            aria-label="Fechar menu"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
          />
          <nav
            id="menu-celular"
            aria-label="Menu principal"
            className="absolute inset-x-0 top-0 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-border bg-background px-4 pt-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl"
          >
            {crumb && (
              <p className="mb-3 truncate text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {crumb}
              </p>
            )}
            <div className="flex flex-col gap-1.5">
              <Link
                to="/cursos"
                className="inline-flex min-h-12 items-center gap-3 rounded-xl border border-border bg-surface px-4 text-sm font-semibold"
              >
                <BookOpen className="h-4 w-4 shrink-0 text-primary" /> Cursos
              </Link>
              <Link
                to="/playground"
                className="inline-flex min-h-12 items-center gap-3 rounded-xl border border-border bg-surface px-4 text-sm font-semibold"
              >
                <Terminal className="h-4 w-4 shrink-0 text-primary" /> Playground
              </Link>
              {user ? (
                <>
                  <Link
                    to="/painel"
                    className="inline-flex min-h-12 items-center gap-3 rounded-xl border border-border bg-surface px-4 text-sm font-semibold"
                  >
                    <LayoutDashboard className="h-4 w-4 shrink-0 text-primary" />
                    <span className="min-w-0 truncate">{name ?? "Meu painel"}</span>
                  </Link>
                  <button
                    onClick={signOut}
                    className="inline-flex min-h-12 items-center gap-3 rounded-xl border border-border px-4 text-left text-sm font-semibold text-muted-foreground"
                  >
                    <LogOut className="h-4 w-4 shrink-0" /> Sair
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/entrar"
                    className="inline-flex min-h-12 items-center justify-center rounded-xl border border-border px-4 text-sm font-semibold"
                  >
                    <User2 className="mr-2 h-4 w-4" /> Entrar
                  </Link>
                  <Link
                    to="/entrar"
                    search={{ modo: "cadastro" }}
                    className="bg-brand inline-flex min-h-12 items-center justify-center rounded-xl px-4 text-sm font-bold text-primary-foreground"
                  >
                    Começar grátis
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
