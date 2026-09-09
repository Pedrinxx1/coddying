import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

/** Regra de novas tentativas: até 3 envios da prova a cada 24 horas. */
export const MAX_TENTATIVAS = 3;
export const JANELA_MS = 24 * 60 * 60 * 1000;
import { Award, CheckCircle2, FileCheck2, Rocket, XCircle } from "lucide-react";
import { getCourse } from "@/data/courses";
import { EXAM_SIZE, PASS_RATE, certificateCode, finalExam, finalProject } from "@/data/finalAssessments";
import { SiteHeader } from "@/components/SiteHeader";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/cursos/$slug_/prova")({
  loader: ({ params }) => {
    const course = getCourse(params.slug);
    if (!course) throw notFound();
    return { course };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Prova não encontrada | Codding" }] };
    const c = loaderData.course;
    const title = `Prova final e projeto de ${c.title} | Codding`;
    const description = `Faça a prova final de ${c.title}, entregue o projeto final e receba seu certificado do Codding.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ExamPage,
});

function ExamPage() {
  const { course } = Route.useLoaderData();
  const { user } = useSession();
  const navigate = useNavigate();
  const exam = useMemo(() => finalExam(course), [course]);
  const project = useMemo(() => finalProject(course), [course]);

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [projectUrl, setProjectUrl] = useState("");
  const [projectNotes, setProjectNotes] = useState("");
  const [nome, setNome] = useState("");
  const [result, setResult] = useState<{ acertos: number; aprovado: boolean } | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [tentativas, setTentativas] = useState<{ created_at: string; passed: boolean }[]>([]);
  const [jaAprovado, setJaAprovado] = useState(false);

  useEffect(() => {
    if (!user) {
      setTentativas([]);
      setJaAprovado(false);
      return;
    }
    void (async () => {
      const [{ data: att }, { data: cert }] = await Promise.all([
        supabase
          .from("exam_attempts")
          .select("created_at, passed")
          .eq("course_slug", course.slug)
          .order("created_at", { ascending: false })
          .limit(30),
        supabase.from("certificates").select("code").eq("course_slug", course.slug).maybeSingle(),
      ]);
      setTentativas(att ?? []);
      setJaAprovado(Boolean(cert));
    })();
  }, [user, course.slug]);

  const respondidas = Object.keys(answers).length;
  const requisitosOk = project.requirements.every((_, i) => checked[i]);
  const projetoOk = projectUrl.trim().length > 5 && projectNotes.trim().length > 30 && requisitosOk;
  const minimo = Math.ceil(exam.length * PASS_RATE);

  const recentes = tentativas.filter((t) => Date.now() - new Date(t.created_at).getTime() < JANELA_MS);
  const restantes = Math.max(0, MAX_TENTATIVAS - recentes.length);
  const maisAntigaRecente = recentes[recentes.length - 1];
  const liberaEm = maisAntigaRecente ? new Date(new Date(maisAntigaRecente.created_at).getTime() + JANELA_MS) : null;
  const bloqueado = !jaAprovado && Boolean(user) && restantes === 0;

  async function enviar() {
    if (bloqueado) {
      setAviso(
        `Você usou as ${MAX_TENTATIVAS} tentativas permitidas em 24 horas. Você poderá refazer a prova a partir de ${liberaEm?.toLocaleString("pt-BR")}.`,
      );
      return;
    }
    if (respondidas < exam.length) {
      setAviso(`Responda todas as ${exam.length} questões antes de enviar.`);
      return;
    }
    const acertos = exam.reduce((n, q, i) => n + (answers[i] === q.answer ? 1 : 0), 0);
    const aprovado = acertos >= minimo && projetoOk;
    setResult({ acertos, aprovado });
    if (user) {
      const agora = new Date().toISOString();
      await supabase.from("exam_attempts").insert({
        user_id: user.id,
        course_slug: course.slug,
        score: acertos,
        total_questions: exam.length,
        passed: aprovado,
      });
      setTentativas((t) => [{ created_at: agora, passed: aprovado }, ...t]);
    }
    const sobraram = Math.max(0, restantes - 1);
    setAviso(
      aprovado
        ? null
        : acertos < minimo
          ? `Você acertou ${acertos} de ${exam.length}. São necessários ${minimo} acertos. Revise as questões erradas abaixo${
              user
                ? sobraram > 0
                  ? ` e tente de novo — restam ${sobraram} tentativa(s) hoje.`
                  : `. Você atingiu o limite de ${MAX_TENTATIVAS} tentativas em 24 horas e poderá repetir a partir de ${new Date(Date.now() + JANELA_MS).toLocaleString("pt-BR")}.`
                : " e tente de novo."
            }`
          : "Prova aprovada, mas falta completar a entrega do projeto final (link, descrição e checklist).",
    );
    if (!aprovado) {
      toast.error(acertos < minimo ? "Prova não aprovada ainda" : "Falta a entrega do projeto final", {
        description:
          acertos < minimo
            ? `Você acertou ${acertos} de ${exam.length}. O mínimo é ${minimo}.`
            : "Preencha o link, a descrição e marque todos os itens do checklist.",
      });
      return;
    }
    if (!user) {
      toast.info("Boa! Entre na sua conta para emitir o certificado.");
      return;
    }
    setSalvando(true);
    const { error } = await supabase.from("certificates").upsert(
      {
        user_id: user.id,
        course_slug: course.slug,
        student_name: nome.trim() || user.email || "Aluno Codding",
        score: acertos,
        total_questions: exam.length,
        project_url: projectUrl.trim(),
        project_notes: projectNotes.trim(),
        code: certificateCode(course.slug, user.id),
      },
      { onConflict: "user_id,course_slug" },
    );
    setSalvando(false);
    if (error) {
      setAviso("Não conseguimos emitir o certificado agora. Tente novamente em instantes.");
      toast.error("Não conseguimos emitir o certificado agora.");
      return;
    }
    setJaAprovado(true);
    toast.success("Certificado disponível!", {
      description: `Você foi aprovado em ${course.title} com ${acertos} de ${exam.length} e o projeto final foi entregue. Já dá para imprimir ou salvar em PDF.`,
      duration: 8000,
    });
    void navigate({ to: "/cursos/$slug/certificado", params: { slug: course.slug } });
  }

  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader crumb="Prova final" />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Link to="/cursos/$slug" params={{ slug: course.slug }} className="text-sm font-semibold text-cyan">
          ← Voltar para {course.title}
        </Link>
        <h1 className="mt-4 font-display text-3xl font-extrabold sm:text-4xl">
          Prova final e projeto de {course.title}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {exam.length} questões tiradas do conteúdo do curso e um projeto final. Acerte pelo menos {minimo} e entregue o
          projeto para receber o certificado.
        </p>

        {!user && (
          <p className="mt-6 rounded-xl border border-warn/50 px-4 py-3 text-sm text-warn">
            Você pode treinar sem estar logado, mas o certificado só é emitido para alunos com conta.{" "}
            <Link to="/entrar" className="font-bold underline underline-offset-4">
              Entrar
            </Link>
          </p>
        )}

        {user && (
          <p
            aria-live="polite"
            className={`mt-6 rounded-xl border px-4 py-3 text-sm leading-6 ${
              bloqueado ? "border-warn/60 text-warn" : "border-border text-muted-foreground"
            }`}
          >
            {jaAprovado
              ? "Você já foi aprovado neste curso. Pode refazer a prova quando quiser para melhorar a nota — o certificado é atualizado."
              : bloqueado
                ? `Limite de tentativas atingido: ${MAX_TENTATIVAS} envios a cada 24 horas. Você pode tentar de novo a partir de ${liberaEm?.toLocaleString("pt-BR")}.`
                : `Você tem ${restantes} de ${MAX_TENTATIVAS} tentativas disponíveis nas próximas 24 horas.${
                    recentes.length
                      ? ` Última tentativa: ${new Date(recentes[0]!.created_at).toLocaleString("pt-BR")}.`
                      : ""
                  }`}
          </p>
        )}

        <section aria-labelledby="prova-titulo" className="mt-10">
          <h2 id="prova-titulo" className="font-display text-2xl font-extrabold">
            1. Prova final
          </h2>
          <p aria-live="polite" className="mt-1 text-sm text-muted-foreground">
            {respondidas} de {exam.length} questões respondidas
          </p>
          <ol className="mt-6 space-y-6">
            {exam.map((q, i) => {
              const escolha = answers[i];
              const mostrar = result !== null;
              return (
                <li key={q.q} className="card-soft p-4 sm:p-5">
                  <p className="font-display font-bold leading-snug">
                    {i + 1}. {q.q}
                  </p>
                  <div role="radiogroup" aria-label={`Questão ${i + 1}`} className="mt-3 grid gap-2">
                    {q.options.map((opt, oi) => (
                      <button
                        key={opt}
                        role="radio"
                        aria-checked={escolha === oi}
                        disabled={mostrar}
                        onClick={() => setAnswers((a) => ({ ...a, [i]: oi }))}
                        className={`min-h-11 rounded-xl border px-4 py-2.5 text-left text-sm leading-6 ${
                          mostrar && oi === q.answer
                            ? "border-success text-success"
                            : escolha === oi
                              ? "border-cyan text-foreground"
                              : "border-border text-muted-foreground hover:border-cyan/60"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  {mostrar && (
                    <p
                      aria-live="polite"
                      className={`mt-3 rounded-xl border px-3 py-2 text-xs leading-5 ${
                        escolha === q.answer ? "border-success/50 text-success" : "border-warn/50 text-warn"
                      }`}
                    >
                      {escolha === q.answer ? "Você acertou. " : `Correto: ${q.options[q.answer]}. `}
                      <span className="text-muted-foreground">{q.why}</span>
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
        </section>

        <section aria-labelledby="projeto-titulo" className="mt-12">
          <h2 id="projeto-titulo" className="font-display text-2xl font-extrabold">
            2. Projeto final
          </h2>
          <div className="card-soft mt-4 p-5">
            <p className="inline-flex items-center gap-2 font-display font-bold">
              <Rocket className="h-4 w-4 text-cyan" /> {project.title}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{project.brief}</p>
            <ul className="mt-4 space-y-2">
              {project.requirements.map((r, i) => (
                <li key={r}>
                  <label className="flex min-h-11 cursor-pointer items-start gap-3 text-sm leading-6">
                    <input
                      type="checkbox"
                      checked={Boolean(checked[i])}
                      onChange={(e) => setChecked((c) => ({ ...c, [i]: e.target.checked }))}
                      className="mt-1.5 h-4 w-4 shrink-0"
                    />
                    <span className="min-w-0 break-words">{r}</span>
                  </label>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">Entrega esperada: {project.deliverable}</p>

            <label htmlFor="projeto-link" className="mt-5 block text-sm font-semibold">
              Link do projeto
            </label>
            <input
              id="projeto-link"
              value={projectUrl}
              onChange={(e) => setProjectUrl(e.target.value)}
              placeholder="https://..."
              className="mt-2 min-h-11 w-full rounded-xl border border-border bg-surface-2 px-3 text-sm"
            />
            <label htmlFor="projeto-desc" className="mt-4 block text-sm font-semibold">
              O que você construiu e como (mínimo 30 caracteres)
            </label>
            <textarea
              id="projeto-desc"
              value={projectNotes}
              onChange={(e) => setProjectNotes(e.target.value)}
              rows={4}
              className="mt-2 w-full rounded-xl border border-border bg-surface-2 p-3 text-sm leading-6"
            />
            <label htmlFor="nome-certificado" className="mt-4 block text-sm font-semibold">
              Nome que deve aparecer no certificado
            </label>
            <input
              id="nome-certificado"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome completo"
              className="mt-2 min-h-11 w-full rounded-xl border border-border bg-surface-2 px-3 text-sm"
            />
            <p aria-live="polite" className="mt-3 inline-flex items-center gap-2 text-xs">
              {projetoOk ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span className="text-success">Entrega completa</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-warn" />
                  <span className="text-warn">Marque todos os requisitos e preencha link e descrição</span>
                </>
              )}
            </p>
          </div>
        </section>

        <div aria-live="polite" className="mt-8">
          {result && (
            <p
              className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
                result.aprovado ? "border-success/60 text-success" : "border-warn/60 text-warn"
              }`}
            >
              {result.aprovado
                ? `Aprovado com ${result.acertos} de ${exam.length}! Emitindo seu certificado...`
                : aviso}
            </p>
          )}
          {!result && aviso && (
            <p className="rounded-xl border border-warn/60 px-4 py-3 text-sm font-semibold text-warn">{aviso}</p>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => void enviar()}
            disabled={salvando}
            className="bg-brand inline-flex min-h-11 items-center gap-2 rounded-xl px-5 font-bold text-primary-foreground disabled:opacity-60"
          >
            <FileCheck2 className="h-4 w-4" /> {salvando ? "Emitindo..." : "Enviar prova e projeto"}
          </button>
          {result && (
            <button
              onClick={() => {
                setResult(null);
                setAnswers({});
                setAviso(null);
              }}
              className="inline-flex min-h-11 items-center rounded-xl border border-border px-5 font-semibold"
            >
              Refazer a prova
            </button>
          )}
          <Link
            to="/cursos/$slug/certificado"
            params={{ slug: course.slug }}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-5 font-semibold"
          >
            <Award className="h-4 w-4 text-cyan" /> Meu certificado
          </Link>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Nota mínima: {minimo} de {exam.length} ({Math.round(PASS_RATE * 100)}%). A prova sorteia até {EXAM_SIZE}{" "}
          questões do conteúdo do curso.
        </p>
      </main>
    </div>
  );
}
