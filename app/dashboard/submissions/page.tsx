import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TeacherSubmissions } from "@/components/teacher-submissions"

export default async function SubmissionsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "teacher") {
    redirect("/dashboard")
  }

  const { data: submissions } = await supabase
    .from("submissions")
    .select("*, student:profiles(*), assignment:assignments!inner(*), marks(*)")
    .eq("assignment.teacher_id", user.id)
    .order("submitted_at", { ascending: false })

  return <TeacherSubmissions submissions={submissions || []} teacherId={user.id} />
}
