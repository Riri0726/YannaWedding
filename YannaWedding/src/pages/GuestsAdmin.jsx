import React, { useState } from 'react';
import { adminService, guestService } from '../services/rsvpService';
import { 
  UserIcon, 
  UsersIcon, 
  PlusIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const GuestsAdmin = ({ 
  groups, 
  guestsByGroup, 
  individualGuests = [], // Add this new prop
  filter, 
  setFilter,
  deleteGuest, 
  // Add these new props
  createGroup,
  updateGroup,
  deleteGroup,
  createGuest,
  updateGuest,
  refresh // Added refresh prop
}) => {
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [showAddGuestModal, setShowAddGuestModal] = useState(false);
  const [showAddIndividualModal, setShowAddIndividualModal] = useState(false);
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
    group_count_max: '1', // Default to 1
    is_predetermined: false,
    role: 'family', // family or friends
    guest_type: 'bride' // bride or groom - for all guests in this group
  });
  
  const [guestForm, setGuestForm] = useState({
    name: '',
    email: '',
    is_coming: null,
    in_group: true
  });

  // Individual guest form state
  const [individualForm, setIndividualForm] = useState({
    name: '',
    email: '',
    max_count: 0, // Start with 0 for individual guests
    guest_type: 'bride' // bride or groom
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
      setGroupForm({ group_name: '', group_count_max: '', is_predetermined: false, role: 'family', guest_type: 'bride' });
      refresh(); // Refresh the data
      showToast('Group created successfully!', 'success');
    } catch (error) {
      console.error('Error adding group:', error);
      showToast('Failed to create group: ' + error.message, 'error');
    }
  };

  const handleAddIndividualGuest = async (e) => {
    e.preventDefault();
    try {
      await guestService.createIndividualGuest(individualForm);
      setShowAddIndividualModal(false);
      setIndividualForm({ name: '', email: '', max_count: 0, guest_type: 'bride' });
      refresh(); // Refresh the data
      showToast('Individual guest added successfully!', 'success');
    } catch (error) {
      console.error('Error adding individual guest:', error);
      showToast('Failed to add individual guest: ' + error.message, 'error');
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
      guest_type: group.guest_type || 'bride',
      role: group.role || 'family' // Default to 'family' if no role is set
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

  // Only show top-level individual guests (no companion_of)
  const filteredIndividualGuests = individualGuests.filter(guest => {
    if (guest.companion_of) return false;
    if (filter !== 'all' && guest.guest_type !== filter) {
      return false;
    }
    if (searchTerm && !guest.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Combine groups and individual guests for display
  const displayItems = [
    ...filteredGroups.map(group => ({ ...group, isGroup: true })),
    ...filteredIndividualGuests.map(guest => ({ ...guest, isGroup: false }))
  ];

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

      {/* Add Buttons */}
      <div className="add-group-section">
        <button 
          onClick={() => setShowAddIndividualModal(true)}
          className="add-group-btn individual-btn"
        >
          + Add Individual Guest
        </button>
        <button 
          onClick={() => setShowAddGroupModal(true)}
          className="add-group-btn"
        >
          + Add New Group
        </button>
      </div>

      {/* Group and Individual Guest Cards */}
      {displayItems.length === 0 ? (
        <div className="no-results">
          <p>No groups or guests found matching your search criteria.</p>
          <p>Try adjusting your search term or filter selection.</p>
        </div>
      ) : (
        <div className="groups-grid">
          {displayItems.map((item, idx) => (
            <div key={`${item.isGroup ? 'group' : 'guest'}-${item.id || idx}`} className="group-card">
              {item.isGroup ? (
                // GROUP DISPLAY
                <>
                  <div className="group-header">
                    <h3>
                      <UsersIcon className="inline-icon" style={{width: '16px', height: '16px', display: 'inline', marginRight: '8px'}} />
                      {item.is_predetermined ? 'Predetermined' : 'Undetermined'} - {item.group_name}
                    </h3>
                    <div className="group-actions">
                      <button 
                        onClick={() => openEditGroupModal(item)}
                        className="edit-btn"
                      >
                        <PencilIcon style={{width: '16px', height: '16px'}} />
                      </button>
                      <button 
                        onClick={() => handleDeleteGroup(item.id)}
                        className="delete-btn"
                        disabled={deletingGroupId === item.id}
                      >
                        <TrashIcon style={{width: '16px', height: '16px'}} />
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedGroupId(item.id);
                          setShowAddGuestModal(true);
                        }}
                        className="add-guest-btn"
                      >
                        +
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
                        {(guestsByGroup[item.id] || []).length > 0 ? (
                          (guestsByGroup[item.id] || []).map((g) => (
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
                                  onClick={() => handleDeleteGuest(g.id, item.id)}
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
                </>
              ) : (
                // INDIVIDUAL GUEST DISPLAY
                <>
                  <div className="group-header">
                    <h3>
                      <UserIcon style={{width: '16px', height: '16px', display: 'inline', marginRight: '8px'}} />
                      Individual Guest - {item.name}
                    </h3>
                    <div className="group-actions">
                      <button 
                        onClick={() => openEditGuestModal(item)}
                        className="edit-btn"
                      >
                        <PencilIcon style={{width: '16px', height: '16px'}} />
                      </button>
                      <button 
                        onClick={() => handleDeleteGuest(item.id)}
                        className="delete-btn"
                        disabled={deletingGuestId === item.id}
                      >
                        <TrashIcon style={{width: '16px', height: '16px'}} />
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
                          <th>Guest Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>{item.name}</td>
                          <td>{item.email || '-'}</td>
                          <td>
                            <div 
                              className="clickable-status"
                              onClick={() => openQuickStatusModal(item)}
                              title="Click to change status"
                            >
                              {item.rsvp_submitted ? (
                                item.is_coming === true ? (
                                  <span className="status-going">Going</span>
                                ) : item.is_coming === false ? (
                                  <span className="status-not-going">Not Going</span>
                                ) : (
                                  <span className="status-pending">Pending</span>
                                )
                              ) : (
                                <span className="status-pending">Pending</span>
                              )}
                            </div>
                          </td>
                          <td>{item.guest_type === 'bride' ? 'Bride\'s Guest' : 'Groom\'s Guest'}</td>
                        </tr>
                        {/* Show companions for this individual guest */}
                        {individualGuests.filter(g => g.companion_of === item.id).map(companion => (
                          <tr key={companion.id} className="companion-row">
                            <td style={{ paddingLeft: '2em' }}>↳ {companion.name}</td>
                            <td>{companion.email || '-'}</td>
                            <td>
                              <div 
                                className="clickable-status"
                                onClick={() => openQuickStatusModal(companion)}
                                title="Click to change status"
                              >
                                {companion.rsvp_submitted ? (
                                  companion.is_coming === true ? (
                                    <span className="status-going">Going</span>
                                  ) : companion.is_coming === false ? (
                                    <span className="status-not-going">Not Going</span>
                                  ) : (
                                    <span className="status-pending">Pending</span>
                                  )
                                ) : (
                                  <span className="status-pending">Pending</span>
                                )}
                              </div>
                            </td>
                            <td>Companion</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
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
                  value={groupForm.is_predetermined ? 'N/A' : groupForm.group_count_max}
                  onChange={(e) => setGroupForm({...groupForm, group_count_max: e.target.value})}
                  disabled={groupForm.is_predetermined}
                  min="1"
                  placeholder={groupForm.is_predetermined ? 'Not applicable for predetermined groups' : '1'}
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
                <label>Group Type:</label>
                <select
                  value={groupForm.role}
                  onChange={(e) => setGroupForm({...groupForm, role: e.target.value})}
                >
                  <option value="family">Family</option>
                  <option value="friends">Friends</option>
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

      {/* Add Individual Guest Modal */}
      {showAddIndividualModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add Individual Guest</h3>
            <form onSubmit={handleAddIndividualGuest}>
              <div className="form-group">
                <label>Guest Name:</label>
                <input
                  type="text"
                  value={individualForm.name}
                  onChange={(e) => setIndividualForm({...individualForm, name: e.target.value})}
                  placeholder="Full name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email (Optional):</label>
                <input
                  type="email"
                  value={individualForm.email}
                  onChange={(e) => setIndividualForm({...individualForm, email: e.target.value})}
                  placeholder="guest@email.com"
                />
              </div>
              <div className="form-group">
                <label>Can Bring Companions?</label>
                <input
                  type="number"
                  value={individualForm.max_count}
                  onChange={(e) => setIndividualForm({...individualForm, max_count: parseInt(e.target.value) || 0})}
                  min="0"
                  placeholder="Number of companions (0 = no companions)"
                />
              </div>
              <div className="form-group">
                <label>Guest Type:</label>
                <select
                  value={individualForm.guest_type}
                  onChange={(e) => setIndividualForm({...individualForm, guest_type: e.target.value})}
                >
                  <option value="bride">Bride's Guest</option>
                  <option value="groom">Groom's Guest</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Add Individual Guest</button>
                <button type="button" onClick={() => setShowAddIndividualModal(false)} className="btn-secondary">Cancel</button>
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
                <label>Group Type:</label>
                <select
                  value={groupForm.role || 'family'}
                  onChange={(e) => setGroupForm({...groupForm, role: e.target.value})}
                >
                  <option value="family">Family</option>
                  <option value="friends">Friends</option>
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
              {/* Show companion and guest type fields for individual guests */}
              {editingGuest && editingGuest.role === 'individual' && !editingGuest.companion_of && (
                <>
                  <div className="form-group">
                    <label>Can Bring Companions?</label>
                    <input
                      type="number"
                      value={guestForm.max_count || 0}
                      onChange={(e) => setGuestForm({...guestForm, max_count: parseInt(e.target.value) || 0})}
                      min="0"
                      placeholder="Number of companions (0 = no companions)"
                    />
                  </div>
                  <div className="form-group">
                    <label>Guest Type:</label>
                    <select
                      value={guestForm.guest_type || 'bride'}
                      onChange={(e) => setGuestForm({...guestForm, guest_type: e.target.value})}
                    >
                      <option value="bride">Bride's Guest</option>
                      <option value="groom">Groom's Guest</option>
                    </select>
                  </div>
                </>
              )}
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
