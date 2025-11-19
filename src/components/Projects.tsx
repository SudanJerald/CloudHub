import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Upload, FileCode, Filter, Download, Eye, GitBranch, History, Save, Edit, X } from 'lucide-react';
import { Progress } from './ui/progress';
import { toast } from 'sonner';
import { Badge } from './ui/badge';
import { User, FileItem } from '../types';

interface ProjectsProps {
  onNavigate: (page: 'dashboard' | 'projects' | 'certificates' | 'resume' | 'portfolio' | 'profile') => void;
  onLogout: () => void;
  currentUser: User | null;
  projects: FileItem[];
  setProjects: React.Dispatch<React.SetStateAction<FileItem[]>>;
}

interface ProjectVersion {
  id: number;
  title: string;
  description: string;
  timestamp: string;
  progress: number;
}

interface Project {
  id: number;
  title: string;
  category: string;
  semester: string;
  subject: string;
  fileType: string;
  date: string;
  tags: string[];
  branch: 'draft' | 'main';
  progress: number;
  description: string;
  versions: ProjectVersion[];
  githubLink?: string;
}

export default function Projects({ onNavigate, onLogout, currentUser, projects, setProjects }: ProjectsProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState({ title: '', description: '', category: '', semester: '', branch: 'draft' as 'draft' | 'main', progress: 0 });
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedProjectVersions, setSelectedProjectVersions] = useState<ProjectVersion[]>([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadFormData, setUploadFormData] = useState({ title: '', description: '', category: '', semester: '', branch: 'draft' as 'draft' | 'main', progress: 0, githubLink: '' });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({ semester: 'all', category: 'all', fileType: 'all' });
  const [activeFilters, setActiveFilters] = useState({ semester: 'all', category: 'all', fileType: 'all' });
  const [filteredProjects, setFilteredProjects] = useState<FileItem[]>([]);

  // Update filtered projects whenever projects changes
  useEffect(() => {
    const filtered = projects.filter(project => {
      return (
        (activeFilters.semester === 'all' || project.semester === activeFilters.semester) &&
        (activeFilters.category === 'all' || project.category === activeFilters.category) &&
        (activeFilters.fileType === 'all' || project.type === activeFilters.fileType)
      );
    });
    setFilteredProjects(filtered);
  }, [projects, activeFilters]);

  const handleFileUpload = () => {
    setIsUploading(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
        }, 500);
      }
    }, 200);
  };

  const handleProjectDialogOpen = (project?: FileItem) => {
    if (project) {
      setCurrentProject({
        title: project.name,
        description: project.description || '',
        category: project.category || '',
        semester: project.semester || '',
        branch: project.branch || 'draft',
        progress: project.progress || 0
      });
      setEditingProjectId(project.id);
    } else {
      setCurrentProject({ title: '', description: '', category: '', semester: '', branch: 'draft', progress: 0 });
      setEditingProjectId(null);
    }
    setProjectDialogOpen(true);
  };

  const handleProjectDialogClose = () => {
    setProjectDialogOpen(false);
  };

  const handleHistoryDialogOpen = (project: FileItem) => {
    setSelectedProjectVersions([]);
    setHistoryDialogOpen(true);
  };

  const handleHistoryDialogClose = () => {
    setHistoryDialogOpen(false);
  };

  const handleProjectSave = () => {
    if (editingProjectId) {
      const updatedProjects = projects.map(project => {
        if (project.id === editingProjectId) {
          return {
            ...project,
            name: currentProject.title,
            description: currentProject.description,
            category: currentProject.category,
            semester: currentProject.semester,
            branch: currentProject.branch,
            progress: currentProject.progress
          };
        }
        return project;
      });
      setProjects(updatedProjects);
      toast.success('Project updated successfully!');
    } else {
      const newProject: FileItem = {
        id: Date.now().toString(),
        name: currentProject.title,
        type: 'Project',
        description: currentProject.description,
        category: currentProject.category,
        semester: currentProject.semester,
        branch: currentProject.branch,
        progress: currentProject.progress,
        date: new Date().toLocaleDateString(),
        tags: [],
        version: 'v1.0'
      };
      setProjects([newProject, ...projects]);
      
      toast.success('Project created successfully!');
    }
    handleProjectDialogClose();
  };

  const moveToBranch = (projectId: string, targetBranch: 'draft' | 'main') => {
    const updatedProjects = projects.map(project => {
      if (project.id === projectId) {
        return { ...project, branch: targetBranch };
      }
      return project;
    });
    setProjects(updatedProjects);
    toast.success(`Moved to ${targetBranch === 'main' ? 'Main' : 'Draft'} branch!`);
  };

  const rollbackToVersion = (projectId: string, versionId: number) => {
    const updatedProjects = projects.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          date: new Date().toLocaleDateString()
        };
      }
      return project;
    });
    setProjects(updatedProjects);
    toast.success('Rolled back to previous version!');
  };

  const deleteProject = (projectId: string) => {
    const updatedProjects = projects.filter(project => project.id !== projectId);
    setProjects(updatedProjects);
    
    toast.success('Project deleted successfully!');
  };

  const handleUploadProject = () => {
    if (!uploadFormData.title || !uploadFormData.category || !uploadFormData.semester) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate GitHub link
    if (!uploadFormData.githubLink) {
      toast.error('Please provide a GitHub repository link');
      return;
    }

    const githubRegex = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/;
    if (!githubRegex.test(uploadFormData.githubLink)) {
      toast.error('Please provide a valid GitHub repository URL (e.g., https://github.com/username/repo)');
      return;
    }

    const newProject: FileItem = {
      id: Date.now().toString(),
      name: uploadFormData.title,
      type: 'Project',
      description: uploadFormData.description,
      category: uploadFormData.category,
      semester: uploadFormData.semester,
      branch: uploadFormData.branch,
      progress: uploadFormData.progress,
      date: new Date().toLocaleDateString(),
      tags: [],
      githubLink: uploadFormData.githubLink,
      // Add database-compatible fields
      title: uploadFormData.title,
      github_url: uploadFormData.githubLink,
      technologies: [],
      version: 'v1.0'
    };
    setProjects([newProject, ...projects]);
    
    toast.success('Project uploaded successfully!');
    setUploadFormData({ title: '', description: '', category: '', semester: '', branch: 'draft', progress: 0, githubLink: '' });
    setUploadDialogOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      toast.success(`File "${file.name}" selected!`);
      handleFileUpload();
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
      toast.success(`File "${file.name}" uploaded!`);
      handleFileUpload();
    }
  };

  const triggerFileInput = () => {
    document.getElementById('file-input')?.click();
  };

  const applyFilters = () => {
    setActiveFilters(filters);
  };

  return (
    <>
      <Sidebar currentPage="projects" onNavigate={onNavigate} onLogout={onLogout} />
      
      <main className="flex-1 overflow-auto bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-gray-900">Projects</h1>
              <p className="text-gray-600 mt-1">Manage and showcase your academic projects</p>
            </div>
            <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Upload New Project</DialogTitle>
                  <DialogDescription>
                    Upload your project files and provide details about your work.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="title">Project Title</Label>
                    <Input id="title" placeholder="Enter project title" className="mt-1" value={uploadFormData.title} onChange={(e) => setUploadFormData({ ...uploadFormData, title: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={uploadFormData.category} onValueChange={(value) => setUploadFormData({ ...uploadFormData, category: value })}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="web">Web Development</SelectItem>
                          <SelectItem value="mobile">Mobile Development</SelectItem>
                          <SelectItem value="data">Data Science</SelectItem>
                          <SelectItem value="database">Database</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="semester">Semester</Label>
                      <Select value={uploadFormData.semester} onValueChange={(value) => setUploadFormData({ ...uploadFormData, semester: value })}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select semester" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1st Semester</SelectItem>
                          <SelectItem value="2">2nd Semester</SelectItem>
                          <SelectItem value="3">3rd Semester</SelectItem>
                          <SelectItem value="4">4th Semester</SelectItem>
                          <SelectItem value="5">5th Semester</SelectItem>
                          <SelectItem value="6">6th Semester</SelectItem>
                          <SelectItem value="7">7th Semester</SelectItem>
                          <SelectItem value="8">8th Semester</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" placeholder="Describe your project..." className="mt-1" rows={4} value={uploadFormData.description} onChange={(e) => setUploadFormData({ ...uploadFormData, description: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="upload-branch">Branch</Label>
                      <Select value={uploadFormData.branch} onValueChange={(value) => setUploadFormData({ ...uploadFormData, branch: value as 'draft' | 'main' })}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select branch" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft (Work in Progress)</SelectItem>
                          <SelectItem value="main">Main (Final)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="upload-progress">Progress (%)</Label>
                      <Input 
                        id="upload-progress" 
                        type="number" 
                        min="0" 
                        max="100" 
                        placeholder="0-100" 
                        className="mt-1" 
                        value={uploadFormData.progress} 
                        onChange={(e) => setUploadFormData({ ...uploadFormData, progress: parseInt(e.target.value) || 0 })} 
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="github-link">GitHub Repository Link *</Label>
                    <Input 
                      id="github-link" 
                      type="url"
                      placeholder="https://github.com/username/repository" 
                      className="mt-1" 
                      value={uploadFormData.githubLink} 
                      onChange={(e) => setUploadFormData({ ...uploadFormData, githubLink: e.target.value })} 
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter the full URL of your GitHub repository</p>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleUploadProject} className="bg-blue-600 hover:bg-blue-700">
                      Upload Project
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <div className="p-8">
          {/* Filters */}
          <Card className="p-4 border border-gray-200 rounded-lg mb-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-600" />
                <span className="text-gray-700">Filters:</span>
              </div>
              <Select value={filters.semester} onValueChange={(value) => setFilters({ ...filters, semester: value })}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Semesters</SelectItem>
                  <SelectItem value="6">6th Semester</SelectItem>
                  <SelectItem value="5">5th Semester</SelectItem>
                  <SelectItem value="4">4th Semester</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="web">Web Development</SelectItem>
                  <SelectItem value="mobile">Mobile Development</SelectItem>
                  <SelectItem value="data">Data Science</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.fileType} onValueChange={(value) => setFilters({ ...filters, fileType: value })}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="File Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="zip">ZIP</SelectItem>
                  <SelectItem value="apk">APK</SelectItem>
                </SelectContent>
              </Select>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={applyFilters}>Apply Filters</Button>
            </div>
          </Card>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => (
              <Card key={index} className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileCode className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={project.branch === 'main' ? 'default' : 'secondary'} className="flex items-center gap-1">
                      <GitBranch className="w-3 h-3" />
                      {project.branch === 'main' ? 'Main' : 'Draft'}
                    </Badge>
                  </div>
                </div>
                <h3 className="text-gray-900 mb-2">{project.name}</h3>
                <p className="text-gray-600 mb-3">{project.category}</p>
                
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700">Progress</span>
                    <span className="text-gray-600">{project.progress || 0}%</span>
                  </div>
                  <Progress value={project.progress || 0} className="h-2" />
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-gray-500">{project.semester || 'N/A'} • {project.subject || 'N/A'}</p>
                  <p className="text-gray-500">{project.date}</p>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {(project.tags || []).map((tag, tagIndex) => (
                    <span key={tagIndex} className="px-2 py-1 bg-blue-50 text-blue-600 rounded">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Branch Controls */}
                {project.branch === 'draft' && project.progress === 100 && (
                  <div className="mb-3">
                    <Button
                      size="sm"
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => moveToBranch(project.id, 'main')}
                    >
                      <GitBranch className="w-4 h-4 mr-2" />
                      Move to Main
                    </Button>
                  </div>
                )}
                {project.branch === 'main' && (
                  <div className="mb-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => moveToBranch(project.id, 'draft')}
                    >
                      <GitBranch className="w-4 h-4 mr-2" />
                      Move to Draft
                    </Button>
                  </div>
                )}

                <div className="flex gap-2">
                  {project.githubLink && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => window.open(project.githubLink, '_blank')}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View on GitHub
                    </Button>
                  )}
                </div>
                <div className="flex gap-2 mt-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleProjectDialogOpen(project)}>
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleHistoryDialogOpen(project)}>
                    <History className="w-4 h-4 mr-1" />
                    History
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-red-600 hover:text-red-700 hover:border-red-600" 
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this project?')) {
                        deleteProject(project.id);
                      }
                    }}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {/* Project Dialog */}
      <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingProjectId ? 'Edit Project' : 'Add New Project'}</DialogTitle>
            <DialogDescription>
              {editingProjectId ? 'Update your project details below.' : 'Add a new project to your portfolio.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">Project Title</Label>
              <Input id="title" placeholder="Enter project title" className="mt-1" value={currentProject.title} onChange={(e) => setCurrentProject({ ...currentProject, title: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="web">Web Development</SelectItem>
                    <SelectItem value="mobile">Mobile Development</SelectItem>
                    <SelectItem value="data">Data Science</SelectItem>
                    <SelectItem value="database">Database</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="semester">Semester</Label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1st Semester</SelectItem>
                    <SelectItem value="2">2nd Semester</SelectItem>
                    <SelectItem value="3">3rd Semester</SelectItem>
                    <SelectItem value="4">4th Semester</SelectItem>
                    <SelectItem value="5">5th Semester</SelectItem>
                    <SelectItem value="6">6th Semester</SelectItem>
                    <SelectItem value="7">7th Semester</SelectItem>
                    <SelectItem value="8">8th Semester</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Describe your project...\" className="mt-1" rows={4} value={currentProject.description} onChange={(e) => setCurrentProject({ ...currentProject, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="branch">Branch</Label>
                <Select value={currentProject.branch} onValueChange={(value) => setCurrentProject({ ...currentProject, branch: value as 'draft' | 'main' })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft (Work in Progress)</SelectItem>
                    <SelectItem value="main">Main (Final)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="progress">Progress (%)</Label>
                <Input 
                  id="progress" 
                  type="number" 
                  min="0" 
                  max="100" 
                  placeholder="0-100" 
                  className="mt-1" 
                  value={currentProject.progress} 
                  onChange={(e) => setCurrentProject({ ...currentProject, progress: parseInt(e.target.value) || 0 })} 
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-4">
              <Button variant="outline" onClick={handleProjectDialogClose}>Cancel</Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleProjectSave}>{editingProjectId ? 'Save Changes' : 'Add Project'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Project History</DialogTitle>
            <DialogDescription>
              View the version history and changes for this project.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedProjectVersions.map((version, index) => (
              <Card key={index} className="p-4 border border-gray-200 rounded-lg">
                <h3 className="text-gray-900 mb-2">{version.title}</h3>
                <p className="text-gray-600 mb-3">{version.description}</p>
                <div className="space-y-2 mb-4">
                  <p className="text-gray-500">{version.timestamp}</p>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded">
                    {version.progress}%
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => rollbackToVersion(selectedProjectVersions[0].id, version.id)}>
                    <History className="w-4 h-4 mr-1" />
                    Rollback
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}