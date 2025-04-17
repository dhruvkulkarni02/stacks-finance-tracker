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
exports.deleteGoal = exports.updateGoal = exports.getGoalById = exports.createGoal = exports.getGoals = void 0;
const Goal_1 = __importDefault(require("../models/Goal"));
// @desc    Get all goals for a user
// @route   GET /api/goals
const getGoals = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user } = req.query;
        if (!user) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        const goals = yield Goal_1.default.find({ userId: user }).sort({ createdAt: -1 });
        res.json(goals);
    }
    catch (error) {
        res.status(500).json({
            message: 'Error fetching goals',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.getGoals = getGoals;
// @desc    Create a new goal
// @route   POST /api/goals
const createGoal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const goal = new Goal_1.default(req.body);
        const savedGoal = yield goal.save();
        res.status(201).json(savedGoal);
    }
    catch (error) {
        res.status(400).json({
            message: 'Error creating goal',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.createGoal = createGoal;
// @desc    Get a goal by ID
// @route   GET /api/goals/:id
const getGoalById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const goal = yield Goal_1.default.findById(req.params.id);
        if (!goal) {
            return res.status(404).json({ message: 'Goal not found' });
        }
        res.json(goal);
    }
    catch (error) {
        res.status(500).json({
            message: 'Error fetching goal',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.getGoalById = getGoalById;
// @desc    Update a goal
// @route   PUT /api/goals/:id
const updateGoal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const goal = yield Goal_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!goal) {
            return res.status(404).json({ message: 'Goal not found' });
        }
        res.json(goal);
    }
    catch (error) {
        res.status(400).json({
            message: 'Error updating goal',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.updateGoal = updateGoal;
// @desc    Delete a goal
// @route   DELETE /api/goals/:id
const deleteGoal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const goal = yield Goal_1.default.findByIdAndDelete(req.params.id);
        if (!goal) {
            return res.status(404).json({ message: 'Goal not found' });
        }
        res.json({ message: 'Goal removed' });
    }
    catch (error) {
        res.status(500).json({
            message: 'Error deleting goal',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.deleteGoal = deleteGoal;
