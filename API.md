# CampusLink API Documentation

This document describes the internal API structure and services used in CampusLink.

## Table of Contents
1. [Authentication Service](#authentication-service)
2. [Database Service](#database-service)
3. [Gemini AI Service](#gemini-ai-service)
4. [Firebase Configuration](#firebase-configuration)

---

## Authentication Service

Located: `src/services/auth.js`

### Functions

#### `isCollegeEmail(email: string): boolean`
Checks if email belongs to allowed college domain.

**Parameters:**
- `email` - Email address to validate

**Returns:** `true` if email domain is in ALLOWED_EMAIL_DOMAINS

**Example:**
```javascript
const valid = isCollegeEmail('student@college.edu');
```

---

#### `isAdmin(email: string): boolean`
Checks if email is in admin list.

**Parameters:**
- `email` - Email address to check

**Returns:** `true` if email is in ADMIN_EMAILS

---

#### `signUp(email: string, password: string): Promise<User>`
Creates new user account and sends verification email.

**Parameters:**
- `email` - College email address
- `password` - Password (min 6 characters)

**Returns:** Firebase User object

**Throws:** Error if email not from college domain

**Example:**
```javascript
try {
  const user = await signUp('student@college.edu', 'password123');
  console.log('User created:', user.uid);
} catch (error) {
  console.error('Signup failed:', error.message);
}
```

---

#### `signIn(email: string, password: string): Promise<User>`
Signs in existing user.

**Parameters:**
- `email` - College email address
- `password` - User password

**Returns:** Firebase User object

**Throws:** Error if credentials invalid or email not from college

---

#### `signOut(): Promise<void>`
Signs out current user.

---

#### `resetPassword(email: string): Promise<void>`
Sends password reset email.

**Parameters:**
- `email` - User's email address

---

#### `getUserProfile(userId: string): Promise<Object>`
Retrieves user document and profile.

**Parameters:**
- `userId` - Firebase user UID

**Returns:**
```javascript
{
  email: string,
  isAnonymous: boolean,
  isAdmin: boolean,
  createdAt: Timestamp,
  profile: {
    department: string,
    year: string,
    skillsOffered: string[],
    skillsWanted: string[],
    bio: string
  } | null
}
```

---

## Database Service

Located: `src/services/database.js`

### Profile Functions

#### `createProfile(userId: string, profileData: Object): Promise<Object>`
Creates user profile with AI moderation.

**Parameters:**
```javascript
{
  department: string,
  year: string,
  skillsOffered: string[],
  skillsWanted: string[],
  bio: string (max 120 chars)
}
```

**Returns:** Created profile object

**Throws:** Error if bio fails moderation

---

#### `getProfile(userId: string): Promise<Object | null>`
Retrieves user profile.

---

#### `updateProfile(userId: string, updates: Object): Promise<void>`
Updates profile fields with AI moderation on bio changes.

---

### Issue Functions

#### `createIssue(issueData: Object, imageFile?: File): Promise<Object>`
Creates campus issue with AI categorization.

**Parameters:**
```javascript
{
  category: "Safety" | "Hygiene" | "Infrastructure" | "Canteen",
  description: string (max 300 chars),
  isAnonymous: boolean,
  userId: string | null
}
```

**Optional:** `imageFile` - Image file (max 5MB)

**Returns:**
```javascript
{
  id: string,
  category: string,
  description: string,
  imageUrl: string | null,
  isAnonymous: boolean,
  reportedBy: string | null,
  status: "Open",
  priority: "Low" | "Medium" | "High",
  tags: string[],
  summary: string,
  createdAt: Timestamp,
  statusHistory: Array
}
```

**Throws:** Error if content fails moderation

---

#### `getIssues(filters?: Object): Promise<Array>`
Retrieves issues with optional filtering.

**Filters:**
```javascript
{
  category?: string,
  status?: string,
  priority?: string,
  userId?: string,
  limit?: number
}
```

---

#### `updateIssueStatus(issueId: string, newStatus: string, note: string, adminEmail: string): Promise<void>`
Updates issue status (admin only).

**Parameters:**
- `issueId` - Issue document ID
- `newStatus` - "Open" | "In Review" | "Resolved"
- `note` - Optional admin note
- `adminEmail` - Admin's email for audit

---

#### `subscribeToIssues(callback: Function, filters?: Object): Unsubscribe`
Real-time subscription to issues.

**Parameters:**
- `callback` - Function called with issues array on updates
- `filters` - Optional filters object

**Returns:** Unsubscribe function

**Example:**
```javascript
const unsubscribe = subscribeToIssues((issues) => {
  console.log('Issues updated:', issues.length);
});

// Later: unsubscribe();
```

---

### Mentorship Functions

#### `searchMentors(currentUserId: string, searchQuery: string, searchSkills: string[]): Promise<Array>`
Searches for mentors with AI-powered matching.

**Parameters:**
- `currentUserId` - Current user's ID (excluded from results)
- `searchQuery` - Natural language search query
- `searchSkills` - Array of skills to match

**Returns:**
```javascript
[
  {
    id: string,
    userId: string,
    department: string,
    year: string,
    skillsOffered: string[],
    skillsWanted: string[],
    bio: string,
    matchScore: number (0-100),
    matchReason: string,
    matchedSkills: string[]
  }
]
```

---

#### `sendMentorRequest(fromUserId: string, toUserId: string, message?: string): Promise<Object>`
Sends mentor connection request.

**Parameters:**
- `fromUserId` - Requesting user's ID
- `toUserId` - Target mentor's ID
- `message` - Optional intro message

**Returns:** Created request object

**Throws:** Error if request already exists or message fails moderation

---

#### `respondToMentorRequest(requestId: string, accept: boolean): Promise<void>`
Accept or reject mentor request.

**Parameters:**
- `requestId` - Request document ID
- `accept` - true to accept, false to reject

**Side Effect:** Creates chat room if accepted

---

#### `getMentorRequests(userId: string, type: "received" | "sent"): Promise<Array>`
Gets mentor requests for user.

---

### Chat Functions

#### `getChatRooms(userId: string): Promise<Array>`
Gets all chat rooms for user.

**Returns:**
```javascript
[
  {
    id: string,
    participants: string[],
    createdAt: Timestamp,
    lastMessageAt: Timestamp
  }
]
```

---

#### `sendMessage(chatRoomId: string, senderId: string, text: string): Promise<void>`
Sends chat message with AI moderation.

**Parameters:**
- `chatRoomId` - Chat room ID
- `senderId` - Sender's user ID
- `text` - Message text

**Throws:** Error if message fails moderation

---

#### `subscribeToMessages(chatRoomId: string, callback: Function): Unsubscribe`
Real-time subscription to chat messages.

**Parameters:**
- `chatRoomId` - Chat room ID
- `callback` - Function called with messages array

**Returns:** Unsubscribe function

---

#### `getMessages(chatRoomId: string): Promise<Array>`
Gets all messages in chat room.

---

## Gemini AI Service

Located: `src/services/gemini.js`

### Functions

#### `moderateContent(text: string, type?: string): Promise<Object>`
Moderates user-generated content using Gemini AI.

**Parameters:**
- `text` - Content to moderate
- `type` - Content type: "general", "profile", "issue", "chat", "message"

**Returns:**
```javascript
{
  safe: boolean,
  reason: string,
  severity: "low" | "medium" | "high"
}
```

**Checks:**
- Profanity or abusive language
- Hate speech or discrimination
- Sexual or inappropriate content
- Personal attacks or bullying
- Spam or promotional content
- Requests for illegal activities

---

#### `categorizeIssue(description: string): Promise<Object>`
Categorizes and prioritizes campus issues.

**Parameters:**
- `description` - Issue description

**Returns:**
```javascript
{
  category: "Safety" | "Hygiene" | "Infrastructure" | "Canteen",
  priority: "Low" | "Medium" | "High",
  tags: string[],
  summary: string
}
```

---

#### `calculateMentorMatch(mentorSkills: string[], learnerNeeds: string[], mentorBio: string, learnerBio: string): Promise<Object>`
Calculates mentor-learner compatibility.

**Parameters:**
- `mentorSkills` - Skills mentor offers
- `learnerNeeds` - Skills learner wants
- `mentorBio` - Mentor's bio
- `learnerBio` - Learner's bio

**Returns:**
```javascript
{
  score: number (0-100),
  reason: string,
  matchedSkills: string[]
}
```

---

#### `parseSearchQuery(query: string): Promise<Object>`
Extracts skills and keywords from natural language search.

**Parameters:**
- `query` - Search query string

**Returns:**
```javascript
{
  skills: string[],
  keywords: string[]
}
```

**Example:**
```javascript
const result = await parseSearchQuery("I want to learn Python and web development");
// { skills: ["python", "web", "development"], keywords: ["learn", ...] }
```

---

## Firebase Configuration

Located: `src/config.js`

### Configuration Variables

#### `firebaseConfig: Object`
Firebase project configuration.

**Required:**
- `apiKey` - Firebase API key
- `authDomain` - Authentication domain
- `projectId` - Firebase project ID
- `storageBucket` - Storage bucket URL
- `messagingSenderId` - Messaging sender ID
- `appId` - Firebase app ID

---

#### `GEMINI_API_KEY: string`
Google Gemini API key for AI features.

**Get from:** https://makersuite.google.com/app/apikey

---

#### `ALLOWED_EMAIL_DOMAINS: string[]`
List of allowed college email domains.

**Example:**
```javascript
[
  "student.college.edu",
  "edu.college.in"
]
```

---

#### `ADMIN_EMAILS: string[]`
List of admin email addresses.

**Example:**
```javascript
[
  "admin@college.edu",
  "support@college.edu"
]
```

---

## Error Handling

All service functions implement try-catch error handling:

```javascript
try {
  const result = await someFunction();
  // Handle success
} catch (error) {
  console.error('Error:', error.message);
  // Show user-friendly error message
}
```

### Common Error Types

**Authentication Errors:**
- `auth/email-already-in-use`
- `auth/invalid-email`
- `auth/user-not-found`
- `auth/wrong-password`
- `auth/weak-password`

**Firestore Errors:**
- `permission-denied`
- `not-found`
- `already-exists`

**Custom Errors:**
- Content moderation failures
- Invalid email domain
- Missing required fields

---

## Rate Limits

### Gemini API
- Free tier: 60 requests/minute
- Handle gracefully with fallback responses

### Firebase
- Firestore: 10,000 reads/writes per day (free tier)
- Storage: 5GB total, 1GB/day download (free tier)
- Authentication: 10k verifications/month (free tier)

---

## Best Practices

1. **Always handle errors gracefully**
2. **Validate input before API calls**
3. **Use TypeScript or JSDoc for type safety**
4. **Implement loading states**
5. **Show user-friendly error messages**
6. **Log errors for debugging**
7. **Unsubscribe from real-time listeners**
8. **Implement retry logic for transient failures**

---

## Example: Complete User Flow

```javascript
// 1. Sign up
const user = await signUp('student@college.edu', 'password123');

// 2. Create profile
await createProfile(user.uid, {
  department: 'Computer Science',
  year: '3rd Year',
  skillsOffered: ['Python', 'React'],
  skillsWanted: ['Machine Learning', 'UI Design'],
  bio: 'Love coding and teaching!'
});

// 3. Search mentors
const mentors = await searchMentors(user.uid, 'machine learning', ['Machine Learning']);

// 4. Send request
await sendMentorRequest(user.uid, mentors[0].userId, 'Hi! I'd love to learn ML from you.');

// 5. Report issue
await createIssue({
  category: 'Infrastructure',
  description: 'Broken water fountain in building A',
  isAnonymous: false,
  userId: user.uid
});
```

---

For more details, see the source code comments in each service file.
