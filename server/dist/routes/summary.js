"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server/src/routes/summary.ts
const express_1 = __importDefault(require("express"));
const summary_1 = require("../controllers/summary");
const router = express_1.default.Router();
router.get('/', summary_1.getSummary);
router.post('/ai-summary', summary_1.getAiSummary);
router.get('/trend', summary_1.getMonthlyTrend);
exports.default = router;
