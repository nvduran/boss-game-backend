import mongoose, { Document, Schema, Model } from 'mongoose';
import Counter, { ICounter } from './Counter'; 

export interface IUserAccount extends Document {
        username: string;
        password: string;
        security_question: string;
        security_answer: string;
        isPaidUser: boolean;
        display_name: string;
        created_at: Date;
        user_id: number;
      }

const UserAccountSchema: Schema<IUserAccount> = new Schema({
  username: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 250,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  security_question: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 250,
  },
  security_answer: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 250,
  },
  isPaidUser: {
    type: Boolean,
    default: false,
  },
  display_name: {
        type: String,
        minlength: 3,
        maxlength: 25,
        unique: true,
        required: true,
      },
      created_at: {
        type: Date,
        default: Date.now,
      },
      user_id: {
        type: Number,
        required: true,
        unique: true,
      },
    });
    
    // Add a pre-validate hook to assign user_id
        UserAccountSchema.pre('validate', async function (next) {
        if (this.isNew) {
          // Assuming you have a Counter model to keep track of user IDs
          const counter = await Counter.findOneAndUpdate(
            { id: 'autoval' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
          );
          this.user_id = counter.seq;
        }
        next();
      });       
    
    const UserAccount: Model<IUserAccount> = mongoose.model<IUserAccount>(
      'User Account',
      UserAccountSchema
    );
    
    export default UserAccount;
