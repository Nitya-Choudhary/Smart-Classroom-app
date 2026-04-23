"use client"

import Link from "next/link"
import { ClipboardCheck, FileText, BarChart3, MessageSquare, Clock, AlertCircle, CheckCircle2 } from "lucide-react"
import { formatDate, formatDateTime, isDeadlinePassed } from "@/lib/utils"
import type { Profile, AttendanceRecord, Assignment, Submission, Feedback } from "@/lib/types"

interface StudentDashboardProps {
  profile: Profile
  attendanceRecords: (AttendanceRecord & { session: { title: string; start_time: string } })[]
  assignments: Assignment[]
  submissions: (Submission & { assignment: Assignment; marks: { score: number; max_score: number }[] })[]
  feedback: (Feedback & { teacher: Profile; assignment: Assignment | null })[]
}

export function StudentDashboard({
  profile,
  attendanceRecords,
  assignments,
  submissions,
  feedback,
}: StudentDashboardProps) {
  const submittedAssignmentIds = new Set(submissions.map((s) => s.assignment_id))
  const pendingAssignments = assignments.filter(
    (a) => !submittedAssignmentIds.has(a.id) && !isDeadlinePassed(a.deadline)
  )
  const totalMarks = submissions.reduce((sum, s) => {
    const mark = s.marks?.[0]
    return mark ? sum + mark.score : sum
  }, 0)
  const gradedCount = submissions.filter((s) => s.marks?.length > 0).length

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {profile.full_name.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground mt-1">
          {"Here's your classroom overview"}
        </p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-4 gap-4">
        <StatCard
          icon={<ClipboardCheck className="w-5 h-5" />}
          label="Attendance"
          value={attendanceRecords.length}
          subtext="sessions attended"
        />
        <StatCard
          icon={<FileText className="w-5 h-5" />}
          label="Submissions"
          value={submissions.length}
          subtext="assignments submitted"
        />
        <StatCard
          icon={<BarChart3 className="w-5 h-5" />}
          label="Average Score"
          value={gradedCount > 0 ? Math.round(totalMarks / gradedCount) : 0}
          subtext={`from ${gradedCount} graded`}
        />
        <StatCard
          icon={<AlertCircle className="w-5 h-5" />}
          label="Pending"
          value={pendingAssignments.length}
          subtext="assignments due"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending Assignments */}
        <div className="rounded-xl border border-border bg-card">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Pending Assignments</h2>
            <Link
              href="/dashboard/assignments"
              className="text-sm text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-border">
            {pendingAssignments.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle2 className="w-10 h-10 text-success mx-auto mb-2" />
                <p className="text-muted-foreground">All caught up!</p>
              </div>
            ) : (
              pendingAssignments.slice(0, 4).map((assignment) => (
                <Link
                  key={assignment.id}
                  href={`/dashboard/assignments/${assignment.id}`}
                  className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-foreground">{assignment.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Due {formatDate(assignment.deadline)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-warning">
                    <Clock className="w-4 h-4" />
                    Pending
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Attendance */}
        <div className="rounded-xl border border-border bg-card">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Recent Attendance</h2>
            <Link
              href="/dashboard/attendance"
              className="text-sm text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-border">
            {attendanceRecords.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No attendance records yet
              </div>
            ) : (
              attendanceRecords.slice(0, 4).map((record) => (
                <div
                  key={record.id}
                  className="p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      {record.session?.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(record.session?.start_time)}
                    </p>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success capitalize">
                    {record.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Feedback */}
      {feedback.length > 0 && (
        <div className="rounded-xl border border-border bg-card">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Recent Feedback</h2>
            <Link
              href="/dashboard/my-feedback"
              className="text-sm text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-border">
            {feedback.map((item) => (
              <div key={item.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-foreground">
                    {item.teacher?.full_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(item.created_at)}
                  </p>
                </div>
                {item.assignment && (
                  <p className="text-sm text-primary mb-1">
                    Re: {item.assignment.title}
                  </p>
                )}
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  subtext,
}: {
  icon: React.ReactNode
  label: string
  value: number
  subtext: string
}) {
  return (
    <div className="p-4 rounded-xl border border-border bg-card">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-sm text-muted-foreground">{subtext}</p>
        </div>
      </div>
    </div>
  )
}
