import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  CheckCircle2,
  CircleDashed,
  Lightbulb,
  Loader2,
  Play,
  Send,
  Sparkles,
  XCircle,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { getCourse } from "@/data/courses";
import { lessonContent } from "@/data/lessonContent";
import { askTutor, tutorSuggestions } from "@/lib/tutor";
import { runCode } from "@/lib/run-code.functions";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { completeLesson, uncompleteLesson } from "@/lib/learning";

export const Route = createFileRoute("/cursos/$slug_/licao/$m/$l")({
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
    const desc = `Lição interativa sobre ${loaderData.lesson.toLowerCase()} no curso de ${loaderData.course.title}, com exemplo comentado, quiz e exercício corrigido automaticamente.`;
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
  const content = useMemo(() => lessonContent(course, mod.title, lesson), [course, mod, lesson]);
  const ex = content.exercise;

  const [code, setCode] = useState(ex.starter);
  const [output, setOutput] = useState<string | null>(null);
  const [srcDoc, setSrcDoc] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "fail">("idle");
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [chat, setChat] = useState<{ role: "user" | "tutor"; text: string; source?: string }[]>([]);
  const [pergunta, setPergunta] = useState("");
  const run = useServerFn(runCode);

  useEffect(() => {
    setCode(ex.starter);
    setOutput(null);
    setStatus("idle");
    setSrcDoc("");
    setAnswers({});
    setChat([]);
  }, [ex]);

  useEffect(() => {
    if (!user) {
      setDone(false);
      return;
    }
    let alive = true;
    void (async () => {
      const { data } = await supabase
        .from("lesson_progress")
        .select("id")
        .eq("course_slug", course.slug)
        .eq("module_index", m)
        .eq("lesson_index", l)
        .maybeSingle();
      if (alive) setDone(Boolean(data));
    })();
    return () => {
      alive = false;
    };
  }, [user, course.slug, m, l]);

  const isWeb = ex.expected === null;
  const acertos = content.quiz.filter((q, i) => answers[i] === q.answer).length;
  const respondidas = Object.keys(answers).length;

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

  function perguntar(texto?: string) {
    const q = (texto ?? pergunta).trim();
    if (!q) return;
    const a = askTutor(q, content, lesson);
    setChat((c) => [...c, { role: "user", text: q }, { role: "tutor", text: a.text, source: a.source }]);
    setPergunta("");
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
        <p className="mt-2 text-sm text-muted-foreground">Tema: {content.topic.title}</p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_1fr]">
          <article className="space-y-6">
            {content.sections.map((s) => (
              <section key={s.title} className="card-soft p-6">
                <h2 className="font-display text-lg font-bold">{s.title}</h2>
                <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-muted-foreground">{s.body}</p>
              </section>
            ))}

            <section className="card-soft overflow-hidden p-0">
              <div className="border-b border-border px-6 py-4">
                <h2 className="font-display text-lg font-bold">Exemplo comentado</h2>
                <p className="mt-1 text-xs text-muted-foreground">{content.example.language}</p>
              </div>
              <pre className="overflow-x-auto bg-surface/60 px-5 py-4 font-mono text-[13px] leading-6 text-foreground">
                <code>{content.example.code}</code>
              </pre>
              <div className="flex gap-2 border-t border-border px-5 py-4 text-sm text-muted-foreground">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-warn" />
                <p>{content.example.explain}</p>
              </div>
              <div className="border-t border-border px-5 py-3">
                <button
                  onClick={() => {
                    setCode(content.example.code);
                    setStatus("idle");
                    setOutput(null);
                  }}
                  className="text-xs font-semibold text-cyan"
                >
                  Copiar exemplo para o editor →
                </button>
              </div>
            </section>

            <section className="card-soft p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold">Quiz rápido</h2>
                <span className="text-xs text-muted-foreground">
                  {respondidas}/{content.quiz.length} respondidas • {acertos} certas
                </span>
              </div>
              <div className="mt-4 space-y-6">
                {content.quiz.map((q, qi) => {
                  const escolhida = answers[qi];
                  return (
                    <div key={q.q}>
                      <p className="text-sm font-semibold">
                        {qi + 1}. {q.q}
                      </p>
                      <div className="mt-3 grid gap-2">
                        {q.options.map((opt, oi) => {
                          const selecionada = escolhida === oi;
                          const correta = oi === q.answer;
                          const respondida = escolhida !== undefined;
                          return (
                            <button
                              key={opt}
                              onClick={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                              disabled={respondida}
                              className={`rounded-xl border px-4 py-2.5 text-left text-sm transition-colors ${
                                respondida && correta
                                  ? "border-success/60 text-success"
                                  : selecionada
                                    ? "border-destructive/60 text-destructive"
                                    : "border-border text-muted-foreground hover:border-cyan/50"
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                      {escolhida !== undefined && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          {escolhida === q.answer ? "Isso! " : "Quase. "}
                          {q.why}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            <button
              onClick={toggleDone}
              className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-colors ${
                done ? "border border-success/50 text-success" : "bg-brand text-primary-foreground"
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

          <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
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
                    <pre className="mt-2 font-mono text-sm whitespace-pre-wrap text-muted-foreground">{output}</pre>
                  )}
                  {!output && status === "idle" && (
                    <p className="text-sm text-muted-foreground">Escreva sua solução e clique em Verificar.</p>
                  )}
                </div>
              )}
            </div>

            <div className="card-soft overflow-hidden p-0">
              <div className="flex items-center gap-2 border-b border-border px-5 py-4">
                <Bot className="h-4 w-4 text-cyan" />
                <h2 className="font-display text-lg font-bold">Tire sua dúvida</h2>
              </div>
              <p className="px-5 pt-4 text-xs text-muted-foreground">
                Responde apenas com o conteúdo desta lição — nada inventado.
              </p>

              <div className="max-h-72 space-y-3 overflow-y-auto px-5 py-4">
                {chat.length === 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tutorSuggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => perguntar(s)}
                        className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:border-cyan/50 hover:text-foreground"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
                {chat.map((msg, i) => (
                  <div
                    key={i}
                    className={`rounded-xl px-4 py-3 text-sm whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-surface-2 text-foreground"
                        : "border border-border bg-surface text-muted-foreground"
                    }`}
                  >
                    {msg.role === "tutor" && msg.source && (
                      <p className="mb-1 text-[11px] font-semibold tracking-wide text-cyan uppercase">{msg.source}</p>
                    )}
                    {msg.text}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 border-t border-border px-4 py-3">
                <input
                  value={pergunta}
                  onChange={(e) => setPergunta(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") perguntar();
                  }}
                  placeholder="Pergunte sobre esta lição..."
                  className="flex-1 rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-cyan"
                />
                <button
                  onClick={() => perguntar()}
                  aria-label="Enviar pergunta"
                  className="bg-brand rounded-xl p-2.5 text-primary-foreground"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
