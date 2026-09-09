import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BadgeCheck, Search, ShieldAlert } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { getCourse } from "@/data/courses";

export const Route = createFileRoute("/verificar")({
  head: () => ({
    meta: [
      { title: "Validar certificado pelo código | Codding" },
      {
        name: "description",
        content:
          "Digite o código de verificação de um certificado Codding e confira o curso, a nota e a data de aprovação do aluno.",
      },
      { property: "og:title", content: "Validar certificado do Codding" },
      { property: "og:description", content: "Confira curso, nota e data de aprovação pelo código do certificado." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: VerificarPage,
});

type Cert = {
  student_name: string;
  course_slug: string;
  score: number;
  total_questions: number;
  issued_at: string;
  code: string;
};

function VerificarPage() {
  const [codigo, setCodigo] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [cert, setCert] = useState<Cert | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function buscar() {
    const c = codigo.trim().toUpperCase();
    if (c.length < 4) {
      setErro("Digite o código completo que aparece no certificado.");
      setCert(null);
      return;
    }
    setBuscando(true);
    setErro(null);
    const { data } = await supabase
      .from("certificates")
      .select("student_name, course_slug, score, total_questions, issued_at, code")
      .eq("code", c)
      .maybeSingle();
    setBuscando(false);
    if (!data) {
      setCert(null);
      setErro("Nenhum certificado encontrado com esse código. Confira se digitou exatamente como está no documento.");
      return;
    }
    setCert(data as Cert);
  }

  const course = cert ? getCourse(cert.course_slug) : null;

  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader crumb="Validar certificado" />
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <h1 className="font-display text-3xl font-extrabold sm:text-4xl">Validar um certificado</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Todo certificado do Codding tem um código de verificação. Digite o código abaixo para conferir o nome do
          aluno, o curso, a nota da prova final e a data de aprovação.
        </p>

        <div className="card-soft mt-8 p-5">
          <label htmlFor="codigo-cert" className="block text-sm font-semibold">
            Código de verificação
          </label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <input
              id="codigo-cert"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void buscar();
              }}
              placeholder="Ex.: CODD-XXXXXX"
              className="min-h-11 w-full rounded-xl border border-border bg-surface-2 px-3 font-mono text-sm uppercase"
            />
            <button
              onClick={() => void buscar()}
              disabled={buscando}
              className="bg-brand inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl px-5 font-bold text-primary-foreground disabled:opacity-60"
            >
              <Search className="h-4 w-4" /> {buscando ? "Buscando..." : "Validar"}
            </button>
          </div>
        </div>

        <div aria-live="polite" className="mt-6">
          {erro && (
            <p className="inline-flex items-start gap-2 rounded-xl border border-warn/60 px-4 py-3 text-sm text-warn">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" /> {erro}
            </p>
          )}
          {cert && (
            <div className="card-soft border-success/50 p-6">
              <p className="inline-flex items-center gap-2 text-sm font-bold text-success">
                <BadgeCheck className="h-5 w-5" /> Certificado válido
              </p>
              <p className="mt-4 font-display text-2xl font-extrabold">{cert.student_name}</p>
              <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">Curso</dt>
                  <dd className="mt-1 font-semibold">{course?.title ?? cert.course_slug}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">Nota da prova final</dt>
                  <dd className="mt-1 font-semibold">
                    {cert.score} de {cert.total_questions} (
                    {cert.total_questions ? Math.round((cert.score / cert.total_questions) * 100) : 0}%)
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">Data de aprovação</dt>
                  <dd className="mt-1 font-semibold">{new Date(cert.issued_at).toLocaleDateString("pt-BR")}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">Código</dt>
                  <dd className="mt-1 font-mono font-semibold">{cert.code}</dd>
                </div>
              </dl>
              {course && (
                <Link
                  to="/cursos/$slug"
                  params={{ slug: course.slug }}
                  className="mt-6 inline-flex min-h-11 items-center rounded-xl border border-border px-5 text-sm font-semibold"
                >
                  Ver o curso
                </Link>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
