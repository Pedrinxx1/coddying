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
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  StickyNote,
  Target,
  Terminal,
  Type,
  WrapText,
  XCircle,
} from "lucide-react";

import { SiteHeader } from "@/components/SiteHeader";
import { countLessons, courses, getCourse } from "@/data/courses";
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
  const [ajudaAberta, setAjudaAberta] = useState(false);
  const [escala, setEscala] = useState(1);
  const [contraste, setContraste] = useState(false);
  const [quebra, setQuebra] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [busca, setBusca] = useState("");
  const [favorita, setFavorita] = useState(false);
  const [nota, setNota] = useState("");
  const [notaAberta, setNotaAberta] = useState(false);
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
    setActiveStep(0);
    setBusca("");
    setNota("");
    setNotaAberta(false);
  }, [ex]);

  const chaveFavorito = `codding:favorito:${course.slug}:${m}:${l}`;
  const chaveNota = `codding:nota:${course.slug}:${m}:${l}`;

  useEffect(() => {
    setFavorita(localStorage.getItem(chaveFavorito) === "1");
    setNota(localStorage.getItem(chaveNota) ?? "");
    if (!user) return;
    let alive = true;
    void Promise.all([
      supabase.from("lesson_favorites").select("id").eq("course_slug", course.slug).eq("module_index", m).eq("lesson_index", l).maybeSingle(),
      supabase.from("lesson_notes").select("body").eq("course_slug", course.slug).eq("module_index", m).eq("lesson_index", l).eq("section_id", "aula").maybeSingle(),
    ]).then(([favoriteResult, noteResult]) => {
      if (!alive) return;
      if (favoriteResult.data) setFavorita(true);
      if (noteResult.data?.body) setNota(noteResult.data.body);
    });
    return () => { alive = false; };
  }, [chaveFavorito, chaveNota, course.slug, m, l, user]);

  useEffect(() => {
    localStorage.setItem(chaveNota, nota);
    if (!user) return;
    const timer = window.setTimeout(() => {
      void supabase.from("lesson_notes").upsert({
        user_id: user.id,
        course_slug: course.slug,
        module_index: m,
        lesson_index: l,
        section_id: "aula",
        body: nota,
      }, { onConflict: "user_id,course_slug,module_index,lesson_index,section_id" });
    }, 700);
    return () => window.clearTimeout(timer);
  }, [chaveNota, nota, user, course.slug, m, l]);

  async function toggleFavorite() {
    const nextValue = !favorita;
    setFavorita(nextValue);
    localStorage.setItem(chaveFavorito, nextValue ? "1" : "0");
    if (!user) return;
    if (nextValue) {
      await supabase.from("lesson_favorites").upsert({ user_id: user.id, course_slug: course.slug, module_index: m, lesson_index: l }, { onConflict: "user_id,course_slug,module_index,lesson_index" });
    } else {
      await supabase.from("lesson_favorites").delete().eq("user_id", user.id).eq("course_slug", course.slug).eq("module_index", m).eq("lesson_index", l);
    }
  }

  const resultadosBusca = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    if (termo.length < 2) return [];
    return courses.flatMap((item) => item.modules.flatMap((module, moduleIndex) => module.lessons.map((title, lessonIndex) => ({ course: item, module, moduleIndex, lessonIndex, title })))).filter((item) => `${item.course.title} ${item.module.title} ${item.title}`.toLocaleLowerCase("pt-BR").includes(termo)).slice(0, 8);
  }, [busca]);

  const chaveProgresso = `codding:aula:${course.slug}:${m}:${l}`;
  const restaurado = useRef(false);
  const [salvoEm, setSalvoEm] = useState<number | null>(null);
  const [retomadoEm, setRetomadoEm] = useState<number | null>(null);
  const [anuncio, setAnuncio] = useState("");

  useEffect(() => {
    restaurado.current = false;
    const salvo = localStorage.getItem(chaveProgresso);
    if (salvo) {
      try {
        const p = JSON.parse(salvo) as {
          code?: string;
          answers?: Record<number, number>;
          guidedAnswers?: Record<number, number>;
          completed?: number[];
          challengeIndex?: number;
          secoes?: string[];
          ultima?: string;
          updatedAt?: number;
        };
        if (typeof p.code === "string" && p.code.trim()) setCode(p.code);
        if (p.answers) setAnswers(p.answers);
        if (p.guidedAnswers) setGuidedAnswers(p.guidedAnswers);
        if (Array.isArray(p.completed)) setCompletedChallenges(new Set(p.completed));
        if (typeof p.challengeIndex === "number") setChallengeIndex(p.challengeIndex);
        if (Array.isArray(p.secoes)) setSecoesVistas(p.secoes);
        if (typeof p.ultima === "string") setUltimaSecao(p.ultima);
        if (typeof p.updatedAt === "number") setRetomadoEm(p.updatedAt);
        setRetomavel(
          Boolean((p.secoes ?? []).length || (p.completed ?? []).length || Object.keys(p.answers ?? {}).length),
        );
      } catch {
        /* progresso inválido é ignorado */
      }
    }
    restaurado.current = true;
  }, [chaveProgresso]);

  const estadoAtual = useMemo(
    () => ({
      code,
      answers,
      guidedAnswers,
      completed: [...completedChallenges],
      challengeIndex,
      secoes: secoesVistas,
      ultima: ultimaSecao,
    }),
    [code, answers, guidedAnswers, completedChallenges, challengeIndex, secoesVistas, ultimaSecao],
  );
  const estadoRef = useRef(estadoAtual);
  estadoRef.current = estadoAtual;

  const salvarProgresso = useCallback(() => {
    if (!restaurado.current) return;
    const agora = Date.now();
    try {
      localStorage.setItem(chaveProgresso, JSON.stringify({ ...estadoRef.current, updatedAt: agora }));
      setSalvoEm(agora);
    } catch {
      /* armazenamento cheio ou indisponível */
    }
  }, [chaveProgresso]);

  // autosave com debounce, e gravação imediata ao sair, trocar de aba ou fechar
  useEffect(() => {
    const t = setTimeout(salvarProgresso, 600);
    return () => clearTimeout(t);
  }, [estadoAtual, salvarProgresso]);

  useEffect(() => {
    const aoSair = () => salvarProgresso();
    const aoTrocarAba = () => {
      if (document.visibilityState === "hidden") salvarProgresso();
    };
    window.addEventListener("pagehide", aoSair);
    window.addEventListener("beforeunload", aoSair);
    document.addEventListener("visibilitychange", aoTrocarAba);
    return () => {
      window.removeEventListener("pagehide", aoSair);
      window.removeEventListener("beforeunload", aoSair);
      document.removeEventListener("visibilitychange", aoTrocarAba);
      salvarProgresso();
    };
  }, [salvarProgresso]);




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
    const nome = secoesAula.find((s) => s.id === id)?.label ?? "Índice da aula";
    setAnuncio(`Seção ${nome}`);
    if (id !== "aula-indice") {
      setSecoesVistas((old) => (old.includes(id) ? old : [...old, id]));
      setUltimaSecao(id);
    }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && ajudaAberta) {
        e.preventDefault();
        setAjudaAberta(false);
        return;
      }
      if (!e.altKey || e.ctrlKey || e.metaKey) return;
      const tecla = e.key.toLowerCase();
      if (tecla === "/" || tecla === "?") {
        e.preventDefault();
        setAjudaAberta((v) => !v);
        return;
      }
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

      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7">
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

        <div className="mt-5 grid gap-4 border-b border-border pb-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-wide text-primary uppercase">Módulo {m + 1} • {mod.title}</p>
            <h1 className="mt-2 max-w-4xl font-display text-2xl leading-tight font-extrabold sm:text-3xl lg:text-4xl">{lesson}</h1>
          </div>
          <div className="nao-imprimir relative flex flex-wrap items-center gap-2">
            <div className="relative min-w-0 flex-1 lg:w-72">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Buscar aula ou conceito" aria-label="Buscar aulas" className="h-11 w-full rounded-md border border-border bg-surface pl-10 pr-3 text-sm outline-none focus:border-primary" />
              {resultadosBusca.length > 0 && (
                <div className="absolute top-12 right-0 left-0 z-40 max-h-72 overflow-auto rounded-md border border-border bg-popover p-1 shadow-xl">
                  {resultadosBusca.map((result) => (
                    <Link key={`${result.course.slug}-${result.moduleIndex}-${result.lessonIndex}`} to="/cursos/$slug/licao/$m/$l" params={{ slug: result.course.slug, m: String(result.moduleIndex), l: String(result.lessonIndex) }} onClick={() => setBusca("")} className="block rounded px-3 py-2 hover:bg-accent">
                      <span className="block text-sm font-semibold">{result.title}</span>
                      <span className="block text-xs text-muted-foreground">{result.course.title} • {result.module.title}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Button variant="outline" size="icon" className="h-11 w-11" aria-label={favorita ? "Remover aula dos favoritos" : "Favoritar aula"} aria-pressed={favorita} onClick={() => void toggleFavorite()}>
              <Star className={favorita ? "fill-primary text-primary" : ""} />
            </Button>
            <Button variant="outline" size="icon" className="h-11 w-11" aria-label="Abrir anotações" aria-expanded={notaAberta} onClick={() => setNotaAberta((value) => !value)}>
              <StickyNote />
            </Button>
          </div>
        </div>

        {notaAberta && (
          <section className="nao-imprimir mt-4 rounded-md border border-primary/40 bg-surface p-4" aria-label="Anotações pessoais">
            <div className="flex items-center justify-between gap-3"><h2 className="font-display font-bold">Minhas anotações</h2><span className="text-xs text-muted-foreground">Salvas automaticamente</span></div>
            <textarea value={nota} onChange={(event) => setNota(event.target.value)} placeholder="Registre uma dúvida, descoberta ou exemplo próprio..." className="mt-3 min-h-28 w-full resize-y rounded-md border border-border bg-background p-3 text-sm leading-6 outline-none focus:border-primary" />
          </section>
        )}

        {/* Índice clicável das seções da aula */}
        <nav id="aula-indice" aria-label="Seções da aula" className="nao-imprimir mt-4 scroll-mt-24 flex gap-1 overflow-x-auto border-b border-border pb-3">
          {secoesAula.map((item) => (
            <button
              key={item.id}
              onClick={() => irPara(item.id)}
              aria-keyshortcuts={`Alt+${item.tecla.toUpperCase()}`}
              className={`min-h-10 shrink-0 rounded-md border px-3 text-sm font-semibold ${secoesVistas.includes(item.id) ? "border-primary/60 text-primary" : "border-border text-muted-foreground"} hover:border-primary/60 hover:text-foreground`}
            >
              {secoesVistas.includes(item.id) && <CheckCircle2 className="mr-1 inline h-3.5 w-3.5" />}
               {item.label}
            </button>
          ))}
        </nav>

        <div className="nao-imprimir mt-3 flex flex-wrap gap-2">
          <Button variant="ghost" onClick={() => setAjudaAberta(true)} aria-haspopup="dialog" aria-keyshortcuts="Alt+/"><Keyboard /> Atalhos</Button>
          <Button variant="ghost" onClick={() => window.print()}><Printer /> PDF</Button>
        </div>

        {ajudaAberta && (
          <div
            className="nao-imprimir fixed inset-0 z-50 grid place-items-center bg-background/80 p-4"
            onClick={() => setAjudaAberta(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="ajuda-atalhos-titulo"
              onClick={(e) => e.stopPropagation()}
              className="card-soft max-h-[80dvh] w-full max-w-lg overflow-auto p-5"
            >
              <h2 id="ajuda-atalhos-titulo" className="inline-flex items-center gap-2 font-display text-xl font-extrabold">
                <Keyboard className="h-5 w-5 text-cyan" /> Atalhos de teclado da aula
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Use estes atalhos para navegar pela aula sem mouse. Pressione Esc para fechar.
              </p>
              <h3 className="mt-5 text-xs font-bold uppercase tracking-wide text-cyan">Índice e seções</h3>
              <ul className="mt-2 grid gap-2 text-sm text-muted-foreground">
                <li>
                  <kbd className="rounded border border-border px-1.5 py-0.5">Alt+I</kbd> voltar ao índice da aula
                </li>
                {secoesAula.map((item) => (
                  <li key={item.id}>
                    <kbd className="rounded border border-border px-1.5 py-0.5">Alt+{item.tecla.toUpperCase()}</kbd> ir
                    para {item.label.toLowerCase()}
                  </li>
                ))}
              </ul>
              <h3 className="mt-5 text-xs font-bold uppercase tracking-wide text-cyan">Próximos passos</h3>
              <ul className="mt-2 grid gap-2 text-sm text-muted-foreground">
                <li>
                  <kbd className="rounded border border-border px-1.5 py-0.5">Alt+N</kbd> próximo passo da prática ou
                  próxima lição
                </li>
                <li>
                  <kbd className="rounded border border-border px-1.5 py-0.5">Alt+B</kbd> lição anterior
                </li>
              </ul>
              <h3 className="mt-5 text-xs font-bold uppercase tracking-wide text-cyan">Começar a prática</h3>
              <ul className="mt-2 grid gap-2 text-sm text-muted-foreground">
                <li>
                  <kbd className="rounded border border-border px-1.5 py-0.5">Alt+P</kbd> ir para a prática guiada
                </li>
                <li>
                  <kbd className="rounded border border-border px-1.5 py-0.5">Alt+K</kbd> verificar sua resposta
                </li>
                <li>
                  <kbd className="rounded border border-border px-1.5 py-0.5">Alt+H</kbd> pedir a próxima dica
                </li>
              </ul>
              <h3 className="mt-5 text-xs font-bold uppercase tracking-wide text-cyan">Revisar e imprimir</h3>
              <ul className="mt-2 grid gap-2 text-sm text-muted-foreground">
                <li>
                  <kbd className="rounded border border-border px-1.5 py-0.5">Alt+R</kbd> ir para a revisão
                </li>
                <li>
                  <kbd className="rounded border border-border px-1.5 py-0.5">Alt+Q</kbd> ir para o quiz
                </li>
                <li>
                  <kbd className="rounded border border-border px-1.5 py-0.5">Alt+D</kbd> baixar PDF / imprimir a aula
                </li>
              </ul>
              <button
                autoFocus
                onClick={() => setAjudaAberta(false)}
                className="bg-brand mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl font-bold text-primary-foreground"
              >
                Fechar
              </button>
            </div>
          </div>
        )}

        <p aria-live="polite" className="sr-only">
          {anuncio}
        </p>

        {retomavel && (
          <p className="nao-imprimir mt-3 inline-flex flex-wrap items-center gap-2 rounded-xl border border-cyan/50 px-4 py-3 text-sm text-cyan">
            <Sparkles className="h-4 w-4 shrink-0" />
            <span className="min-w-0">
              Retomar de onde parei: você estava em{" "}
              <strong>{secoesAula.find((s) => s.id === ultimaSecao)?.label ?? "Explicação"}</strong>
              {retomadoEm ? ` (salvo em ${new Date(retomadoEm).toLocaleString("pt-BR")})` : ""}.
            </span>
            <button onClick={() => irPara(ultimaSecao)} className="min-h-11 font-bold underline underline-offset-4">
              Continuar
            </button>
          </p>
        )}

        <p aria-live="polite" className="nao-imprimir mt-2 text-xs text-muted-foreground">
          {salvoEm ? `Progresso salvo automaticamente às ${new Date(salvoEm).toLocaleTimeString("pt-BR")}` : ""}
        </p>


        {/* Controles de leitura */}
        <details className="nao-imprimir mt-3 rounded-md border border-border bg-surface">
          <summary className="flex min-h-11 cursor-pointer items-center gap-2 px-3 text-sm font-semibold text-muted-foreground"><Type className="h-4 w-4 text-primary" /> Opções de leitura</summary>
          <div className="flex flex-wrap items-center gap-2 border-t border-border px-3 py-3">
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
          </div>
        </details>


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
          <section className="mt-5 border-y border-border py-5">
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
                 <div className="mt-5 grid gap-2 sm:grid-cols-3" aria-label="Laboratório visual do conceito">
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

        {guided && (
          <nav className="nao-imprimir mt-5 overflow-x-auto" aria-label="Etapas da explicação">
            <ol className="flex min-w-max items-center gap-2">
              {guided.steps.map((step, index) => (
                <li key={step.title} className="flex items-center gap-2">
                  <Button variant={activeStep === index ? "default" : "outline"} onClick={() => { setActiveStep(index); irPara("aula-explicacao"); }} aria-current={activeStep === index ? "step" : undefined} className="min-h-11">
                    {guidedAnswers[index] !== undefined ? <CheckCircle2 /> : <span>{index + 1}</span>}
                    <span>{step.eyebrow}</span>
                  </Button>
                  {index < guided.steps.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(22rem,0.82fr)_minmax(32rem,1.18fr)] lg:gap-0 lg:overflow-hidden lg:rounded-md lg:border lg:border-border">
          <article
            className={`min-w-0 space-y-8 leitura lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:border-r lg:border-border lg:bg-background lg:p-6 ${contraste ? "leitura-contraste" : ""} ${quebra ? "leitura-quebra" : ""}`}
            style={{ ["--leitura-escala" as string]: escala }}
          >
            {guided ? (
              <div id="aula-explicacao" className="scroll-mt-24 space-y-10">
                {guided.steps.map((step, index) => {
                  const selected = guidedAnswers[index];
                  const answered = selected !== undefined;
                  const exemplo = Boolean(step.code) && guided.steps.findIndex((s) => s.code) === index;
                  return (

                    <section key={step.title} {...(exemplo ? { id: "aula-exemplo" } : {})} hidden={activeStep !== index} className="scroll-mt-24 overflow-hidden rounded-md border border-border bg-surface px-5 py-6 sm:px-7 sm:py-8">
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
                      <div className="nao-imprimir mt-6 flex items-center justify-between gap-3 border-t border-border pt-4">
                        <Button variant="outline" disabled={index === 0} onClick={() => setActiveStep(Math.max(0, index - 1))}><ArrowLeft /> Etapa anterior</Button>
                        <span className="text-xs font-semibold text-muted-foreground">{index + 1} de {guided.steps.length}</span>
                        <Button disabled={index === guided.steps.length - 1} onClick={() => setActiveStep(Math.min(guided.steps.length - 1, index + 1))}>Próxima etapa <ArrowRight /></Button>
                      </div>
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

          <div id="aula-pratica" className="min-w-0 scroll-mt-24 space-y-6 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:bg-surface lg:p-5">
            <div className="overflow-hidden rounded-md border border-border bg-background">
              <div className="border-b border-border px-5 py-4">
                <div className="flex items-center justify-between gap-3"><p className="text-xs font-bold uppercase text-primary">Laboratório</p><span className="text-xs text-muted-foreground">{challengeIndex + 1}/{guided?.challenges.length ?? 1}</span></div>
                <h2 className="mt-2 font-display text-base font-bold sm:text-lg">{activeChallenge?.title ?? "Exercício"}</h2>
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

            <div className="overflow-hidden rounded-md border border-border bg-background">
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
        <h1>{lesson}</h1>
        <p>
          {course.title} • Módulo {m + 1}: {mod.title} • Codding — material para estudo offline
        </p>
        <p>Aluno: ______________________________ Data: ____ / ____ / ______</p>
        {guided && (
          <>
            <p>{guided.opening}</p>
            <section>
              <h2>Objetivos da aula</h2>
              <ul>
                {guided.objectives.map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>
              <p>
                <strong>Pré-requisito:</strong> {guided.prerequisite} • <strong>Duração:</strong> {guided.duration}
              </p>
            </section>
            <h2>Explicação passo a passo</h2>
            {guided.steps.map((step, index) => (
              <section key={step.title}>
                <h3>
                  {index + 1}. {step.title}
                </h3>
                <p style={{ whiteSpace: "pre-line" }}>{step.explanation}</p>
                {step.code && <pre>{step.code}</pre>}
                {step.walkthrough && step.walkthrough.length > 0 && (
                  <table>
                    <thead>
                      <tr>
                        <th>Trecho</th>
                        <th>O que faz</th>
                      </tr>
                    </thead>
                    <tbody>
                      {step.walkthrough.map((w) => (
                        <tr key={w.line}>
                          <td>
                            <code>{w.line.trim()}</code>
                          </td>
                          <td>{w.explanation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {step.note && <p>Dica: {step.note}</p>}
                {step.check && (
                  <p>
                    Checkpoint: {step.check.question} — <strong>Resposta:</strong>{" "}
                    {step.check.options[step.check.answer]}
                  </p>
                )}
              </section>
            ))}
            <h2 className="quebra-pagina">Prática guiada</h2>
            {guided.challenges.map((challenge, index) => (
              <section key={challenge.title}>
                <h3>
                  {index + 1}. {challenge.title}
                </h3>
                <p>{challenge.instruction}</p>
                <pre>{challenge.starter}</pre>
                <p>Dica: {challenge.hint}</p>
                {challenge.expected && (
                  <p>
                    <strong>Saída esperada:</strong> {challenge.expected}
                  </p>
                )}
              </section>
            ))}
            <section>
              <h2>Revisão</h2>
              <ul>
                {guided.recap.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </section>
          </>
        )}
        <section>
          <h2>Exemplo comentado</h2>
          <pre>{content.example.code}</pre>
          <p>{content.example.explain}</p>
        </section>
        <section>
          <h2>Erros comuns</h2>
          <ul>
            {content.topic.pitfalls.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>
        <h2 className="quebra-pagina">Quiz e gabarito completo</h2>
        <ol>
          {content.quiz.map((q, i) => (
            <li key={q.q} style={{ marginBottom: "4mm" }}>
              <p>
                <strong>
                  {i + 1}. {q.q}
                </strong>
              </p>
              <ul>
                {q.options.map((opt, oi) => (
                  <li key={opt}>
                    {String.fromCharCode(97 + oi)}) {opt}
                  </li>
                ))}
              </ul>
              <p>
                <strong>Gabarito:</strong> {String.fromCharCode(97 + q.answer)}) {q.options[q.answer]} — {q.why}
              </p>
            </li>
          ))}
        </ol>
        <p className="rodape-impressao">
          Codding • {course.title} • {lesson} • Prova final e certificado em codding.lovable.app/cursos/{course.slug}
          /prova
        </p>
      </div>

    </div>

    </div>
  );
}
