import React, { useState, useEffect } from 'react';
import API from '../api';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { format } from 'date-fns';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

const Reports = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [year, setYear] = useState(new Date().getFullYear().toString());

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/analytics/reports?month=${month}&year=${year}`);
      setReports(data);
    } catch (error) {
      console.error('Failed to load reports', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [month, year]);

  const daysInMonth = new Date(year, month, 0).getDate();
  const dailyLabels = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const dailyChartData = {
    labels: dailyLabels,
    datasets: [
      {
        label: 'Income',
        data: dailyLabels.map(day => {
          // Handle both old format (_id: number) and new format (_id: {day, type})
          const items = reports?.dailyData?.filter(d => {
            if (d._id && typeof d._id === 'object') {
              return d._id.day === day && d._id.type?.toLowerCase() === 'income';
            }
            return false;
          });
          return items?.reduce((sum, item) => sum + item.total, 0) || 0;
        }),
        borderColor: '#22C55E',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Expense',
        data: dailyLabels.map(day => {
          const items = reports?.dailyData?.filter(d => {
            if (d._id && typeof d._id === 'object') {
              return d._id.day === day && d._id.type?.toLowerCase() === 'expense';
            }
            return false;
          });
          return items?.reduce((sum, item) => sum + item.total, 0) || 0;
        }),
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const categoryChartData = {
    labels: reports?.categoryData?.map(item => item._id) || [],
    datasets: [
      {
        data: reports?.categoryData?.map(item => item.total) || [],
        backgroundColor: ['#4F46E5', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'],
        borderWidth: 0,
      },
    ],
  };

  const monthlyChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Income',
        data: Array.from({ length: 12 }, (_, i) => {
          const items = reports?.monthlyData?.filter(d => d._id.month === i + 1 && d._id.type?.toLowerCase() === 'income');
          return items ? items.reduce((sum, item) => sum + item.total, 0) : 0;
        }),
        backgroundColor: '#22C55E',
        borderRadius: 4,
      },
      {
        label: 'Expense',
        data: Array.from({ length: 12 }, (_, i) => {
          const items = reports?.monthlyData?.filter(d => d._id.month === i + 1 && d._id.type?.toLowerCase() === 'expense');
          return items ? items.reduce((sum, item) => sum + item.total, 0) : 0;
        }),
        backgroundColor: '#EF4444',
        borderRadius: 4,
      }
    ],
  };

  const currentMonthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-500 text-sm mt-1">Detailed view of your finances</p>
        </div>
        
        <div className="flex bg-white rounded-xl shadow-sm border border-gray-100 p-1">
          <select
            className="px-4 py-2 bg-transparent text-sm focus:outline-none focus:ring-0 border-r border-gray-100 font-medium"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          >
            {Array.from({ length: 12 }, (_, i) => {
              const num = (i + 1).toString().padStart(2, '0');
              const name = new Date(2000, i).toLocaleString('default', { month: 'short' });
              return <option key={num} value={num}>{name}</option>;
            })}
          </select>
          <select
            className="px-4 py-2 bg-transparent text-sm focus:outline-none focus:ring-0 font-medium"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            {Array.from({ length: 5 }, (_, i) => {
              const y = new Date().getFullYear() - i;
              return <option key={y} value={y}>{y}</option>;
            })}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-gray-400">Loading reports...</div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Daily Income vs Expense ({currentMonthName} {year})</h2>
            <div className="h-72">
              <Line 
                data={dailyChartData} 
                options={{ 
                  maintainAspectRatio: false,
                  scales: { 
                    y: { beginAtZero: true, grid: { color: '#f1f5f9' }, border: { display: false } }, 
                    x: { grid: { display: false }, border: { display: false } } 
                  },
                  plugins: { legend: { display: true, position: 'top', align: 'end', labels: { usePointStyle: true, boxWidth: 8 } } }
                }} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Income vs Expense ({year})</h2>
              <div className="h-64">
                <Bar 
                  data={monthlyChartData} 
                  options={{ 
                    maintainAspectRatio: false,
                    scales: { 
                      y: { beginAtZero: true, grid: { color: '#f1f5f9' }, border: { display: false } }, 
                      x: { grid: { display: false }, border: { display: false } } 
                    },
                    plugins: { legend: { position: 'top', align: 'end', labels: { usePointStyle: true, boxWidth: 8 } } }
                  }} 
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Expense Breakdown ({currentMonthName} {year})</h2>
              {reports?.categoryData?.length > 0 ? (
                <div className="h-64">
                  <Doughnut 
                    data={categoryChartData} 
                    options={{ 
                      maintainAspectRatio: false,
                      cutout: '70%',
                      plugins: { legend: { position: 'right', labels: { usePointStyle: true, padding: 20 } } } 
                    }} 
                  />
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-400">No expenses this month</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
