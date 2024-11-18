import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IUserAccount extends Document {
  username: string;
  password: string;
  security_question: string;
  security_answer: string;
  isPaidUser: boolean;
  patreon_email?: string;
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
  patreon_email: {
    type: String,
    default: '',
  },
});

const UserAccount: Model<IUserAccount> = mongoose.model<IUserAccount>(
  'User Account',
  UserAccountSchema
);

export default UserAccount;
