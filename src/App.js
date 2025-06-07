import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import BuyerDashboard from './pages/BuyerDashboard';
import SupplierDashboard from './pages/SupplierDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Toast from './components/Toast';

// Auth context for global state
const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const API_BASE = 'http://localhost:8000/api/v1'; // Updated to match backend

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Persist user in localStorage
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);
  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  const login = async (username, password) => {
    setLoading(true); setError('');
    try {
      const res = await axios.post(`${API_BASE}/auth/login/`, { username, password });
      const { access } = res.data;
      // Try to get user info from /auth/me/ or fallback to first user in /auth/users/
      let userRes;
      try {
        userRes = await axios.get(`${API_BASE}/auth/me/`, { headers: { Authorization: `Bearer ${access}` } });
      } catch {
        const usersRes = await axios.get(`${API_BASE}/auth/users/`, { headers: { Authorization: `Bearer ${access}` } });
        userRes = { data: usersRes.data[0] };
      }
      setUser({ ...userRes.data, token: access });
      setLoading(false);
      return true;
    } catch (e) {
      setError('Invalid credentials'); setLoading(false);
      return false;
    }
  };
  const register = async (form) => {
    setLoading(true); setError('');
    try {
      await axios.post(`${API_BASE}/auth/register/`, form);
      setLoading(false);
      return true;
    } catch (e) {
      setError('Registration failed'); setLoading(false);
      return false;
    }
  };
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

function ProtectedRoute({ allowedRoles, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.user_type)) return <Navigate to="/login" />;
  return children;
}

// Apple-inspired Icons
const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 10V8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8V10M7 10H17C18.1046 10 19 10.8954 19 12V18C19 19.1046 18.1046 20 17 20H7C5.89543 20 5 19.1046 5 18V12C5 10.8954 5.89543 10 7 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9M16 17L21 12M21 12L16 7M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function Login() {
  const { login, loading, error, user } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => { 
    if (user) navigate(`/${user.user_type}`); 
  }, [user, navigate]);
  
  const handleSubmit = async e => {
    e.preventDefault();
    await login(username, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      <div className="relative z-10 w-full max-w-md">
        <form onSubmit={handleSubmit} className="fade-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full mb-4">
              <LockIcon />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-white text-opacity-80">Sign in to your KEZAD account</p>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-center slide-up">
              <div className="flex items-center justify-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                {error}
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <UserIcon />
                </div>
                <input 
                  className="w-full pl-10 pr-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-70 focus:border-white focus:bg-opacity-30" 
                  placeholder="Enter your username" 
                  value={username} 
                  onChange={e => setUsername(e.target.value)} 
                  required 
                />
              </div>
            </div>
            
            <div>
              <label className="block text-white text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <LockIcon />
                </div>
                <input 
                  className="w-full pl-10 pr-12 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-70 focus:border-white focus:bg-opacity-30" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Enter your password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-white opacity-70 hover:opacity-100"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    {showPassword ? (
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    ) : (
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    )}
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <button 
            className="w-full mt-6 bg-white text-gray-900 font-semibold py-3 px-4 rounded-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" 
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                Signing in...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
          
          <div className="mt-6 text-center">
            <p className="text-white text-opacity-80">
              Don't have an account?{' '}
              <a href="/register" className="text-white font-semibold hover:text-opacity-90 transition-opacity">
                Register here
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

