import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as db from "./database.ts";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS
app.use('/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'apikey'],
}));

// Health check
app.get("/make-server-0b71ff0c/health", (c) => {
  return c.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// ==================== AUTH ENDPOINTS ====================

// Check if email exists
app.post("/make-server-0b71ff0c/auth/check-email", async (c) => {
  try {
    const { email } = await c.req.json();
    const user = await db.getUserByEmail(email);
    
    return c.json({ exists: !!user });
  } catch (error) {
    console.error("Error checking email:", error);
    return c.json({ error: "Failed to check email" }, 500);
  }
});

// Check if roll number exists
app.post("/make-server-0b71ff0c/auth/check-rollno", async (c) => {
  try {
    const { rollNo } = await c.req.json();
    const user = await db.getUserByRollNo(rollNo);
    
    return c.json({ exists: !!user });
  } catch (error) {
    console.error("Error checking roll number:", error);
    return c.json({ error: "Failed to check roll number" }, 500);
  }
});

// Signup
app.post("/make-server-0b71ff0c/auth/signup", async (c) => {
  try {
    const userData = await c.req.json();
    
    // Check if email already exists
    const existingUser = await db.getUserByEmail(userData.email);
    if (existingUser) {
      return c.json({ error: "Email already registered" }, 400);
    }
    
    // Check if roll number already exists (for students)
    if (userData.role === 'student') {
      const existingRollNo = await db.getUserByRollNo(userData.rollNo);
      if (existingRollNo) {
        return c.json({ error: "Roll number already registered" }, 400);
      }
    }
    
    // Create user with pending status
    const newUser = await db.createUser({
      ...userData,
      accountStatus: 'pending'
    });
    
    return c.json({
      success: true,
      message: "Account created successfully. Awaiting admin approval.",
      user: {
        email: newUser.email,
        name: newUser.full_name,
        role: newUser.role,
        accountStatus: newUser.account_status
      }
    });
  } catch (error: any) {
    console.error("Error during signup:", error);
    return c.json({ error: error.message || "Signup failed" }, 500);
  }
});

// Login
app.post("/make-server-0b71ff0c/auth/login", async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }
    
    // Get user
    const user = await db.getUserByEmail(email);
    if (!user) {
      return c.json({ error: "No account found with this email. Please sign up first." }, 401);
    }
    
    // Verify password
    const isValid = await db.verifyPassword(email, password);
    if (!isValid) {
      return c.json({ error: "Incorrect password" }, 401);
    }
    
    // Check account status
    if (user.account_status === 'pending') {
      return c.json({
        success: true,
        message: "Account pending approval",
        user: {
          email: user.email,
          name: user.full_name,
          role: user.role,
          department: user.department,
          yearSemester: user.year_semester,
          accountStatus: 'pending',
          ...(user.roll_no && { rollNo: user.roll_no }),
          ...(user.designation && { designation: user.designation })
        }
      });
    }
    
    if (user.account_status === 'rejected') {
      return c.json({ error: "Your account has been rejected. Please contact the administrator." }, 403);
    }
    
    // Success - return user data
    return c.json({
      success: true,
      message: "Login successful",
      user: {
        email: user.email,
        name: user.full_name,
        role: user.role,
        department: user.department,
        yearSemester: user.year_semester,
        accountStatus: user.account_status,
        ...(user.roll_no && { rollNo: user.roll_no }),
        ...(user.designation && { designation: user.designation })
      }
    });
  } catch (error: any) {
    console.error("Error during login:", error);
    return c.json({ error: error.message || "Login failed" }, 500);
  }
});

// ==================== ADMIN ENDPOINTS ====================

// Get all users (for admin dashboard)
app.get("/make-server-0b71ff0c/admin/pending-users", async (c) => {
  try {
    const users = await db.getAllUsers();
    
    const formattedUsers = users.map(u => ({
      email: u.email,
      name: u.full_name,
      role: u.role,
      department: u.department,
      yearSemester: u.year_semester,
      accountStatus: u.account_status,
      createdAt: u.created_at,
      ...(u.roll_no && { rollNo: u.roll_no }),
      ...(u.designation && { designation: u.designation })
    }));
    
    return c.json({ users: formattedUsers });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return c.json({ error: "Failed to fetch users" }, 500);
  }
});

