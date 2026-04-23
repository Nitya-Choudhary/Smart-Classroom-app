"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

export default function NewAssignmentPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [deadline, setDeadline] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError("You must be logged in")
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase.from("assignments").insert({
      teacher_id: user.id,
      title,
      description: description || null,
      deadline: new Date(deadline).toISOString(),
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push("/dashboard/assignments")
    router.refresh()
  }

  // Set minimum date to today
  const today = new Date().toISOString().slice(0, 16)

  return (
    <div className="max-w-xl mx-auto">
      <Link
        href="/dashboard/assignments"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Assignments
      </Link>

      <div className="rounded-xl border border-border bg-card p-6">
        <h1 className="text-xl font-bold text-foreground mb-6">
          Create Assignment
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Chapter 5 Problem Set"
              required
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Description (optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add instructions or details about the assignment..."
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <div>
            <label
              htmlFor="deadline"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Deadline
            </label>
            <input
              id="deadline"
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              min={today}
              required
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
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
            Create Assignment
          </button>
        </form>
      </div>
    </div>
  )
}
