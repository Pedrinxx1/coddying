import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Award, Printer } from "lucide-react";
import { getCourse } from "@/data/courses";
import { SiteHeader } from "@/components/SiteHeader";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/cursos/$slug_/certificado")({
  loader: ({ params }) => {
    const course = getCourse(params.slug);
    if (!course) throw notFound();
    return { course };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Certificado | Codding" }] };
    const c = loaderData.course;
    const title = `Certificado de ${c.title} | Codding`;
    const description = `Certificado de conclusão do curso de ${c.title}, com prova final e projeto final avaliados.`;
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
  component: CertificatePage,
});

type Cert = {
  student_name: string;
  score: number;
  total_questions: number;
  project_url: string | null;
  project_notes: string | null;
  code: string;
  issued_at: string;
};

function CertificatePage() {
  const { course } = Route.useLoaderData();
  const { user, loading } = useSession();
  const [cert, setCert] = useState<Cert | null>(null);
  const [buscando, setBuscando] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setBuscando(false);
      return;
    }
    void (async () => {
      const { data } = await supabase
        .from("certificates")
        .select("student_name, score, total_questions, project_url, project_notes, code, issued_at")
        .eq("course_slug", course.slug)
        .eq("user_id", user.id)
        .maybeSingle();
      setCert(data as Cert | null);
      setBuscando(false);
    })();
  }, [user, loading, course.slug]);

  return (
    <div className="min-h-dvh bg-background">
      <div className="nao-imprimir">
        <SiteHeader crumb="Certificado" />
      </div>
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {buscando ? (
          <p className="text-muted-foreground">Carregando certificado...</p>
        ) : !cert ? (
          <div className="card-soft p-6">
            <h1 className="font-display text-2xl font-extrabold">Certificado ainda não emitido</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {user
                ? `Para receber o certificado de ${course.title}, faça a prova final (acertando pelo menos 70%) e entregue o projeto final.`
                : "Entre na sua conta para ver ou emitir seu certificado."}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/cursos/$slug/prova"
                params={{ slug: course.slug }}
                className="bg-brand inline-flex min-h-11 items-center rounded-xl px-5 font-bold text-primary-foreground"
              >
                Ir para a prova final
              </Link>
              {!user && (
                <Link to="/entrar" className="inline-flex min-h-11 items-center rounded-xl border border-border px-5 font-semibold">
                  Entrar
                </Link>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="certificado rounded-2xl border-2 border-cyan/60 bg-surface p-6 text-center sm:p-10">
              <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-cyan">
                <Award className="h-4 w-4" /> Codding
              </p>
              <h1 className="mt-6 font-display text-3xl font-extrabold sm:text-4xl">Certificado de conclusão</h1>
              <p className="mt-6 text-sm uppercase tracking-wide text-muted-foreground">Concedido a</p>
              <p className="mt-2 break-words font-display text-2xl font-extrabold text-cyan sm:text-3xl">
                {cert.student_name}
              </p>
              <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-muted-foreground">
                por concluir o curso de <strong className="text-foreground">{course.title}</strong> ({course.level},{" "}
                {course.hours}), aprovado na prova final com {cert.score} de {cert.total_questions} acertos e com o
                projeto final entregue e avaliado.
              </p>
              <div className="mt-8 grid gap-3 text-xs text-muted-foreground sm:grid-cols-3">
                <p>
                  Emitido em
                  <br />
                  <span className="text-foreground">
                    {new Date(cert.issued_at).toLocaleDateString("pt-BR")}
                  </span>
                </p>
                <p>
                  Código de verificação
                  <br />
                  <span className="font-mono text-foreground">{cert.code}</span>
                </p>
                <p>
                  Projeto
                  <br />
                  <span className="break-all text-foreground">{cert.project_url || "—"}</span>
                </p>
              </div>
            </div>
            <div className="nao-imprimir mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => window.print()}
                className="bg-brand inline-flex min-h-11 items-center gap-2 rounded-xl px-5 font-bold text-primary-foreground"
              >
                <Printer className="h-4 w-4" /> Baixar PDF / imprimir
              </button>
              <Link
                to="/cursos/$slug"
                params={{ slug: course.slug }}
                className="inline-flex min-h-11 items-center rounded-xl border border-border px-5 font-semibold"
              >
                Voltar ao curso
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
