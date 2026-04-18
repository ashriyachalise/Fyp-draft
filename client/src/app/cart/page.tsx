'use client';
import { useState, useEffect } from 'react';
import api from '@/services/api';
import { ShoppingCart, Trash2, ArrowLeft, Plus, Minus, CreditCard, Package, Sparkles, ChevronRight } from 'lucide-react';
import Link from 'next/link';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  const fetchCart = async () => {
    try {
      const { data } = await api.get('/cart');
      setCart(data);
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      await api.put(`/cart/${itemId}`, { quantity: newQuantity });
      fetchCart();
    } catch (err) {
      alert('Failed to update quantity');
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      await api.delete(`/cart/${itemId}`);
      fetchCart();
    } catch (err) {
      alert('Failed to remove item');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#070B14] flex flex-col items-center justify-center pt-20 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-600/20 rounded-full blur-[100px]"></div>
      <div className="w-16 h-16 border-[3px] border-slate-800 border-t-blue-500 rounded-full animate-spin mb-6 relative z-10 shadow-[0_0_30px_rgba(59,130,246,0.6)]"></div>
      <p className="text-blue-400 font-bold tracking-[0.2em] text-xs uppercase animate-pulse relative z-10">Synchronizing Cart Data...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-200 pb-32 relative overflow-hidden font-sans selection:bg-blue-500/30">
      
      {/* AI Ambient Background Effects */}
      <div className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none z-0"></div>
      <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[900px] h-[200px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none z-0 rotate-12"></div>

      <nav className="sticky top-0 z-50 bg-[#070B14]/70 backdrop-blur-2xl border-b border-white/5 p-4 lg:px-8">
        <Link href="/shop" className="inline-flex items-center gap-3 text-slate-400 hover:text-white transition-all group w-fit">
          <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.05] group-hover:bg-white/[0.08] group-hover:border-white/10 transition-all shadow-lg">
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform text-blue-400" />
          </div>
          <span className="font-semibold tracking-wide text-sm group-hover:text-blue-300 transition-colors">Return to Inventory Shop</span>
        </Link>
      </nav>

      <main className="max-w-6xl mx-auto p-4 lg:p-8 mt-6 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl shadow-[0_0_30px_rgba(79,70,229,0.4)] border border-white/10 relative group">
              <div className="absolute inset-0 bg-white/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <ShoppingCart className="text-white relative z-10" size={32} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-slate-400 tracking-tight leading-tight">
                Your Cart
              </h1>
              <p className="text-blue-400/80 font-bold text-xs mt-2 uppercase tracking-[0.2em] flex items-center gap-2">
                 <Sparkles size={14} className="animate-pulse" /> Secure AI Infrastructure
              </p>
            </div>
          </div>
        </div>

        {!cart || !cart.items || cart.items.length === 0 ? (
          <div className="w-full bg-white/[0.02] border border-white/[0.05] backdrop-blur-xl rounded-[2.5rem] p-16 text-center shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
            <div className="w-28 h-28 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner rotate-3 group-hover:-rotate-3 transition-transform duration-500">
              <ShoppingCart className="text-slate-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" size={48} strokeWidth={1.5} />
            </div>
            <h2 className="text-3xl font-black text-white mb-3 tracking-tight">Your Cart is Void</h2>
            <p className="text-slate-400 mb-10 max-w-lg mx-auto text-lg leading-relaxed">System logs indicate zero components staged for checkout. Browse the global inventory to sync parts.</p>
            <Link href="/shop" className="inline-flex px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl transition-all shadow-[0_0_40px_rgba(79,70,229,0.3)] hover:shadow-[0_0_50px_rgba(79,70,229,0.5)] active:scale-95 text-lg ring-1 ring-white/20 flex items-center justify-center gap-3 mx-auto">
              Initialize Order <ChevronRight size={20} className="opacity-80" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 flex flex-col gap-5">
              {cart.items.map((item: any, idx: number) => (
                <div 
                  key={item._id} 
                  className="bg-white/[0.02] border border-white/5 hover:border-blue-500/30 hover:bg-white/[0.04] backdrop-blur-xl rounded-3xl p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center gap-6 shadow-2xl transition-all duration-300 group"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-slate-800 to-slate-900/50 border border-white/5 rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-shadow">
                    <Package className="text-blue-400/80 group-hover:text-blue-400 group-hover:scale-110 transition-all duration-500" size={32} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-white mb-1.5 truncate tracking-wide">{item.part.name}</h3>
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-black tracking-widest uppercase rounded-md border border-blue-500/20 shadow-sm">
                        ID: {item.part.partNumber}
                      </span>
                    </div>
                    <div className="mt-4 flex items-end gap-2">
                       <p className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-br from-blue-300 to-blue-500">Rs. {item.price.toFixed(2)}</p>
                       <span className="text-xs font-medium text-slate-500 mb-1">/ unit</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-5 w-full sm:w-auto mt-2 sm:mt-0 pt-4 sm:pt-0 border-t border-white/5 sm:border-0">
                    
                    <div className="flex items-center bg-black/40 border border-white/5 rounded-xl p-1.5 shadow-inner">
                      <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all active:scale-90"><Minus size={14} strokeWidth={3}/></button>
                      <span className="font-bold text-white w-12 text-center text-lg">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all active:scale-90"><Plus size={14} strokeWidth={3}/></button>
                    </div>

                    <div className="flex items-center gap-6 sm:gap-4">
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Subtotal</p>
                        <p className="font-bold text-white text-lg tracking-tight">Rs. {(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                      <button 
                        onClick={() => removeItem(item._id)} 
                        className="p-3 bg-red-500/5 border border-red-500/10 text-red-400 hover:text-white hover:bg-red-500 hover:border-red-400 rounded-xl transition-all hover:shadow-[0_0_15px_rgba(239,68,68,0.5)] group/btn relative overflow-hidden" 
                        title="Purge Item"
                      >
                        <Trash2 size={18} className="relative z-10 group-hover/btn:scale-110 transition-transform" />
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
            
            <div className="lg:col-span-4 relative">
              <div className="absolute -inset-1 bg-gradient-to-b from-blue-500/20 to-purple-500/20 rounded-[2.5rem] blur-lg opacity-50 pointer-events-none"></div>
              
              <div className="bg-[#0A101D] border border-white/10 rounded-[2rem] p-8 sticky top-28 shadow-2xl relative z-10 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[50px]"></div>
                
                <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Checkout Protocol</h2>
                <p className="text-slate-400 text-sm mb-8 font-medium">Verify final calculations.</p>
                
                <div className="space-y-5 text-slate-300 mb-8 font-medium">
                  <div className="flex justify-between items-center bg-white/[0.02] p-4 rounded-2xl border border-white/[0.05]">
                    <span className="text-slate-400">Payload Output ({cart.items.length} units)</span>
                    <span className="font-bold text-white text-lg">Rs. {cart.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4">
                    <span className="text-slate-400">Logistics Routing</span>
                    <span className="text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20 shadow-sm text-sm tracking-wide">Pending Sync</span>
                  </div>
                  <div className="flex justify-between items-center pt-6 border-t border-white/10 mt-2">
                    <span className="font-black text-white text-xl tracking-wide">Gross Total</span>
                    <span className="font-black text-4xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 to-teal-400 drop-shadow-sm">Rs. {cart.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <Link 
                  href="/checkout/shipping" 
                  className="w-full relative group overflow-hidden py-4 rounded-2xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.2)] active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-emerald-500 to-teal-500 group-hover:from-emerald-400 group-hover:to-teal-400 transition-colors"></div>
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
                  <CreditCard size={20} className="relative z-10 text-emerald-950 stroke-[2.5]" />
                  <span className="relative z-10 text-emerald-950 font-black text-lg tracking-wide">Execute Checkout</span>
                </Link>
                
                <p className="text-center text-xs text-blue-400 mt-6 flex items-center justify-center gap-2 font-bold tracking-widest uppercase">
                  <ShieldLock size={14} /> End-to-End Encryption Confirmed
                </p>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}

const ShieldLock = ({ size }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
);
