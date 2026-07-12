'use client';

import { useState } from 'react';

export default function Header() {
  const [search, setSearch] = useState('');

  const triggerSearch = (e: React.FormEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('global-search', { detail: search }));
  };

  const triggerExport = () => {
    window.dispatchEvent(new Event('trigger-export'));
  };

  const triggerCreateBooking = () => {
    window.dispatchEvent(new Event('open-create-booking-modal'));
  };

  return (
    <header className="fixed top-0 right-0 left-64 h-16 flex items-center justify-between px-8 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <form onSubmit={triggerSearch} className="flex items-center flex-1 max-w-xl">
        <div className="relative w-full group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-600 outline-none text-slate-800 transition-all placeholder:text-slate-400"
            placeholder="Search for assets, IDs, or users..."
          />
        </div>
      </form>

      <div className="flex items-center gap-4">
        <button
          onClick={triggerExport}
          className="flex items-center gap-2 py-2 px-4 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-sm">file_download</span>
          Quick Export
        </button>
        <button
          onClick={triggerCreateBooking}
          className="py-2 px-6 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-all active:scale-[0.98]"
        >
          Create Booking
        </button>

        <div className="h-8 w-px bg-slate-200"></div>

        <button className="material-symbols-outlined text-slate-500 hover:text-blue-600 transition-colors cursor-pointer">
          notifications
        </button>
        <button className="material-symbols-outlined text-slate-500 hover:text-blue-600 transition-colors cursor-pointer">
          help_outline
        </button>

        <div className="flex items-center gap-3 ml-2 cursor-pointer group">
          <img
            className="w-10 h-10 rounded-full border-2 border-blue-500 object-cover shadow-sm group-hover:ring-2 group-hover:ring-blue-600 transition-all"
            alt="Sarah Jenkins profile"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKjxJ2EhLU9cgOhSo1sOSKO3_qcB8qwyCqd40owQh3gnU-4MaP-n7z9fyRyvEfCj3Qo-QZKsIkEj9xrh7MTLhGPQgTfzWg7zxgweSJ2ASvwbmyZCxhwHxxL0UPYfcGEOp5Dr2N6owuXoGhkYxtNRfBZN0y5gZ3LujSLYR96EBgPfEUjJcg35MHtX8odo4Ygiieo4iW5JLYH56g8TEWG25HCGJWxQoEq1FIVjo1afIr63LC7JWTG6KNJ0KtwVEFryaSfYykvTOJbxOb"
          />
        </div>
      </div>
    </header>
  );
}
