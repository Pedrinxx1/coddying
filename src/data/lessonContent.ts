import type { Course } from "./courses";

export type Exercise = {
  prompt: string;
  starter: string;
  expected: string | null; // null = prática livre (sem correção automática)
  language: string;
};

const webLangs = new Set(["html", "css"]);

const templates: Record<string, { starter: string; solutionHint: string }> = {
  python: {
    starter: `# Some os números de 1 a 5 e imprima o resultado\ntotal = 0\n# escreva seu código aqui\nprint(total)`,
    solutionHint: "Use um laço for de 1 a 5 somando em total.",
  },
  javascript: {
    starter: `// Some os números de 1 a 5 e imprima o resultado\nlet total = 0;\n// escreva seu código aqui\nconsole.log(total);`,
    solutionHint: "Use um for de 1 a 5 somando em total.",
  },
  typescript: {
    starter: `// Some os números de 1 a 5 e imprima o resultado\nlet total: number = 0;\n// escreva seu código aqui\nconsole.log(total);`,
    solutionHint: "Use um for de 1 a 5 somando em total.",
  },
  java: {
    starter: `public class Main {\n    public static void main(String[] args) {\n        int total = 0;\n        // escreva seu código aqui\n        System.out.println(total);\n    }\n}`,
    solutionHint: "Use um for de 1 a 5 somando em total.",
  },
  sqlite3: {
    starter: `-- Retorne a soma dos números de 1 a 5 (deve imprimir 15)\nSELECT 1 + 2 + 3 + 4;`,
    solutionHint: "Ajuste a soma para incluir todos os números.",
  },
  bash: {
    starter: `# Some os números de 1 a 5 e imprima o resultado\ntotal=0\n# escreva seu código aqui\necho $total`,
    solutionHint: "Use um for i in 1 2 3 4 5 somando em total.",
  },
};

export function exerciseFor(course: Course, lessonTitle: string): Exercise {
  const lang = course.lang;
  if (webLangs.has(lang)) {
    return {
      prompt: `Prática livre: crie uma pequena página que demonstre "${lessonTitle}". Clique em Rodar para ver o resultado ao vivo.`,
      starter: `<!doctype html>\n<html lang="pt-BR">\n  <head><meta charset="utf-8" /></head>\n  <body style="font-family:system-ui;padding:2rem">\n    <h1>${lessonTitle}</h1>\n    <p>Edite este código e clique em Rodar.</p>\n  </body>\n</html>`,
      expected: null,
      language: "html",
    };
  }
  const t = templates[lang] ?? templates["python"]!;
  return {
    prompt: `Desafio: faça o programa imprimir exatamente 15 (a soma de 1 a 5). ${t.solutionHint}`,
    starter: t.starter,
    expected: "15",
    language: lang,
  };
}

export function lessonSections(course: Course, moduleTitle: string, lessonTitle: string) {
  return [
    {
      title: "O que você vai aprender",
      body: `Nesta lição do módulo "${moduleTitle}" você entende ${lessonTitle.toLowerCase()} dentro do curso de ${course.title}. A ideia é sair daqui sabendo explicar o conceito com suas palavras e reconhecê-lo em qualquer código real.`,
    },
    {
      title: "Como funciona na prática",
      body: `Todo conceito de ${course.title} fica mais claro quando você escreve o código, erra, lê a mensagem de erro e corrige. Leia o exemplo abaixo com calma, mude um valor de propósito e observe o que acontece na saída — é assim que o conhecimento gruda.`,
    },
    {
      title: "Erros comuns",
      body: `Confundir sintaxe com lógica, copiar sem entender e pular a leitura das mensagens de erro. Se travar, volte um passo: descreva em português o que o programa deveria fazer, e só então traduza para código.`,
    },
  ];
}
