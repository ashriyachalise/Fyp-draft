'use client';
import { useState, useEffect } from 'react';
import api from '@/services/api';
import { 
  Box, 
  Search, 
  Plus, 
  AlertCircle, 
  ArrowUpRight,
  Package,
  ShoppingCart,
  MoreVertical,
  Filter,
  Trash2
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { useForm } from 'react-hook-form';

export default function InventoryPage() {
  const [loading, setLoading] = useState(true);
  const [parts, setParts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const fetchInventory = async () => {
    try {
      const { data } = await api.get('/inventory');
      setParts(data);
    } catch (err) {
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAddToCart = async (partId: string) => {
    try {
      await api.post('/cart', { partId, quantity: 1 });
      alert('Added to cart successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  const onSubmit = async (data: any) => {
    try {
      await api.post('/inventory', data);
      setIsModalOpen(false);
      reset();
      fetchInventory();
    } catch (err) {
      console.error('Error adding part:', err);
      alert('Failed to add part');
    }
  };

  const handleDelete = async (partId: string) => {
    if (!window.confirm('Are you sure you want to delete this part?')) return;
    try {
      await api.delete(`/inventory/${partId}`);
      fetchInventory();
    } catch (err: any) {
      console.error('Error deleting part:', err);
      alert(err.response?.data?.message || 'Failed to delete part');
    }
  };

  const filteredParts = parts.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.partNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-8">Loading inventory...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Parts Inventory</h1>
          <p className="text-slate-400 mt-1">Manage stock levels and technical specifications.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-lg shadow-blue-500/20"
        >
          <Plus size={18} />
          <span>Add Part</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <Package size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-400">Total Items</p>
              <h3 className="text-2xl font-bold text-white">{parts.length}</h3>
            </div>
          </div>
        </div>
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl border-l-orange-500/50">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400">
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-400">Low Stock</p>
              <h3 className="text-2xl font-bold text-white">
                {parts.filter(p => p.quantityInStock <= p.minimumStockLevel).length}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text"
            placeholder="Search by name or part number..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all">
          <Filter size={18} />
          <span>Filters</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50">
                <th className="px-6 py-4 text-sm font-semibold text-slate-300 uppercase tracking-wider">Part Details</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-300 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-300 uppercase tracking-wider text-center">Stock</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-300 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-300 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredParts.map((part) => (
                <tr key={part._id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500/10 rounded flex items-center justify-center text-blue-400">
                        <Box size={16} />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{part.name}</p>
                        <p className="text-xs text-slate-500">{part.partNumber}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-400">{part.category}</span>
                  </td>
                  <td className="px-6 py-4 text-center text-white font-medium">
                    {part.quantityInStock}
                  </td>
                  <td className="px-6 py-4 font-semibold text-white">
                    Rs. {part.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                      part.quantityInStock <= part.minimumStockLevel 
                        ? 'text-orange-400 bg-orange-400/10 border-orange-400/20' 
                        : 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${part.quantityInStock <= part.minimumStockLevel ? 'bg-orange-400' : 'bg-emerald-400'}`} />
                      {part.quantityInStock <= part.minimumStockLevel ? 'Low Stock' : 'In Stock'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                         onClick={() => handleAddToCart(part._id)}
                         disabled={part.quantityInStock <= 0}
                         className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-sm font-medium rounded-lg transition-all"
                       >
                         <ShoppingCart size={16} />
                         Buy
                       </button>
                       <button
                         onClick={() => handleDelete(part._id)}
                         className="flex items-center gap-2 px-3 py-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-500 hover:text-red-400 text-sm font-medium rounded-lg transition-all"
                       >
                         <Trash2 size={16} />
                         Delete
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Add New Part"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">Part Name</label>
              <input 
                {...register('name', { required: 'Name is required' })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">Part Number</label>
              <input 
                {...register('partNumber', { required: 'Part # is required' })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300">Description</label>
            <textarea 
              {...register('description')}
              rows={2}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">Category</label>
              <input 
                {...register('category')}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">Price (Rs.)</label>
              <input 
                type="number" step="0.01"
                {...register('price')}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">Quantity</label>
              <input 
                type="number"
                {...register('quantityInStock')}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">Min Level</label>
              <input 
                type="number"
                {...register('minimumStockLevel')}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none"
              />
            </div>
          </div>
          <button 
            disabled={isSubmitting}
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl mt-4 transition-all"
          >
            {isSubmitting ? 'Adding...' : 'Add to Inventory'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
