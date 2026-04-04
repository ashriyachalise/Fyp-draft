'use client';
import { useState, useEffect } from 'react';
import api from '@/services/api';
import { CheckCircle2, Package, Truck, ArrowRight, FileText, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function OrderSuccessPage() {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestOrder = async () => {
      try {
        const { data } = await api.get('/orders');
        if (data && data.length > 0) {
          setOrder(data[0]); // The latest is first due to sort({createdAt: -1})
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLatestOrder();
  }, []);

  if (loading) return <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center pt-20"><div className="w-16 h-16 border-4 border-slate-800 border-t-emerald-500 rounded-full animate-spin mb-6"></div><p className="text-slate-400 font-medium tracking-wider uppercase text-sm">Finalizing order to secure database...</p></div>;

  if (!order) return <div className="p-8 text-center text-slate-400">Order not found.</div>;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 py-12 relative overflow-hidden">
      
      {/* Decorative Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none z-0"></div>

      <div className="w-full max-w-3xl bg-slate-900/80 backdrop-blur-2xl border border-slate-800 rounded-[2rem] p-8 md:p-14 shadow-2xl relative z-10 animate-in zoom-in-95 duration-700 fade-in">
        
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-gradient-to-tr from-emerald-500 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(16,185,129,0.4)] ring-8 ring-emerald-500/20">
            <CheckCircle2 className="text-white" size={56} strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">Payment Successful!</h1>
          <p className="text-slate-400 text-lg max-w-lg mx-auto">Your order has been completely verified and permanently saved to the MongoDB database. We're processing it for shipment.</p>
        </div>

        {/* Order Details */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-8 mb-10 shadow-inner">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-5 mb-6 gap-4">
            <div className="flex items-center gap-3 text-slate-400">
              <div className="p-2 bg-slate-800 rounded-lg"><FileText size={18} className="text-blue-400" /></div>
              <span className="font-bold uppercase tracking-widest text-xs">MongoDB Order ID</span>
            </div>
            <span className="font-mono text-emerald-400 font-bold px-3 py-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-sm hidden sm:inline-block select-all">{order._id}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Truck size={16} className="text-blue-400"/> Shipping Destination
              </h3>
              <div className="text-slate-300 text-sm space-y-1.5 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <p className="font-bold text-white text-base mb-1">{order.shippingDetails.fullName}</p>
                <p>{order.shippingDetails.deliveryLocation}</p>
                <p>{order.shippingDetails.city}, {order.shippingDetails.postalCode}</p>
                <p className="pt-3 mt-3 border-t border-slate-800 text-slate-400 break-all">{order.shippingDetails.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Package size={16} className="text-blue-400"/> Order Summary
              </h3>
              <div className="space-y-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <p className="text-sm text-slate-300 flex justify-between items-center">
                  <span className="text-slate-400">Total Items:</span> 
                  <span className="font-bold text-white bg-slate-800 px-2 py-1 rounded">{order.items.reduce((acc: number, item: any) => acc + item.quantity, 0)} Units</span>
                </p>
                <p className="text-sm text-slate-300 flex justify-between items-center">
                  <span className="text-slate-400">Fulfillment:</span> 
                  <span className="font-black text-emerald-400 uppercase text-xs bg-emerald-500/10 px-2 py-1.5 rounded-lg border border-emerald-500/20 tracking-wider">
                    {order.orderStatus}
                  </span>
                </p>
                <div className="pt-4 mt-2 border-t border-slate-800">
                  <p className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-xs">Amount Paid</span>
                    <span className="text-3xl font-black text-white">${order.totalAmount.toFixed(2)}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/shop" className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all text-center flex items-center justify-center gap-2 border border-slate-700 hover:border-slate-600">
            <ShoppingBag size={20} />
            Shop More Parts
          </Link>
          <Link href="/dashboard" className="flex-[1.5] py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] flex items-center justify-center gap-2 active:scale-[0.98]">
            Return to Dashboard <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
}
