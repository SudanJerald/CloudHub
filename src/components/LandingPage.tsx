import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Upload, Award, FileText, FileBadge, Share2, Eye, EyeOff } from 'lucide-react';
import graduationCapLogo from 'figma:asset/808b2e7a8b6ef2e920ef00fae9c984ca60b949d9.png';
import FeatureCard from './FeatureCard';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useState } from 'react';
import { toast } from 'sonner';
import * as api from '../utils/api';
import { User } from '../types';

interface LandingPageProps {
  onLogin: (user: User) => void;
  onNavigateToSignup: () => void;
}

export default function LandingPage({ onLogin, onNavigateToSignup }: LandingPageProps) {
  const [loginOpen, setLoginOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const handleLogin = async () => {
    console.log('[LandingPage] handleLogin called');
    
    // Validate input fields
    if (!loginEmail || !loginPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(loginEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoggingIn(true);
    console.log('[LandingPage] Starting login process...');

    try {
      console.log('[LandingPage] Calling API login...');
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Login timeout - please check your connection')), 10000)
      );
      
      const response: any = await Promise.race([
        api.login(loginEmail, loginPassword),
        timeoutPromise
      ]);
      
      console.log('[LandingPage] API response:', response);
      
      if (!response.user) {
        throw new Error('Invalid response from server');
      }
      
      console.log('[LandingPage] Closing dialog...');
      setLoginOpen(false);
      
      toast.success('Login successful!');
      
      // Clear login form
      setLoginEmail('');
      setLoginPassword('');
      
      // Call onLogin immediately (no delay needed)
      console.log('[LandingPage] Calling onLogin with user:', response.user);
      onLogin(response.user);
      
    } catch (error: any) {
      console.error('[LandingPage] Login error:', error);
      toast.error(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoggingIn(false);
      console.log('[LandingPage] Login process finished');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src={graduationCapLogo} alt="CloudHub Logo" className="w-12 h-12" />
            <span className="text-gray-900">CloudHub</span>
          </div>
          <div className="flex items-center gap-3">
            {/* TEST BUTTON - Remove in production */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                console.log('[TEST] Direct login bypass clicked');
                onLogin({
                  id: 'test-id',
                  name: 'Test Student',
                  email: 'test@gmail.com',
                  rollNo: 'TEST001',
                  role: 'student',
                  accountStatus: 'approved',
                  department: 'Computer Science',
                  yearSemester: '3rd Year'
                });
              }}
              className="text-xs opacity-50 hover:opacity-100"
            >
              Quick Test
            </Button>
            
            <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Login</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Login to CloudHub</DialogTitle>
                  <DialogDescription>
                    Enter your email and password to access your account.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your.email@gmail.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                    />
                  </div>
                  <div>
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={handleLogin}
                    disabled={isLoggingIn}
                  >
                    {isLoggingIn ? 'Logging in...' : 'Login'}
                  </Button>
                  <p className="text-center text-gray-600 text-sm">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setLoginOpen(false);
                        onNavigateToSignup();
                      }}
                      className="text-blue-600 hover:underline"
                    >
                      Sign up here
                    </button>
                  </p>
                </div>
              </DialogContent>
            </Dialog>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={onNavigateToSignup}
            >
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="min-h-[50vh] flex items-center justify-center px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex flex-col items-center justify-center mb-6">
            <img src={graduationCapLogo} alt="CloudHub Logo" className="w-20 h-20 mb-4" />
            <h1 className="text-gray-900 text-5xl">
              CloudHub – Your Academic Cloud Portfolio
            </h1>
          </div>
          <p className="text-gray-600 mb-8">
            Store. Organize. Access. Showcase.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button 
              className="bg-blue-600 hover:bg-blue-700" 
              onClick={onNavigateToSignup}
            >
              Create Account
            </Button>
            <Button variant="outline" onClick={() => {
              const featuresSection = document.getElementById('features');
              featuresSection?.scrollIntoView({ behavior: 'smooth' });
            }}>
              Explore Features
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Upload className="w-6 h-6" />}
            title="Upload Projects"
            description="Easily upload and organize all your academic projects in one secure place."
          />
          <FeatureCard
            icon={<Award className="w-6 h-6" />}
            title="Store Certificates"
            description="Keep all your certificates and achievements organized and accessible."
          />
          <FeatureCard
            icon={<FileText className="w-6 h-6" />}
            title="Manage Notes"
            description="Upload and categorize your academic notes by subject and semester."
          />
          <FeatureCard
            icon={<FileBadge className="w-6 h-6" />}
            title="Resume Builder"
            description="Create and maintain multiple versions of your resume."
          />
          <FeatureCard
            icon={<Share2 className="w-6 h-6" />}
            title="Portfolio Showcase"
            description="Build a beautiful portfolio website to showcase your academic achievements."
          />
          <FeatureCard
            icon={<Upload className="w-6 h-6" />}
            title="Cloud Storage"
            description="Access your files anytime, anywhere with secure cloud storage."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-16 py-8 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-600">
          <p>© 2024 CloudHub. Built for students, by students.</p>
        </div>
      </footer>
    </div>
  );
}
