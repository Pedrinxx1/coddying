import { supabase } from "@/integrations/supabase/client";
import { countLessons, getCourse } from "@/data/courses";

const XP_PER_LESSON = 10;

/** Marca uma lição como concluída, atualiza XP, sequência de dias e conquistas. */
export async function completeLesson(
  userId: string,
  courseSlug: string,
  moduleIndex: number,
  lessonIndex: number,
) {
  const { error } = await supabase.from("lesson_progress").insert({
    user_id: userId,
    course_slug: courseSlug,
    module_index: moduleIndex,
    lesson_index: lessonIndex,
  });
  if (error && !error.message.includes("duplicate")) return { newAchievements: [] as string[] };

  const today = new Date().toISOString().slice(0, 10);
  const { data: profile } = await supabase
    .from("profiles")
    .select("xp, streak, last_active")
    .eq("id", userId)
    .maybeSingle();

  let streak = profile?.streak ?? 0;
  if (profile?.last_active !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    streak = profile?.last_active === yesterday ? streak + 1 : 1;
  }
  await supabase
    .from("profiles")
    .upsert({
      id: userId,
      xp: (profile?.xp ?? 0) + XP_PER_LESSON,
      streak,
      last_active: today,
    });

  const { count } = await supabase
    .from("lesson_progress")
    .select("id", { count: "exact", head: true });
  const total = count ?? 0;

  const { count: courseCount } = await supabase
    .from("lesson_progress")
    .select("id", { count: "exact", head: true })
    .eq("course_slug", courseSlug);
  const course = getCourse(courseSlug);

  const unlocked: string[] = [];
  if (total >= 1) unlocked.push("first_lesson");
  if (total >= 10) unlocked.push("ten_lessons");
  if (total >= 50) unlocked.push("fifty_lessons");
  if (streak >= 3) unlocked.push("streak_3");
  if (course && (courseCount ?? 0) >= countLessons(course)) unlocked.push("first_course");

  const newAchievements: string[] = [];
  for (const code of unlocked) {
    const { error: aErr } = await supabase
      .from("achievements")
      .insert({ user_id: userId, code });
    if (!aErr) newAchievements.push(code);
  }
  return { newAchievements };
}

export async function uncompleteLesson(
  userId: string,
  courseSlug: string,
  moduleIndex: number,
  lessonIndex: number,
) {
  await supabase
    .from("lesson_progress")
    .delete()
    .eq("user_id", userId)
    .eq("course_slug", courseSlug)
    .eq("module_index", moduleIndex)
    .eq("lesson_index", lessonIndex);
}
