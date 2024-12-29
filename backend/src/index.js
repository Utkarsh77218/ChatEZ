import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoute from "./routes/auth.route.js";
import messageRoute from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";

dotenv.config();

const app = express();

connectDB();

const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true,
    })
);

app.use("/api/auth", authRoute);
app.use("/api/message", messageRoute);

app.listen(PORT, () => {
    console.log(`Server listening on PORT: ${PORT}`);
});
