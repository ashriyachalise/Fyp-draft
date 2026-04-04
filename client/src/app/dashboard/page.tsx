'use client';
import { useState, useEffect } from 'react';
import api from '@/services/api';
import { 
  Activity, 
  Box, 
  Wrench, 
  Clock, 
  ArrowUpRight, 
  AlertTriangle,
  Settings,
  Shield,
  Zap
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area
} from 'recharts';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/stats');
        setStats(data);
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center pt-32 h-full">
      <div className="w-16 h-16 border-4 border-slate-800 border-t-blue-500 rounded-full animate-spin mb-6"></div>
      <p className="text-blue-400 font-bold tracking-[0.2em] text-xs uppercase animate-pulse">Syncing Machinery Core...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* App Header & Hero Section */}
      <div className="relative p-8 md:p-12 bg-slate-900 rounded-[2.5rem] border border-slate-800 overflow-hidden group">
        <div className="absolute inset-0 z-0">
          <img 
            src="/bulldozer.png" 
            alt="Bulldozer Heavy Machinery"
            className="w-full h-full object-cover opacity-60 transition-all duration-1000 group-hover:scale-105 group-hover:opacity-100"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.pexels.com/photos/2091374/pexels-photo-2091374.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-6 backdrop-blur-md">
            <Shield size={12} /> System Status: Operational
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none mb-6 italic">
            POWERING <br/> THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 underline decoration-blue-500/30">FRONT LINE</span>
          </h1>
          <p className="text-lg text-slate-200 font-medium max-w-md leading-relaxed mb-8">
            Real-time telemetry and predictive maintenance for your heavy equipment fleet.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="bg-slate-950/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800 flex items-center gap-4">
              <div className="p-3 bg-blue-500 rounded-xl shadow-lg shadow-blue-500/20">
                <Zap size={20} className="text-white" />
              </div>
              <div>
                <p className="text-2xl font-black text-white">{stats?.systemUptime || '99.9'}%</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter text-center">System Uptime</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Activity} 
          label="Active Fleet" 
          value={stats?.activeMachines || 0} 
          color="text-blue-400" 
          bg="bg-blue-400/10"
        />
        <StatCard 
          icon={Box} 
          label="Low Stock Alert" 
          value={stats?.lowStockParts || 0} 
          color="text-orange-400" 
          bg="bg-orange-400/10"
        />
        <StatCard 
          icon={Wrench} 
          label="Pending Maintenance" 
          value={stats?.pendingMaintenance || 0} 
          color="text-purple-400" 
          bg="bg-purple-400/10"
        />
        <StatCard 
          icon={Clock} 
          label="Avg Reponse Time" 
          value="45m" 
          color="text-emerald-400" 
          bg="bg-emerald-400/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
        <div className="lg:col-span-2 p-8 bg-slate-900 border border-slate-800 rounded-[2.5rem]">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg"><Activity className="text-blue-400" size={18} /></div>
              Weekly Machine Workload
            </h2>
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <div className="w-3 h-3 rounded-full bg-slate-800"></div>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.weeklyUsage || []}>
                <defs>
                  <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="hours" 
                  stroke="#3b82f6" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorUsage)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-8 bg-slate-900 border border-slate-800 rounded-[2.5rem]">
          <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3 italic">
            <div className="p-2 bg-slate-800 rounded-lg"><Settings className="text-slate-400" size={18} /></div>
            Quick Dashboard Alert
          </h2>
          <div className="space-y-4">
            {stats?.recentNotifications?.length > 0 ? (
              stats.recentNotifications.map((notif: any) => (
                <div key={notif._id} className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800 flex items-start gap-4">
                  <div className={`p-2 rounded-lg shrink-0 ${notif.type === 'maintenance_due' ? 'bg-red-400/10 text-red-400' : 'bg-blue-400/10 text-blue-400'}`}>
                    <AlertTriangle size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{notif.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{notif.message}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 italic text-center py-10">No recent alerts found.</p>
            )}
          </div>
          <button className="w-full mt-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-2xl transition-all uppercase tracking-widest">
            Audit Activity Log
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bg }: any) {
  return (
    <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl hover:border-slate-700 transition-all relative overflow-hidden group">
      <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-current to-transparent opacity-50 ${color}`}></div>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${bg} ${color} transition-transform group-hover:scale-110`}>
          <Icon size={24} />
        </div>
        <ArrowUpRight className="text-slate-700" size={20} />
      </div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-3xl font-black text-white italic">{value}</h3>
    </div>
  );
}
