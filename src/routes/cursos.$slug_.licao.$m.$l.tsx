import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  CircleDashed,
  Contrast,
  Keyboard,
  Lightbulb,
  ListChecks,
  Loader2,
  Minus,
  Play,
  PlayCircle,
  Plus,
  Printer,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  Terminal,
  Type,
  WrapText,
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
  const numbered = blocks.filter((block) => /^\d+[.)]\s/.test(block));

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

  if (numbered.length === blocks.length && numbered.length > 0) {
    return (
      <ol className="mt-4 space-y-3 text-[15px] leading-7 text-muted-foreground sm:text-base">
        {numbered.map((item, index) => (
          <li key={item} className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-bold text-cyan">{index + 1}</span>
            <span className="min-w-0 break-words">{item.replace(/^\d+[.)]\s*/, "")}</span>
          </li>
        ))}
      </ol>
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

const secoesAula = [
  { id: "aula-explicacao", label: "Explicação", tecla: "e" },
  { id: "aula-exemplo", label: "Exemplo", tecla: "x" },
  { id: "aula-pratica", label: "Prática", tecla: "p" },
  { id: "aula-quiz", label: "Quiz", tecla: "q" },
  { id: "aula-videos", label: "Vídeos", tecla: "v" },
  { id: "aula-revisao", label: "Revisão", tecla: "r" },
];

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
  const [hintLevel, setHintLevel] = useState(0);
  const [secoesVistas, setSecoesVistas] = useState<string[]>([]);
  const [ultimaSecao, setUltimaSecao] = useState("aula-explicacao");
  const [retomavel, setRetomavel] = useState(false);
  const [escala, setEscala] = useState(1);
  const [contraste, setContraste] = useState(false);
  const [quebra, setQuebra] = useState(true);
  const run = useServerFn(runCode);

  useEffect(() => {
    const saved = localStorage.getItem("codding:leitura");
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as { escala?: number; contraste?: boolean; quebra?: boolean };
      if (typeof parsed.escala === "number") setEscala(parsed.escala);
      if (typeof parsed.contraste === "boolean") setContraste(parsed.contraste);
      if (typeof parsed.quebra === "boolean") setQuebra(parsed.quebra);
    } catch {
      /* preferências inválidas são ignoradas */
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("codding:leitura", JSON.stringify({ escala, contraste, quebra }));
  }, [escala, contraste, quebra]);

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
    setHintLevel(0);
    setSecoesVistas([]);
    setUltimaSecao("aula-explicacao");
    setRetomavel(false);
  }, [ex]);

  const chaveProgresso = `codding:aula:${course.slug}:${m}:${l}`;

  useEffect(() => {
    const salvo = localStorage.getItem(chaveProgresso);
    if (!salvo) return;
    try {
      const p = JSON.parse(salvo) as {
        code?: string;
        answers?: Record<number, number>;
        guidedAnswers?: Record<number, number>;
        completed?: number[];
        challengeIndex?: number;
        secoes?: string[];
        ultima?: string;
      };
      if (typeof p.code === "string" && p.code.trim()) setCode(p.code);
      if (p.answers) setAnswers(p.answers);
      if (p.guidedAnswers) setGuidedAnswers(p.guidedAnswers);
      if (Array.isArray(p.completed)) setCompletedChallenges(new Set(p.completed));
      if (typeof p.challengeIndex === "number") setChallengeIndex(p.challengeIndex);
      if (Array.isArray(p.secoes)) setSecoesVistas(p.secoes);
      if (typeof p.ultima === "string") setUltimaSecao(p.ultima);
      setRetomavel(Boolean((p.secoes ?? []).length || (p.completed ?? []).length || Object.keys(p.answers ?? {}).length));
    } catch {
      /* progresso inválido é ignorado */
    }
  }, [chaveProgresso]);

  useEffect(() => {
    localStorage.setItem(
      chaveProgresso,
      JSON.stringify({
        code,
        answers,
        guidedAnswers,
        completed: [...completedChallenges],
        challengeIndex,
        secoes: secoesVistas,
        ultima: ultimaSecao,
        updatedAt: Date.now(),
      }),
    );
  }, [chaveProgresso, code, answers, guidedAnswers, completedChallenges, challengeIndex, secoesVistas, ultimaSecao]);




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
  const activityMode = activeChallenge?.mode ?? (ex.language === "html" ? "preview" : "code");
  const isWeb = activityMode === "preview";
  const isReflection = activityMode === "reflection";
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
    if (isReflection) {
      const usefulText = code.replace(/[#/*\-]/g, "").trim();
      const correct = usefulText.length >= 80 && !/____|\.\.\.|complete|escreva aqui/i.test(usefulText);
      setOutput(correct ? "Análise registrada. Você apresentou uma decisão com justificativa suficiente." : "Desenvolva sua resposta com uma decisão, o motivo e como você verificaria o resultado.");
      setStatus(correct ? "ok" : "fail");
      if (correct && guided) setCompletedChallenges((old) => new Set(old).add(challengeIndex));
      return;
    }
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
      const ranWithoutError = !res.stderr && !res.error;
      const correct = !hasPlaceholder && (activeExpected === null
        ? ranWithoutError
        : activeExpected === "\n"
          ? normalizedOutput.split("\n").filter(Boolean).length >= 2
          : normalizedOutput.includes(activeExpected));
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

  const dicas = useMemo(() => {
    if (!activeChallenge) return [] as string[];
    const lista = [
      `Releia o objetivo com calma: ${activeChallenge.instruction}`,
      activeChallenge.hint,
    ];
    lista.push(
      isReflection
        ? "Escreva em três partes: a decisão que você tomaria, o motivo dela e como conferiria o resultado."
        : activeChallenge.expected && activeChallenge.expected !== "\n"
          ? `A resposta precisa produzir “${activeChallenge.expected}”. Compare linha a linha com o exemplo resolvido da aula.`
          : "Volte ao exemplo resolvido da aula e reproduza a mesma estrutura, trocando só os valores.",
    );
    return lista;
  }, [activeChallenge, isReflection]);

  const checkpoints = useMemo(() => {
    const escreveu = code.trim().length > 0 && code.trim() !== (activeChallenge?.starter ?? ex.starter).trim();
    const semLacunas = !/____|\.\.\.|escreva aqui/i.test(code);
    const executou = output !== null || (isWeb && srcDoc.length > 0);
    const acertou = guided ? completedChallenges.has(challengeIndex) : status === "ok";
    const esperado = activeExpected && activeExpected !== "\n" ? activeExpected : null;
    return [
      {
        label: escreveu ? "Você já escreveu sua própria versão" : "Escreva sua versão a partir do modelo",
        ok: escreveu,
        detail: "O texto do editor ainda é igual ao modelo inicial. Altere pelo menos uma linha para que a prática conte como sua.",
      },
      {
        label: semLacunas ? "Nenhuma lacuna deixada em branco" : "Ainda há lacunas para preencher",
        ok: semLacunas,
        detail: "Substitua os trechos ____ (ou “escreva aqui”) pelo conteúdo pedido — enquanto eles existirem, o resultado não pode ser conferido.",
      },
      {
        label: executou ? (isReflection ? "Análise revisada" : "Código executado") : isReflection ? "Revise sua análise" : "Execute seu código",
        ok: executou,
        detail: isReflection
          ? "Clique em “Revisar análise” para conferir se sua resposta tem decisão, motivo e forma de verificação."
          : "Clique em “Verificar resposta” para rodar seu código e comparar a saída com o esperado.",
      },
      {
        label: acertou ? "Resultado conferido e correto" : "Resultado ainda não confere",
        ok: acertou,
        detail: isReflection
          ? "Esperado: uma resposta com a decisão tomada, o motivo dela e como você conferiria o resultado, em pelo menos três frases."
          : esperado
            ? `Esperado: a saída precisa conter “${esperado}”. ${output ? `Você obteve: “${output.slice(0, 120)}”.` : "Rode o código para comparar."} Isso vale porque a aula usa exatamente esse resultado para provar que a lógica está certa.`
            : "Esperado: o programa rodar sem erro. Se aparecer uma mensagem de erro, leia a última linha: ela indica a linha e o tipo do problema.",
      },
    ];
  }, [code, activeChallenge, ex.starter, output, srcDoc, guided, completedChallenges, challengeIndex, status, isReflection, isWeb, activeExpected]);

  function irPara(id: string) {
    const alternativas: Record<string, string> = { "aula-revisao": "aula-quiz", "aula-exemplo": "aula-explicacao" };
    const alvo = document.getElementById(id) ?? document.getElementById(alternativas[id] ?? "");
    if (!alvo) return;
    alvo.scrollIntoView({ behavior: "smooth", block: "start" });
    alvo.setAttribute("tabindex", "-1");
    alvo.focus({ preventScroll: true });
    if (id !== "aula-indice") {
      setSecoesVistas((old) => (old.includes(id) ? old : [...old, id]));
      setUltimaSecao(id);
    }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!e.altKey || e.ctrlKey || e.metaKey) return;
      const tecla = e.key.toLowerCase();
      const secao = secoesAula.find((s) => s.tecla === tecla);
      if (secao) {
        e.preventDefault();
        irPara(secao.id);
        return;
      }
      if (tecla === "i") {
        e.preventDefault();
        irPara("aula-indice");
      } else if (tecla === "n") {
        e.preventDefault();
        if (guided && challengeIndex + 1 < guided.challenges.length) {
          const proximo = guided.challenges[challengeIndex + 1];
          setChallengeIndex(challengeIndex + 1);
          if (proximo) setCode(proximo.starter);
          setHintLevel(0);
          setOutput(null);
          setStatus("idle");
          irPara("aula-pratica");
        } else if (next) {
          void navigate({ to: "/cursos/$slug/licao/$m/$l", params: { slug: course.slug, m: String(next.m), l: String(next.l) } });
        }
      } else if (tecla === "b" && prev) {
        e.preventDefault();
        void navigate({ to: "/cursos/$slug/licao/$m/$l", params: { slug: course.slug, m: String(prev.m), l: String(prev.l) } });
      } else if (tecla === "h") {
        e.preventDefault();
        setHintLevel((v) => Math.min(v + 1, dicas.length));
      } else if (tecla === "k") {
        e.preventDefault();
        void check();
      } else if (tecla === "d") {
        e.preventDefault();
        window.print();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });


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

        {/* Índice clicável das seções da aula */}
        <nav id="aula-indice" aria-label="Seções da aula" className="nao-imprimir mt-5 scroll-mt-24 flex flex-wrap gap-2">
          {secoesAula.map((item) => (
            <button
              key={item.id}
              onClick={() => irPara(item.id)}
              aria-keyshortcuts={`Alt+${item.tecla.toUpperCase()}`}
              className={`min-h-11 rounded-full border px-4 text-sm font-semibold ${secoesVistas.includes(item.id) ? "border-success/60 text-success" : "border-border text-muted-foreground"} hover:border-cyan/60 hover:text-foreground`}
            >
              {secoesVistas.includes(item.id) && <CheckCircle2 className="mr-1 inline h-3.5 w-3.5" />}
              {item.label} <span className="text-xs opacity-70">Alt+{item.tecla.toUpperCase()}</span>
            </button>
          ))}
        </nav>

        <details className="nao-imprimir mt-3 rounded-xl border border-border px-3 py-2">
          <summary className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Keyboard className="h-4 w-4 text-cyan" /> Atalhos de teclado
          </summary>
          <ul className="mt-2 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
            {secoesAula.map((item) => (
              <li key={item.id}>
                <kbd className="rounded border border-border px-1">Alt+{item.tecla.toUpperCase()}</kbd> ir para {item.label.toLowerCase()}
              </li>
            ))}
            <li><kbd className="rounded border border-border px-1">Alt+I</kbd> voltar ao índice</li>
            <li><kbd className="rounded border border-border px-1">Alt+N</kbd> próximo passo / próxima lição</li>
            <li><kbd className="rounded border border-border px-1">Alt+B</kbd> lição anterior</li>
            <li><kbd className="rounded border border-border px-1">Alt+H</kbd> pedir dica</li>
            <li><kbd className="rounded border border-border px-1">Alt+K</kbd> verificar a prática</li>
            <li><kbd className="rounded border border-border px-1">Alt+D</kbd> baixar PDF da aula</li>
          </ul>
        </details>

        {retomavel && (
          <p className="nao-imprimir mt-3 inline-flex flex-wrap items-center gap-2 rounded-xl border border-cyan/50 px-4 py-3 text-sm text-cyan">
            <Sparkles className="h-4 w-4" /> Retomamos de onde você parou nesta aula.
            <button
              onClick={() => irPara(ultimaSecao)}
              className="min-h-11 font-bold underline underline-offset-4"
            >
              Continuar
            </button>
          </p>
        )}

        {/* Controles de leitura */}
        <div className="nao-imprimir mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-border px-3 py-2">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase text-cyan">
            <Type className="h-4 w-4" /> Leitura
          </span>
          <button
            onClick={() => setEscala((v) => Math.max(0.85, Number((v - 0.1).toFixed(2))))}
            aria-label="Diminuir tamanho da letra"
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-border"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="text-xs font-semibold text-muted-foreground">{Math.round(escala * 100)}%</span>
          <button
            onClick={() => setEscala((v) => Math.min(1.6, Number((v + 0.1).toFixed(2))))}
            aria-label="Aumentar tamanho da letra"
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-border"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            onClick={() => setContraste((v) => !v)}
            aria-pressed={contraste}
            className={`inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 text-sm font-semibold ${contraste ? "border-cyan text-cyan" : "border-border text-muted-foreground"}`}
          >
            <Contrast className="h-4 w-4" /> Alto contraste
          </button>
          <button
            onClick={() => setQuebra((v) => !v)}
            aria-pressed={quebra}
            className={`inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 text-sm font-semibold ${quebra ? "border-cyan text-cyan" : "border-border text-muted-foreground"}`}
          >
            <WrapText className="h-4 w-4" /> Quebra de linha
          </button>
          <button
            onClick={() => window.print()}
            className="ml-auto inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            <Printer className="h-4 w-4" /> Baixar PDF da aula
          </button>
        </div>


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
                <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">{guided.opening}</p>
                <p className="mt-3 border-l-2 border-cyan pl-3 text-xs leading-5 text-muted-foreground"><span className="font-bold text-foreground">Antes de começar:</span> {guided.prerequisite}</p>
                <h2 className="mt-2 text-lg font-bold">Ao terminar, você vai conseguir</h2>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {guided.objectives.map((objective) => (
                    <li key={objective} className="flex items-start gap-2 text-sm leading-6 text-muted-foreground">
                      <Target className="mt-1 h-4 w-4 shrink-0 text-success" />
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 grid gap-2 sm:grid-cols-3">
                  {guided.mentalModel.map((item, index) => (
                    <div key={item.label} className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-lg border border-border p-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-bold text-cyan">{index + 1}</span>
                      <div className="min-w-0"><p className="text-sm font-bold">{item.label}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{item.description}</p></div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex items-center gap-3">
                  <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-surface-2"><div className="h-full bg-brand transition-all" style={{ width: `${guidedTotal ? (guidedCompleted / guidedTotal) * 100 : 0}%` }} /></div>
                  <span className="shrink-0 text-xs font-bold text-cyan">{guidedCompleted}/{guidedTotal} atividades</span>
                </div>
              </div>
            </div>
          </section>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(20rem,0.92fr)] lg:gap-10">
          <article
            className={`min-w-0 space-y-8 leitura ${contraste ? "leitura-contraste" : ""} ${quebra ? "leitura-quebra" : ""}`}
            style={{ ["--leitura-escala" as string]: escala }}
          >
            {guided ? (
              <div id="aula-explicacao" className="scroll-mt-24 space-y-10">
                {guided.steps.map((step, index) => {
                  const selected = guidedAnswers[index];
                  const answered = selected !== undefined;
                  const exemplo = Boolean(step.code) && guided.steps.findIndex((s) => s.code) === index;
                  return (

                    <section key={step.title} {...(exemplo ? { id: "aula-exemplo" } : {})} className="scroll-mt-24 overflow-hidden rounded-xl border border-border bg-surface px-5 py-6 sm:px-7 sm:py-8">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cyan/50 text-xs font-bold text-cyan">{index + 1}</span>
                        <p className="text-xs font-bold uppercase text-cyan">{step.eyebrow}</p>
                      </div>
                      <h2 className="mt-4 text-xl font-bold leading-snug sm:text-2xl">{step.title}</h2>
                      <LessonText body={step.explanation} />
                      {step.code && (
                        <div className="mt-5 overflow-hidden rounded-lg border border-border bg-surface">
                          <div className="flex items-center justify-between border-b border-border px-4 py-2 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-2"><Terminal className="h-3.5 w-3.5" /> {guided.language}</span>
                            <Button variant="ghost" size="sm" onClick={() => { setCode(step.code ?? ""); setStatus("idle"); setOutput(null); }}>Testar no editor</Button>
                          </div>
                          <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-6"><code>{step.code}</code></pre>
                        </div>
                      )}
                      {step.walkthrough && step.walkthrough.length > 0 && (
                        <div className="mt-4 overflow-hidden rounded-lg border border-border">
                          <div className="border-b border-border px-4 py-3"><p className="text-xs font-bold uppercase text-violet">Leitura linha por linha</p></div>
                          <ol className="divide-y divide-border">
                            {step.walkthrough.map((item, lineIndex) => (
                              <li key={`${item.line}-${lineIndex}`} className="grid gap-2 px-4 py-3 sm:grid-cols-[minmax(10rem,0.8fr)_minmax(0,1.2fr)]">
                                <code className="min-w-0 overflow-x-auto font-mono text-xs text-cyan">{item.line.trim()}</code>
                                <p className="text-xs leading-5 text-muted-foreground">{item.explanation}</p>
                              </li>
                            ))}
                          </ol>
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
                <section id="aula-revisao" className="scroll-mt-24 border-t border-border pt-8">
                  <h2 className="text-xl font-bold">O que você aprendeu</h2>
                  <ul className="mt-4 space-y-3">
                    {guided.recap.map((item) => <li key={item} className="flex items-start gap-3 text-sm leading-6 text-muted-foreground"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-success" />{item}</li>)}
                  </ul>
                </section>
              </div>
            ) : <div id="aula-explicacao" className="scroll-mt-24 overflow-hidden rounded-2xl border border-border bg-surface">
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

            <section id="aula-videos" className="card-soft scroll-mt-24 p-5 sm:p-6">
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
            </section>

            {!guided && <section id="aula-exemplo" className="card-soft scroll-mt-24 overflow-hidden p-0">
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

            <section id="aula-quiz" className="card-soft scroll-mt-24 p-5 sm:p-6">

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
                        <div
                          aria-live="polite"
                          className={`mt-3 rounded-xl border px-3 py-2 text-xs leading-5 ${escolhida === q.answer ? "border-success/50" : "border-warn/50"}`}
                        >
                          <p className={`font-bold ${escolhida === q.answer ? "text-success" : "text-warn"}`}>
                            {escolhida === q.answer ? "Você acertou" : "Você errou esta"}
                          </p>
                          {escolhida !== q.answer && (
                            <>
                              <p className="mt-1 text-muted-foreground">
                                <span className="font-semibold text-foreground">Sua resposta:</span> {q.options[escolhida]}
                              </p>
                              <p className="mt-1 text-muted-foreground">
                                <span className="font-semibold text-success">Correção esperada:</span> {q.options[q.answer]}
                              </p>
                            </>
                          )}
                          <p className="mt-1 text-muted-foreground">
                            <span className="font-semibold text-cyan">Por que faz sentido:</span> {q.why}
                          </p>
                          {escolhida !== q.answer && (
                            <button onClick={() => perguntar(q.q)} className="mt-2 font-semibold text-cyan">
                              Ver essa parte da aula com o tutor →
                            </button>
                          )}
                        </div>
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
            </section>

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

          <div id="aula-pratica" className="min-w-0 scroll-mt-24 space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="card-soft overflow-hidden p-0">
              <div className="border-b border-border px-5 py-4">
                <h2 className="font-display text-base font-bold sm:text-lg">{activeChallenge?.title ?? "Exercício"}</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{activeChallenge?.instruction ?? ex.prompt}</p>
                {guided && (
                  <div className="mt-4 grid grid-cols-4 gap-2" aria-label="Desafios da aula">
                    {guided.challenges.map((challenge, index) => (
                      <Button key={challenge.title} size="sm" variant={challengeIndex === index ? "default" : "outline"} onClick={() => { setChallengeIndex(index); setCode(challenge.starter); setStatus(completedChallenges.has(index) ? "ok" : "idle"); setOutput(null); setHintLevel(0); }} className="min-w-0 px-2">{completedChallenges.has(index) ? <CheckCircle2 className="h-3.5 w-3.5" /> : index + 1}</Button>
                    ))}
                  </div>
                )}
              </div>
              <textarea
                value={code}
                spellCheck={false}
                onChange={(e) => setCode(e.target.value)}
                className={`min-h-[220px] w-full resize-y bg-surface/60 px-4 py-3 text-[13px] leading-6 text-foreground outline-none sm:min-h-[240px] sm:text-sm ${isReflection ? "font-sans" : "font-mono"}`}
              />
              <div className="flex flex-wrap items-center gap-2 border-t border-border px-4 py-3">
                <button
                  onClick={check}
                  disabled={running}
                  className="bg-brand inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold text-primary-foreground disabled:opacity-60"
                >
                  {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                   {isWeb ? "Ver resultado" : isReflection ? "Revisar análise" : "Verificar resposta"}
                </button>
                <button
                  onClick={() => setCode(activeChallenge?.starter ?? ex.starter)}
                  className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground"
                >
                  Recomeçar
                </button>
                {activeChallenge && (
                  <Button variant="ghost" size="sm" onClick={() => setHintLevel((v) => Math.min(v + 1, dicas.length))}>
                    <Lightbulb className="h-3.5 w-3.5" /> {hintLevel === 0 ? "Pedir dica" : hintLevel >= dicas.length ? "Todas as dicas" : `Mais uma dica (${hintLevel}/${dicas.length})`}
                  </Button>
                )}
                <Link to="/playground" className="ml-auto text-xs font-semibold text-cyan">
                  Abrir no playground
                </Link>
              </div>

              {hintLevel > 0 && activeChallenge && (
                <ol className="border-t border-border px-4 py-3">
                  {dicas.slice(0, hintLevel).map((dica, index) => (
                    <li key={dica} className="mt-1 flex items-start gap-2 text-sm leading-6 text-warn first:mt-0">
                      <span className="mt-1 text-xs font-bold">{index + 1}.</span>
                      <span className="min-w-0 break-words">{dica}</span>
                    </li>
                  ))}
                  {hintLevel < dicas.length && (
                    <li className="mt-2 text-xs text-muted-foreground">Tente de novo antes de abrir a próxima dica.</li>
                  )}
                </ol>
              )}

              <ul aria-live="polite" className="border-t border-border px-4 py-3">
                <li className="mb-2 text-xs font-bold uppercase text-violet">
                  Checkpoints da prática ({checkpoints.filter((cp) => cp.ok).length}/{checkpoints.length})
                </li>
                {checkpoints.map((cp) => (
                  <li key={cp.label} className="flex items-start gap-2 py-1.5 text-sm leading-6">
                    {cp.ok ? (
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-success" />
                    ) : (
                      <XCircle className="mt-1 h-4 w-4 shrink-0 text-warn" />
                    )}
                    <span className="min-w-0">
                      <span className={`block break-words ${cp.ok ? "text-success" : "text-foreground"}`}>{cp.label}</span>
                      {!cp.ok && (
                        <span className="mt-0.5 block break-words text-xs leading-5 text-muted-foreground">{cp.detail}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>



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
                    <p className="text-sm text-muted-foreground">{isReflection ? "Escreva sua decisão, justifique e diga como verificaria o resultado." : "Escreva sua solução e clique em Verificar."}</p>
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

      {/* Versão para imprimir / salvar em PDF */}
      <div className="impressao px-6 py-4">
        <h1 style={{ fontSize: "22px", fontWeight: 800 }}>{lesson}</h1>
        <p style={{ fontSize: "12px" }}>
          {course.title} • Módulo {m + 1}: {mod.title} • Codding
        </p>
        {guided && (
          <>
            <p style={{ marginTop: "10px", fontSize: "13px" }}>{guided.opening}</p>
            <h2 style={{ marginTop: "14px", fontSize: "16px", fontWeight: 700 }}>Objetivos</h2>
            <ul>
              {guided.objectives.map((o) => (
                <li key={o} style={{ fontSize: "13px" }}>{o}</li>
              ))}
            </ul>
            {guided.steps.map((step, index) => (
              <section key={step.title} style={{ marginTop: "14px" }}>
                <h2 style={{ fontSize: "15px", fontWeight: 700 }}>{index + 1}. {step.title}</h2>
                <p style={{ fontSize: "13px", whiteSpace: "pre-line" }}>{step.explanation}</p>
                {step.code && <pre style={{ fontSize: "12px" }}>{step.code}</pre>}
                {step.walkthrough?.map((w) => (
                  <p key={w.line} style={{ fontSize: "12px" }}>
                    <strong>{w.line.trim()}</strong> — {w.explanation}
                  </p>
                ))}
                {step.note && <p style={{ fontSize: "12px" }}>Dica: {step.note}</p>}
                {step.check && (
                  <p style={{ fontSize: "12px" }}>
                    Checkpoint: {step.check.question} — Resposta: {step.check.options[step.check.answer]}
                  </p>
                )}
              </section>
            ))}
            <h2 style={{ marginTop: "14px", fontSize: "16px", fontWeight: 700 }}>Prática</h2>
            {guided.challenges.map((challenge) => (
              <section key={challenge.title} style={{ marginTop: "8px" }}>
                <h3 style={{ fontSize: "13px", fontWeight: 700 }}>{challenge.title}</h3>
                <p style={{ fontSize: "12px" }}>{challenge.instruction}</p>
                <pre style={{ fontSize: "12px" }}>{challenge.starter}</pre>
                <p style={{ fontSize: "12px" }}>Dica: {challenge.hint}</p>
              </section>
            ))}
            <h2 style={{ marginTop: "14px", fontSize: "16px", fontWeight: 700 }}>Revisão</h2>
            <ul>
              {guided.recap.map((r) => (
                <li key={r} style={{ fontSize: "13px" }}>{r}</li>
              ))}
            </ul>
          </>
        )}
        <h2 style={{ marginTop: "14px", fontSize: "16px", fontWeight: 700 }}>Quiz e gabarito</h2>
        <ol>
          {content.quiz.map((q) => (
            <li key={q.q} style={{ fontSize: "13px", marginBottom: "6px" }}>
              <span>{q.q}</span>
              <br />
              <span style={{ fontSize: "12px" }}>Opções: {q.options.join(" | ")}</span>
              <br />
              <span style={{ fontSize: "12px" }}>
                <strong>Gabarito:</strong> {q.options[q.answer]} — {q.why}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>

    </div>
  );
}
