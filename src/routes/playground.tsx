import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { History, Loader2, Play, RotateCcw, Save, Terminal, Trash2 } from "lucide-react";
import { listRuntimes, runCode, type RunResult } from "@/lib/run-code.functions";
import { diffLinhas, resumoDiff } from "@/lib/diff";
import { SiteHeader } from "@/components/SiteHeader";
import { useSession } from "@/hooks/useSession";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/playground")({
  validateSearch: (search: Record<string, unknown>): { snippet?: string | undefined } =>
    typeof search["snippet"] === "string" ? { snippet: search["snippet"] } : {},

  head: () => ({
    meta: [
      { title: "Playground — escreva e rode código em qualquer linguagem | Codding" },
      {
        name: "description",
        content:
          "Editor online gratuito com suporte a dezenas de linguagens e qualquer extensão de arquivo. Rode Python, Java, C++, Rust, Go, SQL e preview de HTML/CSS/JS.",
      },
      { property: "og:title", content: "Playground de código online — Codding" },
      {
        property: "og:description",
        content: "Escreva, rode e teste código em dezenas de linguagens direto no navegador.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Playground,
});

type Preset = { id: string; label: string; ext: string; piston?: string; sample: string };

const presets: Preset[] = [
  {
    id: "web",
    label: "Web (HTML/CSS/JS)",
    ext: "html",
    sample: `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <style>
      body { font-family: system-ui; background:#0b1020; color:#e6edf7;
             display:grid; place-items:center; height:100vh; margin:0 }
      button { padding:.7rem 1.2rem; border-radius:10px; border:0;
               background:#22d3ee; color:#04121a; font-weight:700; cursor:pointer }
    </style>
  </head>
  <body>
    <div style="text-align:center">
      <h1 id="t">Olá, Codding! 👋</h1>
      <button onclick="document.getElementById('t').textContent='Funciona!'">Clique</button>
    </div>
  </body>
</html>`,
  },
  {
    id: "python",
    label: "Python",
    ext: "py",
    piston: "python",
    sample: `nome = "dev"\nprint(f"Olá, {nome}! Bem-vindo ao Codding.")\n\nfor i in range(1, 6):\n    print(i, "->", i * i)\n\n# Dica: use input() e escreva o valor no campo "Entrada (stdin)".`,
  },
  {
    id: "javascript",
    label: "JavaScript (Node)",
    ext: "js",
    piston: "javascript",
    sample: `const nums = [1, 2, 3, 4, 5];\nconsole.log("Dobros:", nums.map(n => n * 2));\nconsole.log("Soma:", nums.reduce((a, b) => a + b, 0));`,
  },
  {
    id: "typescript",
    label: "TypeScript",
    ext: "ts",
    piston: "typescript",
    sample: `type Aluno = { nome: string; xp: number };\nconst alunos: Aluno[] = [{ nome: "Ana", xp: 320 }, { nome: "Léo", xp: 180 }];\nalunos.forEach(a => console.log(\`\${a.nome}: \${a.xp} XP\`));`,
  },
  {
    id: "java",
    label: "Java",
    ext: "java",
    piston: "java",
    sample: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Olá, Codding!");\n        for (int i = 1; i <= 5; i++) System.out.println(i + " -> " + i * i);\n    }\n}`,
  },
  {
    id: "c",
    label: "C",
    ext: "c",
    piston: "c",
    sample: `#include <stdio.h>\n\nint main() {\n    printf("Olá, Codding!\\n");\n    return 0;\n}`,
  },
  {
    id: "cpp",
    label: "C++",
    ext: "cpp",
    piston: "c++",
    sample: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Olá, Codding!" << endl;\n    return 0;\n}`,
  },
  {
    id: "csharp",
    label: "C#",
    ext: "cs",
    piston: "csharp",
    sample: `using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Olá, Codding!");\n    }\n}`,
  },
  {
    id: "go",
    label: "Go",
    ext: "go",
    piston: "go",
    sample: `package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Olá, Codding!")\n}`,
  },
  {
    id: "rust",
    label: "Rust",
    ext: "rs",
    piston: "rust",
    sample: `fn main() {\n    println!("Olá, Codding!");\n}`,
  },
  {
    id: "php",
    label: "PHP",
    ext: "php",
    piston: "php",
    sample: `<?php\necho "Olá, Codding!\\n";\nforeach (range(1,5) as $i) echo "$i -> " . $i*$i . "\\n";`,
  },
  {
    id: "ruby",
    label: "Ruby",
    ext: "rb",
    piston: "ruby",
    sample: `puts "Olá, Codding!"\n(1..5).each { |i| puts "#{i} -> #{i*i}" }`,
  },
  {
    id: "swift",
    label: "Swift",
    ext: "swift",
    piston: "swift",
    sample: `print("Olá, Codding!")`,
  },
  {
    id: "sqlite3",
    label: "SQL (SQLite)",
    ext: "sql",
    piston: "sql",
    sample: `CREATE TABLE alunos (nome TEXT, xp INTEGER);\nINSERT INTO alunos VALUES ('Ana', 320), ('Léo', 180);\nSELECT nome, xp FROM alunos ORDER BY xp DESC;`,
  },
  {
    id: "bash",
    label: "Bash",
    ext: "sh",
    piston: "bash",
    sample: `echo "Olá, Codding!"\nfor i in 1 2 3; do echo "linha $i"; done`,
  },
  {
    id: "lua",
    label: "Lua",
    ext: "lua",
    piston: "lua",
    sample: `print("Olá, Codding!")`,
  },
  {
    id: "haskell",
    label: "Haskell",
    ext: "hs",
    piston: "haskell",
    sample: `main :: IO ()\nmain = putStrLn "Olá, Codding!"`,
  },
  {
    id: "perl",
    label: "Perl",
    ext: "pl",
    piston: "perl",
    sample: `print "Olá, Codding!\\n";`,
  },
  {
    id: "scala",
    label: "Scala",
    ext: "scala",
    piston: "scala",
    sample: `@main def hello() = println("Olá, Codding!")`,
  },
  {
    id: "elixir",
    label: "Elixir",
    ext: "ex",
    piston: "elixir",
    sample: `IO.puts("Olá, Codding!")`,
  },
  {
    id: "r",
    label: "R",
    ext: "r",
    piston: "r",
    sample: `cat("Olá, Codding!\\n")\nprint(summary(c(1,2,3,4,5)))`,
  },
  {
    id: "kotlin",
    label: "Kotlin",
    ext: "kt",
    piston: "kotlin",
    sample: `fun main() {\n    println("Olá, Codding!")\n}`,
  },
  {
    id: "dart",
    label: "Dart",
    ext: "dart",
    piston: "dart",
    sample: `void main() {\n  print('Olá, Codding!');\n}`,
  },
];



function Playground() {
  const initial = presets[0] as Preset;


  const [preset, setPreset] = useState<Preset>(initial);
  const [code, setCode] = useState(initial.sample);
  const [filename, setFilename] = useState(`main.${initial.ext}`);
  const [stdin, setStdin] = useState("");
  const [customLang, setCustomLang] = useState("");
  const [result, setResult] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [srcDoc, setSrcDoc] = useState(initial.id === "web" ? initial.sample : "");
  const [runtimes, setRuntimes] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [versions, setVersions] = useState<CodeVersion[]>([]);
  const [comparando, setComparando] = useState<CodeVersion | null>(null);
  const { user } = useSession();
  const { snippet } = Route.useSearch();

  const run = useServerFn(runCode);
  const fetchRuntimes = useServerFn(listRuntimes);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchRuntimes()
      .then((rs) => setRuntimes(rs))
      .catch(() => undefined);
  }, [fetchRuntimes]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(VERSIONS_KEY);
      if (raw) setVersions(JSON.parse(raw) as CodeVersion[]);
    } catch {
      /* histórico indisponível */
    }
  }, []);



  useEffect(() => {
    if (!snippet || !user) return;
    void (async () => {
      const { data } = await supabase
        .from("snippets")
        .select("language, filename, code")
        .eq("id", snippet)
        .maybeSingle();
      {
        if (!data) return;
        setCode(data.code);
        setFilename(data.filename);
        const p = presets.find((x) => x.id === data.language || x.piston === data.language);
        if (p) {
          setPreset(p);
          if (p.id === "web") setSrcDoc(data.code);
        } else {
          setCustomLang(data.language);
        }
      }
    })();
  }, [snippet, user]);

  async function saveSnippet() {
    if (!user) return;
    setSaving(true);
    const language = customLang.trim() || preset.piston || preset.id;
    const { error } = await supabase.from("snippets").insert({
      user_id: user.id,
      title: filename,
      language,
      filename,
      code,
    });
    if (!error) {
      await supabase.from("achievements").insert({ user_id: user.id, code: "first_snippet" });
    }
    setSavedMsg(error ? "Não foi possível salvar." : "Código salvo no seu painel!");
    setSaving(false);
    setTimeout(() => setSavedMsg(null), 3000);
  }

  function saveVersion(motivo: string) {
    setVersions((atual) => {
      if (atual[0]?.code === code) return atual;
      const nova: CodeVersion = {
        id: `${Date.now()}`,
        ts: Date.now(),
        motivo,
        filename,
        language: customLang.trim() || preset.piston || preset.id,
        code,
      };
      const lista = [nova, ...atual].slice(0, 20);
      try {
        localStorage.setItem(VERSIONS_KEY, JSON.stringify(lista));
      } catch {
        /* armazenamento indisponível */
      }
      return lista;
    });
  }

  function restoreVersion(v: CodeVersion) {
    saveVersion("antes de restaurar");
    setCode(v.code);
    setFilename(v.filename);
    if (v.language === "web" || v.filename.endsWith(".html")) setSrcDoc(v.code);
    setSavedMsg(`Versão de ${horario(v.ts)} restaurada.`);
    setTimeout(() => setSavedMsg(null), 3000);
  }

  function removeVersion(id: string) {
    setVersions((atual) => {
      const lista = atual.filter((v) => v.id !== id);
      try {
        localStorage.setItem(VERSIONS_KEY, JSON.stringify(lista));
      } catch {
        /* armazenamento indisponível */
      }
      return lista;
    });
  }





  const isWeb = preset.id === "web" && !customLang;

  function selectPreset(id: string) {
    const p = presets.find((x) => x.id === id);
    if (!p) return;
    setPreset(p);
    setCode(p.sample);
    setFilename(`main.${p.ext}`);
    setResult(null);
    setCustomLang("");
    setSrcDoc(p.id === "web" ? p.sample : "");
  }

  async function handleRun() {
    saveVersion("execução");
    if (isWeb) {
      setSrcDoc(code);
      return;
    }
    setRunning(true);
    setResult(null);
    try {
      const language = customLang.trim() || preset.piston || preset.id;
      const res = await run({ data: { language, code, stdin } });
      setResult(res);
    } catch (e) {
      setResult({ ok: false, output: "", error: e instanceof Error ? e.message : "Erro" });
    } finally {
      setRunning(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Tab") {
      e.preventDefault();
      const el = e.currentTarget;
      const s = el.selectionStart;
      const next = code.slice(0, s) + "  " + code.slice(el.selectionEnd);
      setCode(next);
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = s + 2;
      });
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      void handleRun();
    }
  }

  const lineCount = useMemo(() => code.split("\n").length, [code]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader crumb="Playground" />


      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          Playground de <span className="text-gradient">código</span>
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Escreva e execute código em dezenas de linguagens. Escolha qualquer nome e extensão de
          arquivo — ou digite a linguagem que quiser. Atalho: Ctrl/⌘ + Enter para rodar.
        </p>
        {savedMsg && (
          <p className="mt-3 inline-flex rounded-xl border border-cyan/50 px-4 py-2 text-sm text-cyan">
            {savedMsg}
          </p>
        )}



        <div className="mt-6 flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => selectPreset(p.id)}
              className={`rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors ${
                preset.id === p.id && !customLang
                  ? "border-cyan/60 bg-surface-2 text-foreground"
                  : "border-border text-muted-foreground hover:border-blue hover:text-foreground"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            Nome do arquivo (qualquer extensão)
            <input
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className="rounded-xl border border-border bg-surface px-3 py-2 font-mono text-sm text-foreground outline-none focus:border-cyan"
              placeholder="main.py"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            Linguagem personalizada (opcional)
            <input
              value={customLang}
              onChange={(e) => setCustomLang(e.target.value)}
              list="runtimes"
              className="rounded-xl border border-border bg-surface px-3 py-2 font-mono text-sm text-foreground outline-none focus:border-cyan"
              placeholder="ex.: elixir, haskell, perl, scala..."
            />
            <datalist id="runtimes">
              {runtimes.map((r) => (
                <option key={r} value={r} />
              ))}
            </datalist>
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            Entrada (stdin)
            <input
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              className="rounded-xl border border-border bg-surface px-3 py-2 font-mono text-sm text-foreground outline-none focus:border-cyan"
              placeholder="texto enviado ao programa"
            />
          </label>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <div className="card-soft overflow-hidden p-0">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2.5">
              <span className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground">{filename}</span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => selectPreset(preset.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Resetar
                </button>
                {user ? (
                  <button
                    onClick={saveSnippet}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-60"
                  >
                    {saving ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    Salvar
                  </button>
                ) : (
                  <Link
                    to="/entrar"
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
                  >
                    Entrar p/ salvar
                  </Link>
                )}
                <button
                  onClick={handleRun}
                  disabled={running}
                  className="bg-brand inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-bold text-primary-foreground disabled:opacity-60"
                >
                  {running ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Play className="h-3.5 w-3.5" />
                  )}
                  Rodar
                </button>
              </div>
            </div>
            <div className="flex max-h-[60vh] min-h-[280px] overflow-auto bg-surface/60 sm:min-h-[380px]">
              <pre
                aria-hidden
                className="shrink-0 border-r border-border px-3 py-3 text-right font-mono text-xs leading-6 text-muted-foreground/60 select-none"
              >
                {Array.from({ length: lineCount }, (_, i) => i + 1).join("\n")}
              </pre>
              <textarea
                ref={taRef}
                value={code}
                spellCheck={false}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={onKeyDown}
                className="min-h-[280px] w-full resize-none bg-transparent px-4 py-3 font-mono text-[13px] leading-6 text-foreground outline-none sm:min-h-[380px] sm:text-sm"
              />
            </div>
          </div>

          <div className="card-soft overflow-hidden p-0">
            <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
              <Terminal className="h-4 w-4 text-cyan" />
              <span className="text-xs font-semibold">{isWeb ? "Pré-visualização" : "Saída"}</span>
            </div>
            {isWeb ? (
              <iframe
                title="Pré-visualização"
                sandbox="allow-scripts allow-modals"
                srcDoc={srcDoc}
                className="h-[60vh] min-h-[280px] w-full bg-white"
              />
            ) : (
              <div className="max-h-[60vh] min-h-[280px] overflow-auto px-4 py-3 sm:min-h-[380px]">
                {running && <p className="text-sm text-muted-foreground">Executando…</p>}
                {!running && !result && (
                  <p className="text-sm text-muted-foreground">
                    Clique em “Rodar” para executar seu código.
                  </p>
                )}
                {result?.error && (
                  <pre className="font-mono text-sm whitespace-pre-wrap text-destructive">
                    {result.error}
                  </pre>
                )}
                {result && !result.error && (
                  <>
                    <pre className="font-mono text-sm whitespace-pre-wrap text-foreground">
                      {result.output}
                    </pre>
                    {result.stderr && (
                      <pre className="mt-3 font-mono text-sm whitespace-pre-wrap text-destructive">
                        {result.stderr}
                      </pre>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <section className="card-soft mt-8 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 shrink-0 text-cyan" />
              <h2 className="font-display text-base font-bold sm:text-lg">Histórico e versões</h2>
            </div>
            <button
              onClick={() => saveVersion("manual")}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              Guardar versão atual
            </button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Guardamos as 20 últimas versões deste navegador automaticamente a cada execução. Dá para comparar com o
            código atual antes de reverter.
          </p>

          {versions.length === 0 ? (
            <p className="mt-5 text-sm text-muted-foreground">
              Nenhuma versão ainda — rode o código uma vez para começar o histórico.
            </p>
          ) : (
            <ul className="mt-5 space-y-2">
              {versions.map((v, i) => (
                <li key={v.id} className="rounded-xl border border-border px-4 py-3">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-mono text-xs text-foreground">
                        #{versions.length - i} · {v.filename}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {horario(v.ts)} • {v.language} • {v.motivo} • {v.code.split("\n").length} linhas
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        onClick={() => setComparando(comparando?.id === v.id ? null : v)}
                        className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
                      >
                        {comparando?.id === v.id ? "Fechar" : "Comparar"}
                      </button>
                      <button
                        onClick={() => restoreVersion(v)}
                        className="rounded-lg border border-cyan/50 px-3 py-1.5 text-xs font-semibold text-cyan"
                      >
                        Reverter
                      </button>
                      <button
                        onClick={() => {
                          if (comparando?.id === v.id) setComparando(null);
                          removeVersion(v.id);
                        }}
                        aria-label="Apagar versão"
                        className="rounded-lg border border-border p-1.5 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {comparando?.id === v.id && <Comparacao versao={v} atual={code} aoReverter={() => restoreVersion(v)} />}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

function Comparacao({
  versao,
  atual,
  aoReverter,
}: {
  versao: CodeVersion;
  atual: string;
  aoReverter: () => void;
}) {
  const linhas = useMemo(() => diffLinhas(versao.code, atual), [versao.code, atual]);
  const { adicionadas, removidas } = useMemo(() => resumoDiff(linhas), [linhas]);

  return (
    <div className="mt-3 border-t border-border pt-3">
      <p className="text-xs text-muted-foreground">
        Comparando a versão de {horario(versao.ts)} com o que está no editor agora:{" "}
        <span className="text-success">+{adicionadas}</span> /{" "}
        <span className="text-destructive">-{removidas}</span> linhas.
      </p>
      {adicionadas + removidas === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">Nada mudou — o código é idêntico.</p>
      ) : (
        <pre className="mt-2 max-h-72 overflow-auto rounded-lg bg-surface/60 p-3 font-mono text-[12px] leading-5">
          {linhas.map((ln, i) => (
            <div
              key={i}
              className={
                ln.tipo === "add"
                  ? "text-success"
                  : ln.tipo === "del"
                    ? "text-destructive"
                    : "text-muted-foreground"
              }
            >
              {ln.tipo === "add" ? "+ " : ln.tipo === "del" ? "- " : "  "}
              {ln.texto || " "}
            </div>
          ))}
        </pre>
      )}
      <button
        onClick={aoReverter}
        className="bg-brand mt-3 rounded-lg px-3 py-1.5 text-xs font-bold text-primary-foreground"
      >
        Reverter para esta versão
      </button>
    </div>
  );
}

type CodeVersion = {
  id: string;
  ts: number;
  motivo: string;
  filename: string;
  language: string;
  code: string;
};

const VERSIONS_KEY = "codding:playground:versions";

function horario(ts: number) {
  return new Date(ts).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

