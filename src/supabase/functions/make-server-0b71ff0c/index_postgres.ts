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
    const { email, status } = await c.req.json();
    
    if (!['approved', 'rejected'].includes(status)) {
      return c.json({ error: "Invalid status" }, 400);
    }
    
    const updatedUser = await db.updateUserStatus(email, status);
    
    console.log(`Admin ${status} user: ${email}`);
    
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

// Save projects
app.post("/make-server-0b71ff0c/projects", async (c) => {
  try {
    const { email, projects } = await c.req.json();
    await db.saveProjects(email, projects);
    return c.json({ success: true });
  } catch (error: any) {
    console.error("Error saving projects:", error);
    return c.json({ error: "Failed to save projects" }, 500);
  }
});

// Save certificates
app.post("/make-server-0b71ff0c/certificates", async (c) => {
  try {
    const { email, certificates } = await c.req.json();
    await db.saveCertificates(email, certificates);
    return c.json({ success: true });
  } catch (error: any) {
    console.error("Error saving certificates:", error);
    return c.json({ error: "Failed to save certificates" }, 500);
  }
});

// Save notes
app.post("/make-server-0b71ff0c/notes", async (c) => {
  try {
    const { email, notes } = await c.req.json();
    await db.saveNotes(email, notes);
    return c.json({ success: true });
  } catch (error: any) {
    console.error("Error saving notes:", error);
    return c.json({ error: "Failed to save notes" }, 500);
  }
});

// Save resumes
app.post("/make-server-0b71ff0c/resumes", async (c) => {
  try {
    const { email, resumes } = await c.req.json();
    await db.saveResumes(email, resumes);
    return c.json({ success: true });
  } catch (error: any) {
    console.error("Error saving resumes:", error);
    return c.json({ error: "Failed to save resumes" }, 500);
  }
});

// Save portfolio
app.post("/make-server-0b71ff0c/portfolio", async (c) => {
  try {
    const { email, portfolio } = await c.req.json();
    await db.savePortfolio(email, portfolio);
    return c.json({ success: true });
  } catch (error: any) {
    console.error("Error saving portfolio:", error);
    return c.json({ error: "Failed to save portfolio" }, 500);
  }
});

// Save profile
app.post("/make-server-0b71ff0c/profile", async (c) => {
  try {
    const { email, profile } = await c.req.json();
    await db.saveProfile(email, profile);
    return c.json({ success: true });
  } catch (error: any) {
    console.error("Error saving profile:", error);
    return c.json({ error: "Failed to save profile" }, 500);
  }
});

Deno.serve(app.fetch);
