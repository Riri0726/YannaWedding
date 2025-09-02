import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = ({ groups, allGuests }) => {
  // Calculate expected guests based on max_count (total capacity)
  const calculateExpectedGuests = () => {
    let total = 0;
    
    // Count capacity from groups
    total += groups.reduce((groupTotal, group) => {
      if (group.group_count_max) {
        // For family/friends groups, use group_count_max
        return groupTotal + group.group_count_max;
      } else {
        // For groups without max, count their actual guests' max_count
        const groupGuests = allGuests.filter(guest => guest.group_id === group.id);
        const maxCount = groupGuests.reduce((sum, guest) => sum + (guest.max_count || 1), 0);
        return groupTotal + maxCount;
      }
    }, 0);
    
    // Add standalone individual guests (not in any group)
    const standaloneGuests = allGuests.filter(guest => 
      guest.role === 'individual' && 
      guest.in_group === false && 
      !guest.group_id
    );
    total += standaloneGuests.reduce((sum, guest) => sum + (guest.max_count || 1), 0);
    
    return total;
  };

  const totalExpectedGuests = calculateExpectedGuests();
  
  // Count actual guests who have responded (more strict checking)
  const respondedGuests = allGuests.filter(g => 
    g.rsvp_submitted === true && 
    g.is_coming !== null && 
    g.email && 
    g.email.trim() !== ''
  ).length;
  
  const pendingGuests = totalExpectedGuests - respondedGuests;
  
  // Count guests by attendance status (only those who actually responded)
  const goingGuests = allGuests.filter(g => 
    g.is_coming === true && 
    g.rsvp_submitted === true && 
    g.email && 
    g.email.trim() !== ''
  ).length;
  
  const notGoingGuests = allGuests.filter(g => 
    g.is_coming === false && 
    g.rsvp_submitted === true
  ).length;
  
  // Calculate expected vs actual by guest type
  const calculateByGuestType = (guestType) => {
    const typeGroups = groups.filter(g => g.guest_type === guestType);
    let expectedCount = typeGroups.reduce((total, group) => {
      if (group.group_count_max) {
        return total + group.group_count_max;
      } else {
        const groupGuests = allGuests.filter(guest => guest.group_id === group.id);
        return total + groupGuests.reduce((sum, guest) => sum + (guest.max_count || 1), 0);
      }
    }, 0);
    
    // Add standalone individual guests of this guest_type
    const standaloneGuests = allGuests.filter(guest => 
      guest.role === 'individual' && 
      guest.in_group === false && 
      !guest.group_id &&
      guest.guest_type === guestType
    );
    expectedCount += standaloneGuests.reduce((sum, guest) => sum + (guest.max_count || 1), 0);
    
    // Count actual guests from groups
    const actualGuests = allGuests.filter(g => {
      const group = groups.find(grp => grp.id === g.group_id);
      return group && group.guest_type === guestType;
    });
    
    // Add standalone individual guests
    const allActualGuests = [...actualGuests, ...standaloneGuests];
    
    const respondedCount = allActualGuests.filter(g => g.rsvp_submitted).length;
    const goingCount = allActualGuests.filter(g => g.is_coming === true).length;
    const notGoingCount = allActualGuests.filter(g => g.is_coming === false).length;
    
    return {
      expected: expectedCount,
      responded: respondedCount,
      pending: expectedCount - respondedCount,
      going: goingCount,
      notGoing: notGoingCount,
      groups: typeGroups.length, // Just count the actual groups (family + friends)
      individuals: standaloneGuests.length, // Only standalone individual guests
      totalInvitations: typeGroups.length + standaloneGuests.length // Groups + individuals
    };
  };

  const brideStats = calculateByGuestType('bride');
  const groomStats = calculateByGuestType('groom');
  
  // Count total groups and individuals properly
  const totalGroups = groups.length;
  const familyGroups = groups.filter(g => g.role === 'family').length;
  const friendsGroups = groups.filter(g => g.role === 'friends').length;
  const individualGroups = groups.filter(g => g.role === 'individual').length;
  
  // Count standalone individual guests (not in groups)
  const standaloneIndividuals = allGuests.filter(guest => 
    guest.role === 'individual' && 
    guest.in_group === false && 
    !guest.group_id
  ).length;
  
  const totalIndividualGuests = individualGroups + standaloneIndividuals;
  const totalInvitations = totalGroups + standaloneIndividuals; // Groups + standalone individuals

  // Create chart data
  const overviewData = [
    { name: 'Expected', count: totalExpectedGuests, fill: '#8884d8' },
    { name: 'Responded', count: respondedGuests, fill: '#82ca9d' },
    { name: 'Going', count: goingGuests, fill: '#00C49F' },
    { name: 'Not Going', count: notGoingGuests, fill: '#FF8042' },
    { name: 'Pending', count: pendingGuests, fill: '#FFBB28' }
  ];

  const guestTypeData = [
    { name: "Bride's Expected", value: brideStats.expected },
    { name: "Groom's Expected", value: groomStats.expected }
  ];

  const COLORS = ["#8884d8", "#82ca9d"];

  return (
    <div className="dashboard-stats">
      <h2>Wedding Dashboard</h2>
      
      {/* Main Overview Cards */}
      <div className="stats-grid">
        <div className="stat-card highlight">
          <h3>Total Expected Guests</h3>
          <p className="stat-number large">{totalExpectedGuests}</p>
          <small>Based on max capacity</small>
        </div>
        <div className="stat-card">
          <h3>Responded</h3>
          <p className="stat-number going">{respondedGuests}</p>
          <small>{totalExpectedGuests > 0 ? Math.round((respondedGuests / totalExpectedGuests) * 100) : 0}% response rate</small>
        </div>
        <div className="stat-card">
          <h3>Pending</h3>
          <p className="stat-number pending">{pendingGuests}</p>
          <small>Awaiting response</small>
        </div>
      </div>

      {/* Attendance Response Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Going</h3>
          <p className="stat-number going">{goingGuests}</p>
          <small>Confirmed attendance</small>
        </div>
        <div className="stat-card">
          <h3>Not Going</h3>
          <p className="stat-number not-going">{notGoingGuests}</p>
          <small>Declined attendance</small>
        </div>
        <div className="stat-card">
          <h3>Still Deciding</h3>
          <p className="stat-number pending">{pendingGuests}</p>
          <small>Haven't responded yet</small>
        </div>
      </div>

      {/* Group Distribution */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Groups</h3>
          <p className="stat-number">{totalGroups}</p>
          <small>All group invitations</small>
        </div>
        <div className="stat-card">
          <h3>Family Groups</h3>
          <p className="stat-number">{familyGroups}</p>
          <small>Family invites</small>
        </div>
        <div className="stat-card">
          <h3>Friends Groups</h3>
          <p className="stat-number">{friendsGroups}</p>
          <small>Friends invites</small>
        </div>
        <div className="stat-card">
          <h3>Individual Guests</h3>
          <p className="stat-number">{totalIndividualGuests}</p>
          <small>Single person invites</small>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Guest Response Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={overviewData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Expected Guests: Bride vs Groom</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie 
                data={guestTypeData} 
                dataKey="value" 
                nameKey="name" 
                outerRadius={80} 
                label={({ name, value }) => `${name}: ${value}`}
              >
                {guestTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="breakdown-section">
        <h3>Detailed Breakdown</h3>
        <div className="breakdown-grid">
          <div className="breakdown-card">
            <h4>Bride's Side</h4>
            <ul>
              <li><strong>Expected Guests:</strong> {brideStats.expected}</li>
              <li><strong>Responded:</strong> {brideStats.responded}</li>
              <li><strong>Going:</strong> {brideStats.going}</li>
              <li><strong>Not Going:</strong> {brideStats.notGoing}</li>
              <li><strong>Pending:</strong> {brideStats.pending}</li>
              <li><strong>Group Invitations:</strong> {brideStats.groups}</li>
              <li><strong>Individual Invitations:</strong> {brideStats.individuals}</li>
              <li><strong>Total Invitations:</strong> {brideStats.totalInvitations}</li>
            </ul>
          </div>
          
          <div className="breakdown-card">
            <h4>Groom's Side</h4>
            <ul>
              <li><strong>Expected Guests:</strong> {groomStats.expected}</li>
              <li><strong>Responded:</strong> {groomStats.responded}</li>
              <li><strong>Going:</strong> {groomStats.going}</li>
              <li><strong>Not Going:</strong> {groomStats.notGoing}</li>
              <li><strong>Pending:</strong> {groomStats.pending}</li>
              <li><strong>Group Invitations:</strong> {groomStats.groups}</li>
              <li><strong>Individual Invitations:</strong> {groomStats.individuals}</li>
              <li><strong>Total Invitations:</strong> {groomStats.totalInvitations}</li>
            </ul>
          </div>
          
          <div className="breakdown-card">
            <h4>Overall Summary</h4>
            <ul>
              <li><strong>Total Expected:</strong> {totalExpectedGuests}</li>
              <li><strong>Total Responded:</strong> {respondedGuests}</li>
              <li><strong>Response Rate:</strong> {totalExpectedGuests > 0 ? Math.round((respondedGuests / totalExpectedGuests) * 100) : 0}%</li>
              <li><strong>Confirmed Going:</strong> {goingGuests}</li>
              <li><strong>Attendance Rate:</strong> {respondedGuests > 0 ? Math.round((goingGuests / respondedGuests) * 100) : 0}%</li>
              <li><strong>Still Pending:</strong> {pendingGuests}</li>
              <li><strong>Total Invitations:</strong> {totalInvitations}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
