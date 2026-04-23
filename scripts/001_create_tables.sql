-- Smart Classroom Manager Database Schema
-- This script creates all necessary tables for the application

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('teacher', 'student')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attendance Sessions table (created by teachers)
CREATE TABLE IF NOT EXISTS public.attendance_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attendance Records table (student attendance)
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.attendance_sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  marked_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late')),
  UNIQUE(session_id, student_id)
);

-- Assignments table
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  deadline TIMESTAMPTZ NOT NULL,
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Submissions table
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assignment_id, student_id)
);

-- Marks table
CREATE TABLE IF NOT EXISTS public.marks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  score DECIMAL(5,2) NOT NULL,
  max_score DECIMAL(5,2) DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(submission_id)
);

-- Feedback table
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for attendance_sessions
CREATE POLICY "Anyone can view attendance sessions" ON public.attendance_sessions FOR SELECT USING (true);
CREATE POLICY "Teachers can create attendance sessions" ON public.attendance_sessions FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher'));
CREATE POLICY "Teachers can update own sessions" ON public.attendance_sessions FOR UPDATE 
  USING (teacher_id = auth.uid());
CREATE POLICY "Teachers can delete own sessions" ON public.attendance_sessions FOR DELETE 
  USING (teacher_id = auth.uid());

-- RLS Policies for attendance_records
CREATE POLICY "Anyone can view attendance records" ON public.attendance_records FOR SELECT USING (true);
CREATE POLICY "Students can mark own attendance" ON public.attendance_records FOR INSERT 
  WITH CHECK (student_id = auth.uid());
CREATE POLICY "Teachers can insert attendance records" ON public.attendance_records FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher'));
CREATE POLICY "Teachers can update attendance records" ON public.attendance_records FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher'));

-- RLS Policies for assignments
CREATE POLICY "Anyone can view assignments" ON public.assignments FOR SELECT USING (true);
CREATE POLICY "Teachers can create assignments" ON public.assignments FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher'));
CREATE POLICY "Teachers can update own assignments" ON public.assignments FOR UPDATE 
  USING (teacher_id = auth.uid());
CREATE POLICY "Teachers can delete own assignments" ON public.assignments FOR DELETE 
  USING (teacher_id = auth.uid());

-- RLS Policies for submissions
CREATE POLICY "Teachers can view all submissions" ON public.submissions FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher'));
CREATE POLICY "Students can view own submissions" ON public.submissions FOR SELECT 
  USING (student_id = auth.uid());
CREATE POLICY "Students can create own submissions" ON public.submissions FOR INSERT 
  WITH CHECK (student_id = auth.uid());
CREATE POLICY "Students can update own submissions" ON public.submissions FOR UPDATE 
  USING (student_id = auth.uid());

-- RLS Policies for marks
CREATE POLICY "Teachers can view all marks" ON public.marks FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher'));
CREATE POLICY "Students can view own marks" ON public.marks FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.submissions WHERE id = submission_id AND student_id = auth.uid()));
CREATE POLICY "Teachers can create marks" ON public.marks FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher'));
CREATE POLICY "Teachers can update marks" ON public.marks FOR UPDATE 
  USING (teacher_id = auth.uid());

-- RLS Policies for feedback
CREATE POLICY "Teachers can view all feedback" ON public.feedback FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher'));
CREATE POLICY "Students can view own feedback" ON public.feedback FOR SELECT 
  USING (student_id = auth.uid());
CREATE POLICY "Teachers can create feedback" ON public.feedback FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher'));
CREATE POLICY "Teachers can update own feedback" ON public.feedback FOR UPDATE 
  USING (teacher_id = auth.uid());
CREATE POLICY "Teachers can delete own feedback" ON public.feedback FOR DELETE 
  USING (teacher_id = auth.uid());

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_teacher ON public.attendance_sessions(teacher_id);
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_active ON public.attendance_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_attendance_records_session ON public.attendance_records(session_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_student ON public.attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_assignments_teacher ON public.assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON public.submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON public.submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_marks_submission ON public.marks(submission_id);
CREATE INDEX IF NOT EXISTS idx_feedback_student ON public.feedback(student_id);
