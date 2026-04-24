# Setup Instructions - Smart Classroom Manager

## Prerequisites

- **Node.js**: 18.0 or higher
- **pnpm**: 10.0 or higher (npm package manager)
- **Database**: MySQL 8.0+ or PostgreSQL 14+
- **Git** (optional, for version control)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
cd smart-classroom-manager
pnpm install
```

This installs all required packages for both frontend and backend.

### 2. Configure Environment Variables

Create a `.env` file in the project root directory:

```bash
# Database Configuration
DATABASE_URL=mysql://root:password@localhost:3306/smart_classroom

# JWT Secret (use a strong, random string)
JWT_SECRET=your-super-secret-key-at-least-32-characters-long

# Environment
NODE_ENV=development
```

**Important Notes:**
- Replace `root:password` with your actual database credentials
- Replace `localhost` if your database is on a different host
- Generate a strong JWT_SECRET (at least 32 characters)
- For production, use a different, more secure JWT_SECRET

### 3. Create Database

Create the database in MySQL/PostgreSQL:

```bash
# MySQL
mysql -u root -p
CREATE DATABASE smart_classroom;
EXIT;

# PostgreSQL
psql -U postgres
CREATE DATABASE smart_classroom;
\q
```

### 4. Generate and Apply Migrations

```bash
# Generate migration files from schema
pnpm drizzle-kit generate

# This creates SQL files in drizzle/migrations/
# Review the generated SQL file before applying
```

**Apply migrations:**

**Option A: Using Management UI (Recommended)**
1. Start the dev server: `pnpm dev`
2. Open the Management UI
3. Navigate to Database panel
4. Execute the migration SQL

**Option B: Manual SQL Execution**
```bash
# MySQL
mysql -u root -p smart_classroom < drizzle/migrations/0001_*.sql

# PostgreSQL
psql -U postgres -d smart_classroom -f drizzle/migrations/0001_*.sql
```

### 5. Seed Sample Data

```bash
# Populate database with test data
node seed-data.mjs
```

**Test Credentials Created:**
- **Teacher**: `teacher@example.com` / `teacher123`
- **Students**: `student1@example.com` to `student5@example.com` / `student123`

### 6. Start Development Server

```bash
pnpm dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3000/api/trpc

### 7. Verify Installation

1. Open http://localhost:3000 in your browser
2. You should see the Smart Classroom Manager landing page
3. Click "Get Started" to navigate to auth page
4. Try logging in with test credentials

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run specific test file
pnpm test server/auth.test.ts
```

## Building for Production

```bash
# Build frontend and backend
pnpm build

# Start production server
pnpm start
```

## Project Structure Overview

```
smart-classroom-manager/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/           # Utilities and helpers
│   │   ├── App.tsx        # Main router
│   │   └── index.css      # Global styles
│   ├── public/            # Static assets
│   └── index.html         # HTML entry point
├── server/                # Node.js backend
│   ├── auth.ts           # Authentication logic
│   ├── db.ts             # Database queries
│   ├── routers.ts        # tRPC API endpoints
│   └── _core/            # Framework internals
├── drizzle/              # Database schema and migrations
│   ├── schema.ts         # Table definitions
│   └── migrations/       # Generated SQL files
├── seed-data.mjs         # Sample data script
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── README.md             # Full documentation
└── SETUP.md             # This file
```

## Common Issues and Solutions

### Issue: "Cannot find module 'mysql2'"
**Solution**: Run `pnpm install` to ensure all dependencies are installed

### Issue: "Database connection refused"
**Solution**: 
- Verify MySQL/PostgreSQL is running
- Check DATABASE_URL in .env file
- Ensure database user has correct permissions

### Issue: "Migration failed"
**Solution**:
- Check the generated SQL for syntax errors
- Ensure database user has CREATE TABLE permissions
- Try running migrations manually in database client

### Issue: "Tests failing"
**Solution**:
- Run `node seed-data.mjs` to populate test data
- Ensure DATABASE_URL is set correctly
- Check JWT_SECRET is defined in .env

### Issue: "Port 3000 already in use"
**Solution**: 
- Kill the process using port 3000
- Or change port in package.json dev script

## Database Backup and Restore

### Backup
```bash
# MySQL
mysqldump -u root -p smart_classroom > backup.sql

# PostgreSQL
pg_dump -U postgres smart_classroom > backup.sql
```

### Restore
```bash
# MySQL
mysql -u root -p smart_classroom < backup.sql

# PostgreSQL
psql -U postgres -d smart_classroom -f backup.sql
```

## Next Steps

1. **Explore the Application**
   - Login as teacher: `teacher@example.com` / `teacher123`
   - Login as student: `student1@example.com` / `student123`
   - Navigate through different modules

2. **Customize for Your School**
   - Update student records with real data
   - Create actual assignments and attendance
   - Customize feedback templates

3. **Deploy to Production**
   - Follow deployment guide in README.md
   - Set up SSL certificates
   - Configure backups

4. **Extend Features**
   - Add more roles (admin, parent)
   - Implement notifications
   - Add real-time features with WebSockets

## Support and Troubleshooting

For detailed information:
- See README.md for full documentation
- Check server logs: `tail -f .manus-logs/devserver.log`
- Review browser console for client-side errors

## Security Considerations

1. **Change JWT_SECRET** in production
2. **Use HTTPS** in production
3. **Set strong database passwords**
4. **Enable database backups**
5. **Keep dependencies updated**: `pnpm update`
6. **Use environment variables** for sensitive data
7. **Enable CORS** only for trusted domains

## Performance Optimization

1. **Database Indexing**: Add indexes on frequently queried columns
2. **Caching**: Implement Redis for session storage
3. **CDN**: Serve static assets from CDN
4. **Database Replication**: Set up read replicas for scaling
5. **Load Balancing**: Use load balancer for multiple server instances

---

**You're all set! Happy teaching and learning! 🎓**
