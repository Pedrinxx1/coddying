CREATE TABLE public.lesson_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_slug text NOT NULL,
  module_index integer NOT NULL,
  lesson_index integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_slug, module_index, lesson_index)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lesson_favorites TO authenticated;
GRANT ALL ON public.lesson_favorites TO service_role;
ALTER TABLE public.lesson_favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own lesson favorites" ON public.lesson_favorites FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.lesson_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_slug text NOT NULL,
  module_index integer NOT NULL,
  lesson_index integer NOT NULL,
  section_id text NOT NULL DEFAULT 'aula-explicacao',
  body text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_slug, module_index, lesson_index, section_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lesson_notes TO authenticated;
GRANT ALL ON public.lesson_notes TO service_role;
ALTER TABLE public.lesson_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own lesson notes" ON public.lesson_notes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER set_lesson_notes_updated_at BEFORE UPDATE ON public.lesson_notes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX lesson_favorites_user_idx ON public.lesson_favorites(user_id, created_at DESC);
CREATE INDEX lesson_notes_user_lesson_idx ON public.lesson_notes(user_id, course_slug, module_index, lesson_index);