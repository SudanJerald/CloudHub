export interface User {
  id: string;
  name: string;
  email: string;
  rollNo?: string;
  role: 'student' | 'teacher' | 'admin';
  department?: string;
  yearSemester?: string;
  designation?: string; // For teachers
  accountStatus?: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
}

export interface FileItem {
  id: string;
  name: string;
  type: string;
  date: string;
  size?: string;
  version?: string;
  url?: string; // Cloud storage URL
  studentEmail?: string; // For teacher view
  githubLink?: string; // For GitHub project links
  // Project-specific fields
  category?: string;
  semester?: string;
  subject?: string;
  description?: string;
  tags?: string[];
  branch?: 'draft' | 'main';
  progress?: number;
  // Certificate-specific fields
  issuer?: string;
  certificateLink?: string;
  uploadType?: 'file' | 'link';
}

export interface Student {
  id: string;
  name: string;
  email: string;
  rollNo: string;
  department: string;
  yearSemester: string;
  profilePicture?: string;
  phone?: string;
  address?: string;
  cgpa?: number;
  skills?: string[];
  achievements?: string[];
  createdAt: string;
}

export interface TeacherStats {
  totalStudents: number;
  totalCertificates: number;
  totalProjects: number;
  recentActivities: number;
}
