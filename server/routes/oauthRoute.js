import express from "express";
import passport from "../config/passport.js";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Start Google OAuth ( /google  is the endpoint that the frontend will hit to start the OAuth flow and redirect to Google's consent screen with the requested scopes profile and email to access the user's basic profile information and email address)
router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

// Callback (/callback is the endpoint that Google will redirect to after the user consents or denies access. Passport will handle the authentication logic in this route, and if successful, it will generate a JWT token for the authenticated user and set it in an HTTP-only cookie before redirecting to the frontend.)
router.get(
    "/google/callback",
    passport.authenticate("google", { session: false }),
    async (req, res) => {
        const user = await User.findOne({ email: req?.user?.email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not exist!", error: "Authentication Failed" });
        }
        // Generating JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "5d" });
        // Setting token in cookie (5 days to match JWT expiry)
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 5 * 24 * 60 * 60 * 1000, // 5 days in ms
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            path: '/',
        });

        // redirect to frontend
        res.redirect(process.env.GOOGLE_FRONTEND_REDIRECT_URL || "http://localhost:5173/oauth-success");
    }
);


export default router;