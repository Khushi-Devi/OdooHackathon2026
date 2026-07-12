'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const triggerSearch = (e: React.FormEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('global-search', { detail: search }));
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <header className="fixed top-0 right-0 left-64 h-16 flex items-center justify-between px-8 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <form onSubmit={triggerSearch} className="flex items-center flex-1 max-w-xl">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-600 outline-none text-slate-800"
            placeholder="Search for assets, IDs, or users..."
          />
        </div>
      </form>

      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/bookings')}
          className="py-2 px-6 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-all"
        >
          Create Booking
        </button>

        <div className="h-8 w-px bg-slate-200" />

        <div className="relative">
          <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-2 cursor-pointer">
            <img
              className="w-10 h-10 rounded-full border-2 border-blue-500 object-cover"
              alt="profile"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKjxJ2EhLU9cgOhSo1sOSKO3_qcB8qwyCqd40owQh3gnU-4MaP-n7z9fyRyvEfCj3Qo-QZKsIkEj9xrh7MTLhGPQgTfzWg7zxgweSJ2ASvwbmyZCxhwHxxL0UPYfcGEOp5Dr2N6owuXoGhkYxtNRfBZN0y5gZ3LujSLYR96EBgPfEUjJcg35MHtX8odo4Ygiieo4iW5JLYH56g8TEWG25HCGJWxQoEq1FIVjo1afIr63LC7JWTG6KNJ0KtwVEFryaSfYykvTOJbxOb"
            />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-red-50 hover:text-red-600 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">logout</span>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}