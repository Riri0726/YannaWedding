import React, { useState } from 'react';
import { useRSVP } from '../context/RSVPContext';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

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
    <div className="confirm-modal-overlay">
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
  const { organizedData, setSelectedGroup, setSelectedGuest, setIsModalOpen, loading, error, guestsByGroup } = useRSVP();
  const [selectedSide, setSelectedSide] = useState('select');
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
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
      // For predetermined groups: only block if ALL guests have final status (Going/Not Going)
      // If no guests exist yet, allow opening the modal
      if (groupGuests.length > 0) {
        const allHaveFinalStatus = groupGuests.every(guest => guest.is_coming !== null);
        if (allHaveFinalStatus) {
          return; // Don't open modal if all guests have final status
        }
      }
    } else {
      // For unknown groups: block if they have final status (Going/Not Going)
      // Admin can unlock by changing status to Pending (is_coming = null)
      const hasFinalStatus = groupGuests.some(guest => guest.is_coming !== null);
      if (hasFinalStatus) {
        return; // Don't open modal if they have final status
      }
    }
    
    // Expose toast function to modal
    window.showToast = showToast;
    
    // Ensure confirm modal is closed before opening RSVP modal
    setShowConfirmModal(false);
    
    setSelectedGroup(group);
    setIsModalOpen(true);
  };

  const handleIndividualGuestClick = (guest) => {
    // Check if guest already has final status
    if (guest.is_coming !== null) {
      return; // Don't open modal if guest has final status
    }
    
    // Expose toast function to modal
    window.showToast = showToast;
    
    // Ensure confirm modal is closed before opening RSVP modal
    setShowConfirmModal(false);
    
    // For individual predetermined guests, create a proper group structure
    // that indicates this is a predetermined guest that should be updated
    const tempGroup = {
      id: guest.group_id || `individual_${guest.id}`,
      group_name: guest.name,
      is_predetermined: true, // This guest exists in database, should be updated not created
      guest_type: guest.guest_type,
      role: 'individual',
      isIndividual: true,
      originalGuest: guest
    };
    
    setSelectedGroup(tempGroup);
    setSelectedGuest(guest); // Set the actual guest object for predetermined individual guests
    setIsModalOpen(true);
  };

  // Filter data based on selected side and search term
  const getFilteredData = () => {
    if (selectedSide === 'select') return { individual: [], family: [], friends: [] };
    
    const filterByGuestType = (items, isGuest = false) => {
      return items.filter(item => {
        // Filter by guest type (bride/groom)
        if (item.guest_type !== selectedSide) return false;
        
        // Filter by search term
        const searchField = isGuest ? item.name : item.group_name;
        if (searchTerm && !searchField.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }
        
        return true;
      });
    };
    
    return {
      individual: filterByGuestType(organizedData.individual || [], true),
      family: filterByGuestType(organizedData.family || []),
      friends: filterByGuestType(organizedData.friends || [])
    };
  };

  const filteredData = getFilteredData();



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
          
          {(filteredData.individual.length === 0 && filteredData.family.length === 0 && filteredData.friends.length === 0) ? (
            <div className="no-results">
              {searchTerm ? `No ${selectedSide} guests found matching "${searchTerm}"` : `No ${selectedSide} guests found`}
            </div>
          ) : (
            <div className="guest-sections">
              
              {/* INDIVIDUAL GUESTS SECTION */}
              {filteredData.individual.length > 0 && (
                <div className="guest-section">
                  <h3 className="section-title">Individual Guests</h3>
                  <div className="uniform-guest-grid">
                    {filteredData.individual.map((guest) => {
                      const isLocked = guest.is_coming !== null;
                      
                      return (
                        <div
                          key={`individual_${guest.id}`}
                          className={`uniform-guest-card ${isLocked ? 'locked' : ''}`}
                        >
                          <h4>{guest.name}</h4>
                          {isLocked ? (
                            <div className="lock-indicator">
                              🔒 Response Submitted
                            </div>
                          ) : (
                            <button 
                              className="respond-btn"
                              onClick={() => handleIndividualGuestClick(guest)}
                            >
                              Respond
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* FAMILY GROUPS SECTION */}
              {filteredData.family.length > 0 && (
                <div className="guest-section">
                  <h3 className="section-title">Family Groups</h3>
                  <div className="uniform-guest-grid">
                    {filteredData.family.map((group) => {
                      const groupGuests = guestsByGroup[group.id] || [];
                      
                      // Determine if card should be locked
                      let isLocked = false;
                      if (group.is_predetermined) {
                        if (groupGuests.length === 0) {
                          isLocked = false;
                        } else {
                          isLocked = groupGuests.every(guest => guest.is_coming !== null);
                        }
                      } else {
                        const hasFinalStatus = groupGuests.some(guest => guest.is_coming !== null);
                        isLocked = hasFinalStatus;
                      }
                      
                      return (
                        <div
                          key={group.id}
                          className={`uniform-guest-card ${isLocked ? 'locked' : ''}`}
                        >
                          <h4>{group.group_name}</h4>
                          {isLocked ? (
                            <div className="lock-indicator">
                              {group.is_predetermined ? '🔒 All Guests Responded' : '🔒 Response Submitted'}
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
                </div>
              )}

              {/* FRIENDS GROUPS SECTION */}
              {filteredData.friends.length > 0 && (
                <div className="guest-section">
                  <h3 className="section-title">Friends Groups</h3>
                  <div className="uniform-guest-grid">
                    {filteredData.friends.map((group) => {
                      const groupGuests = guestsByGroup[group.id] || [];
                      
                      // Determine if card should be locked
                      let isLocked = false;
                      if (group.is_predetermined) {
                        if (groupGuests.length === 0) {
                          isLocked = false;
                        } else {
                          isLocked = groupGuests.every(guest => guest.is_coming !== null);
                        }
                      } else {
                        const hasFinalStatus = groupGuests.some(guest => guest.is_coming !== null);
                        isLocked = hasFinalStatus;
                      }
                      
                      return (
                        <div
                          key={group.id}
                          className={`uniform-guest-card ${isLocked ? 'locked' : ''}`}
                        >
                          <h4>{group.group_name}</h4>
                          {isLocked ? (
                            <div className="lock-indicator">
                              {group.is_predetermined ? '🔒 All Guests Responded' : '🔒 Response Submitted'}
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
                </div>
              )}

            </div>
          )}
        </>
      )}
     </div>
   );
 };

export default RSVPList;
