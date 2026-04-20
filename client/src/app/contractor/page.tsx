'use client';
import { useState, useEffect } from 'react';
import api from '@/services/api';
import { 
  Activity, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import Link from 'next/link';

export default function ContractorDashboard() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await api.get('/lending/my-requests');
        setRequests(data);
      } catch (err) {
        console.error('Error fetching dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const activeRequests = requests.filter(r => r.status === 'active');
  const pendingRequests = requests.filter(r => ['pending', 'approved', 'pending_payment'].includes(r.status));

  if (loading) return (
    <div className="flex flex-col items-center justify-center pt-32 h-full">
      <div className="w-16 h-16 border-4 border-slate-800 border-t-blue-500 rounded-full animate-spin mb-6"></div>
      <p className="text-blue-400 font-bold tracking-[0.2em] text-xs uppercase animate-pulse">Establishing Contractor Uplink...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero Section */}
      <div className="relative p-8 md:p-12 bg-slate-900 rounded-[2.5rem] border border-slate-800 overflow-hidden group">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.pexels.com/photos/1230630/pexels-photo-1230630.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
            alt="Construction Site"
            className="w-full h-full object-cover opacity-30 transition-all duration-1000 group-hover:scale-105 group-hover:opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-6 backdrop-blur-md">
            <ShieldCheck size={12} /> Contractor Authority: Certified
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none mb-6 italic">
            FLEET <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 underline decoration-blue-500/30">MANAGEMENT</span>
          </h1>
          <p className="text-lg text-slate-200 font-medium max-w-md leading-relaxed mb-8">
            Monitor your leased heavy machinery and manage site deployments in real-time.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link 
              href="/contractor/machines"
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
            >
              Request New Machine <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={Zap} 
          label="Active Fleet" 
          value={activeRequests.length} 
          color="text-blue-400" 
          bg="bg-blue-400/10"
        />
        <StatCard 
          icon={Clock} 
          label="Pending Requests" 
          value={pendingRequests.length} 
          color="text-orange-400" 
          bg="bg-orange-400/10"
        />
        <StatCard 
          icon={TrendingUp} 
          label="Total Leases" 
          value={requests.length} 
          color="text-emerald-400" 
          bg="bg-emerald-400/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
        {/* Active Machines */}
        <div className="p-8 bg-slate-900 border border-slate-800 rounded-[2.5rem]">
          <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg"><Activity className="text-blue-400" size={18} /></div>
            Active Deployments
          </h2>
          <div className="space-y-4">
            {activeRequests.length > 0 ? (
              activeRequests.map((req) => (
                <div key={req._id} className="p-5 bg-slate-950/50 rounded-2xl border border-slate-800 flex items-center justify-between group hover:border-slate-700 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-blue-400 font-bold border border-slate-700">
                      <Activity size={24} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{req.machine?.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin size={12} className="text-slate-500" />
                        <span className="text-xs text-slate-400 font-medium">{req.siteLocation}</span>
                      </div>
                    </div>
                  </div>
                  <Link href="/contractor/history" className="p-2 text-slate-500 group-hover:text-white transition-colors">
                    <ArrowRight size={20} />
                  </Link>
                </div>
              ))
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <CheckCircle2 size={48} className="text-slate-800 mb-4" />
                <p className="text-slate-500 font-medium italic">No active machines currently deployed.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity / Pending Payments */}
        <div className="p-8 bg-slate-900 border border-slate-800 rounded-[2.5rem]">
          <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-lg"><Clock className="text-orange-400" size={18} /></div>
            Action Required
          </h2>
          <div className="space-y-4">
            {requests.some(r => r.status === 'approved' || r.status === 'pending_payment') ? (
              requests.filter(r => r.status === 'approved' || r.status === 'pending_payment').map((req) => (
                <div key={req._id} className="p-5 bg-orange-500/5 rounded-2xl border border-orange-500/20 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400">
                        <AlertTriangle size={18} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">Payment Pending</h3>
                        <p className="text-xs text-slate-500">{req.machine?.name}</p>
                      </div>
                    </div>
                    <Link 
                      href="/contractor/history"
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all"
                    >
                      Pay Now
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <ShieldCheck size={48} className="text-slate-800 mb-4" />
                <p className="text-slate-500 font-medium italic">No pending actions required.</p>
              </div>
            )}
          </div>
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
      </div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-3xl font-black text-white italic">{value}</h3>
    </div>
  );
}
