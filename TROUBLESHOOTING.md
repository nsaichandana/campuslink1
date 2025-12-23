# CampusLink - Troubleshooting Guide

## 🔥 "Missing or insufficient permissions" Error

This error occurs when Firebase Firestore security rules aren't deployed or are too restrictive.

### **Quick Fix (3 Steps)**

#### **Step 1: Deploy Firestore Rules**

Open terminal in your project folder and run:

```bash
firebase deploy --only firestore:rules
```

If you get "Firebase CLI not found":
```bash
npm install -g firebase-tools
firebase login
firebase init firestore
firebase deploy --only firestore:rules
```

#### **Step 2: Verify Rules in Firebase Console**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **Firestore Database** in left menu
4. Click **Rules** tab
5. You should see the rules from `firestore.rules` file
6. Make sure there's a recent timestamp showing rules were updated

#### **Step 3: Test Again**

- Refresh your app
- Try creating profile again
- Should work now!

---

## 🚨 Common Errors & Solutions

### **Error: "Firebase config is not defined"**

**Cause:** Missing or incorrect Firebase configuration

**Fix:**
1. Open `src/config.js`
2. Get your Firebase config from Firebase Console:
   - Go to Project Settings > General
   - Scroll to "Your apps"
   - Copy the config object
3. Replace values in `src/config.js`:

```javascript
export const firebaseConfig = {
  apiKey: "AIza...",              // Your actual API key
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

### **Error: "Email domain not allowed"**

**Cause:** Your email domain isn't in the allowed list

**Fix:**
1. Open `src/config.js`
2. Update `ALLOWED_EMAIL_DOMAINS`:

```javascript
export const ALLOWED_EMAIL_DOMAINS = [
  "gmail.com",           // For testing
  "student.college.edu", // Your college domain
];
```

3. Restart dev server: `npm run dev`

---

### **Error: "Authentication not enabled"**

**Cause:** Email/Password authentication not enabled in Firebase

**Fix:**
1. Go to Firebase Console
2. Click **Authentication** in left menu
3. Click **Sign-in method** tab
4. Click **Email/Password**
5. Toggle **Enable**
6. Click **Save**

---

### **Error: "Storage: User does not have permission"**

**Cause:** Storage rules not deployed

**Fix:**
```bash
firebase deploy --only storage:rules
```

---

### **Error: "Gemini API error"**

**Cause:** Invalid or missing Gemini API key

**Fix:**
1. Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Update `src/config.js`:

```javascript
export const GEMINI_API_KEY = "AIza...your-key";
```

3. Restart dev server

---

### **Error: "Module not found"**

**Cause:** Dependencies not installed

**Fix:**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

### **Error: "Port 3000 already in use"**

**Cause:** Another app using port 3000

**Fix:**
```bash
# Kill process on port 3000 (Mac/Linux)
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- --port 3001
```

---

## 🔧 Development Environment Issues

### **Issue: Changes not reflecting**

**Solutions:**
1. Hard refresh browser: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
2. Clear browser cache
3. Restart dev server
4. Check console for errors

---

### **Issue: Slow load times**

**Solutions:**
1. Check network tab in browser DevTools
2. Verify Gemini API isn't rate limited
3. Check Firebase quota usage
4. Optimize images before upload

---

## 📊 Firebase Console Checklist

Verify these are set up correctly:

### **Authentication**
- [ ] Email/Password sign-in enabled
- [ ] Users can create accounts

### **Firestore Database**
- [ ] Database created
- [ ] Rules deployed (check Rules tab for timestamp)
- [ ] Collections: users, profiles, issues, mentorRequests, chatRooms, messages

### **Storage**
- [ ] Storage bucket created
- [ ] Rules deployed
- [ ] Folder structure: /issues/

### **Hosting (for production)**
- [ ] Hosting enabled
- [ ] Site deployed

---

## 🐛 Debugging Tips

### **Check Browser Console**
1. Open DevTools: `F12` or `Cmd+Option+I`
2. Go to Console tab
3. Look for red error messages
4. Copy error and search for solution

### **Check Firebase Console Logs**
1. Go to Firebase Console
2. Click on your project
3. Check **Authentication** > Users for new signups
4. Check **Firestore** > Data for created documents

### **Test with Simple Data**
Try creating a test document directly in Firestore Console:
1. Go to Firestore Database
2. Click "Start collection"
3. Collection ID: `test`
4. Document ID: Auto-ID
5. Field: `name`, Type: string, Value: `test`
6. Click Save

If this fails, check your Firebase project permissions.

---

## 🔐 Security Rules Testing

Test your rules are working:

### **Test 1: Profile Creation**
```javascript
// Should succeed when user is signed in
const profileRef = doc(db, 'profiles', currentUser.uid);
await setDoc(profileRef, { bio: 'Test' });
```

### **Test 2: Anonymous Issue Reporting**
```javascript
// Should succeed even without authentication
const issuesRef = collection(db, 'issues');
await addDoc(issuesRef, {
  category: 'Test',
  description: 'Test issue'
});
```

### **Test 3: Read Other Profiles**
```javascript
// Should succeed when signed in
const profilesRef = collection(db, 'profiles');
const snapshot = await getDocs(profilesRef);
```

---

## 📱 Mobile Testing Issues

### **Issue: Can't test on mobile device**

**Solution:**
1. Find your computer's local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Run dev server: `npm run dev -- --host`
3. On mobile, visit: `http://YOUR_IP:3000`
4. Make sure mobile and computer on same WiFi

