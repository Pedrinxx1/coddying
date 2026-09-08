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
  note?: string;
  check?: GuidedCheck;
};

export type GuidedLesson = {
  duration: string;
  level: string;
  objectives: string[];
  steps: GuidedStep[];
  challenges: { title: string; instruction: string; starter: string; expected: string; hint: string }[];
  recap: string[];
};

const helloWorld: GuidedLesson = {
  duration: "45–60 min",
  level: "Do zero",
  objectives: [
    "Executar seu primeiro programa em Python",
    "Entender função, argumento, texto e saída",
    "Ler e corrigir os primeiros erros de sintaxe",
    "Alterar o programa sem apenas copiar",
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
    },
    {
      title: "2. Personalize",
      instruction: "Troque o texto para se apresentar em uma frase. A saída deve começar com: Meu nome é",
      starter: `print("Meu nome é ")`,
      expected: "Meu nome é",
      hint: "Escreva seu nome depois do espaço, ainda dentro das aspas.",
    },
    {
      title: "3. Duas instruções",
      instruction: "Use dois prints: na primeira linha, seu nome; na segunda, sua meta com programação.",
      starter: `print("Meu nome é ...")
# crie o segundo print abaixo`,
      expected: "\n",
      hint: "Cada chamada de print cria uma linha no console.",
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

export function interactiveLesson(courseSlug: string, lessonTitle: string): GuidedLesson | undefined {
  const normalized = lessonTitle.toLocaleLowerCase("pt-BR");
  if (courseSlug === "python" && (normalized.includes("hello") || normalized.includes("primeiro programa"))) {
    return helloWorld;
  }
  return undefined;
}