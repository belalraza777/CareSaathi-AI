import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
    // Try to get token from cookie first, then Authorization header
    let token = req?.cookies?.token;

    if (!token && req?.headers?.authorization) {
        const authHeader = req.headers.authorization;
        if (authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "You must be logged in!",
            error: "Unauthorized"
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: "Invalid or expired token",
                error: "Forbidden"
            });
        }
        req.user = user;
        next();
    });
};

export default verifyToken;