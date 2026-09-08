import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  Bug,
  Check,
  Code2,
  Flame,
  Gamepad2,
  GraduationCap,
  Layers,
  Menu,
  Play,
  RefreshCw,
  Rocket,
  Search,
  Sparkles,
  Target,
  Trophy,
  Users,
  Video,
  X,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Codding — Aprenda a programar do zero ao profissional" },
      {
        name: "description",
        content:
          "Currículo guiado, exercícios com correção automática, projetos reais e gamificação. 100% gratuito, para sempre.",
      },
      { property: "og:title", content: "Codding — Aprenda a programar de verdade" },
      {
        property: "og:description",
        content:
          "17+ cursos, 132+ exercícios, trilhas de carreira e revisão espaçada. Comece grátis agora.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const nav = [
  "Cursos",
  "Trilhas",
  "Exercícios",
  "Prática",
  "Playground",
  "Vídeos",
  "Projetos",
  "Liga",
  "Revisão",
];

const stats = [
  { icon: BookOpen, value: 17, suffix: "+", label: "Cursos" },
  { icon: Code2, value: 124, suffix: "", label: "Lições" },
  { icon: Trophy, value: 132, suffix: "+", label: "Exercícios" },
  { icon: Users, value: 500, suffix: "+", label: "Alunos" },
];

const courses = [
  {
    tag: "Popular",
    title: "HTML & CSS",
    desc: "Fundamentos da web. Aprenda a estruturar e estilizar páginas modernas.",
    lessons: "5 lições",
    time: "8h",
    level: "🌱 Iniciante",
    icon: "</>",
  },
  {
    title: "JavaScript",
    desc: "A linguagem mais popular da web. Do básico ao avançado com projetos práticos.",
    lessons: "6 lições",
    time: "15h",
    level: "🌱 Iniciante",
    icon: "JS",
  },
  {
    title: "React",
    desc: "Crie interfaces modernas com componentes reutilizáveis e state management.",
    lessons: "5 lições",
    time: "12h",
    level: "🚀 Intermediário",
    icon: "⚛",
  },
  {
    title: "TypeScript",
    desc: "JavaScript com superpoderes. Tipagem estática para código mais seguro.",
    lessons: "6 lições",
    time: "10h",
    level: "🚀 Intermediário",
    icon: "TS",
  },
];

const phases = [
  { n: "0", title: "Fase 0: Mentalidade", desc: "Perder o medo e entender lógica" },
  { n: "1", title: "Fase 1: Fundamentos", desc: "Variáveis, condicionais, loops, funções" },
  { n: "2", title: "Fase 2: Web Básico", desc: "HTML, CSS, Git & responsividade" },
  { n: "3", title: "Fase 3: JavaScript Prático", desc: "DOM, APIs, módulos, projetos" },
  { n: "4", title: "Fase 4: Java Completo", desc: "OOP, Collections, Streams" },
  { n: "5", title: "Fase 5: Backend Pro", desc: "Spring Boot, REST, SQL, JWT", soon: true },
  { n: "6", title: "Fase 6: Nível Sênior", desc: "Arquitetura, patterns, deploy", soon: true },
];

const tracks = [
  {
    time: "3-4 meses",
    title: "Frontend Developer",
    desc: "Domine a criação de interfaces modernas e responsivas",
    courses: ["HTML & CSS", "JavaScript", "React", "TypeScript"],
    skills: ["Componentização", "Responsividade", "State Management", "APIs REST"],
  },
  {
    time: "4-6 meses",
    title: "Backend Java",
    desc: "De Java básico a APIs profissionais com Spring Boot",
    courses: ["Java Básico", "Java OOP", "Java Profissional", "Spring Boot"],
    skills: ["OOP Completo", "APIs REST", "Banco de Dados", "Autenticação JWT"],
  },
  {
    time: "6-8 meses",
    title: "Fullstack JS + Java",
    desc: "Torne-se um desenvolvedor completo com as duas stacks",
    courses: ["Frontend + Backend", "Git & GitHub", "SQL", "Deploy"],
    skills: ["Desenvolvimento Completo", "Deploy", "DevOps Básico", "Projetos Reais"],
  },
];

const features = [
  {
    icon: Layers,
    title: "5 Tipos de Exercício",
    desc: "Múltipla escolha, complete o código, debugging, previsão de saída e código aberto.",
  },
  {
    icon: Brain,
    title: "Active Recall",
    desc: "Explique conceitos com suas palavras — a técnica #1 para retenção de longo prazo.",
  },
  {
    icon: Bug,
    title: "Feedback Progressivo",
    desc: "4 camadas de feedback quando erra: dica, explicação, solução parcial e completa.",
  },
  {
    icon: Gamepad2,
    title: "Gamificação Real",
    desc: "XP, streaks, desafio diário, conquistas e ranking — motivação contínua.",
  },
  {
    icon: RefreshCw,
    title: "Revisão Espaçada (SRS)",
    desc: "Sistema inteligente que ajusta os intervalos de revisão conforme sua memória.",
  },
  {
    icon: Target,
    title: "Checkpoint por Lição",
    desc: "Mini quiz obrigatório antes de concluir — garante que entendeu de verdade.",
  },
  {
    icon: Video,
    title: "Vídeos de Apoio",
    desc: "28+ vídeos do Curso em Vídeo e outros canais integrados às lições.",
  },
  {
    icon: Award,
    title: "Projetos + Certificados",
    desc: "Construa projetos reais e receba certificados ao completar cursos.",
  },
];

