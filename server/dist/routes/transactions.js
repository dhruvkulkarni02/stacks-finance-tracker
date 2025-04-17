"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server/src/routes/transactions.ts
const express_1 = __importDefault(require("express"));
const transactions_1 = require("../controllers/transactions");
const router = express_1.default.Router();
router.route('/')
    .get(transactions_1.getTransactions)
    .post(transactions_1.createTransaction);
router.route('/:id')
    .get(transactions_1.getTransactionById)
    .put(transactions_1.updateTransaction)
    .delete(transactions_1.deleteTransaction);
exports.default = router;
