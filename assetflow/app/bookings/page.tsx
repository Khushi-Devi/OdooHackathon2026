'use client';

import { useEffect, useState } from 'react';

interface Asset {
  id: string;
  tag: string;
  name: string;
  isBookable: boolean;
}

interface Booking {
  id: string;
  assetId: string;
  startTs: string;
  endTs: string;
  status: string;
  asset: { name: string; tag: string };
  employee: { name: string };
}

export default function BookingsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  
  const [bookingPurpose, setBookingPurpose] = useState('Q4 Strategic Planning');
  const [selectedDay, setSelectedDay] = useState(3); // Wednesday by default
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('12:00');
  
  const [submitting, setSubmitting] = useState(false);

  const fetchBookings = () => {
    fetch('/api/bookings')
      .then((res) => res.json())
      .then((data) => setBookings(data));
  };

  useEffect(() => {
    fetch('/api/assets')
      .then((res) => res.json())
      .then((data) => {
        const bookables = data.filter((a: any) => a.isBookable);
        setAssets(bookables);
        if (bookables.length > 0) {
          setSelectedAssetId(bookables[0].id);
        }
      });

    fetchBookings();
  }, []);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId) return;

    setSubmitting(true);
    const today = new Date();
    const currentDayOfWeek = today.getDay();
    const diff = selectedDay - (currentDayOfWeek === 0 ? 7 : currentDayOfWeek);
    
    const start = new Date(today);
    start.setDate(today.getDate() + diff);
    const [sHour, sMin] = startTime.split(':');
    start.setHours(parseInt(sHour), parseInt(sMin), 0, 0);

    const end = new Date(today);
    end.setDate(today.getDate() + diff);
    const [eHour, eMin] = endTime.split(':');
    end.setHours(parseInt(eHour), parseInt(eMin), 0, 0);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId: selectedAssetId,
          startTs: start.toISOString(),
          endTs: end.toISOString()
        })
      });

      if (res.ok) {
        alert('Booking created successfully!');
        fetchBookings();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const weekDays = [
    { name: 'MON', label: 'MON 16', val: 1 },
    { name: 'TUE', label: 'TUE 17', val: 2 },
    { name: 'WED', label: 'WED 18', val: 3 },
    { name: 'THU', label: 'THU 19', val: 4 },
    { name: 'FRI', label: 'FRI 20', val: 5 },
    { name: 'SAT', label: 'SAT 21', val: 6 },
    { name: 'SUN', label: 'SUN 22', val: 7 },
  ];

  const hours = [
    { label: '08 AM', hour: 8 },
    { label: '09 AM', hour: 9 },
    { label: '10 AM', hour: 10 },
    { label: '11 AM', hour: 11 },
    { label: '12 PM', hour: 12 },
    { label: '01 PM', hour: 13 },
    { label: '02 PM', hour: 14 },
    { label: '03 PM', hour: 15 },
    { label: '04 PM', hour: 16 },
    { label: '05 PM', hour: 17 },
  ];

  const getBookingStyle = (b: Booking) => {
    const start = new Date(b.startTs);
    const end = new Date(b.endTs);
    const day = start.getDay();
    const leftOffset = ((day === 0 ? 6 : day - 1) * 14.28);
    
    const startHour = start.getHours() + start.getMinutes() / 60;
    const endHour = end.getHours() + end.getMinutes() / 60;
    
    const topOffset = (startHour - 8) * 96;
    const height = (endHour - startHour) * 96;
    
    return {
      left: `${leftOffset}%`,
      top: `${topOffset}px`,
      height: `${height}px`,
      width: '14.28%',
    };
  };

  return (
    <main className="fixed inset-0 top-16 left-64 flex bg-slate-50/20 overflow-hidden">
      <section className="w-80 h-full border-r border-slate-200 flex flex-col p-6 overflow-y-auto custom-scrollbar bg-white">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-800">September 2026</h3>
            <div className="flex gap-1">
              <button className="p-1 hover:bg-slate-100 rounded-md"><span className="material-symbols-outlined text-sm">chevron_left</span></button>
              <button className="p-1 hover:bg-slate-100 rounded-md"><span className="material-symbols-outlined text-sm">chevron_right</span></button>
            </div>
          </div>
          <div className="calendar-grid text-center text-[10px] font-extrabold text-slate-400 uppercase mb-2 grid grid-cols-7">
            <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
          </div>
          <div className="calendar-grid gap-y-2 text-center text-xs grid grid-cols-7 text-slate-600 font-semibold">
            <div className="py-1.5 text-slate-300">30</div>
            <div className="py-1.5">1</div><div className="py-1.5">2</div><div className="py-1.5">3</div><div className="py-1.5">4</div><div className="py-1.5">5</div><div className="py-1.5">6</div><div className="py-1.5">7</div>
            <div className="py-1.5">8</div><div className="py-1.5">9</div><div className="py-1.5">10</div><div className="py-1.5">11</div><div className="py-1.5">12</div><div className="py-1.5">13</div><div className="py-1.5">14</div>
            <div className="py-1.5">15</div><div className="py-1.5">16</div><div className="py-1.5">17</div>
            <div className="py-1.5 bg-blue-600 text-white rounded-full font-bold shadow-sm">18</div>
            <div className="py-1.5">19</div><div className="py-1.5">20</div><div className="py-1.5">21</div><div className="py-1.5">22</div>
            <div className="py-1.5">23</div><div className="py-1.5">24</div><div className="py-1.5">25</div><div className="py-1.5">26</div><div className="py-1.5">27</div>
          </div>
        </div>

        <div className="space-y-6 pt-4 border-t border-slate-100">
          <div>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Resource Category</h4>
            <div className="space-y-2 text-xs text-slate-600 font-medium">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-600" />
                <span className="group-hover:text-blue-600">Meeting Rooms</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-600" />
                <span className="group-hover:text-blue-600">Laptops & Hardware</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-600" />
                <span className="group-hover:text-blue-600">Vehicles</span>
              </label>
            </div>
          </div>
        </div>
      </section>

      <section className="flex-1 h-full flex flex-col min-w-0 bg-white">
        <div className="px-8 py-4 bg-white border-b border-slate-200 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <div className="flex p-1 bg-slate-100 rounded-lg">
              <button className="px-4 py-1.5 bg-white shadow-sm rounded-md text-xs font-bold text-slate-800">Week</button>
              <button className="px-4 py-1.5 text-xs text-slate-400 font-semibold hover:text-slate-700">Day</button>
            </div>
            <div className="h-6 w-px bg-slate-200"></div>
            <div className="flex items-center gap-2">
              <button className="p-1 hover:bg-slate-100 rounded-md"><span className="material-symbols-outlined text-sm">arrow_back_ios</span></button>
              <span className="text-sm font-bold text-slate-800">Sept 16 — Sept 22, 2026</span>
              <button className="p-1 hover:bg-slate-100 rounded-md"><span className="material-symbols-outlined text-sm">arrow_forward_ios</span></button>
            </div>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto custom-scrollbar relative">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-8 border-b border-slate-200 bg-white sticky top-0 z-20 text-center">
              <div className="h-12 border-r border-slate-100"></div>
              {weekDays.map((d) => (
                <div
                  key={d.val}
                  className={`py-3 border-r border-slate-100 text-xs font-bold ${
                    d.val === selectedDay ? 'text-blue-600 bg-blue-50/50' : 'text-slate-500'
                  }`}
                >
                  {d.label}
                </div>
              ))}
            </div>

            <div className="relative flex">
              <div className="w-[12.5%] flex flex-col z-10 bg-white border-r border-slate-200">
                {hours.map((h) => (
                  <div key={h.hour} className="h-24 text-right pr-3 pt-2 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100">
                    {h.label}
                  </div>
                ))}
              </div>

              <div className="flex-1 relative h-[960px]">
                <div className="absolute inset-0 grid grid-cols-7 pointer-events-none">
                  {[...Array(7)].map((_, i) => (
                    <div
                      key={i}
                      className={`border-r border-slate-100/60 ${i + 1 === selectedDay ? 'bg-blue-500/[0.01]' : ''}`}
                    ></div>
                  ))}
                </div>

                <div className="absolute inset-0 pointer-events-none flex flex-col">
                  {hours.map((h) => (
                    <div key={h.hour} className="h-24 border-b border-slate-100/60 w-full"></div>
                  ))}
                </div>

                {bookings.map((b) => (
                  <div key={b.id} className="absolute p-1" style={getBookingStyle(b)}>
                    <div className="h-full w-full bg-blue-50 border-l-4 border-blue-600 p-2 rounded-lg shadow-sm overflow-hidden text-left hover:scale-[1.01] transition-transform cursor-pointer">
                      <p className="text-[10px] font-bold text-blue-700 truncate">{b.asset.name}</p>
                      <p className="text-[9px] text-slate-500 truncate">Custodian: {b.employee.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-96 h-full bg-white border-l border-slate-200 flex flex-col z-30 justify-between">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-base font-bold text-slate-800">Booking Details</h3>
        </div>

        <form onSubmit={handleCreateBooking} className="flex-grow p-6 space-y-6 overflow-y-auto custom-scrollbar">
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-3">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-blue-600">meeting_room</span>
              <div>
                <p className="text-[10px] font-bold text-blue-600 uppercase">Resource Selector</p>
                <select
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                  className="bg-transparent border-none p-0 text-base font-bold text-slate-800 focus:ring-0 outline-none cursor-pointer w-full"
                >
                  {assets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Date & Time</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Day of Week</label>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 outline-none text-slate-800"
                >
                  <option value={1}>Monday</option>
                  <option value={2}>Tuesday</option>
                  <option value={3}>Wednesday</option>
                  <option value={4}>Thursday</option>
                  <option value={5}>Friday</option>
                  <option value={6}>Saturday</option>
                  <option value={7}>Sunday</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Start</label>
                  <input
                    type="text"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 outline-none text-slate-800 text-center"
                    placeholder="10:00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">End</label>
                  <input
                    type="text"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 outline-none text-slate-800 text-center"
                    placeholder="12:00"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Purpose</label>
            <input
              type="text"
              value={bookingPurpose}
              onChange={(e) => setBookingPurpose(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 outline-none text-slate-800"
              placeholder="e.g. Sync Meeting"
              required
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Requirements</label>
            <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
              <span className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-full flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">tv</span> Video Conf
              </span>
              <span className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-full flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">wifi</span> WiFi
              </span>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/10 hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting && (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              Confirm Booking
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
