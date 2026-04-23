"use client"

import { MessageSquare } from "lucide-react"
import { formatDate } from "@/lib/utils"
import type { Feedback, Profile, Assignment } from "@/lib/types"

interface StudentFeedbackProps {
  feedback: (Feedback & { teacher: Profile; assignment: Assignment | null })[]
}

export function StudentFeedback({ feedback }: StudentFeedbackProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Feedback</h1>
        <p className="text-muted-foreground">
          View feedback from your teachers
        </p>
      </div>

      {feedback.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-2">
            No feedback yet
          </h3>
          <p className="text-muted-foreground">
            Feedback from your teachers will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedback.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-foreground">
                      From: {item.teacher?.full_name}
                    </h3>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(item.created_at)}
                    </span>
                  </div>
                  {item.assignment && (
                    <p className="text-sm text-primary mb-2">
                      Re: {item.assignment.title}
                    </p>
                  )}
                  <p className="text-foreground whitespace-pre-wrap">
                    {item.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
