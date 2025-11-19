import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.ts";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-0b71ff0c/health", (c) => {
  return c.json({ status: "ok" });
});

// ==================== AUTHENTICATION & SIGNUP ROUTES ====================

// Generate OTP for email verification
app.post("/make-server-0b71ff0c/auth/generate-otp", async (c) => {
  try {
    const { email } = await c.req.json();
    
    if (!email || !email.includes('@')) {
      return c.json({ error: "Valid email is required" }, 400);
    }
    
    // Validate email is a college/academic email
    const validDomains = ['edu', 'ac.in', 'edu.in'];
    const emailDomain = email.toLowerCase().split('@')[1];
    const isAcademicEmail = validDomains.some(domain => emailDomain.endsWith(domain));
    
    if (!isAcademicEmail) {
      return c.json({ 
        error: "Please use a valid college/academic email address (e.g., @college.edu, @university.ac.in)" 
      }, 400);
    }
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with expiry (5 minutes)
    const otpData = {
      otp,
      email,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      verified: false
    };
    
    await kv.set(`otp:${email}`, otpData);
    
    console.log(`[OTP GENERATED] Email: ${email}, OTP: ${otp}`);
    
    // In a real application, you would send this via email service
    // For demo purposes, we return it (REMOVE IN PRODUCTION)
    return c.json({ 
      success: true, 
      message: "OTP sent to your email",
      // FOR DEMO ONLY - Remove this in production
      otp: otp,
      debug_message: "In production, this OTP would be sent via email. For demo purposes, it's shown here."
    });
  } catch (error) {
    console.error("Error generating OTP:", error);
    return c.json({ error: "Failed to generate OTP" }, 500);
  }
});

