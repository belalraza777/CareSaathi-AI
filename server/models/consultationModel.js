import mongoose from "mongoose";

const consultationSchema = new mongoose.Schema(
  {
    consultationId: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId(),
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    mainSymptom: {
      type: [String],
      default: [],
    },
    symptomDuration: {
      type: String,
      trim: true,
      default: "",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: null,
    },
    age: {
      type: Number,
      min: 0,
      max: 120,
      default: null,
    },
    height: {
      type: Number,
      min: 30,
      max: 300,
      default: null,
    },
    weight: {
      type: Number,
      min: 1,
      max: 500,
      default: null,
    },
    symptom: {
      type: [String],
      default: [],
    },
    severity: {
      type: String,
      trim: true,
      default: "",
    },
    riskLevel: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

// Stores doctor consultation session metadata.
export default mongoose.model("Consultation", consultationSchema);
