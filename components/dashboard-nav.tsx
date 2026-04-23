"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  GraduationCap,
  LayoutDashboard,
  ClipboardCheck,
  FileText,
  BarChart3,
  MessageSquare,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Profile } from "@/lib/types"
import { useState } from "react"

interface DashboardNavProps {
  profile: Profile
}

export function DashboardNav({ profile }: DashboardNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const teacherLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/attendance", label: "Attendance", icon: ClipboardCheck },
    { href: "/dashboard/assignments", label: "Assignments", icon: FileText },
    { href: "/dashboard/submissions", label: "Submissions", icon: BarChart3 },
    { href: "/dashboard/feedback", label: "Feedback", icon: MessageSquare },
  ]

  const studentLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/attendance", label: "Attendance", icon: ClipboardCheck },
    { href: "/dashboard/assignments", label: "Assignments", icon: FileText },
    { href: "/dashboard/my-grades", label: "My Grades", icon: BarChart3 },
    { href: "/dashboard/my-feedback", label: "Feedback", icon: MessageSquare },
  ]

  const links = profile.role === "teacher" ? teacherLinks : studentLinks

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground hidden sm:block">
                Smart Classroom
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {links.map((link) => {
                const Icon = link.icon
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">
                  {profile.full_name}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {profile.role}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="sr-only sm:not-sr-only">Sign out</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-muted"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-1">
              {links.map((link) => {
                const Icon = link.icon
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                )
              })}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors mt-2"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
