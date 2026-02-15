
export enum UserRole {
  STUDENT = 'Student',
  ADMIN = 'Admin',
  SUPER_ADMIN = 'Super Admin'
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  passwordHash: string;
}

export interface Subject {
  id: string;
  name: string;
}

export interface Semester {
  id: string;
  subjectId: string;
  name: string; // "Semester 1" or "Semester 2"
}

export interface Unit {
  id: string;
  semesterId: string;
  name: string;
}

export interface Lesson {
  id: string;
  unitId: string;
  name: string;
}

export interface Question {
  id: string;
  lessonId: string;
  text: string;
  options: string[];
  correctAnswer: number; // index 0-3
}

export interface ExamResult {
  id: string;
  userId: string;
  subjectName: string;
  unitName: string;
  score: number;
  totalPoints: number;
  percentage: number;
  date: string;
  lessonNames: string[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
