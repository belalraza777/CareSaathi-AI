import mongoose from "mongoose";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import Profile from "../../models/profileModel.js";
import Consultation from "../../models/consultationModel.js";
import { llm } from "../agent/agent.js"; // Use the named export exposed by agent.js.
import { retrieveMedicalKnowledgeTool } from "./ragTool.js";


const FDA_TIMEOUT_MS = 12000;

// -------------------------
// Helpers 
// -------------------------
const getRuntimeIds = (config) => ({
  userId:
    config?.configurable?.userId ||
    config?.userId ||
    null,
  consultationId:
    config?.configurable?.consultationId ||
    config?.consultationId ||
    null,
});

const isValidObjectId = (value) =>
  mongoose.Types.ObjectId.isValid(String(value));

const toObjectId = (value) =>
  new mongoose.Types.ObjectId(String(value));

// -------------------------
// Schemas (RELAXED FOR LLM)
// -------------------------
// Coerce null/non-object tool payloads into an empty object so LLM tool calls do not fail schema validation.
const objectPayload = z.preprocess(
  (value) => (value && typeof value === "object" ? value : {}),
  z.object({}).passthrough()
);

const emptySchema = objectPayload;

const riskSchema = z.preprocess(
  (value) => {
    const payload = value && typeof value === "object" ? value : {};
    const rawRisk = payload.risk_level ?? payload.risk ?? payload.level ?? null;
    const normalizedRisk =
      typeof rawRisk === "string" && rawRisk.trim()
        ? `${rawRisk.trim()[0]?.toUpperCase() || ""}${rawRisk.trim().slice(1).toLowerCase()}`
        : rawRisk;
    return { ...payload, risk_level: normalizedRisk };
  },
  z
    .object({
      risk_level: z.enum(["Mild", "Moderate", "Critical"]),
    })
    .passthrough()
);

const medicineSchema = z.preprocess(
  (value) => (value && typeof value === "object" ? value : {}),
  z
    .object({
      symptom: z.string().optional(),
      input: z.string().nullable().optional(),
    })
    .passthrough()
);

const calculateRiskSchema = z.preprocess(
  (value) => (value && typeof value === "object" ? value : {}),
  z
    .object({
      symptoms: z.array(z.string()).optional(),
      input: z.union([z.string(), z.array(z.string()), z.null()]).optional(),
    })
    .passthrough()
);


// -------------------------
// Tool 1: Get Patient Profile
// -------------------------
export const getPatientProfileTool = tool(
  async (_, config) => {
    try {
      const { userId } = getRuntimeIds(config);

      if (!isValidObjectId(userId)) {
        return JSON.stringify({ error: "Session missing" });
      }

      const profile = await Profile.findOne({ user: toObjectId(userId) })
        .lean()
        .select({
          allergies: 1,
          medicalHistory: 1,
          age: 1,
          gender: 1,
        });

      if (!profile) {
        // No profile found - return sensible defaults
        return JSON.stringify({
          age: null,
          gender: null,
          allergies: [],
          medicalHistory: [],
          note: "Profile not yet created",
        });
      }

      return JSON.stringify({
        age: profile.age || null,
        gender: profile.gender || null,
        allergies: profile.allergies || [],
        medicalHistory: profile.medicalHistory || [],
      });

    } catch (err) {
      throw new Error(`Failed to retrieve patient profile: ${err.message}`);
    }
  },
  {
    name: "get_patient_profile",
    description:
      "REQUIRED: Get patient medical profile including age, gender, allergies, and medical history. You MUST call this before recommending ANY medicine or medical advice. Always call this first when patient mentions symptoms. Don't pass any input.",
    schema: emptySchema,
  }
);

// -------------------------
// Tool 2: Set Risk Level
// -------------------------
export const setRiskLevelTool = tool(
  async (args, config) => {
    try {
      const { consultationId, userId } = getRuntimeIds(config);

      let risk = args?.risk_level;

      // If risk is a JSON string, parse it
      if (typeof risk === "string" && risk.includes("{")) {
        try {
          const parsed = JSON.parse(risk);
          risk = parsed.risk || parsed.risk_level || risk;
        } catch { }
      }

      if (!["Mild", "Moderate", "Critical"].includes(String(risk).trim())) {
        return JSON.stringify({ success: false, error: "Invalid risk level. Use Mild, Moderate, or Critical" });
      }

      if (!isValidObjectId(consultationId) || !isValidObjectId(userId)) {
        return JSON.stringify({ success: false, error: "Session missing" });
      }

      const updated = await Consultation.findOneAndUpdate(
        {
          consultationId: toObjectId(consultationId),
          userId: toObjectId(userId),
        },
        { riskLevel: String(risk).trim() },
        { new: true }
      );

      return updated
        ? JSON.stringify({ success: true, risk: String(risk).trim(), message: "Risk level updated" })
        : JSON.stringify({ success: false, error: "Update failed" });
    } catch (err) {
      console.error("set_risk_level error:", err);
      return JSON.stringify({ success: false, error: "Risk update failed" });
    }
  },
  {
    name: "set_risk_level",
    description:
      "REQUIRED: Save the patient's risk level (Mild, Moderate, or Critical) after assessment. Call after you use calculate_risk. Only update it changes or if you have new information. This helps keep track of patient's condition over time.",
    schema: riskSchema,
  }
);

