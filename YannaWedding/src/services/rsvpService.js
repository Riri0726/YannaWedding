import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, addDoc, query, where, writeBatch } from 'firebase/firestore';
import { app } from '../firebase.js';

const db = getFirestore(app);

export const rsvpService = {
  // Create or update RSVP
  async submitRSVP(familyId, rsvpData) {
    try {
      const rsvpRef = doc(db, 'rsvps', familyId.toString());
      await setDoc(rsvpRef, {
        ...rsvpData,
        updatedAt: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.error('Error submitting RSVP:', error);
      throw error;
    }
  },

  // Get all families
  async getFamilies() {
    try {
      const familiesRef = collection(db, 'families');
      const snapshot = await getDocs(familiesRef);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting families:', error);
      throw error;
    }
  },

  // Get RSVP status for a family
  async getFamilyRSVP(familyId) {
    try {
      const rsvpRef = doc(db, 'rsvps', familyId.toString());
      const rsvpDoc = await getDoc(rsvpRef);
      return rsvpDoc.exists() ? rsvpDoc.data() : null;
    } catch (error) {
      console.error('Error getting family RSVP:', error);
      throw error;
    }
  },

  // Initialize families in Firestore (run this once)
  async initializeFamilies(familiesData) {
    try {
      const batch = db.batch();
      familiesData.forEach(family => {
        const familyRef = doc(db, 'families', family.id.toString());
        batch.set(familyRef, {
          name: family.name,
          maxGuests: family.maxGuests,
          email: family.email || "",
          status: family.status || "pending",
          confirmedGuests: family.confirmedGuests || [],
          guestLimit: family.guestLimit
        });
      });
      await batch.commit();
      return true;
    } catch (error) {
      console.error('Error initializing families:', error);
      throw error;
    }
  }
};

// New service for Groups and Guests based on provided schema
export const adminService = {
  async createGroup(group) {
    const groupsCol = collection(db, 'groups');
    const created = await addDoc(groupsCol, {
      group_name: group.group_name,
      group_count_max: Number(group.group_count_max) || 0,
      is_predetermined: Boolean(group.is_predetermined) || false,
      createdAt: new Date().toISOString()
    });
    return { id: created.id };
  },

  async listGroups() {
    const groupsCol = collection(db, 'groups');
    const snap = await getDocs(groupsCol);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async createGuest(guest) {
    if (!guest.group_id) throw new Error('group_id is required');
    const guestsCol = collection(db, 'guests');
    const created = await addDoc(guestsCol, {
      group_id: guest.group_id,
      name: guest.name || '',
      is_coming: guest.is_coming ?? null,
      in_group: guest.in_group ?? true,
      email: guest.email || '',
      createdAt: new Date().toISOString()
    });
    return { id: created.id };
  },

  async listGuestsByGroup(groupId) {
    const guestsCol = collection(db, 'guests');
    const q = query(guestsCol, where('group_id', '==', groupId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  // RSVP actions
  async updateGuestRSVP(guestId, { email, is_coming }) {
    const ref = doc(db, 'guests', guestId);
    await updateDoc(ref, {
      email: email || '',
      is_coming: typeof is_coming === 'boolean' ? is_coming : null,
      updatedAt: new Date().toISOString()
    });
    return true;
  },

  async addUnknownGroupGuests(groupId, email, names) {
    const batch = writeBatch(db);
    const guestsCol = collection(db, 'guests');
    names
      .filter(n => n && n.trim())
      .forEach(n => {
        const newRef = doc(guestsCol);
        batch.set(newRef, {
          group_id: groupId,
          name: n.trim(),
          is_coming: true,
          in_group: true,
          email: email || '',
          createdAt: new Date().toISOString()
        });
      });
    await batch.commit();
    return true;
  }
};
