import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

async function seedDatabase() {
  let connection;
  try {
    // Parse connection string
    const url = new URL(DATABASE_URL);
    const config = {
      host: url.hostname,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    };

    connection = await mysql.createConnection(config);
    console.log('✓ Connected to database');

    // Hash passwords
    const teacherPassword = await bcrypt.hash('teacher123', 10);
    const studentPassword = await bcrypt.hash('student123', 10);

    // Clear existing data
    await connection.execute('DELETE FROM feedback');
    await connection.execute('DELETE FROM submissions');
    await connection.execute('DELETE FROM marks');
    await connection.execute('DELETE FROM assignments');
    await connection.execute('DELETE FROM attendance');
    await connection.execute('DELETE FROM students');
    await connection.execute('DELETE FROM users WHERE role = "teacher" OR role = "student"');
    console.log('✓ Cleared existing data');

    // Create teacher user
    const [teacherResult] = await connection.execute(
      'INSERT INTO users (openId, name, email, passwordHash, role, loginMethod, createdAt, updatedAt, lastSignedIn) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())',
      ['teacher-001', 'Mr. John Smith', 'teacher@example.com', teacherPassword, 'teacher', 'email']
    );
    const teacherId = teacherResult.insertId;
    console.log(`✓ Created teacher user (ID: ${teacherId})`);

    // Create student users
    const students = [];
    for (let i = 1; i <= 5; i++) {
      const [studentResult] = await connection.execute(
        'INSERT INTO users (openId, name, email, passwordHash, role, loginMethod, createdAt, updatedAt, lastSignedIn) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())',
        [`student-00${i}`, `Student ${i}`, `student${i}@example.com`, studentPassword, 'student', 'email']
      );
      students.push({
        userId: studentResult.insertId,
        name: `Student ${i}`,
      });
    }
    console.log(`✓ Created ${students.length} student users`);

    // Create student records
    const studentRecords = [];
    for (let i = 0; i < students.length; i++) {
      const [result] = await connection.execute(
        'INSERT INTO students (userId, teacherId, rollNumber, className, section, parentEmail, phoneNumber, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
        [
          students[i].userId,
          teacherId,
          `A${String(i + 1).padStart(3, '0')}`,
          '10-A',
          'A',
          `parent${i + 1}@example.com`,
          `+1-555-${String(1000 + i).padStart(4, '0')}`,
        ]
      );
      studentRecords.push(result.insertId);
    }
    console.log(`✓ Created ${studentRecords.length} student records`);

    // Create attendance records
    const today = new Date();
    for (let i = 0; i < studentRecords.length; i++) {
      for (let j = 0; j < 20; j++) {
        const date = new Date(today);
        date.setDate(date.getDate() - j);
        const status = Math.random() > 0.1 ? 'present' : 'absent';
        
        await connection.execute(
          'INSERT INTO attendance (studentId, teacherId, date, status, remarks, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
          [studentRecords[i], teacherId, date, status, null]
        );
      }
    }
    console.log(`✓ Created attendance records (20 per student)`);

    // Create assignments
    const assignments = [];
    const assignmentTitles = [
      'Mathematics Chapter 5 Exercise',
      'English Essay: My Future',
      'Science Lab Report',
      'History Project: Ancient Civilizations',
      'Computer Science Programming Task',
    ];

    for (let i = 0; i < assignmentTitles.length; i++) {
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + (i + 1) * 3);

      const [result] = await connection.execute(
        'INSERT INTO assignments (teacherId, title, description, deadline, fileUrl, fileKey, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
        [
          teacherId,
          assignmentTitles[i],
          `Complete the assignment and submit before the deadline. This is a ${assignmentTitles[i].toLowerCase()} assignment.`,
          deadline,
          null,
          null,
        ]
      );
      assignments.push(result.insertId);
    }
    console.log(`✓ Created ${assignments.length} assignments`);

    // Create submissions
    for (let i = 0; i < studentRecords.length; i++) {
      for (let j = 0; j < Math.min(3, assignments.length); j++) {
        const submittedAt = new Date();
        submittedAt.setDate(submittedAt.getDate() - Math.random() * 5);

        await connection.execute(
          'INSERT INTO submissions (assignmentId, studentId, fileUrl, fileKey, submittedAt, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
          [
            assignments[j],
            studentRecords[i],
            `/manus-storage/submission-${i}-${j}.pdf`,
            `submission-${i}-${j}`,
            submittedAt,
            'submitted',
          ]
        );
      }
    }
    console.log(`✓ Created submission records`);

    // Create marks
    const subjects = ['Mathematics', 'English', 'Science', 'History', 'Computer Science'];
    for (let i = 0; i < studentRecords.length; i++) {
      for (let j = 0; j < subjects.length; j++) {
        const marks = Math.floor(Math.random() * 40) + 60; // 60-100
        let grade = 'A';
        if (marks < 70) grade = 'B';
        if (marks < 60) grade = 'C';

        await connection.execute(
          'INSERT INTO marks (studentId, teacherId, subject, marks, totalMarks, grade, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
          [studentRecords[i], teacherId, subjects[j], String(marks), '100', grade]
        );
      }
    }
    console.log(`✓ Created marks records (${subjects.length} subjects per student)`);

    // Create feedback
    const feedbackCategories = ['academic', 'behavior', 'attendance', 'general'];
    const feedbackMessages = [
      'Excellent performance in class. Keep up the good work!',
      'Needs improvement in participation. Try to contribute more in class discussions.',
      'Great attendance record. Very responsible student.',
      'Good progress overall. Focus on improving problem-solving skills.',
      'Exceptional work on recent projects. Shows great creativity.',
      'Please work on time management. Assignments should be submitted on time.',
      'Demonstrates strong understanding of concepts.',
      'Needs to focus more on studies. Distractions in class.',
    ];

    for (let i = 0; i < studentRecords.length; i++) {
      for (let j = 0; j < 3; j++) {
        const category = feedbackCategories[Math.floor(Math.random() * feedbackCategories.length)];
        const message = feedbackMessages[Math.floor(Math.random() * feedbackMessages.length)];

        await connection.execute(
          'INSERT INTO feedback (studentId, teacherId, content, category, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
          [studentRecords[i], teacherId, message, category]
        );
      }
    }
    console.log(`✓ Created feedback records`);

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\nTest Credentials:');
    console.log('Teacher: teacher@example.com / teacher123');
    console.log('Student: student1@example.com / student123');
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

seedDatabase();
