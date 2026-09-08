export type Level = "Iniciante" | "Intermediário" | "Avançado";

export type Course = {
  slug: string;
  title: string;
  icon: string;
  level: Level;
  hours: string;
  tag?: string;
  category: "Fundamentos" | "Frontend" | "Backend" | "Dados & IA" | "Mobile" | "DevOps & Carreira";
  lang: string; // linguagem padrão no playground
  desc: string;
  modules: { title: string; lessons: string[] }[];
};

export const levels: Level[] = ["Iniciante", "Intermediário", "Avançado"];

export const levelEmoji: Record<Level, string> = {
  Iniciante: "🌱",
  Intermediário: "🚀",
  Avançado: "🔥",
};

export const courses: Course[] = [
  {
    slug: "logica-de-programacao",
    title: "Lógica de Programação",
    icon: "{ }",
    level: "Iniciante",
    hours: "10h",
    tag: "Comece aqui",
    category: "Fundamentos",
    lang: "python",
    desc: "A base de tudo: pensar como programador antes de escrever código.",
    modules: [
      {
        title: "Mentalidade",
        lessons: [
          "O que é programar de verdade",
          "Algoritmo do dia a dia",
          "Pseudocódigo e fluxogramas",
          "Como ler um erro sem entrar em pânico",
        ],
      },
      {
        title: "Blocos fundamentais",
        lessons: [
          "Variáveis e tipos de dados",
          "Operadores aritméticos e lógicos",
          "Condicionais: if, else, else if",
          "Laços: while e for",
        ],
      },
      {
        title: "Organizando o código",
        lessons: [
          "Funções e parâmetros",
          "Escopo e retorno",
          "Listas e dicionários",
          "Decompondo problemas grandes",
        ],
      },
      {
        title: "Projeto final",
        lessons: ["Jogo de adivinhação", "Calculadora de notas", "Desafios cronometrados"],
      },
    ],
  },
  {
    slug: "html-css",
    title: "HTML & CSS",
    icon: "</>",
    level: "Iniciante",
    hours: "12h",
    tag: "Popular",
    category: "Frontend",
    lang: "html",
    desc: "Estruture e estilize páginas modernas, acessíveis e responsivas.",
    modules: [
      {
        title: "HTML essencial",
        lessons: [
          "Estrutura de um documento",
          "Texto, links e imagens",
          "Listas e tabelas",
          "Formulários e inputs",
          "HTML semântico e acessibilidade",
        ],
      },
      {
        title: "CSS essencial",
        lessons: [
          "Seletores e especificidade",
          "Box model, margin e padding",
          "Cores, fontes e unidades",
          "Posicionamento e z-index",
        ],
      },
      {
        title: "Layouts modernos",
        lessons: [
          "Flexbox na prática",
          "CSS Grid na prática",
          "Media queries e mobile first",
          "Variáveis CSS e temas escuros",
        ],
      },
      {
        title: "Avançado",
        lessons: [
          "Transições e animações",
          "Pseudo-elementos e efeitos",
          "Boas práticas e organização",
          "Projeto: landing page completa",
        ],
      },
    ],
  },
  {
    slug: "git-github",
    title: "Git & GitHub",
    icon: "⑂",
    level: "Iniciante",
    hours: "6h",
    category: "DevOps & Carreira",
    lang: "bash",
    desc: "Versione seu código, colabore em equipe e monte seu portfólio.",
    modules: [
      {
        title: "Primeiros commits",
        lessons: ["Por que versionar", "init, add, commit", "Status, log e diff", "Desfazendo erros"],
      },
      {
        title: "Trabalhando com branches",
        lessons: ["Branches e merge", "Resolvendo conflitos", "Rebase sem medo", "Stash e cherry-pick"],
      },
      {
        title: "GitHub",
        lessons: ["Repositórios remotos", "Pull requests e code review", "Issues e projetos", "GitHub Pages"],
      },
    ],
  },
  {
    slug: "javascript",
    title: "JavaScript",
    icon: "JS",
    level: "Iniciante",
    hours: "20h",
    tag: "Popular",
    category: "Frontend",
    lang: "javascript",
    desc: "A linguagem da web, do básico ao assíncrono avançado.",
    modules: [
      {
        title: "Fundamentos",
        lessons: [
          "Variáveis: let, const e var",
          "Tipos, coerção e comparação",
          "Condicionais e laços",
          "Funções, arrow functions e closures",
        ],
      },
      {
        title: "Estruturas de dados",
        lessons: [
          "Arrays e métodos (map, filter, reduce)",
          "Objetos e desestruturação",
          "Spread, rest e imutabilidade",
          "Set, Map e JSON",
        ],
      },
      {
        title: "DOM e eventos",
        lessons: [
          "Selecionando e alterando elementos",
          "Eventos e delegação",
          "Formulários e validação",
          "LocalStorage",
        ],
      },
      {
        title: "Assíncrono",
        lessons: [
          "Event loop explicado",
          "Callbacks e Promises",
          "async/await e tratamento de erros",
          "Fetch API e consumo de APIs REST",
        ],
      },
      {
        title: "Avançado",
        lessons: [
          "Módulos ES e bundlers",
          "Prototypes e classes",
          "Padrões e código limpo",
          "Projeto: app de tarefas com API",
        ],
      },
    ],
  },
  {
    slug: "typescript",
    title: "TypeScript",
    icon: "TS",
    level: "Intermediário",
    hours: "12h",
    category: "Frontend",
    lang: "typescript",
    desc: "JavaScript com tipagem estática para código seguro e escalável.",
    modules: [
      {
        title: "Tipos básicos",
        lessons: ["Setup e tsconfig", "Tipos primitivos e arrays", "Interfaces e type aliases", "Unions e literais"],
      },
      {
        title: "Tipagem prática",
        lessons: ["Funções tipadas", "Generics", "Narrowing e type guards", "Enums e tuplas"],
      },
      {
        title: "Avançado",
        lessons: [
          "Utility types (Partial, Pick, Omit)",
          "Mapped e conditional types",
          "Declaração de módulos",
          "TypeScript com React",
        ],
      },
    ],
  },
  {
    slug: "react",
    title: "React",
    icon: "⚛",
    level: "Intermediário",
    hours: "18h",
    tag: "Popular",
    category: "Frontend",
    lang: "javascript",
    desc: "Interfaces modernas com componentes, estado e hooks.",
    modules: [
      {
        title: "Começando",
        lessons: ["JSX e componentes", "Props e composição", "Listas e chaves", "Eventos e formulários"],
      },
      {
        title: "Estado e efeitos",
        lessons: ["useState", "useEffect e ciclo de vida", "useRef e useMemo", "Hooks customizados"],
      },
      {
        title: "Aplicações reais",
        lessons: ["Context API", "Roteamento", "Consumo de APIs e cache", "Formulários com validação"],
      },
      {
        title: "Avançado",
        lessons: [
          "Performance e re-renders",
          "Suspense e code splitting",
          "Testes de componentes",
          "Projeto: dashboard completo",
        ],
      },
    ],
  },
  {
    slug: "tailwind-css",
    title: "Tailwind CSS",
    icon: "~",
    level: "Intermediário",
    hours: "6h",
    category: "Frontend",
    lang: "html",
    desc: "Estilize rápido com utilitários e um design system consistente.",
    modules: [
      {
        title: "Fundamentos",
        lessons: ["Utility-first na prática", "Espaçamento e tipografia", "Cores e temas", "Responsividade"],
      },
      {
        title: "Avançado",
        lessons: ["Dark mode", "Componentes reutilizáveis", "Tokens e customização", "Animações"],
      },
    ],
  },
  {
    slug: "python",
    title: "Python",
    icon: "🐍",
    level: "Iniciante",
    hours: "18h",
    category: "Fundamentos",
    lang: "python",
    desc: "Linguagem versátil para automação, web, dados e IA.",
    modules: [
      {
        title: "Básico",
        lessons: ["Sintaxe e variáveis", "Strings e f-strings", "Condicionais e loops", "Funções"],
      },
      {
        title: "Estruturas de dados",
        lessons: ["Listas e tuplas", "Dicionários e sets", "Compreensões de lista", "Arquivos e JSON"],
      },
      {
        title: "Intermediário",
        lessons: ["POO em Python", "Módulos e pacotes", "Exceções", "Virtualenv e pip"],
      },
      {
        title: "Avançado",
        lessons: [
          "Decorators e generators",
          "Type hints",
          "Testes com pytest",
          "Projeto: automação de planilhas",
        ],
      },
    ],
  },
  {
    slug: "java",
    title: "Java Completo",
    icon: "☕",
    level: "Intermediário",
    hours: "24h",
    category: "Backend",
    lang: "java",
    desc: "Do primeiro programa a aplicações orientadas a objetos profissionais.",
    modules: [
      {
        title: "Java básico",
        lessons: ["JDK, JVM e primeiro programa", "Tipos e operadores", "Controle de fluxo", "Arrays e Strings"],
      },
      {
        title: "Orientação a objetos",
        lessons: [
          "Classes e objetos",
          "Encapsulamento",
          "Herança e polimorfismo",
          "Interfaces e classes abstratas",
        ],
      },
      {
        title: "Java profissional",
        lessons: ["Collections Framework", "Generics", "Exceções", "Streams e lambdas"],
      },
      {
        title: "Avançado",
        lessons: ["Threads e concorrência", "JDBC e banco de dados", "Testes com JUnit", "Maven e build"],
      },
    ],
  },
  {
    slug: "spring-boot",
    title: "Spring Boot",
    icon: "🍃",
    level: "Avançado",
    hours: "20h",
    category: "Backend",
    lang: "java",
    desc: "APIs REST profissionais com segurança, banco e deploy.",
    modules: [
      {
        title: "Fundamentos",
        lessons: ["Injeção de dependência", "Controllers e rotas", "DTOs e validação", "Tratamento de erros"],
      },
      {
        title: "Persistência",
        lessons: ["JPA e Hibernate", "Relacionamentos", "Queries e paginação", "Migrations com Flyway"],
      },
      {
        title: "Segurança e produção",
        lessons: ["Spring Security e JWT", "Perfis e configuração", "Testes de integração", "Deploy com Docker"],
      },
    ],
  },
  {
    slug: "nodejs",
    title: "Node.js & APIs",
    icon: "⬢",
    level: "Intermediário",
    hours: "16h",
    category: "Backend",
    lang: "javascript",
    desc: "Construa servidores e APIs REST com JavaScript no backend.",
    modules: [
      {
        title: "Fundamentos",
        lessons: ["Runtime e módulos", "npm e scripts", "File system e streams", "Variáveis de ambiente"],
      },
      {
        title: "APIs REST",
        lessons: ["Rotas e middlewares", "CRUD completo", "Validação e erros", "Autenticação com JWT"],
      },
      {
        title: "Produção",
        lessons: ["Banco de dados", "Testes automatizados", "Logs e monitoramento", "Deploy"],
      },
    ],
  },
  {
    slug: "sql",
    title: "SQL & Banco de Dados",
    icon: "🗄",
    level: "Iniciante",
    hours: "12h",
    category: "Backend",
    lang: "sqlite3",
    desc: "Modele, consulte e otimize dados relacionais.",
    modules: [
      {
        title: "Consultas",
        lessons: ["SELECT, WHERE e ORDER BY", "Funções de agregação", "GROUP BY e HAVING", "Subconsultas"],
      },
      {
        title: "Modelagem",
        lessons: ["Tabelas, tipos e chaves", "Relacionamentos e JOINs", "Normalização", "Constraints"],
      },
      {
        title: "Avançado",
        lessons: ["Índices e performance", "Transações", "Views e procedures", "Window functions"],
      },
    ],
  },
  {
    slug: "estruturas-de-dados",
    title: "Estruturas de Dados & Algoritmos",
    icon: "Σ",
    level: "Avançado",
    hours: "22h",
    tag: "Entrevistas",
    category: "Fundamentos",
    lang: "python",
    desc: "Prepare-se para entrevistas técnicas e escreva código eficiente.",
    modules: [
      {
        title: "Complexidade",
        lessons: ["Notação Big-O", "Tempo x espaço", "Analisando laços", "Casos médio e pior"],
      },
      {
        title: "Estruturas lineares",
        lessons: ["Arrays e strings", "Listas ligadas", "Pilhas e filas", "Hash tables"],
      },
      {
        title: "Estruturas não lineares",
        lessons: ["Árvores binárias e BST", "Heaps", "Grafos: BFS e DFS", "Tries"],
      },
      {
        title: "Algoritmos",
        lessons: [
          "Ordenação e busca binária",
          "Recursão e backtracking",
          "Programação dinâmica",
          "Algoritmos gulosos",
        ],
      },
    ],
  },
  {
    slug: "ciencia-de-dados",
    title: "Ciência de Dados com Python",
    icon: "📊",
    level: "Intermediário",
    hours: "18h",
    category: "Dados & IA",
    lang: "python",
    desc: "Analise, limpe e visualize dados para gerar decisões.",
    modules: [
      {
        title: "Manipulação",
        lessons: ["NumPy essencial", "Pandas: Series e DataFrames", "Limpeza de dados", "Agrupamentos e merges"],
      },
      {
        title: "Visualização",
        lessons: ["Gráficos com Matplotlib", "Boas práticas visuais", "Análise exploratória", "Storytelling com dados"],
      },
      {
        title: "Estatística aplicada",
        lessons: ["Medidas e distribuições", "Correlação", "Testes de hipótese", "Projeto de análise"],
      },
    ],
  },
  {
    slug: "machine-learning",
    title: "Machine Learning",
    icon: "🤖",
    level: "Avançado",
    hours: "20h",
    category: "Dados & IA",
    lang: "python",
    desc: "Treine modelos preditivos e entenda o que acontece por baixo.",
    modules: [
      {
        title: "Fundamentos",
        lessons: ["Aprendizado supervisionado", "Treino, validação e teste", "Métricas de avaliação", "Overfitting"],
      },
      {
        title: "Modelos clássicos",
        lessons: ["Regressão linear e logística", "Árvores e random forest", "KNN e SVM", "Clusterização"],
      },
      {
        title: "Avançado",
        lessons: ["Feature engineering", "Redes neurais introdutórias", "Pipelines com scikit-learn", "Projeto final"],
      },
    ],
  },
  {
    slug: "prompt-engineering",
    title: "IA para Desenvolvedores",
    icon: "✨",
    level: "Intermediário",
    hours: "8h",
    tag: "Novo",
    category: "Dados & IA",
    lang: "python",
    desc: "Use IA como copiloto sem perder o domínio do seu código.",
    modules: [
      {
        title: "Prompting",
        lessons: ["Anatomia de um bom prompt", "Contexto e exemplos", "Refinamento iterativo", "Armadilhas comuns"],
      },
      {
        title: "No fluxo de trabalho",
        lessons: ["Revisão de código com IA", "Testes gerados", "Documentação automática", "Consumindo APIs de LLM"],
      },
    ],
  },
  {
    slug: "react-native",
    title: "React Native",
    icon: "📱",
    level: "Avançado",
    hours: "16h",
    category: "Mobile",
    lang: "javascript",
    desc: "Apps para Android e iOS com o que você já sabe de React.",
    modules: [
      {
        title: "Fundamentos",
        lessons: ["Setup e emuladores", "Componentes nativos", "Estilos e layout", "Navegação"],
      },
      {
        title: "Recursos do device",
        lessons: ["Câmera e permissões", "Armazenamento local", "Notificações", "APIs e offline"],
      },
      {
        title: "Publicação",
        lessons: ["Build e assinatura", "Publicação nas lojas", "Atualizações OTA"],
      },
    ],
  },
  {
    slug: "docker-devops",
    title: "Docker & DevOps",
    icon: "🐳",
    level: "Avançado",
    hours: "14h",
    category: "DevOps & Carreira",
    lang: "bash",
    desc: "Empacote, automatize e coloque suas aplicações no ar.",
    modules: [
      {
        title: "Containers",
        lessons: ["Imagens e containers", "Dockerfile", "Volumes e redes", "Docker Compose"],
      },
      {
        title: "Automação",
        lessons: ["CI/CD com GitHub Actions", "Testes no pipeline", "Variáveis e secrets", "Deploy contínuo"],
      },
      {
        title: "Operação",
        lessons: ["Logs e monitoramento", "Escalabilidade básica", "Segurança em produção"],
      },
    ],
  },
  {
    slug: "carreira-dev",
    title: "Carreira Dev",
    icon: "🎯",
    level: "Iniciante",
    hours: "6h",
    category: "DevOps & Carreira",
    lang: "bash",
    desc: "Portfólio, currículo e entrevistas para a primeira vaga.",
    modules: [
      {
        title: "Portfólio",
        lessons: ["Projetos que impressionam", "README que vende", "GitHub organizado", "Deploy dos projetos"],
      },
      {
        title: "Processo seletivo",
        lessons: ["Currículo de dev", "LinkedIn na prática", "Entrevista técnica", "Negociação de salário"],
      },
    ],
  },
].map((c) => ({
  ...c,
  modules: [...c.modules, ...(extraModules[c.slug] ?? [])],
}));

export function getCourse(slug: string) {
  return courses.find((c) => c.slug === slug);
}


export function countLessons(course: Course) {
  return course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
}

export const totalLessons = courses.reduce((a, c) => a + countLessons(c), 0);
