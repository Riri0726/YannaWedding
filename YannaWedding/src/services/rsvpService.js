import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, addDoc, query, where, writeBatch, deleteDoc } from 'firebase/firestore';
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
      guest_type: group.guest_type || 'bride',
      createdAt: new Date().toISOString()
    });
    return { id: created.id };
  },

  async listGroups() {
    const groupsCol = collection(db, 'groups');
    const snap = await getDocs(groupsCol);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async updateGroup(groupId, updates) {
    const ref = doc(db, 'groups', groupId);
    await updateDoc(ref, {
      ...updates,
      group_count_max: Number(updates.group_count_max) || 0,
      is_predetermined: Boolean(updates.is_predetermined) || false,
      guest_type: updates.guest_type || 'bride',
      updatedAt: new Date().toISOString()
    });
    return true;
  },

  async deleteGroup(groupId) {
    // First, delete all guests in this group
    const guestsCol = collection(db, 'guests');
    const q = query(guestsCol, where('group_id', '==', groupId));
    const guestSnap = await getDocs(q);

    const batch = writeBatch(db);
    guestSnap.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    // Then delete the group
    const groupRef = doc(db, 'groups', groupId);
    batch.delete(groupRef);

    await batch.commit();
    return true;
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

  async listAllGuests() {
    const guestsCol = collection(db, 'guests');
    const snap = await getDocs(guestsCol);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  // RSVP actions
  async updateGuestRSVP(guestId, { email, is_coming }) {
    const ref = doc(db, 'guests', guestId);
    await updateDoc(ref, {
      email: email || '',
      is_coming: typeof is_coming === 'boolean' ? is_coming : null,
      rsvp_submitted: true,
      rsvp_date: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return true;
  },

  async addUnknownGroupGuests(groupId, email, names, isComing) {
    const batch = writeBatch(db);
    const guestsCol = collection(db, 'guests');
    
    if (isComing && names && names.length > 0) {
      // If they're coming, create guest records for each name
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
            rsvp_submitted: true,
            rsvp_date: new Date().toISOString(),
            createdAt: new Date().toISOString()
          });
        });
    } else if (!isComing) {
      // If they're not coming, create a placeholder guest record
      const newRef = doc(guestsCol);
      batch.set(newRef, {
        group_id: groupId,
        name: 'Family Cannot Attend',
        is_coming: false,
        in_group: true,
        email: 'N/A',
        rsvp_submitted: true,
        rsvp_date: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });
    }
    
    await batch.commit();
    return true;
  },

  async updateGuest(guestId, updates) {
    const ref = doc(db, 'guests', guestId);
    await updateDoc(ref, { ...updates, updatedAt: new Date().toISOString() });
    return true;
  },

  async deleteGuest(guestId) {
    console.log('🔥 deleteGuest called with guestId:', guestId);
    const ref = doc(db, 'guests', guestId);
    console.log('🔥 Document reference:', ref);
    try {
      await deleteDoc(ref);
      console.log('🔥 Guest deleted successfully from Firebase');
      return true;
    } catch (error) {
      console.error('🔥 Error deleting guest from Firebase:', error);
      throw error;
    }
  }
};
