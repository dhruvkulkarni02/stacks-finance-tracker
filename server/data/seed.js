// server/data/seed.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB connected...');
    
    // We need to import the compiled models
    const Transaction = require('../dist/models/Transaction').default;
    const Goal = require('../dist/models/Goal').default;
    
    try {
      // Sample data
      const transactions = [
        {
          userId: 'user123',
          type: 'income',
          amount: 3500,
          category: 'salary',
          date: '2025-04-01',
          note: 'Monthly salary'
        },
        {
          userId: 'user123',
          type: 'expense',
          amount: 800,
          category: 'rent',
          date: '2025-04-03',
          note: 'Monthly rent'
        },
        {
          userId: 'user123',
          type: 'expense',
          amount: 120.50,
          category: 'groceries',
          date: '2025-04-05',
          note: 'Weekly grocery shopping'
        },
        {
          userId: 'user123',
          type: 'expense',
          amount: 45.99,
          category: 'utilities',
          date: '2025-04-10',
          note: 'Electricity bill'
        },
        {
          userId: 'user123',
          type: 'expense',
          amount: 25.99,
          category: 'entertainment',
          date: '2025-04-15',
          note: 'Movie subscription'
        },
        {
          userId: 'user123',
          type: 'expense',
          amount: 350,
          category: 'transportation',
          date: '2025-04-18',
          note: 'Car maintenance'
        },
        {
          userId: 'user123',
          type: 'income',
          amount: 200,
          category: 'freelance',
          date: '2025-04-20',
          note: 'Website design project'
        }
      ];

      const goals = [
        {
          userId: 'user123',
          name: 'Emergency Fund',
          targetAmount: 10000,
          currentAmount: 5000,
          category: 'emergency'
        },
        {
          userId: 'user123',
          name: 'Vacation to Japan',
          targetAmount: 3500,
          currentAmount: 1200,
          targetDate: '2026-01-15',
          category: 'vacation'
        },
        {
          userId: 'user123',
          name: 'New Laptop',
          targetAmount: 1500,
          currentAmount: 500,
          targetDate: '2025-08-01',
          category: 'electronics'
        }
      ];
      
      // Clear existing data
      await Transaction.deleteMany();
      await Goal.deleteMany();
      
      // Insert new data
      await Transaction.insertMany(transactions);
      await Goal.insertMany(goals);
      
      console.log('Data imported successfully!');
      process.exit();
    } catch (error) {
      console.error('Error importing data:', error);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Error connecting to the database:', err);
    process.exit(1);
  });