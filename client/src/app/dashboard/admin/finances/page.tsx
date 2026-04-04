'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { 
  DollarSign, 
  TrendingUp, 
  Box, 
  CreditCard,
  ArrowUpRight,
  Shield,
  Activity
} from 'lucide-react';

export default function AdminFinancesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [parts, setParts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      // Still loading auth state, do nothing yet
      return;
    }

    if (!user || user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    const fetchData = async () => {
      try {
        const [partsRes, ordersRes] = await Promise.all([
          api.get('/inventory'),
          api.get('/orders/all')
        ]);
        setParts(partsRes.data);
        setOrders(ordersRes.data);
      } catch (err) {
        console.error('Error fetching admin finances data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalInventoryValue = parts.reduce((acc, part) => acc + ((part.price || 0) * (part.quantityInStock || 0)), 0);
  const totalRevenue = orders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);

  if (loading) return (
    <div className="flex flex-col items-center justify-center pt-32 h-full">
      <div className="w-16 h-16 border-4 border-slate-800 border-t-emerald-500 rounded-full animate-spin mb-6"></div>
      <p className="text-emerald-400 font-bold tracking-[0.2em] text-xs uppercase animate-pulse">Decrypting Financial Ledgers...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4 mt-2">
          <Shield size={14} /> Level 4 Clearance
        </div>
        <h1 className="text-3xl font-black text-white bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">Financial Overview</h1>
        <p className="text-slate-400 mt-1 font-medium">Global payment ledgers and active inventory asset valuation.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue Card */}
        <div className="p-8 bg-slate-900 border border-emerald-500/20 rounded-[2rem] shadow-[0_0_30px_rgba(16,185,129,0.05)] relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-[50px] group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-emerald-400 font-bold tracking-widest text-xs uppercase mb-2 flex items-center gap-2"><CreditCard size={16} /> Total Revenue Stream</p>
              <h2 className="text-5xl font-black text-white">Rs. {totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
            </div>
            <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400">
              <TrendingUp size={32} />
            </div>
          </div>
          <div className="mt-8 flex items-center gap-2 text-sm text-slate-400 relative z-10">
            <ArrowUpRight size={16} className="text-emerald-500" /> +{orders.length} Processed Transactions
          </div>
        </div>

        {/* Asset Card */}
        <div className="p-8 bg-slate-900 border border-cyan-500/20 rounded-[2rem] shadow-[0_0_30px_rgba(6,182,212,0.05)] relative overflow-hidden group hover:border-cyan-500/40 transition-all">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-[50px] group-hover:bg-cyan-500/20 transition-all"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-cyan-400 font-bold tracking-widest text-xs uppercase mb-2 flex items-center gap-2"><Box size={16} /> Total Asset Valuation</p>
              <h2 className="text-5xl font-black text-white">Rs. {totalInventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
            </div>
            <div className="p-4 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 text-cyan-400">
              <DollarSign size={32} />
            </div>
          </div>
          <div className="mt-8 flex items-center gap-2 text-sm text-slate-400 relative z-10">
            <Activity size={16} className="text-cyan-500" /> Tracing {parts.length} unique SKUs
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Payment Ledger */}
        <div className="bg-[#0A101D] border border-slate-800 rounded-[2rem] overflow-hidden flex flex-col h-[500px]">
          <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center shrink-0">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <CreditCard size={18} className="text-emerald-400" /> Global Payment Ledger
            </h3>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">{orders.length} Records</span>
          </div>
          <div className="overflow-y-auto custom-scrollbar flex-1 p-2">
            <table className="w-full text-left border-separate border-spacing-y-2 px-4">
              <thead>
                <tr>
                  <th className="pb-2 text-xs font-bold tracking-widest text-slate-500 uppercase">Purchaser</th>
                  <th className="pb-2 text-xs font-bold tracking-widest text-slate-500 uppercase">Amount</th>
                  <th className="pb-2 text-xs font-bold tracking-widest text-slate-500 uppercase text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="group">
                    <td className="py-4 px-4 bg-slate-900/50 group-hover:bg-slate-800 rounded-l-xl transition-colors">
                      <p className="font-bold text-slate-200 text-sm">{order.user?.username || 'Guest/Deleted'}</p>
                      <p className="text-[10px] text-slate-500 font-mono tracking-wider">{order.paymentId}</p>
                    </td>
                    <td className="py-4 px-4 bg-slate-900/50 group-hover:bg-slate-800 transition-colors">
                      <span className="text-emerald-400 font-black text-sm">Rs. {order.totalAmount?.toFixed(2)}</span>
                    </td>
                    <td className="py-4 px-4 bg-slate-900/50 group-hover:bg-slate-800 rounded-r-xl transition-colors text-right">
                      <span className="text-xs text-slate-400 font-medium">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-10 text-center text-slate-500">No transactions recorded.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stock Ledger */}
        <div className="bg-[#0A101D] border border-slate-800 rounded-[2rem] overflow-hidden flex flex-col h-[500px]">
          <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center shrink-0">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Box size={18} className="text-cyan-400" /> System Asset Stock
            </h3>
          </div>
          <div className="overflow-y-auto custom-scrollbar flex-1 p-2">
            <table className="w-full text-left border-separate border-spacing-y-2 px-4">
              <thead>
                <tr>
                  <th className="pb-2 text-xs font-bold tracking-widest text-slate-500 uppercase">Component</th>
                  <th className="pb-2 text-xs font-bold tracking-widest text-slate-500 uppercase">Stock</th>
                  <th className="pb-2 text-xs font-bold tracking-widest text-slate-500 uppercase text-right">Total Value</th>
                </tr>
              </thead>
              <tbody>
                {parts.map((p) => (
                  <tr key={p._id} className="group">
                    <td className="py-4 px-4 bg-slate-900/50 group-hover:bg-slate-800 rounded-l-xl transition-colors">
                      <p className="font-bold text-slate-200 text-sm">{p.name}</p>
                      <p className="text-[10px] text-slate-500 uppercase">{p.category}</p>
                    </td>
                    <td className="py-4 px-4 bg-slate-900/50 group-hover:bg-slate-800 transition-colors">
                       <span className={`text-xs font-black px-2 py-1 rounded-md ${p.quantityInStock <= (p.minimumStockLevel || 5) ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-slate-800 text-slate-300'}`}>{p.quantityInStock} Units</span>
                    </td>
                    <td className="py-4 px-4 bg-slate-900/50 group-hover:bg-slate-800 rounded-r-xl transition-colors text-right">
                      <span className="text-cyan-400 font-bold text-sm">Rs. {((p.price || 0) * (p.quantityInStock || 0)).toFixed(2)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
