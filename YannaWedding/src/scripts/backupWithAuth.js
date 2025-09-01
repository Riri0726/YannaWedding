import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import fs from 'fs';
import path from 'path';

const firebaseConfig = {
  apiKey: "AIzaSyAXSd_WhWKNYG7my15sfG93xN6Eusn_gnw",
  authDomain: "yannawedding-11b85.firebaseapp.com",
  projectId: "yannawedding-11b85",
  storageBucket: "yannawedding-11b85.appspot.com",
  messagingSenderId: "641003596295",
  appId: "1:641003596295:web:5208fb5452baebbdf1d8a2",
  measurementId: "G-X85SREG142"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const backupWithAuth = async () => {
  try {
    console.log('🔐 Attempting to authenticate...');
    
    // Try anonymous authentication
    try {
      await signInAnonymously(auth);
      console.log('✅ Anonymous authentication successful');
    } catch (authError) {
      console.log('⚠️ Anonymous auth failed:', authError.message);
      console.log('📝 Proceeding without authentication...');
    }

    const backup = {
      timestamp: new Date().toISOString(),
      collections: {},
      errors: []
    };

    // List of collections to backup
    const collections = ['families', 'rsvps', 'groups', 'guests'];

    for (const collectionName of collections) {
      try {
        console.log(`🔍 Checking collection: ${collectionName}`);
        const snapshot = await getDocs(collection(db, collectionName));
        
        backup.collections[collectionName] = {};
        snapshot.forEach(doc => {
          backup.collections[collectionName][doc.id] = doc.data();
        });
        
        console.log(`✅ Backed up ${snapshot.size} documents from ${collectionName}`);
      } catch (error) {
        console.log(`❌ Error accessing ${collectionName}:`, error.message);
        backup.errors.push({
          collection: collectionName,
          error: error.message,
          code: error.code
        });
        backup.collections[collectionName] = {};
      }
    }

    // Save to file
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `database-backup-with-auth-${timestamp}.json`;
    const filepath = path.join(backupDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(backup, null, 2));
    
    console.log('\n🎉 Database backup completed!');
    console.log(`📁 Backup saved to: ${filepath}`);
    console.log('\n📊 Backup Summary:');
    
    let totalDocs = 0;
    for (const [collectionName, docs] of Object.entries(backup.collections)) {
      const count = Object.keys(docs).length;
      totalDocs += count;
      console.log(`   - ${collectionName}: ${count} documents`);
    }
    
    if (backup.errors.length > 0) {
      console.log('\n⚠️ Errors encountered:');
      backup.errors.forEach(err => {
        console.log(`   - ${err.collection}: ${err.error}`);
      });
    }

    if (totalDocs === 0) {
      console.log('\n💡 No data found. This could mean:');
      console.log('   1. Database is empty (not initialized)');
      console.log('   2. Permission issues persist');
      console.log('   3. Collections don\'t exist yet');
    }

    return filepath;
  } catch (error) {
    console.error('❌ Error backing up database:', error);
    throw error;
  }
};

// Run the backup
backupWithAuth()
  .then(() => {
    console.log('\n✨ Backup process completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Backup failed:', error);
    process.exit(1);
  });
