const cors = require("cors");
const express = require("express");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const learningRoutes = require("./routes/learning.routes");

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => res.json({ status: "ok", service: "graspify-express" }));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/learning", learningRoutes);

app.use((req, res) => res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} was not found.` }));
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(error.status || 500).json({ message: error.message || "An unexpected server error occurred." });
});

module.exports = app;
