# Pre-Deployment Checklist

## ✅ Code Cleanup
- [x] Removed unnecessary .md files from src/
- [x] Removed .sql files from src/
- [x] Removed guidelines folder
- [x] Removed old server folder
- [x] Removed documentation files from root
- [x] Added .gitignore
- [x] Created README.md
- [x] Created DEPLOYMENT.md

## ✅ Configuration Files
- [x] amplify.yml configured
- [x] package.json build scripts verified
- [x] vite.config.ts properly configured
- [x] .env.example present

## ✅ Build Verification
- [x] Production build tested successfully
- [x] Build output: build/ directory
- [x] No build errors

## 📋 Before Deploying to AWS Amplify

### 1. Environment Variables
Ensure you have these ready:
- [ ] VITE_SUPABASE_URL
- [ ] VITE_SUPABASE_ANON_KEY

### 2. Supabase Backend
Verify these are completed:
- [ ] Database tables created (users, projects, certificates, notes, resumes, portfolios, profiles)
- [ ] Edge Function deployed: `make-server-0b71ff0c`
- [ ] Password hash function created in database
- [ ] Admin user created with approved status
- [ ] Storage buckets configured (if using file uploads)

### 3. Git Repository
- [ ] Code committed to git
- [ ] Pushed to GitHub
- [ ] Repository is public or you have AWS access

### 4. Test Locally
- [ ] `npm run dev` works
- [ ] `npm run build` succeeds
- [ ] All features tested (login, upload, dashboards)

## 🚀 Deployment Steps

1. **Go to AWS Amplify Console**: https://console.aws.amazon.com/amplify/
2. **New app** → **Host web app**
3. **Connect GitHub repository**
4. **Select branch**: main
5. **Add environment variables**:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
6. **Save and deploy**
7. **Wait for build** (2-5 minutes)
8. **Test deployed app**

## 🧪 Post-Deployment Testing

Test these features on the live site:
- [ ] Landing page loads
- [ ] Student signup works
- [ ] Teacher signup works
- [ ] Admin login works
- [ ] Admin can approve/reject users
- [ ] Student can upload projects
- [ ] Student can upload certificates
- [ ] Teacher can view student portfolios
- [ ] All links work (GitHub, certificates, etc.)

## 🔧 Troubleshooting

If deployment fails:
1. Check build logs in Amplify Console
2. Verify environment variables are set
3. Check browser console for errors
4. Verify Supabase Edge Function is accessible
5. Test API endpoints directly

## 📝 Notes

- Auto-deployment enabled on main branch
- HTTPS automatically configured
- Custom domain can be added after deployment
- Free tier: 1000 build minutes/month
