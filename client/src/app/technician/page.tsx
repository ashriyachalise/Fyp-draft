'use client';
import { useState, useEffect } from 'react';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Wrench, CheckCircle2, XCircle } from 'lucide-react';

export default function TechnicianDashboard() {
  const { user } = useAuth();
  const [isAvailable, setIsAvailable] = useState(true);
  const [siteLocation, setSiteLocation] = useState('Unassigned');
  const [saving, setSaving] = useState(false);

  const [tasks, setTasks] = useState<any[]>([]);
  const [allLocations, setAllLocations] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const [profileRes, maintenanceRes, machinesRes] = await Promise.all([
          api.get('/users/profile'),
          api.get('/maintenance'),
          api.get('/machines')
        ]);
        
        setIsAvailable(profileRes.data.isAvailable ?? true);
        setSiteLocation(profileRes.data.siteLocation || 'Unassigned');

        const assignedTasks = maintenanceRes.data.filter((task: any) => 
          task.technician?._id === user._id || task.technician === user._id
        );
        // Only show pending or scheduled tasks taking precedence
        setTasks(assignedTasks.filter((t: any) => t.status !== 'completed'));

        // Extract all unique locations from entire fleet
        const uniqueLocs = Array.from(new Set(machinesRes.data.map((m: any) => m.location).filter(Boolean)));
        setAllLocations(uniqueLocs as string[]);
      } catch (err) {
        console.error('Failed to load data', err);
      }
    };
    fetchData();
  }, [user]);

  const handleUpdateStatus = async () => {
    setSaving(true);
    try {
      await api.patch('/users/technician/status', {
        isAvailable,
        siteLocation
      });
      alert('Status updated successfully');
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  const updateTaskStatus = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/maintenance/${id}`, { status: newStatus });
      const { data } = await api.get('/maintenance');
      const assignedTasks = data.filter((task: any) => 
        task.technician?._id === user._id || task.technician === user._id
      );
      setTasks(assignedTasks.filter((t: any) => t.status !== 'completed'));
    } catch (err) {
      console.error('Error updating task status:', err);
      alert('Failed to update task status');
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'pending': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'in-progress': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'not complete':
      case 'cancelled': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'scheduled': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };



  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Wrench className="text-blue-500" size={32} />
          Technician Overview
        </h1>
        <p className="text-slate-400 mt-2">Manage your availability and view your current assignments.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl h-fit">
          <h2 className="text-xl font-bold text-white mb-6">Current Status</h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl border border-slate-800">
              <div>
                <p className="font-semibold text-white">Availability</p>
                <p className="text-sm text-slate-400">Accepting new requests</p>
              </div>
              <button 
                onClick={() => setIsAvailable(!isAvailable)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
                  isAvailable ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20' 
                              : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                }`}
              >
                {isAvailable ? <><CheckCircle2 size={18} /> Available</> : <><XCircle size={18} /> Unavailable</>}
              </button>
            </div>

            <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 space-y-3">
              <p className="font-semibold text-white">Site / Location</p>
              <select 
                value={siteLocation}
                onChange={(e) => setSiteLocation(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none"
              >
                <option value="Unassigned">Unassigned</option>
                {allLocations.map((loc: string) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
              <p className="text-xs text-slate-500">Choosing from all registered facility locations.</p>
            </div>

            <button 
              onClick={handleUpdateStatus}
              disabled={saving}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Update Status'}
            </button>
          </div>
        </div>

        {/* Tasks View Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col h-fit max-h-[500px]">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center justify-between">
            Pending Assignments
            <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">{tasks.length} Active</span>
          </h2>
          
          <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-2">
            {tasks.length === 0 ? (
              <div className="text-center py-10 bg-slate-950/50 rounded-xl border border-dashed border-slate-700">
                <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-3" />
                <p className="text-slate-300 font-medium">All caught up!</p>
                <p className="text-xs text-slate-500 mt-1">No pending maintenance.</p>
              </div>
            ) : (
              tasks.map(task => (
                <div key={task._id} className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
                  <p className="font-bold text-white mb-1">{task.maintenanceType || 'Routine Maintenance'}</p>
                  <p className="text-sm text-slate-400 mb-3">
                    {task.machine?.name || 'Unknown Machine'}
                    {task.machine?.location && ` • ${task.machine.location}`}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold bg-slate-800 text-slate-300 px-2.5 py-1 rounded border border-slate-700">
                      {new Date(task.scheduledDate).toLocaleDateString()}
                    </span>
                    {task.status === 'scheduled' ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border text-purple-400 bg-purple-400/10 border-purple-400/20">
                          Scheduled
                        </span>
                        <button 
                          onClick={() => updateTaskStatus(task._id, 'in-progress')}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-all shadow-lg active:scale-95"
                        >
                          Accept
                        </button>
                      </div>
                    ) : (
                      <select 
                        value={task.status}
                        onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider outline-none cursor-pointer appearance-none text-center shadow-lg transition-colors border ${getStatusStyles(task.status)}`}
                      >
                        <option value="pending" className="bg-slate-900 text-orange-400">Pending</option>
                        <option value="in-progress" className="bg-slate-900 text-blue-400">In Progress</option>
                        <option value="completed" className="bg-slate-900 text-emerald-400">Completed</option>
                        <option value="not complete" className="bg-slate-900 text-red-400">Not Complete</option>
                      </select>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
