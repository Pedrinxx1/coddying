export type GuidedCheck = {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

export type GuidedStep = {
  title: string;
  eyebrow: string;
  explanation: string;
  code?: string;
  walkthrough?: { line: string; explanation: string }[];
  note?: string;
  check?: GuidedCheck;
};

import type { Topic } from "./lessonLibrary";
import type { Exercise } from "./lessonContent";

export type GuidedLesson = {
  duration: string;
  level: string;
  language: string;
  opening: string;
  prerequisite: string;
  objectives: string[];
  mentalModel: { label: string; description: string }[];
  steps: GuidedStep[];
  challenges: { title: string; instruction: string; starter: string; expected: string | null; hint: string; mode: "code" | "preview" | "reflection" }[];
  recap: string[];
};

const helloWorld: GuidedLesson = {
  duration: "45–60 min",
  level: "Do zero",
  language: "python",
  opening: "Você vai sair do zero e entender cada símbolo do primeiro programa, em vez de apenas copiar uma linha pronta.",
  prerequisite: "Nenhum. Esta aula começa do começo.",
  objectives: [
    "Executar seu primeiro programa em Python",
    "Entender função, argumento, texto e saída",
    "Ler e corrigir os primeiros erros de sintaxe",
    "Alterar o programa sem apenas copiar",
  ],
  mentalModel: [
    { label: "Entrada", description: "Você escreve uma instrução e entrega um texto à função." },
    { label: "Processamento", description: "Python lê e executa a instrução de cima para baixo." },
    { label: "Saída", description: "O resultado aparece no console para você conferir." },
  ],
  steps: [
    {
      eyebrow: "Antes do código",
      title: "Programar é dar uma instrução exata",
      explanation:
        "O computador não adivinha intenções. Ele lê o arquivo de cima para baixo e executa instruções. Nesta aula, nossa instrução será: mostre uma mensagem na tela. A área escura chamada console é onde veremos a resposta do programa.",
      check: {
        question: "Onde aparecerá o resultado do nosso primeiro programa?",
        options: ["No teclado", "No console", "Dentro do código"],
        answer: 1,
        explanation: "O código contém a instrução; o console mostra a saída produzida por ela.",
      },
    },
    {
      eyebrow: "Sua primeira linha",
      title: "Conheça print()",
      explanation:
        "print é uma função pronta do Python. Uma função é uma ação que possui um nome. Os parênteses chamam essa ação, e o valor colocado dentro deles é o argumento que entregamos à função.",
      code: `print("Olá, mundo!")`,
      walkthrough: [
        { line: "print", explanation: "É o nome da função pronta que exibe uma informação." },
        { line: "( )", explanation: "Os parênteses fazem a chamada da função e recebem o argumento." },
        { line: '"Olá, mundo!"', explanation: "As aspas delimitam uma string: o texto que será exibido." },
      ],
      note: "Leia em voz alta: chame a função print e entregue a ela o texto Olá, mundo!.",
      check: {
        question: "Qual parte manda Python realizar a ação de exibir algo?",
        options: ["print", "as aspas", "a exclamação"],
        answer: 0,
        explanation: "print é o nome da função. Os parênteses fazem a chamada e guardam o argumento.",
      },
    },
    {
      eyebrow: "Texto em Python",
      title: "As aspas protegem a mensagem",
      explanation:
        "As aspas dizem que aquele conteúdo é texto — em programação, uma string. Elas delimitam onde a mensagem começa e termina. Python aceita aspas duplas ou simples, desde que você abra e feche com o mesmo tipo.",
      code: `print("Olá, mundo!")
print('Estou aprendendo Python')`,
      note: "As aspas fazem parte da escrita do código, mas não aparecem na saída.",
      check: {
        question: "O que acontece em print(Olá, mundo!) sem aspas?",
        options: ["Funciona igual", "Python procura nomes e encontra um erro", "Imprime as aspas"],
        answer: 1,
        explanation: "Sem aspas, Python não reconhece a frase como texto e tenta interpretá-la como código.",
      },
    },
    {
      eyebrow: "Execução mental",
      title: "Preveja antes de rodar",
      explanation:
        "Programadores criam o hábito de prever a saída antes de executar. Cada print abaixo produz uma linha. Espaços dentro das aspas são preservados; o código segue de cima para baixo.",
      code: `print("Olá!")
print("Meu nome é Ana")
print("Esta é minha primeira aula.")`,
      check: {
        question: "Quantas linhas aparecerão no console?",
        options: ["1", "2", "3"],
        answer: 2,
        explanation: "Existem três chamadas de print, executadas em ordem; cada uma termina com uma nova linha.",
      },
    },
    {
      eyebrow: "Aprenda com o erro",
      title: "Quebre, leia e conserte",
      explanation:
        "Erros não significam que você não sabe programar. SyntaxError indica que a escrita não segue a gramática de Python. Confira primeiro aspas e parênteses: cada símbolo aberto precisa ser fechado.",
      code: `# Falta fechar as aspas. Rode, leia o erro e corrija:
print("Olá, mundo!)`,
      note: "O sinal ^ na mensagem de erro aponta a região onde Python percebeu que algo estava errado.",
    },
  ],
  challenges: [
    {
      title: "1. Faça funcionar",
      instruction: "Complete a função para imprimir exatamente: Olá, mundo!",
      starter: `print(____)`,
      expected: "Olá, mundo!",
      hint: "A mensagem é texto, então deve ficar entre aspas.",
      mode: "code",
    },
    {
      title: "2. Personalize",
      instruction: "Troque o texto para se apresentar em uma frase. A saída deve começar com: Meu nome é",
      starter: `print("____")`,
      expected: "Meu nome é",
      hint: "Escreva seu nome depois do espaço, ainda dentro das aspas.",
      mode: "code",
    },
    {
      title: "3. Duas instruções",
      instruction: "Use dois prints: na primeira linha, seu nome; na segunda, sua meta com programação.",
      starter: `print("Meu nome é ...")
# crie o segundo print abaixo`,
      expected: "\n",
      hint: "Cada chamada de print cria uma linha no console.",
      mode: "code",
    },
    {
      title: "4. Mini projeto",
      instruction: "Crie um cartão de apresentação com pelo menos 3 linhas: nome, o que quer aprender e uma frase de motivação.",
      starter: `print("--------------------")
print("Nome: ")
# complete seu cartão
print("--------------------")`,
      expected: "\n",
      hint: "Adicione dois prints entre as linhas decorativas. Escreva mensagens completas entre aspas.",
      mode: "code",
    },
  ],
  recap: [
    "print() exibe uma saída no console.",
    "Texto é uma string e precisa estar entre aspas.",
    "Parênteses chamam a função; o conteúdo é seu argumento.",
    "Python executa as instruções de cima para baixo.",
    "Erros são pistas: leia o tipo e confira aspas e parênteses.",
  ],
};

function cleanSentence(text: string) {
  return text.trim().replace(/\s+/g, " ");
}

function explainLine(line: string) {
  const value = line.trim();
  if (!value) return "Separa visualmente duas etapas do exemplo.";
  if (/^(#|\/\/|--)/.test(value)) return "Comentário de orientação: documenta a intenção sem executar uma ação.";
  if (/^(import|from|require)/.test(value)) return "Carrega um recurso que será utilizado nas próximas linhas.";
  if (/^(SELECT|FROM|WHERE|JOIN|GROUP BY|ORDER BY|HAVING)/i.test(value)) return "Define uma etapa da consulta e restringe como os dados serão obtidos.";
  if (/^(FROM|RUN|COPY|WORKDIR|CMD|ENTRYPOINT|ENV|EXPOSE)\b/i.test(value)) return "Instrução de construção ou execução do ambiente.";
  if (/\b(if|else|switch|case)\b/.test(value)) return "Decide qual caminho será executado de acordo com uma condição.";
  if (/\b(for|while|map|filter|reduce)\b/.test(value)) return "Percorre ou transforma uma sequência de valores.";
  if (/\b(function|def |class |=>)\b/.test(value)) return "Cria uma estrutura reutilizável para organizar comportamento.";
  if (/^(const|let|var|int |double |String |boolean |\w+\s*=)/.test(value)) return "Cria ou atualiza um valor que será usado pelo restante do exemplo.";
  if (/\b(print|console\.log|echo|return)\b/.test(value)) return "Produz ou devolve o resultado que permite conferir a execução.";
  if (/[<>][a-z!/]/i.test(value)) return "Define uma parte da estrutura visível ou semântica da página.";
  return "Contribui para a transformação principal mostrada neste exemplo.";
}

function buildWalkthrough(code: string) {
  return code.split("\n").filter((line) => line.trim()).slice(0, 8).map((line) => ({ line, explanation: explainLine(line) }));
}

function getLessonMode(courseSlug: string, language: string): "code" | "preview" | "reflection" {
  if (language === "html" || language === "css") return "preview";
  if (["git-github", "docker-devops", "carreira-dev", "prompt-engineering"].includes(courseSlug)) return "reflection";
  return "code";
}

function getMentalModel(courseSlug: string, lessonTitle: string) {
  if (courseSlug === "html-css" || courseSlug === "tailwind-css") return [
    { label: "Estrutura", description: "Defina o conteúdo e sua hierarquia." },
    { label: "Apresentação", description: "Aplique regras visuais sem perder significado." },
    { label: "Verificação", description: "Confira em tamanhos de tela e formas de navegação diferentes." },
  ];
  if (courseSlug === "sql" || courseSlug === "ciencia-de-dados" || courseSlug === "machine-learning") return [
    { label: "Dados", description: "Entenda o formato e a qualidade da entrada." },
    { label: "Operação", description: `Aplique ${lessonTitle} de maneira controlada.` },
    { label: "Interpretação", description: "Leia o resultado e confirme se ele responde ao problema." },
  ];
  if (["git-github", "docker-devops", "carreira-dev", "prompt-engineering"].includes(courseSlug)) return [
    { label: "Cenário", description: "Identifique o objetivo, as restrições e os riscos." },
    { label: "Decisão", description: `Escolha como aplicar ${lessonTitle} e justifique.` },
    { label: "Evidência", description: "Confira o resultado com critérios observáveis." },
  ];
  return [
    { label: "Entrada", description: "Reconheça os dados e condições disponíveis." },
    { label: "Processamento", description: `Use ${lessonTitle} para transformar a entrada.` },
    { label: "Saída", description: "Confira o resultado e os casos que podem falhar." },
  ];
}

function buildGuidedLesson(courseSlug: string, lessonTitle: string, topic: Topic, exercise: Exercise): GuidedLesson {
  const explanations = topic.deep.map(cleanSentence);
  const checks = topic.quiz.slice(0, 3);
  const firstCheck = checks[0];
  const secondCheck = checks[1];
  const thirdCheck = checks[2];
  const activityMode = getLessonMode(courseSlug, exercise.language);
  const concepts: GuidedStep[] = [
    {
      eyebrow: "Entenda o problema",
      title: `O que é ${lessonTitle}`,
      explanation: cleanSentence(topic.intro),
      ...(firstCheck ? { check: { question: firstCheck.q, options: firstCheck.options, answer: firstCheck.answer, explanation: firstCheck.why } } : {}),
    },
    {
      eyebrow: "Construa o modelo mental",
      title: "Como pensar antes de fazer",
      explanation: explanations[0] ?? cleanSentence(topic.intro),
      note: `Não decore a forma. Tente explicar com suas palavras qual problema “${lessonTitle}” resolve.`,
    },
    {
      eyebrow: "Veja funcionando",
      title: "Exemplo completo, do início ao resultado",
      explanation: explanations[1] ?? "Agora acompanhe um exemplo inteiro e observe como cada parte contribui para o resultado.",
      code: topic.example.code,
      walkthrough: buildWalkthrough(topic.example.code),
      note: cleanSentence(topic.example.explain),
      ...(secondCheck ? { check: { question: secondCheck.q, options: secondCheck.options, answer: secondCheck.answer, explanation: secondCheck.why } } : {}),
    },
    {
      eyebrow: "Leia por partes",
      title: "Do detalhe para o todo",
      explanation: explanations[2] ?? `Leia o exemplo de cima para baixo. Identifique primeiro os dados de entrada, depois a transformação e, por fim, o resultado. Esse roteiro ajuda a entender ${lessonTitle} sem depender de memorização.`,
      ...(thirdCheck ? { check: { question: thirdCheck.q, options: thirdCheck.options, answer: thirdCheck.answer, explanation: thirdCheck.why } } : {}),
    },
    {
      eyebrow: "Aprenda a diagnosticar",
      title: "Erros comuns e como corrigi-los",
      explanation: topic.pitfalls.map((pitfall, index) => `${index + 1}. ${cleanSentence(pitfall)}`).join("\n"),
      note: "Quando algo der errado, compare uma diferença por vez com o exemplo. Evite mudar várias partes ao mesmo tempo.",
    },
  ];

  return {
    duration: "50–75 min",
    level: "Aula guiada",
    language: topic.example.language || exercise.language,
    opening: `Nesta aula, você vai compreender ${lessonTitle} com explicação progressiva, exemplo resolvido, checagens e prática. Nada de apenas copiar: cada etapa prepara a próxima.`,
    prerequisite: "Leia a aula anterior do módulo se algum termo parecer novo. Você pode testar o exemplo antes de continuar.",
    objectives: [
      `Explicar ${lessonTitle} com suas próprias palavras`,
      "Reconhecer as partes importantes em um exemplo real",
      "Identificar e corrigir os erros mais frequentes",
      "Aplicar o conteúdo em uma atividade prática",
    ],
    mentalModel: getMentalModel(courseSlug, lessonTitle),
    steps: concepts,
    challenges: [
      {
        title: activityMode === "reflection" ? "Estudo de caso" : activityMode === "preview" ? "Laboratório visual" : "Laboratório prático",
        instruction: activityMode === "reflection"
          ? `Resolva um cenário real sobre “${lessonTitle}”: descreva a decisão que tomaria, por que ela faz sentido e como verificaria se funcionou.`
          : exercise.prompt,
        starter: activityMode === "reflection"
          ? `Cenário: preciso aplicar ${lessonTitle} em um projeto real.\n\nMinha decisão:\n\nPor que escolhi esse caminho:\n\nComo vou verificar o resultado:\n`
          : exercise.starter,
        expected: activityMode === "reflection" ? null : exercise.expected,
        hint: `Volte ao exemplo resolvido e compare a estrutura. ${topic.pitfalls[0] ?? "Resolva uma parte de cada vez."}`,
        mode: activityMode,
      },
    ],
    recap: [
      cleanSentence(topic.intro),
      cleanSentence(topic.example.explain),
      ...topic.pitfalls.slice(0, 2).map((item) => `Evite: ${cleanSentence(item)}`),
    ],
  };
}

export function interactiveLesson(
  courseSlug: string,
  lessonTitle: string,
  topic: Topic,
  exercise: Exercise,
): GuidedLesson {
  const normalized = lessonTitle.toLocaleLowerCase("pt-BR");
  if (courseSlug === "python" && (normalized.includes("hello") || normalized.includes("primeiro programa"))) {
    return helloWorld;
  }
  return buildGuidedLesson(courseSlug, lessonTitle, topic, exercise);
}