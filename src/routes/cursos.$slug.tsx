import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, ChevronDown, CircleDashed, Clock, Layers, Play } from "lucide-react";
import { countLessons, courses, getCourse, levelEmoji } from "@/data/courses";
import { SiteHeader } from "@/components/SiteHeader";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/cursos/$slug")({
  loader: ({ params }) => {
    const course = getCourse(params.slug);
    if (!course) throw notFound();
    return { course };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Curso não encontrado | Codding" }, { name: "robots", content: "noindex" }],
      };
    }
    const c = loaderData.course;
    const title = `Curso de ${c.title} — ${c.level} | Codding`;
    return {
      meta: [
        { title },
        { name: "description", content: c.desc },
        { property: "og:title", content: title },
        { property: "og:description", content: c.desc },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: CourseDetail,
  notFoundComponent: CourseNotFound,
});

function CourseNotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-background px-6 text-center">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Curso não encontrado</h1>
        <Link
          to="/cursos"
          className="bg-brand mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 font-bold text-primary-foreground"
        >
          Ver todos os cursos
        </Link>
      </div>
    </div>
  );
}

function CourseDetail() {
  const { course } = Route.useLoaderData();
  const [open, setOpen] = useState<number | null>(0);
  const [done, setDone] = useState<Set<string>>(new Set());
  const { user } = useSession();
  const related = courses.filter((c) => c.category === course.category && c.slug !== course.slug);
  const total = countLessons(course);
  const pct = total ? Math.round((done.size / total) * 100) : 0;

  useEffect(() => {
    if (!user) {
      setDone(new Set());
      return;
    }
    void (async () => {
      const { data } = await supabase
        .from("lesson_progress")
        .select("module_index, lesson_index")
        .eq("course_slug", course.slug);
      setDone(new Set((data ?? []).map((d) => `${d.module_index}-${d.lesson_index}`)));
    })();
  }, [user, course.slug]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader crumb="Cursos" />


      <section className="grid-bg border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <span className="bg-brand inline-flex h-14 w-14 items-center justify-center rounded-2xl font-mono text-lg font-bold text-primary-foreground">
            {course.icon}
          </span>
          <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
            {course.title}
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{course.desc}</p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5">
              {levelEmoji[course.level]} {course.level}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5">
              <Layers className="h-3.5 w-3.5" /> {course.modules.length} módulos •{" "}
              {countLessons(course)} lições
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5">
              <Clock className="h-3.5 w-3.5" /> {course.hours}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5">
              {course.category}
            </span>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid grid-cols-1 items-end gap-5 sm:grid-cols-[minmax(0,1fr)_auto]">
          <div className="min-w-0">
            <h2 className="font-display text-2xl font-extrabold">Conteúdo do curso</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Progressão do básico ao avançado. Cada lição tem explicação, exemplo e exercício com
              correção automática.
            </p>
          </div>
          <div className="w-full sm:w-64">
            <div className="h-2 overflow-hidden rounded-full bg-surface-2">
              <div className="bg-brand h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {user
                ? `${done.size} de ${total} lições concluídas (${pct}%)`
                : "Entre para salvar seu progresso"}
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          {course.modules.map((m, i) => {
            const moduleDone = m.lessons.filter((_, j) => done.has(`${i}-${j}`)).length;
            return (
            <div key={m.title} className="card-soft overflow-hidden p-0">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-4 py-4 text-left sm:px-5"
              >
                <span className="bg-brand flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <span className="min-w-0">
                  <span className="block break-words font-display font-bold leading-snug">{m.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {moduleDone}/{m.lessons.length} lições
                  </span>
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                    open === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {open === i && (
                <ul className="border-t border-border px-5 py-3">
                  {m.lessons.map((l, j) => (
                    <li
                      key={l}
                     className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-1 border-b border-border/50 py-3 text-sm last:border-0 sm:grid-cols-[auto_minmax(0,1fr)_auto]"
                    >
                      {done.has(`${i}-${j}`) ? (
                        <Check className="h-4 w-4 shrink-0 text-success" />
                      ) : (
                        <CircleDashed className="h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                      <Link
                        to="/cursos/$slug/licao/$m/$l"
                        params={{ slug: course.slug, m: String(i), l: String(j) }}
                         className="min-w-0 break-words leading-6 hover:text-cyan"
                      >
                        {l}
                      </Link>
                      <Link
                        to="/cursos/$slug/licao/$m/$l"
                        params={{ slug: course.slug, m: String(i), l: String(j) }}
                         className="col-start-2 inline-flex items-center gap-1 text-xs font-semibold text-cyan sm:col-start-3"
                      >
                        <Play className="h-3 w-3" /> Estudar
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            );
          })}
        </div>



        {related.length > 0 && (
          <>
            <h2 className="mt-16 font-display text-2xl font-extrabold">Continue por aqui</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((c) => (
                <Link
                  key={c.slug}
                  to="/cursos/$slug"
                  params={{ slug: c.slug }}
                  className="card-soft p-5 transition-transform hover:-translate-y-1"
                >
                  <span className="font-mono text-sm">{c.icon}</span>
                  <h3 className="mt-3 font-display font-bold">{c.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {levelEmoji[c.level]} {c.level} • {countLessons(c)} lições
                  </p>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
