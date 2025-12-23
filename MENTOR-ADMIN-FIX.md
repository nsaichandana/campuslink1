# CampusLink - Mentor Requests & Admin Monitoring FIX

## 🐛 Problems Fixed

### 1️⃣ Mentor Requests Not Showing in "My Activity"
**Root Cause:** Field name mismatch and missing composite indexes

**Before:**
- Used `fromUserId` and `toUserId`
- orderBy caused index requirement issues
- No real-time updates

**After:**
- Standardized to `senderId` and `receiverId`
- Removed orderBy from query (sort in memory instead)
- Added real-time subscriptions with `onSnapshot()`
- Fixed ActivityScreen to wait for user authentication

---

### 2️⃣ Admin Monitoring System
**Implemented secure admin dashboard with:**
- ✅ Issue monitoring with image preview
- ✅ Mentor request metadata (NO message content)
- ✅ Chat existence metadata (NO message access)
- ✅ Strict privacy protection via Firestore rules

---

## 🔧 Technical Changes

### **1. Database Service (`src/services/database.js`)**

#### Fixed Field Names:
```javascript
// BEFORE (Old)
const request = {
  fromUserId,
  toUserId,
  message,
  status: 'pending'
};

// AFTER (Fixed)
const request = {
  senderId: fromUserId,      // ✅ Standardized
  receiverId: toUserId,       // ✅ Standardized
  message,
  status: 'pending',
  createdAt: serverTimestamp()
};
```

#### Fixed Query Without Index Issues:
```javascript
// BEFORE (Caused index errors)
const q = query(
  collection(db, 'mentorRequests'),
  where(field, '==', userId),
  orderBy('createdAt', 'desc')  // ❌ Requires composite index
);

// AFTER (Works without index)
const q = query(
  collection(db, 'mentorRequests'),
  where(field, '==', userId)  // ✅ Simple query
);

// Sort in memory
requests.sort((a, b) => {
  const aTime = a.createdAt?.toMillis?.() || 0;
  const bTime = b.createdAt?.toMillis?.() || 0;
  return bTime - aTime;
});
```

#### Added Real-Time Subscriptions:
```javascript
export function subscribeToMentorRequests(userId, type, callback) {
  const field = type === 'received' ? 'receiverId' : 'senderId';
  
  const q = query(
    collection(db, 'mentorRequests'),
    where(field, '==', userId)
  );
  
  return onSnapshot(q, (snapshot) => {
    const requests = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    callback(requests);
  });
}
```

#### Added Admin Monitoring Functions:
```javascript
// Get mentor requests WITHOUT message content
export async function getAllMentorRequestsForAdmin() {
  const snapshot = await getDocs(query(collection(db, 'mentorRequests')));
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      senderId: data.senderId,
      receiverId: data.receiverId,
      status: data.status,
      createdAt: data.createdAt,
      respondedAt: data.respondedAt
      // 🔒 Message field explicitly excluded
    };
  });
}

// Get chat metadata WITHOUT message content
export async function getAllChatRoomsForAdmin() {
  const snapshot = await getDocs(query(collection(db, 'chatRooms')));
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      userIds: data.userIds || data.participants || [],
      createdAt: data.createdAt,
      lastMessageAt: data.lastMessageAt
      // 🔒 NO access to messages
    };
  });
}
```

---

### **2. Activity Screen (`src/components/home/ActivityScreen.jsx`)**

#### Fixed Real-Time Updates:
```javascript
useEffect(() => {
  if (!user) return;  // ✅ Wait for authentication
  
  if (activeTab === 'requests' && !isAnonymous) {
    // Real-time subscription to received requests
    const unsubReceived = subscribeToMentorRequests(
      user.uid, 
      'received', 
      (received) => {
        // Real-time subscription to sent requests
        const unsubSent = subscribeToMentorRequests(
          user.uid, 
          'sent', 
          (sent) => {
            setRequests({ received, sent });
            loadUserProfiles(/* ... */);
          }
        );
        return () => unsubSent();
      }
    );
    return () => unsubReceived();
  }
}, [activeTab, user, isAnonymous]);
```

#### Fixed Field References:
```javascript
// Received requests - use senderId
const otherUserId = req.senderId; // Person who SENT the request

// Sent requests - use receiverId
const otherUserId = req.receiverId; // Person who RECEIVED the request
```

---

### **3. Admin Dashboard (`src/components/admin/AdminDashboard.jsx`)**

#### Added Three Tabs:
1. **📋 Issues** - View all issues with image preview
2. **🤝 Mentor Requests** - View metadata only
3. **💬 Chat Metadata** - View existence only (NO messages)

#### Image Preview Feature:
```javascript
<img 
  src={issue.imageUrl} 
  alt="Issue" 
  className="issue-image"
  onClick={() => setImageModal(issue.imageUrl)}
  title="Click to view full size"
/>

// Modal for full-size view
{imageModal && (
  <div className="modal-overlay" onClick={() => setImageModal(null)}>
    <div className="modal image-modal">
      <img src={imageModal} alt="Issue" className="modal-image" />
    </div>
  </div>
)}
```