// Update user account status
app.post("/make-server-0b71ff0c/admin/update-status", async (c) => {
  try {
    const { userId, status } = await c.req.json();
    
    if (!['approved', 'rejected'].includes(status)) {
      return c.json({ error: "Invalid status" }, 400);
    }
    
    // userId is actually the email
    const updatedUser = await db.updateUserStatus(userId, status);
    
    console.log(`Admin ${status} user: ${userId}`);
    
    return c.json({
      success: true,
      message: `User ${status === 'approved' ? 'approved' : 'rejected'} successfully`
    });
  } catch (error: any) {
    console.error("Error updating account status:", error);
    return c.json({ error: "Failed to update account status" }, 500);
  }
});

// ==================== USER DATA ENDPOINTS ====================

// Save user info
app.post("/make-server-0b71ff0c/user", async (c) => {
  try {
    const userData = await c.req.json();
    // User info is already in users table, this endpoint can be used for updates
    return c.json({ success: true });
  } catch (error: any) {
    console.error("Error saving user:", error);
    return c.json({ error: "Failed to save user data" }, 500);
  }
});

// Get user data
app.get("/make-server-0b71ff0c/user/:email", async (c) => {
  try {
    const email = c.req.param("email");
    
    const user = await db.getUserByEmail(email);
    
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }
    
    return c.json({
      email: user.email,
      name: user.full_name,
      role: user.role,
      department: user.department,
      yearSemester: user.year_semester,
      accountStatus: user.account_status,
      ...(user.roll_no && { rollNo: user.roll_no }),
      ...(user.designation && { designation: user.designation })
    });
  } catch (error: any) {
    console.error("Error fetching user data:", error);
    return c.json({ error: "Failed to fetch user data" }, 500);
  }
});

// Get all user data (bulk endpoint)
app.get("/make-server-0b71ff0c/user-data/:email", async (c) => {
  try {
    const email = c.req.param("email");
    
    const [user, projects, certificates, notes, resumes, portfolio, profile] = await Promise.all([
      db.getUserByEmail(email),
      db.getProjects(email),
      db.getCertificates(email),
      db.getNotes(email),
      db.getResumes(email),
      db.getPortfolio(email),
      db.getProfile(email)
    ]);
    
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }
    
    return c.json({
      user: {
        email: user.email,
        name: user.full_name,
        role: user.role,
        department: user.department,
        yearSemester: user.year_semester,
        accountStatus: user.account_status,
        ...(user.roll_no && { rollNo: user.roll_no }),
        ...(user.designation && { designation: user.designation })
      },
      projects: projects || [],
      certificates: certificates || [],
      notes: notes || [],
      resumes: resumes || [],
      portfolio: portfolio || {},
      profile: profile || {}
    });
  } catch (error: any) {
    console.error("Error fetching user data:", error);
    return c.json({ error: "Failed to fetch user data" }, 500);
  }
});

// ==================== PROJECTS ENDPOINTS ====================

// Save projects
app.post("/make-server-0b71ff0c/projects/:email", async (c) => {
  try {
    const email = c.req.param("email");
    const projects = await c.req.json();
    await db.saveProjects(email, projects);
    return c.json({ success: true });
  } catch (error: any) {
    console.error("Error saving projects:", error);
    return c.json({ error: "Failed to save projects" }, 500);
  }
});

// Get projects
app.get("/make-server-0b71ff0c/projects/:email", async (c) => {
  try {
    const email = c.req.param("email");
    const projects = await db.getProjects(email);
    return c.json(projects || []);
  } catch (error: any) {
    console.error("Error fetching projects:", error);
    return c.json({ error: "Failed to fetch projects" }, 500);
  }
});

// ==================== CERTIFICATES ENDPOINTS ====================

