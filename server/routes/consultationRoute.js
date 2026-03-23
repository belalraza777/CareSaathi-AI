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
router.post("/new", verifyToken, createConsultationValidation, asyncWrapper(consultationController.createConsultation));
router.post(
	"/chat/:consultationId",
	verifyToken,
	consultationChatValidation,
	asyncWrapper(consultationController.chatConsultation)
);

export default router;
