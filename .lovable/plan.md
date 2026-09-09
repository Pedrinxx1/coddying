# Reconstrução das aulas e da navegação

## Objetivo

Corrigir definitivamente a mistura entre matérias e transformar cada aula em uma experiência profunda, progressiva e prática. O novo visual seguirá a direção **Immersive Studio Workspace**, com grafite e verde, títulos Outfit, texto Figtree e foco em uma etapa por vez.

## O que será construído

### 1. Conteúdo isolado por curso e por aula

- Substituir a busca atual por palavras soltas por um registro explícito: `curso + módulo + aula`.
- Impedir que um conteúdo de Python, JavaScript, Git, SQL ou outro domínio seja reutilizado fora do curso correto.
- Criar validação automática que percorra todo o catálogo e falhe quando uma aula estiver sem conteúdo próprio, com linguagem incompatível ou apontando para outra matéria.
- Preservar as URLs e o progresso já salvo.

### 2. Novo padrão didático completo

Cada aula terá conteúdo específico e seguirá esta sequência:

1. problema real e objetivo;
2. pré-requisitos e conceitos novos;
3. modelo mental visual;
4. explicação progressiva com exemplos concretos;
5. exemplo comentado linha por linha;
6. previsão do resultado;
7. prática guiada com dicas graduais;
8. correção de erro real;
9. aplicação independente;
10. revisão, quiz e miniprojeto.

O conteúdo será organizado por famílias didáticas próprias para programação, interfaces, banco de dados, estruturas e algoritmos, dados/ML, Git/DevOps e carreira, sem texto genérico compartilhado entre assuntos incompatíveis.

### 3. Mais interatividade por matéria

- **Código:** executar, prever saída, completar trechos, localizar bugs e refatorar.
- **HTML/CSS/React:** editar e visualizar imediatamente, comparar estados e verificar estrutura/acessibilidade.
- **SQL e dados:** visualizar tabelas, acompanhar transformações e comparar consulta com resultado.
- **Estruturas e algoritmos:** animações de pilhas, filas, árvores, busca e ordenação passo a passo.
- **Git, Docker e DevOps:** terminal simulado, ordenação de comandos, estados e decisões de cenário.
- **Carreira e prompts:** estudos de caso, comparação de respostas e checklists avaliáveis.
- Cada aula terá vários exercícios curtos e uma aplicação final, não apenas um único desafio.

### 4. Nova experiência visual e navegação

- Aplicar a linguagem visual escolhida: fundo grafite, superfícies discretas, destaque verde e tipografia Outfit/Figtree.
- Trocar o topo carregado por uma barra compacta com curso, aula, progresso, busca, favorito e ações essenciais.
- Mostrar uma etapa por vez, com trilho de progresso claro; no momento da prática, abrir o espaço imersivo com instrução e editor lado a lado no computador.
- No celular, manter uma única coluna, editor legível e navegação fixa entre etapa anterior/próxima.
- Reorganizar acessibilidade, impressão e atalhos em um menu de ferramentas, sem esconder esses recursos.
- Manter autosave, retomada, tutor local, vídeos, quiz, PDF e conclusão já existentes.

### 5. Busca, favoritos e anotações

- Busca por curso, módulo, aula e conceito, com resultados restritos ao catálogo correto.
- Favoritar aulas e montar uma fila pessoal de estudo.
- Criar anotações por aula e por etapa, com edição automática e acesso posterior no painel.
- Para usuários conectados, salvar favoritos e notas no backend; para visitantes, manter rascunho local até entrarem.

### 6. Qualidade e validação

- Auditar todas as aulas dos 19 cursos, não apenas amostras.
- Testar mapeamento de conteúdo, exercícios, respostas, busca, favoritos, notas e retomada.
- Validar visualmente aulas representativas de cada família em celular e computador.
- Conferir teclado, leitor de tela, foco, contraste, rolagem lateral e impressão.

## Detalhes técnicos

- Evoluir o modelo de conteúdo para IDs estáveis e escopo obrigatório por curso; remover o fallback que escolhe tópicos por linguagem ou semelhança textual.
- Criar componentes de aula por bloco didático e laboratórios reutilizáveis por domínio, sem reutilizar texto pedagógico entre matérias.
- Adicionar tabelas de favoritos e anotações com acesso restrito ao próprio aluno, permissões explícitas e políticas de segurança.
- Usar tokens semânticos no tema global; o workspace de prática será responsivo e não substituirá o fluxo linear de leitura.

## Critérios de conclusão

- Nenhuma aula recebe conteúdo de outro curso ou fallback genérico.
- Toda aula possui explicação própria, exemplo comentado, pelo menos quatro interações, revisão e aplicação final.
- Busca, favoritos e anotações funcionam para visitantes e alunos conectados.
- A navegação fica clara em celular e computador, sem controles amontoados, texto cortado ou rolagem lateral.
- A auditoria completa do catálogo e os testes de interface passam antes da entrega.
