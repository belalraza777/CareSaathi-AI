import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/userModel.js";
import dotenv from "dotenv";
dotenv.config();


// Google OAuth Strategy 
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/api/v1/auth/google/callback",
        },
        // Verify callback function (called after successful authentication)
        async (_, __, profile, done) => {
            try {
                // Extract the email from the profile
                const email = profile?.emails?.[0]?.value;
                
                if (!email) {
                    return done(new Error("No email found in Google profile"), null);
                }

                // Check if a user with this email already exists
                let user = await User.findOne({ email });

                if (!user) {
                    // Generate unique username
                    let name = profile?.displayName.replace(/\s+/g, "").toLowerCase();                    
                    // Create a new user if not found
                    user = await User.create({
                        name,
                        email,
                        provider: "google",
                        providerId: profile.id,
                    });
                }

                done(null, user);
            } catch (err) {
                done(err, null);
            }
        }
    )
);


export default passport;