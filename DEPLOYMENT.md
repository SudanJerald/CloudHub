# AWS Amplify Deployment Guide

## Prerequisites

1. AWS Account
2. GitHub repository with your code
3. Supabase project set up with Edge Functions deployed

## Step-by-Step Deployment

### 1. Prepare Your Repository

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Ready for deployment"

# Create GitHub repository and push
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### 2. AWS Amplify Console Setup

1. **Login to AWS Console**:
   - Go to https://console.aws.amazon.com/amplify/
   - Click "New app" → "Host web app"

2. **Connect Repository**:
   - Select "GitHub"
   - Authorize AWS Amplify to access your GitHub
   - Select your repository
   - Select the `main` branch

3. **Configure Build Settings**:
   - Amplify will detect `amplify.yml` automatically
   - Review the build configuration
   - Click "Next"

4. **Add Environment Variables**:
   - Click "Advanced settings"
   - Add the following environment variables:
     ```
     VITE_SUPABASE_URL = your_supabase_project_url
     VITE_SUPABASE_ANON_KEY = your_supabase_anon_key
     ```

5. **Deploy**:
   - Click "Save and deploy"
   - Wait for build to complete (2-5 minutes)

### 3. Post-Deployment

1. **Custom Domain** (Optional):
   - Go to "Domain management"
   - Add your custom domain
   - Follow DNS configuration instructions

2. **HTTPS/SSL**:
   - Automatically configured by Amplify
   - Certificate provisioning takes ~5 minutes

3. **Test Your App**:
   - Click the generated URL
   - Test login functionality
   - Verify student/teacher/admin dashboards

## Continuous Deployment

Every push to the `main` branch will trigger automatic deployment:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Amplify will automatically:
- Pull latest code
- Run build
- Deploy to production
- Update your live site

## Monitoring

1. **Build Logs**:
   - Available in Amplify Console
   - Shows npm install and build output

2. **Access Logs**:
   - CloudWatch integration available
   - Monitor traffic and errors

## Troubleshooting

### Build Fails

1. Check build logs in Amplify Console
2. Verify environment variables are set correctly
3. Test build locally: `npm run build`

### Runtime Errors

1. Check browser console for errors
2. Verify Supabase URL and keys
3. Ensure Edge Functions are deployed

### CORS Issues

If you encounter CORS errors:
- Verify Supabase Edge Function CORS settings
- Check that frontend is making requests to correct URL

## Rollback

To rollback to a previous version:
1. Go to Amplify Console
2. Click "Deployments"
3. Select previous successful deployment
4. Click "Redeploy this version"

## Cost Estimate

AWS Amplify pricing (as of 2025):
- Build: $0.01 per build minute
- Hosting: $0.15 per GB served
- Free tier: 1000 build minutes/month, 15 GB served/month

Typical small project: $0-5/month

## Support

For issues:
- AWS Amplify Docs: https://docs.aws.amazon.com/amplify/
- Supabase Docs: https://supabase.com/docs
- GitHub Issues: Create issue in your repository
