import { Upload, FileText, FolderOpen, Download, Eye, Grid3x3, List, File, Plus, Save, Trash2, Edit } from 'lucide-react';
import { useState } from 'react';
import Sidebar from './Sidebar';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { toast } from 'sonner';
import { Progress } from './ui/progress';

import { User, FileItem } from '../types';

interface NotesProps {
  onNavigate: (page: 'dashboard' | 'projects' | 'certificates' | 'notes' | 'resume' | 'portfolio' | 'profile') => void;
  onLogout: () => void;
  currentUser: User | null;
  notes: FileItem[];
  setNotes: React.Dispatch<React.SetStateAction<FileItem[]>>;
}

export default function Notes({ onNavigate, onLogout, currentUser, notes: dashboardNotes, setNotes }: NotesProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [myNotes, setMyNotes] = useState<Array<{ id: number; title: string; content: string; date: string }>>([]);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState({ title: '', content: '' });
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const folders = [
    { name: 'Semester 6', fileCount: 12 },
    { name: 'Semester 5', fileCount: 18 },
    { name: 'Important Documents', fileCount: 5 },
    { name: 'Study Materials', fileCount: 8 },
  ];

  const files = [
    {
      name: 'Database Management Notes.pdf',
      subject: 'DBMS',
      size: '2.4 MB',
      date: 'Nov 15, 2024',
      type: 'pdf',
    },
    {
      name: 'Web Technologies Lecture.docx',
      subject: 'Web Tech',
      size: '1.8 MB',
      date: 'Nov 14, 2024',
      type: 'docx',
    },
    {
      name: 'Machine Learning Summary.pdf',
      subject: 'ML',
      size: '3.2 MB',
      date: 'Nov 10, 2024',
      type: 'pdf',
    },
    {
      name: 'Operating Systems.pdf',
      subject: 'OS',
      size: '4.1 MB',
      date: 'Nov 8, 2024',
      type: 'pdf',
    },
    {
      name: 'Computer Networks Notes.pdf',
      subject: 'CN',
      size: '2.9 MB',
      date: 'Nov 5, 2024',
      type: 'pdf',
    },
    {
      name: 'Software Engineering.docx',
      subject: 'SE',
      size: '1.5 MB',
      date: 'Nov 2, 2024',
      type: 'docx',
    },
  ];

  const getFileIcon = (type: string) => {
    return <FileText className="w-5 h-5 text-blue-600" />;
  };

  const addNote = () => {
    if (!currentNote.title || !currentNote.content) {
      toast.error('Please fill in both title and content');
      return;
    }
    const newNote = {
      id: Date.now(),
      title: currentNote.title,
      content: currentNote.content,
      date: new Date().toLocaleDateString(),
    };
    setMyNotes([...myNotes, newNote]);
    setNoteDialogOpen(false);
    setCurrentNote({ title: '', content: '' });
    toast.success('Note added successfully!');
  };

  const editNote = () => {
    if (!currentNote.title || !currentNote.content) {
      toast.error('Please fill in both title and content');
      return;
    }
    if (editingNoteId !== null) {
      const updatedNotes = myNotes.map((note) =>
        note.id === editingNoteId ? { ...note, title: currentNote.title, content: currentNote.content } : note
      );
      setMyNotes(updatedNotes);
      setNoteDialogOpen(false);
      setCurrentNote({ title: '', content: '' });
      setEditingNoteId(null);
      toast.success('Note updated successfully!');
    }
  };

  const deleteNote = (id: number) => {
    const updatedNotes = myNotes.filter((note) => note.id !== id);
    setMyNotes(updatedNotes);
    toast.success('Note deleted successfully!');
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleUpload = () => {
    if (!uploadedFile) {
      toast.error('Please select a file to upload');
      return;
    }
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          
          // Add notes to dashboard
          const newNote = {
            id: Date.now().toString(),
            name: uploadedFile.name.replace(/\.[^/.]+$/, ''), // Remove file extension
            type: 'Notes',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            size: `${(uploadedFile.size / 1024 / 1024).toFixed(2)} MB`
          };
          
          setNotes([newNote, ...dashboardNotes]);
          
          toast.success('Notes uploaded successfully!');
          setIsUploading(false);
          setUploadProgress(0);
          setUploadedFile(null);
          setUploadDialogOpen(false);
          
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  const triggerFileInput = () => {
    document.getElementById('notes-file-input')?.click();
  };

  return (
    <>
      <Sidebar currentPage="notes" onNavigate={onNavigate} onLogout={onLogout} />
      
      <main className="flex-1 overflow-auto bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-gray-900">Notes Repository</h1>
              <p className="text-gray-600 mt-1">Organize and access your study materials</p>
            </div>
            <div className="flex gap-3">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={viewMode === 'grid' ? 'bg-white shadow-sm' : ''}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3x3 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={viewMode === 'list' ? 'bg-white shadow-sm' : ''}
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Notes
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Notes</DialogTitle>
                    <DialogDescription>
                      Upload your study notes and class materials.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <div
                      className={`border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors cursor-pointer ${
                        isDragging ? 'border-blue-400' : ''
                      }`}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    >
                      <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 mb-1">Drag and drop your files here</p>
                      <p className="text-gray-500 mb-4">or</p>
                      <Input
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        accept=".pdf,.docx,.txt,image/*"
                        id="notes-file-input"
                      />
                      <Button
                        variant="outline"
                        onClick={triggerFileInput}
                      >
                        Browse Files
                      </Button>
                      <p className="text-gray-500 mt-4">Supported formats: PDF, DOCX, TXT, Images</p>
                    </div>
                    {isUploading && (
                      <div className="mt-4">
                        <Progress value={uploadProgress} />
                        <p className="text-gray-500 mt-2">Uploading... {uploadProgress}%</p>
                      </div>
                    )}
                    {uploadedFile && !isUploading && (
                      <p className="text-gray-600 mt-2">Selected: {uploadedFile.name}</p>
                    )}
                  </div>
                  <div className="flex justify-end mt-4 gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setUploadDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={handleUpload}
                      disabled={isUploading || !uploadedFile}
                    >
                      Upload
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  setNoteDialogOpen(true);
                  setCurrentNote({ title: '', content: '' });
                  setEditingNoteId(null);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Note
              </Button>
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* Folders Section */}
          <div className="mb-8">
            <h2 className="text-gray-900 mb-4">Folders</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {folders.map((folder, index) => (
                <Card key={index} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FolderOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-gray-900">{folder.name}</p>
                      <p className="text-gray-500">{folder.fileCount} files</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Files Section */}
          <div>
            <h2 className="text-gray-900 mb-4">Recent Files</h2>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {files.map((file, index) => (
                  <Card key={index} className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        {getFileIcon(file.type)}
                      </div>
                      <span className="px-2 py-1 bg-gray-100 rounded text-gray-700 uppercase">
                        {file.type}
                      </span>
                    </div>
                    <h3 className="text-gray-900 mb-2">{file.name}</h3>
                    <p className="text-gray-600 mb-3">{file.subject}</p>
                    <div className="space-y-1 mb-4">
                      <p className="text-gray-500">{file.size}</p>
                      <p className="text-gray-500">{file.date}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {files.map((file, index) => (
                    <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            {getFileIcon(file.type)}
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-900">{file.name}</p>
                            <p className="text-gray-500">{file.subject} • {file.size} • {file.date}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            Preview
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* My Notes Section */}
          {myNotes.length > 0 && (
            <div className="mt-8">
              <h2 className="text-gray-900 mb-4">My Notes</h2>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myNotes.map((note) => (
                    <Card key={note.id} className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-green-600" />
                        </div>
                        <span className="px-2 py-1 bg-green-100 rounded text-green-700 uppercase">
                          Note
                        </span>
                      </div>
                      <h3 className="text-gray-900 mb-2">{note.title}</h3>
                      <p className="text-gray-600 mb-3 line-clamp-2">{note.content}</p>
                      <div className="space-y-1 mb-4">
                        <p className="text-gray-500">{note.date}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setNoteDialogOpen(true);
                            setCurrentNote({ title: note.title, content: note.content });
                            setEditingNoteId(note.id);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteNote(note.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="divide-y divide-gray-200">
                    {myNotes.map((note) => (
                      <div key={note.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <FileText className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-gray-900">{note.title}</p>
                              <p className="text-gray-500">{note.content.substring(0, 50)}... • {note.date}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setNoteDialogOpen(true);
                                setCurrentNote({ title: note.title, content: note.content });
                                setEditingNoteId(note.id);
                              }}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteNote(note.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Note Dialog */}
        <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingNoteId ? 'Edit Note' : 'Add Note'}</DialogTitle>
              <DialogDescription>
                {editingNoteId ? 'Update your note details.' : 'Create a new note for your studies.'}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="Title"
                  value={currentNote.title}
                  onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
                />
                <Textarea
                  placeholder="Content"
                  value={currentNote.content}
                  onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
                  className="min-h-[200px] resize-none"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (editingNoteId) {
                    editNote();
                  } else {
                    addNote();
                  }
                }}
              >
                <Save className="w-4 h-4 mr-1" />
                {editingNoteId ? 'Save' : 'Add'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setNoteDialogOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </>
  );
}