// -------------------------
// Tool 3: Recommend OTC Medicine (with FDA API)
// -------------------------

export const recommendOTCTool = tool(
  async (args) => {
    try {
      const rawInput = String(args?.symptom || args?.input || "")
        .toLowerCase()
        .replace(/[^a-z\s]/g, "")
        .trim();

      if (!rawInput) {
        return JSON.stringify({
          error: "No symptom provided",
        });
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      //  Search symptom in indications
      const res = await fetch(
        `https://api.fda.gov/drug/label.json?search=indications_and_usage:${encodeURIComponent(
          rawInput
        )}&limit=5`,
        { signal: controller.signal }
      );

      clearTimeout(timeout);

      if (!res.ok) {
        throw new Error(`FDA API error: ${res.status}`);
      }

      const data = await res.json();

      // Extract candidate medicines
      const candidates =
        data.results
          ?.map((r) => ({
            name: r.openfda?.generic_name?.[0],
            dosage: r.dosage_and_administration?.[0],
            warnings: r.warnings?.[0],
          }))
          .filter((r) => r.name) || [];

      // Smart filtering (NO hardcoded medicines)
      const cleaned = candidates
        .map((c) => ({
          ...c,
          name: c.name.split(",")[0].trim(), // take first compound
        }))
        .filter((c) =>
          // remove suspicious long/complex drug names
          c.name.length < 40 &&
          !c.name.match(/\d|hydrochloride|tartrate/i)
        );

      // Pick BEST (first clean result)
      const best = cleaned[0];

      if (!best) {
        return JSON.stringify({
          symptom: rawInput,
          error: "No suitable medicine found from FDA",
        });
      }

      return JSON.stringify(
        {
          symptom: rawInput,
          medicine: best.name,
          dosage: best.dosage?.substring(0, 200) || "No dosage info",
          warnings: best.warnings?.substring(0, 200) || "No warnings",
          source: "FDA",
        },
        null,
        2
      );
    } catch (error) {
      return JSON.stringify({
        error: "FDA fetch failed",
        message: error.message,
      });
    }
  },
  {
    name: "recommend_fda_medicine",
    description:
      "Get ONE medicine suggestion directly from FDA data for a symptom. Use Medicine info smartly. If Medicine is not matching symptom or dangerous , please suggest normal home care. Always try to find a medicine from FDA, but if the symptom is vague or no good match is found, it's safer to recommend home care or doctor visit instead of guessing a medicine. Only return ONE recommendation and make sure it's a good match for the symptom.",
    schema: medicineSchema,
  }
);

// -------------------------
// Tool 4: Calculate Risk Level (based on symptoms)
// -------------------------
export const calculateRiskTool = tool(
  async (args) => {
    try {
      const rawSymptoms = Array.isArray(args?.symptoms)
        ? args.symptoms
        : typeof args?.input === "string"
          ? [args.input]
          : Array.isArray(args?.input)
            ? args.input
            : [];

      const response = await llm.invoke(`You are a medical triage assistant. Based ONLY on the provided symptoms, estimate risk.
Return ONLY valid JSON with this exact shape:
{"risk":"Mild"|"Moderate"|"Critical","reason":"short reason"}
Symptoms: ${JSON.stringify(rawSymptoms)}`);

      const content = String(response.content).replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(content); 
      const risk = parsed.risk || "Mild";

      return JSON.stringify({ risk, reason: parsed.reason || "No reason provided" });

    } catch (err) {
      throw new Error(`Risk calculation failed: ${err.message}`);
    }
  },
  {
    name: "calculate_risk",
    description:
      "REQUIRED: Calculate if patient's symptoms are Mild, Moderate, or Critical risk. Call when patient mentions any symptoms. Results should be saved with set_risk_level.",
    schema: calculateRiskSchema,
  }
);

// -------------------------
// Tool 5  Consultation form Data
// -------------------------
export const consultationDataTool = tool(
  async (_, config) => {
    try {
      const { consultationId, userId } = getRuntimeIds(config);
      if (!isValidObjectId(consultationId) || !isValidObjectId(userId)) {
        return JSON.stringify({ error: "Session missing" });
      }
      const consultation = await Consultation.findOne({
        consultationId: toObjectId(consultationId),
        userId: toObjectId(userId),
      }).lean();

      if (!consultation) {
        return JSON.stringify({ error: "Consultation not found" });
      }

      return JSON.stringify(consultation);

    } catch (err) {
      throw new Error(`Failed to retrieve consultation data: ${err.message}`);
    }
  },
  {
    name: "get_consultation_data",
    description:
      "REQUIRED: Retrieve consultation form data for a patient.",
    schema: emptySchema,
  }
);

// -------------------------
// Export
// -------------------------
export const tools = [
  getPatientProfileTool,
  setRiskLevelTool,
  recommendOTCTool,
  calculateRiskTool,
  consultationDataTool,
  retrieveMedicalKnowledgeTool
];