'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Not logged in');
      })
      .then((data) => setUser(data.user))
      .catch(() => {
        router.push('/login');
      });
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: 'dashboard' },
    ...(user?.role !== 'Employee' ? [
      { label: 'Assets', path: '/assets', icon: 'inventory_2' },
      { label: 'Allocation', path: '/allocation', icon: 'sync_alt' }
    ] : []),
    { label: 'Bookings', path: '/bookings', icon: 'event_available' },
    { label: 'Maintenance', path: '/maintenance', icon: 'build' },
  ];

  const triggerNewAsset = () => {
    window.dispatchEvent(new Event('open-new-asset-modal'));
  };

  return (
    <aside className="fixed left-0 top-0 h-screen flex flex-col z-40 bg-white w-64 border-r border-slate-200">
      <div className="p-6">
        <h1 className="text-xl font-extrabold text-blue-600 tracking-tight">AssetFlow</h1>
        <p className="text-xs text-slate-500 font-medium">Enterprise Management</p>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-600 font-bold border-l-4 border-blue-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                {item.icon}
              </span>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {user && user.role !== 'Employee' && (
        <div className="px-6 py-4">
          <button
            onClick={triggerNewAsset}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Add New Asset
          </button>
        </div>
      )}

      <div className="mt-auto p-4 border-t border-slate-200 space-y-1">
        {user && (
          <div className="px-4 py-2 mb-2">
            <p className="text-xs font-bold text-slate-800">{user.name}</p>
            <p className="text-[10px] text-slate-500 uppercase font-semibold">{user.role}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all"
        >
          <span className="material-symbols-outlined text-lg">logout</span>
          <span className="text-xs font-semibold">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
