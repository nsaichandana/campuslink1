# CampusLink - Campus Safety & Mentorship Platform

**A safe space to speak up and learn from each other.**

CampusLink is a production-ready web application designed for college students to anonymously report campus issues and discover skill-based mentorship opportunities. Built with privacy, safety, and authenticity at its core.

## 🎯 Core Features

### 1. Anonymous Issue Reporting
- Report campus issues (Safety, Hygiene, Infrastructure, Canteen)
- Optional anonymous reporting
- AI-powered content moderation
- Automatic categorization and priority assignment
- Real-time status tracking (Open → In Review → Resolved)
- Photo upload support

### 2. Skill-Based Mentorship
- Natural language mentor search
- AI-powered skill matching
- Mentor request system with intro messages
- Profile-based discovery
- Direct messaging after connection

### 3. Privacy & Safety
- College email verification required for full access
- Anonymous users limited to issue reporting only
- AI moderation on all user-generated content (Gemini)
- Secure Firebase Authentication
- Admin-only issue management
- No follower counts, likes, or rankings

## 🔒 User Access Levels

### Anonymous Users
- ✅ Can report campus issues
- ❌ Cannot access mentorship
- ❌ Cannot send messages

### Signed-In Users
- ✅ Full access to all features
- ✅ Mentorship discovery and chat
- ✅ Profile creation
- ✅ Issue tracking

### Admin Users
- ✅ Update issue statuses
- ✅ View all reported issues
- ❌ Cannot read private chat messages

## 🛠 Tech Stack

### Frontend
- **React 18** - UI framework
- **React Router** - Client-side routing
- **Vite** - Build tool and dev server
- **CSS Custom Properties** - Styling with calm, trustworthy design system

### Backend & Services
- **Firebase Authentication** - User authentication with email
- **Cloud Firestore** - NoSQL database
- **Firebase Storage** - Image storage
- **Firebase Hosting** - Static hosting

### AI Integration
- **Google Gemini API** - Content moderation, issue categorization, mentor matching

### Additional Libraries
- **date-fns** - Date formatting

## 📁 Project Structure

```
campuslink/
├── src/
│   ├── components/
│   │   ├── auth/              # Authentication screens
│   │   │   ├── SplashScreen.jsx
│   │   │   ├── AuthScreen.jsx
│   │   │   └── *.css
│   │   ├── home/              # Home and activity screens
│   │   │   ├── HomeScreen.jsx
│   │   │   ├── ActivityScreen.jsx
│   │   │   └── *.css
│   │   ├── issues/            # Issue reporting
│   │   │   ├── IssueReport.jsx
│   │   │   └── *.css
│   │   ├── mentorship/        # Mentor discovery
│   │   │   ├── MentorshipScreen.jsx
│   │   │   ├── MentorCard.jsx
│   │   │   └── *.css
│   │   ├── chat/              # Messaging
│   │   │   ├── ChatScreen.jsx
│   │   │   └── *.css
│   │   └── profile/           # Profile setup
│   │       ├── ProfileSetup.jsx
│   │       └── *.css
│   ├── contexts/
│   │   └── AuthContext.jsx    # Authentication context
│   ├── services/
│   │   ├── firebase.js        # Firebase initialization
│   │   ├── auth.js            # Authentication service
│   │   ├── database.js        # Firestore operations
│   │   └── gemini.js          # AI moderation & matching
│   ├── styles/
│   │   └── global.css         # Global styles & design system
│   ├── config.js              # Configuration (API keys, domains)
│   ├── App.jsx                # Main app component
│   └── main.jsx               # Entry point
├── public/
├── firebase/
│   ├── firestore.rules        # Database security rules
│   ├── firestore.indexes.json # Database indexes
│   └── storage.rules          # Storage security rules
├── firebase.json              # Firebase configuration
├── package.json               # Dependencies
└── vite.config.js            # Vite configuration
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Firebase account
- Google AI Studio account (for Gemini API)

### Step 1: Clone and Install

```bash
# Navigate to project directory
cd campuslink

# Install dependencies
npm install
```

### Step 2: Firebase Setup

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Google Analytics (optional)

2. **Enable Services**
   - **Authentication**: Enable Email/Password sign-in method
   - **Firestore Database**: Create database in production mode
   - **Storage**: Enable Firebase Storage
   - **Hosting**: Enable Firebase Hosting

3. **Get Firebase Config**
   - Go to Project Settings > General
   - Scroll to "Your apps" section
   - Click "Web" icon to register web app
   - Copy the configuration object

4. **Update Configuration**
   - Open `src/config.js`
   - Replace Firebase config values with your project's values

```javascript
export const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### Step 3: Gemini API Setup

1. **Get API Key**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key

2. **Update Configuration**
   - Open `src/config.js`
   - Add your Gemini API key

```javascript
export const GEMINI_API_KEY = "your-gemini-api-key";
```

### Step 4: Configure Domains & Admins

Update `src/config.js` with your college email domains and admin emails:

```javascript
export const ALLOWED_EMAIL_DOMAINS = [
  "student.yourcollege.edu",
  "edu.yourcollege.in"
];

export const ADMIN_EMAILS = [
  "admin@yourcollege.edu"
];
```

### Step 5: Deploy Firebase Rules

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (if not already done)
firebase init

# Select:
# - Firestore
# - Storage
# - Hosting

# Deploy security rules
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
firebase deploy --only firestore:indexes
```

### Step 6: Run Development Server

```bash
npm run dev
```

The app will open at `http://localhost:3000`

### Step 7: Build for Production

```bash
npm run build
```

### Step 8: Deploy to Firebase Hosting

