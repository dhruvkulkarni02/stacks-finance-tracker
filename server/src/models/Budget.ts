// src/models/Budget.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IBudget extends Document {
  userId: mongoose.Types.ObjectId;
  category: string;
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BudgetSchema = new Schema<IBudget>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  period: {
    type: String,
    enum: ['weekly', 'monthly', 'yearly'],
    default: 'monthly',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
BudgetSchema.index({ userId: 1, category: 1, period: 1 });
BudgetSchema.index({ userId: 1, isActive: 1 });

export default mongoose.model<IBudget>('Budget', BudgetSchema);
