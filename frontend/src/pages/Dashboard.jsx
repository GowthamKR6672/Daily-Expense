import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api';
import ProfileModal from '../components/ProfileModal';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [summary, setSummary] = useState(null);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [sumRes, repRes] = await Promise.all([
          API.get('/analytics/summary'),
          API.get('/analytics/reports')
        ]);
        setSummary(sumRes.data.summary);
        setReports(repRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="flex h-full items-center justify-center">Loading dashboard...</div>;

  const summaryCards = [
    { title: "Today's Income", amount: summary?.todaysIncome || 0, color: 'text-green-600', bg: 'bg-green-50' },
    { title: "Today's Expense", amount: summary?.todaysExpense || 0, color: 'text-red-500', bg: 'bg-red-50' },
    { title: "Monthly Balance", amount: (summary?.monthlyIncome || 0) - (summary?.monthlyExpense || 0), color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: "Monthly Income", amount: summary?.monthlyIncome || 0, color: 'text-green-600', bg: 'bg-green-50' },
    { title: "Monthly Expense", amount: summary?.monthlyExpense || 0, color: 'text-red-500', bg: 'bg-red-50' },
  ];

  // Prepare chart data
  const categoryChartData = {
    labels: reports?.categoryData?.map(item => item._id) || [],
    datasets: [
      {
        data: reports?.categoryData?.map(item => item.total) || [],
        backgroundColor: ['#4F46E5', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6'],
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hi, {user?.name.split(' ')[0]}! 👋</h1>
          <p className="text-gray-500 text-sm mt-1">Here is your daily summary</p>
        </div>
      {/* Profile avatar — clickable */}
        {user?.profilePicture ? (
          <button onClick={() => setIsProfileOpen(true)} className="rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-400">
            <img src={user.profilePicture} alt="Profile" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
          </button>
        ) : (
          <button onClick={() => setIsProfileOpen(true)} className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-primary font-bold shadow-sm hover:bg-indigo-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400">
            {user?.name?.charAt(0)?.toUpperCase()}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {summaryCards.map((card, idx) => (
          <div key={idx} className={`${idx === 0 || idx === 1 ? 'col-span-1' : idx === 2 ? 'col-span-2 lg:col-span-1' : 'col-span-1'} bg-white p-5 rounded-3xl shadow-sm border border-gray-100`}>
             <h3 className="text-gray-500 text-xs font-medium mb-2 uppercase tracking-wider">{card.title}</h3>
             <p className={`text-2xl font-bold ${card.color}`}>₹{card.amount.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 lg:col-span-1">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Top Expenses</h2>
          {reports?.categoryData?.length > 0 ? (
            <div className="h-64 relative">
              <Doughnut 
                data={categoryChartData} 
                options={{ 
                  maintainAspectRatio: false,
                  cutout: '75%',
                  plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } } } 
                }} 
              />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">No data available</div>
          )}
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Income vs Expense</h2>
          <div className="h-64 relative w-full">
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
      </div>

      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
};

export default Dashboard;
