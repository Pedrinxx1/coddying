// Temas adicionais das lições — mesmo formato da biblioteca principal.
import type { Topic } from "./lessonLibrary";

export const extraTopics: Topic[] = [
  {
    id: "strings",
    title: "Strings, texto e formatação",
    keys: ["string", "texto", "f-string", "fstring", "formatacao", "concatenacao", "template literal", "interpolacao"],
    intro:
      "String é uma sequência de caracteres imutável: toda operação que 'muda' um texto na verdade devolve um texto novo. Entender isso evita metade dos bugs de manipulação de texto.",
    deep: [
      "Índices começam em 0 e fatiar (slice) devolve um pedaço novo sem alterar o original. Em Python, texto[0:3] pega os três primeiros caracteres; em JavaScript, texto.slice(0, 3) faz o mesmo.",
      "Formatação moderna evita concatenação com +. Em Python usa-se f-string: f\"Olá, {nome}, você tem {idade} anos\". Em JavaScript, template literal com crase: `Olá, ${nome}`. Além de mais legível, converte números automaticamente.",
      "Métodos que você vai usar sempre: strip/trim (tira espaços das pontas), lower/upper, replace, split (quebra em lista) e join (junta lista em texto). Todos devolvem um valor novo — se você não guardar o retorno, nada acontece.",
    ],
    example: {
      language: "python",
      code: `nome = "  Ana Souza  "
limpo = nome.strip()          # tira espaços das pontas
partes = limpo.split(" ")     # ['Ana', 'Souza']
inicial = partes[1][0]        # 'S'

# f-string: formata número com 2 casas
nota = 8.5
print(f"{partes[0]} {inicial}. tirou {nota:.2f}")

# strings são imutáveis: isto NÃO muda 'limpo'
limpo.upper()
print(limpo)  # continua "Ana Souza"`,
      explain:
        "Repare na última parte: chamar .upper() sem guardar o resultado não altera a variável. Strings nunca mudam no lugar.",
    },
    pitfalls: [
      "Chamar um método de texto e não guardar o retorno (texto.replace(...) sozinho não muda nada).",
      "Somar texto com número sem converter: em Python dá TypeError, em JavaScript vira concatenação silenciosa.",
      "Comparar textos sem normalizar espaços e maiúsculas: \" Ana\" != \"ana\".",
    ],
    quiz: [
      {
        q: "Por que dizemos que strings são imutáveis?",
        options: [
          "Porque não podem ser copiadas",
          "Porque toda operação devolve um texto novo em vez de alterar o original",
          "Porque só aceitam letras",
          "Porque ocupam memória fixa",
        ],
        answer: 1,
        why: "Métodos como replace, upper e strip devolvem um valor novo; o original continua igual.",
      },
      {
        q: "Qual a vantagem da f-string / template literal sobre concatenação com +?",
        options: [
          "É mais rápida de digitar apenas",
          "Insere valores direto no texto, converte números e fica mais legível",
          "Permite usar acentos",
          "Não existe diferença",
        ],
        answer: 1,
        why: "A formatação embutida evita conversões manuais e deixa o texto final visível de uma vez.",
      },
    ],
    exercise: {
      prompt: "Junte as partes do nome e imprima exatamente 15 caracteres? Não: imprima o resultado 15 usando o tamanho do texto 'programacaoboa' mais 1.",
      starter: `texto = "programacaoboa"\n# imprima o tamanho do texto + 1\nprint(0)`,
      expected: "15",
      language: "python",
    },
  },
  {
    id: "listas-arrays",
    title: "Listas e arrays",
    keys: ["lista", "array", "vetor", "arrays", "listas", "indice", "iteravel"],
    intro:
      "Lista (ou array) guarda vários valores em ordem, acessados por índice a partir de 0. É a estrutura que você mais vai usar: quase todo programa é 'pegar uma coleção, transformar e devolver outra'.",
    deep: [
      "Acesso por índice é instantâneo (custo constante), mas inserir ou remover no meio é caro, porque tudo depois precisa deslocar. Adicionar no fim é barato — por isso append/push são as operações preferidas.",
      "Percorrer sem índice é mais seguro: for item in lista (Python) ou for (const item of lista) (JavaScript). Você só precisa do índice quando vai usá-lo de verdade.",
      "Transformar em vez de acumular na mão: map devolve uma lista nova com cada item transformado, filter devolve só os que passam no teste, reduce comprime tudo em um valor. Isso reduz erro de contador.",
    ],
    example: {
      language: "javascript",
      code: `const nums = [4, 8, 15, 16, 23, 42];

// acesso por índice
console.log(nums[0], nums[nums.length - 1]);

// transformar sem mexer no original
const dobros = nums.map(n => n * 2);
const grandes = nums.filter(n => n > 15);
const soma = nums.reduce((acc, n) => acc + n, 0);

console.log(dobros, grandes, soma);
console.log(nums); // intacto`,
      explain:
        "map, filter e reduce não alteram o array original: eles devolvem um resultado novo. push e splice, sim, alteram.",
    },
    pitfalls: [
      "Acessar índice que não existe: em JavaScript vem undefined (erro silencioso), em Python estoura IndexError.",
      "Remover itens de uma lista enquanto a percorre — os índices mudam no meio do caminho.",
      "Copiar com b = a e achar que são independentes: os dois apontam para a mesma lista.",
    ],
    quiz: [
      {
        q: "Por que inserir no meio de uma lista é mais caro que no fim?",
        options: [
          "Porque o computador precisa reordenar tudo alfabeticamente",
          "Porque todos os itens seguintes precisam ser deslocados",
          "Porque listas não aceitam inserção no meio",
          "Porque o índice deixa de funcionar",
        ],
        answer: 1,
        why: "Cada item depois da posição inserida muda de lugar, o que custa proporcional ao tamanho.",
      },
      {
        q: "O que map devolve?",
        options: [
          "O próprio array, modificado",
          "Um array novo com cada item transformado",
          "Um número",
          "Só o primeiro item que passa no teste",
        ],
        answer: 1,
        why: "map cria uma coleção nova e deixa a original intacta.",
      },
    ],
    exercise: {
      prompt: "Some todos os números da lista e imprima o total (deve dar 15).",
      starter: `const nums = [1, 2, 3, 4, 5];\nlet total = 0;\n// escreva seu código aqui\nconsole.log(total);`,
      expected: "15",
      language: "javascript",
    },
  },
  {
    id: "dicionarios",
    title: "Dicionários, mapas e objetos",
    keys: ["dicionario", "dicionarios", "mapa", "map", "objeto", "objetos", "chave valor", "json", "hash"],
    intro:
      "Dicionário guarda pares chave → valor e busca pela chave em tempo praticamente constante. Use quando o dado tem nome ('preco', 'email') em vez de posição.",
    deep: [
      "Por baixo existe uma tabela hash: a chave vira um número que aponta direto para a posição. Por isso a busca não depende do tamanho — procurar em 10 ou em 10 milhões custa quase o mesmo.",
      "Acessar chave inexistente é a maior fonte de erro. Em Python use .get('chave', padrao); em JavaScript, obj?.chave ?? padrao. Assim o programa segue com um valor razoável em vez de quebrar.",
      "Percorrer pares é o que você mais faz na prática: .items() em Python, Object.entries() em JavaScript. Isso transforma o dicionário em algo iterável sem perder a chave.",
    ],
    example: {
      language: "python",
      code: `aluno = {"nome": "Ana", "xp": 320}

# leitura segura: nunca quebra
print(aluno.get("streak", 0))   # 0, pois a chave não existe

# adicionar e atualizar
aluno["streak"] = 3
aluno["xp"] += 10

# percorrer pares
for chave, valor in aluno.items():
    print(chave, "->", valor)`,
      explain:
        "Repare no .get com valor padrão: é o que evita o KeyError quando o dado pode não estar lá.",
    },
    pitfalls: [
      "Usar aluno['chave'] para dado opcional — quebra o programa quando falta.",
      "Contar com a ordem das chaves como se fosse uma lista ordenada por valor.",
      "Usar objeto/dicionário quando o certo era uma lista (dados sem nome, só posição).",
    ],
    quiz: [
      {
        q: "Por que a busca por chave é rápida em um dicionário?",
        options: [
          "Porque as chaves ficam ordenadas",
          "Porque a chave é convertida em um número que aponta direto para a posição",
          "Porque o dicionário é pequeno",
          "Porque ele percorre item por item muito rápido",
        ],
        answer: 1,
        why: "A tabela hash calcula a posição a partir da chave, sem varrer a coleção.",
      },
      {
        q: "Qual a forma segura de ler uma chave que pode não existir?",
        options: [
          "Acessar direto e torcer",
          "Usar .get('chave', padrao) ou ?? com valor padrão",
          "Converter para lista antes",
          "Apagar a chave primeiro",
        ],
        answer: 1,
        why: "Com valor padrão o programa continua rodando em vez de estourar.",
      },
    ],
  },
  {
    id: "excecoes",
    title: "Exceções e tratamento de erros",
    keys: ["excecao", "excecoes", "try", "catch", "erro em tempo de execucao", "tratamento de erro", "throw", "raise", "finally"],
    intro:
      "Exceção é o jeito da linguagem dizer 'não consigo continuar assim'. Tratar exceção não é esconder o erro: é decidir conscientemente o que fazer quando o previsível der errado.",
    deep: [
      "Envolva no try apenas a linha que pode falhar. Um try gigante engole erros de código que você nem imaginava e transforma bug em comportamento estranho.",
      "Capture o tipo específico (ValueError, TypeError, erro de rede) em vez de capturar tudo. Capturar tudo e não fazer nada é a receita clássica de um sistema que falha em silêncio.",
      "O bloco finally roda de qualquer jeito — com ou sem erro. É onde se fecha arquivo, conexão e libera recurso. Em Python, o with faz isso automaticamente.",
    ],
    example: {
      language: "python",
      code: `def dividir(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        # tratamos só o caso previsível
        print("Não dá para dividir por zero")
        return None
    finally:
        print("tentativa concluída")

print(dividir(10, 2))
print(dividir(10, 0))`,
      explain:
        "Só o erro esperado é capturado. Qualquer outro problema continua subindo — e isso é bom: você quer saber dele.",
    },
    pitfalls: [
      "except: pass — o erro some e o bug aparece dez telas depois.",
      "Usar exceção para controle de fluxo normal (esperado), em vez de um if.",
      "Esquecer de fechar arquivo/conexão quando ocorre erro no meio.",
    ],
    quiz: [
      {
        q: "Por que capturar um tipo específico de exceção é melhor?",
        options: [
          "É mais rápido",
          "Evita esconder erros diferentes que você deveria investigar",
          "Ocupa menos memória",
          "Não faz diferença",
        ],
        answer: 1,
        why: "Capturar tudo transforma bugs desconhecidos em falhas silenciosas.",
      },
      {
        q: "Para que serve o finally?",
        options: [
          "Rodar só quando dá erro",
          "Rodar sempre, com ou sem erro, para liberar recursos",
          "Repetir o try",
          "Ignorar a exceção",
        ],
        answer: 1,
        why: "É o lugar de fechar arquivo, conexão e limpar estado.",
      },
    ],
  },
  {
    id: "recursao",
    title: "Recursão",
    keys: ["recursao", "recursiva", "recursivo", "fatorial", "fibonacci", "backtracking"],
    intro:
      "Função recursiva é a que chama a si mesma com um problema menor, até chegar em um caso tão simples que a resposta é imediata — o caso base.",
    deep: [
      "Toda recursão precisa de duas coisas: caso base (quando parar) e passo recursivo que caminha em direção a ele. Sem caso base, a pilha de chamadas estoura (RecursionError / stack overflow).",
      "Cada chamada guarda seu próprio conjunto de variáveis na pilha. Por isso recursão profunda gasta memória: 10 mil chamadas são 10 mil quadros abertos ao mesmo tempo.",
      "Recursão brilha em estruturas que se repetem dentro de si: árvores, pastas dentro de pastas, JSON aninhado. Para contagem simples, um laço costuma ser mais barato e mais claro.",
    ],
    example: {
      language: "python",
      code: `def fatorial(n):
    if n <= 1:        # caso base: para aqui
        return 1
    return n * fatorial(n - 1)   # passo recursivo: problema menor

print(fatorial(5))   # 120

# soma de uma lista, recursivamente
def soma(lista):
    if not lista:
        return 0
    return lista[0] + soma(lista[1:])

print(soma([1, 2, 3, 4, 5]))`,
      explain:
        "Em fatorial(5) abrem-se 5 chamadas empilhadas; elas só devolvem valor quando o caso base é atingido.",
    },
    pitfalls: [
      "Esquecer o caso base — o programa trava e estoura a pilha.",
      "O passo recursivo não diminuir o problema (chamar com o mesmo valor).",
      "Recalcular a mesma coisa mil vezes (Fibonacci ingênuo) em vez de guardar resultados.",
    ],
    quiz: [
      {
        q: "O que acontece se faltar o caso base?",
        options: [
          "A função devolve zero",
          "A recursão nunca para e a pilha de chamadas estoura",
          "O código nem compila",
          "Vira um laço automaticamente",
        ],
        answer: 1,
        why: "Sem condição de parada as chamadas se acumulam até estourar a memória da pilha.",
      },
      {
        q: "Quando recursão costuma ser a melhor escolha?",
        options: [
          "Para somar de 1 a 10",
          "Em estruturas aninhadas como árvores e pastas dentro de pastas",
          "Sempre que houver um laço",
          "Para ler um arquivo linha a linha",
        ],
        answer: 1,
        why: "A estrutura que se repete dentro de si mesma casa naturalmente com a definição recursiva.",
      },
    ],
    exercise: {
      prompt: "Some recursivamente os números de 1 a 5 e imprima o total (15).",
      starter: `def soma_ate(n):\n    # caso base e passo recursivo\n    return 0\n\nprint(soma_ate(5))`,
      expected: "15",
      language: "python",
    },
  },
  {
    id: "ordenacao-busca",
    title: "Ordenação e busca",
    keys: ["ordenacao", "ordenar", "sort", "busca", "binaria", "pesquisa", "bubble", "merge sort", "quicksort"],
    intro:
      "Ordenar é reorganizar os dados por um critério; buscar é encontrar um item. As duas coisas andam juntas: em dados ordenados a busca fica absurdamente mais rápida.",
    deep: [
      "Busca linear percorre item por item: no pior caso olha todos (custo proporcional a n). Busca binária corta a lista ao meio a cada passo — 1 milhão de itens em ~20 comparações — mas exige lista ordenada.",
      "Os algoritmos didáticos (bubble, selection, insertion) custam n² e servem para entender o mecanismo. Os usados de verdade (merge sort, quicksort, timsort) custam n log n e já vêm prontos em sorted()/.sort().",
      "Ordenar por critério é o uso real do dia a dia: sorted(alunos, key=lambda a: a['xp'], reverse=True). Escrever seu próprio sort em produção quase nunca se justifica.",
    ],
    example: {
      language: "python",
      code: `alunos = [{"nome": "Ana", "xp": 320}, {"nome": "Léo", "xp": 180}, {"nome": "Bia", "xp": 500}]

# ordenar por critério (do maior XP para o menor)
ranking = sorted(alunos, key=lambda a: a["xp"], reverse=True)
print([a["nome"] for a in ranking])

# busca binária exige lista ordenada
def busca_binaria(lista, alvo):
    ini, fim = 0, len(lista) - 1
    while ini <= fim:
        meio = (ini + fim) // 2
        if lista[meio] == alvo:
            return meio
        if lista[meio] < alvo:
            ini = meio + 1
        else:
            fim = meio - 1
    return -1

print(busca_binaria([1, 3, 5, 7, 9, 11], 9))`,
      explain:
        "A cada volta do while a busca binária descarta metade do que sobrou — daí o custo logarítmico.",
    },
    pitfalls: [
      "Usar busca binária em lista não ordenada: o resultado é aleatório, não um erro.",
      "Ordenar dentro de um laço que já roda muitas vezes — custo multiplicado à toa.",
      "Comparar tipos diferentes (texto com número) na chave de ordenação.",
    ],
    quiz: [
      {
        q: "Qual é o pré-requisito da busca binária?",
        options: ["Lista pequena", "Lista ordenada", "Lista sem repetidos", "Lista de números"],
        answer: 1,
        why: "Ela decide para que lado ir comparando com o meio, e isso só funciona em dados ordenados.",
      },
      {
        q: "Por que os algoritmos n² são ensinados mas pouco usados?",
        options: [
          "Porque estão errados",
          "Porque servem para entender o mecanismo, mas os prontos (n log n) são muito mais rápidos",
          "Porque não funcionam com texto",
          "Porque gastam mais memória",
        ],
        answer: 1,
        why: "Valor didático alto, desempenho baixo em dados grandes.",
      },
    ],
  },
  {
    id: "complexidade",
    title: "Complexidade e desempenho (Big-O)",
    keys: ["complexidade", "big-o", "big o", "notacao", "desempenho", "performance", "otimizacao", "custo"],
    intro:
      "Big-O descreve como o custo de um algoritmo cresce quando a entrada cresce. Não mede segundos: mede a forma da curva — e é isso que decide se seu código aguenta 10 mil usuários.",
    deep: [
      "O(1) não depende do tamanho (acessar índice, ler chave de dicionário). O(n) percorre tudo uma vez. O(n log n) é o teto dos bons algoritmos de ordenação. O(n²) são laços aninhados — aceitável em 100 itens, desastre em 100 mil.",
      "Constantes e termos menores somem: 3n + 50 é O(n). O que importa é o termo dominante, porque é ele que manda quando o dado cresce.",
      "Custo de memória conta também. Criar uma cópia da lista dentro de um laço é O(n²) de tempo e memória escondido em código que parece inocente.",
    ],
    example: {
      language: "python",
      code: `# O(n): um laço sobre a entrada
def tem_duplicado_lento(lista):
    for i in range(len(lista)):
        for j in range(i + 1, len(lista)):   # laço dentro de laço => O(n²)
            if lista[i] == lista[j]:
                return True
    return False

# O(n): um conjunto resolve com uma passada
def tem_duplicado(lista):
    vistos = set()
    for item in lista:
        if item in vistos:      # busca O(1)
            return True
        vistos.add(item)
    return False`,
      explain:
        "As duas funções fazem a mesma coisa. A segunda troca tempo por um pouco de memória e sai de O(n²) para O(n).",
    },
    pitfalls: [
      "Colocar uma busca em lista (O(n)) dentro de um laço — vira O(n²) sem você perceber.",
      "Otimizar antes de medir: o gargalo quase nunca está onde você acha.",
      "Confundir 'rápido na minha máquina com 10 itens' com 'escala'.",
    ],
    quiz: [
      {
        q: "O que O(n²) costuma indicar no código?",
        options: ["Uso de recursão", "Laços aninhados sobre a mesma entrada", "Muitas variáveis", "Uso de dicionário"],
        answer: 1,
        why: "Cada item da entrada sendo comparado com todos os outros gera crescimento quadrático.",
      },
      {
        q: "Por que 3n + 50 é considerado O(n)?",
        options: [
          "Porque 50 é pequeno",
          "Porque o que importa é o termo dominante quando a entrada cresce",
          "Porque n é sempre maior que 50",
          "Porque constantes não existem",
        ],
        answer: 1,
        why: "Big-O descreve a forma do crescimento, não o valor exato.",
      },
    ],
  },
  {
    id: "flexbox",
    title: "Flexbox: alinhamento em uma dimensão",
    keys: ["flexbox", "flex", "alinhamento", "display flex", "justify-content", "align-items"],
    intro:
      "Flexbox organiza elementos em uma linha ou uma coluna e distribui o espaço que sobra. É a ferramenta certa para barras de navegação, cards lado a lado e centralização.",
    deep: [
      "Ao declarar display:flex no pai, os filhos viram itens flexíveis. O eixo principal é definido por flex-direction (row por padrão); justify-content distribui no eixo principal e align-items alinha no eixo cruzado.",
      "flex: 1 em um filho diz 'ocupe o espaço que sobrar'. Combinado com min-width: 0, permite que o texto encolha e use reticências em vez de estourar a largura da tela no celular.",
      "flex-wrap: wrap deixa os itens quebrarem para a linha de baixo quando não cabem — é o que evita rolagem horizontal em telas pequenas.",
    ],
    example: {
      language: "css",
      code: `.barra {
  display: flex;
  align-items: center;      /* alinha verticalmente */
  justify-content: space-between;
  gap: 1rem;                /* espaço entre itens, sem margin */
  flex-wrap: wrap;          /* quebra no celular */
}

.barra .titulo {
  flex: 1;                  /* ocupa o espaço que sobra */
  min-width: 0;             /* permite encolher e truncar */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}`,
      explain:
        "min-width: 0 é o detalhe que quase todo mundo esquece: sem ele, o texto se recusa a encolher e estoura o layout.",
    },
    pitfalls: [
      "Usar margin para espaçar itens em vez de gap.",
      "Esquecer flex-wrap e provocar rolagem horizontal no celular.",
      "Texto longo estourando o container por falta de min-width: 0.",
    ],
    quiz: [
      {
        q: "O que justify-content controla?",
        options: [
          "A distribuição no eixo principal",
          "A cor de fundo",
          "O alinhamento no eixo cruzado",
          "A quebra de linha",
        ],
        answer: 0,
        why: "align-items cuida do eixo cruzado; justify-content, do principal.",
      },
      {
        q: "Por que min-width: 0 aparece tanto em layout flex?",
        options: [
          "Para esconder o elemento",
          "Para permitir que o item encolha e o texto seja truncado",
          "Para centralizar",
          "Para criar colunas",
        ],
        answer: 1,
        why: "Sem isso o item mantém a largura do conteúdo e estoura o container.",
      },
    ],
  },
  {
    id: "grid-responsivo",
    title: "CSS Grid e layout responsivo",
    keys: ["grid", "responsivo", "responsividade", "media query", "mobile first", "breakpoint", "layout responsivo"],
    intro:
      "Grid organiza em duas dimensões (linhas e colunas) ao mesmo tempo. Junto com media queries e unidades relativas, é o que faz a mesma página funcionar no celular e no monitor grande.",
    deep: [
      "grid-template-columns define as colunas. repeat(auto-fit, minmax(240px, 1fr)) cria quantas colunas couberem, com no mínimo 240px cada — layout responsivo sem escrever nenhuma media query.",
      "Mobile first: escreva o estilo do celular primeiro e use media query só para telas maiores (min-width). Isso evita cascata de sobrescritas e deixa o caso mais restrito como base.",
      "Prefira unidades relativas: rem para espaçamento e fonte, % e fr para largura, clamp() para tamanhos que crescem dentro de um limite. Largura fixa em px é a causa número um de rolagem horizontal.",
    ],
    example: {
      language: "css",
      code: `.cards {
  display: grid;
  gap: 1rem;
  /* quantas colunas couberem, mínimo 240px */
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.titulo {
  /* cresce com a tela, mas nunca sai do intervalo */
  font-size: clamp(1.5rem, 4vw, 3rem);
}

@media (min-width: 768px) {
  .conteudo { grid-template-columns: 2fr 1fr; }
}`,
      explain:
        "O auto-fit com minmax resolve a maior parte dos casos sozinho; a media query entra só para mudar a estrutura em telas grandes.",
    },
    pitfalls: [
      "Largura fixa em px em containers — quebra no celular.",
      "Escrever desktop first e depois brigar com sobrescritas.",
      "Esquecer a meta viewport, o que faz o celular renderizar como se fosse desktop.",
    ],
    quiz: [
      {
        q: "O que repeat(auto-fit, minmax(240px, 1fr)) faz?",
        options: [
          "Cria sempre 3 colunas",
          "Cria quantas colunas couberem, com largura mínima de 240px",
          "Deixa tudo em uma coluna",
          "Define a altura das linhas",
        ],
        answer: 1,
        why: "É layout responsivo automático, sem media query.",
      },
      {
        q: "O que significa 'mobile first'?",
        options: [
          "Fazer um app antes do site",
          "Escrever o estilo base para telas pequenas e ampliar com min-width",
          "Testar só no celular",
          "Usar apenas px",
        ],
        answer: 1,
        why: "A base é o caso mais restrito; as media queries adicionam o que sobra de espaço.",
      },
    ],
  },
  {
    id: "formularios",
    title: "Formulários e validação",
    keys: ["formulario", "formularios", "input", "validacao", "submit", "campos", "form"],
    intro:
      "Formulário é a porta de entrada dos dados do usuário — e de quase todo problema de segurança e de dados sujos. Validar bem é parte do trabalho, não um extra.",
    deep: [
      "Use os tipos e atributos nativos primeiro: type=\"email\", required, minlength, pattern. O navegador já valida, avisa e ajuda o teclado do celular a aparecer certo.",
      "Todo campo precisa de <label> associado (for/id). Sem isso, leitor de tela não anuncia o campo e o toque no rótulo não foca o input — acessibilidade e usabilidade caem juntas.",
      "Validação no navegador é conveniência; validação no servidor é obrigação. Qualquer pessoa pode enviar dados sem passar pela sua tela, então a regra final tem que estar no back-end.",
    ],
    example: {
      language: "html",
      code: `<form id="cadastro">
  <label for="email">E-mail</label>
  <input id="email" name="email" type="email" required />

  <label for="senha">Senha (mínimo 8)</label>
  <input id="senha" name="senha" type="password" minlength="8" required />

  <button type="submit">Criar conta</button>
</form>

<script>
  document.getElementById('cadastro').addEventListener('submit', (e) => {
    e.preventDefault();               // impede o recarregamento
    const dados = new FormData(e.target);
    console.log(Object.fromEntries(dados));  // { email: ..., senha: ... }
  });
</script>`,
      explain:
        "FormData lê todos os campos pelo atributo name de uma vez — não é preciso capturar input por input.",
    },
    pitfalls: [
      "Esquecer e.preventDefault() e a página recarregar perdendo tudo.",
      "Campo sem name: ele simplesmente não vai no envio.",
      "Confiar só na validação do navegador e aceitar qualquer coisa no servidor.",
    ],
    quiz: [
      {
        q: "Por que validar também no servidor?",
        options: [
          "Para ficar mais rápido",
          "Porque o cliente pode ser burlado e enviar dados direto",
          "Porque o navegador não valida e-mail",
          "Para economizar código",
        ],
        answer: 1,
        why: "A validação de tela é conveniência; a regra que protege os dados precisa estar no servidor.",
      },
      {
        q: "Para que serve o label associado ao input?",
        options: [
          "Só estética",
          "Acessibilidade e usabilidade: leitores de tela anunciam e o toque foca o campo",
          "Validar o campo",
          "Enviar o valor",
        ],
        answer: 1,
        why: "Sem label associado o campo fica sem nome para tecnologias assistivas.",
      },
    ],
  },
  {
    id: "acessibilidade",
    title: "Acessibilidade na prática",
    keys: ["acessibilidade", "a11y", "aria", "leitor de tela", "contraste", "semantica", "teclado"],
    intro:
      "Acessibilidade é garantir que a página funcione para quem navega por teclado, leitor de tela, tela pequena ou baixa visão. Boa parte se resolve usando o HTML certo.",
    deep: [
      "HTML semântico faz metade do trabalho: button para ação, a para navegação, nav, main, header, h1 único e hierarquia de títulos sem pular níveis. Uma div com onclick não recebe foco nem responde ao Enter.",
      "Toda imagem informativa precisa de alt descritivo; imagem decorativa leva alt=\"\" para o leitor pular. Ícone sozinho em um botão precisa de aria-label dizendo a ação.",
      "Contraste mínimo recomendado é 4,5:1 para texto normal, e o foco do teclado nunca deve ser removido sem substituto visível. Navegue sua página só com Tab: se você se perder, o usuário também se perde.",
    ],
    example: {
      language: "html",
      code: `<!-- ruim: div não é focável nem acionável por teclado -->
<div class="botao" onclick="salvar()">Salvar</div>

<!-- bom -->
<button type="button" onclick="salvar()">Salvar</button>

<!-- ícone sozinho precisa de nome acessível -->
<button type="button" aria-label="Fechar janela">
  <svg aria-hidden="true" focusable="false"><!-- ... --></svg>
</button>

<img src="grafico.png" alt="Vendas subiram 30% em março" />
<img src="enfeite.png" alt="" />`,
      explain:
        "O aria-hidden no ícone evita leitura duplicada: quem anuncia a ação é o aria-label do botão.",
    },
    pitfalls: [
      "Usar div/span como botão.",
      "Remover o outline do foco sem colocar um indicador visível no lugar.",
      "alt genérico do tipo 'imagem' ou 'foto'.",
    ],
    quiz: [
      {
        q: "Por que preferir <button> a uma div clicável?",
        options: [
          "Fica mais bonito",
          "Recebe foco, responde a Enter/Espaço e é anunciado como botão",
          "Carrega mais rápido",
          "Aceita mais CSS",
        ],
        answer: 1,
        why: "O elemento nativo já traz o comportamento de teclado e o papel semântico.",
      },
      {
        q: "Qual alt usar em uma imagem puramente decorativa?",
        options: ["alt=\"decoração\"", "alt=\"\"", "Nenhum atributo alt", "alt=\"imagem\""],
        answer: 1,
        why: "alt vazio faz o leitor de tela ignorar a imagem, que é o desejado.",
      },
    ],
  },
  {
    id: "testes",
    title: "Testes automatizados",
    keys: ["teste", "testes", "unitario", "tdd", "jest", "pytest", "qualidade", "mock"],
    intro:
      "Teste automatizado é código que verifica o seu código. Ele não existe para provar que funciona hoje, e sim para avisar quando parar de funcionar amanhã.",
    deep: [
      "A estrutura de um teste é sempre a mesma: arrumar o cenário, executar a função, comparar o resultado com o esperado. Um teste que não pode falhar não testa nada.",
      "Teste unitário isola uma função e roda em milissegundos; teste de integração verifica peças conversando (banco, API). Muitos unitários e poucos de integração é o equilíbrio que se sustenta.",
      "Escreva testes para o comportamento, não para a implementação. Se renomear uma variável interna quebra 20 testes, eles estão presos ao 'como' em vez do 'o quê'.",
    ],
    example: {
      language: "python",
      code: `def desconto(preco, cupom):
    if preco <= 0:
        raise ValueError("preço inválido")
    return preco * 0.9 if cupom == "DEZ" else preco

# testes: caso normal, caso sem cupom e caso de erro
def test_com_cupom():
    assert desconto(100, "DEZ") == 90

def test_sem_cupom():
    assert desconto(100, "") == 100

def test_preco_invalido():
    try:
        desconto(0, "DEZ")
        assert False, "deveria ter dado erro"
    except ValueError:
        assert True`,
      explain:
        "Repare que os três testes cobrem caminho feliz, caminho alternativo e erro — é esse trio que pega regressão.",
    },
    pitfalls: [
      "Testar só o caminho feliz.",
      "Teste que depende de internet, data de hoje ou ordem de execução.",
      "Cobertura alta com asserções fracas (rodar a função sem verificar nada).",
    ],
    quiz: [
      {
        q: "Qual é o principal valor de um teste automatizado?",
        options: [
          "Provar que o código está certo para sempre",
          "Avisar rapidamente quando uma mudança quebra o comportamento esperado",
          "Substituir a documentação",
          "Deixar o código mais rápido",
        ],
        answer: 1,
        why: "Testes protegem contra regressão a cada alteração.",
      },
      {
        q: "Testar comportamento em vez de implementação significa:",
        options: [
          "Testar variáveis internas",
          "Verificar o que a função entrega, não como ela faz por dentro",
          "Testar só a interface visual",
          "Não usar asserções",
        ],
        answer: 1,
        why: "Assim refatorar por dentro não quebra a suíte à toa.",
      },
    ],
  },
  {
    id: "autenticacao",
    title: "Autenticação, sessões e segurança",
    keys: ["autenticacao", "login", "jwt", "token", "sessao", "seguranca", "senha", "oauth", "permissao"],
    intro:
      "Autenticação responde 'quem é você'; autorização responde 'o que você pode fazer'. Confundir as duas é a origem de boa parte das falhas de segurança.",
    deep: [
      "Senha nunca é guardada em texto: guarda-se um hash lento e com sal (bcrypt, argon2). Assim, mesmo com o banco vazado, descobrir a senha original é inviável.",
      "Depois do login o servidor emite um token (ou cria uma sessão) que o cliente envia a cada pedido. O token diz quem é o usuário — e precisa ser validado no servidor a cada requisição, nunca só na tela.",
      "Permissão se verifica no servidor, sempre. Esconder um botão no front-end não impede ninguém de chamar a rota direto. Regras de acesso ficam junto dos dados.",
    ],
    example: {
      language: "javascript",
      code: `// Login: o servidor confere o hash e devolve um token
const ok = await bcrypt.compare(senhaDigitada, usuario.senhaHash);
if (!ok) return resposta(401, "credenciais inválidas");

const token = criarToken({ sub: usuario.id, exp: agoraMais(1, "hora") });

// Em cada requisição protegida: validar SEMPRE no servidor
const dados = validarToken(req.headers.authorization);
if (!dados) return resposta(401, "não autenticado");
if (!podeEditar(dados.sub, recursoId)) return resposta(403, "sem permissão");`,
      explain:
        "401 é 'não sei quem você é'; 403 é 'sei quem você é, mas você não pode'. Os dois checados no servidor.",
    },
    pitfalls: [
      "Guardar senha em texto ou com hash rápido (MD5, SHA1 puro).",
      "Confiar em verificação feita só no navegador.",
      "Token sem expiração ou guardado em lugar acessível por scripts de terceiros.",
    ],
    quiz: [
      {
        q: "Qual a diferença entre autenticação e autorização?",
        options: [
          "São sinônimos",
          "Autenticação é quem você é; autorização é o que você pode fazer",
          "Autorização vem antes do login",
          "Autenticação só existe em APIs",
        ],
        answer: 1,
        why: "Identidade e permissão são checagens diferentes, ambas no servidor.",
      },
      {
        q: "Por que usar hash lento com sal para senhas?",
        options: [
          "Para economizar espaço",
          "Para tornar inviável descobrir a senha original mesmo com o banco vazado",
          "Para acelerar o login",
          "Porque o banco exige",
        ],
        answer: 1,
        why: "O custo alto por tentativa inviabiliza ataques de força bruta em massa.",
      },
    ],
  },
];
