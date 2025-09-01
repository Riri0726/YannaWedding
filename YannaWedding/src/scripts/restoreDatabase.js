import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, writeBatch } from 'firebase/firestore';
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

const restoreDatabase = async (backupFilePath) => {
  try {
    console.log(`🔄 Restoring database from: ${backupFilePath}`);
    
    if (!fs.existsSync(backupFilePath)) {
      throw new Error(`Backup file not found: ${backupFilePath}`);
    }

    const backupData = JSON.parse(fs.readFileSync(backupFilePath, 'utf8'));
    console.log(`📅 Backup timestamp: ${backupData.timestamp}`);

    let totalRestored = 0;

    // Restore each collection
    for (const [collectionName, documents] of Object.entries(backupData.collections)) {
      if (Object.keys(documents).length === 0) {
        console.log(`⚠️ Skipping empty collection: ${collectionName}`);
        continue;
      }

      console.log(`🔄 Restoring collection: ${collectionName} (${Object.keys(documents).length} documents)`);
      
      const batch = writeBatch(db);
      let batchCount = 0;

      for (const [docId, docData] of Object.entries(documents)) {
        const docRef = doc(db, collectionName, docId);
        batch.set(docRef, docData);
        batchCount++;
        totalRestored++;

        // Firestore batch limit is 500 operations
        if (batchCount === 500) {
          await batch.commit();
          console.log(`  ✅ Committed batch of ${batchCount} documents`);
          batchCount = 0;
        }
      }

      // Commit remaining documents
      if (batchCount > 0) {
        await batch.commit();
        console.log(`  ✅ Committed final batch of ${batchCount} documents`);
      }

      console.log(`✅ Collection ${collectionName} restored successfully`);
    }

    console.log(`\n🎉 Database restore completed successfully!`);
    console.log(`📊 Total documents restored: ${totalRestored}`);

  } catch (error) {
    console.error('❌ Error restoring database:', error);
    throw error;
  }
};

// Get backup file path from command line argument
const backupFile = process.argv[2];

if (!backupFile) {
  console.error('❌ Please provide backup file path as argument');
  console.log('Usage: node restoreDatabase.js <backup-file-path>');
  process.exit(1);
}

// Run the restore
restoreDatabase(backupFile)
  .then(() => {
    console.log('\n✨ Restore process completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Restore failed:', error);
    process.exit(1);
  });
