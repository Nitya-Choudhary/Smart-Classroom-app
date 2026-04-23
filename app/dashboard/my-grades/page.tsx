import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { StudentGrades } from "@/components/student-grades"

export default async function MyGradesPage() {
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

  const { data: submissions } = await supabase
    .from("submissions")
    .select("*, assignment:assignments(*), marks(*)")
    .eq("student_id", user.id)
    .order("submitted_at", { ascending: false })

  return <StudentGrades submissions={submissions || []} />
}
