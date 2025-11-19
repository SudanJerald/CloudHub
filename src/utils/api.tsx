import { projectId, publicAnonKey } from './supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-0b71ff0c`;

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${publicAnonKey}`
};

// ==================== AUTH API ====================

export const generateOTP = async (email: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/generate-otp`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to generate OTP');
    }
    
    return data;
  } catch (error) {
    console.error('Error generating OTP:', error);
    throw error;
  }
};

export const verifyOTP = async (email: string, otp: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email, otp })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to verify OTP');
    }
    
    return data;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

export const checkEmailAvailability = async (email: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/check-email`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to check email');
    }
    
    return data;
  } catch (error) {
    console.error('Error checking email:', error);
    throw error;
  }
};

export const checkRollNoAvailability = async (rollNo: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/check-rollno`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ rollNo })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to check roll number');
    }
    
    return data;
  } catch (error) {
    console.error('Error checking roll number:', error);
    throw error;
  }
};

export const signup = async (signupData: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers,
      body: JSON.stringify(signupData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create account');
    }
    
    return data;
  } catch (error) {
    console.error('Error during signup:', error);
    throw error;
  }
};

export const login = async (email: string, password: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to login');
    }
    
    return data;
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
};

// ==================== USER API ====================

export const saveUser = async (userData: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user`, {
      method: 'POST',
      headers,
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to save user data');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error saving user:', error);
    throw error;
  }
};

export const getUser = async (email: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/${email}`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok && response.status !== 404) {
      throw new Error('Failed to fetch user data');
    }
    
    if (response.status === 404) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

// ==================== PROJECTS API ====================

export const saveProjects = async (email: string, projects: any[]) => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${email}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(projects)
    });
    
    if (!response.ok) {
      throw new Error('Failed to save projects');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error saving projects:', error);
    throw error;
  }
};

export const getProjects = async (email: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/${email}`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch projects');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
};

// ==================== CERTIFICATES API ====================

export const saveCertificates = async (email: string, certificates: any[]) => {
  try {
    const response = await fetch(`${API_BASE_URL}/certificates/${email}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(certificates)
    });
    
    if (!response.ok) {
      throw new Error('Failed to save certificates');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error saving certificates:', error);
    throw error;
  }
};

export const getCertificates = async (email: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/certificates/${email}`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch certificates');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching certificates:', error);
    throw error;
  }
};

// ==================== NOTES API ====================

export const saveNotes = async (email: string, notes: any[]) => {
  try {
    const response = await fetch(`${API_BASE_URL}/notes/${email}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(notes)
    });
    
    if (!response.ok) {
      throw new Error('Failed to save notes');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error saving notes:', error);
    throw error;
  }
};

export const getNotes = async (email: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/notes/${email}`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch notes');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching notes:', error);
    throw error;
  }
};

// ==================== RESUMES API ====================

export const saveResumes = async (email: string, resumes: any[]) => {
  try {
    const response = await fetch(`${API_BASE_URL}/resumes/${email}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(resumes)
    });
    
    if (!response.ok) {
      throw new Error('Failed to save resumes');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error saving resumes:', error);
    throw error;
  }
};

export const getResumes = async (email: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/resumes/${email}`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch resumes');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching resumes:', error);
    throw error;
  }
};

// ==================== PORTFOLIO API ====================

export const savePortfolio = async (email: string, portfolio: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}/portfolio/${email}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(portfolio)
    });
    
    if (!response.ok) {
      throw new Error('Failed to save portfolio');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error saving portfolio:', error);
    throw error;
  }
};

export const getPortfolio = async (email: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/portfolio/${email}`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch portfolio');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    throw error;
  }
};

// ==================== PROFILE API ====================

export const saveProfile = async (email: string, profile: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}/profile/${email}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(profile)
    });
    
    if (!response.ok) {
      throw new Error('Failed to save profile');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error saving profile:', error);
    throw error;
  }
};

export const getProfile = async (email: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/profile/${email}`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};

// ==================== BULK DATA API ====================

export const getAllUserData = async (email: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user-data/${email}`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching all user data:', error);
    throw error;
  }
};

// ==================== TEACHER API ====================

export const getAllStudents = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/teacher/students`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch students');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching students:', error);
    throw error;
  }
};

export const getStudentFiles = async (studentEmail: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/teacher/student-files/${studentEmail}`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch student files');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching student files:', error);
    throw error;
  }
};

// ==================== ADMIN API ====================

export const getPendingUsers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/pending-users`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch pending users');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching pending users:', error);
    throw error;
  }
};

export const updateAccountStatus = async (userId: string, status: 'pending' | 'approved' | 'rejected') => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/update-status`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ userId, status })
    });
    
    if (!response.ok) {
      throw new Error('Failed to update account status');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating account status:', error);
    throw error;
  }
};

export const deleteUser = async (email: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/delete-user`, {
      method: 'DELETE',
      headers,
      body: JSON.stringify({ email })
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete user');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// ==================== FILE STORAGE API ====================

export const uploadFile = async (file: File, type: 'project' | 'certificate' | 'note' | 'resume', email: string) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('email', email);

    const response = await fetch(`${API_BASE_URL}/storage/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload file');
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const deleteFile = async (filePath: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/storage/delete`, {
      method: 'DELETE',
      headers,
      body: JSON.stringify({ filePath })
    });

    if (!response.ok) {
      throw new Error('Failed to delete file');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

export const getFileUrl = async (filePath: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/storage/url`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ filePath })
    });

    if (!response.ok) {
      throw new Error('Failed to get file URL');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting file URL:', error);
    throw error;
  }
};
