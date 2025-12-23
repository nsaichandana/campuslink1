// MIGRATION SCRIPT - Fixes old mentor requests to use new field names
// Run this ONCE in browser console after signing in as admin

console.log('=== Mentor Requests Migration Script ===');
console.log('This will update fromUserId/toUserId to senderId/receiverId');

const db = firebase.firestore();

async function migrateMentorRequests() {
  try {
    console.log('\n1. Fetching all mentor requests...');
    const snapshot = await db.collection('mentorRequests').get();
    
    console.log(`Found ${snapshot.size} requests to check`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      // Check if needs migration (has old field names)
      if (data.fromUserId || data.toUserId) {
        console.log(`\nMigrating request ${doc.id}...`);
        console.log('Old data:', data);
        
        const updates = {};
        
        // Add new fields
        if (data.fromUserId && !data.senderId) {
          updates.senderId = data.fromUserId;
        }
        if (data.toUserId && !data.receiverId) {
          updates.receiverId = data.toUserId;
        }
        
        if (Object.keys(updates).length > 0) {
          await doc.ref.update(updates);
          console.log('✅ Updated with:', updates);
          migratedCount++;
        } else {
          console.log('⏭️ Already has new fields');
          skippedCount++;
        }
      } else if (data.senderId && data.receiverId) {
        console.log(`✓ Request ${doc.id} already migrated`);
        skippedCount++;
      } else {
        console.warn(`⚠️ Request ${doc.id} has unexpected format:`, data);
      }
    }
    
    console.log('\n=== Migration Complete ===');
    console.log(`✅ Migrated: ${migratedCount} requests`);
    console.log(`⏭️ Skipped: ${skippedCount} requests (already correct)`);
    console.log('\nNOTE: Old fields (fromUserId/toUserId) are kept for backward compatibility');
    console.log('You can manually delete them later if needed.');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
  }
}

// Run migration
migrateMentorRequests();
