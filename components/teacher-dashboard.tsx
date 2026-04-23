"use client"

import Link from "next/link"
import { ClipboardCheck, FileText, BarChart3, Clock, ArrowRight } from "lucide-react"
import { formatDateTime } from "@/lib/utils"
import type { Profile, Submission } from "@/lib/types"

interface TeacherDashboardProps {
  profile: Profile
  stats: {
    sessions: number
    assignments: number
    submissions: number
  }
  recentSubmissions: (Submission & { student: Profile; assignment: { title: string } })[]
}

export function TeacherDashboard({
  profile,
  stats,
  recentSubmissions,
}: TeacherDashboardProps) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {profile.full_name.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground mt-1">
          {"Here's an overview of your classroom"}
        </p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard
          icon={<ClipboardCheck className="w-5 h-5" />}
          label="Attendance Sessions"
          value={stats.sessions}
          href="/dashboard/attendance"
        />
        <StatCard
          icon={<FileText className="w-5 h-5" />}
          label="Assignments"
          value={stats.assignments}
          href="/dashboard/assignments"
        />
        <StatCard
          icon={<BarChart3 className="w-5 h-5" />}
          label="Submissions"
          value={stats.submissions}
          href="/dashboard/submissions"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          href="/dashboard/attendance/new"
          className="p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">
                  Create Attendance Session
                </h3>
                <p className="text-sm text-muted-foreground">
                  Start a new attendance tracking session
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </Link>

        <Link
          href="/dashboard/assignments/new"
          className="p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">
                  Create Assignment
                </h3>
                <p className="text-sm text-muted-foreground">
                  Post a new assignment for students
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </Link>
      </div>

      {/* Recent Submissions */}
      <div className="rounded-xl border border-border bg-card">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Recent Submissions</h2>
          <Link
            href="/dashboard/submissions"
            className="text-sm text-primary hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="divide-y divide-border">
          {recentSubmissions.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No submissions yet
            </div>
          ) : (
            recentSubmissions.map((submission) => (
              <div
                key={submission.id}
                className="p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {submission.student?.full_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {submission.assignment?.title}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {formatDateTime(submission.submitted_at)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode
  label: string
  value: number
  href: string
}) {
  return (
    <Link
      href={href}
      className="p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </div>
    </Link>
  )
}