// Verify OTP
app.post("/make-server-0b71ff0c/auth/verify-otp", async (c) => {
  try {
    const { email, otp } = await c.req.json();
    
    if (!email || !otp) {
      return c.json({ error: "Email and OTP are required" }, 400);
    }
    
    const otpData = await kv.get(`otp:${email}`);
    
    if (!otpData) {
      return c.json({ error: "No OTP found for this email. Please request a new one." }, 400);
    }
    
    if (Date.now() > otpData.expiresAt) {
      await kv.del(`otp:${email}`);
      return c.json({ error: "OTP has expired. Please request a new one." }, 400);
    }
    
    if (otpData.otp !== otp) {
      return c.json({ error: "Invalid OTP. Please try again." }, 400);
    }
    
    // Mark as verified
    otpData.verified = true;
    await kv.set(`otp:${email}`, otpData);
    
    return c.json({ success: true, message: "Email verified successfully!" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return c.json({ error: "Failed to verify OTP" }, 500);
  }
});

// Check if email is already registered
app.post("/make-server-0b71ff0c/auth/check-email", async (c) => {
  try {
    const { email } = await c.req.json();
    
    const existingUser = await kv.get(`user:${email}`);
    
    return c.json({ 
      exists: !!existingUser,
      message: existingUser ? "This email is already registered" : "Email is available"
    });
  } catch (error) {
    console.error("Error checking email:", error);
    return c.json({ error: "Failed to check email" }, 500);
  }
});

// Check if roll number is already taken
app.post("/make-server-0b71ff0c/auth/check-rollno", async (c) => {
  try {
    const { rollNo } = await c.req.json();
    
    // Get all users and check roll numbers
    const allUsers = await kv.getByPrefix('user:');
    const rollNoExists = allUsers.some((user: any) => user.rollNo === rollNo);
    
    return c.json({ 
      exists: rollNoExists,
      message: rollNoExists ? "This roll number is already registered" : "Roll number is available"
    });
  } catch (error) {
    console.error("Error checking roll number:", error);
    return c.json({ error: "Failed to check roll number" }, 500);
  }
});

// Signup route with validation
app.post("/make-server-0b71ff0c/auth/signup", async (c) => {
  try {
    const signupData = await c.req.json();
    const { email, password, fullName, rollNo, department, yearSemester, role, designation } = signupData;

    // Validate required fields based on role
    if (!email || !password || !fullName || !department || !yearSemester || !role) {
      return c.json({ error: "All fields are required" }, 400);
    }

    // For students, rollNo is required; for teachers, designation is required
    if (role === 'student' && !rollNo) {
      return c.json({ error: "Roll number is required for students" }, 400);
    }

    if (role === 'teacher' && !designation) {
      return c.json({ error: "Designation is required for teachers" }, 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return c.json({ error: "Please enter a valid email address" }, 400);
    }

    // Check if email already exists
    const existingUser = await kv.get(`user:${email}`);
    if (existingUser) {
      return c.json({ error: "An account with this email already exists" }, 400);
    }

    // Check if roll number already exists (only for students)
    if (role === 'student' && rollNo) {
      const allUsers = await kv.getByPrefix('user:');
      const rollNoExists = allUsers.some((user: any) => user.rollNo === rollNo);
      if (rollNoExists) {
        return c.json({ error: "This roll number is already registered" }, 400);
      }

      // Validate roll number format (basic validation - alphanumeric)
      if (!/^[A-Z0-9]+$/i.test(rollNo)) {
        return c.json({ error: "Roll number must be alphanumeric" }, 400);
      }
    }

    // Validate password strength
    if (password.length < 8) {
      return c.json({ error: "Password must be at least 8 characters long" }, 400);
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      return c.json({
        error: "Password must contain uppercase, lowercase, number, and special character"
      }, 400);
    }

    // Create user account
    const userData: any = {
      email,
      password, // In production, hash this!
      name: fullName,
      department,
      yearSemester,
      role,
      accountStatus: 'pending', // All new signups need admin approval
      createdAt: new Date().toISOString(),
      verified: true
    };

    // Add role-specific fields
    if (role === 'student' && rollNo) {
      userData.rollNo = rollNo;
    } else if (role === 'teacher' && designation) {
      userData.designation = designation;
    }

    await kv.set(`user:${email}`, userData);

    // Store credentials for login
    await kv.set(`credentials:${email}`, { email, password });

    console.log(`[SIGNUP SUCCESS] ${role} registered: ${email}`);

    return c.json({
      success: true,
      message: "Account created successfully!",
      user: {
        email: userData.email,
        name: userData.name,
        role: userData.role,
        accountStatus: userData.accountStatus,
        ...(userData.rollNo && { rollNo: userData.rollNo }),
        ...(userData.designation && { designation: userData.designation })
      }
    });
  } catch (error) {
    console.error("Error during signup:", error);
    return c.json({ error: "Failed to create account" }, 500);
  }
});

// Login route with validation
app.post("/make-server-0b71ff0c/auth/login", async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    // Get user credentials
    const credentials = await kv.get(`credentials:${email}`);

    if (!credentials) {
      return c.json({ error: "No account found with this email. Please sign up first." }, 401);
    }

    if (credentials.password !== password) {
      return c.json({ error: "Incorrect password. Please try again." }, 401);
    }

    // Get user data
    const userData = await kv.get(`user:${email}`);

    if (!userData) {
      return c.json({ error: "User data not found" }, 404);
    }

    // Check account status
    if (userData.accountStatus === 'pending') {
      return c.json({
        success: true,
        message: "Account pending approval",
        user: {
          email: userData.email,
          name: userData.name,
          role: userData.role || 'student',
          department: userData.department,
          yearSemester: userData.yearSemester,
          accountStatus: 'pending',
          ...(userData.rollNo && { rollNo: userData.rollNo }),
          ...(userData.designation && { designation: userData.designation })
        }
      });
    }

    if (userData.accountStatus === 'rejected') {
      return c.json({ error: "Your account has been rejected. Please contact the administrator." }, 403);
    }

    return c.json({
      success: true,
      message: "Login successful",
      user: {
        email: userData.email,
        name: userData.name,
        role: userData.role || 'student',
        department: userData.department,
        yearSemester: userData.yearSemester,
        accountStatus: userData.accountStatus || 'approved',
        ...(userData.rollNo && { rollNo: userData.rollNo }),
        ...(userData.designation && { designation: userData.designation })
      }
    });
  } catch (error) {
    console.error("Error during login:", error);
    return c.json({ error: "Failed to login" }, 500);
  }
});

// ==================== USER PROFILE ROUTES ====================

// Get user profile data
app.get("/make-server-0b71ff0c/user/:email", async (c) => {
  try {
    const email = c.req.param("email");
    const userData = await kv.get(`user:${email}`);
    
    if (!userData) {
      return c.json({ error: "User not found" }, 404);
    }
    
    return c.json(userData);
  } catch (error) {
    console.error("Error fetching user data:", error);
    return c.json({ error: "Failed to fetch user data" }, 500);
  }
});

// Create or update user profile
app.post("/make-server-0b71ff0c/user", async (c) => {
  try {
    const userData = await c.req.json();
    const { email } = userData;
    
    if (!email) {
      return c.json({ error: "Email is required" }, 400);
    }
    
    await kv.set(`user:${email}`, userData);
    return c.json({ success: true, data: userData });
  } catch (error) {
    console.error("Error saving user data:", error);
    return c.json({ error: "Failed to save user data" }, 500);
  }
});

// ==================== PROJECTS ROUTES ====================

// Get all projects for a user
app.get("/make-server-0b71ff0c/projects/:email", async (c) => {
  try {
    const email = c.req.param("email");
    const projects = await kv.get(`projects:${email}`);
    return c.json(projects || []);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return c.json({ error: "Failed to fetch projects" }, 500);
  }
});

// Save projects for a user
app.post("/make-server-0b71ff0c/projects/:email", async (c) => {
  try {
    const email = c.req.param("email");
    const projects = await c.req.json();
    
    await kv.set(`projects:${email}`, projects);
    return c.json({ success: true, data: projects });
  } catch (error) {
    console.error("Error saving projects:", error);
    return c.json({ error: "Failed to save projects" }, 500);
  }
});

// ==================== CERTIFICATES ROUTES ====================

// Get all certificates for a user
app.get("/make-server-0b71ff0c/certificates/:email", async (c) => {
  try {
    const email = c.req.param("email");
    const certificates = await kv.get(`certificates:${email}`);
    return c.json(certificates || []);
  } catch (error) {
    console.error("Error fetching certificates:", error);
    return c.json({ error: "Failed to fetch certificates" }, 500);
  }
});

// Save certificates for a user
app.post("/make-server-0b71ff0c/certificates/:email", async (c) => {
  try {
    const email = c.req.param("email");
    const certificates = await c.req.json();
    
    await kv.set(`certificates:${email}`, certificates);
    return c.json({ success: true, data: certificates });
  } catch (error) {
    console.error("Error saving certificates:", error);
    return c.json({ error: "Failed to save certificates" }, 500);
  }
});

// ==================== NOTES ROUTES ====================

// Get all notes for a user
app.get("/make-server-0b71ff0c/notes/:email", async (c) => {
  try {
    const email = c.req.param("email");
    const notes = await kv.get(`notes:${email}`);
    return c.json(notes || []);
  } catch (error) {
    console.error("Error fetching notes:", error);
    return c.json({ error: "Failed to fetch notes" }, 500);
  }
});

// Save notes for a user
app.post("/make-server-0b71ff0c/notes/:email", async (c) => {
  try {
    const email = c.req.param("email");
    const notes = await c.req.json();
    
    await kv.set(`notes:${email}`, notes);
    return c.json({ success: true, data: notes });
  } catch (error) {
    console.error("Error saving notes:", error);
    return c.json({ error: "Failed to save notes" }, 500);
  }
});

// ==================== RESUMES ROUTES ====================

// Get all resumes for a user
app.get("/make-server-0b71ff0c/resumes/:email", async (c) => {
  try {
    const email = c.req.param("email");
    const resumes = await kv.get(`resumes:${email}`);
    return c.json(resumes || []);
  } catch (error) {
    console.error("Error fetching resumes:", error);
    return c.json({ error: "Failed to fetch resumes" }, 500);
  }
});

// Save resumes for a user
app.post("/make-server-0b71ff0c/resumes/:email", async (c) => {
  try {
    const email = c.req.param("email");
    const resumes = await c.req.json();
    
    await kv.set(`resumes:${email}`, resumes);
    return c.json({ success: true, data: resumes });
  } catch (error) {
    console.error("Error saving resumes:", error);
    return c.json({ error: "Failed to save resumes" }, 500);
  }
});

// ==================== PORTFOLIO ROUTES ====================

// Get portfolio data for a user
app.get("/make-server-0b71ff0c/portfolio/:email", async (c) => {
  try {
    const email = c.req.param("email");
    const portfolio = await kv.get(`portfolio:${email}`);
    return c.json(portfolio || null);
  } catch (error) {
    console.error("Error fetching portfolio:", error);
    return c.json({ error: "Failed to fetch portfolio" }, 500);
  }
});

// Save portfolio data for a user
app.post("/make-server-0b71ff0c/portfolio/:email", async (c) => {
  try {
    const email = c.req.param("email");
    const portfolio = await c.req.json();
    
    await kv.set(`portfolio:${email}`, portfolio);
    return c.json({ success: true, data: portfolio });
  } catch (error) {
    console.error("Error saving portfolio:", error);
    return c.json({ error: "Failed to save portfolio" }, 500);
  }
});

// ==================== PROFILE SETTINGS ROUTES ====================

// Get profile settings for a user
app.get("/make-server-0b71ff0c/profile/:email", async (c) => {
  try {
    const email = c.req.param("email");
    const profile = await kv.get(`profile:${email}`);
    return c.json(profile || null);
  } catch (error) {
    console.error("Error fetching profile settings:", error);
    return c.json({ error: "Failed to fetch profile settings" }, 500);
  }
});

// Save profile settings for a user
app.post("/make-server-0b71ff0c/profile/:email", async (c) => {
  try {
    const email = c.req.param("email");
    const profile = await c.req.json();
    
    await kv.set(`profile:${email}`, profile);
    return c.json({ success: true, data: profile });
  } catch (error) {
    console.error("Error saving profile settings:", error);
    return c.json({ error: "Failed to save profile settings" }, 500);
  }
});

// ==================== BULK DATA ROUTES ====================

// Get all user data in one call
app.get("/make-server-0b71ff0c/user-data/:email", async (c) => {
  try {
    const email = c.req.param("email");
    
    const [user, projects, certificates, notes, resumes, portfolio, profile] = await Promise.all([
      kv.get(`user:${email}`),
      kv.get(`projects:${email}`),
      kv.get(`certificates:${email}`),
      kv.get(`notes:${email}`),
      kv.get(`resumes:${email}`),
      kv.get(`portfolio:${email}`),
      kv.get(`profile:${email}`)
    ]);
    
    return c.json({
      user: user || null,
      projects: projects || [],
      certificates: certificates || [],
      notes: notes || [],
      resumes: resumes || [],
      portfolio: portfolio || null,
      profile: profile || null
    });
  } catch (error) {
    console.error("Error fetching all user data:", error);
    return c.json({ error: "Failed to fetch user data" }, 500);
  }
});

// ==================== ADMIN ROUTES ====================

// Get all users (for admin dashboard)
app.get("/make-server-0b71ff0c/admin/pending-users", async (c) => {
  try {
    const allUsers = await kv.getByPrefix('user:');
    
    // Map users to include only necessary fields
    const users = allUsers.map((userData: any) => ({
      id: userData.email, // Using email as ID for simplicity
      name: userData.name,
      email: userData.email,
      role: userData.role,
      department: userData.department,
      yearSemester: userData.yearSemester,
      accountStatus: userData.accountStatus || 'approved', // Default to approved for old accounts
      createdAt: userData.createdAt,
      ...(userData.rollNo && { rollNo: userData.rollNo }),
      ...(userData.designation && { designation: userData.designation })
    }));
    
    return c.json(users);
  } catch (error) {
    console.error("Error fetching pending users:", error);
    return c.json({ error: "Failed to fetch users" }, 500);
  }
});

// Update user account status (approve/reject)
app.post("/make-server-0b71ff0c/admin/update-status", async (c) => {
  try {
    const { userId, status } = await c.req.json();
    
    if (!userId || !status) {
      return c.json({ error: "User ID and status are required" }, 400);
    }
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return c.json({ error: "Invalid status. Must be 'pending', 'approved', or 'rejected'" }, 400);
    }
    
    // Get user data (userId is actually the email)
    const email = userId;
    const userData = await kv.get(`user:${email}`);
    
    if (!userData) {
      return c.json({ error: "User not found" }, 404);
    }
    
    // Update account status
    userData.accountStatus = status;
    userData.updatedAt = new Date().toISOString();
    
    await kv.set(`user:${email}`, userData);
    
    console.log(`[ADMIN] Account status updated: ${email} -> ${status}`);
    
    return c.json({ 
      success: true, 
      message: `User ${status === 'approved' ? 'approved' : 'rejected'} successfully` 
    });
  } catch (error) {
    console.error("Error updating account status:", error);
    return c.json({ error: "Failed to update account status" }, 500);
  }
});

