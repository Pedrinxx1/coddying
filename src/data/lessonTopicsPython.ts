import type { Topic } from "./lessonLibrary";

export const pythonTopics: Topic[] = [
  {
    id: "python-arquivos-json",
    title: "Arquivos, caminhos e JSON",
    keys: ["arquivo", "arquivos", "json", "csv", "pathlib", "caminho"],
    langs: ["python"],
    intro: "Programas úteis precisam guardar e recuperar informações. Em Python, arquivos devem ser abertos com contexto, texto precisa de uma codificação explícita e JSON deve ser convertido entre objetos Python e texto antes de ser salvo.",
    deep: [
      "O bloco with abre o recurso e garante o fechamento mesmo se ocorrer uma exceção. Os modos mais comuns são r para leitura, w para substituir e a para acrescentar. Informar encoding='utf-8' evita que acentos dependam da configuração do computador.",
      "pathlib.Path representa caminhos sem montar barras manualmente. Ele permite verificar existência, criar pastas e combinar diretórios de forma compatível com Windows, Linux e macOS.",
      "json.load lê de um arquivo e json.loads lê de uma string; json.dump grava em arquivo e json.dumps devolve uma string. JSON aceita objetos, listas, textos, números, booleanos e null, mas não aceita qualquer classe Python automaticamente.",
    ],
    example: {
      language: "python",
      code: `from pathlib import Path\nimport json\n\narquivo = Path("dados") / "aluno.json"\narquivo.parent.mkdir(exist_ok=True)\n\naluno = {"nome": "Ana", "xp": 120, "ativo": True}\nwith arquivo.open("w", encoding="utf-8") as saida:\n    json.dump(aluno, saida, ensure_ascii=False, indent=2)\n\nwith arquivo.open("r", encoding="utf-8") as entrada:\n    recuperado = json.load(entrada)\n\nprint(recuperado["xp"])`,
      explain: "A pasta é criada antes da gravação, o arquivo sempre é fechado pelo with e ensure_ascii=False preserva os caracteres do português.",
    },
    pitfalls: [
      "Abrir o arquivo sem with e deixá-lo aberto quando ocorre um erro.",
      "Usar w quando queria acrescentar conteúdo: esse modo apaga o conteúdo anterior.",
      "Tentar salvar datetime, set ou uma classe diretamente em JSON sem convertê-los.",
    ],
    quiz: [
      { q: "Por que usar with ao abrir um arquivo?", options: ["Para deixá-lo público", "Para garantir o fechamento do recurso", "Para converter tudo em JSON", "Para impedir leitura"], answer: 1, why: "O gerenciador de contexto fecha o arquivo tanto no fluxo normal quanto quando surge uma exceção." },
      { q: "Qual função lê JSON diretamente de um arquivo aberto?", options: ["json.loads", "json.read", "json.load", "json.parse"], answer: 2, why: "load trabalha com arquivo; loads trabalha com uma string que já está na memória." },
    ],
  },
  {
    id: "python-pacotes-ambiente",
    title: "Módulos, pacotes e ambientes isolados",
    keys: ["modulo", "modulos", "pacote", "pacotes", "pip", "virtualenv", "venv", "pyproject", "import"],
    langs: ["python"],
    intro: "Módulos dividem o programa em arquivos importáveis; pacotes agrupam módulos relacionados; ambientes virtuais isolam as dependências de cada projeto para impedir conflitos entre versões.",
    deep: [
      "Ao importar um módulo, Python procura primeiro no projeto e depois nos caminhos instalados. Código que executa trabalho no momento do import torna testes imprevisíveis; deixe a execução principal sob if __name__ == '__main__'.",
      "Um ambiente virtual cria um interpretador e uma pasta de dependências próprios. Ative-o antes de instalar com pip e registre versões em pyproject.toml ou requirements.txt para que outra pessoa consiga reproduzir o projeto.",
      "Imports absolutos deixam clara a origem; imports relativos são úteis dentro de um mesmo pacote. Evite nomes como json.py ou requests.py, pois eles escondem bibliotecas de mesmo nome.",
    ],
    example: {
      language: "python",
      code: `# estrutura\n# loja/\n#   __init__.py\n#   precos.py\n# main.py\n\n# loja/precos.py\ndef com_desconto(valor, percentual):\n    return valor * (1 - percentual / 100)\n\n# main.py\nfrom loja.precos import com_desconto\n\ndef main():\n    print(com_desconto(100, 15))\n\nif __name__ == "__main__":\n    main()`,
      explain: "A regra fica em um módulo reutilizável e a execução só acontece ao rodar main.py, não quando ele é importado em um teste.",
    },
    pitfalls: [
      "Instalar dependências globalmente e depois não saber quais pertencem ao projeto.",
      "Criar um arquivo com o mesmo nome da biblioteca que deseja importar.",
      "Executar banco, rede ou prints no topo de um módulo importável.",
    ],
    quiz: [
      { q: "O que um ambiente virtual isola?", options: ["A internet", "As dependências e versões de cada projeto", "Os arquivos do usuário", "A sintaxe Python"], answer: 1, why: "Cada projeto passa a ter seu próprio conjunto de pacotes, sem alterar os demais." },
      { q: "Para que serve o teste __name__ == '__main__'?", options: ["Criar um pacote", "Executar o ponto de entrada apenas quando o arquivo é rodado", "Instalar dependências", "Esconder uma função"], answer: 1, why: "Ao importar o arquivo, a definição fica disponível sem disparar a execução principal." },
    ],
  },
  {
    id: "python-decoradores-geradores",
    title: "Decoradores, iteradores e geradores",
    keys: ["decorator", "decorators", "decorador", "decoradores", "generator", "generators", "gerador", "geradores", "iterador", "yield"],
    langs: ["python"],
    intro: "Decoradores envolvem uma função para acrescentar comportamento sem alterar seu corpo. Geradores produzem valores sob demanda com yield, evitando carregar coleções inteiras na memória.",
    deep: [
      "Funções são objetos: podem ser guardadas, passadas como argumento e devolvidas por outra função. Um decorador usa exatamente isso e normalmente preserva nome e documentação com functools.wraps.",
      "yield pausa a função e conserva seu estado até a próxima iteração. O resultado é um iterador consumível uma vez, ideal para arquivos grandes, paginação e fluxos contínuos.",
      "Use decorador para responsabilidades transversais, como medição de tempo, autorização e logs. Use gerador quando não precisa de todos os elementos simultaneamente.",
    ],
    example: {
      language: "python",
      code: `from functools import wraps\n\ndef registrar(funcao):\n    @wraps(funcao)\n    def envolvida(*args, **kwargs):\n        print(f"executando {funcao.__name__}")\n        return funcao(*args, **kwargs)\n    return envolvida\n\n@registrar\ndef pares(limite):\n    for numero in range(limite):\n        if numero % 2 == 0:\n            yield numero\n\nprint(list(pares(10)))`,
      explain: "O decorador registra a chamada e o gerador entrega cada número par somente quando a lista solicita o próximo valor.",
    },
    pitfalls: [
      "Esquecer de retornar a função interna do decorador.",
      "Tentar percorrer o mesmo gerador uma segunda vez depois de consumi-lo.",
      "Transformar um gerador enorme em list e perder a economia de memória.",
    ],
    quiz: [
      { q: "O que yield faz?", options: ["Encerra definitivamente a função", "Produz um valor e pausa mantendo o estado", "Cria uma lista completa", "Captura exceções"], answer: 1, why: "Na próxima iteração, a execução continua exatamente depois do yield anterior." },
      { q: "Por que usar functools.wraps em um decorador?", options: ["Para deixá-lo assíncrono", "Para preservar nome e metadados da função original", "Para criar uma classe", "Para instalar o decorador"], answer: 1, why: "Sem wraps, ferramentas e mensagens enxergam apenas o nome da função envolvente." },
    ],
  },
  {
    id: "python-modelagem-objetos",
    title: "Modelagem com classes e dataclasses",
    keys: ["poo em python", "classe", "classes", "objeto", "objetos", "dataclass", "orientacao a objetos", "encapsulamento", "heranca"],
    langs: ["python"],
    intro: "Uma classe reúne estado e comportamento que pertencem ao mesmo conceito. Em Python, dataclasses reduzem código repetitivo para objetos de dados, enquanto métodos preservam as regras que mantêm o objeto válido.",
    deep: [
      "O construtor estabelece um estado válido. Em vez de deixar qualquer parte do sistema alterar atributos sem regra, exponha métodos que expressem ações do domínio, como adicionar_xp ou cancelar_pedido.",
      "Herança representa uma relação real de 'é um'; composição representa 'tem um' e costuma ser mais flexível. Antes de herdar, pergunte se trocar o componente interno resolveria melhor.",
      "@dataclass gera inicialização, representação e comparação. Use field(default_factory=list) para listas: um valor mutável compartilhado entre instâncias é um bug clássico.",
    ],
    example: {
      language: "python",
      code: `from dataclasses import dataclass, field\n\n@dataclass\nclass Aluno:\n    nome: str\n    xp: int = 0\n    conquistas: list[str] = field(default_factory=list)\n\n    def adicionar_xp(self, pontos: int) -> None:\n        if pontos <= 0:\n            raise ValueError("pontos devem ser positivos")\n        self.xp += pontos\n\naluno = Aluno("Ana")\naluno.adicionar_xp(15)\nprint(aluno.xp)`,
      explain: "A classe começa válida, cada aluno recebe sua própria lista e a mudança de XP passa por uma regra verificável.",
    },
    pitfalls: [
      "Criar classe sem comportamento apenas para agrupar variáveis que caberiam em uma estrutura simples.",
      "Usar uma lista como valor padrão compartilhado entre instâncias.",
      "Usar herança profunda quando composição deixaria as peças independentes.",
    ],
    quiz: [
      { q: "Quando composição costuma ser melhor que herança?", options: ["Quando a relação é 'tem um' e a peça pode variar", "Quando não há classes", "Somente em scripts", "Nunca"], answer: 0, why: "Composição permite trocar colaboradores sem criar uma árvore rígida de subclasses." },
      { q: "Por que usar default_factory=list?", options: ["Para ordenar a lista", "Para criar uma lista separada para cada instância", "Para impedir append", "Para converter em tupla"], answer: 1, why: "Um valor mutável único seria compartilhado acidentalmente por todos os objetos." },
    ],
  },
  {
    id: "python-producao",
    title: "Python confiável em produção",
    keys: ["logging", "log", "mypy", "profiling", "profile", "desempenho", "cli", "linha de comando", "asyncio", "assíncrono", "type hints"],
    langs: ["python"],
    intro: "Código de produção precisa ser observável, testável e previsível. Tipos documentam contratos, logs explicam o que ocorreu e medições mostram onde otimizar sem depender de adivinhação.",
    deep: [
      "Type hints não bloqueiam valores em tempo de execução, mas permitem que analisadores detectem chamadas incompatíveis antes do programa rodar. Anote fronteiras públicas e deixe variáveis óbvias serem inferidas.",
      "Logging substitui prints operacionais. Níveis DEBUG, INFO, WARNING e ERROR permitem controlar detalhe; contexto como identificador da operação torna uma falha rastreável.",
      "Concorrência assíncrona ajuda tarefas que esperam rede ou disco, não cálculos pesados. Meça com profiler antes de otimizar e ataque o gargalo comprovado.",
    ],
    example: {
      language: "python",
      code: `import logging\nfrom collections.abc import Iterable\n\nlogging.basicConfig(level=logging.INFO)\nlogger = logging.getLogger(__name__)\n\ndef totalizar(valores: Iterable[float]) -> float:\n    total = sum(valores)\n    logger.info("total calculado", extra={"quantidade": len(list(valores))})\n    return total\n\nprint(totalizar([4.0, 5.0, 6.0]))`,
      explain: "A assinatura declara o contrato de entrada e saída, enquanto o log registra o acontecimento sem misturar diagnóstico com o resultado do programa.",
    },
    pitfalls: [
      "Acreditar que type hint valida dados externos automaticamente.",
      "Registrar senhas, tokens ou dados pessoais nos logs.",
      "Usar async para cálculo pesado e esperar que ele fique mais rápido.",
    ],
    quiz: [
      { q: "Type hints impedem um tipo errado em tempo de execução?", options: ["Sempre", "Não; precisam de analisador ou validação complementar", "Só em listas", "Só no Windows"], answer: 1, why: "As anotações descrevem contratos, mas o interpretador não as transforma em validação automática." },
      { q: "Quando async é mais útil?", options: ["Em espera de rede e disco", "Em qualquer cálculo matemático", "Para substituir testes", "Para formatar texto"], answer: 0, why: "Enquanto uma operação espera entrada ou saída, outras tarefas podem progredir." },
    ],
  },
];