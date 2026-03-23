import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/aidoctor");
    console.log(" MongoDB connected successfully");
    return mongoose.connection;
  } catch (error) {
    console.error(" MongoDB connection error:", error.message);
    process.exit(1);
  }
};

mongoose.connection.on("error", (err) => {
  console.error("❌ Mongoose connection error:", err.message);
});

export default connectDB;