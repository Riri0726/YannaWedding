import React, { useState, useEffect } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { guestService } from '../services/rsvpService';
import { db } from '../firebase';

const GuestsAdminUpdated = () => {
  const [guests, setGuests] = useState([]);
  const [groups, setGroups] = useState([]);
  const [guestsByGroup, setGuestsByGroup] = useState({});
  const [individualGuests, setIndividualGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [showAddGuestModal, setShowAddGuestModal] = useState(false);
  const [showEditGroupModal, setShowEditGroupModal] = useState(false);
  const [showEditGuestModal, setShowEditGuestModal] = useState(false);
  const [showDeleteGroupConfirm, setShowDeleteGroupConfirm] = useState(false);
  const [showDeleteGuestConfirm, setShowDeleteGuestConfirm] = useState(false);
  const [showQuickStatusModal, setShowQuickStatusModal] = useState(false);

  // Edit states
  const [editingGroup, setEditingGroup] = useState(null);
  const [editingGuest, setEditingGuest] = useState(null);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [guestToDelete, setGuestToDelete] = useState(null);
  const [guestForQuickEdit, setGuestForQuickEdit] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState('');

  // Form states
  const [guestFormType, setGuestFormType] = useState('individual'); // 'individual' or 'group'
  const [groupForm, setGroupForm] = useState({
    group_name: '',
    group_count_max: '',
    role: 'family' // family or friends
  });
  
  const [individualForm, setIndividualForm] = useState({
    name: '',
    email: '',
    max_count: 1
  });

  const [guestForm, setGuestForm] = useState({
    name: '',
    email: '',
    is_coming: null
  });

  // Toast notification
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Load data
  const refresh = async () => {
    try {
      setLoading(true);
      const allGuests = await guestService.getAllGuests();
      const allGroups = await guestService.getAllGroups();
      
      setGuests(allGuests);
      setGroups(allGroups);
      
      // Separate individual guests from group guests
      const individuals = allGuests.filter(g => !g.in_group);
      setIndividualGuests(individuals);
      
      // Group guests by their group_id
      const groupedGuests = {};
      allGroups.forEach(group => {
        groupedGuests[group.id] = allGuests.filter(g => g.group_id === group.id);
      });
      setGuestsByGroup(groupedGuests);
      
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Error loading data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  // Individual Guest Functions
  const handleAddIndividualGuest = async (e) => {
    e.preventDefault();
    try {
      await guestService.createIndividualGuest(individualForm);
      setShowAddGuestModal(false);
      setIndividualForm({ name: '', email: '', max_count: 1 });
      refresh();
      showToast('Individual guest added successfully!');
    } catch (error) {
      console.error('Error adding individual guest:', error);
      showToast('Failed to add individual guest', 'error');
    }
  };

  // Group Functions
  const handleAddGroup = async (e) => {
    e.preventDefault();
    try {
      await guestService.createGroupWithGuests(groupForm, []);
      setShowAddGroupModal(false);
      setGroupForm({ group_name: '', group_count_max: '', role: 'family' });
      refresh();
      showToast('Group created successfully!');
    } catch (error) {
      console.error('Error adding group:', error);
      showToast('Failed to create group', 'error');
    }
  };

  const handleEditGroup = async (e) => {
    e.preventDefault();
    try {
      // This would need to be implemented in guestService
      showToast('Group update feature coming soon!', 'info');
      setShowEditGroupModal(false);
    } catch (error) {
      console.error('Error updating group:', error);
      showToast('Failed to update group', 'error');
    }
  };

  const handleDeleteGroup = async () => {
    try {
      await guestService.deleteGroup(groupToDelete.id);
      setShowDeleteGroupConfirm(false);
      setGroupToDelete(null);
      refresh();
      showToast('Group deleted successfully!');
    } catch (error) {
      console.error('Error deleting group:', error);
      showToast('Failed to delete group', 'error');
    }
  };

  // Guest Functions
  const handleAddGuest = async (e) => {
    e.preventDefault();
    try {
      // Create guest in selected group
      const guestsCol = collection(db, 'guests');
      await addDoc(guestsCol, {
        group_id: selectedGroupId,
        name: guestForm.name,
        email: guestForm.email,
        role: groups.find(g => g.id === selectedGroupId)?.role || 'family',
        in_group: true,
        is_coming: guestForm.is_coming,
        createdAt: new Date().toISOString()
      });
      
      setShowAddGuestModal(false);
      setGuestForm({ name: '', email: '', is_coming: null });
      refresh();
      showToast('Guest added to group successfully!');
    } catch (error) {
      console.error('Error adding guest to group:', error);
      showToast('Failed to add guest to group', 'error');
    }
  };

  const handleUpdateGuestRSVP = async (guestId, isComingStatus) => {
    try {
      await guestService.updateGuestRSVP(guestId, { is_coming: isComingStatus });
      refresh();
      showToast('Guest RSVP updated successfully!');
    } catch (error) {
      console.error('Error updating guest RSVP:', error);
      showToast('Failed to update guest RSVP', 'error');
    }
  };

  const handleDeleteGuest = async () => {
    try {
      await guestService.deleteGuest(guestToDelete.id);
      setShowDeleteGuestConfirm(false);
      setGuestToDelete(null);
      refresh();
      showToast('Guest deleted successfully!');
    } catch (error) {
      console.error('Error deleting guest:', error);
      showToast('Failed to delete guest', 'error');
    }
  };

  // Filter logic
  const getFilteredData = () => {
    let filteredGroups = groups;
    let filteredIndividuals = individualGuests;

    if (filter === 'family') {
      filteredGroups = groups.filter(g => g.role === 'family');
      filteredIndividuals = [];
    } else if (filter === 'friends') {
      filteredGroups = groups.filter(g => g.role === 'friends');
      filteredIndividuals = [];
    } else if (filter === 'individual') {
      filteredGroups = [];
    }

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filteredGroups = filteredGroups.filter(g => 
        g.group_name.toLowerCase().includes(search)
      );
      filteredIndividuals = filteredIndividuals.filter(g => 
        g.name.toLowerCase().includes(search) || 
        g.email.toLowerCase().includes(search)
      );
    }

    return { filteredGroups, filteredIndividuals };
  };

  const { filteredGroups, filteredIndividuals } = getFilteredData();

  if (loading) {
    return <div className="loading">Loading guest data...</div>;
  }

  return (
    <div className="guests-admin">
      {/* Toast Notifications */}
      {toastMessage && (
        <div className={`toast toast-${toastType}`}>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="guests-admin-header">
        <h1>Guest Management</h1>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => {
              setGuestFormType('individual');
              setShowAddGuestModal(true);
            }}
          >
            ➕ Add Individual Guest
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => setShowAddGroupModal(true)}
          >
            👥 Add Group
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="stats-container">
        <div className="stat-card">
          <span className="stat-number">{individualGuests.length}</span>
          <span className="stat-label">Individual Guests</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{groups.filter(g => g.role === 'family').length}</span>
          <span className="stat-label">Family Groups</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{groups.filter(g => g.role === 'friends').length}</span>
          <span className="stat-label">Friend Groups</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{guests.length}</span>
          <span className="stat-label">Total Guests</span>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-controls">
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
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
        <input
          type="text"
          placeholder="Search guests..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Individual Guests Section */}
      {(filter === 'all' || filter === 'individual') && (
        <div className="guests-section">
          <h2>👤 Individual Guests ({filteredIndividuals.length})</h2>
          <div className="guests-grid">
            {filteredIndividuals.map(guest => (
              <div key={guest.id} className="guest-card individual">
                <div className="guest-info">
                  <h3>{guest.name}</h3>
                  <p>{guest.email || 'No email'}</p>
                  {guest.max_count > 1 && (
                    <p className="companion-info">Can bring {guest.max_count - 1} companion(s)</p>
                  )}
                </div>
                <div className="guest-actions">
                  <select
                    value={guest.is_coming === null ? '' : guest.is_coming.toString()}
                    onChange={(e) => {
                      const value = e.target.value === '' ? null : e.target.value === 'true';
                      handleUpdateGuestRSVP(guest.id, value);
                    }}
                    className="status-select"
                  >
                    <option value="">Pending</option>
                    <option value="true">✅ Coming</option>
                    <option value="false">❌ Not Coming</option>
                  </select>
                  <button
                    onClick={() => {
                      setGuestToDelete(guest);
                      setShowDeleteGuestConfirm(true);
                    }}
                    className="btn-delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Groups Section */}
      {(filter === 'all' || filter === 'family' || filter === 'friends') && (
        <div className="groups-section">
          <h2>👥 Groups ({filteredGroups.length})</h2>
          {filteredGroups.map(group => (
            <div key={group.id} className="group-container">
              <div className="group-header">
                <div className="group-info">
                  <h3>
                    {group.role === 'family' ? '👨‍👩‍👧‍👦' : '👥'} {group.group_name}
                  </h3>
                  <span className="group-meta">
                    Max: {group.group_count_max} | 
                    Current: {guestsByGroup[group.id]?.length || 0} |
                    Role: {group.role}
                  </span>
                </div>
                <div className="group-actions">
                  <button
                    onClick={() => {
                      setSelectedGroupId(group.id);
                      setGuestFormType('group');
                      setShowAddGuestModal(true);
                    }}
                    className="btn btn-sm"
                  >
                    ➕ Add Guest
                  </button>
                  <button
                    onClick={() => {
                      setGroupToDelete(group);
                      setShowDeleteGroupConfirm(true);
                    }}
                    className="btn-delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              <div className="group-guests">
                {guestsByGroup[group.id]?.map(guest => (
                  <div key={guest.id} className="guest-item">
                    <div className="guest-details">
                      <span className="guest-name">{guest.name}</span>
                      <span className="guest-email">{guest.email || 'No email'}</span>
                    </div>
                    <div className="guest-controls">
                      <select
                        value={guest.is_coming === null ? '' : guest.is_coming.toString()}
                        onChange={(e) => {
                          const value = e.target.value === '' ? null : e.target.value === 'true';
                          handleUpdateGuestRSVP(guest.id, value);
                        }}
                        className="status-select-sm"
                      >
                        <option value="">Pending</option>
                        <option value="true">✅ Coming</option>
                        <option value="false">❌ Not Coming</option>
                      </select>
                      <button
                        onClick={() => {
                          setGuestToDelete(guest);
                          setShowDeleteGuestConfirm(true);
                        }}
                        className="btn-delete-sm"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
                {(!guestsByGroup[group.id] || guestsByGroup[group.id].length === 0) && (
                  <p className="no-guests">No guests in this group yet.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Group Modal */}
      {showAddGroupModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add New Group</h2>
              <button 
                className="modal-close"
                onClick={() => setShowAddGroupModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddGroup}>
              <div className="form-group">
                <label>Group Name</label>
                <input
                  type="text"
                  value={groupForm.group_name}
                  onChange={(e) => setGroupForm({...groupForm, group_name: e.target.value})}
                  placeholder="e.g., Smith Family, College Friends"
                  required
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={groupForm.role}
                  onChange={(e) => setGroupForm({...groupForm, role: e.target.value})}
                  required
                >
                  <option value="family">👨‍👩‍👧‍👦 Family</option>
                  <option value="friends">👥 Friends</option>
                </select>
              </div>
              <div className="form-group">
                <label>Maximum Group Size</label>
                <input
                  type="number"
                  value={groupForm.group_count_max}
                  onChange={(e) => setGroupForm({...groupForm, group_count_max: e.target.value})}
                  min="1"
                  max="20"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddGroupModal(false)}>
                  Cancel
                </button>
                <button type="submit">Create Group</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Guest Modal */}
      {showAddGuestModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>
                {guestFormType === 'individual' ? 'Add Individual Guest' : 'Add Guest to Group'}
              </h2>
              <button 
                className="modal-close"
                onClick={() => setShowAddGuestModal(false)}
              >
                ×
              </button>
            </div>
            
            {guestFormType === 'individual' ? (
              <form onSubmit={handleAddIndividualGuest}>
                <div className="form-group">
                  <label>Guest Name</label>
                  <input
                    type="text"
                    value={individualForm.name}
                    onChange={(e) => setIndividualForm({...individualForm, name: e.target.value})}
                    placeholder="Full name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email (Optional)</label>
                  <input
                    type="email"
                    value={individualForm.email}
                    onChange={(e) => setIndividualForm({...individualForm, email: e.target.value})}
                    placeholder="guest@email.com"
                  />
                </div>
                <div className="form-group">
                  <label>Can Bring Companions?</label>
                  <select
                    value={individualForm.max_count}
                    onChange={(e) => setIndividualForm({...individualForm, max_count: parseInt(e.target.value)})}
                  >
                    <option value={1}>No companions (just themselves)</option>
                    <option value={2}>Can bring 1 companion</option>
                    <option value={3}>Can bring 2 companions</option>
                    <option value={4}>Can bring 3 companions</option>
                  </select>
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowAddGuestModal(false)}>
                    Cancel
                  </button>
                  <button type="submit">Add Individual Guest</button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleAddGuest}>
                <div className="form-group">
                  <label>Group</label>
                  <select
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                    required
                  >
                    <option value="">Select a group</option>
                    {groups.map(group => (
                      <option key={group.id} value={group.id}>
                        {group.group_name} ({group.role})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Guest Name</label>
                  <input
                    type="text"
                    value={guestForm.name}
                    onChange={(e) => setGuestForm({...guestForm, name: e.target.value})}
                    placeholder="Full name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email (Optional)</label>
                  <input
                    type="email"
                    value={guestForm.email}
                    onChange={(e) => setGuestForm({...guestForm, email: e.target.value})}
                    placeholder="guest@email.com"
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowAddGuestModal(false)}>
                    Cancel
                  </button>
                  <button type="submit">Add Guest to Group</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmations */}
      {showDeleteGroupConfirm && (
        <div className="modal-overlay">
          <div className="modal modal-confirm">
            <h3>Delete Group</h3>
            <p>Are you sure you want to delete "{groupToDelete?.group_name}"? This will also delete all guests in this group.</p>
            <div className="modal-actions">
              <button onClick={() => setShowDeleteGroupConfirm(false)}>Cancel</button>
              <button onClick={handleDeleteGroup} className="btn-danger">Delete Group</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteGuestConfirm && (
        <div className="modal-overlay">
          <div className="modal modal-confirm">
            <h3>Delete Guest</h3>
            <p>Are you sure you want to delete "{guestToDelete?.name}"?</p>
            <div className="modal-actions">
              <button onClick={() => setShowDeleteGuestConfirm(false)}>Cancel</button>
              <button onClick={handleDeleteGuest} className="btn-danger">Delete Guest</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestsAdminUpdated;
