'use client';
import { useState, useEffect } from 'react';
import api from '@/services/api';
import { 
  ClipboardList, 
  Mail,
  MoreVertical,
  XCircle
} from 'lucide-react';

export default function MachineRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const { data } = await api.get('/lending/admin/requests');
      setRequests(data);
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();

    // Polling for real-time updates of Machine Requests
    const interval = setInterval(() => {
      fetchRequests();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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

  if (loading && requests.length === 0) return (
    <div className="flex flex-col items-center justify-center pt-32 h-full">
      <div className="w-12 h-12 border-4 border-slate-800 border-t-blue-500 rounded-full animate-spin mb-4"></div>
      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Requests...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <ClipboardList className="text-blue-500" size={32} />
            Machine Requests
          </h1>
          <p className="text-slate-400 mt-1">Review machinery lending operations submitted by contractors.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 pb-10">
        <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50">
                  <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Contractor / Site</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Machinery</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center text-slate-500 italic font-medium">No machine lending requests found in the system.</td>
                  </tr>
                ) : (
                  requests.map((req) => (
                    <tr key={req._id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 font-bold border border-orange-500/20">
                            {req.contractor?.username?.[0]?.toUpperCase() || 'C'}
                          </div>
                          <div>
                            <p className="font-bold text-white group-hover:text-orange-400 transition-colors italic">{req.contractor?.username}</p>
                            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                              <Mail size={10} /> {req.siteLocation}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div>
                          <p className="font-bold text-slate-200 uppercase tracking-tight">{req.machine?.name}</p>
                          <p className="text-[10px] text-slate-500">{req.machine?.model}</p>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-widest ${getStatusBadge(req.status)}`}>
                          {req.status.replace('_', ' ')}
                        </span>
                        {req.returnRequested && req.status !== 'returned' && (
                          <span className="ml-2 px-2.5 py-0.5 bg-red-500/10 text-red-400 text-[10px] font-black uppercase tracking-widest border border-red-500/20 animate-bounce">Return Alert</span>
                        )}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-3 transition-all">
                          {req.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => handleApproveRequest(req._id)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-emerald-600/20 transition-all"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => handleRejectRequest(req._id)}
                                className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg"
                              >
                                <XCircle size={18} />
                              </button>
                            </>
                          )}
                          {req.returnRequested && req.status !== 'returned' && (
                            <button 
                              onClick={() => handleConfirmReturn(req._id)}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-blue-600/20 transition-all"
                            >
                              Confirm Return
                            </button>
                          )}
                          <button className="p-2 text-slate-500 hover:text-white rounded-lg transition-colors"><MoreVertical size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
