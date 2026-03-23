import express from 'express';
import authController from '../controllers/authController.js';
import verifyToken from '../middlewares/verifyToken.js';
import { registerValidation, loginValidation } from '../utils/joiValidation.js';

// Auth endpoints are aligned with the client auth API paths.
const router = express.Router();

router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.loginUser);
router.get('/logout', authController.logoutUser);
router.get('/check', authController.checkUser);
router.patch('/reset', verifyToken, authController.resetPassword);

export default router;