"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { FileText, ExternalLink, CheckCircle2, Clock, Loader2 } from "lucide-react"
import { formatDateTime } from "@/lib/utils"
import type { Submission, Assignment, Profile, Mark } from "@/lib/types"

interface TeacherSubmissionsProps {
  submissions: (Submission & {
    student: Profile
    assignment: Assignment
    marks: Mark[]
  })[]
  teacherId: string
}

export function TeacherSubmissions({
  submissions,
  teacherId,
}: TeacherSubmissionsProps) {
  const [gradingId, setGradingId] = useState<string | null>(null)
  const [score, setScore] = useState("")
  const [maxScore, setMaxScore] = useState("100")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const ungradedSubmissions = submissions.filter((s) => !s.marks?.length)
  const gradedSubmissions = submissions.filter((s) => s.marks?.length > 0)

  const handleGrade = async (submissionId: string) => {
    if (!score || parseFloat(score) < 0) return

    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.from("marks").insert({
      submission_id: submissionId,
      teacher_id: teacherId,
      score: parseFloat(score),
      max_score: parseFloat(maxScore),
    })

    if (!error) {
      setGradingId(null)
      setScore("")
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Submissions</h1>
        <p className="text-muted-foreground">
          Review and grade student submissions
        </p>
      </div>

      {/* Ungraded */}
      {ungradedSubmissions.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Clock className="w-5 h-5 text-warning" />
            Needs Grading ({ungradedSubmissions.length})
          </h2>
          <div className="rounded-xl border border-border bg-card divide-y divide-border">
            {ungradedSubmissions.map((submission) => (
              <div key={submission.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center text-warning shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {submission.student?.full_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {submission.assignment?.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Submitted {formatDateTime(submission.submitted_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={submission.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    {gradingId === submission.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={score}
                          onChange={(e) => setScore(e.target.value)}
                          placeholder="Score"
                          min="0"
                          max={maxScore}
                          className="w-20 px-2 py-1 rounded border border-input bg-background text-foreground text-sm"
                        />
                        <span className="text-muted-foreground">/</span>
                        <input
                          type="number"
                          value={maxScore}
                          onChange={(e) => setMaxScore(e.target.value)}
                          min="1"
                          className="w-20 px-2 py-1 rounded border border-input bg-background text-foreground text-sm"
                        />
                        <button
                          onClick={() => handleGrade(submission.id)}
                          disabled={loading}
                          className="px-3 py-1 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                        >
                          {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Save"
                          )}
                        </button>
                        <button
                          onClick={() => setGradingId(null)}
                          className="px-3 py-1 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setGradingId(submission.id)}
                        className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                      >
                        Grade
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Graded */}
      {gradedSubmissions.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-success" />
            Graded ({gradedSubmissions.length})
          </h2>
          <div className="rounded-xl border border-border bg-card divide-y divide-border">
            {gradedSubmissions.map((submission) => {
              const mark = submission.marks[0]
              return (
                <div key={submission.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center text-success shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {submission.student?.full_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {submission.assignment?.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Submitted {formatDateTime(submission.submitted_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <a
                        href={submission.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <div className="text-right">
                        <p className="text-lg font-bold text-foreground">
                          {mark.score}/{mark.max_score}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {Math.round((mark.score / mark.max_score) * 100)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {submissions.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">
            No submissions yet
          </h3>
          <p className="text-muted-foreground">
            Student submissions will appear here once they submit their work
          </p>
        </div>
      )}
    </div>
  )
}
