"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server/src/routes/goals.ts
const express_1 = __importDefault(require("express"));
const goals_1 = require("../controllers/goals");
const router = express_1.default.Router();
router.route('/')
    .get(goals_1.getGoals)
    .post(goals_1.createGoal);
router.route('/:id')
    .get(goals_1.getGoalById)
    .put(goals_1.updateGoal)
    .delete(goals_1.deleteGoal);
exports.default = router;
