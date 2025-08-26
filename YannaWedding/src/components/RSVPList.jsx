import React, { useState } from 'react';
import { useRSVP } from '../context/RSVPContext';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import RSVPModal from './RSVPModal';

// Toast notification component
const Toast = ({ message, type, onClose }) => (
  <div className={`toast toast-${type}`}>
    <span>{message}</span>
    <button onClick={onClose} className="toast-close">×</button>
  </div>
);

// Confirmation modal component
const ConfirmModal = ({ isOpen, onConfirm, onCancel, title, message, confirmText = "Confirm", cancelText = "Cancel" }) => {
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay">
      <div className="modal-content confirm-modal">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="modal-actions">
          <button onClick={onCancel} className="btn-secondary">{cancelText}</button>
          <button onClick={onConfirm} className="btn-primary">{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

const RSVPList = () => {
  const { groups, setSelectedGroup, setIsModalOpen, loading, error, guestsByGroup } = useRSVP();
  const [selectedSide, setSelectedSide] = useState('select');
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const openConfirmModal = (action, title, message) => {
    setConfirmAction(action);
    setShowConfirmModal(true);
  };

  const handleConfirm = () => {
    if (confirmAction) {
      confirmAction();
    }
    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  const handleCancel = () => {
    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  const handleGroupClick = (group) => {
    const groupGuests = guestsByGroup[group.id] || [];
    
    if (group.is_predetermined) {
      // For predetermined groups: only block if ALL guests have responded
      // If no guests exist yet, allow opening the modal
      if (groupGuests.length > 0) {
        const allResponded = groupGuests.every(guest => guest.rsvp_submitted);
        if (allResponded) {
          return; // Don't open modal if all guests have responded
        }
      }
    } else {
      // For unknown groups: block if they have responded (regardless of yes/no)
      // Admin can unlock by changing status to Pending
      const hasResponded = groupGuests.some(guest => guest.rsvp_submitted);
      if (hasResponded) {
        return; // Don't open modal if they have already responded
      }
    }
    
    // Expose toast function to modal
    window.showToast = showToast;
    
    setSelectedGroup(group);
    setIsModalOpen(true);
  };

  // Filter groups based on selected side and search term
  const filteredGroups = groups.filter(group => {
    // First filter by guest type (bride/groom)
    if (selectedSide !== 'select' && group.guest_type !== selectedSide) {
      return false;
    }
    
    // Then filter by search term
    if (searchTerm && !group.group_name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });



  return (
    <div className="rsvp-list">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        title="Confirm Action"
        message="Are you sure you want to proceed?"
        confirmText="Yes, Continue"
        cancelText="Cancel"
      />

      <h2>RSVP Groups</h2>
      
      {/* Side Selection */}
      {selectedSide === 'select' && (
        <div className="side-selection">
          <h3>Choose your side</h3>
          <div className="side-buttons">
            <button 
              className="side-btn groom-btn"
              onClick={() => setSelectedSide('groom')}
            >
              Groom's Guests
            </button>
            <button 
              className="side-btn bride-btn"
              onClick={() => setSelectedSide('bride')}
            >
              Bride's Guests
            </button>
          </div>
        </div>
      )}

      {/* Search and Guest List */}
      {selectedSide !== 'select' && (
        <>
          {/* Search Bar */}
          <div className="search-section">
            <div className="search-container">
              <input
                type="text"
                placeholder={`Search ${selectedSide} guests...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
                             <button className="search-btn">
                 <MagnifyingGlassIcon width={20} height={20} />
               </button>
            </div>
            
            {/* Side Switch Buttons */}
            <div className="side-switch">
              <button 
                className="switch-btn"
                onClick={() => setSelectedSide('groom')}
              >
                Groom
              </button>
              <button 
                className="switch-btn"
                onClick={() => setSelectedSide('bride')}
              >
                Bride
              </button>
            </div>
          </div>

          {/* Guest Cards */}
          {error && <div className="error">{error}</div>}
          {loading && <div>Loading...</div>}
          
          {filteredGroups.length === 0 ? (
            <div className="no-results">
              {searchTerm ? `No ${selectedSide} guests found matching "${searchTerm}"` : `No ${selectedSide} guests found`}
            </div>
          ) : (
            <div className="guest-grid">
              {filteredGroups.map((group) => {
                const groupGuests = guestsByGroup[group.id] || [];
                
                // Determine if card should be locked
                let isLocked = false;
                if (group.is_predetermined) {
                  // For predetermined groups: only lock if ALL guests have responded
                  // If no guests exist yet, don't lock
                  if (groupGuests.length === 0) {
                    isLocked = false;
                  } else {
                    isLocked = groupGuests.every(guest => guest.rsvp_submitted);
                  }
                } else {
                  // For unknown groups: lock if they have responded (regardless of yes/no)
                  // Admin can unlock by changing status to Pending
                  const hasResponded = groupGuests.some(guest => guest.rsvp_submitted);
                  isLocked = hasResponded;
                }
                
                return (
                  <div
                    key={group.id}
                    className={`guest-card ${isLocked ? 'locked' : ''}`}
                  >
                    <h3>{group.group_name}</h3>
                    {isLocked ? (
                      <div className="lock-indicator">
                        {group.is_predetermined ? '🔒 All Guests Responded' : '🔒 RSVP Submitted'}
                      </div>
                    ) : (
                      <button 
                        className="respond-btn"
                        onClick={() => handleGroupClick(group)}
                      >
                        Respond
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

             {/* RSVP Modal */}
       <RSVPModal />
     </div>
   );
 };

export default RSVPList;
