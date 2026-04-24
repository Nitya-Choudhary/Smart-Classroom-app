# Smart Classroom Manager

A sophisticated, full-stack school management platform with sacred geometry-inspired design. Built with React, Express, tRPC, and PostgreSQL/MySQL.

## 🎯 Overview

Smart Classroom Manager is a role-based web application designed for teachers and students to collaborate seamlessly. Teachers can manage student records, track attendance, assign work, record marks, and provide feedback. Students can view their academic progress, submit assignments, and receive personalized feedback.

### Key Features

**For Teachers:**
- 👥 Student Management: Add, update, delete, and search student records
- 📅 Attendance Tracking: Mark attendance by date with automatic percentage calculation
- 📝 Assignment Management: Create and manage assignments with deadlines
- 📊 Marks System: Record subject-wise marks and grades
- 💬 Feedback System: Provide personalized feedback to students
- 📈 Analytics: View class and individual student analytics
- 📥 CSV Export: Export attendance and marks data

**For Students:**
- 📊 Attendance Dashboard: View personal attendance percentage and history
- 📝 Assignment Portal: View assignments and submit files
- 📈 Marks Tracking: View subject-wise marks and grades
- 💬 Feedback View: Read teacher feedback and suggestions
- 📱 Responsive Design: Full mobile and desktop support

### Design Philosophy

