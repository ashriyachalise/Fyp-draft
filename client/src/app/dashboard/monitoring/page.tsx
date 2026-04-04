'use client';
import { useState, useEffect } from 'react';
import api from '@/services/api';
import { 
  Activity, 
  Wrench, 
  Zap, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Search,
  Box,
  ArrowRight,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';

export default function MachineMonitoringPage() {
  const [machines, setMachines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMachine, setSelectedMachine] = useState<any>(null);

  useEffect(() => {
    const fetchMonitoringData = async () => {
      try {
        const { data } = await api.get('/monitoring');
        setMachines(data);
      } catch (err) {
        console.error('Error fetching monitoring data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMonitoringData();
  }, []);

  const handleUpdateHours = async (id: string, newHours: number) => {
    try {
      await api.patch(`/monitoring/${id}/hours`, { hours: newHours });
      setMachines(prev => prev.map(m => m._id === id ? { ...m, totalWorkingHours: newHours } : m));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update hours');
    }
  };

  const filteredMachines = machines.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center pt-32 h-full">
      <div className="w-16 h-16 border-4 border-slate-800 border-t-blue-500 rounded-full animate-spin mb-6"></div>
      <p className="text-blue-400 font-bold tracking-[0.2em] text-xs uppercase animate-pulse">Initializing Telemetry Stream...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white italic tracking-tighter">Machine Monitoring</h1>
          <p className="text-slate-400 mt-2 font-medium">Real-time telemetry, health diagnostics, and part compatibility.</p>
        </div>
        
        <div className="relative group max-w-md w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
          <input 
            type="text"
            placeholder="Search by Machine Name or Model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-white placeholder:text-slate-600 outline-none focus:border-blue-500/50 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredMachines.map((machine) => (
          <MachineCard 
            key={machine._id} 
            machine={machine} 
            onViewParts={() => setSelectedMachine(machine)}
            onUpdateHours={(hours: number) => handleUpdateHours(machine._id, hours)}
          />
        ))}
      </div>

      {/* Compatibility Modal/Overlay */}
      {selectedMachine && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-8 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setSelectedMachine(null)}></div>
          <div className="relative bg-slate-900 border border-slate-800 w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden">
            <div className="p-8 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-white italic">Compatibility: {selectedMachine.name}</h3>
                <p className="text-slate-400 text-sm">{selectedMachine.model} ({selectedMachine.serialNumber})</p>
              </div>
              <button 
                onClick={() => setSelectedMachine(null)}
                className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedMachine.compatibleParts.length > 0 ? (
                  selectedMachine.compatibleParts.map((part: any) => (
                    <div key={part.partNumber} className="p-6 bg-slate-800/30 border border-slate-700/50 rounded-3xl hover:border-blue-500/30 transition-all group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400">
                          <Box size={24} />
                        </div>
                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${
                          part.quantityInStock <= part.minimumStockLevel ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {part.quantityInStock <= part.minimumStockLevel ? 'Low Stock' : 'In Stock'}
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{part.name}</h4>
                      <p className="text-xs text-slate-500 font-mono mt-1 uppercase tracking-widest">{part.partNumber} &bull; {part.category}</p>
                      
                      <div className="mt-6 pt-6 border-t border-slate-700/50 flex items-center justify-between">
                        <span className="text-xl font-black text-white italic">Rs. {part.price.toLocaleString()}</span>
                        <button className="flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest">
                          Reorder Part <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 py-20 bg-slate-800/20 rounded-3xl border border-dashed border-slate-700 flex flex-col items-center justify-center text-center">
                    <ShieldCheck size={48} className="text-slate-700 mb-4" />
                    <p className="text-slate-500 font-medium">No direct inventory matches for this model.</p>
                    <p className="text-xs text-slate-600 mt-2 italic px-8">Contact the procurement team to register compatible SKUs.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MachineCard({ machine, onViewParts, onUpdateHours }: any) {
  const isDown = machine.status === 'down';
  const isMaintenance = machine.status === 'maintenance';
  const [isEditing, setIsEditing] = useState(false);
  const [tempHours, setTempHours] = useState(machine.totalWorkingHours);

  const saveHours = () => {
    onUpdateHours(Number(tempHours));
    setIsEditing(false);
  };
  
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 hover:border-slate-700 transition-all group relative overflow-hidden flex flex-col h-full">
      {/* Absolute Glow Background */}
      <div className={`absolute -right-20 -top-20 w-64 h-64 rounded-full blur-[100px] opacity-10 transition-opacity group-hover:opacity-20 ${
        isDown ? 'bg-red-500' : isMaintenance ? 'bg-orange-500' : 'bg-blue-500'
      }`}></div>

      <div className="relative z-10 flex-1">
        <div className="flex justify-between items-start mb-8">
          <div className={`p-4 rounded-2xl shadow-lg transition-transform group-hover:scale-110 ${
            isDown ? 'bg-red-500 text-white' : isMaintenance ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'
          }`}>
            <Activity size={28} />
          </div>
          <div className="text-right">
            <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border ${
              isDown ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
              isMaintenance ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 
              'bg-blue-500/10 text-blue-500 border-blue-500/20'
            }`}>
              {machine.status}
            </span>
            <p className="text-xs text-slate-500 mt-2 font-mono uppercase truncate">{machine.serialNumber}</p>
          </div>
        </div>

        <h3 className="text-2xl font-black text-white italic tracking-tight mb-2">{machine.name}</h3>
        <p className="text-slate-400 font-medium text-sm mb-8">{machine.model}</p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800/50 relative group/edit">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5 whitespace-nowrap">
              <Clock size={12} /> Total Uptime
            </p>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input 
                  type="number"
                  value={tempHours}
                  onChange={(e) => setTempHours(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white text-sm outline-none focus:ring-1 focus:ring-blue-500"
                  autoFocus
                />
                <button onClick={saveHours} className="p-1 bg-emerald-500 text-white rounded-md hover:bg-emerald-400">
                  <CheckCircle2 size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-lg font-black text-white italic">{machine.totalWorkingHours}h</p>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="opacity-0 group-hover/edit:opacity-100 transition-opacity p-1 text-slate-500 hover:text-blue-400"
                >
                  <Wrench size={12} />
                </button>
              </div>
            )}
          </div>
          <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800/50">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5 whitespace-nowrap">
              <Zap size={12} /> Health
            </p>
            <p className={`text-lg font-black italic ${
              machine.healthScore < 50 ? 'text-red-500' : machine.healthScore < 90 ? 'text-orange-500' : 'text-emerald-400'
            }`}>{machine.healthScore}%</p>
          </div>
        </div>

        {/* Maintenance Warning */}
        {(isDown || isMaintenance || machine.healthScore < 90) && (
          <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl mb-8 animate-pulse">
            <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle size={14} /> Maintenance Suggested
            </p>
            <p className="text-xs text-slate-500 mt-1">Machine reporting status instability.</p>
          </div>
        )}
      </div>

      <div className="relative z-10 pt-6 border-t border-slate-800/50 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Inventory Compatibility</p>
          <div className="flex items-center gap-2 mt-1">
             <div className="flex -space-x-2">
               {[...Array(Math.min(3, machine.compatibleParts.length))].map((_, i) => (
                 <div key={i} className="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center">
                   <Box size={10} className="text-slate-400" />
                 </div>
               ))}
             </div>
             <span className="text-xs font-bold text-slate-400">
               {machine.compatibleParts.length} Parts matched
             </span>
          </div>
        </div>
        <button 
          onClick={onViewParts}
          className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all shadow-lg hover:shadow-blue-500/10"
        >
          <Wrench size={20} />
        </button>
      </div>
    </div>
  );
}

function X({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
  );
}
