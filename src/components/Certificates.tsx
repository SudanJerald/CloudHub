import { useState } from 'react';
import Sidebar from './Sidebar';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Upload, Download, Eye, RefreshCw, Award, X, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { uploadCertificate, deleteCertificate as deleteFromStorage } from '../utils/supabase/storage';

import { User, FileItem } from '../types';

interface CertificatesProps {
  onNavigate: (page: 'dashboard' | 'projects' | 'certificates' | 'resume' | 'portfolio' | 'profile') => void;
  onLogout: () => void;
  currentUser: User | null;
  certificates: FileItem[];
  setCertificates: React.Dispatch<React.SetStateAction<FileItem[]>>;
}

interface Certificate {
  title: string;
  issuer: string;
  date: string;
  type: string;
}

export default function Certificates({ onNavigate, onLogout, currentUser, certificates: dashboardCertificates, setCertificates }: CertificatesProps) {
  const [selectedCert, setSelectedCert] = useState<string | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadType, setUploadType] = useState<'file' | 'link'>('file');
  const [certificateLink, setCertificateLink] = useState('');
  const [certificateTitle, setCertificateTitle] = useState('');
  const [certificateIssuer, setCertificateIssuer] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file');
        return;
      }
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
    const file = e.dataTransfer.files?.[0];
    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file');
        setIsDragging(false);
        return;
      }
      setUploadedFile(file);
    }
    setIsDragging(false);
  };

  const handleUpload = async () => {
    if (uploadType === 'file') {
      if (!uploadedFile) {
        toast.error('Please select a file to upload');
        return;
      }

      if (!currentUser?.email) {
        toast.error('User email not found');
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);

      try {
        // Start progress animation
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => Math.min(prev + 10, 90));
        }, 100);

        // Upload to Supabase Storage
        const { url, path } = await uploadCertificate(uploadedFile, currentUser.email);

        clearInterval(progressInterval);
        setUploadProgress(100);

        // Add certificate to dashboard
        const newCertificate: FileItem = {
          id: Date.now().toString(),
          name: uploadedFile.name.replace(/\.[^/.]+$/, ''), // Remove file extension
          type: 'Certificate',
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          size: `${(uploadedFile.size / 1024 / 1024).toFixed(2)} MB`,
          uploadType: 'file',
          url: url, // Supabase public URL
          studentEmail: path, // Store path for deletion
          // Add database-compatible fields
          title: uploadedFile.name.replace(/\.[^/.]+$/, ''),
          issuer: currentUser?.name || 'Self',
          image_url: url,
          issue_date: new Date().toISOString().split('T')[0]
        };

        setCertificates([newCertificate, ...dashboardCertificates]);

        toast.success('Certificate uploaded successfully!');
        setIsUploading(false);
        setUploadProgress(0);
        setUploadedFile(null);
        setUploadDialogOpen(false);
      } catch (error) {
        console.error('Upload error:', error);
        toast.error('Failed to upload certificate. Please try again.');
        setIsUploading(false);
        setUploadProgress(0);
      }
    } else {
      // Handle link upload
      if (!certificateLink || !certificateTitle || !certificateIssuer) {
        toast.error('Please fill in all fields');
        return;
      }

      const newCertificate: FileItem = {
        id: Date.now().toString(),
        name: certificateTitle,
        type: 'Certificate',
        issuer: certificateIssuer,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        certificateLink: certificateLink,
        uploadType: 'link',
        // Add database-compatible fields
        title: certificateTitle,
        credential_url: certificateLink,
        issue_date: new Date().toISOString().split('T')[0]
      };

      setCertificates([newCertificate, ...dashboardCertificates]);
      toast.success('Certificate link added successfully!');
      setCertificateLink('');
      setCertificateTitle('');
      setCertificateIssuer('');
      setUploadDialogOpen(false);
    }
  };

  const triggerFileInput = () => {
    document.getElementById('cert-file-input')?.click();
  };

  const deleteCertificate = async (certId: string) => {
    const cert = dashboardCertificates.find(c => c.id === certId);
    
    // Delete from Supabase Storage if it's a file
    if (cert?.uploadType === 'file' && cert.studentEmail) {
      try {
        await deleteFromStorage(cert.studentEmail);
      } catch (error) {
        console.error('Error deleting from storage:', error);
        // Continue with deletion even if storage deletion fails
      }
    }
    
    const updatedCerts = dashboardCertificates.filter(cert => cert.id !== certId);
    setCertificates(updatedCerts);
    toast.success('Certificate deleted successfully!');
  };

  return (
    <>
      <Sidebar currentPage="certificates" onNavigate={onNavigate} onLogout={onLogout} />
      
      <main className="flex-1 overflow-auto bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-gray-900">Certificates</h1>
              <p className="text-gray-600 mt-1">Store and showcase your achievements</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Certificate
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload Certificate</DialogTitle>
                  <DialogDescription>
                    Upload a PDF file or add a certificate link.
                  </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="file" onValueChange={(value) => setUploadType(value as 'file' | 'link')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="file">Upload PDF</TabsTrigger>
                    <TabsTrigger value="link">Add Link</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="file" className="py-4">
                    <div
                      className={`border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors cursor-pointer ${isDragging ? 'border-blue-400' : ''}`}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    >
                      <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 mb-1">Drag and drop your certificate here</p>
                      <p className="text-gray-500 mb-4">or</p>
                      <input
                        type="file"
                        id="cert-file-input"
                        className="hidden"
                        onChange={handleFileChange}
                        accept="application/pdf"
                      />
                      <Button
                        variant="outline"
                        onClick={triggerFileInput}
                      >
                        Browse Files
                      </Button>
                      <p className="text-gray-500 mt-4">Supported format: PDF</p>
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
                  </TabsContent>
                  
                  <TabsContent value="link" className="py-4 space-y-4">
                    <div>
                      <Label htmlFor="cert-title">Certificate Title *</Label>
                      <Input
                        id="cert-title"
                        placeholder="e.g., AWS Certified Developer"
                        value={certificateTitle}
                        onChange={(e) => setCertificateTitle(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cert-issuer">Issuing Organization *</Label>
                      <Input
                        id="cert-issuer"
                        placeholder="e.g., Amazon Web Services"
                        value={certificateIssuer}
                        onChange={(e) => setCertificateIssuer(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cert-link">Certificate Link *</Label>
                      <Input
                        id="cert-link"
                        type="url"
                        placeholder="https://example.com/certificate"
                        value={certificateLink}
                        onChange={(e) => setCertificateLink(e.target.value)}
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">Enter the URL to your certificate</p>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="flex justify-end mt-4 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setUploadDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleUpload}
                    disabled={isUploading || (uploadType === 'file' && !uploadedFile)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {uploadType === 'file' ? 'Upload' : 'Add Link'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <div className="p-8">
          {/* Certificates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardCertificates.map((cert, index) => (
              <Card key={index} className="overflow-hidden border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                {/* Certificate Preview */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 flex items-center justify-center h-48 border-b-4 border-blue-600">
                  <Award className="w-16 h-16 text-blue-600" />
                </div>
                
                {/* Certificate Details */}
                <div className="p-6">
                  <h3 className="text-gray-900 mb-2">{cert.name}</h3>
                  <p className="text-gray-600 mb-1">Issuer: {cert.issuer || cert.type}</p>
                  <p className="text-gray-500 mb-3">Date: {cert.date}</p>
                  <span className="inline-block px-2 py-1 bg-blue-50 text-blue-600 rounded mb-4">
                    {cert.uploadType === 'link' ? 'Link' : 'PDF'}
                  </span>
                  
                  <div className="flex gap-2">
                    {cert.certificateLink ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => window.open(cert.certificateLink, '_blank')}
                      >
                        <LinkIcon className="w-4 h-4 mr-1" />
                        Open Link
                      </Button>
                    ) : cert.url ? (
                      // PDF file with URL - show view, download, and open options
                      <>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="flex-1" onClick={() => setSelectedCert(cert.name)}>
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-5xl max-h-[90vh]">
                            <DialogHeader>
                              <DialogTitle>{cert.name}</DialogTitle>
                              <DialogDescription>
                                Certificate PDF Viewer
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              {/* PDF Viewer */}
                              <div className="border rounded-lg overflow-hidden" style={{ height: '70vh' }}>
                                <iframe
                                  src={cert.url}
                                  className="w-full h-full"
                                  title={cert.name}
                                />
                              </div>
                              {/* Action Buttons */}
                              <div className="flex gap-2 justify-end">
                                <Button
                                  variant="outline"
                                  onClick={() => window.open(cert.url, '_blank')}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  Open in New Tab
                                </Button>
                                <Button
                                  className="bg-blue-600 hover:bg-blue-700"
                                  onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = cert.url!;
                                    link.download = `${cert.name}.pdf`;
                                    link.click();
                                    toast.success('Certificate downloaded!');
                                  }}
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Download
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </>
                    ) : (
                      // No URL available - show placeholder
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => setSelectedCert(cert.name)}>
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>{cert.name}</DialogTitle>
                            <DialogDescription>
                              Certificate preview and details.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-12 rounded-lg flex items-center justify-center min-h-96 border-4 border-blue-600">
                            <div className="text-center">
                              <Award className="w-24 h-24 text-blue-600 mx-auto mb-4" />
                              <h2 className="text-gray-900 mb-2">{cert.name}</h2>
                              <p className="text-gray-700">Issued by {cert.issuer || cert.type}</p>
                              <p className="text-gray-600 mb-4">{cert.date}</p>
                              {cert.size && (
                                <p className="text-gray-500 mb-4">Size: {cert.size}</p>
                              )}
                              <div className="mt-6">
                                <p className="text-gray-600 mb-3">Certificate file stored successfully</p>
                                <Button 
                                  className="bg-blue-600 hover:bg-blue-700"
                                  onClick={() => {
                                    toast.info('File download feature will be available once cloud storage is configured');
                                  }}
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Download Certificate
                                </Button>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:border-red-600"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this certificate?')) {
                          deleteCertificate(cert.id);
                        }
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}