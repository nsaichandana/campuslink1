// DIAGNOSTIC SCRIPT - Run this in browser console to check mentor requests
// Open browser console (F12) and paste this entire script

console.log('=== CampusLink Mentor Requests Diagnostic ===');

// 1. Check authentication
const auth = window.firebase?.auth?.();
const currentUser = auth?.currentUser;

console.log('1. Authentication Check:');
console.log('- User authenticated:', !!currentUser);
if (currentUser) {
  console.log('- User ID:', currentUser.uid);
  console.log('- Email:', currentUser.email);
} else {
  console.error('❌ No user authenticated!');
}

// 2. Check Firestore connection
const db = window.firebase?.firestore?.();
console.log('\n2. Firestore Check:');
console.log('- Firestore initialized:', !!db);

// 3. Query mentor requests (as sent)
if (db && currentUser) {
  console.log('\n3. Checking Sent Requests...');
  
  // Try with senderId
  db.collection('mentorRequests')
    .where('senderId', '==', currentUser.uid)
    .get()
    .then(snapshot => {
      console.log('- Found (senderId):', snapshot.size, 'requests');
      snapshot.forEach(doc => {
        console.log('  Request:', doc.id, doc.data());
      });
    })
    .catch(err => console.error('- Error (senderId):', err));
  
  // Try with fromUserId (old field)
  db.collection('mentorRequests')
    .where('fromUserId', '==', currentUser.uid)
    .get()
    .then(snapshot => {
      console.log('- Found (fromUserId - OLD):', snapshot.size, 'requests');
      snapshot.forEach(doc => {
        console.log('  Request:', doc.id, doc.data());
      });
    })
    .catch(err => console.error('- Error (fromUserId):', err));
  
  // 4. Query received requests
  console.log('\n4. Checking Received Requests...');
  
  // Try with receiverId
  db.collection('mentorRequests')
    .where('receiverId', '==', currentUser.uid)
    .get()
    .then(snapshot => {
      console.log('- Found (receiverId):', snapshot.size, 'requests');
      snapshot.forEach(doc => {
        console.log('  Request:', doc.id, doc.data());
      });
    })
    .catch(err => console.error('- Error (receiverId):', err));
  
  // Try with toUserId (old field)
  db.collection('mentorRequests')
    .where('toUserId', '==', currentUser.uid)
    .get()
    .then(snapshot => {
      console.log('- Found (toUserId - OLD):', snapshot.size, 'requests');
      snapshot.forEach(doc => {
        console.log('  Request:', doc.id, doc.data());
      });
    })
    .catch(err => console.error('- Error (toUserId):', err));
  
  // 5. Check ALL mentor requests (to see if any exist)
  console.log('\n5. Checking ALL Requests in Collection...');
  db.collection('mentorRequests')
    .limit(10)
    .get()
    .then(snapshot => {
      console.log('- Total requests found:', snapshot.size);
      if (snapshot.size > 0) {
        console.log('- Sample documents:');
        snapshot.forEach(doc => {
          const data = doc.data();
          console.log('  ID:', doc.id);
          console.log('  Fields:', Object.keys(data));
          console.log('  Data:', data);
        });
      } else {
        console.warn('⚠️ No requests found in mentorRequests collection!');
      }
    })
    .catch(err => console.error('- Error:', err));
}

console.log('\n=== Diagnostic Complete ===');
console.log('Check the output above to identify the issue.');
