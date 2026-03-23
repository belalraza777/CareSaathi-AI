import Profile from "../models/profileModel.js";

// Gets the profile of the authenticated user. If no profile exists, returns a 404 error.
const getProfile = async (req, res, next) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
            error: "Unauthorized",
        });
    }
    const profile = await Profile.findOne({ user: req.user.id }).populate("user", "name email");

    if (!profile) {
        return res.status(404).json({
            success: false,
            message: "Profile not found",
            error: "Not Found",
        });
    }

    return res.status(200).json({
        success: true,
        message: "Profile fetched successfully",
        data: profile,
    });
};

// Create Profile 
const createProfile = async (req, res, next) => {

    if (Object.keys(req.body).length === 0) {
        return res.status(400).json({
            success: false,
            message: "Profile data is required",
            error: "Bad Request",
        });
    }

    const existingProfile = await Profile.findOne({ user: req.user.id });

    if (existingProfile) {
        return res.status(409).json({
            success: false,
            message: "Profile already exists",
            error: "Conflict",
        });
    }

    const profile = await Profile.create({
        user: req.user.id,
        ...req.body,
    });

    const populatedProfile = await Profile.findById(profile._id).populate("user", "name email");

    return res.status(201).json({
        success: true,
        message: "Profile created successfully",
        data: populatedProfile,
    });
};

// Only allows updating the authenticated user's profile. Validates that at least one field is provided for update.
const updateProfile = async (req, res, next) => {

    if (Object.keys(req.body).length === 0) {
        return res.status(400).json({
            success: false,
            message: "Profile data is required for update",
            error: "Bad Request",
        });
    }

    const profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        req.body,
        { new: true, runValidators: true }
    ).populate("user", "name email");

    if (!profile) {
        return res.status(404).json({
            success: false,
            message: "Profile not found",
            error: "Not Found",
        });
    }

    return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: profile,
    });
};

export default {
    getProfile,
    createProfile,
    updateProfile,
};