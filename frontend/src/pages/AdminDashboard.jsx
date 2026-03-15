import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api';
import { toast } from 'react-toastify';
import { Trash2, Users, LogOut, Shield, ShieldOff, AlertTriangle, ServerCrash, CheckCircle, WifiOff } from 'lucide-react';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const { logout, maintenanceMode, setMaintenanceMode } = useContext(AuthContext);

  const fetchUsers = async () => {
    try {
      const { data } = await API.get('/admin/users');
      setUsers(data.users);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this user and all their transactions? This action is irreversible.')) {
      try {
        await API.delete(`/admin/users/${id}`);
        toast.success('User deleted successfully');
        fetchUsers();
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  const handleToggleBan = async (id, currentlyBanned) => {
    try {
      await API.put(`/admin/users/${id}/ban`);
      toast.success(currentlyBanned ? 'User unbanned' : 'User banned');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const handleSetMaintenanceMode = async (mode) => {
    setSettingsLoading(true);
    try {
      const { data } = await API.put('/admin/settings', { maintenanceMode: mode });
      setMaintenanceMode(data.maintenanceMode);
      toast.success(mode === 'none' ? 'Site is back online!' : `${mode} mode enabled for all users`);
    } catch (error) {
      toast.error('Failed to update site settings');
    } finally {
      setSettingsLoading(false);
    }
  };

  const modeButtons = [
    {
      mode: 'none',
      label: 'Online',
      description: 'Site is fully operational',
      icon: CheckCircle,
      color: 'green',
    },
    {
      mode: '404',
      label: '404 Error',
      description: 'Show 404 page to all users',
      icon: WifiOff,
      color: 'indigo',
    },
    {
      mode: '500',
      label: 'Server Error',
      description: 'Show 500 error to all users',
      icon: ServerCrash,
      color: 'red',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 md:p-8 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-indigo-900 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between shadow-lg text-white">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Shield className="h-8 w-8 text-indigo-300" />
              Admin Portal
            </h1>
            <p className="text-indigo-200 mt-2">Full control over HB Money</p>
          </div>
          <button
            onClick={logout}
            className="mt-4 md:mt-0 px-6 py-2.5 bg-indigo-800 hover:bg-indigo-700 rounded-xl font-medium flex items-center gap-2 transition-colors border border-indigo-700"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>

        {/* ─── Maintenance Mode ─── */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Site Maintenance Controls</h2>
              <p className="text-sm text-gray-500">Toggle what all regular users see when they login</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {modeButtons.map(({ mode, label, description, icon: Icon, color }) => {
              const isActive = maintenanceMode === mode;
              const colorMap = {
                green: 'border-green-400 bg-green-50 text-green-700 ring-green-400',
                indigo: 'border-indigo-400 bg-indigo-50 text-indigo-700 ring-indigo-400',
                red: 'border-red-400 bg-red-50 text-red-700 ring-red-400',
              };
              const inactiveMap = {
                green: 'border-gray-200 hover:border-green-300 hover:bg-green-50/50 text-gray-600',
                indigo: 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-gray-600',
                red: 'border-gray-200 hover:border-red-300 hover:bg-red-50/50 text-gray-600',
              };
              return (
                <button
                  key={mode}
                  onClick={() => handleSetMaintenanceMode(mode)}
                  disabled={settingsLoading || isActive}
                  className={`relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all
                    ${isActive ? `${colorMap[color]} ring-2` : inactiveMap[color]}
                    disabled:cursor-not-allowed`}
                >
                  {isActive && (
                    <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider bg-white/80 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                  <Icon className={`h-7 w-7 ${isActive ? '' : 'opacity-60'}`} />
                  <div className="text-center">
                    <p className="font-semibold text-sm">{label}</p>
                    <p className="text-xs opacity-70 mt-0.5">{description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Users Table ─── */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Registered Users ({users.length})</h2>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-400">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-gray-400">No users found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 text-xs uppercase text-gray-500 font-medium">
                    <th className="py-4 px-6">User</th>
                    <th className="py-4 px-6">Email</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Joined</th>
                    <th className="py-4 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => (
                    <tr key={u._id} className={`hover:bg-gray-50/50 transition-colors ${u.isBanned ? 'opacity-60' : ''}`}>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {u.profilePicture ? (
                            <img src={u.profilePicture} alt="" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-indigo-100 text-primary flex items-center justify-center font-bold">
                              {u.name.charAt(0)}
                            </div>
                          )}
                          <span className="font-medium text-gray-900">{u.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-500">{u.email}</td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium w-fit
                            ${u.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {u.isVerified ? 'Verified' : 'Pending'}
                          </span>
                          {u.isBanned && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 w-fit">
                              Banned
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-500">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleToggleBan(u._id, u.isBanned)}
                            className={`p-2 rounded-lg transition-colors ${u.isBanned
                              ? 'text-green-500 hover:bg-green-50'
                              : 'text-amber-500 hover:bg-amber-50'
                              }`}
                            title={u.isBanned ? 'Unban User' : 'Ban User'}
                          >
                            {u.isBanned ? <ShieldOff className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
                          </button>
                          <button
                            onClick={() => handleDelete(u._id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
                            title="Delete User"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
