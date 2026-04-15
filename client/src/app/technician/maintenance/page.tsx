'use client';
import { useState, useEffect } from 'react';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { 
  Calendar, 
  Wrench, 
  User as UserIcon, 
  Activity, 
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function TechnicianMaintenancePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<any[]>([]);

  const fetchMaintenance = async () => {
    try {
      const { data } = await api.get('/maintenance');
      // Filter tasks to only show those assigned to this technician
      const assignedTasks = data.filter((task: any) => 
        task.technician?._id === user?._id || task.technician === user?._id
      );
      setTasks(assignedTasks);
    } catch (err) {
      console.error('Error fetching maintenance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMaintenance();
    }
  }, [user]);

  const updateTaskStatus = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/maintenance/${id}`, { status: newStatus });
      fetchMaintenance();
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

  if (loading) return <div className="p-8">Loading assigned tasks...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white">My Maintenance Tasks</h1>
        <p className="text-slate-400 mt-1">Manage equipment service requests assigned to you.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {tasks.map((task) => (
          <div key={task._id} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Wrench className="text-blue-400" size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{task.maintenanceType || 'Routine Maintenance'}</h3>
                      <p className="text-sm text-slate-400">
                        {task.machine?.name || 'Unknown Machine'}
                        {task.machine?.location && ` • ${task.machine.location}`}
                      </p>
                    </div>
                  </div>
                  {task.status === 'scheduled' ? (
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full text-purple-400 bg-purple-400/10 border border-purple-400/20 shadow-lg">
                        Scheduled
                      </span>
                      <button 
                        onClick={() => updateTaskStatus(task._id, 'in-progress')}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg active:scale-95"
                      >
                        Accept Task
                      </button>
                    </div>
                  ) : (
                    <select 
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border uppercase tracking-wider outline-none cursor-pointer appearance-none text-center shadow-lg transition-colors ${getStatusStyles(task.status)}`}
                    >
                      <option value="pending" className="bg-slate-900 text-orange-400">Pending</option>
                      <option value="in-progress" className="bg-slate-900 text-blue-400">In Progress</option>
                      <option value="completed" className="bg-slate-900 text-emerald-400">Completed</option>
                      <option value="not complete" className="bg-slate-900 text-red-400">Not Complete</option>
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar size={16} />
                    <span className="text-sm">{new Date(task.scheduledDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <UserIcon size={16} />
                    <span className="text-sm">Assigned Options</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Activity size={16} />
                    <span className="text-sm capitalize">Priority: {task.priority || 'Medium'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-2xl">
            <CheckCircle2 className="mx-auto text-emerald-500 mb-4" size={48} />
            <h3 className="text-xl font-bold text-white mb-2">No assigned tasks!</h3>
            <p className="text-slate-400">You currently have no pending maintenance requests.</p>
          </div>
        )}
      </div>
    </div>
  );
}
