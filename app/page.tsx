import Link from "next/link"
import { GraduationCap, ClipboardCheck, FileText, BarChart3, Users } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg text-foreground">Smart Classroom</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/auth/sign-up"
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground text-balance leading-tight">
            Manage your classroom with ease
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            A comprehensive platform for teachers and students to track attendance, manage assignments, submit work, and monitor grades all in one place.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/sign-up"
              className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              Start for free
            </Link>
            <Link
              href="/auth/login"
              className="px-6 py-3 rounded-lg border border-border text-foreground font-medium hover:bg-muted transition-colors"
            >
              Sign in to dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-card border-y border-border">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-foreground mb-12">
            Everything you need to manage your classroom
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<ClipboardCheck className="w-6 h-6" />}
              title="Attendance Tracking"
              description="Create time-based attendance sessions and let students mark their presence easily."
            />
            <FeatureCard
              icon={<FileText className="w-6 h-6" />}
              title="Assignment Management"
              description="Create and distribute assignments with deadlines. Students can submit their work online."
            />
            <FeatureCard
              icon={<BarChart3 className="w-6 h-6" />}
              title="Grading System"
              description="Grade submissions and provide personalized feedback to help students improve."
            />
            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title="Student Dashboard"
              description="Students get a personal dashboard to view assignments, attendance, and grades."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground">
            Ready to transform your classroom?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Join teachers and students who are already using Smart Classroom Manager.
          </p>
          <Link
            href="/auth/sign-up"
            className="mt-6 inline-block px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            Create your free account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p>Smart Classroom Manager - Built for modern education</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="p-6 rounded-xl border border-border bg-background">
      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
