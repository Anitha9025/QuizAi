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
  