function Register() {
  const { register, loading, error, user } = useAuth();
  const [form, setForm] = useState({ username: '', email: '', password: '', user_type: 'buyer' });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => { 
    if (user) navigate(`/${user.user_type}`); 
  }, [user, navigate]);
  
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  
  const handleSubmit = async e => {
    e.preventDefault();
    const ok = await register(form);
    if (ok) navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)'
    }}>
      <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      <div className="relative z-10 w-full max-w-md">
        <form onSubmit={handleSubmit} className="fade-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full mb-4">
              <UserIcon />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
            <p className="text-white text-opacity-80">Join the KEZAD Portal community</p>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-center slide-up">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">Username</label>
              <input 
                className="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-70 focus:border-white focus:bg-opacity-30" 
                placeholder="Choose a username" 
                name="username" 
                value={form.username} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <div>
              <label className="block text-white text-sm font-medium mb-2">Email</label>
              <input 
                className="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-70 focus:border-white focus:bg-opacity-30" 
                placeholder="Enter your email" 
                name="email" 
                type="email"
                value={form.email} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <div>
              <label className="block text-white text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <input 
                  className="w-full px-4 py-3 pr-12 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-70 focus:border-white focus:bg-opacity-30" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Create a password" 
                  name="password" 
                  value={form.password} 
                  onChange={handleChange} 
                  required 
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-white opacity-70 hover:opacity-100"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    {showPassword ? (
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    ) : (
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    )}
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-white text-sm font-medium mb-2">Account Type</label>
              <select 
                className="w-full px-4 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white focus:border-white focus:bg-opacity-30" 
                name="user_type" 
                value={form.user_type} 
                onChange={handleChange}
              >
                <option value="buyer" className="text-gray-900">Buyer</option>
                <option value="supplier" className="text-gray-900">Supplier</option>
              </select>
            </div>
          </div>
          
          <button 
            className="w-full mt-6 bg-white text-gray-900 font-semibold py-3 px-4 rounded-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" 
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                Creating account...
              </div>
            ) : (
              'Create Account'
            )}
          </button>
          
          <div className="mt-6 text-center">
            <p className="text-white text-opacity-80">
              Already have an account?{' '}
              <a href="/login" className="text-white font-semibold hover:text-opacity-90 transition-opacity">
                Sign in here
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

function Header() {
  const { user, logout } = useAuth();
  
  return (
    <header className="kezad-header w-full py-4 px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">K</span>
        </div>
        <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          KEZAD Portal
        </div>
      </div>
      
      {user && (
        <nav className="kezad-nav">
          {user.user_type === 'buyer' && (
            <a href="/buyer" className={window.location.pathname === '/buyer' ? 'active' : ''}>
              Dashboard
            </a>
          )}
          {user.user_type === 'supplier' && (
            <a href="/supplier" className={window.location.pathname === '/supplier' ? 'active' : ''}>
              Dashboard
            </a>
          )}
          {user.user_type === 'admin' && (
            <a href="/admin" className={window.location.pathname === '/admin' ? 'active' : ''}>
              Admin
            </a>
          )}
          
          <div className="flex items-center gap-3 ml-6">
            <div className="text-sm">
              <div className="font-semibold">{user.username}</div>
              <div className="text-gray-500 text-xs capitalize">{user.user_type}</div>
            </div>
            <button 
              onClick={logout} 
              className="btn-secondary !py-2 !px-3 !text-sm"
              title="Logout"
            >
              <LogoutIcon />
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}

export const ToastContext = React.createContext();

function EnterpriseLayout({ children }) {
  const [toasts, setToasts] = React.useState([]);
  const addToast = (toast) => {
    setToasts((prev) => [...prev, { ...toast, id: Date.now() + Math.random() }]);
  };
  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };
  return (
    <ToastContext.Provider value={{ addToast }}>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
        <Toast toasts={toasts} removeToast={removeToast} />
      </div>
    </ToastContext.Provider>
  );
}

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage or system preference
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('darkMode');
      if (stored !== null) return stored === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  return (
    <AuthProvider>
      <Router>
        <EnterpriseLayout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/buyer" element={<ProtectedRoute allowedRoles={["buyer"]}><BuyerDashboard /></ProtectedRoute>} />
            <Route path="/supplier" element={<ProtectedRoute allowedRoles={["supplier"]}><SupplierDashboard /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-gray-300">404</h1>
                  <p className="text-gray-600 mt-4">Page not found</p>
                  <a href="/" className="btn-primary mt-6 inline-block">Go Home</a>
                </div>
              </div>
            } />
          </Routes>
        </EnterpriseLayout>
      </Router>
    </AuthProvider>
  );
}

export default App;