'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Asset {
  id: string;
  tag: string;
  name: string;
  status: string;
  condition: string;
  isBookable: boolean;
  riskScore: number;
  category?: { name: string };
  allocations: Array<{
    id: string;
    employee: { name: string; department?: { name: string } };
  }>;
}

export default function AssetsPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Not logged in');
      })
      .then((data) => setUser(data.user))
      .catch(() => router.push('/login'));
  }, [router]);

  const fetchAssets = async () => {
    try {
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (selectedCategory !== 'All') query.append('category', selectedCategory);
      if (selectedStatus !== 'All') query.append('status', selectedStatus);

      const res = await fetch(`/api/assets?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setAssets(data);
      }
    } catch (e) {
      console.error('Error fetching assets:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();

    const handleGlobalSearch = (e: any) => {
      setSearch(e.detail);
    };

    window.addEventListener('global-search', handleGlobalSearch);
    window.addEventListener('refresh-assets', fetchAssets);

    return () => {
      window.removeEventListener('global-search', handleGlobalSearch);
      window.removeEventListener('refresh-assets', fetchAssets);
    };
  }, [selectedCategory, selectedStatus]);

  useEffect(() => {
    fetchAssets();
  }, [search]);

  const triggerRegisterModal = () => {
    window.dispatchEvent(new Event('open-new-asset-modal'));
  };

  const navigateToAllocation = (assetId: string) => {
    router.push(`/allocation?assetId=${assetId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Asset Directory</h2>
            <p className="text-sm text-slate-500 mt-1">Manage and track your organization's physical and digital resources.</p>
          </div>
          {(user?.role === 'Admin' || user?.role === 'AssetManager') && (
            <button
              onClick={triggerRegisterModal}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-600/10 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">add_circle</span>
              Register Asset
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-600 shadow-sm">
            <span className="material-symbols-outlined text-[16px]">filter_list</span>
            Category:
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent border-none p-0 pr-6 text-xs font-bold text-blue-600 outline-none focus:ring-0 cursor-pointer"
            >
              <option value="All">All</option>
              <option value="Computing">Computing</option>
              <option value="Networking">Networking</option>
              <option value="Furniture">Furniture</option>
              <option value="AV Equipment">AV Equipment</option>
              <option value="Facilities">Facilities</option>
            </select>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-600 shadow-sm">
            Status:
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent border-none p-0 pr-6 text-xs font-bold text-blue-600 outline-none focus:ring-0 cursor-pointer"
            >
              <option value="All">All</option>
              <option value="Available">Available</option>
              <option value="Allocated">Allocated</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Retired">Retired</option>
            </select>
          </div>

          <div className="h-4 w-px bg-slate-200 mx-1"></div>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('All');
              setSelectedStatus('All');
            }}
            className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : assets.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No assets registered matching your search/filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase">
                  <th className="px-6 py-4">Asset Tag</th>
                  <th className="px-6 py-4">Asset Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Custodian / Dept</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {assets.map((asset) => {
                  const activeAlloc = asset.allocations[0];
                  return (
                    <tr key={asset.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-blue-600">
                            <span className="material-symbols-outlined text-[18px]">
                              {asset.category?.name === 'Networking' ? 'router' : 'laptop_mac'}
                            </span>
                          </div>
                          <span className="font-mono text-xs font-bold text-slate-800">{asset.tag}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{asset.name}</div>
                        <div className="text-xs text-slate-400">Condition: {asset.condition}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{asset.category?.name || 'Unassigned'}</td>
                      <td className="px-6 py-4 text-slate-500">
                        {asset.status === 'Allocated' && activeAlloc ? (
                          <div>
                            <p className="font-semibold text-slate-800">{activeAlloc.employee.name}</p>
                            <p className="text-xs text-slate-400">
                              {activeAlloc.employee.department?.name || 'Internal'}
                            </p>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">None (In Storage)</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            asset.status === 'Available'
                              ? 'bg-emerald-50 text-emerald-700'
                              : asset.status === 'Allocated'
                              ? 'bg-blue-50 text-blue-700'
                              : asset.status === 'Maintenance'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              asset.status === 'Available'
                                ? 'bg-emerald-600'
                                : asset.status === 'Allocated'
                                ? 'bg-blue-600'
                                : asset.status === 'Maintenance'
                                ? 'bg-amber-600'
                                : 'bg-slate-500'
                            }`}
                          ></span>
                          {asset.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {(user?.role === 'Admin' || user?.role === 'AssetManager') && (
                          <button
                            onClick={() => navigateToAllocation(asset.id)}
                            className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-100 transition-all cursor-pointer mr-2"
                          >
                            Allocate
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
          <span className="text-xs text-slate-500">
            Showing <span className="font-bold text-slate-700">{assets.length}</span> assets
          </span>
          <div className="flex items-center gap-1">
            <button className="p-2 text-slate-400 hover:bg-slate-200 rounded-lg disabled:opacity-30" disabled>
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button className="p-2 text-slate-400 hover:bg-slate-200 rounded-lg">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
