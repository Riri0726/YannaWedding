import React from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = ({ groups, allGuests }) => {
  // Calculate real statistics based on actual data
  const totalGuests = allGuests.length;
  
  // Count guests by response status
  const respondedGuests = allGuests.filter(g => g.rsvp_submitted).length;
  const pendingGuests = totalGuests - respondedGuests;
  
  // Count guests by attendance status
  const goingGuests = allGuests.filter(g => g.is_coming === true).length;
  const notGoingGuests = allGuests.filter(g => g.is_coming === false).length;
  
  // Count groups by guest type
  const brideGroups = groups.filter(g => g.guest_type === 'bride').length;
  const groomGroups = groups.filter(g => g.guest_type === 'groom').length;
  
  // Count guests by guest type (bride/groom)
  const brideGuests = allGuests.filter(g => {
    const group = groups.find(grp => grp.id === g.group_id);
    return group && group.guest_type === 'bride';
  }).length;
  
  const groomGuests = allGuests.filter(g => {
    const group = groups.find(grp => grp.id === g.group_id);
    return group && group.guest_type === 'groom';
  }).length;

  // Create dynamic line chart data based on actual responses
  const lineData = [
    { name: 'Total Guests', total: totalGuests, responded: respondedGuests, pending: pendingGuests },
    { name: 'Going', total: goingGuests, responded: goingGuests, pending: 0 },
    { name: 'Not Going', total: notGoingGuests, responded: notGoingGuests, pending: 0 },
    { name: 'Pending', total: pendingGuests, responded: 0, pending: pendingGuests }
  ];

  // Create pie chart data for guest types
  const pieData = [
    { name: "Bride's Guests", value: brideGuests },
    { name: "Groom's Guests", value: groomGuests },
  ];

  const COLORS = ["#8884d8", "#82ca9d"];

  return (
    <div className="dashboard-stats">
      <h2>Dashboard</h2>
      
      {/* Main Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Guests</h3>
          <p className="stat-number">{totalGuests}</p>
        </div>
        <div className="stat-card">
          <h3>Responded</h3>
          <p className="stat-number">{respondedGuests}</p>
        </div>
        <div className="stat-card">
          <h3>Pending</h3>
          <p className="stat-number">{pendingGuests}</p>
        </div>
      </div>

      {/* Attendance Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Going</h3>
          <p className="stat-number going">{goingGuests}</p>
        </div>
        <div className="stat-card">
          <h3>Not Going</h3>
          <p className="stat-number not-going">{notGoingGuests}</p>
        </div>
        <div className="stat-card">
          <h3>Response Rate</h3>
          <p className="stat-number">
            {totalGuests > 0 ? Math.round((respondedGuests / totalGuests) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Group Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Bride Groups</h3>
          <p className="stat-number">{brideGroups}</p>
        </div>
        <div className="stat-card">
          <h3>Groom Groups</h3>
          <p className="stat-number">{groomGroups}</p>
        </div>
        <div className="stat-card">
          <h3>Total Groups</h3>
          <p className="stat-number">{groups.length}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Guest Response Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="responded" stroke="#82ca9d" name="Responded" />
              <Line type="monotone" dataKey="pending" stroke="#ffc658" name="Pending" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Bride vs Groom Guests</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie 
                data={pieData} 
                dataKey="value" 
                nameKey="name" 
                outerRadius={80} 
                label={({ name, value }) => `${name}: ${value}`}
              >
                {pieData.map((entry, index) => (
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
            <h4>Response Status</h4>
            <ul>
              <li>Total Guests: {totalGuests}</li>
              <li>Responded: {respondedGuests}</li>
              <li>Pending: {pendingGuests}</li>
            </ul>
          </div>
          
          <div className="breakdown-card">
            <h4>Attendance</h4>
            <ul>
              <li>Going: {goingGuests}</li>
              <li>Not Going: {notGoingGuests}</li>
              <li>Response Rate: {totalGuests > 0 ? Math.round((respondedGuests / totalGuests) * 100) : 0}%</li>
            </ul>
          </div>
          
          <div className="breakdown-card">
            <h4>Guest Distribution</h4>
            <ul>
              <li>Bride's Guests: {brideGuests}</li>
              <li>Groom's Guests: {groomGuests}</li>
              <li>Total Groups: {groups.length}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
