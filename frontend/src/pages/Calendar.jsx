import React, { useState, useEffect } from 'react';
import API from '../api';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Calendar = () => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const monthStr = (month + 1).toString().padStart(2, '0');
      const lastDay = new Date(year, month + 1, 0).getDate();
      const startDate = `${year}-${monthStr}-01`;
      const endDate = `${year}-${monthStr}-${lastDay}`;
      const { data } = await API.get(`/transactions?startDate=${startDate}&endDate=${endDate}&limit=500`);
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('Failed to load transactions', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    setSelectedDay(null);
  }, [year, month]);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  // Build map of day -> { income, expense, items }
  const dayMap = {};
  transactions.forEach(t => {
    const d = new Date(t.date);
    const day = d.getDate();
    if (!dayMap[day]) dayMap[day] = { income: 0, expense: 0, items: [] };
    if (t.type?.toLowerCase() === 'income') dayMap[day].income += t.amount;
    else dayMap[day].expense += t.amount;
    dayMap[day].items.push(t);
  });

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = new Date(year, month).toLocaleString('default', { month: 'long' });
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const selectedItems = selectedDay ? dayMap[selectedDay]?.items || [] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-500 text-sm mt-1">Daily income and expense overview</p>
        </div>
        <div className="flex items-center gap-3 bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-2">
          <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <span className="font-semibold text-gray-800 min-w-[140px] text-center">
            {monthName} {year}
          </span>
          <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {dayNames.map(d => (
            <div key={d} className="py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        {loading ? (
          <div className="h-64 flex items-center justify-center text-gray-400">Loading...</div>
        ) : (
          <div className="grid grid-cols-7">
            {/* Empty cells before the first day */}
            {Array.from({ length: firstDayOfMonth }, (_, i) => (
              <div key={`empty-${i}`} className="min-h-[90px] border-b border-r border-gray-50 bg-gray-50/50" />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const data = dayMap[day];
              const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
              const isSelected = selectedDay === day;

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(isSelected ? null : day)}
                  className={`min-h-[90px] border-b border-r border-gray-50 p-2 cursor-pointer transition-colors
                    ${isSelected ? 'bg-indigo-50 ring-2 ring-inset ring-indigo-300' : 'hover:bg-gray-50'}
                    ${(firstDayOfMonth + i) % 7 === 6 ? 'border-r-0' : ''}
                  `}
                >
                  <div className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold mb-1
                    ${isToday ? 'bg-indigo-600 text-white' : 'text-gray-700'}
                  `}>
                    {day}
                  </div>
                  {data && (
                    <div className="space-y-0.5">
                      {data.income > 0 && (
                        <div className="text-[10px] font-semibold text-green-600 bg-green-50 rounded-md px-1.5 py-0.5 truncate">
                          <span className="hidden sm:inline">+₹</span>
                          {data.income.toLocaleString()}
                        </div>
                      )}
                      {data.expense > 0 && (
                        <div className="text-[10px] font-semibold text-red-500 bg-red-50 rounded-md px-1.5 py-0.5 truncate">
                          <span className="hidden sm:inline">-₹</span>
                          {data.expense.toLocaleString()}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail panel for selected day */}
      {selectedDay && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            {monthName} {selectedDay}, {year}
          </h2>
          {selectedItems.length === 0 ? (
            <p className="text-gray-400 text-sm">No transactions on this day.</p>
          ) : (
            <div className="space-y-2">
              {selectedItems.map(t => (
                <div key={t._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${t.type?.toLowerCase() === 'income' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{t.category}</p>
                      {t.notes && <p className="text-xs text-gray-400">{t.notes}</p>}
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${t.type?.toLowerCase() === 'income' ? 'text-green-600' : 'text-gray-800'}`}>
                    {t.type?.toLowerCase() === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Calendar;
