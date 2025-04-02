import { Request, Response } from 'express';
import PrintJob from '../models/PrintJob';
import Printer from '../models/Printer';
import { validationResult } from 'express-validator';

export const getJobs = async (req: Request, res: Response) => {
  try {
    const jobs = await PrintJob.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching print jobs', error });
  }
};

export const getJobById = async (req: Request, res: Response) => {
  try {
    const job = await PrintJob.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Print job not found' });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching print job', error });
  }
};

export const createJob = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if specified printer exists and is available
    if (req.body.printer && req.body.printer !== 'Any') {
      const printer = await Printer.findOne({ name: req.body.printer });
      if (!printer) {
        return res.status(400).json({ message: 'Specified printer not found' });
      }
      if (printer.status !== 'Idle') {
        return res.status(400).json({ message: 'Specified printer is not available' });
      }
    }

    const job = new PrintJob(req.body);
    await job.save();
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error creating print job', error });
  }
};

export const updateJob = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Don't allow updating certain fields if job is already printing
    const job = await PrintJob.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Print job not found' });
    }

    if (job.status === 'Printing' && (req.body.printer || req.body.material || req.body.estimatedTime)) {
      return res.status(400).json({ message: 'Cannot update printer, material, or estimated time while job is printing' });
    }

    // Check if new printer exists and is available
    if (req.body.printer && req.body.printer !== 'Any') {
      const printer = await Printer.findOne({ name: req.body.printer });
      if (!printer) {
        return res.status(400).json({ message: 'Specified printer not found' });
      }
      if (printer.status !== 'Idle') {
        return res.status(400).json({ message: 'Specified printer is not available' });
      }
    }

    const updatedJob = await PrintJob.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json(updatedJob);
  } catch (error) {
    res.status(500).json({ message: 'Error updating print job', error });
  }
};

export const deleteJob = async (req: Request, res: Response) => {
  try {
    const job = await PrintJob.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Print job not found' });
    }

    if (job.status === 'Printing') {
      return res.status(400).json({ message: 'Cannot delete a job that is currently printing' });
    }

    await job.deleteOne();
    res.json({ message: 'Print job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting print job', error });
  }
};

export const getQueuedJobs = async (req: Request, res: Response) => {
  try {
    const jobs = await PrintJob.find({ status: 'Queued' }).sort({ createdAt: 1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching queued jobs', error });
  }
};

export const getActiveJobs = async (req: Request, res: Response) => {
  try {
    const jobs = await PrintJob.find({ 
      status: { $in: ['Printing', 'Paused'] } 
    }).sort({ startTime: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching active jobs', error });
  }
};

export const getCompletedJobs = async (req: Request, res: Response) => {
  try {
    const jobs = await PrintJob.find({ 
      status: { $in: ['Completed', 'Failed', 'Cancelled'] } 
    }).sort({ endTime: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching completed jobs', error });
  }
};

export const assignPrinter = async (req: Request, res: Response) => {
  try {
    const { jobId, printerName } = req.body;
    
    const job = await PrintJob.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Print job not found' });
    }

    if (job.status !== 'Queued') {
      return res.status(400).json({ message: 'Can only assign printer to queued jobs' });
    }

    const printer = await Printer.findOne({ name: printerName });
    if (!printer) {
      return res.status(404).json({ message: 'Printer not found' });
    }

    if (printer.status !== 'Idle') {
      return res.status(400).json({ message: 'Printer is not available' });
    }

    job.printer = printerName;
    await job.save();

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error assigning printer to job', error });
  }
}; 