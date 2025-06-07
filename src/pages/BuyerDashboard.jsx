import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../App';
import Button from '../components/Button';
import Card from '../components/Card';
import DataTable from '../components/DataTable';
import Skeleton from '../components/Skeleton';
import { ToastContext } from '../App';

const API_BASE = 'http://localhost:8000';
const API_V1 = 'http://localhost:8000/api/v1';

const RFx_TYPES = ['RFI', 'RFQ', 'RFP'];

// Apple-inspired Icons
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/>
    <path d="M21 21l-4.35-4.35"/>
  </svg>
);

const ProductIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);

const RequestIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14,2 14,8 20,8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10,9 9,9 8,9"/>
  </svg>
);

const AnalyticsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20,6 9,17 4,12"/>
  </svg>
);

export default function BuyerDashboard() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [show, setShow] = useState('products');
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [rfxType, setRfxType] = useState('RFI');
  const [specs, setSpecs] = useState('');
  const [autoSuppliers, setAutoSuppliers] = useState([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [submitMsg, setSubmitMsg] = useState('');
  const [deadline, setDeadline] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = React.useContext(ToastContext);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [productsRes, requestsRes, suppliersRes, analyticsRes] = await Promise.all([
          axios.get(`${API_BASE}/products/`, { headers: { Authorization: `Bearer ${user.token}` } }),
          axios.get(`${API_V1}/requests/`, { headers: { Authorization: `Bearer ${user.token}` } }),
          axios.get(`${API_V1}/suppliers/`, { headers: { Authorization: `Bearer ${user.token}` } }),
          axios.get(`${API_V1}/analytics/dashboard/`, { headers: { Authorization: `Bearer ${user.token}` } })
        ]);
        
        setProducts(productsRes.data);
        setRequests(requestsRes.data);
        setSuppliers(suppliersRes.data);
        setAnalytics(analyticsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Auto-list suppliers based on selected product
  useEffect(() => {
    if (!selectedProduct) return setAutoSuppliers([]);
    // Find suppliers who supply this product
    const filtered = suppliers.filter(s => s.company && s.company.id === selectedProduct.supplier);
    setAutoSuppliers(filtered);
    setSelectedSuppliers(filtered.map(s => s.id)); // Preselect all
  }, [selectedProduct, suppliers]);

  const handleProductSearch = e => setSearch(e.target.value);
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSupplierToggle = id => {
    setSelectedSuppliers(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handleSubmitRequest = async e => {
    e.preventDefault();
    setSubmitMsg('');
    if (!selectedProduct || !rfxType || !specs || !deadline || selectedSuppliers.length === 0) {
      setSubmitMsg('Please fill all fields and select at least one supplier.');
      return;
    }
    try {
      // 1. Create the request
      let parsedSpecs = {};
      try {
        parsedSpecs = JSON.parse(specs);
      } catch {
        parsedSpecs = { text: specs };
      }
      const payload = {
        title: `${rfxType} for ${selectedProduct.name}`,
        request_type: rfxType,
        description: specs,
        specifications: parsedSpecs,
        submission_deadline: deadline,
      };
      const res = await axios.post(`${API_V1}/requests/`, payload, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const requestId = res.data.id;
      // 2. Invite suppliers
      await axios.post(`${API_V1}/requests/${requestId}/invite/`, {
        supplier_ids: selectedSuppliers
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setSubmitMsg('Request submitted and suppliers invited!');
      setSelectedProduct(null);
      setSpecs('');
      setSelectedSuppliers([]);
      setRfxType('RFI');
      setDeadline('');
      axios.get(`${API_V1}/requests/`, { headers: { Authorization: `Bearer ${user.token}` } })
        .then(res => setRequests(res.data));
    } catch (err) {
      if (err.response && err.response.data) {
        setSubmitMsg(
          typeof err.response.data === 'string'
            ? err.response.data
            : JSON.stringify(err.response.data)
        );
      } else {
        setSubmitMsg('Failed to submit request or invite suppliers.');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      draft: 'status-badge status-draft',
      published: 'status-badge status-published',
      closed: 'status-badge status-closed',
      cancelled: 'status-badge status-cancelled'
    };
    
    return (
      <span className={statusClasses[status] || 'status-badge'}>
        {status}
      </span>
    );
  };

  const tabButtons = [
    { key: 'products', label: 'Products', icon: <ProductIcon /> },
    { key: 'requests', label: 'My Requests', icon: <RequestIcon /> },
    { key: 'analytics', label: 'Analytics', icon: <AnalyticsIcon /> }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <Card className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.username}
          </h1>
          <p className="text-gray-600">Manage your procurement requests and explore products</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 p-1 bg-white rounded-xl shadow-sm">
          {tabButtons.map(tab => (
            <button
              key={tab.key}
              onClick={() => setShow(tab.key)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
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

        {/* Products Section */}
        {show === 'products' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <ProductIcon />
                Browse Products
              </h2>
              {selectedProduct && (
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="btn-secondary"
                >
                  Clear Selection
                </button>
              )}
            </div>
            
            {/* Search Bar */}
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <SearchIcon />
              </div>
              <input
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search products by name or SKU..."
                value={search}
                onChange={handleProductSearch}
              />
            </div>

            {/* Products Grid */}
            <Card className="p-6">
              <DataTable
                columns={[
                  { accessor: 'name', Header: 'Name' },
                  { accessor: 'sku', Header: 'SKU' },
                  { accessor: 'supplier', Header: 'Supplier', Cell: row => suppliers.find(s => s.company && s.company.id === row.supplier)?.company?.name || 'N/A' },
                  { accessor: 'actions', Header: 'Actions', Cell: row => (
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Select</button>
                  ) },
                ]}
                data={filteredProducts}
                loading={isLoading}
                onRowClick={row => setSelectedProduct(row)}
                searchable
              />
            </Card>

            {/* RFx Creation Form */}
            {selectedProduct && (
              <div className="mt-8">
                <Card className="max-w-2xl">
                  <form onSubmit={handleSubmitRequest} className="space-y-6">
                    <div className="border-b border-gray-200 pb-4">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Create RFx Request
                      </h3>
                      <p className="text-gray-600">
                        Creating request for: <span className="font-medium">{selectedProduct.name}</span>
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          RFx Type
                        </label>
                        <select 
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          value={rfxType} 
                          onChange={e => setRfxType(e.target.value)}
                        >
                          {RFx_TYPES.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <CalendarIcon className="inline mr-1" />
                          Submission Deadline
                        </label>
                        <input 
                          type="datetime-local" 
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          value={deadline} 
                          onChange={e => setDeadline(e.target.value)} 
                          required 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Specifications & Requirements
                      </label>
                      <textarea 
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-32"
                        value={specs} 
                        onChange={e => setSpecs(e.target.value)} 
                        placeholder="Enter detailed specifications, requirements, and any special instructions..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Select Suppliers ({autoSuppliers.length} available)
                      </label>
                      <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3">
                        {autoSuppliers.map(s => (
                          <label key={s.id} className="flex items-center space-x-3 cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                              checked={selectedSuppliers.includes(s.id)} 
                              onChange={() => handleSupplierToggle(s.id)} 
                            />
                            <span className="text-sm text-gray-700">
                              {s.username} ({s.company?.name})
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <Button type="submit" className="btn-primary">
                        Submit Request & Invite Suppliers
                      </Button>
                      
                      {submitMsg && (
                        <div className={`text-sm ${submitMsg.includes('success') || submitMsg.includes('submitted') ? 'text-green-600' : 'text-red-600'}`}>
                          {submitMsg}
                        </div>
                      )}
                    </div>
                  </form>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Requests Section */}
        {show === 'requests' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <RequestIcon />
              My Requests
            </h2>
            
            <Card className="p-6">
              <DataTable
                columns={[
                  { accessor: 'title', Header: 'Title' },
                  { accessor: 'description', Header: 'Description' },
                  { accessor: 'status', Header: 'Status', Cell: row => (
                    <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">{row.status}</span>
                  ) },
                  { accessor: 'created_at', Header: 'Created At', Cell: row => new Date(row.created_at).toLocaleDateString() },
                  { accessor: 'actions', Header: 'Actions', Cell: row => (
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View</button>
                  ) },
                ]}
                data={requests}
                loading={isLoading}
                onRowClick={row => setSelectedRequest(row)}
                searchable
              />
            </Card>
            
            {requests.length === 0 && (
              <div className="text-center py-12">
                <RequestIcon className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No requests yet</h3>
                <p className="text-gray-600">Start by browsing products and creating your first RFx request.</p>
                <button 
                  onClick={() => setShow('products')} 
                  className="btn-primary mt-4"
                >
                  Browse Products
                </button>
              </div>
            )}
          </div>
        )}

        {/* Analytics Section */}
        {show === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <AnalyticsIcon />
              Analytics Dashboard
            </h2>
            
            <Card>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Dashboard Analytics</h3>
                <p className="text-gray-600">Overview of your procurement activities</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(analytics, null, 2)}
                </pre>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Card>
  );
}