import React, { useEffect, useState } from 'react';
import { adminService } from '../services/rsvpService';
import './Admin.css';

const Admin = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [groupForm, setGroupForm] = useState({ group_name: '', group_count_max: '', is_predetermined: false });
  const [guestForm, setGuestForm] = useState({ group_id: '', name: '', email: '', is_coming: true, in_group: true });
  const [guestsByGroup, setGuestsByGroup] = useState({});

  const refresh = async () => {
    setLoading(true);
    try {
      const list = await adminService.listGroups();
      setGroups(list);
    } catch (e) {
      setError(e.message || 'Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const submitGroup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await adminService.createGroup(groupForm);
      setGroupForm({ group_name: '', group_count_max: '', is_predetermined: false });
      await refresh();
    } catch (e) {
      setError(e.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  const submitGuest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Frontend guard: check remaining slots for target group
      const targetGroupId = guestForm.group_id;
      const target = groups.find(x => x.id === targetGroupId);
      const currentCount = (guestsByGroup[targetGroupId] || []).length;
      const remaining = (target?.group_count_max || 0) - currentCount;
      if (remaining <= 0) {
        setLoading(false);
        return;
      }
      // If group is unknown, keep guard; predetermined can exceed
      const targetGroup = groups.find(x => x.id === guestForm.group_id);
      if (!targetGroup?.is_predetermined) {
        const list = await adminService.listGuestsByGroup(guestForm.group_id);
        const remaining = (targetGroup?.group_count_max || 0) - list.length;
        if (remaining <= 0) {
          setLoading(false);
          return;
        }
      }
      await adminService.createGuest(guestForm);
      setGuestForm({ group_id: guestForm.group_id, name: '', email: '', is_coming: true, in_group: true });
      if (guestForm.group_id) {
        const list = await adminService.listGuestsByGroup(guestForm.group_id);
        setGuestsByGroup({ ...guestsByGroup, [guestForm.group_id]: list });
      }
    } catch (e) {
      setError(e.message || 'Failed to add guest');
    } finally {
      setLoading(false);
    }
  };

  const loadGuests = async (groupId) => {
    const list = await adminService.listGuestsByGroup(groupId);
    setGuestsByGroup({ ...guestsByGroup, [groupId]: list });
  };

  return (
    <div className="admin">
      <header>
        <h1>Admin Dashboard</h1>
      </header>
      <main>
        <section className="admin-content">
          <h2>Groups</h2>
          <form onSubmit={submitGroup} className="admin-controls">
            <input
              placeholder="Group name"
              value={groupForm.group_name}
              onChange={(e) => setGroupForm({ ...groupForm, group_name: e.target.value })}
            />
            <input
              type="number"
              placeholder="Max count"
              value={groupForm.group_count_max}
              onChange={(e) => setGroupForm({ ...groupForm, group_count_max: e.target.value })}
            />
            <label>
              <input
                type="checkbox"
                checked={groupForm.is_predetermined}
                onChange={(e) => setGroupForm({ ...groupForm, is_predetermined: e.target.checked })}
              />
              Predetermined
            </label>
            <button type="submit" disabled={loading}>Add Group</button>
          </form>

          {error && <p style={{ color: 'red' }}>{error}</p>}
          {loading && <p>Loading...</p>}

          <div className="group-list">
            {groups.map(g => (
              <div key={g.id} className="group-item">
                <h3>{g.group_name} ({g.group_count_max})</h3>
                <button onClick={() => { setGuestForm({ ...guestForm, group_id: g.id }); loadGuests(g.id); }}>Manage Guests</button>
                <div className="guest-section">
                  {(() => {
                    // Apply capacity limits only for UNKNOWN groups
                    if (!g.is_predetermined) {
                      const currentCount = (guestsByGroup[g.id] || []).length;
                      const remaining = Math.max(0, (g.group_count_max || 0) - currentCount);
                      const isFull = remaining <= 0;
                      return (
                        <>
                          <form onSubmit={submitGuest}>
                            <input
                              placeholder={`Guest name${isFull ? ' (limit reached)' : ''}`}
                              value={guestForm.group_id === g.id ? guestForm.name : ''}
                              onChange={(e) => setGuestForm({ ...guestForm, group_id: g.id, name: e.target.value })}
                              disabled={isFull}
                            />
                            <input
                              placeholder="Guest email"
                              value={guestForm.group_id === g.id ? guestForm.email : ''}
                              onChange={(e) => setGuestForm({ ...guestForm, group_id: g.id, email: e.target.value })}
                              disabled={isFull}
                            />
                            <button type="submit" disabled={loading || isFull}>Add Guest</button>
                          </form>
                          <div style={{ fontSize: 12, color: '#667085' }}>Remaining slots: {remaining}</div>
                        </>
                      );
                    }
                    // Predetermined groups: no cap
                    return (
                      <form onSubmit={submitGuest}>
                        <input
                          placeholder="Guest name"
                          value={guestForm.group_id === g.id ? guestForm.name : ''}
                          onChange={(e) => setGuestForm({ ...guestForm, group_id: g.id, name: e.target.value })}
                        />
                        <input
                          placeholder="Guest email"
                          value={guestForm.group_id === g.id ? guestForm.email : ''}
                          onChange={(e) => setGuestForm({ ...guestForm, group_id: g.id, email: e.target.value })}
                        />
                        <button type="submit" disabled={loading}>Add Guest</button>
                      </form>
                    );
                  })()}
                  <div className="guest-card-grid">
                    {(guestsByGroup[g.id] || []).map(guest => (
                      <div key={guest.id} className="guest-card-mini">
                        <div className="guest-name">{guest.name}</div>
                        {guest.email ? <div className="guest-email">{guest.email}</div> : null}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Admin;
