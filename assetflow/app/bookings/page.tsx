'use client';

import { useEffect, useState } from 'react';

interface Asset {
  id: string;
  tag: string;
  name: string;
  isBookable: boolean;
  category?: { name: string };
}

interface Booking {
  id: string;
  assetId: string;
  startTs: string;
  endTs: string;
  status: string;
  asset: { name: string; tag: string; category?: { name: string } };
  employee: { name: string };
}

export default function BookingsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  
  const [bookingPurpose, setBookingPurpose] = useState('Q4 Strategic Planning');
  const [selectedDay, setSelectedDay] = useState(3); // Wednesday (1-indexed, Monday = 1, Sunday = 7)
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('12:00');
  
  const [submitting, setSubmitting] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);

  // Category filters
  const [filterMeetingRooms, setFilterMeetingRooms] = useState(true);
  const [filterHardware, setFilterHardware] = useState(true);
  const [filterVehicles, setFilterVehicles] = useState(true);

  const fetchBookings = () => {
    fetch('/api/bookings')
      .then((res) => res.json())
      .then((data) => setBookings(data))
      .catch((err) => console.error(err));
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
      })
      .catch((err) => console.error(err));

    fetchBookings();
  }, []);

  // Calculate actual dates of the active week based on offset
  const getWeekDates = (offset = 0) => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1) + (offset * 7);
    const monday = new Date(today.getFullYear(), today.getMonth(), diff);
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const weekDates = getWeekDates(weekOffset);
  const startOfWeek = new Date(weekDates[0]);
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(weekDates[6]);
  endOfWeek.setHours(23, 59, 59, 999);

  // Filter bookings to show only those in the currently viewed week
  const currentWeekBookings = bookings.filter((b) => {
    const start = new Date(b.startTs);
    return start >= startOfWeek && start <= endOfWeek;
  });

  // Filter bookings based on the left-side checkboxes
  const filteredBookings = currentWeekBookings.filter((b) => {
    const cat = b.asset.category?.name || '';
    if (cat === 'AV Equipment' || cat === 'Facilities') return filterMeetingRooms;
    if (cat === 'Computing' || cat === 'Networking') return filterHardware;
    if (cat === 'Furniture') return filterVehicles;
    return true;
  });

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId) return;

    setSubmitting(true);
    
    // Selected date in the active week
    const targetDate = new Date(weekDates[selectedDay - 1]);
    
    const start = new Date(targetDate);
    const [sHour, sMin] = startTime.split(':');
    start.setHours(parseInt(sHour), parseInt(sMin), 0, 0);

    const end = new Date(targetDate);
    const [eHour, eMin] = endTime.split(':');
    end.setHours(parseInt(eHour), parseInt(eMin), 0, 0);

    if (start >= end) {
      alert('End time must be after start time.');
      setSubmitting(false);
      return;
    }

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
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create booking');
      }
    } catch (e) {
      console.error(e);
      alert('Error creating booking');
    } finally {
      setSubmitting(false);
    }
  };

  // Generate left-side calendar monthly view
  const getMonthDays = (offset = 0) => {
    const today = new Date();
    const targetDate = new Date(today.getFullYear(), today.getMonth() + offset, 1);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();
    
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0=Sunday, 1=Monday
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthTotalDays = new Date(year, month, 0).getDate();
    
    const days = [];
    // Padding from previous month
    const padDaysCount = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    for (let i = padDaysCount - 1; i >= 0; i--) {
      days.push({ day: prevMonthTotalDays - i, isCurrentMonth: false });
    }
    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push({ day: i, isCurrentMonth: true, date: new Date(year, month, i) });
    }
    // Padding for next month
    const totalCells = days.length > 35 ? 42 : 35;
    const nextPadCount = totalCells - days.length;
    for (let i = 1; i <= nextPadCount; i++) {
      days.push({ day: i, isCurrentMonth: false });
    }
    
    return {
      monthName: targetDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      days
    };
  };

  const monthData = getMonthDays(monthOffset);
  const todayDate = new Date();

  // Weekly view headers format
  const formatWeekRange = () => {
    const start = weekDates[0];
    const end = weekDates[6];
    const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
    
    if (startMonth === endMonth) {
      return `${startMonth} ${start.getDate()} — ${end.getDate()}, ${start.getFullYear()}`;
    }
    return `${startMonth} ${start.getDate()} — ${endMonth} ${end.getDate()}, ${start.getFullYear()}`;
  };

  const weekDayLabels = weekDates.map((d, index) => {
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return {
      name: dayNames[d.getDay()],
      label: `${dayNames[d.getDay()]} ${d.getDate()}`,
      val: d.getDay() === 0 ? 7 : d.getDay()
    };
  });

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
    const day = start.getDay(); // 0-6
    const leftOffset = ((day === 0 ? 6 : day - 1) * 14.28);
    
    const startHour = start.getHours() + start.getMinutes() / 60;
    const endHour = end.getHours() + end.getMinutes() / 60;
    
    const visibleStart = Math.max(8, startHour);
    const visibleEnd = Math.min(18, endHour);
    
    const topOffset = (visibleStart - 8) * 96;
    const height = Math.max(36, (visibleEnd - visibleStart) * 96);
    
    return {
      left: `${leftOffset}%`,
      top: `${topOffset}px`,
      height: `${height}px`,
      width: '14.28%',
    };
  };

  return (
    <main className="fixed inset-0 top-16 left-64 flex bg-slate-50/20 overflow-hidden">
      {/* Left Sidebar Control Panel */}
      <section className="w-80 h-full border-r border-slate-200 flex flex-col p-6 overflow-y-auto custom-scrollbar bg-white">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-800">{monthData.monthName}</h3>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setMonthOffset(monthOffset - 1)}
                className="p-1 hover:bg-slate-100 rounded-md cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <button
                type="button"
                onClick={() => setMonthOffset(monthOffset + 1)}
                className="p-1 hover:bg-slate-100 rounded-md cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
          <div className="calendar-grid text-center text-[10px] font-extrabold text-slate-400 uppercase mb-2 grid grid-cols-7">
            <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
          </div>
          <div className="calendar-grid gap-y-2 text-center text-xs grid grid-cols-7 text-slate-600 font-semibold">
            {monthData.days.map((dayObj, i) => {
              const isToday = dayObj.date &&
                dayObj.date.getDate() === todayDate.getDate() &&
                dayObj.date.getMonth() === todayDate.getMonth() &&
                dayObj.date.getFullYear() === todayDate.getFullYear();
              
              return (
                <div
                  key={i}
                  className={`py-1.5 ${
                    !dayObj.isCurrentMonth
                      ? 'text-slate-300'
                      : isToday
                      ? 'bg-blue-600 text-white rounded-full font-bold shadow-sm'
                      : ''
                  }`}
                >
                  {dayObj.day}
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6 pt-6 border-t border-slate-100">
          <div>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Resource Filter</h4>
            <div className="space-y-2 text-xs text-slate-600 font-medium">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filterMeetingRooms}
                  onChange={(e) => setFilterMeetingRooms(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-600"
                />
                <span className="group-hover:text-blue-600">Meeting Rooms</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filterHardware}
                  onChange={(e) => setFilterHardware(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-600"
                />
                <span className="group-hover:text-blue-600">Hardware & Specs</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filterVehicles}
                  onChange={(e) => setFilterVehicles(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-600"
                />
                <span className="group-hover:text-blue-600">Furniture & Facilities</span>
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Main Weekly Calendar Grid */}
      <section className="flex-1 h-full flex flex-col min-w-0 bg-white">
        <div className="px-8 py-4 bg-white border-b border-slate-200 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <div className="flex p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setWeekOffset(0)}
                className="px-4 py-1.5 bg-white shadow-sm rounded-md text-xs font-bold text-slate-800 cursor-pointer"
              >
                Today
              </button>
            </div>
            <div className="h-6 w-px bg-slate-200"></div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setWeekOffset(weekOffset - 1)}
                className="p-1 hover:bg-slate-100 rounded-md cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">arrow_back_ios</span>
              </button>
              <span className="text-sm font-bold text-slate-800">{formatWeekRange()}</span>
              <button
                type="button"
                onClick={() => setWeekOffset(weekOffset + 1)}
                className="p-1 hover:bg-slate-100 rounded-md cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">arrow_forward_ios</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto custom-scrollbar relative">
          <div className="min-w-[800px]">
            {/* Calendar Headers */}
            <div className="grid grid-cols-8 border-b border-slate-200 bg-white sticky top-0 z-20 text-center">
              <div className="h-12 border-r border-slate-100"></div>
              {weekDayLabels.map((d) => (
                <div
                  key={d.val}
                  onClick={() => setSelectedDay(d.val)}
                  className={`py-3 border-r border-slate-100 text-xs font-bold cursor-pointer transition-all hover:bg-slate-50 ${
                    d.val === selectedDay ? 'text-blue-600 bg-blue-50/50' : 'text-slate-500'
                  }`}
                >
                  {d.label}
                </div>
              ))}
            </div>

            {/* Timetable grid cells */}
            <div className="relative flex">
              <div className="w-[12.5%] flex flex-col z-10 bg-white border-r border-slate-200">
                {hours.map((h) => (
                  <div key={h.hour} className="h-24 text-right pr-3 pt-2 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100">
                    {h.label}
                  </div>
                ))}
              </div>

              <div className="flex-1 relative h-[960px]">
                {/* Vertical Day Lines */}
                <div className="absolute inset-0 grid grid-cols-7 pointer-events-none">
                  {[...Array(7)].map((_, i) => (
                    <div
                      key={i}
                      className={`border-r border-slate-100/60 ${i + 1 === selectedDay ? 'bg-blue-500/[0.01]' : ''}`}
                    ></div>
                  ))}
                </div>

                {/* Horizontal Hour Lines */}
                <div className="absolute inset-0 pointer-events-none flex flex-col">
                  {hours.map((h) => (
                    <div key={h.hour} className="h-24 border-b border-slate-100/60 w-full animate-pulse-slow"></div>
                  ))}
                </div>

                {/* Interactive Time Blocks */}
                {filteredBookings.map((b) => (
                  <div key={b.id} className="absolute p-1" style={getBookingStyle(b)}>
                    <div className="h-full w-full bg-blue-50 border-l-4 border-blue-600 p-2 rounded-lg shadow-sm overflow-hidden text-left hover:scale-[1.01] transition-all cursor-pointer">
                      <p className="text-[10px] font-bold text-blue-700 truncate">{b.asset.name}</p>
                      <p className="text-[9px] text-slate-500 truncate">Borrower: {b.employee.name}</p>
                      <p className="text-[8px] text-slate-400 mt-0.5 font-semibold">
                        {new Date(b.startTs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(b.endTs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Right-side Details & Creation Panel */}
      <section className="w-96 h-full bg-white border-l border-slate-200 flex flex-col z-30 justify-between">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-base font-bold text-slate-800">Booking Details</h3>
        </div>

        <form onSubmit={handleCreateBooking} className="flex-grow p-6 space-y-6 overflow-y-auto custom-scrollbar">
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-3">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-blue-600">meeting_room</span>
              <div className="w-full">
                <p className="text-[10px] font-bold text-blue-600 uppercase">Resource Selector</p>
                <select
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                  className="bg-transparent border-none p-0 text-base font-bold text-slate-800 focus:ring-0 outline-none cursor-pointer w-full"
                >
                  {assets.length === 0 ? (
                    <option value="">No Bookable Resources</option>
                  ) : (
                    assets.map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        {asset.name} ({asset.tag})
                      </option>
                    ))
                  )}
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
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 outline-none text-slate-800 font-semibold cursor-pointer"
                >
                  {weekDayLabels.map((d) => (
                    <option key={d.val} value={d.val}>
                      {d.name} ({d.label.split(' ')[1]}th)
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Start</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 outline-none text-slate-800 text-center font-semibold cursor-pointer"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">End</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 outline-none text-slate-800 text-center font-semibold cursor-pointer"
                    required
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
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 outline-none text-slate-800 font-medium"
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
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
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
