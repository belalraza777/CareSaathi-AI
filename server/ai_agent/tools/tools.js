import mongoose from "mongoose";
import { DynamicTool } from "@langchain/core/tools";
import { z } from "zod";

import Profile from "../../models/profileModel.js";
import Consultation from "../../models/consultationModel.js";

// FDA fetch timeout; abort so the agent does not stall.
const FDA_TIMEOUT_MS = 12_000;

// Tool handlers read userId / consultationId from RunnableConfig.configurable.
const getRuntimeIds = (config) => ({
  userId: config?.configurable?.userId,
  consultationId: config?.configurable?.consultationId,
});

// Shared Mongo helpers for tool handlers (validate strings from RunnableConfig).
const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(String(value));

const toObjectId = (value) => new mongoose.Types.ObjectId(String(value));

// Passthrough allows extra keys; Groq rejects z.object({}) when the model invents args.
const looseParams = z.object({}).passthrough();


// Tool: load logged-in user's allergies and history before suggesting meds.
const getPatientProfileTool = new DynamicTool({
  name: "get_patient_profile",
  description:
    "Call BEFORE recommending any medication. No parameters required—profile is loaded from the logged-in user. Returns age, gender, allergies, and medical history.",
  schema: looseParams,

  func: async (_, config) => {
    const { userId } = getRuntimeIds(config);

    if (!isValidObjectId(userId)) {
      return "Patient profile: No profile information available.";
    }

    const profile = await Profile.findOne({ user: toObjectId(userId) })
      .lean()
      .select({ allergies: 1, medicalHistory: 1, age: 1, gender: 1 });

    if (!profile) {
      return "Patient profile: No profile information available for this user.";
    }

    const allergies =
      profile.allergies?.length > 0 ? profile.allergies.join(", ") : "None reported";
    const history =
      profile.medicalHistory?.length > 0 ? profile.medicalHistory.join(", ") : "None reported";

    return [
      "Patient profile:",
      `- Age: ${profile.age ?? "Not specified"}`,
      `- Gender: ${profile.gender ?? "Not specified"}`,
      `- Allergies: ${allergies}`,
      `- Medical history: ${history}`,
    ].join("\n");
  },
});


// Tool: persist Mild / Moderate / Critical on the consultation document.
const setRiskLevelTool = new DynamicTool({
  name: "set_risk_level",
  description:
    "Update consultation risk when severity changes: Mild, Moderate, or Critical.",
  schema: z
    .object({
      risk_level: z.enum(["Mild", "Moderate", "Critical"]).optional(),
    })
    .passthrough(),

  func: async (args, config) => {
    const { consultationId, userId } = getRuntimeIds(config);

    // Debug logging for troubleshooting
    if (!consultationId || !userId) {
      console.warn(`[setRiskLevelTool] Missing session context - consultationId: ${consultationId}, userId: ${userId}`);
      return "Risk level update failed: no active consultation session.";
    }

    const risk = (args?.risk_level || "Mild").toString().trim();

    if (!isValidObjectId(consultationId) || !isValidObjectId(userId)) {
      return `Risk level update failed: invalid session IDs (cid:${consultationId}, uid:${userId}).`;
    }

    const updated = await Consultation.findOneAndUpdate(
      {
        consultationId: toObjectId(consultationId),
        userId: toObjectId(userId),
      },
      { riskLevel: risk },
      { new: true }
    );

    if (!updated) {
      return "Risk level update failed: consultation not found.";
    }

    return `Risk level set to ${risk}.`;
  },
});

// Tool: public FDA drug label search (generic names, warnings, dosage snippets).
const getMedicineTool = new DynamicTool({
  name: "get_medicine",
  description:
    "Look up medicine/OTC info for a condition. Required parameter: 'disease' (string, e.g. 'headache', 'cough').",
  schema: z
    .object({
      disease: z.string().min(1, "disease is required"),
    })
    .passthrough(),

  func: async (args) => {
    // Handle multiple parameter name aliases that LLMs might use
    const disease = (args?.disease || args?.input || args?.condition || "")
      .toString()
      .toLowerCase()
      .replace(/[^a-z\s]/g, "")
      .trim();

    // Strict validation: reject empty after cleanup
    if (!disease) {
      return "Medicine lookup requires a condition name (e.g., 'headache', 'cold').";
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FDA_TIMEOUT_MS);

    try {
      const res = await fetch(
        `https://api.fda.gov/drug/label.json?search=${encodeURIComponent(disease)}&limit=1`,
        { signal: controller.signal }
      );
      clearTimeout(timeout);

      if (!res.ok) {
        return `Medicine lookup temporarily unavailable (${res.status}). Recommend consulting a pharmacist for OTC options.`;
      }

      const data = await res.json();
      const result = data.results?.[0] || {};
      const medicines = result.openfda?.generic_name || [];
      const medicineText = medicines.length > 0 ? medicines.join(", ") : "None found in FDA label sample";

      return [
        `Condition search: ${disease}`,
        `- Generic names (sample): ${medicineText}`,
        `- Indications: ${result.indications_and_usage?.[0] || "Not specified"}`,
        `- Dosage: ${result.dosage_and_administration?.[0] || "See package insert"}`,
        `- Warnings: ${result.warnings?.[0] || "See label"}`,
        `- Adverse reactions: ${result.adverse_reactions?.[0] || "See label"}`,
      ].join("\n");
    } catch (err) {
      clearTimeout(timeout);
      const msg = err.name === "AbortError" ? "Request timed out" : err.message;
      console.error(`Medicine fetch failed for "${disease}":`, msg);
      return `Medicine lookup failed (${msg}). Suggest general OTC caution and pharmacist consult.`;
    }
  },
});

// Order matches how the agent should think: profile → risk → medicine (prompt enforces this).
export const tools = [getPatientProfileTool, setRiskLevelTool, getMedicineTool];