function useCountUp(target: number, run: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!run) return;
    let frame = 0;
    const total = 48;
    const id = setInterval(() => {
      frame += 1;
      const p = 1 - Math.pow(1 - frame / total, 3);
      setValue(Math.round(target * p));
      if (frame >= total) clearInterval(id);
    }, 18);
    return () => clearInterval(id);
  }, [target, run]);
  return value;
}

function StatCard({ item }: { item: (typeof stats)[number] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setRun(true);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const value = useCountUp(item.value, run);
  const Icon = item.icon;
  return (
    <div ref={ref} className="card-soft px-6 py-5 text-center">
      <Icon className="mx-auto h-5 w-5 text-cyan" />
      <div className="mt-2 font-display text-3xl font-extrabold text-gradient">
        {value}
        {item.suffix}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{item.label}</div>
    </div>
  );
}

function Index() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
          <a href="#top" className="flex items-center gap-2">
            <span className="bg-brand flex h-9 w-9 items-center justify-center rounded-xl font-mono text-sm font-bold text-primary-foreground">
              {"</>"}
            </span>
            <span className="font-display text-lg font-extrabold tracking-tight">Codding</span>
          </a>

          <nav className="hidden flex-1 items-center gap-1 xl:flex">
            {nav.map((n) => (
              <a
                key={n}
                href="#cursos"
                className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {n}
              </a>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-muted-foreground md:flex">
              <Search className="h-4 w-4" />
              <span>Buscar...</span>
              <kbd className="ml-6 rounded border border-border px-1.5 py-0.5 font-mono text-[10px]">
                ⌘K
              </kbd>
            </div>
            <a
              href="#cta"
              className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
            >
              Entrar
            </a>
            <a
              href="#cta"
              className="bg-brand glow rounded-xl px-4 py-2 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.03]"
            >
              Começar Grátis
            </a>
            <button
              aria-label="Abrir menu"
              onClick={() => setOpen((v) => !v)}
              className="rounded-lg border border-border p-2 xl:hidden"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {open && (
          <div className="grid grid-cols-2 gap-1 border-t border-border px-4 py-3 xl:hidden">
            {nav.map((n) => (
              <a
                key={n}
                href="#cursos"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                {n}
              </a>
            ))}
          </div>
        )}
      </header>

      {/* Hero */}
      <section id="top" className="grid-bg relative overflow-hidden">
        <div className="mx-auto max-w-5xl px-4 py-24 text-center sm:px-6 sm:py-32">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-4 py-1.5 text-sm text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-success" />
            100% Gratuito • Aprenda Programação de Verdade
          </span>

          <h1 className="mt-8 font-display text-5xl leading-[1.05] font-extrabold tracking-tight sm:text-7xl">
            Aprenda a programar
            <br />
            <span className="text-gradient">do zero ao profissional</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Currículo guiado, exercícios com correção automática, projetos reais de portfólio e
            gamificação para você aprender de verdade — não só assistir.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#cta"
              className="bg-brand glow inline-flex items-center gap-2 rounded-xl px-7 py-3.5 font-bold text-primary-foreground transition-transform hover:scale-[1.03]"
            >
              <Play className="h-4 w-4" /> Começar do Zero
            </a>
            <a
              href="#roadmap"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-7 py-3.5 font-bold transition-colors hover:border-blue hover:bg-surface-2"
            >
              <Target className="h-4 w-4" /> Descobrir Meu Nível
            </a>
          </div>

          <p className="mt-5 text-xs text-muted-foreground">
            Sem cartão de crédito • Sem pegadinhas • Para sempre gratuito
          </p>

          <div className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((s) => (
              <StatCard key={s.label} item={s} />
            ))}
          </div>
        </div>
      </section>

      {/* Cursos */}
      <section id="cursos" className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="text-sm font-semibold text-cyan">Mais Populares</span>
            <h2 className="mt-2 font-display text-4xl font-extrabold tracking-tight">
              Cursos em Destaque
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Comece sua jornada com nossos cursos mais procurados por desenvolvedores.
            </p>
          </div>
          <a
            href="#roadmap"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold transition-colors hover:border-blue hover:bg-surface"
          >
            Ver todos os cursos <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {courses.map((c) => (
            <article key={c.title} className="card-soft flex flex-col p-6">
              <div className="flex items-start justify-between">
                <span className="bg-brand flex h-11 w-11 items-center justify-center rounded-xl font-mono text-sm font-bold text-primary-foreground">
                  {c.icon}
                </span>
                {c.tag && (
                  <span className="rounded-full border border-cyan/40 px-2.5 py-1 text-[11px] font-semibold text-cyan">
                    {c.tag}
                  </span>
                )}
              </div>
              <h3 className="mt-5 font-display text-xl font-bold">{c.title}</h3>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{c.desc}</p>
              <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
                <span>
                  {c.lessons} • {c.time}
                </span>
                <span>{c.level}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Roadmap */}
      <section id="roadmap" className="border-y border-border bg-surface/40">
        <div className="mx-auto max-w-5xl px-4 py-24 sm:px-6">
          <div className="text-center">
            <span className="text-sm font-semibold text-cyan">Do zero ao profissional</span>
            <h2 className="mt-2 font-display text-4xl font-extrabold tracking-tight">
              Seu Roadmap de Programação
            </h2>
            <p className="mt-3 text-muted-foreground">
              7 fases progressivas. Cada fase tem aulas, exercícios e um projeto final.
            </p>
          </div>

          <ol className="relative mt-12 space-y-4 before:absolute before:top-4 before:bottom-4 before:left-[22px] before:w-px before:bg-border">
            {phases.map((p) => (
              <li key={p.n} className="relative flex items-center gap-5 pl-0">
                <span className="bg-brand relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-display font-extrabold text-primary-foreground">
                  {p.n}
                </span>
                <div className="card-soft flex flex-1 flex-wrap items-center justify-between gap-3 px-5 py-4">
                  <div>
                    <h3 className="font-display font-bold">{p.title}</h3>
                    <p className="text-sm text-muted-foreground">{p.desc}</p>
                  </div>
                  {p.soon && (
                    <span className="rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold text-muted-foreground">
                      Em breve
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-10 text-center">
            <a
              href="#cta"
              className="bg-brand glow inline-flex items-center gap-2 rounded-xl px-7 py-3.5 font-bold text-primary-foreground transition-transform hover:scale-[1.03]"
            >
              <Rocket className="h-4 w-4" /> Começar Minha Jornada
            </a>
          </div>
        </div>
      </section>

      {/* Trilhas */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="text-center">
          <h2 className="font-display text-4xl font-extrabold tracking-tight">
            Trilhas de Carreira
          </h2>
          <p className="mt-3 text-muted-foreground">
            Caminhos estruturados do zero ao profissional. Escolha seu objetivo e siga o roadmap.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {tracks.map((t) => (
            <article key={t.title} className="card-soft flex flex-col p-7">
              <span className="w-fit rounded-full border border-border px-3 py-1 text-[11px] font-semibold text-muted-foreground">
                {t.time}
              </span>
              <h3 className="mt-4 font-display text-2xl font-bold">{t.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t.desc}</p>

              <p className="mt-6 text-xs font-semibold tracking-wide text-cyan uppercase">Cursos</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {t.courses.map((c) => (
                  <span
                    key={c}
                    className="rounded-lg bg-secondary px-2.5 py-1 text-xs text-secondary-foreground"
                  >
                    {c}
                  </span>
                ))}
              </div>

              <p className="mt-6 text-xs font-semibold tracking-wide text-cyan uppercase">
                Habilidades
              </p>
              <ul className="mt-2 flex-1 space-y-1.5">
                {t.skills.map((s) => (
                  <li key={s} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-success" /> {s}
                  </li>
                ))}
              </ul>

              <a
                href="#cta"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-2 py-3 text-sm font-bold transition-colors hover:border-blue"
              >
                Começar Trilha <ArrowRight className="h-4 w-4" />
              </a>
            </article>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-border bg-surface/40">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-4xl font-extrabold tracking-tight">
              Por que Aprender no Codding?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Aprendizado ativo com exercícios variados, feedback inteligente e repetição espaçada —
              como Duolingo + Brilliant para programação.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="card-soft p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface-2">
                    <Icon className="h-5 w-5 text-cyan" />
                  </span>
                  <h3 className="mt-5 font-display text-lg font-bold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="grid-bg">
        <div className="mx-auto max-w-3xl px-4 py-28 text-center sm:px-6">
          <Sparkles className="mx-auto h-8 w-8 text-cyan" />
          <h2 className="mt-6 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
            Pronto para começar
            <br />
            <span className="text-gradient">sua jornada na programação?</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Milhares de pessoas já estão aprendendo no Codding. É 100% gratuito e sempre será.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <a
              href="#top"
              className="bg-brand glow inline-flex items-center gap-2 rounded-xl px-7 py-3.5 font-bold text-primary-foreground transition-transform hover:scale-[1.03]"
            >
              <Flame className="h-4 w-4" /> Começar do Zero
            </a>
            <a
              href="#roadmap"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-7 py-3.5 font-bold transition-colors hover:border-blue"
            >
              <GraduationCap className="h-4 w-4" /> Descobrir Meu Nível
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-10 text-sm text-muted-foreground sm:px-6">
          <div className="flex items-center gap-2">
            <span className="bg-brand flex h-8 w-8 items-center justify-center rounded-lg font-mono text-xs font-bold text-primary-foreground">
              {"</>"}
            </span>
            <span className="font-display font-bold text-foreground">Codding</span>
          </div>
          <p>© {new Date().getFullYear()} Codding. Aprender a programar deveria ser gratuito.</p>
        </div>
      </footer>
    </div>
  );
}
