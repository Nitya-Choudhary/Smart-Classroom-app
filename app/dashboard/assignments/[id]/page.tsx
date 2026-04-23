import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { AssignmentDetail } from "@/components/assignment-detail"

export default async function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
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

  const { data: assignment } = await supabase
    .from("assignments")
    .select("*, teacher:profiles(*)")
    .eq("id", id)
    .single()

  if (!assignment) {
    notFound()
  }

  // Get student's submission if exists
  const { data: submission } = await supabase
    .from("submissions")
    .select("*, marks(*)")
    .eq("assignment_id", id)
    .eq("student_id", user.id)
    .single()

  return (
    <AssignmentDetail
      assignment={assignment}
      submission={submission}
      userRole={profile.role}
      userId={user.id}
    />
  )
}
