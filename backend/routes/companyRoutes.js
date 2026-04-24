import express from 'express';
import { getAllCompanies } from '../controllers/companyController.js';

const router = express.Router();

router.get('/', getAllCompanies);

export default router;
