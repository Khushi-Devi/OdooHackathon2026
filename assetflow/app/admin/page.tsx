'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  departmentName: string;
}

export default function AdminPanelPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [authorized, setAuthorized] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees');
      if (res.ok) {
        const data = await res.json();
        setEmployees(data);
      } else {
        setError('Failed to fetch employees list');
      }
    } catch (e) {
      setError('An error occurred while loading employees');
    }
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then((data) => {
        setUser(data.user);
        if (data.user.role === 'Admin') {
          setAuthorized(true);
          fetchEmployees();
        } else {
          router.push('/');
        }
      })
      .catch(() => {
        router.push('/login');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  const handleRoleChange = async (employeeId: string, newRole: string) => {
    setMessage('');
    setError('');
    try {
      const res = await fetch('/api/employees', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, newRole }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || 'Role updated successfully!');
        fetchEmployees();
      } else {
        setError(data.error || 'Failed to update employee role');
      }
    } catch (e) {
      setError('Error updating employee role');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin h-8 w-8 text-blue-600 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Checking Access Rights...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  const roleBadges: Record<string, string> = {
    Admin: 'bg-purple-50 text-purple-700 border-purple-200',
    AssetManager: 'bg-blue-50 text-blue-700 border-blue-200',
    DepartmentHead: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Employee: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  return (
    <main className="fixed inset-0 top-16 left-64 bg-slate-50/30 overflow-y-auto p-8 custom-scrollbar">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Admin Portal</h1>
            <p className="text-sm text-slate-500 font-medium">Manage organization employees and promote system roles</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-xl text-purple-700 text-xs font-bold animate-pulse-slow">
            <span className="material-symbols-outlined text-sm">shield</span>
            Authorized: Admin Panel
          </div>
        </div>

        {/* Notifications */}
        {message && (
          <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-xl flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            {message}
          </div>
        )}
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">error</span>
            {error}
          </div>
        )}

        {/* Employees Table Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-800">User Promotion & Role Assignments</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Department</th>
                  <th className="py-4 px-6">Current Role</th>
                  <th className="py-4 px-6 text-right">Promote/Demote Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center uppercase text-[10px]">
                          {emp.name.substring(0, 2)}
                        </div>
                        <span className="font-bold text-slate-800">{emp.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-500">{emp.email}</td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg font-semibold text-slate-600">
                        {emp.departmentName}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 border rounded-lg font-bold text-[10px] uppercase tracking-wider ${roleBadges[emp.role] || 'bg-slate-100 text-slate-600'}`}>
                        {emp.role === 'AssetManager' ? 'Asset Manager' : emp.role === 'DepartmentHead' ? 'Dept Head' : emp.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <select
                        value={emp.role}
                        onChange={(e) => handleRoleChange(emp.id, e.target.value)}
                        className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 outline-none text-slate-800 font-semibold cursor-pointer w-40"
                      >
                        <option value="Employee">Employee</option>
                        <option value="DepartmentHead">Department Head</option>
                        <option value="AssetManager">Asset Manager</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
