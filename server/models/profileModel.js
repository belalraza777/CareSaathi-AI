import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    age: {
        type: Number,
        min: [0, "Age cannot be negative"],
        max: [120, "Age cannot be greater than 120"],
    },
    gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
    },
    medicalHistory: [
        { type: String }
    ],
    allergies: [{ type: String }],
    medications: [{ type: String }],
},
    { timestamps: true }
);

export default mongoose.model("Profile", profileSchema);