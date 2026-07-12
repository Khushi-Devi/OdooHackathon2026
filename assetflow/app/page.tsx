'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface DashboardData {
  role?: string;
  stats: {
    total?: number;
    available?: number;
    allocated?: number;
    maintenance?: number;
    retired?: number;
    activeBookings?: number;

    myAllocated?: number;
    myBookings?: number;
    myMaintenance?: number;
  };
  activities?: Array<{
    id: string;
    title: string;
    subtitle: string;
    user: string;
    time: string;
    status: string;
    icon: string;
  }>;
  maintenanceToday?: Array<{
    id: string;
    title: string;
    description: string;
    priority: string;
    status: string;
    createdAt: string;
    assignedTo?: { name: string };
  }>;
  upcomingReturns?: Array<{
    id: string;
    asset: { tag: string; name: string };
    employee: { name: string };
    expectedReturnDate?: string;
  }>;

  myAllocations?: Array<{
    id: string;
    allocatedAt: string;
    expectedReturnDate?: string;
    asset: {
      id: string;
      tag: string;
      name: string;
      condition?: string;
      category?: { name: string };
    };
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
    status: string;
    priority: string;
    asset: { tag: string; name: string };
    assignedTo?: { name: string };
  }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [user, setUser] = useState<{ name: string; role: string; email: string } | null>(null);
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
        alert('Asset checked in successfully!');
        fetchDashboardData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to check in asset');
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  const isEmployee = user?.role === 'Employee';

  if (isEmployee) {
    // ----------------------------------------------------
    // EMPLOYEE VIEW
    // ----------------------------------------------------
    const myAllocated = data?.stats.myAllocated || 0;
    const myBookings = data?.stats.myBookings || 0;
    const myMaintenance = data?.stats.myMaintenance || 0;

    return (
      <div className="space-y-6">
        <div>
          <nav className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-2">
            <span>Workplace</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-blue-600 font-bold">My Dashboard</span>
          </nav>
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Welcome, {user?.name.split(' ')[0] || 'Employee'}
              </h2>
              <p className="text-sm text-slate-500 mt-1">Here is the status of your assigned enterprise resources.</p>
            </div>
            <div className="flex items-center gap-3 text-slate-500 text-xs font-semibold bg-white border border-slate-200 px-4 py-2 rounded-lg shadow-sm">
              <span className="material-symbols-outlined text-[18px]">calendar_today</span>
              <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {/* Employee Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-xl hover:scale-[1.02] transition-all bg-white border border-slate-200 shadow-sm relative group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  laptop_mac
                </span>
              </div>
            </div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">My Allocated Assets</h4>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-slate-900">{myAllocated}</span>
              <span className="text-xs text-slate-400 font-bold">active</span>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl hover:scale-[1.02] transition-all bg-white border border-slate-200 shadow-sm relative group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  event_available
                </span>
              </div>
            </div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">My Active Bookings</h4>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-slate-900">{myBookings}</span>
              <span className="text-xs text-slate-400 font-bold">scheduled</span>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl hover:scale-[1.02] transition-all bg-white border border-slate-200 shadow-sm relative group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  build
                </span>
              </div>
            </div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">My Open Tickets</h4>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-slate-900">{myMaintenance}</span>
              <span className="text-xs text-slate-400 font-bold">in progress</span>
            </div>
          </div>
        </div>

        {/* Employee Bento Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* My Allocated Assets List */}
          <div className="col-span-12 lg:col-span-6 glass-card rounded-2xl overflow-hidden flex flex-col h-[400px] bg-white border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">My Assets</h3>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {!data?.myAllocations || data.myAllocations.length === 0 ? (
                <p className="p-6 text-sm text-slate-400 text-center">No allocated assets found.</p>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 z-10">
                    <tr className="text-slate-500 text-xs font-semibold uppercase">
                      <th className="px-6 py-3">Asset</th>
                      <th className="px-6 py-3">Asset ID</th>
                      <th className="px-6 py-3">Condition</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {data.myAllocations.map((alloc) => (
                      <tr key={alloc.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-800">{alloc.asset.name}</td>
                        <td className="px-6 py-4 font-mono text-slate-600">#{alloc.asset.tag}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-md">
                            {alloc.asset.condition || 'Excellent'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* My Bookings List */}
          <div className="col-span-12 lg:col-span-6 glass-card rounded-2xl overflow-hidden flex flex-col h-[400px] bg-white border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">My Upcoming Bookings</h3>
              <a onClick={() => router.push('/bookings')} className="text-blue-600 text-xs font-bold hover:underline cursor-pointer">
                Book Asset
              </a>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {!data?.myBookings || data.myBookings.length === 0 ? (
                <p className="p-6 text-sm text-slate-400 text-center">No active bookings scheduled.</p>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 z-10">
                    <tr className="text-slate-500 text-xs font-semibold uppercase">
                      <th className="px-6 py-3">Asset</th>
                      <th className="px-6 py-3">Starts</th>
                      <th className="px-6 py-3">Ends</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {data.myBookings.map((booking) => (
                      <tr key={booking.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-800">{booking.asset.name}</td>
                        <td className="px-6 py-4 text-slate-600">{new Date(booking.startTs).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-slate-600">{new Date(booking.endTs).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full">
                            {booking.status}
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

        {/* My Maintenance Tickets */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-6 glass-card p-6 rounded-2xl flex flex-col h-[400px] bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">My Maintenance Tickets</h3>
              <button
                onClick={() => router.push('/maintenance')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-600/10 cursor-pointer"
              >
                + Request Maintenance
              </button>
            </div>
            <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {!data?.myMaintenance || data.myMaintenance.length === 0 ? (
                <p className="text-sm text-slate-400 text-center">No maintenance requests raised.</p>
              ) : (
                data.myMaintenance.map((maint) => (
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
                      <span className="text-xs text-slate-400 font-semibold uppercase">{maint.status}</span>
                    </div>
                    <h5 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                      {maint.title} ({maint.asset.name})
                    </h5>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{maint.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Org Profile info */}
          <div className="col-span-12 lg:col-span-6 glass-card p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-center h-[400px]">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Organizational Profile</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 flex items-center justify-center rounded-full text-xl font-bold">
                  {user?.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-base">{user?.name}</h4>
                  <p className="text-xs text-slate-400 uppercase font-semibold">{user?.role}</p>
                </div>
              </div>
              <ul className="space-y-2 text-sm pt-4 border-t border-slate-100">
                <li className="flex justify-between">
                  <span className="text-slate-500">Corporate Email</span>
                  <span className="font-semibold text-slate-800">{user?.email}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-500">Security Clearance</span>
                  <span className="font-bold text-blue-600 uppercase">Standard Tier</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-500">Authorized Actions</span>
                  <span className="font-semibold text-slate-600">Request Bookings & Maintenance</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // ADMIN & MANAGER VIEW
  // ----------------------------------------------------
  const stats = data?.stats || { total: 0, available: 0, allocated: 0, maintenance: 0, retired: 0, activeBookings: 0 };
  const utilizationRate = stats.total && stats.total > 0 ? Math.round(((stats.allocated || 0) / stats.total) * 100) : 0;

  const r = 80;
  const circ = 2 * Math.PI * r;
  const strokeDashoffset = circ - (utilizationRate / 100) * circ;

  return (
    <div className="space-y-6">
      {/* Welcome & Breadcrumbs */}
      <div>
        <nav className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-2">
          <span>Enterprise</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-blue-600 font-bold">
            {user?.role === 'Admin' ? 'Admin Dashboard' : 'Manager Dashboard Overview'}
          </span>
        </nav>
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {user?.name.split(' ')[0] || 'Sarah'}
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
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
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
            <span className="text-xs text-slate-400 font-bold font-bold">this week</span>
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
            {!data || !data.activities || data.activities.length === 0 ? (
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
                  {data.activities.map((act) => (
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
            {!data || !data.maintenanceToday || data.maintenanceToday.length === 0 ? (
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
          <button
            onClick={() => router.push('/maintenance')}
            className="mt-6 w-full py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-semibold text-xs hover:border-blue-500 hover:text-blue-600 transition-all cursor-pointer"
          >
            + Schedule New Maintenance
          </button>
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
            {!data || !data.upcomingReturns || data.upcomingReturns.length === 0 ? (
              <p className="p-6 text-sm text-slate-400 text-center">No upcoming returns scheduled.</p>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 z-10">
                  <tr className="text-slate-500 text-xs font-semibold uppercase">
                    <th className="px-6 py-3">Asset ID</th>
                    <th className="px-6 py-3">Borrower</th>
                    <th className="px-6 py-3">Due Time</th>
                    <th className="px-6 py-3 text-right">Action</th>
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
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleCheckIn(ret.id)}
                          className="text-blue-600 font-bold hover:underline cursor-pointer"
                        >
                          Check-in
                        </button>
                      </td>
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
