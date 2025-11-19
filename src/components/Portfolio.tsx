import Sidebar from './Sidebar';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Switch } from './ui/switch';
import { 
  Edit, 
  Save, 
  X, 
  Eye, 
  Share2, 
  Plus, 
  Trash2, 
  Layout, 
  Briefcase, 
  Award, 
  FileText,
  Link as LinkIcon,
  Linkedin,
  Github,
  Globe,
  Mail
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import * as api from '../utils/api';
import { User, FileItem } from '../types';

interface PortfolioProps {
  onNavigate: (page: 'dashboard' | 'projects' | 'certificates' | 'resume' | 'portfolio' | 'profile') => void;
  onLogout: () => void;
  currentUser: User | null;
  projects: FileItem[];
  certificates: FileItem[];
  resumes: FileItem[];
}

interface PortfolioData {
  name: string;
  degree: string;
  department: string;
  aboutMe: string;
  skills: string[];
  achievements: string[];
  socialLinks: {
    linkedin: string;
    github: string;
    website: string;
    email: string;
  };
}

interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
}

export default function Portfolio({ 
  onNavigate, 
  onLogout, 
  currentUser,
  projects,
  certificates,
  resumes
}: PortfolioProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('modern');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [autoSyncProjects, setAutoSyncProjects] = useState(true);
  const [autoSyncCertificates, setAutoSyncCertificates] = useState(true);
  const [autoSyncResume, setAutoSyncResume] = useState(true);

  const themes: Theme[] = [
    { 
      id: 'modern', 
      name: 'Modern Blue', 
      colors: { primary: '#2563eb', secondary: '#3b82f6', background: '#f8fafc', text: '#1e293b' }
    },
    { 
      id: 'minimal', 
      name: 'Minimal Gray', 
      colors: { primary: '#475569', secondary: '#64748b', background: '#ffffff', text: '#0f172a' }
    },
    { 
      id: 'professional', 
      name: 'Professional Navy', 
      colors: { primary: '#1e40af', secondary: '#3730a3', background: '#f1f5f9', text: '#0f172a' }
    },
    { 
      id: 'creative', 
      name: 'Creative Purple', 
      colors: { primary: '#7c3aed', secondary: '#8b5cf6', background: '#faf5ff', text: '#1e1b4b' }
    }
  ];

  const [portfolioData, setPortfolioData] = useState<PortfolioData>({
    name: currentUser?.name || '',
    degree: 'Bachelor of Technology',
    department: 'Computer Science Engineering',
    aboutMe: 'Passionate computer science student with expertise in web development and software engineering. Always eager to learn new technologies and work on innovative projects.',
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git', 'HTML/CSS', 'TypeScript'],
    achievements: [
      'Winner of College Hackathon 2024',
      'Published research paper on Machine Learning',
      'Led team of 5 students in capstone project',
      'Completed 3 internships in web development'
    ],
    socialLinks: {
      linkedin: 'linkedin.com/in/johndoe',
      github: 'github.com/johndoe',
      website: 'johndoe.dev',
      email: currentUser?.email || 'john.doe@email.com'
    }
  });

  const [editData, setEditData] = useState<PortfolioData>(portfolioData);
  const [newSkill, setNewSkill] = useState('');
  const [newAchievement, setNewAchievement] = useState('');

  // Load portfolio data on mount
  useEffect(() => {
    const loadPortfolio = async () => {
      if (currentUser) {
        try {
          const data = await api.getPortfolio(currentUser.email);
          if (data) {
            setPortfolioData(data);
            setEditData(data);
            if (data.selectedTheme) setSelectedTheme(data.selectedTheme);
            if (data.autoSyncProjects !== undefined) setAutoSyncProjects(data.autoSyncProjects);
            if (data.autoSyncCertificates !== undefined) setAutoSyncCertificates(data.autoSyncCertificates);
            if (data.autoSyncResume !== undefined) setAutoSyncResume(data.autoSyncResume);
          }
        } catch (error) {
          console.error('Error loading portfolio:', error);
        }
      }
    };
    
    loadPortfolio();
  }, [currentUser]);

  // Auto-save portfolio data whenever it changes
  useEffect(() => {
    const saveData = async () => {
      if (currentUser) {
        try {
          await api.savePortfolio(currentUser.email, {
            ...portfolioData,
            selectedTheme,
            autoSyncProjects,
            autoSyncCertificates,
            autoSyncResume
          });
        } catch (error) {
          console.error('Error saving portfolio:', error);
        }
      }
    };
    
    const timeoutId = setTimeout(saveData, 500);
    return () => clearTimeout(timeoutId);
  }, [portfolioData, selectedTheme, autoSyncProjects, autoSyncCertificates, autoSyncResume, currentUser]);

  const handleSave = () => {
    setPortfolioData(editData);
    setIsEditing(false);
    toast.success('Portfolio updated successfully!');
  };

  const handleCancel = () => {
    setEditData(portfolioData);
    setIsEditing(false);
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      setEditData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setEditData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const handleAddAchievement = () => {
    if (newAchievement.trim()) {
      setEditData(prev => ({
        ...prev,
        achievements: [...prev.achievements, newAchievement.trim()]
      }));
      setNewAchievement('');
    }
  };

  const handleRemoveAchievement = (index: number) => {
    setEditData(prev => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index)
    }));
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://cloudhub.com/portfolio/' + currentUser?.rollNo);
    toast.success('Portfolio link copied to clipboard!');
  };

  const currentTheme = themes.find(t => t.id === selectedTheme) || themes[0];

  // Get latest resume
  const latestResume = resumes.length > 0 ? resumes[resumes.length - 1] : null;

  return (
    <>
      <Sidebar currentPage="portfolio" onNavigate={onNavigate} onLogout={onLogout} />
      
      <main className="flex-1 overflow-auto bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-gray-900">Portfolio Builder</h1>
              <p className="text-gray-600 mt-1">Create and share your academic portfolio</p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={() => setPreviewOpen(true)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => setShareDialogOpen(true)}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Portfolio
              </Button>
            </div>
          </div>
        </header>

        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card className="p-6 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-gray-900">Basic Information</h2>
                  {!isEditing ? (
                    <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSave}>
                        <Save className="w-4 h-4 mr-1" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancel}>
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Full Name</Label>
                      {isEditing ? (
                        <Input
                          value={editData.name}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          placeholder="Your full name"
                        />
                      ) : (
                        <p className="text-gray-900 mt-2">{portfolioData.name}</p>
                      )}
                    </div>
                    <div>
                      <Label>Degree</Label>
                      {isEditing ? (
                        <Input
                          value={editData.degree}
                          onChange={(e) => setEditData({ ...editData, degree: e.target.value })}
                          placeholder="Your degree"
                        />
                      ) : (
                        <p className="text-gray-900 mt-2">{portfolioData.degree}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label>Department</Label>
                    {isEditing ? (
                      <Input
                        value={editData.department}
                        onChange={(e) => setEditData({ ...editData, department: e.target.value })}
                        placeholder="Your department"
                      />
                    ) : (
                      <p className="text-gray-900 mt-2">{portfolioData.department}</p>
                    )}
                  </div>

                  <div>
                    <Label>About Me</Label>
                    {isEditing ? (
                      <Textarea
                        value={editData.aboutMe}
                        onChange={(e) => setEditData({ ...editData, aboutMe: e.target.value })}
                        placeholder="Tell us about yourself..."
                        rows={4}
                      />
                    ) : (
                      <p className="text-gray-700 mt-2">{portfolioData.aboutMe}</p>
                    )}
                  </div>
                </div>
              </Card>

              {/* Skills */}
              <Card className="p-6 border border-gray-200 rounded-lg">
                <h2 className="text-gray-900 mb-4">Skills</h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  {(isEditing ? editData.skills : portfolioData.skills).map((skill, index) => (
                    <span 
                      key={index} 
                      className="px-3 py-1 bg-blue-50 text-blue-600 rounded flex items-center gap-2"
                    >
                      {skill}
                      {isEditing && (
                        <button
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
                {isEditing && (
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
                    <Button onClick={handleAddSkill}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </Card>

              {/* Achievements */}
              <Card className="p-6 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-gray-900">Achievements</h2>
                  {isEditing && (
                    <Button size="sm" variant="outline" onClick={() => setNewAchievement('')}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  )}
                </div>
                <div className="space-y-3">
                  {(isEditing ? editData.achievements : portfolioData.achievements).map((achievement, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Award className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                      {isEditing ? (
                        <div className="flex-1 flex gap-2">
                          <Input
                            value={achievement}
                            onChange={(e) => {
                              const newAchievements = [...editData.achievements];
                              newAchievements[index] = e.target.value;
                              setEditData({ ...editData, achievements: newAchievements });
                            }}
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveAchievement(index)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      ) : (
                        <p className="text-gray-700">{achievement}</p>
                      )}
                    </div>
                  ))}
                  {isEditing && (
                    <div className="flex items-start gap-3 pt-2">
                      <Award className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div className="flex-1 flex gap-2">
                        <Input
                          value={newAchievement}
                          onChange={(e) => setNewAchievement(e.target.value)}
                          placeholder="Add new achievement"
                        />
                        <Button onClick={handleAddAchievement}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Social Links */}
              <Card className="p-6 border border-gray-200 rounded-lg">
                <h2 className="text-gray-900 mb-4">Social Links</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Linkedin className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <Label>LinkedIn</Label>
                      {isEditing ? (
                        <Input
                          value={editData.socialLinks.linkedin}
                          onChange={(e) => setEditData({
                            ...editData,
                            socialLinks: { ...editData.socialLinks, linkedin: e.target.value }
                          })}
                          placeholder="linkedin.com/in/username"
                        />
                      ) : (
                        <p className="text-gray-700">{portfolioData.socialLinks.linkedin}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Github className="w-5 h-5 text-gray-900" />
                    <div className="flex-1">
                      <Label>GitHub</Label>
                      {isEditing ? (
                        <Input
                          value={editData.socialLinks.github}
                          onChange={(e) => setEditData({
                            ...editData,
                            socialLinks: { ...editData.socialLinks, github: e.target.value }
                          })}
                          placeholder="github.com/username"
                        />
                      ) : (
                        <p className="text-gray-700">{portfolioData.socialLinks.github}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <Label>Personal Website</Label>
                      {isEditing ? (
                        <Input
                          value={editData.socialLinks.website}
                          onChange={(e) => setEditData({
                            ...editData,
                            socialLinks: { ...editData.socialLinks, website: e.target.value }
                          })}
                          placeholder="yourwebsite.com"
                        />
                      ) : (
                        <p className="text-gray-700">{portfolioData.socialLinks.website}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-red-600" />
                    <div className="flex-1">
                      <Label>Email</Label>
                      {isEditing ? (
                        <Input
                          value={editData.socialLinks.email}
                          onChange={(e) => setEditData({
                            ...editData,
                            socialLinks: { ...editData.socialLinks, email: e.target.value }
                          })}
                          placeholder="email@example.com"
                        />
                      ) : (
                        <p className="text-gray-700">{portfolioData.socialLinks.email}</p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Theme Selection */}
              <Card className="p-6 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Layout className="w-5 h-5 text-blue-600" />
                  <h3 className="text-gray-900">Theme</h3>
                </div>
                <div className="space-y-3">
                  {themes.map((theme) => (
                    <div
                      key={theme.id}
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedTheme === theme.id 
                          ? 'border-blue-600 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedTheme(theme.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-900">{theme.name}</span>
                        {selectedTheme === theme.id && (
                          <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <div 
                          className="w-6 h-6 rounded" 
                          style={{ backgroundColor: theme.colors.primary }}
                        />
                        <div 
                          className="w-6 h-6 rounded" 
                          style={{ backgroundColor: theme.colors.secondary }}
                        />
                        <div 
                          className="w-6 h-6 rounded border border-gray-300" 
                          style={{ backgroundColor: theme.colors.background }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Auto-Sync Modules */}
              <Card className="p-6 border border-gray-200 rounded-lg">
                <h3 className="text-gray-900 mb-4">Auto-Sync Content</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-blue-600" />
                      <div>
                        <Label>Projects</Label>
                        <p className="text-gray-500">{projects.length} projects</p>
                      </div>
                    </div>
                    <Switch 
                      checked={autoSyncProjects} 
                      onCheckedChange={setAutoSyncProjects} 
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-green-600" />
                      <div>
                        <Label>Certificates</Label>
                        <p className="text-gray-500">{certificates.length} certificates</p>
                      </div>
                    </div>
                    <Switch 
                      checked={autoSyncCertificates} 
                      onCheckedChange={setAutoSyncCertificates} 
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-600" />
                      <div>
                        <Label>Resume</Label>
                        <p className="text-gray-500">
                          {latestResume ? 'Latest version' : 'No resume'}
                        </p>
                      </div>
                    </div>
                    <Switch 
                      checked={autoSyncResume} 
                      onCheckedChange={setAutoSyncResume} 
                    />
                  </div>
                </div>
              </Card>

              {/* Synced Content Preview */}
              {autoSyncProjects && projects.length > 0 && (
                <Card className="p-6 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    <h3 className="text-gray-900">Synced Projects</h3>
                  </div>
                  <div className="space-y-2">
                    {projects.slice(0, 3).map((project) => (
                      <div key={project.id} className="text-gray-700 flex items-center justify-between">
                        <span className="truncate">{project.name}</span>
                        {project.version && (
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                            {project.version}
                          </span>
                        )}
                      </div>
                    ))}
                    {projects.length > 3 && (
                      <p className="text-gray-500">+{projects.length - 3} more</p>
                    )}
                  </div>
                </Card>
              )}

              {autoSyncCertificates && certificates.length > 0 && (
                <Card className="p-6 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-4 h-4 text-green-600" />
                    <h3 className="text-gray-900">Synced Certificates</h3>
                  </div>
                  <div className="space-y-2">
                    {certificates.slice(0, 3).map((cert) => (
                      <div key={cert.id} className="text-gray-700 truncate">
                        {cert.name}
                      </div>
                    ))}
                    {certificates.length > 3 && (
                      <p className="text-gray-500">+{certificates.length - 3} more</p>
                    )}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Preview Dialog */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Portfolio Preview - {currentTheme.name}</DialogTitle>
              <DialogDescription>
                Preview how your portfolio will look with the selected theme.
              </DialogDescription>
            </DialogHeader>
            <div 
              className="overflow-auto max-h-[75vh] rounded-lg border p-8"
              style={{ 
                backgroundColor: currentTheme.colors.background,
                color: currentTheme.colors.text 
              }}
            >
              {/* Preview Header */}
              <div className="text-center mb-8 pb-8 border-b" style={{ borderColor: currentTheme.colors.primary + '20' }}>
                <h1 className="text-4xl mb-2" style={{ color: currentTheme.colors.primary }}>
                  {portfolioData.name}
                </h1>
                <p className="text-xl mb-2">{portfolioData.degree}</p>
                <p className="text-lg text-gray-600">{portfolioData.department}</p>
                <div className="flex justify-center gap-4 mt-4">
                  <a href="#" className="hover:underline">{portfolioData.socialLinks.email}</a>
                  <a href="#" className="hover:underline">{portfolioData.socialLinks.linkedin}</a>
                  <a href="#" className="hover:underline">{portfolioData.socialLinks.github}</a>
                </div>
              </div>

              {/* About Me */}
              <div className="mb-8">
                <h2 className="text-2xl mb-4" style={{ color: currentTheme.colors.primary }}>About Me</h2>
                <p className="text-gray-700 leading-relaxed">{portfolioData.aboutMe}</p>
              </div>

              {/* Skills */}
              <div className="mb-8">
                <h2 className="text-2xl mb-4" style={{ color: currentTheme.colors.primary }}>Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {portfolioData.skills.map((skill, index) => (
                    <span 
                      key={index}
                      className="px-4 py-2 rounded-lg"
                      style={{ 
                        backgroundColor: currentTheme.colors.primary + '15',
                        color: currentTheme.colors.primary
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Projects */}
              {autoSyncProjects && projects.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl mb-4" style={{ color: currentTheme.colors.primary }}>Projects</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projects.map((project) => (
                      <div 
                        key={project.id} 
                        className="p-4 rounded-lg border"
                        style={{ borderColor: currentTheme.colors.primary + '30' }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg" style={{ color: currentTheme.colors.primary }}>
                            {project.name}
                          </h3>
                          {project.version && (
                            <span className="text-xs px-2 py-1 rounded" style={{ 
                              backgroundColor: currentTheme.colors.secondary + '20',
                              color: currentTheme.colors.secondary
                            }}>
                              {project.version}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600">{project.date}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certificates */}
              {autoSyncCertificates && certificates.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl mb-4" style={{ color: currentTheme.colors.primary }}>Certificates</h2>
                  <div className="space-y-3">
                    {certificates.map((cert) => (
                      <div 
                        key={cert.id} 
                        className="flex items-center gap-3 p-3 rounded-lg"
                        style={{ backgroundColor: currentTheme.colors.primary + '10' }}
                      >
                        <Award className="w-5 h-5" style={{ color: currentTheme.colors.primary }} />
                        <div>
                          <p className="text-gray-900">{cert.name}</p>
                          <p className="text-gray-600">{cert.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Achievements */}
              <div className="mb-8">
                <h2 className="text-2xl mb-4" style={{ color: currentTheme.colors.primary }}>Achievements</h2>
                <ul className="space-y-2">
                  {portfolioData.achievements.map((achievement, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Award className="w-5 h-5 mt-1" style={{ color: currentTheme.colors.primary }} />
                      <span className="text-gray-700">{achievement}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resume Link */}
              {autoSyncResume && latestResume && (
                <div className="text-center pt-8 border-t" style={{ borderColor: currentTheme.colors.primary + '20' }}>
                  <Button 
                    className="px-6 py-3"
                    style={{ 
                      backgroundColor: currentTheme.colors.primary,
                      color: 'white'
                    }}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Download Resume
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Share Dialog */}
        <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share Your Portfolio</DialogTitle>
              <DialogDescription>
                Share your portfolio with recruiters and colleagues.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div>
                <Label>Portfolio URL</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={'https://cloudhub.com/portfolio/' + currentUser?.rollNo}
                    readOnly
                    className="bg-gray-50"
                  />
                  <Button onClick={handleCopyLink}>
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </div>
              <p className="text-gray-500">
                Share this link to showcase your academic portfolio with recruiters and faculty.
              </p>
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-gray-900 mb-2">Quick Share</h4>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Linkedin className="w-4 h-4 mr-2" />
                    LinkedIn
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </>
  );
}