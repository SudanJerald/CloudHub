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
  
  // Hash password using PostgreSQL crypt function
  const { data: hashedPassword, error: hashError } = await supabase
    .rpc('hash_password', { password: userData.password });
  
  if (hashError) throw new Error('Failed to hash password: ' + hashError.message);
  
  const { data, error } = await supabase
    .from('users')
    .insert({
      full_name: userData.fullName,
      email: userData.email,
      password_hash: hashedPassword,
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

export const deleteUser = async (email: string) => {
  const supabase = getSupabaseClient();
  
  // First get the user to get their ID
  const user = await getUserByEmail(email);
  if (!user) {
    throw new Error('User not found');
  }
  
  // Delete all related data first (cascading delete via foreign keys should handle this)
  // But we'll do it explicitly to be safe
  const userId = user.id;
  
  await supabase.from('projects').delete().eq('user_id', userId);
  await supabase.from('certificates').delete().eq('user_id', userId);
  await supabase.from('notes').delete().eq('user_id', userId);
  await supabase.from('resumes').delete().eq('user_id', userId);
  await supabase.from('portfolios').delete().eq('user_id', userId);
  await supabase.from('profiles').delete().eq('user_id', userId);
  
  // Finally delete the user
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('email', email);
  
  if (error) throw new Error(error.message);
  return { success: true };
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
  
  // Insert new projects with proper column mapping
  if (projects.length > 0) {
    const mappedProjects = projects.map(p => ({
      user_id: user.id,
      title: p.title || p.name || '',
      description: p.description || '',
      technologies: p.technologies || [],
      github_url: p.githubUrl || p.github_url || null,
      live_url: p.liveUrl || p.live_url || null,
      image_url: p.imageUrl || p.image_url || null,
      start_date: p.startDate || p.start_date || null,
      end_date: p.endDate || p.end_date || null
    }));
    
    const { error } = await supabase
      .from('projects')
      .insert(mappedProjects);
    
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
  
  // Map database fields to frontend format
  return (data || []).map(p => ({
    ...p,
    // Keep both formats for compatibility
    githubUrl: p.github_url,
    liveUrl: p.live_url,
    imageUrl: p.image_url,
    startDate: p.start_date,
    endDate: p.end_date
  }));
};

// ==================== CERTIFICATE OPERATIONS ====================

export const saveCertificates = async (email: string, certificates: any[]) => {
  const supabase = getSupabaseClient();
  
  const user = await getUserByEmail(email);
  if (!user) throw new Error('User not found');
  
  await supabase.from('certificates').delete().eq('user_id', user.id);
  
  if (certificates.length > 0) {
    const mappedCertificates = certificates.map(c => ({
      user_id: user.id,
      title: c.title || c.name || '',
      issuer: c.issuer || c.organization || '',
      issue_date: c.issueDate || c.issue_date || c.date || null,
      credential_id: c.credentialId || c.credential_id || null,
      credential_url: c.credentialUrl || c.credential_url || c.url || null,
      image_url: c.imageUrl || c.image_url || null
    }));
    
    const { error } = await supabase
      .from('certificates')
      .insert(mappedCertificates);
    
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
  
  // Map database fields to frontend format
  return (data || []).map((c: any) => ({
    ...c,
    // Keep both formats for compatibility
    credentialId: c.credential_id,
    credentialUrl: c.credential_url,
    imageUrl: c.image_url,
    issueDate: c.issue_date
  }));
};

// ==================== NOTE OPERATIONS ====================

export const saveNotes = async (email: string, notes: any[]) => {
  const supabase = getSupabaseClient();
  
  const user = await getUserByEmail(email);
  if (!user) throw new Error('User not found');
  
  await supabase.from('notes').delete().eq('user_id', user.id);
  
  if (notes.length > 0) {
    const mappedNotes = notes.map(n => ({
      user_id: user.id,
      title: n.title || n.name || '',
      subject: n.subject || n.category || '',
      description: n.description || '',
      file_url: n.fileUrl || n.file_url || n.url || '',
      file_type: n.fileType || n.file_type || 'pdf'
    }));
    
    const { error } = await supabase
      .from('notes')
      .insert(mappedNotes);
    
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
  
  // Map database fields to frontend format
  return (data || []).map((n: any) => ({
    ...n,
    // Keep both formats for compatibility
    fileUrl: n.file_url,
    fileType: n.file_type
  }));
};

// ==================== RESUME OPERATIONS ====================

export const saveResumes = async (email: string, resumes: any[]) => {
  const supabase = getSupabaseClient();
  
  const user = await getUserByEmail(email);
  if (!user) throw new Error('User not found');
  
  await supabase.from('resumes').delete().eq('user_id', user.id);
  
  if (resumes.length > 0) {
    const mappedResumes = resumes.map(r => ({
      user_id: user.id,
      title: r.title || r.name || '',
      file_url: r.fileUrl || r.file_url || r.url || '',
      file_type: r.fileType || r.file_type || 'pdf',
      is_primary: r.isPrimary || r.is_primary || false
    }));
    
    const { error } = await supabase
      .from('resumes')
      .insert(mappedResumes);
    
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
  
  // Map database fields to frontend format
  return (data || []).map((r: any) => ({
    ...r,
    // Keep both formats for compatibility
    fileUrl: r.file_url,
    fileType: r.file_type,
    isPrimary: r.is_primary
  }));
};

// ==================== PORTFOLIO OPERATIONS ====================

export const savePortfolio = async (email: string, portfolio: any) => {
  const supabase = getSupabaseClient();
  
  const user = await getUserByEmail(email);
  if (!user) throw new Error('User not found');
  
  const mappedPortfolio = {
    user_id: user.id,
    bio: portfolio.bio || '',
    skills: portfolio.skills || [],
    social_links: portfolio.socialLinks || portfolio.social_links || {},
    theme_color: portfolio.themeColor || portfolio.theme_color || '#000000',
    is_public: portfolio.isPublic !== undefined ? portfolio.isPublic : (portfolio.is_public !== undefined ? portfolio.is_public : true)
  };
  
  const { error } = await supabase
    .from('portfolios')
    .upsert(mappedPortfolio);
  
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
  
  const mappedProfile = {
    user_id: user.id,
    avatar_url: profile.avatarUrl || profile.avatar_url || null,
    phone: profile.phone || null,
    location: profile.location || null,
    website: profile.website || null,
    linkedin_url: profile.linkedinUrl || profile.linkedin_url || null,
    github_url: profile.githubUrl || profile.github_url || null
  };
  
  const { error } = await supabase
    .from('profiles')
    .upsert(mappedProfile);
  
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
