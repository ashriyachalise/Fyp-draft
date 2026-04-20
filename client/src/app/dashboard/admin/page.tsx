'use client';
import { useState, useEffect } from 'react';
import api from '@/services/api';
import { 
  Users, 
  Shield, 
  Edit2, 
  Trash2, 
  UserPlus,
  Mail,
  MoreVertical,
  CheckCircle2,
  XCircle,
  X,
  Loader2
} from 'lucide-react';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'requests'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add User Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'technician'
  });

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchRequests = async () => {
    try {
      const { data } = await api.get('/lending/admin/requests');
      setRequests(data);
    } catch (err) {
      console.error('Error fetching requests:', err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchUsers(), fetchRequests()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();

    // Polling for real-time updates of Machine Requests
    const interval = setInterval(() => {
      fetchRequests();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'manager': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'client': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'contractor': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'pending': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'approved': 
      case 'pending_payment': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'returned': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      case 'rejected': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await api.post('/users', formData);
      setShowAddModal(false);
      setFormData({ username: '', email: '', password: '', role: 'technician' });
      await fetchUsers();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to add user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: string, username: string) => {
    if (!window.confirm(`Are you absolutely sure you want to delete the user "${username}"? This action cannot be undone.`)) return;
    try {
      await api.delete(`/users/${id}`);
      await fetchUsers();
    } catch (err: any) {
      console.error('Failed to delete user:', err);
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleApproveRequest = async (id: string) => {
    try {
      await api.patch(`/lending/request/${id}/status`, { status: 'approved' });
      await fetchRequests();
    } catch (err) {
      console.error('Approval error:', err);
    }
  };

  const handleRejectRequest = async (id: string) => {
    try {
      if (!window.confirm('Are you sure you want to reject this request?')) return;
      await api.patch(`/lending/request/${id}/status`, { status: 'rejected' });
      await fetchRequests();
    } catch (err) {
      console.error('Rejection error:', err);
    }
  };

  const handleConfirmReturn = async (id: string) => {
    try {
      await api.patch(`/lending/request/${id}/confirm-return`);
      await fetchRequests();
    } catch (err) {
      console.error('Return confirmation error:', err);
    }
  };

  if (loading && users.length === 0) return (
    <div className="flex flex-col items-center justify-center pt-32 h-full">
      <div className="w-12 h-12 border-4 border-slate-800 border-t-blue-500 rounded-full animate-spin mb-4"></div>
      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Accessing Admin Core...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Management</h1>
          <p className="text-slate-400 mt-1">Control system access and manage machinery lending operations.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex">
            <button 
              className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all bg-blue-600 text-white shadow-lg shadow-blue-600/20"
            >
              Users
            </button>
          </div>
          {activeTab === 'users' && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-lg shadow-blue-600/20"
            >
              <UserPlus size={18} />
              <span className="hidden sm:inline">Add User</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 pb-10">
        <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/50">
                    <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">User Identity</th>
                    <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Access Role</th>
                    <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-blue-400 font-bold border border-slate-700">
                            {user.username?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-white group-hover:text-blue-400 transition-colors">{user.username}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-widest ${getRoleBadge(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                          <CheckCircle2 size={14} className="animate-pulse" />
                          Authenticated
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleDeleteUser(user._id, user.username)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg flex items-center gap-1 text-[10px] uppercase font-bold"
                          >
                            <Trash2 size={16} /> Delete
                          </button>
                          <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg"><MoreVertical size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden shadow-blue-500/5">
            <div className="flex items-center justify-between p-8 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white flex items-center gap-3 italic">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><UserPlus size={20} /></div>
                Add Personnel
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white p-1"><X size={20} /></button>
            </div>

            <form onSubmit={handleAddUser} className="p-8 space-y-6">
              {errorMsg && <div className="p-4 text-xs font-bold text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl">{errorMsg}</div>}
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2">Username</label>
                  <input type="text" required value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className="w-full px-5 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-200 placeholder:text-slate-700 transition-all" placeholder="e.g. jsmith_contractor" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2">Email Address</label>
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-5 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-200 placeholder:text-slate-700 transition-all" placeholder="e.g. john@contractmail.com" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2">Security Hash</label>
                  <input type="password" required minLength={6} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full px-5 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-200 placeholder:text-slate-700 transition-all" placeholder="Password (Min 6 chars)" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2">Operational Role</label>
                  <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full px-5 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-200 cursor-pointer appearance-none bg-[url('data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3e%3cpath stroke=%27%2364748b%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27M6 8l4 4 4-4%27/%3e%3c/svg%3e')] bg-[position:right_1rem_center] bg-no-repeat bg-[length:1.5em_1.5em]">
                    <option value="technician">Technician</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                    <option value="client">Client</option>
                    <option value="contractor">Contractor</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Confirm Access'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
