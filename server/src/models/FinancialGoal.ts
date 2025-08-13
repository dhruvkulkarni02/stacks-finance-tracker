// src/models/FinancialGoal.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IFinancialGoal extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: Date;
  category: 'emergency_fund' | 'vacation' | 'purchase' | 'investment' | 'other';
  priority: 'low' | 'medium' | 'high';
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FinancialGoalSchema = new Schema<IFinancialGoal>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  targetAmount: {
    type: Number,
    required: true,
    min: 0.01
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  targetDate: {
    type: Date
  },
  category: {
    type: String,
    enum: ['emergency_fund', 'vacation', 'purchase', 'investment', 'other'],
    default: 'other',
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
FinancialGoalSchema.index({ userId: 1, isCompleted: 1 });
FinancialGoalSchema.index({ userId: 1, priority: 1 });

export default mongoose.model<IFinancialGoal>('FinancialGoal', FinancialGoalSchema);
