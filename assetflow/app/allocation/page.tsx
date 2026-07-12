'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import bcrypt from 'bcryptjs';

interface Asset {
  id: string;
  tag: string;
  name: string;
  status: string;
  condition: string;
  category?: { name: string };
}

interface AllocationLog {
  id: string;
  status: string;
  allocatedAt: string;
  expectedReturnDate?: string;
  employee: {
    name: string;
    department?: { name: string };
  };
}

function AllocationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryAssetId = searchParams.get('assetId') || '';

  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState(queryAssetId);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  
  const [allocationType, setAllocationType] = useState<'employee' | 'department'>('employee');
  const [custodianName, setCustodianName] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [notes, setNotes] = useState('');
  const [history, setHistory] = useState<AllocationLog[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then((data) => {
        setUser(data.user);
        if (data.user.role !== 'Admin' && data.user.role !== 'AssetManager') {
          router.push('/');
        }
      })
      .catch(() => {
        router.push('/login');
      })
      .finally(() => {
        setLoadingUser(false);
      });
  }, [router]);

  useEffect(() => {
    fetch('/api/assets')
      .then((res) => res.json())
      .then((data) => {
        setAssets(data);
        if (queryAssetId) {
          const found = data.find((a: Asset) => a.id === queryAssetId);
          setSelectedAsset(found || null);
          setSelectedAssetId(queryAssetId);
        } else if (data.length > 0) {
          setSelectedAsset(data[0]);
          setSelectedAssetId(data[0].id);
        }
      });
  }, [queryAssetId]);

  useEffect(() => {
    if (selectedAssetId) {
      const found = assets.find((a) => a.id === selectedAssetId);
      setSelectedAsset(found || null);
      
      fetch(`/api/allocations?assetId=${selectedAssetId}`)
        .then((res) => res.json())
        .then((data) => setHistory(data));
    }
  }, [selectedAssetId, assets]);

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId || !custodianName) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/allocations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId: selectedAssetId,
          employeeName: custodianName,
          expectedReturnDate: expectedReturnDate || undefined,
          notes
        })
      });

      if (res.ok) {
        alert('Asset allocated successfully!');
        setCustodianName('');
        setExpectedReturnDate('');
        setNotes('');
        
        router.refresh();
        const histRes = await fetch(`/api/allocations?assetId=${selectedAssetId}`);
        const histData = await histRes.json();
        setHistory(histData);

        if (selectedAsset) {
          setSelectedAsset({ ...selectedAsset, status: 'Allocated' });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin h-8 w-8 text-blue-600 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Verifying Permissions...</p>
        </div>
      </div>
    );
  }

  if (user?.role !== 'Admin' && user?.role !== 'AssetManager') {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <nav className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
          <span>Assets</span>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span>Allocation & Transfer</span>
          {selectedAsset && (
            <>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
              <span className="text-blue-600 font-bold">
                {selectedAsset.tag} {selectedAsset.name}
              </span>
            </>
          )}
        </nav>
      </div>

      {!queryAssetId && (
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center gap-4">
          <label className="text-sm font-bold text-slate-700">Select Asset to Manage:</label>
          <select
            value={selectedAssetId}
            onChange={(e) => setSelectedAssetId(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none text-slate-800"
          >
            {assets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.tag} - {asset.name} ({asset.status})
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        <section className="col-span-12 lg:col-span-5 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="relative h-64 w-full bg-slate-100">
              <img
                className="w-full h-full object-cover"
                alt="MacBook Pro"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBdTKGWDNFNV973Ro6nYgsD1yl4FBwCnNUc0z7IbJA6Zpx7LZ21MKMNn62je8niTsq2w5aLGO6_rgU1gEhwwoLMMxl-wOGW8vweJR_rG0QUEwSXibYGYEnDOLt09H1d5tknZGrqzdbBz_sM1LlkJ-KYcl5AgQRNgKTnzK25Vbbl7KtM9QqVEoqYrSlXMnE3jlQSWO9iGtVupPYAQcKyvdfhjw9TCMLYvkBrWNtRcgMIXOYB2VoCK2oRz8tTgoXgaNGFvD19-tk9toaE"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="bg-blue-600/90 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                  Premium Tier
                </span>
                <span className="bg-white/90 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border border-blue-100">
                  IT Asset
                </span>
              </div>
            </div>
            
            {selectedAsset ? (
              <div className="p-6 space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{selectedAsset.name}</h2>
                  <p className="text-xs text-slate-400">
                    Category: {selectedAsset.category?.name || 'Unassigned'} • Asset ID: {selectedAsset.tag}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <p className="text-slate-500 text-xs font-semibold">Current Status</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          selectedAsset.status === 'Available' ? 'bg-emerald-500' : 'bg-blue-500'
                        }`}
                      ></span>
                      <span className="text-sm font-bold text-slate-800">{selectedAsset.status}</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <p className="text-slate-500 text-xs font-semibold">Condition</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="material-symbols-outlined text-sm text-slate-500">verified</span>
                      <span className="text-sm font-bold text-slate-800">{selectedAsset.condition || 'Excellent'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Specifications</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <span className="text-slate-500">Processor</span>
                      <span className="font-semibold text-slate-800">Apple M3 Max (16-core)</span>
                    </li>
                    <li className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <span className="text-slate-500">Memory</span>
                      <span className="font-semibold text-slate-800">64GB Unified RAM</span>
                    </li>
                    <li className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <span className="text-slate-500">Storage</span>
                      <span className="font-semibold text-slate-800">1TB SSD NVMe</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-slate-500">Warranty Expires</span>
                      <span className="font-semibold text-orange-600">Oct 12, 2026</span>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400">Select an asset to view specifications.</div>
            )}
          </div>
        </section>

        <section className="col-span-12 lg:col-span-7">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 h-full flex flex-col justify-between">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-800">Asset Allocation</h2>
              <p className="text-slate-500 text-xs mt-1">Define the custodian or department responsible for this asset.</p>
            </div>

            <form onSubmit={handleAllocate} className="space-y-6 flex-1">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-4">Allocate To</label>
                <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setAllocationType('employee')}
                    className={`px-8 py-2 rounded-lg text-xs font-semibold transition-all ${
                      allocationType === 'employee' ? 'bg-white shadow-sm text-blue-600 font-bold' : 'text-slate-500'
                    }`}
                  >
                    Employee
                  </button>
                  <button
                    type="button"
                    onClick={() => setAllocationType('department')}
                    className={`px-8 py-2 rounded-lg text-xs font-semibold transition-all ${
                      allocationType === 'department' ? 'bg-white shadow-sm text-blue-600 font-bold' : 'text-slate-500'
                    }`}
                  >
                    Department
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="floating-label-group">
                  <input
                    type="text"
                    id="custodian"
                    value={custodianName}
                    onChange={(e) => setCustodianName(e.target.value)}
                    className="w-full px-4 py-4 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-sm text-slate-800 transition-all"
                    placeholder=" "
                    required
                  />
                  <label htmlFor="custodian">
                    {allocationType === 'employee' ? 'Search Employee Name' : 'Search Department Name'}
                  </label>
                </div>
                <div className="floating-label-group">
                  <input
                    type="text"
                    id="project"
                    className="w-full px-4 py-4 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-sm text-slate-800 transition-all"
                    placeholder=" "
                  />
                  <label htmlFor="project">Project Code (Optional)</label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Allocation Start Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none text-slate-800"
                    defaultValue={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Expected Return Date
                  </label>
                  <input
                    type="date"
                    value={expectedReturnDate}
                    onChange={(e) => setExpectedReturnDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none text-slate-800"
                  />
                </div>
              </div>

              <div className="floating-label-group">
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-4 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-sm text-slate-800 transition-all resize-none"
                  placeholder=" "
                  rows={3}
                ></textarea>
                <label htmlFor="notes">Allocation Notes & Purpose</label>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => router.push('/assets')}
                  className="px-6 py-3 text-sm font-semibold text-slate-500 hover:text-slate-800"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-10 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/10 hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {submitting && (
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  Confirm Allocation
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>

      <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">history</span>
            Allocation History & Audit Trail
          </h2>
          <div className="text-xs font-semibold text-slate-500">
            {history.length} Historical Handovers
          </div>
        </div>

        <div className="overflow-x-auto">
          {history.length === 0 ? (
            <p className="p-6 text-sm text-slate-400 text-center">No past allocations recorded for this asset.</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50">
                <tr className="text-slate-500 text-xs font-semibold uppercase">
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Custodian</th>
                  <th className="px-6 py-4">Dept/Project</th>
                  <th className="px-6 py-4">Date Range</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Verified By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {history.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-slate-400">
                          {log.status === 'Active' ? 'transfer_within_a_station' : 'assignment_return'}
                        </span>
                        <span className="font-semibold text-slate-800">
                          {log.status === 'Active' ? 'Asset Transfer' : 'Asset Return'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{log.employee.name}</td>
                    <td className="px-6 py-4 font-semibold">
                      {log.employee.department?.name || 'Internal'}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(log.allocatedAt).toLocaleDateString()} -{' '}
                      {log.status === 'Active'
                        ? 'Present'
                        : log.expectedReturnDate
                        ? new Date(log.expectedReturnDate).toLocaleDateString()
                        : 'Completed'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-[10px] font-bold border uppercase tracking-tighter ${
                          log.status === 'Active'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        {log.status === 'Active' ? 'Current' : 'Completed'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-blue-600">verified</span>
                        System Admin
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}

export default function AllocationPage() {
  return (
    <Suspense fallback={<div>Loading Page...</div>}>
      <AllocationContent />
    </Suspense>
  );
}