// Save certificates
app.post("/make-server-0b71ff0c/certificates/:email", async (c) => {
  try {
    const email = c.req.param("email");
    const certificates = await c.req.json();
    await db.saveCertificates(email, certificates);
    return c.json({ success: true });
  } catch (error: any) {
    console.error("Error saving certificates:", error);
    return c.json({ error: "Failed to save certificates" }, 500);
  }
});

// Get certificates
app.get("/make-server-0b71ff0c/certificates/:email", async (c) => {
  try {
    const email = c.req.param("email");
    const certificates = await db.getCertificates(email);
    return c.json(certificates || []);
  } catch (error: any) {
    console.error("Error fetching certificates:", error);
    return c.json({ error: "Failed to fetch certificates" }, 500);
  }
});

// ==================== NOTES ENDPOINTS ====================

// Save notes
app.post("/make-server-0b71ff0c/notes/:email", async (c) => {
  try {
    const email = c.req.param("email");
    const notes = await c.req.json();
    await db.saveNotes(email, notes);
    return c.json({ success: true });
  } catch (error: any) {
    console.error("Error saving notes:", error);
    return c.json({ error: "Failed to save notes" }, 500);
  }
});

// Get notes
app.get("/make-server-0b71ff0c/notes/:email", async (c) => {
  try {
    const email = c.req.param("email");
    const notes = await db.getNotes(email);
    return c.json(notes || []);
  } catch (error: any) {
    console.error("Error fetching notes:", error);
    return c.json({ error: "Failed to fetch notes" }, 500);
  }
});

// ==================== RESUMES ENDPOINTS ====================

// Save resumes
app.post("/make-server-0b71ff0c/resumes/:email", async (c) => {
  try {
    const email = c.req.param("email");
    const resumes = await c.req.json();
    await db.saveResumes(email, resumes);
    return c.json({ success: true });
  } catch (error: any) {
    console.error("Error saving resumes:", error);
    return c.json({ error: "Failed to save resumes" }, 500);
  }
});

// Get resumes
app.get("/make-server-0b71ff0c/resumes/:email", async (c) => {
  try {
    const email = c.req.param("email");
    const resumes = await db.getResumes(email);
    return c.json(resumes || []);
  } catch (error: any) {
    console.error("Error fetching resumes:", error);
    return c.json({ error: "Failed to fetch resumes" }, 500);
  }
});

// ==================== PORTFOLIO ENDPOINTS ====================

// Save portfolio
app.post("/make-server-0b71ff0c/portfolio/:email", async (c) => {
  try {
    const email = c.req.param("email");
    const portfolio = await c.req.json();
    await db.savePortfolio(email, portfolio);
    return c.json({ success: true });
  } catch (error: any) {
    console.error("Error saving portfolio:", error);
    return c.json({ error: "Failed to save portfolio" }, 500);
  }
});

// Get portfolio
app.get("/make-server-0b71ff0c/portfolio/:email", async (c) => {
  try {
    const email = c.req.param("email");
    const portfolio = await db.getPortfolio(email);
    return c.json(portfolio || {});
  } catch (error: any) {
    console.error("Error fetching portfolio:", error);
    return c.json({ error: "Failed to fetch portfolio" }, 500);
  }
});

// ==================== PROFILE ENDPOINTS ====================

// Save profile
app.post("/make-server-0b71ff0c/profile/:email", async (c) => {
  try {
    const email = c.req.param("email");
    const profile = await c.req.json();
    await db.saveProfile(email, profile);
    return c.json({ success: true });
  } catch (error: any) {
    console.error("Error saving profile:", error);
    return c.json({ error: "Failed to save profile" }, 500);
  }
});

// Get profile
app.get("/make-server-0b71ff0c/profile/:email", async (c) => {
  try {
    const email = c.req.param("email");
    const profile = await db.getProfile(email);
    return c.json(profile || {});
  } catch (error: any) {
    console.error("Error fetching profile:", error);
    return c.json({ error: "Failed to fetch profile" }, 500);
  }
});

Deno.serve(app.fetch);
