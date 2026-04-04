'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { 
  BarChart3, 
  Box, 
  Wrench, 
  MessageSquare, 
  Bell, 
  LogOut, 
  User,
  Activity,
  Menu,
  X,
  Shield,
  ShoppingCart,
  Store,
  CheckCircle2,
  DollarSign,
  ShieldCheck
} from 'lucide-react';

const SidebarItem = ({ href, icon: Icon, label, active }: any) => (
  <Link
    href={href}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Notification State
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const navigation = [
    { label: 'Overview', href: '/dashboard', icon: BarChart3 },
    { label: 'Monitoring & Parts', href: '/dashboard/monitoring', icon: ShieldCheck },
    { label: 'Machines', href: '/dashboard/machines', icon: Activity },
    { label: 'Inventory', href: '/dashboard/inventory', icon: Box },
    { label: 'Customer Shop', href: '/shop', icon: Store },
    { label: 'My Cart', href: '/cart', icon: ShoppingCart },
    { label: 'Maintenance', href: '/dashboard/maintenance', icon: Wrench },
    { label: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
    { label: 'AI Chat', href: '/dashboard/ai-chat', icon: MessageSquare },
    { label: 'Finances & Stock', href: '/dashboard/admin/finances', icon: DollarSign, role: 'admin' },
    { label: 'Admin', href: '/dashboard/admin', icon: Shield, role: 'admin' },
  ];

  // 1) Fetch Notifications intelligently
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/notifications');
      // Sort newest first
      const sorted = data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setNotifications(sorted);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  // 2) The Polling Engine - Checks every 5 seconds for ultimate real-time reflection
  useEffect(() => {
    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 5000);
    return () => clearInterval(intervalId);
  }, [user]);

  // Handle clicking outside the dropdown to close it securely
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id: string, currentlyRead: boolean) => {
    if (currentlyRead) return;
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center gap-3 px-2 mb-10">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Wrench size={24} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">HeavyMach</span>
          </div>

          <nav className="px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
            {navigation
              .filter(link => !link.role || link.role === user?.role)
              .map((link) => (
                <SidebarItem
                  key={link.href}
                  {...link}
                  active={pathname === link.href}
                />
              ))}
          </nav>

          <div className="mt-auto space-y-4 pt-6 border-t border-slate-800">
            <div className="px-4 py-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold border border-orange-500/20">
                  {user?.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-200 truncate">{user?.username || 'User'}</p>
                  <p className="text-xs text-slate-500 truncate capitalize">{user?.role || 'Technician'}</p>
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative custom-scrollbar">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between p-4 lg:p-6 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
          <button 
            className="lg:hidden p-2 text-slate-400 hover:text-white"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-4">
            
            {/* The Real-Time Bell Component */}
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setShowNotifs(!showNotifs)}
                className={`relative p-2 transition-all rounded-xl ${showNotifs ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-950 shadow-[0_0_10px_rgba(239,68,68,1)] animate-pulse"></span>
                )}
              </button>

              {/* The Dropdown Menu */}
              {showNotifs && (
                <div className="absolute right-0 mt-3 w-80 md:w-96 max-h-[500px] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 animate-in slide-in-from-top-4 fade-in duration-200 overflow-hidden flex flex-col">
                  
                  <div className="bg-slate-800/80 p-4 border-b border-slate-700 flex items-center justify-between backdrop-blur shrink-0">
                    <h3 className="font-bold text-white flex items-center gap-2">
                      <Activity size={18} className="text-blue-400" /> Activity Log
                    </h3>
                    {unreadCount > 0 && (
                      <span className="text-xs bg-blue-500 text-white px-2.5 py-1 rounded-full font-bold shadow-lg shadow-blue-500/20">{unreadCount} New</span>
                    )}
                  </div>
                  
                  <div className="overflow-y-auto custom-scrollbar flex-1 divide-y divide-slate-800/50">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center flex flex-col items-center justify-center">
                        <CheckCircle2 size={32} className="text-slate-600 mb-3" />
                        <span className="text-slate-400 font-medium">You're all caught up!</span>
                        <p className="text-xs text-slate-500 mt-1">Actions you take on the app will appear here instantly.</p>
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div 
                          key={notif._id} 
                          onClick={() => markAsRead(notif._id, notif.isRead)}
                          className={`p-5 transition-colors cursor-pointer flex gap-4 ${notif.isRead ? 'bg-slate-900 hover:bg-slate-800/50' : 'bg-blue-900/10 hover:bg-blue-900/20'}`}
                        >
                          <div className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${notif.isRead ? 'bg-slate-700' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]'}`} />
                          <div>
                            <p className={`text-sm tracking-wide ${notif.isRead ? 'text-slate-400' : 'text-white font-bold'}`}>{notif.title}</p>
                            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{notif.message}</p>
                            <p className="text-[10px] text-slate-600 mt-2.5 font-mono tracking-wider font-semibold">
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &bull; {new Date(notif.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="h-6 w-[1px] bg-slate-800" />
            <div className="flex items-center gap-2 text-slate-300">
              <span className="text-sm font-bold hidden sm:inline">{user?.username}</span>
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 text-slate-400">
                <User size={16} />
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
