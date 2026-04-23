"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

export default function NewAttendanceSessionPage() {
  const [title, setTitle] = useState("")
  const [duration, setDuration] = useState(30)
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

    const startTime = new Date()
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000)

    const { error: insertError } = await supabase
      .from("attendance_sessions")
      .insert({
        teacher_id: user.id,
        title,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        is_active: true,
      })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push("/dashboard/attendance")
    router.refresh()
  }

  return (
    <div className="max-w-xl mx-auto">
      <Link
        href="/dashboard/attendance"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Attendance
      </Link>

      <div className="rounded-xl border border-border bg-card p-6">
        <h1 className="text-xl font-bold text-foreground mb-6">
          Create Attendance Session
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Session Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Morning Lecture - April 23"
              required
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label
              htmlFor="duration"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Duration (minutes)
            </label>
            <select
              id="duration"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
            </select>
            <p className="text-sm text-muted-foreground mt-1">
              Students can mark attendance during this time window
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
            Start Session
          </button>
        </form>
      </div>
    </div>
  )
}
