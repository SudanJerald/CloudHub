import Sidebar from './Sidebar';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { User as UserIcon, Mail, Phone, MapPin, School, Calendar, Linkedin, Github, Edit, Save, X, Plus, Trophy, Star, Award } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import * as api from '../utils/api';
import { User } from '../types';

interface ProfileProps {
  onNavigate: (page: 'dashboard' | 'projects' | 'certificates' | 'resume' | 'portfolio' | 'profile') => void;
  onLogout: () => void;
  currentUser: User | null;
}

interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  rollNo: string;
  course: string;
  semester: string;
  department: string;
  college: string;
  location: string;
  joinedDate: string;
  linkedinUrl: string;
  githubUrl: string;
  bio: string;
  cgpa: string;
  skills: string[];
  achievements: string[];
  profileImage?: string;
}

export default function Profile({ onNavigate, onLogout, currentUser }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState('');
  const [newAchievement, setNewAchievement] = useState('');
  
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: '',
    rollNo: currentUser?.rollNo || '',
    course: '',
    semester: currentUser?.yearSemester || '',
    department: currentUser?.department || '',
    college: '',
    location: '',
    joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    linkedinUrl: '',
    githubUrl: '',
    bio: '',
    cgpa: '0.0',
    skills: [],
    achievements: [],
    profileImage: ''
  });

  const [editData, setEditData] = useState<ProfileData>(profileData);

  // Load profile data on mount
  useEffect(() => {
    const loadProfile = async () => {
      if (currentUser) {
        try {
          const data = await api.getProfile(currentUser.email);
          if (data && Object.keys(data).length > 0) {
            const loadedData = {
              ...profileData,
              ...data,
              fullName: data.fullName || currentUser.name,
              email: data.email || currentUser.email,
              rollNo: data.rollNo || currentUser.rollNo || '',
              department: data.department || currentUser.department || '',
              semester: data.semester || currentUser.yearSemester || '',
              skills: data.skills || [],
              achievements: data.achievements || []
            };
            setProfileData(loadedData);
            setEditData(loadedData);
            if (data.profileImage) setProfileImage(data.profileImage);
          }
        } catch (error) {
          console.error('Error loading profile:', error);
        }
      }
    };
    
    loadProfile();
  }, [currentUser]);

  const stats = [
    { label: 'Projects Uploaded', value: '0' },
    { label: 'Certificates', value: '0' },
    { label: 'Notes', value: '0' },
    { label: 'Total Files', value: '0' },
  ];

  const handleEdit = () => {
    setIsEditing(true);
    setEditData(profileData);
  };

  const handleSave = async () => {
    if (!currentUser) return;
    
    setIsSaving(true);
    try {
      const dataToSave = {
        ...editData,
        profileImage
      };
      
      await api.saveProfile(currentUser.email, dataToSave);
      setProfileData(editData);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData(profileData);
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        toast.success('Profile image updated! Click Save to keep changes.');
      };
      reader.readAsDataURL(file);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setEditData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
      toast.success('Skill added! Click Save to keep changes.');
    }
  };

  const removeSkill = (index: number) => {
    setEditData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const addAchievement = () => {
    if (newAchievement.trim()) {
      setEditData(prev => ({
        ...prev,
        achievements: [...prev.achievements, newAchievement.trim()]
      }));
      setNewAchievement('');
      toast.success('Achievement added! Click Save to keep changes.');
    }
  };

  const removeAchievement = (index: number) => {
    setEditData(prev => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index)
    }));
  };

  return (
    <>
      <Sidebar currentPage="profile" onNavigate={onNavigate} onLogout={onLogout} />
      
      <main className="flex-1 overflow-auto bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-6">
          <h1 className="text-gray-900">Student Profile</h1>
          <p className="text-gray-600 mt-1">Manage your personal information and academic details</p>
        </header>

        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <Card className="lg:col-span-1 p-6 border border-gray-200 rounded-lg h-fit">
              <div className="text-center mb-6">
                <div className="relative inline-block mb-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={profileImage || ''} />
                    <AvatarFallback className="bg-blue-600 text-white">{getInitials(profileData.fullName)}</AvatarFallback>
                  </Avatar>
                  <input
                    type="file"
                    id="profile-image-upload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('profile-image-upload')?.click()}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors cursor-pointer shadow-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
                <h2 className="text-gray-900 mb-1">{profileData.fullName}</h2>
                <p className="text-gray-600">{profileData.course}</p>
                <p className="text-gray-500">{profileData.semester}</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{profileData.email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{profileData.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <School className="w-4 h-4" />
                  <span>{profileData.college}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{profileData.location}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {profileData.joinedDate}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <h3 className="text-gray-900 mb-3">Social Links</h3>
                <div className="flex items-center gap-3 text-gray-600">
                  <Linkedin className="w-4 h-4 text-blue-600" />
                  <span>{profileData.linkedinUrl}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Github className="w-4 h-4" />
                  <span>{profileData.githubUrl}</span>
                </div>
              </div>
            </Card>

            {/* Details and Stats */}
            <div className="lg:col-span-2 space-y-6">
              {/* Academic Summary */}
              <Card className="p-6 border border-gray-200 rounded-lg">
                <h3 className="text-gray-900 mb-4">Academic Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-100">
                    <div className="flex items-center justify-center mb-2">
                      <Trophy className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-blue-600 mb-1">{profileData.cgpa || '0.0'}</p>
                    <p className="text-sm text-gray-600">CGPA</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-white rounded-lg border border-green-100">
                    <div className="flex items-center justify-center mb-2">
                      <Star className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-green-600 mb-1">{profileData.skills.length}</p>
                    <p className="text-sm text-gray-600">Skills</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-white rounded-lg border border-purple-100">
                    <div className="flex items-center justify-center mb-2">
                      <Award className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-purple-600 mb-1">{profileData.achievements.length}</p>
                    <p className="text-sm text-gray-600">Achievements</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-white rounded-lg border border-orange-100">
                    <p className="text-2xl font-bold text-orange-600 mb-1">0</p>
                    <p className="text-sm text-gray-600">Total Files</p>
                  </div>
                </div>
              </Card>

              {/* Storage Usage */}
              <Card className="p-6 border border-gray-200 rounded-lg">
                <h3 className="text-gray-900 mb-4">Storage Usage</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-700">Total Storage</span>
                      <span className="text-gray-600">0 GB / 5 GB</span>
                    </div>
                    <Progress value={0} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <p className="text-gray-500 mb-1">Projects</p>
                      <p className="text-gray-900">0 GB</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Certificates</p>
                      <p className="text-gray-900">0 GB</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Resume</p>
                      <p className="text-gray-900">0 GB</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Personal Information */}
              <Card className="p-6 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-900">Personal Information</h3>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving}>
                        <Save className="w-4 h-4 mr-1" />
                        {isSaving ? 'Saving...' : 'Save'}
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleCancel}>
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" onClick={handleEdit}>
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullname">Full Name</Label>
                      <Input id="fullname" value={editData.fullName} className="mt-1" readOnly={!isEditing} onChange={(e) => handleInputChange('fullName', e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" value={editData.email} className="mt-1" readOnly={!isEditing} onChange={(e) => handleInputChange('email', e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" value={editData.phone} className="mt-1" readOnly={!isEditing} onChange={(e) => handleInputChange('phone', e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="rollno">Roll Number</Label>
                      <Input id="rollno" value={editData.rollNo} className="mt-1" readOnly={!isEditing} onChange={(e) => handleInputChange('rollNo', e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="course">Course</Label>
                      <Input id="course" value={editData.course} className="mt-1" readOnly={!isEditing} onChange={(e) => handleInputChange('course', e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="semester">Current Semester</Label>
                      <Input id="semester" value={editData.semester} className="mt-1" readOnly={!isEditing} onChange={(e) => handleInputChange('semester', e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Input id="department" value={editData.department} className="mt-1" readOnly={!isEditing} onChange={(e) => handleInputChange('department', e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="college">College</Label>
                      <Input id="college" value={editData.college} className="mt-1" readOnly={!isEditing} onChange={(e) => handleInputChange('college', e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input id="location" value={editData.location} className="mt-1" readOnly={!isEditing} onChange={(e) => handleInputChange('location', e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="cgpa">CGPA</Label>
                      <Input 
                        id="cgpa" 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        max="10" 
                        value={editData.cgpa} 
                        className="mt-1" 
                        readOnly={!isEditing} 
                        onChange={(e) => handleInputChange('cgpa', e.target.value)} 
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <>
                      <div className="pt-4 border-t">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          placeholder="Tell us about yourself..."
                          value={editData.bio}
                          onChange={(e) => handleInputChange('bio', e.target.value)}
                          className="mt-1 min-h-[100px] resize-none"
                        />
                      </div>

                      <div className="pt-4 border-t">
                        <Label>Skills</Label>
                        <div className="flex gap-2 mt-2 mb-3">
                          <Input
                            placeholder="Add a skill (e.g., React, Python)"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                          />
                          <Button type="button" onClick={addSkill} size="sm">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {editData.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="gap-1">
                              {skill}
                              <X 
                                className="w-3 h-3 cursor-pointer hover:text-red-500" 
                                onClick={() => removeSkill(index)}
                              />
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <Label>Achievements</Label>
                        <div className="flex gap-2 mt-2 mb-3">
                          <Input
                            placeholder="Add an achievement"
                            value={newAchievement}
                            onChange={(e) => setNewAchievement(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAchievement())}
                          />
                          <Button type="button" onClick={addAchievement} size="sm">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {editData.achievements.map((achievement, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                              <span className="text-sm">{achievement}</span>
                              <X 
                                className="w-4 h-4 cursor-pointer hover:text-red-500" 
                                onClick={() => removeAchievement(index)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <Label>Social Links</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                          <div>
                            <div className="flex gap-2 items-center">
                              <Linkedin className="w-4 h-4 text-blue-600" />
                              <Input
                                placeholder="LinkedIn profile URL"
                                value={editData.linkedinUrl}
                                onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex gap-2 items-center">
                              <Github className="w-4 h-4" />
                              <Input
                                placeholder="GitHub profile URL"
                                value={editData.githubUrl}
                                onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {!isEditing && (
                    <>
                      {profileData.bio && (
                        <div className="pt-4 border-t">
                          <h4 className="font-semibold text-gray-900 mb-2">About</h4>
                          <p className="text-gray-600">{profileData.bio}</p>
                        </div>
                      )}

                      {profileData.skills.length > 0 && (
                        <div className="pt-4 border-t">
                          <h4 className="font-semibold text-gray-900 mb-3">Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {profileData.skills.map((skill, index) => (
                              <Badge key={index} variant="secondary">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {profileData.achievements.length > 0 && (
                        <div className="pt-4 border-t">
                          <h4 className="font-semibold text-gray-900 mb-3">Achievements</h4>
                          <div className="space-y-2">
                            {profileData.achievements.map((achievement, index) => (
                              <div key={index} className="flex items-start gap-2">
                                <Award className="w-4 h-4 mt-1 text-yellow-500 flex-shrink-0" />
                                <span className="text-gray-700">{achievement}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}