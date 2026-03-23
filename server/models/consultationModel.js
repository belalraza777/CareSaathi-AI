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
