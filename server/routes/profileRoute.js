import express from "express";
import profileController from "../controllers/profileController.js";
import verifyToken from "../middlewares/verifyToken.js";
import { createProfileValidation, updateProfileValidation } from "../utils/joiValidation.js";

const router = express.Router();

router.get("/", verifyToken, profileController.getProfile);
router.post("/", verifyToken, createProfileValidation, profileController.createProfile);
router.patch("/", verifyToken, updateProfileValidation, profileController.updateProfile);

export default router;
