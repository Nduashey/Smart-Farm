import express from 'express';
import { clientDashboard } from '../controllers/clientController.js';

const router = express.Router();

// Route for client dashboard
router.get('/', clientDashboard); // Serve the client dashboard



// Export the router
export default router;
