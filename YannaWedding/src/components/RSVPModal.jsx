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
    isModalOpen,
    setIsModalOpen,
    loading,
    error
  } = useRSVP();
  const [email, setEmail] = useState('');
  const [guestNames, setGuestNames] = useState(['']);
  const [isComing, setIsComing] = useState(true);
  const remainingSlots = selectedGroup?.group_count_max && Array.isArray(groupGuests)
    ? Math.max(0, selectedGroup.group_count_max - groupGuests.length)
    : undefined;
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
    if (!selectedGroup) return;

    if (selectedGroup.is_predetermined && selectedGuest) {
      await adminService.updateGuestRSVP(selectedGuest.id, { email, is_coming: isComing });
    } else if (!selectedGroup.is_predetermined) {
      const names = guestNames.filter(n => n.trim());
      if (names.length === 0) return;
      if (typeof remainingSlots === 'number' && names.length > remainingSlots) {
        // Frontend guard: do not allow submitting beyond remaining slots
        return;
      }
      await adminService.addUnknownGroupGuests(selectedGroup.id, email, names);
    }
    handleClose();
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
        {selectedGroup?.is_predetermined && !selectedGuest && (
          <div className="form-group">
            <label>Select your name</label>
            <div className="guest-card-grid">
              {groupGuests.map(g => (
                <div key={g.id} className="guest-card-mini" onClick={() => setSelectedGuest(g)} style={{ cursor: 'pointer' }}>
                  <div className="guest-name">{g.name}</div>
                </div>
              ))}
            </div>
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
            </div>
            )
          ) : (
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

          {error && <div className="error-message">{error}</div>}
          {(!selectedGroup?.is_predetermined || (selectedGroup?.is_predetermined && selectedGuest)) && (
            <button type="submit" className="submit-btn" disabled={loading || (typeof remainingSlots === 'number' && guestNames.length > remainingSlots)}>
              {loading ? 'Submitting...' : 'Submit RSVP'}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default RSVPModal;
