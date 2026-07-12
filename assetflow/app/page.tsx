'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface DashboardData {
  role?: string;
  stats: {
    total: number;
    available: number;
    allocated: number;
    maintenance: number;
    retired: number;
    activeBookings: number;
    // Employee stats
    myAssets?: number;
    myBookings?: number;
    myMaintenance?: number;
  };
  activities: Array<{
    id: string;
    title: string;
    subtitle: string;
    user: string;
    time: string;
    status: string;
    icon: string;
  }>;
  maintenanceToday: Array<{
    id: string;
    title: string;
    description: string;
    priority: string;
    status: string;
    createdAt: string;
    assignedTo?: { name: string };
  }>;
  upcomingReturns: Array<{
    id: string;
    asset: { tag: string; name: string };
    employee: { name: string };
    expectedReturnDate?: string;
  }>;
  // Employee datasets
  myAllocations?: Array<{
    id: string;
    allocatedAt: string;
    expectedReturnDate?: string;
    asset: { tag: string; name: string; condition: string; category?: { name: string } };
  }>;
  myBookings?: Array<{
    id: string;
    startTs: string;
    endTs: string;
    status: string;
    asset: { tag: string; name: string };
  }>;
  myMaintenance?: Array<{
    id: string;
    title: string;
    description: string;
    priority: string;
    status: string;
    createdAt: string;
    asset: { name: string };
  }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const meRes = await fetch('/api/auth/me');
      if (!meRes.ok) {
        router.push('/login');
        return;
      }
      const meData = await meRes.json();
      setUser(meData.user);

      const res = await fetch('/api/dashboard');
      if (res.ok) {
        const dashboardData = await res.json();
        setData(dashboardData);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Listen to refresh events
    window.addEventListener('refresh-assets', fetchDashboardData);
    return () => {
      window.removeEventListener('refresh-assets', fetchDashboardData);
    };
  }, [router]);

  const handleCheckIn = async (allocationId: string) => {
    try {
      const res = await fetch('/api/allocations/return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allocationId })
      });
      if (res.ok) {
        alert('Return request completed successfully!');
        fetchDashboardData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to complete return');
      }
    } catch (e) {
      console.error(e);
      alert('Error during return request');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin h-8 w-8 text-blue-600 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Syncing Fleet Workspace...</p>
        </div>
      </div>
    );
  }

  // --- EMPLOYEE DASHBOARD RENDER ---
  if (user?.role === 'Employee') {
    const myAssets = data?.myAllocations || [];
    const myBookings = data?.myBookings || [];
    const myTickets = data?.myMaintenance || [];

    return (
      <div className="space-y-6 animate-fade-in">
        {/* Welcome Banner */}
        <div className="flex justify-between items-end">
          <div>
            <nav className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-2">
              <span>Personal Console</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-blue-600 font-bold">My Workspace</span>
            </nav>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {user?.name.split(' ')[0]}
            </h2>
            <p className="text-sm text-slate-500 mt-1">Here is the status of your assigned resources today.</p>
          </div>
          <div className="flex items-center gap-3 text-slate-500 text-xs font-semibold bg-white border border-slate-200 px-4 py-2 rounded-lg shadow-sm">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Simplified stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                laptop_mac
              </span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">My Assigned Assets</p>
              <p className="text-2xl font-black text-slate-800 mt-0.5">{myAssets.length}</p>
            </div>
          </div>
          <div className="glass-card p-6 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3.5 bg-purple-50 text-purple-600 rounded-xl">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                confirmation_number
              </span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Upcoming Bookings</p>
              <p className="text-2xl font-black text-slate-800 mt-0.5">{myBookings.length}</p>
            </div>
          </div>
          <div className="glass-card p-6 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3.5 bg-orange-50 text-orange-600 rounded-xl">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                build
              </span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Tickets</p>
              <p className="text-2xl font-black text-slate-800 mt-0.5">{myTickets.length}</p>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Column 1: My Assets */}
          <div className="col-span-12 lg:col-span-7 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[450px]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800">My Assigned Assets</h3>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {myAssets.length === 0 ? (
                <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-4xl">inventory_2</span>
                  <p className="text-sm font-semibold">No assets currently assigned to you.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">
                      <th className="py-3 px-6">Asset</th>
                      <th className="py-3 px-6">Tag</th>
                      <th className="py-3 px-6">Condition</th>
                      <th className="py-3 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs text-slate-700 font-semibold divide-y divide-slate-100">
                    {myAssets.map((alloc) => (
                      <tr key={alloc.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6">
                          <span className="font-bold text-slate-800">{alloc.asset.name}</span>
                          <p className="text-[10px] text-slate-400 mt-0.5">{alloc.asset.category?.name || 'Computing'}</p>
                        </td>
                        <td className="py-4 px-6 font-mono font-bold text-slate-500">#{alloc.asset.tag}</td>
                        <td className="py-4 px-6">
                          <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px]">
                            {alloc.asset.condition || 'Excellent'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            type="button"
                            onClick={() => handleCheckIn(alloc.id)}
                            className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-bold transition-all cursor-pointer"
                          >
                            Return Asset
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Column 2: Bookings & Tickets */}
          <div className="col-span-12 lg:col-span-5 space-y-6">
            {/* Bookings Card */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 min-h-[210px] flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-slate-800">My Active Bookings</h3>
                <button
                  type="button"
                  onClick={() => router.push('/bookings')}
                  className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  Book Resource
                </button>
              </div>
              <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
                {myBookings.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No upcoming bookings scheduled.</p>
                ) : (
                  myBookings.map((b) => (
                    <div key={b.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-slate-800">{b.asset.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(b.startTs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(b.endTs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(b.startTs).toLocaleDateString([], { weekday: 'short', day: 'numeric' })})
                        </p>
                      </div>
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded text-[9px] font-extrabold uppercase">
                        {b.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Tickets Card */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 min-h-[210px] flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-slate-800">My Support Tickets</h3>
                <button
                  type="button"
                  onClick={() => router.push('/maintenance')}
                  className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  Raise Ticket
                </button>
              </div>
              <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
                {myTickets.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No maintenance tickets raised.</p>
                ) : (
                  myTickets.map((t) => (
                    <div key={t.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-slate-800">{t.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Asset: {t.asset.name}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                          t.priority === 'Critical' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {t.priority}
                        </span>
                        <span className="text-[9px] text-slate-500 font-semibold uppercase">{t.status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- ADMIN / ASSET MANAGER / DEPT HEAD DASHBOARD RENDER ---
  const stats = data?.stats || { total: 0, available: 0, allocated: 0, maintenance: 0, retired: 0, activeBookings: 0 };
  const utilizationRate = stats.total > 0 ? Math.round((stats.allocated / stats.total) * 100) : 0;

  const r = 80;
  const circ = 2 * Math.PI * r;
  const strokeDashoffset = circ - (utilizationRate / 100) * circ;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome & Breadcrumbs */}
      <div>
        <nav className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-2">
          <span>Enterprise</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-blue-600 font-bold">Dashboard Overview</span>
        </nav>
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {user?.name.split(' ')[0]}
            </h2>
            <p className="text-sm text-slate-500 mt-1">Here is what's happening with your fleet today.</p>
          </div>
          <div className="flex items-center gap-3 text-slate-500 text-xs font-semibold bg-white border border-slate-200 px-4 py-2 rounded-lg shadow-sm">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Assets Available */}
        <div className="glass-card p-6 rounded-xl hover:scale-[1.02] transition-all cursor-pointer overflow-hidden bg-white relative group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg animate-pulse-slow">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
            </div>
            <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              +12%
            </span>
          </div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assets Available</h4>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold text-slate-900">{stats.available}</span>
            <span className="text-sm text-slate-400">/ {stats.total}</span>
          </div>
          <div className="mt-4 h-12 w-full opacity-60 group-hover:opacity-100 transition-opacity">
            <svg className="w-full h-full text-blue-600 stroke-current fill-none" preserveAspectRatio="none" viewBox="0 0 100 20">
              <path d="M0 15 Q 10 12, 20 18 T 40 10 T 60 14 T 80 5 T 100 12" strokeLinecap="round" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Assets Allocated */}
        <div className="glass-card p-6 rounded-xl hover:scale-[1.02] transition-all cursor-pointer overflow-hidden bg-white relative group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-slate-100 text-blue-600 rounded-lg">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                groups
              </span>
            </div>
            <span className="flex items-center gap-1 text-amber-600 text-xs font-bold">
              <span className="material-symbols-outlined text-[16px]">trending_down</span>
              -3%
            </span>
          </div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assets Allocated</h4>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold text-slate-900">{stats.allocated}</span>
            <span className="text-xs text-slate-400 font-bold">active</span>
          </div>
          <div className="mt-4 h-12 w-full opacity-60 group-hover:opacity-100 transition-opacity">
            <svg className="w-full h-full text-slate-500 stroke-current fill-none" preserveAspectRatio="none" viewBox="0 0 100 20">
              <path d="M0 5 Q 10 8, 20 4 T 40 12 T 60 8 T 80 15 T 100 10" strokeLinecap="round" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Maintenance Today */}
        <div className="glass-card p-6 rounded-xl hover:scale-[1.02] transition-all cursor-pointer overflow-hidden bg-white relative group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                build
              </span>
            </div>
            <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded text-[10px] font-bold">URGENT</span>
          </div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Maintenance Today</h4>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold text-slate-900">{stats.maintenance}</span>
            <span className="text-xs text-slate-400 font-bold">tickets</span>
          </div>
          <div className="mt-4 h-12 w-full opacity-60 group-hover:opacity-100 transition-opacity">
            <svg className="w-full h-full text-orange-500 stroke-current fill-none" preserveAspectRatio="none" viewBox="0 0 100 20">
              <path d="M0 18 Q 10 5, 20 15 T 40 8 T 60 12 T 80 4 T 100 18" strokeLinecap="round" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Active Bookings */}
        <div className="glass-card p-6 rounded-xl hover:scale-[1.02] transition-all cursor-pointer overflow-hidden bg-white relative group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-600 text-white rounded-lg">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                confirmation_number
              </span>
            </div>
            <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              +24%
            </span>
          </div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Bookings</h4>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold text-slate-900">{stats.activeBookings}</span>
            <span className="text-xs text-slate-400 font-bold">this week</span>
          </div>
          <div className="mt-4 h-12 w-full opacity-60 group-hover:opacity-100 transition-opacity">
            <svg className="w-full h-full text-blue-500 stroke-current fill-none" preserveAspectRatio="none" viewBox="0 0 100 20">
              <path d="M0 15 L 10 12 L 20 18 L 40 5 L 60 10 L 80 2 L 100 8" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>

      {/* Bento Grid Main Content */}
      <div className="grid grid-cols-12 gap-6">
        {/* Asset Status Overview */}
        <div className="col-span-12 lg:col-span-4 glass-card p-6 rounded-2xl flex flex-col h-[400px] bg-white">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Status Overview</h3>
            <button className="material-symbols-outlined text-slate-400">more_horiz</button>
          </div>
          <div className="flex-1 flex items-center justify-center relative">
            <svg className="w-48 h-48 -rotate-90">
              <circle className="stroke-slate-100 fill-none" cx="96" cy="96" r="80" strokeWidth="12" />
              <circle
                className="stroke-blue-600 fill-none transition-all duration-500"
                cx="96"
                cy="96"
                r="80"
                strokeWidth="12"
                strokeDasharray={circ}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-slate-900">{utilizationRate}%</span>
              <span className="text-xs font-semibold text-slate-400">Utilization</span>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-xs text-slate-600">Available ({stats.available})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-500"></div>
              <span className="text-xs text-slate-600">In-Use ({stats.allocated})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-xs text-slate-600">Offline ({stats.retired})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span className="text-xs text-slate-600">Maint. ({stats.maintenance})</span>
            </div>
          </div>
        </div>

        {/* Recent Activities List */}
        <div className="col-span-12 lg:col-span-8 glass-card rounded-2xl overflow-hidden flex flex-col h-[400px] bg-white">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Recent Activities</h3>
            <a onClick={() => router.push('/assets')} className="text-blue-600 text-xs font-bold hover:underline cursor-pointer">
              View All
            </a>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {!data || data.activities.length === 0 ? (
              <p className="p-6 text-sm text-slate-400 text-center">No recent activities found.</p>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 z-10">
                  <tr className="text-slate-500 text-xs font-semibold uppercase">
                    <th className="px-6 py-3">Activity</th>
                    <th className="px-6 py-3">User</th>
                    <th className="px-6 py-3">Time</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {data?.activities.map((act) => (
                    <tr key={act.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                            <span className="material-symbols-outlined text-lg">{act.icon}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{act.title}</p>
                            <p className="text-xs text-slate-400">{act.subtitle}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-700">{act.user}</td>
                      <td className="px-6 py-4 text-slate-500">{act.time}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                            act.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {act.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Maintenance Today List */}
        <div className="col-span-12 lg:col-span-4 glass-card p-6 rounded-2xl flex flex-col h-[450px] bg-white">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Maintenance Today</h3>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {!data || data.maintenanceToday.length === 0 ? (
              <p className="text-sm text-slate-400 text-center">No maintenance tasks scheduled for today.</p>
            ) : (
              data.maintenanceToday.map((maint) => (
                <div
                  key={maint.id}
                  onClick={() => router.push('/maintenance')}
                  className="p-4 rounded-xl border border-slate-200 hover:border-blue-500 transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        maint.priority === 'Critical' || maint.priority === 'Urgent'
                          ? 'bg-red-50 text-red-600'
                          : maint.priority === 'Medium'
                          ? 'bg-amber-50 text-amber-800'
                          : 'bg-blue-50 text-blue-800'
                      }`}
                    >
                      {maint.priority.toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">09:00 AM</span>
                  </div>
                  <h5 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                    {maint.title}
                  </h5>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{maint.description}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-slate-400">person</span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Assigned: {maint.assignedTo?.name || 'Unassigned'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          {(user?.role === 'Admin' || user?.role === 'AssetManager') && (
            <button
              onClick={() => router.push('/maintenance')}
              className="mt-6 w-full py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-semibold text-xs hover:border-blue-500 hover:text-blue-600 transition-all cursor-pointer"
            >
              + Schedule New Maintenance
            </button>
          )}
        </div>

        {/* Upcoming Returns Table */}
        <div className="col-span-12 lg:col-span-8 glass-card rounded-2xl overflow-hidden flex flex-col h-[450px] bg-white">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Upcoming Returns</h3>
            <div className="flex gap-2">
              <button className="material-symbols-outlined p-1 text-slate-400 hover:bg-slate-100 rounded cursor-pointer">
                filter_list
              </button>
              <button className="material-symbols-outlined p-1 text-slate-400 hover:bg-slate-100 rounded cursor-pointer">
                search
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {!data || data.upcomingReturns.length === 0 ? (
              <p className="p-6 text-sm text-slate-400 text-center">No upcoming returns scheduled.</p>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 z-10">
                  <tr className="text-slate-500 text-xs font-semibold uppercase">
                    <th className="px-6 py-3">Asset ID</th>
                    <th className="px-6 py-3">Borrower</th>
                    <th className="px-6 py-3">Due Date</th>
                    {(user?.role === 'Admin' || user?.role === 'AssetManager' || user?.role === 'DepartmentHead') && (
                      <th className="px-6 py-3 text-right">Action</th>
                    )}
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {data.upcomingReturns.map((ret) => (
                    <tr key={ret.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-800">#{ret.asset.tag}</td>
                      <td className="px-6 py-4 text-slate-700">{ret.employee.name}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-slate-600 font-semibold">
                            {ret.expectedReturnDate
                              ? new Date(ret.expectedReturnDate).toLocaleDateString()
                              : 'Not specified'}
                          </span>
                        </div>
                      </td>
                      {(user?.role === 'Admin' || user?.role === 'AssetManager' || user?.role === 'DepartmentHead') && (
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleCheckIn(ret.id)}
                            className="text-blue-600 font-bold hover:underline cursor-pointer"
                          >
                            Check-in
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
