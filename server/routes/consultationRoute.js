import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import consultationController from "../controllers/consultationController.js";
import {
	consultationChatValidation,
	createConsultationValidation,
} from "../utils/joiValidation.js";
import asyncWrapper from "./../utils/asyncWrapper.js";

const router = express.Router();

// Consultation routes keep creation and chat operations under one resource group.

// Create a new consultation session
router.post("/new", verifyToken, createConsultationValidation, asyncWrapper(consultationController.createConsultation));
//Send Message to consultation chat and get agent response
router.post(
	"/chat/:consultationId",
	verifyToken,
	consultationChatValidation,
	asyncWrapper(consultationController.chatConsultation)
);

// Get all consultations for authenticated user
router.get("/", verifyToken, asyncWrapper(consultationController.getUserConsultations));
// Get details for a specific consultation
router.get("/:consultationId", verifyToken, asyncWrapper(consultationController.getConsultationDetail));
// Get message history for a specific consultation
router.get("/:consultationId/messages", verifyToken, asyncWrapper(consultationController.getConsultationMessages));
// Delete a consultation and its messages (optional, not currently exposed in frontend)
router.delete("/:consultationId", verifyToken, asyncWrapper(consultationController.deleteConsultation));
export default router;
