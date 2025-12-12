import dotenv from "dotenv";
import connectdb from "./db/db.js";
import app from "./app.js";

// Load env
dotenv.config();

const start = async () => {
    try {
        await connectdb();
        const server = app.listen(process.env.PORT || 3000, () => {
            console.log(`server is running on port ${process.env.PORT}`);
        });
        
        server.on("error", (err) => {
            console.error("Server error:", err);
            process.exit(1);
        });
        
    } catch (error) {
        console.error("Startup error:", error);
        process.exit(1);
    }
};

// Handle unhandled rejections
process.on("unhandledRejection", (err) => {
    console.error("Unhandled rejection:", err);
    process.exit(1);
});

process.on("uncaughtException", (err) => {
    console.error("Uncaught exception:", err);
    process.exit(1);
});

start();
