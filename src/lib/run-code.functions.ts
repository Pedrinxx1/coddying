import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const JUDGE0 = "https://ce.judge0.com";

const schema = z.object({
  language: z.string().min(1),
  code: z.string(),
  stdin: z.string().optional(),
});

export type RunResult = {
  ok: boolean;
  output: string;
  stderr?: string;
  error?: string;
  status?: string;
  time?: string | null;
};

type Lang = { id: number; name: string };

let cache: { at: number; list: Lang[] } | null = null;

async function getLanguages(): Promise<Lang[]> {
  if (cache && Date.now() - cache.at < 30 * 60 * 1000) return cache.list;
  const res = await fetch(`${JUDGE0}/languages`);
  if (!res.ok) return [];
  const list = (await res.json()) as Lang[];
  cache = { at: Date.now(), list };
  return list;
}

const aliases: Record<string, string> = {
  js: "javascript",
  node: "javascript",
  "node.js": "javascript",
  ts: "typescript",
  py: "python",
  py3: "python",
  python3: "python",
  cpp: "c++",
  "c#": "c#",
  cs: "c#",
  csharp: "c#",
  sh: "bash",
  shell: "bash",
  golang: "go",
  sqlite: "sql",
  sqlite3: "sql",
  kt: "kotlin",
  rb: "ruby",
  rs: "rust",
  pl: "perl",
  hs: "haskell",
  ex: "elixir",
  "objective-c": "objective-c",
};

function resolveLanguage(input: string, list: Lang[]) {
  const raw = input.trim().toLowerCase();
  const q = aliases[raw] ?? raw;
  const matches = list.filter((l) => {
    const base = l.name.toLowerCase().split("(")[0]!.trim();
    return base === q;
  });
  const fallback = list.filter((l) => l.name.toLowerCase().includes(q));
  const pool = matches.length ? matches : fallback;
  if (!pool.length) return undefined;
  return pool.reduce((a, b) => (b.id > a.id ? b : a));
}

export const runCode = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }): Promise<RunResult> => {
    try {
      const list = await getLanguages();
      const lang = resolveLanguage(data.language, list);
      if (!lang) {
        return {
          ok: false,
          output: "",
          error: `Linguagem "${data.language}" não está disponível para execução.`,
        };
      }

      const res = await fetch(`${JUDGE0}/submissions?base64_encoded=false&wait=true`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language_id: lang.id,
          source_code: data.code,
          stdin: data.stdin ?? "",
          cpu_time_limit: 10,
        }),
      });

      const text = await res.text();
      if (!res.ok) return { ok: false, output: "", error: text.slice(0, 500) };

      const body = JSON.parse(text) as {
        stdout?: string | null;
        stderr?: string | null;
        compile_output?: string | null;
        message?: string | null;
        time?: string | null;
        status?: { id: number; description: string };
      };

      const out = [body.compile_output, body.stdout].filter(Boolean).join("\n").trim();
      const err = [body.stderr, body.message].filter(Boolean).join("\n").trim();

      return {
        ok: body.status?.id === 3,
        output: out || (err ? "" : "(sem saída)"),
        stderr: err,
        status: `${lang.name} • ${body.status?.description ?? ""}`,
        time: body.time ?? null,
      };
    } catch (e) {
      return { ok: false, output: "", error: e instanceof Error ? e.message : "Falha ao executar" };
    }
  });

export const listRuntimes = createServerFn({ method: "GET" }).handler(async () => {
  const list = await getLanguages();
  return list.map((l) => l.name).sort();
});