---

## 🚀 Production Deployment Issues

### **Issue: "firebase: command not found"**
```bash
npm install -g firebase-tools
```

### **Issue: Deployment fails**
```bash
# Check you're logged in
firebase login

# Check correct project
firebase projects:list
firebase use YOUR_PROJECT_ID

# Try again
firebase deploy
```

### **Issue: Site shows old version**
- Wait 5 minutes for CDN cache
- Hard refresh browser
- Check deployment succeeded in Firebase Console

---

## 💡 Best Practices

1. **Always test in development first**
2. **Deploy rules before deploying app**
3. **Check Firebase Console after each deploy**
4. **Keep backup of working config**
5. **Use browser DevTools to debug**
6. **Check Firebase status page for outages**
7. **Monitor Firebase usage/quota**

---

## 🆘 Still Having Issues?

1. **Check all configuration files:**
   - `src/config.js` - All values filled correctly?
   - `firestore.rules` - Rules deployed?
   - `firebase.json` - Project ID correct?

2. **Verify Firebase services enabled:**
   - Authentication ✓
   - Firestore ✓
   - Storage ✓
   - Hosting ✓

3. **Test with a fresh Firebase project:**
   - Sometimes starting fresh helps
   - Follow QUICKSTART.md exactly

4. **Common mistakes:**
   - Using development Firebase config in production
   - Not deploying rules after changes
   - Email domain typo in ALLOWED_EMAIL_DOMAINS
   - Wrong project ID in firebase.json

---

## 📞 Get Help

If you're still stuck:

1. **Copy the exact error message** from browser console
2. **Note what you were trying to do** when error occurred
3. **Check Firebase Console** for any red errors
4. **Try the fix** in this guide for that specific error
5. **Search the error** on Stack Overflow or Firebase docs

---

## ✅ Quick Health Check

Run this checklist to verify everything is working:

```
Development:
[ ] npm install completed without errors
[ ] npm run dev starts server
[ ] App loads in browser
[ ] No console errors on page load

Firebase:
[ ] All services enabled in Firebase Console
[ ] Rules deployed (check timestamp in Console)
[ ] Can create test document in Firestore Console
[ ] Authentication sign-in methods enabled

Configuration:
[ ] src/config.js has all values filled
[ ] Email domain in ALLOWED_EMAIL_DOMAINS
[ ] Gemini API key is valid

Testing:
[ ] Can sign up with test email
[ ] Can create profile
[ ] Can report issue anonymously
[ ] Can search mentors (when signed in)
```

If all checkboxes are checked, your app should work! 🎉
