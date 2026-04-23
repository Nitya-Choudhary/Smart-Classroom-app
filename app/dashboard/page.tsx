import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TeacherDashboard } from "@/components/teacher-dashboard"
import { StudentDashboard } from "@/components/student-dashboard"
import type { Profile } from "@/lib/types"

export default async function DashboardPage() {
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
    // Get teacher stats
    const [
      { count: sessionCount },
      { count: assignmentCount },
      { count: submissionCount },
      { data: recentSubmissions },
    ] = await Promise.all([
      supabase
        .from("attendance_sessions")
        .select("*", { count: "exact", head: true })
        .eq("teacher_id", user.id),
      supabase
        .from("assignments")
        .select("*", { count: "exact", head: true })
        .eq("teacher_id", user.id),
      supabase
        .from("submissions")
        .select("*, assignment:assignments!inner(*)")
        .eq("assignment.teacher_id", user.id)
        .then(({ data, error }) => ({ count: data?.length || 0, error })),
      supabase
        .from("submissions")
        .select("*, student:profiles(*), assignment:assignments!inner(*)")
        .eq("assignment.teacher_id", user.id)
        .order("submitted_at", { ascending: false })
        .limit(5),
    ])

    return (
      <TeacherDashboard
        profile={profile as Profile}
        stats={{
          sessions: sessionCount || 0,
          assignments: assignmentCount || 0,
          submissions: submissionCount || 0,
        }}
        recentSubmissions={recentSubmissions || []}
      />
    )
  }

  // Student dashboard
  const [
    { data: attendanceRecords },
    { data: assignments },
    { data: submissions },
    { data: feedback },
  ] = await Promise.all([
    supabase
      .from("attendance_records")
      .select("*, session:attendance_sessions(*)")
      .eq("student_id", user.id)
      .order("marked_at", { ascending: false })
      .limit(5),
    supabase
      .from("assignments")
      .select("*")
      .order("deadline", { ascending: true })
      .limit(5),
    supabase
      .from("submissions")
      .select("*, assignment:assignments(*), marks(*)")
      .eq("student_id", user.id),
    supabase
      .from("feedback")
      .select("*, teacher:profiles(*), assignment:assignments(*)")
      .eq("student_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3),
  ])

  return (
    <StudentDashboard
      profile={profile as Profile}
      attendanceRecords={attendanceRecords || []}
      assignments={assignments || []}
      submissions={submissions || []}
      feedback={feedback || []}
    />
  )
}
