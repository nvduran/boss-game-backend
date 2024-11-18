import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ICounter extends Document {
  id: string;
  seq: number;
}

const CounterSchema: Schema<ICounter> = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  seq: {
    type: Number,
    default: 0,
  },
});

const Counter: Model<ICounter> = mongoose.model<ICounter>('Counter', CounterSchema);

export default Counter;
