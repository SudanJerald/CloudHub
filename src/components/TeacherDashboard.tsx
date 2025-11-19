import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Users, Award, FileText, FolderOpen, Search, LogOut, Filter, Download, Eye, ExternalLink, Github, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import * as api from '../utils/api';

interface User {
  email: string;
  name: string;
  role: string;
  department?: string;
  yearSemester?: string;
  accountStatus?: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  rollNo: string;
  department: string;
  yearSemester: string;
  cgpa?: string;
}

interface FileItem {
  id: string;
  name: string;
  date: string;
  url?: string;
}

interface TeacherStats {
  totalStudents: number;
  totalCertificates: number;
  totalProjects: number;
  recentActivities: number;
}

interface TeacherDashboardProps {
  onLogout: () => void;
  currentUser: User | null;
}

function TeacherDashboard({ onLogout, currentUser }: TeacherDashboardProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentFiles, setStudentFiles] = useState<{
    projects: FileItem[];
    certificates: FileItem[];
    notes: FileItem[];
    resumes: FileItem[];
  }>({ projects: [], certificates: [], notes: [], resumes: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<TeacherStats>({
    totalStudents: 0,
    totalCertificates: 0,
    totalProjects: 0,
    recentActivities: 0
  });

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchQuery, departmentFilter, yearFilter, students]);

  const loadStudents = async () => {
    try {
      setIsLoading(true);
      const data = await api.getAllStudents();
      setStudents(data.students || []);
      setStats(data.stats || stats);
    } catch (error) {
      console.error('Error loading students:', error);
      toast.error('Failed to load students');
    } finally {
      setIsLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = [...students];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query) ||
        student.rollNo.toLowerCase().includes(query)
      );
    }

    // Department filter
    if (departmentFilter && departmentFilter !== 'all') {
      filtered = filtered.filter(student => student.department === departmentFilter);
    }

    // Year filter
    if (yearFilter && yearFilter !== 'all') {
      filtered = filtered.filter(student => student.yearSemester === yearFilter);
    }

    setFilteredStudents(filtered);
  };

  const loadStudentFiles = async (student: Student) => {
    try {
      const data = await api.getStudentFiles(student.email);
      setStudentFiles(data);
      setSelectedStudent(student);
    } catch (error) {
      console.error('Error loading student files:', error);
      toast.error('Failed to load student files');
    }
  };

  const departments = Array.from(new Set(students.map((s: Student) => s.department)));
  const years = Array.from(new Set(students.map((s: Student) => s.yearSemester)));

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
            <p className="text-gray-600">Welcome, {currentUser?.name}</p>
          </div>
          <Button variant="outline" onClick={onLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="flex-1 p-6 overflow-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Students</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.totalStudents}</h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Projects</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.totalProjects}</h3>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <FolderOpen className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Certificates</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.totalCertificates}</h3>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Recent Activities</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.recentActivities}</h3>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by name, email, or roll number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full px-4 py-2 border rounded-md bg-white"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="w-full px-4 py-2 border rounded-md bg-white"
              >
                <option value="all">All Years</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Students List */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Students ({filteredStudents.length})
            </h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {isLoading ? (
                <p className="text-gray-600 text-center py-8">Loading students...</p>
              ) : filteredStudents.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No students found</p>
              ) : (
                filteredStudents.map(student => (
                  <div
                    key={student.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedStudent?.id === student.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => loadStudentFiles(student)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{student.name}</h3>
                        <p className="text-sm text-gray-600">{student.rollNo}</p>
                        <p className="text-sm text-gray-500">{student.email}</p>
                        <div className="flex gap-2 mt-2">
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            {student.department}
                          </span>
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                            {student.yearSemester}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => loadStudentFiles(student)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Student Details */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {selectedStudent ? `${selectedStudent.name}'s Portfolio` : 'Select a Student'}
            </h2>
            {selectedStudent ? (
              <div className="space-y-4">
                {/* Student Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Student Information</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Email:</span> {selectedStudent.email}</p>
                    <p><span className="font-medium">Roll No:</span> {selectedStudent.rollNo}</p>
                    <p><span className="font-medium">Department:</span> {selectedStudent.department}</p>
                    <p><span className="font-medium">Year:</span> {selectedStudent.yearSemester}</p>
                    {selectedStudent.cgpa && (
                      <p><span className="font-medium">CGPA:</span> {selectedStudent.cgpa}</p>
                    )}
                  </div>
                </div>

                {/* Projects */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <FolderOpen className="w-4 h-4" />
                    Projects ({studentFiles.projects.length})
                  </h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {studentFiles.projects.length === 0 ? (
                      <p className="text-sm text-gray-500">No projects uploaded</p>
                    ) : (
                      studentFiles.projects.map((project: any) => (
                        <div key={project.id} className="p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                          <h4 className="font-semibold text-gray-900 mb-1">{project.title}</h4>
                          {project.description && (
                            <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                          )}
                          {project.technologies && project.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {project.technologies.map((tech: string, idx: number) => (
                                <span key={idx} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="flex gap-2 mt-2">
                            {project.github_url && (
                              <a 
                                href={project.github_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                              >
                                <Github className="w-3 h-3" />
                                GitHub
                              </a>
                            )}
                            {project.live_url && (
                              <a 
                                href={project.live_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Live Demo
                              </a>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            {project.start_date && `Started: ${new Date(project.start_date).toLocaleDateString()}`}
                            {project.end_date && ` • Ended: ${new Date(project.end_date).toLocaleDateString()}`}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Certificates */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Certificates ({studentFiles.certificates.length})
                  </h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {studentFiles.certificates.length === 0 ? (
                      <p className="text-sm text-gray-500">No certificates uploaded</p>
                    ) : (
                      studentFiles.certificates.map((cert: any) => (
                        <div key={cert.id} className="p-3 bg-white border border-gray-200 rounded-lg hover:border-yellow-300 transition-colors">
                          <h4 className="font-semibold text-gray-900 mb-1">{cert.title}</h4>
                          <p className="text-sm text-gray-600 mb-1">Issued by: {cert.issuer}</p>
                          {cert.issue_date && (
                            <p className="text-xs text-gray-500 mb-2">
                              Date: {new Date(cert.issue_date).toLocaleDateString()}
                            </p>
                          )}
                          {cert.credential_id && (
                            <p className="text-xs text-gray-600 mb-1">
                              Credential ID: <span className="font-mono">{cert.credential_id}</span>
                            </p>
                          )}
                          <div className="flex gap-2 mt-2">
                            {cert.credential_url && (
                              <a 
                                href={cert.credential_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                              >
                                <Link2 className="w-3 h-3" />
                                Verify Certificate
                              </a>
                            )}
                            {cert.image_url && (
                              <a 
                                href={cert.image_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800"
                              >
                                <Eye className="w-3 h-3" />
                                View Image
                              </a>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Notes ({studentFiles.notes.length})
                  </h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {studentFiles.notes.length === 0 ? (
                      <p className="text-sm text-gray-500">No notes uploaded</p>
                    ) : (
                      studentFiles.notes.map((note: any) => (
                        <div key={note.id} className="p-3 bg-white border border-gray-200 rounded-lg hover:border-green-300 transition-colors">
                          <h4 className="font-semibold text-gray-900 mb-1">{note.title}</h4>
                          <p className="text-sm text-gray-600 mb-1">Subject: {note.subject}</p>
                          {note.description && (
                            <p className="text-xs text-gray-500 mb-2">{note.description}</p>
                          )}
                          {note.file_url && (
                            <a 
                              href={note.file_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                            >
                              <Download className="w-3 h-3" />
                              Download {note.file_type?.toUpperCase() || 'File'}
                            </a>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Resumes */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Resumes ({studentFiles.resumes.length})
                  </h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {studentFiles.resumes.length === 0 ? (
                      <p className="text-sm text-gray-500">No resumes uploaded</p>
                    ) : (
                      studentFiles.resumes.map((resume: any) => (
                        <div key={resume.id} className="p-3 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors">
                          <h4 className="font-semibold text-gray-900 mb-1">{resume.title}</h4>
                          {resume.is_primary && (
                            <span className="inline-block text-xs px-2 py-1 bg-green-100 text-green-700 rounded mb-2">
                              Primary Resume
                            </span>
                          )}
                          {resume.file_url && (
                            <a 
                              href={resume.file_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                            >
                              <Download className="w-3 h-3" />
                              Download {resume.file_type?.toUpperCase() || 'PDF'}
                            </a>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <Button className="w-full mt-4">
                  <Download className="w-4 h-4 mr-2" />
                  Download All Files
                </Button>
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">
                Select a student from the list to view their portfolio
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;
