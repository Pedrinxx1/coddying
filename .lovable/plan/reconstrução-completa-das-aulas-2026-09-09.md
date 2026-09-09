# Reconstrução completa das aulas

## Objetivo

Transformar todas as aulas de todos os cursos em experiências guiadas, claras e práticas. Cada aula deve ensinar o assunto do zero até a aplicação, em vez de apenas exibir blocos de texto genéricos.

## O que será construído

### 1. Um novo formato de aula para todo o catálogo

- Abertura curta com o problema que a aula resolve, pré-requisitos, duração e resultados esperados.
- Caminho visual em etapas: entender, observar, prever, testar, corrigir, praticar e revisar.
- Explicações divididas em parágrafos, listas, tabelas, comparações e destaques adequados ao conteúdo.
- Exemplos comentados linha por linha, com entrada, execução e saída claramente separadas.
- Glossário contextual para termos novos e uma seção visual de erros comuns.

### 2. Interatividade adequada a cada matéria

- Programação: editor executável, previsão de saída, completar código, depuração e miniprojeto.
- HTML/CSS e interfaces: edição com visualização imediata e desafios de estrutura, estilo e acessibilidade.
- SQL e dados: tabelas de exemplo, consulta, resultado esperado e análise passo a passo.
- Git, Docker, DevOps e carreira: terminal simulado, ordenação de comandos, decisões de cenário e checklists práticos.
- Estruturas, algoritmos, ciência de dados e machine learning: visualização de estados, rastreamento passo a passo, comparação e interpretação de resultados.

### 3. Conteúdo específico e profundo

- Remover o uso de uma explicação genérica para dezenas de títulos diferentes.
- Criar famílias didáticas por curso e assunto, respeitando a linguagem, a dificuldade e o contexto da lição.
- Garantir em cada aula: definição, modelo mental, sintaxe ou processo, exemplo resolvido, variações, limites, erros, prática e projeto.
- Reescrever títulos, textos e instruções em português natural e consistente.

### 4. Nova apresentação da página

- Índice compacto da aula e navegação clara entre etapas.
- Coluna de leitura com largura confortável e painel de prática que permanece acessível em telas grandes.
- No celular, sequência única sem blocos altos ou conteúdo espremido, com ações principais sempre legíveis.
- Código com quebra e rolagem corretas, saídas visualmente separadas e feedback de acerto/erro fácil de entender.
- Vídeos, tutor local, quiz, revisão e conclusão integrados na ordem pedagógica correta.

### 5. Qualidade e validação

- Auditoria automática do catálogo para identificar lições sem conteúdo específico, exemplos, prática ou revisão.
- Testes em pelo menos uma aula de cada curso, incluindo formatos diferentes de atividade.
- Validação em celular e computador para impedir texto cortado, excesso de espaço, rolagem lateral e controles ilegíveis.

## Detalhes técnicos

- Evoluir o modelo de conteúdo para blocos estruturados e reutilizáveis, sem gerar texto superficial em tempo de execução.
- Separar conteúdo pedagógico de apresentação para permitir aprofundar o catálogo sem duplicar a página.
- Manter o tutor totalmente local e limitado ao material estruturado da aula, sempre indicando a fonte interna usada.
- Reaproveitar a execução de código e o salvamento de progresso existentes, adaptando a validação ao tipo de atividade.

## Critério de conclusão

Uma aula só será considerada completa quando tiver conteúdo específico, explicação progressiva, exemplo explicado, ao menos três momentos interativos, prática validável, erros comuns, revisão e uma atividade final — sem depender do fallback genérico.