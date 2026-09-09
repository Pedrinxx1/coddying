import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Award, Code2, Flame, Loader2, Save, Trash2, Trophy, Zap } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { countLessons, courses, levelEmoji } from "@/data/courses";

export const Route = createFileRoute("/_authenticated/painel")({
  head: () => ({
    meta: [
      { title: "Meu painel — progresso, conquistas e códigos | Codding" },
      {
        name: "description",
        content: "Acompanhe seu progresso nos cursos, XP, sequência de dias, conquistas e códigos salvos.",
      },
      { property: "og:title", content: "Meu painel no Codding" },
      { property: "og:description", content: "Seu progresso de aprendizado em um só lugar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Painel,
});

type Progress = { course_slug: string; module_index: number; lesson_index: number };
type Snippet = {
  id: string;
  title: string;
  language: string;
  filename: string;
  code: string;
  updated_at: string;
};
type Profile = { display_name: string | null; avatar_url: string | null; xp: number; streak: number };

export const ACHIEVEMENTS: Record<string, { label: string; desc: string }> = {
  first_lesson: { label: "Primeiro passo", desc: "Concluiu a primeira lição" },
  ten_lessons: { label: "Pegando ritmo", desc: "Concluiu 10 lições" },
  fifty_lessons: { label: "Maratonista", desc: "Concluiu 50 lições" },
  first_course: { label: "Curso completo", desc: "Terminou um curso inteiro" },
  first_snippet: { label: "Explorador", desc: "Salvou um código no playground" },
  streak_3: { label: "Constância", desc: "3 dias seguidos estudando" },
};

type Attempt = { course_slug: string; score: number; total_questions: number; passed: boolean; created_at: string };
type Certificate = {
  course_slug: string;
  score: number;
  total_questions: number;
  project_url: string | null;
  code: string;
  issued_at: string;
};

function Painel() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [earned, setEarned] = useState<string[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id;
      if (!uid) return;
      const [p, pr, sn, ac, at, ce] = await Promise.all([
        supabase.from("profiles").select("display_name, avatar_url, xp, streak").eq("id", uid).maybeSingle(),
        supabase.from("lesson_progress").select("course_slug, module_index, lesson_index"),
        supabase.from("snippets").select("id, title, language, filename, code, updated_at").order("updated_at", { ascending: false }),
        supabase.from("achievements").select("code"),
        supabase
          .from("exam_attempts")
          .select("course_slug, score, total_questions, passed, created_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("certificates")
          .select("course_slug, score, total_questions, project_url, code, issued_at"),
      ]);
      setAttempts(at.data ?? []);
      setCerts((ce.data ?? []) as Certificate[]);
      setProfile(p.data ?? { display_name: null, avatar_url: null, xp: 0, streak: 0 });
      setName(p.data?.display_name ?? "");
      setAvatar(p.data?.avatar_url ?? "");
      setProgress(pr.data ?? []);
      setSnippets(sn.data ?? []);
      setEarned((ac.data ?? []).map((a) => a.code));
      setLoading(false);
    })();
  }, []);

  const byCourse = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of progress) map.set(p.course_slug, (map.get(p.course_slug) ?? 0) + 1);
    return map;
  }, [progress]);

  const feitas = useMemo(
    () => new Set(progress.map((p) => `${p.course_slug}-${p.module_index}-${p.lesson_index}`)),
    [progress],
  );

  /** Primeira lição ainda não concluída de um curso. */
  function proximaLicao(slug: string) {
    const c = courses.find((x) => x.slug === slug);
    if (!c) return null;
    for (let i = 0; i < c.modules.length; i++) {
      const mod = c.modules[i];
      if (!mod) continue;
      for (let j = 0; j < mod.lessons.length; j++) {
        if (!feitas.has(`${slug}-${i}-${j}`)) return { m: i, l: j, titulo: mod.lessons[j] ?? "" };
      }
    }
    return null;
  }

  const started = courses
    .filter((c) => byCourse.has(c.slug))
    .sort((a, b) => (byCourse.get(b.slug) ?? 0) - (byCourse.get(a.slug) ?? 0));

  async function saveProfile() {
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    if (u.user) {
      await supabase
        .from("profiles")
        .upsert({ id: u.user.id, display_name: name || null, avatar_url: avatar || null });
      setProfile((p) => (p ? { ...p, display_name: name, avatar_url: avatar } : p));
    }
    setSaving(false);
  }

  async function removeSnippet(id: string) {
    await supabase.from("snippets").delete().eq("id", id);
    setSnippets((s) => s.filter((x) => x.id !== id));
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader crumb="Painel" />
        <div className="grid min-h-[60vh] place-items-center">
          <Loader2 className="h-6 w-6 animate-spin text-cyan" />
        </div>
      </div>
    );
  }

  const totalDone = progress.length;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader crumb="Painel" />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-center gap-4">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="Sua foto de perfil"
              className="h-16 w-16 rounded-2xl border border-border object-cover"
            />
          ) : (
            <span className="bg-brand grid h-16 w-16 place-items-center rounded-2xl font-display text-2xl font-extrabold text-primary-foreground">
              {(profile?.display_name ?? "A").charAt(0).toUpperCase()}
            </span>
          )}
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight">
              Olá, {profile?.display_name ?? "aluno"} 👋
            </h1>
            <p className="text-sm text-muted-foreground">Continue de onde parou.</p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat icon={<Zap className="h-4 w-4 text-cyan" />} label="XP total" value={profile?.xp ?? 0} />
          <Stat icon={<Flame className="h-4 w-4 text-warn" />} label="Sequência" value={`${profile?.streak ?? 0} ${(profile?.streak ?? 0) === 1 ? "dia" : "dias"}`} />
          <Stat icon={<Trophy className="h-4 w-4 text-success" />} label="Lições concluídas" value={totalDone} />
          <Stat icon={<Code2 className="h-4 w-4 text-violet" />} label="Códigos salvos" value={snippets.length} />
        </div>

        <section className="mt-12">
          <h2 className="font-display text-2xl font-extrabold">Seus cursos</h2>
          {started.length === 0 ? (
            <div className="card-soft mt-4 p-8 text-center">
              <p className="text-muted-foreground">Você ainda não começou nenhum curso.</p>
              <Link
                to="/cursos"
                className="bg-brand mt-5 inline-flex rounded-xl px-5 py-2.5 text-sm font-bold text-primary-foreground"
              >
                Escolher um curso
              </Link>
            </div>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {started.map((c) => {
                const done = byCourse.get(c.slug) ?? 0;
                const total = countLessons(c);
                const pct = Math.round((done / total) * 100);
                const prox = proximaLicao(c.slug);
                return (
                  <div key={c.slug} className="card-soft p-5">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                      <Link
                        to="/cursos/$slug"
                        params={{ slug: c.slug }}
                        className="truncate font-display font-bold hover:text-cyan"
                      >
                        {c.title}
                      </Link>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {levelEmoji[c.level]} {c.level}
                      </span>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-2">
                      <div className="bg-brand h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {done} de {total} lições • {pct}%
                    </p>
                    {prox ? (
                      <Link
                        to="/cursos/$slug/licao/$m/$l"
                        params={{ slug: c.slug, m: String(prox.m), l: String(prox.l) }}
                        className="mt-4 inline-flex max-w-full items-center gap-2 rounded-xl border border-cyan/50 px-3 py-2 text-xs font-bold text-cyan"
                      >
                        <span className="truncate">Continuar: {prox.titulo}</span>
                      </Link>
                    ) : (
                      <p className="mt-4 inline-flex rounded-xl border border-success/50 px-3 py-2 text-xs font-bold text-success">
                        Curso concluído 🎉
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-12">
          <h2 className="font-display text-2xl font-extrabold">Conquistas</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(ACHIEVEMENTS).map(([code, a]) => {
              const has = earned.includes(code);
              return (
                <div
                  key={code}
                  className={`flex items-center gap-3 rounded-xl border p-4 ${
                    has ? "border-cyan/50 bg-surface" : "border-border opacity-50"
                  }`}
                >
                  <Award className={`h-5 w-5 ${has ? "text-cyan" : "text-muted-foreground"}`} />
                  <div>
                    <p className="text-sm font-bold">{a.label}</p>
                    <p className="text-xs text-muted-foreground">{a.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-12 grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-extrabold">Códigos salvos</h2>
            {snippets.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Nenhum código salvo ainda. Vá ao{" "}
                <Link to="/playground" className="font-semibold text-cyan">
                  playground
                </Link>{" "}
                e clique em Salvar.
              </p>
            ) : (
              <ul className="mt-5 space-y-3">
                {snippets.map((s) => (
                  <li key={s.id} className="card-soft flex items-center gap-3 p-4">
                    <Code2 className="h-4 w-4 shrink-0 text-cyan" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{s.title}</p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {s.filename} • {s.language}
                      </p>
                    </div>
                    <Link
                      to="/playground"
                      search={{ snippet: s.id }}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold"
                    >
                      Abrir
                    </Link>
                    <button
                      onClick={() => removeSnippet(s.id)}
                      aria-label="Excluir código"
                      className="rounded-lg border border-border p-1.5 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h2 className="font-display text-2xl font-extrabold">Seu perfil</h2>
            <div className="card-soft mt-5 space-y-3 p-5">
              <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                Nome de exibição
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-cyan"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                Link da foto (URL)
                <input
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://..."
                  className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-cyan"
                />
              </label>
              <button
                onClick={saveProfile}
                disabled={saving}
                className="bg-brand inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Salvar perfil
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="card-soft p-5">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon} {label}
      </div>
      <p className="mt-2 font-display text-2xl font-extrabold">{value}</p>
    </div>
  );
}
