// server/src/controllers/auth.ts
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

// Generate JWT token
const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/users
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;


    // Add validation for required fields
    if (!name || !email || !password) {

      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {

      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user with additional fields
    const user = await User.create({
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
    } else {

      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle mongoose validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      const validationErrors: { [key: string]: string } = {};
      
      // Extract validation errors from mongoose
      if ('errors' in error) {
        const mongooseErrors = error.errors as any;
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
    if (error instanceof Error && 'code' in error && (error as any).code === 11000) {
      return res.status(400).json({ 
        message: 'Email already exists. Please use a different email address.'
      });
    }
    
    res.status(500).json({ 
      message: 'Error registering user. Please try again.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/users/login
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    


    // Find user by email
    const user = await User.findOne({ email });

    
    // Check if user exists and password matches
    if (user && (await user.matchPassword(password))) {
      // Update last login time
      user.lastLogin = new Date();
      await user.save();
      
      const token = generateToken(user._id);

      
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: token,
      });
    } else {

      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Error logging in',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : '') : undefined
    });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req as any).userId).select('-password');
    
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        preferences: user.preferences,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      message: 'Error fetching user profile',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : '') : undefined
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req as any).userId);
    
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      
      // Update preferences if provided
      if (req.body.preferences) {
        user.preferences = {
          ...user.preferences,
          ...req.body.preferences
        };
      }
      
      // Update password if provided
      if (req.body.password) {
        user.password = req.body.password;
      }
      
      const updatedUser = await user.save();
      
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        preferences: updatedUser.preferences,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      message: 'Error updating user profile',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : '') : undefined
    });
  }
};