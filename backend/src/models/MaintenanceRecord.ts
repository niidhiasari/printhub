import mongoose, { Document, Schema } from 'mongoose';

export interface IMaintenanceRecord extends Document {
  printer: mongoose.Types.ObjectId;
  date: Date;
  type: 'Routine' | 'Emergency' | 'Calibration' | 'Upgrade';
  description: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  technician: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MaintenanceRecordSchema = new Schema<IMaintenanceRecord>({
  printer: {
    type: Schema.Types.ObjectId,
    ref: 'Printer',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  type: {
    type: String,
    required: true,
    enum: ['Routine', 'Emergency', 'Calibration', 'Upgrade']
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  technician: {
    type: String,
    required: true
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

export default mongoose.model<IMaintenanceRecord>('MaintenanceRecord', MaintenanceRecordSchema); 