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
  BarChart,
  PieChart as PieChartIcon,
  AlertTriangle
} from 'lucide-react';
import { 
  BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import Modal from '@/components/ui/Modal';
import { useForm } from 'react-hook-form';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<any[]>([]);
  const [workloadData, setWorkloadData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const { data } = await api.get('/maintenance');
        setTasks(data);
        
        // Process data for charts
        const workload = data.reduce((acc: any, task: any) => {
          const tech = task.technician?.username || 'Unassigned';
          acc[tech] = (acc[tech] || 0) + 1;
          return acc;
        }, {});
        
        setWorkloadData(Object.entries(workload).map(([name, value]) => ({ name, value })));

        const statuses = data.reduce((acc: any, task: any) => {
          const status = task.status || 'Pending';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {});
        
        setStatusData(Object.entries(statuses).map(([name, value]) => ({ name, value })));
      } catch (err) {
        console.error('Error fetching reports:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center pt-32 h-full">
      <div className="w-16 h-16 border-4 border-slate-800 border-t-purple-500 rounded-full animate-spin mb-6"></div>
      <p className="text-purple-400 font-bold tracking-[0.2em] text-xs uppercase animate-pulse">Aggregating System Logs...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div>
        <h1 className="text-3xl font-black text-white italic">Maintenance Insights</h1>
        <p className="text-slate-400 mt-1 font-medium">Real-time analytical breakdown of machine service workload.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Workload by Technician */}
        <div className="p-8 bg-slate-900 border border-slate-800 rounded-[2.5rem]">
          <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg"><UserIcon className="text-blue-400" size={18} /></div>
            Technician Task Distribution
          </h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={workloadData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="p-8 bg-slate-900 border border-slate-800 rounded-[2.5rem]">
          <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg"><Activity className="text-emerald-400" size={18} /></div>
            Maintenance Health Status
          </h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Raw Data Table */}
      <div className="bg-[#0A101D] border border-slate-800 rounded-[2.5rem] overflow-hidden">
        <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white italic">Detailed Record Log</h3>
          <span className="text-xs bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">{tasks.length} Total Tasks</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold tracking-widest text-slate-500 uppercase">Machine</th>
                <th className="px-6 py-4 text-xs font-bold tracking-widest text-slate-500 uppercase">Service</th>
                <th className="px-6 py-4 text-xs font-bold tracking-widest text-slate-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-bold tracking-widest text-slate-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {tasks.map((task) => (
                <tr key={task._id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-200">{task.machine?.name || 'N/A'}</p>
                    <p className="text-[10px] text-slate-500">{task.machine?.model}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-400 font-medium">{task.maintenanceType}</span>
                  </td>
                  <td className="px-6 py-4">
                     <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter ${
                       task.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                       task.status === 'pending' ? 'bg-orange-500/10 text-orange-400' :
                       'bg-slate-800 text-slate-400'
                     }`}>
                       {task.status}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs font-mono">
                    {new Date(task.scheduledDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
