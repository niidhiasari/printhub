import express, { Router, RequestHandler } from 'express';
import { body } from 'express-validator';
import * as printJobController from '../controllers/printJobController';

const router: Router = express.Router();

// Validation middleware
const printJobValidation = [
  body('name').notEmpty().trim().withMessage('Job name is required'),
  body('printer')
    .notEmpty()
    .withMessage('Printer name is required'),
  body('material')
    .isIn(['PLA', 'ABS', 'PETG', 'TPU'])
    .withMessage('Invalid material type'),
  body('estimatedTime')
    .matches(/^\d+h \d+m$/)
    .withMessage('Estimated time must be in format "Xh Ym"')
];

// Routes
router.get('/', printJobController.getJobs as RequestHandler);
router.get('/queued', printJobController.getQueuedJobs as RequestHandler);
router.get('/active', printJobController.getActiveJobs as RequestHandler);
router.get('/completed', printJobController.getCompletedJobs as RequestHandler);
router.get('/:id', printJobController.getJobById as RequestHandler);

router.post('/', printJobValidation, printJobController.createJob as RequestHandler);
router.put('/:id', printJobValidation, printJobController.updateJob as RequestHandler);
router.delete('/:id', printJobController.deleteJob as RequestHandler);

// Printer assignment
router.post('/assign',
  [
    body('jobId').notEmpty().withMessage('Job ID is required'),
    body('printerName').notEmpty().withMessage('Printer name is required')
  ],
  printJobController.assignPrinter as RequestHandler
);

export default router; 