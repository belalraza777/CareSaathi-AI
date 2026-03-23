import mongoose from "mongoose";
import { handleUserMessage } from "../ai_agent/core/agent.js";
import Consultation from "../models/consultationModel.js";
import Message from "../models/messageModel.js";

// Store user and assistant messages in the message history for agent context
const storeMessage = async (consultationId, role, message) => {
    if (!consultationId || !mongoose.Types.ObjectId.isValid(consultationId)) {
        throw new Error("Invalid consultationId");
    }

    await Message.create({
        consultationId: new mongoose.Types.ObjectId(consultationId),
        role,
        message,
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
        const { response, symptoms } = await handleUserMessage({
            consultationId,
            userId: req.user.id,
            message,
        });

        // Store user and assistant messages in history
        await storeMessage(consultationId, "user", message);
        await storeMessage(consultationId, "assistant", response);

        // Add extracted symptoms to array if valid (strict validation)
        if (Array.isArray(symptoms) && symptoms.length > 0) {
            const symptomArray = Array.isArray(consultation.symptom) ? consultation.symptom : [];
            for (const symptom of symptoms) {
                // Only add non-empty, reasonable length symptoms (not conversational phrases)
                const cleanSymptom = String(symptom).trim().toLowerCase();
                if (cleanSymptom && cleanSymptom.length > 2 && cleanSymptom.length < 50 && !symptomArray.includes(cleanSymptom)) {
                    symptomArray.push(cleanSymptom);
                }
            }
            // Update database only if new symptoms were actually added
            if (symptomArray.length !== (consultation.symptom?.length || 0)) {
                consultation.symptom = symptomArray;
                await consultation.save();
            }
        }

        // Fetch updated consultation to get latest riskLevel
        consultation = await Consultation.findOne({
            consultationId,
            userId: req.user.id,
        });

        return res.status(200).json({
            success: true,
            response,
            data: {
                symptoms: consultation.symptom || [],
                riskLevel: consultation.riskLevel || "Mild",
            },
        });
    
};

export default { createConsultation, chatConsultation };
