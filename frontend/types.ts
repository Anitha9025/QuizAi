export enum UserRole {
  STUDENT = 'Student',
  INSTRUCTOR = 'Instructor'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  quizzesTaken?: string[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface Question {
  _id?: string;
  text: string;
  options: string[];
  correctAnswer: string;
}

export interface Quiz {
  _id: string;
  title: string;
  category: string;
  creator: User;
  questions: Question[];
  timeLimit?: number;
  quizPin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Result {
  _id: string;
  quiz: string | Quiz;
  student: string | User;
  score: number;
  total: number;
  answers: Record<string, string>;
  createdAt: string;
}
