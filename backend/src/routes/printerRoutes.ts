import express, { Router, RequestHandler } from 'express';
import { body } from 'express-validator';
import * as printerController from '../controllers/printerController';

const router: Router = express.Router();

// Validation middleware
const printerValidation = [
  body('name').notEmpty().trim().withMessage('Printer name is required'),
  body('status')
    .isIn(['Idle', 'Printing', 'Paused', 'Maintenance', 'Error'])
    .withMessage('Invalid printer status'),
  body('temperature').isNumeric().withMessage('Temperature must be a number'),
  body('material')
    .isIn(['PLA', 'ABS', 'PETG', 'TPU', 'None'])
    .withMessage('Invalid material type'),
];

// Routes
router.get('/', printerController.getPrinters as RequestHandler);
router.get('/:id', printerController.getPrinterById as RequestHandler);
router.post('/', printerValidation, printerController.createPrinter as RequestHandler);
router.put('/:id', printerValidation, printerController.updatePrinter as RequestHandler);
router.delete('/:id', printerController.deletePrinter as RequestHandler);

// Print job control routes
router.post('/:id/start',
  body('jobId').notEmpty().withMessage('Job ID is required'),
  printerController.startPrint as RequestHandler
);

router.post('/:id/pause', printerController.pausePrint as RequestHandler);
router.post('/:id/resume', printerController.resumePrint as RequestHandler);
router.post('/:id/stop', printerController.stopPrint as RequestHandler);

// Progress update route
router.put('/:id/progress',
  [
    body('progress').isFloat({ min: 0, max: 100 }).withMessage('Progress must be between 0 and 100'),
    body('timeLeft').notEmpty().withMessage('Time left is required')
  ],
  printerController.updateProgress as RequestHandler
);

export default router; 