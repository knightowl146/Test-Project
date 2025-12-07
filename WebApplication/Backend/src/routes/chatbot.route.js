import express from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { chat } from '../controllers/chatbot/chatbot.controller.js';

const router = express.Router();

// Protected route
router.post('/', verifyJWT, chat);

export default router;
