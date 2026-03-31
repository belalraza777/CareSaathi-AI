import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 2,
        max: 20,
        trim: true,
        tolowercase: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    passwordHash: {
        type: String,
        select: false,
        trim: true,
    },
    provider: { type: String, default: "local" }, // local | google | facebook
    providerId: { type: String },                 // OAuth provider user id
}, {
    timestamps: true
});

export default mongoose.model('User', userSchema);