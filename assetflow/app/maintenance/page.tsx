'use client';

import { useEffect, useState } from 'react';

interface TimelineEvent {
  id: string;
  title: string;
  notes?: string;
  status: string;
  timestamp: string;
}

interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  asset: { id: string; tag: string; name: string };
  requestedBy: { name: string };
  assignedTo?: { id: string; name: string };
  timeline: TimelineEvent[];
}

export default function MaintenancePage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState('');

  const fetchRequests = async (selectId?: string) => {
    try {
      const res = await fetch('/api/maintenance');
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
        if (data.length > 0) {
          const toSelect = selectId ? data.find((r: any) => r.id === selectId) : data[0];
          setSelectedRequest(toSelect || data[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (nextStatus: string) => {
    if (!selectedRequest) return;
    setUpdating(true);

    try {
      const res = await fetch(`/api/maintenance/${selectedRequest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: nextStatus,
          notes: notes || `Workflow status updated to ${nextStatus}`
        })
      });

      if (res.ok) {
        setNotes('');
        alert('Workflow status updated!');
        fetchRequests(selectedRequest.id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  const getStepStatus = (stepName: string) => {
    if (!selectedRequest) return 'inactive';
    const statusMap: Record<string, number> = {
      'Raised': 1,
      'Approved': 2,
      'Assigned': 3,
      'InProgress': 4,
      'Resolved': 5
    };
    
    const currentVal = statusMap[selectedRequest.status] || 1;
    const targetVal = statusMap[stepName] || 1;

    if (currentVal === targetVal) return 'active';
    if (currentVal > targetVal) return 'completed';
    return 'inactive';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Maintenance Management</h2>
          <p className="text-sm text-slate-500 mt-1">Monitor and manage facility asset health and pending requests.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">filter_list</span>
            <span className="text-xs font-semibold">Filters</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 flex justify-center">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : requests.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white border border-slate-200 rounded-xl">
          No maintenance tickets active at this time.
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-8 space-y-8">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-sm font-bold text-slate-800">Active Maintenance Requests</h3>
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                  {requests.length} Tickets
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase">
                    <tr>
                      <th className="px-6 py-3">Asset ID</th>
                      <th className="px-6 py-3">Issue Title</th>
                      <th className="px-6 py-3 text-center">Priority</th>
                      <th className="px-6 py-3">Requested By</th>
                      <th className="px-6 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                    {requests.map((req) => (
                      <tr
                        key={req.id}
                        onClick={() => setSelectedRequest(req)}
                        className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                          selectedRequest?.id === req.id ? 'bg-blue-50/30 font-semibold' : ''
                        }`}
                      >
                        <td className="px-6 py-4 font-mono font-bold text-blue-600">#{req.asset.tag}</td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-800">{req.title}</div>
                          <div className="text-xs text-slate-400">Status: {req.status}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                              req.priority === 'Critical' || req.priority === 'Urgent'
                                ? 'bg-red-50 text-red-600'
                                : req.priority === 'Medium'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-blue-50 text-blue-700'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                req.priority === 'Critical' || req.priority === 'Urgent'
                                  ? 'bg-red-500 animate-pulse'
                                  : req.priority === 'Medium'
                                  ? 'bg-amber-500'
                                  : 'bg-blue-500'
                              }`}
                            ></span>
                            {req.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500">{req.requestedBy.name}</td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-blue-600 hover:underline font-semibold">Manage</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {selectedRequest && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined p-2 bg-blue-50 text-blue-600 rounded-lg">
                      description
                    </span>
                    <h3 className="text-lg font-bold text-slate-800">
                      Issue Details: #{selectedRequest.asset.tag}
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Problem Description</h4>
                    <p className="text-sm leading-relaxed text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      {selectedRequest.description}
                    </p>
                    {(selectedRequest.priority === 'Critical' || selectedRequest.priority === 'Urgent') && (
                      <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                        <div className="flex items-center gap-2 text-red-600 font-bold mb-1">
                          <span className="material-symbols-outlined text-[20px]">warning</span>
                          <span className="text-xs uppercase font-extrabold">Critical Notice</span>
                        </div>
                        <p className="text-xs text-red-700">
                          Asset shutdown required for technician safety during physical inspection.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Asset Reference Images</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="aspect-square rounded-lg border border-slate-200 overflow-hidden relative group">
                        <img
                          className="w-full h-full object-cover"
                          alt="HVAC unit"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLxJo2aRQslEFtPdUTLhxubOpBZHIChZr58l6djcNREam-g1wFx8bJhIQb598Jn0TbvfFYeP2mWzZDSINVPQJB16PRXp26fnm0HAEex5gaJZvwomcxfxWujfXCEOxK4_zd4J5tzKGQL2RfQDSfW8SArrLHhOK3PuwkPmR-hojl42Q6wX_6Gdhhx-wbnwHxSIEAYoikkS9tzyDCVL-5CQwqQ8_cDliHdlst3bXoSzddg6DRq_gFq1DfhwIamTgEm0kxKfIEookeq3Fb"
                        />
                      </div>
                      <div className="aspect-square rounded-lg border border-slate-200 overflow-hidden relative group">
                        <img
                          className="w-full h-full object-cover"
                          alt="Facility machinery"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMTkOZaeUSg5P-jhitVz02stEotZb8o3yMFtbPAp9cjGhIHl__9x2iJzZZMHJa3Rqse3CbIB84LmLug4iprH0KPMDymMti0eOkfaHFpHr8yfsOd3p2Rn1YbriVlwXMUcHPYXV2sfAL-Lm5jXWnY9JR0UZtgL2MHA7xaBSNhS9MVj1bOhyUUApZGVJ5zkE2JvEc7tFZCHhPTUE2LOZrkMoHIesKeFyRxR_67onvxGZKmjkcPrJ5WCOP1-XmVxOXqe2-ztfppFP2vIZO"
                        />
                      </div>
                      <button className="aspect-square rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors cursor-pointer">
                        <span className="material-symbols-outlined">add_a_photo</span>
                        <span className="text-[10px] font-bold">Upload</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="col-span-12 lg:col-span-4 h-full">
            {selectedRequest && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-full flex flex-col overflow-hidden bg-white">
                <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
                  <h3 className="text-sm font-bold text-slate-800">Maintenance Workflow</h3>
                  <p className="text-xs text-slate-400 font-semibold">Ticket ID: {selectedRequest.id.substring(0, 8)}</p>
                </div>
                <div className="flex-1 p-8 overflow-y-auto relative min-h-[300px] custom-scrollbar">
                  <div className="timeline-line ml-8"></div>
                  <div className="space-y-10 relative">
                    
                    <div className={`flex items-start gap-6 relative ${getStepStatus('Resolved') === 'inactive' ? 'opacity-40' : ''}`}>
                      <div
                        className={`timeline-dot border-2 ${
                          getStepStatus('Resolved') === 'active'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white border-slate-300 text-slate-400'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                      </div>
                      <div className="flex-1 pt-1">
                        <h4 className="text-sm font-bold text-slate-800">Resolved</h4>
                        <p className="text-xs text-slate-400">Awaiting final sign-off</p>
                      </div>
                    </div>

                    <div className={`flex items-start gap-6 relative ${getStepStatus('InProgress') === 'inactive' ? 'opacity-40' : ''}`}>
                      <div
                        className={`timeline-dot border-2 ${
                          getStepStatus('InProgress') === 'active'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : getStepStatus('InProgress') === 'completed'
                            ? 'bg-blue-50 text-blue-600 border-blue-200'
                            : 'bg-white border-slate-300 text-slate-400'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">engineering</span>
                      </div>
                      <div className="flex-1 pt-1">
                        <h4 className="text-sm font-bold text-slate-800">In Progress</h4>
                        <p className="text-xs text-slate-400">Technician aligning components</p>
                      </div>
                    </div>

                    <div className={`flex items-start gap-6 relative ${getStepStatus('Assigned') === 'inactive' ? 'opacity-40' : ''}`}>
                      <div
                        className={`timeline-dot border-2 ${
                          getStepStatus('Assigned') === 'active'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : getStepStatus('Assigned') === 'completed'
                            ? 'bg-blue-50 text-blue-600 border-blue-200'
                            : 'bg-white border-slate-300 text-slate-400'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">person</span>
                      </div>
                      <div className="flex-1 pt-1">
                        <h4 className="text-sm font-bold text-slate-800">Technician Assigned</h4>
                        <p className="text-xs text-slate-400">Assigned to: {selectedRequest.assignedTo?.name || 'Marcus Webb'}</p>
                      </div>
                    </div>

                    <div className={`flex items-start gap-6 relative ${getStepStatus('Approved') === 'inactive' ? 'opacity-40' : ''}`}>
                      <div
                        className={`timeline-dot border-2 ${
                          getStepStatus('Approved') === 'active'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : getStepStatus('Approved') === 'completed'
                            ? 'bg-blue-50 text-blue-600 border-blue-200'
                            : 'bg-white border-slate-300 text-slate-400'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">verified</span>
                      </div>
                      <div className="flex-1 pt-1">
                        <h4 className="text-sm font-bold text-slate-800">Approved</h4>
                        <p className="text-xs text-slate-400">Budget authorized by Facility Manager</p>
                      </div>
                    </div>

                    <div className={`flex items-start gap-6 relative ${getStepStatus('Raised') === 'inactive' ? 'opacity-40' : ''}`}>
                      <div
                        className={`timeline-dot border-2 ${
                          getStepStatus('Raised') === 'active' || getStepStatus('Raised') === 'completed'
                            ? 'bg-blue-50 text-blue-600 border-blue-200'
                            : 'bg-white border-slate-300 text-slate-400'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">add_notes</span>
                      </div>
                      <div className="flex-1 pt-1">
                        <h4 className="text-sm font-bold text-slate-800">Request Raised</h4>
                        <p className="text-xs text-slate-400">Ticket initialized via automated alert</p>
                      </div>
                    </div>

                  </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-4">
                  <div className="floating-label-group">
                    <input
                      type="text"
                      id="workflow-notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-xs text-slate-800 transition-all"
                      placeholder=" "
                    />
                    <label htmlFor="workflow-notes" className="text-xs">Add Action Notes...</label>
                  </div>
                  
                  <div className="flex gap-2">
                    {selectedRequest.status === 'Raised' && (
                      <button
                        onClick={() => handleUpdateStatus('Approved')}
                        disabled={updating}
                        className="flex-1 py-3 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer"
                      >
                        Approve Ticket
                      </button>
                    )}
                    {selectedRequest.status === 'Approved' && (
                      <button
                        onClick={() => handleUpdateStatus('Assigned')}
                        disabled={updating}
                        className="flex-1 py-3 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer"
                      >
                        Assign Technician
                      </button>
                    )}
                    {selectedRequest.status === 'Assigned' && (
                      <button
                        onClick={() => handleUpdateStatus('InProgress')}
                        disabled={updating}
                        className="flex-1 py-3 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer"
                      >
                        Start Work
                      </button>
                    )}
                    {selectedRequest.status === 'InProgress' && (
                      <button
                        onClick={() => handleUpdateStatus('Resolved')}
                        disabled={updating}
                        className="flex-1 py-3 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
                      >
                        Resolve Ticket
                      </button>
                    )}
                    {selectedRequest.status === 'Resolved' && (
                      <div className="w-full py-3 bg-slate-100 text-slate-500 rounded-lg text-xs font-bold text-center">
                        Ticket Resolved & Closed
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
