import mongoose, { Document, Schema } from 'mongoose';

export interface IPrinter extends Document {
  name: string;
  status: 'Printing' | 'Idle' | 'Paused' | 'Error';
  progress: number;
  timeLeft: string;
  temperature: {
    bed: number;
    nozzle: number;
  };
  job: string;
  material: string;
  startTime: string;
  estimatedEnd: string;
  lastMaintenance: Date;
  nextMaintenance: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PrinterSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  status: { 
    type: String, 
    enum: ['Printing', 'Idle', 'Paused', 'Error'],
    default: 'Idle'
  },
  progress: { type: Number, default: 0 },
  timeLeft: { type: String, default: '0h 0m' },
  temperature: {
    bed: { type: Number, default: 25 },
    nozzle: { type: Number, default: 25 }
  },
  job: { type: String, default: 'None' },
  material: { type: String, default: 'None' },
  startTime: { type: String, default: 'N/A' },
  estimatedEnd: { type: String, default: 'N/A' },
  lastMaintenance: { type: Date, default: Date.now },
  nextMaintenance: { type: Date, default: () => new Date(+new Date() + 30 * 24 * 60 * 60 * 1000) }
}, {
  timestamps: true
});

export default mongoose.model<IPrinter>('Printer', PrinterSchema); 