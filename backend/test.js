const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('./models/User');
const Transaction = require('./models/Transaction');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    // get a user
    const user = await User.findOne({});
    if(!user) {
        console.log("No user found");
        process.exit();
    }
    
    const targetDate = new Date();
    targetDate.setMonth(2); // March
    targetDate.setFullYear(2026);
    
    const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59);

    const dailyData = await Transaction.aggregate([
      { 
        $match: { 
          user: new mongoose.Types.ObjectId(user._id), 
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
    
    console.log("Found User ID:", user._id);
    console.log("Start Date (local):", startOfMonth);
    console.log("End Date (local):", endOfMonth);
    console.log("Daily Data returned by aggregate:");
    console.dir(dailyData, { depth: null });
    
    process.exit();
}).catch(e => console.error(e));
