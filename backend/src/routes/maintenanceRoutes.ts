import express, { Router, RequestHandler } from 'express';
import { body } from 'express-validator';
import * as maintenanceController from '../controllers/maintenanceController';

const router: Router = express.Router();

// Validation middleware
const maintenanceValidation = [
  body('printer')
    .notEmpty()
    .withMessage('Printer ID is required'),
  body('type')
    .isIn(['Routine', 'Emergency', 'Calibration', 'Upgrade'])
    .withMessage('Invalid maintenance type'),
  body('description')
    .notEmpty()
    .trim()
    .withMessage('Description is required'),
  body('technician')
    .notEmpty()
    .trim()
    .withMessage('Technician name is required'),
  body('status')
    .isIn(['Pending', 'In Progress', 'Completed', 'Cancelled'])
    .withMessage('Invalid status'),
  body('date')
    .isISO8601()
    .toDate()
    .withMessage('Invalid date format')
];

// Routes
router.get('/', maintenanceController.getMaintenanceRecords as RequestHandler);
router.get('/upcoming', maintenanceController.getUpcomingMaintenance as RequestHandler);
router.get('/overdue', maintenanceController.getOverdueMaintenance as RequestHandler);
router.get('/:id', maintenanceController.getMaintenanceRecordById as RequestHandler);
router.get('/printer/:printerId', maintenanceController.getPrinterMaintenanceHistory as RequestHandler);

router.post('/', maintenanceValidation, maintenanceController.createMaintenanceRecord as RequestHandler);
router.put('/:id', maintenanceValidation, maintenanceController.updateMaintenanceRecord as RequestHandler);
router.delete('/:id', maintenanceController.deleteMaintenanceRecord as RequestHandler);

export default router; 