import React, { useState, useEffect } from 'react';
import { guestService } from '../services/rsvpService';
import './AttendingGuests.css';

const AttendingGuests = () => {
  const [attendingGuests, setAttendingGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all'); // all, bride, groom
  const [sortBy, setSortBy] = useState('name'); // name, group, guest_type

  useEffect(() => {
    loadAttendingGuests();
  }, []);

  const loadAttendingGuests = async () => {
    try {
      setLoading(true);
      const allGuests = await guestService.getAllGuests();
      
      // Filter guests who are going (is_coming === true)
      const going = allGuests.filter(guest => 
        guest.is_coming === true && 
        guest.rsvp_submitted === true
      );
      
      setAttendingGuests(going);
    } catch (err) {
      console.error('Error loading attending guests:', err);
      setError('Failed to load attending guests');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort guests
  const getFilteredAndSortedGuests = () => {
    let filtered = attendingGuests;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(guest =>
        guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (guest.email && guest.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (guest.group_info && guest.group_info.group_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply guest type filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(guest => guest.guest_type === filterBy);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'group': {
          const aGroup = a.group_info ? a.group_info.group_name : 'Individual';
          const bGroup = b.group_info ? b.group_info.group_name : 'Individual';
          return aGroup.localeCompare(bGroup);
        }
        case 'guest_type':
          return a.guest_type.localeCompare(b.guest_type);
        default:
          return 0;
      }
    });

    return filtered;
  };

  // Export to CSV
  const exportToCSV = () => {
    const guests = getFilteredAndSortedGuests();
    
    // CSV headers
    const headers = [
      'Name',
      'Email',
      'Guest Type',
      'Group/Family',
      'Role',
      'RSVP Date',
      'Max Count'
    ];

    // Convert guests to CSV rows
    const csvData = guests.map(guest => [
      guest.name || '',
      guest.email || '',
      guest.guest_type || '',
      guest.group_info ? guest.group_info.group_name : 'Individual',
      guest.role || '',
      guest.rsvp_date ? new Date(guest.rsvp_date).toLocaleDateString() : '',
      guest.max_count || 1
    ]);

    // Combine headers and data
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `attending-guests-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const filteredGuests = getFilteredAndSortedGuests();

  if (loading) {
    return (
      <div className="attending-guests">
        <div className="loading">Loading attending guests...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="attending-guests">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="attending-guests">
      <div className="page-header">
        <h1>Attending Guests</h1>
        <p>Total confirmed attendance: {attendingGuests.length} guests</p>
      </div>

      {/* Controls */}
      <div className="controls">
        <div className="search-filters">
          <input
            type="text"
            placeholder="Search guests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Guests</option>
            <option value="bride">Bride's Side</option>
            <option value="groom">Groom's Side</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="name">Sort by Name</option>
            <option value="group">Sort by Group</option>
            <option value="guest_type">Sort by Side</option>
          </select>
        </div>

        <button onClick={exportToCSV} className="export-btn">
          📄 Export to CSV
        </button>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-item">
          <span className="stat-number">{filteredGuests.length}</span>
          <span className="stat-label">Showing</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {filteredGuests.filter(g => g.guest_type === 'bride').length}
          </span>
          <span className="stat-label">Bride's Side</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {filteredGuests.filter(g => g.guest_type === 'groom').length}
          </span>
          <span className="stat-label">Groom's Side</span>
        </div>
      </div>

      {/* Guest List */}
      <div className="guests-table">
        {filteredGuests.length === 0 ? (
          <div className="no-guests">
            {searchTerm || filterBy !== 'all' 
              ? 'No guests match your search criteria.' 
              : 'No attending guests found.'}
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Side</th>
                <th>Group/Family</th>
                <th>Role</th>
                <th>RSVP Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredGuests.map((guest) => (
                <tr key={guest.id}>
                  <td className="guest-name">{guest.name}</td>
                  <td className="guest-email">{guest.email || 'No email'}</td>
                  <td className={`guest-side ${guest.guest_type}`}>
                    {guest.guest_type === 'bride' ? "Bride's" : "Groom's"}
                  </td>
                  <td className="guest-group">
                    {guest.group_info ? guest.group_info.group_name : 'Individual'}
                  </td>
                  <td className="guest-role">{guest.role || 'Guest'}</td>
                  <td className="guest-rsvp-date">
                    {guest.rsvp_date 
                      ? new Date(guest.rsvp_date).toLocaleDateString()
                      : 'Unknown'
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AttendingGuests;