The application features a **sacred geometry-inspired aesthetic** with:
- Warm cream background (#FAF8F0)
- Deep navy text (#191923)
- Golden accents (oklch(0.55 0.2 70))
- Fine geometric patterns and golden ratio elements
- Elegant Playfair Display typography for headings
- Clean, professional UI with mathematical precision

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS 4, Recharts
- **Backend**: Node.js, Express 4, tRPC 11
- **Database**: MySQL/PostgreSQL with Drizzle ORM
- **Authentication**: JWT-based (email/password)
- **File Storage**: Cloud storage integration
- **Testing**: Vitest

## 📋 Prerequisites

- Node.js 18+ and pnpm
- MySQL 8.0+ or PostgreSQL 14+
- A `.env` file with database credentials

## 🚀 Quick Start

### 1. Installation

```bash
# Install dependencies
pnpm install

# Generate database migrations
pnpm drizzle-kit generate

# Apply migrations (via Management UI or manually)
# See Database Setup section below
```

### 2. Environment Setup

Create a `.env` file in the project root:

```env
DATABASE_URL=mysql://user:password@localhost:3306/smart_classroom
JWT_SECRET=your-secret-key-here-min-32-chars
NODE_ENV=development
```

### 3. Database Setup

The database schema is automatically created from `drizzle/schema.ts`. You can:

**Option A: Using the Management UI**
1. Navigate to the Database panel
2. Execute the migration SQL from `drizzle/migrations/`

**Option B: Manual Setup**
```bash
# Generate and review migration
pnpm drizzle-kit generate

# Execute the generated SQL file in your database client
```

### 4. Seed Sample Data

```bash
# Populate database with test data
node seed-data.mjs
```

This creates:
- 1 teacher account: `teacher@example.com` / `teacher123`
- 5 student accounts: `student1@example.com` - `student5@example.com` / `student123`
- 20 attendance records per student
- 5 assignments with submissions
- Marks for all subjects
- Feedback records

### 5. Start Development Server

```bash
# Start the dev server
pnpm dev

# The app will be available at http://localhost:3000
```

### 6. Build for Production

```bash
# Build frontend and backend
pnpm build

# Start production server
pnpm start
```

## 📁 Project Structure

```
smart-classroom-manager/
├── client/                          # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Auth.tsx            # Login/Signup pages
│   │   │   ├── Home.tsx            # Landing page
│   │   │   ├── TeacherDashboard.tsx # Teacher main dashboard
│   │   │   ├── StudentDashboard.tsx # Student main dashboard
│   │   │   ├── teacher/            # Teacher modules
│   │   │   └── student/            # Student modules
│   │   ├── components/             # Reusable UI components
│   │   ├── lib/trpc.ts            # tRPC client setup
│   │   ├── App.tsx                # Main router
│   │   └── index.css              # Global styles with sacred geometry
│   └── public/
├── server/
│   ├── auth.ts                    # JWT authentication service
│   ├── db.ts                      # Database query helpers
│   ├── routers.ts                 # tRPC procedures (API endpoints)
│   ├── auth.test.ts               # Authentication tests
│   └── _core/                     # Framework internals
├── drizzle/
│   ├── schema.ts                  # Database schema definitions
│   └── migrations/                # Generated SQL migrations
├── seed-data.mjs                  # Sample data seeding script
├── package.json
├── tsconfig.json
└── README.md
```

## 🔐 Authentication

The application uses **JWT-based authentication** with email and password credentials:

- **No OAuth**: Pure email/password signup and login
- **Secure Passwords**: Hashed with bcrypt (10 salt rounds)
- **JWT Tokens**: 7-day expiration, stored in secure HTTP-only cookies
- **Role-Based Access**: Teachers and students have separate dashboards
- **Protected Procedures**: tRPC procedures enforce authentication and authorization

### Login/Signup Flow

1. User navigates to `/auth`
2. Chooses Login or Signup tab
3. For signup: Selects role (Teacher/Student)
4. Credentials are validated and user account is created
5. JWT token is issued and stored in cookie
6. User is redirected to their dashboard

## 📊 Database Schema

### Users Table
- `id`: Primary key
- `openId`: Unique identifier (for JWT)
- `name`: User's full name
- `email`: Email address (unique)
- `passwordHash`: Bcrypt-hashed password
- `role`: 'teacher' or 'student'
- `loginMethod`: 'email' (for future OAuth expansion)
- `createdAt`, `updatedAt`, `lastSignedIn`: Timestamps

### Students Table
- Links to Users table (one-to-one)
- `rollNumber`: Student ID
- `className`: Class/Grade
- `section`: Section/Division
- `parentEmail`: Parent contact
- `phoneNumber`: Contact number
- `teacherId`: Foreign key to teacher

### Attendance Table
- `studentId`: Foreign key
- `teacherId`: Foreign key
- `date`: Attendance date
- `status`: 'present' | 'absent' | 'leave'
- `remarks`: Optional notes

### Assignments Table
- `teacherId`: Foreign key
- `title`: Assignment title
- `description`: Assignment details
- `deadline`: Due date
- `fileUrl`: Storage URL for assignment file
- `fileKey`: Storage key for retrieval

### Submissions Table
- `assignmentId`: Foreign key
- `studentId`: Foreign key
- `fileUrl`: Storage URL for submitted file
- `fileKey`: Storage key
- `submittedAt`: Submission timestamp
- `status`: 'pending' | 'submitted' | 'graded'

### Marks Table
- `studentId`: Foreign key
- `teacherId`: Foreign key
- `subject`: Subject name
- `marks`: Marks obtained
- `totalMarks`: Total marks
- `grade`: Letter grade (A, B, C, etc.)

### Feedback Table
- `studentId`: Foreign key
- `teacherId`: Foreign key
- `content`: Feedback text
- `category`: 'academic' | 'behavior' | 'attendance' | 'general'

## 🔌 API Endpoints (tRPC Procedures)

### Authentication
- `auth.signup`: Create new account
- `auth.login`: Login with credentials
- `auth.logout`: Logout and clear session
- `auth.me`: Get current user info

### Student Management (Teacher only)
- `students.list`: Get all students
- `students.getById`: Get specific student
- `students.create`: Add new student
- `students.update`: Update student info
- `students.delete`: Remove student
- `students.search`: Search students

### Attendance
- `attendance.mark`: Record attendance (Teacher)
- `attendance.getByStudent`: View attendance (Protected)
- `attendance.getPercentage`: Calculate percentage (Protected)

### Assignments
- `assignments.list`: View all assignments
- `assignments.create`: Create assignment (Teacher)
- `assignments.delete`: Remove assignment (Teacher)

### Submissions
- `submissions.submit`: Submit assignment (Student)
- `submissions.getByAssignment`: View submissions (Teacher)
- `submissions.getByStudent`: View student submissions (Protected)

### Marks
- `marks.add`: Record marks (Teacher)
- `marks.getByStudent`: View marks (Protected)

### Feedback
- `feedback.add`: Add feedback (Teacher)
- `feedback.getByStudent`: View feedback (Protected)

## 🎨 Design System

### Color Palette (Sacred Geometry)

**Light Mode:**
- Background: `oklch(0.98 0.001 70)` - Warm cream
- Foreground: `oklch(0.15 0.01 65)` - Deep navy
- Primary: `oklch(0.55 0.2 70)` - Dark gold
- Secondary: `oklch(0.92 0.005 70)` - Light beige
- Accent: `oklch(0.55 0.2 70)` - Gold

**Dark Mode:**
- Background: `oklch(0.12 0.01 65)` - Very dark navy
- Foreground: `oklch(0.95 0.002 70)` - Off-white
- Primary: `oklch(0.6 0.22 70)` - Bright gold
- Secondary: `oklch(0.22 0.01 65)` - Slightly lighter navy

### Typography

- **Headings**: Playfair Display (serif, elegant)
- **Body**: Inter (sans-serif, clean)
- **Font Weights**: 300-700

### Components

- **Cards**: Elevated with subtle shadows
- **Buttons**: Primary (gold), Secondary (outline), Tertiary (text)
- **Forms**: Clean inputs with focus rings
- **Tables**: Striped rows with hover effects
- **Navigation**: Sidebar with active states

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run specific test file
pnpm test server/auth.test.ts
```

### Test Coverage

- Authentication (signup, login, logout)
- Password hashing and verification
- JWT token creation and verification
- Protected procedures
- Authorization checks

## 📝 Development Workflow

### Adding a New Feature

1. **Update Schema** (`drizzle/schema.ts`)
   ```typescript
   export const newTable = mysqlTable("new_table", {
     id: int("id").autoincrement().primaryKey(),
     // ... columns
   });
   ```

2. **Generate Migration**
   ```bash
   pnpm drizzle-kit generate
   ```

3. **Apply Migration** (via Management UI or manually)

4. **Add Database Helpers** (`server/db.ts`)
   ```typescript
   export async function getNewData() {
     const db = await getDb();
     return await db.select().from(newTable);
   }
   ```

5. **Create tRPC Procedures** (`server/routers.ts`)
   ```typescript
   newFeature: router({
     list: protectedProcedure.query(({ ctx }) => 
       db.getNewData()
     ),
   }),
   ```

6. **Build Frontend** (`client/src/pages/...`)
   ```typescript
   const { data } = trpc.newFeature.list.useQuery();
   ```

7. **Write Tests** (`server/*.test.ts`)

8. **Create Checkpoint**
   ```bash
   # Via Management UI or after testing
   ```

## 🐛 Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` in `.env`
- Ensure MySQL/PostgreSQL is running
- Check user permissions and password

### Tests Failing
- Ensure database is seeded: `node seed-data.mjs`
- Check JWT_SECRET is set in `.env`
- Run `pnpm check` to verify TypeScript

### Authentication Not Working
- Clear browser cookies
- Check `JWT_SECRET` is consistent
- Verify password hashing in `server/auth.ts`

### Styling Issues
- Verify Tailwind CSS is compiled: `pnpm build`
- Check color variables in `client/src/index.css`
- Ensure theme provider is active in `App.tsx`

## 📦 Deployment

The application is ready for deployment to Manus or external hosting:

### Manus Deployment
1. Create a checkpoint via Management UI
2. Click "Publish" button
3. Configure custom domain (optional)

### External Hosting (Vercel, Railway, etc.)
1. Build the project: `pnpm build`
2. Deploy `dist/` folder and server
3. Set environment variables on hosting platform
4. Ensure database is accessible from hosting environment

## 📄 License

MIT License - Feel free to use this project for educational and commercial purposes.

## 🤝 Contributing

This is a complete, production-ready application. For modifications:

1. Follow the development workflow above
2. Write tests for new features
3. Ensure TypeScript passes: `pnpm check`
4. Create checkpoints for major changes

## 📞 Support

For issues or questions:
1. Check the Troubleshooting section
2. Review the database schema and API endpoints
3. Examine test files for usage examples
4. Check component implementations in `client/src/pages/`

---

**Built with ❤️ for educational excellence**

*Smart Classroom Manager - Where elegance meets functionality*
