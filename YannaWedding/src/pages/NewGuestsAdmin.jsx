import React, { useState, useEffect } from 'react';
import { guestService } from '../services/rsvpService';
import GuestForm from '../components/GuestForm';
import './NewGuestsAdmin.css';

const GuestsAdmin = () => {
  const [guests, setGuests] = useState([]);
  const [guestsByRole, setGuestsByRole] = useState({ individual: [], family: [], friends: [] });
  const [guestCounts, setGuestCounts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'individual', 'family', 'friends'
  const [searchTerm, setSearchTerm] = useState('');
  const [editingGuest, setEditingGuest] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadGuestData();
  }, []);

  const loadGuestData = async () => {
    try {
      setLoading(true);
      const [allGuests, categorizedGuests, counts] = await Promise.all([
        guestService.getAllGuests(),
        guestService.getGuestsByRole(),
        guestService.getGuestCounts()
      ]);
      
      setGuests(allGuests);
      setGuestsByRole(categorizedGuests);
      setGuestCounts(counts);
    } catch (error) {
      console.error('Error loading guest data:', error);
      alert('Error loading guest data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestFormSuccess = () => {
    setShowGuestForm(false);
    loadGuestData(); // Refresh data
  };

  const handleEditGuest = (guest) => {
    setEditingGuest(guest);
    setShowEditModal(true);
  };

  const handleUpdateGuest = async (updatedData) => {
    try {
      await guestService.updateGuest(editingGuest.id, updatedData);
      setShowEditModal(false);
      setEditingGuest(null);
      loadGuestData();
      alert('Guest updated successfully!');
    } catch (error) {
      console.error('Error updating guest:', error);
      alert('Error updating guest. Please try again.');
    }
  };

  const handleDeleteGuest = async (guestId, guestName) => {
    if (window.confirm(`Are you sure you want to delete ${guestName}?`)) {
      try {
        await guestService.deleteGuest(guestId);
        loadGuestData();
        alert('Guest deleted successfully!');
      } catch (error) {
        console.error('Error deleting guest:', error);
        alert('Error deleting guest. Please try again.');
      }
    }
  };

  const handleRSVPUpdate = async (guestId, rsvpData) => {
    try {
      await guestService.updateGuestRSVP(guestId, rsvpData);
      loadGuestData();
      alert('RSVP updated successfully!');
    } catch (error) {
      console.error('Error updating RSVP:', error);
      alert('Error updating RSVP. Please try again.');
    }
  };

  const getFilteredGuests = () => {
    let filteredGuests = guests;

    // Filter by role
    if (filter !== 'all') {
      filteredGuests = filteredGuests.filter(guest => guest.role === filter);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filteredGuests = filteredGuests.filter(guest => 
        guest.name.toLowerCase().includes(search) ||
        guest.email.toLowerCase().includes(search) ||
        (guest.group_info && guest.group_info.group_name.toLowerCase().includes(search))
      );
    }

    return filteredGuests;
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'individual': return '👤';
      case 'family': return '👨‍👩‍👧‍👦';
      case 'friends': return '👥';
      default: return '👤';
    }
  };

  const getStatusIcon = (isComingStatus) => {
    if (isComingStatus === true) return '✅';
    if (isComingStatus === false) return '❌';
    return '⏳';
  };

  const getStatusText = (isComingStatus) => {
    if (isComingStatus === true) return 'Confirmed';
    if (isComingStatus === false) return 'Declined';
    return 'Pending';
  };

  if (loading) {
    return (
      <div className="guests-admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading guest data...</p>
      </div>
    );
  }

  return (
    <div className="guests-admin">
      {/* Header */}
      <div className="guests-admin-header">
        <h1>Guest Management</h1>
        <button 
          className="btn-add-guest"
          onClick={() => setShowGuestForm(true)}
        >
          ➕ Add Guest/Group
        </button>
      </div>

      {/* Statistics Cards */}
      {guestCounts && (
        <div className="stats-grid">
          <div className="stat-card overall">
            <div className="stat-icon">🎉</div>
            <div className="stat-info">
              <h3>Total Guests</h3>
              <p className="stat-number">{guestCounts.overall.total}</p>
              <div className="stat-breakdown">
                <span className="confirmed">✅ {guestCounts.overall.confirmed}</span>
                <span className="declined">❌ {guestCounts.overall.declined}</span>
                <span className="pending">⏳ {guestCounts.overall.pending}</span>
              </div>
            </div>
          </div>

          <div className="stat-card individual">
            <div className="stat-icon">👤</div>
            <div className="stat-info">
              <h3>Individual Guests</h3>
              <p className="stat-number">{guestCounts.individual.total}</p>
              <div className="stat-breakdown">
                <span className="confirmed">✅ {guestCounts.individual.confirmed}</span>
                <span className="declined">❌ {guestCounts.individual.declined}</span>
                <span className="pending">⏳ {guestCounts.individual.pending}</span>
              </div>
            </div>
          </div>

          <div className="stat-card family">
            <div className="stat-icon">👨‍👩‍👧‍👦</div>
            <div className="stat-info">
              <h3>Family Members</h3>
              <p className="stat-number">{guestCounts.family.total}</p>
              <div className="stat-breakdown">
                <span className="confirmed">✅ {guestCounts.family.confirmed}</span>
                <span className="declined">❌ {guestCounts.family.declined}</span>
                <span className="pending">⏳ {guestCounts.family.pending}</span>
              </div>
            </div>
          </div>

          <div className="stat-card friends">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h3>Friends</h3>
              <p className="stat-number">{guestCounts.friends.total}</p>
              <div className="stat-breakdown">
                <span className="confirmed">✅ {guestCounts.friends.confirmed}</span>
                <span className="declined">❌ {guestCounts.friends.declined}</span>
                <span className="pending">⏳ {guestCounts.friends.pending}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="guests-controls">
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Guests
          </button>
          <button 
            className={`filter-btn ${filter === 'individual' ? 'active' : ''}`}
            onClick={() => setFilter('individual')}
          >
            👤 Individual
          </button>
          <button 
            className={`filter-btn ${filter === 'family' ? 'active' : ''}`}
            onClick={() => setFilter('family')}
          >
            👨‍👩‍👧‍👦 Family
          </button>
          <button 
            className={`filter-btn ${filter === 'friends' ? 'active' : ''}`}
            onClick={() => setFilter('friends')}
          >
            👥 Friends
          </button>
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search guests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Guest List */}
      <div className="guests-list">
        {getFilteredGuests().length === 0 ? (
          <div className="no-guests">
            <p>No guests found.</p>
            {guests.length === 0 && (
              <button 
                className="btn-add-first"
                onClick={() => setShowGuestForm(true)}
              >
                Add Your First Guest
              </button>
            )}
          </div>
        ) : (
          <div className="guests-table">
            <div className="table-header">
              <div className="col-guest">Guest</div>
              <div className="col-type">Type</div>
              <div className="col-contact">Contact</div>
              <div className="col-status">Status</div>
              <div className="col-actions">Actions</div>
            </div>

            {getFilteredGuests().map(guest => (
              <div key={guest.id} className="table-row">
                <div className="col-guest">
                  <div className="guest-info">
                    <span className="guest-name">{guest.name}</span>
                    {guest.group_info && (
                      <span className="group-name">
                        Group: {guest.group_info.group_name}
                      </span>
                    )}
                    {guest.role === 'individual' && guest.max_count > 1 && (
                      <span className="max-count">
                        Can bring {guest.max_count - 1} companion(s)
                      </span>
                    )}
                  </div>
                </div>

                <div className="col-type">
                  <span className="guest-type">
                    {getRoleIcon(guest.role)} {guest.role}
                  </span>
                </div>

                <div className="col-contact">
                  <div className="contact-info">
                    {guest.email ? (
                      <a href={`mailto:${guest.email}`} className="email-link">
                        {guest.email}
                      </a>
                    ) : (
                      <span className="no-email">No email</span>
                    )}
                  </div>
                </div>

                <div className="col-status">
                  <span className={`status-badge ${getStatusText(guest.is_coming).toLowerCase()}`}>
                    {getStatusIcon(guest.is_coming)} {getStatusText(guest.is_coming)}
                  </span>
                </div>

                <div className="col-actions">
                  <button 
                    className="action-btn edit"
                    onClick={() => handleEditGuest(guest)}
                    title="Edit Guest"
                  >
                    ✏️
                  </button>
                  <button 
                    className="action-btn rsvp"
                    onClick={() => {
                      const newStatus = guest.is_coming === null ? true : 
                                      guest.is_coming === true ? false : null;
                      handleRSVPUpdate(guest.id, { 
                        email: guest.email, 
                        is_coming: newStatus 
                      });
                    }}
                    title="Toggle RSVP Status"
                  >
                    🔄
                  </button>
                  <button 
                    className="action-btn delete"
                    onClick={() => handleDeleteGuest(guest.id, guest.name)}
                    title="Delete Guest"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Guest Form Modal */}
      {showGuestForm && (
        <GuestForm
          onSuccess={handleGuestFormSuccess}
          onCancel={() => setShowGuestForm(false)}
        />
      )}

      {/* Edit Guest Modal */}
      {showEditModal && editingGuest && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Edit Guest</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleUpdateGuest({
                name: formData.get('name'),
                email: formData.get('email'),
                max_count: parseInt(formData.get('max_count')) || 1
              });
            }}>
              <div className="form-group">
                <label>Name</label>
                <input 
                  type="text" 
                  name="name" 
                  defaultValue={editingGuest.name}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  name="email" 
                  defaultValue={editingGuest.email}
                />
              </div>
              {editingGuest.role === 'individual' && (
                <div className="form-group">
                  <label>Max Count</label>
                  <input 
                    type="number" 
                    name="max_count" 
                    min="1"
                    defaultValue={editingGuest.max_count}
                  />
                </div>
              )}
              <div className="modal-actions">
                <button type="button" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit">
                  Update Guest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestsAdmin;
