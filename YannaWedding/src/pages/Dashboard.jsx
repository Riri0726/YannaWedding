import React from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = ({ groups, allGuests }) => {
  // Dashboard data
  const dashboardData = [
    { name: "Jan", guests: 30, responded: 20 },
    { name: "Feb", guests: 45, responded: 32 },
    { name: "Mar", guests: 50, responded: 40 },
  ];

  const pieData = [
    { name: "Bride's Guests", value: 60 },
    { name: "Groom's Guests", value: 40 },
  ];

  const COLORS = ["#8884d8", "#82ca9d"];

  const totalGuests = allGuests.length;
  const respondedGuests = allGuests.filter(g => g.is_coming !== null).length;
  const incomingGuests = totalGuests - respondedGuests;
  
  const brideGuests = groups.filter(g => g.guest_type === 'bride').length;
  const groomGuests = groups.filter(g => g.guest_type === 'groom').length;

  const lineData = [
    { name: 'Bride', attending: brideGuests, total: brideGuests },
    { name: 'Groom', attending: groomGuests, total: groomGuests }
  ];

  return (
    <div className="dashboard-stats">
      <h2>Dashboard</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <p>Total Guests: {totalGuests}</p>
        </div>
        <div className="stat-card">
          <p>Responded: {respondedGuests}</p>
        </div>
        <div className="stat-card">
          <p>Incoming Guests: {incomingGuests}</p>
        </div>
      </div>

      {/* Graphs */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Guest Responses Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dashboardData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="guests" stroke="#8884d8" />
              <Line type="monotone" dataKey="responded" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Bride vs Groom Guests</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={80} label>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
