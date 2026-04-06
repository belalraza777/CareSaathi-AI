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
// req.body: { mainSymptom[], symptomDuration, notes, gender?, age?, height?, weight? }
const createConsultation = async (req, res) => {
    const { mainSymptom, symptomDuration, notes, gender, age, height, weight } = req.body;

    const consultation = await Consultation.create({
        userId: req.user.id,
        mainSymptom: mainSymptom || [],
        symptomDuration,
        notes: notes || "",
        gender: typeof gender === "string" ? gender : null,
        age: typeof age === "number" ? age : null,
        height: typeof height === "number" ? height : null,
        weight: typeof weight === "number" ? weight : null,
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
            gender: consultation.gender,
            age: consultation.age,
            height: consultation.height,
            weight: consultation.weight,
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

// Fetch all consultations for authenticated user sorted by newest first
const getUserConsultations = async (req, res) => {
    const consultations = await Consultation.find({ userId: new mongoose.Types.ObjectId(req.user.id) })
        .sort({ createdAt: -1 })
        .select("consultationId mainSymptom symptomDuration notes gender age height weight riskLevel severity createdAt");

    return res.status(200).json({
        success: true,
        message: "Consultations retrieved successfully",
        data: consultations,
    });
};

// Fetch all messages for a specific consultation with ownership validation
const getConsultationMessages = async (req, res) => {
    const { consultationId } = req.params;

    // Validate consultationId format before querying
    if (!consultationId || !mongoose.Types.ObjectId.isValid(consultationId)) {
        return res.status(400).json({ success: false, message: "Invalid consultation ID format" });
    }

    // Verify consultation belongs to authenticated user before returning messages
    const consultation = await Consultation.findOne({
        consultationId: new mongoose.Types.ObjectId(consultationId),
        userId: new mongoose.Types.ObjectId(req.user.id),
    });

    if (!consultation) {
        return res.status(404).json({ success: false, message: "Consultation not found" });
    }

    // Fetch all messages for this consultation sorted by timeline
    const messages = await Message.find({ consultationId: new mongoose.Types.ObjectId(consultationId) })
        .sort({ timestamp: 1 })
        .select("role message timestamp");

    return res.status(200).json({
        success: true,
        message: "Messages retrieved successfully",
        data: messages,
    });
};

//Fetch all detail of a specific consultation with ownership validation
const getConsultationDetail = async (req, res) => {
    const { consultationId } = req.params;
    const consultation = await Consultation.findOne({
        consultationId: new mongoose.Types.ObjectId(consultationId),
        userId: new mongoose.Types.ObjectId(req.user.id),
    }).lean();
    
    if (!consultation) {
        return res.status(404).json({ success: false, message: "Consultation not found" });
    }
    return res.status(200).json({
        success: true,
        message: "Consultation details retrieved successfully",
        data: consultation,
    });
};

//Delete a consultation and its messages (optional, not currently exposed in routes)
const deleteConsultation = async (req, res) => {
    const { consultationId } = req.params;
    // Validate consultationId format before querying
    if (!consultationId || !mongoose.Types.ObjectId.isValid(consultationId)) {
        return res.status(400).json({ success: false, message: "Invalid consultation ID format" });
    }
    // Verify consultation belongs to authenticated user before deletion
    const consultation = await Consultation.findOneAndDelete({
        consultationId: new mongoose.Types.ObjectId(consultationId),
        userId: new mongoose.Types.ObjectId(req.user.id),
    });
    if (!consultation) {
        return res.status(404).json({ success: false, message: "Consultation not found" });
    }
    // Also delete all messages associated with this consultation
    await Message.deleteMany({ consultationId: new mongoose.Types.ObjectId(consultationId) });
    return res.status(200).json({
        success: true,
        message: "Consultation and associated messages deleted successfully",
    });
}


export default { createConsultation, chatConsultation, getUserConsultations, getConsultationMessages, getConsultationDetail ,deleteConsultation};
