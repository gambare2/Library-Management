import Student from "@/app/models/Student";

export async function generateUniqueStudentId() {
  let studentId;
  let exists = true;

  while (exists) {
    studentId = "STU-" + Math.floor(100000 + Math.random() * 900000);
    exists = !!(await Student.findOne({ studentId }));
  }

  return studentId;
}
