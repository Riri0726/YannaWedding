// Script to clean test data from RSVP system
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, deleteDoc, updateDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyAdpDGHgQVGKpBybHDdv6Z3r1lw3jP2KhU",
  authDomain: "yannawedding.firebaseapp.com",
  projectId: "yannawedding",
  storageBucket: "yannawedding.firebasestorage.app",
  messagingSenderId: "1042873134234",
  appId: "1:1042873134234:web:bb46b6b1977cf85ed1f8e4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function cleanTestData() {
  console.log('🧹 Starting test data cleanup...');
  
  try {
    // Get all guests
    const guestsRef = collection(db, 'guests');
    const snapshot = await getDocs(guestsRef);
    const guests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    console.log(`Found ${guests.length} total guests`);
    
    // Find problem guests
    const testGuests = guests.filter(g => 
      g.rsvp_submitted === true || 
      g.is_coming !== null ||
      g.name === 'Testing' ||
      (g.name === 'Johnlery Iringan' && g.email && g.email.includes('test'))
    );
    
    console.log('🔍 Found test data guests:', testGuests.map(g => `${g.name} (${g.id})`));
    
    // IDs of guests to completely delete (duplicates and test entries)
    const deleteIds = [
      '51Q5wBPnD2nMsCzu2OCO', // Testing guest
      'mBmVgVtWrO9HrbCzaNw2', // Duplicate Johnlery with test@gmail.com
      'mkhC9LlQH4EHZF8t4eWR', // Duplicate Johnlery with test@gmail.com  
      'reZFwbycGz51i3VZooRz'  // Duplicate Johnlery with test@gmail.com
    ];
    
    // Delete the duplicate/test guests
    for (const guestId of deleteIds) {
      try {
        await deleteDoc(doc(db, 'guests', guestId));
        console.log(`✅ Deleted guest ${guestId}`);
      } catch (error) {
        console.log(`❌ Failed to delete ${guestId}:`, error.message);
      }
    }
    
    // Reset the main Johnlery Iringan guest (jhFwAT4WYA3DaqsZSiyP) to clean state
    try {
      await updateDoc(doc(db, 'guests', 'jhFwAT4WYA3DaqsZSiyP'), {
        rsvp_submitted: false,
        is_coming: null,
        email: null,
        rsvp_date: null
      });
      console.log(`✅ Reset main Johnlery Iringan guest to clean state`);
    } catch (error) {
      console.log(`❌ Failed to reset main guest:`, error.message);
    }
    
    // Also reset any other guests with test data
    const remainingTestGuests = guests.filter(g => 
      !deleteIds.includes(g.id) && 
      (g.rsvp_submitted === true || g.is_coming !== null)
    );
    
    for (const guest of remainingTestGuests) {
      try {
        await updateDoc(doc(db, 'guests', guest.id), {
          rsvp_submitted: false,
          is_coming: null,
          email: null,
          rsvp_date: null
        });
        console.log(`✅ Reset guest ${guest.name} (${guest.id}) to clean state`);
      } catch (error) {
        console.log(`❌ Failed to reset ${guest.name}:`, error.message);
      }
    }
    
    console.log('🎉 Test data cleanup completed!');
    console.log('🔄 Please refresh your dashboard to see clean data');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

// Run the cleanup
cleanTestData();
