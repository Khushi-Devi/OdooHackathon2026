'use client';

export default function ReportsPage() {
  return (
    <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm max-w-2xl">
      <h2 className="text-xl font-bold text-slate-800 mb-2">Analytics & Fleet Reports</h2>
      <p className="text-sm text-slate-500 mb-6 font-medium">
        Export custom Excel sheets, generate utilization chart diagrams, and predict quarterly asset depreciations.
      </p>
      <div className="p-4 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg">
        Weekly utilization reports are generated automatically on Sundays at 12:00 AM.
      </div>
    </div>
  );
}