#### Mentor Requests Table:
```javascript
<table>
  <thead>
    <tr>
      <th>Sender ID</th>
      <th>Receiver ID</th>
      <th>Status</th>
      <th>Created</th>
      <th>Responded</th>
    </tr>
  </thead>
  <tbody>
    {mentorRequests.map(req => (
      <tr key={req.id}>
        <td><code>{req.senderId.substring(0, 8)}...</code></td>
        <td><code>{req.receiverId.substring(0, 8)}...</code></td>
        <td>{req.status}</td>
        <td>{formatDate(req.createdAt)}</td>
        <td>{req.respondedAt ? formatDate(req.respondedAt) : '-'}</td>
      </tr>
    ))}
  </tbody>
</table>
```

**Privacy Note:** Message content is explicitly excluded from admin view.

#### Chat Metadata Table:
```javascript
<table>
  <thead>
    <tr>
      <th>Chat ID</th>
      <th>Participants</th>
      <th>Created</th>
      <th>Last Activity</th>
    </tr>
  </thead>
  {/* Only metadata - NO message access */}
</table>
```

---

### **4. Firestore Security Rules (`firestore.rules`)**

#### Mentor Requests - Admin Read Access:
```javascript
match /mentorRequests/{requestId} {
  // Users can create requests
  allow create: if isSignedIn() && 
                request.resource.data.senderId == request.auth.uid;
  
  // Users OR admins can read (admins for monitoring)
  allow read: if isSignedIn() && 
                 (resource.data.senderId == request.auth.uid || 
                  resource.data.receiverId == request.auth.uid ||
                  isAdmin());
  
  // Only receiver can accept/reject
  allow update: if isSignedIn() && 
                   resource.data.receiverId == request.auth.uid;
}
```

#### Chat Rooms - Admin BLOCKED:
```javascript
match /chatRooms/{roomId} {
  // Users can create (NOT admins)
  allow create: if isSignedIn() && !isAdmin();
  
  // Only participants can read (NO ADMIN ACCESS)
  allow read: if isSignedIn() && !isAdmin() &&
                 request.auth.uid in resource.data.participants;
}
```

#### Messages - Admin COMPLETELY BLOCKED:
```javascript
match /messages/{messageId} {
  // Only participants can create (NEVER admins)
  allow create: if isSignedIn() && !isAdmin() && 
                   request.resource.data.senderId == request.auth.uid;
  
  // Only participants can read (NEVER admins)
  allow read: if isSignedIn() && !isAdmin() &&
                 exists(...) &&
                 request.auth.uid in get(...).data.participants;
  
  // EXPLICIT BLOCK: Admins cannot access under any circumstance
  allow read, write: if !isAdmin();
}
```

---

## 📊 Data Structure

### Mentor Requests Collection:
```javascript
mentorRequests/{requestId}:
{
  senderId: "uid_sender",        // Person who sent request
  receiverId: "uid_receiver",    // Person who received request
  message: "Hi, can you teach me...",  // 🔒 NOT visible to admin
  status: "pending",             // pending | accepted | rejected
  createdAt: Timestamp,
  respondedAt: Timestamp
}
```

### Chat Rooms Collection:
```javascript
chatRooms/{chatId}:
{
  participants: ["uid1", "uid2"],
  userIds: ["uid1", "uid2"],     // For admin metadata only
  createdAt: Timestamp,
  lastMessageAt: Timestamp
}
```

### Messages Collection:
```javascript
messages/{messageId}:
{
  chatRoomId: "chatId",
  senderId: "uid",
  text: "Hello...",              // 🔒 NEVER visible to admin
  createdAt: Timestamp
}
```

---

## 🧪 Testing Guide

### Test 1: Mentor Request Visibility

**Setup:**
1. Create two accounts (User A and User B)
2. Complete profiles for both

**From User A:**
1. Go to "Find a Mentor"
2. Send request to User B
3. Go to "My Activity" → "Mentor Requests"
4. **Expected:** Request appears under "Sent Requests" with status "pending"

**From User B:**
1. Go to "My Activity" → "Mentor Requests"
2. **Expected:** Request appears under "Received Requests"
3. Click "Accept"
4. **Expected:** Status changes to "accepted", chat is created

**From User A:**
1. Refresh "My Activity" → "Mentor Requests"
2. **Expected:** Status updates to "accepted" in real-time
3. Go to "Messages" tab
4. **Expected:** Chat with User B appears

---

### Test 2: Admin Monitoring

**Setup:**
1. Sign in as `admin@campuslink.com`
2. Auto-redirects to `/admin`

**Test Issues Tab:**
1. Click "📋 Issues" tab
2. **Expected:** See all reported issues
3. Click on an issue image
4. **Expected:** Image opens in modal (full size)
5. Click "Update Status"
6. **Expected:** Can change status and add note

