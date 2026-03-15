import React, { useState, useEffect } from 'react';
import API from '../api';
import TransactionModal from '../components/TransactionModal';
import { toast } from 'react-toastify';
import { Plus, Search, Filter, Edit2, Trash2, ArrowLeft, ArrowRight, Receipt } from 'lucide-react';
import { format } from 'date-fns';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [month, setMonth] = useState('');

  const fetchTransactions = async (page = 1) => {
    setLoading(true);
    try {
      let query = `/transactions?page=${page}&limit=10`;
      if (search) query += `&search=${search}`;
      if (type) query += `&type=${type}`;
      if (category) query += `&category=${category}`;
      if (month) {
        const startDate = `${month}-01`;
        const lastDay = new Date(month.split('-')[0], month.split('-')[1], 0).getDate();
        const endDate = `${month}-${lastDay}`;
        query += `&startDate=${startDate}&endDate=${endDate}`;
      }

      const { data } = await API.get(query);
      setTransactions(data.transactions);
      setPagination(data.pagination);
    } catch (error) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [type, category, month]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTransactions(1);
  };

  const handleSave = async (formData) => {
    try {
      if (editingTransaction) {
        await API.put(`/transactions/${editingTransaction._id}`, formData);
        toast.success('Transaction updated');
      } else {
        await API.post('/transactions', formData);
        toast.success('Transaction added');
      }
      setIsModalOpen(false);
      fetchTransactions(pagination.page);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await API.delete(`/transactions/${id}`);
        toast.success('Transaction deleted');
        fetchTransactions(pagination.page);
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  const openAddModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const openEditModal = (t) => {
    setEditingTransaction(t);
    setIsModalOpen(true);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your income and expenses</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl shadow-sm hover:bg-indigo-700 transition-colors w-full sm:w-auto justify-center"
        >
          <Plus className="h-4 w-4" />
          Add Transaction
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search notes or category..."
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            <select
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary flex-1 sm:flex-none"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
            </select>
            <input
              type="month"
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary flex-1 sm:flex-none"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
            <button type="submit" className="hidden sm:block px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium">
              Filter
            </button>
          </div>
        </form>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">Loading...</div>
        ) : transactions.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
            <Receipt className="h-12 w-12 text-gray-200 mb-2" />
            <p>No transactions found</p>
          </div>
        ) : (
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-medium">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 hidden md:table-cell">Notes</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((t) => (
                  <tr key={t._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {format(new Date(t.date), 'MMM dd, yyyy')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${t.type === 'Income' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-sm font-medium text-gray-800">{t.category}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell text-sm text-gray-500 truncate max-w-xs">
                      {t.notes || '-'}
                    </td>
                    <td className={`py-3 px-4 text-right text-sm font-bold ${t.type === 'Income' ? 'text-green-600' : 'text-gray-900'}`}>
                      {t.type === 'Income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2 text-gray-400">
                        <button onClick={() => openEditModal(t)} className="hover:text-amber-500 transition-colors">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(t._id)} className="hover:text-red-500 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {pagination.pages > 1 && (
          <div className="border-t border-gray-100 p-4 flex items-center justify-between bg-gray-50">
            <p className="text-sm text-gray-500">
              Page <span className="font-medium">{pagination.page}</span> of <span className="font-medium">{pagination.pages}</span> (Total <span className="font-medium">{pagination.total}</span>)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => fetchTransactions(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-1 px-3 border border-gray-300 rounded-lg bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm transition-colors"
               >
                <ArrowLeft className="h-4 w-4" /> Prev
              </button>
              <button
                onClick={() => fetchTransactions(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="p-1 px-3 border border-gray-300 rounded-lg bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm transition-colors"
               >
                Next <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transaction={editingTransaction}
        onSave={handleSave}
      />
    </div>
  );
};

export default Transactions;
