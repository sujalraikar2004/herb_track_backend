// app.js
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";

import errorHandler from "./middlewares/errorHandler.js";
import authRouter from "./routes/auth.routes.js";
import supplyChainRouter from "./routes/supplyChain.routes.js";
import paymentRouter from "./routes/payment.routes.js";
import finalProductRouter from "./routes/finalProduct.routes.js";



// Load env
dotenv.config();

const app = express();

// CORS CONFIG
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);

// BODY PARSERS
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// STATIC FILES
app.use(express.static("public"));

// COOKIE PARSER
app.use(cookieParser());

// ==================== ROUTES ====================
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/supply-chain", supplyChainRouter);
app.use("/api/v1/payments", paymentRouter);
app.use("/api/v1/final-products", finalProductRouter);

// GLOBAL ERROR HANDLER
app.use(errorHandler);

export default app;
