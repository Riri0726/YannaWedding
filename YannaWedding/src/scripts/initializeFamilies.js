import { rsvpService } from '../services/rsvpService.js';

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
    await rsvpService.initializeFamilies(initialFamilies);
    console.log('Families initialized successfully!');
  } catch (error) {
    console.error('Error initializing families:', error);
  }
};

// Run the initialization
initializeFamiliesInFirebase();