// TEMPORARY: Delete all users from KV store (for testing only)
app.post("/make-server-0b71ff0c/admin/delete-all-users", async (c) => {
  try {
    // Get all users
    const allUsers = await kv.getByPrefix('user:');
    
    const emails: string[] = [];
    
    // Delete each user and their associated data
    for (const [key, user] of allUsers.entries()) {
      const email = user.email;
      emails.push(email);
      
      // Delete user data
      await kv.del(`user:${email}`);
      await kv.del(`credentials:${email}`);
      await kv.del(`projects:${email}`);
      await kv.del(`certificates:${email}`);
      await kv.del(`notes:${email}`);
      await kv.del(`resumes:${email}`);
      await kv.del(`portfolio:${email}`);
      await kv.del(`profile:${email}`);
      await kv.del(`otp:${email}`);
    }
    
    return c.json({ 
      success: true, 
      message: `Deleted ${allUsers.size} users and their data`,
      count: allUsers.size,
      deletedEmails: emails
    });
  } catch (error) {
    console.error("Error deleting users:", error);
    return c.json({ error: "Failed to delete users" }, 500);
  }
});

// Create admin user in KV store (run once to bootstrap)
app.post("/make-server-0b71ff0c/admin/create-admin", async (c) => {
  try {
    const adminEmail = 'jeraldsudan@gmail.com';
    const adminPassword = 'H@11HH123456';
    
    // Check if admin already exists
    const existingAdmin = await kv.get(`user:${adminEmail}`);
    if (existingAdmin) {
      return c.json({ 
        success: true, 
        message: 'Admin user already exists',
        admin: { email: adminEmail, role: 'admin' }
      });
    }
    
    // Create admin user data
    const adminData = {
      email: adminEmail,
      name: 'Admin User',
      role: 'admin',
      department: 'Administration',
      yearSemester: 'N/A',
      rollNo: 'ADMIN001',
      accountStatus: 'approved'
    };
    
    // Save admin user
    await kv.set(`user:${adminEmail}`, adminData);
    await kv.set(`credentials:${adminEmail}`, { 
      email: adminEmail, 
      password: adminPassword 
    });
    
    return c.json({ 
      success: true, 
      message: 'Admin user created successfully',
      admin: {
        email: adminEmail,
        role: 'admin',
        password: adminPassword
      }
    });
  } catch (error) {
    console.error("Error creating admin:", error);
    return c.json({ error: "Failed to create admin user" }, 500);
  }
});

Deno.serve(app.fetch);
