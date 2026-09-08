import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

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
};

type Compiler = { name: string; language: string; "display-name"?: string };

let cache: { at: number; list: Compiler[] } | null = null;

async function getCompilers(): Promise<Compiler[]> {
  if (cache && Date.now() - cache.at < 30 * 60 * 1000) return cache.list;
  const res = await fetch("https://wandbox.org/api/list.json");
  if (!res.ok) return [];
  const list = (await res.json()) as Compiler[];
  cache = { at: Date.now(), list };
  return list;
}

function resolveCompiler(input: string, list: Compiler[]) {
  const q = input.trim().toLowerCase();
  const exact = list.find((c) => c.name.toLowerCase() === q);
  if (exact) return exact.name;
  const byLang = list.find((c) => c.language.toLowerCase() === q);
  if (byLang) return byLang.name;
  const alias: Record<string, string> = {
    js: "javascript",
    ts: "typescript",
    py: "python",
    "c++": "c++",
    cpp: "c++",
    cs: "c#",
    csharp: "c#",
    sh: "bash script",
    bash: "bash script",
    shell: "bash script",
    sql: "sql",
    sqlite: "sql",
    node: "javascript",
  };
  const mapped = alias[q];
  if (mapped) {
    const m = list.find((c) => c.language.toLowerCase() === mapped);
    if (m) return m.name;
  }
  const partial = list.find(
    (c) => c.language.toLowerCase().startsWith(q) || c.name.toLowerCase().startsWith(q),
  );
  return partial?.name;
}

export const runCode = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }): Promise<RunResult> => {
    try {
      const list = await getCompilers();
      const compiler = resolveCompiler(data.language, list);
      if (!compiler) {
        return {
          ok: false,
          output: "",
          error: `Linguagem "${data.language}" não disponível para execução.`,
        };
      }

      const res = await fetch("https://wandbox.org/api/compile.json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          compiler,
          code: data.code,
          stdin: data.stdin ?? "",
          "compiler-option-raw": "",
          save: false,
        }),
      });

      const text = await res.text();
      if (!res.ok) return { ok: false, output: "", error: text.slice(0, 500) };

      const body = JSON.parse(text) as {
        program_output?: string;
        program_error?: string;
        compiler_output?: string;
        compiler_error?: string;
        status?: string;
      };

      const out = [body.compiler_output, body.program_output].filter(Boolean).join("");
      const err = [body.compiler_error, body.program_error].filter(Boolean).join("");

      return {
        ok: body.status === "0",
        output: out.trim() || (err ? "" : "(sem saída)"),
        stderr: err.trim(),
      };
    } catch (e) {
      return { ok: false, output: "", error: e instanceof Error ? e.message : "Falha ao executar" };
    }
  });

export const listRuntimes = createServerFn({ method: "GET" }).handler(async () => {
  const list = await getCompilers();
  return [...new Set(list.map((c) => c.language))].sort();
});
