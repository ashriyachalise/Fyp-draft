'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { ArrowLeft, CreditCard, CheckCircle2, Package, MapPin, Loader2 } from 'lucide-react';
import Link from 'next/link';

import { useAuth } from '@/context/AuthContext';

export default function PaymentPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [shippingDetails, setShippingDetails] = useState<any>(null);
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'esewa' | 'khalti'>('esewa');
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [selectedTechnician, setSelectedTechnician] = useState<string>('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const savedDetails = localStorage.getItem('shippingDetails');
    if (savedDetails) {
      setShippingDetails(JSON.parse(savedDetails));
    } else {
      router.push('/checkout/shipping');
    }

    const fetchData = async () => {
      try {
        const { data } = await api.get('/cart');
        if (!data.items || data.items.length === 0) {
          router.push('/shop');
        }
        setCart(data);
        try {
          const { data: techData } = await api.get('/users/technicians');
          setTechnicians(techData);
        } catch (e) {
          console.error(e);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      // Simulate payment delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await api.post('/orders', {
        shippingDetails,
        paymentMethod,
        paymentId: `${paymentMethod}_txn_` + Date.now(),
        technician: selectedTechnician || undefined
      });
      
      localStorage.removeItem('shippingDetails');
      // Navigate to success page
      router.push('/order/success');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Payment failed');
      setIsProcessing(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading Payment details...</div>;

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 p-4 lg:px-8">
        <Link href="/checkout/shipping" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Shipping</span>
        </Link>
      </nav>

      <main className="max-w-4xl mx-auto p-4 lg:p-8 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-10">
          <div className="flex items-center justify-between mb-8 max-w-sm mx-auto">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold ring-4 ring-slate-950"><CheckCircle2 size={24} /></div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Shipping</span>
            </div>
            <div className="flex-1 h-1 bg-emerald-500/30 rounded-full mx-4 overflow-hidden">
              <div className="w-full h-full bg-emerald-500"></div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold ring-4 ring-slate-950 shadow-[0_0_15px_rgba(37,99,235,0.5)]">2</div>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Payment</span>
            </div>
          </div>
          
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <CreditCard className="text-blue-500" size={32} />
            Complete Your Order
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-800 pb-3">
                <MapPin className="text-blue-400" size={20} />
                Shipping Details
              </h3>
              {shippingDetails && (
                <div className="space-y-2 text-slate-300">
                  <p className="font-semibold text-white text-lg">{shippingDetails.fullName}</p>
                  <p>{shippingDetails.deliveryLocation}</p>
                  <p>{shippingDetails.city}, {shippingDetails.postalCode}</p>
                  <p className="pt-3 text-sm text-slate-400 mt-2 border-t border-slate-800">{shippingDetails.email} &bull; {shippingDetails.phone}</p>
                </div>
              )}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-800 pb-3">
                <Package className="text-blue-400" size={20} />
                Request Technician (Optional)
              </h3>
              <p className="text-sm text-slate-400 mb-4">Select a technician if you need installation or maintenance assistance.</p>
              <select 
                value={selectedTechnician}
                onChange={(e) => setSelectedTechnician(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-xl p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
              >
                <option value="">No Technician Required</option>
                {technicians.map(tech => (
                  <option key={tech._id} value={tech._id}>
                    {tech.username} {tech.siteLocation && tech.siteLocation !== 'Unassigned' ? `- ${tech.siteLocation}` : ''} {!tech.isAvailable ? '(Busy)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-800 pb-3">
                <CreditCard className="text-blue-400" size={20} />
                Payment Method
              </h3>
              <div className="space-y-4">
                {/* eSewa Option */}
                <div 
                  onClick={() => setPaymentMethod('esewa')}
                  className={`p-4 border-2 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'esewa' ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-9 bg-[#60bb46] rounded flex items-center justify-center text-[10px] font-black tracking-tighter text-white uppercase italic">eSewa</div>
                    <span className="font-semibold text-white italic">eSewa Wallet</span>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'esewa' ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-700'
                  }`}>
                    {paymentMethod === 'esewa' && <CheckCircle2 size={14} />}
                  </div>
                </div>

                {/* Khalti Option */}
                <div 
                  onClick={() => setPaymentMethod('khalti')}
                  className={`p-4 border-2 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'khalti' ? 'border-purple-500 bg-purple-500/5' : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-9 bg-[#5c2d91] rounded flex items-center justify-center text-[10px] font-black tracking-tighter text-white uppercase">Khalti</div>
                    <span className="font-semibold text-white">Khalti Digital Wallet</span>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'khalti' ? 'border-purple-500 bg-purple-500 text-white' : 'border-slate-700'
                  }`}>
                    {paymentMethod === 'khalti' && <CheckCircle2 size={14} />}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl h-fit sticky top-24">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-slate-800 pb-4">
              <Package className="text-blue-500" size={20} />
              Order Summary
            </h3>
            
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {cart?.items.map((item: any) => (
                <div key={item._id} className="flex justify-between text-sm items-center bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
                  <div className="flex gap-3 text-slate-300 items-center">
                    <span className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center text-xs font-bold text-slate-400">{item.quantity}x</span>
                    <span className="font-medium">{item.part.name}</span>
                  </div>
                  <span className="font-bold text-white">Rs. {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-800 mt-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Subtotal</span>
                <span className="font-medium text-white">Rs. {cart?.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Standard Shipping</span>
                <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Free</span>
              </div>
              <div className="flex justify-between items-center pt-5 mt-2 border-t border-slate-800/50">
                <span className="font-black text-white text-xl">Total Due</span>
                <span className="font-black text-4xl text-blue-500">Rs. {cart?.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <button 
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full mt-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-[0_0_30px_rgba(37,99,235,0.25)] active:scale-[0.98] text-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed border border-blue-500"
            >
              {isProcessing ? (
                <><Loader2 className="animate-spin" size={20} /> Processing Transaction...</>
              ) : (
                <><CreditCard size={20} /> Process Payment</>
              )}
            </button>
            
          </div>
        </div>
      </main>
    </div>
  );
}
