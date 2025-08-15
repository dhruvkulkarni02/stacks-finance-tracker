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
exports.deleteTransaction = exports.updateTransaction = exports.getTransactionById = exports.createTransaction = exports.getTransactions = void 0;
const Transaction_1 = __importDefault(require("../models/Transaction"));
// @desc    Get all transactions for a user, with optional filtering
// @route   GET /api/transactions
const getTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { month, category, type, search, minAmount, maxAmount, startDate, endDate, limit, page } = req.query;
        // Get userId from auth middleware
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        // Build query
        const query = { userId: userId };
        // Add month filter if provided
        if (month) {
            const monthStr = month;
            query.date = { $regex: `^${monthStr}` };
        }
        // Add date range filter
        if (startDate || endDate) {
            query.date = {};
            if (startDate)
                query.date.$gte = new Date(startDate);
            if (endDate)
                query.date.$lte = new Date(endDate);
        }
        // Add category filter
        if (category && category !== 'all') {
            query.category = category;
        }
        // Add type filter
        if (type && type !== 'all') {
            query.type = type;
        }
        // Add amount range filter
        if (minAmount || maxAmount) {
            query.amount = {};
            if (minAmount)
                query.amount.$gte = parseFloat(minAmount);
            if (maxAmount)
                query.amount.$lte = parseFloat(maxAmount);
        }
        // Add text search
        if (search) {
            query.$or = [
                { category: { $regex: search, $options: 'i' } },
                { note: { $regex: search, $options: 'i' } }
            ];
        }
        // Pagination
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 50;
        const skip = (pageNum - 1) * limitNum;
        const transactions = yield Transaction_1.default.find(query)
            .sort({ date: -1 })
            .skip(skip)
            .limit(limitNum);
        // Get total count for pagination
        const total = yield Transaction_1.default.countDocuments(query);
        res.json({
            transactions,
            pagination: {
                current: pageNum,
                pages: Math.ceil(total / limitNum),
                total
            }
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Error fetching transactions',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.getTransactions = getTransactions;
// @desc    Create a new transaction
// @route   POST /api/transactions
const createTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const transactionData = Object.assign(Object.assign({}, req.body), { userId: userId });
        const transaction = new Transaction_1.default(transactionData);
        const savedTransaction = yield transaction.save();
        res.status(201).json(savedTransaction);
    }
    catch (error) {
        res.status(400).json({
            message: 'Error creating transaction',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.createTransaction = createTransaction;
// @desc    Get a transaction by ID
// @route   GET /api/transactions/:id
const getTransactionById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transaction = yield Transaction_1.default.findById(req.params.id);
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        res.json(transaction);
    }
    catch (error) {
        res.status(500).json({
            message: 'Error fetching transaction',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.getTransactionById = getTransactionById;
// @desc    Update a transaction
// @route   PUT /api/transactions/:id
const updateTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transaction = yield Transaction_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        res.json(transaction);
    }
    catch (error) {
        res.status(400).json({
            message: 'Error updating transaction',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.updateTransaction = updateTransaction;
// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
const deleteTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transaction = yield Transaction_1.default.findByIdAndDelete(req.params.id);
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        res.json({ message: 'Transaction removed' });
    }
    catch (error) {
        res.status(500).json({
            message: 'Error deleting transaction',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.deleteTransaction = deleteTransaction;
