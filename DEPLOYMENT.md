# CampusLink Deployment Guide

This guide walks you through deploying CampusLink to production.

## Prerequisites

- [x] Firebase project created
- [x] Firebase CLI installed (`npm install -g firebase-tools`)
- [x] All configuration values set in `src/config.js`
- [x] Local development tested successfully

## Deployment Checklist

### 1. Pre-Deployment Configuration

#### Update Firebase Config
Edit `src/config.js` with your production values:

```javascript
// Production Firebase Config
export const firebaseConfig = {
  apiKey: "PRODUCTION_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "PRODUCTION_SENDER_ID",
  appId: "PRODUCTION_APP_ID"
};

// Production Gemini API Key
export const GEMINI_API_KEY = "PRODUCTION_GEMINI_KEY";

// College Email Domains
export const ALLOWED_EMAIL_DOMAINS = [
  "student.yourcollege.edu",
  // Add all valid domains
];

// Admin Emails
export const ADMIN_EMAILS = [
  "admin@yourcollege.edu",
  // Add all admin emails
];
```

### 2. Firebase Setup

#### Login to Firebase
```bash
firebase login
```

#### Initialize Firebase (if not done)
```bash
firebase init
```

Select:
- Firestore
- Storage
- Hosting

Use existing project and select your Firebase project.

#### Configure Firebase Hosting
When prompted:
- Public directory: `dist`
- Single-page app: `Yes`
- Set up automatic builds: `No`
- Overwrite index.html: `No`

### 3. Deploy Security Rules

#### Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

Verify deployment:
- Go to Firebase Console > Firestore Database > Rules
- Ensure rules are updated with timestamp

#### Deploy Storage Rules
```bash
firebase deploy --only storage:rules
```

Verify deployment:
- Go to Firebase Console > Storage > Rules
- Ensure rules are updated

#### Deploy Firestore Indexes
```bash
firebase deploy --only firestore:indexes
```

This may take several minutes. Monitor progress in Firebase Console.

### 4. Build Production Bundle

```bash
# Clean previous builds
rm -rf dist/

# Build for production
npm run build
```

Verify build output:
- Check `dist/` folder exists
- Verify `dist/index.html` exists
- Check bundle size (should be < 1MB for initial load)

### 5. Test Production Build Locally

```bash
npm run preview
```

Test thoroughly:
- [ ] Sign up with college email
- [ ] Create profile
- [ ] Report an issue
- [ ] Search for mentors
- [ ] Send mentor request
- [ ] Test chat functionality
- [ ] Verify content moderation works

### 6. Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

Or use the npm script:
```bash
npm run deploy
```

Deployment output will show:
```
✔ Deploy complete!

Project Console: https://console.firebase.google.com/project/your-project/overview
Hosting URL: https://your-project.web.app
```

### 7. Post-Deployment Verification

#### Test Production Site
Visit your hosting URL and verify:
- [ ] Site loads correctly
- [ ] Authentication works
- [ ] Issue reporting works
- [ ] Mentorship search works
- [ ] Chat functionality works
- [ ] Images upload successfully
- [ ] Mobile responsive design works
- [ ] Security rules prevent unauthorized access

#### Check Firebase Console
- **Authentication**: Verify email/password is enabled
- **Firestore**: Check collections are created correctly
- **Storage**: Verify bucket is accessible
- **Hosting**: Check deployment status

#### Monitor Error Logs
```bash
firebase functions:log
```

### 8. Set Up Custom Domain (Optional)

#### Add Custom Domain
1. Go to Firebase Console > Hosting
2. Click "Add custom domain"
3. Enter your domain (e.g., campuslink.yourcollege.edu)
4. Follow verification steps
5. Update DNS records with provided values

#### SSL Certificate
Firebase automatically provisions SSL certificates for custom domains.

### 9. Performance Optimization

#### Enable Caching
Already configured in `firebase.json`:
```json
{
  "headers": [
    {
      "source": "**/*.@(jpg|jpeg|gif|png|svg|webp)",
      "headers": [{ "key": "Cache-Control", "value": "max-age=31536000" }]
    }
  ]
}
```

#### Monitor Performance
- Use Firebase Performance Monitoring
- Check Lighthouse scores
- Monitor bundle sizes

### 10. Set Up Monitoring

#### Firebase Analytics
Enable in Firebase Console > Analytics

#### Error Tracking
Consider integrating:
- Sentry for error tracking
- Firebase Crashlytics

## Continuous Deployment

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: your-project-id
```

## Rollback Procedure

If issues occur after deployment:

```bash
# View hosting history
firebase hosting:channel:list

# Rollback to previous version
firebase hosting:clone SOURCE_SITE_ID:SOURCE_CHANNEL_ID TARGET_SITE_ID:live
```

## Security Checklist

Before going live, verify:
- [ ] API keys are production keys, not development
- [ ] Firebase security rules are deployed
- [ ] Only college email domains allowed
- [ ] Admin emails configured correctly
- [ ] Content moderation is active
- [ ] HTTPS is enforced
- [ ] CORS is properly configured

## Cost Monitoring

### Free Tier Limits
- **Authentication**: 10k verifications/month
- **Firestore**: 50k reads, 20k writes, 20k deletes per day
- **Storage**: 5GB stored, 1GB downloaded per day
- **Hosting**: 10GB storage, 360MB/day transfer

### Monitor Usage
Check Firebase Console > Usage and billing

### Set Budget Alerts
1. Go to Firebase Console > Settings
2. Set up budget alerts
3. Configure notification emails

## Maintenance

### Regular Tasks
- Monitor error logs weekly
- Review reported issues
- Update dependencies monthly
- Check Firebase quota usage
- Backup Firestore data (export)

### Updates
When updating the app:
```bash
# Pull latest code
git pull

# Install any new dependencies
npm install

# Build
npm run build

# Deploy
firebase deploy
```

## Troubleshooting

### Deployment Fails
```bash
# Check Firebase CLI version
firebase --version

# Update if needed
npm install -g firebase-tools@latest

# Clear cache
rm -rf dist/ node_modules/
npm install
npm run build
firebase deploy
```

### Rules Deployment Error
- Check syntax in `.rules` files
- Verify project ID matches
- Ensure you have owner/editor permissions

### Site Not Updating
- Clear browser cache (Cmd+Shift+R / Ctrl+Shift+R)
- Check Firebase Hosting deployment status
- Verify correct project is active: `firebase use --list`

## Support

For deployment issues:
1. Check Firebase Status: https://status.firebase.google.com/
2. Review Firebase logs: `firebase functions:log`
3. Check browser console for errors
4. Verify all services are enabled in Firebase Console

## Success!

Your CampusLink instance should now be live. Share the URL with your campus community!

**Production URL**: `https://your-project.web.app`

---

Remember to:
- Monitor usage and errors regularly
- Keep dependencies updated
- Backup your Firestore data
- Communicate with users about new features
