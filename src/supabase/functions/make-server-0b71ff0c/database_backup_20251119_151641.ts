/* PostgreSQL Database Utility for CloudHub */

import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

// Create Supabase client with service role key for full database access
export const getSupabaseClient = () => {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
};

// ==================== USER OPERATIONS ====================

export const createUser = async (userData: any) => {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('users')
    .insert({
      full_name: userData.fullName,
      email: userData.email,
      password_hash: userData.password, // Will be hashed by database trigger
      roll_no: userData.rollNo,
      department: userData.department,
      year_semester: userData.yearSemester,
      role: userData.role,
      designation: userData.designation,
      account_status: userData.accountStatus || 'pending'
    })
    .select()
    .single();
  
  if (error) throw new Error(error.message);
  return data;
};

export const getUserByEmail = async (email: string) => {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .maybeSingle();
  
  if (error) throw new Error(error.message);
  return data;
};

export const getUserByRollNo = async (rollNo: string) => {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('roll_no', rollNo)
    .maybeSingle();
  
  if (error) throw new Error(error.message);
  return data;
};

export const getAllUsers = async () => {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw new Error(error.message);
  return data || [];
};

export const updateUserStatus = async (email: string, status: string) => {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('users')
    .update({ account_status: status })
    .eq('email', email)
    .select()
    .single();
  
  if (error) throw new Error(error.message);
  return data;
};

export const verifyPassword = async (email: string, password: string) => {
  const supabase = getSupabaseClient();
  
  // Use a database function to verify password (you'll need to create this)
  const { data, error } = await supabase
    .rpc('verify_user_password', { 
      user_email: email, 
      user_password: password 
    });
  
  if (error) throw new Error(error.message);
  return data;
};

// ==================== PROJECT OPERATIONS ====================

export const saveProjects = async (email: string, projects: any[]) => {
  const supabase = getSupabaseClient();
  
  // Get user ID from email
  const user = await getUserByEmail(email);
  if (!user) throw new Error('User not found');
  
  // Delete existing projects for this user
  await supabase.from('projects').delete().eq('user_id', user.id);
  
  // Insert new projects
  if (projects.length > 0) {
    const { error } = await supabase
      .from('projects')
      .insert(projects.map(p => ({ ...p, user_id: user.id })));
    
    if (error) throw new Error(error.message);
  }
};

export const getProjects = async (email: string) => {
  const supabase = getSupabaseClient();
  
  // Get user ID from email
  const user = await getUserByEmail(email);
  if (!user) return [];
  
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id);
  
  if (error) throw new Error(error.message);
  return data || [];
};

// ==================== CERTIFICATE OPERATIONS ====================

export const saveCertificates = async (email: string, certificates: any[]) => {
  const supabase = getSupabaseClient();
  
  const user = await getUserByEmail(email);
  if (!user) throw new Error('User not found');
  
  await supabase.from('certificates').delete().eq('user_id', user.id);
  
  if (certificates.length > 0) {
    const { error } = await supabase
      .from('certificates')
      .insert(certificates.map(c => ({ ...c, user_id: user.id })));
    
    if (error) throw new Error(error.message);
  }
};

export const getCertificates = async (email: string) => {
  const supabase = getSupabaseClient();
  
  const user = await getUserByEmail(email);
  if (!user) return [];
  
  const { data, error } = await supabase
    .from('certificates')
    .select('*')
    .eq('user_id', user.id);
  
  if (error) throw new Error(error.message);
  return data || [];
};

// ==================== NOTE OPERATIONS ====================

export const saveNotes = async (email: string, notes: any[]) => {
  const supabase = getSupabaseClient();
  
  const user = await getUserByEmail(email);
  if (!user) throw new Error('User not found');
  
  await supabase.from('notes').delete().eq('user_id', user.id);
  
  if (notes.length > 0) {
    const { error } = await supabase
      .from('notes')
      .insert(notes.map(n => ({ ...n, user_id: user.id })));
    
    if (error) throw new Error(error.message);
  }
};

export const getNotes = async (email: string) => {
  const supabase = getSupabaseClient();
  
  const user = await getUserByEmail(email);
  if (!user) return [];
  
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', user.id);
  
  if (error) throw new Error(error.message);
  return data || [];
};

// ==================== RESUME OPERATIONS ====================

export const saveResumes = async (email: string, resumes: any[]) => {
  const supabase = getSupabaseClient();
  
  const user = await getUserByEmail(email);
  if (!user) throw new Error('User not found');
  
  await supabase.from('resumes').delete().eq('user_id', user.id);
  
  if (resumes.length > 0) {
    const { error } = await supabase
      .from('resumes')
      .insert(resumes.map(r => ({ ...r, user_id: user.id })));
    
    if (error) throw new Error(error.message);
  }
};

export const getResumes = async (email: string) => {
  const supabase = getSupabaseClient();
  
  const user = await getUserByEmail(email);
  if (!user) return [];
  
  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('user_id', user.id);
  
  if (error) throw new Error(error.message);
  return data || [];
};

// ==================== PORTFOLIO OPERATIONS ====================

export const savePortfolio = async (email: string, portfolio: any) => {
  const supabase = getSupabaseClient();
  
  const user = await getUserByEmail(email);
  if (!user) throw new Error('User not found');
  
  const { error } = await supabase
    .from('portfolios')
    .upsert({ user_id: user.id, ...portfolio });
  
  if (error) throw new Error(error.message);
};

export const getPortfolio = async (email: string) => {
  const supabase = getSupabaseClient();
  
  const user = await getUserByEmail(email);
  if (!user) return null;
  
  const { data, error } = await supabase
    .from('portfolios')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();
  
  if (error) throw new Error(error.message);
  return data;
};

// ==================== PROFILE OPERATIONS ====================

export const saveProfile = async (email: string, profile: any) => {
  const supabase = getSupabaseClient();
  
  const user = await getUserByEmail(email);
  if (!user) throw new Error('User not found');
  
  const { error } = await supabase
    .from('profiles')
    .upsert({ user_id: user.id, ...profile });
  
  if (error) throw new Error(error.message);
};

export const getProfile = async (email: string) => {
  const supabase = getSupabaseClient();
  
  const user = await getUserByEmail(email);
  if (!user) return null;
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();
  
  if (error) throw new Error(error.message);
  return data;
};
