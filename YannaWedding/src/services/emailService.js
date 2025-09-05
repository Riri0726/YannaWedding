import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../firebase';

const functions = getFunctions(app);

// Cloud Functions
export const sendManualInvitation = httpsCallable(functions, 'sendManualInvitation');
export const sendBulkInvitations = httpsCallable(functions, 'sendBulkInvitations');

export const emailService = {
  // Send invitation to a specific guest
  async sendInvitationToGuest(guestId) {
    try {
      const result = await sendManualInvitation({ guestId });
      return result.data;
    } catch (error) {
      console.error('Error sending invitation:', error);
      throw error;
    }
  },

  // Send invitations to all confirmed guests
  async sendBulkInvitations() {
    try {
      const result = await sendBulkInvitations();
      return result.data;
    } catch (error) {
      console.error('Error sending bulk invitations:', error);
      throw error;
    }
  }
};
