import React, { useEffect, useState } from 'react';
import { adminService } from '../services/rsvpService';
import Dashboard from './Dashboard';
import GuestsAdmin from './GuestsAdmin';
import './Admin.css';

const Admin = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activePage, setActivePage] = useState('dashboard');

  const [groupForm, setGroupForm] = useState({ group_name: '', group_count_max: '', is_predetermined: false, guest_type: 'bride' });
  const [guestForm, setGuestForm] = useState({ group_id: '', name: '', email: '', is_coming: true, in_group: true });
  const [guestsByGroup, setGuestsByGroup] = useState({});
  const [allGuests, setAllGuests] = useState([]);
  const [editingGroup, setEditingGroup] = useState(null);
  const [filter, setFilter] = useState('all');
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupType, setNewGroupType] = useState('Predetermined');

  const showMessage = (message, type = 'success') => {
    if (type === 'success') {
      setSuccess(message);
      setError('');
    } else {
      setError(message);
      setSuccess('');
    }
    setTimeout(() => {
      if (type === 'success') {
        setSuccess('');
      } else {
        setError('');
      }
    }, 3000);
  };

  const refresh = async () => {
    try {
      const groupsList = await adminService.listGroups();
      setGroups(groupsList);
      
      // Get guests for each group
      const guestsData = {};
      for (const group of groupsList) {
        const guests = await adminService.listGuestsByGroup(group.id);
        guestsData[group.id] = guests;
      }
      setGuestsByGroup(guestsData);
      
      // Get all guests for stats
      const allGuestsList = await adminService.listAllGuests();
      setAllGuests(allGuestsList);
    } catch (e) {
      showMessage(e.message || 'Failed to refresh data', 'error');
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  // CRUD Functions for Groups
  const createGroup = async (groupData) => {
    try {
      await adminService.createGroup(groupData);
      showMessage('Group created successfully!', 'success');
      await refresh();
    } catch (e) {
      showMessage(e.message || 'Failed to create group', 'error');
      throw e;
    }
  };

  const updateGroup = async (groupId, updates) => {
    try {
      await adminService.updateGroup(groupId, updates);
      showMessage('Group updated successfully!', 'success');
      await refresh();
    } catch (e) {
      showMessage(e.message || 'Failed to update group', 'error');
      throw e;
    }
  };

  const deleteGroup = async (groupId) => {
    try {
      await adminService.deleteGroup(groupId);
      showMessage('Group deleted successfully!', 'success');
      await refresh();
    } catch (e) {
      showMessage(e.message || 'Failed to delete group', 'error');
      throw e;
    }
  };

  // CRUD Functions for Guests
  const createGuest = async (guestData) => {
    try {
      await adminService.createGuest(guestData);
      showMessage('Guest added successfully!', 'success');
      await refresh();
    } catch (e) {
      showMessage(e.message || 'Failed to add guest', 'error');
      throw e;
    }
  };

  const updateGuest = async (guestId, updates) => {
    try {
      await adminService.updateGuest(guestId, updates);
      showMessage('Guest updated successfully!', 'success');
      await refresh();
    } catch (e) {
      showMessage(e.message || 'Failed to update guest', 'error');
      throw e;
    }
  };

  const deleteGuestFromGroup = async (guestId, groupId) => {
    try {
      await adminService.deleteGuest(guestId);
      showMessage('Guest deleted successfully!', 'success');
      await refresh();
    } catch (e) {
      showMessage(e.message || 'Failed to delete guest', 'error');
      throw e;
    }
  };

  const submitGroup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (editingGroup) {
        await adminService.updateGroup(editingGroup.id, groupForm);
        showMessage('Group updated successfully!');
        setEditingGroup(null);
      } else {
        await adminService.createGroup(groupForm);
        showMessage('Group created successfully!');
      }
      setGroupForm({ group_name: '', group_count_max: '', is_predetermined: false, guest_type: 'bride' });
      await refresh();
    } catch (e) {
      showMessage(e.message || 'Failed to save group', 'error');
    } finally {
      setLoading(false);
    }
  };

  const editGroup = (group) => {
    setEditingGroup(group);
    setGroupForm({
      group_name: group.group_name,
      group_count_max: group.group_count_max.toString(),
      is_predetermined: group.is_predetermined,
      guest_type: group.guest_type || 'bride'
    });
  };

  const deleteGroupOld = async (groupId) => {
    if (window.confirm('Are you sure you want to delete this group? This will also delete all guests in the group.')) {
      try {
        await adminService.deleteGroup(groupId);
        showMessage('Group deleted successfully!');
        await refresh();
      } catch (e) {
        showMessage(e.message || 'Failed to delete group', 'error');
      }
    }
  };

  const submitGuest = async (e) => {
    e.preventDefault();
    if (!guestForm.group_id) {
      showMessage('Please select a group', 'error');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await adminService.createGuest(guestForm);
      showMessage('Guest added successfully!');
      setGuestForm({ group_id: '', name: '', email: '', is_coming: true, in_group: true });
      await refresh();
    } catch (e) {
      showMessage(e.message || 'Failed to add guest', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateGuestRSVP = async (guestId, isComing, groupId) => {
    try {
      await adminService.updateGuest(guestId, { is_coming: isComing });
      showMessage('Guest RSVP updated successfully!');
      const list = await adminService.listGuestsByGroup(groupId);
      setGuestsByGroup({ ...guestsByGroup, [groupId]: list });
    } catch (e) {
      showMessage(e.message || 'Failed to update guest RSVP', 'error');
    }
  };

  const editGuest = (guest, groupId) => {
    setGuestForm({
      group_id: groupId,
      name: guest.name,
      email: guest.email || '',
      is_coming: guest.is_coming,
      in_group: guest.in_group
    });
  };

  const deleteGuest = async (guestId) => {
    try {
      await adminService.deleteGuest(guestId);
      showMessage('Guest deleted successfully!');
      await refresh();
    } catch (e) {
      showMessage(e.message || 'Failed to delete guest', 'error');
      throw e; // Re-throw so GuestsAdmin can handle the error
    }
  };

  const addGroup = () => {
    if (!newGroupName.trim()) return;
    setGroups([
      ...groups,
      {
        type: newGroupType,
        name: newGroupName,
        guests: [],
      },
    ]);
    setNewGroupName('');
  };

  return (
    <div className="admin">
      {/* Toast Notifications */}
      {success && (
        <div className="toast toast-success">
          <span>✅ {success}</span>
        </div>
      )}
      {error && (
        <div className="toast toast-error">
          <span>❌ {error}</span>
        </div>
      )}

      {/* Sidebar */}
      <div className="admin-sidebar">
        <h1>Admin Panel</h1>
        <button
          className={`admin-nav-btn ${activePage === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActivePage('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={`admin-nav-btn ${activePage === 'guests' ? 'active' : ''}`}
          onClick={() => setActivePage('guests')}
        >
          Guests
        </button>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        {activePage === 'dashboard' && (
          <Dashboard
            groups={groups}
            allGuests={allGuests}
          />
        )}
        {activePage === 'guests' && (
          <GuestsAdmin
            groups={groups}
            guestsByGroup={guestsByGroup}
            filter={filter}
            setFilter={setFilter}
            newGroupName={newGroupName}
            setNewGroupName={setNewGroupName}
            newGroupType={newGroupType}
            setNewGroupType={setNewGroupType}
            addGroup={addGroup}
            updateGuestRSVP={updateGuestRSVP}
            editGuest={editGuest}
            deleteGuest={deleteGuest}
            // Pass the new CRUD functions
            createGroup={createGroup}
            updateGroup={updateGroup}
            deleteGroup={deleteGroup}
            createGuest={createGuest}
            updateGuest={updateGuest}
            deleteGuestFromGroup={deleteGuestFromGroup}
            // Add the missing refresh prop
            refresh={refresh}
          />
        )}
      </div>
    </div>
  );
};

export default Admin;
