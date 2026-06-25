import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import consultationController from "../controllers/consultationController.js";
import {
    consultationChatValidation,
    createConsultationValidation,
} from "../utils/joiValidation.js";
import asyncWrapper from "../utils/asyncWrapper.js";
import { uploadChatImage } from "../middlewares/upload.js";

const router = express.Router();

// Create consultation
router.post(
    "/new",
    verifyToken,
    createConsultationValidation,
    asyncWrapper(consultationController.createConsultation)
);

// Chat with optional image upload
router.post(
    "/chat/:consultationId",
    verifyToken,
    uploadChatImage,
    consultationChatValidation,
    asyncWrapper(consultationController.chatConsultation)
);

// Get all consultations
router.get(
    "/",
    verifyToken,
    asyncWrapper(consultationController.getUserConsultations)
);

// Get consultation details
router.get(
    "/:consultationId",
    verifyToken,
    asyncWrapper(consultationController.getConsultationDetail)
);

// Get messages
router.get(
    "/:consultationId/messages",
    verifyToken,
    asyncWrapper(consultationController.getConsultationMessages)
);

// Delete consultation
router.delete(
    "/:consultationId",
    verifyToken,
    asyncWrapper(consultationController.deleteConsultation)
);

export default router;