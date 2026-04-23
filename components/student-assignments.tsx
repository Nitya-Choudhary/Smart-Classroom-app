"use client"

import Link from "next/link"
import { FileText, Calendar, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { formatDate, isDeadlinePassed } from "@/lib/utils"
import type { Assignment, Submission, Mark, Profile } from "@/lib/types"

interface StudentAssignmentsProps {
  userId: string
  assignments: (Assignment & { teacher: Profile })[]
  submissionMap: Map<string, Submission & { marks: Mark[] }>
}

export function StudentAssignments({
  assignments,
  submissionMap,
}: StudentAssignmentsProps) {
  const pendingAssignments = assignments.filter(
    (a) => !submissionMap.has(a.id) && !isDeadlinePassed(a.deadline)
  )
  const submittedAssignments = assignments.filter((a) => submissionMap.has(a.id))
  const missedAssignments = assignments.filter(
    (a) => !submissionMap.has(a.id) && isDeadlinePassed(a.deadline)
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Assignments</h1>
        <p className="text-muted-foreground">
          View and submit your assignments
        </p>
      </div>

      {/* Pending */}
      {pendingAssignments.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-warning" />
            Pending ({pendingAssignments.length})
          </h2>
          <div className="grid gap-4">
            {pendingAssignments.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                status="pending"
              />
            ))}
          </div>
        </div>
      )}

      {/* Submitted */}
      {submittedAssignments.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-success" />
            Submitted ({submittedAssignments.length})
          </h2>
          <div className="grid gap-4">
            {submittedAssignments.map((assignment) => {
              const submission = submissionMap.get(assignment.id)
              const mark = submission?.marks?.[0]
              return (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  status="submitted"
                  mark={mark}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* Missed */}
      {missedAssignments.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Clock className="w-5 h-5 text-muted-foreground" />
            Missed ({missedAssignments.length})
          </h2>
          <div className="grid gap-4">
            {missedAssignments.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                status="missed"
              />
            ))}
          </div>
        </div>
      )}

      {assignments.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">
            No assignments yet
          </h3>
          <p className="text-muted-foreground">
            Your teacher hasn&apos;t posted any assignments yet
          </p>
        </div>
      )}
    </div>
  )
}

function AssignmentCard({
  assignment,
  status,
  mark,
}: {
  assignment: Assignment & { teacher: Profile }
  status: "pending" | "submitted" | "missed"
  mark?: Mark
}) {
  return (
    <Link
      href={`/dashboard/assignments/${assignment.id}`}
      className="rounded-xl border border-border bg-card p-4 hover:border-primary/50 transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
              status === "pending"
                ? "bg-warning/10 text-warning"
                : status === "submitted"
                ? "bg-success/10 text-success"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{assignment.title}</h3>
            <p className="text-sm text-muted-foreground">
              by {assignment.teacher?.full_name}
            </p>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-2">
              <Calendar className="w-4 h-4" />
              <span>Due {formatDate(assignment.deadline)}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          {status === "pending" && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning">
              Pending
            </span>
          )}
          {status === "submitted" && mark && (
            <div>
              <span className="text-lg font-bold text-foreground">
                {mark.score}/{mark.max_score}
              </span>
              <p className="text-xs text-muted-foreground">Graded</p>
            </div>
          )}
          {status === "submitted" && !mark && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
              Submitted
            </span>
          )}
          {status === "missed" && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
              Missed
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
