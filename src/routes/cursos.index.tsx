import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Clock, Layers, Search, Terminal } from "lucide-react";
import { countLessons, courses, levelEmoji, levels, totalLessons, type Level } from "@/data/courses";

export const Route = createFileRoute("/cursos/")({
  head: () => ({
    meta: [
      { title: "Todos os cursos — do básico ao avançado | Codding" },
      {
        name: "description",
        content:
          "Catálogo completo de cursos gratuitos de programação: lógica, HTML, CSS, JavaScript, React, Python, Java, SQL, dados, IA, mobile e DevOps.",
      },
      { property: "og:title", content: "Todos os cursos do Codding" },
      {
        property: "og:description",
        content: "19 cursos completos, do básico ao avançado, com módulos, lições e playground.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CoursesPage,
});

const categories = [
  "Todos",
  "Fundamentos",
  "Frontend",
  "Backend",
  "Dados & IA",
  "Mobile",
  "DevOps & Carreira",
] as const;

function CoursesPage() {
  const [q, setQ] = useState("");
  const [level, setLevel] = useState<Level | "Todos">("Todos");
  const [cat, setCat] = useState<(typeof categories)[number]>("Todos");

  const filtered = useMemo(
    () =>
      courses.filter(
        (c) =>
          (level === "Todos" || c.level === level) &&
          (cat === "Todos" || c.category === cat) &&
          (c.title.toLowerCase().includes(q.toLowerCase()) ||
            c.desc.toLowerCase().includes(q.toLowerCase())),
      ),
    [q, level, cat],
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="bg-brand flex h-9 w-9 items-center justify-center rounded-xl font-mono text-sm font-bold text-primary-foreground">
              {"</>"}
            </span>
            <span className="font-display text-lg font-extrabold tracking-tight">Codding</span>
          </Link>
          <span className="hidden text-sm text-muted-foreground sm:block">/ Cursos</span>
          <Link
            to="/playground"
            className="bg-brand ml-auto inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold whitespace-nowrap text-primary-foreground"
          >
            <Terminal className="h-4 w-4" /> Playground
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
          Todos os cursos, <span className="text-gradient">do básico ao avançado</span>
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          {courses.length} cursos e {totalLessons} lições organizadas em módulos progressivos. Tudo
          gratuito, com playground integrado para praticar cada linguagem.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 sm:max-w-sm">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar curso..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(["Todos", ...levels] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className={`rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                  level === l
                    ? "border-cyan/60 bg-surface-2"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {l === "Todos" ? "Todos os níveis" : `${levelEmoji[l]} ${l}`}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                cat === c
                  ? "border-blue/60 bg-surface-2"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <Link
              key={c.slug}
              to="/cursos/$slug"
              params={{ slug: c.slug }}
              className="card-soft flex flex-col p-6 transition-transform hover:-translate-y-1"
            >
              <div className="flex items-start justify-between">
                <span className="bg-brand flex h-11 w-11 items-center justify-center rounded-xl font-mono text-sm font-bold text-primary-foreground">
                  {c.icon}
                </span>
                {c.tag && (
                  <span className="rounded-full border border-cyan/40 px-2.5 py-1 text-[11px] font-semibold text-cyan">
                    {c.tag}
                  </span>
                )}
              </div>
              <h2 className="mt-5 font-display text-xl font-bold">{c.title}</h2>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{c.desc}</p>
              <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-3">
                  <span className="inline-flex items-center gap-1">
                    <Layers className="h-3.5 w-3.5" /> {countLessons(c)} lições
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {c.hours}
                  </span>
                </span>
                <span>
                  {levelEmoji[c.level]} {c.level}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="mt-16 text-center text-muted-foreground">
            Nenhum curso encontrado com esses filtros.
          </p>
        )}
      </main>
    </div>
  );
}
