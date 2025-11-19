import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { CloudUpload, Mail, Lock, User, Hash, BookOpen, Calendar, CheckCircle2, XCircle, ArrowLeft, Eye, EyeOff, Users } from 'lucide-react';
import { toast } from 'sonner';
import * as api from '../utils/api';
import { User as UserType } from '../types';

interface SignupProps {
  onSignupSuccess: (user: UserType) => void;
  onBackToLogin: () => void;
}

interface FormData {
  fullName: string;
  email: string;
  rollNo: string;
  department: string;
  yearSemester: string;
  password: string;
  confirmPassword: string;
  role: 'student' | 'teacher';
  designation?: string; // For teachers
}

interface ValidationErrors {
  fullName?: string;
  email?: string;
  rollNo?: string;
  department?: string;
  yearSemester?: string;
  password?: string;
  confirmPassword?: string;
  designation?: string;
}

export default function Signup({ onSignupSuccess, onBackToLogin }: SignupProps) {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    rollNo: '',
    department: '',
    yearSemester: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    designation: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const departments = [
    'Computer Science & Engineering',
    'Information Technology',
    'Electronics & Communication',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical Engineering',
    'Chemical Engineering',
    'Biotechnology',
    'Other'
  ];

  const years = [
    '1st Year / 1st & 2nd Semester',
    '2nd Year / 3rd & 4th Semester',
    '3rd Year / 5th & 6th Semester',
    '4th Year / 7th & 8th Semester',
    'Final Year / 9th & 10th Semester'
  ];

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validateFullName = (): boolean => {
    const name = formData.fullName.trim();
    if (!name) {
      setErrors(prev => ({ ...prev, fullName: 'Full name is required' }));
      return false;
    }
    if (name.length < 3) {
      setErrors(prev => ({ ...prev, fullName: 'Name must be at least 3 characters' }));
      return false;
    }
    if (!/^[a-zA-Z\s]+$/.test(name)) {
      setErrors(prev => ({ ...prev, fullName: 'Name can only contain letters and spaces' }));
      return false;
    }
    return true;
  };

  const validateEmail = (): boolean => {
    const email = formData.email.trim().toLowerCase();
    if (!email) {
      setErrors(prev => ({ ...prev, email: 'Email is required' }));
      return false;
    }
    
    // Check if it's a valid email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      return false;
    }
    
    return true;
  };

  const validateRollNo = (): boolean => {
    // Skip roll number validation for teachers
    if (formData.role === 'teacher') {
      return true;
    }
    
    const rollNo = formData.rollNo.trim().toUpperCase();
    if (!rollNo) {
      setErrors(prev => ({ ...prev, rollNo: 'Roll number is required' }));
      return false;
    }
    if (rollNo.length < 4) {
      setErrors(prev => ({ ...prev, rollNo: 'Roll number must be at least 4 characters' }));
      return false;
    }
    if (!/^[A-Z0-9]+$/.test(rollNo)) {
      setErrors(prev => ({ ...prev, rollNo: 'Roll number can only contain letters and numbers' }));
      return false;
    }
    return true;
  };

  const validateDesignation = (): boolean => {
    // Skip designation validation for students
    if (formData.role === 'student') {
      return true;
    }
    
    const designation = formData.designation?.trim();
    if (!designation) {
      setErrors(prev => ({ ...prev, designation: 'Designation is required for teachers' }));
      return false;
    }
    if (designation.length < 2) {
      setErrors(prev => ({ ...prev, designation: 'Designation must be at least 2 characters' }));
      return false;
    }
    return true;
  };

  const validatePassword = (): boolean => {
    const password = formData.password;
    
    if (!password) {
      setErrors(prev => ({ ...prev, password: 'Password is required' }));
      return false;
    }
    
    if (password.length < 8) {
      setErrors(prev => ({ ...prev, password: 'Password must be at least 8 characters long' }));
      return false;
    }
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (!hasUpperCase) {
      setErrors(prev => ({ ...prev, password: 'Password must contain at least one uppercase letter' }));
      return false;
    }
    if (!hasLowerCase) {
      setErrors(prev => ({ ...prev, password: 'Password must contain at least one lowercase letter' }));
      return false;
    }
    if (!hasNumber) {
      setErrors(prev => ({ ...prev, password: 'Password must contain at least one number' }));
      return false;
    }
    if (!hasSpecialChar) {
      setErrors(prev => ({ ...prev, password: 'Password must contain at least one special character (!@#$%^&*...)' }));
      return false;
    }
    
    return true;
  };

  const validateConfirmPassword = (): boolean => {
    if (!formData.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Please confirm your password' }));
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      return false;
    }
    return true;
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    
    if (strength <= 2) return { strength: 25, label: 'Weak', color: 'bg-red-500' };
    if (strength === 3) return { strength: 50, label: 'Fair', color: 'bg-yellow-500' };
    if (strength === 4) return { strength: 75, label: 'Good', color: 'bg-blue-500' };
    return { strength: 100, label: 'Strong', color: 'bg-green-500' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear all errors
    setErrors({});
    
    // Validate all fields
    const isNameValid = validateFullName();
    const isEmailValid = validateEmail();
    const isRollNoValid = validateRollNo(); // Skips for teachers
    const isDesignationValid = validateDesignation(); // Skips for students
    const isDepartmentValid = !!formData.department;
    const isYearValid = !!formData.yearSemester;
    const isPasswordValid = validatePassword();
    const isConfirmPasswordValid = validateConfirmPassword();
    
    if (!isDepartmentValid) {
      setErrors(prev => ({ ...prev, department: 'Please select your department' }));
    }
    if (!isYearValid) {
      setErrors(prev => ({ ...prev, yearSemester: 'Please select your year/semester' }));
    }
    
    if (!isNameValid || !isEmailValid || !isRollNoValid || !isDesignationValid || !isDepartmentValid || !isYearValid || !isPasswordValid || !isConfirmPasswordValid) {
      toast.error('Please fix all errors before submitting');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Add timeout wrapper for all API calls
      const withTimeout = (promise: Promise<any>, timeoutMs = 10000) => {
        return Promise.race([
          promise,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout - please check your connection')), timeoutMs)
          )
        ]);
      };
      
      // Check if email already exists
      const emailCheck: any = await withTimeout(api.checkEmailAvailability(formData.email));
      if (emailCheck.exists) {
        setErrors(prev => ({ ...prev, email: 'This email is already registered. Please login instead.' }));
        toast.error('Email already exists');
        setIsSubmitting(false);
        return;
      }
      
      // Check roll number availability (only for students)
      if (formData.role === 'student') {
        const rollNoCheck: any = await withTimeout(api.checkRollNoAvailability(formData.rollNo.toUpperCase()));
        if (rollNoCheck.exists) {
          setErrors(prev => ({ ...prev, rollNo: 'This roll number is already registered' }));
          toast.error('Roll number already exists');
          setIsSubmitting(false);
          return;
        }
      }
      
      // Submit signup
      const response: any = await withTimeout(api.signup({
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        rollNo: formData.role === 'student' ? formData.rollNo.trim().toUpperCase() : 'N/A',
        department: formData.department,
        yearSemester: formData.yearSemester,
        password: formData.password,
        role: formData.role,
        designation: formData.role === 'teacher' ? formData.designation?.trim() : undefined,
        accountStatus: 'pending' // All new accounts need admin approval
      }));
      
      toast.success('Account created! Awaiting admin approval.');
      
      // Call success callback with complete user data (including pending status)
      console.log('[Signup] Calling onSignupSuccess with user data');
      const userData: UserType = {
        id: response.user?.email || formData.email, // Use email as fallback ID
        name: formData.fullName,
        email: formData.email,
        rollNo: formData.role === 'student' ? formData.rollNo.toUpperCase() : 'N/A',
        role: formData.role,
        department: formData.department,
        yearSemester: formData.yearSemester,
        designation: formData.designation?.trim(),
        accountStatus: 'pending' // Mark as pending for approval
      };
      console.log('[Signup] User data:', userData);
      onSignupSuccess(userData);
    } catch (error: any) {
      toast.error(error.message || 'Signup failed. Please try again.');
      console.error('Signup error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8 shadow-lg">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={onBackToLogin}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-600 p-3 rounded-xl">
              <CloudUpload className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-gray-900">Create Account</h1>
              <p className="text-gray-600 text-sm">Join CloudHub with your academic credentials</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role Selection */}
          <div>
            <Label className="text-gray-700 mb-3 block">
              I am a <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleInputChange('role', 'student')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  formData.role === 'student'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <User className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <p className="font-semibold text-gray-900">Student</p>
                <p className="text-xs text-gray-600">Upload and manage academic work</p>
              </button>
              <button
                type="button"
                onClick={() => handleInputChange('role', 'teacher')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  formData.role === 'teacher'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <p className="font-semibold text-gray-900">Teacher</p>
                <p className="text-xs text-gray-600">View and manage student portfolios</p>
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <Label htmlFor="fullName" className="text-gray-700">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                onBlur={validateFullName}
                className={`pl-10 ${errors.fullName ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.fullName && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <XCircle className="w-4 h-4" />
                {errors.fullName}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email" className="text-gray-700">
              Email <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="your.email@gmail.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onBlur={validateEmail}
                className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <XCircle className="w-4 h-4" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Roll Number - Only for Students */}
          {formData.role === 'student' && (
            <div>
              <Label htmlFor="rollNo" className="text-gray-700">
                Roll Number <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="rollNo"
                  type="text"
                  placeholder="e.g., CS2021042"
                  value={formData.rollNo}
                  onChange={(e) => handleInputChange('rollNo', e.target.value.toUpperCase())}
                  onBlur={validateRollNo}
                  className={`pl-10 ${errors.rollNo ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.rollNo && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <XCircle className="w-4 h-4" />
                  {errors.rollNo}
                </p>
              )}
            </div>
          )}

          {/* Designation - Only for Teachers */}
          {formData.role === 'teacher' && (
            <div>
              <Label htmlFor="designation" className="text-gray-700">
                Designation <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="designation"
                  type="text"
                  placeholder="e.g., Assistant Professor, Professor"
                  value={formData.designation}
                  onChange={(e) => handleInputChange('designation', e.target.value)}
                  onBlur={validateDesignation}
                  className={`pl-10 ${errors.designation ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.designation && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <XCircle className="w-4 h-4" />
                  {errors.designation}
                </p>
              )}
            </div>
          )}

          {/* Department */}
          <div>
            <Label htmlFor="department" className="text-gray-700">
              Branch / Department <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <select
                id="department"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-md bg-white ${errors.department ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            {errors.department && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <XCircle className="w-4 h-4" />
                {errors.department}
              </p>
            )}
          </div>

          {/* Year/Semester */}
          <div>
            <Label htmlFor="yearSemester" className="text-gray-700">
              Year / Semester <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <select
                id="yearSemester"
                value={formData.yearSemester}
                onChange={(e) => handleInputChange('yearSemester', e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-md bg-white ${errors.yearSemester ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Select Year/Semester</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            {errors.yearSemester && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <XCircle className="w-4 h-4" />
                {errors.yearSemester}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password" className="text-gray-700">
              Password <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onBlur={validatePassword}
                className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Password Strength:</span>
                  <span className={`${
                    passwordStrength.label === 'Strong' ? 'text-green-600' :
                    passwordStrength.label === 'Good' ? 'text-blue-600' :
                    passwordStrength.label === 'Fair' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${passwordStrength.color}`}
                    style={{ width: `${passwordStrength.strength}%` }}
                  />
                </div>
              </div>
            )}
            {errors.password && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <XCircle className="w-4 h-4" />
                {errors.password}
              </p>
            )}
            {!errors.password && formData.password && (
              <p className="text-gray-500 text-sm mt-1">
                Must contain: uppercase, lowercase, number, and special character
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <Label htmlFor="confirmPassword" className="text-gray-700">
              Confirm Password <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                onBlur={validateConfirmPassword}
                className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <XCircle className="w-4 h-4" />
                {errors.confirmPassword}
              </p>
            )}
            {!errors.confirmPassword && formData.confirmPassword && formData.password === formData.confirmPassword && (
              <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Passwords match
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Already have an account?{' '}
            <button
              onClick={onBackToLogin}
              className="text-blue-600 hover:underline"
            >
              Login here
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
}
