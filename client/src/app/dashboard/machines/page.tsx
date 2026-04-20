'use client';
import { useState, useEffect } from 'react';
import api from '@/services/api';
import { 
  Activity, 
  Search, 
  Plus, 
  MapPin, 
  Calendar, 
  MoreVertical,
  ChevronRight,
  Filter,
  Trash2
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { useForm } from 'react-hook-form';

export default function MachinesPage() {
  const [loading, setLoading] = useState(true);
  const [machines, setMachines] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const fetchMachines = async () => {
    try {
      const { data } = await api.get('/machines');
      setMachines(data);
    } catch (err) {
      console.error('Error fetching machines:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  const onSubmit = async (data: any) => {
    try {
      await api.post('/machines', data);
      setIsModalOpen(false);
      reset();
      fetchMachines();
    } catch (err) {
      console.error('Error creating machine:', err);
      alert('Failed to create machine');
    }
  };

  const handleDeleteMachine = async (id: string, name: string) => {

    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await api.delete(`/machines/${id}`);
        fetchMachines();
      } catch (err) {
        console.error('Error deleting machine:', err);
        alert('Failed to delete machine');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'idle': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'reserved': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'maintenance': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      case 'down': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const filteredMachines = machines.filter(m => 
    (m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     m.model.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterStatus === 'all' || m.status === filterStatus)
  );

  if (loading) return <div className="p-8">Loading machines...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Machine Monitoring</h1>
          <p className="text-slate-400 mt-1">Track status and location of all heavy equipment.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-lg shadow-blue-500/20"
        >
          <Plus size={18} />
          <span>Add Machine</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text"
            placeholder="Search by name or model..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select 
            className="px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="maintenance">Maintenance</option>
            <option value="down">Down</option>
          </select>
          <button className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all">
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredMachines.map((machine) => (
          <div key={machine._id} className="group relative p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-blue-500/50 transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(machine.status)} capitalize`}>
                {machine.status}
              </div>
              <button 
                onClick={() => handleDeleteMachine(machine._id, machine.name)}
                className="text-slate-500 hover:text-red-500 transition-all p-1 bg-slate-800/50 rounded-lg"
                title="Delete Machine"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{machine.name}</h3>
              <p className="text-sm text-slate-500 mt-0.5">{machine.model}</p>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-slate-400">
                <MapPin size={16} />
                <span className="text-sm">{machine.location}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <Calendar size={16} />
                <span className="text-sm">Last Service: {machine.lastMaintenanceDate ? new Date(machine.lastMaintenanceDate).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-800 flex items-center justify-between">
              <button className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
                View Details
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Add New Machine"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300">Machine Name</label>
            <input 
              {...register('name', { required: 'Name is required' })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. Excavator EX-300"
            />
            {errors.name && <p className="text-xs text-red-400">{errors.name.message as string}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300">Model</label>
            <input 
              {...register('model', { required: 'Model is required' })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. Hitachi EX300-5"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300">Serial Number</label>
            <input 
              {...register('serialNumber', { required: 'Serial is required' })}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. HIT789456"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300">Location</label>
            <input 
              {...register('location')}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. Site A"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300">Purchase Date</label>
            <input 
              type="date"
              {...register('purchaseDate')}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <button 
            disabled={isSubmitting}
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl mt-4 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Adding...' : 'Add Machine'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
