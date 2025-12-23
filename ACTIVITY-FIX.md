# Activity Screen - Requests & Messages Fix

## 🐛 Problem Fixed

**Issue:** In "My Activity" screen:
- Received Requests section was empty
- Sent Requests section was empty  
- Messages/Chats showed no user information

## ✅ What Was Fixed

### 1. **Request State Initialization**
**Before:**
```javascript
const [requests, setRequests] = useState([]);
```

**After:**
```javascript
const [requests, setRequests] = useState({ received: [], sent: [] });
```

**Why:** The state needed to be an object with `received` and `sent` arrays to match how the data is loaded and displayed.

---

### 2. **Added User Profile Loading**
**New Feature:** Activity screen now loads profiles for all users involved in requests and chats

```javascript
// Load profiles for users in requests
const userIds = new Set();
received.forEach(req => {
  if (req.fromUserId) userIds.add(req.fromUserId);
  if (req.toUserId) userIds.add(req.toUserId);
});

// Fetch profiles
const profiles = {};
for (const uid of userIds) {
  const profile = await getProfile(uid);
  if (profile) profiles[uid] = profile;
}
```

**Result:** You now see:
- ✅ Who sent you requests (department, year)
- ✅ Who you sent requests to
- ✅ Skills they can teach
- ✅ Their profile avatars

---

### 3. **Enhanced Request Display**

#### **Received Requests Now Show:**
- User's department and year
- Time received
- Their message (if any)
- Skills they can teach
- Accept/Decline buttons (if pending)
- Status (pending/accepted/rejected)

#### **Sent Requests Now Show:**
- Who you sent to (department, year)
- Time sent
- Your message (if any)
- Status with color coding
- "View Messages" button (if accepted)

---

### 4. **Enhanced Chat Display**

**Before:** Just showed "Chat Room" with timestamp

**After:** Shows:
- Partner's department
- Partner's year
- Last message time
- Profile avatar with first letter of department

---

### 5. **Added Debug Logging**

The component now logs:
```javascript
console.log('Loading mentor requests for user:', user.uid);
console.log('Received requests:', received);
console.log('Sent requests:', sent);
console.log('Chat rooms:', rooms);
```

**Use this to debug:** Open browser console (F12) and check if data is loading correctly.

---

## 📋 Testing Steps

### Test Received Requests:

1. **Create two accounts:**
   - Account A: `user1@college.edu`
   - Account B: `user2@college.edu`

2. **Set up profiles for both**

3. **From Account A:**
   - Go to "Find a Mentor"
   - Search for mentors
   - Send request to Account B

4. **From Account B:**
   - Go to "My Activity"
   - Click "Mentor Requests" tab
   - Should see request from Account A with:
     - Their department
     - Their year
     - Message (if sent)
     - Accept/Decline buttons

5. **Accept the request**
   - Click "Accept"
   - Go to "Messages" tab
   - Should see new chat with Account A

---

### Test Sent Requests:

1. **From Account A (who sent request):**
   - Go to "My Activity"
   - Click "Mentor Requests" tab
   - Scroll to "Sent Requests"
   - Should see:
     - Request to Account B
     - Status: "pending" (yellow tag)
     - Your message

2. **After B accepts:**
   - Status changes to "accepted" (blue tag)
   - "View Messages" button appears
   - Click it to open chat

---

### Test Messages:

1. **From either account:**
   - Go to "My Activity"
   - Click "Messages" tab
   - Should see:
     - Chat with partner
     - Partner's department
     - Partner's year
     - Last message time

2. **Click on chat:**
   - Opens chat screen
   - Can send messages

---

## 🐛 Common Issues & Solutions

### "No pending requests" even though requests were sent

**Check:**
1. Open browser console (F12)
2. Look for logs:
   ```
   Loading mentor requests for user: <uid>
   Received requests: []
   Sent requests: []
   ```

3. If arrays are empty:
   - Check Firebase Console > Firestore
   - Look in `mentorRequests` collection
   - Verify documents exist with correct `fromUserId` and `toUserId`

**Fix:**
- Ensure mentor request was actually created
- Check Firestore rules allow reading requests
- Verify user IDs match

---

### Requests show but no user info

**Check:**
```javascript
// In browser console
console.log('User profiles loaded:', userProfiles);
```

If empty:
- Profile might not exist in Firestore
- Check `profiles` collection in Firebase Console
- Ensure profile was created during setup

**Fix:**
- Have users complete profile setup
- Verify `profiles/{userId}` documents exist

---

### Messages tab empty even after accepting request

**Check:**
1. Firestore Console > `chatRooms` collection
2. Look for document with both user IDs in `participants` array

**Debug:**
```javascript
console.log('Chat rooms:', rooms);
```

If empty but request was accepted:
- Check `respondToMentorRequest` function
- Verify it creates chat room on accept
- Check Firestore rules allow creating `chatRooms`

---

## 🔧 Code Changes Made

### Files Modified:
1. **src/components/home/ActivityScreen.jsx**
   - Fixed state initialization
   - Added profile loading
   - Enhanced request display
   - Enhanced chat display
   - Added debug logging

2. **src/components/home/ActivityScreen.css**
   - Added `.request-skills` styling
   - Added `.request-status` styling
   - Improved spacing and layout

---

## 📊 Data Flow

```
User clicks "Mentor Requests" tab
    ↓
loadData() is called
    ↓
getMentorRequests(userId, 'received') → Returns requests where toUserId = userId
getMentorRequests(userId, 'sent') → Returns requests where fromUserId = userId
    ↓
For each request, extract fromUserId and toUserId
    ↓
Load profiles for all unique user IDs
    ↓
Store profiles in userProfiles state
    ↓
Render requests with profile information
```

---

## ✅ Success Checklist

- [ ] Received requests show sender info
- [ ] Sent requests show recipient info
- [ ] Accept/Decline buttons work
- [ ] Status updates in real-time
- [ ] Chat appears after accepting request
- [ ] Messages tab shows partner info
- [ ] Can click chat to open conversation
- [ ] Debug logs show data loading

---

## 🚀 Next Steps

If you're still not seeing requests:

1. **Verify data exists:**
   ```bash
   # Check Firestore Console
   # Collections: mentorRequests, chatRooms, profiles
   ```

2. **Check Firestore rules:**
   ```bash
   firebase deploy --only firestore:rules
   ```

3. **Look at browser console:**
   - Check for errors
   - Verify data is loading
   - Check user ID matches

4. **Test with fresh accounts:**
   - Create new test accounts
   - Complete profiles
   - Send requests
   - Check Activity screen

---

## 💡 Pro Tips

1. **Use browser DevTools:**
   - Network tab to see Firestore queries
   - Console to see debug logs
   - React DevTools to inspect state

2. **Test incrementally:**
   - First verify profiles load
   - Then test sending requests
   - Then test accepting
   - Finally test chat creation

3. **Check timestamps:**
   - Firestore timestamps must be valid
   - Use `serverTimestamp()` when creating docs

---

Everything should now work! If you still have issues, check the browser console for error messages.
