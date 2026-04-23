"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, Calendar, User, FileText, Upload, CheckCircle2, Loader2 } from "lucide-react"
import { formatDate, formatDateTime, isDeadlinePassed } from "@/lib/utils"
import type { Assignment, Submission, Mark, Profile, UserRole } from "@/lib/types"

interface AssignmentDetailProps {
  assignment: Assignment & { teacher: Profile }
  submission: (Submission & { marks: Mark[] }) | null
  userRole: UserRole
  userId: string
}

export function AssignmentDetail({
  assignment,
  submission,
  userRole,
  userId,
}: AssignmentDetailProps) {
  const [fileUrl, setFileUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const isPast = isDeadlinePassed(assignment.deadline)
  const mark = submission?.marks?.[0]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fileUrl.trim()) {
      setError("Please enter a file URL")
      return
    }

    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error: insertError } = await supabase.from("submissions").insert({
      assignment_id: assignment.id,
      student_id: userId,
      file_url: fileUrl,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.refresh()
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/dashboard/assignments"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Assignments
      </Link>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">
                {assignment.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  {assignment.teacher?.full_name}
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Due {formatDateTime(assignment.deadline)}
                </div>
              </div>
            </div>
            {isPast ? (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                Closed
              </span>
            ) : (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                Open
              </span>
            )}
          </div>
        </div>

        {assignment.description && (
          <div className="p-6 border-b border-border">
            <h2 className="font-semibold text-foreground mb-2">Description</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {assignment.description}
            </p>
          </div>
        )}

        {/* Student submission section */}
        {userRole === "student" && (
          <div className="p-6">
            {submission ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">Submitted</span>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">
                    Submitted on {formatDateTime(submission.submitted_at)}
                  </p>
                  <a
                    href={submission.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline break-all"
                  >
                    {submission.file_url}
                  </a>
                </div>
                {mark && (
                  <div className="p-4 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground mb-1">Grade</p>
                    <p className="text-2xl font-bold text-foreground">
                      {mark.score} / {mark.max_score}
                    </p>
                  </div>
                )}
              </div>
            ) : isPast ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">
                  This assignment is closed. You cannot submit anymore.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="font-semibold text-foreground">
                  Submit Your Work
                </h2>
                <div>
                  <label
                    htmlFor="fileUrl"
                    className="block text-sm font-medium text-foreground mb-1.5"
                  >
                    File URL
                  </label>
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4 text-muted-foreground" />
                    <input
                      id="fileUrl"
                      type="url"
                      value={fileUrl}
                      onChange={(e) => setFileUrl(e.target.value)}
                      placeholder="https://drive.google.com/... or https://dropbox.com/..."
                      required
                      className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload your file to Google Drive, Dropbox, or any file hosting service and paste the link here
                  </p>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Submit Assignment
                </button>
              </form>
            )}
          </div>
        )}

        {/* Teacher view */}
        {userRole === "teacher" && (
          <div className="p-6">
            <Link
              href="/dashboard/submissions"
              className="text-primary hover:underline"
            >
              View all submissions for this assignment
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
