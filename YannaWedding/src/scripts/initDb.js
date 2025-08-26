import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, writeBatch } from 'firebase/firestore';

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

// Initial families data
const initialFamilies = [
  {
    id: 1,
    name: "Galo Family",
    maxGuests: 5,
    email: "",
    status: "pending",
    confirmedGuests: [],
    guestLimit: 5
  },
  {
    id: 2,
    name: "Castrudes Family",
    maxGuests: 6,
    email: "",
    status: "pending",
    confirmedGuests: [],
    guestLimit: 6
  },
  {
    id: 3,
    name: "Entic Family",
    maxGuests: 4,
    email: "",
    status: "pending",
    confirmedGuests: [],
    guestLimit: 4
  },
  {
    id: 4,
    name: "Carzon Family",
    maxGuests: 2,
    email: "",
    status: "pending",
    confirmedGuests: [],
    guestLimit: 2
  }
];

// Initialize families in Firebase
const initializeFamiliesInFirebase = async () => {
  try {
    const batch = writeBatch(db);
    initialFamilies.forEach(family => {
      const familyRef = doc(db, 'families', family.id.toString());
      batch.set(familyRef, family);
    });
    await batch.commit();
    console.log('Families initialized successfully!');
  } catch (error) {
    console.error('Error initializing families:', error);
  }
};

// Run the initialization
initializeFamiliesInFirebase();
