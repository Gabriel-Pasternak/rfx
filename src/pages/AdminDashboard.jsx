import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../App';
import Button from '../components/Button';
import Card from '../components/Card';
import DataTable from '../components/DataTable';
import Skeleton from '../components/Skeleton';
import { ToastContext } from '../App';

const API_BASE = 'http://localhost:8000/api/v1';

// Apple-inspired Icons
const WorkflowIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <line x1="9" y1="9" x2="15" y2="15"/>
    <line x1="15" y1="9" x2="9" y2="15"/>
  </svg>
);

const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const AnalyticsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
  </svg>
);

const TicketsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14,2 14,8 20,8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10,9 9,9 8,9"/>
  </svg>
);

const SettingsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9,18 15,12 9,6"/>
  </svg>
);

export default function AdminDashboard() {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState([]);
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [tickets, setTickets] = useState([]);
  const [show, setShow] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalWorkflows: 0,
    openTickets: 0,
    totalRequests: 0
  });
  const { addToast } = React.useContext(ToastContext);

  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [workflowsRes, usersRes, analyticsRes, ticketsRes] = await Promise.all([
          axios.get(`${API_BASE}/notifications/workflow-rules/`, { 
            headers: { Authorization: `Bearer ${user.token}` } 
          }).catch(() => ({ data: [] })),
          axios.get(`${API_BASE}/auth/users/`, { 
            headers: { Authorization: `Bearer ${user.token}` } 
          }).catch(() => ({ data: [] })),
          axios.get(`${API_BASE}/analytics/dashboard/`, { 
            headers: { Authorization: `Bearer ${user.token}` } 
          }).catch(() => ({ data: {} })),
          axios.get(`${API_BASE}/notifications/support-tickets/`, { 
            headers: { Authorization: `Bearer ${user.token}` } 
          }).catch(() => ({ data: [] }))
        ]);
        
        setWorkflows(workflowsRes.data);
        setUsers(usersRes.data);
        setAnalytics(analyticsRes.data);
        setTickets(ticketsRes.data);
        
        // Calculate stats
        setStats({
          totalUsers: usersRes.data.length,
          totalWorkflows: workflowsRes.data.length,
          openTickets: ticketsRes.data.filter(t => t.status === 'open').length,
          totalRequests: analyticsRes.data.total_requests || 0
        });
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const getUserTypeBadge = (userType) => {
    const typeClasses = {
      admin: 'bg-purple-100 text-purple-700',
      buyer: 'bg-blue-100 text-blue-700',
      supplier: 'bg-green-100 text-green-700'
    };
    
    return (
      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${typeClasses[userType] || 'bg-gray-100 text-gray-700'}`}>
        {userType}
      </span>
    );
  };

  const getTicketStatusBadge = (status) => {
    const statusClasses = {
      open: 'bg-red-100 text-red-700',
      in_progress: 'bg-yellow-100 text-yellow-700',
      resolved: 'bg-green-100 text-green-700',
      closed: 'bg-gray-100 text-gray-700'
    };
    
    return (
      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${statusClasses[status] || 'bg-gray-100 text-gray-700'}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const quickActions = [
    { label: 'Manage Users', icon: <UsersIcon />, action: () => setShow('users') },
    { label: 'View Analytics', icon: <AnalyticsIcon />, action: () => setShow('analytics') },
    { label: 'Support Tickets', icon: <TicketsIcon />, action: () => setShow('tickets') },
    { label: 'Workflow Rules', icon: <WorkflowIcon />, action: () => setShow('workflows') }
  ];

  const tabButtons = [
    { key: 'overview', label: 'Overview', icon: <AnalyticsIcon /> },
    { key: 'workflows', label: 'Workflows', icon: <WorkflowIcon /> },
    { key: 'users', label: 'Users', icon: <UsersIcon /> },
    { key: 'analytics', label: 'Analytics', icon: <AnalyticsIcon /> },
    { key: 'tickets', label: 'Support', icon: <TicketsIcon /> }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">Manage your KEZAD Portal platform</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 p-1 bg-white rounded-xl shadow-sm overflow-x-auto">
          {tabButtons.map(tab => (
            <button
              key={tab.key}
              onClick={() => setShow(tab.key)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                show === tab.key
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Section */}
        {show === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <UsersIcon />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{stats.totalUsers}</h3>
                <p className="text-gray-600">Total Users</p>
              </Card>
              
              <Card className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <WorkflowIcon />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{stats.totalWorkflows}</h3>
                <p className="text-gray-600">Workflow Rules</p>
              </Card>
              
              <Card className="text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <TicketsIcon />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{stats.openTickets}</h3>
                <p className="text-gray-600">Open Tickets</p>
              </Card>
              
              <Card className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <AnalyticsIcon />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{stats.totalRequests}</h3>
                <p className="text-gray-600">Total Requests</p>
              </Card>
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <Card 
                    key={index}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                    onClick={action.action}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          {action.icon}
                        </div>
                        <span className="font-medium text-gray-900">{action.label}</span>
                      </div>
                      <ChevronRightIcon />
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <Card>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-b-0">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">System startup completed</span>
                    <span className="text-xs text-gray-400 ml-auto">Just now</span>
                  </div>
                  <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-b-0">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Dashboard initialized</span>
                    <span className="text-xs text-gray-400 ml-auto">2 minutes ago</span>
                  </div>
                  <div className="flex items-center gap-3 py-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Admin session started</span>
                    <span className="text-xs text-gray-400 ml-auto">5 minutes ago</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Workflows Section */}
        {show === 'workflows' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <WorkflowIcon />
                Workflow Rules
              </h2>
              <Button className="btn-primary">
                <SettingsIcon />
                Add Rule
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {workflows.map(w => (
                <Card key={w.id} className="hover:shadow-lg transition-all duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-1">{w.name}</h3>
                      <p className="text-sm text-gray-600">{w.rule_type}</p>
                    </div>
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <SettingsIcon />
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    Status: <span className="text-green-600 font-medium">Active</span>
                  </div>
                </Card>
              ))}
            </div>
            
            {workflows.length === 0 && (
              <div className="text-center py-12">
                <WorkflowIcon className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No workflow rules</h3>
                <p className="text-gray-600">Create your first workflow rule to automate processes.</p>
                <Button className="btn-primary mt-4">
                  <SettingsIcon />
                  Create Rule
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Users Section */}
        {show === 'users' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <UsersIcon />
                User Management
              </h2>
              <Button className="btn-primary">
                Add User
              </Button>
            </div>
            
            <Card>
              <DataTable
                columns={[
                  { accessor: 'username', Header: 'User', Cell: row => (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">{row.username.charAt(0).toUpperCase()}</span>
                      </div>
                      <span className="font-medium text-gray-900">{row.username}</span>
                    </div>
                  ) },
                  { accessor: 'email', Header: 'Email' },
                  { accessor: 'user_type', Header: 'Type', Cell: row => getUserTypeBadge(row.user_type) },
                  { accessor: 'status', Header: 'Status', Cell: () => (
                    <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Active</span>
                  ) },
                  { accessor: 'actions', Header: 'Actions', Cell: row => (
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                  ) },
                ]}
                data={users}
                loading={isLoading}
                onRowClick={row => console.log('User row clicked:', row)}
                searchable
              />
            </Card>
            
            {users.length === 0 && (
              <div className="text-center py-12">
                <UsersIcon className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-600">Users will appear here once they register.</p>
              </div>
            )}
          </div>
        )}

        {/* Analytics Section */}
        {show === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <AnalyticsIcon />
              Platform Analytics
            </h2>
            
            <Card>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">System Metrics</h3>
                <p className="text-gray-600">Detailed analytics and performance metrics</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-auto">
                  {JSON.stringify(analytics, null, 2)}
                </pre>
              </div>
            </Card>
          </div>
        )}

        {/* Support Tickets Section */}
        {show === 'tickets' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <TicketsIcon />
                Support Tickets
              </h2>
              <Button className="btn-primary">
                New Ticket
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {tickets.map(t => (
                <Card key={t.id} className="hover:shadow-lg transition-all duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-1">{t.subject}</h3>
                      <p className="text-sm text-gray-600">{t.description}</p>
                    </div>
                    {getTicketStatusBadge(t.status)}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Ticket #{t.id}</span>
                    <span>{new Date(t.created_at).toLocaleDateString()}</span>
                  </div>
                </Card>
              ))}
            </div>
            
            {tickets.length === 0 && (
              <div className="text-center py-12">
                <TicketsIcon className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No support tickets</h3>
                <p className="text-gray-600">Support requests will appear here.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}