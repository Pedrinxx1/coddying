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

export function lessonContent(course: Course, moduleTitle: string, lessonTitle: string): LessonContent {
  const topic = findTopic(lessonTitle, moduleTitle, course.lang, course.slug);
  const lessonLanguage = topic.example.language;

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

  const exercise: Exercise = webLangs.has(course.lang)
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
          language: lessonLanguage,
        }
      : {
          prompt: `Laboratório de ${lessonTitle}: execute o exemplo, identifique entrada, processamento e saída e altere pelo menos um valor para observar como o resultado muda.`,
          starter: topic.example.code,
          expected: null,
          language: lessonLanguage,
        };

  const guided = interactiveLesson(course.slug, lessonTitle, topic, exercise);
  const firstChallenge = guided.challenges[0];
  const guidedExercise = firstChallenge
    ? { prompt: firstChallenge.instruction, starter: firstChallenge.starter, expected: firstChallenge.expected, language: exercise.language }
    : exercise;

  return { topic, sections, example: topic.example, quiz: topic.quiz, exercise: guidedExercise, guided };
}

// Compatibilidade com chamadas antigas
export function exerciseFor(course: Course, lessonTitle: string): Exercise {
  return lessonContent(course, "", lessonTitle).exercise;
}

export function lessonSections(course: Course, moduleTitle: string, lessonTitle: string) {
  return lessonContent(course, moduleTitle, lessonTitle).sections;
}
