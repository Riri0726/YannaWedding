import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from 'firebase/firestore';
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

const backupDatabase = async () => {
  try {
    const backup = {
      timestamp: new Date().toISOString(),
      collections: {}
    };

    // Backup families collection
    try {
      const familiesSnapshot = await getDocs(collection(db, 'families'));
      backup.collections.families = {};
      familiesSnapshot.forEach(doc => {
        backup.collections.families[doc.id] = doc.data();
      });
      console.log(`✅ Backed up ${familiesSnapshot.size} families`);
    } catch (error) {
      console.log('⚠️ No families collection found or error:', error.message);
      backup.collections.families = {};
    }

    // Backup rsvps collection
    try {
      const rsvpsSnapshot = await getDocs(collection(db, 'rsvps'));
      backup.collections.rsvps = {};
      rsvpsSnapshot.forEach(doc => {
        backup.collections.rsvps[doc.id] = doc.data();
      });
      console.log(`✅ Backed up ${rsvpsSnapshot.size} rsvps`);
    } catch (error) {
      console.log('⚠️ No rsvps collection found or error:', error.message);
      backup.collections.rsvps = {};
    }

    // Backup groups collection
    try {
      const groupsSnapshot = await getDocs(collection(db, 'groups'));
      backup.collections.groups = {};
      groupsSnapshot.forEach(doc => {
        backup.collections.groups[doc.id] = doc.data();
      });
      console.log(`✅ Backed up ${groupsSnapshot.size} groups`);
    } catch (error) {
      console.log('⚠️ No groups collection found or error:', error.message);
      backup.collections.groups = {};
    }

    // Backup guests collection
    try {
      const guestsSnapshot = await getDocs(collection(db, 'guests'));
      backup.collections.guests = {};
      guestsSnapshot.forEach(doc => {
        backup.collections.guests[doc.id] = doc.data();
      });
      console.log(`✅ Backed up ${guestsSnapshot.size} guests`);
    } catch (error) {
      console.log('⚠️ No guests collection found or error:', error.message);
      backup.collections.guests = {};
    }

    // Save to file
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `database-backup-${timestamp}.json`;
    const filepath = path.join(backupDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(backup, null, 2));
    
    console.log('\n🎉 Database backup completed successfully!');
    console.log(`📁 Backup saved to: ${filepath}`);
    console.log('\n📊 Backup Summary:');
    console.log(`   - Families: ${Object.keys(backup.collections.families).length} records`);
    console.log(`   - RSVPs: ${Object.keys(backup.collections.rsvps).length} records`);
    console.log(`   - Groups: ${Object.keys(backup.collections.groups).length} records`);
    console.log(`   - Guests: ${Object.keys(backup.collections.guests).length} records`);

    return filepath;
  } catch (error) {
    console.error('❌ Error backing up database:', error);
    throw error;
  }
};

// Run the backup
backupDatabase()
  .then(() => {
    console.log('\n✨ Backup process completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Backup failed:', error);
    process.exit(1);
  });
