"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { MessageSquare, Plus, Trash2, Loader2 } from "lucide-react"
import { formatDate } from "@/lib/utils"
import type { Profile, Assignment, Feedback } from "@/lib/types"

interface TeacherFeedbackProps {
  teacherId: string
  students: Profile[]
  assignments: Assignment[]
  feedbackList: (Feedback & { student: Profile; assignment: Assignment | null })[]
}

export function TeacherFeedback({
  teacherId,
  students,
  assignments,
  feedbackList,
}: TeacherFeedbackProps) {
  const [showForm, setShowForm] = useState(false)
  const [studentId, setStudentId] = useState("")
  const [assignmentId, setAssignmentId] = useState("")
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentId || !content.trim()) return

    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: insertError } = await supabase.from("feedback").insert({
      teacher_id: teacherId,
      student_id: studentId,
      assignment_id: assignmentId || null,
      content: content.trim(),
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    setShowForm(false)
    setStudentId("")
    setAssignmentId("")
    setContent("")
    setLoading(false)
    router.refresh()
  }

  const deleteFeedback = async (id: string) => {
    if (!confirm("Are you sure you want to delete this feedback?")) return

    const supabase = createClient()
    await supabase.from("feedback").delete().eq("id", id)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Feedback</h1>
          <p className="text-muted-foreground">
            Provide personalized feedback to students
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Feedback
        </button>
      </div>

      {/* New Feedback Form */}
      {showForm && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-semibold text-foreground mb-4">
            Send Feedback to Student
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="student"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Student
              </label>
              <select
                id="student"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select a student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="assignment"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Related Assignment (optional)
              </label>
              <select
                id="assignment"
                value={assignmentId}
                onChange={(e) => setAssignmentId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">No specific assignment</option>
                {assignments.map((assignment) => (
                  <option key={assignment.id} value={assignment.id}>
                    {assignment.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Feedback Message
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your feedback here..."
                rows={4}
                required
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Send Feedback
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Feedback List */}
      {feedbackList.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">
            No feedback sent yet
          </h3>
          <p className="text-muted-foreground">
            Start by sending feedback to a student
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card divide-y divide-border">
          {feedbackList.map((feedback) => (
            <div key={feedback.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">
                        To: {feedback.student?.full_name}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(feedback.created_at)}
                      </span>
                    </div>
                    {feedback.assignment && (
                      <p className="text-sm text-primary">
                        Re: {feedback.assignment.title}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">
                      {feedback.content}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => deleteFeedback(feedback.id)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
