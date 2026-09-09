import type { Course } from "./courses";
import { findTopic, type QuizQuestion } from "./lessonLibrary";
import { examBank } from "./examBank";

export type FinalProject = {
  title: string;
  brief: string;
  requirements: string[];
  deliverable: string;
};

export const PASS_RATE = 0.7;
export const EXAM_SIZE = 12;

/** Prova final: perguntas retiradas do conteúdo real de todas as lições do curso. */
const linguagens: Record<string, string[]> = {
  python: ["python"],
  javascript: ["javascript", "js", "node"],
  typescript: ["typescript", "javascript", "js"],
  java: ["java"],
  html: ["html", "css"],
  css: ["css", "html"],
  sql: ["sql"],
  bash: ["bash", "shell", "docker", "git"],
};

/** Evita questões de outra linguagem que entram por semelhança de título. */
function combina(q: QuizQuestion, lang: string) {
  const texto = `${q.q} ${q.options.join(" ")}`.toLowerCase();
  const permitidas = linguagens[lang] ?? [lang];
  const outras = ["python", "javascript", "typescript", "java", "sql", "html", "css"].filter(
    (n) => !permitidas.includes(n),
  );
  return !outras.some((n) => texto.includes(` ${n}`) || texto.includes(`em ${n}`));
}

const semAcento = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

/** A lição só entra na prova quando o tópico encontrado realmente fala do assunto dela. */
function topicoRelevante(lessonTitle: string, topicKeys: string[], topicTitle: string) {
  const alvo = semAcento(`${lessonTitle}`);
  if (topicKeys.some((k) => alvo.includes(semAcento(k)))) return true;
  const palavras = semAcento(topicTitle)
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 4);
  return palavras.some((w) => alvo.includes(w));
}

export function finalExam(course: Course): QuizQuestion[] {
  const seen = new Set<string>();
  const pool: QuizQuestion[] = [];
  for (const mod of course.modules) {
    for (const lesson of mod.lessons) {
      const topic = findTopic(lesson, mod.title, course.lang);
      if (!topicoRelevante(lesson, topic.keys, topic.title)) continue;
      const idioma = (topic.example.language || "").toLowerCase();
      const permitidas = linguagens[course.lang] ?? [course.lang];
      const neutras = ["text", "txt", "markdown", "md", "json", "yaml", "bash", "shell", ""];
      if (!permitidas.includes(idioma) && !neutras.includes(idioma)) continue;
      for (const q of topic.quiz) {
        if (seen.has(q.q)) continue;
        seen.add(q.q);
        if (!combina(q, course.lang)) continue;
        pool.push(q);
      }
    }
  }
  for (const q of examBank[course.slug] ?? []) {
    if (seen.has(q.q)) continue;
    seen.add(q.q);
    pool.push(q);
  }
  if (pool.length <= EXAM_SIZE) return pool;
  // amostragem determinística e espalhada por todo o curso
  const step = pool.length / EXAM_SIZE;
  const picked: QuizQuestion[] = [];
  for (let i = 0; i < EXAM_SIZE; i++) picked.push(pool[Math.floor(i * step)]!);
  return picked;
}

