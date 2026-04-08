import mongoose from "mongoose";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import Profile from "../../models/profileModel.js";
import Consultation from "../../models/consultationModel.js";
import { llm } from "../agent/agent.js";
import { retrieveMedicalKnowledgeTool } from "./ragTool.js";

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
// Tool 1: Patient Profile
// -------------------------
export const getPatientProfileTool = tool(
  async (_, config) => {
    const { userId, consultationId } = getRuntimeIds(config);

    if (!isValidObjectId(userId)) {
      return {
        age: null,
        height: null,
        weight: null,
        gender: null,
        allergies: [],
        medicalHistory: [],
      };
    }

    const [profile, consultation] = await Promise.all([
      Profile.findOne({ user: toObjectId(userId) })
        .lean()
        .select({
          allergies: 1,
          medicalHistory: 1,
          age: 1,
          height: 1,
          weight: 1,
          gender: 1,
        }),
      isValidObjectId(consultationId)
        ? Consultation.findOne({
            consultationId: toObjectId(consultationId),
            userId: toObjectId(userId),
          }).lean()
        : null,
    ]);

    return {
      age: consultation?.age ?? profile?.age ?? null,
      height: consultation?.height ?? profile?.height ?? null,
      weight: consultation?.weight ?? profile?.weight ?? null,
      gender: consultation?.gender || profile?.gender || null,
      allergies: profile?.allergies || [],
      medicalHistory: profile?.medicalHistory || [],
    };
  },
  {
    name: "get_patient_profile",
    description: "Get patient profile data",
    schema: emptySchema,
  }
);

// -------------------------
// Tool 2: Set Risk Level
// -------------------------
export const setRiskLevelTool = tool(
  async (args, config) => {
    const { consultationId, userId } = getRuntimeIds(config);
    const risk = String(args?.risk_level || "").trim();

    if (!["Mild", "Moderate", "Critical"].includes(risk)) {
      return { success: false };
    }

    if (!isValidObjectId(consultationId) || !isValidObjectId(userId)) {
      return { success: false };
    }

    const updated = await Consultation.findOneAndUpdate(
      {
        consultationId: toObjectId(consultationId),
        userId: toObjectId(userId),
      },
      { riskLevel: risk },
      { returnDocument: "after" }
    );

    return updated ? { success: true, risk } : { success: false };
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

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(
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
            name: r.openfda?.generic_name?.[0],
            dosage: r.dosage_and_administration?.[0],
            warnings: r.warnings?.[0],
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
      const response = await llm.invoke(
        `Return ONLY JSON:
{"risk":"Mild"|"Moderate"|"Critical","reason":"short"}

Symptoms: ${JSON.stringify(rawSymptoms)}`
      );

      let parsed;
      try {
        parsed = JSON.parse(
          String(response.content).replace(/```json|```/g, "").trim()
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

// -------------------------
// Tool 5: Consultation Data
// -------------------------
export const consultationDataTool = tool(
  async (_, config) => {
    const { consultationId, userId } = getRuntimeIds(config);

    if (!isValidObjectId(consultationId) || !isValidObjectId(userId)) {
      return {};
    }

    const consultation = await Consultation.findOne({
      consultationId: toObjectId(consultationId),
      userId: toObjectId(userId),
    }).lean();

    return consultation || {};
  },
  {
    name: "get_consultation_data",
    description: "Get consultation data",
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
  retrieveMedicalKnowledgeTool,
];