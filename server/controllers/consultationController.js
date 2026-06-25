import mongoose from "mongoose";
import { handleUserMessage } from "../ai_agent/agent/agent.js";
import Consultation from "../models/consultationModel.js";
import Message from "../models/messageModel.js";
import { readFile, unlink } from "fs/promises";

// Store messages for chat history
const storeMessage = async (consultationId, role, message) => {
    if (!consultationId || !mongoose.Types.ObjectId.isValid(consultationId)) {
        throw new Error("Invalid consultationId");
    }

    await Message.create({
        consultationId: new mongoose.Types.ObjectId(consultationId),
        role,
        message: typeof message === "string" ? message : JSON.stringify(message),
        timestamp: new Date(),
    });
};

// Create consultation
const createConsultation = async (req, res) => {
    const { mainSymptom, symptomDuration, notes, gender, age, height, weight } = req.body;

    const consultation = await Consultation.create({
        userId: req.user.id,
        mainSymptom: mainSymptom || [],
        symptomDuration,
        notes: notes || "",
        gender,
        age,
        height,
        weight,
        symptom: Array.isArray(mainSymptom) ? mainSymptom : [],
    });

    return res.status(201).json({
        success: true,
        message: "Consultation created successfully",
        data: consultation,
    });
};

// Chat endpoint with image support
const chatConsultation = async (req, res) => {
    const consultationId = req.params.consultationId || req.body.consultationId;
    const { message = "" } = req.body;
    const uploadedImage = req.file || null;

    if (!consultationId || !mongoose.Types.ObjectId.isValid(consultationId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid consultation ID",
        });
    }

    const consultation = await Consultation.findOne({
        consultationId: new mongoose.Types.ObjectId(consultationId),
        userId: new mongoose.Types.ObjectId(req.user.id),
    });

    if (!consultation) {
        return res.status(404).json({
            success: false,
            message: "Consultation not found",
        });
    }

    try {
        let imageFile = null;

        // Read image for AI only
        if (uploadedImage?.path) {
            const buffer = await readFile(uploadedImage.path);

            imageFile = {
                mimetype: uploadedImage.mimetype,
                buffer,
            };
        }

        await storeMessage(
            consultationId,
            "user",
            message || "[Image uploaded]"
        );

        const response = await handleUserMessage({
            userId: req.user.id,
            consultationId,
            message,
            imageFile,
        });

        const safeResponse = typeof response === "string"
            ? response
            : JSON.stringify(response);

        await storeMessage(
            consultationId,
            "assistant",
            safeResponse
        );

        return res.status(200).json({
            success: true,
            response: safeResponse,
        });

    } finally {
        // Delete temporary image
        if (uploadedImage?.path) {
            await unlink(uploadedImage.path).catch(() => undefined);
        }
    }
};

// Get consultations
const getUserConsultations = async (req, res) => {
    const consultations = await Consultation.find({
        userId: new mongoose.Types.ObjectId(req.user.id),
    }).sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        data: consultations,
    });
};

// Get messages
const getConsultationMessages = async (req, res) => {
    const messages = await Message.find({
        consultationId: new mongoose.Types.ObjectId(req.params.consultationId),
    }).sort({ timestamp: 1 });

    res.status(200).json({
        success: true,
        data: messages,
    });
};

// Get consultation details
const getConsultationDetail = async (req, res) => {
    const consultation = await Consultation.findOne({
        consultationId: req.params.consultationId,
        userId: req.user.id,
    });

    res.status(200).json({
        success: true,
        data: consultation,
    });
};

// Delete consultation
const deleteConsultation = async (req, res) => {
    await Consultation.findByIdAndDelete(req.params.consultationId);

    await Message.deleteMany({
        consultationId: req.params.consultationId,
    });

    res.status(200).json({
        success: true,
        message: "Deleted",
    });
};

export default {
    createConsultation,
    chatConsultation,
    getUserConsultations,
    getConsultationMessages,
    getConsultationDetail,
    deleteConsultation,
};