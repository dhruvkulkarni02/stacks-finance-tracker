// server/src/routes/transactions.ts
import express from 'express';
import { 
  getTransactions, 
  createTransaction, 
  getTransactionById, 
  updateTransaction, 
  deleteTransaction 
} from '../controllers/transactions';

const router = express.Router();

router.route('/')
  .get(getTransactions)
  .post(createTransaction);

router.route('/:id')
  .get(getTransactionById)
  .put(updateTransaction)
  .delete(deleteTransaction);

export default router;