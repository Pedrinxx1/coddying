// Videoaulas sugeridas para cada lição.
// Não inventamos links de vídeos específicos: montamos buscas prontas em
// canais/plataformas conhecidas em português, para o aluno assistir sem sair perdido.

export type VideoAula = {
  titulo: string;
  descricao: string;
  url: string;
};

const encode = (s: string) => encodeURIComponent(s.trim().replace(/\s+/g, " "));

export function videoAulas(courseTitle: string, moduleTitle: string, lessonTitle: string): VideoAula[] {
  const base = `${courseTitle} ${lessonTitle}`;
  return [
    {
      titulo: "Aula em vídeo sobre este tema",
      descricao: `Vídeos em português explicando "${lessonTitle}" passo a passo.`,
      url: `https://www.youtube.com/results?search_query=${encode(`${base} aula em português`)}`,
    },
    {
      titulo: "Vendo alguém programar isso",
      descricao: "Exemplos práticos, com o código sendo escrito na tela.",
      url: `https://www.youtube.com/results?search_query=${encode(`${base} exemplo prático código`)}`,
    },
    {
      titulo: `Playlist completa de ${courseTitle}`,
      descricao: `Curso em vídeo do começo ao fim, para acompanhar junto com o módulo "${moduleTitle}".`,
      url: `https://www.youtube.com/results?search_query=${encode(`curso completo de ${courseTitle} português`)}&sp=EgIQAw%253D%253D`,
    },
  ];
}
