import React, { useEffect, useState, useCallback } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase.js';
import { adminService, guestService } from '../services/rsvpService';
import Dashboard from './Dashboard';
import GuestsAdmin from './GuestsAdmin';
import AttendingGuests from './AttendingGuests';
import './Admin.css';

const Admin = () => {
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activePage, setActivePage] = useState('dashboard');

  const [guestsByGroup, setGuestsByGroup] = useState({});
  const [allGuests, setAllGuests] = useState([]);
  const [individualGuests, setIndividualGuests] = useState([]);
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

  const refresh = useCallback(async () => {
    try {
      // Get groups first
      const groupsList = await adminService.listGroups();
      setGroups(groupsList);
      
      // Get ALL guests (both individual and in groups) using the new guestService
      const allGuestsList = await guestService.getAllGuests();
      setAllGuests(allGuestsList);
      
      // Separate individual guests (those without group_id or role === 'individual')
      const individualGuestsList = allGuestsList.filter(guest => !guest.group_id || guest.role === 'individual');
      setIndividualGuests(individualGuestsList);
      
      // Organize guests by group for the existing UI structure
      const guestsData = {};
      for (const group of groupsList) {
        guestsData[group.id] = allGuestsList.filter(guest => guest.group_id === group.id);
      }
      setGuestsByGroup(guestsData);
      
    } catch (e) {
      showMessage(e.message || 'Failed to refresh data', 'error');
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

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

  const deleteGuestFromGroup = async (guestId) => {
    try {
      await adminService.deleteGuest(guestId);
      showMessage('Guest deleted successfully!', 'success');
      await refresh();
    } catch (e) {
      showMessage(e.message || 'Failed to delete guest', 'error');
      throw e;
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

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
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
          📊 Dashboard
        </button>
        <button
          className={`admin-nav-btn ${activePage === 'guests' ? 'active' : ''}`}
          onClick={() => setActivePage('guests')}
        >
          👥 Guests
        </button>
        <button
          className={`admin-nav-btn ${activePage === 'attending' ? 'active' : ''}`}
          onClick={() => setActivePage('attending')}
        >
          ✅ Attending Guests
        </button>
        <div className="admin-sidebar-footer">
          <button
            className="admin-logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
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
            individualGuests={individualGuests}
            filter={filter}
            setFilter={setFilter}
            newGroupName={newGroupName}
            setNewGroupName={setNewGroupName}
            newGroupType={newGroupType}
            setNewGroupType={setNewGroupType}
            addGroup={addGroup}
            updateGuestRSVP={updateGuestRSVP}
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
        {activePage === 'attending' && (
          <AttendingGuests />
        )}
      </div>
    </div>
  );
};

export default Admin;
