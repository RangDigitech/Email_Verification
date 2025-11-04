import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../auth';
import { getToken } from '../auth';

import {
  getAllUsers,
  getAllUsersWithCredits,
  getDeactivatedUsers,
  getUserDetails,
  toggleUserStatus,
  getAdminStats,
} from '../api';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import './AdminDashboard.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [usersWithCredits, setUsersWithCredits] = useState([]);
  const [deactivatedUsers, setDeactivatedUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

const loadDashboardData = async () => {
  setLoading(true);
  setError(null);
  try {
    const token = getToken?.() || localStorage.getItem("token");
    const [usersData, creditsData, deactivatedData, statsData] = await Promise.all([
      getAllUsers(token),
      getAllUsersWithCredits(token),
      getDeactivatedUsers(token),
      getAdminStats(token),
    ]);

    setUsers(usersData);
    setUsersWithCredits(creditsData);
    setDeactivatedUsers(deactivatedData);
    setStats(statsData);
  } catch (err) {
    console.error('Failed to load dashboard data:', err);
    setError('Failed to load dashboard data. Please try again.');
  } finally {
    setLoading(false);
  }
};
const handleViewUser = async (userId) => {
  try {
    const token = getToken?.() || localStorage.getItem("token");
    const userDetails = await getUserDetails(userId, token);
    setSelectedUser(userDetails);
    setActiveTab('user-details');
  } catch (err) {
    console.error('Failed to load user details:', err);
    alert('Failed to load user details');
  }
};

const handleToggleUserStatus = async (userId, currentStatus) => {
  if (!window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this user?`)) return;
  try {
    const token = getToken?.() || localStorage.getItem("token");
    await toggleUserStatus(userId, !currentStatus, token);
    await loadDashboardData();
    if (selectedUser && selectedUser.id === userId) {
      setSelectedUser({ ...selectedUser, is_active: !currentStatus });
    }
  } catch (err) {
    console.error('Failed to update user status:', err);
    alert('Failed to update user status');
  }
};


  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCredits = usersWithCredits.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error-container">
          <p>{error}</p>
          <button onClick={loadDashboardData}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-left">
          <button 
            className="back-to-dashboard-btn" 
            onClick={() => navigate('/dashboard')}
            title="Go back to Dashboard"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h1>Admin Dashboard</h1>
        </div>
        <div className="admin-header-right">
          <button className="refresh-btn" onClick={loadDashboardData}>
            Refresh
          </button>
          <button
            className="logout-btn"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <nav className="admin-nav">
        <button
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          All Users
        </button>
        <button
          className={activeTab === 'credits' ? 'active' : ''}
          onClick={() => setActiveTab('credits')}
        >
          Credits & Usage
        </button>
        <button
          className={activeTab === 'deactivated' ? 'active' : ''}
          onClick={() => setActiveTab('deactivated')}
        >
          Deactivated Users
        </button>
        {selectedUser && (
          <button
            className={activeTab === 'user-details' ? 'active' : ''}
            onClick={() => setActiveTab('user-details')}
          >
            User Details
          </button>
        )}
      </nav>

      <div className="admin-content">
        {activeTab === 'overview' && stats && (
          <div className="overview-tab">
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Users</h3>
                <p className="stat-number">{stats.total_users}</p>
              </div>
              <div className="stat-card">
                <h3>Active Users</h3>
                <p className="stat-number">{stats.active_users}</p>
              </div>
              <div className="stat-card">
                <h3>Deactivated Users</h3>
                <p className="stat-number">{stats.deactivated_users}</p>
              </div>
              <div className="stat-card">
                <h3>Total Credits Used</h3>
                <p className="stat-number">{stats.total_credits_used}</p>
              </div>
            </div>

            <div className="charts-grid">
              <div className="chart-card">
                <h3>Users by Month</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.users_by_month}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card">
                <h3>Month-wise Maximum Users</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.users_by_month}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="users" fill="#8884d8" name="Users" />
                  </BarChart>
                </ResponsiveContainer>
                {stats.max_users_month && (
                  <div style={{ marginTop: '10px', textAlign: 'center', fontSize: '14px', color: '#666' }}>
                    <strong>Maximum: {stats.max_users_month.month} ({stats.max_users_month.users} users)</strong>
                  </div>
                )}
              </div>

              <div className="chart-card">
                <h3>User Status Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Active', value: stats.active_users },
                        { name: 'Deactivated', value: stats.deactivated_users },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[stats.active_users, stats.deactivated_users].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card">
                <h3>Users Per Year</h3>
                {stats?.users_by_year && Array.isArray(stats.users_by_year) && stats.users_by_year.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={stats.users_by_year}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ year, users, percent }) => `${year}: ${users} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="users"
                        nameKey="year"
                      >
                        {stats.users_by_year.map((entry, index) => (
                          <Cell key={`cell-${index}-${entry.year}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name, props) => [`${value} users`, props.payload.year]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '300px',
                    color: '#999',
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                    <p>Loading chart data...</p>
                    {stats && (
                      <p style={{ fontSize: '12px' }}>
                        {stats.users_by_year ? `Found ${stats.users_by_year.length} years` : 'Data not set'}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-tab">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search users by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Created At</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{`${user.first_name} ${user.last_name}`}</td>
                      <td>{user.email}</td>
                      <td>{new Date(user.created_at).toLocaleDateString()}</td>
                      <td>
                        <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                          {user.is_active ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="action-btn view-btn"
                          onClick={() => handleViewUser(user.id)}
                        >
                          View
                        </button>
                        <button
                          className="action-btn toggle-btn"
                          onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                        >
                          {user.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'credits' && (
          <div className="credits-tab">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search users by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Used Credits</th>
                    <th>Total Credits</th>
                    <th>Usage %</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCredits.map((user) => {
                    const usagePercent = user.total_credits > 0
                      ? ((user.used_credits / user.total_credits) * 100).toFixed(1)
                      : '0';
                    return (
                      <tr key={user.user_id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.used_credits}</td>
                        <td>{user.total_credits}</td>
                        <td>
                          <div className="usage-bar-container">
                            <div className="usage-bar">
                              <div
                                className="usage-bar-fill"
                                style={{ width: `${usagePercent}%` }}
                              ></div>
                            </div>
                            <span className="usage-percent">{usagePercent}%</span>
                          </div>
                        </td>
                        <td>
                          <button
                            className="action-btn view-btn"
                            onClick={() => handleViewUser(user.user_id)}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="chart-card full-width">
              <h3>Credits Distribution</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={filteredCredits.map(c => ({
                  name: c.name.split(' ')[0],
                  used: c.used_credits,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                    <Bar dataKey="used" fill="#8884d8" name="Used Credits" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'deactivated' && (
          <div className="deactivated-tab">
            <div className="table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Created At</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deactivatedUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{`${user.first_name} ${user.last_name}`}</td>
                      <td>{user.email}</td>
                      <td>{new Date(user.created_at).toLocaleDateString()}</td>
                      <td>
                        <span className="status-badge inactive">Deactivated</span>
                      </td>
                      <td>
                        <button
                          className="action-btn view-btn"
                          onClick={() => handleViewUser(user.id)}
                        >
                          View
                        </button>
                        <button
                          className="action-btn activate-btn"
                          onClick={() => handleToggleUserStatus(user.id, false)}
                        >
                          Activate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {deactivatedUsers.length === 0 && (
                <div className="empty-state">
                  <p>No deactivated users found.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'user-details' && selectedUser && (
          <div className="user-details-tab">
            <div className="user-details-header">
              <h2>User Details</h2>
              <button className="back-btn" onClick={() => setActiveTab('users')}>
                Back to Users
              </button>
            </div>
            <div className="user-details-content">
              <div className="details-section">
                <h3>Personal Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">ID:</span>
                    <span className="detail-value">{selectedUser.id || selectedUser.user_id}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Name:</span>
                    <span className="detail-value">
                      {selectedUser.first_name} {selectedUser.last_name}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{selectedUser.email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span className={`status-badge ${selectedUser.is_active ? 'active' : 'inactive'}`}>
                      {selectedUser.is_active ? 'Active' : 'Deactivated'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Created At:</span>
                    <span className="detail-value">
                      {selectedUser.created_at
                        ? new Date(selectedUser.created_at).toLocaleString()
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="details-section">
                <h3>Credits Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Used Credits:</span>
                    <span className="detail-value">{selectedUser.used_credits || 0}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Total Credits:</span>
                    <span className="detail-value">{selectedUser.total_credits || 0}</span>
                  </div>
                  {selectedUser.total_credits > 0 && (
                    <div className="detail-item">
                      <span className="detail-label">Usage Percentage:</span>
                      <span className="detail-value">
                        {((selectedUser.used_credits / selectedUser.total_credits) * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Charts for user details */}
                <div className="user-details-charts">
                  <div className="chart-card">
                    <h3>Credits Usage Over Time</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={[
                        { month: 'Jan', credits: selectedUser.used_credits * 0.3 },
                        { month: 'Feb', credits: selectedUser.used_credits * 0.5 },
                        { month: 'Mar', credits: selectedUser.used_credits * 0.7 },
                        { month: 'Apr', credits: selectedUser.used_credits },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="credits" stroke="#8884d8" strokeWidth={2} name="Credits Used" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="chart-card">
                    <h3>Credits Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Used', value: selectedUser.used_credits || 0 },
                            { name: 'Available', value: (selectedUser.total_credits || 0) - (selectedUser.used_credits || 0) },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          <Cell fill="#8884d8" />
                          <Cell fill="#82ca9d" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="chart-card">
                    <h3>Usage Statistics</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={[
                        { 
                          category: 'Used', 
                          value: selectedUser.used_credits || 0,
                          total: selectedUser.total_credits || 0
                        },
                        { 
                          category: 'Available', 
                          value: (selectedUser.total_credits || 0) - (selectedUser.used_credits || 0),
                          total: selectedUser.total_credits || 0
                        },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#8884d8" name="Credits" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="details-actions">
                <button
                  className="action-btn toggle-btn"
                  onClick={() =>
                    handleToggleUserStatus(selectedUser.id || selectedUser.user_id, selectedUser.is_active)
                  }
                >
                  {selectedUser.is_active ? 'Deactivate User' : 'Activate User'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
