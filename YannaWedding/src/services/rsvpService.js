import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, addDoc, query, where, writeBatch, deleteDoc } from 'firebase/firestore';
import { app } from '../firebase.js';

const db = getFirestore(app);

export const rsvpService = {
  // Legacy RSVP functions (keeping for backward compatibility)
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

// NEW GUEST-CENTRIC SERVICE
export const guestService = {
  // Create Individual Guest (no group needed)
  async createIndividualGuest(guestData) {
    try {
      const guestsCol = collection(db, 'guests');
      const created = await addDoc(guestsCol, {
        name: guestData.name || '',
        email: guestData.email || '',
        max_count: Number(guestData.max_count) || 1,
        guest_type: guestData.guest_type || 'bride', // bride or groom
        role: 'individual',
        in_group: false,
        group_id: null,
        is_coming: null,
        rsvp_submitted: false,
        createdAt: new Date().toISOString()
      });
      return { id: created.id };
    } catch (error) {
      console.error('Error creating individual guest:', error);
      throw error;
    }
  },

  // Create Group with Guests
  async createGroupWithGuests(groupData, guestNames = [], guestType = 'bride') {
    try {
      const batch = writeBatch(db);
      
      // Create group first
      const groupRef = doc(collection(db, 'groups'));
      batch.set(groupRef, {
        group_name: groupData.group_name,
        group_count_max: Number(groupData.group_count_max) || 0,
        is_predetermined: Boolean(groupData.is_predetermined) || false,
        role: groupData.role || 'family', // 'family' or 'friends'
        createdAt: new Date().toISOString()
      });

      // Create guests for the group
      if (guestNames && guestNames.length > 0) {
        guestNames
          .filter(name => name && name.trim())
          .forEach(name => {
            const guestRef = doc(collection(db, 'guests'));
            batch.set(guestRef, {
              name: name.trim(),
              email: '',
              max_count: 1,
              guest_type: guestType, // bride or groom
              role: groupData.role || 'family',
              in_group: true,
              group_id: groupRef.id,
              is_coming: null,
              rsvp_submitted: false,
              createdAt: new Date().toISOString()
            });
          });
      }

      await batch.commit();
      return { groupId: groupRef.id };
    } catch (error) {
      console.error('Error creating group with guests:', error);
      throw error;
    }
  },

  // Get all guests with their group info
  async getAllGuests() {
    try {
      const guestsCol = collection(db, 'guests');
      const guestsSnap = await getDocs(guestsCol);
      const guests = guestsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Get group information for guests that belong to groups
      const groupIds = [...new Set(guests.filter(g => g.group_id).map(g => g.group_id))];
      const groups = {};

      if (groupIds.length > 0) {
        const groupsCol = collection(db, 'groups');
        const groupsSnap = await getDocs(groupsCol);
        groupsSnap.docs.forEach(doc => {
          if (groupIds.includes(doc.id)) {
            groups[doc.id] = { id: doc.id, ...doc.data() };
          }
        });
      }

      // Combine guest data with group info
      return guests.map(guest => ({
        ...guest,
        group_info: guest.group_id ? groups[guest.group_id] : null
      }));
    } catch (error) {
      console.error('Error getting all guests:', error);
      throw error;
    }
  },

  // Get guests by role for display categorization
  async getGuestsByRole() {
    try {
      const guests = await this.getAllGuests();
      
      const categorized = {
        individual: guests.filter(g => g.role === 'individual'),
        family: guests.filter(g => g.role === 'family'),
        friends: guests.filter(g => g.role === 'friends')
      };

      return categorized;
    } catch (error) {
      console.error('Error getting guests by role:', error);
      throw error;
    }
  },

  // Get total guest counts by role
  async getGuestCounts() {
    try {
      const guests = await this.getAllGuests();
      
      const counts = {
        individual: {
          total: guests.filter(g => g.role === 'individual').length,
          confirmed: guests.filter(g => g.role === 'individual' && g.is_coming === true).length,
          declined: guests.filter(g => g.role === 'individual' && g.is_coming === false).length,
          pending: guests.filter(g => g.role === 'individual' && g.is_coming === null).length
        },
        family: {
          total: guests.filter(g => g.role === 'family').length,
          confirmed: guests.filter(g => g.role === 'family' && g.is_coming === true).length,
          declined: guests.filter(g => g.role === 'family' && g.is_coming === false).length,
          pending: guests.filter(g => g.role === 'family' && g.is_coming === null).length
        },
        friends: {
          total: guests.filter(g => g.role === 'friends').length,
          confirmed: guests.filter(g => g.role === 'friends' && g.is_coming === true).length,
          declined: guests.filter(g => g.role === 'friends' && g.is_coming === false).length,
          pending: guests.filter(g => g.role === 'friends' && g.is_coming === null).length
        }
      };

      counts.overall = {
        total: counts.individual.total + counts.family.total + counts.friends.total,
        confirmed: counts.individual.confirmed + counts.family.confirmed + counts.friends.confirmed,
        declined: counts.individual.declined + counts.family.declined + counts.friends.declined,
        pending: counts.individual.pending + counts.family.pending + counts.friends.pending
      };

      return counts;
    } catch (error) {
      console.error('Error getting guest counts:', error);
      throw error;
    }
  },

  // Update guest RSVP
  async updateGuestRSVP(guestId, { email, is_coming }) {
    try {
      const ref = doc(db, 'guests', guestId);
      await updateDoc(ref, {
        email: email || '',
        is_coming: typeof is_coming === 'boolean' ? is_coming : null,
        rsvp_submitted: true,
        rsvp_date: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('Error updating guest RSVP:', error);
      throw error;
    }
  },

  // Update guest details
  async updateGuest(guestId, updates) {
    try {
      const ref = doc(db, 'guests', guestId);
      await updateDoc(ref, { 
        ...updates, 
        updatedAt: new Date().toISOString() 
      });
      return true;
    } catch (error) {
      console.error('Error updating guest:', error);
      throw error;
    }
  },

  // Delete guest
  async deleteGuest(guestId) {
    try {
      const ref = doc(db, 'guests', guestId);
      await deleteDoc(ref);
      return true;
    } catch (error) {
      console.error('Error deleting guest:', error);
      throw error;
    }
  },

  // Get all groups
  async getAllGroups() {
    try {
      const groupsCol = collection(db, 'groups');
      const snap = await getDocs(groupsCol);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error('Error getting all groups:', error);
      throw error;
    }
  },

  // Delete group and all its guests
  async deleteGroup(groupId) {
    try {
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
    } catch (error) {
      console.error('Error deleting group:', error);
      throw error;
    }
  }
};

// Legacy adminService (keeping old group functionality for backward compatibility)
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
