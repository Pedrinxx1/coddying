// Tutor de estudo sem IA: responde usando exclusivamente o conteúdo da lição atual.
// Funciona por correspondência de intenção + palavras-chave do próprio material.

import type { LessonContent } from "@/data/lessonContent";

export type TutorAnswer = {
  text: string;
  source: string;
  /** true quando a resposta veio comprovadamente do material desta lição */
  verificado: boolean;
  /** % de palavras da resposta que existem no material da lição */
  cobertura: number;
};

const strip = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

type Intent = { id: string; patterns: string[] };

const intents: Intent[] = [
  { id: "resumo", patterns: ["resum", "o que e", "o que significa", "explica", "explicar", "nao entendi", "definicao", "conceito"] },
  { id: "exemplo", patterns: ["exemplo", "codigo", "mostra", "como escrever", "sintaxe", "como faz", "como fazer"] },
  { id: "erro", patterns: ["erro", "bug", "nao funciona", "deu ruim", "quebrou", "cuidado", "armadilha", "por que nao", "travei"] },
  { id: "exercicio", patterns: ["exercicio", "desafio", "dica", "ajuda no exercicio", "resposta", "como resolver", "nao consigo"] },
  { id: "quiz", patterns: ["quiz", "pergunta", "questao", "teste", "prova"] },
  { id: "pratica", patterns: ["pra que serve", "para que serve", "quando usar", "utilidade", "no dia a dia", "vale a pena", "importante"] },
  { id: "aprofundar", patterns: ["mais", "aprofund", "detalhe", "avancado", "profundidade", "alem"] },
];

function detectIntent(q: string): string {
  const n = strip(q);
  for (const i of intents) if (i.patterns.some((p) => n.includes(p))) return i.id;
  return "auto";
}

// Procura o trecho do material mais parecido com a pergunta (bag of words).
function bestParagraph(question: string, content: LessonContent): { text: string; label: string } | null {
  const words = strip(question)
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3);
  if (words.length === 0) return null;

  const candidates: { text: string; label: string }[] = [
    ...content.sections.map((s) => ({ text: s.body, label: s.title })),
    { text: content.example.explain, label: "Exemplo da lição" },
    ...content.quiz.map((q) => ({ text: `${q.q} — ${q.options[q.answer]}. ${q.why}`, label: "Quiz da lição" })),
    { text: content.exercise.prompt, label: "Exercício" },
  ];

  let best: { text: string; label: string; score: number } | null = null;
  for (const c of candidates) {
    const hay = strip(c.text);
    let score = 0;
    for (const w of words) if (hay.includes(w)) score += w.length;
    if (score > 0 && (!best || score > best.score)) best = { ...c, score };
  }
  return best && best.score >= 8 ? { text: best.text, label: best.label } : null;
}

export function askTutor(question: string, content: LessonContent, lessonTitle: string): TutorAnswer {
  const q = question.trim();
  if (q.length < 2) {
    return {
      text: "Escreva sua dúvida sobre esta lição — por exemplo: “o que é isso?”, “me dá um exemplo”, “que erro costuma acontecer?” ou “uma dica pro exercício”.",
      source: "Tutor",
    };
  }

  const intent = detectIntent(q);
  const t = content.topic;

  switch (intent) {
    case "resumo":
      return {
        text: `${t.intro}\n\nEm uma frase: ${t.title.toLowerCase()} é o que você precisa dominar nesta lição de "${lessonTitle}".`,
        source: "Explicação da lição",
      };
    case "exemplo":
      return {
        text: `Olha o exemplo desta lição (ele está logo acima, em "${t.title}"):\n\n${t.example.code}\n\n${t.example.explain}`,
        source: "Exemplo da lição",
      };
    case "erro":
      return {
        text: `Os tropeços mais comuns aqui são:\n\n${t.pitfalls.map((p) => `• ${p}`).join("\n")}\n\nSe o seu caso for outro, cole a mensagem de erro no exercício e compare com o exemplo da lição.`,
        source: "Erros comuns",
      };
    case "exercicio":
      return {
        text: `Sem entregar a resposta: o objetivo é "${content.exercise.prompt}".\n\nPasso a passo: 1) releia o exemplo da lição; 2) escreva em português o que o programa deve fazer; 3) traduza linha a linha; 4) rode e compare a saída com o esperado${content.exercise.expected ? ` (${content.exercise.expected})` : ""}.`,
        source: "Exercício",
      };
    case "quiz":
      return {
        text: t.quiz
          .map((qq, i) => `${i + 1}. ${qq.q}\nResposta: ${qq.options[qq.answer]} — ${qq.why}`)
          .join("\n\n"),
        source: "Quiz da lição",
      };
    case "pratica":
      return {
        text: `${t.deep[1] ?? t.deep[0] ?? t.intro}`,
        source: "Na prática",
      };
    case "aprofundar":
      return { text: t.deep.join("\n\n"), source: "Aprofundamento" };
    default: {
      const found = bestParagraph(q, content);
      if (found) return { text: found.text, source: found.label };
      return {
        text: `Não achei isso no material desta lição — e eu só respondo com o conteúdo dela, para não te dar informação inventada.\n\nO que esta lição cobre: ${t.intro}\n\nTente perguntar de outro jeito, ou peça: “resumo”, “exemplo”, “erros comuns”, “dica do exercício” ou “gabarito do quiz”.`,
        source: "Fora do conteúdo da lição",
      };
    }
  }
}

export const tutorSuggestions = [
  "Me explica de novo em palavras simples",
  "Mostra um exemplo",
  "Quais erros comuns?",
  "Uma dica pro exercício",
];
