import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  CircleDashed,
  Lightbulb,
  ListChecks,
  Loader2,
  Play,
  PlayCircle,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  Terminal,
  XCircle,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { countLessons, getCourse } from "@/data/courses";
import { lessonContent } from "@/data/lessonContent";
import { askTutor, tutorSuggestions } from "@/lib/tutor";
import { videoAulas } from "@/lib/videoAulas";
import { runCode } from "@/lib/run-code.functions";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";
import { completeLesson, uncompleteLesson } from "@/lib/learning";
import { Button } from "@/components/ui/button";

function LessonText({ body }: { body: string }) {
  const blocks = body.split(/\n+/).map((block) => block.trim()).filter(Boolean);
  const bullets = blocks.filter((block) => block.startsWith("•"));

  if (bullets.length === blocks.length && bullets.length > 0) {
    return (
      <ul className="mt-4 space-y-3 text-[15px] leading-7 text-muted-foreground sm:text-base">
        {bullets.map((item) => (
          <li key={item} className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
            <span aria-hidden="true" className="mt-[0.7rem] h-1.5 w-1.5 rounded-full bg-cyan" />
            <span className="min-w-0 break-words">{item.slice(1).trim()}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="mt-3 space-y-4 text-[15px] leading-7 text-muted-foreground sm:text-base sm:leading-8">
      {blocks.map((paragraph) => (
        <p key={paragraph} className="break-words">{paragraph}</p>
      ))}
    </div>
  );
}

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
    const desc = `Lição interativa sobre ${loaderData.lesson.toLowerCase()} no curso de ${loaderData.course.title}, com videoaula, exemplo comentado, quiz e exercício corrigido automaticamente.`;
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
        <h1 className="font-display text-2xl font-extrabold sm:text-3xl">Lição não encontrada</h1>
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
  const videos = useMemo(() => videoAulas(course.title, mod.title, lesson), [course, mod, lesson]);
  const ex = content.exercise;
  const guided = content.guided;

  const [code, setCode] = useState(ex.starter);
  const [output, setOutput] = useState<string | null>(null);
  const [srcDoc, setSrcDoc] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "fail">("idle");
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [feitas, setFeitas] = useState<Set<string>>(new Set());
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [chat, setChat] = useState<
    { role: "user" | "tutor"; text: string; source?: string; verificado?: boolean }[]
  >([]);
  const [pergunta, setPergunta] = useState("");
  const [indice, setIndice] = useState(false);
  const [guidedAnswers, setGuidedAnswers] = useState<Record<number, number>>({});
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [completedChallenges, setCompletedChallenges] = useState<Set<number>>(new Set());
  const [showHint, setShowHint] = useState(false);
  const run = useServerFn(runCode);

  useEffect(() => {
    setCode(ex.starter);
    setOutput(null);
    setStatus("idle");
    setSrcDoc("");
    setAnswers({});
    setChat([]);
    setIndice(false);
    setGuidedAnswers({});
    setChallengeIndex(0);
    setCompletedChallenges(new Set());
    setShowHint(false);
  }, [ex]);

  useEffect(() => {
    if (!user) {
      setDone(false);
      setFeitas(new Set());
      return;
    }
    let alive = true;
    void (async () => {
      const { data } = await supabase
        .from("lesson_progress")
        .select("module_index, lesson_index")
        .eq("course_slug", course.slug);
      if (!alive) return;
      const set = new Set((data ?? []).map((d) => `${d.module_index}-${d.lesson_index}`));
      setFeitas(set);
      setDone(set.has(`${m}-${l}`));
    })();
    return () => {
      alive = false;
    };
  }, [user, course.slug, m, l]);

  const activeChallenge = guided?.challenges[challengeIndex];
  const activeExpected = activeChallenge?.expected ?? ex.expected;
  const isWeb = activeExpected === null;
  const total = countLessons(course);
  const pct = total ? Math.round((feitas.size / total) * 100) : 0;
  const erradas = content.quiz
    .map((q, i) => ({ q, i, escolhida: answers[i] }))
    .filter((r) => r.escolhida !== undefined && r.escolhida !== r.q.answer);
  const acertos = content.quiz.filter((q, i) => answers[i] === q.answer).length;
  const respondidas = Object.keys(answers).length;
  const quizCompleto = respondidas === content.quiz.length && content.quiz.length > 0;

  const next = useMemo(() => {
    if (l + 1 < mod.lessons.length) return { m, l: l + 1 };
    if (m + 1 < course.modules.length) return { m: m + 1, l: 0 };
    return null;
  }, [course, mod, m, l]);

  const prev = useMemo(() => {
    if (l - 1 >= 0) return { m, l: l - 1 };
    if (m - 1 >= 0) {
      const anterior = course.modules[m - 1];
      if (anterior) return { m: m - 1, l: anterior.lessons.length - 1 };
    }
    return null;
  }, [course, m, l]);

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
      const normalizedOutput = out.replace(/\r/g, "").trim();
      const hasPlaceholder = /____|\.\.\.|# crie|# complete/i.test(code);
      const correct = !hasPlaceholder && (activeExpected === "\n"
        ? normalizedOutput.split("\n").filter(Boolean).length >= 2
        : normalizedOutput.includes(activeExpected ?? ""));
      setStatus(correct ? "ok" : "fail");
      if (correct && guided) setCompletedChallenges((old) => new Set(old).add(challengeIndex));
    } catch {
      setOutput("Não foi possível executar agora. Tente de novo.");
      setStatus("fail");
    } finally {
      setRunning(false);
    }
  }

  async function toggleDone() {
    if (guided && (Object.keys(guidedAnswers).length < guided.steps.filter((step) => step.check).length || completedChallenges.size < guided.challenges.length)) return;
    if (!user) {
      navigate({ to: "/entrar", search: {} });
      return;
    }
    const chave = `${m}-${l}`;
    if (done) {
      await uncompleteLesson(user.id, course.slug, m, l);
      setDone(false);
      setUnlocked([]);
      setFeitas((s) => {
        const n = new Set(s);
        n.delete(chave);
        return n;
      });
      return;
    }
    const { newAchievements } = await completeLesson(user.id, course.slug, m, l);
    setDone(true);
    setUnlocked(newAchievements);
    setFeitas((s) => new Set(s).add(chave));
  }

  function perguntar(texto?: string) {
    const q = (texto ?? pergunta).trim();
    if (!q) return;
    const a = askTutor(q, content, lesson);
    setChat((c) => [
      ...c,
      { role: "user", text: q },
      { role: "tutor", text: a.text, source: a.source, verificado: a.verificado },
    ]);
    setPergunta("");
  }

  const guidedTotal = guided ? guided.steps.filter((step) => step.check).length + guided.challenges.length : 0;
  const guidedCorrect = guided ? guided.steps.filter((step, index) => step.check && guidedAnswers[index] === step.check.answer).length : 0;
  const guidedCompleted = guidedCorrect + completedChallenges.size;
  const guidedReady = !guided || guidedCompleted === guidedTotal;

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      <SiteHeader crumb={course.title} />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <Link
            to="/cursos/$slug"
            params={{ slug: course.slug }}
            className="inline-flex min-w-0 items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" /> <span className="truncate">{course.title}</span>
          </Link>
          <span className="shrink-0 text-xs text-muted-foreground">
            {feitas.size}/{total} lições
          </span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-2">
          <div className="bg-brand h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>

        <p className="mt-6 text-xs font-semibold tracking-wide text-cyan uppercase">
          Módulo {m + 1} • {mod.title}
        </p>
        <h1 className="mt-2 font-display text-2xl leading-tight font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
          {lesson}
        </h1>
        {content.topic.title.toLocaleLowerCase("pt-BR") !== lesson.toLocaleLowerCase("pt-BR") && (
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">Parte de: {content.topic.title}</p>
        )}

        {/* Índice do módulo — navegação rápida entre lições */}
        <div className="card-soft mt-5 overflow-hidden p-0">
          <button
            onClick={() => setIndice((v) => !v)}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold sm:px-5"
          >
            <ListChecks className="h-4 w-4 shrink-0 text-cyan" />
            <span className="min-w-0 flex-1 truncate">Lições deste módulo ({mod.lessons.length})</span>
            <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${indice ? "rotate-180" : ""}`} />
          </button>
          {indice && (
            <ul className="border-t border-border px-4 py-2 sm:px-5">
              {mod.lessons.map((li, j) => (
                <li key={li} className="border-b border-border/50 last:border-0">
                  <Link
                    to="/cursos/$slug/licao/$m/$l"
                    params={{ slug: course.slug, m: String(m), l: String(j) }}
                    onClick={() => setIndice(false)}
                    className={`flex items-center gap-3 py-2.5 text-sm ${
                      j === l ? "font-bold text-cyan" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {feitas.has(`${m}-${j}`) ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                    ) : (
                      <CircleDashed className="h-4 w-4 shrink-0" />
                    )}
                    <span className="min-w-0 flex-1">{li}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {guided && (
          <section className="mt-6 border-y border-border py-5">
            <div className="grid gap-5 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-start">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-2 text-cyan">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-muted-foreground">
                  <span>{guided.level}</span><span>{guided.duration}</span><span>{guided.steps.length} etapas práticas</span>
                </div>
                <h2 className="mt-2 text-lg font-bold">Ao terminar, você vai conseguir</h2>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {guided.objectives.map((objective) => (
                    <li key={objective} className="flex items-start gap-2 text-sm leading-6 text-muted-foreground">
                      <Target className="mt-1 h-4 w-4 shrink-0 text-success" />
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex items-center gap-3">
                  <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-surface-2"><div className="h-full bg-brand transition-all" style={{ width: `${guidedTotal ? (guidedCompleted / guidedTotal) * 100 : 0}%` }} /></div>
                  <span className="shrink-0 text-xs font-bold text-cyan">{guidedCompleted}/{guidedTotal} atividades</span>
                </div>
              </div>
            </div>
          </section>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(20rem,0.92fr)] lg:gap-10">
          <article className="min-w-0 space-y-8">
            {guided ? (
              <div className="space-y-10">
                {guided.steps.map((step, index) => {
                  const selected = guidedAnswers[index];
                  const answered = selected !== undefined;
                  return (
                    <section key={step.title} className="border-b border-border pb-10 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cyan/50 text-xs font-bold text-cyan">{index + 1}</span>
                        <p className="text-xs font-bold uppercase text-cyan">{step.eyebrow}</p>
                      </div>
                      <h2 className="mt-4 text-xl font-bold leading-snug sm:text-2xl">{step.title}</h2>
                      <p className="mt-3 text-[15px] leading-7 text-muted-foreground sm:text-base sm:leading-8">{step.explanation}</p>
                      {step.code && (
                        <div className="mt-5 overflow-hidden rounded-lg border border-border bg-surface">
                          <div className="flex items-center justify-between border-b border-border px-4 py-2 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-2"><Terminal className="h-3.5 w-3.5" /> Python</span>
                            <Button variant="ghost" size="sm" onClick={() => { setCode(step.code ?? ""); setStatus("idle"); setOutput(null); }}>Testar no editor</Button>
                          </div>
                          <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-6"><code>{step.code}</code></pre>
                        </div>
                      )}
                      {step.note && <p className="mt-3 flex items-start gap-2 text-sm leading-6 text-muted-foreground"><Lightbulb className="mt-1 h-4 w-4 shrink-0 text-warn" />{step.note}</p>}
                      {step.check && (
                        <div className="mt-5 rounded-lg border border-border bg-surface p-4 sm:p-5">
                          <p className="text-xs font-bold uppercase text-violet">Cheque seu entendimento</p>
                          <p className="mt-2 text-sm font-semibold leading-6">{step.check.question}</p>
                          <div className="mt-3 grid gap-2">
                            {step.check.options.map((option, optionIndex) => {
                              const correct = optionIndex === step.check?.answer;
                              const chosen = selected === optionIndex;
                              return (
                                <Button key={option} variant="outline" disabled={answered} onClick={() => setGuidedAnswers((old) => ({ ...old, [index]: optionIndex }))} className={`h-auto min-h-10 justify-start whitespace-normal px-3 py-2 text-left ${answered && correct ? "border-success text-success" : chosen ? "border-destructive text-destructive" : ""}`}>
                                  {option}
                                </Button>
                              );
                            })}
                          </div>
                          {answered && <p className={`mt-3 text-sm leading-6 ${selected === step.check.answer ? "text-success" : "text-warn"}`}>{selected === step.check.answer ? "Correto. " : "Ainda não. "}{step.check.explanation}</p>}
                        </div>
                      )}
                    </section>
                  );
                })}
                <section className="border-t border-border pt-8">
                  <h2 className="text-xl font-bold">O que você aprendeu</h2>
                  <ul className="mt-4 space-y-3">
                    {guided.recap.map((item) => <li key={item} className="flex items-start gap-3 text-sm leading-6 text-muted-foreground"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-success" />{item}</li>)}
                  </ul>
                </section>
              </div>
            ) : <div className="overflow-hidden rounded-2xl border border-border bg-surface">
              {content.sections.map((s, index) => (
                <section
                  key={`${s.kind}-${index}`}
                  className={`px-5 py-6 sm:px-7 sm:py-8 ${index > 0 ? "border-t border-border" : ""}`}
                >
                  <p className="text-xs font-bold tracking-wide text-cyan uppercase">{String(index + 1).padStart(2, "0")}</p>
                  <h2 className="mt-2 font-display text-lg font-bold leading-snug sm:text-xl">{s.title}</h2>
                  <LessonText body={s.body} />
                </section>
              ))}
            </div>}

            {!guided && <section className="card-soft p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <PlayCircle className="h-4 w-4 shrink-0 text-violet" />
                <h2 className="font-display text-base font-bold sm:text-lg">Videoaulas sobre este tema</h2>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Se você aprende melhor assistindo, abrimos uma seleção de aulas em vídeo em português sobre
                exatamente este assunto.
              </p>
              <div className="mt-4 grid gap-3">
                {videos.map((v) => (
                  <a
                    key={v.titulo}
                    href={v.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 rounded-xl border border-border px-4 py-3 transition-colors hover:border-cyan/50"
                  >
                    <PlayCircle className="mt-0.5 h-4 w-4 shrink-0 text-cyan" />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{v.titulo}</span>
                      <span className="block text-xs text-muted-foreground">{v.descricao}</span>
                    </span>
                  </a>
                ))}
              </div>
            </section>}

            {!guided && <section className="card-soft overflow-hidden p-0">
              <div className="border-b border-border px-5 py-4">
                <h2 className="font-display text-base font-bold sm:text-lg">Exemplo comentado</h2>
                <p className="mt-1 text-xs text-muted-foreground">{content.example.language}</p>
              </div>
              <pre className="overflow-x-auto bg-surface/60 px-4 py-4 font-mono text-[12.5px] leading-6 text-foreground sm:px-5 sm:text-[13px]">
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
            </section>}

            {!guided && <section className="card-soft p-5 sm:p-6">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <h2 className="font-display text-base font-bold sm:text-lg">Quiz rápido</h2>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {respondidas}/{content.quiz.length} • {acertos} certas
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

              {quizCompleto && (
                <div
                  className={`mt-6 rounded-xl border p-4 ${
                    erradas.length === 0 ? "border-success/50" : "border-warn/50"
                  }`}
                >
                  <p className="text-sm font-bold">
                    Seu desempenho: {acertos} acertos e {erradas.length}{" "}
                    {erradas.length === 1 ? "erro" : "erros"} em {content.quiz.length}
                  </p>
                  {erradas.length === 0 ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Gabaritou. Pode seguir para o exercício com tranquilidade.
                    </p>
                  ) : (
                    <ul className="mt-3 space-y-3">
                      {erradas.map((r) => (
                        <li key={r.q.q} className="text-xs">
                          <p className="font-semibold text-foreground">{r.q.q}</p>
                          <p className="mt-1 text-muted-foreground">
                          Você marcou “{r.escolhida === undefined ? "" : r.q.options[r.escolhida]}”. O certo é “{r.q.options[r.q.answer]}”.
                          </p>
                          <p className="mt-1 text-muted-foreground">
                            <span className="font-semibold text-cyan">Por quê (material desta lição):</span> {r.q.why}
                          </p>
                          <button
                            onClick={() => perguntar(r.q.q)}
                            className="mt-1 font-semibold text-cyan"
                          >
                            Pedir mais explicação ao tutor →
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <button
                    onClick={() => setAnswers({})}
                    className="mt-4 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
                  >
                    Refazer o quiz
                  </button>
                </div>
              )}
            </section>}

            <button
              onClick={toggleDone}
              disabled={!guidedReady}
              className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-colors ${
                done ? "border border-success/50 text-success" : "bg-brand text-primary-foreground"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {done ? <CheckCircle2 className="h-4 w-4" /> : <CircleDashed className="h-4 w-4" />}
              {done ? "Lição concluída" : !guidedReady ? `Complete as atividades (${guidedCompleted}/${guidedTotal})` : user ? "Marcar como concluída" : "Entrar para salvar progresso"}
            </button>

            {unlocked.length > 0 && (
              <p className="inline-flex items-center gap-2 rounded-xl border border-cyan/50 px-4 py-3 text-sm text-cyan">
                <Sparkles className="h-4 w-4" /> Nova conquista desbloqueada!
              </p>
            )}
          </article>

          <div className="min-w-0 space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="card-soft overflow-hidden p-0">
              <div className="border-b border-border px-5 py-4">
                <h2 className="font-display text-base font-bold sm:text-lg">{activeChallenge?.title ?? "Exercício"}</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{activeChallenge?.instruction ?? ex.prompt}</p>
                {guided && (
                  <div className="mt-4 grid grid-cols-4 gap-2" aria-label="Desafios da aula">
                    {guided.challenges.map((challenge, index) => (
                      <Button key={challenge.title} size="sm" variant={challengeIndex === index ? "default" : "outline"} onClick={() => { setChallengeIndex(index); setCode(challenge.starter); setStatus(completedChallenges.has(index) ? "ok" : "idle"); setOutput(null); setShowHint(false); }} className="min-w-0 px-2">{completedChallenges.has(index) ? <CheckCircle2 className="h-3.5 w-3.5" /> : index + 1}</Button>
                    ))}
                  </div>
                )}
              </div>
              <textarea
                value={code}
                spellCheck={false}
                onChange={(e) => setCode(e.target.value)}
                className="min-h-[220px] w-full resize-y bg-surface/60 px-4 py-3 font-mono text-[13px] leading-6 text-foreground outline-none sm:min-h-[240px] sm:text-sm"
              />
              <div className="flex flex-wrap items-center gap-2 border-t border-border px-4 py-3">
                <button
                  onClick={check}
                  disabled={running}
                  className="bg-brand inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold text-primary-foreground disabled:opacity-60"
                >
                  {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                  {isWeb ? "Rodar" : "Verificar resposta"}
                </button>
                <button
                  onClick={() => setCode(activeChallenge?.starter ?? ex.starter)}
                  className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground"
                >
                  Recomeçar
                </button>
                {activeChallenge && <Button variant="ghost" size="sm" onClick={() => setShowHint((value) => !value)}><Lightbulb className="h-3.5 w-3.5" /> Dica</Button>}
                <Link to="/playground" className="ml-auto text-xs font-semibold text-cyan">
                  Abrir no playground
                </Link>
              </div>

              {showHint && activeChallenge && <p className="border-t border-border px-4 py-3 text-sm leading-6 text-warn">{activeChallenge.hint}</p>}

              {isWeb ? (
                srcDoc && (
                  <iframe
                    title="Pré-visualização"
                    sandbox="allow-scripts allow-modals"
                    srcDoc={srcDoc}
                    className="h-56 w-full border-t border-border bg-white sm:h-64"
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
                    <pre className="mt-2 overflow-x-auto font-mono text-sm whitespace-pre-wrap text-muted-foreground">
                      {output}
                    </pre>
                  )}
                  {!output && status === "idle" && (
                    <p className="text-sm text-muted-foreground">Escreva sua solução e clique em Verificar.</p>
                  )}
                </div>
              )}
            </div>

            <div className="card-soft overflow-hidden p-0">
              <div className="flex items-center gap-2 border-b border-border px-5 py-4">
                <Bot className="h-4 w-4 shrink-0 text-cyan" />
                <h2 className="font-display text-base font-bold sm:text-lg">Tire sua dúvida</h2>
              </div>
              <p className="flex items-start gap-2 px-5 pt-4 text-xs text-muted-foreground">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                Cada resposta é conferida contra o material desta lição antes de aparecer. Sem IA por trás e sem
                inventar nada.
              </p>

              <div className="max-h-80 space-y-3 overflow-y-auto px-5 py-4">
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
                    className={`rounded-xl px-4 py-3 text-sm break-words whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-surface-2 text-foreground"
                        : "border border-border bg-surface text-muted-foreground"
                    }`}
                  >
                    {msg.role === "tutor" && msg.source && (
                      <p
                        className={`mb-1 inline-flex items-center gap-1 text-[11px] font-semibold tracking-wide uppercase ${
                          msg.verificado ? "text-cyan" : "text-warn"
                        }`}
                      >
                        {msg.verificado && <ShieldCheck className="h-3 w-3" />}
                        Fonte: {msg.source}
                      </p>
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
                  className="min-w-0 flex-1 rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-cyan"
                />
                <button
                  onClick={() => perguntar()}
                  aria-label="Enviar pergunta"
                  className="bg-brand shrink-0 rounded-xl p-2.5 text-primary-foreground"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navegação anterior / próxima (desktop) */}
        <div className="mt-10 hidden grid-cols-2 gap-3 lg:grid">
          {prev ? (
            <Link
              to="/cursos/$slug/licao/$m/$l"
              params={{ slug: course.slug, m: String(prev.m), l: String(prev.l) }}
              className="card-soft flex items-center gap-2 px-5 py-4 text-sm font-semibold"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" /> Lição anterior
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              to="/cursos/$slug/licao/$m/$l"
              params={{ slug: course.slug, m: String(next.m), l: String(next.l) }}
              className="card-soft flex items-center justify-end gap-2 px-5 py-4 text-sm font-semibold text-cyan"
            >
              Próxima lição <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
          )}
        </div>
      </main>

      {/* Barra fixa de navegação no celular */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-3 py-2.5 backdrop-blur-xl lg:hidden">
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
          {prev ? (
            <Link
              to="/cursos/$slug/licao/$m/$l"
              params={{ slug: course.slug, m: String(prev.m), l: String(prev.l) }}
              aria-label="Lição anterior"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
          ) : (
            <span className="h-10 w-10" />
          )}
          <button
            onClick={toggleDone}
            disabled={!guidedReady}
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-3 text-xs font-bold ${
              done ? "border border-success/50 text-success" : "bg-brand text-primary-foreground"
            } disabled:opacity-50`}
          >
            {done ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <CircleDashed className="h-4 w-4 shrink-0" />}
            <span className="truncate">{done ? "Concluída" : "Concluir lição"}</span>
          </button>
          {next ? (
            <Link
              to="/cursos/$slug/licao/$m/$l"
              params={{ slug: course.slug, m: String(next.m), l: String(next.l) }}
              aria-label="Próxima lição"
              className="bg-brand inline-flex h-10 w-10 items-center justify-center rounded-xl text-primary-foreground"
            >
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <span className="h-10 w-10" />
          )}
        </div>
      </div>
    </div>
  );
}