const projects: Record<string, FinalProject> = {
  "logica-de-programacao": {
    title: "Caixa de mercado em pseudocódigo e Python",
    brief:
      "Construa um programa de caixa que lê itens e preços, aplica desconto por quantidade e imprime um recibo alinhado.",
    requirements: [
      "Ler pelo menos 3 itens com nome, preço e quantidade",
      "Aplicar 10% de desconto quando o total passar de R$ 100",
      "Usar função separada para cálculo e outra para impressão",
      "Tratar entrada inválida sem quebrar o programa",
    ],
    deliverable: "Link do código no playground (ou repositório) + print do recibo gerado",
  },
  "html-css": {
    title: "Landing page responsiva de um produto",
    brief: "Publique uma página de produto com cabeçalho, seção principal, lista de benefícios, depoimentos e rodapé.",
    requirements: [
      "HTML semântico com um único h1 e hierarquia correta de títulos",
      "Layout com Flexbox e Grid, funcionando em 375px e 1280px",
      "Imagens com texto alternativo e contraste acessível",
      "Nenhuma rolagem horizontal em telas pequenas",
    ],
    deliverable: "Link da página publicada ou do código HTML/CSS completo",
  },
  "git-github": {
    title: "Fluxo completo de colaboração",
    brief: "Monte um repositório com histórico limpo simulando trabalho em equipe.",
    requirements: [
      "Pelo menos 8 commits com mensagens descritivas",
      "Uma branch de feature integrada por pull request",
      "Um conflito resolvido manualmente e documentado",
      "README explicando o projeto e como rodar",
    ],
    deliverable: "Link do repositório público",
  },
  javascript: {
    title: "App de tarefas sem framework",
    brief: "Crie um gerenciador de tarefas em JavaScript puro com armazenamento local.",
    requirements: [
      "Adicionar, concluir, editar e remover tarefas",
      "Filtro por status e contador de pendentes",
      "Persistência em localStorage",
      "Funções puras separadas da manipulação do DOM",
    ],
    deliverable: "Link do código ou da página publicada",
  },
  typescript: {
    title: "Biblioteca tipada de validação",
    brief: "Implemente um validador de formulários com tipos que impeçam uso incorreto.",
    requirements: [
      "Tipos genéricos para regras reutilizáveis",
      "União discriminada para o resultado (sucesso ou erro)",
      "Sem uso de any",
      "Exemplos de uso comentados",
    ],
    deliverable: "Link do código com os tipos e exemplos",
  },
  react: {
    title: "Painel com dados e estado compartilhado",
    brief: "Construa um painel React que lista, filtra e detalha itens.",
    requirements: [
      "Componentes reutilizáveis com props tipadas",
      "Estado de busca/filtro e lista derivada",
      "Carregamento e erro tratados na interface",
      "Navegação entre lista e detalhe",
    ],
    deliverable: "Link do projeto ou do repositório",
  },
  "tailwind-css": {
    title: "Design system em Tailwind",
    brief: "Crie uma pequena biblioteca visual com tokens e componentes consistentes.",
    requirements: [
      "Paleta e tipografia definidas por tokens, sem cores soltas",
      "Botões, cartões, formulário e alerta em variantes",
      "Modo claro e escuro",
      "Página de demonstração responsiva",
    ],
    deliverable: "Link da página de demonstração",
  },
  python: {
    title: "Analisador de dados de linha de comando",
    brief: "Escreva um programa que lê um arquivo CSV/JSON e gera um relatório resumido.",
    requirements: [
      "Leitura de arquivo com tratamento de exceções",
      "Funções com docstring e responsabilidades separadas",
      "Relatório com totais, médias e maiores valores",
      "Argumentos de linha de comando para o caminho do arquivo",
    ],
    deliverable: "Link do código + exemplo de saída do relatório",
  },
  java: {
    title: "Sistema de biblioteca orientado a objetos",
    brief: "Modele empréstimos de livros usando classes, herança e coleções.",
    requirements: [
      "Classes Livro, Usuario e Emprestimo com encapsulamento",
      "Interface ou classe abstrata aproveitada por polimorfismo",
      "Coleções para busca e listagem",
      "Tratamento de exceções para regras de negócio",
    ],
    deliverable: "Link do código completo",
  },
  "spring-boot": {
    title: "API REST de catálogo",
    brief: "Construa uma API com CRUD, validação e camadas bem separadas.",
    requirements: [
      "Controller, service e repository separados",
      "Validação de entrada e respostas de erro padronizadas",
      "Persistência com JPA",
      "Documentação dos endpoints",
    ],
    deliverable: "Link do repositório com instruções de execução",
  },
  nodejs: {
    title: "API Node com autenticação",
    brief: "Implemente uma API com rotas protegidas e persistência.",
    requirements: [
      "Rotas de cadastro e login com senha protegida",
      "Middleware de autenticação",
      "CRUD de um recurso pertencente ao usuário",
      "Variáveis de ambiente para segredos",
    ],
    deliverable: "Link do repositório",
  },
  sql: {
    title: "Modelagem e relatórios de uma loja",
    brief: "Modele um banco de vendas e escreva as consultas de análise.",
    requirements: [
      "Pelo menos 4 tabelas relacionadas com chaves",
      "Consultas com JOIN, GROUP BY e HAVING",
      "Uma consulta com subconsulta ou função de janela",
      "Índices justificados",
    ],
    deliverable: "Arquivo .sql com esquema, dados de exemplo e consultas",
  },
  "estruturas-de-dados": {
    title: "Biblioteca de estruturas com análise de custo",
    brief: "Implemente e compare estruturas resolvendo um problema real.",
    requirements: [
      "Pilha, fila e tabela hash implementadas do zero",
      "Uma busca e uma ordenação com complexidade documentada",
      "Testes comparando tempos em entradas grandes",
      "Explicação de qual estrutura escolher e por quê",
    ],
    deliverable: "Link do código + tabela de comparação",
  },
  "ciencia-de-dados": {
    title: "Análise exploratória com conclusão",
    brief: "Escolha um conjunto de dados e responda a uma pergunta clara com evidências.",
    requirements: [
      "Limpeza dos dados documentada",
      "Pelo menos três visualizações comentadas",
      "Estatísticas descritivas relevantes",
      "Conclusão com limitações do estudo",
    ],
    deliverable: "Notebook ou relatório com código e gráficos",
  },
  "machine-learning": {
    title: "Modelo preditivo avaliado corretamente",
    brief: "Treine um modelo e prove que ele generaliza.",
    requirements: [
      "Separação treino/teste e validação cruzada",
      "Comparação de pelo menos dois modelos",
      "Métricas adequadas ao problema, além da acurácia",
      "Análise de erros e próximos passos",
    ],
    deliverable: "Notebook com código, métricas e conclusão",
  },
  "prompt-engineering": {
    title: "Kit de prompts com avaliação",
    brief: "Crie prompts para uma tarefa real e meça a qualidade das respostas.",
    requirements: [
      "Prompt base com papel, contexto, formato e restrições",
      "Três variações testadas na mesma tarefa",
      "Critérios de avaliação e resultados registrados",
      "Versão final com justificativa das escolhas",
    ],
    deliverable: "Documento com prompts, respostas e avaliação",
  },
  "react-native": {
    title: "App mobile com navegação e dados",
    brief: "Construa um aplicativo com pelo menos três telas.",
    requirements: [
      "Navegação entre lista, detalhe e configurações",
      "Consumo de dados com estados de carregamento e erro",
      "Armazenamento local de preferências",
      "Layout adaptado a telas pequenas",
    ],
    deliverable: "Link do repositório + capturas de tela",
  },
  "docker-devops": {
    title: "Aplicação conteinerizada com pipeline",
    brief: "Empacote uma aplicação e automatize sua entrega.",
    requirements: [
      "Dockerfile com build em múltiplos estágios",
      "docker-compose com aplicação e banco",
      "Pipeline de CI rodando testes",
      "Variáveis de ambiente e volumes configurados",
    ],
    deliverable: "Link do repositório com Dockerfile e pipeline",
  },
  "carreira-dev": {
    title: "Portfólio e plano de carreira",
    brief: "Monte o material que você vai usar para conseguir a próxima vaga.",
    requirements: [
      "Currículo de uma página com resultados mensuráveis",
      "Perfil profissional atualizado e coerente",
      "Portfólio com três projetos explicados",
      "Plano de estudo e busca com metas por semana",
    ],
    deliverable: "Links do currículo, perfil e portfólio",
  },
};

export function finalProject(course: Course): FinalProject {
  const found = projects[course.slug];
  if (found) return found;
  return {
    title: `Projeto final de ${course.title}`,
    brief: `Construa uma aplicação que use, junta, os principais assuntos de ${course.title}, do básico ao avançado.`,
    requirements: [
      "Resolver um problema real, com entrada, processamento e saída claros",
      "Usar pelo menos três assuntos diferentes do curso",
      "Tratar erros e casos limite",
      "Documentar como executar e testar",
    ],
    deliverable: "Link do código ou do projeto publicado",
  };
}

export function certificateCode(courseSlug: string, userId: string) {
  const base = `${courseSlug}-${userId}`;
  let hash = 0;
  for (let i = 0; i < base.length; i++) hash = (hash * 31 + base.charCodeAt(i)) >>> 0;
  return `CD-${courseSlug.slice(0, 6).toUpperCase()}-${hash.toString(36).toUpperCase().padStart(7, "0")}`;
}
