'use client';
import { useState, useEffect } from 'react';
import api from '@/services/api';
import { 
  Activity, 
  MapPin, 
  Search, 
  Filter, 
  ChevronRight,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  X
} from 'lucide-react';

export default function AvailableMachines() {
  const [machines, setMachines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Request Modal State
  const [selectedMachine, setSelectedMachine] = useState<any>(null);
  const [siteLocation, setSiteLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    try {
      const { data } = await api.get('/machines');
      // Only show idle machines
      setMachines(data.filter((m: any) => m.status === 'idle'));
    } catch (err) {
      console.error('Error fetching machines:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/lending/request', {
        machineId: selectedMachine._id,
        siteLocation
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setSelectedMachine(null);
        setSiteLocation('');
        fetchMachines();
      }, 2000);
    } catch (err) {
      console.error('Error submitting request:', err);
      alert('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMachines = machines.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.model.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center pt-32 h-full">
      <div className="w-16 h-16 border-4 border-slate-800 border-t-blue-500 rounded-full animate-spin mb-6"></div>
      <p className="text-blue-400 font-bold tracking-[0.2em] text-xs uppercase">Scanning Available Fleet...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Available Machinery</h1>
          <p className="text-slate-400 mt-1">Select equipment for deployment to your construction site.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or model..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-200 w-64 transition-all"
            />
          </div>
          <button className="p-2.5 bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all border border-slate-700">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {filteredMachines.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center bg-slate-900/50 rounded-[2.5rem] border border-dashed border-slate-800">
          <ShieldAlert size={48} className="text-slate-700 mb-4" />
          <h3 className="text-lg font-bold text-slate-400">No Equipment Available</h3>
          <p className="text-slate-500 max-w-xs mt-2">All machinery is currently active or in maintenance. Please check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMachines.map((machine) => (
            <div key={machine._id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden group hover:border-blue-500/30 transition-all shadow-xl shadow-slate-950/50">

              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{machine.name}</h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">{machine.model} &bull; S/N: {machine.serialNumber}</p>
                  </div>
                  <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
                    <Activity size={18} />
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
                  <MapPin size={14} className="text-blue-500" />
                  Currently at Depot (Ready for Transport)
                </div>

                <button 
                  onClick={() => setSelectedMachine(machine)}
                  className="w-full py-3 bg-slate-800 hover:bg-blue-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 group/btn"
                >
                  Request Equipment <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Request Modal */}
      {selectedMachine && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2rem] shadow-2xl overflow-hidden relative">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white flex items-center gap-3 italic">
                <div className="p-2 bg-blue-500/10 rounded-lg"><Activity className="text-blue-400" size={18} /></div>
                Equipment Request
              </h2>
              <button onClick={() => setSelectedMachine(null)} className="text-slate-400 hover:text-white p-1"><X size={20} /></button>
            </div>

            <div className="p-6">
              {success ? (
                <div className="py-8 flex flex-col items-center justify-center text-center animate-in zoom-in duration-300">
                  <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mb-6 border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                    <CheckCircle2 size={40} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Request Submitted!</h3>
                  <p className="text-slate-500 text-sm">Your deployment request for <strong>{selectedMachine.name}</strong> is being reviewed by Admin.</p>
                </div>
              ) : (
                <form onSubmit={handleRequest} className="space-y-6">
                  <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-blue-400">
                      <Activity size={24} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-black tracking-widest leading-none mb-1">Equipment</p>
                      <p className="text-sm font-bold text-white">{selectedMachine.name}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
                      <MapPin size={14} className="text-blue-400" /> Site / Deployment Location
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="Enter construction site address..."
                      value={siteLocation}
                      onChange={(e) => setSiteLocation(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-slate-200 placeholder:text-slate-600 transition-all"
                    />
                  </div>

                  <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                    <p className="text-[10px] font-bold text-blue-400/70 uppercase tracking-widest leading-tight">
                      Deployment Guidelines: Admin approval is required. Once approved, you must complete the mock payment to activate the machinery.
                    </p>
                  </div>

                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Confirm Deployment'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
