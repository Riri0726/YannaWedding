import React, { useState } from 'react';
import { adminService } from '../services/rsvpService';

const GuestsAdmin = ({ 
  groups, 
  guestsByGroup, 
  filter, 
  setFilter, 
  newGroupName, 
  setNewGroupName, 
  newGroupType, 
  setNewGroupType, 
  addGroup, 
  updateGuestRSVP, 
  editGuest, 
  deleteGuest, 
  // Add these new props
  createGroup,
  updateGroup,
  deleteGroup,
  createGuest,
  updateGuest,
  deleteGuestFromGroup,
  refresh // Added refresh prop
}) => {
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [showAddGuestModal, setShowAddGuestModal] = useState(false);
  const [showEditGroupModal, setShowEditGroupModal] = useState(false);
  const [showEditGuestModal, setShowEditGuestModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [editingGuest, setEditingGuest] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Add state for delete operations
  const [deletingGroupId, setDeletingGroupId] = useState(null);
  const [deletingGuestId, setDeletingGuestId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  
  // Custom confirmation modal states
  const [showDeleteGroupConfirm, setShowDeleteGroupConfirm] = useState(false);
  const [showDeleteGuestConfirm, setShowDeleteGuestConfirm] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [guestToDelete, setGuestToDelete] = useState(null);
  const [showQuickStatusModal, setShowQuickStatusModal] = useState(false);
  const [guestForQuickEdit, setGuestForQuickEdit] = useState(null);
  
  // Form states
  const [groupForm, setGroupForm] = useState({
    group_name: '',
    group_count_max: '',
    is_predetermined: false,
    guest_type: 'bride'
  });
  
  const [guestForm, setGuestForm] = useState({
    name: '',
    email: '',
    is_coming: null,
    in_group: true
  });

  // Toast notification function
  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  const handleAddGroup = async (e) => {
    e.preventDefault();
    try {
      await createGroup(groupForm);
      setShowAddGroupModal(false);
      setGroupForm({ group_name: '', group_count_max: '', is_predetermined: false, guest_type: 'bride' });
      showToast('Group created successfully!', 'success');
    } catch (error) {
      console.error('Error adding group:', error);
      showToast('Failed to create group: ' + error.message, 'error');
    }
  };

  const handleEditGroup = async (e) => {
    e.preventDefault();
    try {
      await updateGroup(editingGroup.id, groupForm);
      setShowEditGroupModal(false);
      setEditingGroup(null);
      setGroupForm({ group_name: '', group_count_max: '', is_predetermined: false, guest_type: 'bride' });
      showToast('Group updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating group:', error);
      showToast('Failed to update group: ' + error.message, 'error');
    }
  };

  const handleDeleteGroup = async (groupId) => {
    // Show custom confirmation modal instead of window.confirm
    setGroupToDelete({ id: groupId, name: groups.find(g => g.id === groupId)?.name || 'Unknown Group' });
    setShowDeleteGroupConfirm(true);
  };

  const handleAddGuest = async (e) => {
    e.preventDefault();
    try {
      await createGuest({ ...guestForm, group_id: selectedGroupId });
      setShowAddGuestModal(false);
      setGuestForm({ name: '', email: '', is_coming: null, in_group: true });
      setSelectedGroupId('');
      showToast('Guest added successfully!', 'success');
    } catch (error) {
      console.error('Error adding guest:', error);
      showToast('Failed to add guest: ' + error.message, 'error');
    }
  };

  const handleEditGuest = async (e) => {
    e.preventDefault();
    try {
      await updateGuest(editingGuest.id, guestForm);
      setShowEditGuestModal(false);
      setEditingGuest(null);
      setGuestForm({ name: '', email: '', is_coming: null, in_group: true });
      showToast('Guest updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating guest:', error);
      showToast('Failed to update guest: ' + error.message, 'error');
    }
  };

  const handleDeleteGuest = async (guestId, groupId) => {
    // Show custom confirmation modal instead of window.confirm
    const guest = guestsByGroup[groupId]?.find(g => g.id === guestId);
    setGuestToDelete({ id: guestId, groupId, name: guest?.name || 'Unknown Guest' });
    setShowDeleteGuestConfirm(true);
  };

  // Actual delete functions that run after confirmation
  const confirmDeleteGroup = async () => {
    if (!groupToDelete) return;
    
    try {
      setDeletingGroupId(groupToDelete.id);
      showToast('Deleting group...', 'info');

      await deleteGroup(groupToDelete.id);

      showToast('Group deleted successfully!', 'success');
      setDeletingGroupId(null);
      setShowDeleteGroupConfirm(false);
      setGroupToDelete(null);
      
      // Trigger data refresh
      if (refresh && typeof refresh === 'function') {
        refresh();
      }
    } catch (error) {
      console.error('Error deleting group:', error);
      showToast('Failed to delete group: ' + error.message, 'error');
      setDeletingGroupId(null);
      setShowDeleteGroupConfirm(false);
      setGroupToDelete(null);
    }
  };

  const confirmDeleteGuest = async () => {
    if (!guestToDelete) return;
    
    try {
      setDeletingGuestId(guestToDelete.id);
      showToast('Deleting guest...', 'info');

      // Use the existing deleteGuest function instead of deleteGuestFromGroup
      await deleteGuest(guestToDelete.id);

      showToast('Guest deleted successfully!', 'success');
      setDeletingGuestId(null);
      setShowDeleteGuestConfirm(false);
      setGuestToDelete(null);
      
      // Trigger data refresh
      if (refresh && typeof refresh === 'function') {
        refresh();
      }
    } catch (error) {
      console.error('Error deleting guest:', error);
      showToast('Failed to delete guest: ' + error.message, 'error');
      setDeletingGuestId(null);
      setShowDeleteGuestConfirm(false);
      setGuestToDelete(null);
    }
  };

  const openQuickStatusModal = (guest) => {
    setGuestForQuickEdit(guest);
    setShowQuickStatusModal(true);
  };

  const handleQuickStatusUpdate = async (newStatus) => {
    if (!guestForQuickEdit) return;
    
    try {
      await adminService.updateGuest(guestForQuickEdit.id, {
        is_coming: newStatus,
        rsvp_submitted: true,
        rsvp_date: new Date().toISOString()
      });
      showToast('Guest status updated successfully!', 'success');
      setShowQuickStatusModal(false);
      setGuestForQuickEdit(null);
      await refresh();
    } catch (error) {
      showToast(error.message || 'Failed to update guest status', 'error');
    }
  };

  const openEditGroupModal = (group) => {
    setEditingGroup(group);
    setGroupForm({
      group_name: group.group_name,
      group_count_max: group.group_count_max.toString(),
      is_predetermined: group.is_predetermined,
      guest_type: group.guest_type || 'bride'
    });
    setShowEditGroupModal(true);
  };

  const openEditGuestModal = (guest) => {
    setEditingGuest(guest);
    setGuestForm({
      name: guest.name,
      email: guest.email || '',
      is_coming: guest.is_coming,
      in_group: guest.in_group
    });
    setShowEditGuestModal(true);
  };

  // Filter and search logic
  const filteredGroups = groups.filter(group => {
    // Filter by guest type (bride/groom/all)
    if (filter !== 'all' && group.guest_type !== filter) {
      return false;
    }
    
    // Filter by search term (group name)
    if (searchTerm && !group.group_name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="guests-section">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`toast toast-${toastType}`}>
          <span>{toastMessage}</span>
        </div>
      )}

      <h2>Guests</h2>

      {/* Filter and Search Section */}
      <div className="filter-section">
        <div className="filter-controls">
          {/* Search Input */}
          <div className="search-input">
            <input
              type="text"
              placeholder="Search groups by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-field"
            />
          </div>
          
          {/* Guest Type Filter */}
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All</option>
            <option value="bride">Bride</option>
            <option value="groom">Groom</option>
          </select>
        </div>
      </div>

      {/* Add Group Button */}
      <div className="add-group-section">
        <button 
          onClick={() => setShowAddGroupModal(true)}
          className="add-group-btn"
        >
          + Add New Group
        </button>
      </div>

      {/* Group Cards */}
      {filteredGroups.length === 0 ? (
        <div className="no-results">
          <p>No groups found matching your search criteria.</p>
          <p>Try adjusting your search term or filter selection.</p>
        </div>
      ) : (
        <div className="groups-grid">
          {filteredGroups.map((group, idx) => (
            <div key={idx} className="group-card">
              <div className="group-header">
                <h3>{group.is_predetermined ? 'Predetermined' : 'Unknown'} - {group.group_name}</h3>
                <div className="group-actions">
                  <button 
                    onClick={() => openEditGroupModal(group)}
                    className="edit-btn"
                  >
                    Edit Group
                  </button>
                  <button 
                    onClick={() => handleDeleteGroup(group.id)}
                    className="delete-btn"
                    disabled={deletingGroupId === group.id}
                  >
                    {deletingGroupId === group.id ? 'Deleting...' : 'Delete Group'}
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedGroupId(group.id);
                      setShowAddGuestModal(true);
                    }}
                    className="add-guest-btn"
                  >
                    + Add Guest
                  </button>
                </div>
              </div>
              
              <div className="table-container">
                <table className="guest-table">
                  <thead>
                    <tr>
                      <th>Guest</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(guestsByGroup[group.id] || []).length > 0 ? (
                      (guestsByGroup[group.id] || []).map((g) => (
                        <tr key={g.id}>
                          <td>{g.name}</td>
                          <td>{g.name === 'Family Cannot Attend' ? 'N/A' : (g.email || '-')}</td>
                                                <td>
                          <div 
                            className="clickable-status"
                            onClick={() => openQuickStatusModal(g)}
                            title="Click to change status"
                          >
                            {g.rsvp_submitted ? (
                              g.is_coming === true ? (
                                <span className="status-going">Going</span>
                              ) : g.is_coming === false ? (
                                g.name === 'Family Cannot Attend' ? (
                                  <span className="status-not-going">Family Cannot Attend</span>
                                ) : (
                                  <span className="status-not-going">Not Going</span>
                                )
                              ) : (
                                <span className="status-pending">Pending</span>
                              )
                            ) : (
                              <span className="status-pending">Pending</span>
                            )}
                          </div>
                        </td>
                          <td className="action-buttons">
                            <button 
                              onClick={() => openEditGuestModal(g)}
                              className="edit-btn"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteGuest(g.id, group.id)}
                              className="delete-btn"
                              disabled={deletingGuestId === g.id}
                            >
                              {deletingGuestId === g.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center text-gray-500">No guests yet</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Group Modal */}
      {showAddGroupModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add New Group</h3>
            <form onSubmit={handleAddGroup}>
              <div className="form-group">
                <label>Group Name:</label>
                <input
                  type="text"
                  value={groupForm.group_name}
                  onChange={(e) => setGroupForm({...groupForm, group_name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Max Count:</label>
                <input
                  type="number"
                  value={groupForm.group_count_max}
                  onChange={(e) => setGroupForm({...groupForm, group_count_max: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Guest Type:</label>
                <select
                  value={groupForm.guest_type}
                  onChange={(e) => setGroupForm({...groupForm, guest_type: e.target.value})}
                >
                  <option value="bride">Bride's Guest</option>
                  <option value="groom">Groom's Guest</option>
                </select>
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={groupForm.is_predetermined}
                    onChange={(e) => setGroupForm({...groupForm, is_predetermined: e.target.checked})}
                  />
                  Predetermined Group
                </label>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Add Group</button>
                <button type="button" onClick={() => setShowAddGroupModal(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Group Modal */}
      {showEditGroupModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit Group</h3>
            <form onSubmit={handleEditGroup}>
              <div className="form-group">
                <label>Group Name:</label>
                <input
                  type="text"
                  value={groupForm.group_name}
                  onChange={(e) => setGroupForm({...groupForm, group_name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Max Count:</label>
                <input
                  type="number"
                  value={groupForm.group_count_max}
                  onChange={(e) => setGroupForm({...groupForm, group_count_max: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Guest Type:</label>
                <select
                  value={groupForm.guest_type}
                  onChange={(e) => setGroupForm({...groupForm, guest_type: e.target.value})}
                >
                  <option value="bride">Bride's Guest</option>
                  <option value="groom">Groom's Guest</option>
                </select>
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={groupForm.is_predetermined}
                    onChange={(e) => setGroupForm({...groupForm, is_predetermined: e.target.checked})}
                  />
                  Predetermined Group
                </label>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Update Group</button>
                <button type="button" onClick={() => setShowEditGroupModal(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Guest Modal */}
      {showAddGuestModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add New Guest</h3>
            <form onSubmit={handleAddGuest}>
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  value={guestForm.name}
                  onChange={(e) => setGuestForm({...guestForm, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  value={guestForm.email}
                  onChange={(e) => setGuestForm({...guestForm, email: e.target.value})}
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Add Guest</button>
                <button type="button" onClick={() => setShowAddGuestModal(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Guest Modal */}
      {showEditGuestModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit Guest</h3>
            <form onSubmit={handleEditGuest}>
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  value={guestForm.name}
                  onChange={(e) => setGuestForm({...guestForm, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  value={guestForm.email}
                  onChange={(e) => setGuestForm({...guestForm, email: e.target.value})}
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Update Guest</button>
                <button type="button" onClick={() => setShowEditGuestModal(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modals */}
      {showDeleteGroupConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>⚠️ Delete Group Confirmation</h3>
            <p>Are you sure you want to delete the group <strong>"{groupToDelete?.name}"</strong>?</p>
            <p><strong>Warning:</strong> This will also delete ALL guests in this group!</p>
            <div className="modal-actions">
              <button 
                onClick={() => setShowDeleteGroupConfirm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteGroup}
                className="btn-primary"
                disabled={deletingGroupId === groupToDelete?.id}
              >
                {deletingGroupId === groupToDelete?.id ? 'Deleting...' : 'Delete Group'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteGuestConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>⚠️ Delete Guest Confirmation</h3>
            <p>Are you sure you want to delete the guest <strong>"{guestToDelete?.name}"</strong>?</p>
            <div className="modal-actions">
              <button 
                onClick={() => setShowDeleteGuestConfirm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteGuest}
                className="btn-primary"
                disabled={deletingGuestId === guestToDelete?.id}
              >
                {deletingGuestId === guestToDelete?.id ? 'Deleting...' : 'Delete Guest'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Status Edit Modal */}
      {showQuickStatusModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Quick Status Update</h3>
            <p>Update status for <strong>"{guestForQuickEdit?.name}"</strong></p>
            
            <div className="status-options">
              <button 
                onClick={() => handleQuickStatusUpdate(true)}
                className={`status-option ${guestForQuickEdit?.is_coming === true ? 'active' : ''}`}
              >
                ✅ Going
              </button>
              <button 
                onClick={() => handleQuickStatusUpdate(false)}
                className={`status-option ${guestForQuickEdit?.is_coming === false ? 'active' : ''}`}
              >
                ❌ Not Going
              </button>
              <button 
                onClick={() => handleQuickStatusUpdate(null)}
                className={`status-option ${guestForQuickEdit?.is_coming === null ? 'active' : ''}`}
              >
                ⏳ Pending
              </button>
            </div>
            
            {guestForQuickEdit?.name === 'Family Cannot Attend' && (
              <div className="info-note">
                <p><strong>Note:</strong> This is a placeholder record for a group that declined attendance. 
                You can change the status if needed, but the name will remain as "Family Cannot Attend".</p>
              </div>
            )}
            
            <div className="modal-actions">
              <button 
                onClick={() => setShowQuickStatusModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestsAdmin;
