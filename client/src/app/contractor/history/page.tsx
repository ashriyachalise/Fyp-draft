'use client';
import { useState, useEffect } from 'react';
import api from '@/services/api';
import { 
  History, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  MapPin,
  Loader2,
  X,
  Zap,
  ArrowDownLeft,
  ChevronRight
} from 'lucide-react';

export default function LendingHistory() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Payment Modal State
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'Khalti' | 'eSewa'>('Khalti');
  const [isPaying, setIsPaying] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data } = await api.get('/lending/my-requests');
      setRequests(data);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setIsPaying(true);
    try {
      await api.post(`/lending/request/${selectedRequest._id}/pay`, {
        paymentMethod,
        transactionId: `MOCK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        amount: 5000 // Mock amount
      });
      setPaySuccess(true);
      setTimeout(() => {
        setPaySuccess(false);
        setSelectedRequest(null);
        fetchHistory();
      }, 2000);
    } catch (err) {
      console.error('Payment Error:', err);
      alert('Payment failed. Please try again.');
    } finally {
      setIsPaying(false);
    }
  };

  const handleReturn = async (id: string) => {
    if (!window.confirm('Are you sure you want to request a return for this machinery?')) return;
    try {
      await api.post(`/lending/request/${id}/return`);
      fetchHistory();
      alert('Return request submitted. Please wait for Admin confirmation.');
    } catch (err) {
      console.error('Return Error:', err);
    }
  };

  const handleComplete = async (id: string) => {
    if (!window.confirm('Are you sure you want to mark this task as completed? This will instantly release the machine.')) return;
    try {
      await api.post(`/lending/request/${id}/complete`);
      fetchHistory();
    } catch (err) {
      console.error('Completion Error:', err);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'pending': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'approved': 
      case 'pending_payment': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 animate-pulse';
      case 'completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-black';
      case 'returned': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      case 'rejected': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center pt-32 h-full">
      <div className="w-16 h-16 border-4 border-slate-800 border-t-blue-500 rounded-full animate-spin mb-6"></div>
      <p className="text-blue-400 font-bold tracking-[0.2em] text-xs uppercase">Fetching History Logs...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white">Lending History & Payments</h1>
        <p className="text-slate-400 mt-1">Track your machinery requests, payments, and deployment status.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50">
                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Machinery</th>
                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Site Location</th>
                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <History size={48} className="text-slate-800 mx-auto mb-4" />
                    <p className="text-slate-500 italic">No request history found.</p>
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req._id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 font-bold group-hover:scale-110 transition-transform">
                          <Zap size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{req.machine?.name}</p>
                          <p className="text-[10px] text-slate-600 font-mono mt-0.5">{new Date(req.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-slate-300">
                        <MapPin size={14} className="text-blue-500" />
                        <span className="text-sm font-medium">{req.siteLocation}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest ${getStatusStyle(req.status)}`}>
                        {req.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {['approved', 'pending_payment'].includes(req.status) && (
                          <button 
                            onClick={() => setSelectedRequest(req)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2"
                          >
                            <CreditCard size={14} /> Pay Now
                          </button>
                        )}
                        {req.status === 'active' && !req.returnRequested && (
                          <>
                            <button 
                              onClick={() => handleComplete(req._id)}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all shadow-lg shadow-emerald-600/20"
                            >
                              Complete Task
                            </button>
                            <button 
                              onClick={() => handleReturn(req._id)}
                              className="px-4 py-2 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all border border-slate-700"
                            >
                              Request Return
                            </button>
                          </>
                        )}
                        {req.status === 'active' && req.returnRequested && (
                          <span className="text-[10px] font-bold text-orange-400/70 italic uppercase tracking-widest">Return Pending Admin</span>
                        )}
                        <ChevronRight className="text-slate-700" size={18} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden relative">
            <div className="flex items-center justify-between p-8 border-b border-slate-800 bg-slate-900/50">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><CreditCard size={20} /></div>
                Secure Payment
              </h2>
              <button onClick={() => setSelectedRequest(null)} className="text-slate-400 hover:text-white p-1"><X size={20} /></button>
            </div>

            <div className="p-8">
              {paySuccess ? (
                <div className="py-8 flex flex-col items-center justify-center text-center animate-in scale-in duration-300">
                  <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mb-6 border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.3)]">
                    <CheckCircle2 size={40} />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2 italic">PAYMENT SUCCESS</h3>
                  <p className="text-slate-500 text-sm">Machinery core activation sequence complete.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-5 bg-slate-950/50 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Equipment Lease</p>
                      <p className="text-sm font-bold text-white">{selectedRequest.machine?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Lease Fee</p>
                      <p className="text-lg font-black text-blue-400 leading-none">NPR 5,000</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Select Payment Gateway</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => setPaymentMethod('Khalti')}
                        className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-3 ${paymentMethod === 'Khalti' ? 'bg-purple-600/10 border-purple-500/50 ring-2 ring-purple-500/20' : 'bg-slate-950 border-slate-800 grayscale opacity-60 hover:grayscale-0 hover:opacity-100'}`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white font-black text-sm">K</div>
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Khalti</span>
                      </button>
                      <button 
                        onClick={() => setPaymentMethod('eSewa')}
                        className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-3 ${paymentMethod === 'eSewa' ? 'bg-emerald-600/10 border-emerald-500/50 ring-2 ring-emerald-500/20' : 'bg-slate-950 border-slate-800 grayscale opacity-60 hover:grayscale-0 hover:opacity-100'}`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-sm">e</div>
                        <span className="text-xs font-bold text-white uppercase tracking-wider">eSewa</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                    <Zap size={16} className="text-blue-400 shrink-0" />
                    <p className="text-[10px] font-bold text-slate-500 leading-tight">
                      This is a MOCK payment. Clicking the button below will instantly confirm the transaction for testing purposes.
                    </p>
                  </div>

                  <button 
                    onClick={handlePayment}
                    disabled={isPaying}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-sm rounded-xl shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-3 group"
                  >
                    {isPaying ? <Loader2 size={20} className="animate-spin" /> : (
                      <>
                        Pay NPR 5,000 <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
