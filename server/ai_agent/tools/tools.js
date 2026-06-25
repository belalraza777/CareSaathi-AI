import mongoose from "mongoose";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import Profile from "../../models/profileModel.js";
import Consultation from "../../models/consultationModel.js";
import { retrieveMedicalKnowledgeTool } from "./ragTool.js";
import { buildIntakeContextMessage } from "../agent/agentHelpers.js";

// -------------------------
// Helpers
// -------------------------
const getRuntimeIds = (config) => ({
  userId: config?.configurable?.userId || config?.userId || null,
  consultationId:
    config?.configurable?.consultationId ||
    config?.consultationId ||
    null,
});

const isValidObjectId = (value) =>
  mongoose.Types.ObjectId.isValid(String(value));

const toObjectId = (value) =>
  new mongoose.Types.ObjectId(String(value));

const getLlm = async () => {
  const mod = await import("../agent/agent.js");
  return mod.llm;
};

// fetch fallback (Node safe)
const fetchFn = global.fetch || (await import("node-fetch")).default;

// -------------------------
// Schemas
// -------------------------
const emptySchema = z.object({}).passthrough();

const riskSchema = z.object({
  risk_level: z.enum(["Mild", "Moderate", "Critical"]),
});

const medicineSchema = z.object({
  symptom: z.string().optional(),
  input: z.string().nullable().optional(),
});

const calculateRiskSchema = z.object({
  symptoms: z.array(z.string()).optional(),
  input: z.union([z.string(), z.array(z.string()), z.null()]).optional(),
});



// -------------------------
// Tool 1: Patient Context Tool [profile + consultation data] 
// -------------------------
export const getPatientContextTool = tool(
  async (_, config) => {

    try {
      const { userId, consultationId } = getRuntimeIds(config);
      const context = await buildIntakeContextMessage({
        userId,
        consultationId,
      });

      if (!context) {
        return {
          success: false,
          message: "No patient context found",
        };
      }
      return {
        success: true,
        patientContext: context,
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
  {
    name: "get_patient_context",
    description:
      "Get patient consultation context including symptoms, duration, notes, age, gender, height, weight, allergies, medical history and medications. Use this only when patient details are required.",
    schema: emptySchema,
  }
);

// -------------------------
// Tool 2: Set Risk Level
// -------------------------
export const setRiskLevelTool = tool(
  async (args, config) => {
    const { consultationId, userId } = getRuntimeIds(config);

    const riskRaw = String(args?.risk_level || "").trim().toLowerCase();

    const normalizedRisk =
      riskRaw === "mild"
        ? "Mild"
        : riskRaw === "moderate"
          ? "Moderate"
          : riskRaw === "critical"
            ? "Critical"
            : null;

    if (!normalizedRisk) return { success: false };

    if (!isValidObjectId(consultationId) || !isValidObjectId(userId)) {
      return { success: false };
    }

    const updated = await Consultation.findOneAndUpdate(
      {
        consultationId: toObjectId(consultationId),
        userId: toObjectId(userId),
      },
      { riskLevel: normalizedRisk },
      { returnDocument: "after" }
    );

    return updated ? { success: true, risk: normalizedRisk } : { success: false };
  },
  {
    name: "set_risk_level",
    description: "Set patient risk level",
    schema: riskSchema,
  }
);

// -------------------------
// Tool 3: OTC Medicine (SAFE)
// -------------------------
export const recommendOTCTool = tool(
  async (args) => {
    const rawInput = String(args?.symptom || args?.input || "")
      .toLowerCase()
      .replace(/[^a-z\s]/g, "")
      .trim();

    if (!rawInput) return { error: "No symptom" };

    let timeout;
    try {
      const controller = new AbortController();
      timeout = setTimeout(() => controller.abort(), 5000);

      const res = await fetchFn(
        `https://api.fda.gov/drug/label.json?search=indications_and_usage:${encodeURIComponent(
          rawInput
        )}&limit=5`,
        { signal: controller.signal }
      );

      clearTimeout(timeout);

      if (!res.ok) return { error: "FDA error" };

      const data = await res.json();

      const candidates =
        data.results
          ?.map((r) => ({
            name: Array.isArray(r.openfda?.generic_name)
              ? r.openfda.generic_name[0]
              : undefined,
            dosage: Array.isArray(r.dosage_and_administration)
              ? r.dosage_and_administration[0]
              : undefined,
            warnings: Array.isArray(r.warnings)
              ? r.warnings[0]
              : undefined,
          }))
          .filter((r) => r.name) || [];

      const safe = candidates
        .map((c) => ({
          ...c,
          name: c.name.split(",")[0].trim(),
        }))
        .filter(
          (c) =>
            c.name.length < 40 &&
            !c.name.match(
              /antibiotic|steroid|opioid|benzodiazepine|hydrochloride|tartrate/i
            )
        );

      const best = safe[0];
      if (!best) return { error: "No safe medicine found" };

      return {
        symptom: rawInput,
        medicine: best.name,
        dosage: best.dosage?.slice(0, 200) || "",
        warnings: best.warnings?.slice(0, 200) || "",
      };
    } catch {
      if (timeout) clearTimeout(timeout);
      return { error: "Fetch failed" };
    }
  },
  {
    name: "recommend_fda_medicine",
    description: "Get safe OTC medicine suggestion",
    schema: medicineSchema,
  }
);

// -------------------------
// Tool 4: Calculate Risk
// -------------------------
export const calculateRiskTool = tool(
  async (args) => {
    const rawSymptoms = Array.isArray(args?.symptoms)
      ? args.symptoms
      : typeof args?.input === "string"
        ? [args.input]
        : Array.isArray(args?.input)
          ? args.input
          : [];

    try {
      const model = await getLlm();
      const response = await model.invoke(
        `Return ONLY JSON:
{"risk":"Mild"|"Moderate"|"Critical","reason":"short"}

Symptoms: ${JSON.stringify(rawSymptoms)}`
      );

      const content =
        typeof response === "string"
          ? response
          : response?.content || "";

      let parsed;
      try {
        parsed = JSON.parse(
          String(content).replace(/```json|```/g, "").trim()
        );
      } catch {
        parsed = { risk: "Mild", reason: "" };
      }

      return {
        risk: parsed.risk || "Mild",
        reason: parsed.reason || "",
      };
    } catch {
      return { risk: "Mild", reason: "" };
    }
  },
  {
    name: "calculate_risk",
    description: "Calculate patient risk",
    schema: calculateRiskSchema,
  }
);

// // -------------------------
// // Tool 5: Consultation Data
// // -------------------------
// export const consultationDataTool = tool(
//   async (_, config) => {
//     const { consultationId, userId } = getRuntimeIds(config);

//     if (!isValidObjectId(consultationId) || !isValidObjectId(userId)) {
//       return {};
//     }

//     const consultation = await Consultation.findOne({
//       consultationId: toObjectId(consultationId),
//       userId: toObjectId(userId),
//     }).lean();

//     return consultation || {};
//   },
//   {
//     name: "get_consultation_data",
//     description: "Get consultation data",
//     schema: emptySchema,
//   }
// );

// -------------------------
// Export
// -------------------------
export const tools = [
  // getPatientProfileTool,
  setRiskLevelTool,
  recommendOTCTool,
  calculateRiskTool,
  // consultationDataTool,
  retrieveMedicalKnowledgeTool,
  getPatientContextTool

];