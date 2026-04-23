import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TeacherAssignments } from "@/components/teacher-assignments"
import { StudentAssignments } from "@/components/student-assignments"

export default async function AssignmentsPage() {
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

  if (!profile) {
    redirect("/auth/login")
  }

  if (profile.role === "teacher") {
    const { data: assignments } = await supabase
      .from("assignments")
      .select("*, submissions(count)")
      .eq("teacher_id", user.id)
      .order("created_at", { ascending: false })

    return <TeacherAssignments assignments={assignments || []} />
  }

  // Student view
  const { data: assignments } = await supabase
    .from("assignments")
    .select("*, teacher:profiles(*)")
    .order("deadline", { ascending: true })

  const { data: submissions } = await supabase
    .from("submissions")
    .select("*, marks(*)")
    .eq("student_id", user.id)

  const submissionMap = new Map(
    submissions?.map((s) => [s.assignment_id, s]) || []
  )

  return (
    <StudentAssignments
      userId={user.id}
      assignments={assignments || []}
      submissionMap={submissionMap}
    />
  )
}
