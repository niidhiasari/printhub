import mongoose, { Document, Schema } from 'mongoose';

export interface IPrintJob extends Document {
  name: string;
  printer: string;
  material: string;
  estimatedTime: string;
  status: 'Queued' | 'Printing' | 'Completed' | 'Failed' | 'Cancelled';
  startTime?: Date;
  endTime?: Date;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

const PrintJobSchema: Schema = new Schema({
  name: { type: String, required: true },
  printer: { type: String, required: true },
  material: { type: String, required: true },
  estimatedTime: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Queued', 'Printing', 'Completed', 'Failed', 'Cancelled'],
    default: 'Queued'
  },
  startTime: { type: Date },
  endTime: { type: Date },
  progress: { type: Number, default: 0 }
}, {
  timestamps: true
});

export default mongoose.model<IPrintJob>('PrintJob', PrintJobSchema); 