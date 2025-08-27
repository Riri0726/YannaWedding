import React, { useState, useEffect } from 'react';
import { useRSVP } from '../context/RSVPContext';
import { adminService } from '../services/rsvpService';
import { ArrowLeftIcon, XMarkIcon } from '@heroicons/react/24/outline';

const RSVPModal = () => {
  const {
    selectedGroup,
    selectedGuest,
    setSelectedGuest,
    groupGuests,
    guestsByGroup,
    isModalOpen,
    setIsModalOpen,
    loading,
    error,
    refresh
  } = useRSVP();
  
  const [email, setEmail] = useState('');
  const [guestNames, setGuestNames] = useState(['']);
  const [isComing, setIsComing] = useState(true);
  
  const remainingSlots = selectedGroup?.group_count_max && Array.isArray(groupGuests)
    ? Math.max(0, selectedGroup.group_count_max - groupGuests.length)
    : undefined;
    
  console.log('Debug remainingSlots:', {
    group_count_max: selectedGroup?.group_count_max,
    groupGuests: groupGuests,
    groupGuestsLength: Array.isArray(groupGuests) ? groupGuests.length : 'not array',
    remainingSlots: remainingSlots
  });
  const maxSlots = typeof remainingSlots === 'number' ? remainingSlots : Infinity;
  const canAddMoreGuests = guestNames.length < maxSlots;

  // Reset form when modal closes or family changes
  useEffect(() => {
    if (!isModalOpen) {
      setEmail('');
      setGuestNames(['']);
      setIsComing(true);
    }
  }, [isModalOpen]);

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedGuest(null);
    setEmail('');
    setGuestNames(['']);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted!', { selectedGroup, selectedGuest, isComing, email });
    if (!selectedGroup) return;

    try {
      if (selectedGroup.is_predetermined && selectedGuest) {
        await adminService.updateGuestRSVP(selectedGuest.id, { email, is_coming: isComing });
      } else if (!selectedGroup.is_predetermined) {
        // For unknown groups, just submit the new response
        // The admin can handle status changes and record cleanup
        
        const names = isComing ? guestNames.filter(n => n.trim()) : [];
        // For "No" responses, we still submit but with empty names array
        await adminService.addUnknownGroupGuests(selectedGroup.id, email, names, isComing);
      }
      
      // Show success message and close
      const message = isComing ? 'RSVP submitted successfully! We look forward to seeing you!' : 'RSVP submitted successfully! Thank you for letting us know.';
      
      // Close modal
      handleClose();
      
      // Show success toast using window method (will be set by parent)
      if (window.showToast) {
        window.showToast(message, 'success');
      }
      
      // Refresh data instead of page reload
      if (refresh) {
        refresh();
      }
    } catch (error) {
      console.error('Error submitting RSVP:', error);
      // Show error toast
      if (window.showToast) {
        window.showToast('Failed to submit RSVP. Please try again.', 'error');
      }
    }
  };

  const addGuestInput = () => {
    if (canAddMoreGuests) {
      setGuestNames([...guestNames, '']);
    }
  };

  const removeGuestInput = (index) => {
    const newGuestNames = guestNames.filter((_, i) => i !== index);
    setGuestNames(newGuestNames);
  };

  const handleGuestNameChange = (index, value) => {
    const newGuestNames = [...guestNames];
    newGuestNames[index] = value;
    setGuestNames(newGuestNames);
  };

  if (!isModalOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => {
              if (selectedGroup?.is_predetermined && selectedGuest) {
                setSelectedGuest(null);
              } else {
                handleClose();
              }
            }}
            aria-label="Back"
            style={{ background: 'transparent', border: 'none', padding: 4, cursor: 'pointer' }}
          >
            <ArrowLeftIcon width={22} height={22} />
          </button>
          <button className="modal-close" onClick={handleClose} aria-label="Close">
            <XMarkIcon width={18} height={18} />
          </button>
        </div>
        
        <h2>RSVP for {selectedGroup?.group_name}</h2>
        
        {/* Show warning if group already has responses */}
        {selectedGroup && (() => {
          const groupGuests = guestsByGroup[selectedGroup.id] || [];
          let shouldShowWarning = false;
          let warningMessage = '';
          
          if (selectedGroup.is_predetermined) {
            // For predetermined groups: only show warning if ALL guests have final status (Going/Not Going)
            // If no guests exist yet, don't show warning
            if (groupGuests.length > 0) {
              const allHaveFinalStatus = groupGuests.every(guest => guest.is_coming !== null);
              if (allHaveFinalStatus) {
                shouldShowWarning = true;
                warningMessage = '⚠️ All guests in this group have already responded. You cannot submit additional RSVPs.';
              }
            }
          } else {
            // For unknown groups: show warning if they have final status (Going/Not Going)
            // Admin can unlock by changing status to Pending (is_coming = null)
            const hasFinalStatus = groupGuests.some(guest => guest.is_coming !== null);
            if (hasFinalStatus) {
              shouldShowWarning = true;
              warningMessage = '⚠️ This group has already responded. You cannot submit additional RSVPs.';
            }
          }
          
          if (shouldShowWarning) {
            return (
              <div className="warning-message">
                {warningMessage}
              </div>
            );
          }
          return null;
        })()}
        
                 {selectedGroup?.is_predetermined && !selectedGuest && (
           <div className="form-group">
             <label>Select your name</label>
             <div className="guest-card-grid">
               {groupGuests.length === 0 ? (
                 <div className="no-guests-message">
                   <p>No guests found for this group. Please contact the administrator.</p>
                 </div>
               ) : (
                 groupGuests.map(g => {
                   const isLocked = g.is_coming !== null; // Lock if Going or Not Going
                   const canSelect = !isLocked; // Only allow selection if Pending
                   
                   return (
                     <div 
                       key={g.id} 
                       className={`guest-card-mini ${isLocked ? 'locked' : ''}`} 
                       onClick={() => canSelect && setSelectedGuest(g)} 
                       style={{ 
                         cursor: canSelect ? 'pointer' : 'not-allowed',
                         opacity: isLocked ? 0.6 : 1
                       }}
                     >
                       <div className="guest-name">{g.name}</div>
                       {isLocked ? (
                         <div className="guest-locked">
                           🔒 RSVP Submitted
                         </div>
                       ) : (
                         <div className="guest-respond">
                           Respond
                         </div>
                       )}
                     </div>
                   );
                 })
               )}
             </div>
             {groupGuests.length === 0 && (
               <div className="info-message">
                 <p>⚠️ This group has no guests assigned. Please contact the administrator to add guests.</p>
               </div>
             )}
           </div>
         )}
        
        {selectedGroup?.is_predetermined && selectedGuest && (
          <p className="guest-limit-info">Guest: {selectedGuest?.name}</p>
        )}
        
        {!selectedGroup?.is_predetermined && (
          <p className="guest-limit-info">Enter guest names for this group</p>
        )}
        
        <form onSubmit={handleSubmit} className="rsvp-form">
          {(!selectedGroup?.is_predetermined || (selectedGroup?.is_predetermined && selectedGuest)) && (
            <div className="form-group">
              <label htmlFor="email">Contact Email:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email address"
              />
            </div>
          )}

          {selectedGroup?.is_predetermined ? (
            !selectedGuest ? null : (
              <div className="form-group">
                <label>Are you coming?</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <label><input type="radio" checked={isComing === true} onChange={() => setIsComing(true)} /> Yes</label>
                  <label><input type="radio" checked={isComing === false} onChange={() => setIsComing(false)} /> No</label>
                </div>
                {!isComing && (
                  <div className="info-message">
                    <p>💡 Selecting "No" will record that you cannot attend.</p>
                  </div>
                )}
              </div>
            )
          ) : (
            <>
              <div className="form-group">
                <label>Are you coming?</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <label><input type="radio" checked={isComing === true} onChange={() => setIsComing(true)} /> Yes</label>
                  <label><input type="radio" checked={isComing === false} onChange={() => setIsComing(false)} /> No</label>
                </div>
                {!isComing && (
                  <div className="info-message">
                    <p>💡 Selecting "No" will record that your family cannot attend, but you won't need to enter guest names.</p>
                  </div>
                )}
                

              </div>
              
              {isComing && (
                <div className="form-group">
                  <label>Names of Attending Guests:</label>
                  <div className="guest-inputs">
                    {guestNames.map((name, index) => (
                      <div key={index} className="guest-input-row">
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => handleGuestNameChange(index, e.target.value)}
                          placeholder="Enter guest name"
                          className="guest-name-input"
                          required
                        />
                        {index > 0 && (
                          <button 
                            type="button" 
                            className="remove-guest-btn"
                            onClick={() => removeGuestInput(index)}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {canAddMoreGuests && (
                      <button 
                        type="button" 
                        className="add-guest-btn"
                        onClick={addGuestInput}
                      >
                        + Add Another Guest
                      </button>
                    )}
                    {typeof remainingSlots === 'number' && (
                      <span style={{ fontSize: 12, color: '#667085' }}>Remaining slots: {Math.max(0, maxSlots - guestNames.length)}</span>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {error && <div className="error-message">{error}</div>}
          
          
           
           <button 
             type="submit" 
             className="submit-btn" 
             disabled={
               loading || 
               (selectedGroup?.is_predetermined && !selectedGuest) ||
               (!selectedGroup?.is_predetermined && typeof remainingSlots === 'number' && guestNames.length > remainingSlots) ||
               (!selectedGroup?.is_predetermined && isComing === true && guestNames.filter(n => n.trim()).length === 0)
             }
           >
             {loading ? 'Submitting...' : 'Submit RSVP'}
           </button>
        </form>
      </div>
    </div>
  );
};

export default RSVPModal;
