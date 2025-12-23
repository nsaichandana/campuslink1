# CampusLink - Quick Start Guide

Get CampusLink running in under 10 minutes.

## 🚀 Quick Setup (3 Steps)

### Step 1: Install Dependencies (2 minutes)

```bash
cd campuslink
npm install
```

### Step 2: Configure Firebase & Gemini (5 minutes)

1. **Create Firebase Project**
   - Visit: https://console.firebase.google.com/
   - Click "Add project"
   - Enable: Authentication (Email/Password), Firestore, Storage, Hosting

2. **Get Gemini API Key**
   - Visit: https://makersuite.google.com/app/apikey
   - Create new API key

3. **Update Configuration**
   Edit `src/config.js`:

```javascript
export const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

export const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY";

export const ALLOWED_EMAIL_DOMAINS = [
  "student.yourcollege.edu",  // Replace with your college domain
];

export const ADMIN_EMAILS = [
  "admin@yourcollege.edu",  // Replace with admin email
];
```

### Step 3: Run Development Server (1 minute)

```bash
npm run dev
```

Visit: http://localhost:3000

## ✅ First Test

1. Click "Continue" on splash screen
2. Click "Continue Anonymously"
3. Click "Report a Campus Issue"
4. Fill out form and submit
5. Check "My Activity" to see your report

## 🔥 Deploy to Production (Optional)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Deploy security rules
firebase deploy --only firestore:rules
firebase deploy --only storage:rules

# Build and deploy
npm run build
firebase deploy --only hosting
```

Your app is now live!

## 📂 Project Structure

```
campuslink/
├── src/
│   ├── components/     # React components
│   ├── services/       # Firebase & Gemini services
│   ├── contexts/       # React contexts
│   ├── styles/         # Global CSS
│   └── config.js       # Configuration
├── firebase.json       # Firebase config
├── firestore.rules     # Database security
└── package.json        # Dependencies
```

## 🔑 Key Files to Configure

1. **`src/config.js`** - API keys and domains
2. **`firestore.rules`** - Database security rules
3. **`storage.rules`** - File upload rules

## 📖 Full Documentation

- **README.md** - Complete feature documentation
- **DEPLOYMENT.md** - Production deployment guide
- **API.md** - Service API documentation

## 🆘 Troubleshooting

**Issue:** "Module not found"
**Fix:** Run `npm install`

**Issue:** "Firebase configuration error"
**Fix:** Check values in `src/config.js` match Firebase console

**Issue:** "Authentication failed"
**Fix:** Enable Email/Password in Firebase Console > Authentication

**Issue:** "Permission denied"
**Fix:** Deploy Firestore rules: `firebase deploy --only firestore:rules`

## 💡 Tips

- Use your college email to test full features
- Add yourself to `ADMIN_EMAILS` to test admin features
- Check browser console for errors
- Use Firebase Console to view data

## 🎯 What to Test

- [x] Anonymous issue reporting
- [x] Sign up with college email
- [x] Profile creation
- [x] Mentor search
- [x] Send mentor request
- [x] Chat messaging
- [x] Content moderation (try inappropriate text)

## 📞 Need Help?

- Check console logs for errors
- Review Firebase Console for service status
- Read full README.md for detailed info
- Check API.md for service documentation

## ✨ Features Enabled

✅ Anonymous issue reporting
✅ Email authentication
✅ Profile setup
✅ AI-powered issue categorization
✅ Mentor discovery with AI matching
✅ Real-time chat
✅ Content moderation
✅ Admin issue management
✅ Responsive design

---

**You're ready to go!** 🚀

Start building a safer, more connected campus community.
