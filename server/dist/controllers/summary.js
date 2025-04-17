"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMonthlyTrend = exports.getAiSummary = exports.getSummary = void 0;
const Transaction_1 = __importDefault(require("../models/Transaction"));
// @desc    Get financial summary for a user (income, expenses, balance)
// @route   GET /api/summary
const getSummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user, month } = req.query;
        if (!user) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        // Build query
        const query = { userId: user };
        // Add month filter if provided
        if (month) {
            const monthStr = month;
            query.date = { $regex: `^${monthStr}` };
        }
        // Get all transactions matching query
        const transactions = yield Transaction_1.default.find(query);
        // Calculate summary
        let income = 0;
        let expenses = 0;
        transactions.forEach(transaction => {
            if (transaction.type === 'income') {
                income += transaction.amount;
            }
            else {
                expenses += transaction.amount;
            }
        });
        // Calculate balance
        const balance = income - expenses;
        res.json({
            income,
            expenses,
            balance,
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Error generating summary',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.getSummary = getSummary;
// @desc    Get AI summary of spending habits
// @route   POST /api/ai-summary
const getAiSummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, month } = req.body;
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        // Build query for fetching relevant transactions
        const query = { userId };
        // Add month filter if provided
        if (month) {
            query.date = { $regex: `^${month}` };
        }
        // Fetch transactions for analysis
        const transactions = yield Transaction_1.default.find(query);
        // If OpenAI integration is implemented, this would call their API
        // For now, we'll generate a simple analysis based on transactions
        // Calculate category totals for expenses
        const categoryTotals = {};
        let totalExpenses = 0;
        transactions.forEach(transaction => {
            if (transaction.type === 'expense') {
                const category = transaction.category;
                categoryTotals[category] = (categoryTotals[category] || 0) + transaction.amount;
                totalExpenses += transaction.amount;
            }
        });
        // Find top spending categories
        const categories = Object.keys(categoryTotals).map(category => ({
            category,
            amount: categoryTotals[category],
            percentage: totalExpenses > 0 ? (categoryTotals[category] / totalExpenses) * 100 : 0
        }));
        // Sort by amount (highest first)
        categories.sort((a, b) => b.amount - a.amount);
        // Generate insights
        const insights = categories.slice(0, 3).map(cat => {
            // Random trend for demo purposes
            const trends = ['up', 'down', 'stable'];
            const randomTrend = trends[Math.floor(Math.random() * trends.length)];
            return {
                category: cat.category,
                percentage: Math.round(cat.percentage),
                trend: randomTrend
            };
        });
        // Generate text summary
        let summary = '';
        if (categories.length > 0) {
            const topCategory = categories[0].category;
            summary = `Based on your recent transactions, you've spent most on ${topCategory} (${Math.round(categories[0].percentage)}% of expenses).`;
            if (categories.length > 1) {
                summary += ` Your second highest category was ${categories[1].category} at ${Math.round(categories[1].percentage)}%.`;
            }
            // Add a random tip
            const tips = [
                `Consider setting a budget for ${topCategory} to manage these expenses better.`,
                `You might want to track your ${topCategory} spending more closely in the coming month.`,
                `Your savings could improve by reducing ${topCategory} expenses by 10%.`
            ];
            summary += ` ${tips[Math.floor(Math.random() * tips.length)]}`;
        }
        else {
            summary = `We don't have enough transaction data yet to provide meaningful insights. Add more transactions to get personalized spending analysis.`;
        }
        res.json({
            summary,
            insights
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Error generating AI summary',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.getAiSummary = getAiSummary;
// @desc    Get monthly spending trend
// @route   GET /api/summary/trend
const getMonthlyTrend = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user, months } = req.query;
        const monthsToShow = parseInt(months) || 6;
        if (!user) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        // Get current date
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        // Generate array of months to query (current month and previous months)
        const monthsArray = [];
        for (let i = 0; i < monthsToShow; i++) {
            let year = currentYear;
            let month = currentMonth - i;
            if (month <= 0) {
                month += 12;
                year -= 1;
            }
            // Format month to ensure two digits
            const monthFormatted = month.toString().padStart(2, '0');
            monthsArray.push(`${year}-${monthFormatted}`);
        }
        // Create results object to store monthly totals
        const results = {};
        // Initialize results with zero values
        monthsArray.forEach(month => {
            results[month] = { income: 0, expenses: 0 };
        });
        // Query all transactions for these months
        const query = {
            userId: user,
            date: { $regex: `^(${monthsArray.join('|')})` }
        };
        const transactions = yield Transaction_1.default.find(query);
        // Calculate totals for each month
        transactions.forEach(transaction => {
            const monthYear = transaction.date.substring(0, 7); // Get YYYY-MM part
            if (results[monthYear]) {
                if (transaction.type === 'income') {
                    results[monthYear].income += transaction.amount;
                }
                else {
                    results[monthYear].expenses += transaction.amount;
                }
            }
        });
        // Format results for chart display
        const chartData = monthsArray.map(month => ({
            month,
            income: results[month].income,
            expenses: results[month].expenses,
            savings: results[month].income - results[month].expenses
        }));
        // Reverse to show oldest to newest
        chartData.reverse();
        res.json(chartData);
    }
    catch (error) {
        res.status(500).json({
            message: 'Error generating monthly trend',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.getMonthlyTrend = getMonthlyTrend;
