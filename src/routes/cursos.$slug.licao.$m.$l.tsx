import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleDashed,
  Loader2,
  Play,
  Sparkles,
  XCircle,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { getCourse } from "@/data/courses";
import { exerciseFor, lessonSections } from "@/data/lessonContent";
import { runCode } from "@/lib/run-code.functions";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { completeLesson, uncompleteLesson } from "@/lib/learning";

export const Route = createFileRoute("/cursos/$slug/licao/$m/$l")({
  loader: ({ params }) => {
    const course = getCourse(params.slug);
    const m = Number(params.m);
    const l = Number(params.l);
    const mod = course?.modules[m];
    const lesson = mod?.lessons[l];
    if (!course || !mod || lesson === undefined) throw notFound();
    return { course, mod, lesson, m, l };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Lição não encontrada | Codding" }] };
    const title = `${loaderData.lesson} — ${loaderData.course.title} | Codding`;
    const desc = `Lição interativa sobre ${loaderData.lesson.toLowerCase()} no curso de ${loaderData.course.title}, com exercício corrigido automaticamente.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: LessonPage,
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center bg-background px-6 text-center">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Lição não encontrada</h1>
        <Link to="/cursos" className="bg-brand mt-6 inline-flex rounded-xl px-5 py-2.5 font-bold text-primary-foreground">
          Ver cursos
        </Link>
      </div>
    </div>
  ),
});

function LessonPage() {
  const { course, mod, lesson, m, l } = Route.useLoaderData();
  const navigate = useNavigate();
  const { user } = useSession();
  const ex = useMemo(() => exerciseFor(course, lesson), [course, lesson]);
  const sections = useMemo(() => lessonSections(course, mod.title, lesson), [course, mod, lesson]);

  const [code, setCode] = useState(ex.starter);
  const [output, setOutput] = useState<string | null>(null);
  const [srcDoc, setSrcDoc] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "fail">("idle");
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const run = useServerFn(runCode);

  useEffect(() => {
    setCode(ex.starter);
    setOutput(null);
    setStatus("idle");
    setSrcDoc("");
  }, [ex]);

  useEffect(() => {
    if (!user) {
      setDone(false);
      return;
    }
    supabase
      .from("lesson_progress")
      .select("id")
      .eq("course_slug", course.slug)
      .eq("module_index", m)
      .eq("lesson_index", l)
      .maybeSingle()
      .then(({ data }) => setDone(Boolean(data)));
  }, [user, course.slug, m, l]);

  const isWeb = ex.expected === null;

  const next = useMemo(() => {
    if (l + 1 < mod.lessons.length) return { m, l: l + 1 };
    if (m + 1 < course.modules.length) return { m: m + 1, l: 0 };
    return null;
  }, [course, mod, m, l]);

  async function check() {
    if (isWeb) {
      setSrcDoc(code);
      setStatus("ok");
      return;
    }
    setRunning(true);
    setStatus("idle");
    try {
      const res = await run({ data: { language: ex.language, code, stdin: "" } });
      const out = (res.output || res.stderr || res.error || "").trim();
      setOutput(out);
      setStatus(out.replace(/\s+/g, " ").includes(ex.expected ?? "") ? "ok" : "fail");
    } catch {
      setOutput("Não foi possível executar agora. Tente de novo.");
      setStatus("fail");
    } finally {
      setRunning(false);
    }
  }

  async function toggleDone() {
    if (!user) {
      navigate({ to: "/entrar", search: {} });
      return;
    }
    if (done) {
      await uncompleteLesson(user.id, course.slug, m, l);
      setDone(false);
      setUnlocked([]);
      return;
    }
    const { newAchievements } = await completeLesson(user.id, course.slug, m, l);
    setDone(true);
    setUnlocked(newAchievements);
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader crumb={course.title} />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Link
          to="/cursos/$slug"
          params={{ slug: course.slug }}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> {course.title}
        </Link>

        <p className="mt-6 text-xs font-semibold tracking-wide text-cyan uppercase">
          Módulo {m + 1} • {mod.title}
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{lesson}</h1>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_1fr]">
          <article className="space-y-6">
            {sections.map((s) => (
              <section key={s.title} className="card-soft p-6">
                <h2 className="font-display text-lg font-bold">{s.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </section>
            ))}

            <button
              onClick={toggleDone}
              className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-colors ${
                done
                  ? "border border-success/50 text-success"
                  : "bg-brand text-primary-foreground"
              }`}
            >
              {done ? <CheckCircle2 className="h-4 w-4" /> : <CircleDashed className="h-4 w-4" />}
              {done ? "Lição concluída" : user ? "Marcar como concluída" : "Entrar para salvar progresso"}
            </button>

            {unlocked.length > 0 && (
              <p className="inline-flex items-center gap-2 rounded-xl border border-cyan/50 px-4 py-3 text-sm text-cyan">
                <Sparkles className="h-4 w-4" /> Nova conquista desbloqueada!
              </p>
            )}

            {next && (
              <Link
                to="/cursos/$slug/licao/$m/$l"
                params={{ slug: course.slug, m: String(next.m), l: String(next.l) }}
                className="inline-flex items-center gap-2 text-sm font-semibold text-cyan"
              >
                Próxima lição <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </article>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="card-soft overflow-hidden p-0">
              <div className="border-b border-border px-5 py-4">
                <h2 className="font-display text-lg font-bold">Exercício</h2>
                <p className="mt-1 text-sm text-muted-foreground">{ex.prompt}</p>
              </div>
              <textarea
                value={code}
                spellCheck={false}
                onChange={(e) => setCode(e.target.value)}
                className="min-h-[240px] w-full resize-none bg-surface/60 px-4 py-3 font-mono text-sm leading-6 text-foreground outline-none"
              />
              <div className="flex items-center gap-2 border-t border-border px-4 py-3">
                <button
                  onClick={check}
                  disabled={running}
                  className="bg-brand inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold text-primary-foreground disabled:opacity-60"
                >
                  {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                  {isWeb ? "Rodar" : "Verificar resposta"}
                </button>
                <button
                  onClick={() => setCode(ex.starter)}
                  className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground"
                >
                  Recomeçar
                </button>
                <Link to="/playground" className="ml-auto text-xs font-semibold text-cyan">
                  Abrir no playground
                </Link>
              </div>

              {isWeb ? (
                srcDoc && (
                  <iframe
                    title="Pré-visualização"
                    sandbox="allow-scripts allow-modals"
                    srcDoc={srcDoc}
                    className="h-64 w-full border-t border-border bg-white"
                  />
                )
              ) : (
                <div className="border-t border-border px-4 py-3">
                  {status === "ok" && (
                    <p className="inline-flex items-center gap-2 text-sm font-semibold text-success">
                      <CheckCircle2 className="h-4 w-4" /> Resposta correta! Mandou bem.
                    </p>
                  )}
                  {status === "fail" && (
                    <p className="inline-flex items-center gap-2 text-sm font-semibold text-destructive">
                      <XCircle className="h-4 w-4" /> Ainda não. Confira a saída abaixo.
                    </p>
                  )}
                  {output && (
                    <pre className="mt-2 font-mono text-sm whitespace-pre-wrap text-muted-foreground">
                      {output}
                    </pre>
                  )}
                  {!output && status === "idle" && (
                    <p className="text-sm text-muted-foreground">
                      Escreva sua solução e clique em Verificar.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
