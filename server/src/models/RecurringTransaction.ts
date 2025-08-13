// src/models/RecurringTransaction.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IRecurringTransaction extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  nextDate: Date;
  isActive: boolean;
  lastProcessed?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RecurringTransactionSchema = new Schema<IRecurringTransaction>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01
  },
  category: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    required: true
  },
  nextDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastProcessed: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
RecurringTransactionSchema.index({ userId: 1, isActive: 1 });
RecurringTransactionSchema.index({ nextDate: 1, isActive: 1 });

export default mongoose.model<IRecurringTransaction>('RecurringTransaction', RecurringTransactionSchema);
