"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server/src/app.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
// Import routes
const transactions_1 = __importDefault(require("./routes/transactions"));
const goals_1 = __importDefault(require("./routes/goals"));
const summary_1 = __importDefault(require("./routes/summary"));
const users_1 = __importDefault(require("./routes/users"));
const budgets_1 = __importDefault(require("./routes/budgets"));
const recurringTransactions_1 = __importDefault(require("./routes/recurringTransactions"));
const financialGoals_1 = __importDefault(require("./routes/financialGoals"));
const ai_1 = require("./routes/ai");
const advancedAI_1 = require("./routes/advancedAI");
const realTimeMonitoring_1 = __importDefault(require("./routes/realTimeMonitoring"));
const smartBudget_1 = __importDefault(require("./routes/smartBudget"));
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        process.env.CLIENT_URL || 'http://localhost:3000'
    ],
    credentials: true
}));
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('dev'));
// API Routes
app.use('/api/transactions', transactions_1.default);
app.use('/api/goals', goals_1.default);
app.use('/api/summary', summary_1.default);
app.use('/api/users', users_1.default);
app.use('/api/budgets', budgets_1.default);
app.use('/api/recurring-transactions', recurringTransactions_1.default);
app.use('/api/financial-goals', financialGoals_1.default);
app.use('/api/ai', ai_1.aiRoutes);
app.use('/api/ai-advanced', advancedAI_1.advancedAIRoutes);
app.use('/api/monitoring', realTimeMonitoring_1.default);
app.use('/api/smart-budget', smartBudget_1.default);
// Health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is running' });
});
// Handle 404s
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});
// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : {}
    });
});
exports.default = app;
