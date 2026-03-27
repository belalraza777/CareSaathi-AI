import mongoose from "mongoose";
import { handleUserMessage } from "../ai_agent/agent/agent.js";
import Consultation from "../models/consultationModel.js";
import Message from "../models/messageModel.js";

// Store user and assistant messages in the message history for agent context
const storeMessage = async (consultationId, role, message) => {
    if (!consultationId || !mongoose.Types.ObjectId.isValid(consultationId)) {
        throw new Error("Invalid consultationId");
    }

    const safeMessage = typeof message === "string" ? message : JSON.stringify(message);

    await Message.create({
        consultationId: new mongoose.Types.ObjectId(consultationId),
        role,
        message: safeMessage, // Ensure schema always receives a string payload.
        timestamp: new Date(),
    });
};

// Create a new consultation session
//req.body: { mainSymptom[], symptomDuration, notes }
const createConsultation = async (req, res) => {
    const { mainSymptom, symptomDuration, notes } = req.body;

    const consultation = await Consultation.create({
        userId: req.user.id,
        mainSymptom: mainSymptom || [],
        symptomDuration,
        notes: notes || "",
        symptom: Array.isArray(mainSymptom) ? [...mainSymptom] : [],
    });

    return res.status(201).json({
        success: true,
        message: "Consultation created successfully",
        data: {
            consultationId: consultation.consultationId,
            mainSymptom: consultation.mainSymptom,
            symptomDuration: consultation.symptomDuration,
            notes: consultation.notes,
        },
    });
};


// Chat endpoint: get agent response and extract symptoms from message
const chatConsultation = async (req, res) => {
        const consultationId = req.params.consultationId || req.body.consultationId;
        const { message } = req.body;

        // Validate consultationId format before querying
        if (!consultationId || !mongoose.Types.ObjectId.isValid(consultationId)) {
            return res.status(400).json({ success: false, message: "Invalid consultation ID format" });
        }

        // Verify consultation belongs to authenticated user
        let consultation = await Consultation.findOne({
            consultationId: new mongoose.Types.ObjectId(consultationId),
            userId: new mongoose.Types.ObjectId(req.user.id),
        });

        if (!consultation) {
            return res.status(404).json({ success: false, message: "Consultation not found" });
        }

        // Get agent response and extracted symptoms
        const response = await handleUserMessage({
            consultationId,
            userId: req.user.id,
            message,
        });
        const safeResponse = typeof response === "string" ? response : JSON.stringify(response);

        // Store user and assistant messages in history
        await storeMessage(consultationId, "user", message);
        await storeMessage(consultationId, "assistant", safeResponse); // Persist exactly what we return to client.

    
        return res.status(200).json({
            success: true,
            response: safeResponse,
            data: {
                symptoms: consultation.symptom || [],
                riskLevel: consultation.riskLevel || "Mild",
            },
        });
    
};

export default { createConsultation, chatConsultation };
