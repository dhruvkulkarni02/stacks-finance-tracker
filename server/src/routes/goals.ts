// server/src/routes/goals.ts
import express from 'express';
import { 
  getGoals, 
  createGoal, 
  getGoalById, 
  updateGoal, 
  deleteGoal 
} from '../controllers/goals';

const router = express.Router();

router.route('/')
  .get(getGoals)
  .post(createGoal);

router.route('/:id')
  .get(getGoalById)
  .put(updateGoal)
  .delete(deleteGoal);

export default router;