```bash
npm run deploy
```

Your app will be live at `https://your-project.web.app`

## 🗄 Data Models

### Users Collection
```javascript
{
  email: string,
  isAnonymous: boolean,
  isAdmin: boolean,
  createdAt: timestamp,
  emailVerified: boolean
}
```

### Profiles Collection
```javascript
{
  userId: string,
  department: string,
  year: string,
  skillsOffered: string[],
  skillsWanted: string[],
  bio: string (max 120 chars),
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Issues Collection
```javascript
{
  category: "Safety" | "Hygiene" | "Infrastructure" | "Canteen",
  description: string (max 300 chars),
  imageUrl: string | null,
  isAnonymous: boolean,
  reportedBy: string | null,
  status: "Open" | "In Review" | "Resolved",
  priority: "Low" | "Medium" | "High",
  tags: string[],
  summary: string,
  createdAt: timestamp,
  updatedAt: timestamp,
  statusHistory: Array<{
    status: string,
    timestamp: string,
    note: string,
    updatedBy: string
  }>
}
```

### Mentor Requests Collection
```javascript
{
  fromUserId: string,
  toUserId: string,
  message: string,
  status: "pending" | "accepted" | "rejected",
  createdAt: timestamp,
  respondedAt: timestamp
}
```

### Chat Rooms Collection
```javascript
{
  participants: string[],
  createdAt: timestamp,
  lastMessageAt: timestamp
}
```

### Messages Collection
```javascript
{
  chatRoomId: string,
  senderId: string,
  text: string,
  createdAt: timestamp
}
```

## 🎨 Design System

### Color Palette
- **Primary**: Muted teal (#2d5f5d) - Calm, trustworthy
- **Accent**: Warm terracotta (#d97d54) - Friendly, approachable
- **Background**: Off-white (#faf9f7) - Soft, easy on eyes
- **Text**: Near-black (#2a2a2a) - High readability

### Typography
- **Headings**: Source Serif 4 - Classic, scholarly feel
- **Body**: DM Sans - Modern, readable

### Principles
- **Calm**: No aggressive colors, animations, or notifications
- **Minimal**: Clean layouts, generous white space
- **Trustworthy**: Professional typography, subtle shadows
- **Non-addictive**: No infinite scroll, likes, or engagement metrics

## 🔐 Security Features

1. **Content Moderation**
   - All user-generated content passes through Gemini AI
   - Detects profanity, hate speech, inappropriate content
   - Blocks submissions with safety concerns

2. **Email Verification**
   - Only college email domains allowed
   - Email verification sent on signup

3. **Access Control**
   - Firestore security rules enforce user permissions
   - Admin privileges verified server-side
   - Private chats inaccessible to admins

4. **Data Privacy**
   - Anonymous reporting preserves user identity
   - Chat messages encrypted in transit (Firebase)
   - Minimal data collection

## 🧪 Testing

### Test User Accounts
Create test accounts with your college domain for development:
- Regular user: test@student.yourcollege.edu
- Admin user: admin@yourcollege.edu

### Test Scenarios
1. **Anonymous Reporting**: Navigate anonymously and report an issue
2. **Sign Up Flow**: Create account → Set up profile → Find mentor
3. **Issue Tracking**: Report issue → Check status in Activity
4. **Mentorship**: Search mentors → Send request → Accept → Chat
5. **Content Moderation**: Try submitting inappropriate content (should be blocked)

## 📱 Features Checklist

- [x] Splash screen with tagline
- [x] Email/password authentication
- [x] Anonymous access for issue reporting
- [x] Profile setup (department, year, skills, bio)
- [x] Home screen with card navigation
- [x] Issue reporting with categories
- [x] Image upload for issues
- [x] AI-powered issue categorization
- [x] Issue status tracking
- [x] Mentor discovery with natural language search
- [x] AI-powered mentor matching
- [x] Mentor request system
- [x] Direct messaging
- [x] Activity tracking (issues, requests, chats)
- [x] Content moderation with Gemini
- [x] Admin issue management
- [x] Responsive design
- [x] Firebase security rules
- [x] Production deployment

## 🚫 What's NOT Included (By Design)

- Followers or connections list
- Like/upvote system
- Comments or public discussion threads
- Infinite scroll
- Read receipts or online status
- Push notifications (intentionally calm)
- User rankings or leaderboards
- Public profiles

## 🐛 Troubleshooting

### Firebase Initialization Error
- Check that config values in `src/config.js` are correct
- Ensure Firebase services are enabled in console

### Authentication Error
- Verify email/password authentication is enabled
- Check email domain is in ALLOWED_EMAIL_DOMAINS

### Gemini API Error
- Verify API key is correct
- Check API quotas in Google Cloud Console
- Ensure Gemini API is enabled

### Deployment Issues
- Run `firebase login` to authenticate
- Ensure `firebase.json` points to correct build directory
- Check Firebase Hosting is enabled

## 📄 License

This project is proprietary. All rights reserved.

## 🤝 Contributing

This is a startup MVP project. For contributions or collaboration:
1. Fork the repository
2. Create feature branch
3. Submit pull request with detailed description

## 📞 Support

For issues or questions:
- Create GitHub issue with detailed description
- Include browser console errors
- Provide steps to reproduce

## 🚀 Future Enhancements

Potential features for future iterations:
- Email notifications for issue updates
- Advanced search filters for mentors
- Mentor ratings (post-connection only)
- Dark mode
- Multi-language support
- Mobile apps (React Native)
- Calendar integration for mentor sessions
- Anonymous feedback for resolved issues

---

**Built with care for college communities worldwide. 🎓**
