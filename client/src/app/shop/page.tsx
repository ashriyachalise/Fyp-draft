'use client';
import { useState, useEffect } from 'react';
import api from '@/services/api';
import { ShoppingCart, Package, Plus, Minus, ArrowLeft, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function ShopPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [parts, setParts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const { data } = await api.get('/inventory');
        setParts(data);
        const initialQs: any = {};
        data.forEach((p: any) => initialQs[p._id] = 1);
        setQuantities(initialQs);
      } catch (err) {
        console.error('Error fetching inventory:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  const handleAddToCart = async (partId: string) => {
    try {
      const q = quantities[partId] || 1;
      await api.post('/cart', { partId, quantity: q });
      alert('Item added to cart!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  const updateQuantity = (id: string, delta: number, max: number) => {
    setQuantities(prev => {
      const current = prev[id] || 1;
      const next = current + delta;
      if (next >= 1 && next <= max) {
        return { ...prev, [id]: next };
      }
      return prev;
    });
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading Shop...</div>;

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      {/* Shop Navbar */}
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 p-4 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700" title="Back to Dashboard">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Package className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold text-white tracking-tight hidden sm:block">HeavyMach Shop</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <button 
              onClick={logout} 
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-medium rounded-xl transition-all border border-red-500/20"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          )}
          <Link href="/client-maintenance" className="flex items-center gap-2 px-4 py-2 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 font-medium rounded-xl transition-all border border-purple-500/20">
            <span className="font-bold hidden sm:inline">Request Service</span>
            <span className="font-bold sm:hidden">Service</span>
          </Link>
          <Link href="/client-chat" className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 font-medium rounded-xl transition-all border border-blue-500/20">
            <span className="font-bold hidden md:inline">AI Assistant</span>
            <span className="font-bold md:hidden">AI</span>
          </Link>
          <Link href="/cart" className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-all border border-slate-700">
            <ShoppingCart size={18} className="text-blue-400" />
            <span className="hidden sm:inline">My Cart</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 lg:p-8 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Equipment Parts</h1>
          <p className="text-slate-400 mt-2 text-lg">Browse and purchase certified heavy machinery components directly from our inventory.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {parts.map(part => (
            <div key={part._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col hover:border-slate-700 transition-all shadow-lg group">
              <div className="w-full h-40 bg-slate-800/50 rounded-xl mb-6 flex items-center justify-center group-hover:bg-slate-800 transition-colors">
                <Package size={48} className="text-slate-600 group-hover:text-blue-400/50 transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{part.name}</h3>
              <p className="text-sm text-slate-400 mb-6">{part.partNumber} &bull; <span className="uppercase text-xs tracking-wider">{part.category}</span></p>
              
              <div className="flex items-end justify-between mt-auto mb-6">
                <div>
                  <p className="text-sm text-slate-500 mb-1 font-medium">Unit Price</p>
                  <p className="text-2xl font-black text-white">Rs. {part.price?.toFixed(2) || '0.00'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500 mb-1 font-medium">Availability</p>
                  <p className={`font-semibold text-sm ${part.quantityInStock > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {part.quantityInStock > 0 ? `${part.quantityInStock} in stock` : 'Out of Stock'}
                  </p>
                </div>
              </div>

              {part.quantityInStock > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl p-1.5">
                    <button onClick={() => updateQuantity(part._id, -1, part.quantityInStock)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"><Minus size={16}/></button>
                    <span className="font-bold text-white w-10 text-center">{quantities[part._id] || 1}</span>
                    <button onClick={() => updateQuantity(part._id, 1, part.quantityInStock)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"><Plus size={16}/></button>
                  </div>
                  <button 
                    onClick={() => handleAddToCart(part._id)}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:scale-[0.98]"
                  >
                    <ShoppingCart size={18} />
                    Add to Cart
                  </button>
                </div>
              ) : (
                <button disabled className="mt-auto w-full py-3.5 bg-slate-800/80 text-slate-500 font-bold rounded-xl cursor-not-allowed border border-slate-800">
                  Currently Unavailable
                </button>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
