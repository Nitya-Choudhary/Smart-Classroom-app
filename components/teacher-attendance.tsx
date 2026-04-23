"use client"

import Link from "next/link"
import { Plus, Clock, Users, CheckCircle2, XCircle } from "lucide-react"
import { formatDateTime } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { AttendanceSession, AttendanceRecord, Profile } from "@/lib/types"

interface TeacherAttendanceProps {
  sessions: (AttendanceSession & {
    attendance_records: (AttendanceRecord & { student: Profile })[]
  })[]
}

export function TeacherAttendance({ sessions }: TeacherAttendanceProps) {
  const router = useRouter()

  const endSession = async (sessionId: string) => {
    const supabase = createClient()
    await supabase
      .from("attendance_sessions")
      .update({ is_active: false })
      .eq("id", sessionId)
    router.refresh()
  }

  const isSessionActive = (session: AttendanceSession) => {
    const now = new Date()
    const start = new Date(session.start_time)
    const end = new Date(session.end_time)
    return session.is_active && now >= start && now <= end
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Attendance</h1>
          <p className="text-muted-foreground">
            Manage attendance sessions for your class
          </p>
        </div>
        <Link
          href="/dashboard/attendance/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Session
        </Link>
      </div>

      {sessions.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">
            No sessions yet
          </h3>
          <p className="text-muted-foreground mb-4">
            Create your first attendance session to start tracking
          </p>
          <Link
            href="/dashboard/attendance/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Session
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => {
            const active = isSessionActive(session)
            return (
              <div
                key={session.id}
                className="rounded-xl border border-border bg-card overflow-hidden"
              >
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        active
                          ? "bg-success/10 text-success"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">
                          {session.title}
                        </h3>
                        {active && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(session.start_time)} -{" "}
                        {formatDateTime(session.end_time)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      {session.attendance_records?.length || 0} students
                    </div>
                    {active && (
                      <button
                        onClick={() => endSession(session.id)}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                      >
                        End Session
                      </button>
                    )}
                  </div>
                </div>

                {session.attendance_records?.length > 0 && (
                  <div className="border-t border-border">
                    <div className="p-3 bg-muted/50">
                      <p className="text-sm font-medium text-muted-foreground">
                        Attendees
                      </p>
                    </div>
                    <div className="divide-y divide-border max-h-48 overflow-y-auto">
                      {session.attendance_records.map((record) => (
                        <div
                          key={record.id}
                          className="px-4 py-2 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            {record.status === "present" ? (
                              <CheckCircle2 className="w-4 h-4 text-success" />
                            ) : record.status === "late" ? (
                              <Clock className="w-4 h-4 text-warning" />
                            ) : (
                              <XCircle className="w-4 h-4 text-destructive" />
                            )}
                            <span className="text-sm text-foreground">
                              {record.student?.full_name}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(record.marked_at)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
