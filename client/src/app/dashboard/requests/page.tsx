'use client';
import { useState, useEffect } from 'react';
import api from '@/services/api';
import { 
  Calendar, 
  Wrench, 
  User as UserIcon, 
  Activity, 
  AlertTriangle,
  ClipboardList,
  CheckCircle2
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { useForm } from 'react-hook-form';

export default function RequestsPage() {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [taskToAssign, setTaskToAssign] = useState<any>(null);

  const { register: assignReg, handleSubmit: handleAssignSubmit, reset: assignReset, formState: { errors: assignErrs, isSubmitting: isAssigning } } = useForm();

  const fetchMaintenance = async () => {
    try {
      const { data } = await api.get('/maintenance');
      // Only keep 'requested' status tasks
      const requestedTasks = data.filter((task: any) => task.status === 'requested');
      
      // Sort newest requests first
      requestedTasks.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setTasks(requestedTasks);
    } catch (err) {
      console.error('Error fetching maintenance requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchResources = async () => {
    try {
      const { data } = await api.get('/users/technicians');
      setTechnicians(data);
    } catch (err) {
      console.error('Error fetching technicians:', err);
    }
  };

  useEffect(() => {
    fetchMaintenance();
    fetchResources();
  }, []);

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

  if (loading) return <div className="p-8 text-slate-400">Loading requests inbox...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <ClipboardList className="text-blue-500" size={32} />
            Client Requests
          </h1>
          <p className="text-slate-400 mt-1">Inbox for incoming maintenance requests from clients.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {tasks.map((task) => (
          <div key={task._id} className="p-6 bg-slate-900 border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)] rounded-2xl hover:border-blue-500 transition-all">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Wrench className="text-blue-400" size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white capitalize">{task.maintenanceType || 'Routine Maintenance'}</h3>
                      <p className="text-sm text-slate-400"><span className="text-slate-500">Machine:</span> {task.machine?.name || 'Unknown'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-xl border border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg text-blue-400 bg-blue-400/10 border border-blue-400/20">
                      Requested
                    </span>
                    <button 
                      onClick={() => openAssignModal(task)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center gap-2"
                    >
                      Assign Technician
                    </button>
                  </div>
                </div>

                {task.notes && (
                  <div className="text-sm text-slate-300 bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-500 font-semibold mb-1 block">Client Notes:</span>
                    "{task.notes}"
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar size={16} />
                    <span className="text-sm">Submitted: {new Date(task.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Activity size={16} />
                    <span className="text-sm capitalize">Priority: Initial Assessment Needed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
            <CheckCircle2 className="mx-auto text-blue-500 mb-4" size={48} />
            <h3 className="text-xl font-bold text-slate-300 mb-1">Inbox Zero</h3>
            <p className="text-slate-500">There are currently no pending maintenance requests from clients.</p>
          </div>
        )}
      </div>

      {/* Assign Modal */}
      <Modal 
        isOpen={isAssignModalOpen} 
        onClose={() => { setIsAssignModalOpen(false); setTaskToAssign(null); assignReset(); }} 
        title="Assign Technician"
      >
        <form onSubmit={handleAssignSubmit(onAssignSubmit)} className="space-y-4">
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl mb-4">
            <h4 className="font-bold text-white capitalize">{taskToAssign?.maintenanceType}</h4>
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
              {technicians.map(t => <option key={t._id} value={t._id}>{t.username} {t.isAvailable ? '(Available)' : '(Busy)'}</option>)}
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
            {isAssigning ? 'Assigning & Routing...' : 'Confirm Assignment'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
