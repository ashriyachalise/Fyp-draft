'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Truck, MapPin, User, Phone, Mail } from 'lucide-react';
import Link from 'next/link';

export default function ShippingPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    deliveryLocation: '',
    city: '',
    postalCode: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Temporarily save to localStorage so the payment page has access
    localStorage.setItem('shippingDetails', JSON.stringify(formData));
    router.push('/checkout/payment');
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 p-4 lg:px-8">
        <Link href="/cart" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Cart</span>
        </Link>
      </nav>

      <main className="max-w-2xl mx-auto p-4 lg:p-8 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-10">
          {/* Progress Bar */}
          <div className="flex items-center justify-between mb-8 max-w-sm mx-auto">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold ring-4 ring-slate-950 shadow-[0_0_15px_rgba(37,99,235,0.5)]">1</div>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Shipping</span>
            </div>
            <div className="flex-1 h-1 bg-slate-800 rounded-full mx-4 overflow-hidden">
              <div className="w-1/2 h-full bg-blue-600 rounded-full"></div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 font-bold border border-slate-700">2</div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Payment</span>
            </div>
          </div>
          
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <Truck className="text-blue-500" size={32} />
            Shipping Details
          </h1>
          <p className="text-slate-400 mt-2">Enter your delivery information to proceed with the order.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl space-y-8">
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input type="text" required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-700 font-medium" placeholder="John Doe" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Phone Number</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-700 font-medium" placeholder="+1 (555) 000-0000" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-700 font-medium" placeholder="john@example.com" />
              </div>
            </div>
          </div>

          <div className="space-y-6 pt-4">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">Delivery Address</h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Street Location <span className="text-red-400">*</span></label>
              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input type="text" required value={formData.deliveryLocation} onChange={e => setFormData({...formData, deliveryLocation: e.target.value})} className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-700 font-medium" placeholder="123 Industrial Park Rd, Unit B" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">City</label>
                <input type="text" required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-700 font-medium" placeholder="Seattle" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Postal Code</label>
                <input type="text" required value={formData.postalCode} onChange={e => setFormData({...formData, postalCode: e.target.value})} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-700 font-medium uppercase" placeholder="98101" />
              </div>
            </div>
          </div>

          <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] active:scale-[0.98] mt-8 text-lg">
            Proceed to Payment
          </button>
        </form>
      </main>
    </div>
  );
}
