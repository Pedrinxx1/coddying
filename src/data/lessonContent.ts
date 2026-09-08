import type { Course } from "./courses";
import { findTopic, type QuizQuestion, type Topic } from "./lessonLibrary";
import { interactiveLesson, type GuidedLesson } from "./interactiveLessons";

export type Exercise = {
  prompt: string;
  starter: string;
  expected: string | null; // null = prática livre (sem correção automática)
  language: string;
};

export type LessonContent = {
  topic: Topic;
  sections: { title: string; body: string; kind: "overview" | "concept" | "practice" | "detail" | "warning" }[];
  example: { language: string; code: string; explain: string };
  quiz: QuizQuestion[];
  exercise: Exercise;
  guided: GuidedLesson | undefined;
};

const webLangs = new Set(["html", "css"]);

const fallbackStarters: Record<string, string> = {
  python: `# Some os números de 1 a 5 e imprima o resultado\ntotal = 0\n# escreva seu código aqui\nprint(total)`,
  javascript: `// Some os números de 1 a 5 e imprima o resultado\nlet total = 0;\n// escreva seu código aqui\nconsole.log(total);`,
  typescript: `// Some os números de 1 a 5 e imprima o resultado\nlet total: number = 0;\n// escreva seu código aqui\nconsole.log(total);`,
  java: `public class Main {\n    public static void main(String[] args) {\n        int total = 0;\n        // escreva seu código aqui\n        System.out.println(total);\n    }\n}`,
  sqlite3: `-- Deve imprimir 15\nSELECT 1 + 2 + 3 + 4;`,
  bash: `# Some os números de 1 a 5 e imprima o resultado\ntotal=0\n# escreva seu código aqui\necho $total`,
};

export function lessonContent(course: Course, moduleTitle: string, lessonTitle: string): LessonContent {
  const topic = findTopic(lessonTitle, moduleTitle, course.lang);
  const guided = interactiveLesson(course.slug, lessonTitle);

  const sections = [
    { title: "Visão geral", body: topic.intro, kind: "overview" as const },
    ...topic.deep.map((body, i) => ({
      title: ["Conceito essencial", "Aplicação prática", "Detalhes que fazem diferença"][i] ?? `Aprofundamento ${i + 1}`,
      body,
      kind: (["concept", "practice", "detail"] as const)[i] ?? ("detail" as const),
    })),
    {
      title: "Erros comuns e como evitar",
      body: topic.pitfalls.map((p) => `• ${p}`).join("\n"),
      kind: "warning" as const,
    },
  ];

  const exercise: Exercise = guided
    ? {
        prompt: guided.challenges[0]?.instruction ?? "Imprima Olá, mundo!",
        starter: guided.challenges[0]?.starter ?? `print("Olá, mundo!")`,
        expected: guided.challenges[0]?.expected ?? "Olá, mundo!",
        language: course.lang,
      }
    : webLangs.has(course.lang)
    ? {
        prompt: `Prática guiada: edite o exemplo abaixo aplicando "${lessonTitle}" e clique em Rodar para ver o resultado ao vivo.`,
        starter: topic.example.language === "html" ? topic.example.code : `<!doctype html>\n<html lang="pt-BR">\n  <head><meta charset="utf-8" /></head>\n  <body style="font-family:system-ui;padding:2rem">\n    <h1>${lessonTitle}</h1>\n  </body>\n</html>`,
        expected: null,
        language: "html",
      }
    : topic.exercise
      ? {
          prompt: topic.exercise.prompt,
          starter: topic.exercise.starter,
          expected: topic.exercise.expected,
          language: topic.exercise.language ?? course.lang,
        }
      : {
          prompt: `Desafio: faça o programa imprimir exatamente 15 (a soma de 1 a 5) usando o que você viu em "${lessonTitle}".`,
          starter: fallbackStarters[course.lang] ?? fallbackStarters["python"] ?? "",
          expected: "15",
          language: course.lang,
        };

  return { topic, sections, example: topic.example, quiz: topic.quiz, exercise, guided };
}

// Compatibilidade com chamadas antigas
export function exerciseFor(course: Course, lessonTitle: string): Exercise {
  return lessonContent(course, "", lessonTitle).exercise;
}

export function lessonSections(course: Course, moduleTitle: string, lessonTitle: string) {
  return lessonContent(course, moduleTitle, lessonTitle).sections;
}
