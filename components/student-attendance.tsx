"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Clock, CheckCircle2, Loader2 } from "lucide-react"
import { formatDateTime } from "@/lib/utils"
import type { AttendanceSession, AttendanceRecord, Profile } from "@/lib/types"

interface StudentAttendanceProps {
  userId: string
  activeSessions: (AttendanceSession & { teacher: Profile })[]
  myRecords: (AttendanceRecord & { session: AttendanceSession })[]
}

export function StudentAttendance({
  userId,
  activeSessions,
  myRecords,
}: StudentAttendanceProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const markedSessionIds = new Set(myRecords.map((r) => r.session_id))

  const markAttendance = async (sessionId: string) => {
    setLoading(sessionId)
    setError(null)

    const supabase = createClient()
    const { error: insertError } = await supabase
      .from("attendance_records")
      .insert({
        session_id: sessionId,
        student_id: userId,
        status: "present",
      })

    if (insertError) {
      setError(insertError.message)
      setLoading(null)
      return
    }

    router.refresh()
    setLoading(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Attendance</h1>
        <p className="text-muted-foreground">
          Mark your attendance for active sessions
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-foreground">Active Sessions</h2>
          {activeSessions.map((session) => {
            const alreadyMarked = markedSessionIds.has(session.id)
            return (
              <div
                key={session.id}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center text-success">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">
                          {session.title}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
                          Active
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        by {session.teacher?.full_name}
                      </p>
                    </div>
                  </div>
                  {alreadyMarked ? (
                    <div className="flex items-center gap-2 text-success">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-medium">Marked</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => markAttendance(session.id)}
                      disabled={loading === session.id}
                      className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {loading === session.id && (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}
                      Mark Present
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {activeSessions.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">
            No active sessions
          </h3>
          <p className="text-muted-foreground">
            Check back later when your teacher starts an attendance session
          </p>
        </div>
      )}

      {/* My Attendance History */}
      <div className="space-y-4">
        <h2 className="font-semibold text-foreground">My Attendance History</h2>
        {myRecords.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            No attendance records yet
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card divide-y divide-border">
            {myRecords.map((record) => (
              <div
                key={record.id}
                className="p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {record.session?.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(record.marked_at)}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                    record.status === "present"
                      ? "bg-success/10 text-success"
                      : record.status === "late"
                      ? "bg-warning/10 text-warning"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {record.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
