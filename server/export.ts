import { getAttendanceByStudent, getMarksByStudent } from "./db";

/**
 * Convert attendance records to CSV format
 */
export async function generateAttendanceCSV(studentId: number): Promise<string> {
  const records = await getAttendanceByStudent(studentId);

  if (records.length === 0) {
    return "Date,Status,Remarks\n";
  }

  const header = "Date,Status,Remarks\n";
  const rows = records
    .map((record) => {
      const date = new Date(record.date).toLocaleDateString();
      const remarks = record.remarks ? `"${record.remarks}"` : "";
      return `${date},${record.status},${remarks}`;
    })
    .join("\n");

  return header + rows;
}

/**
 * Convert marks records to CSV format
 */
export async function generateMarksCSV(studentId: number): Promise<string> {
  const records = await getMarksByStudent(studentId);

  if (records.length === 0) {
    return "Subject,Marks,Total Marks,Grade\n";
  }

  const header = "Subject,Marks,Total Marks,Grade\n";
  const rows = records
    .map((record) => {
      const grade = record.grade || "N/A";
      return `${record.subject},${record.marks},${record.totalMarks},${grade}`;
    })
    .join("\n");

  return header + rows;
}

/**
 * Generate class attendance report (teacher view)
 */
export async function generateClassAttendanceCSV(
  records: Array<{
    studentId: number;
    date: Date;
    status: string;
  }>
): Promise<string> {
  if (records.length === 0) {
    return "Student ID,Date,Status\n";
  }

  const header = "Student ID,Date,Status\n";
  const rows = records
    .map((record) => {
      const date = new Date(record.date).toLocaleDateString();
      return `${record.studentId},${date},${record.status}`;
    })
    .join("\n");

  return header + rows;
}

/**
 * Generate class marks report (teacher view)
 */
export async function generateClassMarksCSV(
  records: Array<{
    studentId: number;
    subject: string;
    marks: string;
    totalMarks: string;
    grade?: string;
  }>
): Promise<string> {
  if (records.length === 0) {
    return "Student ID,Subject,Marks,Total Marks,Grade\n";
  }

  const header = "Student ID,Subject,Marks,Total Marks,Grade\n";
  const rows = records
    .map((record) => {
      const grade = record.grade || "N/A";
      return `${record.studentId},${record.subject},${record.marks},${record.totalMarks},${grade}`;
    })
    .join("\n");

  return header + rows;
}
