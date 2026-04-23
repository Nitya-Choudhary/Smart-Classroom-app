import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TeacherFeedback } from "@/components/teacher-feedback"

export default async function FeedbackPage() {
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

  // Get all students
  const { data: students } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "student")
    .order("full_name")

  // Get all assignments by this teacher
  const { data: assignments } = await supabase
    .from("assignments")
    .select("*")
    .eq("teacher_id", user.id)
    .order("created_at", { ascending: false })

  // Get existing feedback
  const { data: feedbackList } = await supabase
    .from("feedback")
    .select("*, student:profiles(*), assignment:assignments(*)")
    .eq("teacher_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <TeacherFeedback
      teacherId={user.id}
      students={students || []}
      assignments={assignments || []}
      feedbackList={feedbackList || []}
    />
  )
}
