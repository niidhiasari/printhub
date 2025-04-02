import { Request, Response } from 'express';
import MaintenanceRecord from '../models/MaintenanceRecord';
import Printer from '../models/Printer';
import { validationResult } from 'express-validator';

export const getMaintenanceRecords = async (req: Request, res: Response) => {
  try {
    const records = await MaintenanceRecord.find().sort({ date: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching maintenance records', error });
  }
};

export const getMaintenanceRecordById = async (req: Request, res: Response) => {
  try {
    const record = await MaintenanceRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching maintenance record', error });
  }
};

export const createMaintenanceRecord = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if printer exists
    const printer = await Printer.findById(req.body.printer);
    if (!printer) {
      return res.status(404).json({ message: 'Printer not found' });
    }

    const record = new MaintenanceRecord(req.body);
    await record.save();

    // Update printer's last maintenance date
    printer.lastMaintenance = record.date;
    
    // Calculate next maintenance date based on type
    const nextMaintenanceDate = new Date(record.date);
    switch (record.type) {
      case 'Routine':
        nextMaintenanceDate.setMonth(nextMaintenanceDate.getMonth() + 1);
        break;
      case 'Emergency':
        nextMaintenanceDate.setDate(nextMaintenanceDate.getDate() + 7);
        break;
      case 'Calibration':
        nextMaintenanceDate.setDate(nextMaintenanceDate.getDate() + 14);
        break;
      case 'Upgrade':
        nextMaintenanceDate.setMonth(nextMaintenanceDate.getMonth() + 3);
        break;
    }
    printer.nextMaintenance = nextMaintenanceDate;
    
    await printer.save();

    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: 'Error creating maintenance record', error });
  }
};

export const updateMaintenanceRecord = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const record = await MaintenanceRecord.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!record) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }

    // If status is updated to completed, update printer maintenance dates
    if (req.body.status === 'Completed') {
      const printer = await Printer.findById(record.printer);
      if (printer) {
        printer.lastMaintenance = record.date;
        
        // Calculate next maintenance date based on type
        const nextMaintenanceDate = new Date(record.date);
        switch (record.type) {
          case 'Routine':
            nextMaintenanceDate.setMonth(nextMaintenanceDate.getMonth() + 1);
            break;
          case 'Emergency':
            nextMaintenanceDate.setDate(nextMaintenanceDate.getDate() + 7);
            break;
          case 'Calibration':
            nextMaintenanceDate.setDate(nextMaintenanceDate.getDate() + 14);
            break;
          case 'Upgrade':
            nextMaintenanceDate.setMonth(nextMaintenanceDate.getMonth() + 3);
            break;
        }
        printer.nextMaintenance = nextMaintenanceDate;
        
        await printer.save();
      }
    }

    res.json(record);
  } catch (error) {
    res.status(500).json({ message: 'Error updating maintenance record', error });
  }
};

export const deleteMaintenanceRecord = async (req: Request, res: Response) => {
  try {
    const record = await MaintenanceRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }

    await record.deleteOne();
    res.json({ message: 'Maintenance record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting maintenance record', error });
  }
};

export const getPrinterMaintenanceHistory = async (req: Request, res: Response) => {
  try {
    const { printerId } = req.params;
    
    const printer = await Printer.findById(printerId);
    if (!printer) {
      return res.status(404).json({ message: 'Printer not found' });
    }

    const records = await MaintenanceRecord.find({ printer: printerId })
      .sort({ date: -1 });
    
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching printer maintenance history', error });
  }
};

export const getUpcomingMaintenance = async (req: Request, res: Response) => {
  try {
    const currentDate = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const printers = await Printer.find({
      nextMaintenance: {
        $gte: currentDate,
        $lte: nextWeek
      }
    }).sort({ nextMaintenance: 1 });

    res.json(printers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching upcoming maintenance', error });
  }
};

export const getOverdueMaintenance = async (req: Request, res: Response) => {
  try {
    const currentDate = new Date();

    const printers = await Printer.find({
      nextMaintenance: { $lt: currentDate }
    }).sort({ nextMaintenance: 1 });

    res.json(printers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching overdue maintenance', error });
  }
}; 