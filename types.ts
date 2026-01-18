
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  GUEST = 'GUEST'
}

export interface Subject {
  id: string;
  name: string;
  noteCount: number;
  createdAt: number;
}

export interface Note {
  id: string;
  subjectId: string;
  title: string;
  fileName: string;
  fileType: 'pdf' | 'docx' | 'doc';
  uploadDate: number;
  contentUrl?: string; 
  fileData?: string; 
}

export interface AuthState {
  role: UserRole;
  email?: string;
  displayName?: string;
  profilePicture?: string;
  isPaid: boolean;
  isAuthenticated: boolean;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  amount: number;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  timestamp: number;
}
