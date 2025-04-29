// server/src/models/User.ts
import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

interface IUserPreferences {
  currency: string;
  theme: string;
  notifications: boolean;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  preferences: IUserPreferences;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    preferences: {
      currency: {
        type: String,
        default: 'USD',
      },
      theme: {
        type: String,
        default: 'light',
      },
      notifications: {
        type: Boolean,
        default: true,
      }
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    }
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    console.log("Hashing password");
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log("Password hashed successfully");
    next();
  } catch (error) {
    console.error("Error hashing password:", error);
    next(error as Error);
  }
});

// Method to check if entered password matches
UserSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
  try {
    console.log("Checking password match");
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    console.log("Password match:", isMatch);
    return isMatch;
  } catch (error) {
    console.error("Error comparing passwords:", error);
    return false;
  }
};

export default mongoose.model<IUser>('User', UserSchema);