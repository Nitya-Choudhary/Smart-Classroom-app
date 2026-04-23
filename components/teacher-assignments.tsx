"use client"

import Link from "next/link"
import { Plus, FileText, Calendar, Users, Trash2 } from "lucide-react"
import { formatDate, isDeadlinePassed } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { Assignment } from "@/lib/types"

interface TeacherAssignmentsProps {
  assignments: (Assignment & { submissions: { count: number }[] })[]
}

export function TeacherAssignments({ assignments }: TeacherAssignmentsProps) {
  const router = useRouter()

  const deleteAssignment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return

    const supabase = createClient()
    await supabase.from("assignments").delete().eq("id", id)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assignments</h1>
          <p className="text-muted-foreground">
            Create and manage assignments for your students
          </p>
        </div>
        <Link
          href="/dashboard/assignments/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Assignment
        </Link>
      </div>

      {assignments.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">
            No assignments yet
          </h3>
          <p className="text-muted-foreground mb-4">
            Create your first assignment to get started
          </p>
          <Link
            href="/dashboard/assignments/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Assignment
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {assignments.map((assignment) => {
            const isPast = isDeadlinePassed(assignment.deadline)
            const submissionCount = assignment.submissions?.[0]?.count || 0
            return (
              <div
                key={assignment.id}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        isPast
                          ? "bg-muted text-muted-foreground"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <Link
                        href={`/dashboard/assignments/${assignment.id}`}
                        className="font-semibold text-foreground hover:text-primary transition-colors"
                      >
                        {assignment.title}
                      </Link>
                      {assignment.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {assignment.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>Due {formatDate(assignment.deadline)}</span>
                          {isPast && (
                            <span className="px-1.5 py-0.5 rounded text-xs bg-muted text-muted-foreground">
                              Closed
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Users className="w-4 h-4" />
                          <span>{submissionCount} submissions</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteAssignment(assignment.id)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
