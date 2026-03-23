import Profile from "../../models/profileModel.js";

export async function profileAgent(state) {
  // Attach patient profile summary so downstream medical responses are more contextual.
  const profile = await Profile.findOne({ user: state.userId }).lean();

  if (!profile) {
    return { profile: "No profile found." };
  }

  const summary = [
    `age: ${profile.age ?? "unknown"}`,
    `gender: ${profile.gender ?? "unknown"}`,
    `allergies: ${(profile.allergies || []).join(", ") || "none"}`,
    `medicalHistory: ${(profile.medicalHistory || []).join(", ") || "none"}`,
    `medications: ${(profile.medications || []).join(", ") || "none"}`,
  ].join("\n");

  return { profile: summary };
}
