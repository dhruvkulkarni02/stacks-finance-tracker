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
exports.updateUserProfile = exports.getUserProfile = exports.loginUser = exports.registerUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
// Generate JWT token
const generateToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: '30d',
    });
};
// @desc    Register a new user
// @route   POST /api/users
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        // Add validation for required fields
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }
        // Check if user already exists
        const userExists = yield User_1.default.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        // Create new user with additional fields
        const user = yield User_1.default.create({
            name,
            email,
            password,
            // Add additional fields as needed
            lastLogin: new Date(),
            preferences: {
                currency: 'USD',
                theme: 'light',
                notifications: true
            }
        });
        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            });
        }
        else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    }
    catch (error) {
        console.error('Registration error:', error);
        // Handle mongoose validation errors
        if (error instanceof Error && error.name === 'ValidationError') {
            const validationErrors = {};
            // Extract validation errors from mongoose
            if ('errors' in error) {
                const mongooseErrors = error.errors;
                for (const field in mongooseErrors) {
                    validationErrors[field] = mongooseErrors[field].message;
                }
            }
            return res.status(400).json({
                message: 'Validation failed',
                errors: validationErrors
            });
        }
        // Handle duplicate email error
        if (error instanceof Error && 'code' in error && error.code === 11000) {
            return res.status(400).json({
                message: 'Email already exists. Please use a different email address.'
            });
        }
        res.status(500).json({
            message: 'Error registering user. Please try again.',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.registerUser = registerUser;
// @desc    Authenticate user & get token
// @route   POST /api/users/login
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Find user by email
        const user = yield User_1.default.findOne({ email });
        // Check if user exists and password matches
        if (user && (yield user.matchPassword(password))) {
            // Update last login time
            user.lastLogin = new Date();
            yield user.save();
            const token = generateToken(user._id);
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: token,
            });
        }
        else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            message: 'Error logging in',
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : '') : undefined
        });
    }
});
exports.loginUser = loginUser;
// @desc    Get user profile
// @route   GET /api/users/profile
const getUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findById(req.userId).select('-password');
        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                preferences: user.preferences,
                lastLogin: user.lastLogin,
                createdAt: user.createdAt,
            });
        }
        else {
            res.status(404).json({ message: 'User not found' });
        }
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            message: 'Error fetching user profile',
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : '') : undefined
        });
    }
});
exports.getUserProfile = getUserProfile;
// @desc    Update user profile
// @route   PUT /api/users/profile
const updateUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findById(req.userId);
        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            // Update preferences if provided
            if (req.body.preferences) {
                user.preferences = Object.assign(Object.assign({}, user.preferences), req.body.preferences);
            }
            // Update password if provided
            if (req.body.password) {
                user.password = req.body.password;
            }
            const updatedUser = yield user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                preferences: updatedUser.preferences,
                token: generateToken(updatedUser._id),
            });
        }
        else {
            res.status(404).json({ message: 'User not found' });
        }
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            message: 'Error updating user profile',
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : '') : undefined
        });
    }
});
exports.updateUserProfile = updateUserProfile;
