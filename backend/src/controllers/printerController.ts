import { Request, Response } from 'express';
import Printer, { IPrinter } from '../models/Printer';
import PrintJob from '../models/PrintJob';
import MaintenanceRecord from '../models/MaintenanceRecord';
import { validationResult } from 'express-validator';

export const getPrinters = async (req: Request, res: Response) => {
  try {
    const printers = await Printer.find();
    res.json(printers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching printers', error });
  }
};

export const getPrinterById = async (req: Request, res: Response) => {
  try {
    const printer = await Printer.findById(req.params.id);
    if (!printer) {
      return res.status(404).json({ message: 'Printer not found' });
    }
    res.json(printer);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching printer', error });
  }
};

export const createPrinter = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const printer = new Printer(req.body);
    await printer.save();
    res.status(201).json(printer);
  } catch (error) {
    res.status(500).json({ message: 'Error creating printer', error });
  }
};

export const updatePrinter = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const printer = await Printer.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!printer) {
      return res.status(404).json({ message: 'Printer not found' });
    }

    res.json(printer);
  } catch (error) {
    res.status(500).json({ message: 'Error updating printer', error });
  }
};

export const deletePrinter = async (req: Request, res: Response) => {
  try {
    const printer = await Printer.findByIdAndDelete(req.params.id);
    if (!printer) {
      return res.status(404).json({ message: 'Printer not found' });
    }

    // Delete associated maintenance records
    await MaintenanceRecord.deleteMany({ printer: req.params.id });
    
    // Update any queued jobs assigned to this printer
    await PrintJob.updateMany(
      { printer: printer.name, status: 'Queued' },
      { $set: { printer: 'Any' } }
    );

    res.json({ message: 'Printer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting printer', error });
  }
};

export const startPrint = async (req: Request, res: Response) => {
  try {
    const printer = await Printer.findById(req.params.id);
    if (!printer) {
      return res.status(404).json({ message: 'Printer not found' });
    }

    if (printer.status !== 'Idle') {
      return res.status(400).json({ message: 'Printer is not idle' });
    }

    const { jobId } = req.body;
    const job = await PrintJob.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Print job not found' });
    }

    // Update printer status
    printer.status = 'Printing';
    printer.job = job.name;
    printer.material = job.material;
    printer.timeLeft = job.estimatedTime;
    printer.progress = 0;
    printer.startTime = new Date().toLocaleTimeString();
    printer.estimatedEnd = new Date(Date.now() + parseEstimatedTime(job.estimatedTime)).toLocaleTimeString();

    await printer.save();

    // Update job status
    job.status = 'Printing';
    job.startTime = new Date();
    await job.save();

    res.json(printer);
  } catch (error) {
    res.status(500).json({ message: 'Error starting print', error });
  }
};

export const pausePrint = async (req: Request, res: Response) => {
  try {
    const printer = await Printer.findById(req.params.id);
    if (!printer) {
      return res.status(404).json({ message: 'Printer not found' });
    }

    if (printer.status !== 'Printing') {
      return res.status(400).json({ message: 'Printer is not printing' });
    }

    printer.status = 'Paused';
    await printer.save();

    await PrintJob.findOneAndUpdate(
      { name: printer.job, status: 'Printing' },
      { $set: { status: 'Paused' } }
    );

    res.json(printer);
  } catch (error) {
    res.status(500).json({ message: 'Error pausing print', error });
  }
};

export const resumePrint = async (req: Request, res: Response) => {
  try {
    const printer = await Printer.findById(req.params.id);
    if (!printer) {
      return res.status(404).json({ message: 'Printer not found' });
    }

    if (printer.status !== 'Paused') {
      return res.status(400).json({ message: 'Printer is not paused' });
    }

    printer.status = 'Printing';
    await printer.save();

    await PrintJob.findOneAndUpdate(
      { name: printer.job, status: 'Paused' },
      { $set: { status: 'Printing' } }
    );

    res.json(printer);
  } catch (error) {
    res.status(500).json({ message: 'Error resuming print', error });
  }
};

export const stopPrint = async (req: Request, res: Response) => {
  try {
    const printer = await Printer.findById(req.params.id);
    if (!printer) {
      return res.status(404).json({ message: 'Printer not found' });
    }

    if (!['Printing', 'Paused'].includes(printer.status)) {
      return res.status(400).json({ message: 'Printer is not printing or paused' });
    }

    // Update job status
    await PrintJob.findOneAndUpdate(
      { name: printer.job, status: { $in: ['Printing', 'Paused'] } },
      { 
        $set: { 
          status: 'Cancelled',
          endTime: new Date(),
          progress: printer.progress
        } 
      }
    );

    // Reset printer status
    printer.status = 'Idle';
    printer.progress = 0;
    printer.timeLeft = '0h 0m';
    printer.job = 'None';
    printer.material = 'None';
    printer.startTime = 'N/A';
    printer.estimatedEnd = 'N/A';
    await printer.save();

    res.json(printer);
  } catch (error) {
    res.status(500).json({ message: 'Error stopping print', error });
  }
};

export const updateProgress = async (req: Request, res: Response) => {
  try {
    const { progress, timeLeft } = req.body;
    const printer = await Printer.findById(req.params.id);
    
    if (!printer) {
      return res.status(404).json({ message: 'Printer not found' });
    }

    if (printer.status !== 'Printing') {
      return res.status(400).json({ message: 'Printer is not printing' });
    }

    printer.progress = progress;
    printer.timeLeft = timeLeft;
    await printer.save();

    // Update job progress
    await PrintJob.findOneAndUpdate(
      { name: printer.job, status: 'Printing' },
      { $set: { progress } }
    );

    res.json(printer);
  } catch (error) {
    res.status(500).json({ message: 'Error updating progress', error });
  }
};

// Helper function to parse estimated time string to milliseconds
const parseEstimatedTime = (timeStr: string): number => {
  const hours = parseInt(timeStr.split('h')[0]) || 0;
  const minutes = parseInt(timeStr.split('h')[1]?.split('m')[0]) || 0;
  return (hours * 60 * 60 * 1000) + (minutes * 60 * 1000);
}; 