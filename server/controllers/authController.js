import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
// Email integration is optional and currently disabled in this controller.


// Controller for user login
const loginUser = async (req, res, next) => {
    // Destructuring email and password from request body
    const { email, password } = req.body;
    // Finding user by email
    const user = await User.findOne({ email }).select("+passwordHash");
    // If user does not exist, return error
    if (!user) {
        return res.status(400).json({ success: false, message: "User not exist!", error: "Authentication Failed" });
    }
    // OAuth users do not have a local password hash.
    if (!user.passwordHash) {
        return res.status(400).json({
            success: false,
            message: "This account uses social login. Please continue with Google.",
            error: "Authentication Failed"
        });
    }
    // Comparing password with hashed password
    const matchPassword = await bcrypt.compare(password, user.passwordHash);
    // If password does not match, return error
    if (!matchPassword) {
        return res.status(400).json({ success: false, message: "Invalid credentials!", error: "Authentication Failed" });
    }
    // Remove sensitive field before responding
    user.passwordHash = undefined;

    // Generating JWT token
    const token = jwt.sign({ id: user._id}, process.env.JWT_SECRET, { expiresIn: "5d" });
    // Setting token in cookie (5 days to match JWT expiry)
    res.cookie("token", token, {
        httpOnly: true,
        maxAge: 5 * 24 * 60 * 60 * 1000, // 5 days in ms
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
    });

    // Returning success response with user data
    return res.status(200).json({ success: true, message: "Welcome Back!", data: user });
};


// Controller for user registration
const register = async (req, res, next) => {
    // Destructuring user data from request body
    const { name, email, password } = req.body;

    // Check if username or email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ success: false, message: "Email is already in use.", error: "Authentication Failed" });
    }

    // Hashing the password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    // Creating a new user
    const newUser = new User({ name, email, passwordHash: hash });
    // Saving the new user to the database
    const user = await newUser.save();
    //remove passwordHash from response
    user.passwordHash = undefined;
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
    // Send registration email
    // await sendEmail(
    //     user.email,
    //     "Welcome to E-Store!",
    //     `Hi ${user.name},\n\nYour account has been created successfully.\n\nThank you for joining E-Store!\n\n- E-Store Team`
    // );
    // Returning success response with user data
    return res.status(201).json({ success: true, message: "Account Created Successfully!", data: user });
};


// Controller for user logout
const logoutUser = (req, res, next) => {
    // Clearing the token cookie (match options used when setting cookie)
    res.clearCookie("token", { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', path: '/' });
    // Returning success response
    return res.json({ success: true, message: "Logout Successfully!" });
};


// Controller to check user login status and role
const checkUser = async (req, res, next) => {
    // Getting token from cookies or Authorization header
    let token = req.cookies?.token;

    if (!token && req.headers.authorization) {
        const authHeader = req.headers.authorization;
        if (authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7).trim();
        }
    }

    // If no token, return unauthorized status
    if (!token || token === "cookie-auth") {
        return res.status(401).json({ authenticated: false, message: "No token provided", success: false });
    }

    let decoded;
    try {
        // Verify token and convert malformed/expired cases into auth errors.
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return res.status(401).json({ authenticated: false, message: "Invalid token", success: false });
    }

    if (!decoded) {
        return res.status(401).json({ authenticated: false, message: "Invalid token", success: false });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
        return res.status(401).json({ authenticated: false, message: "User not found", success: false });
    }

    res.status(200).json({
        authenticated: true,
        message: "Authenticated",
        data: user
    });
};


// Controller to reset user password
const resetPassword = async (req, res, next) => {
    // Destructuring old and new password from request body
    const { oldPassword, newPassword } = req.body;
    // Getting user ID from request
    const userId = req.user.id;
    // Finding user by ID
    const user = await User.findById(userId).select("+passwordHash");
    // If user not found, return error
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }
    // Comparing old password with hashed password
    const matchPassword = await bcrypt.compare(oldPassword, user.passwordHash);
    // If password does not match, return error
    if (!matchPassword) {
        return res.status(401).json({ success: false, message: "Wrong Password", error: "Wrong Password" });
    }
    // Hashing the new password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);
    // Updating user's password hash
    user.passwordHash = hash;
    // Saving the updated user data
    await user.save();
    // Send password reset email
    // await sendEmail(
    //     user.email,
    //     "Password Changed - E-Store",
    //     `Hi ${user.name},\n\nYour password has been changed successfully. If you did not perform this action, please contact support immediately.\n\n- E-Store Team`
    // );
    // Returning success response
    return res.status(201).json({ success: true, message: "Password Changed Successfully", data: "password changed" });
}



// Exporting all the controller functions
export default {
    loginUser,
    register,
    logoutUser,
    checkUser,
    resetPassword,
};