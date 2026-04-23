export type UserRole = "teacher" | "student"

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  created_at: string
  updated_at: string
}

export interface AttendanceSession {
  id: string
  teacher_id: string
  title: string
  start_time: string
  end_time: string
  is_active: boolean
  created_at: string
  teacher?: Profile
}

export interface AttendanceRecord {
  id: string
  session_id: string
  student_id: string
  marked_at: string
  status: "present" | "absent" | "late"
  student?: Profile
  session?: AttendanceSession
}

export interface Assignment {
  id: string
  teacher_id: string
  title: string
  description: string | null
  deadline: string
  file_url: string | null
  created_at: string
  updated_at: string
  teacher?: Profile
}

export interface Submission {
  id: string
  assignment_id: string
  student_id: string
  file_url: string
  submitted_at: string
  student?: Profile
  assignment?: Assignment
  marks?: Mark
}

export interface Mark {
  id: string
  submission_id: string
  teacher_id: string
  score: number
  max_score: number
  created_at: string
  updated_at: string
}

export interface Feedback {
  id: string
  student_id: string
  teacher_id: string
  assignment_id: string | null
  content: string
  created_at: string
  teacher?: Profile
  assignment?: Assignment
}
