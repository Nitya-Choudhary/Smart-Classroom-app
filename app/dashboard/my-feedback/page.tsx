import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { StudentFeedback } from "@/components/student-feedback"

export default async function MyFeedbackPage() {
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

  if (!profile || profile.role !== "student") {
    redirect("/dashboard")
  }

  const { data: feedback } = await supabase
    .from("feedback")
    .select("*, teacher:profiles(*), assignment:assignments(*)")
    .eq("student_id", user.id)
    .order("created_at", { ascending: false })

  return <StudentFeedback feedback={feedback || []} />
}
