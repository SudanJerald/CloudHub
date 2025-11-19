import { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import Projects from './components/Projects';
import Certificates from './components/Certificates';
import Resume from './components/Resume';
import Portfolio from './components/Portfolio';
import Profile from './components/Profile';
import TeacherDashboard from './components/TeacherDashboard';
import AdminDashboard from './components/AdminDashboard';
import PendingApproval from './components/PendingApproval';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import * as api from './utils/api';
import { User } from './types';

export interface FileItem {
  id: string;
  name: string;
  type: string;
  date: string;
  size?: string;
  version?: string;
  url?: string;
}

type PageType = 'landing' | 'signup' | 'dashboard' | 'projects' | 'certificates' | 'resume' | 'portfolio' | 'profile' | 'teacherDashboard' | 'adminDashboard' | 'pendingApproval';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('landing');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // TEST MODE: Set to true to bypass API and test navigation
  const TEST_MODE = false;
  
  // File storage state
  const [projects, setProjects] = useState<FileItem[]>([]);
  const [certificates, setCertificates] = useState<FileItem[]>([]);
  const [resumes, setResumes] = useState<FileItem[]>([]);

  // Load user data on login
  const handleLogin = async (user: User) => {
    console.log('[LOGIN] ==== START LOGIN ====');
    console.log('[LOGIN] User:', user);
    console.log('[LOGIN] Account Status:', user.accountStatus);
    console.log('[LOGIN] TEST_MODE:', TEST_MODE);
    
    // Set user state immediately
    setCurrentUser(user);
    setIsLoggedIn(true);
    
    // Route based on account status and role
    if (user.accountStatus === 'pending') {
      setCurrentPage('pendingApproval');
      console.log('[LOGIN] Account pending approval - showing pending page');
      return;
    } else if (user.accountStatus === 'rejected') {
      toast.error('Your account has been rejected by admin. Please contact support.');
      handleLogout();
      return;
    } else if (user.role === 'admin') {
      setCurrentPage('adminDashboard');
      console.log('[LOGIN] Admin user - showing admin dashboard');
    } else if (user.role === 'teacher') {
      setCurrentPage('teacherDashboard');
      console.log('[LOGIN] Teacher user - showing teacher dashboard');
    } else {
      setCurrentPage('dashboard');
      console.log('[LOGIN] Student user - showing student dashboard');
    }
    
    if (TEST_MODE) {
      console.log('[LOGIN] TEST MODE - Skipping API calls');
      toast.success('Login successful! (Test Mode)');
      return;
    }
    
    // Load data in background (don't block UI)
    (async () => {
      try {
        // Load all user data from database
        console.log('[LOGIN] Fetching user data from database...');
        const userData = await api.getAllUserData(user.email);
        console.log('[LOGIN] User data fetched:', userData);
        
        if (userData) {
          setProjects(userData.projects || []);
          setCertificates(userData.certificates || []);
          setResumes(userData.resumes || []);
          console.log('[LOGIN] User data loaded successfully');
        }
        
        // Save user info to database
        console.log('[LOGIN] Saving user info...');
        await api.saveUser(user);
        console.log('[LOGIN] User info saved');
      } catch (error) {
        console.error('[LOGIN] ERROR loading user data:', error);
      }
    })();
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    setCurrentPage('landing');
    // Clear data on logout
    setProjects([]);
    setCertificates([]);
    setResumes([]);
  };

  const navigateTo = (page: 'dashboard' | 'projects' | 'certificates' | 'resume' | 'portfolio' | 'profile') => {
    setCurrentPage(page);
  };

  // Auto-save projects whenever they change
  useEffect(() => {
    if (currentUser && projects.length >= 0) {
      const saveData = async () => {
        try {
          await api.saveProjects(currentUser.email, projects);
        } catch (error) {
          console.error('Error auto-saving projects:', error);
        }
      };
      
      // Debounce the save operation
      const timeoutId = setTimeout(saveData, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [projects, currentUser]);

  // Auto-save certificates whenever they change
  useEffect(() => {
    if (currentUser && certificates.length >= 0) {
      const saveData = async () => {
        try {
          await api.saveCertificates(currentUser.email, certificates);
        } catch (error) {
          console.error('Error auto-saving certificates:', error);
        }
      };
      
      const timeoutId = setTimeout(saveData, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [certificates, currentUser]);



  // Auto-save resumes whenever they change
  useEffect(() => {
    if (currentUser && resumes.length >= 0) {
      const saveData = async () => {
        try {
          await api.saveResumes(currentUser.email, resumes);
        } catch (error) {
          console.error('Error auto-saving resumes:', error);
        }
      };
      
      const timeoutId = setTimeout(saveData, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [resumes, currentUser]);

  console.log('[RENDER] currentPage:', currentPage, 'isLoggedIn:', isLoggedIn, 'isLoading:', isLoading);

  if (!isLoggedIn && currentPage === 'landing') {
    console.log('[RENDER] Showing landing page (not logged in)');
    return <LandingPage onLogin={handleLogin} onNavigateToSignup={() => setCurrentPage('signup')} />;
  }

  if (currentPage === 'signup') {
    console.log('[RENDER] Showing signup page');
    return (
      <Signup
        onSignupSuccess={handleLogin}
        onBackToLogin={() => setCurrentPage('landing')}
      />
    );
  }

  if (isLoading) {
    console.log('[RENDER] Showing loading spinner');
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your data...</p>
        </div>
      </div>
    );
  }

  console.log('[RENDER] Main render - currentPage:', currentPage);

  return (
    <div className="min-h-screen bg-gray-50">
      {currentPage === 'landing' ? (
        <LandingPage onLogin={handleLogin} onNavigateToSignup={() => setCurrentPage('signup')} />
      ) : currentPage === 'pendingApproval' ? (
        <PendingApproval 
          email={currentUser?.email || ''} 
          role={currentUser?.role as 'student' | 'teacher'} 
          onLogout={handleLogout} 
        />
      ) : currentPage === 'adminDashboard' ? (
        <AdminDashboard onLogout={handleLogout} />
      ) : currentPage === 'teacherDashboard' ? (
        <TeacherDashboard onLogout={handleLogout} currentUser={currentUser} />
      ) : (
        <div className="flex">{/* Student pages with sidebar */}
          {currentPage === 'dashboard' && (
            <Dashboard 
              onNavigate={navigateTo} 
              onLogout={handleLogout} 
              currentUser={currentUser}
              projects={projects}
              certificates={certificates}
              resumes={resumes}
              setProjects={setProjects}
              setCertificates={setCertificates}
              setResumes={setResumes}
            />
          )}
          {currentPage === 'projects' && <Projects onNavigate={navigateTo} onLogout={handleLogout} currentUser={currentUser} projects={projects} setProjects={setProjects} />}
          {currentPage === 'certificates' && <Certificates onNavigate={navigateTo} onLogout={handleLogout} currentUser={currentUser} certificates={certificates} setCertificates={setCertificates} />}
          {currentPage === 'resume' && <Resume onNavigate={navigateTo} onLogout={handleLogout} currentUser={currentUser} resumes={resumes} setResumes={setResumes} />}
          {currentPage === 'portfolio' && <Portfolio onNavigate={navigateTo} onLogout={handleLogout} currentUser={currentUser} projects={projects} certificates={certificates} resumes={resumes} />}
          {currentPage === 'profile' && <Profile onNavigate={navigateTo} onLogout={handleLogout} currentUser={currentUser} />}
        </div>
      )}
      <Toaster />
    </div>
  );
}