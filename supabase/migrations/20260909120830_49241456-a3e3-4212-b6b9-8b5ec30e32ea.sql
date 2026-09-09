DROP POLICY IF EXISTS "Certificates are publicly verifiable" ON public.certificates;

REVOKE SELECT ON public.certificates FROM anon;

CREATE OR REPLACE FUNCTION public.verify_certificate(_code text)
RETURNS TABLE (
  student_name text,
  course_slug text,
  score integer,
  total_questions integer,
  issued_at timestamptz,
  code text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.student_name, c.course_slug, c.score, c.total_questions, c.issued_at, c.code
  FROM public.certificates c
  WHERE c.code = upper(btrim(_code))
    AND length(btrim(_code)) >= 4
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.verify_certificate(text) TO anon, authenticated;