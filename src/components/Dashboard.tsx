import Sidebar from './Sidebar';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Upload, FolderOpen, Award, FileText, FileBadge, User as UserIcon, X } from 'lucide-react';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { useState } from 'react';
import { toast } from 'sonner';
import { User, FileItem } from '../types';

interface DashboardProps {
  onNavigate: (page: 'dashboard' | 'projects' | 'certificates' | 'resume' | 'profile') => void;
  onLogout: () => void;
  currentUser: User | null;
  projects: FileItem[];
  certificates: FileItem[];
  resumes: FileItem[];
  setProjects: React.Dispatch<React.SetStateAction<FileItem[]>>;
  setCertificates: React.Dispatch<React.SetStateAction<FileItem[]>>;
  setResumes: React.Dispatch<React.SetStateAction<FileItem[]>>;
}

export default function Dashboard({ 
  onNavigate, 
  onLogout, 
  currentUser,
  projects,
  certificates,
  resumes,
  setProjects,
  setCertificates,
  setResumes
}: DashboardProps) {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadType, setUploadType] = useState<'Project' | 'Certificate' | 'Resume'>('Project');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [projectTitle, setProjectTitle] = useState('');
  const [githubLink, setGithubLink] = useState('');

  const handleQuickUpload = (type: 'Project' | 'Certificate' | 'Resume') => {
    setUploadType(type);
    setUploadDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (uploadType === 'Project') {
      // Validate GitHub link for projects
      if (!projectTitle || !githubLink) {
        toast.error('Please provide project title and GitHub link');
        return;
      }

      const githubRegex = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/;
      if (!githubRegex.test(githubLink)) {
        toast.error('Please provide a valid GitHub repository URL');
        return;
      }

      const newProject: FileItem = {
        id: Date.now().toString(),
        name: projectTitle,
        type: 'Project',
        date: 'Just now',
        githubLink: githubLink
      };

      setProjects([newProject, ...projects]);
      toast.success('Project added successfully!');
      setProjectTitle('');
      setGithubLink('');
    } else {
      // Handle file upload for Certificate and Resume
      if (!selectedFile) {
        toast.error('Please select a file');
        return;
      }

      const newFile: FileItem = {
        id: Date.now().toString(),
        name: selectedFile.name,
        type: uploadType,
        date: 'Just now',
        size: selectedFile.size ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown'
      };

      switch (uploadType) {
        case 'Certificate':
          setCertificates([newFile, ...certificates]);
          break;
        case 'Resume':
          setResumes([newFile, ...resumes]);
          break;
      }

      toast.success(`${uploadType} uploaded successfully!`);
      setSelectedFile(null);
    }

    setUploadDialogOpen(false);
  };

  // Calculate dynamic stats
  const totalFiles = projects.length + certificates.length + resumes.length;
  
  const stats = [
    { label: 'Total Files', value: totalFiles.toString(), icon: FileText, color: 'blue' },
    { label: 'Projects', value: projects.length.toString(), icon: FolderOpen, color: 'green' },
    { label: 'Certificates', value: certificates.length.toString(), icon: Award, color: 'yellow' },
  ];

  // Get recent activity from all files
  const allFiles = [
    ...projects.map(p => ({ ...p, type: 'Project' })),
    ...certificates.map(c => ({ ...c, type: 'Certificate' })),
    ...resumes.map(r => ({ ...r, type: 'Resume' }))
  ].sort((a, b) => parseInt(b.id) - parseInt(a.id)).slice(0, 5); // Get 5 most recent

  return (
    <>
      <Sidebar currentPage="dashboard" onNavigate={onNavigate} onLogout={onLogout} />
      
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back! Here's an overview of your academic portfolio.</p>
            </div>
            {currentUser && (
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('profile')}>
                <div className="text-right">
                  <p className="text-gray-900">{currentUser.name}</p>
                  <p className="text-gray-500">{currentUser.rollNo}</p>
                </div>
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-blue-600 text-white">
                    {currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>
        </header>

        <div className="p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="p-6 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center text-${stat.color}-600`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-gray-900">{stat.value}</span>
                  </div>
                  <p className="text-gray-600">{stat.label}</p>
                </Card>
              );
            })}
          </div>

          {/* Quick Upload */}
          <div className="mb-8">
            <Card className="p-6 border border-gray-200 rounded-lg">
              <h3 className="text-gray-900 mb-4">Quick Upload</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-3">
                <Button variant="outline" className="flex-col h-auto py-4" onClick={() => handleQuickUpload('Project')}>
                  <FolderOpen className="w-6 h-6 mb-2 text-blue-600" />
                  <span className="text-gray-700">Project</span>
                </Button>
                <Button variant="outline" className="flex-col h-auto py-4" onClick={() => handleQuickUpload('Certificate')}>
                  <Award className="w-6 h-6 mb-2 text-blue-600" />
                  <span className="text-gray-700">Certificate</span>
                </Button>
                <Button variant="outline" className="flex-col h-auto py-4" onClick={() => handleQuickUpload('Resume')}>
                  <FileBadge className="w-6 h-6 mb-2 text-blue-600" />
                  <span className="text-gray-700">Resume</span>
                </Button>
              </div>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="p-6 border border-gray-200 rounded-lg">
            <h3 className="text-gray-900 mb-4">Recent Activity</h3>
            {allFiles.length > 0 ? (
              <div className="space-y-3">
                {allFiles.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-gray-900">{item.name}</p>
                        <p className="text-gray-500">{item.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {item.type === 'Project' && item.githubLink && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(item.githubLink, '_blank')}
                        >
                          View on GitHub
                        </Button>
                      )}
                      <span className="text-gray-500">{item.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No recent activity. Start uploading files to see them here!</p>
            )}
          </Card>
        </div>

        {/* Upload Dialog */}
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogContent className="sm:max-w-[425px]" aria-describedby="upload-dialog-description">
            <DialogHeader>
              <DialogTitle>{uploadType === 'Project' ? 'Add Project' : `Upload ${uploadType}`}</DialogTitle>
              <DialogDescription id="upload-dialog-description">
                {uploadType === 'Project' 
                  ? 'Add a project from your GitHub repository.'
                  : `Upload a ${uploadType.toLowerCase()} file to your portfolio.`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {uploadType === 'Project' ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="project-title">Project Title *</Label>
                    <Input
                      id="project-title"
                      placeholder="e.g., E-Commerce Website"
                      value={projectTitle}
                      onChange={(e) => setProjectTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="github-link">GitHub Repository URL *</Label>
                    <Input
                      id="github-link"
                      type="url"
                      placeholder="https://github.com/username/repository"
                      value={githubLink}
                      onChange={(e) => setGithubLink(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">Enter the full URL of your GitHub repository</p>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="file">File</Label>
                  <Input
                    id="file"
                    type="file"
                    className="file-input"
                    onChange={handleFileChange}
                  />
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <Button
                type="button"
                variant="outline"
                className="mr-2"
                onClick={() => setUploadDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleUpload}
              >
                {uploadType === 'Project' ? 'Add Project' : 'Upload'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </>
  );
}