import Sidebar from './Sidebar';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Upload, Download, Share2, Eye, FileText, RefreshCw, Edit2, Save, X } from 'lucide-react';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { useState } from 'react';
import { toast } from 'sonner';
import { Progress } from './ui/progress';
import { User, FileItem } from '../types';

interface ResumeProps {
  onNavigate: (page: 'dashboard' | 'projects' | 'certificates' | 'resume' | 'portfolio' | 'profile') => void;
  onLogout: () => void;
  currentUser: User | null;
  resumes: FileItem[];
  setResumes: React.Dispatch<React.SetStateAction<FileItem[]>>;
}

interface ResumeData {
  name: string;
  title: string;
  email: string;
  phone: string;
  education: string;
  college: string;
  duration: string;
  skills: string[];
  projects: { title: string; description: string }[];
}

export default function Resume({ onNavigate, onLogout, currentUser, resumes: dashboardResumes, setResumes }: ResumeProps) {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [visibleToFaculty, setVisibleToFaculty] = useState(false);
  const [visibleToRecruiters, setVisibleToRecruiters] = useState(false);
  const [publicProfile, setPublicProfile] = useState(false);
  
  const [resumeData, setResumeData] = useState<ResumeData>({
    name: currentUser?.name || 'John Doe',
    title: 'Computer Science Student',
    email: currentUser?.email || 'john.doe@email.com',
    phone: '+91 98765 43210',
    education: 'Bachelor of Technology in Computer Science',
    college: 'XYZ College of Engineering',
    duration: '2021 - 2025 | CGPA: 8.5/10',
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git'],
    projects: [
      { title: 'E-Commerce Website', description: 'Built a full-stack e-commerce platform using React and Node.js' },
      { title: 'Machine Learning Classification', description: 'Developed a classification model using Python and TensorFlow' }
    ]
  });

  const [editData, setEditData] = useState<ResumeData>(resumeData);
  const [newSkill, setNewSkill] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleUpload = () => {
    if (uploadedFile) {
      setIsUploading(true);
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsUploading(false);
            toast.success('Resume uploaded successfully!');
            setUploadDialogOpen(false);
            setUploadedFile(null);
            setUploadProgress(0);
            // Add new resume to the list
            setResumes((prev) => [
              ...prev,
              {
                id: Date.now().toString(),
                name: uploadedFile.name,
                type: uploadedFile.type,
                date: new Date().toISOString().split('T')[0],
                size: uploadedFile.size.toString()
              }
            ]);
          }
          return prev + 10;
        });
      }, 500);
    }
  };

  const handleEditResume = () => {
    setIsEditing(true);
    setEditData(resumeData);
  };

  const handleSaveResume = () => {
    setIsEditing(false);
    setResumeData(editData);
    toast.success('Resume updated successfully!');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData(resumeData);
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      setEditData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setEditData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill)
    }));
  };

  const handleAddProject = () => {
    setEditData((prev) => ({
      ...prev,
      projects: [...prev.projects, { title: '', description: '' }]
    }));
  };

  const handleRemoveProject = (index: number) => {
    setEditData((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
  };

  const handleProjectChange = (index: number, field: 'title' | 'description', value: string) => {
    setEditData((prev) => ({
      ...prev,
      projects: prev.projects.map((project, i) => {
        if (i === index) {
          return {
            ...project,
            [field]: value
          };
        }
        return project;
      })
    }));
  };

  const handleDownload = () => {
    // Add logic to download the resume
    toast.info('Download functionality is not implemented yet.');
  };

  return (
    <>
      <Sidebar currentPage="resume" onNavigate={onNavigate} onLogout={onLogout} />
      
      <main className="flex-1 overflow-auto bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-gray-900">Resume</h1>
              <p className="text-gray-600 mt-1">Manage your resume and share it with recruiters</p>
            </div>
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Replace Resume
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload New Resume</DialogTitle>
                  <DialogDescription>
                    Upload your latest resume or CV.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <div
                    className={`border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors cursor-pointer ${isDragging ? 'border-blue-400 bg-blue-50' : ''}`}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('resume-upload')?.click()}
                  >
                    <Upload className={`w-16 h-16 mx-auto mb-4 ${isDragging ? 'text-blue-400' : 'text-gray-400'}`} />
                    <p className="text-gray-600 mb-1">Drag and drop your resume here</p>
                    <p className="text-gray-500 mb-4">or</p>
                    <Input
                      type="file"
                      accept="application/pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                      id="resume-upload"
                    />
                    <Button variant="outline" type="button" onClick={(e) => {
                      e.stopPropagation();
                      document.getElementById('resume-upload')?.click();
                    }}>
                      Browse Files
                    </Button>
                    <p className="text-gray-500 mt-4">Supported formats: PDF, DOC, DOCX (Max 5 MB)</p>
                  </div>
                  {uploadedFile && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="text-gray-900">{uploadedFile.name}</p>
                            <p className="text-gray-500">{(uploadedFile.size / 1024).toFixed(2)} KB</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setUploadedFile(null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-gray-600">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}
                {uploadedFile && !isUploading && (
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 bg-blue-600 hover:bg-blue-700" 
                      onClick={handleUpload}
                      disabled={isUploading}
                    >
                      Upload Resume
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setUploadedFile(null);
                        setUploadDialogOpen(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Resume Preview */}
            <Card className="lg:col-span-2 border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-white p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-gray-900">Current Resume</h2>
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button variant="outline" size="sm" onClick={handleSaveResume}>
                          <Save className="w-4 h-4 mr-1" />
                          Save
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" size="sm" onClick={handleEditResume}>
                          <Edit2 className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleDownload}>
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </>
                    )}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          Full Preview
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh]">
                        <DialogHeader>
                          <DialogTitle>Resume Preview</DialogTitle>
                          <DialogDescription>
                            Full preview of your resume.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="bg-white p-8 border border-gray-200 rounded-lg overflow-auto max-h-[70vh]">
                          <div className="max-w-3xl mx-auto space-y-6">
                            <div className="text-center pb-6 border-b border-gray-200">
                              <h2 className="text-gray-900 mb-2">John Doe</h2>
                              <p className="text-gray-600">Computer Science Student</p>
                              <p className="text-gray-500">john.doe@email.com | +91 98765 43210</p>
                            </div>
                            
                            <div>
                              <h3 className="text-gray-900 mb-3">Education</h3>
                              <div className="space-y-2">
                                <p className="text-gray-700">Bachelor of Technology in Computer Science</p>
                                <p className="text-gray-600">XYZ College of Engineering</p>
                                <p className="text-gray-500">2021 - 2025 | CGPA: 8.5/10</p>
                              </div>
                            </div>
                            
                            <div>
                              <h3 className="text-gray-900 mb-3">Skills</h3>
                              <div className="flex flex-wrap gap-2">
                                {['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git'].map((skill) => (
                                  <span key={skill} className="px-3 py-1 bg-blue-50 text-blue-600 rounded">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <h3 className="text-gray-900 mb-3">Projects</h3>
                              <div className="space-y-4">
                                <div>
                                  <p className="text-gray-700">E-Commerce Website</p>
                                  <p className="text-gray-600">Built a full-stack e-commerce platform using React and Node.js</p>
                                </div>
                                <div>
                                  <p className="text-gray-700">Machine Learning Classification</p>
                                  <p className="text-gray-600">Developed a classification model using Python and TensorFlow</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
              
              {/* Resume Document Preview */}
              <div className="bg-gray-100 p-8 min-h-[600px] flex items-center justify-center">
                <div className="bg-white shadow-lg rounded-lg w-full max-w-2xl p-12 space-y-6">
                  <div className="text-center pb-6 border-b border-gray-200">
                    {isEditing ? (
                      <div className="space-y-3">
                        <Input
                          value={editData.name}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          className="text-center"
                          placeholder="Full Name"
                        />
                        <Input
                          value={editData.title}
                          onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                          className="text-center"
                          placeholder="Title/Position"
                        />
                        <div className="flex gap-2">
                          <Input
                            value={editData.email}
                            onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                            className="text-center"
                            placeholder="Email"
                          />
                          <Input
                            value={editData.phone}
                            onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                            className="text-center"
                            placeholder="Phone"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <h2 className="text-gray-900 mb-2">{resumeData.name}</h2>
                        <p className="text-gray-600">{resumeData.title}</p>
                        <p className="text-gray-500">{resumeData.email} | {resumeData.phone}</p>
                      </>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-gray-900 mb-3">Education</h3>
                    {isEditing ? (
                      <div className="space-y-2">
                        <Input
                          value={editData.education}
                          onChange={(e) => setEditData({ ...editData, education: e.target.value })}
                          placeholder="Degree"
                        />
                        <Input
                          value={editData.college}
                          onChange={(e) => setEditData({ ...editData, college: e.target.value })}
                          placeholder="College/University"
                        />
                        <Input
                          value={editData.duration}
                          onChange={(e) => setEditData({ ...editData, duration: e.target.value })}
                          placeholder="Duration & CGPA"
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-gray-700">{resumeData.education}</p>
                        <p className="text-gray-600">{resumeData.college}</p>
                        <p className="text-gray-500">{resumeData.duration}</p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-gray-900 mb-3">Skills</h3>
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {editData.skills.map((skill, index) => (
                            <span key={index} className="px-3 py-1 bg-blue-50 text-blue-600 rounded flex items-center gap-1">
                              {skill}
                              <button
                                onClick={() => handleRemoveSkill(skill)}
                                className="ml-1 text-red-500 hover:text-red-700"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            placeholder="Add new skill"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddSkill();
                              }
                            }}
                          />
                          <Button size="sm" onClick={handleAddSkill}>Add</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {resumeData.skills.map((skill, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-50 text-blue-600 rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-gray-900">Projects</h3>
                      {isEditing && (
                        <Button size="sm" variant="outline" onClick={handleAddProject}>
                          Add Project
                        </Button>
                      )}
                    </div>
                    {isEditing ? (
                      <div className="space-y-4">
                        {editData.projects.map((project, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-3 space-y-2">
                            <div className="flex justify-between items-start gap-2">
                              <Input
                                value={project.title}
                                onChange={(e) => handleProjectChange(index, 'title', e.target.value)}
                                placeholder="Project Title"
                              />
                              <button
                                onClick={() => handleRemoveProject(index)}
                                className="text-red-500 hover:text-red-700 mt-2"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <Textarea
                              value={project.description}
                              onChange={(e) => handleProjectChange(index, 'description', e.target.value)}
                              placeholder="Project Description"
                              rows={2}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {resumeData.projects.map((project, index) => (
                          <div key={index}>
                            <p className="text-gray-700">{project.title}</p>
                            <p className="text-gray-600">{project.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Resume Actions & Settings */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="p-6 border border-gray-200 rounded-lg">
                <h3 className="text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share Link
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Share Resume Link</DialogTitle>
                      </DialogHeader>
                      <div className="py-4 space-y-4">
                        <div>
                          <Label>Shareable Link</Label>
                          <div className="flex gap-2 mt-2">
                            <input
                              type="text"
                              value="https://cloudhub.com/resume/john-doe"
                              readOnly
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                            />
                            <Button>Copy</Button>
                          </div>
                        </div>
                        <p className="text-gray-500">Anyone with this link can view your resume</p>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" className="w-full justify-start">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </Card>

              {/* Visibility Settings */}
              <Card className="p-6 border border-gray-200 rounded-lg">
                <h3 className="text-gray-900 mb-4">Visibility Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Visible to Faculty</Label>
                      <p className="text-gray-500">Allow faculty members to view</p>
                    </div>
                    <Switch checked={visibleToFaculty} onCheckedChange={setVisibleToFaculty} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Visible to Recruiters</Label>
                      <p className="text-gray-500">Allow recruiters to access</p>
                    </div>
                    <Switch checked={visibleToRecruiters} onCheckedChange={setVisibleToRecruiters} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Public Profile</Label>
                      <p className="text-gray-500">Make resume publicly accessible</p>
                    </div>
                    <Switch checked={publicProfile} onCheckedChange={setPublicProfile} />
                  </div>
                </div>
              </Card>

              {/* File Info */}
              <Card className="p-6 border border-gray-200 rounded-lg">
                <h3 className="text-gray-900 mb-4">File Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-500">File Name</p>
                    <p className="text-gray-900">Resume_John_Doe.pdf</p>
                  </div>
                  <div>
                    <p className="text-gray-500">File Size</p>
                    <p className="text-gray-900">245 KB</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Last Updated</p>
                    <p className="text-gray-900">Nov 15, 2024</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}