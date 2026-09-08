// Biblioteca de conteúdo real das lições.
// Cada tópico traz explicação profunda, exemplo comentado, erros comuns,
// perguntas de quiz e (quando faz sentido) um exercício com saída esperada.
import { extraTopics } from "./lessonTopicsExtra";

export type QuizQuestion = {
  q: string;
  options: string[];
  answer: number;
  why: string;
};

export type Topic = {
  id: string;
  title: string;
  keys: string[]; // palavras-chave do título da lição (sem acento, minúsculas)
  langs?: string[]; // restringe a linguagens específicas
  intro: string;
  deep: string[]; // parágrafos de aprofundamento
  example: { language: string; code: string; explain: string };
  pitfalls: string[];
  quiz: QuizQuestion[];
  exercise?: { prompt: string; starter: string; expected: string; language?: string };
};

const baseTopics: Topic[] = [
  {
    id: "algoritmo",
    title: "Algoritmos e pensamento computacional",
    keys: ["algoritmo", "pseudocodigo", "fluxograma", "programar de verdade", "pensar", "decompondo", "problemas"],
    intro:
      "Um algoritmo é uma sequência finita de passos não ambíguos que transforma uma entrada em uma saída. Programar é, antes de tudo, descrever esses passos com precisão suficiente para uma máquina executar sem interpretar nada por conta própria.",
    deep: [
      "Todo algoritmo tem três partes: entrada (o que você recebe), processamento (as regras) e saída (o resultado). Quando um programa dá errado, quase sempre uma dessas três está mal definida — normalmente a do meio, porque a regra que você tinha na cabeça não era a regra que você escreveu.",
      "A técnica mais útil no começo é a decomposição: quebrar um problema grande em subproblemas que você já sabe resolver. 'Fazer um caixa de mercado' é vago; 'ler preços', 'somar', 'aplicar desconto', 'formatar o total' são quatro problemas pequenos e testáveis.",
      "Antes de codar, escreva o pseudocódigo em português. Se você não consegue explicar o passo a passo para outra pessoa, não é a linguagem que está te travando — é o algoritmo que ainda não existe.",
    ],
    example: {
      language: "python",
      code: `# Algoritmo: média de notas e aprovação
# 1) entrada
notas = [7.5, 6.0, 9.0]

# 2) processamento
soma = 0
for nota in notas:
    soma = soma + nota
media = soma / len(notas)

# 3) saída
print(media)
print("Aprovado" if media >= 7 else "Reprovado")`,
      explain:
        "Repare que cada bloco corresponde a uma parte do algoritmo. Se a média sair errada, o problema está no bloco 2, não no print.",
    },
    pitfalls: [
      "Começar a digitar código antes de saber o passo a passo em português.",
      "Passos ambíguos como 'calcular o desconto' sem dizer a regra exata do desconto.",
      "Esquecer os casos extremos: lista vazia, número zero, texto no lugar de número.",
    ],
    quiz: [
      {
        q: "O que caracteriza um algoritmo?",
        options: [
          "Qualquer código escrito em uma linguagem de programação",
          "Uma sequência finita de passos não ambíguos que resolve um problema",
          "Um programa que roda sem erros",
          "Um diagrama desenhado antes de programar",
        ],
        answer: 1,
        why: "Algoritmo é a receita: finita, clara e independente de linguagem.",
      },
      {
        q: "Você precisa somar o carrinho de compras. Qual é o melhor primeiro passo?",
        options: [
          "Escolher o framework",
          "Escrever o passo a passo em português e listar entradas e saídas",
          "Criar o banco de dados",
          "Procurar uma biblioteca pronta",
        ],
        answer: 1,
        why: "Definir entrada, processamento e saída evita reescrever o código três vezes.",
      },
    ],
  },
  {
    id: "erros",
    title: "Ler mensagens de erro",
    keys: ["erro", "erros", "panico", "debug", "depurar", "excecao", "tratamento"],
    intro:
      "Mensagem de erro não é castigo: é a única parte do computador que está tentando te ajudar. Ela quase sempre diz o tipo do problema, a linha e o valor que causou tudo.",
    deep: [
      "Leia de baixo para cima. A última linha traz o tipo do erro (por exemplo TypeError, NameError, NullPointerException) e a mensagem. As linhas acima são o 'stack trace': o caminho que o programa percorreu até quebrar. A linha do SEU arquivo é a que interessa.",
      "Erros de sintaxe acontecem antes de rodar (falta um parêntese, dois pontos, chave). Erros de execução acontecem no meio da corrida (dividir por zero, acessar índice inexistente). Erros de lógica não geram mensagem nenhuma — o programa roda e devolve a resposta errada; esses só aparecem com testes.",
      "Técnica prática: reduza. Comente metade do código, rode, e veja se o erro continua. Em três ou quatro cortes você isola a linha culpada. Isso se chama busca binária de bug e vale mais que qualquer palpite.",
    ],
    example: {
      language: "python",
      code: `numeros = [1, 2, 3]

try:
    print(numeros[5])
except IndexError as e:
    print("Deu erro:", e)   # list index out of range

# Erro de lógica: nenhuma mensagem, resultado errado
media = sum(numeros) / 2   # deveria ser len(numeros)
print(media)`,
      explain:
        "O primeiro erro grita. O segundo fica quieto e entrega 3.0 em vez de 2.0 — por isso testar valores conhecidos é obrigatório.",
    },
    pitfalls: [
      "Ler só a primeira linha do erro e ignorar o tipo na última.",
      "Mudar código aleatoriamente até 'parar de reclamar'.",
      "Capturar exceções com um except vazio e esconder o problema real.",
    ],
    quiz: [
      {
        q: "Em um stack trace, qual linha costuma interessar mais?",
        options: [
          "A primeira, sempre",
          "A última linha com o tipo do erro e a linha do seu próprio arquivo",
          "As linhas de dentro das bibliotecas",
          "Nenhuma, é só ruído",
        ],
        answer: 1,
        why: "O tipo do erro define a categoria e o seu arquivo aponta onde agir.",
      },
      {
        q: "Um programa roda sem erro mas devolve o resultado errado. Isso é:",
        options: ["Erro de sintaxe", "Erro de lógica", "Erro de compilação", "Erro do sistema operacional"],
        answer: 1,
        why: "Sem mensagem e com resposta errada = lógica.",
      },
    ],
  },
  {
    id: "variaveis",
    title: "Variáveis e tipos de dados",
    keys: ["variavel", "variaveis", "tipos", "tipo de dados", "constantes", "let", "const", "var", "declaracao"],
    intro:
      "Variável é um nome apontando para um valor na memória. O nome é para você; o valor e o tipo é o que a máquina realmente usa — e o tipo define quais operações são válidas.",
    deep: [
      "Tipos primitivos comuns: número inteiro, número decimal, texto (string), booleano (verdadeiro/falso) e nulo/vazio. Somar dois números dá conta; 'somar' dois textos concatena. Misturar tipos sem perceber é a origem de metade dos bugs de iniciante.",
      "Prefira nomes que digam a intenção: totalCarrinho é melhor que x, tc ou total2. Código é lido muito mais vezes do que é escrito.",
      "Use constantes para valores que não devem mudar. Em JavaScript, const impede reatribuição (mas o conteúdo de um objeto ainda pode mudar); em Python a convenção é escrever o nome em MAIÚSCULAS.",
    ],
    example: {
      language: "javascript",
      code: `const IVA = 0.1;            // constante: não muda
let precoBase = 100;        // muda ao longo do programa
const nome = "Notebook";    // string
const emEstoque = true;     // booleano

const total = precoBase + precoBase * IVA;
console.log(typeof total, total);        // number 110
console.log("Preço: " + total);          // vira string por concatenação
console.log(nome.toUpperCase(), emEstoque);`,
      explain:
        "Note o typeof: entender o tipo antes de operar evita o clássico '1' + 1 = '11'.",
    },
    pitfalls: [
      "Somar texto com número sem converter (resultado grudado em vez de somado).",
      "Reatribuir uma constante e receber erro de atribuição.",
      "Nomes genéricos (a, b, dado) que tornam o código impossível de reler.",
    ],
    quiz: [
      {
        q: 'Em JavaScript, quanto vale "5" + 2?',
        options: ["7", '"52"', "Erro", "NaN"],
        answer: 1,
        why: "Com string de um lado, o + concatena em vez de somar.",
      },
      {
        q: "Para que serve declarar uma constante?",
        options: [
          "Deixar o programa mais rápido",
          "Impedir reatribuição e comunicar que o valor é fixo",
          "Economizar memória",
          "Permitir usar a variável em qualquer arquivo",
        ],
        answer: 1,
        why: "É uma trava de intenção: quem lê sabe que aquilo não muda.",
      },
    ],
  },
  {
    id: "condicionais",
    title: "Condicionais",
    keys: ["condicional", "condicionais", "if", "else", "switch", "operadores logicos", "comparacao", "booleano"],
    intro:
      "Condicionais fazem o programa escolher caminhos. Toda condição termina reduzida a verdadeiro ou falso — o resto é combinação com E, OU e NÃO.",
    deep: [
      "Ordem importa: as condições são testadas de cima para baixo e a primeira verdadeira ganha. Por isso a regra mais específica vem antes da mais genérica; senão a genérica engole todos os casos.",
      "Cuidado com igualdade: em muitas linguagens == compara valor com conversão de tipo e === compara valor e tipo. Em JavaScript, use sempre === salvo motivo forte.",
      "Condições longas viram nomes: em vez de if (idade >= 18 && temDocumento && !bloqueado), crie podeEntrar = ... e escreva if (podeEntrar). O compilador não liga, o seu cérebro liga.",
    ],
    example: {
      language: "javascript",
      code: `function faixa(nota) {
  if (nota >= 9) return "Excelente";
  if (nota >= 7) return "Aprovado";
  if (nota >= 5) return "Recuperação";
  return "Reprovado";
}

console.log(faixa(9.5), faixa(7), faixa(5.5), faixa(2));

const idade = 20, temDocumento = true;
const podeEntrar = idade >= 18 && temDocumento;
console.log(podeEntrar ? "Pode entrar" : "Não pode");`,
      explain:
        "Se a checagem de 5 viesse antes da de 9, nota 9.5 cairia em 'Recuperação'. Ordem do mais específico para o mais geral.",
    },
    pitfalls: [
      "Trocar = (atribuição) por == / === (comparação).",
      "Colocar a condição genérica antes da específica.",
      "Encadear ifs profundos em vez de retornar cedo.",
    ],
    quiz: [
      {
        q: "Qual a diferença entre == e === em JavaScript?",
        options: [
          "Nenhuma",
          "=== compara valor e tipo, == converte o tipo antes de comparar",
          "== é mais rápido",
          "=== só funciona com números",
        ],
        answer: 1,
        why: '0 == "0" é true, mas 0 === "0" é false.',
      },
      {
        q: "Por que a condição mais específica deve vir primeiro?",
        options: [
          "Por performance",
          "Porque a primeira condição verdadeira encerra a cadeia",
          "É só estilo",
          "Porque o else exige isso",
        ],
        answer: 1,
        why: "A cadeia para na primeira verdadeira, então a genérica capturaria tudo.",
      },
    ],
  },
  {
    id: "lacos",
    title: "Laços de repetição",
    keys: ["laco", "lacos", "loop", "for", "while", "repeticao", "iteracao", "iterar"],
    intro:
      "Laço é repetição controlada. Use for quando você sabe quantas vezes vai repetir (ou percorre uma coleção) e while quando a parada depende de uma condição que muda no meio do caminho.",
    deep: [
      "Todo laço precisa de três coisas: um ponto de partida, uma condição de continuação e algo que muda a cada volta. Se a terceira falta, o laço é infinito — travamento clássico.",
      "break sai do laço imediatamente; continue pula para a próxima volta. Ambos são úteis, mas laços cheios de break aninhado costumam pedir uma função com return.",
      "Acumuladores (soma, contagem, maior valor) seguem sempre o mesmo padrão: inicializa antes do laço, atualiza dentro, usa depois. Inicializar dentro do laço é o erro número um.",
    ],
    example: {
      language: "python",
      code: `# for: número conhecido de repetições
total = 0
for n in range(1, 6):      # 1,2,3,4,5
    total += n
print(total)               # 15

# while: para quando a condição muda
senha = ""
tentativas = 0
while senha != "abrir" and tentativas < 3:
    tentativas += 1
    senha = "abrir" if tentativas == 2 else "erro"
print(tentativas)          # 2`,
      explain:
        "range(1, 6) vai até 5: o fim é exclusivo. O acumulador total é criado ANTES do for e usado depois.",
    },
    pitfalls: [
      "Esquecer de atualizar a variável de controle no while → laço infinito.",
      "Confundir limites: range(1,5) não inclui o 5.",
      "Zerar o acumulador dentro do laço, perdendo tudo a cada volta.",
    ],
    quiz: [
      {
        q: "Quantas voltas dá for n in range(1, 6)?",
        options: ["4", "5", "6", "7"],
        answer: 1,
        why: "De 1 a 5: o limite superior é exclusivo.",
      },
      {
        q: "O que causa um laço infinito em um while?",
        options: [
          "Usar break",
          "A condição nunca se tornar falsa porque nada muda dentro do laço",
          "Usar for junto",
          "Declarar variáveis dentro",
        ],
        answer: 1,
        why: "Sem mudança de estado, a condição fica verdadeira para sempre.",
      },
    ],
    exercise: {
      prompt: "Use um laço para somar os números de 1 a 5 e imprimir 15.",
      starter: `total = 0\nfor n in range(1, 6):\n    pass  # troque por total += n\nprint(total)`,
      expected: "15",
      language: "python",
    },
  },
  {
    id: "funcoes",
    title: "Funções, parâmetros e retorno",
    keys: ["funcao", "funcoes", "parametro", "parametros", "retorno", "escopo", "arrow", "metodo", "metodos"],
    intro:
      "Função é um bloco com nome que recebe entradas e devolve uma saída. É a ferramenta principal para não repetir código e para testar pedaços isolados do programa.",
    deep: [
      "Parâmetro é o nome na definição; argumento é o valor passado na chamada. Uma boa função tem poucos parâmetros e uma única responsabilidade — se o nome precisa de um 'e' ('salvaEEnvia'), provavelmente são duas funções.",
      "Retorno encerra a função na hora. Funções que só imprimem são difíceis de testar; prefira retornar o valor e deixar quem chamou decidir o que fazer com ele.",
      "Escopo: variáveis criadas dentro da função só existem lá dentro. Isso é proteção, não limitação — evita que uma parte do programa estrague a outra sem querer.",
    ],
    example: {
      language: "javascript",
      code: `function calcularTotal(precos, desconto = 0) {
  const soma = precos.reduce((acc, p) => acc + p, 0);
  return soma - soma * desconto;   // retorna, não imprime
}

const total = calcularTotal([10, 20, 30], 0.1);
console.log(total);   // 54

// arrow function equivalente
const dobro = (n) => n * 2;
console.log(dobro(21));   // 42`,
      explain:
        "desconto tem valor padrão: chamar sem ele funciona. A função devolve o número; quem chama decide imprimir, salvar ou somar.",
    },
    pitfalls: [
      "Esquecer o return e receber undefined/None.",
      "Função que faz cinco coisas diferentes e ninguém consegue reaproveitar.",
      "Depender de variáveis globais em vez de receber parâmetros.",
    ],
    quiz: [
      {
        q: "O que uma função sem return devolve?",
        options: ["Zero", "undefined / None", "O último valor calculado", "Erro"],
        answer: 1,
        why: "Sem return explícito a função devolve o valor vazio da linguagem.",
      },
      {
        q: "Por que preferir retornar em vez de imprimir dentro da função?",
        options: [
          "É mais rápido",
          "Porque o valor pode ser testado e reaproveitado por quem chamou",
          "Porque print não existe em produção",
          "Não há diferença",
        ],
        answer: 1,
        why: "Retornar separa cálculo de apresentação — base de código testável.",
      },
    ],
  },
  {
    id: "colecoes",
    title: "Listas, arrays e dicionários",
    keys: ["lista", "listas", "array", "arrays", "dicionario", "objeto", "objetos", "map", "filter", "reduce", "colecoes", "tupla", "set"],
    intro:
      "Listas guardam valores em ordem, acessados por índice. Dicionários (objetos) guardam pares chave→valor, acessados por nome. Escolher a estrutura certa resolve metade do problema antes do primeiro laço.",
    deep: [
      "Índices começam em zero. O último item é tamanho - 1; acessar tamanho direto estoura o limite. Esse é o erro 'index out of range'.",
      "map transforma cada item (mesma quantidade de saída), filter seleciona itens (menos ou igual), reduce condensa a coleção em um único valor. Aprender esses três substitui a maioria dos laços manuais e deixa a intenção explícita.",
      "Use dicionário quando a busca é por identidade (por id, por nome) — é praticamente instantânea. Percorrer uma lista inteira para achar um item é O(n) e fica lento conforme os dados crescem.",
    ],
    example: {
      language: "javascript",
      code: `const produtos = [
  { nome: "Mouse", preco: 80 },
  { nome: "Teclado", preco: 150 },
  { nome: "Monitor", preco: 900 },
];

const nomes = produtos.map((p) => p.nome);
const baratos = produtos.filter((p) => p.preco < 200);
const total = produtos.reduce((acc, p) => acc + p.preco, 0);

console.log(nomes);            // ["Mouse","Teclado","Monitor"]
console.log(baratos.length);   // 2
console.log(total);            // 1130

const porNome = Object.fromEntries(produtos.map((p) => [p.nome, p.preco]));
console.log(porNome["Monitor"]);  // 900 — busca direta`,
      explain:
        "map/filter/reduce dizem O QUE você quer; o laço diria apenas COMO. O dicionário porNome troca busca linear por acesso direto.",
    },
    pitfalls: [
      "Acessar lista[tamanho] em vez de lista[tamanho - 1].",
      "Modificar a lista enquanto a percorre (pula itens).",
      "Usar filter quando queria find — um devolve lista, o outro devolve o item.",
    ],
    quiz: [
      {
        q: "Qual método devolve um novo array com a mesma quantidade de itens transformados?",
        options: ["filter", "map", "reduce", "find"],
        answer: 1,
        why: "map transforma item a item mantendo o tamanho.",
      },
      {
        q: "Qual é o índice do último item de uma lista com 4 elementos?",
        options: ["4", "3", "0", "Depende da linguagem"],
        answer: 1,
        why: "Índices vão de 0 a tamanho - 1.",
      },
    ],
  },
  {
    id: "html-estrutura",
    title: "Estrutura e semântica em HTML",
    keys: ["html", "tag", "tags", "semantica", "estrutura", "formulario", "acessibilidade", "documento", "links", "imagens", "listas e tabelas"],
    langs: ["html", "css"],
    intro:
      "HTML descreve o significado do conteúdo, não a aparência. Escolher a tag certa dá acessibilidade, SEO e navegação por teclado de graça.",
    deep: [
      "Um documento tem uma única <h1> e hierarquia de títulos sem pular níveis. Leitores de tela navegam por esses títulos como se fossem um índice.",
      "Tags semânticas (header, nav, main, section, article, footer) substituem a sopa de <div>. Elas não mudam o visual, mudam o que a tecnologia assistiva e o Google entendem.",
      "Formulários precisam de <label for> ligado ao id do campo, tipos corretos (email, tel, number) e um botão de submit real. Imagem informativa precisa de alt descrevendo o conteúdo; imagem decorativa leva alt vazio.",
    ],
    example: {
      language: "html",
      code: `<!doctype html>
<html lang="pt-BR">
  <head><meta charset="utf-8" /><title>Contato</title></head>
  <body style="font-family:system-ui;padding:2rem">
    <header><h1>Fale com a gente</h1></header>
    <main>
      <form>
        <label for="email">Seu e-mail</label>
        <input id="email" type="email" required />
        <button type="submit">Enviar</button>
      </form>
      <img src="https://placehold.co/120" alt="Logotipo da empresa" />
    </main>
  </body>
</html>`,
      explain:
        "Clique no texto do label: o foco vai para o campo. Isso só acontece porque for e id combinam.",
    },
    pitfalls: [
      "Usar <div> para tudo e perder semântica e acessibilidade.",
      "Imagem sem alt ou com alt='imagem'.",
      "Vários <h1> na mesma página ou títulos escolhidos pelo tamanho da fonte.",
    ],
    quiz: [
      {
        q: "Para que serve o atributo alt em uma imagem?",
        options: [
          "Deixar a imagem mais leve",
          "Descrever a imagem para leitores de tela e quando ela não carrega",
          "Definir o tamanho",
          "Melhorar a resolução",
        ],
        answer: 1,
        why: "É acessibilidade e também conteúdo indexável.",
      },
      {
        q: "Qual tag agrupa o conteúdo principal e único da página?",
        options: ["<section>", "<main>", "<div>", "<article>"],
        answer: 1,
        why: "<main> aparece uma vez e marca o conteúdo central.",
      },
    ],
  },
  {
    id: "css-layout",
    title: "CSS: box model, flexbox e grid",
    keys: ["css", "flexbox", "grid", "box model", "layout", "responsiv", "seletor", "seletores", "cores", "tipografia", "media queries", "animacoes", "posicionamento"],
    langs: ["html", "css"],
    intro:
      "Todo elemento é uma caixa: conteúdo, padding, borda e margem. Entender o box model resolve 80% dos 'por que isso não encaixa'.",
    deep: [
      "box-sizing: border-box faz largura incluir padding e borda — é o padrão que todo projeto moderno liga logo no começo. Sem ele, width: 100% mais padding estoura o container.",
      "Flexbox organiza em UMA direção (linha ou coluna): use para barras de navegação, cards lado a lado, centralização. Grid organiza em DUAS direções: use para layouts de página com linhas e colunas definidas.",
      "Responsividade começa pelo mobile: escreva o estilo base para tela pequena e use @media (min-width: ...) para adicionar o que a tela grande permite. Unidades relativas (rem, %, fr, clamp) evitam quebra em zoom.",
    ],
    example: {
      language: "html",
      code: `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8" /><style>
  * { box-sizing: border-box; }
  body { font-family: system-ui; margin: 0; padding: 1.5rem; background: #0b1020; color: #eee; }
  .cards { display: grid; gap: 1rem; grid-template-columns: 1fr; }
  .card { background: #161c33; padding: 1rem; border-radius: 12px; }
  .barra { display: flex; align-items: center; justify-content: space-between; }
  @media (min-width: 640px) { .cards { grid-template-columns: repeat(3, 1fr); } }
</style></head>
<body>
  <div class="barra"><strong>Loja</strong><span>Carrinho</span></div>
  <div class="cards">
    <div class="card">Um</div><div class="card">Dois</div><div class="card">Três</div>
  </div>
</body></html>`,
      explain:
        "Uma coluna no celular, três a partir de 640px. Flex cuida da barra (uma direção), grid cuida dos cards (duas).",
    },
    pitfalls: [
      "Esquecer box-sizing e brigar com larguras que estouram.",
      "Usar posicionamento absoluto para montar layout inteiro.",
      "Fixar tudo em pixels e quebrar em telas pequenas.",
    ],
    quiz: [
      {
        q: "Quando Grid é melhor que Flexbox?",
        options: [
          "Sempre",
          "Quando você precisa alinhar em duas dimensões (linhas e colunas)",
          "Só para textos",
          "Quando o layout é de uma direção só",
        ],
        answer: 1,
        why: "Flex é unidimensional; grid é bidimensional.",
      },
      {
        q: "O que box-sizing: border-box faz?",
        options: [
          "Adiciona borda a tudo",
          "Faz padding e borda entrarem na largura declarada",
          "Remove a margem",
          "Centraliza o elemento",
        ],
        answer: 1,
        why: "Sem ele, width: 100% + padding ultrapassa o container.",
      },
    ],
  },
  {
    id: "dom",
    title: "DOM e eventos",
    keys: ["dom", "evento", "eventos", "manipulacao", "querySelector", "addeventlistener", "interatividade"],
    intro:
      "O DOM é a representação em objetos da sua página. JavaScript lê e altera esses objetos, e o navegador redesenha a tela.",
    deep: [
      "Selecione com querySelector/querySelectorAll (mesma sintaxe do CSS). Guarde a referência em uma variável em vez de buscar o mesmo elemento várias vezes.",
      "Eventos são o coração da interatividade: addEventListener('click', fn) registra uma função para rodar quando algo acontece. O objeto event traz detalhes (qual tecla, qual alvo) e event.preventDefault() cancela o comportamento padrão — essencial em formulários.",
      "Eventos sobem pela árvore (bubbling). Isso permite delegação: um listener no container cuida de todos os filhos, inclusive os criados depois.",
    ],
    example: {
      language: "html",
      code: `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8" /></head>
<body style="font-family:system-ui;padding:2rem">
  <button id="btn">Cliquei 0 vezes</button>
  <ul id="lista"></ul>
  <script>
    const btn = document.querySelector("#btn");
    const lista = document.querySelector("#lista");
    let cliques = 0;

    btn.addEventListener("click", () => {
      cliques++;
      btn.textContent = "Cliquei " + cliques + " vezes";
      const li = document.createElement("li");
      li.textContent = "Clique " + cliques;
      lista.appendChild(li);
    });

    // delegação: funciona para itens criados depois
    lista.addEventListener("click", (e) => {
      if (e.target.tagName === "LI") e.target.remove();
    });
  </script>
</body></html>`,
      explain:
        "Clique no botão para criar itens; clique em um item para removê-lo. O segundo listener está no <ul>, não em cada <li>.",
    },
    pitfalls: [
      "Rodar o script antes do elemento existir (coloque no fim do body ou use DOMContentLoaded).",
      "Esquecer preventDefault e ver a página recarregar no submit.",
      "Criar um listener dentro de um laço e duplicar comportamentos.",
    ],
    quiz: [
      {
        q: "Para que serve event.preventDefault()?",
        options: [
          "Impedir o clique",
          "Cancelar o comportamento padrão do navegador, como recarregar no submit",
          "Parar o JavaScript",
          "Remover o elemento",
        ],
        answer: 1,
        why: "Muito usado em formulários tratados por JS.",
      },
      {
        q: "O que é delegação de eventos?",
        options: [
          "Um listener por elemento filho",
          "Um listener no container que trata eventos dos filhos graças ao bubbling",
          "Usar onclick no HTML",
          "Delegar para o servidor",
        ],
        answer: 1,
        why: "Funciona até para elementos criados depois do carregamento.",
      },
    ],
  },
  {
    id: "async",
    title: "Assíncrono: promises, async/await e fetch",
    keys: ["async", "assincron", "promise", "promises", "await", "fetch", "api", "requisicao", "callback", "http"],
    intro:
      "JavaScript roda em uma única linha de execução. Operações demoradas (rede, disco, timers) não param o programa: elas são agendadas e o resultado chega depois — daí promises e async/await.",
    deep: [
      "Uma Promise tem três estados: pendente, resolvida ou rejeitada. .then trata sucesso, .catch trata erro. async/await é açúcar sintático sobre isso: await espera a promise resolver sem travar o navegador.",
      "Com fetch, atenção: a promise só rejeita em falha de rede. Um 404 ou 500 resolve normalmente — você precisa checar response.ok. Esse é o bug mais comum de quem começa a consumir API.",
      "Sempre envolva await em try/catch e trate o estado de carregando e o de erro na interface. Requisições paralelas independentes usam Promise.all, que é muito mais rápido que awaits em sequência.",
    ],
    example: {
      language: "javascript",
      code: `async function buscarUsuario(id) {
  try {
    const resp = await fetch("https://jsonplaceholder.typicode.com/users/" + id);
    if (!resp.ok) throw new Error("HTTP " + resp.status);
    const user = await resp.json();
    return user.name;
  } catch (e) {
    return "Falhou: " + e.message;
  }
}

// paralelo: as duas requisições saem juntas
Promise.all([buscarUsuario(1), buscarUsuario(2)]).then((nomes) =>
  console.log(nomes.join(" e "))
);`,
      explain:
        "Sem o if (!resp.ok), um 404 seguiria adiante e quebraria no .json() com uma mensagem sem relação com o problema real.",
    },
    pitfalls: [
      "Esquecer o await e trabalhar com uma Promise em vez do valor.",
      "Não checar response.ok e tratar erro de servidor como sucesso.",
      "Encadear awaits em sequência quando as chamadas são independentes.",
    ],
    quiz: [
      {
        q: "O fetch rejeita a promise quando o servidor devolve 404?",
        options: ["Sim, sempre", "Não — só em falha de rede; é preciso checar response.ok", "Só com await", "Depende do navegador"],
        answer: 1,
        why: "Erros HTTP resolvem a promise normalmente.",
      },
      {
        q: "Qual a forma correta de rodar duas requisições independentes em paralelo?",
        options: ["await a; await b;", "Promise.all([a(), b()])", "setTimeout", "for com await dentro"],
        answer: 1,
        why: "Promise.all dispara as duas e espera ambas.",
      },
    ],
  },
  {
    id: "react-componentes",
    title: "Componentes, props e estado",
    keys: ["componente", "componentes", "props", "estado", "usestate", "jsx", "renderizacao", "listas e chaves", "eventos em react"],
    intro:
      "Em React a interface é função do estado: você não manda a tela mudar, você muda o estado e o React recalcula o que aparece.",
    deep: [
      "Props são dados que descem do pai e são somente leitura. Estado é interno ao componente e muda com o setter. Se dois componentes precisam do mesmo dado, suba o estado para o pai comum.",
      "Nunca modifique estado diretamente. setLista(lista) com o mesmo array não re-renderiza: crie um novo valor ([...lista, novo]) para o React perceber a mudança por identidade.",
      "Em listas, key deve ser um id estável. Usar o índice quebra a reconciliação quando itens são inseridos, removidos ou reordenados — campos digitados 'pulam' de linha.",
    ],
    example: {
      language: "javascript",
      code: `// Contador com estado + lista com key estável
function Tarefa({ texto, feito, onToggle }) {   // props
  return <li onClick={onToggle}>{feito ? "✔ " : "○ "}{texto}</li>;
}

function Lista() {
  const [itens, setItens] = React.useState([
    { id: 1, texto: "Estudar React", feito: false },
  ]);

  function toggle(id) {
    setItens((atual) =>
      atual.map((i) => (i.id === id ? { ...i, feito: !i.feito } : i))  // novo array
    );
  }

  return <ul>{itens.map((i) => (
    <Tarefa key={i.id} texto={i.texto} feito={i.feito} onToggle={() => toggle(i.id)} />
  ))}</ul>;
}`,
      explain:
        "map cria um array novo com um objeto novo só no item alterado. Nada é mutado, e a key vem do id.",
    },
    pitfalls: [
      "Mutar estado (push, atribuição direta) e a tela não atualizar.",
      "Usar o índice como key em listas dinâmicas.",
      "Colocar lógica pesada direto no corpo do componente a cada render.",
    ],
    quiz: [
      {
        q: "Por que itens.push(novo) + setItens(itens) não atualiza a tela?",
        options: [
          "Porque push é lento",
          "Porque a referência do array continua a mesma e o React não detecta mudança",
          "Porque push não existe",
          "Porque falta await",
        ],
        answer: 1,
        why: "React compara por identidade; é preciso um novo array.",
      },
      {
        q: "Props são:",
        options: ["Mutáveis pelo filho", "Somente leitura, vindas do pai", "Estado global", "Variáveis do navegador"],
        answer: 1,
        why: "Quem muda o dado é o dono do estado, no pai.",
      },
    ],
  },
  {
    id: "react-hooks",
    title: "Hooks: useEffect e além",
    keys: ["hook", "hooks", "useeffect", "efeito", "ciclo de vida", "usememo", "usecallback", "usecontext", "context", "custom hook"],
    intro:
      "Hooks dão estado e efeitos colaterais a componentes de função. A regra de ouro: só chame hooks no topo do componente, nunca dentro de if ou laço.",
    deep: [
      "useEffect roda depois da renderização. O array de dependências diz quando repetir: [] só na montagem, [id] a cada mudança de id, sem array a cada render (quase sempre um bug).",
      "Se o efeito cria algo contínuo (timer, subscription, listener, requisição), devolva uma função de limpeza. Sem ela, você acumula timers e atualiza componentes desmontados.",
      "useMemo memoriza um valor caro e useCallback memoriza uma função; use quando houver custo real medido, não por padrão. useContext evita passar props por muitos níveis, mas todo consumidor re-renderiza quando o valor muda.",
    ],
    example: {
      language: "javascript",
      code: `function Relogio({ ativo }) {
  const [segundos, setSegundos] = React.useState(0);

  React.useEffect(() => {
    if (!ativo) return;
    const id = setInterval(() => setSegundos((s) => s + 1), 1000);
    return () => clearInterval(id);   // limpeza obrigatória
  }, [ativo]);                        // repete quando 'ativo' muda

  return <p>{segundos}s</p>;
}`,
      explain:
        "Sem o clearInterval, alternar 'ativo' várias vezes deixaria vários timers rodando ao mesmo tempo.",
    },
    pitfalls: [
      "Omitir dependências e ler valores antigos (stale closure).",
      "Esquecer a função de limpeza e vazar timers/listeners.",
      "Chamar hook dentro de if — quebra a ordem que o React espera.",
    ],
    quiz: [
      {
        q: "useEffect com array de dependências vazio roda quando?",
        options: ["A cada render", "Só depois da primeira renderização", "Nunca", "Antes de renderizar"],
        answer: 1,
        why: "[] significa 'não depende de nada', então executa uma vez.",
      },
      {
        q: "Para que serve o return de um useEffect?",
        options: [
          "Devolver dados para a tela",
          "Limpar o que o efeito criou (timers, listeners, subscriptions)",
          "Cancelar o render",
          "Nada",
        ],
        answer: 1,
        why: "Roda na desmontagem e antes de repetir o efeito.",
      },
    ],
  },
  {
    id: "typescript",
    title: "Tipagem estática com TypeScript",
    keys: ["typescript", "tipagem", "type", "interface", "generic", "generics", "type hints", "tipos utilitarios", "narrowing"],
    intro:
      "TypeScript adiciona tipos ao JavaScript e checa tudo antes de rodar. O ganho não é digitar mais: é o editor avisando o erro enquanto você escreve, não o usuário descobrindo em produção.",
    deep: [
      "type e interface descrevem a forma dos dados. Prefira tipos precisos ('pendente' | 'pago' em vez de string): o compilador passa a barrar estados impossíveis.",
      "Evite any — ele desliga a verificação. Quando o tipo é desconhecido de verdade, use unknown e faça o narrowing (checagem) antes de usar.",
      "Generics permitem funções que preservam o tipo de entrada na saída: identidade<T>(v: T): T. É assim que Array<T>, Promise<T> e bibliotecas inteiras mantêm o autocomplete correto.",
    ],
    example: {
      language: "typescript",
      code: `type Status = "pendente" | "pago" | "cancelado";

interface Pedido {
  id: number;
  total: number;
  status: Status;
  cupom?: string;      // opcional
}

function resumo(p: Pedido): string {
  const extra = p.cupom ? " com cupom " + p.cupom : "";
  return \`#\${p.id} — R$ \${p.total.toFixed(2)} (\${p.status})\${extra}\`;
}

function primeiro<T>(lista: T[]): T | undefined {
  return lista[0];
}

console.log(resumo({ id: 1, total: 54, status: "pago" }));
console.log(primeiro<number>([10, 20]));`,
      explain:
        'status: "aprovado" nem compila — o union type só aceita os três valores previstos. O generic devolve number, não any.',
    },
    pitfalls: [
      "Espalhar any e perder toda a segurança.",
      "Tipar tudo manualmente onde a inferência já acerta.",
      "Confundir erro de tipo (compilação) com erro de execução: TypeScript some ao rodar.",
    ],
    quiz: [
      {
        q: "Qual a diferença prática entre any e unknown?",
        options: [
          "Nenhuma",
          "unknown obriga a checar o tipo antes de usar; any desliga a checagem",
          "any é mais novo",
          "unknown só serve para objetos",
        ],
        answer: 1,
        why: "unknown mantém a segurança exigindo narrowing.",
      },
      {
        q: "O que acontece com os tipos quando o código roda?",
        options: [
          "São verificados em tempo de execução",
          "Somem: existem só na compilação",
          "Viram classes",
          "Viram comentários no navegador",
        ],
        answer: 1,
        why: "TypeScript compila para JavaScript puro sem tipos.",
      },
    ],
  },
  {
    id: "python-basico",
    title: "Python na prática",
    keys: ["python", "indentacao", "list comprehension", "modulo", "pip", "arquivos", "pandas", "numpy"],
    langs: ["python"],
    intro:
      "Python usa indentação como sintaxe: o recuo define o bloco. Isso força código legível e é a causa do erro mais comum de quem chega de outra linguagem.",
    deep: [
      "List comprehension é a forma idiomática de transformar e filtrar em uma linha: [n * 2 for n in nums if n > 2]. Mais legível que for + append quando cabe em uma linha.",
      "Dicionários são a estrutura mais usada do dia a dia: .get('chave', padrao) evita KeyError, .items() percorre pares. f-strings (f'total: {x:.2f}') formatam com controle de casas decimais.",
      "Módulos organizam o código: cada arquivo .py é um módulo importável, e pip instala pacotes de terceiros dentro de um ambiente virtual — nunca no Python do sistema.",
    ],
    example: {
      language: "python",
      code: `vendas = [{"produto": "Mouse", "valor": 80}, {"produto": "Monitor", "valor": 900}]

total = sum(v["valor"] for v in vendas)
caros = [v["produto"] for v in vendas if v["valor"] > 100]

print(f"Total: R$ {total:.2f}")   # Total: R$ 980.00
print(caros)                       # ['Monitor']

def aplicar_desconto(valor, pct=10):
    return valor - valor * pct / 100

print(aplicar_desconto(200))       # 180.0`,
      explain:
        "A f-string com :.2f fixa duas casas. A comprehension substitui um for com append em uma linha legível.",
    },
    pitfalls: [
      "Misturar tabs e espaços → IndentationError.",
      "Usar dicionario['chave'] inexistente em vez de .get.",
      "Valor padrão mutável em parâmetro (def f(lista=[])) — ele é compartilhado entre chamadas.",
    ],
    quiz: [
      {
        q: "O que define um bloco em Python?",
        options: ["Chaves { }", "A indentação", "Ponto e vírgula", "A palavra end"],
        answer: 1,
        why: "O recuo faz parte da sintaxe da linguagem.",
      },
      {
        q: "Como evitar KeyError ao ler um dicionário?",
        options: ["try sempre", "Usar .get('chave', padrao)", "Usar lista", "Converter para string"],
        answer: 1,
        why: ".get devolve o padrão quando a chave não existe.",
      },
    ],
    exercise: {
      prompt: "Some os números de 1 a 5 usando um laço ou sum() e imprima 15.",
      starter: `numeros = [1, 2, 3, 4, 5]\ntotal = 0\n# escreva aqui\nprint(total)`,
      expected: "15",
      language: "python",
    },
  },
  {
    id: "poo",
    title: "Orientação a objetos",
    keys: ["classe", "classes", "objeto", "poo", "heranca", "polimorfismo", "encapsulamento", "interface", "abstrata", "construtor"],
    intro:
      "Classe é o molde; objeto é a instância. POO junta dados e comportamento no mesmo lugar para que o resto do programa não precise conhecer os detalhes internos.",
    deep: [
      "Encapsulamento: exponha métodos, esconda campos. Se qualquer parte do sistema pode alterar o saldo direto, nenhuma regra de negócio sobrevive.",
      "Herança expressa 'é um tipo de' e deve ser rara; composição ('tem um') costuma ser mais flexível. Herdar só para reaproveitar código gera hierarquias impossíveis de mudar.",
      "Polimorfismo é a parte que compensa: várias classes implementam o mesmo método e o chamador não precisa saber qual é qual. É a base de interfaces e de código extensível sem if gigante.",
    ],
    example: {
      language: "java",
      code: `public class Main {
    static abstract class Conta {
        protected double saldo;                    // escondido do mundo
        void depositar(double v) { if (v > 0) saldo += v; }
        abstract double taxa();
        double saldoFinal() { return saldo - taxa(); }
    }
    static class Corrente extends Conta { double taxa() { return 10; } }
    static class Poupanca extends Conta { double taxa() { return 0; } }

    public static void main(String[] args) {
        Conta[] contas = { new Corrente(), new Poupanca() };
        for (Conta c : contas) { c.depositar(100); System.out.println(c.saldoFinal()); }
    }
}`,
      explain:
        "saldoFinal é escrito uma vez e funciona para qualquer conta futura: quem adiciona uma nova classe só implementa taxa().",
    },
    pitfalls: [
      "Campos públicos que permitem estados inválidos.",
      "Herança profunda usada como reaproveitamento de código.",
      "Classe que faz tudo (God class) em vez de responsabilidades separadas.",
    ],
    quiz: [
      {
        q: "Polimorfismo permite:",
        options: [
          "Ter vários construtores",
          "Chamar o mesmo método em tipos diferentes sem saber qual implementação roda",
          "Criar objetos mais rápido",
          "Herdar de várias classes",
        ],
        answer: 1,
        why: "O chamador depende do contrato, não da classe concreta.",
      },
      {
        q: "Encapsulamento serve para:",
        options: [
          "Deixar o código menor",
          "Proteger o estado interno, expondo só operações válidas",
          "Acelerar a execução",
          "Permitir herança",
        ],
        answer: 1,
        why: "Regras de negócio ficam garantidas em um único lugar.",
      },
    ],
  },
  {
    id: "sql",
    title: "SQL: consultas, joins e agregações",
    keys: ["sql", "select", "join", "joins", "where", "group by", "agregac", "banco de dados", "indice", "indices", "normalizacao", "transacao", "subconsulta"],
    intro:
      "SQL é declarativo: você descreve o resultado desejado e o banco decide como buscar. A ordem lógica de execução é FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY.",
    deep: [
      "WHERE filtra linhas antes do agrupamento; HAVING filtra grupos depois. Tentar usar uma função de agregação no WHERE é erro clássico.",
      "INNER JOIN devolve só as correspondências; LEFT JOIN mantém tudo da tabela da esquerda e preenche com NULL. Se um LEFT JOIN 'virou' INNER, quase sempre a culpa é de uma condição sobre a tabela direita colocada no WHERE em vez do ON.",
      "Índices tornam a busca rápida em colunas usadas em WHERE e JOIN, ao custo de escrita e espaço. E toda comparação com NULL usa IS NULL — NULL = NULL é desconhecido, não verdadeiro.",
    ],
    example: {
      language: "sqlite3",
      code: `CREATE TABLE cliente (id INTEGER PRIMARY KEY, nome TEXT);
CREATE TABLE pedido (id INTEGER PRIMARY KEY, cliente_id INTEGER, total REAL);

INSERT INTO cliente VALUES (1,'Ana'), (2,'Bruno'), (3,'Carla');
INSERT INTO pedido VALUES (1,1,100.0), (2,1,50.0), (3,2,900.0);

SELECT c.nome, COUNT(p.id) AS pedidos, COALESCE(SUM(p.total), 0) AS gasto
FROM cliente c
LEFT JOIN pedido p ON p.cliente_id = c.id
GROUP BY c.id, c.nome
HAVING COALESCE(SUM(p.total), 0) >= 0
ORDER BY gasto DESC;`,
      explain:
        "Carla não tem pedidos, mas aparece com 0 graças ao LEFT JOIN + COALESCE. HAVING filtra o resultado já agrupado.",
    },
    pitfalls: [
      "Usar função de agregação no WHERE em vez do HAVING.",
      "Condição da tabela direita no WHERE anulando o LEFT JOIN.",
      "Comparar com = NULL em vez de IS NULL.",
    ],
    quiz: [
      {
        q: "Qual a diferença entre WHERE e HAVING?",
        options: [
          "Nenhuma",
          "WHERE filtra linhas antes de agrupar; HAVING filtra grupos depois",
          "HAVING é mais rápido",
          "WHERE só funciona com JOIN",
        ],
        answer: 1,
        why: "HAVING é o filtro das agregações.",
      },
      {
        q: "LEFT JOIN garante que:",
        options: [
          "Só linhas com correspondência aparecem",
          "Todas as linhas da tabela da esquerda aparecem, com NULL onde não houver par",
          "As duas tabelas devem ter o mesmo tamanho",
          "O resultado vem ordenado",
        ],
        answer: 1,
        why: "É o join usado para contar zeros também.",
      },
    ],
    exercise: {
      prompt: "Escreva uma consulta que devolva 15 como resultado da soma de 1 a 5.",
      starter: `SELECT 1 + 2 + 3 + 4;`,
      expected: "15",
      language: "sqlite3",
    },
  },
  {
    id: "api-rest",
    title: "APIs REST e HTTP",
    keys: ["api", "rest", "http", "endpoint", "express", "rota", "rotas", "middleware", "status", "json", "autenticacao", "jwt", "spring", "controller"],
    intro:
      "Uma API REST expõe recursos por URL e usa os verbos HTTP para dizer a intenção: GET lê, POST cria, PUT/PATCH atualiza, DELETE remove.",
    deep: [
      "O status code é parte do contrato: 200 ok, 201 criado, 400 pedido inválido, 401 não autenticado, 403 sem permissão, 404 não encontrado, 500 erro do servidor. Devolver 200 com {erro: true} quebra qualquer cliente sério.",
      "Valide toda entrada no servidor. Validação no navegador é conforto para o usuário; segurança só existe do lado do servidor, porque qualquer um pode chamar o endpoint direto.",
      "Autenticação normalmente usa um token (JWT) no cabeçalho Authorization. Autenticação diz quem você é; autorização diz o que você pode — são checagens diferentes e ambas ficam no servidor.",
    ],
    example: {
      language: "javascript",
      code: `// Node + Express
const express = require("express");
const app = express();
app.use(express.json());

const tarefas = [];

app.get("/tarefas", (req, res) => res.json(tarefas));

app.post("/tarefas", (req, res) => {
  const { titulo } = req.body;
  if (!titulo || titulo.length < 3) {
    return res.status(400).json({ erro: "titulo deve ter ao menos 3 caracteres" });
  }
  const nova = { id: tarefas.length + 1, titulo, feita: false };
  tarefas.push(nova);
  res.status(201).json(nova);      // 201 = criado
});

app.listen(3000);`,
      explain:
        "Validação antes de tocar nos dados e status coerente com o resultado: 400 para entrada ruim, 201 para criação.",
    },
    pitfalls: [
      "Sempre responder 200, mesmo em erro.",
      "Confiar na validação do front-end.",
      "Colocar verbo na URL (/criarUsuario) em vez de usar POST /usuarios.",
    ],
    quiz: [
      {
        q: "Qual status indica recurso criado com sucesso?",
        options: ["200", "201", "204", "301"],
        answer: 1,
        why: "201 Created é a resposta canônica de um POST bem-sucedido.",
      },
      {
        q: "Onde a validação de dados é obrigatória?",
        options: ["No navegador", "No servidor", "No banco apenas", "Em nenhum lugar se usar HTTPS"],
        answer: 1,
        why: "O cliente pode ser burlado; o servidor é a fronteira real.",
      },
    ],
  },
  {
    id: "git",
    title: "Git e fluxo de trabalho",
    keys: ["git", "github", "commit", "branch", "merge", "conflito", "pull request", "versionamento", "rebase", "clone"],
    intro:
      "Git guarda snapshots do projeto. Cada commit é um ponto no tempo com autor, mensagem e pai — por isso dá para voltar, comparar e trabalhar em paralelo sem medo.",
    deep: [
      "O fluxo básico tem três áreas: diretório de trabalho → área de staging (git add) → repositório (git commit). Entender essa separação explica por que 'salvei o arquivo' não é 'commitei'.",
      "Branch é um ponteiro barato para um commit. Trabalhe cada tarefa em uma branch, abra um pull request e faça merge só depois da revisão — a main fica sempre funcionando.",
      "Conflito não é erro: acontece quando duas branches mudam a mesma linha. Git marca <<<<<<< / ======= / >>>>>>>; você escolhe o conteúdo final, remove os marcadores, add e commit.",
    ],
    example: {
      language: "bash",
      code: `git checkout -b feature/login     # nova branch
git add src/login.js               # staging
git commit -m "feat: tela de login"
git push -u origin feature/login   # envia e vincula

git checkout main
git pull                           # atualiza antes de integrar
git merge feature/login

git log --oneline -5               # histórico curto
git restore --staged arquivo.txt   # tira do staging sem perder mudanças`,
      explain:
        "Sempre atualize a main antes do merge: metade dos conflitos surge de trabalhar sobre uma base velha.",
    },
    pitfalls: [
      "Commits gigantes com mensagem 'ajustes'.",
      "Commitar segredos (.env, chaves) — o histórico é público para sempre.",
      "Fazer merge sem dar pull na base primeiro.",
    ],
    quiz: [
      {
        q: "O que git add faz?",
        options: [
          "Salva o commit",
          "Move as mudanças para a área de staging, preparando o commit",
          "Envia para o GitHub",
          "Cria uma branch",
        ],
        answer: 1,
        why: "add prepara; commit registra; push envia.",
      },
      {
        q: "Um conflito de merge significa que:",
        options: [
          "O repositório corrompeu",
          "Duas branches alteraram a mesma linha e você precisa decidir o resultado",
          "Faltou fazer commit",
          "A branch não existe",
        ],
        answer: 1,
        why: "Git não adivinha a intenção; você resolve e commita.",
      },
    ],
  },
  {
    id: "estruturas",
    title: "Estruturas de dados e complexidade",
    keys: ["pilha", "fila", "arvore", "grafo", "hash", "complexidade", "big o", "ordenacao", "busca", "recursao", "lista ligada", "algoritmos"],
    intro:
      "Escolher a estrutura certa muda a complexidade do programa. Big O descreve como o tempo cresce quando a entrada cresce — é sobre escala, não sobre milissegundos.",
    deep: [
      "O(1) acesso direto (array por índice, hash por chave), O(log n) busca binária em dados ordenados, O(n) varredura, O(n log n) ordenações eficientes, O(n²) laços aninhados. Um O(n²) com 10 mil itens já são 100 milhões de operações.",
      "Pilha é LIFO (desfazer, chamada de funções), fila é FIFO (processamento em ordem de chegada), hash map é busca instantânea por chave, árvore mantém ordem com busca logarítmica e grafo modela relações (rotas, redes sociais).",
      "Recursão precisa de caso base e de um passo que aproxima do caso base. Sem o caso base, estouro de pilha; com repetição de subproblemas, use memoização para não recalcular a mesma coisa milhões de vezes.",
    ],
    example: {
      language: "python",
      code: `def busca_binaria(lista, alvo):      # O(log n), exige lista ordenada
    ini, fim = 0, len(lista) - 1
    while ini <= fim:
        meio = (ini + fim) // 2
        if lista[meio] == alvo: return meio
        if lista[meio] < alvo: ini = meio + 1
        else: fim = meio - 1
    return -1

memo = {}
def fib(n):                          # recursão com memoização: O(n)
    if n < 2: return n               # caso base
    if n in memo: return memo[n]
    memo[n] = fib(n-1) + fib(n-2)
    return memo[n]

print(busca_binaria([1,3,5,7,9,11], 9), fib(30))`,
      explain:
        "Sem o dicionário memo, fib(30) faria mais de 1,3 milhão de chamadas. Com ele, 30.",
    },
    pitfalls: [
      "Busca binária em lista não ordenada.",
      "Recursão sem caso base (RecursionError / stack overflow).",
      "Percorrer lista dentro de laço quando um dicionário resolveria em O(1).",
    ],
    quiz: [
      {
        q: "Qual a complexidade da busca binária?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
        answer: 1,
        why: "A cada passo metade dos candidatos é descartada.",
      },
      {
        q: "Pilha funciona como:",
        options: ["Primeiro a entrar, primeiro a sair", "Último a entrar, primeiro a sair", "Ordem aleatória", "Ordem alfabética"],
        answer: 1,
        why: "LIFO — como uma pilha de pratos.",
      },
    ],
  },
  {
    id: "dados-ia",
    title: "Dados, estatística e machine learning",
    keys: ["dados", "pandas", "numpy", "estatistica", "visualizacao", "machine learning", "modelo", "treino", "regressao", "classificacao", "overfitting", "limpeza"],
    intro:
      "Machine learning aprende padrões de exemplos em vez de seguir regras escritas à mão. Sem dados representativos e limpos, nenhum modelo salva o projeto.",
    deep: [
      "O ciclo é: coletar → limpar → explorar → separar treino/teste → treinar → avaliar. Avaliar no mesmo dado do treino é enganar a si mesmo: o modelo decorou em vez de aprender.",
      "Overfitting é acertar muito no treino e mal no teste (modelo complexo demais); underfitting é errar nos dois (simples demais). Validação cruzada e um conjunto de teste intocado revelam qual dos dois está acontecendo.",
      "Acurácia engana em dados desbalanceados: com 99% de casos negativos, um modelo que responde sempre 'não' acerta 99%. Olhe precisão, recall e matriz de confusão conforme o custo do erro.",
    ],
    example: {
      language: "python",
      code: `# Sem bibliotecas externas: a lógica que importa
dados = [(1, 2.1), (2, 4.2), (3, 5.9), (4, 8.1)]   # (x, y)

n = len(dados)
mx = sum(x for x, _ in dados) / n
my = sum(y for _, y in dados) / n
num = sum((x - mx) * (y - my) for x, y in dados)
den = sum((x - mx) ** 2 for x, _ in dados)
a = num / den            # coeficiente angular
b = my - a * mx          # intercepto

print(round(a, 2), round(b, 2))
print("previsao x=5:", round(a * 5 + b, 2))`,
      explain:
        "Isso é uma regressão linear na unha: o modelo é só um par de números que minimiza o erro. Bibliotecas fazem o mesmo em escala.",
    },
    pitfalls: [
      "Avaliar o modelo com os dados de treino.",
      "Confiar só na acurácia em problemas desbalanceados.",
      "Ignorar valores faltantes e outliers na limpeza.",
    ],
    quiz: [
      {
        q: "Overfitting é quando o modelo:",
        options: [
          "Erra no treino e no teste",
          "Acerta muito no treino e mal em dados novos",
          "Treina devagar",
          "Tem poucos dados",
        ],
        answer: 1,
        why: "Ele decorou ruído em vez de aprender o padrão.",
      },
      {
        q: "Por que separar treino e teste?",
        options: [
          "Para economizar memória",
          "Para medir o desempenho em dados que o modelo nunca viu",
          "Exigência das bibliotecas",
          "Para treinar mais rápido",
        ],
        answer: 1,
        why: "É a única medida honesta de generalização.",
      },
    ],
  },
  {
    id: "docker",
    title: "Docker, CI/CD e deploy",
    keys: ["docker", "container", "imagem", "compose", "ci", "cd", "deploy", "pipeline", "kubernetes", "nuvem", "monitoramento", "devops"],
    intro:
      "Container empacota aplicação e dependências em uma unidade que roda igual na sua máquina e no servidor. Acaba o 'na minha máquina funciona'.",
    deep: [
      "Imagem é o molde (somente leitura), container é a execução dela. O Dockerfile descreve a imagem em camadas: cada instrução vira uma camada cacheada, por isso copiar o package.json e instalar dependências ANTES de copiar o código deixa o build muito mais rápido.",
      "Container é efêmero: tudo que ele escreve some ao ser recriado. Dados que precisam sobreviver vão para volumes ou serviços externos, e configuração entra por variáveis de ambiente — nunca fixa na imagem.",
      "CI roda testes e build a cada push; CD publica automaticamente quando a CI passa. O valor está em entregar pequeno e frequente: erro pequeno é fácil de achar e de reverter.",
    ],
    example: {
      language: "bash",
      code: `# Dockerfile
# FROM node:20-alpine
# WORKDIR /app
# COPY package*.json ./      <- primeiro só as dependências (cache)
# RUN npm ci
# COPY . .
# CMD ["node", "server.js"]

docker build -t minha-api .
docker run -p 3000:3000 -e NODE_ENV=production minha-api
docker ps                 # containers rodando
docker logs -f <id>       # acompanhar logs
echo "pipeline: build -> testes -> imagem -> deploy"`,
      explain:
        "-p liga a porta do host à do container; -e injeta configuração sem reconstruir a imagem.",
    },
    pitfalls: [
      "Guardar dados dentro do container e perdê-los no próximo deploy.",
      "Colocar segredos na imagem em vez de variáveis de ambiente.",
      "Copiar o código antes das dependências e invalidar o cache a cada build.",
    ],
    quiz: [
      {
        q: "Qual a diferença entre imagem e container?",
        options: [
          "Nenhuma",
          "Imagem é o molde imutável; container é uma execução dela",
          "Container é maior",
          "Imagem só existe na nuvem",
        ],
        answer: 1,
        why: "Uma imagem gera quantos containers você quiser.",
      },
      {
        q: "Onde deve ficar a configuração sensível de um container?",
        options: ["No Dockerfile", "Em variáveis de ambiente/segredos injetados na execução", "No código", "No README"],
        answer: 1,
        why: "A imagem é distribuída; segredo nela vaza.",
      },
    ],
  },
  {
    id: "mobile",
    title: "Apps móveis com React Native",
    keys: ["react native", "mobile", "expo", "navegacao", "componentes nativos", "app", "publicacao", "notificacoes"],
    intro:
      "React Native usa os mesmos conceitos do React (componentes, props, estado), mas renderiza componentes nativos: nada de div e p — são View, Text, Image, Pressable.",
    deep: [
      "Estilos usam objetos JavaScript com um subconjunto de CSS, sempre em Flexbox (com flexDirection: 'column' como padrão, ao contrário da web). Não existe cascata: cada componente carrega o próprio estilo.",
      "Navegação é uma biblioteca à parte (stack, tabs, drawer) que gerencia a pilha de telas e os gestos nativos de voltar. Pense em cada tela como um componente que recebe parâmetros da rota.",
      "O que mais diferencia mobile: permissões, estados offline, tamanhos de tela e ciclo de vida do app em background. Teste em aparelho real cedo — o emulador esconde problemas de desempenho e de toque.",
    ],
    example: {
      language: "javascript",
      code: `import { View, Text, Pressable, StyleSheet } from "react-native";
import { useState } from "react";

export default function Contador() {
  const [n, setN] = useState(0);
  return (
    <View style={s.box}>
      <Text style={s.num}>{n}</Text>
      <Pressable style={s.btn} onPress={() => setN(n + 1)}>
        <Text style={s.txt}>Somar</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  box: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  num: { fontSize: 48, fontWeight: "700" },
  btn: { backgroundColor: "#2563eb", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  txt: { color: "white", fontWeight: "600" },
});`,
      explain:
        "Mesma lógica de estado do React web; muda o vocabulário de componentes e o estilo em objeto.",
    },
    pitfalls: [
      "Tentar usar tags HTML (div, span) — não existem.",
      "Esquecer que o padrão do flexDirection é column.",
      "Testar só no emulador e descobrir a lentidão no lançamento.",
    ],
    quiz: [
      {
        q: "Qual componente substitui a <div> no React Native?",
        options: ["Box", "View", "Container", "Div"],
        answer: 1,
        why: "View é o contêiner básico de layout.",
      },
      {
        q: "Qual é o flexDirection padrão no React Native?",
        options: ["row", "column", "row-reverse", "não há padrão"],
        answer: 1,
        why: "Ao contrário da web, o padrão é column.",
      },
    ],
  },
  {
    id: "carreira",
    title: "Carreira, portfólio e entrevistas",
    keys: ["carreira", "portfolio", "curriculo", "entrevista", "linkedin", "freelance", "soft skills", "primeiro emprego", "prompt"],
    intro:
      "Recrutador não avalia quantos cursos você fez: avalia evidência. Projeto publicado, código legível no GitHub e capacidade de explicar suas decisões valem mais que qualquer lista de tecnologias.",
    deep: [
      "Portfólio: três projetos bem-acabados batem dez pela metade. Cada um precisa de README com o problema, as decisões técnicas, print e link no ar. Um projeto que resolve algo real conta uma história.",
      "No currículo, descreva impacto, não tarefa: 'reduzi o tempo de carregamento de 4s para 1,2s' em vez de 'trabalhei com otimização'. Números tornam a afirmação verificável.",
      "Em entrevista técnica, pense em voz alta: pergunte sobre casos extremos, comece pela solução simples, depois otimize. Dizer 'não sei, mas eu investigaria assim' pontua mais que um chute confiante.",
    ],
    example: {
      language: "bash",
      code: `# Checklist de projeto de portfólio
echo "1. README com problema, solução, stack e print"
echo "2. Deploy funcionando com link no topo do README"
echo "3. Commits pequenos e mensagens descritivas"
echo "4. Sem chaves ou .env no repositório"
echo "5. Testes ou ao menos validação de entrada"
echo "6. Issues abertas com o que você faria a seguir"`,
      explain:
        "Quem revisa passa 2 minutos no seu repositório. O README é a entrevista antes da entrevista.",
    },
    pitfalls: [
      "Portfólio só com clones de tutorial idênticos.",
      "Currículo listando 20 tecnologias sem profundidade em nenhuma.",
      "Repositório sem README e sem deploy.",
    ],
    quiz: [
      {
        q: "O que mais pesa em um portfólio júnior?",
        options: [
          "Quantidade de repositórios",
          "Poucos projetos bem documentados, publicados e explicáveis",
          "Estrelas no GitHub",
          "Ter usado a tecnologia mais nova",
        ],
        answer: 1,
        why: "Profundidade e clareza demonstram capacidade real.",
      },
      {
        q: "Em entrevista técnica, travou na questão. O melhor caminho é:",
        options: [
          "Ficar em silêncio",
          "Explicar seu raciocínio, hipóteses e como investigaria",
          "Chutar com confiança",
          "Mudar de assunto",
        ],
        answer: 1,
        why: "Avalia-se o processo de pensamento, não só a resposta.",
      },
    ],
  },
];

export const topics: Topic[] = [...baseTopics, ...extraTopics];

const stripAccents = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function findTopic(lessonTitle: string, moduleTitle: string, lang: string): Topic {
  const hay = stripAccents(`${lessonTitle} ${moduleTitle}`);
  let best: { t: Topic; score: number } | null = null;

  for (const t of topics) {
    if (t.langs && !t.langs.includes(lang)) continue;
    let score = 0;
    for (const k of t.keys) {
      const key = stripAccents(k);
      if (stripAccents(lessonTitle).includes(key)) score += key.length * 2;
      else if (hay.includes(key)) score += key.length;
    }
    if (score > 0 && (!best || score > best.score)) best = { t, score };
  }
  if (best) return best.t;

  // fallback por linguagem do curso
  const byLang: Record<string, string> = {
    html: "html-estrutura",
    css: "css-layout",
    javascript: "variaveis",
    typescript: "typescript",
    python: "python-basico",
    java: "poo",
    sqlite3: "sql",
    bash: "docker",
  };
  const id = byLang[lang] ?? "algoritmo";
  return topics.find((t) => t.id === id) ?? topics[0]!;
}
