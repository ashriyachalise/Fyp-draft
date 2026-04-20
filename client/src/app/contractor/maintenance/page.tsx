'use client';
import { useState, useEffect } from 'react';
import api from '@/services/api';
import { 
  Wrench, 
  Settings, 
  MessageSquare, 
  CheckCircle2, 
  AlertTriangle,
  Loader2,
  Activity,
  MapPin,
  ChevronRight
} from 'lucide-react';

export default function MaintenanceRequests() {
  const [activeRequests, setActiveRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [selectedRequest, setSelectedRequest] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchActiveLeases = async () => {
      try {
        const { data } = await api.get('/lending/my-requests');
        setActiveRequests(data.filter((r: any) => r.status === 'active'));
      } catch (err) {
        console.error('Error fetching active leases:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchActiveLeases();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    setIsSubmitting(true);
    try {
      await api.post(`/lending/request/${selectedRequest}/maintenance`, { description });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setDescription('');
        setSelectedRequest('');
      }, 3000);
    } catch (err) {
      console.error('Maintenance Request Error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center pt-32 h-full">
      <div className="w-16 h-16 border-4 border-slate-800 border-t-blue-500 rounded-full animate-spin mb-6"></div>
      <p className="text-blue-400 font-bold tracking-[0.2em] text-xs uppercase">Connecting to Service Hub...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white">Maintenance Support</h1>
        <p className="text-slate-400 mt-1">Request technical assistance or routine maintenance for your active machinery fleet.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Request Form */}
        <div className="lg:col-span-2 p-8 bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Wrench size={18} /></div>
            New Maintenance Ticket
          </h2>

          {success ? (
            <div className="py-12 flex flex-col items-center justify-center text-center animate-in zoom-in">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mb-6 border border-emerald-500/20">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Request Transmitted</h3>
              <p className="text-slate-500">Our technicians have been notified. We will update you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Select Machinery</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeRequests.length > 0 ? (
                    activeRequests.map((req) => (
                      <div 
                        key={req._id}
                        onClick={() => setSelectedRequest(req._id)}
                        className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${selectedRequest === req._id ? 'bg-blue-600/10 border-blue-500 ring-2 ring-blue-500/20' : 'bg-slate-950 border-slate-800 hover:border-slate-600'}`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${selectedRequest === req._id ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                          <Activity size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{req.machine?.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{req.siteLocation}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="md:col-span-2 p-6 bg-slate-950 border border-dashed border-slate-800 rounded-2xl text-center">
                      <AlertTriangle className="text-slate-700 mx-auto mb-2" size={24} />
                      <p className="text-slate-600 text-sm font-medium">No active machinery leases found to request maintenance for.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Issue Description</label>
                <textarea 
                  required
                  rows={5}
                  placeholder="Describe the issue or maintenance required in detail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-200 placeholder:text-slate-600 transition-all resize-none"
                />
              </div>

              <div className="p-4 bg-orange-500/5 border border-orange-500/10 rounded-2xl flex items-start gap-3">
                <AlertTriangle size={16} className="text-orange-400 shrink-0 mt-0.5" />
                <p className="text-[10px] font-bold text-slate-500 leading-tight">
                  Emergency maintenance requests are monitored 24/7. Routine checkups will be scheduled during standard operating hours.
                </p>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting || !selectedRequest}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : (
                  <>
                    Submit Ticket <ChevronRight size={18} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="p-8 bg-slate-900 border border-slate-800 rounded-[2.5rem]">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3 italic">
              <div className="p-2 bg-slate-800 rounded-lg"><Settings size={18} /></div>
              Support Stats
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Global Status</span>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase rounded-full border border-emerald-500/20">Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Avg Response</span>
                <span className="text-sm font-black text-white italic">~45 Minutes</span>
              </div>
              <div className="h-px bg-slate-800 w-full" />
              <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                <p className="text-[10px] font-bold text-slate-500 flex items-center gap-2 mb-2">
                  <MapPin size={12} className="text-blue-500" /> ON-SITE SUPPORT
                </p>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Field technicians are available for mobile repairs within 50km of the central depot.
                </p>
              </div>
            </div>
          </div>

          <div className="p-8 bg-blue-600 rounded-[2.5rem] shadow-xl shadow-blue-600/20">
            <h3 className="text-lg font-black text-white mb-4 italic">NEED URGENT HELP?</h3>
            <p className="text-blue-100 text-xs font-medium mb-6 leading-relaxed">
              For critical engine failure or safety hazards, use our AI-powered emergency diagnosis tool.
            </p>
            <button className="w-full py-3 bg-white text-blue-600 font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
              <MessageSquare size={14} /> Talk to AI Assistant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
