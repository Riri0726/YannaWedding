import React, { useState } from 'react';
import { emailService } from '../services/emailService';

const EmailAdmin = ({ guests }) => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const sendSingleInvitation = async (guestId, guestName) => {
    setLoading(true);
    setError('');
    try {
      const result = await emailService.sendInvitationToGuest(guestId);
      setResults(`✅ Email sent successfully to ${guestName}: ${result.message}`);
    } catch (err) {
      setError(`❌ Failed to send email to ${guestName}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const sendBulkInvitations = async () => {
    setLoading(true);
    setError('');
    setResults('');
    try {
      const result = await emailService.sendBulkInvitations();
      setResults(`✅ Bulk email completed! Processed ${result.totalProcessed} guests. Check results below.`);
      console.log('Bulk email results:', result.results);
    } catch (err) {
      setError(`❌ Bulk email failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const confirmedGuests = guests.filter(guest => guest.is_coming === true && guest.email);

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', margin: '20px 0' }}>
      <h3>📧 Email Invitations</h3>
      
      {/* Bulk Send Section */}
      <div style={{ marginBottom: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
        <h4>Send to All Confirmed Guests ({confirmedGuests.length})</h4>
        <p>This will send invitation emails to all guests who have RSVP'd "Yes" and have an email address.</p>
        <button 
          onClick={sendBulkInvitations}
          disabled={loading || confirmedGuests.length === 0}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading || confirmedGuests.length === 0 ? 0.6 : 1
          }}
        >
          {loading ? '🔄 Sending...' : '📧 Send All Invitations'}
        </button>
      </div>

      {/* Individual Send Section */}
      <div style={{ marginBottom: '20px' }}>
        <h4>Send Individual Invitations</h4>
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {confirmedGuests.length === 0 ? (
            <p>No confirmed guests with email addresses found.</p>
          ) : (
            confirmedGuests.map(guest => (
              <div key={guest.id} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '8px 12px',
                borderBottom: '1px solid #eee'
              }}>
                <div>
                  <strong>{guest.name}</strong>
                  <br />
                  <small style={{ color: '#666' }}>{guest.email}</small>
                  {guest.invitation_email_sent && (
                    <span style={{ color: 'green', marginLeft: '10px', fontSize: '12px' }}>
                      ✅ Sent
                    </span>
                  )}
                </div>
                <button
                  onClick={() => sendSingleInvitation(guest.id, guest.name)}
                  disabled={loading}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: guest.invitation_email_sent ? '#6c757d' : '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '12px'
                  }}
                >
                  {loading ? '...' : '📧 Send'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Results/Error Display */}
      {results && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#d4edda', 
          border: '1px solid #c3e6cb',
          borderRadius: '4px',
          marginTop: '15px',
          color: '#155724'
        }}>
          {results}
        </div>
      )}

      {error && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#f8d7da', 
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          marginTop: '15px',
          color: '#721c24'
        }}>
          {error}
        </div>
      )}

      {/* Instructions */}
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#e7f3ff', 
        borderRadius: '6px',
        fontSize: '14px'
      }}>
        <h5>📋 Setup Instructions:</h5>
        <ol>
          <li>Upload invitation.png to Firebase Storage (via Firebase Console)</li>
          <li>Set email credentials in Cloud Functions:
            <code style={{ display: 'block', margin: '5px 0', padding: '5px', backgroundColor: '#f1f1f1' }}>
              firebase functions:config:set email.user="your@email.com" email.password="your-app-password"
            </code>
          </li>
          <li>Redeploy functions: <code>firebase deploy --only functions</code></li>
        </ol>
      </div>
    </div>
  );
};

export default EmailAdmin;
