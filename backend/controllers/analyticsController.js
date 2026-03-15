const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

const getStartOfDay = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const getStartOfMonth = () => {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
};

// @desc    Get dashboard summary
// @route   GET /api/analytics/summary
// @access  Private
const getSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const startOfDay = getStartOfDay();
    const startOfMonth = getStartOfMonth();

    const transactions = await Transaction.find({ user: userId });

    let todaysIncome = 0;
    let todaysExpense = 0;
    let monthlyIncome = 0;
    let monthlyExpense = 0;
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(t => {
      const tDate = new Date(t.date);
      
      if (t.type === 'Income') totalIncome += t.amount;
      if (t.type === 'Expense') totalExpense += t.amount;

      // Monthly
      if (tDate >= startOfMonth) {
        if (t.type === 'Income') monthlyIncome += t.amount;
        if (t.type === 'Expense') monthlyExpense += t.amount;
      }
      
      // Daily
      if (tDate >= startOfDay) {
        if (t.type === 'Income') todaysIncome += t.amount;
        if (t.type === 'Expense') todaysExpense += t.amount;
      }
    });

    res.status(200).json({
      success: true,
      summary: {
        todaysIncome,
        todaysExpense,
        balanceToday: todaysIncome - todaysExpense,
        monthlyIncome,
        monthlyExpense,
        totalIncome,
        totalExpense,
        savings: totalIncome - totalExpense
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get analytics for charts
// @route   GET /api/analytics/reports
// @access  Private
const getReports = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    const targetDate = new Date();
    if (month) targetDate.setMonth(parseInt(month) - 1);
    if (year) targetDate.setFullYear(parseInt(year));
    
    const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59);
    
    const currentYearStart = new Date(targetDate.getFullYear(), 0, 1);
    const currentYearEnd = new Date(targetDate.getFullYear(), 11, 31, 23, 59, 59);

    const userObjectId = new mongoose.Types.ObjectId(req.user.id);

    // 1. Category Spending Breakdown (Current Month)
    const categoryData = await Transaction.aggregate([
      { 
        $match: { 
          user: userObjectId, 
          type: 'Expense',
          date: { $gte: startOfMonth, $lte: endOfMonth }
        } 
      },
      { 
        $group: { 
          _id: '$category', 
          total: { $sum: '$amount' } 
        } 
      },
      { $sort: { total: -1 } },
      { $limit: 5 } // Top 5 categories
    ]);

    // 2. Daily Income vs Expense for Current Month
    const dailyData = await Transaction.aggregate([
      { 
        $match: { 
          user: userObjectId, 
          date: { $gte: startOfMonth, $lte: endOfMonth }
        } 
      },
      {
        $group: {
          _id: { day: { $dayOfMonth: '$date' }, type: '$type' },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.day': 1 } }
    ]);

    // 3. Monthly Income vs Expense (Current Year)
    const monthlyData = await Transaction.aggregate([
      { 
        $match: { 
          user: userObjectId, 
          date: { $gte: currentYearStart, $lte: currentYearEnd }
        } 
      },
      {
        $group: {
          _id: { month: { $month: '$date' }, type: '$type' },
          total: { $sum: '$amount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      categoryData,
      dailyData,
      monthlyData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  getSummary,
  getReports
};