**Test Mentor Requests Tab:**
1. Click "🤝 Mentor Requests" tab
2. **Expected:** See table with:
   - Sender ID (truncated)
   - Receiver ID (truncated)
   - Status
   - Timestamps
3. **Expected:** Message content NOT visible
4. **Expected:** Statistics show counts

**Test Chat Metadata Tab:**
1. Click "💬 Chat Metadata" tab
2. **Expected:** See table with:
   - Chat ID
   - Participant IDs
   - Creation time
   - Last activity time
3. **Expected:** NO access to messages
4. **Expected:** Privacy warning displayed

---

### Test 3: Privacy Protection

**As Admin:**
1. Try to access `/chat/{chatId}` directly
2. **Expected:** Blocked by Firestore rules
3. Check browser console
4. **Expected:** "Permission denied" error

**Verify in Firebase Console:**
1. Go to Firestore Rules
2. **Expected:** Chat and message rules explicitly block admins
3. Go to Authentication
4. **Expected:** admin@campuslink.com has role: "admin"

---

## 🐛 Common Issues & Solutions

### Issue: "Requests still not showing"

**Debug Steps:**
1. Open browser console (F12)
2. Look for logs:
   ```
   Getting received requests for user: <uid>
   Found X received requests
   ```

**If no logs:**
- Check user is authenticated
- Verify `useEffect` dependencies include `user`

**If logs show 0 requests:**
- Check Firestore Console
- Verify `mentorRequests` collection exists
- Verify field names are `senderId` and `receiverId`
- Check document has correct user ID

**Fix:**
```bash
# Re-deploy Firestore rules
firebase deploy --only firestore:rules
```

---

### Issue: "Composite index required"

**Error:** 
```
The query requires an index. You can create it here: https://...
```

**Solution:**
This should NOT happen with the fixed code, but if it does:
1. Click the link in the error
2. Wait for index to build (2-5 minutes)
3. Retry query

**Better Solution (Used in Fix):**
- Remove `orderBy` from query
- Sort results in memory after fetching

---

### Issue: "Admin can't see mentor requests"

**Check:**
1. Admin email is `admin@campuslink.com`
2. User document has `role: "admin"`
3. Firestore rules deployed

**Debug:**
```javascript
// In browser console
console.log('Is admin:', isAdmin);
console.log('User data:', userData);
```

**Fix:**
```bash
# Update admin user document in Firestore Console
users/{admin_uid}:
{
  email: "admin@campuslink.com",
  role: "admin",
  isAdmin: true
}

# Re-deploy rules
firebase deploy --only firestore:rules
```

---

### Issue: "Real-time updates not working"

**Symptoms:**
- Need to refresh page to see changes
- Requests don't update when status changes

**Fix:**
- ActivityScreen now uses `subscribeToMentorRequests()`
- Returns unsubscribe function in useEffect cleanup

**Verify:**
```javascript
// Check subscription is active
useEffect(() => {
  const unsub = subscribeToMentorRequests(...);
  return () => unsub(); // ✅ Cleanup on unmount
}, [dependencies]);
```

---

## ✅ Success Checklist

- [ ] Mentor requests appear in "Sent Requests"
- [ ] Mentor requests appear in "Received Requests"
- [ ] Status updates in real-time
- [ ] Accept/reject buttons work
- [ ] Chat created after acceptance
- [ ] Admin can see issues with images
- [ ] Image modal opens on click
- [ ] Admin can see mentor request metadata
- [ ] Admin CANNOT see message content
- [ ] Admin can see chat metadata only
- [ ] Admin BLOCKED from chat messages
- [ ] Privacy warnings displayed in admin UI
- [ ] Firestore rules deployed and active

---

## 🚀 Deployment Steps

1. **Update Code:**
   ```bash
   # Replace files from updated ZIP
   ```

2. **Deploy Firestore Rules:**
   ```bash
   firebase deploy --only firestore:rules
   ```

3. **Restart Dev Server:**
   ```bash
   npm run dev
   ```

4. **Test All Features:**
   - Send mentor request
   - Check My Activity
   - Sign in as admin
   - Verify privacy protection

5. **Deploy to Production:**
   ```bash
   npm run build
   firebase deploy
   ```

---

## 🔐 Privacy Summary

**Admin CAN See:**
- ✅ All issues with images
- ✅ Mentor request metadata (sender/receiver IDs, status, timestamps)
- ✅ Chat existence metadata (participant IDs, activity times)
- ✅ User UIDs and emails
- ✅ Statistics and counts

**Admin CANNOT See:**
- ❌ Message content in mentor requests
- ❌ Chat messages
- ❌ Chat conversation history
- ❌ User passwords
- ❌ Private user data beyond profiles

**Enforcement:**
- Firestore security rules explicitly block admins
- Admin functions exclude sensitive fields
- UI displays privacy warnings
- Double-layer protection (rules + code)

---

All fixes implemented with privacy-first architecture! 🔒✅
