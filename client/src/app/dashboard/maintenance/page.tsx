'use client';
import { useState, useEffect } from 'react';
import api from '@/services/api';
import { 
  Calendar, 
  Clock, 
  Wrench, 
  User as UserIcon, 
  Activity, 
  Plus,
  CheckCircle2,
  AlertTriangle,
  MoreVertical
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { useForm } from 'react-hook-form';

export default function MaintenancePage() {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [machines, setMachines] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [taskToAssign, setTaskToAssign] = useState<any>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
  const { register: assignReg, handleSubmit: handleAssignSubmit, reset: assignReset, formState: { errors: assignErrs, isSubmitting: isAssigning } } = useForm();

  const fetchMaintenance = async () => {
    try {
      const { data } = await api.get('/maintenance');
      setTasks(data);
    } catch (err) {
      console.error('Error fetching maintenance:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchResources = async () => {
    try {
      const [mRes, tRes] = await Promise.all([
        api.get('/machines'),
        api.get('/users/technicians')
      ]);
      setMachines(mRes.data);
      setTechnicians(tRes.data);
    } catch (err) {
      console.error('Error fetching maintenance resources:', err);
    }
  };

  useEffect(() => {
    fetchMaintenance();
    fetchResources();
  }, []);

  const onSubmit = async (data: any) => {
    try {
      await api.post('/maintenance', data);
      setIsModalOpen(false);
      reset();
      fetchMaintenance();
    } catch (err) {
      console.error('Error scheduling maintenance:', err);
      alert('Failed to schedule task');
    }
  };

  const updateTaskStatus = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/maintenance/${id}`, { status: newStatus });
      fetchMaintenance();
    } catch (err) {
      console.error('Error updating task status:', err);
      alert('Failed to update task status');
    }
  };

  const onAssignSubmit = async (data: any) => {
    try {
      await api.patch(`/maintenance/${taskToAssign._id}`, {
        status: 'scheduled',
        technician: data.technician,
        scheduledDate: data.scheduledDate
      });
      setIsAssignModalOpen(false);
      setTaskToAssign(null);
      assignReset();
      fetchMaintenance();
    } catch (err) {
      console.error('Error assigning task:', err);
      alert('Failed to assign task');
    }
  };

  const openAssignModal = (task: any) => {
    setTaskToAssign(task);
    setIsAssignModalOpen(true);
  };

  const getStatusStyles = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'pending': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'in-progress': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'not complete':
      case 'cancelled': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'scheduled': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      case 'requested': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  if (loading) return <div className="p-8">Loading maintenance schedule...</div>;

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.status === 'requested' && b.status !== 'requested') return -1;
    if (a.status !== 'requested' && b.status === 'requested') return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Maintenance Schedule</h1>
          <p className="text-slate-400 mt-1">Manage and track equipment service tasks.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-lg shadow-blue-500/20"
        >
          <Plus size={18} />
          <span>Schedule Task</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {sortedTasks.map((task) => (
          <div key={task._id} className={`p-6 bg-slate-900 border ${task.status === 'requested' ? 'border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'border-slate-800'} rounded-2xl hover:border-slate-700 transition-all`}>
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Wrench className="text-blue-400" size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{task.maintenanceType || 'Routine Maintenance'}</h3>
                      <p className="text-sm text-slate-400">{task.machine?.name || 'Unknown Machine'}</p>
                    </div>
                  </div>
                  
                  {task.status === 'requested' ? (
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full text-blue-400 bg-blue-400/10 border border-blue-400/20 shadow-lg">
                        Requested
                      </span>
                      <button 
                        onClick={() => openAssignModal(task)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg active:scale-95 flex items-center gap-2"
                      >
                        Assign Technician
                      </button>
                    </div>
                  ) : (
                    <select 
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border uppercase tracking-wider outline-none cursor-pointer appearance-none text-center shadow-lg transition-colors ${getStatusStyles(task.status)}`}
                    >
                      <option value="scheduled" className="bg-slate-900 text-purple-400">Scheduled</option>
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
                    <span className="text-sm">{task.scheduledDate ? new Date(task.scheduledDate).toLocaleDateString() : 'Unscheduled'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <UserIcon size={16} />
                    <span className="text-sm">{task.technician?.username || 'Unassigned'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Activity size={16} />
                    <span className="text-sm capitalize">Priority: {task.priority || 'Medium'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 lg:border-l lg:border-slate-800 lg:pl-6">
                <button className="p-2 text-slate-500 hover:text-white transition-colors bg-slate-800 rounded-lg">
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
            <AlertTriangle className="mx-auto text-slate-600 mb-4" size={48} />
            <h3 className="text-lg font-medium text-slate-300">No tasks found</h3>
            <p className="text-slate-500">Great! All machines are currently in optimal condition.</p>
          </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Schedule Maintenance"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300">Target Machine</label>
            <select 
              {...register('machine', { required: 'Target Machine is required to proceed' })}
              className={`w-full px-4 py-2 bg-slate-800 border ${errors.machine ? 'border-red-500' : 'border-slate-700'} rounded-xl text-white outline-none focus:border-blue-500 transition-colors`}
            >
              <option value="">{machines.length === 0 ? 'No Machines (Add one to Inventory first)' : 'Select Machine'}</option>
              {machines.map(m => <option key={m._id} value={m._id}>{m.name} ({m.model})</option>)}
            </select>
            {errors.machine && <p className="text-red-400 text-xs mt-1 pl-1 flex items-center gap-1"><AlertTriangle size={12}/> {errors.machine.message as string}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300">Technician</label>
            <select 
              {...register('technician', { required: 'Technician assignment is required' })}
              className={`w-full px-4 py-2 bg-slate-800 border ${errors.technician ? 'border-red-500' : 'border-slate-700'} rounded-xl text-white outline-none focus:border-blue-500 transition-colors`}
            >
              <option value="">{technicians.length === 0 ? 'No Technicians Available' : 'Select Technician'}</option>
              {technicians.map(t => <option key={t._id} value={t._id}>{t.username}</option>)}
            </select>
             {errors.technician && <p className="text-red-400 text-xs mt-1 pl-1 flex items-center gap-1"><AlertTriangle size={12}/> {errors.technician.message as string}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300">Maintenance Type</label>
            <input 
              {...register('maintenanceType', { required: 'Task designation is required' })}
              placeholder="e.g. Engine Overhaul"
              className={`w-full px-4 py-2 bg-slate-800 border ${errors.maintenanceType ? 'border-red-500' : 'border-slate-700'} rounded-xl text-white outline-none focus:border-blue-500 transition-colors`}
            />
            {errors.maintenanceType && <p className="text-red-400 text-xs mt-1 pl-1 flex items-center gap-1"><AlertTriangle size={12}/> {errors.maintenanceType.message as string}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300">Scheduled Date</label>
            <input 
              type="date"
              {...register('scheduledDate', { required: 'Scheduling date is required' })}
              className={`w-full px-4 py-2 bg-slate-800 border ${errors.scheduledDate ? 'border-red-500' : 'border-slate-700'} rounded-xl text-white outline-none focus:border-blue-500 transition-colors`}
            />
            {errors.scheduledDate && <p className="text-red-400 text-xs mt-1 pl-1 flex items-center gap-1"><AlertTriangle size={12}/> {errors.scheduledDate.message as string}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300">Notes</label>
            <textarea 
              {...register('notes')}
              rows={3}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none"
            />
          </div>
          <button 
            disabled={isSubmitting}
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl mt-4 transition-all"
          >
            {isSubmitting ? 'Scheduling...' : 'Schedule Task'}
          </button>
        </form>
      </Modal>

      {/* Assign Modal */}
      <Modal 
        isOpen={isAssignModalOpen} 
        onClose={() => { setIsAssignModalOpen(false); setTaskToAssign(null); assignReset(); }} 
        title="Assign Technician"
      >
        <form onSubmit={handleAssignSubmit(onAssignSubmit)} className="space-y-4">
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl mb-4">
            <h4 className="font-bold text-white">{taskToAssign?.maintenanceType}</h4>
            <p className="text-sm text-slate-400 mt-1"><span className="text-slate-500">Machine:</span> {taskToAssign?.machine?.name}</p>
            {taskToAssign?.notes && <p className="text-sm text-slate-400 mt-2 bg-slate-950 p-2 rounded-lg border border-slate-800">"{taskToAssign.notes}"</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300">Assign to Technician</label>
            <select 
              {...assignReg('technician', { required: 'Technician assignment is required' })}
              className={`w-full px-4 py-2 bg-slate-800 border ${assignErrs.technician ? 'border-red-500' : 'border-slate-700'} rounded-xl text-white outline-none focus:border-blue-500 transition-colors`}
            >
              <option value="">{technicians.length === 0 ? 'No Technicians Available' : 'Select Technician'}</option>
              {technicians.map(t => <option key={t._id} value={t._id}>{t.username}</option>)}
            </select>
            {assignErrs.technician && <p className="text-red-400 text-xs mt-1 pl-1 flex items-center gap-1"><AlertTriangle size={12}/> {assignErrs.technician.message as string}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300">Set Date</label>
            <input 
              type="date"
              {...assignReg('scheduledDate', { required: 'Scheduling date is required' })}
              className={`w-full px-4 py-2 bg-slate-800 border ${assignErrs.scheduledDate ? 'border-red-500' : 'border-slate-700'} rounded-xl text-white outline-none focus:border-blue-500 transition-colors`}
            />
            {assignErrs.scheduledDate && <p className="text-red-400 text-xs mt-1 pl-1 flex items-center gap-1"><AlertTriangle size={12}/> {assignErrs.scheduledDate.message as string}</p>}
          </div>

          <button 
            disabled={isAssigning}
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl mt-4 transition-all"
          >
            {isAssigning ? 'Assigning...' : 'Confirm Assignment'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
