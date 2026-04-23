import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TeacherAttendance } from "@/components/teacher-attendance"
import { StudentAttendance } from "@/components/student-attendance"

export default async function AttendancePage() {
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
    const { data: sessions } = await supabase
      .from("attendance_sessions")
      .select("*, attendance_records(*, student:profiles(*))")
      .eq("teacher_id", user.id)
      .order("created_at", { ascending: false })

    return <TeacherAttendance sessions={sessions || []} />
  }

  // Student view
  const { data: activeSessions } = await supabase
    .from("attendance_sessions")
    .select("*, teacher:profiles(*)")
    .eq("is_active", true)
    .lte("start_time", new Date().toISOString())
    .gte("end_time", new Date().toISOString())

  const { data: myRecords } = await supabase
    .from("attendance_records")
    .select("*, session:attendance_sessions(*)")
    .eq("student_id", user.id)
    .order("marked_at", { ascending: false })

  return (
    <StudentAttendance
      userId={user.id}
      activeSessions={activeSessions || []}
      myRecords={myRecords || []}
    />
  )
}
