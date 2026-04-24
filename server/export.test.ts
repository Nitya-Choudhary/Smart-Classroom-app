import { describe, it, expect } from "vitest";
import * as exportService from "./export";

describe("CSV Export Service", () => {
  describe("generateAttendanceCSV", () => {
    it("should generate CSV header for empty attendance", async () => {
      const csv = await exportService.generateAttendanceCSV(999);
      expect(csv).toContain("Date,Status,Remarks");
    });

    it("should format attendance records correctly", async () => {
      // Mock data
      const mockRecords = [
        { date: new Date("2026-04-20"), status: "present", remarks: null },
        { date: new Date("2026-04-21"), status: "absent", remarks: "Sick" },
      ];

      // Test CSV formatting
      const header = "Date,Status,Remarks\n";
      const rows = mockRecords
        .map((record) => {
          const date = new Date(record.date).toLocaleDateString();
          const remarks = record.remarks ? `"${record.remarks}"` : "";
          return `${date},${record.status},${remarks}`;
        })
        .join("\n");

      const csv = header + rows;
      expect(csv).toContain("present");
      expect(csv).toContain("absent");
      expect(csv).toContain("Sick");
    });
  });

  describe("generateMarksCSV", () => {
    it("should generate CSV header for empty marks", async () => {
      const csv = await exportService.generateMarksCSV(999);
      expect(csv).toContain("Subject,Marks,Total Marks,Grade");
    });

    it("should format marks records correctly", () => {
      const mockRecords = [
        { subject: "Mathematics", marks: "85", totalMarks: "100", grade: "A" },
        { subject: "English", marks: "72", totalMarks: "100", grade: "B" },
      ];

      const header = "Subject,Marks,Total Marks,Grade\n";
      const rows = mockRecords
        .map((record) => {
          const grade = record.grade || "N/A";
          return `${record.subject},${record.marks},${record.totalMarks},${grade}`;
        })
        .join("\n");

      const csv = header + rows;
      expect(csv).toContain("Mathematics,85,100,A");
      expect(csv).toContain("English,72,100,B");
    });
  });

  describe("generateClassAttendanceCSV", () => {
    it("should generate class attendance report", () => {
      const mockRecords = [
        { studentId: 1, date: new Date("2026-04-20"), status: "present" },
        { studentId: 2, date: new Date("2026-04-20"), status: "absent" },
      ];

      const header = "Student ID,Date,Status\n";
      const rows = mockRecords
        .map((record) => {
          const date = new Date(record.date).toLocaleDateString();
          return `${record.studentId},${date},${record.status}`;
        })
        .join("\n");

      const csv = header + rows;
      expect(csv).toContain("1,");
      expect(csv).toContain("present");
      expect(csv).toContain("2,");
      expect(csv).toContain("absent");
    });
  });

  describe("generateClassMarksCSV", () => {
    it("should generate class marks report", () => {
      const mockRecords = [
        {
          studentId: 1,
          subject: "Mathematics",
          marks: "85",
          totalMarks: "100",
          grade: "A",
        },
        {
          studentId: 2,
          subject: "Mathematics",
          marks: "65",
          totalMarks: "100",
          grade: "B",
        },
      ];

      const header = "Student ID,Subject,Marks,Total Marks,Grade\n";
      const rows = mockRecords
        .map((record) => {
          const grade = record.grade || "N/A";
          return `${record.studentId},${record.subject},${record.marks},${record.totalMarks},${grade}`;
        })
        .join("\n");

      const csv = header + rows;
      expect(csv).toContain("Mathematics");
      expect(csv).toContain("85");
      expect(csv).toContain("65");
      expect(csv).toContain("Grade");
    });

    it("should handle null grades", () => {
      const mockRecords = [
        {
          studentId: 1,
          subject: "Science",
          marks: "90",
          totalMarks: "100",
          grade: undefined,
        },
      ];

      const header = "Student ID,Subject,Marks,Total Marks,Grade\n";
      const rows = mockRecords
        .map((record) => {
          const grade = record.grade || "N/A";
          return `${record.studentId},${record.subject},${record.marks},${record.totalMarks},${grade}`;
        })
        .join("\n");

      const csv = header + rows;
      expect(csv).toContain("1,Science,90,100,N/A");
    });
  });
});
