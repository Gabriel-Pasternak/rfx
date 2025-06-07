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

const RESPONSE_STATUS = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'Under Review',
  accepted: 'Accepted',
  rejected: 'Rejected',
};

// Apple-inspired Icons
const InboxIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
  </svg>
);

const ProductIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);

const ResponseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const MessageIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    <line x1="8" y1="9" x2="16" y2="9"/>
    <line x1="8" y1="13" x2="14" y2="13"/>
  </svg>
);

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22,2 15,22 11,13 2,9 22,2"/>
  </svg>
);

const NegotiationIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12,6 12,12 16,14"/>
  </svg>
);

export default function SupplierDashboard() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [responses, setResponses] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [show, setShow] = useState('requests');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [negotiation, setNegotiation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [negotiationMsg, setNegotiationMsg] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [responseModal, setResponseModal] = useState({ open: false, mode: 'reply', response: null, request: null });
  const [responseForm, setResponseForm] = useState({ content: '', quoted_price: '', delivery_timeline: '' });
  const [responseMsg, setResponseMsg] = useState('');
  const [responseLoading, setResponseLoading] = useState(false);
  const { addToast } = React.useContext(ToastContext);
  const [selectedInvitation, setSelectedInvitation] = useState(null);

  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [productsRes, responsesRes, requestsRes] = await Promise.all([
          axios.get(`${API_BASE}/products/?supplier=${user.company?.id || ''}`, { 
            headers: { Authorization: `Bearer ${user.token}` } 
          }),
          axios.get(`${API_V1}/responses/`, { 
            headers: { Authorization: `Bearer ${user.token}` } 
          }),
          axios.get(`${API_V1}/requests/`, { 
            headers: { Authorization: `Bearer ${user.token}` } 
          })
        ]);
        
        setProducts(productsRes.data);
        setResponses(responsesRes.data);
        setAllRequests(requestsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Find requests where this supplier is invited
  useEffect(() => {
    if (!allRequests.length) return;
    console.log('allRequests:', allRequests);
    const invited = allRequests.filter(r =>
      r.invitations &&
      r.status !== 'draft' &&
      r.invitations.some(inv => inv.supplier && inv.supplier.id === user.id)
    );
    console.log('invited:', invited);
    setInvitations(invited);
  }, [allRequests, user]);

  // Fetch negotiation thread for selected request
  useEffect(() => {
    if (!selectedRequest) return setNegotiation(null);
    axios.get(`${API_V1}/negotiation-threads/?request=${selectedRequest.id}`, {
      headers: { Authorization: `Bearer ${user.token}` }
    }).then(res => {
      if (res.data.length > 0) {
        setNegotiation(res.data[0]);
        setMessages(res.data[0].messages || []);
      } else {
        setNegotiation(null);
        setMessages([]);
      }
    });
  }, [selectedRequest, user]);

  const handleStartNegotiation = async () => {
    setNegotiationMsg('');
    try {
      const res = await axios.post(`${API_V1}/negotiation-threads/`, {
        request: selectedRequest.id,
        supplier: user.id,
        subject: `Negotiation for ${selectedRequest.title}`
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setNegotiation(res.data);
      setMessages(res.data.messages || []);
    } catch {
      setNegotiationMsg('Failed to start negotiation.');
    }
  };

  const handleSendMessage = async e => {
    e.preventDefault();
    setNegotiationMsg('');
    if (!newMessage || !negotiation) return;
    try {
      await axios.post(`${API_V1}/negotiation-messages/`, {
        thread: negotiation.id,
        content: newMessage
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      // Refresh messages
      const res = await axios.get(`${API_V1}/negotiation-threads/?request=${selectedRequest.id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setMessages(res.data[0].messages || []);
      setNewMessage('');
    } catch {
      setNegotiationMsg('Failed to send message.');
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
    { key: 'requests', label: 'Invited Requests', icon: <InboxIcon /> },
    { key: 'products', label: 'My Products', icon: <ProductIcon /> },
    { key: 'responses', label: 'My Responses', icon: <ResponseIcon /> }
  ];

  // Find response for a request
  const getResponseForRequest = (requestId) => responses.find(r => r.request === requestId && r.supplier === user.id);

  const openReplyModal = (request) => {
    setResponseForm({ content: '', quoted_price: '', delivery_timeline: '' });
    setResponseModal({ open: true, mode: 'reply', response: null, request });
    setResponseMsg('');
  };
  const openEditModal = (response, request) => {
    setResponseForm({
      content: JSON.stringify(response.content, null, 2),
      quoted_price: response.quoted_price || '',
      delivery_timeline: response.delivery_timeline || '',
    });
    setResponseModal({ open: true, mode: 'edit', response, request });
    setResponseMsg('');
  };
  const closeResponseModal = () => setResponseModal({ open: false, mode: 'reply', response: null, request: null });

  const handleResponseFormChange = e => {
    setResponseForm({ ...responseForm, [e.target.name]: e.target.value });
  };

  const handleSubmitResponse = async e => {
    e.preventDefault();
    setResponseLoading(true);
    setResponseMsg('');
    try {
      let content = {};
      try { content = JSON.parse(responseForm.content); } catch { content = { text: responseForm.content }; }
      if (responseModal.mode === 'reply') {
        await axios.post(`${API_V1}/responses/`, {
          request: responseModal.request.id,
          content,
          quoted_price: responseForm.quoted_price,
          delivery_timeline: responseForm.delivery_timeline,
          status: 'submitted',
        }, { headers: { Authorization: `Bearer ${user.token}` } });
      } else if (responseModal.mode === 'edit') {
        await axios.put(`${API_V1}/responses/${responseModal.response.id}/`, {
          content,
          quoted_price: responseForm.quoted_price,
          delivery_timeline: responseForm.delivery_timeline,
          status: 'submitted',
        }, { headers: { Authorization: `Bearer ${user.token}` } });
      }
      setResponseMsg('Response submitted!');
      setTimeout(() => { closeResponseModal(); window.location.reload(); }, 1000);
    } catch (err) {
      setResponseMsg('Failed to submit response.');
    } finally {
      setResponseLoading(false);
    }
  };

  const handleAcceptAward = async (responseId) => {
    setResponseMsg('');
    try {
      await axios.post(`${API_V1}/responses/${responseId}/accept/`, {}, { headers: { Authorization: `Bearer ${user.token}` } });
      setResponseMsg('Award accepted!');
      setTimeout(() => window.location.reload(), 1000);
    } catch {
      setResponseMsg('Failed to accept award.');
    }
  };
  const handleDeclineAward = async (responseId) => {
    setResponseMsg('');
    try {
      await axios.post(`${API_V1}/responses/${responseId}/decline/`, {}, { headers: { Authorization: `Bearer ${user.token}` } });
      setResponseMsg('Award declined.');
      setTimeout(() => window.location.reload(), 1000);
    } catch {
      setResponseMsg('Failed to decline award.');
    }
  };
  const handleCloseResponse = async (responseId) => {
    setResponseMsg('');
    try {
      await axios.patch(`${API_V1}/responses/${responseId}/`, { status: 'rejected' }, { headers: { Authorization: `Bearer ${user.token}` } });
      setResponseMsg('Response closed.');
      setTimeout(() => window.location.reload(), 1000);
    } catch {
      setResponseMsg('Failed to close response.');
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.username}
          </h1>
          <p className="text-gray-600">Manage your responses and negotiations</p>
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
              {tab.key === 'requests' && invitations.length > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {invitations.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Requests Section */}
        {show === 'requests' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <InboxIcon />
              Requests You're Invited To
            </h2>
            
            <Card className="p-6">
              <DataTable
                columns={[
                  { accessor: 'request_title', Header: 'Request Title', Cell: row => row.request?.title || '-' },
                  { accessor: 'buyer', Header: 'Buyer', Cell: row => row.request?.buyer?.username || '-' },
                  { accessor: 'status', Header: 'Status', Cell: row => (
                    <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">{row.status}</span>
                  ) },
                  { accessor: 'actions', Header: 'Actions', Cell: row => (
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View</button>
                  ) },
                ]}
                data={invitations}
                loading={isLoading}
                onRowClick={row => setSelectedInvitation(row)}
                searchable
              />
            </Card>

            {invitations.length === 0 && (
              <div className="text-center py-12">
                <InboxIcon className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No new invitations</h3>
                <p className="text-gray-600">You'll see new RFx requests here when buyers invite you.</p>
              </div>
            )}

            {/* Request Detail Modal */}
            {selectedRequest && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                  <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-gray-900">{selectedRequest.title}</h3>
                      <button
                        onClick={() => setSelectedRequest(null)}
                        className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Request Details</h4>
                        <div className="space-y-2 text-sm">
                          <div><span className="text-gray-500">Type:</span> <span className="ml-2">{selectedRequest.request_type}</span></div>
                          <div><span className="text-gray-500">Status:</span> <span className="ml-2">{getStatusBadge(selectedRequest.status)}</span></div>
                          <div><span className="text-gray-500">Deadline:</span> <span className="ml-2">{new Date(selectedRequest.submission_deadline).toLocaleString()}</span></div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                        <p className="text-sm text-gray-600">{selectedRequest.description}</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h4 className="font-medium text-gray-900 mb-2">Specifications</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                          {JSON.stringify(selectedRequest.specifications, null, 2)}
                        </pre>
                      </div>
                    </div>

                    {/* Negotiation Section */}
                    <div className="border-t border-gray-200 pt-6">
                      <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                        <NegotiationIcon />
                        Negotiation
                      </h4>
                      
                      {negotiation ? (
                        <div className="space-y-4">
                          <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                            {messages.length === 0 ? (
                              <p className="text-gray-500 text-center py-4">No messages yet. Start the conversation!</p>
                            ) : (
                              <div className="space-y-3">
                                {messages.map(m => (
                                  <div key={m.id} className="flex gap-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                      <span className="text-xs font-medium text-blue-600">
                                        {m.sender_username.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-sm">{m.sender_username}</span>
                                        <span className="text-xs text-gray-500">{new Date(m.created_at).toLocaleString()}</span>
                                      </div>
                                      <p className="text-sm text-gray-700">{m.content}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <form onSubmit={handleSendMessage} className="flex gap-3">
                            <input 
                              className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              value={newMessage} 
                              onChange={e => setNewMessage(e.target.value)} 
                              placeholder="Type your message..." 
                              required
                            />
                            <button 
                              type="submit" 
                              className="btn-primary !py-2 !px-4"
                              disabled={!newMessage.trim()}
                            >
                              <SendIcon />
                            </button>
                          </form>
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <MessageIcon className="mx-auto text-gray-400 mb-3" />
                          <p className="text-gray-600 mb-4">Start a negotiation thread to discuss this request</p>
                          <button 
                            onClick={handleStartNegotiation}
                            className="btn-primary"
                          >
                            Start Negotiation
                          </button>
                        </div>
                      )}
                      
                      {negotiationMsg && (
                        <div className="mt-3 text-sm text-red-600">{negotiationMsg}</div>
                      )}
                    </div>

                    {/* Supplier Actions */}
                    <div className="border-t border-gray-200 pt-6 mt-6">
                      <h4 className="font-medium text-gray-900 mb-4">Supplier Actions</h4>
                      {(() => {
                        const response = getResponseForRequest(selectedRequest.id);
                        if (!response) {
                          return <Button onClick={() => openReplyModal(selectedRequest)} className="btn-primary">Reply to Request</Button>;
                        }
                        return (
                          <div className="flex flex-wrap gap-3 items-center">
                            <Button onClick={() => openEditModal(response, selectedRequest)} className="btn-secondary">Edit Response</Button>
                            {response.award_status === 'awarded' && (
                              <>
                                <Button onClick={() => handleAcceptAward(response.id)} className="btn-primary">Accept Award</Button>
                                <Button onClick={() => handleDeclineAward(response.id)} className="btn-secondary">Decline</Button>
                              </>
                            )}
                            {['submitted', 'under_review'].includes(response.status) && (
                              <Button onClick={() => handleCloseResponse(response.id)} className="btn-secondary">Close Response</Button>
                            )}
                            <span className="text-sm text-gray-600 ml-2">Status: {RESPONSE_STATUS[response.status] || response.status}</span>
                          </div>
                        );
                      })()}
                      {responseMsg && <div className="mt-2 text-blue-600">{responseMsg}</div>}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Products Section */}
        {show === 'products' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ProductIcon />
              My Products
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(p => (
                <Card key={p.id} className="hover:shadow-lg transition-all duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-1">{p.name}</h3>
                      <p className="text-sm text-gray-500">SKU: {p.sku}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    {p.description && (
                      <p className="line-clamp-2">{p.description}</p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
            
            {products.length === 0 && (
              <div className="text-center py-12">
                <ProductIcon className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products listed</h3>
                <p className="text-gray-600">Your product catalog will appear here.</p>
              </div>
            )}
          </div>
        )}

        {/* Responses Section */}
        {show === 'responses' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ResponseIcon />
              My Responses
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {responses.map(r => (
                <Card key={r.id} className="hover:shadow-lg transition-all duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">
                        {r.request?.title || 'Untitled Request'}
                      </h3>
                    </div>
                    {getStatusBadge(r.status)}
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p>Response submitted for this request</p>
                  </div>
                </Card>
              ))}
            </div>
            
            {responses.length === 0 && (
              <div className="text-center py-12">
                <ResponseIcon className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No responses yet</h3>
                <p className="text-gray-600">Your submitted responses will appear here.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Response Modal */}
      {responseModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg relative">
            <button onClick={closeResponseModal} className="absolute top-3 right-3 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <h3 className="text-xl font-semibold mb-4">{responseModal.mode === 'reply' ? 'Reply to Request' : 'Edit Response'}</h3>
            <form onSubmit={handleSubmitResponse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Response Content (JSON or text)</label>
                <textarea name="content" className="w-full border rounded-lg p-2 h-24" value={responseForm.content} onChange={handleResponseFormChange} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Quoted Price</label>
                <input name="quoted_price" type="number" step="0.01" className="w-full border rounded-lg p-2" value={responseForm.quoted_price} onChange={handleResponseFormChange} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Delivery Timeline</label>
                <input name="delivery_timeline" className="w-full border rounded-lg p-2" value={responseForm.delivery_timeline} onChange={handleResponseFormChange} required />
              </div>
              <Button type="submit" className="btn-primary w-full" loading={responseLoading} disabled={responseLoading}>
                {responseModal.mode === 'reply' ? 'Submit Response' : 'Update Response'}
              </Button>
              {responseMsg && <div className="mt-2 text-blue-600">{responseMsg}</div>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}