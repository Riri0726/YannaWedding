import React, { useState } from 'react';
import { guestService } from '../services/rsvpService';
import './GuestForm.css';

const GuestForm = ({ onSuccess, onCancel }) => {
  const [formType, setFormType] = useState(''); // 'individual' or 'group'
  const [loading, setLoading] = useState(false);
  
  // Individual guest form state
  const [individualData, setIndividualData] = useState({
    name: '',
    email: '',
    max_count: 1
  });

  // Group form state
  const [groupData, setGroupData] = useState({
    group_name: '',
    group_count_max: 1,
    role: 'family' // 'family' or 'friends'
  });
  
  const [groupMembers, setGroupMembers] = useState(['']);

  const handleIndividualSubmit = async (e) => {
    e.preventDefault();
    if (!individualData.name.trim()) {
      alert('Please enter guest name');
      return;
    }

    setLoading(true);
    try {
      await guestService.createIndividualGuest(individualData);
      alert('Individual guest created successfully!');
      onSuccess?.();
      resetForm();
    } catch (error) {
      console.error('Error creating individual guest:', error);
      alert('Error creating guest. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGroupSubmit = async (e) => {
    e.preventDefault();
    if (!groupData.group_name.trim()) {
      alert('Please enter group name');
      return;
    }

    const memberNames = groupMembers.filter(name => name.trim());
    if (memberNames.length === 0) {
      alert('Please add at least one group member');
      return;
    }

    setLoading(true);
    try {
      await guestService.createGroupWithGuests(groupData, memberNames);
      alert('Group created successfully!');
      onSuccess?.();
      resetForm();
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Error creating group. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addMemberField = () => {
    setGroupMembers([...groupMembers, '']);
  };

  const removeMemberField = (index) => {
    if (groupMembers.length > 1) {
      setGroupMembers(groupMembers.filter((_, i) => i !== index));
    }
  };

  const updateMember = (index, value) => {
    const updated = [...groupMembers];
    updated[index] = value;
    setGroupMembers(updated);
  };

  const resetForm = () => {
    setFormType('');
    setIndividualData({ name: '', email: '', max_count: 1 });
    setGroupData({ group_name: '', group_count_max: 1, role: 'family' });
    setGroupMembers(['']);
  };

  if (!formType) {
    return (
      <div className="guest-form-container">
        <div className="guest-form">
          <h2>Add Guest or Group</h2>
          <p>Choose how you want to add guests:</p>
          
          <div className="form-type-buttons">
            <button 
              className="form-type-btn individual"
              onClick={() => setFormType('individual')}
            >
              <span className="icon">👤</span>
              <span className="title">Individual Guest</span>
              <span className="description">Add a single guest who might bring companions</span>
            </button>
            
            <button 
              className="form-type-btn group"
              onClick={() => setFormType('group')}
            >
              <span className="icon">👥</span>
              <span className="title">Group</span>
              <span className="description">Add a family or group of friends</span>
            </button>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn-cancel">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (formType === 'individual') {
    return (
      <div className="guest-form-container">
        <div className="guest-form">
          <h2>Add Individual Guest</h2>
          
          <form onSubmit={handleIndividualSubmit}>
            <div className="form-group">
              <label htmlFor="name">Guest Name *</label>
              <input
                type="text"
                id="name"
                value={individualData.name}
                onChange={(e) => setIndividualData({...individualData, name: e.target.value})}
                placeholder="Enter guest's full name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={individualData.email}
                onChange={(e) => setIndividualData({...individualData, email: e.target.value})}
                placeholder="guest@email.com (optional)"
              />
            </div>

            <div className="form-group">
              <label htmlFor="max_count">Maximum Companions</label>
              <input
                type="number"
                id="max_count"
                min="1"
                max="10"
                value={individualData.max_count}
                onChange={(e) => setIndividualData({...individualData, max_count: parseInt(e.target.value) || 1})}
              />
              <small>Number of people this guest can bring (including themselves)</small>
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => setFormType('')} className="btn-back">
                ← Back
              </button>
              <button type="button" onClick={onCancel} className="btn-cancel">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn-submit">
                {loading ? 'Creating...' : 'Create Individual Guest'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (formType === 'group') {
    return (
      <div className="guest-form-container">
        <div className="guest-form">
          <h2>Add Group</h2>
          
          <form onSubmit={handleGroupSubmit}>
            <div className="form-group">
              <label htmlFor="group_name">Group Name *</label>
              <input
                type="text"
                id="group_name"
                value={groupData.group_name}
                onChange={(e) => setGroupData({...groupData, group_name: e.target.value})}
                placeholder="e.g., Smith Family, College Friends"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">Group Type *</label>
              <select
                id="role"
                value={groupData.role}
                onChange={(e) => setGroupData({...groupData, role: e.target.value})}
                required
              >
                <option value="family">👨‍👩‍👧‍👦 Family</option>
                <option value="friends">👥 Friends</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="group_count_max">Maximum Group Size</label>
              <input
                type="number"
                id="group_count_max"
                min="1"
                max="20"
                value={groupData.group_count_max}
                onChange={(e) => setGroupData({...groupData, group_count_max: parseInt(e.target.value) || 1})}
              />
            </div>

            <div className="form-group">
              <label>Group Members *</label>
              {groupMembers.map((member, index) => (
                <div key={index} className="member-input-row">
                  <input
                    type="text"
                    value={member}
                    onChange={(e) => updateMember(index, e.target.value)}
                    placeholder={`Member ${index + 1} name`}
                  />
                  {groupMembers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMemberField(index)}
                      className="btn-remove-member"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addMemberField}
                className="btn-add-member"
              >
                + Add Member
              </button>
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => setFormType('')} className="btn-back">
                ← Back
              </button>
              <button type="button" onClick={onCancel} className="btn-cancel">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn-submit">
                {loading ? 'Creating...' : 'Create Group'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
};

export default GuestForm;
