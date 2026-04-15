'use client';
import { useState, useEffect } from 'react';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Wrench, CheckCircle2, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function ClientMaintenancePage() {
  const { user } = useAuth();
  const [machines, setMachines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedMachine, setSelectedMachine] = useState('');
  const [maintenanceType, setMaintenanceType] = useState('repair');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [myRequests, setMyRequests] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [machinesRes, maintenanceRes] = await Promise.all([
          api.get('/machines'),
          api.get('/maintenance')
        ]);
        
        setMachines(machinesRes.data);
        
        // Filter maintenance to show only requests made by this client
        const clientRequests = maintenanceRes.data.filter((req: any) => 
          req.requestedBy === user?._id || (req.requestedBy && req.requestedBy._id === user?._id)
        );
        setMyRequests(clientRequests);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMachine) {
      alert('Please select a machine');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/maintenance', {
        machine: selectedMachine,
        maintenanceType,
        notes
      });
      setSuccess(true);
      setNotes('');
      // Refresh list
      const { data } = await api.get('/maintenance');
      const clientRequests = data.filter((req: any) => 
        req.requestedBy === user?._id || (req.requestedBy && req.requestedBy._id === user?._id)
      );
      setMyRequests(clientRequests);
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to submit request:', err);
      alert('Failed to submit maintenance request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading Configuration...</div>;

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 p-4 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/shop" className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700" title="Back to Shop">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Wrench className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold text-white tracking-tight hidden sm:block">Maintenance Request</span>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-4 lg:p-8 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Request Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl h-fit">
            <h2 className="text-2xl font-bold text-white mb-2">Submit Request</h2>
            <p className="text-slate-400 mb-6 text-sm">Select a machine from your site to dispatch a service technician.</p>
            
            {success && (
              <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-400">
                <CheckCircle2 size={20} />
                <p className="font-medium">Request submitted successfully! Our team will assign a technician shortly.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300">Select Machine/Asset</label>
                <select 
                  value={selectedMachine}
                  onChange={(e) => setSelectedMachine(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none appearance-none"
                  required
                >
                  <option value="" disabled>Choose a machine...</option>
                  {machines.map(m => (
                    <option key={m._id} value={m._id}>{m.name} ({m.model}) - {m.location}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300">Service Type</label>
                <select 
                  value={maintenanceType}
                  onChange={(e) => setMaintenanceType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none appearance-none"
                >
                  <option value="repair">Corrective Repair</option>
                  <option value="routine">Routine Maintenance</option>
                  <option value="inspection">Safety Inspection</option>
                  <option value="emergency">Emergency Breakdown</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300">Issue Details</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe the problem, error codes, or weird sounds..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none min-h-[120px]"
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="animate-spin" size={20} /> : <Wrench size={20} />}
                {submitting ? 'Submitting...' : 'Submit Maintenance Request'}
              </button>
            </form>
          </div>

          {/* Request History */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl h-fit">
            <h2 className="text-xl font-bold text-white mb-6">My Requests</h2>
            
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {myRequests.length === 0 ? (
                <div className="text-center py-10 bg-slate-950/50 rounded-xl border border-dashed border-slate-800">
                  <AlertCircle size={32} className="text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 font-medium">No requests yet.</p>
                </div>
              ) : (
                myRequests.map(req => (
                  <div key={req._id} className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 space-y-2 group">
                    <div className="flex items-start justify-between">
                      <h3 className="font-bold text-white capitalize">{req.maintenanceType}</h3>
                      <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${
                        req.status === 'requested' ? 'text-blue-400 bg-blue-400/10 border border-blue-400/20' :
                        req.status === 'scheduled' ? 'text-purple-400 bg-purple-400/10 border border-purple-400/20' :
                        req.status === 'completed' ? 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20' :
                        'text-orange-400 bg-orange-400/10 border border-orange-400/20'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400"><span className="text-slate-500">Machine:</span> {req.machine?.name || 'Unknown'}</p>
                    {req.status === 'scheduled' && req.scheduledDate && (
                      <p className="text-xs font-medium text-purple-400 mt-2 bg-purple-500/10 px-2 py-1 flex w-fit rounded">
                        Scheduled for: {new Date(req.scheduledDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
