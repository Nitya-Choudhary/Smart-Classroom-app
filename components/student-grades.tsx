"use client"

import { BarChart3, FileText, CheckCircle2, Clock } from "lucide-react"
import { formatDate } from "@/lib/utils"
import type { Submission, Assignment, Mark } from "@/lib/types"

interface StudentGradesProps {
  submissions: (Submission & { assignment: Assignment; marks: Mark[] })[]
}

export function StudentGrades({ submissions }: StudentGradesProps) {
  const gradedSubmissions = submissions.filter((s) => s.marks?.length > 0)
  const pendingSubmissions = submissions.filter((s) => !s.marks?.length)

  const totalScore = gradedSubmissions.reduce(
    (sum, s) => sum + (s.marks[0]?.score || 0),
    0
  )
  const totalMaxScore = gradedSubmissions.reduce(
    (sum, s) => sum + (s.marks[0]?.max_score || 0),
    0
  )
  const averagePercentage =
    totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Grades</h1>
        <p className="text-muted-foreground">
          View your grades and performance
        </p>
      </div>

      {/* Overview */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {averagePercentage}%
              </p>
              <p className="text-sm text-muted-foreground">Average Score</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center text-success">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {gradedSubmissions.length}
              </p>
              <p className="text-sm text-muted-foreground">Graded</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center text-warning">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {pendingSubmissions.length}
              </p>
              <p className="text-sm text-muted-foreground">Awaiting Grade</p>
            </div>
          </div>
        </div>
      </div>

      {/* Graded Assignments */}
      {gradedSubmissions.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-foreground">Graded Assignments</h2>
          <div className="rounded-xl border border-border bg-card divide-y divide-border">
            {gradedSubmissions.map((submission) => {
              const mark = submission.marks[0]
              const percentage = Math.round(
                (mark.score / mark.max_score) * 100
              )
              return (
                <div
                  key={submission.id}
                  className="p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center text-success shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">
                        {submission.assignment?.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Submitted {formatDate(submission.submitted_at)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-foreground">
                      {mark.score}/{mark.max_score}
                    </p>
                    <p
                      className={`text-sm ${
                        percentage >= 70
                          ? "text-success"
                          : percentage >= 50
                          ? "text-warning"
                          : "text-destructive"
                      }`}
                    >
                      {percentage}%
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Pending */}
      {pendingSubmissions.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-foreground">Awaiting Grade</h2>
          <div className="rounded-xl border border-border bg-card divide-y divide-border">
            {pendingSubmissions.map((submission) => (
              <div
                key={submission.id}
                className="p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center text-warning shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">
                      {submission.assignment?.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Submitted {formatDate(submission.submitted_at)}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning">
                  Pending
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {submissions.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">No grades yet</h3>
          <p className="text-muted-foreground">
            Submit assignments to see your grades here
          </p>
        </div>
      )}
    </div>
  )
}
