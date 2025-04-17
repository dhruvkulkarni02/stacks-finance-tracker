"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
// Import routes
const transactions_1 = __importDefault(require("./routes/transactions"));
const goals_1 = __importDefault(require("./routes/goals"));
const summary_1 = __importDefault(require("./routes/summary"));
const users_1 = __importDefault(require("./routes/users"));
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('dev'));
// API Routes
app.use('/api/transactions', transactions_1.default);
app.use('/api/goals', goals_1.default);
app.use('/api/summary', summary_1.default);
app.use('/api/ai-summary', summary_1.default);
app.use('/api/users', users_1.default);
// Health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is running' });
});
// Handle 404s
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});
exports.default = app;
