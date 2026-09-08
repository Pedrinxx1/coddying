// Módulos extras que aprofundam cada curso do nível intermediário ao avançado.
// São mesclados ao final dos módulos base em courses.ts.

export const extraModules: Record<string, { title: string; lessons: string[] }[]> = {
  "logica-de-programacao": [
    {
      title: "Estruturas de dados na prática",
      lessons: ["Listas e índices", "Dicionários (chave e valor)", "Matrizes e laços aninhados", "Pilha e fila no dia a dia"],
    },
    {
      title: "Resolvendo problemas reais",
      lessons: ["Recursão e caso base", "Complexidade: por que fica lento", "Depurando com prints e testes", "Projeto: caixa de mercado"],
    },
  ],
  "html-css": [
    {
      title: "Layout moderno",
      lessons: ["Flexbox a fundo", "Grid a fundo", "Responsividade e media queries", "Variáveis CSS e tema escuro"],
    },
    {
      title: "Acabamento profissional",
      lessons: ["Animações e transições", "Acessibilidade na prática", "Formulários avançados", "Performance e imagens", "Projeto: landing page completa"],
    },
  ],
  "git-github": [
    {
      title: "Trabalho em equipe",
      lessons: ["Branches e pull requests", "Resolvendo conflitos de merge", "Rebase e histórico limpo", "Code review sem drama"],
    },
    {
      title: "Automação",
      lessons: ["GitHub Actions básico", "Protegendo a branch main", "Versionamento semântico", "Open source: primeira contribuição"],
    },
  ],
  javascript: [
    {
      title: "JavaScript moderno",
      lessons: ["Desestruturação e spread", "Módulos import/export", "Classes e protótipos", "Tratamento de erros com try/catch"],
    },
    {
      title: "Assíncrono e APIs",
      lessons: ["Callbacks, promises e event loop", "async/await na prática", "Consumindo API com fetch", "Erros de rede e estados de carregamento"],
    },
    {
      title: "Navegador a fundo",
      lessons: ["DOM e eventos avançados", "LocalStorage e sessão", "Projeto: lista de tarefas com API"],
    },
  ],
  typescript: [
    {
      title: "Tipos avançados",
      lessons: ["Generics na prática", "Narrowing e type guards", "Tipos utilitários (Partial, Pick, Omit)", "Tipando APIs e respostas"],
    },
    {
      title: "TypeScript em projetos",
      lessons: ["tsconfig e modo estrito", "Tipando React com props", "Migrando um projeto JS", "Erros comuns de tipagem"],
    },
  ],
  react: [
    {
      title: "Hooks a fundo",
      lessons: ["useEffect e ciclo de vida", "useMemo e useCallback", "useContext e estado global", "Criando seu próprio hook"],
    },
    {
      title: "Aplicações reais",
      lessons: ["Consumindo API com estados de carregamento", "Formulários e validação", "Rotas e navegação", "Performance e re-renders", "Projeto: painel com autenticação"],
    },
  ],
  "tailwind-css": [
    {
      title: "Design system",
      lessons: ["Tema, cores e tokens", "Componentes reutilizáveis", "Dark mode", "Responsividade com breakpoints"],
    },
  ],
  python: [
    {
      title: "Código organizado e dados",
      lessons: ["Argumentos posicionais, nomeados, *args e **kwargs", "Manipulação de arquivos grandes", "Datas, horários e fusos", "Expressões regulares", "Projeto: importador de dados"],
    },
    {
      title: "Engenharia e automação",
      lessons: ["Logging e diagnóstico", "Interfaces de linha de comando", "Concorrência com asyncio", "Profiling e otimização", "Empacotamento e publicação"],
    },
  ],
  java: [
    {
      title: "Orientação a objetos a fundo",
      lessons: ["Classes, construtores e encapsulamento", "Herança e polimorfismo", "Interfaces e classes abstratas", "Exceções checadas"],
    },
    {
      title: "Java moderno",
      lessons: ["Collections e generics", "Streams e lambdas", "Testes com JUnit", "Projeto: sistema bancário"],
    },
  ],
  "spring-boot": [
    {
      title: "API na prática",
      lessons: ["Controllers e rotas REST", "Validação de entrada", "JPA e banco de dados", "Tratamento global de erros"],
    },
    {
      title: "Produção",
      lessons: ["Autenticação com JWT", "Testes de integração", "Perfis e configuração", "Deploy com Docker"],
    },
  ],
  nodejs: [
    {
      title: "APIs REST com Express",
      lessons: ["Rotas e middlewares", "Validação e status HTTP", "Autenticação com JWT", "Conectando ao banco de dados"],
    },
    {
      title: "Node em produção",
      lessons: ["Variáveis de ambiente e segredos", "Logs e tratamento de erros", "Testes automatizados", "Deploy e monitoramento"],
    },
  ],
  sql: [
    {
      title: "Consultas avançadas",
      lessons: ["Joins na prática", "Agregações com GROUP BY e HAVING", "Subconsultas e CTEs", "Funções de janela"],
    },
    {
      title: "Banco na vida real",
      lessons: ["Modelagem e normalização", "Índices e performance", "Transações e integridade", "Projeto: relatório de vendas"],
    },
  ],
  "estruturas-de-dados": [
    {
      title: "Estruturas fundamentais",
      lessons: ["Pilhas e filas", "Listas ligadas", "Tabelas hash", "Árvores binárias de busca", "Grafos e travessias"],
    },
    {
      title: "Algoritmos clássicos",
      lessons: ["Ordenação: bubble, merge e quick", "Busca binária", "Recursão e memoização", "Complexidade Big O na prática", "Resolvendo desafios de entrevista"],
    },
  ],
  "ciencia-de-dados": [
    {
      title: "Manipulação de dados",
      lessons: ["Pandas: séries e dataframes", "Limpeza de dados faltantes", "Agrupamentos e junções", "NumPy e operações vetoriais"],
    },
    {
      title: "Análise e comunicação",
      lessons: ["Estatística descritiva", "Visualização de dados", "Contando histórias com dados", "Projeto: análise de vendas"],
    },
  ],
  "machine-learning": [
    {
      title: "Modelos supervisionados",
      lessons: ["Regressão linear", "Classificação e árvores de decisão", "Treino, validação e teste", "Overfitting e regularização"],
    },
    {
      title: "Avaliação e produção",
      lessons: ["Métricas: precisão, recall e F1", "Validação cruzada", "Engenharia de atributos", "Colocando um modelo em produção"],
    },
  ],
  "prompt-engineering": [
    {
      title: "Aplicando IA no trabalho",
      lessons: ["Prompts com contexto e exemplos", "Revisão de código com IA", "Limites e alucinações", "Automatizando tarefas repetitivas"],
    },
  ],
  "react-native": [
    {
      title: "Construindo o app",
      lessons: ["Componentes nativos e estilos", "Navegação entre telas", "Listas e performance", "Consumindo API e estado offline"],
    },
    {
      title: "Publicando",
      lessons: ["Permissões e recursos do aparelho", "Notificações push", "Build e publicação nas lojas", "Projeto: app de tarefas"],
    },
  ],
  "docker-devops": [
    {
      title: "Containers a fundo",
      lessons: ["Dockerfile e camadas", "Volumes e dados persistentes", "Docker Compose com banco", "Variáveis de ambiente e segredos"],
    },
    {
      title: "Entrega contínua",
      lessons: ["Pipeline de CI com testes", "Deploy automático (CD)", "Introdução a Kubernetes", "Logs e monitoramento"],
    },
  ],
  "carreira-dev": [
    {
      title: "Portfólio que convence",
      lessons: ["Escolhendo projetos de portfólio", "README que vende o projeto", "Deploy e domínio próprio", "Contribuindo em open source"],
    },
    {
      title: "Mercado",
      lessons: ["Entrevista técnica: como pensar em voz alta", "Freelance e primeiros clientes", "Soft skills no time", "Plano de estudo contínuo"],
    },
  ],
};
